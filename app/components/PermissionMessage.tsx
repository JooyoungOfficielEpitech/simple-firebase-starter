/**
 * PermissionMessage - 권한 안내 메시지 컴포넌트
 * 
 * 사용자가 권한이 없는 기능에 접근했을 때 
 * 친화적이고 도움이 되는 안내 메시지를 제공합니다.
 */

import React from 'react'
import { View, ViewStyle, StyleProp, TouchableOpacity } from 'react-native'
import { useAppTheme } from '@/theme/context'
import { $styles } from '@/theme/styles'
import type { ThemedStyle } from '@/theme/types'
import { Text } from './Text'
import { Button } from './Button'
import { PermissionType, PermissionContext } from '@/hooks/usePermissions'
// import { useRouter } from 'expo-router' // TODO: Replace with React Navigation when needed

export type PermissionMessageType = 'info' | 'warning' | 'error' | 'guide' | 'action'

export interface PermissionMessageProps {
  /** 메시지 타입 */
  type?: PermissionMessageType
  /** 메시지 내용 */
  message: string
  /** 권한 타입 (액션 버튼 결정에 사용) */
  permission?: PermissionType
  /** 권한 컨텍스트 */
  context?: PermissionContext
  /** 커스텀 액션 버튼 */
  action?: {
    text: string
    onPress: () => void
  }
  /** 컴포넌트 스타일 */
  style?: StyleProp<ViewStyle>
  /** 메시지 숨김 여부 */
  hidden?: boolean
}

/**
 * 권한 관련 안내 메시지를 표시하는 컴포넌트
 * 
 * @example
 * <PermissionMessage 
 *   type="warning"
 *   message="프로필을 완성한 후 지원할 수 있습니다"
 *   permission="canApplyToPost"
 * />
 */
export function PermissionMessage({
  type = 'info',
  message,
  permission,
  context,
  action,
  style,
  hidden = false
}: PermissionMessageProps) {
  const { themed } = useAppTheme()
  // const router = useRouter() // TODO: Implement with React Navigation when needed

  if (hidden || !message) {
    return null
  }

  // 권한별 기본 액션 정의
  // TODO: Replace expo-router navigation with React Navigation
  const getDefaultAction = () => {
    // Temporarily disabled until React Navigation is implemented
    return null
    /*
    switch (permission) {
      case 'isAuthenticated':
        return {
          text: '로그인',
          onPress: () => router.push('/auth/signin')
        }

      case 'canApplyToPost':
        if (message.includes('프로필')) {
          return {
            text: '프로필 완성',
            onPress: () => router.push('/profile/edit')
          }
        }
        if (message.includes('로그인')) {
          return {
            text: '로그인',
            onPress: () => router.push('/auth/signin')
          }
        }
        break

      case 'canCreatePost':
        return {
          text: '운영자 정보 확인',
          onPress: () => router.push('/help/organizer-guide')
        }

      case 'canCreateOrganization':
        return {
          text: '계정 타입 확인',
          onPress: () => router.push('/profile/account-type')
        }

      default:
        return null
    }
    */
  }

  const defaultAction = getDefaultAction()
  const finalAction = action || defaultAction
  
  return (
    <View style={[themed($containerStyles[type]), style]}>
      {/* 아이콘 영역 */}
      <View style={themed($iconContainerStyles[type])}>
        <Text style={themed($iconStyles[type])}>
          {getIconForType(type)}
        </Text>
      </View>
      
      {/* 메시지 영역 */}
      <View style={themed($messageContainer)}>
        <Text 
          style={themed($messageStyles[type])}
          text={message}
        />
        
        {/* 액션 버튼 */}
        {finalAction && (
          <View style={themed($actionContainer)}>
            <Button
              preset="filled"
              text={finalAction.text}
              onPress={finalAction.onPress}
              style={themed($actionButtonStyles[type])}
              textStyle={themed($actionButtonTextStyles[type])}
            />
          </View>
        )}
      </View>
    </View>
  )
}

/**
 * 타입별 아이콘 반환
 */
function getIconForType(type: PermissionMessageType): string {
  switch (type) {
    case 'info':
      return 'ℹ️'
    case 'warning':
      return '⚠️'
    case 'error':
      return '❌'
    case 'guide':
      return '💡'
    case 'action':
      return '🔐'
    default:
      return 'ℹ️'
  }
}

// 스타일 정의
const $containerStyles: Record<PermissionMessageType, ThemedStyle<ViewStyle>> = {
  info: ({ colors, spacing }) => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.palette.neutral100,
    borderWidth: 1,
    borderColor: colors.palette.neutral300,
    borderRadius: 8,
    marginVertical: spacing.xs,
  }),
  
  warning: ({ colors, spacing }) => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFD54F',
    borderRadius: 8,
    marginVertical: spacing.xs,
  }),
  
  error: ({ colors, spacing }) => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF5350',
    borderRadius: 8,
    marginVertical: spacing.xs,
  }),
  
  guide: ({ colors, spacing }) => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#81C784',
    borderRadius: 8,
    marginVertical: spacing.xs,
  }),
  
  action: ({ colors, spacing }) => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#42A5F5',
    borderRadius: 8,
    marginVertical: spacing.xs,
  }),
}

const $iconContainerStyles: Record<PermissionMessageType, ThemedStyle<ViewStyle>> = {
  info: ({ spacing }) => ({
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  }),
  warning: ({ spacing }) => ({
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  }),
  error: ({ spacing }) => ({
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  }),
  guide: ({ spacing }) => ({
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  }),
  action: ({ spacing }) => ({
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  }),
}

const $iconStyles: Record<PermissionMessageType, ThemedStyle<any>> = {
  info: () => ({
    fontSize: 16,
  }),
  warning: () => ({
    fontSize: 16,
  }),
  error: () => ({
    fontSize: 16,
  }),
  guide: () => ({
    fontSize: 16,
  }),
  action: () => ({
    fontSize: 16,
  }),
}

const $messageContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $messageStyles: Record<PermissionMessageType, ThemedStyle<any>> = {
  info: ({ colors }) => ({
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  }),
  warning: () => ({
    color: '#F57F17',
    fontSize: 14,
    lineHeight: 20,
  }),
  error: () => ({
    color: '#D32F2F',
    fontSize: 14,
    lineHeight: 20,
  }),
  guide: () => ({
    color: '#2E7D32',
    fontSize: 14,
    lineHeight: 20,
  }),
  action: () => ({
    color: '#1976D2',
    fontSize: 14,
    lineHeight: 20,
  }),
}

const $actionContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $actionButtonStyles: Record<PermissionMessageType, ThemedStyle<ViewStyle>> = {
  info: ({ colors }) => ({
    backgroundColor: colors.palette.neutral600,
    paddingHorizontal: 16,
    paddingVertical: 8,
  }),
  warning: () => ({
    backgroundColor: '#FFA000',
    paddingHorizontal: 16,
    paddingVertical: 8,
  }),
  error: () => ({
    backgroundColor: '#E53935',
    paddingHorizontal: 16,
    paddingVertical: 8,
  }),
  guide: () => ({
    backgroundColor: '#43A047',
    paddingHorizontal: 16,
    paddingVertical: 8,
  }),
  action: () => ({
    backgroundColor: '#1976D2',
    paddingHorizontal: 16,
    paddingVertical: 8,
  }),
}

const $actionButtonTextStyles: Record<PermissionMessageType, ThemedStyle<any>> = {
  info: ({ colors }) => ({
    color: colors.palette.neutral100,
    fontSize: 14,
    fontWeight: 'medium',
  }),
  warning: () => ({
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'medium',
  }),
  error: () => ({
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'medium',
  }),
  guide: () => ({
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'medium',
  }),
  action: () => ({
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'medium',
  }),
}