import { FC, useEffect, useState } from "react"
import { View, ViewStyle } from "react-native"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { TextField } from "@/components/TextField"
import { AlertModal } from "@/components/AlertModal"
import { Dropdown } from "@/components/Dropdown"
import { useAlert } from "@/hooks/useAlert"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import { userService } from "@/services/firestore"
import type { ThemedStyle } from "@/theme/types"
import type { UserProfile, UserGender } from "@/types/user"
import type { TextStyle } from "react-native"

interface EditProfileScreenProps {
  navigation: any
}

export const EditProfileScreen: FC<EditProfileScreenProps> = ({ navigation }) => {
  const { themed } = useAppTheme()
  const { user } = useAuth()
  const { alert, alertState, hideAlert } = useAlert()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form fields
  const [name, setName] = useState("")
  const [gender, setGender] = useState<UserGender | "">("")
  const [birthday, setBirthday] = useState("")
  const [heightCm, setHeightCm] = useState("")

  useEffect(() => {
    loadUserProfile()
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const profile = await userService.getUserProfile(user.uid)
      setUserProfile(profile)
      
      if (profile) {
        setName(profile.name || "")
        setGender(profile.gender || "")
        setBirthday(profile.birthday || "")
        setHeightCm(profile.heightCm?.toString() || "")
      }
    } catch (error) {
      console.error("프로필 로드 오류:", error)
      alert("오류", "프로필을 불러올 수 없습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert("알림", "이름을 입력해주세요.")
      return
    }

    try {
      setIsSaving(true)
      
      const updateData: any = {
        name: name.trim()
      }

      if (gender) {
        updateData.gender = gender
      }

      if (birthday) {
        updateData.birthday = birthday
      }

      if (heightCm) {
        const height = parseInt(heightCm)
        if (isNaN(height) || height <= 0) {
          alert("알림", "올바른 키를 입력해주세요.")
          return
        }
        updateData.heightCm = height
      }

      await userService.updateUserProfile(updateData)
      alert("성공", "프로필이 업데이트되었습니다.", [
        { text: "확인", onPress: () => navigation.goBack() }
      ])
    } catch (error) {
      console.error("프로필 업데이트 오류:", error)
      alert("오류", "프로필 업데이트에 실패했습니다.")
    } finally {
      setIsSaving(false)
    }
  }


  if (isLoading) {
    return (
      <Screen style={themed($root)} preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader 
          title="프로필 편집" 
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={themed($loadingContainer)}>
          <Text>프로필 로딩 중...</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen 
      style={themed($root)} 
      preset="scroll" 
      safeAreaEdges={[]}
      contentContainerStyle={themed($contentContainer)}
    >
      <ScreenHeader 
        title="프로필 편집" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <View style={themed($formContainer)}>
        <Text preset="subheading" style={themed($sectionTitle)}>기본 정보</Text>

        <TextField
          label="이름"
          value={name}
          onChangeText={setName}
          placeholder="이름을 입력하세요"
          style={themed($textField)}
        />

        <View style={themed($fieldContainer)}>
          <Text style={themed($label)}>성별</Text>
          <Dropdown
            value={gender}
            options={[
              { label: "남성", value: "male" },
              { label: "여성", value: "female" }
            ]}
            placeholder="성별을 선택하세요"
            onSelect={(value) => setGender(value as any)}
          />
        </View>

        <TextField
          label="생년월일"
          value={birthday}
          onChangeText={setBirthday}
          placeholder="YYYY-MM-DD 형식으로 입력"
          style={themed($textField)}
        />

        <TextField
          label="키 (cm)"
          value={heightCm}
          onChangeText={setHeightCm}
          placeholder="키를 입력하세요"
          keyboardType="numeric"
          style={themed($textField)}
        />

        <View style={themed($buttonContainer)}>
          <Button
            text="저장"
            onPress={handleSave}
            disabled={isSaving}
            style={themed($saveButton)}
          />
          
          <Button
            text="취소"
            onPress={() => navigation.goBack()}
            preset="default"
            style={themed($cancelButton)}
          />
        </View>
      </View>
      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
        dismissable={alertState.dismissable}
      />
    </Screen>
  )
}

const $root: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
})

const $formContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginVertical: spacing.sm,
  padding: spacing.md,
  backgroundColor: colors.background,
  borderRadius: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $sectionTitle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $fieldContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $label: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.textDim,
  fontWeight: "500",
  marginBottom: spacing.xs,
})


const $buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  gap: spacing.sm,
})

const $saveButton: ThemedStyle<ViewStyle> = () => ({})

const $cancelButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
})