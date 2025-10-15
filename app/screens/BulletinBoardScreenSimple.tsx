import React, { useEffect } from "react"
import { View, Text } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"
import { useAppTheme } from "@/theme/context"
import auth from "@react-native-firebase/auth"
import { notificationService } from "@/services/firestore/notificationService"
import { useBulletinBoardState, useBulletinBoardPerformance } from "@/hooks/useBulletinBoardState"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>

export const BulletinBoardScreenSimple = () => {
  // 기본 hooks
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const { themed, theme: { colors, spacing } } = useAppTheme()
  
  // useReducer 기반 상태 관리로 교체
  const { state, actions, isOrganizer, displayPosts, headerTitle } = useBulletinBoardState()
  const { logRenderTime } = useBulletinBoardPerformance()
  
  // 구조분해로 필요한 상태만 추출
  const {
    posts,
    filteredPosts,
    organizations,
    loading,
    userProfile,
    error,
    activeTab,
    selectedOrganizationId,
    unreadCount
  } = state

  // useReducer로 상태 관리 개선된 useEffect들
  
  // 첫 번째 useEffect: 초기 로딩 상태 설정
  useEffect(() => {
    console.log('🧪 [useReducer] 첫 번째 useEffect 실행됨')
    actions.setLoading(false) // action으로 상태 변경
    
    return () => {
      console.log('🧪 [useReducer] 첫 번째 useEffect 정리됨')
    }
  }, [actions])

  // 두 번째 useEffect: selectedOrganizationId 의존성 테스트  
  useEffect(() => {
    console.log('🧪 [useReducer] 두 번째 useEffect 실행됨, selectedOrganizationId:', selectedOrganizationId)
    
    if (selectedOrganizationId) {
      actions.setFilteredPosts([{ id: 'test', title: 'Test Post' } as any])
    } else {
      actions.setFilteredPosts([])
    }
    
    return () => {
      console.log('🧪 [useReducer] 두 번째 useEffect 정리됨')
    }
  }, [selectedOrganizationId, actions])

  // 세 번째 useEffect: Firebase notification service 테스트
  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    
    const currentUser = auth().currentUser
    console.log('🧪 [useReducer] 실제 Firebase auth 확인:', currentUser ? 'Logged in' : 'Not logged in')
    
    if (currentUser) {
      console.log('🧪 [useReducer] 알림 구독 시작:', currentUser.uid)
      
      unsubscribe = notificationService.subscribeToUnreadCount(
        currentUser.uid,
        (count) => {
          console.log('🧪 [useReducer] 읽지 않은 알림 수 업데이트:', count)
          actions.setUnreadCount(count)
        }
      )
    } else {
      actions.setUnreadCount(0)
    }

    return () => {
      if (unsubscribe) {
        console.log('🧪 [useReducer] 알림 구독 해제')
        unsubscribe()
      }
    }
  }, [actions])

  // 성능 모니터링
  useEffect(() => {
    logRenderTime('BulletinBoardScreenSimple')
  })

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, paddingTop: top }}>
      <Text style={{ fontSize: 18, color: colors.text }}>
        🚀 useReducer Pattern Applied
      </Text>
      <Text style={{ fontSize: 14, color: colors.textDim, marginTop: 10 }}>
        Posts: {posts.length} | Organizations: {organizations.length}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 5 }}>
        Loading: {loading ? 'Yes' : 'No'} | Error: {error || 'None'}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 5 }}>
        Active Tab: {activeTab} | Unread: {unreadCount}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 5 }}>
        Selected Org: {selectedOrganizationId || 'None'}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 5 }}>
        Is Organizer: {isOrganizer ? 'Yes' : 'No'}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 5 }}>
        Display Posts: {displayPosts.length} | Header: {headerTitle}
      </Text>
      <Text style={{ fontSize: 10, color: colors.palette.secondary500, marginTop: 10 }}>
        ✅ Optimized with useReducer + useCallback
      </Text>
    </View>
  )
}