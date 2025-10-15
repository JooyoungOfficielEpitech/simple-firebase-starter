import React, { memo, useMemo, useCallback } from "react"
import { View, TouchableOpacity, ViewStyle, TextStyle } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { Post } from "@/types/post"

// Props interface
interface OptimizedPostCardProps {
  post: Post
  onPress: (postId: string) => void
  isSelected?: boolean
  showStatus?: boolean
  compact?: boolean
}

// Memoized component with performance optimizations
export const OptimizedPostCard = memo<OptimizedPostCardProps>(({
  post,
  onPress,
  isSelected = false,
  showStatus = true,
  compact = false,
}) => {
  const { themed } = useAppTheme()

  // Memoized event handler to prevent recreation on every render
  const handlePress = useCallback(() => {
    onPress(post.id)
  }, [post.id, onPress])

  // Memoized computed values to avoid recalculation
  const computedValues = useMemo(() => {
    const isActive = post.status === "active"
    const hasDeadline = post.deadline && post.deadline.trim() !== ""
    const tagsText = post.tags?.length > 0 ? post.tags.slice(0, 3).join(", ") : ""
    const truncatedDescription = compact && post.description?.length > 100 
      ? post.description.substring(0, 100) + "..." 
      : post.description
    
    return {
      isActive,
      hasDeadline,
      tagsText,
      truncatedDescription,
      statusColor: isActive ? "#22c55e" : "#ef4444",
      statusText: isActive ? "모집중" : "마감",
    }
  }, [post.status, post.deadline, post.tags, post.description, compact])

  // Memoized styles to prevent style object recreation
  const styles = useMemo(() => ({
    container: themed($container),
    selectedContainer: themed($selectedContainer),
    header: themed($header),
    title: themed($title),
    organization: themed($organization),
    description: themed($description),
    footer: themed($footer),
    tags: themed($tags),
    status: themed($status),
    deadline: themed($deadline),
    compactContainer: compact ? themed($compactContainer) : {},
  }), [themed, compact])

  // Early return for invalid post data
  if (!post || !post.id) {
    return null
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles.compactContainer,
        isSelected && styles.selectedContainer,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`게시글: ${post.title}`}
      accessibilityHint="탭하면 상세 내용을 볼 수 있습니다"
    >
      {/* Header section */}
      <View style={styles.header}>
        <Text
          text={post.title}
          style={styles.title}
          numberOfLines={compact ? 1 : 2}
          ellipsizeMode="tail"
        />
        
        {showStatus && (
          <View style={[styles.status, { backgroundColor: computedValues.statusColor }]}>
            <Text
              text={computedValues.statusText}
              style={themed($statusText)}
            />
          </View>
        )}
      </View>

      {/* Organization info */}
      {post.organizationName && (
        <Text
          text={post.organizationName}
          style={styles.organization}
          numberOfLines={1}
          ellipsizeMode="tail"
        />
      )}

      {/* Description */}
      {computedValues.truncatedDescription && (
        <Text
          text={computedValues.truncatedDescription}
          style={styles.description}
          numberOfLines={compact ? 2 : 3}
          ellipsizeMode="tail"
        />
      )}

      {/* Footer section */}
      <View style={styles.footer}>
        {/* Tags */}
        {computedValues.tagsText && (
          <Text
            text={`#${computedValues.tagsText.replace(/,\s/g, " #")}`}
            style={styles.tags}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
        )}

        {/* Deadline */}
        {computedValues.hasDeadline && (
          <Text
            text={`마감: ${post.deadline}`}
            style={styles.deadline}
            numberOfLines={1}
          />
        )}
      </View>
    </TouchableOpacity>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  // Only re-render if these specific props changed
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.title === nextProps.post.title &&
    prevProps.post.status === nextProps.post.status &&
    prevProps.post.updatedAt === nextProps.post.updatedAt &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.showStatus === nextProps.showStatus &&
    prevProps.compact === nextProps.compact &&
    prevProps.onPress === nextProps.onPress
  )
})

// Display name for debugging
OptimizedPostCard.displayName = "OptimizedPostCard"

// Optimized styles with memoization in mind
const $container = ({ colors, spacing }): ViewStyle => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing.md,
  marginBottom: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $selectedContainer = ({ colors }): ViewStyle => ({
  borderColor: colors.palette.primary500,
  borderWidth: 2,
  backgroundColor: colors.palette.primary50,
})

const $compactContainer = ({ spacing }): ViewStyle => ({
  padding: spacing.sm,
  marginBottom: spacing.xs,
})

const $header = (): ViewStyle => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 8,
})

const $title = ({ colors, typography }): TextStyle => ({
  flex: 1,
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  fontFamily: typography.primary.medium,
  marginRight: 8,
})

const $organization = ({ colors, typography, spacing }): TextStyle => ({
  fontSize: 14,
  color: colors.palette.primary600,
  fontFamily: typography.primary.medium,
  marginBottom: spacing.xs,
})

const $description = ({ colors, typography, spacing }): TextStyle => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  lineHeight: 20,
  marginBottom: spacing.sm,
})

const $footer = ({ spacing }): ViewStyle => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.xs,
})

const $tags = ({ colors, typography }): TextStyle => ({
  flex: 1,
  fontSize: 12,
  color: colors.palette.secondary600,
  fontFamily: typography.primary.normal,
  marginRight: 8,
})

const $status = ({ spacing }): ViewStyle => ({
  paddingHorizontal: spacing.xs,
  paddingVertical: 4,
  borderRadius: 6,
  alignSelf: "flex-start",
})

const $statusText = ({ colors, typography }): TextStyle => ({
  fontSize: 12,
  fontWeight: "600",
  color: colors.palette.neutral100,
  fontFamily: typography.primary.medium,
})

const $deadline = ({ colors, typography }): TextStyle => ({
  fontSize: 12,
  color: colors.palette.angry600,
  fontFamily: typography.primary.normal,
  fontWeight: "500",
})

export default OptimizedPostCard