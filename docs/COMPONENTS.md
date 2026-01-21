# Component Library API

## 목차
- [Core UI Components](#core-ui-components)
- [Form Components](#form-components)
- [Layout Components](#layout-components)
- [Display Components](#display-components)
- [Feedback Components](#feedback-components)
- [Overlay Components](#overlay-components)

---

## Core UI Components

### Text
텍스트 표시 컴포넌트

```tsx
import { Text } from "@/components";

<Text preset="heading">제목</Text>
<Text preset="subheading">부제목</Text>
<Text preset="default">본문</Text>
<Text size="xs" weight="bold">커스텀 텍스트</Text>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| preset | "default" \| "heading" \| "subheading" \| "formLabel" \| "formHelper" | "default" | 미리 정의된 스타일 |
| size | "xxs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "xxl" | - | 폰트 크기 |
| weight | "light" \| "normal" \| "medium" \| "semiBold" \| "bold" | - | 폰트 두께 |

### Button
버튼 컴포넌트

```tsx
import { Button } from "@/components";

<Button text="클릭" onPress={() => {}} />
<Button text="비활성화" disabled />
<Button preset="filled" text="채워진 버튼" />
<Button preset="reversed" text="반전 버튼" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | - | 버튼 텍스트 |
| preset | "default" \| "filled" \| "reversed" | "default" | 버튼 스타일 |
| disabled | boolean | false | 비활성화 상태 |
| onPress | () => void | - | 클릭 핸들러 |
| LeftAccessory | ComponentType | - | 왼쪽 아이콘 |
| RightAccessory | ComponentType | - | 오른쪽 아이콘 |

### Icon
아이콘 컴포넌트

```tsx
import { Icon } from "@/components";

<Icon icon="heart" size={24} color="#FF0000" />
<Icon icon="settings" size={30} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | IconTypes | - | 아이콘 타입 |
| size | number | 24 | 아이콘 크기 |
| color | string | theme.colors.text | 아이콘 색상 |

### Card
카드 컴포넌트

```tsx
import { Card } from "@/components";

<Card
  heading="제목"
  content="내용"
  footer="푸터"
  LeftComponent={<Icon icon="heart" />}
/>
```

---

## Form Components

### TextField
텍스트 입력 컴포넌트

```tsx
import { TextField } from "@/components";

<TextField
  label="이메일"
  placeholder="이메일을 입력하세요"
  value={email}
  onChangeText={setEmail}
  helper="유효한 이메일을 입력하세요"
  status="error"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | 라벨 텍스트 |
| placeholder | string | - | 플레이스홀더 |
| value | string | - | 입력 값 |
| onChangeText | (text: string) => void | - | 변경 핸들러 |
| helper | string | - | 도움말/에러 텍스트 |
| status | "error" \| "disabled" | - | 상태 |
| RightAccessory | ComponentType | - | 오른쪽 액세서리 |

### SearchBar
검색 입력 컴포넌트

```tsx
import { SearchBar } from "@/components";

<SearchBar
  value={query}
  onChangeText={setQuery}
  onSearch={handleSearch}
  placeholder="검색..."
  showCancel
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | "" | 검색어 |
| onChangeText | (text: string) => void | - | 변경 핸들러 |
| onSearch | (text: string) => void | - | 검색 핸들러 |
| variant | "default" \| "filled" \| "outlined" | "default" | 스타일 변형 |
| size | "sm" \| "md" \| "lg" | "md" | 크기 |
| showCancel | boolean | false | 취소 버튼 표시 |

### Slider
범위 선택 컴포넌트

```tsx
import { Slider } from "@/components";

<Slider
  value={50}
  min={0}
  max={100}
  step={10}
  onChange={setValue}
  showValue
  showLabels
/>
```

---

## Layout Components

### Divider
구분선 컴포넌트

```tsx
import { Divider } from "@/components";

<Divider />
<Divider label="또는" labelPosition="center" />
<Divider orientation="vertical" />
<Divider variant="dashed" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| orientation | "horizontal" \| "vertical" | "horizontal" | 방향 |
| variant | "solid" \| "dashed" \| "dotted" | "solid" | 선 스타일 |
| label | string | - | 중앙 라벨 |
| labelPosition | "left" \| "center" \| "right" | "center" | 라벨 위치 |

### Spacer
간격 컴포넌트

```tsx
import { Spacer, SpacerMD, SpacerFlex } from "@/components";

<Spacer size="lg" />
<SpacerMD />
<SpacerFlex />  {/* flex: 1 */}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | "xxs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "xxl" | "md" | 크기 |
| width | number | - | 커스텀 너비 |
| height | number | - | 커스텀 높이 |
| flex | number | - | flex 값 |

---

## Display Components

### Badge
배지 컴포넌트

```tsx
import { Badge } from "@/components";

<Badge text="NEW" variant="primary" />
<Badge count={5} maxCount={99} />
<Badge dot variant="error" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | - | 텍스트 |
| count | number | - | 숫자 (maxCount 초과 시 + 표시) |
| maxCount | number | 99 | 최대 표시 숫자 |
| variant | "default" \| "primary" \| "secondary" \| "success" \| "warning" \| "error" | "default" | 색상 변형 |
| size | "sm" \| "md" \| "lg" | "md" | 크기 |
| dot | boolean | false | 점으로만 표시 |

### Chip
칩 컴포넌트

```tsx
import { Chip, ChipGroup } from "@/components";

<Chip label="태그" variant="outlined" />
<Chip label="선택됨" selected onPress={handlePress} />
<Chip label="삭제 가능" onRemove={handleRemove} />

<ChipGroup
  options={[
    { label: "옵션1", value: "1" },
    { label: "옵션2", value: "2" },
  ]}
  value={selected}
  onChange={setSelected}
  multiple
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | 라벨 텍스트 |
| variant | "filled" \| "outlined" \| "soft" | "filled" | 스타일 변형 |
| color | "default" \| "primary" \| "secondary" \| "success" \| "warning" \| "error" | "default" | 색상 |
| selected | boolean | false | 선택 상태 |
| onPress | () => void | - | 클릭 핸들러 |
| onRemove | () => void | - | 삭제 핸들러 |

### Avatar
아바타 컴포넌트

```tsx
import { Avatar, AvatarGroup } from "@/components";

<Avatar source="https://..." size="lg" />
<Avatar fallback="JD" variant="circle" />
<Avatar status="online" bordered />

<AvatarGroup
  avatars={[
    { source: "https://...", fallback: "A" },
    { source: "https://...", fallback: "B" },
  ]}
  max={3}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| source | string | - | 이미지 URL |
| fallback | string | - | 대체 텍스트 (이니셜) |
| size | "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "xxl" | "md" | 크기 |
| variant | "circle" \| "rounded" \| "square" | "circle" | 모양 |
| status | "online" \| "offline" \| "away" \| "busy" | - | 상태 표시 |

### ProgressBar
진행률 표시 컴포넌트

```tsx
import { ProgressBar } from "@/components";

<ProgressBar progress={75} />
<ProgressBar progress={50} showLabel labelPosition="right" />
<ProgressBar progress={100} variant="success" size="lg" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| progress | number | - | 진행률 (0-100) |
| showLabel | boolean | false | 라벨 표시 |
| labelPosition | "top" \| "right" \| "inside" | "right" | 라벨 위치 |
| variant | "default" \| "primary" \| "secondary" \| "success" \| "warning" \| "error" | "primary" | 색상 변형 |
| size | "sm" \| "md" \| "lg" | "md" | 크기 |

### Skeleton
스켈레톤 로더 컴포넌트

```tsx
import { Skeleton, SkeletonGroup, SkeletonCard, SkeletonListItem } from "@/components";

<Skeleton variant="text" width="80%" />
<Skeleton variant="circular" height={48} />
<Skeleton variant="rectangular" height={200} />

<SkeletonGroup count={3} gap={8} />
<SkeletonCard />
<SkeletonListItem />
```

---

## Feedback Components

### Toast
토스트 알림 컴포넌트

```tsx
import { ToastProvider, useToast } from "@/components";

// App에서 Provider 감싸기
<ToastProvider>
  <App />
</ToastProvider>

// 컴포넌트에서 사용
const { show, hide } = useToast();

show({
  message: "저장되었습니다",
  type: "success",
  duration: 3000,
  position: "bottom",
});
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| message | string | - | 메시지 |
| type | "info" \| "success" \| "warning" \| "error" | "info" | 타입 |
| duration | number | 3000 | 표시 시간 (ms), 0은 수동 닫기 |
| position | "top" \| "bottom" | "bottom" | 위치 |
| actionText | string | - | 액션 버튼 텍스트 |
| onAction | () => void | - | 액션 핸들러 |

### AlertDialog
알림 다이얼로그 컴포넌트

```tsx
import { AlertDialog, ConfirmDialog } from "@/components";

<AlertDialog
  visible={visible}
  type="warning"
  title="경고"
  message="정말 삭제하시겠습니까?"
  actions={[
    { label: "취소", onPress: onCancel, style: "cancel" },
    { label: "삭제", onPress: onDelete, style: "destructive" },
  ]}
  onDismiss={onClose}
/>

<ConfirmDialog
  visible={visible}
  title="확인"
  message="계속하시겠습니까?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

### LoadingOverlay
로딩 오버레이 컴포넌트

```tsx
import { LoadingOverlay } from "@/components";

<LoadingOverlay visible={loading} message="로딩 중..." />
```

---

## Overlay Components

### BottomSheet
바텀 시트 컴포넌트

```tsx
import { BottomSheet, BottomSheetHeader } from "@/components";

<BottomSheet
  visible={visible}
  onDismiss={onClose}
  height="50%"
  draggable
  showHandle
>
  <BottomSheetHeader title="옵션" />
  <View>
    {/* 내용 */}
  </View>
</BottomSheet>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| visible | boolean | - | 표시 여부 |
| onDismiss | () => void | - | 닫기 핸들러 |
| height | number \| string | "50%" | 높이 |
| draggable | boolean | true | 드래그 활성화 |
| showHandle | boolean | true | 핸들 표시 |
| dismissOnBackdrop | boolean | true | 배경 터치 시 닫기 |
| snapPoints | number[] | - | 스냅 포인트 (0-1) |

### Tabs
탭 컴포넌트

```tsx
import { Tabs, TabPanel } from "@/components";

const [activeTab, setActiveTab] = useState("tab1");

<Tabs
  tabs={[
    { key: "tab1", label: "탭 1" },
    { key: "tab2", label: "탭 2", badge: 5 },
  ]}
  activeKey={activeTab}
  onChange={setActiveTab}
  variant="underline"
/>

<TabPanel tabKey="tab1" activeKey={activeTab}>
  탭 1 내용
</TabPanel>
<TabPanel tabKey="tab2" activeKey={activeTab}>
  탭 2 내용
</TabPanel>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| tabs | TabItem[] | - | 탭 목록 |
| activeKey | string | - | 활성 탭 키 |
| onChange | (key: string) => void | - | 변경 핸들러 |
| variant | "default" \| "pills" \| "underline" \| "segmented" | "default" | 스타일 변형 |
| size | "sm" \| "md" \| "lg" | "md" | 크기 |
| fullWidth | boolean | false | 전체 너비 |
| scrollable | boolean | false | 스크롤 가능 |
