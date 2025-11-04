import { useState } from 'react'
import { Alert, Share } from 'react-native'
import { fcmTokenService } from '@/services/fcmTokenService'
import firestore from '@react-native-firebase/firestore'

export const useDevSettings = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [allUserTokens, setAllUserTokens] = useState<string[]>([])
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [tokenStats, setTokenStats] = useState<{
    total: number
    active: number
    inactive: number
    duplicates: number
  }>({ total: 0, active: 0, inactive: 0, duplicates: 0 })

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLogs(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)])
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Share.share({ message: text, title: label })
    } catch (error) {
      Alert.alert('오류', '복사에 실패했습니다.')
    }
  }

  const loadAllUserTokens = async (userId: string) => {
    setIsLoading(true)
    try {
      const tokens = await fcmTokenService.getUserTokens(userId)
      setAllUserTokens(tokens)
      Alert.alert('사용자 토큰 조회', `총 ${tokens.length}개의 활성 토큰을 찾았습니다.`)
    } catch (error) {
      Alert.alert('오류', '토큰 조회에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const cleanupOldTokens = async () => {
    setIsLoading(true)
    try {
      const deletedCount = await fcmTokenService.cleanupOldTokens()
      Alert.alert('토큰 정리 완료', `${deletedCount}개의 오래된 토큰을 정리했습니다.`)
    } catch (error) {
      Alert.alert('오류', '토큰 정리에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const cleanupDuplicateTokens = async (userId: string) => {
    Alert.alert(
      '중복 토큰 정리',
      '같은 FCM 토큰을 가진 여러 문서 중 하나만 남기고 비활성화합니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '정리',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true)
            try {
              addLog('🧹 중복 토큰 정리 시작...')
              const cleanedCount = await fcmTokenService.cleanupUserDuplicateTokens(userId)
              addLog(`✅ ${cleanedCount}개 중복 토큰 정리 완료`)
              Alert.alert('정리 완료!', `${cleanedCount}개의 중복 토큰을 비활성화했습니다.`)
              loadAllUserTokens(userId)
            } catch (error: any) {
              addLog(`❌ 정리 실패: ${error.message}`)
              Alert.alert('오류', '중복 토큰 정리에 실패했습니다.')
            } finally {
              setIsLoading(false)
            }
          },
        },
      ]
    )
  }

  const deactivateAllTokens = async (userId: string) => {
    Alert.alert(
      '모든 토큰 비활성화',
      '모든 기기에서 알림을 받지 않게 됩니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '비활성화', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true)
            try {
              const success = await fcmTokenService.deactivateAllUserTokens(userId)
              if (success) {
                Alert.alert('완료', '모든 토큰이 비활성화되었습니다.')
                setAllUserTokens([])
              }
            } finally {
              setIsLoading(false)
            }
          }
        }
      ]
    )
  }

  const clearLogs = () => setDebugLogs([])

  // DB 상태 확인 (모든 토큰 조회 및 중복 체크)
  const checkDatabaseStatus = async (userId: string) => {
    setIsLoading(true)
    try {
      addLog('🔍 DB 상태 확인 시작...')

      // 사용자의 모든 토큰 문서 조회 (활성/비활성 모두)
      const snapshot = await firestore()
        .collection('userFCMTokens')
        .where('userId', '==', userId)
        .get()

      const total = snapshot.docs.length
      let active = 0
      let inactive = 0
      const tokenMap = new Map<string, number>()

      snapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.isActive) {
          active++
        } else {
          inactive++
        }

        // 중복 체크
        const token = data.fcmToken
        tokenMap.set(token, (tokenMap.get(token) || 0) + 1)
      })

      // 중복 개수 계산 (2개 이상인 토큰)
      let duplicates = 0
      tokenMap.forEach((count) => {
        if (count > 1) {
          duplicates += count - 1  // 중복 개수만 세기
        }
      })

      const stats = { total, active, inactive, duplicates }
      setTokenStats(stats)

      addLog(`✅ 총 ${total}개 (활성: ${active}, 비활성: ${inactive}, 중복: ${duplicates})`)

      // 중복 토큰 상세 정보
      const duplicateTokens: string[] = []
      tokenMap.forEach((count, token) => {
        if (count > 1) {
          duplicateTokens.push(`${token.substring(0, 15)}... (${count}개)`)
        }
      })

      if (duplicateTokens.length > 0) {
        addLog(`⚠️ 중복 토큰: ${duplicateTokens.join(', ')}`)

        Alert.alert(
          'DB 상태 확인',
          `총 ${total}개 토큰\n` +
          `활성: ${active}개\n` +
          `비활성: ${inactive}개\n` +
          `중복: ${duplicates}개\n\n` +
          `중복 토큰:\n${duplicateTokens.join('\n')}`,
          [
            { text: '확인' },
            {
              text: '지금 정리',
              onPress: () => cleanupDuplicateTokens(userId)
            }
          ]
        )
      } else {
        Alert.alert(
          'DB 상태 확인',
          `총 ${total}개 토큰\n` +
          `활성: ${active}개\n` +
          `비활성: ${inactive}개\n` +
          `중복: 없음 ✅`
        )
      }

      return stats
    } catch (error: any) {
      addLog(`❌ DB 확인 실패: ${error.message}`)
      Alert.alert('오류', 'DB 상태 확인에 실패했습니다.')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    allUserTokens,
    debugLogs,
    tokenStats,
    addLog,
    copyToClipboard,
    loadAllUserTokens,
    cleanupOldTokens,
    cleanupDuplicateTokens,
    deactivateAllTokens,
    clearLogs,
    checkDatabaseStatus,
  }
}
