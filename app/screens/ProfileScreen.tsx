import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface ProfileScreenProps {}

export const ProfileScreen: FC<ProfileScreenProps> = () => {
  const { themed } = useAppTheme()

  return (
    <Screen style={themed($root)} preset="fixed" safeAreaEdges={[]}>
      <ScreenHeader 
        title="프로필"
        showProfileIcon={false}
      />
      <View style={themed($container)}>
        <Text preset="heading">프로필 화면</Text>
      </View>
    </Screen>
  )
}

const $root: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
})