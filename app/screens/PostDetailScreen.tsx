import React, { useEffect, useState } from "react"
import { View, Alert, TouchableOpacity, Share } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"

import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { postService, userService } from "@/services/firestore"
import { useAppTheme } from "@/theme/context"
import { Post } from "@/types/post"
import { UserProfile } from "@/types/user"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>
type RoutePropType = RouteProp<BulletinBoardStackParamList, "PostDetail">

export const PostDetailScreen = () => {
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RoutePropType>()
  const { postId } = route.params
  
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  // const [isFavorite, setIsFavorite] = useState(false) // Unused for now

  useEffect(() => {
    console.log('🎯 [PostDetailScreen] useEffect 시작, postId:', postId)
    
    // 사용자 프로필 로드
    const loadUserProfile = async () => {
      try {
        console.log('👤 [PostDetailScreen] 사용자 프로필 로드 시작')
        const profile = await userService.getUserProfile()
        console.log('👤 [PostDetailScreen] 사용자 프로필 로드 완료:', profile)
        setUserProfile(profile)
      } catch (error) {
        console.error("❌ [PostDetailScreen] 사용자 프로필 로드 오류:", error)
      }
    }

    loadUserProfile()

    // 게시글 실시간 구독
    console.log('📱 [PostDetailScreen] 게시글 구독 시작')
    const unsubscribe = postService.subscribeToPost(postId, (post) => {
      console.log('📱 [PostDetailScreen] 게시글 콜백 호출됨')
      console.log('📱 [PostDetailScreen] 받은 게시글:', post)
      
      if (post) {
        console.log('📱 [PostDetailScreen] 게시글 필드 확인:')
        console.log('  - roles:', post.roles)
        console.log('  - audition:', post.audition)
        console.log('  - performance:', post.performance)
        console.log('  - benefits:', post.benefits)
        console.log('  - contact:', post.contact)
        console.log('  - deadline:', post.deadline)
        console.log('  - totalApplicants:', post.totalApplicants)
        console.log('  - viewCount:', post.viewCount)
      }
      
      setPost(post)
      setLoading(false)
    })

    return unsubscribe
  }, [postId])

  const handleDelete = () => {
    Alert.alert(
      "게시글 삭제",
      "정말로 이 게시글을 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await postService.deletePost(postId)
              Alert.alert("삭제 완료", "게시글이 삭제되었습니다.", [
                {
                  text: "확인",
                  onPress: () => navigation.goBack(),
                },
              ])
            } catch (error) {
              const errorMessage = error.message || "게시글 삭제에 실패했습니다."
              Alert.alert("삭제 실패", errorMessage)
            }
          },
        },
      ],
    )
  }

  const handleStatusToggle = async () => {
    if (!post) return
    
    const newStatus = post.status === "active" ? "closed" : "active"
    const statusText = newStatus === "active" ? "모집 재개" : "모집 중지"
    
    Alert.alert(
      `게시글 ${statusText}`,
      `이 게시글을 ${statusText}하시겠습니까?`,
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: statusText,
          onPress: async () => {
            try {
              await postService.updatePostStatus(postId, newStatus)
              Alert.alert("완료", `게시글이 ${statusText}되었습니다.`)
            } catch (error) {
              const errorMessage = error.message || `${statusText}에 실패했습니다.`
              Alert.alert(`${statusText} 실패`, errorMessage)
            }
          },
        },
      ],
    )
  }

  const isMyPost = post && userProfile && post.authorId === userProfile.uid && userProfile.userType === "organizer"

  // 렌더링 상태 디버그
  console.log('🎨 [PostDetailScreen] 렌더링 상태:')
  console.log('  - loading:', loading)
  console.log('  - post:', post ? 'EXISTS' : 'NULL')
  console.log('  - userProfile:', userProfile ? 'EXISTS' : 'NULL')
  console.log('  - isMyPost:', isMyPost)
  
  if (post) {
    console.log('🎨 [PostDetailScreen] 게시글 상세:')
    console.log('  - ID:', post.id)
    console.log('  - 제목:', post.title)
    console.log('  - 새로운 필드들 존재 여부:')
    console.log('    • roles:', !!post.roles, post.roles?.length || 0)
    console.log('    • audition:', !!post.audition)
    console.log('    • performance:', !!post.performance)
    console.log('    • benefits:', !!post.benefits)
    console.log('    • contact:', !!post.contact)
    console.log('    • deadline:', !!post.deadline)
  }

  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <ScreenHeader title="게시글" />
        <View style={themed($container)}>
          <View style={themed($centerContainer) as any}>
            <Text text="로딩 중..." />
          </View>
        </View>
      </Screen>
    )
  }

  if (!post) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <ScreenHeader title="게시글" />
        <View style={themed($container)}>
          <View style={themed($centerContainer) as any}>
            <Text text="게시글을 찾을 수 없습니다." />
          </View>
        </View>
      </Screen>
    )
  }

  console.log('🎨 [PostDetailScreen] 메인 렌더 시작')
  
  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScreenHeader title="게시글" />
      <View style={themed($container)}>
        {/* 기본 정보 */}
        <Text preset="heading" text={post.title} style={themed($postTitle)} />
        <Text text={post.production} style={themed($productionText) as any} />
        <Text text={post.organizationName} style={themed($organizationText) as any} />
        
        {/* 상세 설명 */}
        <View style={themed($section)}>
          <Text preset="subheading" text="상세 설명" style={themed($sectionTitle)} />
          <Text text={post.description} style={themed($descriptionText)} />
        </View>

        {/* 모집 역할 */}
        {post.roles && post.roles.length > 0 && (
          <View style={themed($section)}>
            <Text preset="subheading" text="모집 역할" style={themed($sectionTitle)} />
            {post.roles.map((role, index) => (
              <View key={index} style={themed($roleCard)}>
                <Text text={`${role.name} (${role.count}명)`} style={themed($roleName) as any} />
                <Text text={`${role.ageRange} / ${role.gender === 'male' ? '남성' : role.gender === 'female' ? '여성' : '무관'}`} style={themed($roleDetail)} />
                <Text text={role.requirements} style={themed($roleRequirements)} />
              </View>
            ))}
          </View>
        )}

        {/* 오디션 정보 */}
        {post.audition && (
          <View style={themed($section)}>
            <Text preset="subheading" text="오디션 정보" style={themed($sectionTitle)} />
            <Text text={`일정: ${post.audition.date}`} style={themed($infoText)} />
            <Text text={`장소: ${post.audition.location}`} style={themed($infoText)} />
            <Text text={`방식: ${post.audition.method}`} style={themed($infoText)} />
          </View>
        )}

        {/* 연락처 */}
        {post.contact && (
          <View style={themed($section)}>
            <Text preset="subheading" text="연락처" style={themed($sectionTitle)} />
            <Text text={post.contact.email} style={themed($contactText) as any} />
            {post.contact.phone && <Text text={post.contact.phone} style={themed($infoText)} />}
          </View>
        )}

        {/* 운영자 버튼 */}
        {isMyPost && (
          <View style={themed($actionButtonsContainer)}>
            <TouchableOpacity
              style={themed($statusButton)}
              onPress={handleStatusToggle}
            >
              <Text
                text={post.status === "active" ? "모집 중지" : "모집 재개"}
                style={themed($statusButtonText)}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={themed($deleteButton)}
              onPress={handleDelete}
            >
              <Text text="삭제" style={themed($deleteButtonText)} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Screen>
  )
}

const $container = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.lg,
})

const $centerContainer = {
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
}

const $postTitle = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.lg,
})

const $section = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $sectionTitle = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.xs,
})

const $productionText = ({ colors }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "600" as const,
})

const $organizationText = ({ colors }) => ({
  color: colors.tint,
  fontSize: 16,
  fontWeight: "500" as const,
})

const $infoText = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  lineHeight: 24,
})

const $descriptionText = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  lineHeight: 24,
})

// Role-related styles
const $roleCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.md,
  marginBottom: spacing.sm,
})

const $roleName = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "600" as const,
})

const $roleDetail = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginBottom: 2,
})

const $roleRequirements = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 14,
  marginTop: spacing.xs,
})

const $contactText = ({ colors }) => ({
  color: colors.tint,
  fontSize: 16,
  fontWeight: "500" as const,
})

// Action button styles
const $actionButtonsContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  marginTop: spacing.lg,
  gap: spacing.md,
})

const $statusButton = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.tint,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  borderRadius: 8,
  alignItems: "center" as const,
})

const $statusButtonText = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  fontWeight: "600" as const,
})

const $deleteButton = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.palette.angry500,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  borderRadius: 8,
  alignItems: "center" as const,
})

const $deleteButtonText = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  fontWeight: "600" as const,
})