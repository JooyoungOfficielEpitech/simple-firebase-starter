import React, { useState, useEffect } from "react"
import { View, Text } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"
import { useAppTheme } from "@/theme/context"
import auth from "@react-native-firebase/auth"
import { notificationService } from "@/services/firestore/notificationService"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>

export const BulletinBoardScreenSimple = () => {
  // 기본 hooks
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const { themed, theme: { colors, spacing } } = useAppTheme()
  
  // 5단계: 원본 컴포넌트의 useState들 하나씩 추가
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('announcements')
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // 첫 번째 useEffect: 간단한 테스트
  useEffect(() => {
    console.log('🧪 [Test] 첫 번째 useEffect 실행됨')
    setLoading(false) // 로딩 상태 변경
    
    return () => {
      console.log('🧪 [Test] 첫 번째 useEffect 정리됨')
    }
  }, [])

  // 두 번째 useEffect: selectedOrganizationId 의존성 테스트
  useEffect(() => {
    console.log('🧪 [Test] 두 번째 useEffect 실행됨, selectedOrganizationId:', selectedOrganizationId)
    
    if (selectedOrganizationId) {
      setFilteredPosts([{ id: 'test', title: 'Test Post' }])
    } else {
      setFilteredPosts([])
    }
    
    return () => {
      console.log('🧪 [Test] 두 번째 useEffect 정리됨')
    }
  }, [selectedOrganizationId])

  // 세 번째 useEffect: 실제 Firebase notification service 테스트
  useEffect(() => {
    let unsubscribe = null
    
    const currentUser = auth().currentUser
    console.log('🧪 [Test] 실제 Firebase auth 확인:', currentUser ? 'Logged in' : 'Not logged in')
    
    if (currentUser) {
      console.log('🧪 [Test] 알림 구독 시작:', currentUser.uid)
      
      unsubscribe = notificationService.subscribeToUnreadCount(
        currentUser.uid,
        (count) => {
          console.log('🧪 [Test] 읽지 않은 알림 수 업데이트:', count)
          setUnreadCount(count)
        }
      )
    } else {
      setUnreadCount(0)
    }

    return () => {
      if (unsubscribe) {
        console.log('🧪 [Test] 알림 구독 해제')
        unsubscribe()
      }
    }
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, paddingTop: top }}>
      <Text style={{ fontSize: 18, color: colors.text }}>
        Testing useState Addition
      </Text>
      <Text style={{ fontSize: 14, color: colors.textDim, marginTop: 10 }}>
        Step 3: Added {posts.length} posts, {organizations.length} orgs
      </Text>
      <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 5 }}>
        Loading: {loading ? 'Yes' : 'No'} | Top: {top}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 5 }}>
        Active Tab: {activeTab} | Unread: {unreadCount}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 5 }}>
        Navigation ready: {navigation ? 'Yes' : 'No'}
      </Text>
    </View>
  )
}