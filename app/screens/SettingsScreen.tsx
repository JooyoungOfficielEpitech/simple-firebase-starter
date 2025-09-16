import { type FC } from "react"
import { View, type TextStyle, type ViewStyle } from "react-native"

import { $styles } from "@/theme/styles"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import type { MainTabScreenProps } from "@/navigators/MainNavigator"
import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"

interface SettingsScreenProps extends MainTabScreenProps<"Settings"> {}

export const SettingsScreen: FC<SettingsScreenProps> = function SettingsScreen() {
  const { themed } = useAppTheme()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.warn("Logout failed:", error)
    }
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={themed($container)}>
        <Text style={themed($title)}>Settings</Text>
        <Button
          text="로그아웃"
          preset="filled"
          onPress={handleLogout}
          style={themed($logoutButton)}
        />
      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
})

const $title: ThemedStyle<TextStyle> = () => ({
  fontSize: 24,
  fontWeight: "bold",
  marginBottom: 32,
})

const $logoutButton: ThemedStyle<ViewStyle> = () => ({
  marginTop: 16,
  minWidth: 120,
})
