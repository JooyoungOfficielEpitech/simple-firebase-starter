import React, { useState, useEffect } from "react"
import { View, Alert, TouchableOpacity } from "react-native"
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

  const { organizationId, isEdit = false, isOrganizerConversion = false } = route.params || {}

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
    // 소셜 미디어 링크
    instagramUrl: "",
    youtubeUrl: "",
    facebookUrl: "",
    twitterUrl: "",
    // 추가 상세 정보
    foundingStory: "",
    vision: "",
    specialties: [],
    pastWorks: [],
    facilities: "",
    recruitmentInfo: "",
  })

  const [tagInput, setTagInput] = useState("")
  const [specialtyInput, setSpecialtyInput] = useState("")
  const [pastWorkInput, setPastWorkInput] = useState("")
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
          // 소셜 미디어 링크
          instagramUrl: organization.instagramUrl || "",
          youtubeUrl: organization.youtubeUrl || "",
          facebookUrl: organization.facebookUrl || "",
          twitterUrl: organization.twitterUrl || "",
          // 추가 상세 정보
          foundingStory: organization.foundingStory || "",
          vision: organization.vision || "",
          specialties: organization.specialties || [],
          pastWorks: organization.pastWorks || [],
          facilities: organization.facilities || "",
          recruitmentInfo: organization.recruitmentInfo || "",
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
        // 기존 단체 수정
        await organizationService.updateOrganization(organizationId, formData)
        Alert.alert("성공", "단체 정보가 수정되었습니다.")
      } else if (isOrganizerConversion) {
        // 운영자 전환과 동시에 단체 생성
        const result = await userService.convertToOrganizerWithOrganization({
          name: formData.name,
          description: formData.description,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          website: formData.website,
          location: formData.location,
          establishedDate: formData.establishedDate,
          tags: formData.tags,
          // 소셜 미디어 링크
          instagramUrl: formData.instagramUrl,
          youtubeUrl: formData.youtubeUrl,
          facebookUrl: formData.facebookUrl,
          twitterUrl: formData.twitterUrl,
          // 추가 상세 정보
          foundingStory: formData.foundingStory,
          vision: formData.vision,
          specialties: formData.specialties,
          pastWorks: formData.pastWorks,
          facilities: formData.facilities,
          recruitmentInfo: formData.recruitmentInfo,
        })

        if (result.success) {
          Alert.alert("성공", "운영자 계정으로 전환되고 단체가 등록되었습니다.")
        } else {
          Alert.alert("오류", result.error || "운영자 전환에 실패했습니다.")
          return
        }
      } else {
        // 일반 단체 등록 (이제 제거 예정)
        await organizationService.createOrganization(formData, userProfile.name)
        Alert.alert("성공", "단체가 등록되었습니다.")
      }

      navigation.goBack()
    } catch (error) {
      console.error("단체 등록/수정 오류:", error)
      const errorMessage = isOrganizerConversion 
        ? "운영자 전환에 실패했습니다."
        : isEdit 
          ? "단체 수정에 실패했습니다." 
          : "단체 등록에 실패했습니다."
      Alert.alert("오류", errorMessage)
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

  const handleAddSpecialty = () => {
    console.log('handleAddSpecialty called, input:', specialtyInput)
    const specialty = specialtyInput.trim()
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }))
      setSpecialtyInput("")
      console.log('Specialty added:', specialty)
    } else {
      console.log('Specialty not added - empty or duplicate:', specialty)
    }
  }

  const handleRemoveSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }))
  }

  const handleAddPastWork = () => {
    const work = pastWorkInput.trim()
    if (work && !formData.pastWorks.includes(work)) {
      setFormData(prev => ({
        ...prev,
        pastWorks: [...prev.pastWorks, work]
      }))
      setPastWorkInput("")
    }
  }

  const handleRemovePastWork = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pastWorks: prev.pastWorks.filter((_, i) => i !== index)
    }))
  }


  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader 
          title={isEdit ? "단체 수정" : isOrganizerConversion ? "운영자 계정 전환" : "단체 등록"}
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
        title={isEdit ? "단체 수정" : isOrganizerConversion ? "운영자 계정 전환" : "단체 등록"}
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

          {/* 소셜 미디어 링크 섹션 */}
          <Text text="소셜 미디어" style={themed($sectionLabel)} />
          
          <TextField
            label="인스타그램"
            value={formData.instagramUrl || ""}
            onChangeText={(text) => setFormData(prev => ({ ...prev, instagramUrl: text }))}
            placeholder="https://instagram.com/your_theater"
            keyboardType="url"
            autoCapitalize="none"
          />

          <TextField
            label="유튜브"
            value={formData.youtubeUrl || ""}
            onChangeText={(text) => setFormData(prev => ({ ...prev, youtubeUrl: text }))}
            placeholder="https://youtube.com/@your_theater"
            keyboardType="url"
            autoCapitalize="none"
          />

          <TextField
            label="페이스북"
            value={formData.facebookUrl || ""}
            onChangeText={(text) => setFormData(prev => ({ ...prev, facebookUrl: text }))}
            placeholder="https://facebook.com/your_theater"
            keyboardType="url"
            autoCapitalize="none"
          />

          <TextField
            label="트위터"
            value={formData.twitterUrl || ""}
            onChangeText={(text) => setFormData(prev => ({ ...prev, twitterUrl: text }))}
            placeholder="https://twitter.com/your_theater"
            keyboardType="url"
            autoCapitalize="none"
          />

          {/* 상세 정보 섹션 */}
          <Text text="상세 정보" style={themed($sectionLabel)} />

          <TextField
            label="창립 스토리"
            value={formData.foundingStory || ""}
            onChangeText={(text) => setFormData(prev => ({ ...prev, foundingStory: text }))}
            placeholder="단체가 어떻게 시작되었나요?"
            multiline
            numberOfLines={4}
          />

          <TextField
            label="비전과 목표"
            value={formData.vision || ""}
            onChangeText={(text) => setFormData(prev => ({ ...prev, vision: text }))}
            placeholder="단체의 비전과 목표를 입력해주세요"
            multiline
            numberOfLines={3}
          />

          {/* 전문 분야 입력 */}
          <View style={themed($tagSection)}>
            <Text text="전문 분야" style={themed($tagLabel)} />
            <View style={themed($tagInputContainer)}>
              <TextField
                value={specialtyInput}
                onChangeText={(text) => {
                  console.log('Specialty input changed:', text)
                  setSpecialtyInput(text)
                }}
                placeholder="뮤지컬, 연극, 드라마 등"
                containerStyle={themed($tagInput)}
                onSubmitEditing={handleAddSpecialty}
                returnKeyType="done"
                blurOnSubmit={true}
              />
              <Button
                text="추가"
                onPress={handleAddSpecialty}
                style={themed($addTagButton)}
                textStyle={themed($addTagButtonText)}
              />
            </View>
            
            {formData.specialties.length > 0 && (
              <View style={themed($tagsContainer)}>
                {formData.specialties.map((specialty, index) => (
                  <View key={index} style={themed($tag)}>
                    <Text text={specialty} style={themed($tagText)} />
                    <TouchableOpacity
                      onPress={() => handleRemoveSpecialty(index)}
                      style={themed($removeTagButton)}
                      activeOpacity={0.6}
                    >
                      <Text text="×" style={themed($removeTagText)} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 대표 작품 입력 */}
          <View style={themed($tagSection)}>
            <Text text="대표 작품" style={themed($tagLabel)} />
            <View style={themed($tagInputContainer)}>
              <TextField
                value={pastWorkInput}
                onChangeText={setPastWorkInput}
                placeholder="대표 작품명을 입력해주세요"
                containerStyle={themed($tagInput)}
                onSubmitEditing={handleAddPastWork}
                returnKeyType="done"
                blurOnSubmit={true}
              />
              <Button
                text="추가"
                onPress={handleAddPastWork}
                style={themed($addTagButton)}
                textStyle={themed($addTagButtonText)}
              />
            </View>
            
            {formData.pastWorks.length > 0 && (
              <View style={themed($tagsContainer)}>
                {formData.pastWorks.map((work, index) => (
                  <View key={index} style={themed($tag)}>
                    <Text text={work} style={themed($tagText)} />
                    <TouchableOpacity
                      onPress={() => handleRemovePastWork(index)}
                      style={themed($removeTagButton)}
                      activeOpacity={0.6}
                    >
                      <Text text="×" style={themed($removeTagText)} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TextField
            label="보유 시설"
            value={formData.facilities || ""}
            onChangeText={(text) => setFormData(prev => ({ ...prev, facilities: text }))}
            placeholder="연습실, 소극장, 의상실 등"
            multiline
            numberOfLines={3}
          />

          <TextField
            label="모집 안내"
            value={formData.recruitmentInfo || ""}
            onChangeText={(text) => setFormData(prev => ({ ...prev, recruitmentInfo: text }))}
            placeholder="배우/스태프 모집 시 참고할 정보"
            multiline
            numberOfLines={3}
          />

          {/* 태그 입력 */}
          <View style={themed($tagSection)}>
            <Text text="태그" style={themed($tagLabel)} />
            <View style={themed($tagInputContainer)}>
              <TextField
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="태그를 입력하고 추가 버튼을 눌러주세요"
                containerStyle={themed($tagInput)}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
                blurOnSubmit={true}
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
                    <TouchableOpacity
                      onPress={() => handleRemoveTag(index)}
                      style={themed($removeTagButton)}
                      activeOpacity={0.6}
                    >
                      <Text text="×" style={themed($removeTagText)} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 제출 버튼 */}
          <Button
            text={isEdit ? "수정하기" : isOrganizerConversion ? "운영자로 전환하기" : "등록하기"}
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

const $sectionLabel = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "600" as const,
  marginTop: spacing?.lg || 16,
  marginBottom: spacing?.sm || 8,
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

const $tagInput = ({ spacing }) => ({
  flex: 1,
  marginRight: spacing?.sm || 8,
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
  marginRight: 6,
})

const $removeTagButton = ({ colors }) => ({
  width: 18,
  height: 18,
  borderRadius: 9,
  backgroundColor: colors.palette.neutral400,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginLeft: 6,
  opacity: 0.8,
})

const $removeTagText = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 12,
  fontWeight: "bold" as const,
  lineHeight: 12,
  textAlign: "center" as const,
})

const $submitButton = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  marginTop: spacing?.lg || 16,
})