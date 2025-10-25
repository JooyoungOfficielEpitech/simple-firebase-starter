import React, { FC, useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, Share, AppState } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNotification } from '@/context/NotificationContext'
import { useAppTheme } from '@/theme/context'
import { useAuth } from '@/context/AuthContext'
import { fcmTokenService } from '@/services/fcmTokenService'
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player'

interface DevSettingsScreenProps {
  navigation?: any
}

export const DevSettingsScreen: FC<DevSettingsScreenProps> = ({ navigation }) => {
  const { fcmToken, isPushNotificationEnabled, requestPushPermission } = useNotification()
  const { user } = useAuth()
  const playbackState = usePlaybackState()
  const [isLoading, setIsLoading] = useState(false)
  const [allUserTokens, setAllUserTokens] = useState<string[]>([])
  const [trackPlayerInfo, setTrackPlayerInfo] = useState({
    initialized: false,
    state: 'unknown',
    currentTrack: null,
    queueLength: 0,
  })
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [performanceStats, setPerformanceStats] = useState({
    memoryUsage: 0,
    jsHeapSize: 0,
    appStateChanges: 0,
    lastCrash: null,
    freezeCount: 0,
    backgroundTime: 0,
  })
  const [lastAppState, setLastAppState] = useState(AppState.currentState)
  const insets = useSafeAreaInsets()
  const { theme: { colors, spacing } } = useAppTheme()

  useEffect(() => {
    checkTrackPlayerStatus()
    startPerformanceMonitoring()
  }, [])

  const startPerformanceMonitoring = () => {
    // AppState 변경 감지
    const handleAppStateChange = (nextAppState) => {
      addLog(`📱 AppState: ${lastAppState} → ${nextAppState}`)
      
      if (lastAppState === 'background' && nextAppState === 'active') {
        setPerformanceStats(prev => ({
          ...prev,
          backgroundTime: prev.backgroundTime + 1
        }))
        addLog(`⏰ 백그라운드에서 복귀 (총 ${performanceStats.backgroundTime + 1}회)`)
      }
      
      setLastAppState(nextAppState)
      setPerformanceStats(prev => ({
        ...prev,
        appStateChanges: prev.appStateChanges + 1
      }))
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    // 메모리 모니터링 (5초마다)
    const memoryInterval = setInterval(() => {
      try {
        // React Native에서 메모리 사용량 추정
        const now = performance.now()
        setPerformanceStats(prev => ({
          ...prev,
          memoryUsage: Math.round(now / 1000), // 간접적인 메모리 추정
          jsHeapSize: global.performance?.memory?.usedJSHeapSize || 0
        }))
      } catch (error) {
        addLog(`❌ 메모리 모니터링 오류: ${error.message}`)
      }
    }, 5000)

    // Freeze 감지 (30초마다 heartbeat)
    let lastHeartbeat = Date.now()
    const freezeInterval = setInterval(() => {
      const now = Date.now()
      const timeDiff = now - lastHeartbeat
      
      if (timeDiff > 35000) { // 35초 이상 응답 없으면 freeze 의심
        setPerformanceStats(prev => ({
          ...prev,
          freezeCount: prev.freezeCount + 1
        }))
        addLog(`🚨 UI Freeze 감지! ${Math.round(timeDiff/1000)}초`)
      }
      
      lastHeartbeat = now
    }, 30000)

    // Global error handler
    const originalErrorHandler = global.ErrorUtils?.getGlobalHandler?.()
    global.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
      addLog(`💥 Global Error: ${error.message} (Fatal: ${isFatal})`)
      setPerformanceStats(prev => ({
        ...prev,
        lastCrash: new Date().toISOString()
      }))
      
      if (originalErrorHandler) {
        originalErrorHandler(error, isFatal)
      }
    })

    return () => {
      subscription?.remove()
      clearInterval(memoryInterval)
      clearInterval(freezeInterval)
      if (originalErrorHandler) {
        global.ErrorUtils?.setGlobalHandler?.(originalErrorHandler)
      }
    }
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLogs(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]) // 최근 10개만 유지
  }

  const checkTrackPlayerStatus = async () => {
    try {
      addLog('🔍 TrackPlayer 상태 확인 시작')
      const state = await TrackPlayer.getState()
      addLog(`🔍 TrackPlayer state: ${state}`)
      
      const queue = await TrackPlayer.getQueue()
      addLog(`🔍 TrackPlayer queue length: ${queue.length}`)
      
      const currentTrack = await TrackPlayer.getCurrentTrack()
      addLog(`🔍 TrackPlayer currentTrack: ${currentTrack ? 'exists' : 'null'}`)
      
      setTrackPlayerInfo({
        initialized: true,
        state: String(state),
        currentTrack: currentTrack,
        queueLength: queue.length,
      })
    } catch (error) {
      addLog(`❌ TrackPlayer 상태 확인 실패: ${error.message}`)
      Alert.alert('TrackPlayer 에러', `에러: ${error.message}`)
      setTrackPlayerInfo({
        initialized: false,
        state: `error: ${error.message}`,
        currentTrack: null,
        queueLength: 0,
      })
    }
  }

  const testTrackPlayer = async () => {
    try {
      console.log('🔍 TrackPlayer 테스트 시작')
      addLog('🔍 TrackPlayer 테스트 시작')
      
      // 안전한 초기화 - 중복 방지
      if (typeof global.isPlayerInitialized === 'function' && global.isPlayerInitialized()) {
        console.log('✅ DevSettings TrackPlayer 이미 초기화됨 - 건너뛰기')
        addLog('✅ TrackPlayer 이미 초기화됨 - 건너뛰기')
      } else {
        await TrackPlayer.setupPlayer({
          waitForBuffer: true,
        })
        console.log('🔍 TrackPlayer.setupPlayer() 성공')
        addLog('✅ TrackPlayer.setupPlayer() 성공')
        
        // 초기화 상태 업데이트
        if (typeof global.setPlayerInitialized === 'function') {
          global.setPlayerInitialized(true)
        }
      }
      
      // 기존 큐 클리어
      try {
        await TrackPlayer.reset()
        addLog('🧹 기존 큐 클리어 완료')
      } catch (resetError) {
        addLog('ℹ️ 큐 클리어 스킵 (빈 큐)')
      }
      
      await TrackPlayer.add({
        id: 'test-track',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        title: 'Test Song',
        artist: 'Test Artist',
        duration: 194,
      })
      console.log('🔍 TrackPlayer.add() 성공')
      addLog('✅ TrackPlayer.add() 성공')
      
      await TrackPlayer.play()
      console.log('🔍 TrackPlayer.play() 성공')
      addLog('▶️ TrackPlayer.play() 성공')
      
      Alert.alert('성공', 'TrackPlayer 테스트 성공!')
      checkTrackPlayerStatus()
    } catch (error) {
      console.error('❌ TrackPlayer 테스트 실패:', error)
      addLog(`❌ TrackPlayer 테스트 실패: ${error.message}`)
      
      let errorMessage = `Error: ${error.message}`;
      if (error.message?.includes('not initialized')) {
        errorMessage = 'TrackPlayer 서비스가 등록되지 않았습니다. index.tsx를 확인하세요.';
      } else if (error.message?.includes('permission')) {
        errorMessage = '오디오 권한이 없습니다.';
      }
      
      Alert.alert('TrackPlayer 오류', errorMessage)
    }
  }

  const testActualPushNotification = async () => {
    if (!fcmToken) {
      Alert.alert('오류', 'FCM 토큰이 없습니다.')
      return
    }

    try {
      // 자체 테스트 알림 전송 (HTTP 요청으로)
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': 'key=YOUR_SERVER_KEY', // 실제로는 서버에서 해야 함
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: fcmToken,
          notification: {
            title: '테스트 알림',
            body: '실제 푸시 알림 테스트입니다',
          },
        }),
      })

      if (response.ok) {
        Alert.alert('성공', '푸시 알림 전송 성공! 곧 알림이 올 예정입니다.')
      } else {
        Alert.alert('실패', '푸시 알림 전송 실패')
      }
    } catch (error) {
      Alert.alert('오류', '이 기능은 서버 키가 필요합니다. Firebase Console을 사용하세요.')
    }
  }

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

      {/* 성능 모니터링 */}
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
          🚨 성능 모니터링 (Freeze 감지)
        </Text>
        
        <View style={{ marginBottom: spacing.sm }}>
          <Text style={{ color: colors.textDim }}>앱 상태 변경:</Text>
          <Text style={{ 
            color: colors.text,
            fontWeight: '600'
          }}>
            {performanceStats.appStateChanges}회 (현재: {lastAppState})
          </Text>
        </View>

        <View style={{ marginBottom: spacing.sm }}>
          <Text style={{ color: colors.textDim }}>백그라운드 복귀:</Text>
          <Text style={{ 
            color: colors.text,
            fontWeight: '600'
          }}>
            {performanceStats.backgroundTime}회
          </Text>
        </View>

        <View style={{ marginBottom: spacing.sm }}>
          <Text style={{ color: colors.textDim }}>UI Freeze 감지:</Text>
          <Text style={{ 
            color: performanceStats.freezeCount > 0 ? '#F44336' : '#4CAF50',
            fontWeight: '600'
          }}>
            {performanceStats.freezeCount}회 {performanceStats.freezeCount > 0 ? '⚠️' : '✅'}
          </Text>
        </View>

        <View style={{ marginBottom: spacing.sm }}>
          <Text style={{ color: colors.textDim }}>메모리 사용 (추정):</Text>
          <Text style={{ 
            color: colors.text,
            fontWeight: '600'
          }}>
            {performanceStats.memoryUsage}KB
          </Text>
        </View>

        {performanceStats.lastCrash && (
          <View style={{ marginBottom: spacing.sm }}>
            <Text style={{ color: colors.textDim }}>마지막 크래시:</Text>
            <Text style={{ 
              color: '#F44336',
              fontWeight: '600',
              fontSize: 12
            }}>
              {new Date(performanceStats.lastCrash).toLocaleString()}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => setPerformanceStats({
            memoryUsage: 0,
            jsHeapSize: 0,
            appStateChanges: 0,
            lastCrash: null,
            freezeCount: 0,
            backgroundTime: 0,
          })}
          style={{
            backgroundColor: '#FF6B35',
            padding: spacing.md,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
            🔄 성능 통계 리셋
          </Text>
        </TouchableOpacity>
      </View>

      {/* TrackPlayer 상태 */}
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
          🎵 TrackPlayer 상태
        </Text>
        
        <View style={{ marginBottom: spacing.sm }}>
          <Text style={{ color: colors.textDim }}>초기화됨:</Text>
          <Text style={{ 
            color: trackPlayerInfo.initialized ? '#4CAF50' : '#F44336',
            fontWeight: '600'
          }}>
            {trackPlayerInfo.initialized ? '✅ 성공' : '❌ 실패'}
          </Text>
        </View>

        <View style={{ marginBottom: spacing.sm }}>
          <Text style={{ color: colors.textDim }}>재생 상태:</Text>
          <Text style={{ 
            color: colors.text,
            fontWeight: '600'
          }}>
            {String(playbackState) || trackPlayerInfo.state}
          </Text>
        </View>

        <View style={{ marginBottom: spacing.sm }}>
          <Text style={{ color: colors.textDim }}>대기열 길이:</Text>
          <Text style={{ 
            color: colors.text,
            fontWeight: '600'
          }}>
            {trackPlayerInfo.queueLength}개
          </Text>
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ color: colors.textDim }}>현재 트랙:</Text>
          <Text style={{ 
            color: colors.text,
            fontWeight: '600'
          }}>
            {trackPlayerInfo.currentTrack ? '있음' : '없음'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={testTrackPlayer}
          style={{
            backgroundColor: '#007AFF',
            padding: spacing.md,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: spacing.sm
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
            🎵 TrackPlayer 테스트
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={checkTrackPlayerStatus}
          style={{
            backgroundColor: '#34C759',
            padding: spacing.md,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
            🔄 상태 새로고침
          </Text>
        </TouchableOpacity>
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

          <TouchableOpacity
            onPress={() => navigation?.navigate('MusicPlayer')}
            style={{
              backgroundColor: '#007AFF',
              padding: spacing.md,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: spacing.sm
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              🎵 음악 플레이어 테스트
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation?.navigate('Debug')}
            style={{
              backgroundColor: '#34C759',
              padding: spacing.md,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: spacing.sm
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              🐛 종합 디버그 정보
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

      {/* 디버그 로그 */}
      {debugLogs.length > 0 && (
        <View style={{
          backgroundColor: colors.palette.neutral100,
          padding: spacing.md,
          borderRadius: 12,
          marginTop: spacing.lg
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: colors.text,
            marginBottom: spacing.sm 
          }}>
            🔍 실시간 디버그 로그
          </Text>
          
          {debugLogs.map((log, index) => (
            <Text key={index} style={{ 
              fontSize: 12, 
              color: colors.textDim,
              fontFamily: 'monospace',
              marginBottom: 4
            }}>
              {log}
            </Text>
          ))}

          <TouchableOpacity
            onPress={() => setDebugLogs([])}
            style={{
              backgroundColor: colors.palette.primary500,
              padding: spacing.sm,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: spacing.sm
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 12 }}>
              🗑️ 로그 지우기
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

export default DevSettingsScreen