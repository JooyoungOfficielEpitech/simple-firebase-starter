import React, { useEffect, useState } from "react"
import { View, ScrollView, Alert, TouchableOpacity, Share } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
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
  const [isFavorite, setIsFavorite] = useState(false)

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

  const handleEdit = () => {
    navigation.navigate("CreatePost", { postId, isEdit: true })
  }

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
              navigation.goBack()
            } catch (error) {
              Alert.alert("오류", "게시글 삭제 중 오류가 발생했습니다.")
            }
          },
        },
      ],
    )
  }

  const handleStatusToggle = async () => {
    if (!post) return

    const newStatus = post.status === "active" ? "closed" : "active"
    const statusText = newStatus === "active" ? "모집 재개" : "모집 마감"

    Alert.alert(
      statusText,
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
            } catch (error) {
              Alert.alert("오류", "상태 변경 중 오류가 발생했습니다.")
            }
          },
        },
      ],
    )
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // TODO: 실제 즐겨찾기 기능 구현 (Firebase에 저장)
    Alert.alert(
      isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가",
      isFavorite ? "즐겨찾기에서 제거되었습니다." : "즐겨찾기에 추가되었습니다."
    )
  }

  const handleShare = async () => {
    if (!post) return

    try {
      const message = `${post.title}\n\n${post.production} - ${post.organizationName}\n연습: ${post.rehearsalSchedule}\n장소: ${post.location}\n\n${post.description}`
      
      await Share.share({
        message,
        title: post.title,
      })
    } catch (error) {
      console.error("공유 오류:", error)
    }
  }

  const handleContact = () => {
    if (!post?.contact) return

    Alert.alert(
      "연락하기",
      `담당자에게 연락하시겠습니까?\n\n이메일: ${post.contact.email}${post.contact.phone ? `\n전화: ${post.contact.phone}` : ''}`,
      [
        { text: "취소", style: "cancel" },
        { 
          text: "이메일", 
          onPress: () => {
            // TODO: 이메일 앱 연동
            Alert.alert("안내", `${post.contact?.email}로 연락해주세요.`)
          }
        },
        ...(post.contact.phone ? [{
          text: "전화",
          onPress: () => {
            // TODO: 전화 앱 연동
            Alert.alert("안내", `${post.contact.phone}로 연락해주세요.`)
          }
        }] : [])
      ]
    )
  }

  const isMyPost = post && userProfile && post.authorId === userProfile.uid

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
        <View style={themed([$container, { paddingTop: top + spacing.lg }])}>
          <View style={themed($header)}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon icon="caretLeft" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text preset="heading" text="게시글" style={themed($title)} />
            <View style={{ width: 24 }} />
          </View>
          <View style={themed($centerContainer)}>
            <Text text="로딩 중..." />
          </View>
        </View>
      </Screen>
    )
  }

  if (!post) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed([$container, { paddingTop: top + spacing.lg }])}>
          <View style={themed($header)}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon icon="caretLeft" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text preset="heading" text="게시글" style={themed($title)} />
            <View style={{ width: 24 }} />
          </View>
          <View style={themed($centerContainer)}>
            <Text text="게시글을 찾을 수 없습니다." />
          </View>
        </View>
      </Screen>
    )
  }

  console.log('🎨 [PostDetailScreen] 메인 렌더 시작')
  
  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <View style={themed([$container, { paddingTop: top + spacing.lg }])}>
        {/* 헤더 */}
        <View style={themed($header)}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon icon="caretLeft" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text preset="heading" text="게시글" style={themed($title)} />
          <View style={{ width: 24 }} />
        </View>
        {/* 기본 정보 */}
        <Text preset="heading" text={post.title} style={themed($postTitle)} />
        <Text text={post.production} style={themed($productionText)} />
        <Text text={post.organizationName} style={themed($organizationText)} />
        
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
                <Text text={`${role.name} (${role.count}명)`} style={themed($roleName)} />
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
            <Text text={post.contact.email} style={themed($contactText)} />
            {post.contact.phone && <Text text={post.contact.phone} style={themed($infoText)} />}
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

const $header = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.lg,
})

const $title = ({ colors }) => ({
  color: colors.text,
})

const $scrollView = {
  flex: 1,
}

const $centerContainer = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $statusContainer = ({ spacing }) => ({
  alignItems: "flex-start",
  marginBottom: spacing.md,
})

const $statusBadge = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 8,
})

const $activeBadge = ({ colors }) => ({
  backgroundColor: colors.tint + "20",
})

const $closedBadge = ({ colors }) => ({
  backgroundColor: colors.textDim + "20",
})

const $statusText = {
  fontSize: 14,
  fontWeight: "bold",
}

const $activeText = ({ colors }) => ({
  color: colors.tint,
})

const $closedText = ({ colors }) => ({
  color: colors.textDim,
})

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

const $productionText = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "600",
})

const $organizationText = ({ colors }) => ({
  color: colors.tint,
  fontSize: 16,
  fontWeight: "500",
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

const $tagsContainer = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: spacing.xs,
})

const $tag = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 6,
  marginRight: spacing.xs,
  marginBottom: spacing.xs,
})

const $tagText = ({ colors }) => ({
  color: colors.palette.neutral600,
  fontSize: 14,
})

const $actionSection = ({ spacing }) => ({
  marginTop: spacing.lg,
  marginBottom: spacing.xl,
})

const $actionButton = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $buttonRow = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
})

const $halfButton = {
  flex: 0.48,
}

const $editButton = ({ colors }) => ({
  borderColor: colors.tint,
})

const $deleteButton = ({ colors }) => ({
  borderColor: colors.error,
})

const $deleteButtonText = ({ colors }) => ({
  color: colors.error,
})

// 새로운 스타일들
const $roleCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.md,
  marginBottom: spacing.sm,
})

const $roleHeader = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xs,
})

const $roleName = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "600",
})

const $roleCount = ({ colors }) => ({
  color: colors.tint,
  fontSize: 14,
  fontWeight: "500",
})

const $roleDetail = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginBottom: 2,
})

const $roleRequirements = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 14,
  marginTop: spacing.xs,
})

const $requirementsContainer = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $requirementsTitle = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 14,
  fontWeight: "500",
  marginBottom: spacing.xs,
})

const $requirementItem = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginBottom: 2,
})

const $datesContainer = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $datesTitle = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 14,
  fontWeight: "500",
  marginBottom: spacing.xs,
})

const $dateItem = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginBottom: 2,
})

const $benefitsGrid = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $benefitItem = ({ colors }) => ({
  color: colors.text,
  fontSize: 14,
  marginBottom: 2,
})

const $otherBenefits = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $otherBenefitsTitle = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 14,
  fontWeight: "500",
  marginBottom: spacing.xs,
})

const $otherBenefitItem = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginBottom: 2,
})

const $contactText = ({ colors }) => ({
  color: colors.tint,
  fontSize: 16,
  fontWeight: "500",
})

const $documentsContainer = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $documentsTitle = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 14,
  fontWeight: "500",
  marginBottom: spacing.xs,
})

const $documentItem = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginBottom: 2,
})

const $deadlineText = ({ colors }) => ({
  color: colors.error,
  fontSize: 16,
  fontWeight: "500",
})

const $viewCountText = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
})

// 상호작용 관련 스타일들
const $headerActions = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
})

const $actionIcon = ({ spacing }) => ({
  marginLeft: spacing.sm,
  padding: 4,
})

const $contactButton = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  marginTop: spacing.md,
})