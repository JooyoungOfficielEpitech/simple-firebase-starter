import { useState, useEffect } from "react"
import { Platform } from "react-native"
import * as ImagePicker from 'expo-image-picker'
import firestore from "@react-native-firebase/firestore"
import { getStorage } from "@react-native-firebase/storage"
import { postService, userService, organizationService } from "@/services/firestore"
import { UserProfile } from "@/types/user"
import { CreatePost, UpdatePost, PostType } from "@/types/post"
import { PostTemplate } from "@/utils/postTemplates"

interface UseCreatePostFormParams {
  postId?: string
  isEdit?: boolean
  onSuccess: (message: string) => void
  onError: (title: string, message: string) => void
  onNavigateBack: () => void
}

export interface FormData {
  title: string
  production: string
  organizationName: string
  rehearsalSchedule: string
  location: string
  description: string
  tags: string
  status: "active" | "closed"
  deadline: string
  roles: Array<{
    name: string
    gender: "male" | "female" | "any"
    ageRange: string
    requirements: string
    count: number
  }>
  auditionDate: string
  auditionLocation: string
  auditionRequirements: string
  auditionResultDate: string
  auditionMethod: "대면" | "화상" | "서류"
  performanceDates: string
  performanceVenue: string
  ticketPrice: string
  targetAudience: string
  genre: "연극" | "뮤지컬" | "창작" | "기타"
  fee: string
  transportation: boolean
  costume: boolean
  portfolio: boolean
  photography: boolean
  meals: boolean
  otherBenefits: string
  contactEmail: string
  contactPhone: string
  applicationMethod: "이메일" | "전화" | "온라인폼" | "방문"
  requiredDocuments: string
}

export const useCreatePostForm = ({
  postId,
  isEdit,
  onSuccess,
  onError,
  onNavigateBack,
}: UseCreatePostFormParams) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(null)
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false)
  const [showAuditionDatePicker, setShowAuditionDatePicker] = useState(false)
  const [showAuditionResultPicker, setShowAuditionResultPicker] = useState(false)
  const [postMode, setPostMode] = useState<PostType>('text')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    production: "",
    organizationName: "",
    rehearsalSchedule: "",
    location: "",
    description: "",
    tags: "",
    status: "active",
    deadline: "",
    roles: [{ name: "", gender: "any", ageRange: "", requirements: "", count: 1 }],
    auditionDate: "",
    auditionLocation: "",
    auditionRequirements: "",
    auditionResultDate: "",
    auditionMethod: "대면",
    performanceDates: "",
    performanceVenue: "",
    ticketPrice: "",
    targetAudience: "",
    genre: "연극",
    fee: "",
    transportation: false,
    costume: false,
    portfolio: false,
    photography: false,
    meals: false,
    otherBenefits: "",
    contactEmail: "",
    contactPhone: "",
    applicationMethod: "이메일",
    requiredDocuments: "",
  })

  // Load user profile and validate organization
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await userService.getUserProfile()
        
        console.log('🔍 [useCreatePostForm] 사용자 프로필 전체 데이터:', {
          uid: profile?.uid,
          userType: profile?.userType,
          organizationId: profile?.organizationId,
          organizationName: profile?.organizationName,
        })

        if (profile?.userType === "organizer" && profile?.organizationId) {
          console.log('🔍 [useCreatePostForm] organizationId 검증 시작:', profile.organizationId)
          
          try {
            const allOrgs = await organizationService.getOrganizations(50)
            console.log('📋 [useCreatePostForm] 전체 단체 목록:', allOrgs.map(org => ({
              id: org.id,
              name: org.name,
              ownerId: org.ownerId
            })))
            
            const myOrgs = allOrgs.filter(org => org.ownerId === profile.uid)
            console.log('🏢 [useCreatePostForm] 내가 소유한 단체:', myOrgs.map(org => ({
              id: org.id,
              name: org.name
            })))
            
            if (myOrgs.length > 0) {
              const correctOrg = myOrgs[0]
              console.log('✅ [useCreatePostForm] 올바른 단체 발견:', correctOrg.id)
              
              if (profile.organizationId !== correctOrg.id) {
                console.log('🔧 [useCreatePostForm] organizationId 수정:', {
                  from: profile.organizationId,
                  to: correctOrg.id
                })
                
                await userService.updateUserProfile({
                  organizationId: correctOrg.id
                })
                
                const updatedProfile = await userService.getUserProfile()
                setUserProfile(updatedProfile)
              } else {
                setUserProfile(profile)
              }
            } else {
              console.warn('⚠️ [useCreatePostForm] 소유한 단체가 없음. 기본 설정 유지')
              setUserProfile(profile)
            }
          } catch (error) {
            console.error('❌ [useCreatePostForm] 단체 조회 실패:', error)
            setUserProfile(profile)
          }
        } else {
          setUserProfile(profile)
        }
        
        if (profile?.organizationName) {
          setFormData(prev => ({
            ...prev,
            organizationName: profile.organizationName,
          }))
        }
      } catch (error) {
        console.error("사용자 프로필 로드 오류:", error)
        onError("오류", "사용자 정보를 불러올 수 없습니다.")
        onNavigateBack()
      }
    }

    loadUserProfile()
  }, [])

  // Load existing post data in edit mode
  useEffect(() => {
    if (isEdit === true && postId) {
      const loadPost = async () => {
        try {
          const post = await postService.getPost(postId)
          if (post) {
            const postType = post.postType || 'text'
            setPostMode(postType)
            
            if (postType === 'images' && post.images && post.images.length > 0) {
              setSelectedImages(post.images)
            }
            
            setFormData({
              title: post.title,
              production: post.production,
              organizationName: post.organizationName,
              rehearsalSchedule: post.rehearsalSchedule,
              location: post.location,
              description: post.description,
              tags: post.tags.join(", "),
              status: post.status,
              deadline: post.deadline || "",
              roles: post.roles || [{ name: "", gender: "any", ageRange: "", requirements: "", count: 1 }],
              auditionDate: post.audition?.date || "",
              auditionLocation: post.audition?.location || "",
              auditionRequirements: post.audition?.requirements?.join(", ") || "",
              auditionResultDate: post.audition?.resultDate || "",
              auditionMethod: post.audition?.method as any || "대면",
              performanceDates: post.performance?.dates?.join(", ") || "",
              performanceVenue: post.performance?.venue || "",
              ticketPrice: post.performance?.ticketPrice || "",
              targetAudience: post.performance?.targetAudience || "",
              genre: post.performance?.genre as any || "연극",
              fee: post.benefits?.fee || "",
              transportation: post.benefits?.transportation || false,
              costume: post.benefits?.costume || false,
              portfolio: post.benefits?.portfolio || false,
              photography: post.benefits?.photography || false,
              meals: post.benefits?.meals || false,
              otherBenefits: post.benefits?.other?.join(", ") || "",
              contactEmail: post.contact?.email || "",
              contactPhone: post.contact?.phone || "",
              applicationMethod: post.contact?.applicationMethod as any || "이메일",
              requiredDocuments: post.contact?.requiredDocuments?.join(", ") || "",
            })
          }
        } catch (error) {
          console.error("게시글 로드 오류:", error)
          onError("오류", "게시글을 불러올 수 없습니다.")
          onNavigateBack()
        }
      }

      loadPost()
    }
  }, [isEdit, postId])

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      onError("오류", "제목을 입력해주세요.")
      return false
    }
    
    if (postMode === 'images') {
      if (selectedImages.length === 0) {
        onError("오류", "최소 1개의 이미지를 선택해주세요.")
        return false
      }
      if (!formData.contactEmail.trim()) {
        onError("오류", "담당자 이메일을 입력해주세요.")
        return false
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.contactEmail)) {
        onError("오류", "올바른 이메일 형식을 입력해주세요.")
        return false
      }
    } else {
      if (!formData.production.trim()) {
        onError("오류", "작품명을 입력해주세요.")
        return false
      }
      if (!formData.organizationName.trim()) {
        onError("오류", "단체명을 입력해주세요.")
        return false
      }
      if (!formData.rehearsalSchedule.trim()) {
        onError("오류", "연습 일정을 입력해주세요.")
        return false
      }
      if (!formData.location.trim()) {
        onError("오류", "장소를 입력해주세요.")
        return false
      }
      if (!formData.description.trim()) {
        onError("오류", "상세 설명을 입력해주세요.")
        return false
      }
      if (!formData.contactEmail.trim()) {
        onError("오류", "담당자 이메일을 입력해주세요.")
        return false
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.contactEmail)) {
        onError("오류", "올바른 이메일 형식을 입력해주세요.")
        return false
      }
    }

    if (!userProfile) {
      onError("오류", "사용자 정보가 없습니다.")
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const roles = formData.roles.filter(role => role.name.trim() !== "")
      const auditionInfo = formData.auditionDate ? {
        date: formData.auditionDate,
        location: formData.auditionLocation,
        requirements: formData.auditionRequirements.split(",").map(req => req.trim()).filter(req => req !== ""),
        resultDate: formData.auditionResultDate,
        method: formData.auditionMethod
      } : undefined
      
      const performanceInfo = formData.performanceDates ? {
        dates: formData.performanceDates.split(",").map(date => date.trim()).filter(date => date !== ""),
        venue: formData.performanceVenue,
        ticketPrice: formData.ticketPrice,
        targetAudience: formData.targetAudience,
        genre: formData.genre
      } : undefined
      
      const benefitsInfo = {
        fee: formData.fee,
        transportation: formData.transportation,
        costume: formData.costume,
        portfolio: formData.portfolio,
        photography: formData.photography,
        meals: formData.meals,
        other: formData.otherBenefits.split(",").map(benefit => benefit.trim()).filter(benefit => benefit !== "")
      }
      
      const contactInfo = {
        email: formData.contactEmail,
        phone: formData.contactPhone,
        applicationMethod: formData.applicationMethod,
        requiredDocuments: formData.requiredDocuments.split(",").map(doc => doc.trim()).filter(doc => doc !== "")
      }

      if (isEdit === true && postId) {
        const updateData: UpdatePost = {
          title: formData.title.trim(),
          production: postMode === 'images' ? (formData.production || "이미지 게시글") : formData.production.trim(),
          organizationName: formData.organizationName.trim(),
          rehearsalSchedule: postMode === 'images' ? (formData.rehearsalSchedule || "상세 문의") : formData.rehearsalSchedule.trim(),
          location: postMode === 'images' ? (formData.location || "상세 문의") : formData.location.trim(),
          description: postMode === 'images' ? (formData.description || "자세한 내용은 이미지를 확인해주세요.") : formData.description.trim(),
          tags,
          status: formData.status,
          deadline: formData.deadline,
          postType: postMode,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          ...(roles.length > 0 && { roles }),
          ...(auditionInfo && Object.keys(auditionInfo).length > 0 && { audition: auditionInfo }),
          ...(performanceInfo && Object.keys(performanceInfo).length > 0 && { performance: performanceInfo }),
          ...(benefitsInfo && Object.keys(benefitsInfo).length > 0 && { benefits: benefitsInfo }),
          ...(contactInfo && Object.keys(contactInfo).length > 0 && { contact: contactInfo }),
          ...(postMode === 'images' && selectedImages.length > 0 ? { images: selectedImages } : {}),
        }

        await postService.updatePost(postId, updateData)
        onSuccess("게시글이 수정되었습니다.")
      } else {
        const createData: CreatePost = {
          title: formData.title.trim(),
          production: postMode === 'images' ? (formData.production || "이미지 게시글") : formData.production.trim(),
          organizationName: formData.organizationName.trim(),
          rehearsalSchedule: postMode === 'images' ? (formData.rehearsalSchedule || "상세 문의") : formData.rehearsalSchedule.trim(),
          location: postMode === 'images' ? (formData.location || "상세 문의") : formData.location.trim(),
          description: postMode === 'images' ? (formData.description || "자세한 내용은 이미지를 확인해주세요.") : formData.description.trim(),
          tags,
          status: formData.status,
          deadline: formData.deadline,
          postType: postMode,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
          ...(roles.length > 0 && { roles }),
          ...(auditionInfo && Object.keys(auditionInfo).length > 0 && { audition: auditionInfo }),
          ...(performanceInfo && Object.keys(performanceInfo).length > 0 && { performance: performanceInfo }),
          ...(benefitsInfo && Object.keys(benefitsInfo).length > 0 && { benefits: benefitsInfo }),
          ...(contactInfo && Object.keys(contactInfo).length > 0 && { contact: contactInfo }),
          ...(postMode === 'images' && selectedImages.length > 0 && { images: selectedImages }),
        }

        console.log('📝 [useCreatePostForm] 게시글 생성 시작')
        
        let validOrganizationId = userProfile!.organizationId
        
        try {
          const allOrgs = await organizationService.getOrganizations(50)
          const myOrgs = allOrgs.filter(org => org.ownerId === userProfile!.uid)
          
          if (myOrgs.length > 0) {
            validOrganizationId = myOrgs[0].id
            console.log('✅ [useCreatePostForm] 유효한 단체 ID 사용:', validOrganizationId)
          } else {
            validOrganizationId = userProfile!.uid
            console.warn('⚠️ [useCreatePostForm] 소유한 단체가 없어서 사용자 ID 사용:', validOrganizationId)
          }
        } catch (error) {
          console.error('❌ [useCreatePostForm] 단체 조회 실패. 프로필의 organizationId 사용:', error)
          validOrganizationId = userProfile!.organizationId || userProfile!.uid
        }

        console.log('📝 [useCreatePostForm] 최종 사용할 organizationId:', validOrganizationId)
        await postService.createPost(createData, userProfile!.name, validOrganizationId)
        onSuccess("게시글이 작성되었습니다.")
      }

      onNavigateBack()
    } catch (error) {
      console.error("게시글 저장 오류:", error)
      onError("오류", "게시글 저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        onError("권한 필요", "이미지 선택을 위해 갤러리 접근 권한이 필요합니다.")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
        exif: false,
      })

      if (!result.canceled && result.assets) {
        setUploadingImages(true)
        
        try {
          const uploadedUrls: string[] = []
          
          for (const asset of result.assets) {
            const mimeType = asset.mimeType || 'image/jpeg'
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if (!allowedTypes.includes(mimeType)) {
              throw new Error(`지원하지 않는 파일 형식입니다: ${mimeType}`)
            }
            
            const maxSize = 5 * 1024 * 1024
            if (asset.fileSize && asset.fileSize > maxSize) {
              throw new Error(`파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.`)
            }
            
            const timestamp = Date.now()
            const randomId = Math.random().toString(36).substring(7)
            const fileExtension = mimeType === 'image/png' ? 'png' : 
                                 mimeType === 'image/webp' ? 'webp' : 'jpg'
            const safeFileName = `${timestamp}_${randomId}.${fileExtension}`
            
            const imageRef = getStorage().ref(`posts/${safeFileName}`)
            
            const metadata = {
              contentType: mimeType,
              customMetadata: {
                uploadedBy: userProfile!.uid,
                uploadedAt: new Date().toISOString(),
                originalFileName: asset.fileName || 'unknown',
                source: 'create-post-screen'
              }
            }
            
            const task = imageRef.putFile(asset.uri, metadata)
            await task
            
            const downloadUrl = await imageRef.getDownloadURL()
            uploadedUrls.push(downloadUrl)
          }
          
          setSelectedImages(prev => [...prev, ...uploadedUrls])
          onSuccess(`${uploadedUrls.length}개의 이미지가 업로드되었습니다!`)
        } catch (error) {
          console.error("이미지 업로드 오류:", error)
          
          let errorMessage = "이미지 업로드 중 오류가 발생했습니다."
          if (error.code === 'storage/object-not-found') {
            errorMessage = "Firebase Storage 버킷을 찾을 수 없습니다."
          } else if (error.code === 'storage/unauthorized') {
            errorMessage = "Firebase Storage 업로드 권한이 없습니다. 로그인 상태를 확인해주세요."
          } else if (error.code === 'storage/unknown') {
            errorMessage = "Firebase Storage 연결 오류가 발생했습니다."
          } else if (error.code === 'storage/invalid-format') {
            errorMessage = "지원하지 않는 이미지 형식입니다."
          }
          
          onError("업로드 실패", errorMessage)
        } finally {
          setUploadingImages(false)
        }
      }
    } catch (error) {
      console.error("이미지 선택 오류:", error)
      onError("오류", "이미지 선택 중 오류가 발생했습니다.")
    }
  }

  const removeImage = async (index: number) => {
    const imageToRemove = selectedImages[index]
    
    if (isEdit && imageToRemove.startsWith('https://firebasestorage.googleapis.com')) {
      try {
        const url = new URL(imageToRemove)
        let filePath = ''
        
        if (url.pathname.includes('/o/')) {
          const pathStart = url.pathname.indexOf('/o/') + 3
          const pathEnd = url.searchParams.has('alt') ? url.pathname.length : url.pathname.indexOf('?')
          filePath = decodeURIComponent(url.pathname.substring(pathStart, pathEnd === -1 ? url.pathname.length : pathEnd))
        } else {
          filePath = decodeURIComponent(url.pathname.substring(1))
        }
        
        if (filePath) {
          await getStorage().ref(filePath).delete()
          console.log('🗑️ [useCreatePostForm] Firebase Storage에서 이미지 삭제 완료:', filePath)
        }
      } catch (error) {
        console.error('⚠️ [useCreatePostForm] Firebase Storage 이미지 삭제 실패:', error)
      }
    }
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const applyTemplate = (template: PostTemplate) => {
    setFormData(prev => ({
      ...prev,
      title: template.template.title,
      production: template.template.production,
      description: template.template.description,
      deadline: "",
      roles: template.template.roles,
      auditionDate: template.template.auditionDate,
      auditionLocation: template.template.auditionLocation,
      auditionRequirements: template.template.auditionRequirements,
      auditionResultDate: template.template.auditionResultDate,
      auditionMethod: template.template.auditionMethod,
      performanceDates: template.template.performanceDates,
      performanceVenue: template.template.performanceVenue,
      ticketPrice: template.template.ticketPrice,
      targetAudience: template.template.targetAudience,
      genre: template.template.genre,
      fee: template.template.fee,
      transportation: template.template.transportation,
      costume: template.template.costume,
      portfolio: template.template.portfolio,
      photography: template.template.photography,
      meals: template.template.meals,
      otherBenefits: template.template.otherBenefits,
      contactEmail: template.template.contactEmail,
      contactPhone: template.template.contactPhone,
      applicationMethod: template.template.applicationMethod,
      requiredDocuments: template.template.requiredDocuments,
      tags: template.template.tags,
    }))
    
    setSelectedTemplate(template)
    setShowTemplateModal(false)
  }

  const calculateCompleteness = (): number => {
    const requiredFields = [
      formData.title,
      formData.production,
      formData.organizationName,
      formData.rehearsalSchedule,
      formData.location,
      formData.description,
      formData.contactEmail
    ]
    
    const optionalFields = [
      formData.deadline,
      formData.roles[0]?.name,
      formData.auditionDate,
      formData.fee,
      formData.tags
    ]
    
    const filledRequired = requiredFields.filter(field => field?.trim()).length
    const filledOptional = optionalFields.filter(field => field?.trim()).length
    
    const requiredScore = (filledRequired / requiredFields.length) * 70
    const optionalScore = (filledOptional / optionalFields.length) * 30
    
    return Math.round(requiredScore + optionalScore)
  }

  return {
    // State
    userProfile,
    loading,
    showTemplateModal,
    selectedTemplate,
    showDeadlinePicker,
    showAuditionDatePicker,
    showAuditionResultPicker,
    postMode,
    selectedImages,
    uploadingImages,
    formData,
    
    // Setters
    setShowTemplateModal,
    setSelectedTemplate,
    setShowDeadlinePicker,
    setShowAuditionDatePicker,
    setShowAuditionResultPicker,
    setPostMode,
    setFormData,
    
    // Actions
    updateFormData,
    handleSave,
    pickImages,
    removeImage,
    applyTemplate,
    calculateCompleteness,
  }
}
