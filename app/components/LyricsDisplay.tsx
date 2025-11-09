import React, { useMemo, useState } from "react"
import { View, ViewStyle, TextStyle, Animated, LayoutChangeEvent } from "react-native"
import { AVPlaybackStatus } from "expo-av"

import { AudioPlayer } from "@/components/AudioPlayer"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { LyricsData, LyricItem, SyllableGroup } from "@/services/musicxml"

/**
 * 두 색상 사이를 보간하는 함수
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  // factor는 0-1 사이의 값
  factor = Math.max(0, Math.min(1, factor))
  
  // 16진수 색상을 RGB로 변환
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }
  
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  // 보간 계산
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor)
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor)
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor)
  
  // RGB를 16진수로 변환
  const componentToHex = (c: number) => {
    const hex = c.toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }
  
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`
}

/**
 * 개별 글자 컴포넌트 - 음절별 색상 변화 지원
 */
interface CharacterTextProps {
  character: string
  isPast: boolean
  isActive: boolean
  isFuture: boolean
  progress: number // 0-1
  isMainLyric?: boolean
}

function CharacterText({ 
  character, 
  isPast, 
  isActive, 
  isFuture, 
  progress, 
  isMainLyric = false 
}: CharacterTextProps) {
  const { themed, theme: { colors } } = useAppTheme()
  
  // 글자별 색상 계산
  const characterColor = useMemo(() => {
    if (isPast) return colors.tint // 이미 지나간 글자는 완전한 accent 색상 유지
    if (isFuture) return colors.textDim
    if (isActive) {
      // 점진적 색상 변화: textDim → tint
      return interpolateColor(colors.textDim, colors.tint, progress)
    }
    return colors.textDim
  }, [isPast, isActive, isFuture, progress, colors])
  
  // 활성 글자에 glow 효과
  const glowEffect = isActive && progress > 0.3
  
  return (
    <Text
      text={character}
      style={[
        themed($characterText),
        isMainLyric && themed($mainCharacterText),
        {
          color: characterColor,
          textShadowColor: glowEffect ? colors.tint : 'transparent',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: glowEffect ? 3 : 0,
        }
      ]}
    />
  )
}

/**
 * 애니메이트 가사 라인 컴포넌트 - 음절별 글자 애니메이션
 */
interface AnimatedLyricLineProps {
  syllableGroup: SyllableGroup
  currentTime: number
  isMainLyric?: boolean
}

function AnimatedLyricLine({ 
  syllableGroup, 
  currentTime, 
  isMainLyric = false 
}: AnimatedLyricLineProps) {
  const { themed } = useAppTheme()
  
  // 현재 활성 음절 찾기
  const activeSyllableIndex = useMemo(() => {
    return syllableGroup.syllables.findIndex(
      syllable => currentTime >= syllable.startTime && currentTime <= syllable.endTime
    )
  }, [syllableGroup.syllables, currentTime])
  
  // 현재 활성 글자 인덱스 계산 - 전체 그룹 기준으로 점진적 변화
  const activeCharIndex = useMemo(() => {
    // 그룹이 활성화되지 않았으면 -1
    if (currentTime < syllableGroup.startTime || currentTime > syllableGroup.endTime) {
      return -1
    }
    
    // 전체 그룹에서의 진행도 계산
    const groupDuration = syllableGroup.endTime - syllableGroup.startTime
    const groupElapsed = currentTime - syllableGroup.startTime
    const groupProgress = Math.max(0, Math.min(1, groupElapsed / groupDuration))
    
    // 전체 글자 수에 대한 현재 위치 계산
    const totalChars = syllableGroup.fullText.length
    const currentCharPosition = Math.floor(totalChars * groupProgress)
    
    return Math.min(currentCharPosition, totalChars - 1)
  }, [syllableGroup, currentTime])
  
  // 각 음절별 상태 계산
  const syllableStates = useMemo(() => {
    return syllableGroup.syllables.map(syllable => {
      const isPast = currentTime > syllable.endTime
      const isActive = currentTime >= syllable.startTime && currentTime <= syllable.endTime
      const isFuture = currentTime < syllable.startTime
      
      // 활성 음절 내 진행도 계산
      let progress = 0
      if (isActive) {
        const duration = syllable.endTime - syllable.startTime
        const elapsed = currentTime - syllable.startTime
        progress = Math.max(0, Math.min(1, elapsed / duration))
      } else if (isPast) {
        progress = 1
      }
      
      return { isPast, isActive, isFuture, progress }
    })
  }, [syllableGroup.syllables, currentTime])
  
  // 전체 텍스트를 글자별로 분할하고 해당 음절 상태 매핑
  const characters = syllableGroup.fullText.split('')
  
  return (
    <View style={themed($animatedLineContainer)}>
      {/* 글자들 */}
      <View style={themed($characterRow)}>
        {characters.map((character, characterIndex) => {
          // 현재 음절 그룹이 활성화되었는지 확인
          const isGroupActive = currentTime >= syllableGroup.startTime && currentTime <= syllableGroup.endTime
          
          // 글자별 상태 계산
          let isPast = false
          let isActive = false
          let isFuture = true
          let progress = 0
          
          if (isGroupActive) {
            // 그룹이 활성화된 경우
            if (characterIndex < activeCharIndex) {
              // 이미 지나간 글자들 - 완전히 하이라이트 유지
              isPast = true
              progress = 1
            } else if (characterIndex === activeCharIndex) {
              // 현재 활성 글자 - 점진적 변화
              isActive = true
              
              // 전체 그룹에서의 진행도를 기반으로 현재 글자의 progress 계산
              const groupDuration = syllableGroup.endTime - syllableGroup.startTime
              const groupElapsed = currentTime - syllableGroup.startTime
              const groupProgress = Math.max(0, Math.min(1, groupElapsed / groupDuration))
              
              const totalChars = syllableGroup.fullText.length
              const charPosition = groupProgress * totalChars
              const charFraction = charPosition - Math.floor(charPosition)
              
              progress = charFraction
            } else {
              // 아직 도달하지 않은 글자들
              isFuture = true
              progress = 0
            }
          } else if (currentTime > syllableGroup.endTime) {
            // 그룹이 완전히 끝난 경우 - 모든 글자 하이라이트 유지
            isPast = true
            progress = 1
          } else {
            // 그룹이 아직 시작되지 않은 경우
            isFuture = true
            progress = 0
          }
          
          return (
            <View 
              key={`char-${syllableGroup.startTime}-${characterIndex}`}
              style={themed($characterContainer)}
            >
              <CharacterText
                character={character}
                isPast={isPast}
                isActive={isActive}
                isFuture={isFuture}
                progress={progress}
                isMainLyric={isMainLyric}
              />
              {/* 활성 글자 아래에 화살표 표시 */}
              {characterIndex === activeCharIndex && isGroupActive && (
                <View style={themed($charArrowContainer)}>
                  <View style={themed($charArrow)}>
                    <Text text="▲" style={themed($charArrowText)} />
                  </View>
                </View>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

/**
 * 진행도 화살표 컴포넌트 - 현재 진행 중인 음절 위치를 가리키는 화살표
 */
interface ProgressArrowProps {
  syllableGroup: SyllableGroup
  currentTime: number
}

function ProgressArrow({ syllableGroup, currentTime }: ProgressArrowProps) {
  const { themed, theme: { colors } } = useAppTheme()
  
  // 현재 활성 음절 찾기
  const activeSyllableIndex = useMemo(() => {
    return syllableGroup.syllables.findIndex(
      syllable => currentTime >= syllable.startTime && currentTime <= syllable.endTime
    )
  }, [syllableGroup.syllables, currentTime])
  
  // 화살표가 표시될 조건 (그룹이 활성 상태일 때만)
  const isVisible = currentTime >= syllableGroup.startTime && currentTime <= syllableGroup.endTime
  
  if (!isVisible) return null
  
  // 현재 활성 음절이 없으면 화살표 숨김
  if (activeSyllableIndex < 0) return null
  
  // 활성 음절의 글자 시작 인덱스 계산
  let characterStartIndex = 0
  for (let i = 0; i < activeSyllableIndex; i++) {
    characterStartIndex += syllableGroup.syllables[i].text.length
  }
  
  // 활성 음절 내 진행도 계산
  const activeSyllable = syllableGroup.syllables[activeSyllableIndex]
  const syllableDuration = activeSyllable.endTime - activeSyllable.startTime
  const syllableElapsed = currentTime - activeSyllable.startTime
  const syllableProgress = Math.max(0, Math.min(1, syllableElapsed / syllableDuration))
  
  // 현재 활성 글자 인덱스 (음절 시작 + 진행도)
  const currentCharIndex = characterStartIndex + Math.floor(activeSyllable.text.length * syllableProgress)
  
  return (
    <View style={[themed($arrowContainer), { backgroundColor: 'rgba(255, 0, 0, 0.3)' }]}>
      <View 
        style={[
          themed($arrow),
          {
            backgroundColor: colors.tint,
          }
        ]}
      >
        <Text text="▲" style={themed($arrowText)} />
        {/* 디버그 정보 */}
        <Text 
          text={`${currentCharIndex}`} 
          style={[themed($arrowText), { fontSize: 8, marginTop: 2 }]} 
        />
      </View>
    </View>
  )
}

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
  
  // 현재 가사 라인의 너비 상태
  const [currentLineWidth, setCurrentLineWidth] = useState(300) // 기본값

  // 현재 음절 그룹 인덱스 계산 (새로운 로직)
  const currentGroupIndex = useMemo(() => {
    if (!lyricsData?.syllableGroups) return -1
    
    return lyricsData.syllableGroups.findIndex(
      group => currentTime >= group.startTime && currentTime <= group.endTime
    )
  }, [lyricsData, currentTime])

  // 현재 활성 음절 그룹 가져오기
  const currentGroup = useMemo(() => {
    if (!lyricsData?.syllableGroups || currentGroupIndex < 0) return null
    return lyricsData.syllableGroups[currentGroupIndex]
  }, [lyricsData, currentGroupIndex])

  // 다음 음절 그룹 가져오기 (미리보기용)
  const nextGroup = useMemo(() => {
    if (!lyricsData?.syllableGroups || currentGroupIndex < 0) return null
    const nextIndex = currentGroupIndex + 1
    return nextIndex < lyricsData.syllableGroups.length ? lyricsData.syllableGroups[nextIndex] : null
  }, [lyricsData, currentGroupIndex])

  // 기존 호환성을 위한 레거시 로직
  const currentLyricIndex = useMemo(() => {
    if (!lyricsData) return -1
    
    return lyricsData.lyrics.findIndex(
      lyric => currentTime >= lyric.startTime && currentTime <= lyric.endTime
    )
  }, [lyricsData, currentTime])

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
      

      {/* 노래방 스타일 2줄 고정 가사 표시 영역 */}
      <View style={themed($karaokeContainer)}>
        {/* 첫 번째 줄: 현재 가사 (음절별 애니메이션) + 진행도 화살표 */}
        <View style={themed($currentLyricLineWithArrow)}>
          <View 
            style={themed($currentLyricLine)}
            onLayout={(event: LayoutChangeEvent) => {
              const { width } = event.nativeEvent.layout
              setCurrentLineWidth(width)
            }}
          >
            {currentGroup ? (
              <AnimatedLyricLine
                syllableGroup={currentGroup}
                currentTime={currentTime}
                isMainLyric={true}
              />
            ) : (
              <Text 
                text={currentGroupIndex < 0 ? "🎵 곧 시작됩니다..." : "🎉 완료!"} 
                style={themed($waitingText)} 
              />
            )}
          </View>
          
        </View>

        {/* 두 번째 줄: 다음 가사 (미리보기) */}
        <View style={themed($nextLyricLine)}>
          {nextGroup ? (
            <Text 
              text={nextGroup.fullText} 
              style={themed($nextLyricText)} 
            />
          ) : (
            <Text 
              text=" " 
              style={themed($nextLyricText)} 
            />
          )}
        </View>
      </View>

      
      {/* 하단 오디오 플레이어 */}
      {(audioFile || audioUrl) && (
        <View style={themed($audioPlayerContainer)}>
          <AudioPlayer
            audioFile={audioFile}
            audioUrl={audioUrl}
            songId="lyrics-display"
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            style={themed($audioPlayer)}
          />
        </View>
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
  paddingVertical: spacing.xl,
  minHeight: 200,
})

const $currentLyricLineWithArrow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 80, // 화살표 공간 최소화
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing.lg,
})

const $currentLyricLine: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 60,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.md,
})

const $nextLyricLine: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 40,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.md,
})

const $waitingText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 28,
  color: colors.textDim,
  fontFamily: typography.primary.bold,
  textAlign: "center",
  lineHeight: 40,
  paddingVertical: spacing.sm,
})

const $nextLyricText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 20,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
  opacity: 0.6,
  lineHeight: 30,
  paddingVertical: spacing.xs,
})


// 개별 글자 스타일
const $characterText: ThemedStyle<TextStyle> = ({ typography, spacing }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  lineHeight: 28,
  paddingVertical: spacing.xs,
})

const $mainCharacterText: ThemedStyle<TextStyle> = ({ typography, spacing }) => ({
  fontSize: 28,
  fontFamily: typography.primary.bold,
  lineHeight: 40,
  paddingVertical: spacing.sm,
})

// 애니메이트 라인 컨테이너
const $animatedLineContainer: ThemedStyle<ViewStyle> = () => ({
  justifyContent: "center",
  alignItems: "center",
})

// 글자 행 컨테이너
const $characterRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
})

// 개별 글자 컨테이너
const $characterContainer: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
  justifyContent: "center",
  alignItems: "center",
})

// 글자별 화살표 컨테이너
const $charArrowContainer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: "100%",
  left: "50%",
  transform: [{ translateX: -8 }],
  marginTop: 2,
})

// 글자별 화살표
const $charArrow: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 16,
  height: 16,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.tint,
})

// 글자별 화살표 텍스트
const $charArrowText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 10,
  color: colors.background,
  fontWeight: "bold",
  textAlign: "center",
})

// 진행도 화살표 스타일
const $arrowContainer: ThemedStyle<ViewStyle> = () => ({
  height: 20, // 높이 최소화
  width: "100%",
  position: "relative",
  marginTop: 2, // 가사와 간격 최소화
  justifyContent: "center",
  alignItems: "flex-start",
})

const $arrow: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  width: 16, // 크기 축소
  height: 16,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: colors.tint,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
  elevation: 2,
})

const $arrowText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 10, // 폰트 크기 축소
  color: colors.background,
  fontWeight: "bold",
  textAlign: "center",
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