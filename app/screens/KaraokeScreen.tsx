import React, { useEffect } from "react"
import { View, ViewStyle, TextStyle } from "react-native"

import { AudioPlayer } from "@/components/AudioPlayer"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { HomeStackScreenProps } from "@/navigators/HomeStackNavigator"

export function KaraokeScreen({ route, navigation }: HomeStackScreenProps<"KaraokeScreen">) {
  const { themed } = useAppTheme()
  const { song } = route.params

  // 🧪 임시 테스트: "This is the Moment" 곡에 오디오 파일 강제 설정
  const testSong = {
    ...song,
    localMrFile: song.title === "This is the Moment" ? "sample.mp3" : song.localMrFile
  }

  console.log("🎯 KaraokeScreen - Original song:", song)
  console.log("🧪 KaraokeScreen - Test song:", testSong)

  useEffect(() => {
    // 네비게이션 헤더 제목 설정
    navigation.setOptions({
      title: song.title,
    })
  }, [song.title, navigation])

  const hasAudio = testSong.localMrFile || testSong.mrUrl

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <View style={themed($container)}>
        {/* 곡 정보 헤더 */}
        <View style={themed($songInfoContainer)}>
          <Text
            text={song.title}
            preset="heading"
            style={themed($songTitle)}
          />
          <Text
            text={`뮤지컬: ${song.musical}`}
            style={themed($musicalName)}
          />
        </View>

        {/* 오디오 플레이어 */}
        <View style={themed($playerContainer)}>
          {hasAudio ? (
            <>
              <Text
                text="🎵 MR 재생"
                preset="subheading"
                style={themed($sectionTitle)}
              />
              <AudioPlayer
                audioFile={testSong.localMrFile}
                audioUrl={testSong.mrUrl}
                style={themed($audioPlayer)}
                onPlaybackStatusUpdate={(status) => {
                  console.log("Playback status:", status)
                }}
              />
            </>
          ) : (
            <View style={themed($noAudioContainer)}>
              <Text
                text="🎤 준비 중"
                preset="subheading"
                style={themed($sectionTitle)}
              />
              <Text
                text="이 곡의 MR 파일이 아직 준비되지 않았습니다."
                style={themed($noAudioText)}
              />
            </View>
          )}
        </View>

        {/* 가사 영역 (추후 구현) */}
        <View style={themed($lyricsContainer)}>
          <Text
            text="🎼 가사"
            preset="subheading"
            style={themed($sectionTitle)}
          />
          <View style={themed($lyricsPlaceholder)}>
            <Text
              text="가사 동기화 기능을 준비 중입니다..."
              style={themed($placeholderText)}
            />
          </View>
        </View>

        {/* 음정 분석 영역 (추후 구현) */}
        <View style={themed($pitchContainer)}>
          <Text
            text="🎯 음정 분석"
            preset="subheading"
            style={themed($sectionTitle)}
          />
          <View style={themed($pitchPlaceholder)}>
            <Text
              text="실시간 음정 분석 기능을 준비 중입니다..."
              style={themed($placeholderText)}
            />
          </View>
        </View>
      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $songInfoContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  padding: spacing.lg,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  alignItems: "center",
})

const $songTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  textAlign: "center",
  marginBottom: spacing.xs,
})

const $musicalName: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 16,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})

const $playerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.md,
})

const $audioPlayer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
})

const $noAudioContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  padding: spacing.lg,
  borderRadius: 8,
  backgroundColor: colors.palette.neutral100,
  alignItems: "center",
})

const $noAudioText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})

const $lyricsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
})

const $lyricsPlaceholder: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 200,
  padding: spacing.lg,
  borderRadius: 8,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center",
  alignItems: "center",
})

const $pitchContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
})

const $pitchPlaceholder: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 150,
  padding: spacing.lg,
  borderRadius: 8,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center",
  alignItems: "center",
})

const $placeholderText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})