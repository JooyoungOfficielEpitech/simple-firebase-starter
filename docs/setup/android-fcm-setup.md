# Android FCM (Firebase Cloud Messaging) 설정 가이드

이 가이드는 React Native Firebase 앱에서 Android 푸시 알림을 설정하는 방법을 단계별로 설명합니다.

## 📋 사전 요구사항

- Firebase 프로젝트 생성 완료
- Android Studio 설치
- 실제 Android 기기 또는 에뮬레이터 (Google Play Services 포함)
- Google 계정

## 🔥 1단계: Firebase Console 설정

### 1.1 Firebase 프로젝트에 Android 앱 추가

1. [Firebase Console](https://console.firebase.google.com/) 로그인
2. 프로젝트 선택
3. **프로젝트 개요** → **Android 앱 추가** 클릭

### 1.2 앱 등록

다음 정보를 입력:

- **Android 패키지 이름**: `com.mmecoco.starter`
  - ⚠️ **중요**: app.config.ts의 `android.package`와 정확히 일치해야 함
  - 대소문자 구분
  - 일단 등록하면 변경 불가

- **앱 닉네임** (선택사항): `Fast Matching` 또는 원하는 이름

- **디버그 서명 인증서 SHA-1** (선택사항, 나중에 추가 가능):
  ```bash
  # macOS/Linux
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

  # SHA-1 값을 복사하여 Firebase Console에 입력
  ```

### 1.3 google-services.json 다운로드

1. **앱 등록** 버튼 클릭
2. `google-services.json` 파일 다운로드
3. 프로젝트 루트 디렉토리에 파일 배치:
   ```
   /Users/mmecoco/Desktop/fast-matching/google-services.json
   ```

⚠️ **중요**: 이 파일에는 API 키와 프로젝트 정보가 포함되어 있으므로 Git에 커밋하지 마세요!

### 1.4 Firebase SDK 추가 (이미 완료됨)

프로젝트에 이미 Firebase 설정이 완료되어 있으므로 이 단계는 건너뜁니다.

## 📱 2단계: Android 프로젝트 설정

### 2.1 google-services.json 파일 확인

프로젝트 루트에 `google-services.json` 파일이 있는지 확인:

```bash
ls -la /Users/mmecoco/Desktop/fast-matching/google-services.json
```

app.config.ts에서 파일 경로가 올바르게 설정되어 있는지 확인:

```typescript
android: {
  package: "com.mmecoco.starter",
  googleServicesFile: "./google-services.json",
}
```

### 2.2 AndroidManifest.xml 설정

Firebase 및 Expo는 자동으로 필요한 권한과 서비스를 추가하지만, 확인차 체크:

```xml
<!-- android/app/src/main/AndroidManifest.xml -->

<manifest>
  <!-- 인터넷 권한 (기본적으로 포함) -->
  <uses-permission android:name="android.permission.INTERNET" />

  <!-- 푸시 알림 권한 (Android 13+) -->
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

  <application>
    <!-- Firebase Cloud Messaging 서비스 (자동 추가) -->
    <service
      android:name="com.google.firebase.messaging.FirebaseMessagingService"
      android:exported="false">
      <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
      </intent-filter>
    </service>

    <!-- 알림 아이콘 (선택사항) -->
    <meta-data
      android:name="com.google.firebase.messaging.default_notification_icon"
      android:resource="@drawable/notification_icon" />

    <!-- 알림 색상 (선택사항) -->
    <meta-data
      android:name="com.google.firebase.messaging.default_notification_color"
      android:resource="@color/notification_color" />
  </application>
</manifest>
```

### 2.3 알림 아이콘 및 색상 설정 (선택사항)

알림 아이콘 커스터마이징을 원하는 경우:

1. **알림 아이콘 준비**:
   - 투명 배경, 흰색 아이콘
   - 여러 해상도 준비 (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
   - 파일명: `notification_icon.png`

2. **아이콘 파일 배치**:
   ```
   android/app/src/main/res/
   ├── drawable-mdpi/notification_icon.png    (24x24px)
   ├── drawable-hdpi/notification_icon.png    (36x36px)
   ├── drawable-xhdpi/notification_icon.png   (48x48px)
   ├── drawable-xxhdpi/notification_icon.png  (72x72px)
   └── drawable-xxxhdpi/notification_icon.png (96x96px)
   ```

3. **색상 정의**:
   ```xml
   <!-- android/app/src/main/res/values/colors.xml -->
   <resources>
     <color name="notification_color">#FFFFFF</color>
   </resources>
   ```

## 🛠️ 3단계: 로컬 개발 환경 설정

### 3.1 의존성 설치

```bash
cd /Users/mmecoco/Desktop/fast-matching
npm install
```

### 3.2 Prebuild 실행

app.config.ts의 설정을 네이티브 프로젝트에 반영:

```bash
npx expo prebuild --clean
```

이 명령은:
- google-services.json을 android/app/ 디렉토리로 복사
- 필요한 Firebase 플러그인 설정 적용
- AndroidManifest.xml 업데이트

### 3.3 Android 프로젝트 빌드

```bash
npm run android
```

또는 Android Studio에서:
1. `android` 폴더를 Android Studio로 열기
2. **Build** → **Make Project**
3. 에뮬레이터 또는 실제 기기 선택
4. **Run** 버튼 클릭

## 🧪 4단계: 테스트

### 4.1 권한 요청 확인 (Android 13+)

Android 13 (API 33) 이상에서는 런타임 권한 요청이 필요합니다:

```typescript
// 앱 실행 시 알림 권한 요청 확인
import * as Notifications from 'expo-notifications';

const { status } = await Notifications.requestPermissionsAsync();
```

### 4.2 FCM 토큰 확인

개발 중에는 콘솔에서 FCM 토큰이 출력되는지 확인:

```typescript
// 예상 로그
console.log('FCM Token:', token);
```

### 4.3 테스트 알림 전송

#### Firebase Console에서 전송

1. Firebase Console → **Cloud Messaging** → **새 캠페인**
2. **알림 메시지** 선택
3. 알림 정보 입력:
   - **알림 제목**: "테스트 알림"
   - **알림 텍스트**: "푸시 알림 테스트입니다"
4. **다음** 클릭
5. **타겟** 선택:
   - **사용자 세그먼트**: Android 앱 선택
   - 또는 **테스트 메시지 전송**으로 FCM 토큰 직접 입력
6. **검토** → **게시**

#### 명령줄에서 전송 (고급)

```bash
# FCM HTTP v1 API 사용
curl -X POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "YOUR_DEVICE_FCM_TOKEN",
      "notification": {
        "title": "테스트 알림",
        "body": "FCM 테스트입니다"
      }
    }
  }'
```

### 4.4 알림 수신 확인

- **포그라운드**: 앱 내 알림 핸들러 동작
- **백그라운드**: 시스템 트레이에 알림 표시
- **종료 상태**: 시스템 트레이에 알림 표시, 탭하면 앱 실행

## 🔍 문제 해결

### google-services.json을 찾을 수 없음

**원인**: 파일 경로가 잘못됨

**해결**:
1. `google-services.json`이 프로젝트 루트에 있는지 확인
2. app.config.ts의 경로 확인:
   ```typescript
   android: {
     googleServicesFile: "./google-services.json",
   }
   ```
3. `npx expo prebuild --clean` 다시 실행

### 패키지 이름 불일치 오류

**원인**: google-services.json의 패키지 이름과 앱의 패키지 이름이 다름

**해결**:
1. `google-services.json` 파일 열기
2. `package_name` 확인: `"com.mmecoco.starter"`
3. app.config.ts의 `android.package`와 일치하는지 확인
4. 불일치 시 Firebase Console에서 앱 재등록 또는 패키지 이름 수정

### 알림을 받지 못함

**해결 체크리스트**:
- [ ] `google-services.json` 파일이 올바른 위치에 있음
- [ ] Firebase Console에서 Android 앱 등록 완료
- [ ] `npx expo prebuild --clean` 실행 완료
- [ ] 앱 재빌드 및 재설치 완료
- [ ] 기기/에뮬레이터에 Google Play Services 설치됨
- [ ] 인터넷 연결 활성화
- [ ] Android 13+의 경우 알림 권한 허용됨
- [ ] FCM 토큰이 정상적으로 발급됨 (콘솔 확인)

### Google Play Services 오류

**원인**: 에뮬레이터에 Google Play Services가 설치되지 않음

**해결**:
1. Android Studio → **AVD Manager**
2. **Play Store** 아이콘이 있는 에뮬레이터 이미지 선택
3. 또는 실제 Android 기기 사용

### 빌드 실패: "Execution failed for task ':app:processDebugGoogleServices'"

**원인**: google-services.json 파일 형식 오류 또는 패키지 이름 불일치

**해결**:
1. Firebase Console에서 `google-services.json` 재다운로드
2. 파일 내용이 유효한 JSON인지 확인
3. `android/app/google-services.json` 파일 삭제 후 `npx expo prebuild --clean` 재실행

## 📊 고급 설정

### 알림 채널 설정 (Android 8.0+)

Android 8.0 (API 26) 이상에서는 알림 채널이 필수입니다:

```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}
```

### 데이터 메시지 vs 알림 메시지

FCM은 두 가지 메시지 타입을 지원합니다:

#### 알림 메시지 (Notification Message)
```json
{
  "message": {
    "token": "FCM_TOKEN",
    "notification": {
      "title": "제목",
      "body": "내용"
    }
  }
}
```
- 시스템이 자동으로 표시
- 백그라운드에서도 표시

#### 데이터 메시지 (Data Message)
```json
{
  "message": {
    "token": "FCM_TOKEN",
    "data": {
      "customKey": "customValue"
    }
  }
}
```
- 앱에서 직접 처리 필요
- 포그라운드에서만 수신

#### 혼합 메시지 (권장)
```json
{
  "message": {
    "token": "FCM_TOKEN",
    "notification": {
      "title": "제목",
      "body": "내용"
    },
    "data": {
      "screen": "ChatScreen",
      "chatId": "123"
    }
  }
}
```

### SHA-1 인증서 추가 (선택사항)

Google Sign-In 등을 사용하는 경우 필요:

1. **디버그 인증서 SHA-1 가져오기**:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
   ```

2. **릴리스 인증서 SHA-1 가져오기**:
   ```bash
   keytool -list -v -keystore /path/to/release.keystore -alias YOUR_ALIAS
   ```

3. **Firebase Console에 추가**:
   - **프로젝트 설정** → **Android 앱**
   - **SHA 인증서 지문 추가** 클릭
   - SHA-1 값 입력 → **저장**

## 📚 참고 자료

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Firebase - Messaging](https://rnfirebase.io/messaging/usage)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)

## 🔐 보안 주의사항

- `google-services.json` 파일을 Git에 커밋하지 마세요 (API 키 포함)
- `.gitignore`에 추가:
  ```
  # Firebase
  google-services.json
  GoogleService-Info.plist
  ```
- 프로덕션과 개발 환경을 분리하여 관리 (별도의 Firebase 프로젝트)
- FCM 서버 키를 안전하게 보관 (Firebase Console → 프로젝트 설정 → 클라우드 메시징)

## ✅ 체크리스트

설정 완료 전 확인 사항:

- [ ] Firebase 프로젝트 생성 완료
- [ ] Firebase Console에 Android 앱 등록 (패키지 이름: `com.mmecoco.starter`)
- [ ] `google-services.json` 파일 다운로드 및 프로젝트 루트에 배치
- [ ] app.config.ts에 `android.googleServicesFile` 경로 설정
- [ ] `npx expo prebuild --clean` 실행 완료
- [ ] Android 프로젝트 빌드 성공
- [ ] 실제 기기 또는 Google Play Services 포함 에뮬레이터 사용
- [ ] Android 13+의 경우 알림 권한 허용 확인
- [ ] FCM 토큰 발급 확인 (콘솔 로그)
- [ ] Firebase Console에서 테스트 알림 수신 확인
- [ ] 포그라운드/백그라운드/종료 상태에서 알림 수신 테스트

## 🚀 다음 단계

Android FCM 설정이 완료되었습니다! 이제 다음 단계를 진행하세요:

1. **Phase 1.1.2**: 푸시 알림 초기화 및 권한 요청 로직 구현
2. **Phase 1.1.3**: FCM 토큰 관리 시스템 구현
3. **Phase 1.2**: 알림 수신 처리 로직 구현
