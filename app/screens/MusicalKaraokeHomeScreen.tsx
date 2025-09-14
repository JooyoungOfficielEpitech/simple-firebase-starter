import React, { useState, useCallback, useEffect } from "react"
import { View, ViewStyle, TextStyle } from "react-native"

import { LoadingOverlay } from "@/components/LoadingOverlay"
import { Screen } from "@/components/Screen"
import { SearchBar } from "@/components/SearchBar"
import { SongList } from "@/components/SongList"
import { Text } from "@/components/Text"
import { SongService } from "@/services/firestore/songService"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { type Song } from "@/types/song"
import type { HomeStackScreenProps } from "@/navigators/HomeStackNavigator"

export function MusicalKaraokeHomeScreen({ navigation }: HomeStackScreenProps<"HomeMain">) {
  const { themed } = useAppTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize and load songs from Firebase
  useEffect(() => {
    initializeAndLoadSongs()
  }, [])

  const initializeAndLoadSongs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Initialize sample data if needed (only runs once)
      await SongService.initializeSampleData()
      
      // Load songs from Firestore
      const songsData = await SongService.getAllSongs()
      setSongs(songsData)
      
      console.log("🎵 Loaded songs from Firebase:", songsData.length)
    } catch (err) {
      console.error("Failed to load songs:", err)
      setError("곡 목록을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleSongPress = useCallback((song: Song) => {
    console.log("🎯 Song pressed:", song)
    navigation.navigate("KaraokeScreen", { song })
  }, [navigation])

  const handleRetry = useCallback(() => {
    initializeAndLoadSongs()
  }, [])

  if (loading) {
    return (
      <Screen preset="fixed">
        <LoadingOverlay visible={true} />
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen preset="fixed">
        <View style={themed($errorContainer)}>
          <Text text="❌ 오류 발생" preset="heading" style={themed($errorTitle)} />
          <Text text={error} style={themed($errorMessage)} />
          <Text
            text="다시 시도"
            style={themed($retryButton)}
            onPress={handleRetry}
          />
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <View style={themed($container)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text
            text="오르피 Orphy"
            preset="heading"
            style={themed($appTitle)}
          />
        </View>

        {/* Search Bar */}
        <View style={themed($searchContainer)}>
          <SearchBar
            placeholder="곡명/뮤지컬명 검색"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        {/* Song List Header */}
        <View style={themed($sectionHeader)}>
          <Text
            text={`🎵 곡 리스트 (${songs.length}곡)`}
            preset="subheading"
            style={themed($sectionTitle)}
          />
        </View>

        {/* Song List */}
        <View style={themed($songListContainer)}>
          <SongList
            songs={songs}
            searchQuery={searchQuery}
            onSongPress={handleSongPress}
            scrollEnabled={false}
            style={themed($songList)}
          />
        </View>
      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexGrow: 1,
  backgroundColor: colors.background,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  backgroundColor: colors.background,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
})

const $appTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  textAlign: "center",
  color: colors.text,
})

const $searchContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
})

const $sectionHeader: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  backgroundColor: colors.palette.neutral200,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: colors.separator,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $songListContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  minHeight: 400, // Ensure minimum height for FlatList
  backgroundColor: colors.background,
})

const $songList: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  backgroundColor: colors.background,
})

const $errorTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  textAlign: "center",
  marginBottom: spacing.md,
})

const $errorMessage: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  textAlign: "center",
  marginBottom: spacing.xl,
})

const $retryButton: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.tint,
  textAlign: "center",
  fontSize: 16,
  fontWeight: "bold",
  padding: spacing.md,
  borderWidth: 1,
  borderColor: colors.tint,
  borderRadius: 8,
  backgroundColor: colors.palette.neutral100,
})