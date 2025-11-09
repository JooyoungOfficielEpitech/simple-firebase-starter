import { FC, useEffect, useState, useMemo } from "react"
import { View, ViewStyle, ScrollView, TouchableOpacity } from "react-native"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { AlertModal } from "@/components/AlertModal"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import { useAlert } from "@/hooks/useAlert"
import { userService } from "@/services/firestore"
import type { ThemedStyle } from "@/theme/types"
import type { UserProfile } from "@/types/user"
import type { TextStyle } from "react-native"

interface ProfileScreenProps {
  navigation?: any
}

export const ProfileScreen: FC<ProfileScreenProps> = ({ navigation }) => {
  const { themed } = useAppTheme()
  const { user, isEmailVerified, logout, sendEmailVerification, updateUserEmail } = useAuth()
  const { alertState, alert, confirm, confirmDestructive, hideAlert } = useAlert()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadUserProfile()
  }, [user])

  // 화면이 포커스될 때마다 프로필 다시 로드 (편집 후 돌아올 때)
  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      loadUserProfile()
    })

    return unsubscribe
  }, [navigation])

  const loadUserProfile = async () => {
    if (!user) {
      console.log("❌ [ProfileScreen] 사용자가 없어서 프로필 로드 불가")
      return
    }
    
    try {
      setIsLoading(true)
      console.log("🔄 [ProfileScreen] 프로필 로드 시작 - userId:", user.uid)
      let profile = await userService.getUserProfile(user.uid)
      console.log("✅ [ProfileScreen] 프로필 로드 결과:", profile)
      
      // 프로필이 없는 경우 기본 프로필 생성
      if (!profile) {
        console.log("🔄 [ProfileScreen] 프로필이 없어서 기본 프로필 생성 중...")
        try {
          await userService.createUserProfile({
            name: user.displayName || user.email?.split("@")[0] || "사용자",
          })
          
          // 생성 후 다시 로드
          profile = await userService.getUserProfile(user.uid)
          console.log("✅ [ProfileScreen] 기본 프로필 생성 및 로드 완료:", profile)
        } catch (createError) {
          console.error("❌ [ProfileScreen] 기본 프로필 생성 실패:", createError)
        }
      }
      
      setUserProfile(profile)
    } catch (error) {
      console.error("❌ [ProfileScreen] 프로필 로드 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmailVerification = async () => {
    try {
      setIsUpdating(true)
      await sendEmailVerification()
      alert("알림", "인증 이메일이 발송되었습니다.")
    } catch (error) {
      alert("오류", "이메일 발송에 실패했습니다.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBecomeOrganizer = async () => {
    if (!userProfile) return

    // 먼저 이미 단체를 소유하고 있는지 확인
    try {
      const hasOrganization = await userService.hasOwnedOrganization()
      if (hasOrganization) {
        alert("알림", "이미 단체를 소유하고 있습니다. 계정당 하나의 단체만 소유할 수 있습니다.")
        return
      }
    } catch (error) {
      console.error("단체 소유 확인 오류:", error)
    }

    // 이전 운영자 경험이 있는 경우 자동 전환 시도
    try {
      const autoResult = await userService.attemptAutoOrganizerConversion()
      
      if (autoResult.success) {
        alert("성공", `${autoResult.organizationName} 운영자로 전환되었습니다.`)
        await loadUserProfile()
        return
      }
    } catch (error) {
      console.error("자동 운영자 전환 확인 오류:", error)
    }

    // 바로 단체 등록 화면으로 이동
    navigation?.navigate("CreateOrganization", { isOrganizerConversion: true })
  }

  const handleDeleteAccount = () => {
    confirmDestructive(
      "회원 탈퇴",
      "정말로 계정 데이터를 모두 삭제하시겠습니까?\n\n⚠️ 다음 데이터가 모두 삭제됩니다:\n• 프로필 정보\n• 작성한 게시글\n• 제출한 지원서\n• 받은 알림\n• 소유한 단체 정보\n\n이 작업은 되돌릴 수 없습니다.",
      "회원 탈퇴",
      async () => {
        try {
          setIsUpdating(true)
          
          // 모든 사용자 데이터 삭제
          await userService.deleteUserAccount()
          
          // 데이터 삭제 후 로그아웃
          await logout()
          
          alert("완료", "모든 데이터가 삭제되었습니다.")
          
        } catch (error) {
          console.error("데이터 삭제 오류:", error)
          alert(
            "삭제 실패", 
            error.message || "데이터 삭제에 실패했습니다. 다시 시도해주세요."
          )
        } finally {
          setIsUpdating(false)
        }
      }
    )
  }

  // useMemo로 프로필 완성도 데이터 캐싱
  const profileCompletionData = useMemo(() => {
    console.log("🔍 [ProfileScreen] profileCompletionData 계산 시작")
    console.log("🔍 [ProfileScreen] userProfile 상태:", userProfile ? "존재함" : "null/undefined")
    
    if (!userProfile) {
      console.log("❌ [ProfileScreen] userProfile이 없어서 기본값 반환")
      return { percentage: 0, missing: [], completed: [] }
    }
    
    // 전체 프로필 데이터 디버깅
    console.log("🔍 [ProfileScreen] 전체 프로필 데이터:", JSON.stringify(userProfile, null, 2))
    
    // 각 필드별 상세 체크
    const nameCheck = {
      value: userProfile.name,
      exists: !!userProfile.name,
      notEmpty: userProfile.name && userProfile.name.trim() !== "",
      final: !!userProfile.name && userProfile.name.trim() !== ""
    }

    const phoneCheck = {
      value: userProfile.phoneNumber,
      exists: !!userProfile.phoneNumber,
      notEmpty: userProfile.phoneNumber && userProfile.phoneNumber.trim() !== "",
      final: !!userProfile.phoneNumber && userProfile.phoneNumber.trim() !== ""
    }

    const genderCheck = {
      value: userProfile.gender,
      exists: !!userProfile.gender,
      isValidGender: userProfile.gender === 'male' || userProfile.gender === 'female',
      final: !!userProfile.gender && (userProfile.gender === 'male' || userProfile.gender === 'female')
    }

    const birthdayCheck = {
      value: userProfile.birthday,
      exists: !!userProfile.birthday,
      notEmpty: userProfile.birthday && userProfile.birthday.trim() !== "",
      final: !!userProfile.birthday && userProfile.birthday.trim() !== ""
    }

    const heightCheck = {
      value: userProfile.heightCm,
      type: typeof userProfile.heightCm,
      isNumber: typeof userProfile.heightCm === 'number',
      isPositive: typeof userProfile.heightCm === 'number' && userProfile.heightCm > 0,
      final: typeof userProfile.heightCm === 'number' && userProfile.heightCm > 0
    }

    console.log("🔍 [ProfileScreen] 각 필드 상세 체크:", {
      name: nameCheck,
      phone: phoneCheck,
      gender: genderCheck,
      birthday: birthdayCheck,
      height: heightCheck
    })
    
    const items = [
      {
        key: 'name',
        label: '이름',
        completed: nameCheck.final,
        value: userProfile.name
      },
      {
        key: 'phone',
        label: '전화번호',
        completed: phoneCheck.final,
        value: userProfile.phoneNumber
      },
      {
        key: 'gender',
        label: '성별',
        completed: genderCheck.final,
        value: userProfile.gender
      },
      {
        key: 'birthday',
        label: '생년월일',
        completed: birthdayCheck.final,
        value: userProfile.birthday
      },
      {
        key: 'height',
        label: '키',
        completed: heightCheck.final,
        value: userProfile.heightCm
      }
    ]
    
    const completed = items.filter(item => item.completed)
    const missing = items.filter(item => !item.completed)
    const percentage = Math.round((completed.length / items.length) * 100)
    
    console.log("📈 [ProfileScreen] 최종 완성도 결과:", {
      completedCount: completed.length,
      missingCount: missing.length,
      totalItems: items.length,
      percentage,
      completedItems: completed.map(item => `${item.label}: ${item.value}`),
      missingItems: missing.map(item => `${item.label}: ${item.value || '미설정'}`)
    })
    
    return { percentage, missing, completed }
  }, [userProfile])

  const handleProfileCompletionClick = () => {
    const { missing, completed, percentage } = profileCompletionData
    
    console.log("🎯 [ProfileScreen] 완성도 클릭 - missing:", missing.length, "completed:", completed.length, "percentage:", percentage)
    
    if (missing.length === 0) {
      alert("프로필 완성!", "모든 프로필 정보가 완성되었습니다. 🎉")
      return
    }
    
    const missingList = missing.map(item => `• ${item.label} (현재: ${item.value || '미설정'})`).join('\n')
    const completedList = completed.map(item => `• ${item.label} (현재: ${item.value})`).join('\n')
    
    confirm(
      "프로필 완성도",
      `완성된 항목 (${completed.length}/5):\n${completedList || '없음'}\n\n아직 필요한 항목 (${missing.length}/5):\n${missingList}`,
      () => navigation?.navigate("EditProfile")
    )
  }

  const formatUserType = (userType: string) => {
    return userType === "organizer" ? "운영자" : "일반회원"
  }

  const formatGender = (gender?: string) => {
    if (!gender) return "미설정"
    return gender === "male" ? "남성" : "여성"
  }

  if (isLoading) {
    return (
      <Screen style={themed($root)} preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader title="프로필" showNotificationIcon={false} showBackButton={false} />
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
      <ScreenHeader title="프로필" showNotificationIcon={false} showBackButton={false} />
      
      {/* 기본 정보 섹션 */}
      <View style={themed($card)}>
        <Text preset="subheading" style={themed($sectionTitle)}>기본 정보</Text>
          
          <View style={themed($infoRow)}>
            <Text style={themed($label)}>이름:</Text>
            <Text style={themed($value)}>{userProfile?.name || "미설정"}</Text>
          </View>
          
          <View style={themed($infoRow)}>
            <Text style={themed($label)}>이메일:</Text>
            <Text style={themed($value)}>{user?.email}</Text>
          </View>

          <View style={themed($infoRow)}>
            <Text style={themed($label)}>전화번호:</Text>
            <Text style={themed($value)}>{userProfile?.phoneNumber || "미설정"}</Text>
          </View>

          <View style={themed($infoRow)}>
            <Text style={themed($label)}>성별:</Text>
            <Text style={themed($value)}>{formatGender(userProfile?.gender)}</Text>
          </View>
          
          <View style={themed($infoRow)}>
            <Text style={themed($label)}>생년월일:</Text>
            <Text style={themed($value)}>{userProfile?.birthday || "미설정"}</Text>
          </View>
          
          <View style={themed($infoRow)}>
            <Text style={themed($label)}>키:</Text>
            <Text style={themed($value)}>
              {userProfile?.heightCm ? `${userProfile.heightCm}cm` : "미설정"}
            </Text>
          </View>
          
          <View style={themed($infoRow)}>
            <Text style={themed($label)}>사용자 유형:</Text>
            <Text style={themed($value)}>{formatUserType(userProfile?.userType || "general")}</Text>
          </View>
        </View>

        {/* 계정 상태 섹션 */}
        <View style={themed($card)}>
          <Text preset="subheading" style={themed($sectionTitle)}>계정 상태</Text>
          
          <View style={themed($infoRow)}>
            <Text style={themed($label)}>이메일 인증:</Text>
            <Text style={themed($value)}>
              {isEmailVerified ? "✅ 인증됨" : "❌ 미인증"}
            </Text>
          </View>
          
          <TouchableOpacity style={themed($infoRow)} onPress={handleProfileCompletionClick}>
            <Text style={themed($label)}>프로필 완성도:</Text>
            <View style={themed($completionContainer)}>
              <Text style={themed($completionValue)}>{profileCompletionData.percentage}%</Text>
              <Text style={themed($completionHint)}>📊 탭하여 상세보기</Text>
            </View>
          </TouchableOpacity>
          
          {!isEmailVerified && (
            <Button
              text="이메일 인증 재발송"
              onPress={handleSendEmailVerification}
              disabled={isUpdating}
              style={themed($button)}
            />
          )}
        </View>

        {/* 프로필 편집 섹션 */}
        <View style={themed($card)}>
          <Text preset="subheading" style={themed($sectionTitle)}>프로필 편집</Text>
          
          <Button
            text="프로필 편집"
            onPress={() => navigation?.navigate("EditProfile")}
            style={themed($button)}
          />
          
          <Button
            text="비밀번호 변경"
            onPress={() => {
              // TODO: 비밀번호 변경 화면으로 이동
              alert("알림", "비밀번호 변경 화면 구현 예정")
            }}
            style={themed($button)}
          />
        </View>

        {/* 계정 관리 섹션 */}
        <View style={themed($card)}>
          <Text preset="subheading" style={themed($sectionTitle)}>계정 관리</Text>
          
          <Button
            text="이메일 변경"
            onPress={() => {
              // TODO: 이메일 변경 로직
              alert("알림", "이메일 변경 기능 구현 예정")
            }}
            style={themed($button)}
          />
          
          {userProfile?.userType === "general" && (
            <Button
              text="운영자 계정으로 만들기"
              onPress={handleBecomeOrganizer}
              disabled={isUpdating}
              style={themed($button)}
            />
          )}
          
          <Button
            text="로그아웃"
            onPress={logout}
            style={themed($button)}
          />
          
          <Button
            text="회원 탈퇴"
            onPress={handleDeleteAccount}
            preset="filled"
            style={themed($deleteButton)}
            disabled={isUpdating}
          />
        </View>

        {/* Alert Modal */}
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

const $card: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
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

const $infoRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.sm,
})

const $label: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
  fontWeight: "500",
})

const $value: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
  fontWeight: "400",
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $deleteButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.sm,
  backgroundColor: colors.error,
})

const $completionContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-end",
})

const $completionValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
  fontWeight: "600",
})

const $completionHint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: spacing.xxxs,
  fontStyle: "italic",
})