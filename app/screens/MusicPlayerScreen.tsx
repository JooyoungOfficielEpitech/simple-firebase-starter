import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { OrphiHeader, orphiTokens } from '@/design-system'
import { SongCard } from '@/components/SongCard'
import { SearchBar } from '@/components/SearchBar'
import { SongService } from '@/core/services/firestore'
import { Song } from '@/core/types/song'

export const MusicPlayerScreen: React.FC = () => {
  const navigation = useNavigation()
  const [songs, setSongs] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    loadSongs()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(songs)
    } else {
      const filtered = songs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.musical?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSongs(filtered)
    }
  }, [searchQuery, songs])

  const loadSongs = async () => {
    try {
      // Firestore에서 노래 목록 가져오기
      const songList = await SongService.getAllSongs()
      setSongs(songList)
      setFilteredSongs(songList)
    } catch (error) {
      console.error('Failed to load songs:', error)
    }
  }

  const handlePlaySong = (song: Song) => {
    console.log('Playing song:', song.title)
    ;(navigation as any).navigate('KaraokeScreen', { song })
  }

  const handleNotificationPress = () => {
    ;(navigation as any).navigate('NotificationCenter')
  }

  const renderSong = ({ item }: { item: Song }) => {
    // Format audioDuration to MM:SS
    const formatDuration = (seconds?: number): string => {
      if (!seconds) return ''
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
      <SongCard
        title={item.title}
        musical={item.musical}
        duration={formatDuration(item.audioDuration)}
        onPlay={() => handlePlaySong(item)}
      />
    )
  }

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {searchQuery ? '검색 결과가 없습니다' : '등록된 곡이 없습니다'}
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <OrphiHeader
        title="연습실"
        subtitle="🎵 나만의 무대를 준비하세요"
        showBell
        bellBadgeCount={unreadNotifications}
        onBellPress={handleNotificationPress}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="곡명/뮤지컬명 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>곡 리스트 ({filteredSongs.length})</Text>
      </View>

      {/* Song List */}
      <FlatList
        data={filteredSongs}
        renderItem={renderSong}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orphiTokens.colors.background,
  },
  searchContainer: {
    paddingHorizontal: orphiTokens.spacing.base,
    paddingVertical: orphiTokens.spacing.md,
    backgroundColor: orphiTokens.colors.white,
  },
  sectionHeader: {
    paddingHorizontal: orphiTokens.spacing.base,
    paddingVertical: orphiTokens.spacing.md,
    backgroundColor: orphiTokens.colors.background,
  },
  sectionTitle: {
    fontSize: orphiTokens.typography.sizes.lg,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray900,
  },
  listContent: {
    paddingHorizontal: orphiTokens.spacing.base,
    paddingBottom: orphiTokens.spacing.xl,
  },
  emptyState: {
    paddingVertical: orphiTokens.spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: orphiTokens.typography.sizes.base,
    color: orphiTokens.colors.gray500,
  },
})
