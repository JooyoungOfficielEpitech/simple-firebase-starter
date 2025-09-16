import React, { useMemo } from "react"
import { View, ViewStyle, TextStyle, Animated } from "react-native"
import { AVPlaybackStatus } from "expo-av"

import { AudioPlayer } from "@/components/AudioPlayer"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { LyricsData, LyricItem } from "@/services/musicxml"

export interface LyricsDisplayProps {
  /**
   * 가사 동기화 데이터
   */
  lyricsData: LyricsData | null
  
  /**
   * 현재 재생 시간 (초)
   */
  currentTime: number
  
  /**
   * 컨테이너 스타일
   */
  style?: ViewStyle
  
  /**
   * 가사 표시 모드
   */
  displayMode?: "karaoke" | "full" | "preview"
  
  /**
   * 미리보기 라인 수 (preview 모드에서)
   */
  previewLines?: number
  
  /**
   * 로컬 오디오 파일명 (assets/audio/에서 참조)
   */
  audioFile?: string
  
  /**
   * 오디오 URL (Firebase Storage 등)
   */
  audioUrl?: string
  
  /**
   * 재생 상태 변경 콜백
   */
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void
}

/**
 * 노래방 스타일 가사 표시 컴포넌트
 */
export function LyricsDisplay({
  lyricsData,
  currentTime,
  style,
  displayMode = "karaoke",
  previewLines = 3,
  audioFile,
  audioUrl,
  onPlaybackStatusUpdate,
}: LyricsDisplayProps) {
  const { themed } = useAppTheme()

  // 현재 가사 인덱스 계산
  const currentLyricIndex = useMemo(() => {
    if (!lyricsData) return -1
    
    return lyricsData.lyrics.findIndex(
      lyric => currentTime >= lyric.startTime && currentTime <= lyric.endTime
    )
  }, [lyricsData, currentTime])

  // 현재 활성 가사 가져오기
  const currentLyric = useMemo(() => {
    if (!lyricsData || currentLyricIndex < 0) return null
    return lyricsData.lyrics[currentLyricIndex]
  }, [lyricsData, currentLyricIndex])

  // 다음 가사 가져오기 (미리보기용)
  const nextLyric = useMemo(() => {
    if (!lyricsData || currentLyricIndex < 0) return null
    const nextIndex = currentLyricIndex + 1
    return nextIndex < lyricsData.lyrics.length ? lyricsData.lyrics[nextIndex] : null
  }, [lyricsData, currentLyricIndex])

  if (!lyricsData) {
    return (
      <View style={themed([$container, style])}>
        <Text 
          text="🎤 가사를 준비 중입니다..." 
          style={themed($emptyText)} 
        />
      </View>
    )
  }

  return (
    <View style={themed([$container, style])}>
      {/* 제목 */}
      <Text
        text={lyricsData.title}
        preset="subheading"
        style={themed($title)}
      />

      {/* 노래방 스타일 가사 표시 영역 */}
      <View style={themed($karaokeContainer)}>
        {/* 현재 가사 */}
        <View style={themed($currentLyricContainer)}>
          {currentLyric ? (
            <LyricLine
              lyric={currentLyric}
              isActive={true}
              isPast={false}
              isFuture={false}
              currentTime={currentTime}
              isMainLyric={true}
            />
          ) : (
            <View style={themed($noLyricContainer)}>
              <Text 
                text={currentLyricIndex < 0 ? "🎵 곧 시작됩니다..." : "🎉 완료!"} 
                style={themed($waitingText)} 
              />
            </View>
          )}
        </View>

        {/* 다음 가사 미리보기 */}
        {nextLyric && displayMode === "karaoke" && (
          <View style={themed($nextLyricContainer)}>
            <Text text="다음:" style={themed($nextLabel)} />
            <Text 
              text={nextLyric.text} 
              style={themed($nextLyricText)} 
            />
          </View>
        )}
      </View>

      {/* 진행도 표시 */}
      {displayMode === "karaoke" && (
        <View style={themed($progressInfo)}>
          <Text
            text={`${Math.max(0, currentLyricIndex + 1)} / ${lyricsData.lyrics.length}`}
            style={themed($progressInfoText)}
          />
        </View>
      )}
      
      {/* 하단 오디오 플레이어 */}
      {(audioFile || audioUrl) && (
        <View style={themed($audioPlayerContainer)}>
          <AudioPlayer
            audioFile={audioFile}
            audioUrl={audioUrl}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            style={themed($audioPlayer)}
          />
        </View>
      )}
    </View>
  )
}

interface LyricLineProps {
  lyric: LyricItem
  isActive: boolean
  isPast: boolean
  isFuture: boolean
  currentTime: number
  isMainLyric?: boolean
}

function LyricLine({ lyric, isActive, isPast, isFuture, currentTime, isMainLyric = false }: LyricLineProps) {
  const { themed } = useAppTheme()

  // 활성 가사 내에서의 진행도 계산 (0-1)
  const progress = useMemo(() => {
    if (!isActive) return isPast ? 1 : 0
    
    const duration = lyric.endTime - lyric.startTime
    const elapsed = currentTime - lyric.startTime
    return Math.max(0, Math.min(1, elapsed / duration))
  }, [isActive, isPast, currentTime, lyric])

  return (
    <View style={themed($lyricLineContainer)}>
      {/* 시간 표시 (디버깅용) */}
      {__DEV__ && (
        <Text
          text={`${lyric.startTime.toFixed(1)}s`}
          style={themed($timeIndicator)}
        />
      )}

      {/* 가사 텍스트 */}
      <View style={themed($lyricTextContainer)}>
        {/* 배경 텍스트 */}
        <Text
          text={lyric.text}
          style={themed([
            $lyricText,
            isPast && $pastLyric,
            isActive && $activeLyric,
            isFuture && $futureLyric,
            isMainLyric && $mainLyricText
          ])}
        />

        {/* 진행 오버레이 (활성 가사용) */}
        {isActive && (
          <View 
            style={themed([
              $progressOverlay, 
              { width: `${progress * 100}%` }
            ])}
          >
            <Text
              text={lyric.text}
              style={themed([$lyricText, $progressText, isMainLyric && $mainLyricText])}
            />
          </View>
        )}
      </View>

      {/* 음정 정보 표시 (선택적) */}
      {__DEV__ && lyric.pitch && (
        <Text
          text={`${lyric.pitch.step}${lyric.pitch.octave}`}
          style={themed($pitchIndicator)}
        />
      )}
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.background,
  padding: spacing.md,
  justifyContent: "space-between",
})

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  textAlign: "center",
  color: colors.text,
  marginBottom: spacing.lg,
})

const $karaokeContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.lg,
  minHeight: 200,
})

const $currentLyricContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 80,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  marginBottom: spacing.lg,
})

const $noLyricContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 80,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.md,
})

const $waitingText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 18,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})

const $nextLyricContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingTop: spacing.md,
  paddingHorizontal: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
  alignItems: "center",
})

const $nextLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  marginBottom: 4,
})

const $nextLyricText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
  opacity: 0.7,
})

const $lyricLineContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.sm,
  minHeight: 40,
})

const $timeIndicator: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 10,
  color: colors.textDim,
  fontFamily: typography.code?.normal || typography.primary.normal,
  marginBottom: 2,
})

const $lyricTextContainer: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
  overflow: "hidden",
})

const $lyricText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  lineHeight: 28,
  paddingVertical: spacing.xs,
  textAlign: "center",
})

const $mainLyricText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 24,
  fontFamily: typography.primary.bold,
  lineHeight: 36,
  paddingVertical: spacing.sm,
  color: colors.text,
})

const $pastLyric: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  opacity: 0.6,
})

const $activeLyric: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontWeight: "bold",
})

const $futureLyric: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  opacity: 0.8,
})

const $progressOverlay: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  backgroundColor: colors.tint,
  overflow: "hidden",
})

const $progressText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.background,
  fontWeight: "bold",
})

const $pitchIndicator: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  color: colors.tintInactive,
  fontFamily: typography.code?.normal || typography.primary.normal,
  textAlign: "center",
  marginTop: 2,
})

const $progressInfo: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  alignItems: "center",
  marginTop: spacing.lg,
  paddingTop: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
})

const $progressInfoText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 16,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
  marginTop: 40,
})

const $audioPlayerContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  paddingTop: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
})

const $audioPlayer: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "transparent",
})