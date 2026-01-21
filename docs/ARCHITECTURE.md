# Architecture Overview

## 프로젝트 구조

```
fast-matching/
├── app/                          # 메인 애플리케이션 코드
│   ├── components/               # 재사용 가능한 UI 컴포넌트
│   │   ├── chat/                 # 채팅 관련 컴포넌트
│   │   ├── payment/              # 결제 관련 컴포넌트
│   │   ├── Toggle/               # 토글 컴포넌트 (Checkbox, Radio, Switch)
│   │   └── Icons/                # 커스텀 아이콘 컴포넌트
│   ├── config/                   # 앱 설정 (dev/prod)
│   ├── context/                  # React Context providers
│   ├── devtools/                 # 개발 도구 (Reactotron)
│   ├── i18n/                     # 다국어 지원 (8개 언어)
│   ├── navigators/               # React Navigation 설정
│   ├── screens/                  # 화면 컴포넌트
│   ├── services/                 # 외부 서비스 연동
│   │   ├── api/                  # REST API 서비스
│   │   ├── chat/                 # 채팅 서비스
│   │   ├── firestore/            # Firestore 서비스
│   │   ├── network/              # 네트워크/오프라인 서비스
│   │   ├── notifications/        # 푸시 알림 서비스
│   │   ├── payment/              # 결제 서비스
│   │   └── storage/              # Firebase Storage 서비스
│   ├── theme/                    # 테마 시스템 (라이트/다크)
│   ├── types/                    # TypeScript 타입 정의
│   └── utils/                    # 유틸리티 함수
├── functions/                    # Firebase Cloud Functions
├── scripts/                      # 빌드 및 생성 스크립트
│   └── generators/               # 코드 생성기
└── docs/                         # 문서
```

## 기술 스택

### 프레임워크 & 라이브러리
- **React Native** (0.79.5) - 크로스 플랫폼 모바일 앱
- **Expo SDK 53** - 개발 환경 및 네이티브 기능
- **TypeScript** (5.8) - 타입 안전성

### 상태 관리 & 데이터
- **React Context** - 전역 상태 관리
- **React Hook Form** - 폼 상태 관리
- **Zod** - 스키마 검증
- **MMKV** - 고성능 로컬 스토리지

### 네비게이션
- **React Navigation 7** - 네이티브 스택 및 바텀 탭

### 백엔드 서비스
- **Firebase Auth** - 인증 (이메일/구글)
- **Firestore** - 실시간 데이터베이스
- **Firebase Storage** - 파일 스토리지
- **Firebase Cloud Messaging** - 푸시 알림
- **Cloud Functions** - 서버리스 함수

### UI & 애니메이션
- **React Native Reanimated** - 고성능 애니메이션
- **React Native Gesture Handler** - 제스처 처리
- **FlashList** - 고성능 리스트

### 개발 도구
- **Reactotron** - 디버깅
- **ESLint & Prettier** - 코드 품질
- **Jest** - 테스트

## 아키텍처 패턴

### 컴포넌트 구조
```
Component/
├── index.ts          # export
├── Component.tsx     # 메인 컴포넌트
├── Component.test.tsx # 테스트
└── types.ts          # 타입 정의 (선택)
```

### 서비스 레이어
모든 외부 서비스는 싱글톤 패턴으로 구현:

```typescript
class MyService {
  private static instance: MyService;

  static getInstance(): MyService {
    if (!MyService.instance) {
      MyService.instance = new MyService();
    }
    return MyService.instance;
  }
}

export const myService = MyService.getInstance();
```

### 테마 시스템
```typescript
// 테마 사용
const { themed, theme } = useAppTheme();

// 스타일 정의
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  padding: spacing.md,
});

// 적용
<View style={themed($container)} />
```

## 데이터 흐름

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Screen    │────▶│   Service   │────▶│  Firebase   │
│  Component  │◀────│    Layer    │◀────│   Backend   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│   Context   │     │    MMKV     │
│   State     │     │   Storage   │
└─────────────┘     └─────────────┘
```

## 오프라인 지원

### 오프라인 큐 시스템
```typescript
// 오프라인 상태에서 작업 큐잉
await offlineQueue.enqueue({
  type: 'create',
  collection: 'posts',
  data: postData,
});

// 온라인 복귀 시 자동 동기화
networkService.onOnline(() => {
  offlineQueue.processQueue();
});
```

### 재시도 로직
```typescript
// 지수 백오프를 사용한 재시도
await withRetry(
  () => api.sendRequest(),
  { maxRetries: 3, initialDelay: 1000 }
);
```

## 보안 고려사항

1. **인증**: Firebase Auth를 통한 안전한 인증
2. **데이터 검증**: Zod 스키마를 통한 입력 검증
3. **Firestore Rules**: 서버사이드 접근 제어
4. **Storage Rules**: 파일 접근 권한 관리
5. **환경 변수**: 민감한 정보 분리

## 성능 최적화

1. **FlashList**: 대량 리스트 렌더링 최적화
2. **Reanimated**: UI 스레드 애니메이션
3. **MMKV**: 고성능 동기 스토리지
4. **이미지 최적화**: 리사이징 및 압축
5. **번들 분석**: 코드 스플리팅 지원
