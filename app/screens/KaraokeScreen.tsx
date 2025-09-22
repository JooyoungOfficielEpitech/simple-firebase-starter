import React, { useEffect, useState, useCallback } from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { AVPlaybackStatus } from "expo-av"

import { LyricsDisplay } from "@/components/LyricsDisplay"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Icon } from "@/components/Icon"
import { TouchableOpacity } from "react-native"
import { MusicXMLService, LyricsData } from "@/services/musicxml"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { HomeStackScreenProps } from "@/navigators/HomeStackNavigator"

export function KaraokeScreen({ route, navigation }: HomeStackScreenProps<"KaraokeScreen">) {
  const { themed, theme } = useAppTheme()
  const { song } = route.params

  // 🧪 임시 테스트: "This is the Moment" 곡에 오디오/MusicXML 파일 강제 설정
  const testSong = {
    ...song,
    localMrFile: song.title === "This is the Moment" ? "sample.mp3" : song.localMrFile,
    musicXMLFile: song.title === "This is the Moment" ? "sample.musicxml" : song.musicXMLFile,
    estimatedBPM: song.title === "This is the Moment" ? 120 : song.estimatedBPM,
    audioDuration: song.title === "This is the Moment" ? 180 : song.audioDuration,
  }

  // 상태 관리
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isLyricsLoading, setIsLyricsLoading] = useState(false)
  const [lyricsError, setLyricsError] = useState<string | null>(null)
  

  console.log("🎯 KaraokeScreen - Test song:", testSong)

  // MusicXML 가사 데이터 로드
  useEffect(() => {
    loadLyricsData()
  }, [testSong.musicXMLFile, testSong.audioDuration, testSong.estimatedBPM])

  const loadLyricsData = async () => {
    if (!testSong.musicXMLFile || !testSong.audioDuration) {
      console.log("🎼 MusicXML 정보 없음, 가사 동기화 생략")
      return
    }

    try {
      setIsLyricsLoading(true)
      setLyricsError(null)

      console.log("🎵 MusicXML 가사 로드 시작:", {
        file: testSong.musicXMLFile,
        duration: testSong.audioDuration,
        bpm: testSong.estimatedBPM
      })

      const lyrics = await MusicXMLService.loadLyricsFromAsset(
        testSong.musicXMLFile,
        testSong.audioDuration,
        testSong.estimatedBPM || 120
      )

      setLyricsData(lyrics)
      console.log("✅ 가사 데이터 로드 성공:", lyrics.lyrics.length, "개 가사")
    } catch (error) {
      console.error("❌ 가사 데이터 로드 실패:", error)
      setLyricsError("가사 데이터를 로드할 수 없습니다")
    } finally {
      setIsLyricsLoading(false)
    }
  }

  // 오디오 재생 상태 업데이트 처리
  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded && status.positionMillis) {
      const timeInSeconds = status.positionMillis / 1000
      setCurrentTime(timeInSeconds)
    }
  }, [])


  const hasAudio = testSong.localMrFile || testSong.mrUrl
  const hasLyrics = testSong.musicXMLFile || testSong.musicXMLUrl

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <View style={themed($container)}>
        {/* 통합 가사 및 오디오 플레이어 영역 */}
        <View style={themed($lyricsContainer)}>
          {/* 뒤로가기 아이콘 */}
          <TouchableOpacity
            style={themed($backIcon)}
            onPress={() => navigation.goBack()}
          >
            <Icon icon="caretLeft" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          {hasLyrics ? (
            <>
              {isLyricsLoading && (
                <Text
                  text="가사를 불러오는 중..."
                  style={themed($statusText)}
                />
              )}
              
              {lyricsError && (
                <Text
                  text={`❌ ${lyricsError}`}
                  style={themed($errorText)}
                />
              )}
              
              {lyricsData && !isLyricsLoading && (
                <LyricsDisplay
                  lyricsData={lyricsData}
                  currentTime={currentTime}
                  displayMode="karaoke"
                  audioFile={hasAudio ? testSong.localMrFile : undefined}
                  audioUrl={hasAudio ? testSong.mrUrl : undefined}
                  onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                  pitchAnalysisEnabled={!!hasAudio}
                  style={themed($lyricsDisplay)}
                />
              )}
            </>
          ) : (
            <View style={themed($noContentContainer)}>
              <Text
                text="🎤 준비 중"
                preset="subheading" 
                style={themed($sectionTitle)}
              />
              <Text
                text={hasAudio 
                  ? "이 곡의 가사 동기화 데이터가 아직 준비되지 않았습니다." 
                  : "이 곡의 MR 파일과 가사 데이터가 아직 준비되지 않았습니다."
                }
                style={themed($noContentText)}
              />
            </View>
          )}
        </View>

      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $backIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignSelf: "flex-start",
  padding: spacing.sm,
  marginBottom: spacing.md,
})


const $lyricsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  flex: 1,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.md,
})

const $lyricsDisplay: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  minHeight: 400,
  borderRadius: 8,
  flex: 1,
})

const $noContentContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  padding: spacing.lg,
  borderRadius: 8,
  backgroundColor: colors.palette.neutral100,
  alignItems: "center",
  minHeight: 400,
  justifyContent: "center",
})

const $noContentText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})

const $statusText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
  marginVertical: 20,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.error,
  fontFamily: typography.primary.normal,
  textAlign: "center",
  marginVertical: 20,
})


