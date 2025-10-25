import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player'
import { useNotification } from '@/context/NotificationContext'
import messaging from '@react-native-firebase/messaging'

export const DebugInfo = () => {
  const playbackState = usePlaybackState()
  const { fcmToken, isPushNotificationEnabled } = useNotification()
  const [debugInfo, setDebugInfo] = useState({
    trackPlayerInitialized: false,
    backgroundModeEnabled: false,
    pushPermission: 'unknown',
    trackPlayerState: 'unknown',
    currentTrack: null,
  })

  useEffect(() => {
    checkDebugInfo()
  }, [])

  const checkDebugInfo = async () => {
    try {
      // TrackPlayer 상태 확인
      const state = await TrackPlayer.getState()
      const tracks = await TrackPlayer.getQueue()
      
      // 푸시 알림 권한 확인
      const authStatus = await messaging().hasPermission()
      
      setDebugInfo({
        trackPlayerInitialized: tracks.length > 0,
        backgroundModeEnabled: true, // Info.plist에 설정되어 있음
        pushPermission: authStatus === 1 ? 'granted' : 'denied',
        trackPlayerState: state,
        currentTrack: tracks[0] || null,
      })
    } catch (error) {
      console.error('Debug info error:', error)
      Alert.alert('디버그 정보 오류', error.message)
    }
  }

  const testTrackPlayer = async () => {
    try {
      // 중복 초기화 방지
      if (typeof global.isPlayerInitialized === 'function' && global.isPlayerInitialized()) {
        console.log('✅ DebugInfo TrackPlayer 이미 초기화됨 - 건너뛰기')
      } else {
        await TrackPlayer.setupPlayer()
        if (typeof global.setPlayerInitialized === 'function') {
          global.setPlayerInitialized(true)
        }
      }
      await TrackPlayer.add({
        id: 'test-track',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        title: 'Test Song',
        artist: 'Test Artist',
      })
      await TrackPlayer.play()
      Alert.alert('성공', 'TrackPlayer 테스트 성공!')
      checkDebugInfo()
    } catch (error) {
      Alert.alert('TrackPlayer 오류', `Error: ${error.message}`)
    }
  }

  const testPushNotification = async () => {
    try {
      const token = await messaging().getToken()
      Alert.alert('FCM 토큰', `토큰: ${token?.substring(0, 50)}...`)
    } catch (error) {
      Alert.alert('푸시 알림 오류', `Error: ${error.message}`)
    }
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        🐛 디버그 정보
      </Text>

      {/* TrackPlayer 상태 */}
      <View style={{ backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>🎵 TrackPlayer 상태</Text>
        <Text>초기화됨: {debugInfo.trackPlayerInitialized ? '✅' : '❌'}</Text>
        <Text>재생 상태: {String(playbackState)}</Text>
        <Text>현재 트랙: {debugInfo.currentTrack?.title || '없음'}</Text>
        <Text>백그라운드 모드: {debugInfo.backgroundModeEnabled ? '✅' : '❌'}</Text>
      </View>

      {/* 푸시 알림 상태 */}
      <View style={{ backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>🔔 푸시 알림 상태</Text>
        <Text>권한: {debugInfo.pushPermission}</Text>
        <Text>활성화됨: {isPushNotificationEnabled ? '✅' : '❌'}</Text>
        <Text>FCM 토큰: {fcmToken ? '있음' : '없음'}</Text>
      </View>

      {/* 테스트 버튼들 */}
      <TouchableOpacity
        onPress={testTrackPlayer}
        style={{
          backgroundColor: '#007AFF',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 8
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          🎵 TrackPlayer 테스트
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={testPushNotification}
        style={{
          backgroundColor: '#FF6B35',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 8
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          🔔 푸시 알림 테스트
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={checkDebugInfo}
        style={{
          backgroundColor: '#34C759',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          🔄 정보 새로고침
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}