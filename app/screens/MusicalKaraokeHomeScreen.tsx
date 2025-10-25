import React, { useState, useCallback, useEffect } from "react"
import { View, ViewStyle, TextStyle } from "react-native"

import { LoadingOverlay } from "@/components/LoadingOverlay"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
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
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Initialize and load songs from Firebase
  useEffect(() => {
    // 15초 후 timeout
    const timeoutId = setTimeout(() => {
      console.log('🚨 Loading timeout - 15초 초과')
      setTimeoutReached(true)
      setLoading(false)
      setError('로딩 시간이 초과되었습니다. 네트워크를 확인해주세요.')
    }, 15000)

    initializeAndLoadSongs().finally(() => {
      clearTimeout(timeoutId)
    })

    return () => clearTimeout(timeoutId)
  }, [])

  const initializeAndLoadSongs = async () => {
    try {
      setLoading(true)
      setError(null)
      setTimeoutReached(false)
      
      console.log("🎵 Firebase 초기화 시작...")
      
      // Initialize sample data if needed (only runs once)
      await SongService.initializeSampleData()
      console.log("✅ Firebase 샘플 데이터 초기화 완료")
      
      // Load songs from Firestore
      const songsData = await SongService.getAllSongs()
      setSongs(songsData)
      
      console.log("🎵 Loaded songs from Firebase:", songsData.length)
      
      if (songsData.length === 0) {
        setError("곡 목록이 비어있습니다. 데이터를 다시 불러와주세요.")
      }
    } catch (err) {
      console.error("❌ Failed to load songs:", err)
      
      // 구체적인 오류 메시지 제공
      let errorMessage = "곡 목록을 불러오는데 실패했습니다."
      
      if (err.message?.includes('network')) {
        errorMessage = "네트워크 연결을 확인해주세요."
      } else if (err.message?.includes('permission')) {
        errorMessage = "Firebase 권한 오류입니다. 관리자에게 문의하세요."
      } else if (err.message?.includes('quota')) {
        errorMessage = "Firebase 할당량이 초과되었습니다."
      }
      
      setError(`${errorMessage}\n\n오류 상세: ${err.message}`)
    } finally {
      console.log("🏁 Firebase 초기화 완료 (성공/실패 무관)")
      setLoading(false)
    }
  }

  const handleSongPress = useCallback((song: Song) => {
    console.log("🎯 Song pressed:", song)
    navigation.navigate("KaraokeScreen", { song })
  }, [navigation])

  const handleRetry = useCallback(() => {
    console.log("🔄 사용자가 재시도 요청")
    setError(null)
    setTimeoutReached(false)
    initializeAndLoadSongs()
  }, [])

  if (loading) {
    return (
      <Screen preset="fixed">
        <LoadingOverlay 
          visible={true} 
          message={timeoutReached ? "로딩 중... 터치하면 취소됩니다" : "데이터를 불러오는 중..."}
          onRequestClose={() => {
            console.log('🚨 사용자가 로딩을 강제 취소')
            setLoading(false)
            setError('로딩이 취소되었습니다. 다시 시도해주세요.')
          }}
        />
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
    <Screen preset="scroll" safeAreaEdges={[]}>
      <ScreenHeader 
        title="🎤 오르피 Orphy"
        showBackButton={false}
      />
      <View style={themed($container)}>
        {/* Welcome message */}
        <View style={themed($welcomeContainer)}>
          <Text
            text="뮤지컬 노래방에 오신 것을 환영합니다"
            style={themed($appSubtitle)}
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

const $welcomeContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xs,
})

const $appSubtitle: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  textAlign: "center",
  color: colors.textDim,
  fontSize: 14,
  lineHeight: 22,
  fontFamily: typography.primary.normal,
})

const $searchContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
})

const $sectionHeader: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  backgroundColor: colors.primaryAction + "10", // BOLD: Section header with primary color background
  borderTopWidth: 2, // Thicker border
  borderBottomWidth: 2,
  borderColor: colors.primaryAction + "30", // Primary color border
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.primaryAction, // BOLD: Section title in primary color
  fontFamily: typography.primary.medium,
  fontWeight: "700" as const, // Make it bolder
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

const $errorTitle: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  color: colors.error,
  textAlign: "center",
  marginBottom: spacing.md,
  fontSize: 24, // Use xl size
  lineHeight: 36,
  fontFamily: typography.primary.bold,
})

const $errorMessage: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginBottom: spacing.xl,
  fontSize: 16, // Use sm size
  lineHeight: 26,
  fontFamily: typography.primary.normal,
  paddingHorizontal: spacing.lg,
})

const $retryButton: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  color: colors.tint,
  textAlign: "center",
  fontSize: 16,
  lineHeight: 26,
  fontFamily: typography.primary.medium,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  borderWidth: 1,
  borderColor: colors.tint,
  borderRadius: 8, // Match other components
  backgroundColor: colors.palette.neutral100,
  minWidth: 44, // Better touch target
  minHeight: 56, // Match button height
})