# React Hooks 에러 해결 가이드

## 문제
"Rendered more hooks than during the previous render" 에러가 지속적으로 발생

## 시도한 해결책
1. ✅ useEffect 조건부 return 제거
2. ✅ 모든 hook을 컴포넌트 최상단에 배치
3. ✅ React.memo 사용 및 제거
4. ✅ useCallback/useMemo 최적화 및 제거
5. ✅ 간단한 컴포넌트로 교체 테스트

## 추천 다음 단계

### 1단계: 현재 간단한 컴포넌트로 테스트
```typescript
// BulletinBoardScreenSimple.tsx - 현재 활성화됨
// 최소한의 hook만 사용하여 기본 동작 확인
```

### 2단계: 점진적 기능 복원
원본 컴포넌트에서 기능을 하나씩 추가:

1. **기본 hook 추가**:
   ```typescript
   const { top } = useSafeAreaInsets()
   const navigation = useNavigation()
   const { themed, theme } = useAppTheme()
   ```

2. **useState 하나씩 추가**:
   ```typescript
   const [posts, setPosts] = useState([])
   const [loading, setLoading] = useState(true)
   // ... 하나씩 추가
   ```

3. **useEffect 하나씩 추가**:
   ```typescript
   // 첫 번째 useEffect만 추가
   useEffect(() => {
     // 게시글 구독 로직
   }, [])
   ```

### 3단계: 에러 발생 지점 특정
어느 단계에서 에러가 발생하는지 확인하고 해당 부분만 수정

### 4단계: 컴포넌트 분할
큰 컴포넌트를 작은 컴포넌트들로 분할:
- `PostList.tsx`
- `OrganizationList.tsx`  
- `NotificationHeader.tsx`

### 5단계: 환경 이슈 확인
```bash
# 캐시 완전 정리
rm -rf node_modules .expo
npm install
npx expo start --dev-client --clear

# React DevTools 사용
npx react-devtools
```

## 현재 상태
- ✅ 간단한 컴포넌트 작동 테스트 중
- ⏳ 에러 발생 여부 확인 필요
- 🔄 점진적 복원 준비 완료