import React, { useMemo } from "react"
import { View, ViewStyle, TextStyle, ScrollView } from "react-native"

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
}: LyricsDisplayProps) {
  const { themed } = useAppTheme()

  // 현재 가사 인덱스 계산
  const currentLyricIndex = useMemo(() => {
    if (!lyricsData) return -1
    
    return lyricsData.lyrics.findIndex(
      lyric => currentTime >= lyric.startTime && currentTime <= lyric.endTime
    )
  }, [lyricsData, currentTime])

  // 표시할 가사들 결정
  const displayLyrics = useMemo(() => {
    if (!lyricsData) return []

    switch (displayMode) {
      case "full":
        return lyricsData.lyrics

      case "preview":
        const startIndex = Math.max(0, currentLyricIndex - 1)
        return lyricsData.lyrics.slice(startIndex, startIndex + previewLines)

      case "karaoke":
      default:
        // 현재 가사 + 앞뒤 2줄씩
        const centerIndex = Math.max(0, currentLyricIndex)
        const start = Math.max(0, centerIndex - 2)
        const end = Math.min(lyricsData.lyrics.length, centerIndex + 3)
        return lyricsData.lyrics.slice(start, end)
    }
  }, [lyricsData, currentLyricIndex, displayMode, previewLines])

  if (!lyricsData || displayLyrics.length === 0) {
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
      <ScrollView 
        contentContainerStyle={themed($scrollContent)}
        showsVerticalScrollIndicator={false}
      >
        {/* 제목 */}
        <Text
          text={lyricsData.title}
          preset="subheading"
          style={themed($title)}
        />

        {/* 가사 목록 */}
        <View style={themed($lyricsContainer)}>
          {displayLyrics.map((lyric, index) => {
            const globalIndex = lyricsData.lyrics.indexOf(lyric)
            const isActive = globalIndex === currentLyricIndex
            const isPast = currentTime > lyric.endTime
            const isFuture = currentTime < lyric.startTime

            return (
              <LyricLine
                key={`${lyric.startTime}-${index}`}
                lyric={lyric}
                isActive={isActive}
                isPast={isPast}
                isFuture={isFuture}
                currentTime={currentTime}
              />
            )
          })}
        </View>

        {/* 진행도 표시 */}
        {displayMode === "karaoke" && (
          <View style={themed($progressInfo)}>
            <Text
              text={`${currentLyricIndex + 1} / ${lyricsData.lyrics.length}`}
              style={themed($progressInfoText)}
            />
          </View>
        )}
      </ScrollView>
    </View>
  )
}

interface LyricLineProps {
  lyric: LyricItem
  isActive: boolean
  isPast: boolean
  isFuture: boolean
  currentTime: number
}

function LyricLine({ lyric, isActive, isPast, isFuture, currentTime }: LyricLineProps) {
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
            isFuture && $futureLyric
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
              style={themed([$lyricText, $progressText])}
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
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.lg,
})

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  textAlign: "center",
  color: colors.text,
  marginBottom: spacing.lg,
})

const $lyricsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
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