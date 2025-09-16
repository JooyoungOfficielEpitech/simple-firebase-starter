import React, { useMemo } from "react"
import { FlatList, FlatListProps, ViewStyle } from "react-native"

import { EmptyState } from "@/components/EmptyState"
import { SongListItem } from "@/components/SongListItem"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { Song } from "@/types/song"

export interface SongListProps extends Omit<FlatListProps<Song>, 'data' | 'renderItem'> {
  /**
   * Array of songs to display
   */
  songs: Song[]
  /**
   * Search query to filter songs
   */
  searchQuery?: string
  /**
   * Callback when a song is pressed
   */
  onSongPress?: (song: Song) => void
  /**
   * Container style override
   */
  containerStyle?: ViewStyle
  /**
   * Custom empty state message
   */
  emptyStateMessage?: string
}

/**
 * SongList component for displaying a filterable list of songs
 */
export function SongList({
  songs,
  searchQuery = "",
  onSongPress,
  containerStyle,
  emptyStateMessage,
  ...flatListProps
}: SongListProps) {
  const { themed } = useAppTheme()

  // Filter songs based on search query
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) {
      return songs
    }
    
    const query = searchQuery.toLowerCase().trim()
    const filtered = songs.filter(song => 
      song.title.toLowerCase().includes(query) ||
      song.musical.toLowerCase().includes(query)
    )
    return filtered
  }, [songs, searchQuery])

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <SongListItem
      song={item}
      onPress={() => onSongPress?.(item)}
      showSeparator={index < filteredSongs.length - 1}
    />
  )

  const renderEmptyState = () => (
    <EmptyState
      preset={searchQuery ? "generic" : "generic"}
      heading={searchQuery ? "검색 결과가 없습니다" : "곡이 없습니다"}
      content={
        emptyStateMessage || 
        (searchQuery 
          ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
          : "아직 등록된 곡이 없습니다."
        )
      }
      button={searchQuery ? "검색어 지우기" : undefined}
      buttonOnPress={searchQuery ? () => {} : undefined} // This would be handled by parent
    />
  )


  return (
    <FlatList
      data={filteredSongs}
      renderItem={renderSongItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      style={themed([$container, containerStyle])}
      ListEmptyComponent={renderEmptyState}
      removeClippedSubviews={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      {...flatListProps}
    />
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})