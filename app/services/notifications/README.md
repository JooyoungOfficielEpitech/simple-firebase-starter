# Notification Service Layer

푸시 알림 서비스 레이어 구현 문서

## 📁 파일 구조

```
app/services/notifications/
├── index.ts                    # Export 파일
├── notificationService.ts      # 알림 서비스 구현
├── notificationTypes.ts        # TypeScript 타입 정의
└── README.md                   # 이 문서
```

## 📦 구현된 기능

### 1. 알림 권한 관리

#### `requestPermissions()`
- iOS/Android 플랫폼별 권한 요청
- 알림, 사운드, 배지 권한 포함
- 반환값: `NotificationPermissionStatus` ("granted" | "denied" | "undetermined")

#### `getPermissionStatus()`
- 현재 알림 권한 상태 확인
- 앱 실행 시 권한 체크에 사용

### 2. FCM 토큰 관리

#### `getFCMToken()`
- Firebase Cloud Messaging 토큰 가져오기
- 사용자 인증 및 권한 확인 포함
- 반환값: `string | null`

#### `setupTokenRefreshListener()`
- FCM 토큰 새로고침 감지
- 토큰 변경 시 자동으로 Firestore 업데이트 가능

### 3. 로컬 알림

#### `scheduleLocalNotification(options)`
- 로컬 알림 예약 및 즉시 전송
- 옵션: 제목, 내용, 데이터, 트리거, 사운드, 배지

```typescript
await notificationService.scheduleLocalNotification({
  title: "새 메시지",
  body: "매칭된 사용자가 메시지를 보냈습니다",
  data: { type: "message", userId: "abc123" },
  trigger: { seconds: 5 }, // 5초 후 전송
})
```

#### `cancelLocalNotification(id)`
- 특정 알림 취소

#### `cancelAllLocalNotifications()`
- 모든 예약된 로컬 알림 취소

### 4. 원격 알림 핸들링

#### `setupForegroundNotificationListener(callback)`
- 앱이 포그라운드일 때 알림 수신 처리
- 콜백으로 `NotificationPayload` 전달

```typescript
const unsubscribe = notificationService.setupForegroundNotificationListener(
  (notification) => {
    console.log("포그라운드 알림:", notification.title)
  }
)

// 정리 시
unsubscribe()
```

#### `setupBackgroundMessageHandler()`
- 앱이 백그라운드일 때 FCM 메시지 처리
- 백그라운드 동기화, 로컬 알림 표시 등

#### `setupNotificationResponseListener(callback)`
- 사용자가 알림을 탭했을 때 처리
- 딥링킹 구현에 사용

```typescript
const unsubscribe = notificationService.setupNotificationResponseListener(
  (response) => {
    const data = response.notification.data
    // 딥링킹 처리
    if (data?.type === "message") {
      navigation.navigate("Chat", { userId: data.userId })
    }
  }
)
```

### 5. 배지 관리

#### `setBadgeCount(count)`
- 앱 아이콘 배지 카운트 설정

#### `clearBadge()`
- 배지 초기화 (0으로 설정)

#### `dismissAllNotifications()`
- 알림 센터의 모든 알림 제거

## 🔗 UserService 통합

`userService.ts`에 FCM 토큰 관리 함수 추가:

### `saveFCMToken(token, platform)`
- Firestore에 FCM 토큰 저장
- 플랫폼 정보 및 업데이트 시간 포함

```typescript
const token = await notificationService.getFCMToken()
if (token) {
  await userService.saveFCMToken(token, Platform.OS)
}
```

### `removeFCMToken()`
- 로그아웃 시 FCM 토큰 삭제
- 사용자가 더 이상 알림을 받지 않도록 처리

```typescript
await userService.removeFCMToken()
```

## 📘 TypeScript 타입

### NotificationPermissionStatus
```typescript
type NotificationPermissionStatus = "granted" | "denied" | "undetermined"
```

### LocalNotificationOptions
```typescript
interface LocalNotificationOptions {
  id?: string
  title: string
  body: string
  data?: Record<string, any>
  trigger?: NotificationTrigger
  sound?: string
  badge?: number
}
```

### NotificationTrigger
```typescript
interface NotificationTrigger {
  seconds?: number    // 초 단위 지연
  date?: Date        // 특정 날짜/시간
  repeats?: boolean  // 반복 여부
}
```

### FCMTokenData
```typescript
interface FCMTokenData {
  token: string
  platform: "ios" | "android"
  updatedAt: Date
}
```

### NotificationPayload
```typescript
interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, any>
}
```

### NotificationResponse
```typescript
interface NotificationResponse {
  notification: NotificationPayload
  actionIdentifier: string
  userText?: string
}
```

## 🎯 사용 예제

### 기본 설정 (앱 시작 시)

```typescript
import { notificationService } from "@/services/notifications"
import { userService } from "@/services/firestore"
import { Platform } from "react-native"

// 1. 권한 요청
const permissionStatus = await notificationService.requestPermissions()

if (permissionStatus === "granted") {
  // 2. FCM 토큰 가져오기
  const token = await notificationService.getFCMToken()

  if (token) {
    // 3. Firestore에 저장
    await userService.saveFCMToken(token, Platform.OS)
  }

  // 4. 포그라운드 알림 리스너 설정
  const unsubscribeForeground = notificationService.setupForegroundNotificationListener(
    (notification) => {
      console.log("알림 수신:", notification.title)
    }
  )

  // 5. 알림 응답 리스너 설정 (딥링킹)
  const unsubscribeResponse = notificationService.setupNotificationResponseListener(
    (response) => {
      const { type, ...data } = response.notification.data || {}

      if (type === "message") {
        navigation.navigate("Chat", data)
      } else if (type === "match") {
        navigation.navigate("MatchDetail", data)
      }
    }
  )

  // 정리
  return () => {
    unsubscribeForeground()
    unsubscribeResponse()
  }
}
```

### 로컬 알림 예약

```typescript
// 5초 후 알림
await notificationService.scheduleLocalNotification({
  title: "테스트 알림",
  body: "5초 후에 표시됩니다",
  trigger: { seconds: 5 },
})

// 특정 시간에 알림
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
tomorrow.setHours(9, 0, 0, 0) // 내일 오전 9시

await notificationService.scheduleLocalNotification({
  title: "일일 리마인더",
  body: "오늘의 매칭을 확인해보세요!",
  trigger: { date: tomorrow, repeats: true },
})
```

### 배지 관리

```typescript
// 배지 카운트 설정
await notificationService.setBadgeCount(5)

// 배지 초기화
await notificationService.clearBadge()

// 모든 알림 제거
await notificationService.dismissAllNotifications()
```

## 🛠️ 의존성

- `expo-notifications` - 로컬 알림 및 권한 관리
- `@react-native-firebase/messaging` - FCM 원격 알림
- `@react-native-firebase/firestore` - FCM 토큰 저장
- `@react-native-firebase/auth` - 현재 사용자 ID

## 📋 다음 단계

1. **NotificationContext 구현** (Phase 1.1.3)
   - React Context API로 알림 상태 관리
   - 전역 알림 리스너 설정
   - 알림 수신 시 UI 업데이트

2. **UI 컴포넌트 구현** (Phase 1.1.4)
   - 알림 권한 요청 화면
   - 알림 설정 화면
   - 알림 목록 화면

3. **딥링킹 구현** (Phase 1.2)
   - 알림 탭 시 화면 이동
   - URL 스킴 처리
   - 앱 상태별 네비게이션

## ⚠️ 주의사항

### iOS
- APNs 인증서 설정 필요
- `app.json`에 `"supportsTabletMultitasking": false` 설정 권장
- Info.plist에 권한 설명 추가 필요

### Android
- Android 13+ 런타임 권한 필요
- `google-services.json` 파일 필요
- Firebase Console에서 프로젝트 설정 완료

### 권한
- 사용자가 권한을 거부하면 설정 앱으로 유도 필요
- 권한 상태를 주기적으로 확인하여 UI 업데이트

### 성능
- 백그라운드 핸들러는 30초 내에 완료되어야 함
- 과도한 로컬 알림 예약은 성능 저하 가능
