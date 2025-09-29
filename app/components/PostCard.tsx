import React from "react"
import { View, TouchableOpacity } from "react-native"
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

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onPress, 
  variant = "compact" 
}) => {
  const {
    themed,
    theme: { colors, spacing, typography },
  } = useAppTheme()

  return (
    <TouchableOpacity
      style={themed($postCard)}
      onPress={() => onPress(post.id)}
      accessibilityRole="button"
      accessibilityLabel={`${post.title} - ${post.production} 모집공고`}
      accessibilityHint="터치하여 상세정보 보기"
    >
      <View style={themed($postCardHeader)}>
        <View style={themed($postStatusRow)}>
          <StatusBadge
            status={post.status === "active" ? "active" : "closed"}
            text={post.status === "active" ? translate("bulletinBoard:status.recruiting") : translate("bulletinBoard:status.closed")}
          />
          {post.deadline && (
            <Text text={translate("bulletinBoard:posts.deadline", { date: post.deadline })} style={themed($deadlineText)} />
          )}
        </View>
        <Text preset="subheading" text={post.title} style={themed($postTitle)} />
        <Text text={post.production} style={themed($production)} />
      </View>
      
      <View style={themed($postMeta)}>
        <View style={themed($organizationRow)}>
          <Text text={post.organizationName} style={themed($organization)} />
          {post.totalApplicants && (
            <Text text={translate("bulletinBoard:posts.applicants", { count: post.totalApplicants })} style={themed($applicantCount)} />
          )}
        </View>
        <Text text={post.location} style={themed($location)} />
        <Text text={post.rehearsalSchedule} style={themed($schedule)} />
      </View>

      {/* Role summary for quick scanning */}
      {post.roles && post.roles.length > 0 && (
        <View style={themed($rolesPreview)}>
          <Text 
            text={post.roles.slice(0, 2).map(role => `${role.name}(${role.count}명)`).join(", ")}
            style={themed($rolesPreviewText)}
            numberOfLines={1}
          />
          {post.roles.length > 2 && (
            <Text text={translate("bulletinBoard:posts.moreRoles", { count: post.roles.length - 2 })} style={themed($moreRoles)} />
          )}
        </View>
      )}

      {post.tags && post.tags.length > 0 && (
        <View style={themed($tagsContainer)}>
          {post.tags.slice(0, 3).map((tag, tagIndex) => (
            <View key={tagIndex} style={themed($tag)}>
              <Text text={tag} style={themed($tagText)} />
            </View>
          ))}
          {post.tags.length > 3 && (
            <View style={themed($tag)}>
              <Text text={`+${post.tags.length - 3}`} style={themed($tagText)} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

// Styles
const $postCard = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.md || 12,
  borderWidth: 1,
  borderColor: colors.border,
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
  color: colors.tint,
  fontSize: 14,
  marginBottom: spacing?.sm || 8,
})

const $applicantCount = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 18,
  color: colors.palette.primary500,
  fontFamily: typography.primary.medium,
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