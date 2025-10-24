/**
 * PermissionGate - 권한 기반 조건부 렌더링 컴포넌트
 * 
 * 사용자의 권한에 따라 자식 컴포넌트를 조건부로 렌더링하며,
 * 권한이 없는 경우 적절한 fallback UI를 제공합니다.
 */

import React from 'react'
import { View, ViewStyle, StyleProp } from 'react-native'
import { usePermissions, PermissionType, PermissionContext, PermissionHelpers } from '@/hooks/usePermissions'
import { PermissionMessage, PermissionMessageType } from './PermissionMessage'

export interface PermissionGateProps {
  /** 필요한 권한 타입 */
  permission?: PermissionType
  /** 권한 체크에 필요한 컨텍스트 정보 */
  context?: PermissionContext
  /** 여러 권한 중 하나라도 만족하면 허용 */
  anyOf?: Array<{ type: PermissionType; context?: PermissionContext }>
  /** 모든 권한을 만족해야 허용 */
  allOf?: Array<{ type: PermissionType; context?: PermissionContext }>
  /** 권한이 있을 때 렌더링할 컴포넌트 */
  children: React.ReactNode
  /** 권한이 없을 때 렌더링할 컴포넌트 (기본: PermissionMessage) */
  fallback?: React.ReactNode
  /** 권한이 없을 때 아무것도 렌더링하지 않음 */
  hideOnDenied?: boolean
  /** 권한 메시지 타입 (fallback이 없을 때 사용) */
  messageType?: PermissionMessageType
  /** 커스텀 스타일 */
  style?: StyleProp<ViewStyle>
  /** 로딩 중일 때 렌더링할 컴포넌트 */
  loadingComponent?: React.ReactNode
}

/**
 * 권한 기반 조건부 렌더링을 제공하는 컴포넌트
 * 
 * @example
 * // 단일 권한 체크
 * <PermissionGate permission="canCreatePost">
 *   <Button text="게시글 작성" />
 * </PermissionGate>
 * 
 * @example
 * // 컨텍스트가 필요한 권한 체크
 * <PermissionGate 
 *   permission="canEditPost" 
 *   context={{ postAuthorId: post.authorId }}
 * >
 *   <Button text="수정" />
 * </PermissionGate>
 * 
 * @example
 * // 여러 권한 중 하나라도 만족
 * <PermissionGate anyOf={[
 *   { type: 'canEditPost', context: { postAuthorId: post.authorId } },
 *   { type: 'isOrganizer' }
 * ]}>
 *   <Button text="관리" />
 * </PermissionGate>
 * 
 * @example
 * // 권한 없을 때 숨김
 * <PermissionGate permission="canCreatePost" hideOnDenied>
 *   <FAB />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  context,
  anyOf,
  allOf,
  children,
  fallback,
  hideOnDenied = false,
  messageType = 'info',
  style,
  loadingComponent
}: PermissionGateProps) {
  const permissions = usePermissions()
  
  // 로딩 상태 처리 (사용자 정보가 아직 로드되지 않은 경우)
  if (!permissions.isAuthenticated && loadingComponent) {
    return <>{loadingComponent}</>
  }
  
  // 권한 체크 로직
  const hasPermission = React.useMemo(() => {
    // anyOf 조건 체크
    if (anyOf) {
      return PermissionHelpers.hasAnyPermission(permissions, anyOf)
    }
    
    // allOf 조건 체크
    if (allOf) {
      return PermissionHelpers.hasAllPermissions(permissions, allOf)
    }
    
    // 단일 권한 체크
    if (permission) {
      return permissions.checkPermission(permission, context)
    }
    
    // 권한 조건이 없으면 허용
    return true
  }, [permissions, permission, context, anyOf, allOf])
  
  // 권한이 있으면 자식 컴포넌트 렌더링
  if (hasPermission) {
    return (
      <View style={style}>
        {children}
      </View>
    )
  }
  
  // 권한이 없을 때 숨김 처리
  if (hideOnDenied) {
    return null
  }
  
  // 커스텀 fallback이 있으면 사용
  if (fallback) {
    return (
      <View style={style}>
        {fallback}
      </View>
    )
  }
  
  // 기본 권한 메시지 표시
  const deniedReason = React.useMemo(() => {
    if (anyOf) {
      const reasons = PermissionHelpers.getPermissionReasons(permissions, anyOf)
      return reasons[0] || '권한이 없습니다'
    }
    
    if (allOf) {
      const reasons = PermissionHelpers.getPermissionReasons(permissions, allOf)
      return reasons[0] || '권한이 없습니다'
    }
    
    if (permission) {
      return permissions.getPermissionReason(permission, context)
    }
    
    return '권한이 없습니다'
  }, [permissions, permission, context, anyOf, allOf])
  
  return (
    <View style={style}>
      <PermissionMessage 
        type={messageType}
        message={deniedReason}
        permission={permission}
        context={context}
      />
    </View>
  )
}

/**
 * 권한 체크만 수행하는 훅 (UI 렌더링 없음)
 */
export function usePermissionCheck(
  permission: PermissionType,
  context?: PermissionContext
): {
  hasPermission: boolean
  reason: string
} {
  const permissions = usePermissions()
  
  return React.useMemo(() => ({
    hasPermission: permissions.checkPermission(permission, context),
    reason: permissions.getPermissionReason(permission, context)
  }), [permissions, permission, context])
}

/**
 * 여러 권한을 체크하는 훅
 */
export function useMultiplePermissionCheck(
  requiredPermissions: Array<{ type: PermissionType; context?: PermissionContext }>,
  operator: 'any' | 'all' = 'all'
): {
  hasPermission: boolean
  reasons: string[]
} {
  const permissions = usePermissions()
  
  return React.useMemo(() => {
    const hasPermission = operator === 'any' 
      ? PermissionHelpers.hasAnyPermission(permissions, requiredPermissions)
      : PermissionHelpers.hasAllPermissions(permissions, requiredPermissions)
      
    const reasons = PermissionHelpers.getPermissionReasons(permissions, requiredPermissions)
    
    return { hasPermission, reasons }
  }, [permissions, requiredPermissions, operator])
}