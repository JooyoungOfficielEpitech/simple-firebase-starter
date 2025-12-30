# ColoredSheep Navigation Integration Guide

## Overview

The navigation structure has been configured for the ColoredSheep community app. This guide explains how to integrate the screens once they're created.

## Current Status

✅ Navigation structure configured in `app/navigators/MainNavigator.tsx`
✅ Type definitions created in `app/navigators/navigationTypes.ts`
⏳ Screens pending creation (commented out in MainNavigator.tsx)

## Navigation Architecture

### Stack Navigator Structure

```
MainNavigator (NativeStackNavigator)
├── Welcome (Legacy - can be removed)
├── Home (Initial route, no header)
├── PostList (Yellow header with home button)
├── PostDetail (Standard header with back button)
└── CreatePost (Full screen modal)
```

### Screen Flow

1. **Home → PostList**: User clicks button to enter community
2. **PostList → PostDetail**: User taps on a post card
3. **PostList → CreatePost**: User taps FAB button (modal)
4. **CreatePost → PostList**: After post creation (dismiss modal)

## Integration Steps

### Step 1: Create Screen Files

Create the following screen files in `app/screens/ColoredSheep/`:

- `HomeScreen.tsx`
- `PostListScreen.tsx`
- `PostDetailScreen.tsx`
- `CreatePostScreen.tsx`

### Step 2: Implement Screen Components

Use the provided type definitions for type safety:

```tsx
// Example: PostDetailScreen.tsx
import React from 'react'
import { View, Text } from 'react-native'
import type { PostDetailScreenProps } from '@/navigators/navigationTypes'

export const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ navigation, route }) => {
  const { id } = route.params

  return (
    <View>
      <Text>Post ID: {id}</Text>
    </View>
  )
}
```

### Step 3: Uncomment Screen Imports

In `app/navigators/MainNavigator.tsx`, uncomment lines 12-15:

```tsx
import { HomeScreen } from "@/screens/ColoredSheep/HomeScreen"
import { PostListScreen } from "@/screens/ColoredSheep/PostListScreen"
import { PostDetailScreen } from "@/screens/ColoredSheep/PostDetailScreen"
import { CreatePostScreen } from "@/screens/ColoredSheep/CreatePostScreen"
```

### Step 4: Uncomment Screen Registrations

In `app/navigators/MainNavigator.tsx`, uncomment the screen registration blocks (lines 93-165):

- Home Screen (lines 93-101)
- PostList Screen (lines 104-131)
- PostDetail Screen (lines 134-143)
- CreatePost Screen (lines 146-165)

### Step 5: Update Initial Route

Once Home screen is ready, update `initialRouteName` in MainNavigator.tsx (line 66):

```tsx
initialRouteName="Home"  // Change from "Welcome"
```

### Step 6: Add Required Icon

Ensure the "home" icon is available in `app/components/Icon.tsx`. If not, add it to the icon registry.

## Navigation Configuration Details

### Home Screen

```tsx
{
  title: "🐑 양들의 게시판",
  headerShown: false,
  gestureEnabled: false
}
```

- No header (custom implementation in screen)
- No swipe back gesture
- Initial landing page

### PostList Screen

```tsx
{
  title: "🐑 양들의 게시판",
  headerShown: true,
  headerStyle: { backgroundColor: "#F5B740" },
  headerTitleStyle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111111"
  },
  headerLeft: HomeButton (44x44 touchable area),
  gestureEnabled: true,
  gestureDirection: "horizontal"
}
```

- Yellow gradient header (#F5B740)
- Custom home button in header (left side)
- Horizontal swipe back enabled
- 24px bold title

### PostDetail Screen

```tsx
{
  title: "게시글",
  headerShown: true,
  presentation: "card",
  gestureEnabled: true
}
```

- Standard card presentation
- Default header with back button
- Swipe back enabled

### CreatePost Screen

```tsx
{
  title: "✍️ 글 쓰기",
  presentation: "fullScreenModal",
  headerShown: true,
  headerStyle: { backgroundColor: "#F5B740" },
  gestureEnabled: true,
  gestureDirection: "vertical",
  animation: "slide_from_bottom"
}
```

- Full screen modal presentation
- Yellow header (#F5B740)
- Vertical swipe to dismiss
- Slides from bottom

## Type-Safe Navigation Usage

### In Screen Components

```tsx
import type { PostListScreenProps } from '@/navigators/navigationTypes'

export const PostListScreen: React.FC<PostListScreenProps> = ({ navigation }) => {
  // Navigate to PostDetail
  navigation.navigate('PostDetail', { id: '123' })

  // Navigate to CreatePost modal
  navigation.navigate('CreatePost')

  // Go back to Home
  navigation.navigate('Home')
}
```

### Using useNavigation Hook

```tsx
import { useNavigation } from '@react-navigation/native'
import type { MainStackNavigation } from '@/navigators/navigationTypes'

const MyComponent = () => {
  const navigation = useNavigation<MainStackNavigation>()

  const openPost = (id: string) => {
    navigation.navigate('PostDetail', { id })
  }

  return <Button onPress={() => openPost('123')} />
}
```

### Using useRoute Hook

```tsx
import { useRoute } from '@react-navigation/native'
import type { PostDetailScreenRouteProp } from '@/navigators/navigationTypes'

const PostContent = () => {
  const route = useRoute<PostDetailScreenRouteProp>()
  const { id } = route.params

  return <Text>Post ID: {id}</Text>
}
```

## Transition Animations

Per design spec (`REACT_NATIVE_DESIGN_SPEC.json`):

### Push (Default)

- Animation: slide_from_right
- Duration: 300ms
- Easing: ease-out

### Modal (CreatePost)

- Animation: slide_from_bottom
- Duration: 250ms
- Easing: ease-out

### Pop (Back)

- Animation: slide_to_right
- Duration: 250ms
- Easing: ease-in

## Accessibility

All navigation elements include proper accessibility labels:

- Home button: "홈으로 이동"
- Back button: Automatic via React Navigation
- Screen titles: Automatic via screen options

## Testing Checklist

Once integrated, verify:

- ✅ Home screen loads without header
- ✅ PostList shows yellow header with home button
- ✅ Home button navigates back to Home screen
- ✅ Tapping post card opens PostDetail with slide animation
- ✅ PostDetail shows standard header with back button
- ✅ FAB button opens CreatePost as full screen modal
- ✅ CreatePost shows yellow header and slides from bottom
- ✅ Vertical swipe dismisses CreatePost modal
- ✅ Horizontal swipe goes back on PostList and PostDetail
- ✅ All transitions match design spec timings
- ✅ Accessibility labels work with screen readers

## Related Files

- `app/navigators/MainNavigator.tsx` - Main navigation configuration
- `app/navigators/navigationTypes.ts` - TypeScript type definitions
- `app/navigators/AppNavigator.tsx` - Root navigator (auth flow)
- `REACT_NATIVE_DESIGN_SPEC.json` - Design specifications

## Notes

- The navigation uses `@react-navigation/native-stack` for better performance
- All gestures and transitions follow iOS and Material Design guidelines
- Header height: 72dp (per design spec)
- Minimum touchable area: 44x44 (Apple HIG / Material Design)
- Yellow brand color: #F5B740
- Text color: #111111

## Support

If you encounter type errors after uncommenting screens:

1. Ensure screen files export components with correct prop types
2. Run TypeScript compiler: `npx tsc --noEmit`
3. Check that all imports resolve correctly
4. Verify Icon component has "home" icon registered
