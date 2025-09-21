import React, { useEffect, useState } from "react"
import { View, ScrollView, Alert, TouchableOpacity, TextInput } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { postService, userService, organizationService } from "@/services/firestore"
import { useAppTheme } from "@/theme/context"
import { CreatePost, UpdatePost } from "@/types/post"
import { UserProfile } from "@/types/user"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>
type RoutePropType = RouteProp<BulletinBoardStackParamList, "CreatePost">

export const CreatePostScreen = () => {
  console.log('🎬 [CreatePostScreen] 컴포넌트 렌더링 시작')
  
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RoutePropType>()
  const { postId, isEdit } = route.params || {}
  
  console.log('🎬 [CreatePostScreen] 라우트 파라미터:', { postId, isEdit, params: route.params })
  
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    production: "",
    organizationName: "",
    rehearsalSchedule: "",
    location: "",
    description: "",
    tags: "",
    status: "active" as "active" | "closed",
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

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  console.log('🎬 [CreatePostScreen] 사용자 프로필 상태:', {
    userProfile: userProfile ? {
      userType: userProfile.userType,
      name: userProfile.name,
      organizationName: userProfile.organizationName
    } : null,
    loading
  })

  // 로딩 중일 때
  if (!userProfile) {
    console.log('🎬 [CreatePostScreen] 로딩 상태 렌더링')
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
    console.log('🎬 [CreatePostScreen] 권한 없음 상태 렌더링')
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

  console.log('🎬 [CreatePostScreen] 메인 폼 렌더링 시작')
  console.log('🎬 [CreatePostScreen] formData:', formData)

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScreenHeader title={isEdit ? "게시글 수정" : "게시글 작성"} />
      <View style={themed($container)}>
        
        {/* 제목 */}
        <View style={themed($inputSection)}>
          <Text text="제목 *" style={themed($label) as any} />
          <TextInput
            style={themed($textInput)}
            value={formData.title}
            onChangeText={(text) => updateFormData("title", text)}
            placeholder="모집 공고 제목을 입력하세요"
            placeholderTextColor={colors.textDim}
          />
        </View>

          {/* 작품명 */}
          <View style={themed($inputSection)}>
            <Text text="작품명 *" style={themed($label) as any} />
            <TextInput
              style={themed($textInput)}
              value={formData.production}
              onChangeText={(text) => updateFormData("production", text)}
              placeholder="예: 지킬앤 하이드"
              placeholderTextColor={colors.textDim}
            />
          </View>

          {/* 단체명 */}
          <View style={themed($inputSection)}>
            <Text text="단체명 *" style={themed($label) as any} />
            <View style={themed($readOnlyContainer)}>
              <Text text={formData.organizationName || "단체명 없음"} style={themed($readOnlyText) as any} />
              <Text text="(소속 단체로 자동 설정됩니다)" style={themed($helpText) as any} />
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
            <Text text="장소 *" style={themed($label) as any} />
            <TextInput
              style={themed($textInput)}
              value={formData.location}
              onChangeText={(text) => updateFormData("location", text)}
              placeholder="예: 건대입구역 앞 연습실"
              placeholderTextColor={colors.textDim}
            />
          </View>

          {/* 상세 설명 */}
          <View style={themed($inputSection)}>
            <Text text="상세 설명 *" style={themed($label) as any} />
            <TextInput
              style={[themed($textInput), themed($textArea)]}
              value={formData.description}
              onChangeText={(text) => updateFormData("description", text)}
              placeholder="모집하는 역할, 요구사항, 연락처 등을 자세히 입력하세요"
              placeholderTextColor={colors.textDim}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* 태그 */}
          <View style={themed($inputSection)}>
            <Text text="태그" style={themed($label) as any} />
            <TextInput
              style={themed($textInput)}
              value={formData.tags}
              onChangeText={(text) => updateFormData("tags", text)}
              placeholder="예: 뮤지컬, 남성역할, 여성역할 (쉼표로 구분)"
              placeholderTextColor={colors.textDim}
            />
          </View>

          {/* 상태 */}
          <View style={themed($inputSection)}>
            <Text text="모집 상태" style={themed($label) as any} />
            <View style={themed($statusContainer) as any}>
              <TouchableOpacity
                style={[themed($statusButton) as any, formData.status === "active" && (themed($activeStatusButton) as any)]}
                onPress={() => updateFormData("status", "active")}
              >
                <Text
                  text="모집중"
                  style={[themed($statusButtonText) as any, formData.status === "active" && (themed($activeStatusButtonText) as any)]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[themed($statusButton) as any, formData.status === "closed" && (themed($closedStatusButton) as any)]}
                onPress={() => updateFormData("status", "closed")}
              >
                <Text
                  text="마감"
                  style={[themed($statusButtonText) as any, formData.status === "closed" && (themed($closedStatusButtonText) as any)]}
                />
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
    </Screen>
  )
}

const $container = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
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
  marginBottom: spacing.lg,
  marginTop: spacing.xs,
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
  padding: spacing.md,
  fontSize: 16,
  color: colors.text,
  backgroundColor: colors.background,
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
  marginTop: spacing.lg,
  marginBottom: spacing.xl,
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