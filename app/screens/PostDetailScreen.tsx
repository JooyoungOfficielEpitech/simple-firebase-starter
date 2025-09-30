import { useEffect, useState } from "react"
import { View, Alert, TouchableOpacity, Share } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"

import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { HeaderBackButton } from "@/components/HeaderBackButton"
import { translate } from "@/i18n"
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
    
    // 사용자 프로필 로드
    const loadUserProfile = async () => {
      try {
        const profile = await userService.getUserProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error("❌ [PostDetailScreen] 사용자 프로필 로드 오류:", error)
      }
    }

    loadUserProfile()

    // 게시글 실시간 구독
    const unsubscribe = postService.subscribeToPost(postId, (post) => {
      
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


  const isMyPost = post && userProfile && post.authorId === userProfile.uid && userProfile.userType === "organizer"

  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed($container)}>
          {/* Header */}
          <View style={themed($header)}>
            <HeaderBackButton onPress={() => navigation.goBack()} />
            <Text
              text="게시글"
              preset="heading"
              style={themed($appTitle)}
            />
            <View style={themed($headerButtons)} />
          </View>
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
        <View style={themed($container)}>
          {/* Header */}
          <View style={themed($header)}>
            <HeaderBackButton onPress={() => navigation.goBack()} />
            <Text
              text="게시글"
              preset="heading"
              style={themed($appTitle)}
            />
            <View style={themed($headerButtons)} />
          </View>
          <View style={themed($centerContainer) as any}>
            <Text text="게시글을 찾을 수 없습니다." />
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <View style={themed($container)}>
        {/* Header */}
        <View style={themed($header)}>
          <HeaderBackButton onPress={() => navigation.goBack()} />
          <Text
            text="모집 공고"
            preset="heading"
            style={themed($appTitle)}
          />
          <View style={themed($headerButtons)}>
            {/* Action buttons can go here */}
          </View>
        </View>
        {/* Hero section with key info */}
        <View style={themed($heroCard)}>
          <View style={themed($statusHeader)}>
            <View style={themed(post.status === "active" ? $activeBadge : $closedBadge)}>
              <Text
                text={post.status === "active" ? "모집중" : "마감"}
                style={themed(post.status === "active" ? $activeText : $closedText)}
              />
            </View>
            {post.deadline && (
              <Text text={`마감일 ${post.deadline}`} style={themed($deadlineText)} />
            )}
          </View>
          
          <Text preset="heading" text={post.title} style={themed($postTitle)} />
          <Text text={post.production} style={themed($productionText) as any} />
          <Text text={post.organizationName} style={themed($organizationText) as any} />
          
          <View style={themed($keyInfoRow)}>
            <View style={themed($infoItem)}>
              <Text text="📍" style={themed($infoIcon)} />
              <Text text={post.location} style={themed($infoText)} />
            </View>
            <View style={themed($infoItem)}>
              <Text text="📅" style={themed($infoIcon)} />
              <Text text={post.rehearsalSchedule} style={themed($infoText)} />
            </View>
          </View>
          
          {post.contact && (
            <TouchableOpacity 
              style={themed($quickContactButton)}
              onPress={() => console.log("Quick contact", post.contact)} // 연락 기능 구현 예정
            >
              <Text text="빠른 문의하기" style={themed($quickContactText)} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* 상세 설명 */}
        <View style={themed($section)}>
          <Text preset="subheading" text="상세 설명" style={themed($sectionTitle)} />
          <Text text={post.description} style={themed($descriptionText)} />
        </View>

        {/* Role cards with improved layout */}
        {post.roles && post.roles.length > 0 && (
          <View style={themed($section)}>
            <Text preset="subheading" text="모집 역할" style={themed($sectionTitle)} />
            {post.roles.map((role, index) => (
              <View key={index} style={themed($roleCard)}>
                <View style={themed($roleHeader)}>
                  <Text text={role.name} style={themed($roleName) as any} />
                  <View style={themed($roleCountBadge)}>
                    <Text text={`${role.count}명`} style={themed($roleCountText)} />
                  </View>
                </View>
                <View style={themed($roleDetails)}>
                  <View style={themed($roleDetailItem)}>
                    <Text text="👤" style={themed($roleIcon)} />
                    <Text text={role.ageRange} style={themed($roleDetailText)} />
                  </View>
                  <View style={themed($roleDetailItem)}>
                    <Text text={role.gender === 'male' ? '♂️' : role.gender === 'female' ? '♀️' : '👥'} style={themed($roleIcon)} />
                    <Text text={role.gender === 'male' ? '남성' : role.gender === 'female' ? '여성' : '성별무관'} style={themed($roleDetailText)} />
                  </View>
                </View>
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

        {/* 운영자 액션 버튼들 */}
        {isMyPost && (
          <View style={themed($actionButtonsContainer)}>
            <TouchableOpacity
              style={themed($editButton)}
              onPress={() => navigation.navigate("CreatePost", { postId: post.id, isEdit: true })}
              accessibilityLabel={translate("bulletinBoard:actions.editPost")}
            >
              <Text text="✏️" style={themed($buttonIcon)} />
              <Text text={translate("bulletinBoard:actions.edit")} style={themed($editButtonText)} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={themed($deleteButton)}
              onPress={handleDelete}
              accessibilityLabel={translate("bulletinBoard:actions.deletePost")}
            >
              <Text text="🗑️" style={themed($buttonIcon)} />
              <Text text={translate("bulletinBoard:actions.delete")} style={themed($deleteButtonText)} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Screen>
  )
}

const $container = ({ spacing }) => ({
  flexGrow: 1,
  backgroundColor: "transparent",
  paddingHorizontal: spacing.lg,
})

const $header = ({ spacing, colors }) => ({
  paddingHorizontal: 0,
  paddingVertical: spacing.md,
  backgroundColor: colors.background,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
})

const $appTitle = ({ colors, typography, spacing }) => ({
  textAlign: "center" as const,
  color: colors.palette.primary500,
  fontFamily: typography.primary.bold,
  flex: 1,
})

const $backButton = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  minWidth: 44,
  minHeight: 44,
  justifyContent: "center" as const,
  alignItems: "center" as const,
})

const $backButtonText = ({ colors, typography }) => ({
  fontSize: 24,
  color: colors.palette.primary500,
  fontFamily: typography.primary.bold,
})

const $headerButtons = () => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  minWidth: 44, // 균형을 위한 최소 너비
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
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginTop: spacing.lg,
  gap: spacing.md,
  paddingHorizontal: spacing.md,
})

// 새로운 통일된 버튼 스타일
const $editButton = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 20,
  borderRadius: 25,
  minWidth: 120,
  minHeight: 50,
  shadowColor: colors.palette.primary500,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
})

const $editButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  marginLeft: 6,
})

const $deleteButton = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.palette.angry500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 20,
  borderRadius: 25,
  minWidth: 120,
  minHeight: 50,
  shadowColor: colors.palette.angry500,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
})

const $deleteButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  marginLeft: 6,
})

// 새로운 PostDetail 스타일들
const $heroCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.lg || 16,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral500,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $statusHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

const $deadlineText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 18,
  color: colors.textDim,
  fontFamily: typography.primary.medium,
})

const $keyInfoRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing?.lg || 16,
  marginTop: spacing?.sm || 8,
  marginBottom: spacing?.md || 12,
})

const $infoItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  flex: 1,
})

const $infoIcon = {
  fontSize: 16,
  marginRight: 8,
}

const $quickContactButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  marginTop: spacing?.sm || 8,
})

const $quickContactText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

const $roleHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

const $roleCountBadge = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 2,
  borderRadius: 12,
})

const $roleCountText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 12,
  lineHeight: 16,
  fontFamily: typography.primary.medium,
})

const $roleDetails = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing?.md || 12,
  marginBottom: spacing?.xs || 4,
})

const $roleDetailItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
})

const $roleIcon = {
  fontSize: 14,
  marginRight: 4,
}

const $roleDetailText = ({ colors, typography }) => ({
  fontSize: 13,
  lineHeight: 20,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

// 개선된 액션 버튼 스타일들
const $primaryActionButton = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  marginBottom: spacing?.sm || 8,
  minHeight: 48,
})

const $primaryActionText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  marginLeft: 8,
})

const $secondaryActionButton = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  marginBottom: spacing?.sm || 8,
  minHeight: 48,
})

const $secondaryActionText = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  marginLeft: 8,
})

const $dangerActionButton = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.palette.angry500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  minHeight: 48,
})

const $dangerActionText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  marginLeft: 8,
})

const $buttonIcon = {
  fontSize: 18,
}

// Badge 스타일들 (BulletinBoardScreen에서 가져옴)
const $activeBadge = ({ colors, spacing }) => ({
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: colors.palette.primary500 + "20",
})

const $closedBadge = ({ colors, spacing }) => ({
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: colors.textDim + "20",
})

const $activeText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary500,
})

const $closedText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 16,
  fontFamily: typography.primary.medium,
  color: colors.textDim,
})