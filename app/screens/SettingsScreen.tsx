import { type FC, useState, useEffect, useRef } from "react"
import { View, type TextStyle, type ViewStyle, Alert, Animated, Dimensions } from "react-native"

import { $styles } from "@/theme/styles"

import { Button } from "@/components/Button"
import { Radio } from "@/components/Toggle/Radio"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAuth } from "@/context/AuthContext"
import { userService } from "@/services/firestore"
import { UserProfile } from "@/types/user"
import type { MainTabScreenProps } from "@/navigators/MainNavigator"
import { useAppTheme } from "@/theme/context"
import { type ThemedStyle, type WickedCharacterTheme } from "@/theme/types"

interface SettingsScreenProps extends MainTabScreenProps<"Settings"> {}

export const SettingsScreen: FC<SettingsScreenProps> = function SettingsScreen() {
  const { themed, wickedCharacterTheme, setWickedCharacterTheme } = useAppTheme()
  const { logout } = useAuth()
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState(false)
  const [showOrgNameInput, setShowOrgNameInput] = useState(false)
  const [organizationName, setOrganizationName] = useState("")
  
  // 커튼 효과를 위한 애니메이션 상태
  const screenWidth = Dimensions.get('window').width
  const leftCurtainAnim = useRef(new Animated.Value(-screenWidth / 2)).current
  const rightCurtainAnim = useRef(new Animated.Value(screenWidth / 2)).current
  const [isThemeChanging, setIsThemeChanging] = useState(false)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const profile = await userService.getUserProfile()
      setUserProfile(profile)
    } catch (error) {
      console.error("사용자 프로필 로드 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.warn("Logout failed:", error)
    }
  }

  const handleCharacterThemeChange = async (character: WickedCharacterTheme) => {
    if (character === wickedCharacterTheme) return
    
    setIsThemeChanging(true)
    
    // 커튼 닫히는 애니메이션
    Animated.parallel([
      Animated.timing(leftCurtainAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rightCurtainAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 테마 변경
      setWickedCharacterTheme(character)
      
      // 잠시 대기 후 커튼 열리는 애니메이션
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(leftCurtainAnim, {
            toValue: -screenWidth / 2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(rightCurtainAnim, {
            toValue: screenWidth / 2,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsThemeChanging(false)
        })
      }, 100)
    })
  }

  const handleConvertToOrganizer = () => {
    Alert.alert(
      "운영자로 전환",
      "운영자로 전환하시겠습니까? 이후 단체 정보를 입력해야 합니다.",
      [
        { text: "취소", style: "cancel" },
        { text: "확인", onPress: () => setShowOrgNameInput(true) }
      ]
    )
  }

  const handleConfirmConversion = async () => {
    if (!organizationName.trim()) {
      Alert.alert("오류", "단체명을 입력해주세요.")
      return
    }

    try {
      setConverting(true)
      
      // 사용자 타입을 운영자로 변환
      await userService.updateUserProfile({
        userType: "organizer",
        organizationId: userProfile?.uid,
        organizationName: organizationName.trim()
      })

      // 프로필 새로고침
      await loadUserProfile()
      
      setShowOrgNameInput(false)
      setOrganizationName("")
      
      Alert.alert("성공", "운영자로 전환되었습니다!")
    } catch (error) {
      console.error("운영자 전환 오류:", error)
      Alert.alert("오류", "운영자 전환에 실패했습니다.")
    } finally {
      setConverting(false)
    }
  }

  const handleRevertToGeneral = () => {
    Alert.alert(
      "일반 사용자로 전환",
      "일반 사용자로 전환하시겠습니까? 운영자 권한이 사라집니다.",
      [
        { text: "취소", style: "cancel" },
        { text: "확인", onPress: confirmRevertToGeneral }
      ]
    )
  }

  const confirmRevertToGeneral = async () => {
    try {
      setConverting(true)
      
      await userService.revertToGeneralUser()

      await loadUserProfile()
      
      Alert.alert("성공", "일반 사용자로 전환되었습니다!")
    } catch (error) {
      console.error("일반 사용자 전환 오류:", error)
      Alert.alert("오류", "일반 사용자 전환에 실패했습니다.")
    } finally {
      setConverting(false)
    }
  }

  if (showOrgNameInput) {
    return (
      <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
        <View style={themed($container)}>
          <Text style={themed($title)}>단체명 입력</Text>
          
          <View style={themed($orgNameInputSection)}>
            <Text style={themed($sectionTitle)}>운영할 단체명을 입력해주세요</Text>
            
            <TextField
              value={organizationName}
              onChangeText={setOrganizationName}
              placeholder="예: 극단 봄날"
              style={themed($orgNameInput)}
            />
            
            <View style={themed($buttonRow)}>
              <Button
                text="취소"
                preset="default"
                onPress={() => {
                  setShowOrgNameInput(false)
                  setOrganizationName("")
                }}
                style={themed($cancelButton)}
              />
              <Button
                text="확인"
                onPress={handleConfirmConversion}
                isLoading={converting}
                style={themed($confirmButton)}
              />
            </View>
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={themed($container)}>
        <Text style={themed($title)}>Settings</Text>
        
        {/* User Type Section */}
        {!loading && userProfile && (
          <View style={themed($userTypeSection)}>
            <Text style={themed($sectionTitle)}>사용자 유형</Text>
            <Text style={themed($currentUserType)}>
              현재: {userProfile.userType === "organizer" 
                ? `운영자 (${userProfile.organizationName || "단체"})` 
                : "일반 사용자"}
            </Text>
            
            {userProfile.userType === "general" ? (
              <Button
                text="운영자로 전환"
                onPress={handleConvertToOrganizer}
                isLoading={converting}
                style={themed($convertButton)}
              />
            ) : (
              <Button
                text="일반 사용자로 전환"
                onPress={handleRevertToGeneral}
                isLoading={converting}
                style={themed($revertButton)}
              />
            )}
          </View>
        )}
        
        {/* Wicked Character Theme Selection */}
        <View style={themed($themeSection)}>
          <Text style={themed($sectionTitle)}>테마 선택</Text>
          <Text style={themed($sectionSubtitle)}>좋아하는 캐릭터의 테마를 선택해보세요</Text>
          
          <View style={themed($radioGroup)}>
            <View style={themed($radioOption)}>
              <Radio
                value={wickedCharacterTheme === "elphaba"}
                onValueChange={() => !isThemeChanging && handleCharacterThemeChange("elphaba")}
                inputDetailStyle={$elphabaRadioDetail}
                inputOuterStyle={wickedCharacterTheme === "elphaba" ? $elphabaRadioOuterSelected : undefined}
                disabled={isThemeChanging}
              />
              <View style={themed($radioLabelContainer)}>
                <Text style={themed($radioLabel)}>🟢 엘파바 (Elphaba)</Text>
                <Text style={themed($radioDescription)}>누구나 세상을 날아오를 수 있어 (Defying Gravity)</Text>
              </View>
            </View>
            
            <View style={themed($radioOption)}>
              <Radio
                value={wickedCharacterTheme === "glinda"}
                onValueChange={() => !isThemeChanging && handleCharacterThemeChange("glinda")}
                inputDetailStyle={$glindaRadioDetail}
                inputOuterStyle={wickedCharacterTheme === "glinda" ? $glindaRadioOuterSelected : undefined}
                disabled={isThemeChanging}
              />
              <View style={themed($radioLabelContainer)}>
                <Text style={themed($radioLabel)}>🌸 글린다 (Glinda)</Text>
                <Text style={themed($radioDescription)}>인기가 많아질거야! 넌 인기가 많아질 거라고! (Popular)</Text>
              </View>
            </View>
            
            <View style={themed($radioOption)}>
              <Radio
                value={wickedCharacterTheme === "gwynplaine"}
                onValueChange={() => !isThemeChanging && handleCharacterThemeChange("gwynplaine")}
                inputDetailStyle={$gwynplaineRadioDetail}
                inputOuterStyle={wickedCharacterTheme === "gwynplaine" ? $gwynplaineRadioOuterSelected : undefined}
                disabled={isThemeChanging}
              />
              <View style={themed($radioLabelContainer)}>
                <Text style={themed($radioLabel)}>🍷 그윈플렌 (Gwynplaine)</Text>
                <Text style={themed($radioDescription)}>그래, 내가 바꿀수 있어 (모두의 세상)</Text>
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
      
      {/* 커튼 효과 */}
      {isThemeChanging && (
        <>
          <Animated.View 
            style={[
              themed($curtain),
              {
                left: 0,
                transform: [{ translateX: leftCurtainAnim }],
                backgroundColor: getCurtainColor(wickedCharacterTheme),
              }
            ]} 
          />
          <Animated.View 
            style={[
              themed($curtain),
              {
                right: 0,
                transform: [{ translateX: rightCurtainAnim }],
                backgroundColor: getCurtainColor(wickedCharacterTheme),
              }
            ]} 
          />
        </>
      )}
    </Screen>
  )
}

// 테마에 따른 커튼 색상 결정
const getCurtainColor = (theme: WickedCharacterTheme): string => {
  switch (theme) {
    case "elphaba":
      return "#2E7D32" // 짙은 녹색
    case "glinda":
      return "#C2185B" // 짙은 핑크
    case "gwynplaine":
      return "#7B1FA2" // 짙은 보라
    default:
      return "#424242" // 기본 회색
  }
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

const $userTypeSection: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  maxWidth: 400,
  marginBottom: 24,
  padding: 20,
  borderRadius: 12,
  backgroundColor: "rgba(0, 0, 0, 0.05)",
})

const $currentUserType: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 16,
  color: theme.colors.text,
  marginBottom: 16,
  textAlign: "center",
  fontWeight: "500",
})

const $convertButton: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.tint,
  marginTop: 8,
})

const $revertButton: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.error || "#FF4444",
  marginTop: 8,
})

const $orgNameInputSection: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  maxWidth: 400,
  padding: 20,
  borderRadius: 12,
  backgroundColor: "rgba(0, 0, 0, 0.05)",
})

const $orgNameInput: ThemedStyle<ViewStyle> = () => ({
  marginVertical: 16,
})

const $buttonRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 16,
})

const $cancelButton: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $confirmButton: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.tint,
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

// 커튼 스타일
const $curtain: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  bottom: 0,
  width: "50%",
  zIndex: 1000,
  elevation: 1000, // Android에서 최상단 표시
})
