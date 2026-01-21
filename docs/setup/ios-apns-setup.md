# iOS APNs (Apple Push Notification service) 설정 가이드

이 가이드는 React Native Firebase 앱에서 iOS 푸시 알림을 설정하는 방법을 단계별로 설명합니다.

## 📋 사전 요구사항

- Apple Developer Program 계정 ($99/year)
- Mac 컴퓨터 (Xcode 실행 필요)
- Xcode 최신 버전
- 실제 iOS 기기 (시뮬레이터는 푸시 알림을 지원하지 않음)

## 🔑 1단계: Apple Developer Portal 설정

### 1.1 App ID 생성 또는 확인

1. [Apple Developer Portal](https://developer.apple.com/account)에 로그인
2. **Certificates, Identifiers & Profiles** 선택
3. **Identifiers** → **App IDs** 선택
4. 기존 App ID 확인 또는 새로 생성:
   - **Bundle ID**: `com.mmecoco.starter` (app.config.ts에 설정된 값과 동일해야 함)
   - **Capabilities**에서 **Push Notifications** 체크박스 활성화

### 1.2 APNs 인증 키 생성

푸시 알림을 위한 인증 키를 생성합니다 (권장 방법):

1. **Keys** 섹션으로 이동
2. **+** 버튼 클릭
3. Key 이름 입력 (예: "Push Notification Key")
4. **Apple Push Notifications service (APNs)** 체크
5. **Continue** → **Register** 클릭
6. **Download** 버튼으로 `.p8` 파일 다운로드
7. **Key ID** 기록 (나중에 Firebase에서 필요)

⚠️ **중요**: `.p8` 파일은 한 번만 다운로드할 수 있습니다. 안전한 곳에 백업하세요!

### 1.3 Team ID 확인

1. Apple Developer Portal 우측 상단에서 **Membership** 클릭
2. **Team ID** 기록 (Firebase 설정에 필요)

## 🔥 2단계: Firebase Console 설정

### 2.1 APNs 인증 키 업로드

1. [Firebase Console](https://console.firebase.google.com/) 로그인
2. 프로젝트 선택
3. **프로젝트 설정** (톱니바퀴 아이콘) → **클라우드 메시징** 탭
4. **Apple 앱 구성** 섹션에서:
   - **APNs 인증 키** 선택
   - **업로드** 클릭하여 `.p8` 파일 선택
   - **Key ID** 입력
   - **Team ID** 입력
5. **업로드** 클릭

### 2.2 GoogleService-Info.plist 다운로드

1. Firebase Console → **프로젝트 설정** → **일반** 탭
2. **iOS 앱** 섹션에서 `GoogleService-Info.plist` 다운로드
3. 프로젝트 루트 디렉토리에 파일 배치
   ```
   /Users/mmecoco/Desktop/fast-matching/GoogleService-Info.plist
   ```

## 📱 3단계: Xcode 프로젝트 설정

### 3.1 Signing & Capabilities

1. Xcode에서 프로젝트 열기:
   ```bash
   cd /Users/mmecoco/Desktop/fast-matching/ios
   open fastmatching.xcworkspace
   ```

2. 프로젝트 네비게이터에서 프로젝트 선택
3. **Signing & Capabilities** 탭
4. **+ Capability** 클릭 → **Push Notifications** 추가
5. **+ Capability** 클릭 → **Background Modes** 추가
   - **Remote notifications** 체크박스 활성화

### 3.2 Provisioning Profile 설정

1. **Signing** 섹션에서:
   - **Team** 선택 (Apple Developer 계정)
   - **Automatically manage signing** 체크 (권장)
   - Bundle Identifier 확인: `com.mmecoco.starter`

## 🛠️ 4단계: 로컬 개발 환경 설정

### 4.1 의존성 설치

```bash
cd /Users/mmecoco/Desktop/fast-matching
npm install
```

### 4.2 iOS Pods 설치

```bash
cd ios
pod install
cd ..
```

### 4.3 Prebuild 실행

```bash
npx expo prebuild --clean
```

이 명령은 app.config.ts의 설정을 네이티브 프로젝트에 반영합니다.

## 🧪 5단계: 테스트

### 5.1 실제 기기에서 빌드

```bash
npm run ios
```

또는 Xcode에서:
1. 상단에서 실제 기기 선택 (시뮬레이터 X)
2. **Product** → **Run** (⌘R)

### 5.2 권한 요청 확인

앱 실행 시 푸시 알림 권한 요청 팝업이 표시되어야 합니다.

### 5.3 FCM 토큰 확인

개발 중에는 콘솔에서 FCM 토큰이 출력되는지 확인:

```typescript
// 예상 로그
console.log('FCM Token:', token);
```

### 5.4 테스트 알림 전송

Firebase Console에서 테스트 알림 전송:
1. **Cloud Messaging** → **새 캠페인** → **알림 메시지**
2. 알림 제목/본문 입력
3. **테스트 메시지 전송**
4. FCM 토큰 입력 → **테스트**

## 🔍 문제 해결

### Push Notifications capability가 표시되지 않는 경우

**원인**: App ID에 Push Notifications이 활성화되지 않음

**해결**:
1. Apple Developer Portal → Identifiers → App ID 확인
2. Push Notifications capability 활성화
3. Xcode에서 **Clean Build Folder** (⇧⌘K)
4. 다시 빌드

### "No valid 'aps-environment' entitlement" 오류

**원인**: Provisioning Profile에 Push Notifications가 포함되지 않음

**해결**:
1. Xcode → **Signing & Capabilities**
2. **Automatically manage signing** 비활성화 후 재활성화
3. Provisioning Profile 재생성

### GoogleService-Info.plist를 찾을 수 없음

**원인**: 파일 경로가 잘못됨

**해결**:
1. `GoogleService-Info.plist`가 프로젝트 루트에 있는지 확인
2. app.config.ts의 경로 확인:
   ```typescript
   ios: {
     googleServicesFile: "./GoogleService-Info.plist",
   }
   ```

### 실제 기기에서 알림을 받지 못함

**해결 체크리스트**:
- [ ] Apple Developer Portal에서 Push Notifications capability 활성화
- [ ] Firebase Console에 APNs 인증 키 업로드 완료
- [ ] Xcode에서 Push Notifications capability 추가
- [ ] Xcode에서 Background Modes > Remote notifications 활성화
- [ ] 앱이 백그라운드 또는 종료 상태인지 확인 (포그라운드는 별도 처리 필요)
- [ ] 실제 기기 사용 (시뮬레이터는 지원 안 함)
- [ ] 알림 권한 허용됨

## 📚 참고 자료

- [Apple Developer Documentation - APNs](https://developer.apple.com/documentation/usernotifications)
- [Firebase Cloud Messaging - iOS Setup](https://firebase.google.com/docs/cloud-messaging/ios/client)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Firebase - Messaging](https://rnfirebase.io/messaging/usage)

## 🔐 보안 주의사항

- `.p8` APNs 인증 키 파일을 Git에 커밋하지 마세요
- `GoogleService-Info.plist` 파일을 Git에 커밋하지 마세요 (민감 정보 포함)
- 프로덕션과 개발 환경을 분리하여 관리하세요
- APNs 인증 키는 안전한 곳에 백업하세요 (재다운로드 불가)

## ✅ 체크리스트

설정 완료 전 확인 사항:

- [ ] Apple Developer Program 계정 활성화
- [ ] App ID에 Push Notifications capability 활성화
- [ ] APNs 인증 키 (.p8) 생성 및 다운로드
- [ ] Firebase Console에 APNs 인증 키 업로드
- [ ] GoogleService-Info.plist 파일 프로젝트에 추가
- [ ] Xcode에서 Push Notifications capability 추가
- [ ] Xcode에서 Background Modes > Remote notifications 활성화
- [ ] 실제 기기에서 빌드 및 테스트 성공
- [ ] 알림 권한 요청 팝업 확인
- [ ] FCM 토큰 발급 확인
- [ ] Firebase Console에서 테스트 알림 수신 확인
