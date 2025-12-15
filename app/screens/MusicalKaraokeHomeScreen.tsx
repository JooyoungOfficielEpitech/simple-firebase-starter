import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { OrphiHeader, OrphiCard, OrphiText, OrphiButton, orphiTokens } from '@/design-system'
import { useNavigation } from '@react-navigation/native'
import { Music } from 'lucide-react-native'
import { useTheme } from '@/core/context/ThemeContext'

const SAMPLE_SONGS = [
  { id: '1', title: '샘플 곡 1', artist: '아티스트 1' },
  { id: '2', title: '샘플 곡 2', artist: '아티스트 2' },
  { id: '3', title: '샘플 곡 3', artist: '아티스트 3' },
]

export const MusicalKaraokeHomeScreen: React.FC = () => {
  const navigation = useNavigation()
  const { currentTheme } = useTheme()

  const handleSongPress = (song: any) => {
    // @ts-ignore - Navigation typing issue
    navigation.navigate('KaraokeScreen', { song })
  }

  return (
    <View style={styles.container}>
      <OrphiHeader title="곡 목록" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {SAMPLE_SONGS.map((song) => (
          <OrphiCard key={song.id} style={styles.songCard}>
            <TouchableOpacity onPress={() => handleSongPress(song)}>
              <View style={styles.songContent}>
                <View style={[styles.iconContainer, { backgroundColor: currentTheme.colors.primary100 }]}>
                  <Music size={24} color={currentTheme.colors.primary600} />
                </View>
                <View style={styles.songInfo}>
                  <OrphiText variant="h4">{song.title}</OrphiText>
                  <OrphiText variant="body" color="gray600">{song.artist}</OrphiText>
                </View>
              </View>
            </TouchableOpacity>
          </OrphiCard>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orphiTokens.colors.background,
  },
  scrollContent: {
    padding: orphiTokens.spacing.base,
  },
  songCard: {
    marginBottom: orphiTokens.spacing.md,
  },
  songContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: orphiTokens.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: orphiTokens.spacing.md,
  },
  songInfo: {
    flex: 1,
  },
})
