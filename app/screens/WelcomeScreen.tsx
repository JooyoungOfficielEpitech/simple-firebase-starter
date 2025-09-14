import { FC, useCallback } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle, Alert } from "react-native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { isRTL } from "@/i18n"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

const welcomeLogo = require("@assets/images/logo.png")
const welcomeFace = require("@assets/images/welcome-face.png")

export const WelcomeScreen: FC = function WelcomeScreen() {
  const { themed, theme } = useAppTheme()
  const { logout, user, isLoading } = useAuth()

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch (error) {
      console.warn("Logout failed in WelcomeScreen:", error)
      Alert.alert("오류", "로그아웃에 실패했습니다")
    }
  }, [logout])

  // 로딩 중일 때는 로그아웃 버튼을 비활성화
  const isLoggingOut = isLoading

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={themed($topContainer)}>
        <Image style={themed($welcomeLogo)} source={welcomeLogo} resizeMode="contain" />
        <Text
          testID="welcome-heading"
          style={themed($welcomeHeading)}
          tx="welcomeScreen:readyForLaunch"
          preset="heading"
        />

        <Text tx="welcomeScreen:exciting" preset="subheading" />

        <Image
          style={$welcomeFace}
          source={welcomeFace}
          resizeMode="contain"
          tintColor={theme.colors.palette.neutral900}
        />
      </View>

      <View style={themed([$bottomContainer, $bottomContainerInsets])}>
        <Text tx="welcomeScreen:postscript" size="md" />

        {/* 사용자 정보 표시 */}
        {user && (
          <Text
            text={`안녕하냐, ${user.displayName || user.email || "사용자"}님!`}
            style={themed($userInfo)}
          />
        )}

        <Button
          text={isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          onPress={handleLogout}
          disabled={isLoggingOut}
        />
      </View>
    </Screen>
  )
}

const $topContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $bottomContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "43%",
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
  justifyContent: "space-around",
})

const $welcomeLogo: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
})

const $welcomeFace: ImageStyle = {
  height: 169,
  width: 269,
  position: "absolute",
  bottom: -47,
  right: -80,
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $welcomeHeading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $userInfo: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  textAlign: "center",
})
