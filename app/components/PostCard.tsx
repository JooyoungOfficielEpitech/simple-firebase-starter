import { View, TouchableOpacity, Image } from "react-native"
import { memo, useMemo } from "react"
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
  const {
    themed,
    theme: { colors, spacing, typography },
  } = useAppTheme()

  // Memoized style objects
  const postCardStyle = useMemo(() => themed($postCard), [themed])
  const postCardHeaderStyle = useMemo(() => themed($postCardHeader), [themed])
  const postStatusRowStyle = useMemo(() => themed($postStatusRow), [themed])
  const deadlineTextStyle = useMemo(() => themed($deadlineText), [themed])
  const postTitleStyle = useMemo(() => themed($postTitle), [themed])
  const imagePreviewStyle = useMemo(() => themed($imagePreview), [themed])
  const previewImageStyle = useMemo(() => themed($previewImage), [themed])
  const imageCountBadgeStyle = useMemo(() => themed($imageCountBadge), [themed])
  const imageCountTextStyle = useMemo(() => themed($imageCountText), [themed])
  const productionStyle = useMemo(() => themed($production), [themed])
  const postMetaStyle = useMemo(() => themed($postMeta), [themed])
  const organizationRowStyle = useMemo(() => themed($organizationRow), [themed])
  const organizationStyle = useMemo(() => themed($organization), [themed])
  const applicantCountStyle = useMemo(() => themed($applicantCount), [themed])
  const locationStyle = useMemo(() => themed($location), [themed])
  const scheduleStyle = useMemo(() => themed($schedule), [themed])
  const rolesPreviewStyle = useMemo(() => themed($rolesPreview), [themed])
  const rolesPreviewTextStyle = useMemo(() => themed($rolesPreviewText), [themed])
  const moreRolesStyle = useMemo(() => themed($moreRoles), [themed])
  const tagsContainerStyle = useMemo(() => themed($tagsContainer), [themed])
  const tagStyle = useMemo(() => themed($tag), [themed])
  const tagTextStyle = useMemo(() => themed($tagText), [themed])

  return (
    <TouchableOpacity
      style={postCardStyle}
      onPress={() => onPress(post.id)}
      accessibilityRole="button"
      accessibilityLabel={`${post.title} - ${post.production} 모집공고`}
      accessibilityHint="터치하여 상세정보 보기"
    >
      <View style={postCardHeaderStyle}>
        <View style={postStatusRowStyle}>
          <StatusBadge
            status={post.status === "active" ? "active" : "closed"}
            text={post.status === "active" ? translate("bulletinBoard:status.recruiting") : translate("bulletinBoard:status.closed")}
          />
          {post.deadline ? (
            <Text text={translate("bulletinBoard:posts.deadline", { date: post.deadline })} style={deadlineTextStyle} />
          ) : null}
        </View>
        <Text preset="subheading" text={post.title} style={postTitleStyle} />

        {/* 이미지 프리뷰 (Images 모드인 경우) */}
        {(post.postType === 'images' || post.images?.length > 0) && post.images?.length > 0 && (
          <View style={imagePreviewStyle}>
            <Image
              source={{ uri: post.images[0] }}
              style={previewImageStyle}
              resizeMode="cover"
            />
            {post.images.length > 1 && (
              <View style={imageCountBadgeStyle}>
                <Text text={`+${post.images.length - 1}`} style={imageCountTextStyle} />
              </View>
            )}
          </View>
        )}

        <Text text={post.production} style={productionStyle} />
      </View>

      <View style={postMetaStyle}>
        <View style={organizationRowStyle}>
          <Text text={post.organizationName} style={organizationStyle} />
          {post.totalApplicants > 0 ? (
            <Text text={translate("bulletinBoard:posts.applicants", { count: post.totalApplicants })} style={applicantCountStyle} />
          ) : null}
        </View>
        <Text text={post.location} style={locationStyle} />
        <Text text={post.rehearsalSchedule} style={scheduleStyle} />
      </View>

      {/* Role summary for quick scanning */}
      {post.roles?.length > 0 ? (
        <View style={rolesPreviewStyle}>
          <Text
            text={post.roles.slice(0, 2).map(role => `${role.name}(${role.count}명)`).join(", ")}
            style={rolesPreviewTextStyle}
            numberOfLines={1}
          />
          {post.roles.length > 2 ? (
            <Text text={translate("bulletinBoard:posts.moreRoles", { count: post.roles.length - 2 })} style={moreRolesStyle} />
          ) : null}
        </View>
      ) : null}

      {post.tags?.length > 0 ? (
        <View style={tagsContainerStyle}>
          {post.tags.slice(0, 3).map((tag, tagIndex) => (
            <View key={tagIndex} style={tagStyle}>
              <Text text={tag} style={tagTextStyle} />
            </View>
          ))}
          {post.tags.length > 3 ? (
            <View style={tagStyle}>
              <Text text={`+${post.tags.length - 3}`} style={tagTextStyle} />
            </View>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.status === nextProps.post.status &&
    prevProps.post.totalApplicants === nextProps.post.totalApplicants &&
    prevProps.variant === nextProps.variant
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

// 이미지 프리뷰 스타일들
const $imagePreview = ({ spacing }) => ({
  marginVertical: spacing?.sm || 8,
  borderRadius: 8,
  overflow: "hidden" as const,
  position: "relative" as const,
})

const $previewImage = {
  width: "100%" as const,
  height: 120,
}

const $imageCountBadge = ({ colors, spacing }) => ({
  position: "absolute" as const,
  top: spacing?.xs || 4,
  right: spacing?.xs || 4,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 2,
  borderRadius: 8,
})

const $imageCountText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 10,
  fontFamily: typography.primary.medium,
})