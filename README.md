# Simple Firebase Starter

Firebase와 Google Authentication이 설정된 간단한 React Native + Expo 앱 스타터입니다.

## 🚀 기능

- ✅ Firebase Authentication (이메일/비밀번호, Google 로그인)
- ✅ Firebase Firestore 연동
- ✅ Firebase Analytics
- ✅ React Navigation (Bottom Tabs)
- ✅ i18n 다국어 지원
- ✅ 테마 시스템 (다크모드 지원)
- ✅ Expo Dev Client 지원

## 📱 화면 구성

- **로그인/회원가입**: Firebase Auth 기반 인증
- **홈 화면**: 기본 Welcome 화면
- **설정 화면**: 기본 설정 메뉴

## 🛠 설정 방법

### 1. 프로젝트 설정

```bash
cd simple-firebase-starter
npm install
```

### 2. Firebase 설정

1. Firebase 콘솔에서 새 프로젝트 생성
2. `google-services.json` (Android) 및 `GoogleService-Info.plist` (iOS) 파일 교체
3. `.env` 파일 생성하고 환경 변수 설정:

```bash
cp .env.example .env
```

`.env` 파일에서 다음 값들을 설정:
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: Google Web Client ID

### 3. iOS 빌드

```bash
npm run ios
```

## 📁 프로젝트 구조

```
app/
├── components/          # 재사용 가능한 컴포넌트
├── context/            # React Context (AuthContext 등)
├── i18n/              # 다국어 번역 파일
├── navigators/        # React Navigation 설정
├── screens/           # 화면 컴포넌트
├── services/          # Firebase 서비스
├── theme/             # 테마 및 스타일 시스템
└── types/             # TypeScript 타입 정의
```

## 🔧 개발

- `npm start`: Expo Dev Server 시작
- `npm run ios`: iOS 시뮬레이터에서 실행
- `npm run android`: Android 에뮬레이터에서 실행
- `npm run lint`: ESLint 실행
- `npm run compile`: TypeScript 타입 체크

## 📦 주요 의존성

- **React Native**: 0.79.5
- **Expo**: 53.0.20
- **Firebase**: ^22.4.0
- **React Navigation**: ^7.x
- **TypeScript**: ~5.8.3

## 🎯 새로운 앱 만들기

이 스타터 템플릿을 기반으로 새로운 앱을 만들려면:

1. 프로젝트명 변경 (`package.json`)
2. Firebase 프로젝트 설정
3. 필요한 화면 및 기능 추가
4. 테마 및 스타일 커스터마이징

## 📝 라이센스

MIT License