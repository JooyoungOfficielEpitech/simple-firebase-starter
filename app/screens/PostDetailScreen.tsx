import { useEffect, useState } from "react"
import { View, Alert, TouchableOpacity, Share, Modal, ScrollView } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import firestore from "@react-native-firebase/firestore"

import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { HeaderBackButton } from "@/components/HeaderBackButton"
import { translate } from "@/i18n"
import { postService, userService } from "@/services/firestore"
import { ApplicationService } from "@/services/firestore/applicationService"
import { useAppTheme } from "@/theme/context"
import { Post } from "@/types/post"
import { UserProfile } from "@/types/user"
import { Application } from "@/services/firestore/applicationService"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>
type RoutePropType = RouteProp<BulletinBoardStackParamList, "PostDetail">

// ApplicationService 인스턴스 생성
const applicationService = new ApplicationService(firestore())

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
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [hasApplied, setHasApplied] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState("")
  const [applicationPhoneNumber, setApplicationPhoneNumber] = useState("")
  const [applicationExperience, setApplicationExperience] = useState("")
  const [applicationRolePreference, setApplicationRolePreference] = useState("")
  const [applicationPortfolio, setApplicationPortfolio] = useState("")
  const [submittingApplication, setSubmittingApplication] = useState(false)
  // const [isFavorite, setIsFavorite] = useState(false) // Unused for now

  useEffect(() => {
    let hasIncrementedView = false
    
    // 사용자 프로필 로드
    const loadUserProfile = async () => {
      try {
        const profile = await userService.getUserProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error("❌ [PostDetailScreen] 사용자 프로필 로드 오류:", error)
      }
    }

    loadUserProfile()

    // 게시글 실시간 구독
    const unsubscribe = postService.subscribeToPost(postId, (post) => {
      setPost(post)
      setLoading(false)
      
      // 조회수 증가 (한 번만)
      if (post && !hasIncrementedView) {
        hasIncrementedView = true
        postService.incrementViewCount(postId)
      }
    })

    return unsubscribe
  }, [postId])

  // 지원자 데이터 로드 (운영자인 경우)
  useEffect(() => {
    if (!post || !userProfile) return

    const isMyPost = post.authorId === userProfile.uid && userProfile.userType === "organizer"
    
    if (isMyPost) {
      // 운영자인 경우 지원자 목록 구독
      const unsubscribeApplications = applicationService.subscribeToApplicationsByPost(
        postId,
        (apps) => setApplications(apps)
      )
      return unsubscribeApplications
    } else {
      // 일반 유저인 경우 본인의 지원 여부 확인
      const checkApplication = async () => {
        try {
          const applied = await applicationService.hasAppliedToPost(postId, userProfile.uid)
          setHasApplied(applied)
        } catch (error) {
          console.error("❌ [PostDetailScreen] 지원 여부 확인 오류:", error)
          // 오류 발생시 지원하기 버튼은 활성화
          setHasApplied(false)
        }
      }
      checkApplication()
    }
  }, [post, userProfile, postId])

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
              Alert.alert("삭제 완료", "게시글이 삭제되었습니다.", [
                {
                  text: "확인",
                  onPress: () => navigation.goBack(),
                },
              ])
            } catch (error) {
              const errorMessage = error.message || "게시글 삭제에 실패했습니다."
              Alert.alert("삭제 실패", errorMessage)
            }
          },
        },
      ],
    )
  }

  const handleApply = async () => {
    if (!userProfile) {
      Alert.alert("로그인 필요", "지원하려면 로그인이 필요합니다.")
      return
    }

    if (hasApplied) {
      Alert.alert("이미 지원함", "이미 해당 공고에 지원하셨습니다.")
      return
    }

    // 필수 필드 검증
    if (!applicationPhoneNumber.trim()) {
      Alert.alert("입력 확인", "연락처를 입력해주세요.")
      return
    }

    // 전화번호 형식 간단 검증
    const phoneRegex = /^[0-9-+\s()]{10,}$/
    if (!phoneRegex.test(applicationPhoneNumber.trim())) {
      Alert.alert("입력 확인", "올바른 전화번호 형식을 입력해주세요.")
      return
    }

    setSubmittingApplication(true)
    try {
      await applicationService.createApplication({
        postId,
        message: applicationMessage.trim() || undefined,
        phoneNumber: applicationPhoneNumber.trim() || undefined,
        experience: applicationExperience.trim() || undefined,
        rolePreference: applicationRolePreference.trim() || undefined,
        portfolio: applicationPortfolio.trim() || undefined,
      })
      
      setHasApplied(true)
      setShowApplicationModal(false)
      
      // 폼 초기화
      setApplicationMessage("")
      setApplicationPhoneNumber("")
      setApplicationExperience("")
      setApplicationRolePreference("")
      setApplicationPortfolio("")
      
      Alert.alert("지원 완료", "지원이 완료되었습니다. 결과를 기다려주세요!")
    } catch (error) {
      const errorMessage = error.message || "지원에 실패했습니다."
      Alert.alert("지원 실패", errorMessage)
    } finally {
      setSubmittingApplication(false)
    }
  }

  const handleViewApplications = () => {
    if (!post) return
    
    navigation.navigate("ApplicationManagement", {
      postId: post.id,
      postTitle: post.title
    })
  }


  const isMyPost = post && userProfile && post.authorId === userProfile.uid && userProfile.userType === "organizer"

  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed($container)}>
          {/* Header */}
          <View style={themed($header)}>
            <HeaderBackButton onPress={() => navigation.goBack()} />
            <Text
              text="게시글"
              preset="heading"
              style={themed($appTitle)}
            />
            <View style={themed($headerButtons)} />
          </View>
          <View style={themed($centerContainer) as any}>
            <Text text="로딩 중..." />
          </View>
        </View>
      </Screen>
    )
  }

  if (!post) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed($container)}>
          {/* Header */}
          <View style={themed($header)}>
            <HeaderBackButton onPress={() => navigation.goBack()} />
            <Text
              text="게시글"
              preset="heading"
              style={themed($appTitle)}
            />
            <View style={themed($headerButtons)} />
          </View>
          <View style={themed($centerContainer) as any}>
            <Text text="게시글을 찾을 수 없습니다." />
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <View style={themed($container)}>
        {/* Header */}
        <View style={themed($header)}>
          <HeaderBackButton onPress={() => navigation.goBack()} />
          <Text
            text="모집 공고"
            preset="heading"
            style={themed($appTitle)}
          />
          <View style={themed($headerButtons)}>
            {/* Action buttons can go here */}
          </View>
        </View>
        {/* Hero section with key info */}
        <View style={themed($heroCard)}>
          <View style={themed($statusHeader)}>
            <View style={themed(post.status === "active" ? $activeBadge : $closedBadge)}>
              <Text
                text={post.status === "active" ? "모집중" : "마감"}
                style={themed(post.status === "active" ? $activeText : $closedText)}
              />
            </View>
            {post.deadline && (
              <Text text={`마감일 ${post.deadline}`} style={themed($deadlineText)} />
            )}
          </View>
          
          <Text preset="heading" text={post.title} style={themed($postTitle)} />
          <Text text={post.production} style={themed($productionText) as any} />
          <Text text={post.organizationName} style={themed($organizationText) as any} />
          
          <View style={themed($keyInfoRow)}>
            <View style={themed($infoItem)}>
              <Text text="📍" style={themed($infoIcon)} />
              <Text text={post.location} style={themed($infoText)} />
            </View>
            <View style={themed($infoItem)}>
              <Text text="📅" style={themed($infoIcon)} />
              <Text text={post.rehearsalSchedule} style={themed($infoText)} />
            </View>
          </View>

          {/* 조회수 및 지원자 수 */}
          <View style={themed($statsRow)}>
            <View style={themed($statItem)}>
              <Text text="👁️" style={themed($statIcon)} />
              <Text text={`조회 ${post.viewCount || 0}`} style={themed($statText)} />
            </View>
            {isMyPost && (
              <View style={themed($statItem)}>
                <Text text="👥" style={themed($statIcon)} />
                <Text text={`지원자 ${applications.length}`} style={themed($statText)} />
              </View>
            )}
          </View>
          
          {/* 액션 버튼들 */}
          <View style={themed($actionButtonsRow)}>
            {!isMyPost && userProfile?.userType !== "organizer" && (
              <TouchableOpacity 
                style={themed(hasApplied ? $appliedButton : $applyButton)}
                onPress={hasApplied ? undefined : () => setShowApplicationModal(true)}
                disabled={hasApplied || post.status !== "active"}
              >
                <Text 
                  text={hasApplied ? "✅ 지원완료" : "💼 지원하기"} 
                  style={themed(hasApplied ? $appliedButtonText : $applyButtonText)} 
                />
              </TouchableOpacity>
            )}
            
            {isMyPost && (
              <TouchableOpacity 
                style={themed($manageButton)}
                onPress={handleViewApplications}
              >
                <Text text={`👥 지원자 관리 (${applications.length})`} style={themed($manageButtonText)} />
              </TouchableOpacity>
            )}

            {post.contact && (
              <TouchableOpacity 
                style={themed($contactButton)}
                onPress={() => console.log("Quick contact", post.contact)} // 연락 기능 구현 예정
              >
                <Text text="📞 문의하기" style={themed($contactButtonText)} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* 상세 설명 */}
        <View style={themed($section)}>
          <Text preset="subheading" text="상세 설명" style={themed($sectionTitle)} />
          <Text text={post.description} style={themed($descriptionText)} />
        </View>

        {/* Role cards with improved layout */}
        {post.roles && post.roles.length > 0 && (
          <View style={themed($section)}>
            <Text preset="subheading" text="모집 역할" style={themed($sectionTitle)} />
            {post.roles.map((role, index) => (
              <View key={index} style={themed($roleCard)}>
                <View style={themed($roleHeader)}>
                  <Text text={role.name} style={themed($roleName) as any} />
                  <View style={themed($roleCountBadge)}>
                    <Text text={`${role.count}명`} style={themed($roleCountText)} />
                  </View>
                </View>
                <View style={themed($roleDetails)}>
                  <View style={themed($roleDetailItem)}>
                    <Text text="👤" style={themed($roleIcon)} />
                    <Text text={role.ageRange} style={themed($roleDetailText)} />
                  </View>
                  <View style={themed($roleDetailItem)}>
                    <Text text={role.gender === 'male' ? '♂️' : role.gender === 'female' ? '♀️' : '👥'} style={themed($roleIcon)} />
                    <Text text={role.gender === 'male' ? '남성' : role.gender === 'female' ? '여성' : '성별무관'} style={themed($roleDetailText)} />
                  </View>
                </View>
                <Text text={role.requirements} style={themed($roleRequirements)} />
              </View>
            ))}
          </View>
        )}

        {/* 오디션 정보 */}
        {post.audition && (
          <View style={themed($section)}>
            <Text preset="subheading" text="오디션 정보" style={themed($sectionTitle)} />
            <Text text={`일정: ${post.audition.date}`} style={themed($infoText)} />
            <Text text={`장소: ${post.audition.location}`} style={themed($infoText)} />
            <Text text={`방식: ${post.audition.method}`} style={themed($infoText)} />
          </View>
        )}

        {/* 연락처 */}
        {post.contact && (
          <View style={themed($section)}>
            <Text preset="subheading" text="연락처" style={themed($sectionTitle)} />
            <Text text={post.contact.email} style={themed($contactText) as any} />
            {post.contact.phone && <Text text={post.contact.phone} style={themed($infoText)} />}
          </View>
        )}

        {/* 운영자 액션 버튼들 */}
        {isMyPost && (
          <View style={themed($actionButtonsContainer)}>
            <TouchableOpacity
              style={themed($editButton)}
              onPress={() => navigation.navigate("CreatePost", { postId: post.id, isEdit: true })}
              accessibilityLabel={translate("bulletinBoard:actions.editPost")}
            >
              <Text text="✏️" style={themed($buttonIcon)} />
              <Text text={translate("bulletinBoard:actions.edit")} style={themed($editButtonText)} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={themed($deleteButton)}
              onPress={handleDelete}
              accessibilityLabel={translate("bulletinBoard:actions.deletePost")}
            >
              <Text text="🗑️" style={themed($buttonIcon)} />
              <Text text={translate("bulletinBoard:actions.delete")} style={themed($deleteButtonText)} />
            </TouchableOpacity>
          </View>
        )}

        {/* 지원하기 모달 */}
        <Modal
          visible={showApplicationModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowApplicationModal(false)}
        >
          <View style={themed($modalOverlay)}>
            <View style={themed($modalContent)}>
              <View style={themed($modalHeader)}>
                <Text preset="subheading" text="지원하기" style={themed($modalTitle)} />
                <TouchableOpacity 
                  onPress={() => setShowApplicationModal(false)}
                  style={themed($closeButton)}
                >
                  <Text text="✕" style={themed($closeButtonText)} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={themed($modalScrollView)} 
                showsVerticalScrollIndicator={false}
              >
                <Text text={post?.title || ""} style={themed($modalPostTitle)} />
                <Text text={post?.organizationName || ""} style={themed($modalOrgName)} />

                {/* 모집 역할 정보 표시 */}
                {post?.roles && post.roles.length > 0 && (
                  <View style={themed($rolesSection)}>
                    <Text text="모집 역할:" style={themed($sectionLabel)} />
                    {post.roles.map((role, index) => (
                      <View key={index} style={themed($roleItem)}>
                        <Text text={`• ${role.name} (${role.count}명)`} style={themed($roleItemText)} />
                        <Text text={`  ${role.gender === 'male' ? '남성' : role.gender === 'female' ? '여성' : '성별무관'}, ${role.ageRange}`} style={themed($modalRoleDetailText)} />
                      </View>
                    ))}
                  </View>
                )}

                {/* 연락처 */}
                <TextField
                  label="연락처 *"
                  placeholder="전화번호를 입력해주세요"
                  value={applicationPhoneNumber}
                  onChangeText={setApplicationPhoneNumber}
                  style={themed($formInput)}
                  keyboardType="phone-pad"
                />

                {/* 지원 역할 선택 */}
                {post?.roles && post.roles.length > 1 && (
                  <TextField
                    label="지원하고자 하는 역할"
                    placeholder="희망하는 역할을 선택하거나 입력해주세요"
                    value={applicationRolePreference}
                    onChangeText={setApplicationRolePreference}
                    style={themed($formInput)}
                  />
                )}

                {/* 경력/경험 */}
                <TextField
                  label="관련 경력 및 경험"
                  placeholder="연기, 노래, 춤 등 관련 경험을 작성해주세요"
                  value={applicationExperience}
                  onChangeText={setApplicationExperience}
                  multiline
                  numberOfLines={3}
                  style={themed($formInput)}
                />

                {/* 포트폴리오 */}
                <TextField
                  label="포트폴리오 URL"
                  placeholder="YouTube, Instagram 등 포트폴리오 링크 (선택사항)"
                  value={applicationPortfolio}
                  onChangeText={setApplicationPortfolio}
                  style={themed($formInput)}
                  keyboardType="url"
                />

                {/* 지원 동기 */}
                <TextField
                  label="지원 동기 및 자기소개"
                  placeholder="지원 동기나 자기소개를 작성해주세요"
                  value={applicationMessage}
                  onChangeText={setApplicationMessage}
                  multiline
                  numberOfLines={4}
                  style={themed($formInput)}
                />
              </ScrollView>

              <View style={themed($modalButtons)}>
                <TouchableOpacity 
                  style={themed($cancelButton)}
                  onPress={() => setShowApplicationModal(false)}
                >
                  <Text text="취소" style={themed($cancelButtonText)} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={themed($submitButton)}
                  onPress={handleApply}
                  disabled={submittingApplication}
                >
                  <Text 
                    text={submittingApplication ? "지원 중..." : "지원하기"} 
                    style={themed($submitButtonText)} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Screen>
  )
}

const $container = ({ spacing }) => ({
  flexGrow: 1,
  backgroundColor: "transparent",
  paddingHorizontal: spacing.lg,
})

const $header = ({ spacing, colors }) => ({
  paddingHorizontal: 0,
  paddingVertical: spacing.md,
  backgroundColor: colors.background,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
})

const $appTitle = ({ colors, typography, spacing }) => ({
  textAlign: "center" as const,
  color: colors.palette.primary500,
  fontFamily: typography.primary.bold,
  flex: 1,
})

const $backButton = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  minWidth: 44,
  minHeight: 44,
  justifyContent: "center" as const,
  alignItems: "center" as const,
})

const $backButtonText = ({ colors, typography }) => ({
  fontSize: 24,
  color: colors.palette.primary500,
  fontFamily: typography.primary.bold,
})

const $headerButtons = () => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  minWidth: 44, // 균형을 위한 최소 너비
})

const $centerContainer = {
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
}

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

const $productionText = ({ colors }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "600" as const,
})

const $organizationText = ({ colors }) => ({
  color: colors.tint,
  fontSize: 16,
  fontWeight: "500" as const,
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

// Role-related styles
const $roleCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.md,
  marginBottom: spacing.sm,
})

const $roleName = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "600" as const,
})

const $roleDetail = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginBottom: 2,
})

const $roleRequirements = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 14,
  marginTop: spacing.xs,
})

const $contactText = ({ colors }) => ({
  color: colors.tint,
  fontSize: 16,
  fontWeight: "500" as const,
})

// Action button styles
const $actionButtonsContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginTop: spacing.lg,
  gap: spacing.md,
  paddingHorizontal: spacing.md,
})

// 새로운 통일된 버튼 스타일
const $editButton = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 20,
  borderRadius: 25,
  minWidth: 120,
  minHeight: 50,
  shadowColor: colors.palette.primary500,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
})

const $editButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  marginLeft: 6,
})

const $deleteButton = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.palette.angry500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 20,
  borderRadius: 25,
  minWidth: 120,
  minHeight: 50,
  shadowColor: colors.palette.angry500,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
})

const $deleteButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  marginLeft: 6,
})

// 새로운 PostDetail 스타일들
const $heroCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.lg || 16,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral500,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $statusHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

const $deadlineText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 18,
  color: colors.textDim,
  fontFamily: typography.primary.medium,
})

const $keyInfoRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing?.lg || 16,
  marginTop: spacing?.sm || 8,
  marginBottom: spacing?.md || 12,
})

const $infoItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  flex: 1,
})

const $infoIcon = {
  fontSize: 16,
  marginRight: 8,
}

const $quickContactButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  marginTop: spacing?.sm || 8,
})

const $quickContactText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

const $roleHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

const $roleCountBadge = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 2,
  borderRadius: 12,
})

const $roleCountText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 12,
  lineHeight: 16,
  fontFamily: typography.primary.medium,
})

const $roleDetails = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing?.md || 12,
  marginBottom: spacing?.xs || 4,
})

const $roleDetailItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
})

const $roleIcon = {
  fontSize: 14,
  marginRight: 4,
}

const $roleDetailText = ({ colors, typography }) => ({
  fontSize: 13,
  lineHeight: 20,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

// 개선된 액션 버튼 스타일들
const $primaryActionButton = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  marginBottom: spacing?.sm || 8,
  minHeight: 48,
})

const $primaryActionText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  marginLeft: 8,
})

const $secondaryActionButton = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  marginBottom: spacing?.sm || 8,
  minHeight: 48,
})

const $secondaryActionText = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  marginLeft: 8,
})

const $dangerActionButton = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.palette.angry500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  minHeight: 48,
})

const $dangerActionText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  marginLeft: 8,
})

const $buttonIcon = {
  fontSize: 18,
}

// Badge 스타일들 (BulletinBoardScreen에서 가져옴)
const $activeBadge = ({ colors, spacing }) => ({
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: colors.palette.primary500 + "20",
})

const $closedBadge = ({ colors, spacing }) => ({
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: colors.textDim + "20",
})

const $activeText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary500,
})

const $closedText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 16,
  fontFamily: typography.primary.medium,
  color: colors.textDim,
})

// 새로운 스타일들
const $statsRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginTop: spacing?.sm || 8,
  marginBottom: spacing?.md || 12,
})

const $statItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
})

const $statIcon = {
  fontSize: 14,
  marginRight: 6,
}

const $statText = ({ colors, typography }) => ({
  fontSize: 13,
  lineHeight: 18,
  color: colors.textDim,
  fontFamily: typography.primary.medium,
})

const $actionButtonsRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing?.sm || 8,
  marginTop: spacing?.md || 12,
  flexWrap: "wrap" as const,
})

const $applyButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  flex: 1,
  minWidth: 100,
})

const $applyButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

const $appliedButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral400,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  flex: 1,
  minWidth: 100,
})

const $appliedButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

const $manageButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.secondary500 || colors.tint,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  flex: 1,
  minWidth: 120,
})

const $manageButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

const $contactButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  flex: 1,
  minWidth: 100,
})

const $contactButtonText = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

// 모달 스타일들
const $modalOverlay = ({ colors }) => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center" as const,
  alignItems: "center" as const,
  padding: 20,
})

const $modalContent = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing?.lg || 16,
  width: "100%" as const,
  maxWidth: 400,
  maxHeight: "80%" as const,
})

const $modalHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.md || 12,
})

const $modalTitle = ({ colors }) => ({
  color: colors.text,
  flex: 1,
})

const $closeButton = ({ spacing }) => ({
  padding: spacing?.xs || 4,
  minWidth: 32,
  minHeight: 32,
  justifyContent: "center" as const,
  alignItems: "center" as const,
})

const $closeButtonText = ({ colors }) => ({
  fontSize: 18,
  color: colors.textDim,
})

const $modalPostTitle = ({ colors, typography, spacing }) => ({
  fontSize: 16,
  lineHeight: 24,
  color: colors.text,
  fontFamily: typography.primary.medium,
  marginBottom: spacing?.xs || 4,
})

const $modalOrgName = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.tint,
  fontFamily: typography.primary.normal,
  marginBottom: spacing?.lg || 16,
})

const $messageInput = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
})

const $modalButtons = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing?.sm || 8,
})

const $cancelButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  alignItems: "center" as const,
  flex: 1,
})

const $cancelButtonText = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
})

const $submitButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  alignItems: "center" as const,
  flex: 1,
})

const $submitButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
})

// 새로운 스타일들
const $modalScrollView = ({ spacing }) => ({
  maxHeight: 400,
  marginBottom: spacing?.md || 12,
})

const $rolesSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
  padding: spacing?.sm || 8,
  backgroundColor: "rgba(0, 0, 0, 0.03)",
  borderRadius: 8,
})

const $sectionLabel = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.text,
  fontFamily: typography.primary.medium,
  marginBottom: spacing?.xs || 4,
})

const $roleItem = ({ spacing }) => ({
  marginBottom: spacing?.xs || 4,
})

const $roleItemText = ({ colors, typography }) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.text,
  fontFamily: typography.primary.medium,
})

const $modalRoleDetailText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 16,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

const $formInput = ({ spacing }) => ({
  marginBottom: spacing?.md || 12,
})