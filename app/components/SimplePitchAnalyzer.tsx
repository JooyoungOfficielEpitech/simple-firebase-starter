/**
 * 간소화된 실시간 음정 분석 컴포넌트
 * 자동으로 시작/중단되며, 실시간 그래프만 표시
 */

import React, { useState, useEffect, useCallback, useRef } from "react"
import { View, ViewStyle } from "react-native"
import { PitchVisualizer } from "@/components/PitchVisualizer"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { PitchAnalysisService, PitchAnalysisResult, RecordingState } from "@/services/audio/pitchAnalysis"
import type { LyricItem } from "@/services/musicxml/musicXMLParser"

export interface SimplePitchAnalyzerProps {
  /**
   * 분석할 가사 데이터 (음정 정보 포함)
   */
  lyricsData: LyricItem[]
  
  /**
   * 현재 재생 시간 (초)
   */
  currentTime: number
  
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
 * 간소화된 실시간 음정 분석 컴포넌트
 */
export function SimplePitchAnalyzer({
  lyricsData,
  currentTime,
  style,
  enabled = true
}: SimplePitchAnalyzerProps) {
  const { themed } = useAppTheme()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentResult, setCurrentResult] = useState<PitchAnalysisResult | null>(null)
  
  const analysisServiceRef = useRef<PitchAnalysisService | null>(null)
  const currentTimeRef = useRef(currentTime)
  const shouldBeAnalyzingRef = useRef(false)

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

  // 현재 목표 음정 찾기
  const getCurrentTargetLyric = useCallback((): LyricItem | null => {
    return lyricsData.find(lyric => 
      currentTime >= lyric.startTime && currentTime <= lyric.endTime
    ) || null
  }, [lyricsData, currentTime])

  // 자동 시작/중단 로직
  useEffect(() => {
    if (!enabled || !analysisServiceRef.current) return

    const currentTargetLyric = getCurrentTargetLyric()
    const hasTargetPitch = currentTargetLyric?.pitch
    
    // 음정 정보가 있으면 분석해야 함
    shouldBeAnalyzingRef.current = !!hasTargetPitch

    if (hasTargetPitch && !isAnalyzing) {
      // 분석 시작
      startAnalysis()
    } else if (!hasTargetPitch && isAnalyzing) {
      // 분석 중단
      stopAnalysis()
    }
  }, [currentTime, lyricsData, enabled, isAnalyzing])

  /**
   * 분석 시작
   */
  const startAnalysis = useCallback(async () => {
    if (!analysisServiceRef.current || isAnalyzing) return

    try {
      console.log('🎤 간소화된 음정 분석 시작')

      await analysisServiceRef.current.startAnalysis(
        lyricsData,
        (result: PitchAnalysisResult) => {
          setCurrentResult(result)
        }
      )
      
      setIsAnalyzing(true)
    } catch (err) {
      console.error('❌ 간소화된 음정 분석 시작 실패:', err)
      setIsAnalyzing(false)
    }
  }, [lyricsData, isAnalyzing])

  /**
   * 분석 중단
   */
  const stopAnalysis = useCallback(async () => {
    if (!analysisServiceRef.current || !isAnalyzing) return

    try {
      await analysisServiceRef.current.stopAnalysis()
      setIsAnalyzing(false)
      setCurrentResult(null)
      console.log('🛑 간소화된 음정 분석 중단됨')
    } catch (err) {
      console.error('❌ 간소화된 음정 분석 중단 실패:', err)
      setIsAnalyzing(false)
    }
  }, [isAnalyzing])

  // 컴포넌트 언마운트 시 분석 중단
  useEffect(() => {
    return () => {
      if (analysisServiceRef.current) {
        analysisServiceRef.current.stopAnalysis()
      }
    }
  }, [])

  // 분석 중이고 결과가 있을 때만 그래프 표시
  if (!isAnalyzing || !currentResult) {
    return null
  }

  return (
    <View style={themed([$container, style])}>
      <PitchVisualizer
        analysisResult={currentResult}
        height={150}
        animated={true}
        style={themed($visualizer)}
      />
    </View>
  )
}

// 스타일 정의
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.separator,
  padding: spacing.sm,
  marginVertical: spacing.xs,
})

const $visualizer: ThemedStyle<ViewStyle> = () => ({
  // 추가적인 스타일이 필요하면 여기에
})