import { type FC } from "react"
import { View, type TextStyle, type ViewStyle } from "react-native"

import { $styles } from "@/theme/styles"

import { Button } from "@/components/Button"
import { Radio } from "@/components/Toggle/Radio"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import type { MainTabScreenProps } from "@/navigators/MainNavigator"
import { useAppTheme } from "@/theme/context"
import { type ThemedStyle, type WickedCharacterTheme } from "@/theme/types"

interface SettingsScreenProps extends MainTabScreenProps<"Settings"> {}

export const SettingsScreen: FC<SettingsScreenProps> = function SettingsScreen() {
  const { themed, wickedCharacterTheme, setWickedCharacterTheme } = useAppTheme()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.warn("Logout failed:", error)
    }
  }

  const handleCharacterThemeChange = (character: WickedCharacterTheme) => {
    setWickedCharacterTheme(character)
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={themed($container)}>
        <Text style={themed($title)}>Settings</Text>
        
        {/* Wicked Character Theme Selection */}
        <View style={themed($themeSection)}>
          <Text style={themed($sectionTitle)}>Wicked 테마 선택</Text>
          <Text style={themed($sectionSubtitle)}>좋아하는 캐릭터의 테마를 선택해보세요</Text>
          
          <View style={themed($radioGroup)}>
            <View style={themed($radioOption)}>
              <Radio
                value={wickedCharacterTheme === "elphaba"}
                onValueChange={() => handleCharacterThemeChange("elphaba")}
                inputDetailStyle={$elphabaRadioDetail}
                outerStyle={wickedCharacterTheme === "elphaba" ? $elphabaRadioOuterSelected : undefined}
              />
              <View style={themed($radioLabelContainer)}>
                <Text style={themed($radioLabel)}>🟢 엘파바 (Elphaba)</Text>
                <Text style={themed($radioDescription)}>초록색 기반의 강렬한 테마</Text>
              </View>
            </View>
            
            <View style={themed($radioOption)}>
              <Radio
                value={wickedCharacterTheme === "glinda"}
                onValueChange={() => handleCharacterThemeChange("glinda")}
                inputDetailStyle={$glindaRadioDetail}
                outerStyle={wickedCharacterTheme === "glinda" ? $glindaRadioOuterSelected : undefined}
              />
              <View style={themed($radioLabelContainer)}>
                <Text style={themed($radioLabel)}>🌸 글린다 (Glinda)</Text>
                <Text style={themed($radioDescription)}>핑크색 기반의 우아한 테마</Text>
              </View>
            </View>
            
            <View style={themed($radioOption)}>
              <Radio
                value={wickedCharacterTheme === "gwynplaine"}
                onValueChange={() => handleCharacterThemeChange("gwynplaine")}
                inputDetailStyle={$gwynplaineRadioDetail}
                outerStyle={wickedCharacterTheme === "gwynplaine" ? $gwynplaineRadioOuterSelected : undefined}
              />
              <View style={themed($radioLabelContainer)}>
                <Text style={themed($radioLabel)}>🍷 그윈플렌 (Gwynplaine)</Text>
                <Text style={themed($radioDescription)}>와인/브라운 기반의 우아한 테마</Text>
              </View>
            </View>
          </View>
        </View>
        
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
  padding: 20,
  justifyContent: "center",
  alignItems: "center",
})

const $title: ThemedStyle<TextStyle> = () => ({
  fontSize: 24,
  fontWeight: "bold",
  marginBottom: 32,
})

const $themeSection: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  maxWidth: 400,
  marginBottom: 32,
  padding: 20,
  borderRadius: 12,
  backgroundColor: "rgba(0, 0, 0, 0.05)",
})

const $sectionTitle: ThemedStyle<TextStyle> = () => ({
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 8,
  textAlign: "center",
})

const $sectionSubtitle: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 14,
  color: theme.colors.textDim,
  textAlign: "center",
  marginBottom: 20,
})

const $radioGroup: ThemedStyle<ViewStyle> = () => ({
  gap: 16,
})

const $radioOption: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  paddingVertical: 8,
})

const $radioLabelContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $radioLabel: ThemedStyle<TextStyle> = () => ({
  fontSize: 16,
  fontWeight: "500",
  marginBottom: 4,
})

const $radioDescription: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 13,
  color: theme.colors.textDim,
})

const $logoutButton: ThemedStyle<ViewStyle> = () => ({
  marginTop: 16,
  minWidth: 120,
})

// Elphaba (Green) Radio Button Styles
const $elphabaRadioDetail: ViewStyle = {
  backgroundColor: "#4FB84F", // Elphaba green
}

const $elphabaRadioOuterSelected: ViewStyle = {
  borderColor: "#4FB84F", // Elphaba green border when selected
}

// Glinda (Pink) Radio Button Styles  
const $glindaRadioDetail: ViewStyle = {
  backgroundColor: "#FF1493", // Glinda pink
}

const $glindaRadioOuterSelected: ViewStyle = {
  borderColor: "#FF1493", // Glinda pink border when selected
}

// Gwynplaine (Wine/Burgundy) Radio Button Styles
const $gwynplaineRadioDetail: ViewStyle = {
  backgroundColor: "#AD1457", // Gwynplaine wine/burgundy
}

const $gwynplaineRadioOuterSelected: ViewStyle = {
  borderColor: "#AD1457", // Gwynplaine wine/burgundy border when selected
}
