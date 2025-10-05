import { type FC, type ReactElement, useState, useEffect } from "react"
import { View, type ViewStyle, type TextStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"

import { BackButton, type BackButtonProps } from "./BackButton"
import { PressableIcon } from "./Icon"
import { Text, type TextProps } from "./Text"
import { NotificationBadge } from "./NotificationBadge"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import { notificationService } from "@/services/firestore/notificationService"
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
  
  /**
   * 알림 아이콘 표시 여부 (기본: true)
   */
  showNotificationIcon?: boolean
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
  showNotificationIcon = true,
}) {
  const { top } = useSafeAreaInsets()
  const { themed, theme: { colors } } = useAppTheme()
  const navigation = useNavigation<any>()
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const displayTitle = titleTx ? titleTx : title

  // 읽지 않은 알림 수 구독
  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    
    if (user && showNotificationIcon) {
      console.log('🔔 [ScreenHeader] 읽지 않은 알림 수 구독 시작:', user.uid)
      
      unsubscribe = notificationService.subscribeToUnreadCount(
        user.uid,
        (count) => {
          console.log('🔔 [ScreenHeader] 읽지 않은 알림 수 업데이트:', count)
          setUnreadCount(count)
        }
      )
    } else {
      setUnreadCount(0)
    }

    return () => {
      if (unsubscribe) {
        console.log('🔔 [ScreenHeader] 읽지 않은 알림 수 구독 해제')
        unsubscribe()
      }
    }
  }, [user, showNotificationIcon])

  const NotificationIcon = () => (
    <View style={themed($notificationIconContainer)}>
      <PressableIcon
        icon="bell"
        size={24}
        color={colors.text}
        onPress={() => navigation.navigate("NotificationCenter")}
        containerStyle={themed($notificationIcon)}
      />
      <NotificationBadge count={unreadCount} />
    </View>
  )

  const rightContent = rightComponent || (showNotificationIcon ? <NotificationIcon /> : null)

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
            adjustsFontSizeToFit={true}
            minimumFontScale={0.7}
          />
        </View>

        {/* 오른쪽: 커스텀 컴포넌트 또는 알림 아이콘 */}
        <View style={themed($rightSection)}>
          {rightContent || <View style={themed($placeholder)} />}
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
  flex: 4,
  alignItems: "center",
  justifyContent: "center",
})

const $rightSection: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "flex-end",
  justifyContent: "center",
})

const $title: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary500,
  textAlign: "center",
})

const $placeholder: ThemedStyle<ViewStyle> = () => ({
  width: 44,
  height: 44,
})

const $notificationIconContainer: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
})

const $notificationIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})