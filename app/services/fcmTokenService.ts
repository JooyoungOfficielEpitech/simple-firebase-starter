import { Platform } from 'react-native'
import firestore from '@react-native-firebase/firestore'
import { logger } from '@/utils/logger'

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

  /**
   * 기기 정보 수집
   */
  private async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      // React Native에서 기본 제공하는 정보만 사용
      const deviceInfo: DeviceInfo = {
        platform: Platform.OS as 'ios' | 'android',
        deviceId: `${Platform.OS}_${Date.now()}`, // 임시 기기 ID
        osVersion: Platform.Version.toString(),
      }

      return deviceInfo
    } catch (error) {
      logger.error('기기 정보 수집 실패:', error)
      // 기본값 반환
      return {
        platform: Platform.OS as 'ios' | 'android',
        deviceId: `${Platform.OS}_fallback`,
      }
    }
  }

  /**
   * FCM 토큰을 Firestore에 등록/업데이트
   */
  async registerToken(userId: string, fcmToken: string): Promise<boolean> {
    try {
      logger.info('🔄 [FCMTokenService] FCM 토큰 등록 시작', { userId, tokenPrefix: fcmToken.substring(0, 10) })

      const deviceInfo = await this.getDeviceInfo()
      const now = new Date()

      // 문서 ID를 userId_deviceId 형태로 생성하여 기기별 고유 문서 생성
      const docId = `${userId}_${deviceInfo.deviceId}`

      const tokenData: FCMTokenData = {
        userId,
        fcmToken,
        deviceInfo,
        createdAt: now,
        lastUsed: now,
        isActive: true,
      }

      // Firestore에 토큰 데이터 저장/업데이트
      await firestore()
        .collection(this.COLLECTION)
        .doc(docId)
        .set(tokenData, { merge: true })

      logger.info('✅ [FCMTokenService] FCM 토큰 등록 성공', { docId })
      return true
    } catch (error) {
      logger.error('❌ [FCMTokenService] FCM 토큰 등록 실패:', error)
      return false
    }
  }

  /**
   * 토큰 갱신 (새 토큰으로 업데이트)
   */
  async updateToken(userId: string, oldToken: string, newToken: string): Promise<boolean> {
    try {
      logger.info('🔄 [FCMTokenService] FCM 토큰 갱신 시작', { 
        userId, 
        oldTokenPrefix: oldToken.substring(0, 10),
        newTokenPrefix: newToken.substring(0, 10)
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
        logger.info('✅ [FCMTokenService] 기존 토큰 업데이트 성공')
      } else {
        // 기존 토큰을 찾지 못한 경우 새로 등록
        logger.info('🆕 [FCMTokenService] 기존 토큰을 찾지 못해 새로 등록')
        await this.registerToken(userId, newToken)
      }

      return true
    } catch (error) {
      logger.error('❌ [FCMTokenService] FCM 토큰 갱신 실패:', error)
      return false
    }
  }

  /**
   * 사용자의 모든 활성 FCM 토큰 조회
   */
  async getUserTokens(userId: string): Promise<string[]> {
    try {
      const querySnapshot = await firestore()
        .collection(this.COLLECTION)
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get()

      const tokens = querySnapshot.docs.map(doc => {
        const data = doc.data() as FCMTokenData
        return data.fcmToken
      })

      logger.info('📱 [FCMTokenService] 사용자 토큰 조회', { userId, tokenCount: tokens.length })
      return tokens
    } catch (error) {
      logger.error('❌ [FCMTokenService] 사용자 토큰 조회 실패:', error)
      return []
    }
  }

  /**
   * 특정 토큰을 비활성화 (로그아웃이나 앱 삭제 시)
   */
  async deactivateToken(userId: string, fcmToken: string): Promise<boolean> {
    try {
      logger.info('🔄 [FCMTokenService] FCM 토큰 비활성화 시작', { 
        userId, 
        tokenPrefix: fcmToken.substring(0, 10)
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
        logger.info('✅ [FCMTokenService] FCM 토큰 비활성화 성공')
        return true
      } else {
        logger.warn('⚠️ [FCMTokenService] 비활성화할 토큰을 찾지 못함')
        return false
      }
    } catch (error) {
      logger.error('❌ [FCMTokenService] FCM 토큰 비활성화 실패:', error)
      return false
    }
  }

  /**
   * 사용자의 모든 토큰 비활성화 (로그아웃 시)
   */
  async deactivateAllUserTokens(userId: string): Promise<boolean> {
    try {
      logger.info('🔄 [FCMTokenService] 사용자 모든 토큰 비활성화 시작', { userId })

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
      logger.info('✅ [FCMTokenService] 사용자 모든 토큰 비활성화 성공', { 
        userId, 
        deactivatedCount: querySnapshot.docs.length 
      })
      return true
    } catch (error) {
      logger.error('❌ [FCMTokenService] 사용자 모든 토큰 비활성화 실패:', error)
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

      logger.info('🧹 [FCMTokenService] 오래된 토큰 정리 완료', { deletedCount })
      return deletedCount
    } catch (error) {
      logger.error('❌ [FCMTokenService] 오래된 토큰 정리 실패:', error)
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
      logger.error('❌ [FCMTokenService] 토큰 마지막 사용 시간 업데이트 실패:', error)
      return false
    }
  }
}

export const fcmTokenService = new FCMTokenService()
export default fcmTokenService