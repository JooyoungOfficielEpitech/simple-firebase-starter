import React, { FC, useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, Share, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNotification } from '@/context/NotificationContext'
import { useAppTheme } from '@/theme/context'
import { useAuth } from '@/context/AuthContext'
import { inAppLogger, LogEntry } from '@/utils/inAppLogger'
import messaging from '@react-native-firebase/messaging'

interface PushDebugScreenProps {
  navigation?: any
}

export const PushDebugScreen: FC<PushDebugScreenProps> = ({ navigation }) => {
  const { fcmToken, isPushNotificationEnabled, requestPushPermission, initializePushNotifications } = useNotification()
  const { user } = useAuth()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const insets = useSafeAreaInsets()
  const { theme: { colors, spacing } } = useAppTheme()

  // 로그 업데이트 리스너
  useEffect(() => {
    const updateLogs = () => {
      setLogs(inAppLogger.getLogs())
    }

    // 초기 로그 로드
    updateLogs()

    // 새 로그 이벤트 리스너
    inAppLogger.on('newLog', updateLogs)
    inAppLogger.on('logsCleared', updateLogs)

    return () => {
      inAppLogger.off('newLog', updateLogs)
      inAppLogger.off('logsCleared', updateLogs)
    }
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    setLogs(inAppLogger.getLogs())
    setRefreshing(false)
  }

  const testPushPermission = async () => {
    setIsLoading(true)
    inAppLogger.info('TEST', '수동 푸시 권한 테스트 시작')
    try {
      const result = await requestPushPermission()
      inAppLogger.info('TEST', `푸시 권한 테스트 결과: ${result}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testInitialization = async () => {
    setIsLoading(true)
    inAppLogger.info('TEST', '수동 푸시 초기화 테스트 시작')
    try {
      const result = await initializePushNotifications()
      inAppLogger.info('TEST', `푸시 초기화 테스트 결과: ${result}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkMessagingPermission = async () => {
    setIsLoading(true)
    inAppLogger.info('TEST', 'Firebase Messaging 권한 상태 확인')
    try {
      const authStatus = await messaging().requestPermission()
      inAppLogger.info('TEST', `현재 권한 상태: ${authStatus}`)
      
      const hasPermission = await messaging().hasPermission()
      inAppLogger.info('TEST', `hasPermission 결과: ${hasPermission}`)
      
      const isDeviceRegistered = messaging().isDeviceRegisteredForRemoteMessages
      inAppLogger.info('TEST', `기기 등록 상태: ${isDeviceRegistered}`)
    } catch (error) {
      inAppLogger.error('TEST', 'Firebase Messaging 권한 확인 실패', error)
    } finally {
      setIsLoading(false)
    }
  }

  const simulateBackgroundTest = () => {
    inAppLogger.info('TEST', '🔔 백그라운드 알림 테스트를 위해 다음을 수행하세요:')
    inAppLogger.info('TEST', '1. 홈 버튼을 눌러 앱을 백그라운드로 보내기')
    inAppLogger.info('TEST', '2. Firebase Console에서 테스트 메시지 발송')
    inAppLogger.info('TEST', '3. 알림이 상단에 나타나는지 확인')
    inAppLogger.info('TEST', '4. 알림을 탭해서 앱이 다시 열리는지 확인')
    
    Alert.alert(
      '백그라운드 알림 테스트',
      '1. 지금 홈 버튼을 눌러 앱을 백그라운드로 보내세요\n2. Firebase Console에서 테스트 메시지를 발송하세요\n3. 상단에 알림이 나타나는지 확인하세요',
      [{ text: '확인' }]
    )
  }

  const exportLogs = async () => {
    try {
      const logsData = inAppLogger.exportLogs()
      await Share.share({
        message: logsData,
        title: '푸시 알림 디버그 로그',
      })
    } catch (error) {
      Alert.alert('오류', '로그 내보내기에 실패했습니다.')
    }
  }

  const clearLogs = () => {
    Alert.alert(
      '로그 삭제',
      '모든 로그를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => inAppLogger.clearLogs()
        }
      ]
    )
  }

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return '#F44336'
      case 'warn': return '#FF9800'
      case 'success': return '#4CAF50'
      default: return colors.text
    }
  }

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return '❌'
      case 'warn': return '⚠️'
      case 'success': return '✅'
      default: return 'ℹ️'
    }
  }

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background,
      paddingTop: insets.top 
    }}>
      {/* 헤더 */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.palette.neutral200
      }}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={{ marginRight: spacing.md }}
        >
          <Text style={{ fontSize: 18, color: colors.palette.primary500 }}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={{ 
          fontSize: 20, 
          fontWeight: 'bold', 
          color: colors.text,
          flex: 1
        }}>
          🔔 푸시 알림 디버깅
        </Text>
      </View>

      {/* 현재 상태 */}
      <View style={{
        backgroundColor: colors.palette.neutral100,
        padding: spacing.md,
        margin: spacing.md,
        borderRadius: 12
      }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
          현재 상태
        </Text>
        <Text style={{ color: isPushNotificationEnabled ? '#4CAF50' : '#F44336' }}>
          푸시 권한: {isPushNotificationEnabled ? '✅ 활성화' : '❌ 비활성화'}
        </Text>
        <Text style={{ color: fcmToken ? '#4CAF50' : '#F44336' }}>
          FCM 토큰: {fcmToken ? '✅ 있음' : '❌ 없음'}
        </Text>
        <Text style={{ color: user ? '#4CAF50' : '#F44336' }}>
          사용자: {user ? '✅ 로그인됨' : '❌ 로그인 안됨'}
        </Text>
      </View>

      {/* 테스트 버튼들 */}
      <View style={{
        backgroundColor: colors.palette.neutral100,
        padding: spacing.md,
        margin: spacing.md,
        borderRadius: 12
      }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
          테스트 액션
        </Text>
        
        <TouchableOpacity
          onPress={testPushPermission}
          disabled={isLoading}
          style={{
            backgroundColor: colors.palette.primary500,
            padding: spacing.sm,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: spacing.xs
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
            🔐 권한 테스트
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testInitialization}
          disabled={isLoading}
          style={{
            backgroundColor: colors.palette.secondary500,
            padding: spacing.sm,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: spacing.xs
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
            🚀 초기화 테스트
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={checkMessagingPermission}
          disabled={isLoading}
          style={{
            backgroundColor: '#9C27B0',
            padding: spacing.sm,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: spacing.xs
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
            📱 Firebase 상태 확인
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={simulateBackgroundTest}
          style={{
            backgroundColor: '#FF5722',
            padding: spacing.sm,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
            🔔 백그라운드 알림 테스트
          </Text>
        </TouchableOpacity>
      </View>

      {/* 로그 관리 */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm
      }}>
        <TouchableOpacity
          onPress={exportLogs}
          style={{
            backgroundColor: colors.palette.primary500,
            padding: spacing.sm,
            borderRadius: 8,
            flex: 1,
            marginRight: spacing.xs,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>📤 로그 내보내기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={clearLogs}
          style={{
            backgroundColor: '#F44336',
            padding: spacing.sm,
            borderRadius: 8,
            flex: 1,
            marginLeft: spacing.xs,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>🗑️ 로그 삭제</Text>
        </TouchableOpacity>
      </View>

      {/* 실시간 로그 */}
      <View style={{ flex: 1, margin: spacing.md }}>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '600', 
          marginBottom: spacing.sm,
          color: colors.text
        }}>
          실시간 로그 ({logs.length})
        </Text>
        
        <ScrollView 
          style={{
            backgroundColor: '#000000',
            borderRadius: 8,
            padding: spacing.sm,
            flex: 1
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {logs.length === 0 ? (
            <Text style={{ color: '#FFFFFF', textAlign: 'center', marginTop: 20 }}>
              아직 로그가 없습니다. 테스트를 시작해보세요.
            </Text>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={{ marginBottom: spacing.xs }}>
                <Text style={{ color: getLogColor(log.level), fontFamily: 'monospace', fontSize: 12 }}>
                  {getLogIcon(log.level)} [{log.timestamp.toLocaleTimeString()}] [{log.category}] {log.message}
                </Text>
                {log.data && (
                  <Text style={{ color: '#CCCCCC', fontFamily: 'monospace', fontSize: 10, marginLeft: 20 }}>
                    {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : String(log.data)}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  )
}

export default PushDebugScreen