import React, { FC, useEffect } from 'react'
import { View, Text, ScrollView, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNotification } from '@/context/NotificationContext'
import { useAppTheme } from '@/theme/context'
import { useAuth } from '@/context/AuthContext'
import { usePlaybackState } from 'react-native-track-player'

// Hooks
import { useDevSettings } from './DevSettings/hooks/useDevSettings'
import { usePerformanceMonitoring } from './DevSettings/hooks/usePerformanceMonitoring'
import { useTrackPlayerDebug } from './DevSettings/hooks/useTrackPlayerDebug'

// Components
import { PushStatusSection } from './DevSettings/components/PushStatusSection'
import { PerformanceMonitorSection } from './DevSettings/components/PerformanceMonitorSection'
import { TrackPlayerStatusSection } from './DevSettings/components/TrackPlayerStatusSection'
import { FCMTokenSection } from './DevSettings/components/FCMTokenSection'
import { TokenManagementSection } from './DevSettings/components/TokenManagementSection'
import { UsageGuideSection } from './DevSettings/components/UsageGuideSection'
import { DebugLogsSection } from './DevSettings/components/DebugLogsSection'

interface DevSettingsScreenProps {
  navigation?: any
}

export const DevSettingsScreen: FC<DevSettingsScreenProps> = ({ navigation }) => {
  const { fcmToken, isPushNotificationEnabled, requestPushPermission } = useNotification()
  const { user } = useAuth()
  const playbackState = usePlaybackState()
  const insets = useSafeAreaInsets()
  const { theme: { colors, spacing } } = useAppTheme()

  // Custom hooks
  const {
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
  } = useDevSettings()

  const {
    performanceStats,
    lastAppState,
    resetStats
  } = usePerformanceMonitoring(addLog)

  const {
    trackPlayerInfo,
    checkStatus,
    testPlayer
  } = useTrackPlayerDebug(addLog)

  useEffect(() => {
    checkStatus()
  }, [])

  // Handlers
  const handleRequestPermission = async () => {
    try {
      await requestPushPermission()
    } catch (error) {
      Alert.alert('오류', '권한 요청에 실패했습니다.')
    }
  }

  const handleSendTestNotification = () => {
    if (!fcmToken) {
      Alert.alert('알림', 'FCM 토큰이 없습니다.')
      return
    }

    const instructions = `Firebase Console에서 테스트 메시지 보내기:

1. Firebase Console → Messaging → "새 캠페인"
2. "알림" 선택
3. 제목/내용 입력
4. "테스트 메시지 전송"
5. FCM 토큰 입력: ${fcmToken.substring(0, 20)}...
6. "테스트" 클릭

FCM 토큰이 클립보드에 복사되었습니다.`

    copyToClipboard(fcmToken, 'FCM Token')
    Alert.alert('테스트 알림 보내기', instructions)
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
      {/* Header */}
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

      {/* Push Notification Status */}
      <PushStatusSection
        isPushNotificationEnabled={isPushNotificationEnabled}
        fcmToken={fcmToken}
        isLoading={isLoading}
        onRequestPermission={handleRequestPermission}
        colors={colors}
        spacing={spacing}
      />

      {/* Performance Monitor */}
      <PerformanceMonitorSection
        stats={performanceStats}
        lastAppState={lastAppState}
        onReset={resetStats}
        colors={colors}
        spacing={spacing}
      />

      {/* TrackPlayer Status */}
      <TrackPlayerStatusSection
        trackPlayerInfo={trackPlayerInfo}
        playbackState={playbackState}
        onTest={testPlayer}
        onRefresh={checkStatus}
        colors={colors}
        spacing={spacing}
      />

      {/* FCM Token */}
      {fcmToken && (
        <FCMTokenSection
          fcmToken={fcmToken}
          onCopy={() => copyToClipboard(fcmToken, 'FCM Token')}
          onSendTest={handleSendTestNotification}
          onNavigatePushDebug={() => navigation?.navigate('PushDebug')}
          onNavigateMusicPlayer={() => navigation?.navigate('MusicPlayer')}
          onNavigateDebug={() => navigation?.navigate('Debug')}
          colors={colors}
          spacing={spacing}
        />
      )}

      {/* Token Management */}
      {user && (
        <TokenManagementSection
          isLoading={isLoading}
          tokenCount={allUserTokens.length}
          tokenStats={tokenStats}
          onCheckDatabase={() => checkDatabaseStatus(user.uid)}
          onLoadTokens={() => loadAllUserTokens(user.uid)}
          onCleanupOld={cleanupOldTokens}
          onCleanupDuplicate={() => cleanupDuplicateTokens(user.uid)}
          onDeactivateAll={() => deactivateAllTokens(user.uid)}
          colors={colors}
          spacing={spacing}
        />
      )}

      {/* Usage Guide */}
      <UsageGuideSection colors={colors} spacing={spacing} />

      {/* Debug Logs */}
      <DebugLogsSection
        logs={debugLogs}
        onClear={clearLogs}
        colors={colors}
        spacing={spacing}
      />
    </ScrollView>
  )
}

export default DevSettingsScreen
