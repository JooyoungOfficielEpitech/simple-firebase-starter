import React, { useEffect, useState } from "react"
import { View, ScrollView, Alert, TouchableOpacity, TextInput, Modal, FlatList } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { postService, userService, organizationService } from "@/services/firestore"
import firestore from "@react-native-firebase/firestore"
import { useAppTheme } from "@/theme/context"
import { CreatePost, UpdatePost } from "@/types/post"
import { UserProfile } from "@/types/user"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"
import { POST_TEMPLATES, PostTemplate, getTemplateById } from "@/utils/postTemplates"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>
type RoutePropType = RouteProp<BulletinBoardStackParamList, "CreatePost">

export const CreatePostScreen = () => {
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RoutePropType>()
  const { postId, isEdit } = route.params || {}
  
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
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
        Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.")
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
          Alert.alert("오류", "게시글을 불러올 수 없습니다.")
          navigation.goBack()
        }
      }

      loadPost()
    }
  }, [isEdit, postId])

  const handleSave = async () => {
    // 유효성 검증
    if (!formData.title.trim()) {
      Alert.alert("오류", "제목을 입력해주세요.")
      return
    }
    if (!formData.production.trim()) {
      Alert.alert("오류", "작품명을 입력해주세요.")
      return
    }
    if (!formData.organizationName.trim()) {
      Alert.alert("오류", "단체명을 입력해주세요.")
      return
    }
    if (!formData.rehearsalSchedule.trim()) {
      Alert.alert("오류", "연습 일정을 입력해주세요.")
      return
    }
    if (!formData.location.trim()) {
      Alert.alert("오류", "장소를 입력해주세요.")
      return
    }
    if (!formData.description.trim()) {
      Alert.alert("오류", "상세 설명을 입력해주세요.")
      return
    }
    if (!formData.contactEmail.trim()) {
      Alert.alert("오류", "담당자 이메일을 입력해주세요.")
      return
    }
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.contactEmail)) {
      Alert.alert("오류", "올바른 이메일 형식을 입력해주세요.")
      return
    }

    if (!userProfile) {
      Alert.alert("오류", "사용자 정보가 없습니다.")
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
          production: formData.production.trim(),
          organizationName: formData.organizationName.trim(),
          rehearsalSchedule: formData.rehearsalSchedule.trim(),
          location: formData.location.trim(),
          description: formData.description.trim(),
          tags,
          status: formData.status,
          deadline: formData.deadline,
          roles: roles.length > 0 ? roles : undefined,
          audition: auditionInfo,
          performance: performanceInfo,
          benefits: benefitsInfo,
          contact: contactInfo,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }

        await postService.updatePost(postId, updateData)
        Alert.alert("성공", "게시글이 수정되었습니다.")
      } else {
        // 생성 모드
        const createData: CreatePost = {
          title: formData.title.trim(),
          production: formData.production.trim(),
          organizationName: formData.organizationName.trim(),
          rehearsalSchedule: formData.rehearsalSchedule.trim(),
          location: formData.location.trim(),
          description: formData.description.trim(),
          tags,
          status: formData.status,
          deadline: formData.deadline,
          roles: roles.length > 0 ? roles : undefined,
          audition: auditionInfo,
          performance: performanceInfo,
          benefits: benefitsInfo,
          contact: contactInfo,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
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
        Alert.alert("성공", "게시글이 작성되었습니다.")
      }

      navigation.goBack()
    } catch (error) {
      console.error("게시글 저장 오류:", error)
      Alert.alert("오류", "게시글 저장 중 오류가 발생했습니다.")
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

  // 다음 단계로 이동하는 함수
  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  // 이전 단계로 이동하는 함수
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 로딩 중일 때
  if (!userProfile) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <ScreenHeader title="게시글 작성" />
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
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <ScreenHeader title="게시글 작성" />
        <View style={themed($container)}>
          <View style={themed($centerContainer) as any}>
            <Text text="단체 운영자만 게시글을 작성할 수 있습니다." style={themed($messageText) as any} />
            <Text text={`현재 사용자 타입: ${userProfile.userType}`} style={themed($debugText) as any} />
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
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScreenHeader title={isEdit ? "게시글 수정" : "게시글 작성"} />
      <View style={themed($container)}>
        
        {/* 템플릿 선택 섹션 */}
        <View style={themed($templateSection)}>
          <Text text="⚡ 빠른 작성" style={themed($sectionHeader)} />
          <TouchableOpacity 
            style={themed($templateButton)}
            onPress={() => setShowTemplateModal(true)}
            activeOpacity={0.7}
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

        {/* 작성 진행률 표시기 */}
        <View style={themed($progressSection)}>
          <View style={themed($progressHeader)}>
            <Text text={`📊 작성 진행률: ${calculateCompleteness()}%`} style={themed($progressTitle)} />
            <TouchableOpacity 
              style={themed($previewButton)}
              onPress={() => setShowPreview(true)}
              activeOpacity={0.7}
            >
              <Text text="👀 미리보기" style={themed($previewButtonText)} />
            </TouchableOpacity>
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
              placeholder="예: [테스트] 레미제라블 양상블 모집"
              placeholderTextColor={colors.textDim}
              accessibilityLabel="모집공고 제목"
              accessibilityHint="모집공고의 제목을 입력하세요"
            />
            <Text text="💡 구체적이고 매력적인 제목을 작성해주세요" style={themed($hintText)} />
          </View>
          
          {/* Two-column layout for related fields */}
          <View style={themed($twoColumnRow)}>
            <View style={[themed($inputSection), themed($halfWidth)]}>
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
            
            <View style={[themed($inputSection), themed($halfWidth)]}>
              <Text text="장르" style={themed($label) as any} />
              <TouchableOpacity style={themed($dropdownButton)} disabled>
                <Text text="연극" style={themed($dropdownText)} />
                <Text text="▼" style={themed($dropdownArrow)} />
              </TouchableOpacity>
            </View>
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
            <TextInput
              style={themed($textInput)}
              value={formData.deadline}
              onChangeText={(text) => updateFormData("deadline", text)}
              placeholder="예: 2024년 10월 18일 (금) 23:59"
              placeholderTextColor={colors.textDim}
            />
          </View>
        </View>

        {/* 모집 역할 섹션 */}
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

          <View style={themed($twoColumnRow)}>
            <View style={[themed($inputSection), themed($halfWidth)]}>
              <Text text="성별 조건" style={themed($label) as any} />
              <TouchableOpacity 
                style={themed($dropdownButton)} 
                onPress={() => {
                  const genders = ["any", "male", "female"]
                  const currentIndex = genders.indexOf(formData.roles[0]?.gender || "any")
                  const nextIndex = (currentIndex + 1) % genders.length
                  const newRoles = [...formData.roles]
                  newRoles[0] = { ...newRoles[0], gender: genders[nextIndex] as any }
                  setFormData(prev => ({ ...prev, roles: newRoles }))
                }}
              >
                <Text 
                  text={formData.roles[0]?.gender === "male" ? "남성" : 
                        formData.roles[0]?.gender === "female" ? "여성" : "무관"} 
                  style={themed($dropdownText)} 
                />
                <Text text="▼" style={themed($dropdownArrow)} />
              </TouchableOpacity>
            </View>
            
            <View style={[themed($inputSection), themed($halfWidth)]}>
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

        {/* 오디션 정보 섹션 */}
        <View style={themed($formSection)}>
          <Text text="🎯 오디션 정보" style={themed($sectionHeader)} />
          
          <View style={themed($twoColumnRow)}>
            <View style={[themed($inputSection), themed($halfWidth)]}>
              <Text text="오디션 일정" style={themed($label) as any} />
              <TextInput
                style={themed($textInput)}
                value={formData.auditionDate}
                onChangeText={(text) => updateFormData("auditionDate", text)}
                placeholder="예: 2024.10.20 (일) 14:00"
                placeholderTextColor={colors.textDim}
              />
            </View>
            
            <View style={[themed($inputSection), themed($halfWidth)]}>
              <Text text="결과 발표일" style={themed($label) as any} />
              <TextInput
                style={themed($textInput)}
                value={formData.auditionResultDate}
                onChangeText={(text) => updateFormData("auditionResultDate", text)}
                placeholder="예: 2024.10.22 (화)"
                placeholderTextColor={colors.textDim}
              />
            </View>
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

        {/* 혜택 정보 섹션 */}
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

          <View style={themed($checkboxSection)}>
            <Text text="제공 혜택" style={themed($label) as any} />
            
            <View style={themed($checkboxRow)}>
              <TouchableOpacity
                style={themed($checkbox)}
                onPress={() => updateFormData("transportation", !formData.transportation)}
              >
                <Text text={formData.transportation ? "✓" : ""} style={themed($checkboxText)} />
              </TouchableOpacity>
              <Text text="교통비 지원" style={themed($checkboxLabel)} />
            </View>

            <View style={themed($checkboxRow)}>
              <TouchableOpacity
                style={themed($checkbox)}
                onPress={() => updateFormData("costume", !formData.costume)}
              >
                <Text text={formData.costume ? "✓" : ""} style={themed($checkboxText)} />
              </TouchableOpacity>
              <Text text="의상 제공" style={themed($checkboxLabel)} />
            </View>

            <View style={themed($checkboxRow)}>
              <TouchableOpacity
                style={themed($checkbox)}
                onPress={() => updateFormData("meals", !formData.meals)}
              >
                <Text text={formData.meals ? "✓" : ""} style={themed($checkboxText)} />
              </TouchableOpacity>
              <Text text="식사 제공" style={themed($checkboxLabel)} />
            </View>

            <View style={themed($checkboxRow)}>
              <TouchableOpacity
                style={themed($checkbox)}
                onPress={() => updateFormData("portfolio", !formData.portfolio)}
              >
                <Text text={formData.portfolio ? "✓" : ""} style={themed($checkboxText)} />
              </TouchableOpacity>
              <Text text="포트폴리오 제공" style={themed($checkboxLabel)} />
            </View>
          </View>
        </View>

        {/* 연락처 정보 섹션 */}
        <View style={themed($formSection)}>
          <Text text="📞 연락처 정보" style={themed($sectionHeader)} />
          
          <View style={themed($twoColumnRow)}>
            <View style={[themed($inputSection), themed($halfWidth)]}>
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
            
            <View style={[themed($inputSection), themed($halfWidth)]}>
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

        {/* 상세 설명 섹션 */}
        <View style={themed($formSection)}>
          <Text text="📝 상세 설명" style={themed($sectionHeader)} />
          
          <View style={themed($inputSection)}>
            <View style={themed($labelRow)}>
              <Text text="상세 설명" style={themed($label) as any} />
              <Text text="*" style={themed($required)} />
            </View>
            <TextInput
              style={[themed($textInput), themed($textArea)]}
              value={formData.description}
              onChangeText={(text) => updateFormData("description", text)}
              placeholder="🎵 레미제라블 양상블을 모집합니다!&#10;&#10;자세한 모집 내용과 요구사항을 입력해주세요."
              placeholderTextColor={colors.textDim}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text text="💡 매력적인 설명으로 지원자들의 관심을 끌어보세요!" style={themed($hintText)} />
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
            <Text text="모집 상태" style={themed($label) as any} />
            <View style={themed($statusToggleContainer)}>
              <TouchableOpacity
                style={[
                  themed($statusToggle),
                  formData.status === "active" && themed($activeToggle)
                ]}
                onPress={() => updateFormData("status", "active")}
                accessibilityRole="radio"
                accessibilityState={{ checked: formData.status === "active" }}
                accessibilityLabel="모집중으로 설정"
              >
                <View style={themed($toggleIndicator)}>
                  {formData.status === "active" && (
                    <View style={themed($activeIndicator)} />
                  )}
                </View>
                <View style={themed($toggleContent)}>
                  <Text text="모집중" style={themed($toggleLabel)} />
                  <Text text="지원자들이 볼 수 있음" style={themed($toggleDescription)} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  themed($statusToggle),
                  formData.status === "closed" && themed($closedToggle)
                ]}
                onPress={() => updateFormData("status", "closed")}
                accessibilityRole="radio"
                accessibilityState={{ checked: formData.status === "closed" }}
                accessibilityLabel="모집마감으로 설정"
              >
                <View style={themed($toggleIndicator)}>
                  {formData.status === "closed" && (
                    <View style={themed($closedIndicator)} />
                  )}
                </View>
                <View style={themed($toggleContent)}>
                  <Text text="모집마감" style={themed($toggleLabel)} />
                  <Text text="더 이상 지원받지 않음" style={themed($toggleDescription)} />
                </View>
              </TouchableOpacity>
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
        <TouchableOpacity 
          style={themed($modalOverlay)} 
          activeOpacity={1}
          onPress={() => setShowTemplateModal(false)}
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
              <Text text={`템플릿 개수: ${POST_TEMPLATES.length}개`} style={{ color: '#000', padding: 10 }} />
              
              {/* 간단한 테스트 버튼 */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#FF6B6B',
                  padding: 20,
                  margin: 10,
                  borderRadius: 10,
                }}
                onPress={() => {
                  console.log('테스트 버튼 클릭됨!')
                  setShowTemplateModal(false)
                }}
              >
                <Text text="🧪 테스트 버튼 - 클릭해보세요!" style={{ color: 'white', textAlign: 'center' }} />
              </TouchableOpacity>
              
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
        </TouchableOpacity>
      </Modal>

      {/* 미리보기 모달 */}
      <Modal
        visible={showPreview}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <TouchableOpacity 
          style={themed($modalOverlay)} 
          activeOpacity={1}
          onPress={() => setShowPreview(false)}
        >
          <TouchableOpacity 
            style={themed($previewModalContainer)}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={themed($modalHeader)}>
              <Text text="👀 게시글 미리보기" style={themed($modalTitle)} />
              <TouchableOpacity
                onPress={() => setShowPreview(false)}
                style={themed($modalCloseButton)}
              >
                <Text text="✖" style={themed($modalCloseText)} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={themed($previewContent)} showsVerticalScrollIndicator={false}>
              {/* 디버깅 정보 */}
              <Text text="🔍 미리보기 테스트" style={{ color: '#000', padding: 10, fontSize: 16, fontWeight: 'bold' }} />
              
              {/* 테스트 버튼 */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#4ECDC4',
                  padding: 15,
                  margin: 10,
                  borderRadius: 10,
                }}
                onPress={() => {
                  console.log('미리보기 테스트 버튼 클릭됨!')
                  console.log('현재 제목:', formData.title || '제목 없음')
                }}
              >
                <Text text="🧪 미리보기 테스트 버튼" style={{ color: 'white', textAlign: 'center' }} />
              </TouchableOpacity>
              
              {/* 미리보기 게시글 카드 */}
              <View style={themed($previewCard)}>
                <View style={themed($previewHeader)}>
                  <Text text="모집중" style={themed($previewStatus)} />
                  <Text text={formData.deadline || "마감일 2024년 10월 18일 (금) 23:59"} style={themed($previewDeadline)} />
                </View>
                
                <Text text={formData.title || "[제목을 입력해주세요]"} style={themed($previewTitle)} />
                
                <View style={themed($previewDetails)}>
                  <Text text={formData.production || "작품명"} style={themed($previewProduction)} />
                  <Text text={formData.organizationName || "단체명"} style={themed($previewOrganization)} />
                </View>
                
                <View style={themed($previewLocationRow)}>
                  <Text text="📍" style={themed($previewIcon)} />
                  <Text text={formData.location || "장소"} style={themed($previewLocationText)} />
                </View>
                
                <View style={themed($previewLocationRow)}>
                  <Text text="📅" style={themed($previewIcon)} />
                  <Text text={formData.rehearsalSchedule || "연습 일정"} style={themed($previewLocationText)} />
                </View>
              </View>

              {/* 상세 정보 섹션 */}
              <View style={themed($previewSection)}>
                <Text text="상세 설명" style={themed($previewSectionTitle)} />
                <Text 
                  text={formData.description || "🎵 상세 설명을 입력해주세요!\n\n모집하는 역할과 요구사항을 자세히 설명해주세요."} 
                  style={themed($previewDescription)} 
                />
              </View>

              {formData.roles[0]?.name && (
                <View style={themed($previewSection)}>
                  <Text text="모집 역할" style={themed($previewSectionTitle)} />
                  <View style={themed($previewRoleCard)}>
                    <Text text={formData.roles[0].name} style={themed($previewRoleName)} />
                    <Text text={`성별: ${formData.roles[0].gender === 'male' ? '남성' : formData.roles[0].gender === 'female' ? '여성' : '무관'}`} style={themed($previewRoleDetail)} />
                    {formData.roles[0].ageRange && (
                      <Text text={`나이: ${formData.roles[0].ageRange}`} style={themed($previewRoleDetail)} />
                    )}
                    {formData.roles[0].requirements && (
                      <Text text={`요구사항: ${formData.roles[0].requirements}`} style={themed($previewRoleDetail)} />
                    )}
                  </View>
                </View>
              )}

              {formData.contactEmail && (
                <View style={themed($previewSection)}>
                  <Text text="연락처 정보" style={themed($previewSectionTitle)} />
                  <Text text={`📧 ${formData.contactEmail}`} style={themed($previewContact)} />
                  {formData.contactPhone && (
                    <Text text={`📞 ${formData.contactPhone}`} style={themed($previewContact)} />
                  )}
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </Screen>
  )
}

const $container = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing?.lg || 16,
  paddingTop: spacing?.md || 12,
  paddingBottom: spacing?.xl || 24, // 하단 여백 추가
})

const $scrollView = ({ spacing }) => ({
  flex: 1,
  paddingTop: spacing.sm,
})

const $centerContainer = {
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
}

const $inputSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
  marginTop: spacing?.xs || 4,
  width: '100%' as const, // 화면 너비에 맞춤
})

const $label = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "600" as const,
  marginBottom: spacing.xs,
})

const $textInput = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  padding: spacing?.md || 12,
  fontSize: 16,
  color: colors.text,
  backgroundColor: colors.background,
  minHeight: 44, // 터치하기 좋은 최소 높이
  width: '100%' as const, // 화면 너비에 맞춤
  marginBottom: spacing?.xs || 4,
})

const $textArea = {
  height: 120,
}

const $statusContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing.sm,
})

const $statusButton = ({ colors, spacing }) => ({
  flex: 1,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  padding: spacing.md,
  alignItems: "center" as const,
  backgroundColor: colors.background,
})

const $activeStatusButton = ({ colors }) => ({
  borderColor: colors.tint,
  backgroundColor: colors.tint + "10",
})

const $closedStatusButton = ({ colors }) => ({
  borderColor: colors.textDim,
  backgroundColor: colors.textDim + "10",
})

const $statusButtonText = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
})

const $activeStatusButtonText = ({ colors }) => ({
  color: colors.tint,
  fontWeight: "600" as const,
})

const $closedStatusButtonText = ({ colors }) => ({
  color: colors.textDim,
  fontWeight: "600" as const,
})

const $saveSection = ({ spacing }) => ({
  marginTop: spacing?.lg || 16,
  marginBottom: spacing?.xl || 24,
  paddingHorizontal: spacing?.sm || 8, // 좌우 여백 추가
})

const $saveButton = {
  // 추가 스타일링 필요시 여기에
}

const $messageText = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
  textAlign: "center" as const,
  marginBottom: 16,
})

const $debugText = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center" as const,
  marginBottom: 20,
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

// 새로운 Form UX 스타일들
const $formProgress = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
})

const $progressSteps = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

const $activeStep = ({ colors }) => ({
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: colors.palette.primary500,
  marginRight: 8,
})

const $stepLabel = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
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

const $twoColumnRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing?.md || 12,
})

const $halfWidth = {
  flex: 1,
}

const $required = ({ colors }) => ({
  color: colors.palette.angry500,
  marginLeft: 2,
  fontSize: 14,
})

const $dropdownButton = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  paddingHorizontal: spacing?.md || 12,
  paddingVertical: spacing?.sm || 8,
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  backgroundColor: colors.palette.neutral200,
  minHeight: 48,
})

const $dropdownText = ({ colors, typography }) => ({
  fontSize: 16,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

const $dropdownArrow = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
})

// Status Toggle 스타일들
const $statusToggleContainer = ({ spacing }) => ({
  gap: spacing?.sm || 8,
})

const $statusToggle = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.sm || 8,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.palette.neutral100,
})

const $activeToggle = ({ colors }) => ({
  borderColor: colors.palette.primary500,
  backgroundColor: colors.palette.primary100,
})

const $closedToggle = ({ colors }) => ({
  borderColor: colors.textDim,
  backgroundColor: colors.palette.neutral200,
})

const $toggleIndicator = ({ spacing }) => ({
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: "transparent",
  marginRight: spacing?.sm || 8,
  justifyContent: "center" as const,
  alignItems: "center" as const,
})

const $activeIndicator = ({ colors }) => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: colors.palette.primary500,
})

const $closedIndicator = ({ colors }) => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: colors.textDim,
})

const $toggleContent = {
  flex: 1,
}

const $toggleLabel = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: 2,
})

const $toggleDescription = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  lineHeight: 18,
})

// 새로운 UI 스타일들
const $hintText = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: spacing?.xs || 4,
  fontStyle: "italic" as const,
  lineHeight: 16,
})

const $checkboxSection = ({ spacing }) => ({
  marginTop: spacing?.sm || 8,
})

const $checkboxRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

const $checkbox = ({ colors, spacing }) => ({
  width: 20,
  height: 20,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 4,
  marginRight: spacing?.sm || 8,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.background,
})

const $checkboxText = ({ colors }) => ({
  fontSize: 14,
  color: colors.tint,
  fontWeight: "bold" as const,
})

const $checkboxLabel = ({ colors, typography }) => ({
  fontSize: 14,
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
  borderColor: colors.tint || '#007AFF',
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
  color: colors.tint || '#007AFF',
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
  color: colors.tint || '#007AFF',
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

const $removeTemplateButton = ({ colors }) => ({
  fontSize: 14,
  color: colors.palette.angry500,
  fontWeight: "bold" as const,
  paddingHorizontal: 8,
})

// 모달 스타일들
const $modalOverlay = ({ colors }) => ({
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

const $templateList = ({ spacing }) => ({
  flex: 1,
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

const $templateCategory = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.palette.primary500,
  backgroundColor: colors.palette.primary100,
  paddingHorizontal: 8,
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

const $previewButton = ({ colors, spacing }) => ({
  backgroundColor: colors.tint || '#007AFF',
  paddingHorizontal: spacing?.md || 12,
  paddingVertical: spacing?.xs || 4,
  borderRadius: 20,
})

const $previewButtonText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: '#FFFFFF',
})

const $progressBarContainer = ({ colors, spacing }) => ({
  height: 8,
  backgroundColor: colors.border || '#E5E5E5',
  borderRadius: 4,
  marginBottom: spacing?.sm || 8,
  overflow: "hidden" as const,
})

const $progressBar = ({ colors }) => ({
  height: "100%" as const,
  backgroundColor: colors.tint || '#007AFF',
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

// 미리보기 모달 스타일들
const $previewModalContainer = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingHorizontal: spacing?.md || 12,
  paddingTop: spacing?.md || 12,
  paddingBottom: spacing?.xl || 24,
  height: "85%" as const,
  width: "100%" as const,
})

const $previewContent = ({ spacing }) => ({
  flex: 1,
  paddingTop: spacing?.sm || 8,
})

const $previewCard = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.md || 12,
  borderWidth: 1,
  borderColor: colors.border,
  minHeight: 200,
})

const $previewHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

const $previewStatus = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  color: colors.palette.secondary700,
  backgroundColor: colors.palette.secondary100,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
})

const $previewDeadline = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
})

const $previewTitle = ({ colors, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: 8,
})

const $previewDetails = ({ spacing }) => ({
  marginBottom: spacing?.sm || 8,
})

const $previewProduction = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.palette.secondary600,
  marginBottom: 4,
})

const $previewOrganization = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.palette.secondary500,
})

const $previewLocationRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

const $previewIcon = {
  fontSize: 14,
  marginRight: 6,
}

const $previewLocationText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
  flex: 1,
})

const $previewSection = ({ spacing }) => ({
  marginBottom: spacing?.md || 12,
})

const $previewSectionTitle = ({ colors, typography, spacing }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.xs || 4,
})

const $previewDescription = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
  lineHeight: 20,
})

const $previewRoleCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary50,
  borderRadius: 8,
  padding: spacing?.sm || 8,
  borderLeftWidth: 3,
  borderLeftColor: colors.palette.primary500,
})

const $previewRoleName = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary700,
  marginBottom: 4,
})

const $previewRoleDetail = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.palette.primary600,
  marginBottom: 2,
})

const $previewContact = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
  marginBottom: 4,
})