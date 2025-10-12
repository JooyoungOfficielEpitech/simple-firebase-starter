import React from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { SavedSection } from "@/components/AudioPlayer"

export interface SavedSectionsListProps {
  /**
   * 저장된 구간들
   */
  sections: SavedSection[]
  /**
   * 구간 로드 콜백
   */
  onLoadSection: (section: SavedSection) => void
  /**
   * 구간 삭제 콜백
   */
  onDeleteSection: (sectionId: string) => void
  /**
   * 컨테이너 스타일
   */
  style?: ViewStyle
}

/**
 * 저장된 구간 목록 컴포넌트
 */
export function SavedSectionsList({
  sections,
  onLoadSection,
  onDeleteSection,
  style,
}: SavedSectionsListProps) {
  const { themed } = useAppTheme()

  // 시간 포맷 함수
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleDeleteSection = (sectionId: string, sectionName: string) => {
    Alert.alert(
      "삭제 확인",
      `"${sectionName}" 구간을 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        { 
          text: "삭제", 
          style: "destructive",
          onPress: () => onDeleteSection(sectionId)
        }
      ]
    )
  }

  if (sections.length === 0) {
    return (
      <View style={themed([$container, style])}>
        <View style={themed($emptyContainer)}>
          <Ionicons name="bookmark-outline" size={48} color="#CCC" />
          <Text text="저장된 구간이 없습니다" style={themed($emptyText)} />
          <Text text="A-B 구간을 설정하고 저장해보세요" style={themed($emptySubText)} />
        </View>
      </View>
    )
  }

  return (
    <View style={themed([$container, style])}>
      <View style={themed($header)}>
        <Ionicons name="bookmark" size={18} color="#007AFF" />
        <Text text="저장된 구간" style={themed($title)} />
      </View>
      
      <ScrollView style={themed($scrollView)} showsVerticalScrollIndicator={false}>
        {sections.map((section, index) => (
          <View key={section.id} style={themed($sectionItem)}>
            <View style={themed($sectionLeft)}>
              <View style={themed($sectionNumber)}>
                <Text text={(index + 1).toString()} style={themed($sectionNumberText)} />
              </View>
              <View style={themed($sectionInfo)}>
                <Text text={section.name} style={themed($sectionName)} />
                <Text 
                  text={`${formatTime(section.pointA * 1000)} ~ ${formatTime(section.pointB * 1000)}`} 
                  style={themed($sectionTime)} 
                />
                <Text 
                  text={`구간 길이: ${formatTime((section.pointB - section.pointA) * 1000)}`} 
                  style={themed($sectionDuration)} 
                />
              </View>
            </View>
            
            <View style={themed($sectionButtons)}>
              <TouchableOpacity 
                style={themed($loadButton)} 
                onPress={() => onLoadSection(section)}
              >
                <Text text="로드" style={themed($loadButtonText)} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={themed($deleteButton)} 
                onPress={() => handleDeleteSection(section.id, section.name)}
              >
                <Text text="삭제" style={themed($deleteButtonText)} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

// 스타일 정의
const $container: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: colors.separator,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.md,
})

const $title: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginLeft: spacing.sm,
  flex: 1,
})

const $count: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  borderRadius: 10,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  minWidth: 24,
  alignItems: "center",
})

const $countText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.bold,
  color: colors.background,
})

const $scrollView: ThemedStyle<ViewStyle> = () => ({
  maxHeight: 300,
})

const $sectionItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.background,
  borderRadius: 10,
  padding: spacing.md,
  marginBottom: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.separator,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
})

const $sectionLeft: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  marginRight: spacing.sm,
})

const $sectionNumber: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.accent100,
  borderRadius: 12,
  width: 24,
  height: 24,
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.sm,
})

const $sectionNumberText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.bold,
  color: colors.tint,
})

const $sectionInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $sectionName: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: 2,
})

const $sectionTime: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  marginBottom: 1,
})

const $sectionDuration: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 11,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  fontStyle: "italic",
})

const $sectionButtons: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
})

const $loadButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.tint,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 8,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
})

const $loadButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 11,
  fontFamily: typography.primary.medium,
  color: colors.background,
})

const $deleteButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.error,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 8,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
})

const $deleteButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 11,
  fontFamily: typography.primary.medium,
  color: colors.background,
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xl,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.textDim,
  marginTop: spacing.md,
  textAlign: "center",
})

const $emptySubText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  marginTop: spacing.xs,
  textAlign: "center",
})