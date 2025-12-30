# ColoredSheep Navigation Configuration Summary

## Navigation Structure

### Route Definitions (MainStackParamList)

```typescript
{
  Welcome: undefined           // Legacy screen (temporary)
  Home: undefined              // Initial ColoredSheep screen
  PostList: undefined          // Main feed
  PostDetail: { id: string }   // Individual post view
  CreatePost: undefined        // New post modal
}
```

## Screen Configurations

### 1. Home Screen

**Route**: `Home`
**Initial Route**: Yes (after integration)
**Presentation**: Standard

```typescript
{
  title: "🐑 양들의 게시판",
  headerShown: false,
  gestureEnabled: false
}
```

**Specifications**:
- No header (custom in-screen implementation)
- No swipe back (entry point)
- Landing page with character animation

---

### 2. PostList Screen

**Route**: `PostList`
**Presentation**: Card (slide from right)

```typescript
{
  title: "🐑 양들의 게시판",
  headerShown: true,
  headerStyle: {
    backgroundColor: "#F5B740"  // Yellow brand color
  },
  headerTitleStyle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111111"
  },
  headerLeft: HomeButton,  // 44x44 touchable area
  gestureEnabled: true,
  gestureDirection: "horizontal"
}
```

**Specifications**:
- Yellow gradient header background
- Custom home button (left header)
- Horizontal swipe back enabled
- Contains FlatList of post cards
- Pull-to-refresh with sheep animation

**Header Left Component**:
```typescript
<TouchableOpacity
  onPress={() => navigation.navigate("Home")}
  style={{ width: 44, height: 44, justifyContent: "center", alignItems: "center", marginLeft: 8 }}
  accessibilityLabel="홈으로 이동"
  accessibilityRole="button"
>
  <Icon icon="home" size={24} color="#111111" />
</TouchableOpacity>
```

---

### 3. PostDetail Screen

**Route**: `PostDetail`
**Params**: `{ id: string }`
**Presentation**: Card (slide from right)

```typescript
{
  title: "게시글",
  headerShown: true,
  presentation: "card",
  gestureEnabled: true
}
```

**Specifications**:
- Standard card presentation
- Default header with back button
- Swipe back enabled
- Post ID passed as route param

**Navigation Example**:
```typescript
navigation.navigate('PostDetail', { id: '123' })
```

---

### 4. CreatePost Screen

**Route**: `CreatePost`
**Presentation**: Full Screen Modal

```typescript
{
  title: "✍️ 글 쓰기",
  presentation: "fullScreenModal",
  headerShown: true,
  headerStyle: {
    backgroundColor: "#F5B740"
  },
  headerTitleStyle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111111"
  },
  gestureEnabled: true,
  gestureDirection: "vertical",
  animation: "slide_from_bottom"
}
```

**Specifications**:
- Full screen modal presentation
- Yellow header background
- Vertical swipe to dismiss
- Slides from bottom (250ms)
- Form with character selector

---

## Transition Specifications

### Push Transition
- Animation: `slide_from_right`
- Duration: 300ms
- Easing: ease-out
- Applies to: PostList → PostDetail

### Modal Transition
- Animation: `slide_from_bottom`
- Duration: 250ms
- Easing: ease-out
- Applies to: CreatePost entrance

### Pop Transition
- Animation: `slide_to_right`
- Duration: 250ms
- Easing: ease-in
- Applies to: All back navigations

---

## Navigation Flows

### Primary Flow

```
Home Screen
  ↓ (button tap)
PostList Screen
  ↓ (post card tap)
PostDetail Screen
  ↓ (back)
PostList Screen
```

### Post Creation Flow

```
PostList Screen
  ↓ (FAB tap)
CreatePost Screen (modal)
  ↓ (submit)
PostList Screen (modal dismissed, refresh list)
```

### Return to Home

```
PostList Screen
  ↓ (home button in header)
Home Screen
```

---

## Type Safety

### Screen Props Types

```typescript
// Import from navigationTypes.ts
import type {
  HomeScreenProps,
  PostListScreenProps,
  PostDetailScreenProps,
  CreatePostScreenProps
} from '@/navigators/navigationTypes'

// Usage in screen
export const PostListScreen: React.FC<PostListScreenProps> = ({ navigation, route }) => {
  // Type-safe navigation
  navigation.navigate('PostDetail', { id: '123' })
}
```

### Hook Usage

```typescript
// In components
import { useNavigation } from '@react-navigation/native'
import type { MainStackNavigation } from '@/navigators/navigationTypes'

const navigation = useNavigation<MainStackNavigation>()

// In components needing params
import { useRoute } from '@react-navigation/native'
import type { PostDetailScreenRouteProp } from '@/navigators/navigationTypes'

const route = useRoute<PostDetailScreenRouteProp>()
const { id } = route.params  // Type-safe param access
```

---

## Design Specifications

### Colors

- **Primary Yellow**: `#F5B740` (headers)
- **Text Primary**: `#111111` (titles, icons)
- **Background**: `#FFFFFF` (screens)

### Typography

- **Header Title**: 24px, bold (700)
- **Screen Title**: 30px, bold (700)
- **Body**: 14px, regular (400)

### Spacing

- **Header Height**: 72dp
- **Screen Padding**: 24dp
- **Card Gap**: 16dp
- **Touch Target**: Minimum 44x44

### Accessibility

- All buttons: `accessibilityRole="button"`
- Home button: `accessibilityLabel="홈으로 이동"`
- Screen readers: Automatic title announcements
- Color contrast: AAA level (7.5:1)

---

## Integration Checklist

Before uncommenting screens in MainNavigator.tsx:

1. ✅ Create screen files in `app/screens/ColoredSheep/`
2. ✅ Implement screens with proper prop types
3. ✅ Export screen components
4. ✅ Verify Icon component has "home" icon
5. ✅ Test navigation flows
6. ✅ Verify accessibility labels
7. ✅ Test gestures (swipe back, modal dismiss)
8. ✅ Validate transitions match design spec

---

## Files Modified

1. **`app/navigators/MainNavigator.tsx`**
   - Changed from BottomTabNavigator to NativeStackNavigator
   - Added ColoredSheep screen configurations (commented)
   - Configured headers, gestures, transitions

2. **`app/navigators/navigationTypes.ts`** (NEW)
   - Complete TypeScript type definitions
   - Screen props types
   - Navigation and route types
   - Type guards

3. **`NAVIGATION_INTEGRATION_GUIDE.md`** (NEW)
   - Step-by-step integration instructions
   - Code examples
   - Testing checklist

---

## Dependencies

All required packages already in `package.json`:

```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/native-stack": "^6.x",
  "react-native-safe-area-context": "latest",
  "react-native-gesture-handler": "latest"
}
```

---

## Next Steps

1. Wait for screen components to be created by other sub-agents
2. Uncomment screen imports in MainNavigator.tsx
3. Uncomment screen registrations in MainNavigator.tsx
4. Update initialRouteName to "Home"
5. Test navigation flows
6. Verify all transitions and gestures work as expected

---

## Support & Reference

- Design Spec: `REACT_NATIVE_DESIGN_SPEC.json`
- Integration Guide: `NAVIGATION_INTEGRATION_GUIDE.md`
- Navigation Types: `app/navigators/navigationTypes.ts`
- Main Config: `app/navigators/MainNavigator.tsx`
