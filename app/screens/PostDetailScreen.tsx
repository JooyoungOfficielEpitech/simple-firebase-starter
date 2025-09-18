import React, { useEffect, useState } from "react"
import { View, ScrollView, Alert, TouchableOpacity } from "react-native"
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
import { Post } from "@/types/post"
import { UserProfile } from "@/types/user"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>
type RoutePropType = RouteProp<BulletinBoardStackParamList, "PostDetail">

export const PostDetailScreen = () => {
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RoutePropType>()
  const { postId } = route.params
  
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    // 사용자 프로필 로드
    const loadUserProfile = async () => {
      try {
        const profile = await userService.getUserProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error("사용자 프로필 로드 오류:", error)
      }
    }

    loadUserProfile()

    // 게시글 실시간 구독
    const unsubscribe = postService.subscribeToPost(postId, (post) => {
      setPost(post)
      setLoading(false)
    })

    return unsubscribe
  }, [postId])

  const handleEdit = () => {
    navigation.navigate("CreatePost", { postId, isEdit: true })
  }

  const handleDelete = () => {
    Alert.alert(
      "게시글 삭제",
      "정말로 이 게시글을 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await postService.deletePost(postId)
              navigation.goBack()
            } catch (error) {
              Alert.alert("오류", "게시글 삭제 중 오류가 발생했습니다.")
            }
          },
        },
      ],
    )
  }

  const handleStatusToggle = async () => {
    if (!post) return

    const newStatus = post.status === "active" ? "closed" : "active"
    const statusText = newStatus === "active" ? "모집 재개" : "모집 마감"

    Alert.alert(
      statusText,
      `이 게시글을 ${statusText}하시겠습니까?`,
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: statusText,
          onPress: async () => {
            try {
              await postService.updatePostStatus(postId, newStatus)
            } catch (error) {
              Alert.alert("오류", "상태 변경 중 오류가 발생했습니다.")
            }
          },
        },
      ],
    )
  }

  const isMyPost = post && userProfile && post.authorId === userProfile.uid

  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed([$container, { paddingTop: top + spacing.lg }])}>
          <View style={themed($header)}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon icon="caretLeft" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text preset="heading" text="게시글" style={themed($title)} />
            <View style={{ width: 24 }} />
          </View>
          <View style={themed($centerContainer)}>
            <Text text="로딩 중..." />
          </View>
        </View>
      </Screen>
    )
  }

  if (!post) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed([$container, { paddingTop: top + spacing.lg }])}>
          <View style={themed($header)}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon icon="caretLeft" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text preset="heading" text="게시글" style={themed($title)} />
            <View style={{ width: 24 }} />
          </View>
          <View style={themed($centerContainer)}>
            <Text text="게시글을 찾을 수 없습니다." />
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
          <Text preset="heading" text="게시글" style={themed($title)} />
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={themed($scrollView)} showsVerticalScrollIndicator={false}>
          {/* 상태 배지 */}
          <View style={themed($statusContainer)}>
            <View style={themed([$statusBadge, post.status === "active" ? $activeBadge : $closedBadge])}>
              <Text
                text={post.status === "active" ? "모집중" : "마감"}
                style={themed([$statusText, post.status === "active" ? $activeText : $closedText])}
              />
            </View>
          </View>

          {/* 제목 */}
          <Text preset="heading" text={post.title} style={themed($postTitle)} />

          {/* 작품 정보 */}
          <View style={themed($section)}>
            <Text preset="subheading" text="작품 정보" style={themed($sectionTitle)} />
            <Text text={post.production} style={themed($productionText)} />
          </View>

          {/* 단체 정보 */}
          <View style={themed($section)}>
            <Text preset="subheading" text="단체" style={themed($sectionTitle)} />
            <Text text={post.organizationName} style={themed($organizationText)} />
          </View>

          {/* 연습 일정 */}
          <View style={themed($section)}>
            <Text preset="subheading" text="연습 일정" style={themed($sectionTitle)} />
            <Text text={post.rehearsalSchedule} style={themed($infoText)} />
          </View>

          {/* 장소 */}
          <View style={themed($section)}>
            <Text preset="subheading" text="장소" style={themed($sectionTitle)} />
            <Text text={post.location} style={themed($infoText)} />
          </View>

          {/* 상세 설명 */}
          <View style={themed($section)}>
            <Text preset="subheading" text="상세 설명" style={themed($sectionTitle)} />
            <Text text={post.description} style={themed($descriptionText)} />
          </View>

          {/* 태그 */}
          {post.tags.length > 0 && (
            <View style={themed($section)}>
              <Text preset="subheading" text="태그" style={themed($sectionTitle)} />
              <View style={themed($tagsContainer)}>
                {post.tags.map((tag, index) => (
                  <View key={index} style={themed($tag)}>
                    <Text text={tag} style={themed($tagText)} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 작성자 정보 */}
          <View style={themed($section)}>
            <Text preset="subheading" text="작성자" style={themed($sectionTitle)} />
            <Text text={post.authorName} style={themed($infoText)} />
          </View>

          {/* 내 게시글인 경우 액션 버튼들 */}
          {isMyPost && (
            <View style={themed($actionSection)}>
              <Button
                text={post.status === "active" ? "모집 마감" : "모집 재개"}
                style={themed($actionButton)}
                onPress={handleStatusToggle}
              />
              <View style={themed($buttonRow)}>
                <Button
                  text="수정"
                  preset="default"
                  style={themed([$halfButton, $editButton])}
                  onPress={handleEdit}
                />
                <Button
                  text="삭제"
                  preset="default"
                  style={themed([$halfButton, $deleteButton])}
                  textStyle={themed($deleteButtonText)}
                  onPress={handleDelete}
                />
              </View>
            </View>
          )}
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

const $statusContainer = ({ spacing }) => ({
  alignItems: "flex-start",
  marginBottom: spacing.md,
})

const $statusBadge = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 8,
})

const $activeBadge = ({ colors }) => ({
  backgroundColor: colors.tint + "20",
})

const $closedBadge = ({ colors }) => ({
  backgroundColor: colors.textDim + "20",
})

const $statusText = {
  fontSize: 14,
  fontWeight: "bold",
}

const $activeText = ({ colors }) => ({
  color: colors.tint,
})

const $closedText = ({ colors }) => ({
  color: colors.textDim,
})

const $postTitle = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.lg,
})

const $section = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $sectionTitle = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.xs,
})

const $productionText = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "600",
})

const $organizationText = ({ colors }) => ({
  color: colors.tint,
  fontSize: 16,
  fontWeight: "500",
})

const $infoText = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  lineHeight: 24,
})

const $descriptionText = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  lineHeight: 24,
})

const $tagsContainer = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: spacing.xs,
})

const $tag = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 6,
  marginRight: spacing.xs,
  marginBottom: spacing.xs,
})

const $tagText = ({ colors }) => ({
  color: colors.palette.neutral600,
  fontSize: 14,
})

const $actionSection = ({ spacing }) => ({
  marginTop: spacing.lg,
  marginBottom: spacing.xl,
})

const $actionButton = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $buttonRow = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
})

const $halfButton = {
  flex: 0.48,
}

const $editButton = ({ colors }) => ({
  borderColor: colors.tint,
})

const $deleteButton = ({ colors }) => ({
  borderColor: colors.error,
})

const $deleteButtonText = ({ colors }) => ({
  color: colors.error,
})