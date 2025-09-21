import { type FC, type ReactElement } from "react"
import { View, type ViewStyle, type TextStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { BackButton, type BackButtonProps } from "./BackButton"
import { Text, type TextProps } from "./Text"
import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"

export interface ScreenHeaderProps {
  /**
   * 헤더 제목
   */
  title: string
  
  /**
   * 헤더 제목 i18n 키
   */
  titleTx?: TextProps["tx"]
  
  /**
   * 뒤로가기 버튼 표시 여부 (기본: true)
   */
  showBackButton?: boolean
  
  /**
   * 뒤로가기 버튼 props
   */
  backButtonProps?: BackButtonProps
  
  /**
   * 오른쪽에 표시할 커스텀 컴포넌트
   */
  rightComponent?: ReactElement
  
  /**
   * 헤더 컨테이너 스타일
   */
  containerStyle?: ViewStyle
  
  /**
   * 제목 스타일
   */
  titleStyle?: ViewStyle
  
  /**
   * Safe Area 상단 여백 포함 여부 (기본: true)
   */
  includeSafeArea?: boolean
}

/**
 * 통일된 화면 헤더 컴포넌트
 * 
 * 사용법:
 * ```tsx
 * // 기본 헤더
 * <ScreenHeader title="게시글 작성" />
 * 
 * // 텍스트 뒤로가기 버튼
 * <ScreenHeader 
 *   title="회원가입"
 *   backButtonProps={{
 *     variant: "text",
 *     tx: "signUpScreen:backToSignIn",
 *     onBeforeGoBack: () => {
 *       signUpForm.reset()
 *       clearAuthError()
 *     }
 *   }}
 * />
 * 
 * // 오른쪽 컴포넌트와 함께
 * <ScreenHeader 
 *   title="설정"
 *   rightComponent={<TouchableOpacity><Icon icon="gear" /></TouchableOpacity>}
 * />
 * ```
 */
export const ScreenHeader: FC<ScreenHeaderProps> = function ScreenHeader({
  title,
  titleTx,
  showBackButton = true,
  backButtonProps,
  rightComponent,
  containerStyle,
  titleStyle,
  includeSafeArea = true,
}) {
  const { top } = useSafeAreaInsets()
  const { themed } = useAppTheme()

  const displayTitle = titleTx ? titleTx : title

  return (
    <View 
      style={[
        themed($container),
        includeSafeArea && { paddingTop: top + 16 },
        containerStyle,
      ]}
    >
      <View style={themed($content)}>
        {/* 왼쪽: 뒤로가기 버튼 */}
        <View style={themed($leftSection)}>
          {showBackButton ? (
            <BackButton {...backButtonProps} />
          ) : (
            <View style={themed($placeholder)} />
          )}
        </View>

        {/* 중앙: 제목 */}
        <View style={themed($centerSection)}>
          <Text 
            preset="heading" 
            text={displayTitle}
            style={[themed($title), titleStyle]}
            numberOfLines={1}
          />
        </View>

        {/* 오른쪽: 커스텀 컴포넌트 */}
        <View style={themed($rightSection)}>
          {rightComponent || <View style={themed($placeholder)} />}
        </View>
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "transparent",
  marginTop: spacing.lg,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.lg,
  marginBottom: spacing.lg,
  minHeight: 44,
})

const $leftSection: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "flex-start",
  justifyContent: "center",
})

const $centerSection: ThemedStyle<ViewStyle> = () => ({
  flex: 2,
  alignItems: "center",
  justifyContent: "center",
})

const $rightSection: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "flex-end",
  justifyContent: "center",
})

const $title: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  textAlign: "center",
})

const $placeholder: ThemedStyle<ViewStyle> = () => ({
  width: 44,
  height: 44,
})