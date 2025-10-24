import "@expo/metro-runtime" // this is for fast refresh on web w/o expo-router
import { registerRootComponent } from "expo"
import messaging from '@react-native-firebase/messaging'
import TrackPlayer from 'react-native-track-player'

import { App } from "@/app"

// TrackPlayer 서비스 등록
TrackPlayer.registerPlaybackService(() => require('./service'))

// 백그라운드 메시지 핸들러 등록 (앱이 완전히 종료된 상태에서도 작동)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('백그라운드에서 메시지를 수신했습니다!', remoteMessage)
  // 여기서 백그라운드 작업을 수행할 수 있습니다
  // 예: 로컬 데이터베이스 업데이트, 로컬 알림 표시 등
})

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)
