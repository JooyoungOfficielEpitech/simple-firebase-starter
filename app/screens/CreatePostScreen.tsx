import React, { useEffect, useState } from "react"
import { View, ScrollView, Alert, TouchableOpacity, TextInput } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { postService, userService } from "@/services/firestore"
import { useAppTheme } from "@/theme/context"
import { Post, CreatePost, UpdatePost } from "@/types/post"
import { UserProfile } from "@/types/user"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>
type RoutePropType = RouteProp<BulletinBoardStackParamList, "CreatePost">

export const CreatePostScreen = () => {
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RoutePropType>()
  const { postId, isEdit } = route.params
  
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
    // 사용자 프로필 로드
    const loadUserProfile = async () => {
      try {
        const profile = await userService.getUserProfile()
        setUserProfile(profile)
        
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
    if (isEdit && postId) {
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

      if (isEdit && postId) {
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

        await postService.createPost(createData, userProfile.name)
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

  if (!userProfile || userProfile.userType !== "organizer") {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed([$container, { paddingTop: top + spacing.lg }])}>
          <View style={themed($header)}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon icon="caretLeft" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text preset="heading" text="게시글 작성" style={themed($title)} />
            <View style={{ width: 24 }} />
          </View>
          <View style={themed($centerContainer)}>
            <Text text="단체 운영자만 게시글을 작성할 수 있습니다." />
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]}>
      <View style={themed([$container, { paddingTop: top + spacing.lg }])}>
        {/* 헤더 */}
        <View style={themed($header)}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon icon="caretLeft" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text preset="heading" text={isEdit ? "게시글 수정" : "게시글 작성"} style={themed($title)} />
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={themed($scrollView)} showsVerticalScrollIndicator={false}>
          {/* 제목 */}
          <View style={themed($inputSection)}>
            <Text text="제목 *" style={themed($label)} />
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
            <Text text="작품명 *" style={themed($label)} />
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
            <Text text="단체명 *" style={themed($label)} />
            <TextInput
              style={themed($textInput)}
              value={formData.organizationName}
              onChangeText={(text) => updateFormData("organizationName", text)}
              placeholder="극단 또는 단체명을 입력하세요"
              placeholderTextColor={colors.textDim}
            />
          </View>

          {/* 연습 일정 */}
          <View style={themed($inputSection)}>
            <Text text="연습 일정 *" style={themed($label)} />
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
            <Text text="장소 *" style={themed($label)} />
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
            <Text text="상세 설명 *" style={themed($label)} />
            <TextInput
              style={themed([$textInput, $textArea])}
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
            <Text text="태그" style={themed($label)} />
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
            <Text text="모집 상태" style={themed($label)} />
            <View style={themed($statusContainer)}>
              <TouchableOpacity
                style={themed([$statusButton, formData.status === "active" && $activeStatusButton])}
                onPress={() => updateFormData("status", "active")}
              >
                <Text
                  text="모집중"
                  style={themed([$statusButtonText, formData.status === "active" && $activeStatusButtonText])}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={themed([$statusButton, formData.status === "closed" && $closedStatusButton])}
                onPress={() => updateFormData("status", "closed")}
              >
                <Text
                  text="마감"
                  style={themed([$statusButtonText, formData.status === "closed" && $closedStatusButtonText])}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 저장 버튼 */}
          <View style={themed($saveSection)}>
            <Button
              text={isEdit ? "수정 완료" : "게시글 작성"}
              onPress={handleSave}
              loading={loading}
              style={themed($saveButton)}
            />
          </View>
        </ScrollView>
      </View>
    </Screen>
  )
}

const $container = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.lg,
})

const $header = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.lg,
})

const $title = ({ colors }) => ({
  color: colors.text,
})

const $scrollView = {
  flex: 1,
}

const $centerContainer = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $inputSection = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $label = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "600",
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
  flexDirection: "row",
  gap: spacing.sm,
})

const $statusButton = ({ colors, spacing }) => ({
  flex: 1,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  padding: spacing.md,
  alignItems: "center",
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
  fontWeight: "600",
})

const $closedStatusButtonText = ({ colors }) => ({
  color: colors.textDim,
  fontWeight: "600",
})

const $saveSection = ({ spacing }) => ({
  marginTop: spacing.lg,
  marginBottom: spacing.xl,
})

const $saveButton = {
  // 추가 스타일링 필요시 여기에
}