import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MapPin, Users } from 'lucide-react-native'
import { OrphiCard, OrphiBadge, orphiTokens } from '@/design-system'
import { Post } from '@/core/types/post'
import { useTheme } from '@/core/context/ThemeContext'

export interface PostCardProps {
  post: Post
  onPress?: () => void
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPress }) => {
  const { currentTheme } = useTheme()

  // D-day 계산
  const calculateDDay = (deadline: Date) => {
    const now = new Date()
    const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const dDay = post.deadline ? calculateDDay(new Date(post.deadline)) : null

  return (
    <OrphiCard onPress={onPress} style={styles.card}>
      {/* Header - Badges */}
      <View style={styles.header}>
        <OrphiBadge variant="success" icon size="sm">
          모집중
        </OrphiBadge>
        {dDay !== null && (
          <OrphiBadge
            variant="info"
            size="sm"
            style={{ backgroundColor: currentTheme.colors.primary100 }}
          >
            D-{dDay}
          </OrphiBadge>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.organization} numberOfLines={1}>
          {post.organizationName || '단체명 없음'}
        </Text>

        {/* Role Tags */}
        {post.roles && post.roles.length > 0 && (
          <View style={styles.roleTags}>
            {post.roles.slice(0, 3).map((role, index) => (
              <View
                key={index}
                style={[
                  styles.roleTag,
                  { borderColor: currentTheme.colors.primary600 },
                ]}
              >
                <Text style={[styles.roleTagText, { color: currentTheme.colors.primary600 }]}>
                  {role.name}
                </Text>
              </View>
            ))}
            {post.roles.length > 3 && (
              <View
                style={[
                  styles.roleTag,
                  { borderColor: currentTheme.colors.primary600 },
                ]}
              >
                <Text style={[styles.roleTagText, { color: currentTheme.colors.primary600 }]}>
                  +{post.roles.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <MapPin size={14} color={orphiTokens.colors.gray500} strokeWidth={2} />
          <Text style={styles.footerText}>
            {post.location || '장소 미정'}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Users size={14} color={currentTheme.colors.primary600} strokeWidth={2} />
          <Text style={[styles.footerText, { color: currentTheme.colors.primary600, fontWeight: orphiTokens.typography.weights.medium }]}>
            {post.totalApplicants || 0}명
          </Text>
        </View>
      </View>
    </OrphiCard>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: orphiTokens.spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: orphiTokens.spacing.sm,
    marginBottom: orphiTokens.spacing.md,
  },
  content: {
    marginBottom: orphiTokens.spacing.md,
  },
  title: {
    fontSize: orphiTokens.typography.sizes.lg,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray900,
    marginBottom: orphiTokens.spacing.xs,
  },
  organization: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray600,
    marginBottom: orphiTokens.spacing.md,
  },
  roleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: orphiTokens.spacing.sm,
  },
  roleTag: {
    paddingHorizontal: orphiTokens.spacing.md,
    paddingVertical: orphiTokens.spacing.xs,
    borderRadius: orphiTokens.borderRadius.full,
    borderWidth: 1,
  },
  roleTagText: {
    fontSize: orphiTokens.typography.sizes.xs,
    fontWeight: orphiTokens.typography.weights.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: orphiTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: orphiTokens.colors.gray200,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray500,
  },
})
