/**
 * 실시간 음정 시각화 컴포넌트
 * 목표 음정 기준선과 현재 음정의 위치를 실시간으로 표시
 */

import React, { useEffect, useRef } from "react"
import { View, ViewStyle, TextStyle, Animated } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { PitchAnalysisResult } from "@/services/audio/pitchAnalysis"
import { PitchAnalysisUtils } from "@/services/audio/pitchAnalysis"

export interface PitchVisualizerProps {
  /**
   * 현재 분석 결과
   */
  analysisResult: PitchAnalysisResult | null
  
  /**
   * 컨테이너 스타일
   */
  style?: ViewStyle
  
  /**
   * 높이 (기본: 120)
   */
  height?: number
  
  /**
   * 애니메이션 활성화 여부
   */
  animated?: boolean
}

/**
 * 실시간 음정 시각화 컴포넌트
 */
export function PitchVisualizer({
  analysisResult,
  style,
  height = 120,
  animated = true
}: PitchVisualizerProps) {
  const { themed, theme } = useAppTheme()
  const animatedPosition = useRef(new Animated.Value(0.5)).current // 중앙에서 시작
  const animatedScale = useRef(new Animated.Value(1)).current
  const animatedOpacity = useRef(new Animated.Value(0)).current

  // 분석 결과 업데이트 시 애니메이션
  useEffect(() => {
    if (!analysisResult || !analysisResult.targetPitch) {
      // 목표 음정이 없으면 숨김
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start()
      return
    }

    const centsDiff = analysisResult.centsDifference
    
    // 센트 차이를 위치로 변환 (-100 ~ +100 센트를 0 ~ 1로 매핑)
    // 목표 음정이 중앙(0.5), 높으면 위쪽(0~0.5), 낮으면 아래쪽(0.5~1)
    const normalizedPosition = Math.max(0, Math.min(1, 0.5 - (centsDiff / 200)))
    
    if (animated) {
      // 위치 애니메이션
      Animated.spring(animatedPosition, {
        toValue: normalizedPosition,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start()

      // 정확도에 따른 스케일 효과
      const scale = analysisResult.accuracy > 0.8 ? 1.2 : 1.0
      Animated.spring(animatedScale, {
        toValue: scale,
        useNativeDriver: false,
        tension: 150,
        friction: 8,
      }).start()

      // 보이기
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start()
    } else {
      animatedPosition.setValue(normalizedPosition)
      animatedScale.setValue(1)
      animatedOpacity.setValue(1)
    }
  }, [analysisResult, animated])

  if (!analysisResult) {
    return (
      <View style={themed([$container, { height }, style])}>
        <View style={themed($emptyContainer)}>
          <Text text="음정 분석을 시작해주세요" style={themed($emptyText)} />
        </View>
      </View>
    )
  }

  return (
    <View style={themed([$container, { height }, style])}>
      {/* 제목 */}
      <Text text="실시간 음정" preset="formLabel" style={themed($title)} />
      
      {/* 음정 표시 영역 */}
      <View style={themed($pitchContainer)}>
        {/* Y축 라벨 (높음 - 중앙 - 낮음) */}
        <View style={themed($yAxisLabels)}>
          <Text text="높음" style={themed($yAxisLabel)} />
          <Text text="목표" style={themed([$yAxisLabel, $yAxisCenter])} />
          <Text text="낮음" style={themed($yAxisLabel)} />
        </View>

        {/* 메인 그래프 영역 */}
        <View style={themed($graphContainer)}>
          {/* 배경 격자 */}
          <View style={themed($gridContainer)}>
            {/* 상단 구역 (높음) */}
            <View style={themed([$gridSection, { backgroundColor: theme.colors.palette.angry100 }])} />
            {/* 중앙 구역 (정확) */}
            <View style={themed([$gridSection, { backgroundColor: theme.colors.palette.overlay20 }])} />
            {/* 하단 구역 (낮음) */}
            <View style={themed([$gridSection, { backgroundColor: theme.colors.palette.primary100 }])} />
          </View>

          {/* 목표 음정 기준선 */}
          <View style={themed($targetLine)} />

          {/* 현재 음정 표시 점 */}
          {analysisResult.targetPitch && (
            <Animated.View
              style={[
                themed($currentPitchDot),
                {
                  opacity: animatedOpacity,
                  top: animatedPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, height - 80], // 상하 패딩 고려
                    extrapolate: 'clamp',
                  }),
                  transform: [{ scale: animatedScale }],
                  backgroundColor: PitchAnalysisUtils.getAccuracyColor(analysisResult.accuracy),
                }
              ]}
            />
          )}

          {/* 센트 차이 표시 */}
          {analysisResult.targetPitch && (
            <Animated.View
              style={[
                themed($centsDifferenceIndicator),
                {
                  opacity: animatedOpacity,
                  top: animatedPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, height - 80],
                    extrapolate: 'clamp',
                  }),
                }
              ]}
            >
              <Text
                text={PitchAnalysisUtils.formatCentsDifference(analysisResult.centsDifference)}
                style={themed($centsDifferenceText)}
              />
            </Animated.View>
          )}
        </View>

        {/* 현재 음정 정보 */}
        <View style={themed($currentInfo)}>
          <Text text="현재 음정" style={themed($infoLabel)} />
          <Text
            text={analysisResult.targetPitch ? 
              PitchAnalysisUtils.formatMusicXMLKorean(
                analysisResult.targetPitch.note as any,
                analysisResult.targetPitch.octave
              ) : '목표 음정 없음'
            }
            style={themed($targetNote)}
          />
          <Text
            text={PitchAnalysisUtils.formatKoreanNoteName(analysisResult.currentPitch.frequency)}
            style={themed([$currentNote, { 
              color: analysisResult.targetPitch ? 
                PitchAnalysisUtils.getAccuracyColor(analysisResult.accuracy) :
                theme.colors.text
            }])}
          />
        </View>
      </View>
    </View>
  )
}

// 스타일 정의
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: colors.separator,
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.lg,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  textAlign: "center",
  marginBottom: spacing.md,
})

const $pitchContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  flexDirection: "row",
})

const $yAxisLabels: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 40,
  justifyContent: "space-between",
  paddingVertical: spacing.sm,
})

const $yAxisLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 10,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})

const $yAxisCenter: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  color: colors.tint,
  fontFamily: typography.primary.medium,
})

const $graphContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  position: "relative",
  marginHorizontal: spacing.sm,
})

const $gridContainer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  flexDirection: "column",
})

const $gridSection: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  opacity: 0.3,
})

const $targetLine: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  top: "50%",
  height: 2,
  backgroundColor: colors.tint,
  marginTop: -1,
})

const $currentPitchDot: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  width: 16,
  height: 16,
  borderRadius: 8,
  right: spacing.sm,
  marginTop: -8,
  borderWidth: 2,
  borderColor: "white",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
})

const $centsDifferenceIndicator: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  right: spacing.xl + 20,
  marginTop: -12,
})

const $centsDifferenceText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 10,
  color: colors.text,
  fontFamily: typography.primary.medium,
  backgroundColor: colors.background,
  paddingHorizontal: 4,
  paddingVertical: 2,
  borderRadius: 4,
  textAlign: "center",
  minWidth: 40,
})

const $currentInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 80,
  alignItems: "center",
  justifyContent: "center",
  paddingLeft: spacing.sm,
})

const $infoLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 10,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
  marginBottom: 4,
})

const $targetNote: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  color: colors.tint,
  fontFamily: typography.primary.bold,
  textAlign: "center",
  marginBottom: spacing.xs,
})

const $currentNote: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.bold,
  textAlign: "center",
})