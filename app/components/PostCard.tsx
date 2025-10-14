import { View, TouchableOpacity } from "react-native"
import { memo } from "react"
import { Text } from "@/components/Text"
import { StatusBadge } from "@/components/StatusBadge"
import { useAppTheme } from "@/theme/context"
import { translate } from "@/i18n"
import { Post } from "@/types/post"

interface PostCardProps {
  post: Post
  onPress: (postId: string) => void
  variant?: "compact" | "detailed"
}

export const PostCard = memo<PostCardProps>(({ post, onPress, variant = "compact" }) => {
  // 디버깅: post 데이터 확인
  console.log('🔍 [PostCard] Received props:', { 
    post: post ? { id: post.id, title: post.title, hasTitle: !!post.title } : 'null/undefined',
    onPress: typeof onPress,
    variant 
  })
  
  if (!post || typeof post !== 'object') {
    console.error('❌ [PostCard] Invalid post data:', post)
    return null
  }

  // 안전한 post 데이터 생성
  const safePost = {
    id: String(post.id || ''),
    title: String(post.title || '제목 없음'),
    production: String(post.production || '작품 정보 없음'),
    organizationName: String(post.organizationName || '단체명 없음'),
    location: String(post.location || '장소 미정'),
    rehearsalSchedule: String(post.rehearsalSchedule || '일정 미정'),
    status: String(post.status || 'closed'),
    deadline: post.deadline ? String(post.deadline) : null,
    totalApplicants: Number(post.totalApplicants || 0),
    roles: Array.isArray(post.roles) ? post.roles : [],
    tags: Array.isArray(post.tags) ? post.tags : []
  }

  const {
    themed,
    theme: { colors, spacing, typography },
  } = useAppTheme()

  return (
    <TouchableOpacity
      style={themed($postCard)}
      onPress={() => onPress(safePost.id)}
      accessibilityRole="button"
      accessibilityLabel={`${safePost.title} - ${safePost.production} 모집공고`}
      accessibilityHint="터치하여 상세정보 보기"
    >
      <View style={themed($postCardHeader)}>
        <View style={themed($postStatusRow)}>
          <StatusBadge
            status={safePost.status === "active" ? "active" : "closed"}
            text={safePost.status === "active" ? translate("bulletinBoard:status.recruiting") : translate("bulletinBoard:status.closed")}
          />
          {safePost.deadline ? (
            <Text text={translate("bulletinBoard:posts.deadline", { date: safePost.deadline })} style={themed($deadlineText)} />
          ) : null}
        </View>
        <Text preset="subheading" text={safePost.title} style={themed($postTitle)} />
        <Text text={safePost.production} style={themed($production)} />
      </View>
      
      <View style={themed($postMeta)}>
        <View style={themed($organizationRow)}>
          <Text text={safePost.organizationName} style={themed($organization)} />
          {safePost.totalApplicants > 0 ? (
            <Text text={translate("bulletinBoard:posts.applicants", { count: safePost.totalApplicants })} style={themed($applicantCount)} />
          ) : null}
        </View>
        <Text text={safePost.location} style={themed($location)} />
        <Text text={safePost.rehearsalSchedule} style={themed($schedule)} />
      </View>

      {/* Role summary for quick scanning */}
      {safePost.roles && safePost.roles.length > 0 ? (
        <View style={themed($rolesPreview)}>
          <Text 
            text={safePost.roles.slice(0, 2).map(role => `${role.name || "역할"}(${role.count || 0}명)`).join(", ") || "역할 정보"}
            style={themed($rolesPreviewText)}
            numberOfLines={1}
          />
          {safePost.roles.length > 2 ? (
            <Text text={translate("bulletinBoard:posts.moreRoles", { count: safePost.roles.length - 2 })} style={themed($moreRoles)} />
          ) : null}
        </View>
      ) : null}

      {safePost.tags && safePost.tags.length > 0 ? (
        <View style={themed($tagsContainer)}>
          {safePost.tags.slice(0, 3).map((tag, tagIndex) => (
            <View key={tagIndex} style={themed($tag)}>
              <Text text={tag || "태그"} style={themed($tagText)} />
            </View>
          ))}
          {safePost.tags.length > 3 ? (
            <View style={themed($tag)}>
              <Text text={`+${safePost.tags.length - 3}`} style={themed($tagText)} />
            </View>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  )
})

// Styles - BOLD: Using secondary color theme for organization posts
const $postCard = ({ colors, spacing }) => ({
  backgroundColor: colors.secondaryAction + '20', // Stronger secondary color background
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.md || 12,
  borderWidth: 2, // Thicker border for emphasis
  borderColor: colors.secondaryAction + '60', // Stronger secondary color border
})

const $postCardHeader = ({ spacing }) => ({
  marginBottom: spacing?.sm || 8,
})

const $postStatusRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

// Badge styles moved to StatusBadge component

const $deadlineText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 18,
  color: colors.textDim,
  fontFamily: typography.primary.medium,
})

const $postTitle = ({ colors, spacing }) => ({
  color: colors.text,
  flex: 1,
  marginRight: spacing?.xs || 4,
})

const $production = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "600" as const,
  marginBottom: spacing?.xs || 4,
})

const $postMeta = ({ spacing }) => ({
  marginBottom: spacing?.sm || 8,
})

const $organizationRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

const $organization = ({ colors, spacing }) => ({
  color: colors.secondaryAction, // BOLD: Organization name in secondary color
  fontSize: 14,
  fontWeight: "600" as const, // Make it bolder
  marginBottom: spacing?.sm || 8,
})

const $applicantCount = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 18,
  color: colors.secondaryAction, // BOLD: Applicant count in secondary color
  fontFamily: typography.primary.medium,
  fontWeight: "600" as const, // Make it stand out
})

const $location = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginBottom: 2,
})

const $schedule = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
})

const $rolesPreview = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
  paddingVertical: spacing?.xxxs || 2,
})

const $rolesPreviewText = ({ colors, typography }) => ({
  flex: 1,
  fontSize: 13,
  lineHeight: 20,
  color: colors.text,
  fontFamily: typography.primary.normal,
})

const $moreRoles = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 18,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

const $tagsContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  marginTop: spacing?.xs || 4,
})

const $tag = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 2,
  borderRadius: 4,
  marginRight: spacing?.xs || 4,
  marginBottom: 4,
})

const $tagText = ({ colors }) => ({
  color: colors.palette.neutral600,
  fontSize: 12,
})