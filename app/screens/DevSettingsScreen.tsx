import React, { FC, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, Share } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNotification } from '@/context/NotificationContext'
import { useAppTheme } from '@/theme/context'
import { useAuth } from '@/context/AuthContext'
import { fcmTokenService } from '@/services/fcmTokenService'

interface DevSettingsScreenProps {
  navigation?: any
}

export const DevSettingsScreen: FC<DevSettingsScreenProps> = ({ navigation }) => {
  const { fcmToken, isPushNotificationEnabled, requestPushPermission } = useNotification()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [allUserTokens, setAllUserTokens] = useState<string[]>([])
  const insets = useSafeAreaInsets()
  const { theme: { colors, spacing } } = useAppTheme()

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Share.share({
        message: text,
        title: label,
      })
    } catch (error) {
      Alert.alert('오류', '복사에 실패했습니다.')
    }
  }

  const requestPermission = async () => {
    setIsLoading(true)
    try {
      await requestPushPermission()
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestNotification = () => {
    if (!fcmToken) {
      Alert.alert('알림', 'FCM 토큰이 없습니다.')
      return
    }

    const instructions = `
Firebase Console에서 테스트 메시지 보내기:

1. Firebase Console → Messaging → "새 캠페인"
2. "알림" 선택
3. 제목/내용 입력
4. "테스트 메시지 전송"
5. FCM 토큰 입력: ${fcmToken.substring(0, 20)}...
6. "테스트" 클릭

FCM 토큰이 클립보드에 복사되었습니다.
    `

    copyToClipboard(fcmToken, 'FCM Token')
    Alert.alert('테스트 알림 보내기', instructions)
  }

  const loadAllUserTokens = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const tokens = await fcmTokenService.getUserTokens(user.uid)
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

  const deactivateAllTokens = async () => {
    if (!user) return

    Alert.alert(
      '모든 토큰 비활성화',
      '이 사용자의 모든 기기에서 알림을 받지 않게 됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '비활성화', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true)
            try {
              const success = await fcmTokenService.deactivateAllUserTokens(user.uid)
              if (success) {
                Alert.alert('완료', '모든 토큰이 비활성화되었습니다.')
                setAllUserTokens([])
              } else {
                Alert.alert('오류', '토큰 비활성화에 실패했습니다.')
              }
            } finally {
              setIsLoading(false)
            }
          }
        }
      ]
    )
  }

  return (
    <ScrollView 
      style={{ 
        flex: 1, 
        backgroundColor: colors.background,
        paddingTop: insets.top 
      }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      {/* 헤더 */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: colors.text,
          marginBottom: spacing.sm 
        }}>
          개발자 설정
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: colors.textDim,
        }}>
          푸시 알림 테스트 및 디버깅
        </Text>
      </View>

      {/* 푸시 알림 상태 */}
      <View style={{
        backgroundColor: colors.palette.neutral100,
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.lg
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: colors.text,
          marginBottom: spacing.sm 
        }}>
          푸시 알림 상태
        </Text>
        
        <View style={{ marginBottom: spacing.sm }}>
          <Text style={{ color: colors.textDim }}>권한 상태:</Text>
          <Text style={{ 
            color: isPushNotificationEnabled ? '#4CAF50' : '#F44336',
            fontWeight: '600'
          }}>
            {isPushNotificationEnabled ? '✅ 허용됨' : '❌ 거부됨'}
          </Text>
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ color: colors.textDim }}>FCM 토큰:</Text>
          <Text style={{ 
            color: fcmToken ? '#4CAF50' : '#F44336',
            fontWeight: '600'
          }}>
            {fcmToken ? '✅ 생성됨' : '❌ 없음'}
          </Text>
        </View>

        {!isPushNotificationEnabled && (
          <TouchableOpacity
            onPress={requestPermission}
            disabled={isLoading}
            style={{
              backgroundColor: colors.palette.primary500,
              padding: spacing.md,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: spacing.sm
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              {isLoading ? '요청 중...' : '푸시 알림 권한 요청'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* FCM 토큰 표시 */}
      {fcmToken && (
        <View style={{
          backgroundColor: colors.palette.neutral100,
          padding: spacing.md,
          borderRadius: 12,
          marginBottom: spacing.lg
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: colors.text,
            marginBottom: spacing.sm 
          }}>
            FCM 토큰
          </Text>
          
          <View style={{
            backgroundColor: colors.background,
            padding: spacing.sm,
            borderRadius: 8,
            marginBottom: spacing.md
          }}>
            <Text style={{ 
              fontSize: 12, 
              color: colors.textDim,
              fontFamily: 'monospace'
            }}>
              {fcmToken}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => copyToClipboard(fcmToken, 'FCM Token')}
            style={{
              backgroundColor: colors.palette.primary500,
              padding: spacing.md,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: spacing.sm
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              📋 토큰 복사/공유
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={sendTestNotification}
            style={{
              backgroundColor: colors.palette.secondary500,
              padding: spacing.md,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: spacing.sm
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              🔔 테스트 알림 보내기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation?.navigate('PushDebug')}
            style={{
              backgroundColor: '#FF6B35',
              padding: spacing.md,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              🐛 푸시 알림 디버깅 화면
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 토큰 관리 */}
      {user && (
        <View style={{
          backgroundColor: colors.palette.neutral100,
          padding: spacing.md,
          borderRadius: 12,
          marginBottom: spacing.lg
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: colors.text,
            marginBottom: spacing.sm 
          }}>
            토큰 관리
          </Text>
          
          <TouchableOpacity
            onPress={loadAllUserTokens}
            disabled={isLoading}
            style={{
              backgroundColor: colors.palette.primary500,
              padding: spacing.md,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: spacing.sm
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              📱 모든 기기 토큰 조회 ({allUserTokens.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={cleanupOldTokens}
            disabled={isLoading}
            style={{
              backgroundColor: colors.palette.secondary500,
              padding: spacing.md,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: spacing.sm
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              🧹 오래된 토큰 정리
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={deactivateAllTokens}
            disabled={isLoading}
            style={{
              backgroundColor: '#F44336',
              padding: spacing.md,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              🚫 모든 토큰 비활성화
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 사용법 안내 */}
      <View style={{
        backgroundColor: colors.palette.neutral100,
        padding: spacing.md,
        borderRadius: 12
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: colors.text,
          marginBottom: spacing.sm 
        }}>
          사용법
        </Text>
        
        <Text style={{ 
          fontSize: 14, 
          color: colors.textDim,
          lineHeight: 20
        }}>
          1. FCM 토큰을 복사/공유하세요{'\n'}
          2. Firebase Console → Messaging으로 이동{'\n'}
          3. "새 캠페인" → "알림" 선택{'\n'}
          4. "테스트 메시지 전송"에 토큰 입력{'\n'}
          5. 테스트 메시지 전송{'\n\n'}
          📱 모든 기기 토큰: 이 사용자의 모든 기기 조회{'\n'}
          🧹 토큰 정리: 30일 이상 미사용 토큰 삭제{'\n'}
          🚫 토큰 비활성화: 모든 기기의 알림 중단
        </Text>
      </View>
    </ScrollView>
  )
}

export default DevSettingsScreen