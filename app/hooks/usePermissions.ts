/**
 * usePermissions - 중앙화된 권한 관리 시스템
 * 
 * 사용자의 권한을 체계적으로 관리하고 UI 분기 처리를 위한 커스텀 훅
 * 모든 권한 체크 로직을 중앙화하여 일관성과 유지보수성을 향상
 */

import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useProfile } from '@/context/ProfileContext'

export type PermissionType = 
  | 'isAuthenticated'
  | 'isOrganizer' 
  | 'isGeneral'
  | 'canCreatePost'
  | 'canEditPost'
  | 'canDeletePost'
  | 'canApplyToPost'
  | 'canManageApplications'
  | 'canCreateOrganization'
  | 'canManageOrganization'
  | 'canViewProfile'
  | 'canEditProfile'

export interface PermissionContext {
  postId?: string
  postAuthorId?: string
  organizationId?: string
  organizationOwnerId?: string
  targetUserId?: string
}

export interface UserPermissions {
  // 기본 권한
  isAuthenticated: boolean
  isOrganizer: boolean
  isGeneral: boolean
  
  // 게시글 관련 권한
  canCreatePost: boolean
  canEditPost: (postAuthorId: string) => boolean
  canDeletePost: (postAuthorId: string) => boolean
  canApplyToPost: boolean
  canManageApplications: (postAuthorId: string) => boolean
  
  // 조직 관련 권한
  canCreateOrganization: boolean
  canManageOrganization: (organizationOwnerId: string) => boolean
  
  // 프로필 관련 권한
  canViewProfile: boolean
  canEditProfile: (targetUserId: string) => boolean
  
  // 헬퍼 함수
  checkPermission: (permission: PermissionType, context?: PermissionContext) => boolean
  getPermissionReason: (permission: PermissionType, context?: PermissionContext) => string
}

/**
 * 권한 기반 UI 표시를 위한 중앙화된 권한 관리 훅
 */
export function usePermissions(): UserPermissions {
  const { user, profile } = useAuth()
  const { isProfileComplete } = useProfile()
  
  const permissions = useMemo((): UserPermissions => {
    const isAuthenticated = !!user
    const userType = profile?.userType
    const isOrganizer = userType === 'organizer'
    const isGeneral = userType === 'general'
    const userId = user?.uid
    
    return {
      // 기본 권한
      isAuthenticated,
      isOrganizer,
      isGeneral,
      
      // 게시글 관련 권한
      canCreatePost: isAuthenticated && isOrganizer,
      
      canEditPost: (postAuthorId: string) => {
        return isAuthenticated && userId === postAuthorId
      },
      
      canDeletePost: (postAuthorId: string) => {
        return isAuthenticated && userId === postAuthorId
      },
      
      canApplyToPost: isAuthenticated && isGeneral && isProfileComplete,
      
      canManageApplications: (postAuthorId: string) => {
        return isAuthenticated && userId === postAuthorId
      },
      
      // 조직 관련 권한
      canCreateOrganization: isAuthenticated && isGeneral,
      
      canManageOrganization: (organizationOwnerId: string) => {
        return isAuthenticated && userId === organizationOwnerId
      },
      
      // 프로필 관련 권한
      canViewProfile: isAuthenticated,
      
      canEditProfile: (targetUserId: string) => {
        return isAuthenticated && userId === targetUserId
      },
      
      // 헬퍼 함수
      checkPermission: (permission: PermissionType, context?: PermissionContext): boolean => {
        switch (permission) {
          case 'isAuthenticated':
            return isAuthenticated
            
          case 'isOrganizer':
            return isOrganizer
            
          case 'isGeneral':
            return isGeneral
            
          case 'canCreatePost':
            return isAuthenticated && isOrganizer
            
          case 'canEditPost':
            return context?.postAuthorId ? 
              isAuthenticated && userId === context.postAuthorId : false
              
          case 'canDeletePost':
            return context?.postAuthorId ? 
              isAuthenticated && userId === context.postAuthorId : false
              
          case 'canApplyToPost':
            return isAuthenticated && isGeneral && isProfileComplete
            
          case 'canManageApplications':
            return context?.postAuthorId ? 
              isAuthenticated && userId === context.postAuthorId : false
              
          case 'canCreateOrganization':
            return isAuthenticated && isGeneral
            
          case 'canManageOrganization':
            return context?.organizationOwnerId ? 
              isAuthenticated && userId === context.organizationOwnerId : false
              
          case 'canViewProfile':
            return isAuthenticated
            
          case 'canEditProfile':
            return context?.targetUserId ? 
              isAuthenticated && userId === context.targetUserId : false
              
          default:
            return false
        }
      },
      
      getPermissionReason: (permission: PermissionType, context?: PermissionContext): string => {
        if (!isAuthenticated) {
          return '로그인이 필요합니다'
        }
        
        switch (permission) {
          case 'canCreatePost':
            return isOrganizer ? '' : '운영자만 게시글을 작성할 수 있습니다'
            
          case 'canApplyToPost':
            if (!isGeneral) return '일반 사용자만 지원할 수 있습니다'
            if (!isProfileComplete) return '프로필을 완성한 후 지원할 수 있습니다'
            return ''
            
          case 'canCreateOrganization':
            return isGeneral ? '' : '일반 사용자만 단체를 생성할 수 있습니다'
            
          case 'canEditPost':
          case 'canDeletePost':
            return context?.postAuthorId === userId ? '' : '게시글 작성자만 수정/삭제할 수 있습니다'
            
          case 'canManageApplications':
            return context?.postAuthorId === userId ? '' : '게시글 작성자만 지원서를 관리할 수 있습니다'
            
          case 'canManageOrganization':
            return context?.organizationOwnerId === userId ? '' : '단체 소유자만 관리할 수 있습니다'
            
          case 'canEditProfile':
            return context?.targetUserId === userId ? '' : '본인의 프로필만 수정할 수 있습니다'
            
          default:
            return '권한이 없습니다'
        }
      }
    }
  }, [user, profile, isProfileComplete])
  
  return permissions
}

/**
 * 권한 체크 헬퍼 함수들
 */
export const PermissionHelpers = {
  /**
   * 여러 권한 중 하나라도 만족하는지 확인
   */
  hasAnyPermission: (
    permissions: UserPermissions, 
    requiredPermissions: Array<{ type: PermissionType; context?: PermissionContext }>
  ): boolean => {
    return requiredPermissions.some(({ type, context }) => 
      permissions.checkPermission(type, context)
    )
  },
  
  /**
   * 모든 권한을 만족하는지 확인
   */
  hasAllPermissions: (
    permissions: UserPermissions, 
    requiredPermissions: Array<{ type: PermissionType; context?: PermissionContext }>
  ): boolean => {
    return requiredPermissions.every(({ type, context }) => 
      permissions.checkPermission(type, context)
    )
  },
  
  /**
   * 권한 없음 사유를 모두 수집
   */
  getPermissionReasons: (
    permissions: UserPermissions, 
    requiredPermissions: Array<{ type: PermissionType; context?: PermissionContext }>
  ): string[] => {
    return requiredPermissions
      .map(({ type, context }) => permissions.getPermissionReason(type, context))
      .filter(reason => reason.length > 0)
  }
}