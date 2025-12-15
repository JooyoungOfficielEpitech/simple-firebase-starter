# Orphi Design Specification

> 뮤지컬 배우를 위한 플랫폼 - 웹 디자인 분석 및 React Native 구현 가이드

## 📱 Overview

**프로젝트명**: Orphi
**컨셉**: 뮤지컬 배우를 위한 플랫폼
**소스 URL**: https://mobile-app-design-1uruno.lumi.ing
**수집 날짜**: 2025-12-11

## 🎨 Design Tokens

### Colors

#### Primary Colors
```typescript
const colors = {
  // Background Gradient
  purple900: 'rgb(88, 28, 135)',    // #581c87
  purple700: 'rgb(126, 34, 206)',   // #7e22ce
  pink600: 'rgb(219, 39, 119)',     // #db2777

  // Text Colors
  white: 'rgb(255, 255, 255)',      // #ffffff
  gray800: 'rgb(31, 41, 55)',       // #1f2937
  gray500: 'rgb(107, 114, 128)',    // #6b7280
  purple200: 'rgb(233, 213, 255)',  // #e9d5ff

  // Button
  green: 'rgb(46, 125, 50)',        // #2e7d32 (Lumi 버튼 - 무시)
}
```

#### Gradient
```typescript
const gradient = {
  background: 'linear-gradient(to right bottom, rgb(88, 28, 135), rgb(126, 34, 206), rgb(219, 39, 119))'
  // from-purple-900 via-purple-700 to-pink-600
}
```

### Typography

#### Font Family
```typescript
const fontFamily = {
  default: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
}
```

#### Font Sizes
```typescript
const fontSizes = {
  xs: 14,    // text-sm
  sm: 16,    // base
  md: 18,    // text-lg
  lg: 24,    // text-2xl
  xl: 36,    // text-4xl
  xxl: 60,   // text-6xl (emoji icon)
}
```

#### Font Weights
```typescript
const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  bold: '700',
}
```

#### Line Heights
```typescript
const lineHeights = {
  xs: 20,    // 1.43x
  sm: 24,    // 1.5x
  md: 28,    // 1.56x
  lg: 32,    // 1.33x
  xl: 40,    // 1.11x
  xxl: 60,   // 1x
}
```

### Spacing

```typescript
const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

// Usage examples from the design
const margins = {
  'mb-2': '0px 0px 8px',
  'mb-4': '0px 0px 16px',
  'mb-6': '0px 0px 24px',
  'mb-12': '0px 0px 48px',
  'mt-2': '8px 0px 0px',
  'mt-6': '24px 0px 0px',
  'mt-12': '48px 0px 0px',
}

const paddings = {
  'px-6': '0px 24px',  // horizontal padding
  'py-3': '12px 0px',  // vertical padding (button)
  'p-8': '32px',       // all sides (card)
}
```

### Border Radius

```typescript
const borderRadius = {
  lg: 8,   // rounded-lg (button)
  '2xl': 16, // rounded-2xl (card)
}
```

### Shadows

```typescript
const boxShadows = {
  // Card shadow (shadow-2xl)
  card: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.25) 0px 25px 50px -12px',

  // Button shadow (shadow-lg)
  button: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px',
}
```

### Transitions & Animations

```typescript
const transitions = {
  // Default transition for all elements
  default: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), text-decoration-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), fill 0.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

  // Quick transition (button hover/active)
  quick: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
}

// Button interactions
const buttonAnimations = {
  hover: 'shadow-xl',  // Increase shadow on hover
  active: 'scale-95',  // Slightly scale down on press
}
```

## 📐 Layout Structure

### Screen Composition

```
┌─────────────────────────────────────┐
│  min-h-screen                       │  Full height container
│  flex flex-col                      │  Vertical flex layout
│  items-center justify-center        │  Center content
│  px-6                               │  Horizontal padding
│  bg-gradient-to-br                  │  Purple→Pink gradient
│                                     │
│  ┌───────────────────────────────┐ │
│  │ text-center mb-12             │ │  Header section
│  │ ┌─────────────────────────┐   │ │
│  │ │ text-6xl mb-4            │   │ │  Icon (60px emoji)
│  │ │ 🎭                       │   │ │
│  │ └─────────────────────────┘   │ │
│  │ ┌─────────────────────────┐   │ │
│  │ │ text-4xl font-bold      │   │ │  Title (36px bold)
│  │ │ text-white mb-2         │   │ │
│  │ │ Orphi                   │   │ │
│  │ └─────────────────────────┘   │ │
│  │ ┌─────────────────────────┐   │ │
│  │ │ text-purple-200 text-sm │   │ │  Subtitle (14px light)
│  │ │ 뮤지컬 배우를 위한 플랫폼  │   │ │
│  │ └─────────────────────────┘   │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ w-full max-w-sm             │ │  Card container
│  │ bg-white rounded-2xl        │ │  White, 16px radius
│  │ shadow-2xl p-8              │ │  Large shadow, 32px padding
│  │ ┌─────────────────────────┐ │ │
│  │ │ text-2xl font-bold      │ │ │  Card title (24px bold)
│  │ │ text-gray-800 mb-6      │ │ │
│  │ │ text-center             │ │ │
│  │ │ 로그인                   │ │ │
│  │ └─────────────────────────┘ │ │
│  │ ┌─────────────────────────┐ │ │
│  │ │ [Button - ignored]      │ │ │  Lumi button (무시)
│  │ └─────────────────────────┘ │ │
│  │ ┌─────────────────────────┐ │ │
│  │ │ text-center text-gray-500│ │  Helper text (14px gray)
│  │ │ text-sm mt-6            │ │ │
│  │ │ 계정이 없으신가요?        │ │ │
│  │ │ 로그인하면 자동으로...    │ │ │
│  │ └─────────────────────────┘ │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ mt-12 text-center           │ │  Footer quote section
│  │ ┌─────────────────────────┐ │ │
│  │ │ text-white text-lg      │ │ │  Quote (18px white)
│  │ │ font-light italic       │ │ │  Light italic style
│  │ │ "누구나 세상을 날아오를   │ │ │
│  │ │  수 있어"                │ │ │
│  │ └─────────────────────────┘ │ │
│  │ ┌─────────────────────────┐ │ │
│  │ │ text-purple-200 text-sm │ │ │  Attribution (14px purple)
│  │ │ mt-2                    │ │ │
│  │ │ - 엘파바                 │ │ │
│  │ └─────────────────────────┘ │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### Component Hierarchy

```typescript
<View> // Container - Full screen, gradient background
  <View> // Header - Centered text section
    <Text> // Icon - 🎭 emoji, 60px
    <Text> // Title - "Orphi", 36px bold white
    <Text> // Subtitle - description, 14px purple-200
  </View>

  <View> // Card - White rounded card with shadow
    <Text> // Card Title - "로그인", 24px bold gray-800
    {/* Lumi button - ignored */}
    <Text> // Helper Text - gray-500, 14px
  </View>

  <View> // Footer - Quote section
    <Text> // Quote - 18px white, light italic
    <Text> // Attribution - 14px purple-200
  </View>
</View>
```

## 🧩 Components Breakdown

### 1. Main Container
- **Layout**: Full screen height, flex column, center aligned
- **Background**: Linear gradient (purple-900 → purple-700 → pink-600)
- **Padding**: 24px horizontal
- **Justify**: Center (vertical and horizontal)

### 2. Header Section
- **Layout**: Center aligned text
- **Margin**: 48px bottom
- **Components**:
  - Icon: 60px emoji
  - Title: 36px bold white text
  - Subtitle: 14px light purple text

### 3. Login Card
- **Container**:
  - Width: Full width, max 384px (sm)
  - Background: White
  - Border Radius: 16px
  - Shadow: Large (2xl)
  - Padding: 32px

- **Content**:
  - Title: "로그인", 24px bold, gray-800, centered
  - Helper text: gray-500, 14px, centered, 24px top margin

### 4. Footer Quote
- **Layout**: Centered text, 48px top margin
- **Components**:
  - Quote: 18px white text, light weight, italic
  - Attribution: 14px purple-200, 8px top margin

## 🎬 Interactions & Animations

### Button Interactions (for future implementation)
```typescript
// These are observed from the button classes, implement for actual buttons
const buttonInteractions = {
  default: {
    shadow: 'shadow-lg',
    transition: 'transition-all'
  },
  hover: {
    shadow: 'shadow-xl', // Increase shadow
  },
  active: {
    transform: 'scale-95', // Slightly shrink (0.95)
  }
}
```

### Transition Specs
- **Duration**: 200ms (0.2s)
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1) - "ease-out" style
- **Properties**: All properties transition smoothly
  - Color
  - Background color
  - Border color
  - Box shadow
  - Transform
  - Opacity
  - Filter

## 📱 React Native Implementation Guide

### Step 1: Design System Setup

Create `app/design-system/tokens/orphi.tokens.ts`:

```typescript
export const orphiTokens = {
  colors: {
    // Primary gradient colors
    purple900: '#581c87',
    purple700: '#7e22ce',
    purple200: '#e9d5ff',
    pink600: '#db2777',

    // Neutral colors
    white: '#ffffff',
    gray800: '#1f2937',
    gray500: '#6b7280',
  },

  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    lg: 8,
    xl: 16,
  },

  typography: {
    sizes: {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 24,
      xl: 36,
      xxl: 60,
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      bold: '700',
    },
  },

  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 25 },
      shadowOpacity: 0.25,
      shadowRadius: 50,
      elevation: 25,
    },
    button: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 10,
    },
  },
}
```

### Step 2: Gradient Background Component

```typescript
// app/components/GradientBackground.tsx
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { orphiTokens } from '../design-system/tokens/orphi.tokens'

export const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LinearGradient
      colors={[
        orphiTokens.colors.purple900,
        orphiTokens.colors.purple700,
        orphiTokens.colors.pink600,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {children}
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: orphiTokens.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
```

### Step 3: Login Screen Implementation

```typescript
// app/screens/LoginScreen.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { GradientBackground } from '../components/GradientBackground'
import { orphiTokens } from '../design-system/tokens/orphi.tokens'

export const LoginScreen: React.FC = () => {
  return (
    <GradientBackground>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.icon}>🎭</Text>
        <Text style={styles.title}>Orphi</Text>
        <Text style={styles.subtitle}>뮤지컬 배우를 위한 플랫폼</Text>
      </View>

      {/* Card Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>로그인</Text>

        {/* Your actual login form/buttons go here */}

        <Text style={styles.helperText}>
          계정이 없으신가요? 로그인하면 자동으로 생성됩니다.
        </Text>
      </View>

      {/* Footer Quote */}
      <View style={styles.footer}>
        <Text style={styles.quote}>"누구나 세상을 날아오를 수 있어"</Text>
        <Text style={styles.attribution}>- 엘파바</Text>
      </View>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  // Header Section
  header: {
    alignItems: 'center',
    marginBottom: orphiTokens.spacing.xxl,
  },
  icon: {
    fontSize: orphiTokens.typography.sizes.xxl,
    marginBottom: orphiTokens.spacing.md,
  },
  title: {
    fontSize: orphiTokens.typography.sizes.xl,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.white,
    marginBottom: orphiTokens.spacing.xs,
  },
  subtitle: {
    fontSize: orphiTokens.typography.sizes.xs,
    color: orphiTokens.colors.purple200,
  },

  // Card Section
  card: {
    width: '100%',
    maxWidth: 384,
    backgroundColor: orphiTokens.colors.white,
    borderRadius: orphiTokens.borderRadius.xl,
    padding: orphiTokens.spacing.xl,
    ...orphiTokens.shadows.card,
  },
  cardTitle: {
    fontSize: orphiTokens.typography.sizes.lg,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray800,
    textAlign: 'center',
    marginBottom: orphiTokens.spacing.lg,
  },
  helperText: {
    fontSize: orphiTokens.typography.sizes.xs,
    color: orphiTokens.colors.gray500,
    textAlign: 'center',
    marginTop: orphiTokens.spacing.lg,
  },

  // Footer Section
  footer: {
    marginTop: orphiTokens.spacing.xxl,
    alignItems: 'center',
  },
  quote: {
    fontSize: orphiTokens.typography.sizes.md,
    fontWeight: orphiTokens.typography.weights.light,
    fontStyle: 'italic',
    color: orphiTokens.colors.white,
    textAlign: 'center',
  },
  attribution: {
    fontSize: orphiTokens.typography.sizes.xs,
    color: orphiTokens.colors.purple200,
    marginTop: orphiTokens.spacing.xs,
  },
})
```

### Step 4: Animated Button Component (for future use)

```typescript
// app/components/AnimatedButton.tsx
import React from 'react'
import { Pressable, Text, StyleSheet, Animated } from 'react-native'
import { orphiTokens } from '../design-system/tokens/orphi.tokens'

export const AnimatedButton: React.FC<{
  title: string
  onPress: () => void
  backgroundColor?: string
}> = ({ title, onPress, backgroundColor = orphiTokens.colors.purple700 }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current
  const shadowAnim = React.useRef(new Animated.Value(10)).current

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 15,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start()
  }

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 10,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start()
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor,
            transform: [{ scale: scaleAnim }],
            shadowRadius: shadowAnim,
          },
        ]}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: orphiTokens.spacing.sm,
    borderRadius: orphiTokens.borderRadius.lg,
    ...orphiTokens.shadows.button,
  },
  buttonText: {
    fontSize: orphiTokens.typography.sizes.sm,
    fontWeight: orphiTokens.typography.weights.medium,
    color: orphiTokens.colors.white,
    textAlign: 'center',
  },
})
```

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "expo-linear-gradient": "^13.0.2"
  }
}
```

Install with:
```bash
npx expo install expo-linear-gradient
```

## 🎯 Key Implementation Notes

1. **Gradient Background**: Use `expo-linear-gradient` for the purple-to-pink gradient
2. **Typography**: System fonts are sufficient (no custom fonts needed)
3. **Shadows**: React Native shadows need separate configuration for iOS/Android
4. **Animations**: Use `Animated` API for button press effects
5. **Layout**: Flexbox with center alignment throughout
6. **Spacing**: Consistent use of design tokens for margins/paddings
7. **Colors**: Extract exact hex values from RGB for consistency

## 📸 Reference Screenshots

All screenshots are located in `design-spec/screenshots/`:
- `000-initial.png` - Main login screen
- `001-scroll-0.png` - Full screen capture

## 🔍 Source Files

- `source/00-initial.html` - HTML structure
- `source/00-initial-styles.json` - Complete computed styles
- `source/00-initial-interactive.json` - Interactive elements
- `tokens/comprehensive-tokens.json` - All design tokens
- `components/structure.json` - Component tree structure

## 🚀 Next Steps for Implementation

1. ✅ Create `orphi.tokens.ts` with design tokens
2. ✅ Implement `GradientBackground` component
3. ✅ Build `LoginScreen` with exact styling
4. ✅ Create `AnimatedButton` for interactions
5. ⏳ Integrate with existing app logic
6. ⏳ Add actual form inputs/buttons to card
7. ⏳ Apply design system to other screens
8. ⏳ Test on multiple device sizes

## 💡 Design Philosophy

This design follows a **minimal, centered approach** with:
- Strong visual identity through bold gradient background
- Clean white card for content focus
- Theatrical theme (🎭 emoji, quote from "Wicked")
- Smooth transitions and subtle interactions
- Mobile-first responsive layout

---

**Generated**: 2025-12-11
**Tool**: Playwright Design Scraper
**Target Platform**: React Native (Expo)
