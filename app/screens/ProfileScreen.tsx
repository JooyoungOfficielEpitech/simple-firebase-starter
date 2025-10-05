import { FC, useEffect, useState } from "react"
import { View, ViewStyle, ScrollView, Alert, TouchableOpacity } from "react-native"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
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
    if (!user) return
    
    try {
      setIsLoading(true)
      const profile = await userService.getUserProfile(user.uid)
      setUserProfile(profile)
    } catch (error) {
      console.error("프로필 로드 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmailVerification = async () => {
    try {
      setIsUpdating(true)
      await sendEmailVerification()
      Alert.alert("알림", "인증 이메일이 발송되었습니다.")
    } catch (error) {
      Alert.alert("오류", "이메일 발송에 실패했습니다.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBecomeOrganizer = async () => {
    if (!userProfile) return

    Alert.alert(
      "운영자 계정 전환",
      "운영자 계정으로 전환하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: async () => {
            try {
              setIsUpdating(true)
              
              // 이전 운영자 경험이 있는 경우 자동 전환 시도
              const autoResult = await userService.attemptAutoOrganizerConversion()
              
              if (autoResult.success) {
                Alert.alert("성공", `${autoResult.organizationName} 운영자로 전환되었습니다.`)
                await loadUserProfile()
              } else {
                // 새로운 운영자 계정 생성 로직
                Alert.prompt(
                  "단체명 입력",
                  "운영할 단체명을 입력해주세요.",
                  async (organizationName) => {
                    if (organizationName && organizationName.trim()) {
                      try {
                        await userService.updateUserProfile({
                          userType: "organizer",
                          organizationId: user?.uid,
                          organizationName: organizationName.trim()
                        })
                        Alert.alert("성공", "운영자 계정으로 전환되었습니다.")
                        await loadUserProfile()
                      } catch (error) {
                        Alert.alert("오류", "운영자 전환에 실패했습니다.")
                      }
                    }
                  }
                )
              }
            } catch (error) {
              Alert.alert("오류", "운영자 전환에 실패했습니다.")
            } finally {
              setIsUpdating(false)
            }
          }
        }
      ]
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      "계정 삭제",
      "정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              setIsUpdating(true)
              await userService.deleteUserProfile()
              await logout()
            } catch (error) {
              Alert.alert("오류", "계정 삭제에 실패했습니다.")
            } finally {
              setIsUpdating(false)
            }
          }
        }
      ]
    )
  }

  const getProfileCompletionData = () => {
    if (!userProfile) return { percentage: 0, missing: [], completed: [] }
    
    const items = [
      { key: 'name', label: '이름', completed: !!userProfile.name },
      { key: 'gender', label: '성별', completed: !!userProfile.gender },
      { key: 'birthday', label: '생년월일', completed: !!userProfile.birthday },
      { key: 'height', label: '키', completed: !!userProfile.heightCm }
    ]
    
    const completed = items.filter(item => item.completed)
    const missing = items.filter(item => !item.completed)
    const percentage = Math.round((completed.length / items.length) * 100)
    
    return { percentage, missing, completed }
  }

  const handleProfileCompletionClick = () => {
    const { missing, completed } = getProfileCompletionData()
    
    if (missing.length === 0) {
      Alert.alert("프로필 완성!", "모든 프로필 정보가 완성되었습니다. 🎉")
      return
    }
    
    const missingList = missing.map(item => `• ${item.label}`).join('\n')
    const completedList = completed.map(item => `• ${item.label}`).join('\n')
    
    Alert.alert(
      "프로필 완성도",
      `완성된 항목:\n${completedList}\n\n아직 필요한 항목:\n${missingList}`,
      [
        { text: "닫기", style: "cancel" },
        { text: "프로필 편집", onPress: () => navigation?.navigate("EditProfile") }
      ]
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
        <ScreenHeader title="프로필" showNotificationIcon={false} />
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
      <ScreenHeader title="프로필" showNotificationIcon={false} />
      
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
              <Text style={themed($completionValue)}>{getProfileCompletionData().percentage}%</Text>
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
              Alert.alert("알림", "비밀번호 변경 화면 구현 예정")
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
              Alert.alert("알림", "이메일 변경 기능 구현 예정")
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
            text="계정 삭제"
            onPress={handleDeleteAccount}
            preset="filled"
            style={themed($deleteButton)}
            disabled={isUpdating}
          />
        </View>
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