import { useState } from 'react'
import { Alert } from 'react-native'
import TrackPlayer from 'react-native-track-player'

interface TrackPlayerInfo {
  initialized: boolean
  state: string
  currentTrack: any
  queueLength: number
}

export const useTrackPlayerDebug = (addLog: (message: string) => void) => {
  const [trackPlayerInfo, setTrackPlayerInfo] = useState<TrackPlayerInfo>({
    initialized: false,
    state: 'unknown',
    currentTrack: null,
    queueLength: 0,
  })

  const checkStatus = async () => {
    try {
      addLog('🔍 TrackPlayer 상태 확인 시작')
      const state = await TrackPlayer.getState()
      const queue = await TrackPlayer.getQueue()
      const currentTrack = await TrackPlayer.getCurrentTrack()
      
      setTrackPlayerInfo({
        initialized: true,
        state: String(state),
        currentTrack: currentTrack,
        queueLength: queue.length,
      })
    } catch (error: any) {
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

  const testPlayer = async () => {
    try {
      addLog('🔍 TrackPlayer 테스트 시작')
      
      if (typeof global.isPlayerInitialized === 'function' && global.isPlayerInitialized()) {
        addLog('✅ TrackPlayer 이미 초기화됨')
      } else {
        await TrackPlayer.setupPlayer({ waitForBuffer: true })
        addLog('✅ TrackPlayer.setupPlayer() 성공')
        if (typeof global.setPlayerInitialized === 'function') {
          global.setPlayerInitialized(true)
        }
      }
      
      try {
        await TrackPlayer.reset()
        addLog('🧹 기존 큐 클리어 완료')
      } catch (resetError) {
        addLog('ℹ️ 큐 클리어 스킵')
      }
      
      await TrackPlayer.add({
        id: 'test-track',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        title: 'Test Song',
        artist: 'Test Artist',
        duration: 194,
      })
      addLog('✅ TrackPlayer.add() 성공')
      
      await TrackPlayer.play()
      addLog('▶️ TrackPlayer.play() 성공')
      
      Alert.alert('성공', 'TrackPlayer 테스트 성공!')
      checkStatus()
    } catch (error: any) {
      addLog(`❌ TrackPlayer 테스트 실패: ${error.message}`)
      
      let errorMessage = `Error: ${error.message}`
      if (error.message?.includes('not initialized')) {
        errorMessage = 'TrackPlayer 서비스가 등록되지 않았습니다.'
      }
      
      Alert.alert('TrackPlayer 오류', errorMessage)
    }
  }

  return { trackPlayerInfo, checkStatus, testPlayer }
}
