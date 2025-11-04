import { useState } from 'react'
import { Alert, Share } from 'react-native'
import { fcmTokenService } from '@/services/fcmTokenService'

export const useDevSettings = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [allUserTokens, setAllUserTokens] = useState<string[]>([])
  const [debugLogs, setDebugLogs] = useState<string[]>([])

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

  return {
    isLoading,
    allUserTokens,
    debugLogs,
    addLog,
    copyToClipboard,
    loadAllUserTokens,
    cleanupOldTokens,
    cleanupDuplicateTokens,
    deactivateAllTokens,
    clearLogs
  }
}
