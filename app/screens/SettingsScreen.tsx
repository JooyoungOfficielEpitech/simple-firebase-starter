import { type FC, useState, useEffect, useRef } from "react"
import { View, type TextStyle, type ViewStyle, Alert, Animated, Dimensions } from "react-native"

import { $styles } from "@/theme/styles"

import { Button } from "@/components/Button"
import { Radio } from "@/components/Toggle/Radio"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAuth } from "@/context/AuthContext"
import { userService, organizationService } from "@/services/firestore"
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
  const curtainOpacityAnim = useRef(new Animated.Value(0)).current
  const curtainScaleAnim = useRef(new Animated.Value(0.8)).current
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
    
    // 커튼 나타나기 + 닫히는 애니메이션
    Animated.parallel([
      Animated.timing(curtainOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(curtainScaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 커튼이 중앙으로 닫히기
      Animated.parallel([
        Animated.timing(leftCurtainAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(rightCurtainAnim, {
          toValue: 0,
          duration: 400,
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
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(rightCurtainAnim, {
              toValue: screenWidth / 2,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // 커튼이 열린 후 바로 상태 변경
            setIsThemeChanging(false)
          })
        }, 200)
      })
    })
  }

  const handleConvertToOrganizer = async () => {
    // 이전 운영자 경험이 있는지 확인
    if (userProfile?.hasBeenOrganizer && userProfile?.previousOrganizationName) {
      Alert.alert(
        "운영자로 전환",
        `이전에 운영했던 "${userProfile.previousOrganizationName}" 단체로 복귀하시겠습니까?`,
        [
          { text: "취소", style: "cancel" },
          { 
            text: "새 단체 만들기", 
            onPress: () => setShowOrgNameInput(true)
          },
          { 
            text: "이전 단체로 복귀", 
            onPress: handleAutoConversion 
          }
        ]
      )
    } else {
      Alert.alert(
        "운영자로 전환",
        "운영자로 전환하시겠습니까? 단체 정보를 입력해야 합니다.",
        [
          { text: "취소", style: "cancel" },
          { text: "확인", onPress: () => setShowOrgNameInput(true) }
        ]
      )
    }
  }

  const handleAutoConversion = async () => {
    try {
      setConverting(true)
      
      const result = await userService.attemptAutoOrganizerConversion()
      
      if (result.success) {
        await loadUserProfile()
        Alert.alert("성공", `"${result.organizationName}" 단체의 운영자로 복귀했습니다!`)
      } else {
        Alert.alert(
          "복귀 실패", 
          result.error + "\n새로운 단체를 만드시겠습니까?",
          [
            { text: "취소", style: "cancel" },
            { text: "새 단체 만들기", onPress: () => setShowOrgNameInput(true) }
          ]
        )
      }
    } catch (error) {
      console.error("자동 운영자 전환 오류:", error)
      Alert.alert("오류", "자동 전환에 실패했습니다.")
    } finally {
      setConverting(false)
    }
  }

  const handleConfirmConversion = async () => {
    if (!organizationName.trim()) {
      Alert.alert("오류", "단체명을 입력해주세요.")
      return
    }

    try {
      setConverting(true)
      
      // 단체명 중복 검증
      await organizationService.validateUniqueOrganizationName(organizationName.trim())
      
      // Organizations 컬렉션에 새 단체 생성
      console.log('🏢 [SettingsScreen] 단체 생성 시작:', {
        name: organizationName.trim(),
        userId: userProfile?.uid
      })
      
      const organizationId = await organizationService.createOrganization({
        name: organizationName.trim(),
        description: `${organizationName.trim()} 공식 단체입니다.`,
        contactEmail: userProfile?.email || "",
        contactPhone: "", // 빈 문자열로 명시적 설정
        website: "", // 빈 문자열로 명시적 설정
        location: "",
        establishedDate: "", // 빈 문자열로 명시적 설정
        tags: []
      }, userProfile?.name || "")
      
      console.log('✅ [SettingsScreen] 단체 생성 완료:', {
        organizationId,
        organizationName: organizationName.trim()
      })
      
      // 생성된 단체가 실제로 존재하는지 확인
      try {
        const createdOrg = await organizationService.getOrganization(organizationId)
        console.log('🔍 [SettingsScreen] 생성된 단체 확인:', createdOrg ? {
          id: createdOrg.id,
          name: createdOrg.name,
          ownerId: createdOrg.ownerId
        } : 'NULL')
      } catch (error) {
        console.error('❌ [SettingsScreen] 생성된 단체 확인 실패:', error)
      }

      // 사용자 타입을 운영자로 변환
      const updateProfileData: any = {
        userType: "organizer",
        organizationId: organizationId,
        organizationName: organizationName.trim(),
        hasBeenOrganizer: true
      }

      // undefined 필드 제거
      Object.keys(updateProfileData).forEach(key => {
        if (updateProfileData[key] === undefined) {
          delete updateProfileData[key]
        }
      })

      await userService.updateUserProfile(updateProfileData)

      // 프로필 새로고침
      await loadUserProfile()
      
      setShowOrgNameInput(false)
      setOrganizationName("")
      
      Alert.alert("성공", "운영자로 전환되었습니다!")
    } catch (error) {
      console.error("운영자 전환 오류:", error)
      const errorMessage = error instanceof Error ? error.message : "운영자 전환에 실패했습니다."
      Alert.alert("오류", errorMessage)
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
                style={$revertButton(wickedCharacterTheme)}
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
      <Animated.View 
        style={[
          $curtainContainer,
          {
            opacity: isThemeChanging ? curtainOpacityAnim : 0,
            transform: [{ scale: curtainScaleAnim }],
          }
        ]}
      >
          {/* 왼쪽 커튼 */}
          <Animated.View 
            style={[
              themed($curtain),
              $leftCurtain,
              {
                transform: [{ translateX: leftCurtainAnim }],
                backgroundColor: getCurtainColor(wickedCharacterTheme),
              }
            ]} 
          >
            {/* 커튼 주름 효과 */}
            <View style={[$curtainFold, { backgroundColor: getCurtainFoldColor(wickedCharacterTheme) }]} />
            <View style={[$curtainFold, { backgroundColor: getCurtainFoldColor(wickedCharacterTheme), left: '20%' }]} />
            <View style={[$curtainFold, { backgroundColor: getCurtainFoldColor(wickedCharacterTheme), left: '40%' }]} />
            <View style={[$curtainFold, { backgroundColor: getCurtainFoldColor(wickedCharacterTheme), left: '60%' }]} />
            <View style={[$curtainFold, { backgroundColor: getCurtainFoldColor(wickedCharacterTheme), left: '80%' }]} />
            
            {/* 커튼 상단 고리 */}
            <View style={themed($curtainRings)}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={themed($curtainRing)} />
              ))}
            </View>
          </Animated.View>
          
          {/* 오른쪽 커튼 */}
          <Animated.View 
            style={[
              themed($curtain),
              $rightCurtain,
              {
                transform: [{ translateX: rightCurtainAnim }],
                backgroundColor: getCurtainColor(wickedCharacterTheme),
              }
            ]} 
          >
            {/* 커튼 주름 효과 */}
            <View style={[$curtainFold, { backgroundColor: getCurtainFoldColor(wickedCharacterTheme) }]} />
            <View style={[$curtainFold, { backgroundColor: getCurtainFoldColor(wickedCharacterTheme), left: '20%' }]} />
            <View style={[$curtainFold, { backgroundColor: getCurtainFoldColor(wickedCharacterTheme), left: '40%' }]} />
            <View style={[$curtainFold, { backgroundColor: getCurtainFoldColor(wickedCharacterTheme), left: '60%' }]} />
            <View style={[$curtainFold, { backgroundColor: getCurtainFoldColor(wickedCharacterTheme), left: '80%' }]} />
            
            {/* 커튼 상단 고리 */}
            <View style={themed($curtainRings)}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={themed($curtainRing)} />
              ))}
            </View>
          </Animated.View>
          
        {/* 커튼 봉 */}
        <View style={themed($curtainRod)} />
      </Animated.View>
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
      return "#8D6E63" // 짙은 갈색
    default:
      return "#424242" // 기본 회색
  }
}

// 커튼 주름 색상 (좀 더 어두운 색상)
const getCurtainFoldColor = (theme: WickedCharacterTheme): string => {
  switch (theme) {
    case "elphaba":
      return "#1B5E20" // 더 짙은 녹색
    case "glinda":
      return "#880E4F" // 더 짙은 핑크
    case "gwynplaine":
      return "#5D4037" // 더 짙은 갈색
    default:
      return "#212121" // 더 짙은 회색
  }
}

// "일반 사용자로 전환" 버튼 색상 (테마별)
const getRevertButtonColor = (characterTheme: WickedCharacterTheme): string => {
  switch (characterTheme) {
    case "elphaba":
      return "#558B2F" // 엘파바 테마: 어두운 녹색 (엘파바의 자연스러운 색감)
    case "glinda":
      return "#F06292" // 글린다 테마: 부드러운 핑크 (우아한 전환)
    case "gwynplaine":
      return "#8D6E63" // 그윈플렌 테마: 갈색 (어두운 느낌)
    default:
      return "#FF5722" // 기본: 주황빛 빨강
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

const $revertButton = (wickedCharacterTheme: WickedCharacterTheme): ViewStyle => ({
  backgroundColor: getRevertButtonColor(wickedCharacterTheme),
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

// 커튼 컨테이너
const $curtainContainer: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1000,
  elevation: 1000,
}

// 기본 커튼 스타일
const $curtain: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 50,
  bottom: 0,
  width: "50%",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 10,
})

// 왼쪽 커튼
const $leftCurtain: ViewStyle = {
  left: 0,
  borderTopRightRadius: 8,
  borderBottomRightRadius: 8,
}

// 오른쪽 커튼
const $rightCurtain: ViewStyle = {
  right: 0,
  borderTopLeftRadius: 8,
  borderBottomLeftRadius: 8,
}

// 커튼 주름 효과
const $curtainFold: ViewStyle = {
  position: "absolute",
  top: 0,
  bottom: 0,
  width: 3,
  opacity: 0.6,
}

// 커튼 봉
const $curtainRod: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  top: 30,
  left: 0,
  right: 0,
  height: 20,
  backgroundColor: theme.colors.border || "#8B4513",
  borderRadius: 10,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
})

// 커튼 고리들
const $curtainRings: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: -20,
  left: 0,
  right: 0,
  height: 20,
  flexDirection: "row",
  justifyContent: "space-evenly",
  alignItems: "center",
})

// 개별 커튼 고리
const $curtainRing: ThemedStyle<ViewStyle> = (theme) => ({
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: theme.colors.border || "#CD853F",
  borderWidth: 1,
  borderColor: "#8B4513",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  elevation: 3,
})
