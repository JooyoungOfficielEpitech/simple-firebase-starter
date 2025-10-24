import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import { Alert, Platform } from 'react-native'
import { inAppLogger } from './inAppLogger'

export interface PushNotificationProps {
  title?: string
  body?: string
  data?: { [key: string]: string | object }
}

export interface NotificationListenerProps {
  onNotificationReceived?: (notification: PushNotificationProps) => void
  onNotificationOpenedApp?: (notification: PushNotificationProps) => void
}

class PushNotificationService {
  private static instance: PushNotificationService
  private fcmToken: string | null = null
  private listeners: NotificationListenerProps = {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  /**
   * 푸시 알림 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    try {
      inAppLogger.info('FCM', '푸시 알림 권한 요청 시작')
      
      const authStatus = await messaging().requestPermission()
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL

      if (enabled) {
        inAppLogger.success('FCM', `푸시 알림 권한 승인됨: ${authStatus}`)
        return true
      } else {
        inAppLogger.error('FCM', `푸시 알림 권한 거부됨: ${authStatus}`)
        return false
      }
    } catch (error) {
      inAppLogger.error('FCM', '푸시 알림 권한 요청 실패', error)
      return false
    }
  }

  /**
   * FCM 토큰 획득
   */
  async getFCMToken(): Promise<string | null> {
    try {
      if (!this.fcmToken) {
        // iOS 시뮬레이터에서는 APNS 토큰이 없어서 FCM 토큰을 생성할 수 없음
        if (__DEV__ && Platform.OS === 'ios') {
          // 개발 환경에서는 더 자세한 로그 출력
          try {
            this.fcmToken = await messaging().getToken()
            console.log('FCM 토큰:', this.fcmToken)
          } catch (devError: any) {
            if (devError.code === 'messaging/unknown' && devError.message.includes('APNS token')) {
              console.warn('⚠️ iOS 시뮬레이터에서는 푸시 알림이 지원되지 않습니다. 실제 기기에서 테스트해주세요.')
              return null
            }
            throw devError
          }
        } else {
          this.fcmToken = await messaging().getToken()
          console.log('FCM 토큰:', this.fcmToken)
        }
      }
      return this.fcmToken
    } catch (error) {
      console.error('FCM 토큰 획득 실패:', error)
      return null
    }
  }

  /**
   * 토큰 새로고침 리스너 등록
   */
  onTokenRefresh(callback: (token: string) => void): () => void {
    return messaging().onTokenRefresh((token) => {
      this.fcmToken = token
      console.log('FCM 토큰이 새로고침되었습니다:', token)
      callback(token)
    })
  }

  /**
   * 알림 리스너 설정
   */
  setNotificationListeners(listeners: NotificationListenerProps) {
    this.listeners = listeners
  }

  /**
   * 포그라운드 메시지 리스너 등록
   */
  onForegroundMessage(): () => void {
    return messaging().onMessage(async (remoteMessage) => {
      console.log('포그라운드에서 메시지 수신:', remoteMessage)
      
      const notification = this.parseNotification(remoteMessage)
      
      // 포그라운드에서는 시스템 알림이 자동으로 표시되지 않으므로
      // 사용자 정의 알림을 표시해야 합니다
      this.showForegroundNotification(notification)
      
      if (this.listeners.onNotificationReceived) {
        this.listeners.onNotificationReceived(notification)
      }
    })
  }

  /**
   * 백그라운드/종료 상태에서 알림 탭으로 앱이 열렸을 때
   */
  onNotificationOpenedApp(): () => void {
    return messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('백그라운드 알림으로 앱이 열렸습니다:', remoteMessage)
      
      const notification = this.parseNotification(remoteMessage)
      
      if (this.listeners.onNotificationOpenedApp) {
        this.listeners.onNotificationOpenedApp(notification)
      }
    })
  }

  /**
   * 앱이 종료된 상태에서 알림으로 앱이 열렸는지 확인
   */
  async checkInitialNotification(): Promise<PushNotificationProps | null> {
    try {
      const remoteMessage = await messaging().getInitialNotification()
      if (remoteMessage) {
        console.log('앱이 종료된 상태에서 알림으로 열렸습니다:', remoteMessage)
        return this.parseNotification(remoteMessage)
      }
      return null
    } catch (error) {
      console.error('초기 알림 확인 실패:', error)
      return null
    }
  }

  /**
   * 포그라운드에서 커스텀 알림 표시
   */
  private showForegroundNotification(notification: PushNotificationProps) {
    if (Platform.OS === 'ios') {
      // iOS에서는 시스템 알림을 표시할 수 있습니다
      Alert.alert(
        notification.title || '알림',
        notification.body || '',
        [{ text: '확인', style: 'default' }],
        { cancelable: true }
      )
    } else {
      // Android에서는 커스텀 알림 컴포넌트를 사용하거나
      // react-native-push-notification 등을 사용할 수 있습니다
      Alert.alert(
        notification.title || '알림',
        notification.body || '',
        [{ text: '확인', style: 'default' }],
        { cancelable: true }
      )
    }
  }

  /**
   * Firebase 메시지를 앱 내 알림 형식으로 변환
   */
  private parseNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage): PushNotificationProps {
    return {
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data || {},
    }
  }

  /**
   * 서비스 초기화
   */
  async initialize(): Promise<boolean> {
    try {
      inAppLogger.info('FCM', '푸시 알림 서비스 초기화 시작')

      // iOS에서 원격 메시지 등록 (iOS 필수)
      if (Platform.OS === 'ios') {
        inAppLogger.info('FCM', 'iOS 원격 메시지 등록 중...')
        try {
          await messaging().registerDeviceForRemoteMessages()
          inAppLogger.success('FCM', 'iOS 원격 메시지 등록 성공')
        } catch (registerError) {
          inAppLogger.error('FCM', 'iOS 원격 메시지 등록 실패', registerError)
          return false
        }
      }

      // 권한 요청
      inAppLogger.info('FCM', '푸시 알림 권한 요청 중...')
      const hasPermission = await this.requestPermission()
      if (!hasPermission) {
        inAppLogger.error('FCM', '푸시 알림 권한이 없어서 초기화 중단')
        return false
      }

      // FCM 토큰 획득
      inAppLogger.info('FCM', 'FCM 토큰 획득 시도 중...')
      const token = await this.getFCMToken()
      if (!token) {
        if (__DEV__ && Platform.OS === 'ios') {
          inAppLogger.warn('FCM', '시뮬레이터에서 FCM 토큰 획득 실패 (정상)')
        } else {
          inAppLogger.error('FCM', 'FCM 토큰 획득 실패')
          return false
        }
      } else {
        inAppLogger.success('FCM', `FCM 토큰 획득 성공: ${token.substring(0, 20)}...`)
      }

      // 백그라운드 메시지 핸들러 설정
      inAppLogger.info('FCM', '백그라운드 메시지 핸들러 설정 중...')
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        inAppLogger.info('FCM', '백그라운드에서 메시지 수신', remoteMessage)
      })
      inAppLogger.success('FCM', '백그라운드 메시지 핸들러 설정 완료')

      inAppLogger.success('FCM', '✨ 푸시 알림 서비스 초기화 완료 ✨')
      return true
    } catch (error) {
      inAppLogger.error('FCM', '푸시 알림 서비스 초기화 실패', error)
      return false
    }
  }

  /**
   * 구독 해제
   */
  cleanup() {
    this.fcmToken = null
    this.listeners = {}
  }
}

export default PushNotificationService