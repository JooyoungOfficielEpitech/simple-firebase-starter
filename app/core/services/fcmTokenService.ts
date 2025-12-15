import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import firestore from '@react-native-firebase/firestore'
import { logger } from '@/core/utils/logger'
import {
  withRetry,
  getUserFriendlyMessage,
  isTokenExpiredError,
  logFirebaseError,
} from '@/core/services/error/firebaseErrorHandler'

export interface DeviceInfo {
  platform: 'ios' | 'android'
  deviceId: string
  appVersion?: string
  osVersion?: string
  model?: string
}

export interface FCMTokenData {
  userId: string
  fcmToken: string
  deviceInfo: DeviceInfo
  createdAt: Date
  lastUsed: Date
  isActive: boolean
}

class FCMTokenService {
  private readonly COLLECTION = 'userFCMTokens'
  private readonly DEVICE_ID_KEY = '@device_id'
  private cachedDeviceId: string | null = null

  /**
   * 고유하고 일관된 기기 ID 생성 또는 조회
   */
  private async getOrCreateDeviceId(): Promise<string> {
    try {
      // 메모리 캐시 확인
      if (this.cachedDeviceId) {
        return this.cachedDeviceId
      }

      // AsyncStorage에서 기존 deviceId 조회
      const storedDeviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY)

      if (storedDeviceId) {
        this.cachedDeviceId = storedDeviceId
        logger.info('FCMTokenService', '✅ 기존 deviceId 조회', { deviceId: storedDeviceId })
        return storedDeviceId
      }

      // 새로운 deviceId 생성 (한 번만)
      const newDeviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      await AsyncStorage.setItem(this.DEVICE_ID_KEY, newDeviceId)
      this.cachedDeviceId = newDeviceId

      logger.info('FCMTokenService', '🆕 새 deviceId 생성', { deviceId: newDeviceId })
      return newDeviceId
    } catch (error) {
      logger.error('FCMTokenService', '❌ deviceId 생성 실패', error)
      // 폴백: 플랫폼 기반 고정 ID
      return `${Platform.OS}_fallback`
    }
  }

  /**
   * 기기 정보 수집
   */
  private async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      const deviceId = await this.getOrCreateDeviceId()

      const deviceInfo: DeviceInfo = {
        platform: Platform.OS as 'ios' | 'android',
        deviceId,
        osVersion: Platform.Version.toString(),
      }

      return deviceInfo
    } catch (error) {
      logger.error('FCMTokenService', '기기 정보 수집 실패', error)
      // 기본값 반환
      return {
        platform: Platform.OS as 'ios' | 'android',
        deviceId: `${Platform.OS}_fallback`,
      }
    }
  }

  /**
   * FCM 토큰을 Firestore에 등록/업데이트 - 강력한 중복 방지
   */
  async registerToken(userId: string, fcmToken: string): Promise<boolean> {
    try {
      return await withRetry(
        async () => {
          logger.info('FCMTokenService', '🔄 FCM 토큰 등록 시작 (중복 완전 차단)', {
            userId,
            tokenPrefix: fcmToken.substring(0, 10),
          })

          const deviceInfo = await this.getDeviceInfo()
          const now = new Date()

          // 문서 ID를 userId_deviceId 형태로 생성하여 기기별 고유 문서 생성
          const docId = `${userId}_${deviceInfo.deviceId}`

          // 1단계: 같은 userId의 모든 활성 토큰 조회 (현재 기기 포함)
          const allActiveTokensQuery = await firestore()
            .collection(this.COLLECTION)
            .where('userId', '==', userId)
            .where('isActive', '==', true)
            .get()

          const batch = firestore().batch()
          let deactivatedCount = 0

          // 2단계: 현재 등록하려는 토큰과 다른 모든 활성 토큰 비활성화
          allActiveTokensQuery.docs.forEach((doc) => {
            const data = doc.data() as FCMTokenData

            // 현재 토큰이 아니거나, 같은 토큰이지만 다른 문서 ID인 경우 비활성화
            if (doc.id !== docId || data.fcmToken !== fcmToken) {
              batch.update(doc.ref, {
                isActive: false,
                lastUsed: now,
              })
              deactivatedCount++
              logger.info('FCMTokenService', `🧹 비활성화 대상: ${doc.id} (토큰: ${data.fcmToken.substring(0, 10)}...)`)
            }
          })

          // 3단계: 현재 기기의 토큰을 유일한 활성 토큰으로 등록
          const tokenData: FCMTokenData = {
            userId,
            fcmToken,
            deviceInfo,
            createdAt: now,
            lastUsed: now,
            isActive: true,
          }

          const docRef = firestore().collection(this.COLLECTION).doc(docId)
          batch.set(docRef, tokenData, { merge: true })

          // 4단계: 모든 변경사항을 한 번에 적용 (원자성 보장)
          await batch.commit()

          if (deactivatedCount > 0) {
            logger.info('FCMTokenService', `✅ ${deactivatedCount}개 토큰 비활성화 + 1개 활성화 완료`)
          } else {
            logger.info('FCMTokenService', '✅ FCM 토큰 등록 성공 (신규 또는 갱신)', { docId })
          }

          return true
        },
        'FCM 토큰 등록'
      )
    } catch (error) {
      logFirebaseError('FCM 토큰 등록 실패', error, { userId })
      return false
    }
  }

  /**
   * 토큰 갱신 (새 토큰으로 업데이트) - 자동 재시도 및 만료 감지 포함
   */
  async updateToken(userId: string, oldToken: string, newToken: string): Promise<boolean> {
    try {
      return await withRetry(
        async () => {
          logger.info('FCMTokenService', '🔄 FCM 토큰 갱신 시작', {
            userId,
            oldTokenPrefix: oldToken.substring(0, 10),
            newTokenPrefix: newToken.substring(0, 10),
          })

          // 기존 토큰을 가진 문서를 찾아서 새 토큰으로 업데이트
          const querySnapshot = await firestore()
            .collection(this.COLLECTION)
            .where('userId', '==', userId)
            .where('fcmToken', '==', oldToken)
            .limit(1)
            .get()

          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0]
            await doc.ref.update({
              fcmToken: newToken,
              lastUsed: new Date(),
            })
            logger.info('FCMTokenService', '✅ 기존 토큰 업데이트 성공')
          } else {
            // 기존 토큰을 찾지 못한 경우 새로 등록
            logger.info('FCMTokenService', '🆕 기존 토큰을 찾지 못해 새로 등록')
            await this.registerToken(userId, newToken)
          }

          return true
        },
        'FCM 토큰 갱신'
      )
    } catch (error) {
      // 토큰 만료 감지
      if (isTokenExpiredError(error)) {
        logger.warn('FCMTokenService', '⚠️ 토큰 만료 감지 - 자동 재등록 시도')
        return await this.registerToken(userId, newToken)
      }

      logFirebaseError('FCM 토큰 갱신 실패', error, { userId })
      return false
    }
  }

  /**
   * 사용자의 모든 활성 FCM 토큰 조회 - 자동 재시도 포함
   */
  async getUserTokens(userId: string): Promise<string[]> {
    try {
      return await withRetry(
        async () => {
          const querySnapshot = await firestore()
            .collection(this.COLLECTION)
            .where('userId', '==', userId)
            .where('isActive', '==', true)
            .get()

          const tokens = querySnapshot.docs.map(doc => {
            const data = doc.data() as FCMTokenData
            return data.fcmToken
          })

          logger.info('FCMTokenService', '📱 사용자 토큰 조회', { userId, tokenCount: tokens.length })
          return tokens
        },
        '사용자 FCM 토큰 조회'
      )
    } catch (error) {
      logFirebaseError('사용자 FCM 토큰 조회 실패', error, { userId })
      return []
    }
  }

  /**
   * 특정 토큰을 비활성화 (로그아웃이나 앱 삭제 시) - 자동 재시도 포함
   */
  async deactivateToken(userId: string, fcmToken: string): Promise<boolean> {
    try {
      return await withRetry(
        async () => {
          logger.info('FCMTokenService', '🔄 FCM 토큰 비활성화 시작', {
            userId,
            tokenPrefix: fcmToken.substring(0, 10),
          })

          const querySnapshot = await firestore()
            .collection(this.COLLECTION)
            .where('userId', '==', userId)
            .where('fcmToken', '==', fcmToken)
            .limit(1)
            .get()

          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0]
            await doc.ref.update({
              isActive: false,
              lastUsed: new Date(),
            })
            logger.info('FCMTokenService', '✅ FCM 토큰 비활성화 성공')
            return true
          } else {
            logger.warn('FCMTokenService', '⚠️ 비활성화할 토큰을 찾지 못함')
            return false
          }
        },
        'FCM 토큰 비활성화'
      )
    } catch (error) {
      logFirebaseError('FCM 토큰 비활성화 실패', error, { userId })
      return false
    }
  }

  /**
   * 사용자의 모든 토큰 비활성화 (로그아웃 시)
   */
  async deactivateAllUserTokens(userId: string): Promise<boolean> {
    try {
      logger.info('FCMTokenService', '🔄 사용자 모든 토큰 비활성화 시작', { userId })

      const querySnapshot = await firestore()
        .collection(this.COLLECTION)
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get()

      const batch = firestore().batch()
      querySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          isActive: false,
          lastUsed: new Date(),
        })
      })

      await batch.commit()
      logger.info('FCMTokenService', '✅ 사용자 모든 토큰 비활성화 성공', {
        userId,
        deactivatedCount: querySnapshot.docs.length
      })
      return true
    } catch (error) {
      logger.error('FCMTokenService', '❌ 사용자 모든 토큰 비활성화 실패', error)
      return false
    }
  }

  /**
   * 오래된 토큰 정리 (30일 이상 사용하지 않은 토큰)
   */
  async cleanupOldTokens(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const querySnapshot = await firestore()
        .collection(this.COLLECTION)
        .where('lastUsed', '<', thirtyDaysAgo)
        .get()

      const batch = firestore().batch()
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      const deletedCount = querySnapshot.docs.length

      logger.info('FCMTokenService', '🧹 오래된 토큰 정리 완료', { deletedCount })
      return deletedCount
    } catch (error) {
      logger.error('FCMTokenService', '❌ 오래된 토큰 정리 실패', error)
      return 0
    }
  }

  /**
   * 토큰 마지막 사용 시간 업데이트
   */
  async updateTokenLastUsed(userId: string, fcmToken: string): Promise<boolean> {
    try {
      const querySnapshot = await firestore()
        .collection(this.COLLECTION)
        .where('userId', '==', userId)
        .where('fcmToken', '==', fcmToken)
        .limit(1)
        .get()

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        await doc.ref.update({
          lastUsed: new Date(),
        })
        return true
      }
      return false
    } catch (error) {
      logger.error('FCMTokenService', '❌ 토큰 마지막 사용 시간 업데이트 실패', error)
      return false
    }
  }

  /**
   * 중복 FCM 토큰 정리 (같은 토큰 값을 가진 여러 문서 중 하나만 남기고 비활성화)
   *
   * @param userId - 특정 사용자만 정리하려면 userId 제공, 전체 정리는 undefined
   * @returns 비활성화된 중복 토큰 개수
   */
  async cleanupDuplicateTokens(userId?: string): Promise<number> {
    try {
      logger.info('FCMTokenService', '🧹 중복 FCM 토큰 정리 시작', { userId: userId || '전체' })

      // 사용자별 또는 전체 활성 토큰 조회
      let query = firestore()
        .collection(this.COLLECTION)
        .where('isActive', '==', true)

      if (userId) {
        query = query.where('userId', '==', userId)
      }

      const snapshot = await query.get()

      if (snapshot.empty) {
        logger.info('FCMTokenService', '🧹 정리할 토큰이 없습니다')
        return 0
      }

      // fcmToken 값으로 그룹화
      const tokenGroups = new Map<string, any[]>()

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        const token = data.fcmToken

        if (!tokenGroups.has(token)) {
          tokenGroups.set(token, [])
        }

        tokenGroups.get(token)!.push({
          id: doc.id,
          ref: doc.ref,
          data,
        })
      })

      // 중복된 토큰만 필터링 (2개 이상)
      const duplicateGroups = Array.from(tokenGroups.entries()).filter(
        ([_, docs]) => docs.length > 1
      )

      if (duplicateGroups.length === 0) {
        logger.info('FCMTokenService', '🧹 중복 토큰이 없습니다')
        return 0
      }

      logger.info('FCMTokenService', `🧹 ${duplicateGroups.length}개 그룹에서 중복 발견`)

      const batch = firestore().batch()
      let deactivatedCount = 0

      // 각 그룹에서 가장 최근 것만 남기고 나머지 비활성화
      duplicateGroups.forEach(([token, docs]) => {
        // lastUsed 기준으로 정렬 (최신 순)
        docs.sort((a, b) => {
          const aTime = a.data.lastUsed?.toDate?.() || new Date(0)
          const bTime = b.data.lastUsed?.toDate?.() || new Date(0)
          return bTime.getTime() - aTime.getTime()
        })

        // 첫 번째(가장 최근)를 제외하고 나머지 비활성화
        docs.slice(1).forEach((doc) => {
          batch.update(doc.ref, {
            isActive: false,
            lastUsed: new Date(),
          })
          deactivatedCount++
        })

        logger.info('FCMTokenService', `🧹 토큰 ${token.substring(0, 10)}... : ${docs.length}개 중 ${docs.length - 1}개 비활성화`)
      })

      await batch.commit()

      logger.info('FCMTokenService', `✅ 중복 토큰 정리 완료: ${deactivatedCount}개 비활성화`)
      return deactivatedCount
    } catch (error) {
      logger.error('FCMTokenService', '❌ 중복 토큰 정리 실패', error)
      return 0
    }
  }

  /**
   * 사용자별 중복 토큰 일괄 정리 (로그인 시 호출 추천)
   */
  async cleanupUserDuplicateTokens(userId: string): Promise<number> {
    return this.cleanupDuplicateTokens(userId)
  }

  /**
   * 전체 사용자 중복 토큰 정리 (관리자용)
   */
  async cleanupAllDuplicateTokens(): Promise<number> {
    return this.cleanupDuplicateTokens()
  }
}

export const fcmTokenService = new FCMTokenService()
export default fcmTokenService