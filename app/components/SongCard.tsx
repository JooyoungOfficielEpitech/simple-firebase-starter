import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Play, Music2 } from 'lucide-react-native'
import { OrphiCard, orphiTokens } from '@/design-system'
import { useTheme } from '@/core/context/ThemeContext'

export interface SongCardProps {
  title: string
  musical?: string
  artist?: string
  duration?: string
  onPlay?: () => void
}

export const SongCard: React.FC<SongCardProps> = ({
  title,
  musical,
  artist,
  duration,
  onPlay,
}) => {
  const { currentTheme } = useTheme()

  return (
    <OrphiCard variant="elevated" shadow="md" style={styles.card}>
      <View style={styles.content}>
        {/* Album Art */}
        <View style={[styles.albumArt, { backgroundColor: currentTheme.colors.primary100 }]}>
          <Music2 size={24} color={currentTheme.colors.primary600} strokeWidth={2} />
        </View>

        {/* Song Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {musical && (
            <Text style={styles.musical} numberOfLines={1}>
              {musical}
            </Text>
          )}
          {artist && (
            <Text style={styles.artist} numberOfLines={1}>
              {artist}
            </Text>
          )}
        </View>

        {/* Play Button & Duration */}
        <View style={styles.controls}>
          {duration && <Text style={styles.duration}>{duration}</Text>}
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: currentTheme.colors.primary600 }]}
            onPress={onPlay}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Play size={20} color={orphiTokens.colors.white} fill={orphiTokens.colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </OrphiCard>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: orphiTokens.spacing.md,
    padding: orphiTokens.spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: orphiTokens.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: orphiTokens.spacing.md,
  },
  info: {
    flex: 1,
    marginRight: orphiTokens.spacing.md,
  },
  title: {
    fontSize: orphiTokens.typography.sizes.base,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray900,
    marginBottom: 2,
  },
  musical: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray600,
    marginBottom: 2,
  },
  artist: {
    fontSize: orphiTokens.typography.sizes.xs,
    color: orphiTokens.colors.gray500,
  },
  controls: {
    alignItems: 'flex-end',
    gap: orphiTokens.spacing.xs,
  },
  duration: {
    fontSize: orphiTokens.typography.sizes.xs,
    color: orphiTokens.colors.gray500,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...orphiTokens.shadows.md,
  },
})
