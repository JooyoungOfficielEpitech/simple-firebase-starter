# 코드 리팩토링 계획

**목표**: 디자인 변경 사항을 빠르게 반영할 수 있도록 코드베이스를 체계적으로 정리

**작성일**: 2025-11-09

---

## 📋 현재 상태 분석

### ✅ 잘 되어있는 부분
- Design System 구조가 이미 존재 (`app/design-system/`)
- Design Tokens 분리 (colors, spacing, typography, shadows)
- 테마 시스템 구현 (다크/라이트 모드, 캐릭터별 테마)
- TypeScript 사용으로 타입 안정성 확보

### ⚠️ 개선이 필요한 부분
1. **컴포넌트 중복 및 분산**
   - `app/components/Card.tsx`와 `app/design-system/components/Card.tsx` 중복
   - 백업 파일들이 프로젝트에 남아있음 (`AudioPlayer.tsx.backup`)
   - Optimized 버전과 일반 버전이 공존 (`AudioPlayer.tsx`, `AudioPlayerOptimized.tsx`)

2. **컴포넌트 구조 일관성 부족**
   - 일부 기능별 폴더가 `components/` 하위에 존재 (`ApplicationManagement/`, `BulletinBoard/`, `CreatePost/`)
   - 화면 특화 컴포넌트와 재사용 컴포넌트가 혼재

3. **디자인 시스템 미완성**
   - Design System에 일부 컴포넌트만 정의됨 (Card, Badge, Avatar, Divider, Input)
   - Button, Icon 등 자주 사용되는 컴포넌트가 일반 components 폴더에 위치

---

## 🎯 리팩토링 목표

### Phase 1: 기본 구조 정리 (우선순위: 높음)
**예상 소요 시간**: 2-3시간

#### 1.1 중복 파일 제거
- [ ] 백업 파일 제거 또는 별도 폴더로 이동
  - `AudioPlayer.tsx.backup`
  - 기타 `.backup` 확장자 파일들

- [ ] Optimized 버전 통합
  - `AudioPlayer.tsx`와 `AudioPlayerOptimized.tsx` 비교 후 최적 버전으로 통합
  - 사용하지 않는 버전은 백업 폴더로 이동

#### 1.2 컴포넌트 중복 해소
- [ ] Card 컴포넌트 통합
  - `app/components/Card.tsx`와 `app/design-system/components/Card.tsx` 비교
  - 더 완성도 높은 버전을 Design System으로 이동
  - 기존 사용처 업데이트

- [ ] 중복 가능성 있는 컴포넌트 확인
  - Button, Icon, Input 등 검토

---

### Phase 2: Design System 완성 (우선순위: 높음)
**예상 소요 시간**: 4-6시간

#### 2.1 기본 컴포넌트 Design System으로 이동
- [ ] **Button** (`app/components/Button.tsx`)
  - Design System으로 이동
  - 디자인 토큰 적용 (colors, spacing, typography)
  - 다양한 variant 정의 (primary, secondary, outline, ghost)
  - 다양한 size 정의 (sm, md, lg)

- [ ] **Icon** (`app/components/Icon.tsx`)
  - Design System으로 이동
  - 표준화된 size, color props

- [ ] **Text**
  - Design System으로 이동
  - Typography tokens와 완전히 통합
  - 표준화된 variant (heading1, heading2, body, caption 등)

#### 2.2 새로운 Design System 컴포넌트 생성
- [ ] **Typography** 컴포넌트
  - Heading (h1, h2, h3, h4, h5, h6)
  - Text (body1, body2, caption, overline)
  - Label, Link 등

- [ ] **Layout** 컴포넌트
  - Box (기본 레이아웃 컨테이너)
  - Stack (VStack, HStack)
  - Grid
  - Spacer

- [ ] **Feedback** 컴포넌트
  - Alert
  - Toast/Snackbar
  - Modal
  - Loading Spinner

#### 2.3 Design Tokens 확장
- [ ] **Animation Tokens**
  - 표준 애니메이션 duration
  - Easing functions
  - Transition presets

- [ ] **Border Radius Tokens**
  - 표준화된 border radius 값들

- [ ] **Z-Index Tokens**
  - 레이어 우선순위 표준화

---

### Phase 3: 컴포넌트 분류 및 구조화 (우선순위: 중간)
**예상 소요 시간**: 3-4시간

#### 3.1 Feature 기반 폴더 구조로 재구성
```
app/
├── design-system/          # 재사용 가능한 기본 컴포넌트
│   ├── components/
│   ├── tokens/
│   └── hooks/             # Design System 관련 hooks
├── features/              # 기능별 폴더 (새로 생성)
│   ├── audio-player/      # components/AudioPlayer/ 이동
│   ├── bulletin-board/    # components/BulletinBoard/ 이동
│   ├── post-management/   # components/CreatePost/, PostDetail/ 통합
│   └── application/       # components/ApplicationManagement/ 이동
├── components/            # 공통 비즈니스 컴포넌트
│   └── ...               # Screen별로 특화되지 않은 컴포넌트만
└── screens/              # 화면 컴포넌트만
```

#### 3.2 폴더 이동 작업
- [ ] `components/AudioPlayer/` → `features/audio-player/components/`
- [ ] `components/BulletinBoard/` → `features/bulletin-board/components/`
- [ ] `components/CreatePost/` → `features/post-management/components/`
- [ ] `components/PostDetail/` → `features/post-management/components/`
- [ ] `components/ApplicationManagement/` → `features/application/components/`

#### 3.3 Import 경로 업데이트
- [ ] 모든 import 경로를 새 구조에 맞게 업데이트
- [ ] Path alias 설정 (`@design-system/*`, `@features/*` 등)

---

### Phase 4: 스타일 시스템 통합 (우선순위: 중간)
**예상 소요 시간**: 3-5시간

#### 4.1 Inline Styles → Design Tokens 마이그레이션
- [ ] 하드코딩된 색상 값을 `theme.colors` 사용으로 변경
- [ ] 하드코딩된 spacing 값을 `theme.spacing` 사용으로 변경
- [ ] 하드코딩된 typography를 `theme.typography` 사용으로 변경

#### 4.2 스타일 추출 및 재사용성 향상
- [ ] 반복되는 스타일 패턴을 Design System으로 추출
- [ ] Custom hooks으로 스타일 로직 분리 (`useThemedStyles` 등)

---

### Phase 5: 테마 시스템 개선 (우선순위: 낮음)
**예상 소요 시간**: 2-3시간

#### 5.1 테마 구조 검토
- [ ] 현재 4개 캐릭터 테마가 필요한지 검토
- [ ] 사용하지 않는 테마 제거 고려

#### 5.2 테마 전환 로직 개선
- [ ] 테마 전환 시 깜빡임 방지
- [ ] 테마 설정 persistence 개선

---

### Phase 6: 문서화 (우선순위: 중간)
**예상 소요 시간**: 2-3시간

#### 6.1 Design System 문서화
- [ ] Storybook 도입 고려 또는 문서 페이지 생성
- [ ] 각 컴포넌트 사용 예시
- [ ] Design Tokens 가이드

#### 6.2 컴포넌트 주석 및 타입 개선
- [ ] Props 인터페이스에 JSDoc 추가
- [ ] 복잡한 로직에 주석 추가

---

## 🚀 실행 순서

### Week 1: 기반 다지기
1. Phase 1 완료 (중복 파일 제거, 컴포넌트 통합)
2. Phase 2.1 완료 (핵심 컴포넌트 Design System 이동)
3. Phase 2.3 완료 (Design Tokens 확장)

### Week 2: 구조화 및 확장
4. Phase 2.2 완료 (새로운 Design System 컴포넌트)
5. Phase 3 완료 (Feature 기반 구조 재구성)

### Week 3: 통합 및 정리
6. Phase 4 완료 (스타일 시스템 통합)
7. Phase 6 완료 (문서화)

### Optional (필요시)
8. Phase 5 완료 (테마 시스템 개선)

---

## 🎨 디자인 반영 프로세스 (리팩토링 후)

리팩토링 완료 후 디자인 변경 사항을 반영하는 과정:

### 1. Design Tokens 업데이트
```typescript
// app/design-system/tokens/colors.ts
export const colors = {
  primary: '#NEW_COLOR',  // 메인 색상 변경
  // ...
}
```

### 2. 컴포넌트 Variant 조정
```typescript
// app/design-system/components/Button.tsx
const variants = {
  primary: { /* 새 디자인 */ },
  secondary: { /* 새 디자인 */ },
}
```

### 3. 자동 반영
- Design System 컴포넌트를 사용하는 모든 곳에 자동으로 반영
- 일관성 있는 디자인 유지

---

## 📊 예상 효과

### 개발 속도 향상
- 디자인 변경 시 수정 지점 최소화 (Design Tokens만 수정)
- 새 화면 개발 시 Design System 컴포넌트 재사용으로 개발 시간 50% 단축

### 코드 품질 향상
- 일관된 디자인 적용
- 코드 중복 제거로 유지보수성 향상
- 타입 안정성 강화

### 협업 효율성 향상
- 명확한 컴포넌트 구조로 팀원 간 이해도 향상
- Design System 문서로 빠른 온보딩

---

## ⚠️ 주의사항

### 점진적 마이그레이션
- 한번에 모든 것을 바꾸지 말고 단계별로 진행
- 각 단계마다 테스트 진행

### 하위 호환성 유지
- 기존 컴포넌트 사용처가 많을 경우 deprecated 표시 후 점진적 마이그레이션
- Breaking change 최소화

### 백업
- 각 단계 시작 전 git commit
- 중요한 변경 사항은 별도 브랜치에서 작업

---

## 📝 체크리스트

매 단계 완료 시:
- [ ] TypeScript 컴파일 에러 없음
- [ ] 기존 기능 정상 동작
- [ ] Git commit 완료
- [ ] 변경 사항 문서화

---

## 🔗 참고 자료

### Design System Best Practices
- Atomic Design Pattern
- Component Composition
- Design Tokens

### 권장 도구
- Storybook (컴포넌트 문서화)
- Figma to Code (디자인-코드 동기화)
- ESLint rules for consistent imports
