import React, { useState, useEffect } from "react"
import { View, Alert } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { organizationService, userService } from "@/services/firestore"
import { useAppTheme } from "@/theme/context"
import { CreateOrganization } from "@/types/organization"
import { UserProfile } from "@/types/user"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList, "CreateOrganization">
type RouteProp = import("@react-navigation/native").RouteProp<BulletinBoardStackParamList, "CreateOrganization">

export const CreateOrganizationScreen = () => {
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProp>()
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const { organizationId, isEdit = false } = route.params || {}

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  // const [submitting, setSubmitting] = useState(false)  // TODO: Button 컴포넌트에 loading 기능 추가 후 사용

  // 폼 데이터
  const [formData, setFormData] = useState<CreateOrganization>({
    name: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    location: "",
    establishedDate: "",
    tags: [],
  })

  const [tagInput, setTagInput] = useState("")
  // const [errors, setErrors] = useState<Partial<CreateOrganization>>({})  // TODO: TextField 컴포넌트에 error prop 추가 후 사용

  useEffect(() => {
    loadUserProfile()
    if (isEdit && organizationId) {
      loadOrganization()
    }
  }, [isEdit, organizationId])

  const loadUserProfile = async () => {
    try {
      const profile = await userService.getUserProfile()
      setUserProfile(profile)
      
      if (profile?.email) {
        setFormData(prev => ({ ...prev, contactEmail: profile.email }))
      }
    } catch (error) {
      console.error("사용자 프로필 로드 오류:", error)
    }
  }

  const loadOrganization = async () => {
    if (!organizationId) return

    try {
      setLoading(true)
      const organization = await organizationService.getOrganization(organizationId)
      
      if (organization) {
        setFormData({
          name: organization.name,
          description: organization.description,
          contactEmail: organization.contactEmail,
          contactPhone: organization.contactPhone || "",
          website: organization.website || "",
          location: organization.location,
          establishedDate: organization.establishedDate || "",
          tags: organization.tags,
        })
      }
    } catch (error) {
      console.error("단체 정보 로드 오류:", error)
      Alert.alert("오류", "단체 정보를 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateOrganization> = {}

    if (!formData.name.trim()) {
      newErrors.name = "단체명을 입력해주세요"
    }

    if (!formData.description.trim()) {
      newErrors.description = "단체 소개를 입력해주세요"
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "연락처 이메일을 입력해주세요"
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "올바른 이메일 형식이 아닙니다"
    }

    if (!formData.location.trim()) {
      newErrors.location = "소재지를 입력해주세요"
    }

    // setErrors(newErrors)  // TODO: 에러 표시 기능 추가 후 사용
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    if (!userProfile?.name) {
      Alert.alert("오류", "사용자 프로필 정보가 필요합니다.")
      return
    }

    try {
      // setSubmitting(true)  // TODO: 로딩 상태 표시 기능 추가 후 사용

      if (isEdit && organizationId) {
        await organizationService.updateOrganization(organizationId, formData)
        Alert.alert("성공", "단체 정보가 수정되었습니다.")
      } else {
        await organizationService.createOrganization(formData, userProfile.name)
        Alert.alert("성공", "단체가 등록되었습니다.")
      }

      navigation.goBack()
    } catch (error) {
      console.error("단체 등록/수정 오류:", error)
      Alert.alert("오류", isEdit ? "단체 수정에 실패했습니다." : "단체 등록에 실패했습니다.")
    } finally {
      // setSubmitting(false)  // TODO: 로딩 상태 표시 기능 추가 후 사용
    }
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }


  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader 
          title={isEdit ? "단체 수정" : "단체 등록"}
        />
        <View style={[themed($container), { paddingTop: top + (spacing?.lg || 16) }]}>
          <View style={themed($loadingContainer)}>
            <Text text="단체 정보를 불러오는 중..." style={themed($loadingText)} />
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={[]}>
      <ScreenHeader 
        title={isEdit ? "단체 수정" : "단체 등록"}
      />
      <View style={[themed($container), { paddingTop: top + (spacing?.lg || 16) }]}>
        {/* 폼 */}
        <View style={themed($form)}>
          <TextField
            label="단체명 *"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="극단명을 입력해주세요"
            // error={errors.name}  // TODO: TextField 컴포넌트에 error prop 추가 필요
          />

          <TextField
            label="단체 소개 *"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="단체에 대한 간단한 소개를 입력해주세요"
            multiline
            numberOfLines={4}
            // error={errors.description}  // TODO: TextField 컴포넌트에 error prop 추가 필요
          />

          <TextField
            label="연락처 이메일 *"
            value={formData.contactEmail}
            onChangeText={(text) => setFormData(prev => ({ ...prev, contactEmail: text }))}
            placeholder="contact@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            // error={errors.contactEmail}  // TODO: TextField 컴포넌트에 error prop 추가 필요
          />

          <TextField
            label="연락처 전화번호"
            value={formData.contactPhone || ""}
            onChangeText={(text) => setFormData(prev => ({ ...prev, contactPhone: text }))}
            placeholder="02-1234-5678"
            keyboardType="phone-pad"
          />

          <TextField
            label="웹사이트"
            value={formData.website || ""}
            onChangeText={(text) => setFormData(prev => ({ ...prev, website: text }))}
            placeholder="https://example.com"
            keyboardType="url"
            autoCapitalize="none"
          />

          <TextField
            label="소재지 *"
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            placeholder="서울특별시 강남구"
            // error={errors.location}  // TODO: TextField 컴포넌트에 error prop 추가 필요
          />

          <TextField
            label="설립일"
            value={formData.establishedDate || ""}
            onChangeText={(text) => setFormData(prev => ({ ...prev, establishedDate: text }))}
            placeholder="2020-01-01"
          />

          {/* 태그 입력 */}
          <View style={themed($tagSection)}>
            <Text text="태그" style={themed($tagLabel)} />
            <View style={themed($tagInputContainer)}>
              <TextField
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="태그를 입력하고 추가 버튼을 눌러주세요"
                style={themed($tagInput)}
                onSubmitEditing={handleAddTag}
              />
              <Button
                text="추가"
                onPress={handleAddTag}
                style={themed($addTagButton)}
                textStyle={themed($addTagButtonText)}
              />
            </View>
            
            {formData.tags.length > 0 && (
              <View style={themed($tagsContainer)}>
                {formData.tags.map((tag, index) => (
                  <View key={index} style={themed($tag)}>
                    <Text text={tag} style={themed($tagText)} />
                    <Button
                      onPress={() => handleRemoveTag(index)}
                      style={themed($removeTagButton)}
                    >
                      <Text text="×" style={themed($removeTagText)} />
                    </Button>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 제출 버튼 */}
          <Button
            text={isEdit ? "수정하기" : "등록하기"}
            onPress={handleSubmit}
            // loading={submitting}  // TODO: Button 컴포넌트에 loading prop 추가 또는 isLoading 사용
            style={themed($submitButton)}
          />
        </View>
      </View>
    </Screen>
  )
}

const $container = ({ spacing }) => ({
  paddingHorizontal: spacing?.lg || 16,
})

const $header = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.lg || 16,
})

const $headerLeft = () => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  flex: 1,
})

const $backButton = ({ spacing }) => ({
  marginRight: spacing?.sm || 8,
  minHeight: 0,
  paddingHorizontal: 0,
  paddingVertical: 0,
})

const $title = ({ colors }) => ({
  color: colors.text,
})

const $form = ({ spacing }) => ({
  gap: spacing?.md || 12,
})

const $loadingContainer = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  paddingHorizontal: spacing?.xl || 24,
})

const $loadingText = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
  textAlign: "center" as const,
})

const $tagSection = ({ spacing }) => ({
  marginTop: spacing?.sm || 8,
})

const $tagLabel = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "500" as const,
  marginBottom: spacing?.xs || 4,
})

const $tagInputContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "flex-end" as const,
  gap: spacing?.sm || 8,
})

const $tagInput = () => ({
  flex: 1,
})

const $addTagButton = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  paddingHorizontal: spacing?.md || 12,
  paddingVertical: spacing?.xs || 4,
  minHeight: 40,
})

const $addTagButtonText = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
})

const $tagsContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  marginTop: spacing?.sm || 8,
  gap: spacing?.xs || 4,
})

const $tag = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing?.sm || 8,
  paddingVertical: 4,
  borderRadius: 4,
})

const $tagText = ({ colors }) => ({
  color: colors.palette.neutral600,
  fontSize: 12,
  marginRight: 4,
})

const $removeTagButton = () => ({
  padding: 0,
  minHeight: 0,
  width: 16,
  height: 16,
  justifyContent: "center" as const,
  alignItems: "center" as const,
})

const $removeTagText = ({ colors }) => ({
  color: colors.palette.neutral600,
  fontSize: 14,
  fontWeight: "bold" as const,
})

const $submitButton = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  marginTop: spacing?.lg || 16,
})