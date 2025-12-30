# ColoredSheep Navigation Quick Reference

## 🚀 Quick Start

### Navigate Between Screens

```tsx
// From any screen
navigation.navigate('PostList')
navigation.navigate('PostDetail', { id: '123' })
navigation.navigate('CreatePost')
navigation.navigate('Home')

// Go back
navigation.goBack()

// Replace current screen
navigation.replace('Home')
```

### Access Route Params

```tsx
// In PostDetailScreen
const { id } = route.params  // Type-safe ✅
```

### Use Navigation in Components

```tsx
import { useNavigation } from '@react-navigation/native'
import type { MainStackNavigation } from './navigationTypes'

const MyComponent = () => {
  const navigation = useNavigation<MainStackNavigation>()

  return <Button onPress={() => navigation.navigate('PostList')} />
}
```

## 📋 Screen Reference

| Screen | Route | Params | Header | Gesture |
|--------|-------|--------|--------|---------|
| Home | `Home` | - | Hidden | None |
| PostList | `PostList` | - | Yellow + Home btn | Horizontal |
| PostDetail | `PostDetail` | `{ id: string }` | Default | Horizontal |
| CreatePost | `CreatePost` | - | Yellow | Vertical |

## 🎨 Header Configurations

### PostList Header
- Background: `#F5B740` (yellow)
- Title: "🐑 양들의 게시판" (24px bold)
- Left: Home button (44x44)
- Swipe back: ✅

### CreatePost Header
- Background: `#F5B740` (yellow)
- Title: "✍️ 글 쓰기" (24px bold)
- Presentation: Full screen modal
- Swipe dismiss: ✅ (vertical)

## 🔄 Transition Timings

- Push: 300ms (slide right)
- Modal: 250ms (slide bottom)
- Pop: 250ms (slide left)

## 📁 File Structure

```
app/navigators/
├── AppNavigator.tsx           # Root navigator (auth flow)
├── MainNavigator.tsx          # Main stack (ColoredSheep screens)
├── navigationTypes.ts         # Type definitions ⭐
├── navigationUtilities.ts     # Helper utilities
└── README.md                  # This file
```

## 🔧 Integration Status

**Current**: Screens commented out (waiting for implementation)

**To activate**:
1. Uncomment screen imports (MainNavigator.tsx:12-15)
2. Uncomment screen registrations (MainNavigator.tsx:93-165)
3. Change `initialRouteName="Home"` (line 66)

## 📚 Full Documentation

- **Integration Guide**: `/NAVIGATION_INTEGRATION_GUIDE.md`
- **Summary**: `/NAVIGATION_SUMMARY.md`
- **Design Spec**: `/REACT_NATIVE_DESIGN_SPEC.json`

## 💡 Pro Tips

1. Always use type imports from `navigationTypes.ts`
2. Minimum touch target: 44x44
3. Accessibility labels required for all nav buttons
4. Test swipe gestures on real devices
5. Verify transitions match 60fps

## 🐛 Common Issues

**Type errors?**
```tsx
// ✅ Do this
import type { PostListScreenProps } from './navigationTypes'
export const PostListScreen: React.FC<PostListScreenProps> = ({ navigation, route }) => {}

// ❌ Not this
export const PostListScreen = ({ navigation, route }: any) => {}
```

**Navigation not working?**
- Check screen is registered in MainNavigator
- Verify component is exported correctly
- Ensure route name matches ParamList

**Gesture not working?**
- Check `gestureEnabled: true` in screen options
- Verify `gestureDirection` is set correctly
- Test on physical device (not just simulator)
