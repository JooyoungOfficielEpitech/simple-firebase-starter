import React, { useEffect, useState } from "react"
import { View, ScrollView, TouchableOpacity, TextInput, Modal, Switch, Platform, Image } from "react-native"
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { AlertModal } from "@/components/AlertModal"
import { Dropdown, type DropdownOption } from "@/components/Dropdown"
import { postService, userService, organizationService } from "@/services/firestore"
import { getStorage } from "@react-native-firebase/storage"
import firestore from "@react-native-firebase/firestore"
import { useAppTheme } from "@/theme/context"
import { useAlert } from "@/hooks/useAlert"
import { CreatePost, UpdatePost, PostType } from "@/types/post"
import { UserProfile } from "@/types/user"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"
import { POST_TEMPLATES, PostTemplate } from "@/utils/postTemplates"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>
type RoutePropType = RouteProp<BulletinBoardStackParamList, "CreatePost">

export const CreatePostScreen = () => {
  useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RoutePropType>()
  const { postId, isEdit } = route.params || {}
  
  const {
    themed,
    theme: { colors, spacing, typography },
  } = useAppTheme()

  const { alertState, alert, hideAlert } = useAlert()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(null)
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false)
  const [showAuditionDatePicker, setShowAuditionDatePicker] = useState(false)
  const [showAuditionResultPicker, setShowAuditionResultPicker] = useState(false)
  const [showPerformanceDatePicker, setShowPerformanceDatePicker] = useState(false)
  
  // 모드 관련 상태
  const [postMode, setPostMode] = useState<PostType>('text')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    production: "",
    organizationName: "",
    rehearsalSchedule: "",
    location: "",
    description: "",
    tags: "",
    status: "active" as "active" | "closed",
    deadline: "",
    // 역할 모집 정보
    roles: [{ name: "", gender: "any" as "male" | "female" | "any", ageRange: "", requirements: "", count: 1 }],
    // 오디션 정보
    auditionDate: "",
    auditionLocation: "",
    auditionRequirements: "",
    auditionResultDate: "",
    auditionMethod: "대면" as "대면" | "화상" | "서류",
    // 공연 정보
    performanceDates: "",
    performanceVenue: "",
    ticketPrice: "",
    targetAudience: "",
    genre: "연극" as "연극" | "뮤지컬" | "창작" | "기타",
    // 혜택 정보
    fee: "",
    transportation: false,
    costume: false,
    portfolio: false,
    photography: false,
    meals: false,
    otherBenefits: "",
    // 연락처 정보
    contactEmail: "",
    contactPhone: "",
    applicationMethod: "이메일" as "이메일" | "전화" | "온라인폼" | "방문",
    requiredDocuments: "",
  })

  useEffect(() => {
    // 사용자 프로필 로드 및 organizationId 검증
    const loadUserProfile = async () => {
      try {
        const profile = await userService.getUserProfile()
        
        console.log('🔍 [CreatePostScreen] 사용자 프로필 전체 데이터:', {
          uid: profile?.uid,
          userType: profile?.userType,
          organizationId: profile?.organizationId,
          organizationName: profile?.organizationName,
          hasBeenOrganizer: profile?.hasBeenOrganizer,
          previousOrganizationName: profile?.previousOrganizationName
        })

        // organizationId 검증 및 수정
        if (profile?.userType === "organizer" && profile?.organizationId) {
          console.log('🔍 [CreatePostScreen] organizationId 검증 시작:', profile.organizationId)
          
          // 먼저 모든 단체 목록을 조회해서 실제 어떤 단체들이 있는지 확인
          try {
            const allOrgs = await organizationService.getOrganizations(50)
            console.log('📋 [CreatePostScreen] 전체 단체 목록:', allOrgs.map(org => ({
              id: org.id,
              name: org.name,
              ownerId: org.ownerId
            })))
            
            // 현재 사용자가 소유한 단체 찾기
            const myOrgs = allOrgs.filter(org => org.ownerId === profile.uid)
            console.log('🏢 [CreatePostScreen] 내가 소유한 단체:', myOrgs.map(org => ({
              id: org.id,
              name: org.name
            })))
            
            if (myOrgs.length > 0) {
              const correctOrg = myOrgs[0] // 첫 번째 단체 사용
              console.log('✅ [CreatePostScreen] 올바른 단체 발견:', correctOrg.id)
              
              if (profile.organizationId !== correctOrg.id) {
                console.log('🔧 [CreatePostScreen] organizationId 수정:', {
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
              console.warn('⚠️ [CreatePostScreen] 소유한 단체가 없음. 기본 설정 유지')
              setUserProfile(profile)
            }
            
          } catch (error) {
            console.error('❌ [CreatePostScreen] 단체 조회 실패:', error)
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
        alert("오류", "사용자 정보를 불러올 수 없습니다.")
        navigation.goBack()
      }
    }

    loadUserProfile()

    // 수정 모드인 경우 기존 게시글 데이터 로드
    if (isEdit === true && postId) {
      const loadPost = async () => {
        try {
          const post = await postService.getPost(postId)
          if (post) {
            // 게시글 타입에 따라 모드 자동 설정
            const postType = post.postType || 'text'
            setPostMode(postType)
            
            // 이미지 모드인 경우 기존 이미지 로드
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
              // 역할 정보 로드
              roles: post.roles || [{ name: "", gender: "any", ageRange: "", requirements: "", count: 1 }],
              // 오디션 정보 로드
              auditionDate: post.audition?.date || "",
              auditionLocation: post.audition?.location || "",
              auditionRequirements: post.audition?.requirements?.join(", ") || "",
              auditionResultDate: post.audition?.resultDate || "",
              auditionMethod: post.audition?.method as any || "대면",
              // 공연 정보 로드
              performanceDates: post.performance?.dates?.join(", ") || "",
              performanceVenue: post.performance?.venue || "",
              ticketPrice: post.performance?.ticketPrice || "",
              targetAudience: post.performance?.targetAudience || "",
              genre: post.performance?.genre as any || "연극",
              // 혜택 정보 로드
              fee: post.benefits?.fee || "",
              transportation: post.benefits?.transportation || false,
              costume: post.benefits?.costume || false,
              portfolio: post.benefits?.portfolio || false,
              photography: post.benefits?.photography || false,
              meals: post.benefits?.meals || false,
              otherBenefits: post.benefits?.other?.join(", ") || "",
              // 연락처 정보 로드
              contactEmail: post.contact?.email || "",
              contactPhone: post.contact?.phone || "",
              applicationMethod: post.contact?.applicationMethod as any || "이메일",
              requiredDocuments: post.contact?.requiredDocuments?.join(", ") || "",
            })
          }
        } catch (error) {
          console.error("게시글 로드 오류:", error)
          alert("오류", "게시글을 불러올 수 없습니다.")
          navigation.goBack()
        }
      }

      loadPost()
    }
  }, [isEdit, postId])

  const handleSave = async () => {
    // 유효성 검증
    if (!formData.title.trim()) {
      alert("오류", "제목을 입력해주세요.")
      return
    }
    
    // Images 모드인 경우 간소화된 검증
    if (postMode === 'images') {
      if (selectedImages.length === 0) {
        alert("오류", "최소 1개의 이미지를 선택해주세요.")
        return
      }
      if (!formData.contactEmail.trim()) {
        alert("오류", "담당자 이메일을 입력해주세요.")
        return
      }
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.contactEmail)) {
        alert("오류", "올바른 이메일 형식을 입력해주세요.")
        return
      }
    } else {
      // Text 모드인 경우 기존 검증
      if (!formData.production.trim()) {
        alert("오류", "작품명을 입력해주세요.")
        return
      }
      if (!formData.organizationName.trim()) {
        alert("오류", "단체명을 입력해주세요.")
        return
      }
      if (!formData.rehearsalSchedule.trim()) {
        alert("오류", "연습 일정을 입력해주세요.")
        return
      }
      if (!formData.location.trim()) {
        alert("오류", "장소를 입력해주세요.")
        return
      }
      if (!formData.description.trim()) {
        alert("오류", "상세 설명을 입력해주세요.")
        return
      }
      if (!formData.contactEmail.trim()) {
        alert("오류", "담당자 이메일을 입력해주세요.")
        return
      }
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.contactEmail)) {
        alert("오류", "올바른 이메일 형식을 입력해주세요.")
        return
      }
    }

    if (!userProfile) {
      alert("오류", "사용자 정보가 없습니다.")
      return
    }

    setLoading(true)

    try {
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      // 새로운 데이터 구조 생성
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
        // 수정 모드
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
          // 조건부로 필드 추가 (undefined 방지)
          ...(roles.length > 0 && { roles }),
          ...(auditionInfo && Object.keys(auditionInfo).length > 0 && { audition: auditionInfo }),
          ...(performanceInfo && Object.keys(performanceInfo).length > 0 && { performance: performanceInfo }),
          ...(benefitsInfo && Object.keys(benefitsInfo).length > 0 && { benefits: benefitsInfo }),
          ...(contactInfo && Object.keys(contactInfo).length > 0 && { contact: contactInfo }),
          // 이미지 필드 처리
          ...(postMode === 'images' && selectedImages.length > 0 ? { images: selectedImages } : {}),
        }

        await postService.updatePost(postId, updateData)
        alert("성공", "게시글이 수정되었습니다.")
      } else {
        // 생성 모드
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
          // 조건부로 필드 추가 (undefined 방지)
          ...(roles.length > 0 && { roles }),
          ...(auditionInfo && Object.keys(auditionInfo).length > 0 && { audition: auditionInfo }),
          ...(performanceInfo && Object.keys(performanceInfo).length > 0 && { performance: performanceInfo }),
          ...(benefitsInfo && Object.keys(benefitsInfo).length > 0 && { benefits: benefitsInfo }),
          ...(contactInfo && Object.keys(contactInfo).length > 0 && { contact: contactInfo }),
          // 이미지 모드인 경우에만 images 필드 추가
          ...(postMode === 'images' && selectedImages.length > 0 && { images: selectedImages }),
        }

        console.log('📝 [CreatePostScreen] 게시글 생성 시작:', {
          userProfile: {
            organizationId: userProfile.organizationId,
            organizationName: userProfile.organizationName,
            name: userProfile.name,
            uid: userProfile.uid
          },
          createData
        })
        
        // 게시글 생성 직전에 한 번 더 상태 확인
        console.log('🔍 [CreatePostScreen] 게시글 생성 직전 최종 상태:', {
          userId: userProfile.uid,
          organizationId: userProfile.organizationId,
          organizationName: userProfile.organizationName
        })
        
        // 실제 존재하는 단체 중에서 내가 소유한 것 찾기
        let validOrganizationId = userProfile.organizationId
        
        try {
          const allOrgs = await organizationService.getOrganizations(50)
          const myOrgs = allOrgs.filter(org => org.ownerId === userProfile.uid)
          
          console.log('📋 [CreatePostScreen] 게시글 생성 시 내 단체 목록:', myOrgs.map(org => ({
            id: org.id,
            name: org.name,
            activePostCount: org.activePostCount
          })))
          
          if (myOrgs.length > 0) {
            validOrganizationId = myOrgs[0].id
            console.log('✅ [CreatePostScreen] 유효한 단체 ID 사용:', validOrganizationId)
          } else {
            validOrganizationId = userProfile.uid
            console.warn('⚠️ [CreatePostScreen] 소유한 단체가 없어서 사용자 ID 사용:', validOrganizationId)
          }
        } catch (error) {
          console.error('❌ [CreatePostScreen] 단체 조회 실패. 프로필의 organizationId 사용:', error)
          validOrganizationId = userProfile.organizationId || userProfile.uid
        }

        console.log('📝 [CreatePostScreen] 최종 사용할 organizationId:', validOrganizationId)
        await postService.createPost(createData, userProfile.name, validOrganizationId)
        alert("성공", "게시글이 작성되었습니다.")
      }

      navigation.goBack()
    } catch (error) {
      console.error("게시글 저장 오류:", error)
      alert("오류", "게시글 저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // 이미지 선택 기능
  const pickImages = async () => {
    try {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        alert("권한 필요", "이미지 선택을 위해 갤러리 접근 권한이 필요합니다.")
        return
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
        exif: false,
      })

      if (!result.canceled && result.assets) {
        setUploadingImages(true)
        
        try {
          const uploadedUrls: string[] = []
          
          console.log("Firebase Storage 업로드 시작...")
          
          for (const asset of result.assets) {
            console.log("이미지 업로드 시작:", asset.uri)
            
            // 🔒 파일 타입 검증 (클라이언트 사이드)
            // ImagePicker에서 asset.type은 'image' | 'video' 형태이므로 mimeType 사용
            const mimeType = asset.mimeType || 'image/jpeg'
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if (!allowedTypes.includes(mimeType)) {
              throw new Error(`지원하지 않는 파일 형식입니다: ${mimeType}`)
            }
            
            // 🔒 파일 크기 검증 (5MB 제한)
            const maxSize = 5 * 1024 * 1024 // 5MB
            if (asset.fileSize && asset.fileSize > maxSize) {
              throw new Error(`파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.`)
            }
            
            // 🔒 안전한 파일명 생성 (영문, 숫자, 하이픈, 언더스코어만)
            const timestamp = Date.now()
            const randomId = Math.random().toString(36).substring(7)
            const fileExtension = mimeType === 'image/png' ? 'png' : 
                                 mimeType === 'image/webp' ? 'webp' : 'jpg'
            const safeFileName = `${timestamp}_${randomId}.${fileExtension}`
            
            // Firebase Storage 참조 생성
            const imageRef = getStorage().ref(`posts/${safeFileName}`)
            
            console.log("Storage reference 경로:", imageRef.fullPath)
            console.log("파일 타입:", mimeType, "→", fileExtension)
            
            // 🔒 업로드 메타데이터 설정 (보안 규칙에서 활용)
            const metadata = {
              contentType: mimeType,
              customMetadata: {
                uploadedBy: userProfile.uid,
                uploadedAt: new Date().toISOString(),
                originalFileName: asset.fileName || 'unknown',
                source: 'create-post-screen'
              }
            }
            
            // 파일 업로드
            console.log("파일 업로드 중...")
            const task = imageRef.putFile(asset.uri, metadata)
            
            // 업로드 완료 대기
            await task
            console.log("파일 업로드 완료")
            
            // 다운로드 URL 가져오기
            const downloadUrl = await imageRef.getDownloadURL()
            console.log("다운로드 URL 획득:", downloadUrl)
            
            uploadedUrls.push(downloadUrl)
          }
          
          setSelectedImages(prev => [...prev, ...uploadedUrls])
          alert("성공", `${uploadedUrls.length}개의 이미지가 Firebase Storage에 업로드되었습니다!`)
        } catch (error) {
          console.error("이미지 업로드 오류:", error)
          
          // 구체적인 오류 메시지 제공
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
          
          alert("업로드 실패", errorMessage)
        } finally {
          setUploadingImages(false)
        }
      }
    } catch (error) {
      console.error("이미지 선택 오류:", error)
      alert("오류", "이미지 선택 중 오류가 발생했습니다.")
    }
  }

  // 이미지 삭제 기능
  const removeImage = async (index: number) => {
    const imageToRemove = selectedImages[index]
    
    console.log('🔍 [CreatePostScreen] 이미지 삭제 시도:', { 
      index, 
      imageUrl: imageToRemove,
      isEdit,
      isFirebaseUrl: imageToRemove.startsWith('https://firebasestorage.googleapis.com')
    })
    
    // 편집 모드이고 Firebase Storage URL인 경우 Storage에서도 삭제
    if (isEdit && imageToRemove.startsWith('https://firebasestorage.googleapis.com')) {
      try {
        // Firebase Storage URL에서 파일 경로 추출 (개선된 방식)
        const url = new URL(imageToRemove)
        console.log('🔍 [CreatePostScreen] URL 분석:', {
          pathname: url.pathname,
          searchParams: url.searchParams.toString()
        })
        
        // URL 형태: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile.jpg?alt=media&token=...
        let filePath = ''
        
        if (url.pathname.includes('/o/')) {
          // 표준 Firebase Storage URL 형태
          const pathStart = url.pathname.indexOf('/o/') + 3
          const pathEnd = url.searchParams.has('alt') ? url.pathname.length : url.pathname.indexOf('?')
          filePath = decodeURIComponent(url.pathname.substring(pathStart, pathEnd === -1 ? url.pathname.length : pathEnd))
        } else {
          // 다른 형태의 URL이라면 전체 pathname에서 추출
          filePath = decodeURIComponent(url.pathname.substring(1)) // 맨 앞의 / 제거
        }
        
        console.log('🔍 [CreatePostScreen] 추출된 파일 경로:', filePath)
        
        if (filePath) {
          await getStorage().ref(filePath).delete()
          console.log('🗑️ [CreatePostScreen] Firebase Storage에서 이미지 삭제 완료:', filePath)
        } else {
          console.warn('⚠️ [CreatePostScreen] 파일 경로를 추출할 수 없습니다:', imageToRemove)
        }
      } catch (error) {
        console.error('⚠️ [CreatePostScreen] Firebase Storage 이미지 삭제 실패:', error)
        console.log('🔍 [CreatePostScreen] 오류 상세:', {
          message: error.message,
          code: error.code,
          imageUrl: imageToRemove
        })
        
        // 오류 타입에 따른 처리
        if (error.code === 'storage/object-not-found') {
          console.log('ℹ️ [CreatePostScreen] 이미지가 이미 삭제되었거나 존재하지 않습니다.')
        } else if (error.code === 'storage/unauthorized') {
          console.warn('⚠️ [CreatePostScreen] 이미지 삭제 권한이 없습니다.')
        } else {
          console.error('❌ [CreatePostScreen] 예상치 못한 삭제 오류:', error.code)
        }
        
        // Storage 삭제가 실패해도 UI에서는 제거 (이미 삭제되었거나 권한 문제일 수 있음)
      }
    }
    
    // UI에서 이미지 제거
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  // 날짜 포맷 헬퍼 함수
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
    return `${year}.${month}.${day} (${weekDay})`
  }

  // 문자열을 Date 객체로 변환하는 함수
  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date()
    
    // "2024.10.20 (일)" 형식 파싱
    const match = dateString.match(/(\d{4})\.(\d{2})\.(\d{2})/)
    if (match) {
      const [, year, month, day] = match
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    }
    
    return new Date()
  }

  // 날짜 변경 핸들러들
  const handleDeadlineChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDeadlinePicker(false)
    }
    if (selectedDate) {
      updateFormData("deadline", formatDate(selectedDate))
      if (Platform.OS === 'ios') {
        setShowDeadlinePicker(false)
      }
    }
  }

  const handleAuditionDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowAuditionDatePicker(false)
    }
    if (selectedDate) {
      updateFormData("auditionDate", formatDate(selectedDate))
      if (Platform.OS === 'ios') {
        setShowAuditionDatePicker(false)
      }
    }
  }

  const handleAuditionResultChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowAuditionResultPicker(false)
    }
    if (selectedDate) {
      updateFormData("auditionResultDate", formatDate(selectedDate))
      if (Platform.OS === 'ios') {
        setShowAuditionResultPicker(false)
      }
    }
  }

  const applyTemplate = (template: PostTemplate) => {
    console.log('템플릿 적용:', template.name)
    
    setFormData(prev => {
      const newData = {
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
      }
      
      return newData
    })
    
    setSelectedTemplate(template)
    setShowTemplateModal(false)
  }

  // 폼 완성도 계산 함수
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


  // 로딩 중일 때
  if (!userProfile) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader 
          title="게시글 작성"
        />
        <View style={themed($container)}>
          <View style={themed($centerContainer) as any}>
            <Text text="사용자 정보를 불러오는 중..." style={themed($messageText) as any} />
          </View>
        </View>
      </Screen>
    )
  }

  // 운영자가 아닐 때
  if (userProfile.userType !== "organizer") {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader 
          title="게시글 작성"
        />
        <View style={themed($container)}>
          <View style={themed($centerContainer) as any}>
            <Text text="단체 운영자만 게시글을 작성할 수 있습니다." style={themed($messageText) as any} />
            <Text text={`현재 사용자 타입: ${userProfile.userType}`} style={themed($debugInfoText) as any} />
            <Button
              text="설정에서 운영자로 전환"
              onPress={() => navigation.navigate("Settings" as any)}
              style={themed($convertButton)}
            />
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={[]}>
      <ScreenHeader 
        title={isEdit ? "게시글 수정" : "게시글 작성"}
      />
      <View style={themed($container)}>
        {/* 모드 선택 탭 */}
        <View style={themed($modeTabContainer)}>
          <TouchableOpacity
            style={[themed($modeTab), postMode === 'text' && themed($activeTab)]}
            onPress={() => !isEdit && setPostMode('text')}
            disabled={isEdit}
            accessibilityRole="tab"
            accessibilityLabel="텍스트 모드"
          >
            <Text 
              text="📝 Text" 
              style={[themed($modeTabText), postMode === 'text' && themed($activeTabText), isEdit && themed($disabledTabText)]} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[themed($modeTab), postMode === 'images' && themed($activeTab)]}
            onPress={() => !isEdit && setPostMode('images')}
            disabled={isEdit}
            accessibilityRole="tab"
            accessibilityLabel="이미지 모드"
          >
            <Text 
              text="📸 Images" 
              style={[themed($modeTabText), postMode === 'images' && themed($activeTabText), isEdit && themed($disabledTabText)]} 
            />
          </TouchableOpacity>
        </View>

        {/* 모드 설명 */}
        <View style={themed($modeDescription)}>
          <Text 
            text={postMode === 'text' 
              ? "📝 상세한 정보로 모집공고를 작성하세요" 
              : "📸 이미지로 쉽고 빠르게 모집공고를 작성하세요"
            } 
            style={themed($modeDescriptionText)} 
          />
        </View>

        {/* 템플릿 선택 섹션 - Text 모드에서만 표시 */}
        {postMode === 'text' && (
          <View style={themed($templateSection)}>
            <Text text="⚡ 빠른 작성" style={themed($sectionHeader)} />
            <TouchableOpacity 
              style={themed($templateButton)}
              onPress={() => setShowTemplateModal(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="템플릿 선택"
              accessibilityHint="미리 만들어진 양식을 선택합니다"
            >
              <View style={themed($templateButtonContent)}>
                <Text text="📝 템플릿 선택하기" style={themed($templateButtonText)} />
                <Text text=">" style={themed($templateButtonArrow)} />
              </View>
              <Text text="미리 만들어진 양식으로 쉽게 작성하세요" style={themed($templateButtonSubText)} />
            </TouchableOpacity>
            
            {selectedTemplate && (
              <View style={themed($selectedTemplateIndicator)}>
                <Text text={`${selectedTemplate.icon} ${selectedTemplate.name} 적용됨`} style={themed($selectedTemplateText)} />
                <TouchableOpacity onPress={() => {
                  setSelectedTemplate(null)
                  // 기본값으로 초기화 (필요시)
                }}>
                  <Text text="✖" style={themed($removeTemplateButton)} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* 이미지 모드 UI */}
        {postMode === 'images' && (
          <View style={themed($imageSection)}>
            <Text text="📸 이미지 업로드" style={themed($sectionHeader)} />
            
            {/* 이미지 업로드 버튼 */}
            <TouchableOpacity
              style={themed($imageUploadButton)}
              onPress={pickImages}
              disabled={uploadingImages || selectedImages.length >= 5}
              accessibilityRole="button"
              accessibilityLabel="이미지 선택"
            >
              <Text text="📷" style={themed($imageUploadIcon)} />
              <Text 
                text={uploadingImages ? "업로드 중..." : `이미지 선택 (${selectedImages.length}/5)`} 
                style={themed($imageUploadText)} 
              />
            </TouchableOpacity>
            
            {/* 선택된 이미지 미리보기 */}
            {selectedImages.length > 0 && (
              <View style={themed($imagePreviewContainer)}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedImages.map((imageUrl, index) => (
                    <View key={index} style={themed($imagePreviewItem)}>
                      <Image source={{ uri: imageUrl }} style={themed($imagePreview)} />
                      <TouchableOpacity
                        style={themed($imageRemoveButton)}
                        onPress={() => removeImage(index)}
                        accessibilityRole="button"
                        accessibilityLabel={`이미지 ${index + 1} 삭제`}
                      >
                        <Text text="✖" style={themed($imageRemoveText)} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            
            <Text text="💡 최대 5개까지 선택 가능합니다" style={themed($hintText)} />
          </View>
        )}

        {/* 작성 진행률 표시기 */}
        <View style={themed($progressSection)}>
          <View style={themed($progressHeader)}>
            <Text text={`📊 작성 진행률: ${calculateCompleteness()}%`} style={themed($progressTitle)} />
          </View>
          
          <View style={themed($progressBarContainer)}>
            <View 
              style={[
                themed($progressBar),
                { width: `${calculateCompleteness()}%` }
              ]} 
            />
          </View>
          
          <View style={themed($progressTips)}>
            {calculateCompleteness() < 100 && (
              <Text text="💡 모든 필수 정보를 입력하면 더 많은 지원자를 모집할 수 있어요!" style={themed($progressTipText)} />
            )}
            {calculateCompleteness() >= 100 && (
              <Text text="✨ 완벽해요! 이제 게시글을 작성할 준비가 되었습니다." style={themed($progressCompletedText)} />
            )}
          </View>
        </View>

        {/* 기본 정보 섹션 */}
        <View style={themed($formSection)}>
          <Text text="📝 기본 정보" style={themed($sectionHeader)} />
          
          <View style={themed($inputSection)}>
            <View style={themed($labelRow)}>
              <Text text="제목" style={themed($label) as any} />
              <Text text="*" style={themed($required)} />
            </View>
            <TextInput
              style={themed($textInput)}
              value={formData.title}
              onChangeText={(text) => updateFormData("title", text)}
              placeholder={postMode === 'images' ? "예: 햄릿 주연 모집" : "예: [테스트] 레미제라블 양상블 모집"}
              placeholderTextColor={colors.textDim}
              accessibilityLabel="모집공고 제목"
              accessibilityHint="모집공고의 제목을 입력하세요"
            />
            <Text text="💡 구체적이고 매력적인 제목을 작성해주세요" style={themed($hintText)} />
          </View>
          
          {/* 작품명 - Text 모드에서만 필수 */}
          {postMode === 'text' && (
            <View style={themed($inputSection)}>
              <View style={themed($labelRow)}>
                <Text text="작품명" style={themed($label) as any} />
                <Text text="*" style={themed($required)} />
              </View>
              <TextInput
                style={themed($textInput)}
                value={formData.production}
                onChangeText={(text) => updateFormData("production", text)}
                placeholder="햄릿"
                placeholderTextColor={colors.textDim}
                accessibilityLabel="작품명"
              />
            </View>
          )}
          
          {/* Images 모드에서는 선택적 */}
          {postMode === 'images' && (
            <View style={themed($inputSection)}>
              <Text text="작품명 (선택사항)" style={themed($label) as any} />
              <TextInput
                style={themed($textInput)}
                value={formData.production}
                onChangeText={(text) => updateFormData("production", text)}
                placeholder="작품명을 입력하세요"
                placeholderTextColor={colors.textDim}
                accessibilityLabel="작품명"
              />
            </View>
          )}
          
          {/* 장르 */}
          <View style={themed($inputSection)}>
            <Text text="장르" style={themed($label) as any} />
            <Dropdown
              value={formData.genre}
              options={[
                { label: "연극", value: "연극" },
                { label: "뮤지컬", value: "뮤지컬" },
                { label: "창작", value: "창작" },
                { label: "기타", value: "기타" }
              ]}
              placeholder="장르를 선택하세요"
              onSelect={(value) => updateFormData("genre", value as any)}
            />
          </View>

          {/* 단체명 - read only */}
          <View style={themed($inputSection)}>
            <Text text="단체명" style={themed($label) as any} />
            <View style={themed($readOnlyContainer)}>
              <Text text={formData.organizationName || "단체명 없음"} style={themed($readOnlyText) as any} />
              <Text text="(소속 단체로 자동 설정됩니다)" style={themed($helpText) as any} />
            </View>
          </View>
        </View>

        {/* 추가 기본 정보 섹션 - Text 모드에서만 상세 표시 */}
        {postMode === 'text' && (
          <View style={themed($formSection)}>
            {/* 연습 일정 */}
            <View style={themed($inputSection)}>
              <Text text="연습 일정 *" style={themed($label) as any} />
              <TextInput
                style={themed($textInput)}
                value={formData.rehearsalSchedule}
                onChangeText={(text) => updateFormData("rehearsalSchedule", text)}
                placeholder="예: 매주 일요일 오후 2시-6시"
                placeholderTextColor={colors.textDim}
              />
            </View>

            {/* 장소 */}
            <View style={themed($inputSection)}>
              <View style={themed($labelRow)}>
                <Text text="장소" style={themed($label) as any} />
                <Text text="*" style={themed($required)} />
              </View>
              <TextInput
                style={themed($textInput)}
                value={formData.location}
                onChangeText={(text) => updateFormData("location", text)}
                placeholder="예: 대학로 소극장"
                placeholderTextColor={colors.textDim}
              />
            </View>

          {/* 마감일 */}
          <View style={themed($inputSection)}>
            <Text text="모집 마감일" style={themed($label) as any} />
            <TouchableOpacity
              style={themed($dateInput)}
              onPress={() => setShowDeadlinePicker(true)}
              accessibilityRole="button"
              accessibilityLabel="마감일 선택"
              accessibilityHint="터치하면 날짜 선택기가 열립니다"
            >
              <Text 
                text={formData.deadline || "날짜를 선택해주세요"} 
                style={[themed($dateInputText), !formData.deadline && themed($placeholderText)]} 
              />
              <Text text="📅" style={themed($dateIcon)} />
            </TouchableOpacity>
            
{/* 마감일 선택 모달 */}
            {showDeadlinePicker && Platform.OS === 'ios' && (
              <Modal transparent animationType="slide">
                <View 
                  style={themed($dateModalOverlay)}
                >
                  <View style={themed($dateModalContainer)}>
                    <View style={themed($dateModalHeader)}>
                      <TouchableOpacity onPress={() => setShowDeadlinePicker(false)}>
                        <Text text="취소" style={themed($dateModalCancelText)} />
                      </TouchableOpacity>
                      <Text text="마감일 선택" style={themed($dateModalTitle)} />
                      <TouchableOpacity onPress={() => setShowDeadlinePicker(false)}>
                        <Text text="완료" style={themed($dateModalDoneText)} />
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={parseDate(formData.deadline)}
                      mode="date"
                      display="spinner"
                      onChange={handleDeadlineChange}
                      minimumDate={new Date()}
                      style={themed($datePicker)}
                    />
                  </View>
                </View>
              </Modal>
            )}
            
            {showDeadlinePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={parseDate(formData.deadline)}
                mode="date"
                display="default"
                onChange={handleDeadlineChange}
                minimumDate={new Date()}
              />
            )}
          </View>
          </View>
        )}

        {/* 모집 역할 섹션 - Text 모드에서만 표시 */}
        {postMode === 'text' && (
          <View style={themed($formSection)}>
            <Text text="🎭 모집 역할" style={themed($sectionHeader)} />
          
          <View style={themed($inputSection)}>
            <Text text="역할명" style={themed($label) as any} />
            <TextInput
              style={themed($textInput)}
              value={formData.roles[0]?.name || ""}
              onChangeText={(text) => {
                const newRoles = [...formData.roles]
                newRoles[0] = { ...newRoles[0], name: text }
                setFormData(prev => ({ ...prev, roles: newRoles }))
              }}
              placeholder="예: 레미제라블 양상블"
              placeholderTextColor={colors.textDim}
            />
          </View>

          <View style={themed($inputSection)}>
            <Text text="성별 조건" style={themed($label) as any} />
            <Dropdown
              value={formData.roles[0]?.gender || "any"}
              options={[
                { label: "무관", value: "any" },
                { label: "남성", value: "male" },
                { label: "여성", value: "female" }
              ]}
              placeholder="성별 조건을 선택하세요"
              onSelect={(value) => {
                const newRoles = [...formData.roles]
                newRoles[0] = { ...newRoles[0], gender: value as any }
                setFormData(prev => ({ ...prev, roles: newRoles }))
              }}
            />
          </View>
          
          <View style={themed($inputSection)}>
            <Text text="나이 조건" style={themed($label) as any} />
            <TextInput
              style={themed($textInput)}
              value={formData.roles[0]?.ageRange || ""}
              onChangeText={(text) => {
                const newRoles = [...formData.roles]
                newRoles[0] = { ...newRoles[0], ageRange: text }
                setFormData(prev => ({ ...prev, roles: newRoles }))
              }}
              placeholder="예: 20-40세"
              placeholderTextColor={colors.textDim}
            />
          </View>

          <View style={themed($inputSection)}>
            <Text text="역할 요구사항" style={themed($label) as any} />
            <TextInput
              style={[themed($textInput), themed($textArea)]}
              value={formData.roles[0]?.requirements || ""}
              onChangeText={(text) => {
                const newRoles = [...formData.roles]
                newRoles[0] = { ...newRoles[0], requirements: text }
                setFormData(prev => ({ ...prev, roles: newRoles }))
              }}
              placeholder="예: 노래 가능자, 단체 연기 경험자"
              placeholderTextColor={colors.textDim}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          </View>
        )}

        {/* 오디션 정보 섹션 - Text 모드에서만 표시 */}
        {postMode === 'text' && (
          <View style={themed($formSection)}>
            <Text text="🎯 오디션 정보" style={themed($sectionHeader)} />
          
          <View style={themed($inputSection)}>
            <Text text="오디션 일정" style={themed($label) as any} />
            <TouchableOpacity
              style={themed($dateInput)}
              onPress={() => setShowAuditionDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel="오디션 일정 선택"
              accessibilityHint="터치하면 날짜 선택기가 열립니다"
            >
              <Text 
                text={formData.auditionDate || "날짜 선택"} 
                style={[themed($dateInputText), !formData.auditionDate && themed($placeholderText)]} 
              />
              <Text text="📅" style={themed($dateIcon)} />
            </TouchableOpacity>
            
{/* 오디션 일정 선택 모달 */}
            {showAuditionDatePicker && Platform.OS === 'ios' && (
              <Modal transparent animationType="slide">
                <View 
                  style={themed($dateModalOverlay)}
                >
                  <View style={themed($dateModalContainer)}>
                    <View style={themed($dateModalHeader)}>
                      <TouchableOpacity onPress={() => setShowAuditionDatePicker(false)}>
                        <Text text="취소" style={themed($dateModalCancelText)} />
                      </TouchableOpacity>
                      <Text text="오디션 일정 선택" style={themed($dateModalTitle)} />
                      <TouchableOpacity onPress={() => setShowAuditionDatePicker(false)}>
                        <Text text="완료" style={themed($dateModalDoneText)} />
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={parseDate(formData.auditionDate)}
                      mode="date"
                      display="spinner"
                      onChange={handleAuditionDateChange}
                      minimumDate={new Date()}
                      style={themed($datePicker)}
                    />
                  </View>
                </View>
              </Modal>
            )}
            
            {showAuditionDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={parseDate(formData.auditionDate)}
                mode="date"
                display="default"
                onChange={handleAuditionDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
          
          <View style={themed($inputSection)}>
            <Text text="결과 발표일" style={themed($label) as any} />
            <TouchableOpacity
              style={themed($dateInput)}
              onPress={() => setShowAuditionResultPicker(true)}
              accessibilityRole="button"
              accessibilityLabel="결과 발표일 선택"
              accessibilityHint="터치하면 날짜 선택기가 열립니다"
            >
              <Text 
                text={formData.auditionResultDate || "날짜 선택"} 
                style={[themed($dateInputText), !formData.auditionResultDate && themed($placeholderText)]} 
              />
              <Text text="📅" style={themed($dateIcon)} />
            </TouchableOpacity>
            
{/* 결과 발표일 선택 모달 */}
            {showAuditionResultPicker && Platform.OS === 'ios' && (
              <Modal transparent animationType="slide">
                <View 
                  style={themed($dateModalOverlay)}
                >
                  <View style={themed($dateModalContainer)}>
                    <View style={themed($dateModalHeader)}>
                      <TouchableOpacity onPress={() => setShowAuditionResultPicker(false)}>
                        <Text text="취소" style={themed($dateModalCancelText)} />
                      </TouchableOpacity>
                      <Text text="결과 발표일 선택" style={themed($dateModalTitle)} />
                      <TouchableOpacity onPress={() => setShowAuditionResultPicker(false)}>
                        <Text text="완료" style={themed($dateModalDoneText)} />
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={parseDate(formData.auditionResultDate)}
                      mode="date"
                      display="spinner"
                      onChange={handleAuditionResultChange}
                      minimumDate={new Date()}
                      style={themed($datePicker)}
                    />
                  </View>
                </View>
              </Modal>
            )}
            
            {showAuditionResultPicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={parseDate(formData.auditionResultDate)}
                mode="date"
                display="default"
                onChange={handleAuditionResultChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={themed($inputSection)}>
            <Text text="오디션 장소" style={themed($label) as any} />
            <TextInput
              style={themed($textInput)}
              value={formData.auditionLocation}
              onChangeText={(text) => updateFormData("auditionLocation", text)}
              placeholder="예: 대학로 소극장"
              placeholderTextColor={colors.textDim}
            />
          </View>

          <View style={themed($inputSection)}>
            <Text text="준비사항" style={themed($label) as any} />
            <TextInput
              style={themed($textInput)}
              value={formData.auditionRequirements}
              onChangeText={(text) => updateFormData("auditionRequirements", text)}
              placeholder="예: 자기소개, 자유곡 1분"
              placeholderTextColor={colors.textDim}
            />
            <Text text="💡 쉼표로 구분해서 입력해주세요" style={themed($hintText)} />
          </View>
          </View>
        )}

        {/* 혜택 정보 섹션 - Text 모드에서만 표시 */}
        {postMode === 'text' && (
          <View style={themed($formSection)}>
            <Text text="💰 혜택 정보" style={themed($sectionHeader)} />
          
          <View style={themed($inputSection)}>
            <Text text="출연료/활동비" style={themed($label) as any} />
            <TextInput
              style={themed($textInput)}
              value={formData.fee}
              onChangeText={(text) => updateFormData("fee", text)}
              placeholder="예: 회차당 5만원, 협의 후 결정"
              placeholderTextColor={colors.textDim}
            />
          </View>

          <View style={themed($benefitsSection)}>
            <Text text="제공 혜택" style={themed($label) as any} />
            
            <View style={themed($benefitRow)}>
              <Text text="🚗 교통비 지원" style={themed($benefitLabel)} />
              <Switch
                value={formData.transportation}
                onValueChange={(value) => updateFormData("transportation", value)}
                trackColor={{ false: colors.palette.neutral300, true: colors.palette.primary200 }}
                thumbColor={formData.transportation ? colors.palette.primary500 : colors.palette.neutral400}
                ios_backgroundColor={colors.palette.neutral300}
                accessibilityLabel="교통비 지원 토글"
              />
            </View>

            <View style={themed($benefitRow)}>
              <Text text="👗 의상 제공" style={themed($benefitLabel)} />
              <Switch
                value={formData.costume}
                onValueChange={(value) => updateFormData("costume", value)}
                trackColor={{ false: colors.palette.neutral300, true: colors.palette.primary200 }}
                thumbColor={formData.costume ? colors.palette.primary500 : colors.palette.neutral400}
                ios_backgroundColor={colors.palette.neutral300}
                accessibilityLabel="의상 제공 토글"
              />
            </View>

            <View style={themed($benefitRow)}>
              <Text text="🍽️ 식사 제공" style={themed($benefitLabel)} />
              <Switch
                value={formData.meals}
                onValueChange={(value) => updateFormData("meals", value)}
                trackColor={{ false: colors.palette.neutral300, true: colors.palette.primary200 }}
                thumbColor={formData.meals ? colors.palette.primary500 : colors.palette.neutral400}
                ios_backgroundColor={colors.palette.neutral300}
                accessibilityLabel="식사 제공 토글"
              />
            </View>

            <View style={themed($benefitRow)}>
              <Text text="📸 포트폴리오 제공" style={themed($benefitLabel)} />
              <Switch
                value={formData.portfolio}
                onValueChange={(value) => updateFormData("portfolio", value)}
                trackColor={{ false: colors.palette.neutral300, true: colors.palette.primary200 }}
                thumbColor={formData.portfolio ? colors.palette.primary500 : colors.palette.neutral400}
                ios_backgroundColor={colors.palette.neutral300}
                accessibilityLabel="포트폴리오 제공 토글"
              />
            </View>
          </View>
          </View>
        )}

        {/* 연락처 정보 섹션 - 두 모드 모두 표시 */}
        <View style={themed($formSection)}>
          <Text text="📞 연락처 정보" style={themed($sectionHeader)} />
          
          <View style={themed($inputSection)}>
            <View style={themed($labelRow)}>
              <Text text="담당자 이메일" style={themed($label) as any} />
              <Text text="*" style={themed($required)} />
            </View>
            <TextInput
              style={themed($textInput)}
              value={formData.contactEmail}
              onChangeText={(text) => updateFormData("contactEmail", text)}
              placeholder="contact@example.com"
              placeholderTextColor={colors.textDim}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={themed($inputSection)}>
            <Text text="연락처" style={themed($label) as any} />
            <TextInput
              style={themed($textInput)}
              value={formData.contactPhone}
              onChangeText={(text) => updateFormData("contactPhone", text)}
              placeholder="010-1234-5678"
              placeholderTextColor={colors.textDim}
              keyboardType="phone-pad"
            />
          </View>

          <View style={themed($inputSection)}>
            <Text text="제출 서류" style={themed($label) as any} />
            <TextInput
              style={themed($textInput)}
              value={formData.requiredDocuments}
              onChangeText={(text) => updateFormData("requiredDocuments", text)}
              placeholder="예: 이력서, 자기소개서, 프로필 사진"
              placeholderTextColor={colors.textDim}
            />
            <Text text="💡 쉼표로 구분해서 입력해주세요" style={themed($hintText)} />
          </View>
        </View>

        {/* 상세 설명 섹션 - Images 모드에서는 선택사항 */}
        <View style={themed($formSection)}>
          <Text text="📝 상세 설명" style={themed($sectionHeader)} />
          
          <View style={themed($inputSection)}>
            <View style={themed($labelRow)}>
              <Text text="상세 설명" style={themed($label) as any} />
              {postMode === 'text' && <Text text="*" style={themed($required)} />}
              {postMode === 'images' && <Text text="(선택사항)" style={themed($optionalLabel)} />}
            </View>
            <TextInput
              style={[themed($textInput), themed($textArea)]}
              value={formData.description}
              onChangeText={(text) => updateFormData("description", text)}
              placeholder={postMode === 'images' 
                ? "추가 설명이 필요한 경우 입력해주세요" 
                : "🎵 레미제라블 양상블을 모집합니다!&#10;&#10;자세한 모집 내용과 요구사항을 입력해주세요."
              }
              placeholderTextColor={colors.textDim}
              multiline
              numberOfLines={postMode === 'images' ? 3 : 6}
              textAlignVertical="top"
            />
            <Text 
              text={postMode === 'images' 
                ? "💡 이미지에 모든 정보가 포함되어 있다면 비워두셔도 됩니다" 
                : "💡 매력적인 설명으로 지원자들의 관심을 끌어보세요!"
              } 
              style={themed($hintText)} 
            />
          </View>

          {/* 태그 */}
          <View style={themed($inputSection)}>
            <Text text="태그" style={themed($label) as any} />
            <TextInput
              style={themed($textInput)}
              value={formData.tags}
              onChangeText={(text) => updateFormData("tags", text)}
              placeholder="예: 뮤지컬, 남성역할, 여성역할"
              placeholderTextColor={colors.textDim}
            />
            <Text text="💡 쉼표로 구분해서 입력해주세요" style={themed($hintText)} />
          </View>
        </View>

        {/* 모집 상태 섹션 */}
        <View style={themed($formSection)}>
          <Text text="⚙️ 모집 설정" style={themed($sectionHeader)} />
          
          <View style={themed($inputSection)}>
            <View style={themed($switchContainer)}>
              <View style={themed($switchLabelContainer)}>
                <Text text="모집 상태" style={themed($label) as any} />
                <Text 
                  text={formData.status === "active" ? "🟢 모집중" : "🔴 모집마감"} 
                  style={themed($statusText)} 
                />
              </View>
              <Switch
                value={formData.status === "active"}
                onValueChange={(value) => updateFormData("status", value ? "active" : "closed")}
                trackColor={{ false: colors.palette.neutral300, true: colors.palette.primary200 }}
                thumbColor={formData.status === "active" ? colors.palette.primary500 : colors.palette.neutral400}
                ios_backgroundColor={colors.palette.neutral300}
                accessibilityLabel="모집 상태 토글"
                accessibilityHint={formData.status === "active" ? "현재 모집중입니다. 터치하면 모집마감으로 변경됩니다." : "현재 모집마감입니다. 터치하면 모집중으로 변경됩니다."}
              />
            </View>
            <Text 
              text={formData.status === "active" ? "💡 지원자들이 이 게시글을 볼 수 있습니다" : "⏸️ 지원을 받지 않는 상태입니다"} 
              style={themed($hintText)} 
            />
          </View>
        </View>

        {/* 저장 버튼 */}
        <View style={themed($saveSection)}>
          <Button
            text={isEdit ? "수정 완료" : "게시글 작성"}
            onPress={handleSave}
            isLoading={loading}
            style={themed($saveButton)}
          />
        </View>
        </View>

      {/* 템플릿 선택 모달 */}
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View 
          style={themed($modalOverlay)}
        >
          <TouchableOpacity 
            style={themed($modalContainer)}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={themed($modalHeader)}>
              <Text text="📝 템플릿 선택" style={themed($modalTitle)} />
              <TouchableOpacity
                onPress={() => {
                  console.log('모달 닫기 버튼 클릭됨')
                  setShowTemplateModal(false)
                }}
                style={themed($modalCloseButton)}
              >
                <Text text="✖" style={themed($modalCloseText)} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={themed($templateScrollView)} showsVerticalScrollIndicator={false}>
              {POST_TEMPLATES.length > 0 ? POST_TEMPLATES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={themed($templateItem)}
                  onPress={() => applyTemplate(item)}
                  activeOpacity={0.7}
                >
                  <View style={themed($templateItemHeader)}>
                    <Text text={item.icon} style={themed($templateIcon)} />
                    <View style={themed($templateInfo)}>
                      <Text text={item.name} style={themed($templateName)} />
                      <Text text={item.category} style={themed($templateCategory)} />
                    </View>
                  </View>
                  <Text 
                    text={item.template.description ? item.template.description.substring(0, 100) + "..." : "템플릿 미리보기"} 
                    style={themed($templatePreview)} 
                  />
                </TouchableOpacity>
              )) : (
                <Text text="템플릿을 불러올 수 없습니다." style={{ color: '#000', padding: 20, textAlign: 'center' }} />
              )}
            </ScrollView>
          </TouchableOpacity>
        </View>
      </Modal>

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

const $container = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing?.lg || 16,
  paddingTop: spacing?.md || 12,
  paddingBottom: spacing?.xl || 24,
})


const $centerContainer = {
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
}

const $inputSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
  marginTop: spacing?.xs || 4,
  flex: 1, // 유연한 너비 사용
})

const $label = ({ colors, spacing, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.medium,
  fontSize: 16,
  marginBottom: spacing.xs,
})

const $textInput = ({ colors, spacing, typography }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  padding: spacing?.md || 12,
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.text,
  backgroundColor: colors.background,
  minHeight: 44, // 터치하기 좋은 최소 높이
  flex: 1, // 유연한 너비 사용
  marginBottom: spacing?.xs || 4,
})

const $textArea = {
  height: 120,
}


const $saveSection = ({ spacing }) => ({
  marginTop: spacing?.lg || 16,
  marginBottom: spacing?.xl || 24,
  paddingHorizontal: spacing?.sm || 8, // 좌우 여백 추가
})

const $saveButton = {
  // 추가 스타일링 필요시 여기에
}

const $messageText = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.text,
  textAlign: "center" as const,
  marginBottom: spacing.md,
})

const $debugInfoText = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center" as const,
  marginBottom: spacing.lg,
})

const $convertButton = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  marginTop: spacing.md,
})

const $readOnlyContainer = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  padding: spacing.md,
  backgroundColor: colors.background,
  opacity: 0.7,
})

const $readOnlyText = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
  fontWeight: "500" as const,
})

const $helpText = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: 4,
  fontStyle: "italic" as const,
})


const $formSection = ({ spacing }) => ({
  marginBottom: spacing?.xl || 24,
})

const $sectionHeader = ({ colors, spacing, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.md || 12,
})

const $labelRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

const $required = ({ colors, typography }) => ({
  color: colors.palette.angry500,
  marginLeft: 2,
  fontSize: 14,
  fontFamily: typography.primary.normal,
})


// Switch 스타일들
const $switchContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  paddingVertical: spacing?.sm || 8,
})

const $switchLabelContainer = {
  flex: 1,
}

const $statusText = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginTop: spacing?.xs || 4,
})

// DateInput 스타일들
const $dateInput = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  paddingHorizontal: spacing?.md || 12,
  paddingVertical: spacing?.md || 12,
  backgroundColor: colors.background,
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  minHeight: 44,
})

const $dateInputText = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.text,
  flex: 1,
})

const $placeholderText = ({ colors }) => ({
  color: colors.textDim,
})

const $dateIcon = {
  fontSize: 16,
  marginLeft: 8,
}

// 새로운 UI 스타일들
const $hintText = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: spacing?.xs || 4,
  fontStyle: "italic" as const,
  lineHeight: 16,
})

const $benefitsSection = ({ spacing }) => ({
  marginTop: spacing?.sm || 8,
})

const $benefitRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  paddingVertical: spacing?.sm || 8,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(0,0,0,0.05)",
})

const $benefitLabel = ({ colors, typography }) => ({
  fontSize: 16,
  color: colors.text,
  fontFamily: typography.primary.normal,
  flex: 1,
})

// 템플릿 관련 스타일들
const $templateSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
})

const $templateButton = ({ colors, spacing }) => ({
  borderWidth: 2,
  borderColor: colors.palette.primary500,
  borderRadius: 12,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.md || 12,
  backgroundColor: colors.background,
  flexDirection: "column" as const,
  alignItems: "flex-start" as const,
  borderStyle: "dashed" as const,
})

const $templateButtonContent = {
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  width: "100%" as const,
}

const $templateButtonText = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary500,
  flex: 1,
})

const $templateButtonSubText = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.palette.primary600,
  marginTop: 2,
  flex: 1,
})

const $templateButtonArrow = ({ colors }) => ({
  fontSize: 16,
  color: colors.palette.primary500,
  fontWeight: "bold" as const,
})

const $selectedTemplateIndicator = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
  backgroundColor: colors.palette.secondary100,
  paddingVertical: spacing?.xs || 4,
  paddingHorizontal: spacing?.sm || 8,
  borderRadius: 8,
  marginTop: spacing?.xs || 4,
})

const $selectedTemplateText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.palette.secondary700,
  flex: 1,
})

const $removeTemplateButton = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.palette.angry500,
  fontWeight: "bold" as const,
  paddingHorizontal: spacing.xs,
})

// 모달 스타일들
const $modalOverlay = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "flex-end" as const,
})

const $modalContainer = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingHorizontal: spacing?.md || 12,
  paddingTop: spacing?.md || 12,
  paddingBottom: spacing?.xl || 24,
  height: "80%" as const,
  width: "100%" as const,
})

const $modalHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.lg || 16,
})

const $modalTitle = ({ colors, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  color: colors.text,
})

const $modalCloseButton = ({ spacing }) => ({
  padding: spacing?.xs || 4,
})

const $modalCloseText = ({ colors }) => ({
  fontSize: 18,
  color: colors.textDim,
})


const $templateScrollView = ({ spacing }) => ({
  flex: 1,
  paddingTop: spacing?.sm || 8,
})

const $templateItem = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.md || 12,
  backgroundColor: colors.background,
  minHeight: 80,
})

const $templateItemHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

const $templateIcon = {
  fontSize: 24,
  marginRight: 12,
}

const $templateInfo = {
  flex: 1,
}

const $templateName = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: 2,
})

const $templateCategory = ({ colors, typography, spacing }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.palette.primary500,
  backgroundColor: colors.palette.primary100,
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
  borderRadius: 4,
  alignSelf: "flex-start" as const,
})

const $templatePreview = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  lineHeight: 20,
})

// 진행률 표시기 스타일들
const $progressSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
})

const $progressHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

const $progressTitle = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.text,
})


const $progressBarContainer = ({ colors, spacing }) => ({
  height: 8,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  marginBottom: spacing?.sm || 8,
  overflow: "hidden" as const,
})

const $progressBar = ({ colors }) => ({
  height: "100%" as const,
  backgroundColor: colors.palette.primary500,
  borderRadius: 4,
})

const $progressTips = ({ spacing }) => ({
  marginTop: spacing?.xs || 4,
})

const $progressTipText = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.palette.secondary600,
  textAlign: "center" as const,
})

const $progressCompletedText = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  color: colors.palette.secondary700,
  textAlign: "center" as const,
})


// 날짜 선택 모달 스타일들
const $dateModalOverlay = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "flex-end" as const,
})

const $dateModalContainer = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingBottom: spacing.xl,
})

const $dateModalHeader = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $dateModalTitle = ({ colors, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  color: colors.text,
})

const $dateModalCancelText = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
})

const $dateModalDoneText = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary500,
})

const $datePicker = () => ({
  height: 200,
})

// 모드 탭 스타일들
const $modeTabContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  marginBottom: spacing?.md || 12,
  backgroundColor: "rgba(0,0,0,0.05)",
  borderRadius: 8,
  padding: spacing?.xs || 4,
})

const $modeTab = ({ spacing }) => ({
  flex: 1,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 6,
  alignItems: "center" as const,
})

const $activeTab = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
})

const $modeTabText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.textDim,
})

const $activeTabText = ({ colors }) => ({
  color: colors.palette.neutral100,
})
const $disabledTabText = ({ colors }) => ({
  color: colors.textDim,
  opacity: 0.5,
})

const $modeDescription = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  backgroundColor: "rgba(0,100,200,0.05)",
  borderRadius: 8,
  borderLeftWidth: 3,
  borderLeftColor: "#0064C8",
})

const $modeDescriptionText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.palette.primary600,
  textAlign: "center" as const,
})

// 이미지 관련 스타일들
const $imageSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
})

const $imageUploadButton = ({ colors, spacing }) => ({
  borderWidth: 2,
  borderColor: colors.palette.primary500,
  borderRadius: 12,
  paddingVertical: spacing?.lg || 16,
  paddingHorizontal: spacing?.md || 12,
  backgroundColor: colors.background,
  alignItems: "center" as const,
  borderStyle: "dashed" as const,
})

const $imageUploadIcon = {
  fontSize: 24,
  marginBottom: 8,
}

const $imageUploadText = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary500,
})

const $imagePreviewContainer = ({ spacing }) => ({
  marginTop: spacing?.md || 12,
  marginBottom: spacing?.sm || 8,
})

const $imagePreviewItem = ({ spacing }) => ({
  marginRight: spacing?.sm || 8,
  position: "relative" as const,
})

const $imagePreview = {
  width: 100,
  height: 100,
  borderRadius: 8,
  backgroundColor: "#f0f0f0",
}

const $imageRemoveButton = ({ colors, spacing }) => ({
  position: "absolute" as const,
  top: -spacing?.xs || -4,
  right: -spacing?.xs || -4,
  backgroundColor: colors.palette.angry500,
  borderRadius: 12,
  width: 24,
  height: 24,
  alignItems: "center" as const,
  justifyContent: "center" as const,
})

const $imageRemoveText = ({ colors }) => ({
  fontSize: 12,
  color: colors.palette.neutral100,
  fontWeight: "bold" as const,
})

const $optionalLabel = ({ colors, typography }) => ({
  color: colors.textDim,
  marginLeft: 4,
  fontSize: 12,
  fontFamily: typography.primary.normal,
  fontStyle: "italic" as const,
})

