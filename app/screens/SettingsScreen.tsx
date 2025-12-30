import { type FC } from "react"
import { View, type TextStyle, type ViewStyle } from "react-native"

import { $styles } from "@/theme/styles"

import { Screen } from "../components/Screen"
import { Text } from "../components/Text"
import type { MainTabScreenProps } from "../navigators/MainNavigator"
import { useAppTheme } from "../theme/context"
import { type ThemedStyle } from "../theme/types"

interface SettingsScreenProps extends MainTabScreenProps<"Settings"> {}

export const SettingsScreen: FC<SettingsScreenProps> = function SettingsScreen() {
  const { themed } = useAppTheme()

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={themed($container)}>
        <Text style={themed($title)}>Settings</Text>
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
