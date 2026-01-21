# Code Generators

코드 생성기를 사용하여 보일러플레이트 코드를 빠르게 생성할 수 있습니다.

## 사용법

```bash
# 일반 사용법
npm run generate <type> <name> [options]

# 개별 생성기 사용
npm run generate:component <name> [options]
npm run generate:screen <name> [options]
npm run generate:service <name> [options]
npm run generate:function <name> [options]
```

---

## Component Generator

새로운 React Native 컴포넌트를 생성합니다.

### 기본 사용법

```bash
npm run generate component MyButton
```

### 옵션

| 옵션 | 설명 |
|------|------|
| `--variant` | variant prop 추가 (default, primary, secondary) |
| `--size` | size prop 추가 (sm, md, lg) |
| `--animated` | Reanimated 애니메이션 지원 추가 |

### 예시

```bash
# 기본 컴포넌트
npm run generate component MyCard

# variant와 size가 있는 컴포넌트
npm run generate component Alert --variant --size

# 애니메이션이 있는 컴포넌트
npm run generate component FadeView --animated
```

### 생성 파일

```
app/components/MyButton.tsx
```

### 후속 작업

`app/components/index.ts`에 export 추가:
```typescript
export * from "./MyButton";
```

---

## Screen Generator

새로운 화면 컴포넌트를 생성합니다.

### 기본 사용법

```bash
npm run generate screen UserProfile
```

### 옵션

| 옵션 | 설명 |
|------|------|
| `--list` | 리스트 화면 템플릿 (FlashList, 새로고침, 빈 상태) |
| `--form` | 폼 화면 템플릿 (입력 필드, 검증, 제출) |
| `--detail` | 상세 화면 템플릿 (데이터 로딩, 스켈레톤) |

### 예시

```bash
# 기본 화면
npm run generate screen Home

# 리스트 화면
npm run generate screen ProductList --list

# 폼 화면
npm run generate screen ContactForm --form

# 상세 화면
npm run generate screen ProductDetail --detail
```

### 생성 파일

```
app/screens/UserProfileScreen.tsx
```

### 후속 작업

1. Navigator에 ParamList 타입 추가
2. Stack.Screen 추가

```typescript
// app/navigators/AppNavigator.tsx
export type AppStackParamList = {
  // ...
  UserProfile: undefined;
};

<Stack.Screen name="UserProfile" component={UserProfileScreen} />
```

---

## Service Generator

새로운 서비스 클래스를 생성합니다.

### 기본 사용법

```bash
npm run generate service Product
```

### 옵션

| 옵션 | 설명 |
|------|------|
| `--firestore` | Firestore CRUD 서비스 (실시간 구독 포함) |
| `--api` | REST API 서비스 |
| `--storage` | Firebase Storage 서비스 (업로드/다운로드) |

### 예시

```bash
# 기본 서비스
npm run generate service Analytics

# Firestore 서비스
npm run generate service Post --firestore

# API 서비스
npm run generate service User --api

# Storage 서비스
npm run generate service Image --storage
```

### 생성 파일

```
app/services/productService.ts           # 기본
app/services/firestore/postService.ts    # --firestore
app/services/api/userService.ts          # --api
app/services/storage/imageService.ts     # --storage
```

### 후속 작업

해당 디렉토리의 `index.ts`에 export 추가

---

## Function Generator

Firebase Cloud Function을 생성합니다.

### 기본 사용법

```bash
npm run generate function SendWelcomeEmail
```

### 옵션

| 옵션 | 설명 |
|------|------|
| `--http` | HTTP 트리거 함수 |
| `--firestore` | Firestore 트리거 함수 (onCreate, onUpdate, onDelete) |
| `--auth` | Auth 트리거 함수 (onCreate, onDelete) |
| `--scheduled` | 스케줄 트리거 함수 (Pub/Sub) |
| (기본값) | Callable 함수 |

### 예시

```bash
# Callable 함수 (기본)
npm run generate function ProcessPayment

# HTTP 트리거
npm run generate function Webhook --http

# Firestore 트리거
npm run generate function OnPostCreated --firestore

# Auth 트리거
npm run generate function OnUserSignUp --auth

# 스케줄 함수
npm run generate function DailyCleanup --scheduled
```

### 생성 파일

```
functions/src/sendWelcomeEmail.ts
```

### 후속 작업

`functions/src/index.ts`에 export 추가:
```typescript
export * from "./sendWelcomeEmail";
```

---

## 템플릿 커스터마이징

생성기 템플릿은 `scripts/generators/` 디렉토리에 있습니다:

```
scripts/generators/
├── index.js      # CLI 진입점
├── component.js  # 컴포넌트 생성기
├── screen.js     # 화면 생성기
├── service.js    # 서비스 생성기
└── function.js   # Cloud Function 생성기
```

각 파일의 `getXXXTemplate()` 함수를 수정하여 템플릿을 커스터마이징할 수 있습니다.

---

## 팁

1. **이름 규칙**: PascalCase 사용 (예: `MyComponent`, `UserProfile`)
2. **Screen 접미사**: 자동으로 `Screen` 접미사 추가됨
3. **Service 접미사**: 자동으로 `Service` 접미사 추가됨
4. **중복 방지**: 같은 이름의 파일이 있으면 생성 실패

```bash
# 도움말 보기
npm run generate -- --help
npm run generate:component -- --help
```
