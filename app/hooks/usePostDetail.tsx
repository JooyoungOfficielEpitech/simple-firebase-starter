import { useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { postService, userService, applicationService } from "@/services/firestore"
import { useAlert } from "@/hooks/useAlert"
import { Post } from "@/types/post"
import { UserProfile } from "@/types/user"
import { Application } from "@/services/firestore/applicationService"
import { AppStackParamList, BulletinBoardStackParamList } from "@/navigators/types"
import type { CompositeNavigationProp } from "@react-navigation/native"

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AppStackParamList>,
  NativeStackNavigationProp<BulletinBoardStackParamList>
>

export const usePostDetail = (postId: string) => {
  const navigation = useNavigation<NavigationProp>()
  const { alertState, alert, confirm, confirmDestructive, hideAlert } = useAlert()

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [hasApplied, setHasApplied] = useState(false)
  const [myApplication, setMyApplication] = useState<Application | null>(null)
  const [applicationMessage, setApplicationMessage] = useState("")
  const [applicationPhoneNumber, setApplicationPhoneNumber] = useState("")
  const [applicationExperience, setApplicationExperience] = useState("")
  const [applicationRolePreference, setApplicationRolePreference] = useState("")
  const [submittingApplication, setSubmittingApplication] = useState(false)

  // Load user profile and subscribe to post
  useEffect(() => {
    let hasIncrementedView = false

    const loadUserProfile = async () => {
      try {
        const profile = await userService.getUserProfile()
        console.log("🔍 [usePostDetail] 프로필 데이터:", JSON.stringify(profile, null, 2))
        setUserProfile(profile)

        // 프로필에 전화번호가 있으면 자동으로 채우기
        if (profile?.phoneNumber) {
          setApplicationPhoneNumber(profile.phoneNumber)
        }

        if (!profile) {
          console.warn("⚠️ [usePostDetail] 사용자 프로필이 존재하지 않습니다")
        } else {
          console.log("✅ [usePostDetail] requiredProfileComplete:", profile.requiredProfileComplete)
          console.log("📋 [usePostDetail] 프로필 필드 상태:", {
            name: !!profile.name,
            gender: !!profile.gender,
            birthday: !!profile.birthday,
            heightCm: typeof profile.heightCm === "number",
            phoneNumber: !!profile.phoneNumber
          })
        }
      } catch (error) {
        console.error("❌ [usePostDetail] 사용자 프로필 로드 오류:", error)
        alert(
          "프로필 오류",
          "사용자 프로필을 불러오는데 실패했습니다. 프로필을 먼저 설정해주세요.",
          [
            { text: "확인", onPress: () => navigation.goBack() }
          ]
        )
      }
    }

    loadUserProfile()

    const unsubscribe = postService.subscribeToPost(postId, (post) => {
      setPost(post)
      setLoading(false)
      
      if (post && !hasIncrementedView) {
        hasIncrementedView = true
        postService.incrementViewCount(postId)
      }
    })

    return unsubscribe
  }, [postId])

  // Subscribe to applications
  useEffect(() => {
    if (!post || !userProfile) return

    const isMyPost = post.authorId === userProfile.uid && userProfile.userType === "organizer"

    if (isMyPost) {
      const unsubscribeApplications = applicationService.subscribeToApplicationsByPost(
        postId,
        (apps) => setApplications(apps)
      )
      return unsubscribeApplications
    } else {
      console.log("🔔 [usePostDetail] 내 지원서 실시간 구독 시작:", { postId, applicantId: userProfile.uid })

      const unsubscribe = applicationService.db
        .collection("applications")
        .where("postId", "==", postId)
        .where("applicantId", "==", userProfile.uid)
        .limit(1)
        .onSnapshot(
          (snapshot) => {
            console.log("📡 [usePostDetail] onSnapshot 트리거됨:", {
              isEmpty: snapshot.empty,
              size: snapshot.size,
              timestamp: new Date().toISOString()
            })

            if (!snapshot.empty) {
              const doc = snapshot.docs[0]
              const application = {
                id: doc.id,
                ...doc.data(),
              } as Application

              console.log("✅ [usePostDetail] 지원서 상태 업데이트:", {
                id: application.id,
                status: application.status,
                hasApplied: true,
                timestamp: new Date().toISOString()
              })

              setHasApplied(true)
              setMyApplication(application)
            } else {
              console.log("📭 [usePostDetail] 지원서 없음 - 상태 초기화")
              setHasApplied(false)
              setMyApplication(null)
            }
          },
          (error) => {
            console.error("❌ [usePostDetail] 지원서 구독 오류:", error)
            setHasApplied(false)
            setMyApplication(null)
          }
        )

      return unsubscribe
    }
  }, [post, userProfile, postId])

  const handleDelete = () => {
    confirmDestructive(
      "게시글 삭제",
      "정말로 이 게시글을 삭제하시겠습니까?",
      "삭제",
      async () => {
        try {
          await postService.deletePost(postId)
          alert("삭제 완료", "게시글이 삭제되었습니다.", [
            {
              text: "확인",
              onPress: () => navigation.goBack(),
            },
          ])
        } catch (error) {
          const errorMessage = error.message || "게시글 삭제에 실패했습니다."
          alert("삭제 실패", errorMessage)
        }
      }
    )
  }

  const handleApplyButtonClick = () => {
    if (!userProfile) {
      alert(
        "프로필 설정 필요", 
        "지원하려면 프로필을 먼저 설정해주세요."
      )
      return
    }

    if (!userProfile.requiredProfileComplete) {
      alert(
        "프로필 완성 필요",
        "지원하려면 프로필 정보를 완성해주세요.\n(전화번호, 성별, 생년월일, 키 정보가 필요합니다)"
      )
      return
    }

    setShowApplicationModal(true)
  }

  const handleApply = async () => {
    if (hasApplied) {
      alert("이미 지원함", "이미 해당 공고에 지원하셨습니다.")
      return
    }

    if (!applicationPhoneNumber.trim()) {
      alert("입력 확인", "연락처를 입력해주세요.")
      return
    }

    const phoneRegex = /^[0-9-+\s()]{10,}$/
    if (!phoneRegex.test(applicationPhoneNumber.trim())) {
      alert("입력 확인", "올바른 전화번호 형식을 입력해주세요.")
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
      })
      
      setHasApplied(true)
      setShowApplicationModal(false)
      
      try {
        const myApps = await applicationService.getApplicationsByApplicant(userProfile.uid, { 
          limit: 10 
        })
        const myPostApplication = myApps.data.find(app => app.postId === postId)
        if (myPostApplication) {
          setMyApplication(myPostApplication)
        }
      } catch (error) {
        console.error("❌ [usePostDetail] 지원서 정보 다시 로드 실패:", error)
      }
      
      resetApplicationForm()
      alert("지원 완료", "지원이 완료되었습니다. 결과를 기다려주세요!")
    } catch (error) {
      const errorMessage = error.message || "지원에 실패했습니다."
      alert("지원 실패", errorMessage)
    } finally {
      setSubmittingApplication(false)
    }
  }

  const handleWithdrawApplication = () => {
    if (!myApplication) {
      alert("오류", "지원서 정보를 찾을 수 없습니다.")
      return
    }

    confirmDestructive(
      "지원 철회",
      "정말로 지원을 철회하시겠습니까?\n철회 후에는 다시 지원할 수 있습니다.",
      "철회",
      async () => {
        try {
          setSubmittingApplication(true)
          await applicationService.withdrawApplication(myApplication.id)
          
          alert("철회 완료", "지원이 철회되었습니다.\n다시 지원하실 수 있습니다.")
          
          setHasApplied(false)
          setMyApplication(null)
          setShowApplicationModal(false)
          resetApplicationForm()
        } catch (error) {
          console.error("❌ [usePostDetail] 지원 철회 오류:", error)
          alert("철회 실패", error.message || "지원 철회에 실패했습니다.")
        } finally {
          setSubmittingApplication(false)
        }
      }
    )
  }

  const handleViewApplications = () => {
    if (!post) return
    
    navigation.navigate("ApplicationManagement", {
      postId: post.id,
      postTitle: post.title
    })
  }

  const resetApplicationForm = () => {
    setApplicationMessage("")
    setApplicationPhoneNumber("")
    setApplicationExperience("")
    setApplicationRolePreference("")
  }

  const isMyPost = post && userProfile && post.authorId === userProfile.uid && userProfile.userType === "organizer"

  return {
    // State
    post,
    loading,
    userProfile,
    showApplicationModal,
    applications,
    hasApplied,
    myApplication,
    applicationMessage,
    applicationPhoneNumber,
    applicationExperience,
    applicationRolePreference,
    submittingApplication,
    isMyPost,
    alertState,

    // Setters
    setShowApplicationModal,
    setApplicationMessage,
    setApplicationPhoneNumber,
    setApplicationExperience,
    setApplicationRolePreference,

    // Handlers
    handleDelete,
    handleApplyButtonClick,
    handleApply,
    handleWithdrawApplication,
    handleViewApplications,
    hideAlert,
  }
}
