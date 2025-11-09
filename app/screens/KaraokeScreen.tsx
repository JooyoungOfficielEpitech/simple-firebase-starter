import React, { useCallback, useState, useEffect, useMemo } from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { AVPlaybackStatus } from "expo-av"

import { AudioPlayer, SavedSection } from "@/components/AudioPlayer"
import { SavedSectionsList } from "@/components/SavedSectionsList"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { HomeStackScreenProps } from "@/navigators/HomeStackNavigator"
import { loadSavedSections, saveSectionsToStorage } from "@/utils/audioHelpers"

export function KaraokeScreen({ route, navigation }: HomeStackScreenProps<"KaraokeScreen">) {
  const { themed } = useAppTheme()
  const { song } = route.params

  // 곡 ID 생성 (song.id가 있으면 사용, 없으면 title 사용)
  const songId = song.id || song.title

  // 전체 저장된 구간들 상태 관리 (모든 곡의 구간)
  const [allSavedSections, setAllSavedSections] = useState<SavedSection[]>([])
  // 로드할 구간 상태
  const [sectionToLoad, setSectionToLoad] = useState<SavedSection | null>(null)

  // 현재 곡의 구간만 필터링
  const currentSongSections = useMemo(() => {
    return allSavedSections.filter(section => section.songId === songId)
  }, [allSavedSections, songId])

  // 초기 로드: 저장된 모든 구간 불러오기
  useEffect(() => {
    const loadedSections = loadSavedSections()
    setAllSavedSections(loadedSections)
    console.log(`📚 전체 구간 로드: ${loadedSections.length}개, 현재 곡 구간: ${loadedSections.filter(s => s.songId === songId).length}개`)
  }, [])

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
    // newSections는 현재 곡의 구간만 포함
    // 전체 구간 배열을 업데이트: 다른 곡 구간 유지 + 현재 곡 구간 교체
    setAllSavedSections(prev => {
      const otherSongSections = prev.filter(s => s.songId !== songId)
      return [...otherSongSections, ...newSections]
    })
    saveSectionsToStorage([...allSavedSections.filter(s => s.songId !== songId), ...newSections])
  }, [songId, allSavedSections])

  // 구간 로드 처리
  const handleLoadSection = useCallback((section: SavedSection) => {
    console.log("🎯 Loading section:", section.name)
    setSectionToLoad(section)
    // 로드 후 상태 초기화 (다음 로드를 위해)
    setTimeout(() => setSectionToLoad(null), 100)
  }, [])

  // 구간 삭제 처리
  const handleDeleteSection = useCallback((sectionId: string) => {
    setAllSavedSections(prev => {
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
              songId={songId}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              savedSections={currentSongSections}
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

        {/* 저장된 구간 목록 (현재 곡만) */}
        {hasAudio && (
          <SavedSectionsList
            sections={currentSongSections}
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