import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Check } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { themes, ThemeName } from '@/design-system/tokens/orphi.tokens'
import { orphiTokens } from '@/design-system'
import { useTheme } from '@/core/context/ThemeContext'

export const ThemeSelector: React.FC = () => {
  const { themeName, setTheme } = useTheme()

  const ThemeCard = ({ name }: { name: ThemeName }) => {
    const theme = themes[name]
    const isSelected = themeName === name

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setTheme(name)}
        style={[
          styles.themeCard,
          isSelected && {
            borderColor: theme.colors.primary600,
            borderWidth: 2,
            transform: [{ scale: 1.02 }],
          },
        ]}
      >
        {/* Background gradient effect */}
        <View
          style={[
            styles.backgroundBlur,
            { backgroundColor: theme.colors.primary100 },
          ]}
        />

        <View style={styles.cardContent}>
          {/* Emoji Icon with Gradient */}
          <LinearGradient
            colors={theme.colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emojiContainer}
          >
            <Text style={styles.emoji}>{theme.emoji}</Text>
          </LinearGradient>

          {/* Theme Info */}
          <View style={styles.themeInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.themeName}>{theme.displayName}</Text>
              {isSelected && (
                <View
                  style={[
                    styles.selectedBadge,
                    { backgroundColor: theme.colors.primary100 },
                  ]}
                >
                  <Check size={12} color={theme.colors.primary600} strokeWidth={3} />
                  <Text
                    style={[styles.selectedText, { color: theme.colors.primary600 }]}
                  >
                    선택됨
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.quote}>{theme.quote}</Text>
          </View>

          {/* Check Icon */}
          {isSelected && (
            <View
              style={[
                styles.checkIcon,
                { backgroundColor: theme.colors.primary600 },
              ]}
            >
              <Check size={16} color={orphiTokens.colors.white} strokeWidth={3} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.headerIcon}>🎨</Text>
        </View>
        <Text style={styles.headerTitle}>테마 선택</Text>
      </View>

      <Text style={styles.description}>좋아하는 뮤지컬 캐릭터의 테마를 선택하세요</Text>

      {/* Theme Cards */}
      <View style={styles.themeList}>
        <ThemeCard name="elphaba" />
        <ThemeCard name="glinda" />
        <ThemeCard name="gwynplaine" />
        <ThemeCard name="johanna" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: orphiTokens.colors.white,
    borderRadius: orphiTokens.borderRadius.lg,
    padding: orphiTokens.spacing.xl,
    marginBottom: orphiTokens.spacing.base,
    ...orphiTokens.shadows.md,
    borderWidth: 1,
    borderColor: orphiTokens.colors.gray200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: orphiTokens.spacing.md,
    marginBottom: orphiTokens.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: orphiTokens.borderRadius.sm,
    backgroundColor: orphiTokens.colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: orphiTokens.typography.sizes.lg,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray900,
  },
  description: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray500,
    marginBottom: orphiTokens.spacing.xl,
    paddingHorizontal: orphiTokens.spacing.xs,
  },
  themeList: {
    gap: orphiTokens.spacing.md,
  },
  themeCard: {
    borderRadius: orphiTokens.borderRadius.md,
    borderWidth: 2,
    borderColor: orphiTokens.colors.gray200,
    padding: orphiTokens.spacing.lg,
    backgroundColor: orphiTokens.colors.white,
    position: 'relative',
    overflow: 'hidden',
    ...orphiTokens.shadows.sm,
  },
  backgroundBlur: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 96,
    height: 96,
    borderRadius: orphiTokens.borderRadius.full,
    opacity: 0.1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: orphiTokens.spacing.base,
    position: 'relative',
  },
  emojiContainer: {
    width: 64,
    height: 64,
    borderRadius: orphiTokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...orphiTokens.shadows.md,
  },
  emoji: {
    fontSize: 32,
  },
  themeInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: orphiTokens.spacing.sm,
    marginBottom: orphiTokens.spacing.xs,
  },
  themeName: {
    fontSize: orphiTokens.typography.sizes.lg,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray900,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: orphiTokens.spacing.xs,
    paddingHorizontal: orphiTokens.spacing.sm,
    paddingVertical: orphiTokens.spacing.xs,
    borderRadius: orphiTokens.borderRadius.full,
  },
  selectedText: {
    fontSize: orphiTokens.typography.sizes.xs,
    fontWeight: orphiTokens.typography.weights.semibold,
  },
  quote: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray600,
    fontStyle: 'italic',
    lineHeight: orphiTokens.typography.sizes.lg,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: orphiTokens.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
