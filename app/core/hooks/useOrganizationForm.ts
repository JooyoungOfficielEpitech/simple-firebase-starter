import { useState, useEffect } from "react"
import { organizationService, userService } from "@/core/services/firestore"
import { CreateOrganization } from "@/core/types/organization"
import { UserProfile } from "@/core/types/user"

interface UseOrganizationFormProps {
  organizationId?: string
  isEdit?: boolean
  isOrganizerConversion?: boolean
  onSuccess?: () => void
  onError?: (title: string, message: string) => void
}

export const useOrganizationForm = ({
  organizationId,
  isEdit = false,
  isOrganizerConversion = false,
  onSuccess,
  onError,
}: UseOrganizationFormProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateOrganization>({
    name: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    location: "",
    establishedDate: "",
    tags: [],
    instagramUrl: "",
    youtubeUrl: "",
    facebookUrl: "",
    twitterUrl: "",
    foundingStory: "",
    vision: "",
    specialties: [],
    pastWorks: [],
    facilities: "",
    recruitmentInfo: "",
  })

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
          instagramUrl: organization.instagramUrl || "",
          youtubeUrl: organization.youtubeUrl || "",
          facebookUrl: organization.facebookUrl || "",
          twitterUrl: organization.twitterUrl || "",
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
      onError?.("오류", "단체 정보를 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!formData.name.trim()) {
      errors.push("단체명을 입력해주세요")
    }
    if (!formData.description.trim()) {
      errors.push("단체 소개를 입력해주세요")
    }
    if (!formData.contactEmail.trim()) {
      errors.push("연락처 이메일을 입력해주세요")
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errors.push("올바른 이메일 형식이 아닙니다")
    }
    if (!formData.location.trim()) {
      errors.push("소재지를 입력해주세요")
    }

    return { isValid: errors.length === 0, errors }
  }

  const handleSubmit = async () => {
    const { isValid, errors } = validateForm()
    
    if (!isValid) {
      const errorText = errors.join('\n')
      onError?.("입력 확인", "다음 항목을 확인해주세요:\n\n" + errorText)
      return false
    }

    if (!userProfile?.name) {
      onError?.("오류", "사용자 프로필 정보가 필요합니다.")
      return false
    }

    try {
      if (isEdit && organizationId) {
        await organizationService.updateOrganization(organizationId, formData)
        onSuccess?.()
        return true
      } else if (isOrganizerConversion) {
        const result = await userService.convertToOrganizerWithOrganization(formData)
        if (result.success) {
          onSuccess?.()
          return true
        } else {
          onError?.("오류", result.error || "운영자 전환에 실패했습니다.")
          return false
        }
      } else {
        await organizationService.createOrganization(formData, userProfile.name)
        onSuccess?.()
        return true
      }
    } catch (error) {
      console.error("단체 등록/수정 오류:", error)
      const errorMessage = isOrganizerConversion 
        ? "운영자 전환에 실패했습니다."
        : isEdit 
          ? "단체 수정에 실패했습니다." 
          : "단체 등록에 실패했습니다."
      onError?.("오류", errorMessage)
      return false
    }
  }

  const updateFormData = (updates: Partial<CreateOrganization>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addArrayItem = (field: keyof Pick<CreateOrganization, 'tags' | 'specialties' | 'pastWorks'>, item: string) => {
    if (item.trim() && !formData[field].includes(item.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], item.trim()]
      }))
      return true
    }
    return false
  }

  const removeArrayItem = (field: keyof Pick<CreateOrganization, 'tags' | 'specialties' | 'pastWorks'>, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  return {
    formData,
    loading,
    userProfile,
    updateFormData,
    addArrayItem,
    removeArrayItem,
    handleSubmit,
    validateForm,
  }
}
