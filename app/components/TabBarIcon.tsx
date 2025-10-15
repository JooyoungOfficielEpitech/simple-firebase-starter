import React, { FC } from "react"
import { Icon, IconTypes } from "@/components/Icon"
import { useAppTheme } from "@/theme/context"

/**
 * TabBarIcon 컴포넌트의 props 타입
 */
export interface TabBarIconProps {
  /** 아이콘 이름 */
  icon: IconTypes
  /** 포커스 상태 */
  focused: boolean
  /** 아이콘 크기 (기본값: 30) */
  size?: number
}

/**
 * 탭바에서 사용되는 아이콘 컴포넌트
 * 
 * React.memo를 사용하여 불필요한 리렌더링을 방지하고,
 * focused 상태에 따라 색상을 자동으로 변경합니다.
 */
export const TabBarIcon: FC<TabBarIconProps> = React.memo(({
  icon,
  focused,
  size = 30,
}) => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Icon
      icon={icon}
      color={focused ? colors.secondaryAction : colors.tintInactive}
      size={size}
    />
  )
})

TabBarIcon.displayName = "TabBarIcon"