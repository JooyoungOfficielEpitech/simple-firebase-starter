import React from 'react'
import { View, StyleSheet } from 'react-native'
import { OrphiText, orphiTokens } from '@/design-system'
import type { Song } from '@/core/types/song'

interface SongInfoProps {
  song: Song
}

export const SongInfo: React.FC<SongInfoProps> = ({ song }) => {
  return (
    <View style={styles.container}>
      <OrphiText variant="h2" style={styles.title}>
        {song.title}
      </OrphiText>
      <OrphiText variant="body" color="gray600" style={styles.musical}>
        {song.musical}
      </OrphiText>
      {song.estimatedBPM && (
        <OrphiText variant="caption" color="gray500" style={styles.bpm}>
          추정 BPM: {song.estimatedBPM}
        </OrphiText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: orphiTokens.spacing.lg,
    paddingHorizontal: orphiTokens.spacing.base,
    alignItems: 'center',
  },
  title: {
    marginBottom: orphiTokens.spacing.sm,
    textAlign: 'center',
  },
  musical: {
    marginBottom: orphiTokens.spacing.xs,
    textAlign: 'center',
  },
  bpm: {
    textAlign: 'center',
  },
})
