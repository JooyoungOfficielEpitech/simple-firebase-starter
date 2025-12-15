import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react-native'
import { OrphiCard, OrphiButton, orphiTokens } from '@/design-system'
import { useTheme } from '@/core/context/ThemeContext'

export interface NotificationCardProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  description: string
  timestamp: string
  onMarkRead?: () => void
  onDelete?: () => void
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  description,
  timestamp,
  onMarkRead,
  onDelete,
}) => {
  const { currentTheme } = useTheme()

  const getIcon = () => {
    const iconProps = { size: 24, strokeWidth: 2 }
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} color={currentTheme.colors.primary600} />
      case 'warning':
        return <AlertCircle {...iconProps} color={orphiTokens.colors.orange600} />
      case 'error':
        return <AlertCircle {...iconProps} color={orphiTokens.colors.red500} />
      default:
        return <Info {...iconProps} color="#2563eb" />
    }
  }

  const getIconBgColor = () => {
    switch (type) {
      case 'success':
        return currentTheme.colors.primary100
      case 'warning':
        return orphiTokens.colors.yellow50
      case 'error':
        return 'rgba(239, 68, 68, 0.1)'
      default:
        return 'rgba(59, 130, 246, 0.1)'
    }
  }

  return (
    <OrphiCard style={styles.card}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: getIconBgColor() }]}>
          {getIcon()}
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onMarkRead && (
          <OrphiButton variant="text" size="sm" onPress={onMarkRead}>
            읽음 표시
          </OrphiButton>
        )}
        {onDelete && (
          <OrphiButton variant="text" size="sm" onPress={onDelete} textStyle={styles.deleteText}>
            삭제
          </OrphiButton>
        )}
      </View>
    </OrphiCard>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: orphiTokens.spacing.md,
  },
  content: {
    flexDirection: 'row',
    marginBottom: orphiTokens.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: orphiTokens.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: orphiTokens.spacing.md,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: orphiTokens.typography.sizes.base,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray900,
    marginBottom: orphiTokens.spacing.xs,
  },
  description: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray600,
    marginBottom: orphiTokens.spacing.xs,
  },
  timestamp: {
    fontSize: orphiTokens.typography.sizes.xs,
    color: orphiTokens.colors.gray500,
  },
  actions: {
    flexDirection: 'row',
    gap: orphiTokens.spacing.sm,
    paddingTop: orphiTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: orphiTokens.colors.gray200,
  },
  deleteText: {
    color: orphiTokens.colors.red500,
  },
})
