import { FC } from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Text } from "./Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface NotificationBadgeProps {
  count: number
  maxCount?: number
  size?: number
  style?: ViewStyle
}

/**
 * 알림 배지 컴포넌트
 * 읽지 않은 알림 수를 표시하는 작은 빨간 원형 배지
 */
export const NotificationBadge: FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  size = 18,
  style
}) => {
  const { themed } = useAppTheme()

  if (count <= 0) return null

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString()
  const isLargeCount = displayCount.length > 1

  return (
    <View 
      style={[
        themed($badge), 
        { 
          width: isLargeCount ? size + 4 : size,
          height: size,
          borderRadius: size / 2,
        },
        style
      ]}
    >
      <Text 
        text={displayCount}
        style={themed([$badgeText, { fontSize: size * 0.6 }])}
      />
    </View>
  )
}

const $badge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
  justifyContent: "center",
  alignItems: "center",
  minWidth: 18,
  paddingHorizontal: 2,
  position: "absolute",
  top: -8,
  right: -8,
  zIndex: 10,
  borderWidth: 2,
  borderColor: colors.background,
})

const $badgeText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.background,
  fontFamily: typography.primary.bold,
  fontWeight: "bold",
  textAlign: "center",
  lineHeight: undefined, // 중앙 정렬을 위해
})