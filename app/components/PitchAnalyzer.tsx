/**
 * 실시간 음정 분석 컴포넌트
 * 마이크 입력을 받아서 실시간으로 음정을 분석하고 피드백을 제공
 */

import React, { useState, useEffect, useCallback, useRef } from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity, Platform } from "react-native"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { PitchAnalysisService, PitchAnalysisResult, PitchAnalysisUtils, RecordingState } from "@/services/audio/pitchAnalysis"
import type { LyricItem } from "@/services/musicxml/musicXMLParser"

export interface PitchAnalyzerProps {
  /**
   * 분석할 가사 데이터 (음정 정보 포함)
   */
  lyricsData: LyricItem[]
  
  /**
   * 현재 재생 시간 (초)
   */
  currentTime: number
  
  /**
   * 분석 결과 콜백
   */
  onAnalysisResult?: (result: PitchAnalysisResult) => void
  
  /**
   * 분석 상태 변경 콜백
   */
  onAnalysisStateChange?: (isAnalyzing: boolean) => void
  
  /**
   * 컨테이너 스타일
   */
  style?: ViewStyle
  
  /**
   * 분석 활성화 여부
   */
  enabled?: boolean
}

/**
 * 실시간 음정 분석 컴포넌트
 */
export function PitchAnalyzer({
  lyricsData,
  currentTime,
  onAnalysisResult,
  onAnalysisStateChange,
  style,
  enabled = true
}: PitchAnalyzerProps) {
  const { themed, theme } = useAppTheme()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentResult, setCurrentResult] = useState<PitchAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.IDLE)
  
  const analysisServiceRef = useRef<PitchAnalysisService | null>(null)
  const currentTimeRef = useRef(currentTime)

  // 현재 시간 업데이트
  useEffect(() => {
    currentTimeRef.current = currentTime
  }, [currentTime])

  // 분석 서비스 초기화
  useEffect(() => {
    analysisServiceRef.current = new PitchAnalysisService({
      analysisInterval: 100,
      pitchTolerance: 50,
      minConfidence: 0.4
    })

    return () => {
      if (analysisServiceRef.current) {
        analysisServiceRef.current.stopAnalysis()
      }
    }
  }, [])

  // 컴포넌트 언마운트 시 분석 중단
  useEffect(() => {
    return () => {
      handleStopAnalysis()
    }
  }, [])

  /**
   * 분석 시작
   */
  const handleStartAnalysis = useCallback(async () => {
    if (!analysisServiceRef.current || !enabled) return

    try {
      setError(null)
      setIsAnalyzing(true)
      onAnalysisStateChange?.(true)

      console.log('🎤 음정 분석 시작 - 가사 데이터:', lyricsData.length, '개')

      await analysisServiceRef.current.startAnalysis(
        lyricsData,
        (result: PitchAnalysisResult) => {
          setCurrentResult(result)
          onAnalysisResult?.(result)

          console.log('🎯 음정 분석 결과:', {
            frequency: result.currentPitch.frequency.toFixed(2) + 'Hz',
            targetFreq: result.targetPitch?.frequency.toFixed(2) + 'Hz',
            centsDiff: result.centsDifference.toFixed(1) + '¢',
            accuracy: (result.accuracy * 100).toFixed(1) + '%',
            lyric: result.lyricText,
            isOnPitch: result.isOnPitch,
            feedback: PitchAnalysisUtils.getPitchFeedback(result.centsDifference, result.accuracy).message
          })
        }
      )
      
      setIsAnalyzing(true)
      setError(null)
      setPermissionStatus('granted')
      
      // 녹음 상태 업데이트
      setRecordingState(analysisServiceRef.current.currentRecordingState)
      
      onAnalysisStateChange?.(true)
      console.log('🎤 음정 분석 시작됨 - 모드:', analysisServiceRef.current.currentRecordingState)
    } catch (err) {
      console.error('❌ 음정 분석 시작 실패:', err)
      setError(err instanceof Error ? err.message : '음정 분석을 시작할 수 없습니다')
      setIsAnalyzing(false)
      setRecordingState(RecordingState.ERROR)
      onAnalysisStateChange?.(false)
      
      if (err instanceof Error && err.message.includes('권한')) {
        setPermissionStatus('denied')
        setError('마이크 권한이 필요합니다')
      }
    }
  }, [enabled, lyricsData, onAnalysisResult, onAnalysisStateChange])

  /**
   * 분석 중단
   */
  const handleStopAnalysis = useCallback(async () => {
    if (!analysisServiceRef.current) return

    try {
      await analysisServiceRef.current.stopAnalysis()
      setIsAnalyzing(false)
      setCurrentResult(null)
      setError(null)
      setRecordingState(RecordingState.IDLE)
      onAnalysisStateChange?.(false)
      console.log('🛑 음정 분석 중단됨')
    } catch (err) {
      console.error('❌ 음정 분석 중단 실패:', err)
      // 중단 실패해도 상태는 리셋
      setIsAnalyzing(false)
      setRecordingState(RecordingState.ERROR)
    }
  }, [onAnalysisStateChange])

  /**
   * 분석 토글
   */
  const toggleAnalysis = useCallback(() => {
    if (isAnalyzing) {
      handleStopAnalysis()
    } else {
      handleStartAnalysis()
    }
  }, [isAnalyzing, handleStartAnalysis, handleStopAnalysis])

  // 현재 목표 음정 찾기
  const getCurrentTargetLyric = (): LyricItem | null => {
    return lyricsData.find(lyric => 
      currentTime >= lyric.startTime && currentTime <= lyric.endTime
    ) || null
  }

  const currentTargetLyric = getCurrentTargetLyric()
  const hasTargetPitch = currentTargetLyric?.pitch

  // 권한 거부 메시지
  if (permissionStatus === 'denied') {
    return (
      <View style={themed([$container, style])}>
        <View style={themed($permissionContainer)}>
          <Icon icon="bell" size={32} color={theme.colors.textDim} />
          <Text
            text="마이크 권한 필요"
            preset="subheading"
            style={themed($permissionTitle)}
          />
          <Text
            text="음정 분석을 위해 마이크 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요."
            style={themed($permissionMessage)}
          />
          <TouchableOpacity
            style={themed($retryButton)}
            onPress={() => {
              setPermissionStatus('unknown')
              handleStartAnalysis()
            }}
          >
            <Text text="다시 시도" style={themed($retryButtonText)} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // 녹음 상태 메시지
  const getRecordingStatusText = () => {
    switch (recordingState) {
      case RecordingState.IDLE:
        return '준비됨'
      case RecordingState.PREPARING:
        return '준비 중...'
      case RecordingState.RECORDING:
        return '실제 녹음 중'
      case RecordingState.MOCK_MODE:
        return '시뮬레이션 모드'
      case RecordingState.ERROR:
        return '오류'
      default:
        return '알 수 없음'
    }
  }

  return (
    <View style={themed([$container, style])}>
      {/* 상태 표시 영역 */}
      <View style={themed($statusContainer)}>
        <Text text={`상태: ${getRecordingStatusText()}`} style={themed($statusText)} />
        {recordingState === RecordingState.MOCK_MODE && (
          <Text text="🎭 데모 모드로 동작 중" style={themed($mockModeText)} />
        )}
      </View>

      {/* 제어 버튼 영역 */}
      <View style={themed($controlsContainer)}>
        <TouchableOpacity
          style={themed([$controlButton, isAnalyzing && $controlButtonActive])}
          onPress={toggleAnalysis}
          disabled={!enabled}
        >
          <Icon
            icon={isAnalyzing ? "check" : "bell"}
            size={20}
            color={!enabled ? theme.colors.textDim : isAnalyzing ? theme.colors.background : theme.colors.tint}
          />
          <Text
            text={isAnalyzing ? "분석 중단" : "분석 시작"}
            style={themed([
              $controlButtonText,
              !enabled && $controlButtonTextDisabled,
              isAnalyzing && $controlButtonTextActive
            ])}
          />
        </TouchableOpacity>

        {error && (
          <Text text={`❌ ${error}`} style={themed($errorText)} />
        )}
      </View>

      {/* 현재 음정 정보 */}
      {hasTargetPitch && (
        <View style={themed($targetInfoContainer)}>
          <Text text="목표 음정" preset="formLabel" style={themed($targetLabel)} />
          <Text
            text={PitchAnalysisUtils.formatMusicXMLKorean(
              currentTargetLyric.pitch!.step, 
              currentTargetLyric.pitch!.octave,
              currentTargetLyric.pitch!.alter
            )}
            style={themed($targetPitch)}
          />
          <Text
            text={`"${currentTargetLyric.text}"`}
            style={themed($targetLyric)}
          />
        </View>
      )}

      {/* 분석 결과 표시 */}
      {isAnalyzing && (
        <View style={themed($resultsContainer)}>
          {currentResult ? (
            <>
              {/* 현재 검출된 음정 (한글) */}
              <View style={themed($resultRow)}>
                <Text text="검출 음정:" style={themed($resultLabel)} />
                <Text
                  text={PitchAnalysisUtils.formatKoreanNoteName(currentResult.currentPitch.frequency)}
                  style={themed($resultValue)}
                />
              </View>

              {/* 피드백 메시지 */}
              {currentResult.targetPitch && (
                <>
                  {/* 메인 피드백 메시지 */}
                  <View style={themed($feedbackContainer)}>
                    <Text
                      text={PitchAnalysisUtils.getPitchFeedback(
                        currentResult.centsDifference, 
                        currentResult.accuracy
                      ).emoji}
                      style={themed($feedbackEmoji)}
                    />
                    <Text
                      text={PitchAnalysisUtils.getPitchFeedback(
                        currentResult.centsDifference, 
                        currentResult.accuracy
                      ).message}
                      style={themed([$feedbackMessage, { 
                        color: PitchAnalysisUtils.getPitchFeedback(
                          currentResult.centsDifference, 
                          currentResult.accuracy
                        ).color
                      }])}
                    />
                  </View>

                  {/* 격려 메시지 */}
                  <View style={themed($encouragementContainer)}>
                    <Text
                      text={PitchAnalysisUtils.getEncouragementMessage(currentResult.accuracy)}
                      style={themed([$encouragementText, { 
                        color: PitchAnalysisUtils.getAccuracyColor(currentResult.accuracy) 
                      }])}
                    />
                  </View>

                  {/* 상세 정보 */}
                  <View style={themed($detailsContainer)}>
                    <View style={themed($resultRow)}>
                      <Text text="정확도:" style={themed($detailLabel)} />
                      <Text
                        text={PitchAnalysisUtils.formatAccuracy(currentResult.accuracy)}
                        style={themed([$detailValue, { 
                          color: PitchAnalysisUtils.getAccuracyColor(currentResult.accuracy) 
                        }])}
                      />
                    </View>

                    <View style={themed($resultRow)}>
                      <Text text="음정 차이:" style={themed($detailLabel)} />
                      <Text
                        text={PitchAnalysisUtils.formatCentsDifference(currentResult.centsDifference)}
                        style={themed([$detailValue, { 
                          color: Math.abs(currentResult.centsDifference) <= 25 ? 
                            theme.colors.tint : theme.colors.textDim 
                        }])}
                      />
                    </View>

                    <View style={themed($resultRow)}>
                      <Text text="신뢰도:" style={themed($detailLabel)} />
                      <Text
                        text={`${Math.round(currentResult.currentPitch.confidence * 100)}%`}
                        style={themed($detailValue)}
                      />
                    </View>
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={themed($loadingContainer)}>
              <Text text="음성을 분석하는 중..." style={themed($loadingText)} />
            </View>
          )}
        </View>
      )}

      {/* 안내 메시지 */}
      {!isAnalyzing && !hasTargetPitch && (
        <View style={themed($infoContainer)}>
          <Text
            text="현재 시점에 음정 정보가 없습니다"
            style={themed($infoText)}
          />
        </View>
      )}

      {!isAnalyzing && hasTargetPitch && (
        <View style={themed($infoContainer)}>
          <Text
            text="분석을 시작하여 음정을 확인해보세요"
            style={themed($infoText)}
          />
        </View>
      )}
    </View>
  )
}

// 스타일 정의
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.separator,
  padding: spacing.md,
})

const $statusContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
  alignItems: "center",
})

const $statusText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})

const $mockModeText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 11,
  color: colors.palette.secondary500,
  fontFamily: typography.primary.normal,
  textAlign: "center",
  marginTop: 2,
})

const $controlsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $controlButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.background,
  borderWidth: 2,
  borderColor: colors.tint,
  borderRadius: 8,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
})

const $controlButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
})

const $controlButtonText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  color: colors.tint,
  fontFamily: typography.primary.medium,
  fontSize: 16,
  marginLeft: spacing.xs,
})

const $controlButtonTextDisabled: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $controlButtonTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.background,
})

const $targetInfoContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.md,
  marginBottom: spacing.md,
  alignItems: "center",
})

const $targetLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $targetPitch: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  color: colors.tint,
  fontFamily: typography.primary.bold,
  fontSize: 24,
  marginTop: spacing.xs,
})

const $targetLyric: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  marginTop: spacing.xs,
})

const $resultsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})

const $resultRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.sm,
})

const $resultLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  fontSize: 14,
})

const $resultValue: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.medium,
  fontSize: 14,
})

const $statusIndicator: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 12,
  height: 12,
  borderRadius: 6,
  marginRight: spacing.xs,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.lg,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  fontSize: 14,
})

const $infoContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.lg,
})

const $infoText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  textAlign: "center",
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  color: colors.error,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  marginTop: spacing.xs,
  textAlign: "center",
})

const $permissionContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.xl,
})

const $permissionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginTop: spacing.sm,
  marginBottom: spacing.xs,
})

const $permissionMessage: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  textAlign: "center",
  marginBottom: spacing.lg,
})

const $retryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  borderRadius: 8,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
})

const $retryButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.background,
  fontFamily: typography.primary.medium,
  fontSize: 14,
})

const $feedbackContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.md,
  marginVertical: spacing.sm,
})

const $feedbackEmoji: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 32,
  marginRight: spacing.sm,
})

const $feedbackMessage: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.bold,
  textAlign: "center",
  flex: 1,
})

const $encouragementContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginBottom: spacing.md,
})

const $encouragementText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  textAlign: "center",
})

const $detailsContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.sm,
  marginTop: spacing.sm,
})

const $detailLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  fontSize: 12,
})

const $detailValue: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.medium,
  fontSize: 12,
})