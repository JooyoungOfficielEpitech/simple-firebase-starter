# DevSettings Quick Reference Guide

## File Overview

### Main Entry Point
- **DevSettingsScreen.tsx** (192 lines)
  - Imports hooks and components
  - Handles navigation and top-level state
  - Composes UI from section components

## Custom Hooks

### useDevSettings
**Purpose**: Token management and debug logging
**Location**: `hooks/useDevSettings.ts`
**Returns**:
```typescript
{
  isLoading: boolean
  allUserTokens: string[]
  debugLogs: string[]
  addLog: (message: string) => void
  copyToClipboard: (text: string, label: string) => Promise<void>
  loadAllUserTokens: (userId: string) => Promise<void>
  cleanupOldTokens: () => Promise<void>
  cleanupDuplicateTokens: (userId: string) => void
  deactivateAllTokens: (userId: string) => void
  clearLogs: () => void
}
```

### usePerformanceMonitoring
**Purpose**: Track app performance metrics
**Location**: `hooks/usePerformanceMonitoring.ts`
**Parameters**: `addLog: (message: string) => void`
**Returns**:
```typescript
{
  performanceStats: {
    memoryUsage: number
    jsHeapSize: number
    appStateChanges: number
    lastCrash: string | null
    freezeCount: number
    backgroundTime: number
  }
  lastAppState: string
  resetStats: () => void
}
```

### useTrackPlayerDebug
**Purpose**: TrackPlayer testing and debugging
**Location**: `hooks/useTrackPlayerDebug.ts`
**Parameters**: `addLog: (message: string) => void`
**Returns**:
```typescript
{
  trackPlayerInfo: {
    initialized: boolean
    state: string
    currentTrack: any
    queueLength: number
  }
  checkStatus: () => Promise<void>
  testPlayer: () => Promise<void>
}
```

## Base Components

### SettingSection
**Purpose**: Reusable card wrapper for settings sections
**Props**:
```typescript
{
  title: string
  children: ReactNode
  colors: any
  spacing: any
}
```

### SettingButton
**Purpose**: Reusable action button with loading state
**Props**:
```typescript
{
  onPress: () => void
  label: string
  backgroundColor?: string
  disabled?: boolean
  loading?: boolean
  spacing: any
}
```

### InfoRow
**Purpose**: Display key-value pairs
**Props**:
```typescript
{
  label: string
  value: string
  valueColor?: string
  colors: any
  spacing: any
}
```

## Feature Sections

### PushStatusSection
**Shows**: Push notification permission and FCM token status
**Props**: `isPushNotificationEnabled, fcmToken, isLoading, onRequestPermission, colors, spacing`

### PerformanceMonitorSection
**Shows**: Performance metrics, freeze detection, app state changes
**Props**: `stats, lastAppState, onReset, colors, spacing`

### TrackPlayerStatusSection
**Shows**: TrackPlayer initialization, state, queue info
**Props**: `trackPlayerInfo, playbackState, onTest, onRefresh, colors, spacing`

### FCMTokenSection
**Shows**: FCM token with copy/share and navigation buttons
**Props**: `fcmToken, onCopy, onSendTest, onNavigate*, colors, spacing`

### TokenManagementSection
**Shows**: Token CRUD operations (load, cleanup, deactivate)
**Props**: `isLoading, tokenCount, onLoadTokens, onCleanupOld, onCleanupDuplicate, onDeactivateAll, colors, spacing`

### UsageGuideSection
**Shows**: Instructions for using Firebase Console
**Props**: `colors, spacing`

### DebugLogsSection
**Shows**: Real-time debug logs with clear button
**Props**: `logs, onClear, colors, spacing`

## Common Tasks

### Adding a New Setting Section
1. Create component in `components/` folder
2. Define props interface
3. Use `SettingSection`, `InfoRow`, `SettingButton` as needed
4. Export from `components/index.ts`
5. Import and use in `DevSettingsScreen.tsx`

### Adding a New Metric to Performance Monitor
1. Update `PerformanceStats` interface in `hooks/usePerformanceMonitoring.ts`
2. Add tracking logic in `useEffect`
3. Update `PerformanceMonitorSection.tsx` to display new metric

### Adding a New Button Action
1. Add handler function in `DevSettingsScreen.tsx`
2. Pass as prop to appropriate section component
3. Add `SettingButton` in section component

### Modifying Styles
1. Edit `styles/index.ts`
2. Styles are theme-aware via `colors` and `spacing` props

## Import Patterns

### Using Hooks
```typescript
import { useDevSettings, usePerformanceMonitoring } from './DevSettings/hooks'
```

### Using Components
```typescript
import { 
  SettingSection, 
  SettingButton,
  PushStatusSection 
} from './DevSettings/components'
```

### Using Styles
```typescript
import { createDevSettingsStyles } from './DevSettings/styles'
```

## Testing

### Test a Hook
```typescript
import { renderHook } from '@testing-library/react-hooks'
import { useDevSettings } from './hooks/useDevSettings'

test('addLog adds entry', () => {
  const { result } = renderHook(() => useDevSettings())
  act(() => result.current.addLog('test'))
  expect(result.current.debugLogs).toContain('test')
})
```

### Test a Component
```typescript
import { render, fireEvent } from '@testing-library/react-native'
import { SettingButton } from './components/SettingButton'

test('button calls onPress', () => {
  const onPress = jest.fn()
  const { getByText } = render(
    <SettingButton onPress={onPress} label="Test" spacing={{md: 8}} />
  )
  fireEvent.press(getByText('Test'))
  expect(onPress).toHaveBeenCalled()
})
```

## File Size Reference
- Main file: 192 lines (down from 925)
- Hooks: 117, 112, 93 lines
- Components: 30-76 lines each
- Total: 16 files, ~1,206 lines organized
