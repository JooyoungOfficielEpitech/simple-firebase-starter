import { View, TouchableOpacity, Image } from "react-native"
import { memo, useMemo, useCallback } from "react"
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

  // Consolidated style objects in single useMemo
  const styles = useMemo(() => ({
    postCard: themed($postCard),
    postCardHeader: themed($postCardHeader),
    postStatusRow: themed($postStatusRow),
    deadlineText: themed($deadlineText),
    postTitle: themed($postTitle),
    imagePreview: themed($imagePreview),
    previewImage: themed($previewImage),
    imageCountBadge: themed($imageCountBadge),
    imageCountText: themed($imageCountText),
    production: themed($production),
    postMeta: themed($postMeta),
    organizationRow: themed($organizationRow),
    organization: themed($organization),
    applicantCount: themed($applicantCount),
    location: themed($location),
    schedule: themed($schedule),
    rolesPreview: themed($rolesPreview),
    rolesPreviewText: themed($rolesPreviewText),
    moreRoles: themed($moreRoles),
    tagsContainer: themed($tagsContainer),
    tag: themed($tag),
    tagText: themed($tagText),
  }), [themed])

  // Memoized onPress handler
  const handlePress = useCallback(() => {
    onPress(post.id)
  }, [onPress, post.id])

  return (
    <TouchableOpacity
      style={styles.postCard}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${post.title} - ${post.production} 모집공고`}
      accessibilityHint="터치하여 상세정보 보기"
    >
      <View style={styles.postCardHeader}>
        <View style={styles.postStatusRow}>
          <StatusBadge
            status={post.status === "active" ? "active" : "closed"}
            text={post.status === "active" ? translate("bulletinBoard:status.recruiting") : translate("bulletinBoard:status.closed")}
          />
          {post.deadline ? (
            <Text text={translate("bulletinBoard:posts.deadline", { date: post.deadline })} style={styles.deadlineText} />
          ) : null}
        </View>
        <Text preset="subheading" text={post.title} style={styles.postTitle} />

        {/* 이미지 프리뷰 (Images 모드인 경우) */}
        {(post.postType === 'images' || post.images?.length > 0) && post.images?.length > 0 && (
          <View style={styles.imagePreview}>
            <Image
              source={{ uri: post.images[0] }}
              style={styles.previewImage}
              resizeMode="cover"
              fadeDuration={200}
            />
            {post.images.length > 1 && (
              <View style={styles.imageCountBadge}>
                <Text text={`+${post.images.length - 1}`} style={styles.imageCountText} />
              </View>
            )}
          </View>
        )}

        <Text text={post.production} style={styles.production} />
      </View>

      <View style={styles.postMeta}>
        <View style={styles.organizationRow}>
          <Text text={post.organizationName} style={styles.organization} />
          {post.totalApplicants > 0 ? (
            <Text text={translate("bulletinBoard:posts.applicants", { count: post.totalApplicants })} style={styles.applicantCount} />
          ) : null}
        </View>
        <Text text={post.location} style={styles.location} />
        <Text text={post.rehearsalSchedule} style={styles.schedule} />
      </View>

      {/* Role summary for quick scanning */}
      {post.roles?.length > 0 ? (
        <View style={styles.rolesPreview}>
          <Text
            text={post.roles.slice(0, 2).map(role => `${role.name}(${role.count}명)`).join(", ")}
            style={styles.rolesPreviewText}
            numberOfLines={1}
          />
          {post.roles.length > 2 ? (
            <Text text={translate("bulletinBoard:posts.moreRoles", { count: post.roles.length - 2 })} style={styles.moreRoles} />
          ) : null}
        </View>
      ) : null}

      {post.tags?.length > 0 ? (
        <View style={styles.tagsContainer}>
          {post.tags.slice(0, 3).map((tag, tagIndex) => (
            <View key={`tag-${post.id}-${tagIndex}`} style={styles.tag}>
              <Text text={tag} style={styles.tagText} />
            </View>
          ))}
          {post.tags.length > 3 ? (
            <View style={styles.tag}>
              <Text text={`+${post.tags.length - 3}`} style={styles.tagText} />
            </View>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  )
}, (prevProps, nextProps) => {
  // Enhanced comparison for better memo optimization
  // Only re-render if critical display fields change
  const prev = prevProps.post
  const next = nextProps.post

  return (
    prev.id === next.id &&
    prev.status === next.status &&
    prev.title === next.title &&
    prev.production === next.production &&
    prev.organizationName === next.organizationName &&
    prev.totalApplicants === next.totalApplicants &&
    prev.deadline === next.deadline &&
    prev.location === next.location &&
    prev.rehearsalSchedule === next.rehearsalSchedule &&
    prev.images?.length === next.images?.length &&
    prev.roles?.length === next.roles?.length &&
    prev.tags?.length === next.tags?.length &&
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