import React, { useCallback, useState } from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { AVPlaybackStatus } from "expo-av"
import { MMKV } from "react-native-mmkv"

import { AudioPlayer, SavedSection } from "@/components/AudioPlayer"
import { SavedSectionsList } from "@/components/SavedSectionsList"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { HomeStackScreenProps } from "@/navigators/HomeStackNavigator"

// MMKV 스토리지 인스턴스
const storage = new MMKV()
const SAVED_SECTIONS_KEY = "audio_player_saved_sections"

// 로컬 스토리지 유틸리티 함수
const saveSectionsToStorage = (sections: SavedSection[]) => {
  try {
    storage.set(SAVED_SECTIONS_KEY, JSON.stringify(sections))
    console.log("✅ 구간을 로컬 스토리지에 저장 완료:", sections.length, "개")
  } catch (error) {
    console.error("❌ 구간 저장 실패:", error)
  }
}

export function KaraokeScreen({ route, navigation }: HomeStackScreenProps<"KaraokeScreen">) {
  const { themed } = useAppTheme()
  const { song } = route.params

  // 저장된 구간들 상태 관리
  const [savedSections, setSavedSections] = useState<SavedSection[]>([])
  // 로드할 구간 상태
  const [sectionToLoad, setSectionToLoad] = useState<SavedSection | null>(null)

  // 🧪 임시 테스트: 여러 곡에 오디오 파일 설정
  const testSong = {
    ...song,
    // 로컬 파일 설정 (assets/audio/ 폴더에 있는 파일들)
    localMrFile: (() => {
      switch (song.title) {
        case "This is the Moment":
          return "sample.mp3"
        // 다른 곡들도 sample.mp3 사용하도록 설정
        case "지킬 앤 하이드":
        case "Jekyll & Hyde":
          return "sample.mp3"
        // 모든 곡에 sample.mp3 사용하고 싶다면 아래 주석 해제
        // default:
        //   return "sample.mp3"
        default:
          return song.localMrFile || "sample.mp3" // 기본값으로 sample.mp3 사용
      }
    })(),
    
    // 또는 URL로 테스트하고 싶다면 아래 주석 해제
    // mrUrl: song.title === "This is the Moment" ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" : song.mrUrl,
  }

  console.log("🎯 MusicPlayer - Test song:", testSong)

  // 오디오 재생 상태 업데이트 처리
  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    // 필요시 재생 상태 로깅
    console.log("🎵 Playback status:", status.isLoaded ? `${Math.floor((status.positionMillis || 0) / 1000)}s` : "Not loaded")
  }, [])

  // 저장된 구간 업데이트 처리
  const handleSavedSectionsChange = useCallback((newSections: SavedSection[]) => {
    setSavedSections(newSections)
  }, [])

  // 구간 로드 처리
  const handleLoadSection = useCallback((section: SavedSection) => {
    console.log("🎯 Loading section:", section.name)
    setSectionToLoad(section)
    // 로드 후 상태 초기화 (다음 로드를 위해)
    setTimeout(() => setSectionToLoad(null), 100)
  }, [])

  // 구간 삭제 처리
  const handleDeleteSection = useCallback((sectionId: string) => {
    setSavedSections(prev => {
      const updatedSections = prev.filter(s => s.id !== sectionId)
      // 로컬 스토리지에 업데이트된 구간들 저장
      saveSectionsToStorage(updatedSections)
      return updatedSections
    })
  }, [])

  const hasAudio = testSong.localMrFile || testSong.mrUrl

  return (
    <Screen preset="scroll" safeAreaEdges={[]}>
      <ScreenHeader title={testSong.title} />
      <View style={themed($container)}>
        {/* 곡 정보 */}
        <View style={themed($songInfoContainer)}>
        </View>

        {/* 오디오 플레이어 */}
        <View style={themed($playerContainer)}>
          {hasAudio ? (
            <AudioPlayer
              audioFile={typeof testSong.localMrFile === 'string' ? testSong.localMrFile : undefined}
              audioUrl={typeof testSong.mrUrl === 'string' ? testSong.mrUrl : undefined}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              savedSections={savedSections}
              onSavedSectionsChange={handleSavedSectionsChange}
              onLoadSection={handleLoadSection}
              loadSection={sectionToLoad}
              style={themed($audioPlayer)}
            />
          ) : (
            <View style={themed($noAudioContainer)}>
              <Text
                text="🎵"
                style={themed($musicIcon)}
              />
              <Text
                text="오디오 파일이 준비되지 않았습니다"
                style={themed($noAudioText)}
              />
            </View>
          )}
        </View>

        {/* 저장된 구간 목록 */}
        {hasAudio && (
          <SavedSectionsList
            sections={savedSections}
            onLoadSection={handleLoadSection}
            onDeleteSection={handleDeleteSection}
            style={themed($savedSectionsContainer)}
          />
        )}
      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.background,
  padding: spacing.lg,
  justifyContent: "center",
  minHeight: 400,
})

const $songInfoContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginBottom: spacing.xxl,
})

const $songTitle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  textAlign: "center",
  color: colors.text,
  marginBottom: spacing.sm,
})


const $playerContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  padding: spacing.lg,
  minHeight: 200,
  justifyContent: "center",
})

const $audioPlayer: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "transparent",
})

const $noAudioContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xl,
})

const $musicIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  fontSize: 48,
  textAlign: "center",
  marginBottom: spacing.md,
})

const $noAudioText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  textAlign: "center",
  color: colors.textDim,
  fontSize: 16,
  fontFamily: typography.primary.normal,
})

const $savedSectionsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
})