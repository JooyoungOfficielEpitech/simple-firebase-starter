import React, { FC, ReactNode } from "react"
import { View, Modal, ViewStyle, ModalProps, TouchableOpacity } from "react-native"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

/**
 * BaseModal 컴포넌트의 props 타입
 */
export interface BaseModalProps extends Partial<ModalProps> {
  /** 모달의 표시 여부 */
  visible: boolean
  /** 모달을 닫는 함수 */
  onClose: () => void
  /** 모달 내부에 표시될 컨텐츠 */
  children: ReactNode
  /** 커스텀 컨테이너 스타일 */
  containerStyle?: ViewStyle
  /** 커스텀 오버레이 스타일 */
  overlayStyle?: ViewStyle
  /** 최대 너비 설정 */
  maxWidth?: number
}

/**
 * 재사용 가능한 기본 모달 컴포넌트
 * 
 * 일관된 모달 스타일과 동작을 제공합니다.
 * React.memo를 사용하여 성능을 최적화합니다.
 */
export const BaseModal: FC<BaseModalProps> = React.memo(({
  visible,
  onClose,
  children,
  containerStyle,
  overlayStyle,
  maxWidth = 400,
  animationType = "fade",
  transparent = true,
  onRequestClose,
  ...modalProps
}) => {
  const { themed } = useAppTheme()

  const handleRequestClose = () => {
    onClose()
    onRequestClose?.()
  }

  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
      onRequestClose={handleRequestClose}
      {...modalProps}
    >
      <TouchableOpacity 
        style={[themed($modalOverlay), overlayStyle]}
        activeOpacity={1}
        onPress={handleRequestClose}
      >
        <TouchableOpacity 
          style={[themed($modalContainer(maxWidth)), containerStyle]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록
        >
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
})

BaseModal.displayName = "BaseModal"

// 기본 모달 스타일 정의
const $modalOverlay: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
})

const $modalContainer = (maxWidth: number): ThemedStyle<ViewStyle> => ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: spacing.lg,
  padding: spacing.xl,
  maxWidth,
  width: "100%",
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
})