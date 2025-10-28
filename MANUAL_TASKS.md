# 📋 Phase 3 수동 작업 목록

**생성일**: 2025-10-28
**마지막 업데이트**: 2025-10-28
**목적**: AI가 직접 수행할 수 없는 외부 작업들을 정리

이 파일은 Phase 3 아키텍처 개선 작업 중 사용자가 직접 수행해야 하는 작업들을 정리한 것입니다.

---

## ✅ 완료된 작업 (2025-10-28)

### 패키지 설치 완료
```bash
npm install  # 성공적으로 완료
```

**해결된 버전 충돌**:
1. **Firebase 패키지 통일** (23.4.1 → 22.4.0)
   - `@react-native-firebase/messaging`: 22.4.0
   - `@react-native-firebase/perf`: 22.4.0
   - `@react-native-firebase/storage`: 22.4.0

2. **i18next 업그레이드** (23.14.0 → 25.4.1)
   - `react-i18next@15.7.3`이 요구하는 버전

3. **@testing-library/react-hooks 제거**
   - React 19와 호환되지 않음
   - React 18+ 이후로는 불필요

**설치된 패키지**:
- ✅ zustand@5.0.8
- ✅ @testing-library/react-native@13.3.3
- ✅ @testing-library/jest-native@5.4.3
- ✅ jest-expo@53.0.7

**TypeScript 검증**:
- ✅ 모든 Phase 3 파일 컴파일 성공
- ✅ `secondary600` 색상 토큰 수정 완료

---

## 🔧 필수 패키지 설치

### 1. 테스트 프레임워크 설치

#### 단위 테스트 (Jest + React Native Testing Library)
```bash
# Jest 및 Testing Library 설치
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo

# TypeScript 지원
npm install --save-dev @types/jest

# 추가 유틸리티
npm install --save-dev @testing-library/react-hooks
```

**설정 파일**: AI가 `jest.config.js` 및 `setupTests.ts` 생성 예정

#### E2E 테스트 (Detox 권장)
```bash
# Detox 설치
npm install --save-dev detox
npx detox init

# iOS 시뮬레이터 설정 (macOS만 해당)
xcode-select --install
```

**설정 파일**: AI가 `.detoxrc.js` 생성 예정

**⚠️ 주의**: Detox는 네이티브 빌드가 필요하므로 실제 디바이스/시뮬레이터 설정 필요

---

### 2. 디자인 시스템 도구 설치

#### Storybook (컴포넌트 문서화)
```bash
# Storybook 설치 (React Native용)
npx storybook@latest init --type react_native_server

# 추가 애드온
npm install --save-dev @storybook/addon-essentials @storybook/addon-react-native-web
```

**설정 파일**: AI가 `.storybook/` 디렉토리 설정 예정

**실행 방법**:
```bash
# Storybook 서버 시작
npm run storybook

# 앱에서 Storybook 확인 (개발 모드)
npm start
```

---

### 3. 상태 관리 라이브러리 설치

#### Zustand (권장)
```bash
# Zustand 설치 (경량, 간단)
npm install zustand

# Redux Toolkit 대안 (더 강력하지만 복잡)
npm install @reduxjs/toolkit react-redux
```

**선택 기준**:
- **Zustand**: 간단한 전역 상태, 빠른 개발
- **Redux Toolkit**: 복잡한 상태 로직, 미들웨어 필요

---

### 4. 모니터링 및 분석 도구 설치

#### Firebase Performance Monitoring
```bash
# Firebase Performance SDK 설치
npm install @react-native-firebase/perf

# iOS 추가 설정 (CocoaPods)
cd ios && pod install && cd ..
```

**Firebase Console 설정**:
1. Firebase Console → Performance 섹션 활성화
2. 프로젝트 설정에서 Performance Monitoring 활성화
3. 앱 재빌드 필요

#### Sentry (에러 추적, 선택사항)
```bash
# Sentry 설치
npm install @sentry/react-native

# CLI 도구 설치
npm install --save-dev @sentry/cli

# 프로젝트 설정
npx @sentry/wizard -i reactNative
```

**Sentry 계정 필요**: https://sentry.io/signup/

---

### 5. 접근성 테스트 도구 설치

#### Accessibility Testing
```bash
# React Native Accessibility 검사 도구
npm install --save-dev @react-native-community/eslint-plugin-accessibility

# Axe-core (웹 기반 접근성 테스트)
npm install --save-dev axe-core @axe-core/react
```

---

## 🔐 Firebase 설정 작업

### 1. Firebase Performance Monitoring 활성화

**Firebase Console 작업**:
1. https://console.firebase.google.com/ 접속
2. 프로젝트 선택
3. 좌측 메뉴 → Performance 클릭
4. "시작하기" 버튼 클릭
5. 앱에 Performance SDK 추가 확인

### 2. Firebase Security Rules 배포

AI가 업데이트한 `firestore.rules` 파일을 Firebase에 배포:

```bash
# Firebase CLI 로그인 (최초 1회)
firebase login

# Security Rules 배포
firebase deploy --only firestore:rules

# 인덱스도 함께 배포
firebase deploy --only firestore:indexes,firestore:rules
```

### 3. Cloud Functions 설정 (모니터링용)

```bash
# Firebase Functions 초기화 (선택사항)
firebase init functions

# Functions 배포
firebase deploy --only functions
```

---

## 📱 네이티브 빌드 설정

### iOS 설정

#### CocoaPods 업데이트
```bash
cd ios
pod install
cd ..
```

#### Xcode 프로젝트 설정
1. Xcode에서 `ios/*.xcworkspace` 열기
2. Signing & Capabilities 탭 확인
3. Performance Monitoring 권한 확인

### Android 설정

#### Gradle 동기화
```bash
cd android
./gradlew clean
./gradlew build
cd ..
```

#### ProGuard 규칙 추가 (릴리즈 빌드)
AI가 `android/app/proguard-rules.pro` 업데이트 예정

---

## 🚀 CI/CD 파이프라인 설정

### GitHub Actions (권장)

#### 1. Secrets 설정
GitHub 저장소 → Settings → Secrets and variables → Actions

필요한 Secrets:
- `FIREBASE_TOKEN`: Firebase CLI 토큰
- `SENTRY_AUTH_TOKEN`: Sentry 인증 토큰 (선택)
- `APPLE_CERTIFICATE`: iOS 서명 인증서 (선택)
- `GOOGLE_SERVICES_JSON`: Android google-services.json

#### 2. Workflow 파일
AI가 `.github/workflows/ci.yml` 생성 예정

#### 3. 첫 실행
```bash
git add .github/workflows/ci.yml
git commit -m "Add CI/CD workflow"
git push
```

---

## 🔍 모니터링 대시보드 설정

### 1. Firebase Console 대시보드

**설정 방법**:
1. Firebase Console → Analytics
2. 커스텀 이벤트 정의
3. 대시보드 위젯 추가

**추천 메트릭**:
- 앱 시작 시간
- 화면 전환 시간
- API 응답 시간
- 에러 발생률

### 2. Sentry 대시보드 (선택사항)

**설정 방법**:
1. https://sentry.io 로그인
2. 프로젝트 생성
3. 알림 규칙 설정
4. Slack/Email 통합

---

## 🧪 테스트 실행 환경 설정

### iOS 시뮬레이터 설정
```bash
# 사용 가능한 시뮬레이터 확인
xcrun simctl list devices

# 새 시뮬레이터 생성 (선택사항)
xcrun simctl create "Test iPhone 14" "iPhone 14"
```

### Android 에뮬레이터 설정
```bash
# Android Studio → AVD Manager
# 또는 명령줄:
$ANDROID_HOME/tools/bin/avdmanager create avd \
  -n "Test_Pixel_6" \
  -k "system-images;android-33;google_apis;arm64-v8a"
```

---

## 📊 성능 벤치마크 환경 설정

### 1. 릴리즈 빌드 생성

#### iOS
```bash
npx react-native run-ios --configuration Release
```

#### Android
```bash
npx react-native run-android --variant=release
```

### 2. 프로파일링 도구

#### React DevTools Profiler
```bash
npm install --save-dev react-devtools
npx react-devtools
```

#### Flipper (선택사항)
```bash
# Flipper 앱 다운로드
# https://fbflipper.com/

# 플러그인 설치
npm install --save-dev react-native-flipper
```

---

## 🔧 개발 도구 설정

### VS Code 확장 프로그램 설치

**필수**:
- ESLint
- Prettier
- Jest Runner
- React Native Tools

**권장**:
- GitLens
- Error Lens
- Import Cost

### ESLint 및 Prettier 설정

AI가 `.eslintrc.js` 및 `.prettierrc` 업데이트 예정

자동 포매팅 설정:
```bash
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

---

## 🗂️ 프로젝트 구조 업데이트

### 새로운 디렉토리 생성

AI가 다음 디렉토리들을 자동 생성할 예정이지만, 필요시 수동 생성:

```bash
mkdir -p app/stores           # 상태 관리
mkdir -p app/design-system    # 디자인 시스템
mkdir -p app/services/monitoring  # 모니터링
mkdir -p app/__tests__        # 테스트 파일
mkdir -p .storybook           # Storybook 설정
```

---

## ✅ 작업 완료 체크리스트

완료한 작업에 체크 표시:

### 필수 설치
- [x] Jest 및 Testing Library 설치 ✅ (2025-10-28)
- [ ] Storybook 설치
- [x] Zustand 설치 ✅ (2025-10-28)
- [x] Firebase 패키지 버전 통일 ✅ (2025-10-28)

### Firebase 설정
- [ ] Performance Monitoring 활성화
- [ ] Security Rules 배포
- [ ] Firestore 인덱스 배포

### 네이티브 빌드
- [ ] iOS CocoaPods 업데이트
- [ ] Android Gradle 동기화
- [ ] 릴리즈 빌드 테스트

### CI/CD
- [ ] GitHub Secrets 설정
- [ ] CI Workflow 실행 확인

### 모니터링
- [ ] Firebase Console 대시보드 설정
- [ ] Sentry 설정 (선택사항)

### 테스트 환경
- [ ] iOS 시뮬레이터 설정
- [ ] Android 에뮬레이터 설정
- [ ] E2E 테스트 환경 구축

### 개발 도구
- [ ] VS Code 확장 프로그램 설치
- [ ] ESLint 및 Prettier 설정

---

## 📞 지원 및 문서

### 공식 문서
- **Storybook**: https://storybook.js.org/docs/react-native/get-started/introduction
- **Jest**: https://jestjs.io/docs/getting-started
- **Detox**: https://wix.github.io/Detox/docs/introduction/getting-started
- **Zustand**: https://docs.pmnd.rs/zustand/getting-started/introduction
- **Firebase Performance**: https://firebase.google.com/docs/perf-mon

### 문제 해결
- iOS 빌드 실패: `cd ios && pod install && cd ..`
- Android 빌드 실패: `cd android && ./gradlew clean && cd ..`
- Metro 캐시 문제: `npx react-native start --reset-cache`

---

**마지막 업데이트**: 2025-10-28
**담당**: Main Agent (Orchestrator)
**다음 단계**: AI가 코드 구현 및 설정 파일 생성 진행

