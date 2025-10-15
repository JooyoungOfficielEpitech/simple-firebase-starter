import { useEffect, useState } from "react"
import { View, TouchableOpacity, Share, Modal, ScrollView, Image, Dimensions } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import firestore from "@react-native-firebase/firestore"

import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { AlertModal } from "@/components/AlertModal"
import { translate } from "@/i18n"
import { postService, userService } from "@/services/firestore"
import { ApplicationService } from "@/services/firestore/applicationService"
import { useAppTheme } from "@/theme/context"
import { useAlert } from "@/hooks/useAlert"
import { Post } from "@/types/post"
import { UserProfile } from "@/types/user"
import { Application } from "@/services/firestore/applicationService"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>
type RoutePropType = RouteProp<BulletinBoardStackParamList, "PostDetail">

// ApplicationService 인스턴스 생성
const applicationService = new ApplicationService(firestore())

// 화면 크기 가져오기
const { width: screenWidth } = Dimensions.get('window')

// 이미지 갤러리 컴포넌트
const ImageGallery = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(contentOffsetX / screenWidth)
    setCurrentIndex(index)
  }

  return (
    <View style={themed($imageGalleryContainer)}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={themed($imageScrollView)}
        contentContainerStyle={{ alignItems: 'flex-start' }}
        bounces={false}
      >
        {images.map((imageUrl, index) => (
          <View key={index} style={themed($imageContainer)}>
            <Image
              source={{ uri: imageUrl }}
              style={themed($galleryImage)}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
      
      {/* 이미지 인디케이터 */}
      {images.length > 1 && (
        <View style={themed($indicatorContainer)}>
          {images.map((_, index) => (
            <View
              key={index}
              style={themed(
                index === currentIndex ? $activeIndicator : $inactiveIndicator
              )}
            />
          ))}
        </View>
      )}
      
      {/* 이미지 카운터 */}
      {images.length > 1 && (
        <View style={themed($counterContainer)}>
          <Text
            text={`${currentIndex + 1} / ${images.length}`}
            style={themed($counterText)}
          />
        </View>
      )}
    </View>
  )
}

export const PostDetailScreen = () => {
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RoutePropType>()
  const { postId } = route.params
  
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

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
  const [applicationPortfolio, setApplicationPortfolio] = useState("")
  const [submittingApplication, setSubmittingApplication] = useState(false)
  // const [isFavorite, setIsFavorite] = useState(false) // Unused for now

  useEffect(() => {
    let hasIncrementedView = false
    
    // 사용자 프로필 로드
    const loadUserProfile = async () => {
      try {
        const profile = await userService.getUserProfile()
        console.log("🔍 [PostDetailScreen] 프로필 데이터:", JSON.stringify(profile, null, 2))
        setUserProfile(profile)
        if (!profile) {
          console.warn("⚠️ [PostDetailScreen] 사용자 프로필이 존재하지 않습니다")
        } else {
          console.log("✅ [PostDetailScreen] requiredProfileComplete:", profile.requiredProfileComplete)
          console.log("📋 [PostDetailScreen] 프로필 필드 상태:", {
            name: !!profile.name,
            gender: !!profile.gender,
            birthday: !!profile.birthday,
            heightCm: typeof profile.heightCm === "number"
          })
        }
      } catch (error) {
        console.error("❌ [PostDetailScreen] 사용자 프로필 로드 오류:", error)
        // 프로필 로드 실패 시 더 구체적인 오류 메시지
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
      // 일반 유저인 경우 본인의 지원 여부 및 지원서 정보 확인
      const checkApplication = async () => {
        try {
          const applied = await applicationService.hasAppliedToPost(postId, userProfile.uid)
          setHasApplied(applied)
          
          if (applied) {
            // 지원한 경우 해당 게시글의 지원서 정보 가져오기
            const myApps = await applicationService.getApplicationsByApplicant(userProfile.uid, { 
              limit: 10 
            })
            // 클라이언트에서 해당 게시글 지원서 찾기
            const myPostApplication = myApps.data.find(app => app.postId === postId)
            if (myPostApplication) {
              setMyApplication(myPostApplication)
            }
          }
        } catch (error) {
          console.error("❌ [PostDetailScreen] 지원 여부 확인 오류:", error)
          // 오류 발생시 지원하기 버튼은 활성화
          setHasApplied(false)
          setMyApplication(null)
        }
      }
      checkApplication()
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
    // 프로필 완성도를 먼저 체크
    if (!userProfile) {
      alert(
        "프로필 설정 필요", 
        "지원하려면 프로필을 먼저 설정해주세요."
      )
      return
    }

    // 필수 프로필 정보 완성도 확인
    if (!userProfile.requiredProfileComplete) {
      alert(
        "프로필 완성 필요",
        "지원하려면 프로필 정보를 완성해주세요.\n(성별, 생년월일, 키 정보가 필요합니다)"
      )
      return
    }

    // 프로필이 완성된 경우에만 지원 모달 열기
    setShowApplicationModal(true)
  }

  const handleApply = async () => {
    // 프로필 체크는 이미 handleApplyButtonClick에서 수행됨
    if (hasApplied) {
      alert("이미 지원함", "이미 해당 공고에 지원하셨습니다.")
      return
    }

    // 필수 필드 검증
    if (!applicationPhoneNumber.trim()) {
      alert("입력 확인", "연락처를 입력해주세요.")
      return
    }

    // 전화번호 형식 간단 검증
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
        portfolio: applicationPortfolio.trim() || undefined,
      })
      
      setHasApplied(true)
      setShowApplicationModal(false)
      
      // 새로 생성된 지원서 정보 다시 로드
      try {
        const myApps = await applicationService.getApplicationsByApplicant(userProfile.uid, { 
          limit: 10 
        })
        const myPostApplication = myApps.data.find(app => app.postId === postId)
        if (myPostApplication) {
          setMyApplication(myPostApplication)
        }
      } catch (error) {
        console.error("❌ [PostDetailScreen] 지원서 정보 다시 로드 실패:", error)
      }
      
      // 폼 초기화
      setApplicationMessage("")
      setApplicationPhoneNumber("")
      setApplicationExperience("")
      setApplicationRolePreference("")
      setApplicationPortfolio("")
      
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
          
          // 상태 초기화 - 다시 지원 가능하도록
          setHasApplied(false)
          setMyApplication(null)
          setShowApplicationModal(false)
          
          // 폼 초기화
          setApplicationMessage("")
          setApplicationPhoneNumber("")
          setApplicationExperience("")
          setApplicationRolePreference("")
          setApplicationPortfolio("")
        } catch (error) {
          console.error("❌ [PostDetailScreen] 지원 철회 오류:", error)
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


  const isMyPost = post && userProfile && post.authorId === userProfile.uid && userProfile.userType === "organizer"

  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader title="게시글" />
        <View style={themed($container)}>
          <View style={themed($centerContainer) as any}>
            <Text text="로딩 중..." />
          </View>
        </View>
      </Screen>
    )
  }

  if (!post) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader title="게시글" />
        <View style={themed($container)}>
          <View style={themed($centerContainer) as any}>
            <Text text="게시글을 찾을 수 없습니다." />
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={[]}>
      <ScreenHeader title="모집 공고" />
      <View style={themed($container)}>
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
            <View style={themed($statItem)}>
              <Text text="👥" style={themed($statIcon)} />
              <Text text={`지원자 ${isMyPost ? applications.length : 0}`} style={themed($statText)} />
            </View>
          </View>
          
          {/* 액션 버튼들 */}
          <View style={themed($actionButtonsRow)}>
            {!isMyPost && userProfile?.userType !== "organizer" && (
              <View style={themed($applicationButtonContainer)}>
                {!hasApplied || !myApplication ? (
                  <TouchableOpacity 
                    style={themed($applyButton)}
                    onPress={handleApplyButtonClick}
                    disabled={post.status !== "active"}
                  >
                    <Text 
                      text="지원하기" 
                      style={themed($applyButtonText)} 
                    />
                  </TouchableOpacity>
                ) : myApplication.status === 'pending' ? (
                  <TouchableOpacity 
                    style={themed($withdrawButton)}
                    onPress={handleWithdrawApplication}
                    disabled={submittingApplication}
                  >
                    <Text 
                      text={submittingApplication ? "철회 중..." : "❌ 취소"} 
                      style={themed($withdrawButtonText)} 
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={themed($statusButton(myApplication.status))}
                    disabled={true}
                  >
                    <Text 
                      text={myApplication.status === 'accepted' ? '승인됨' : 
                            myApplication.status === 'rejected' ? '거절됨' : 
                            myApplication.status === 'withdrawn' ? '철회됨' : '상태 확인 중'}
                      style={themed($statusButtonText)} 
                    />
                  </TouchableOpacity>
                )}
              </View>
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
        

        {/* 이미지 갤러리 (Images 모드인 경우) - 전체 화면 너비 */}
        {(post.postType === 'images' || post.images?.length > 0) && post.images && post.images.length > 0 && (
          <View style={themed($fullWidthImageSection)}>
            <ImageGallery images={post.images} />
          </View>
        )}

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
            <View style={themed($auditionCard)}>
              <View style={themed($auditionInfoRow)}>
                <Text text="📅" style={themed($infoIcon)} />
                <Text text={`일정: ${post.audition.date}`} style={themed($infoText)} />
              </View>
              <View style={themed($auditionInfoRow)}>
                <Text text="📍" style={themed($infoIcon)} />
                <Text text={`장소: ${post.audition.location}`} style={themed($infoText)} />
              </View>
              <View style={themed($auditionInfoRow)}>
                <Text text="💻" style={themed($infoIcon)} />
                <Text text={`방식: ${post.audition.method}`} style={themed($infoText)} />
              </View>
              {post.audition.resultDate && (
                <View style={themed($auditionInfoRow)}>
                  <Text text="🗓️" style={themed($infoIcon)} />
                  <Text text={`결과 발표: ${post.audition.resultDate}`} style={themed($infoText)} />
                </View>
              )}
              {post.audition.requirements && post.audition.requirements.length > 0 && (
                <View style={themed($preparationSection)}>
                  <Text text="📋 준비사항" style={themed($preparationTitle)} />
                  {post.audition.requirements.map((requirement, index) => (
                    <View key={index} style={themed($preparationItem)}>
                      <Text text="•" style={themed($bulletPoint)} />
                      <Text text={requirement} style={themed($preparationText)} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* 공연 정보 */}
        {post.performance && (
          <View style={themed($section)}>
            <Text preset="subheading" text="공연 정보" style={themed($sectionTitle)} />
            <View style={themed($performanceCard)}>
              {post.performance.dates && post.performance.dates.length > 0 && (
                <View style={themed($performanceInfoRow)}>
                  <Text text="🎭" style={themed($infoIcon)} />
                  <View style={themed($performanceDetails)}>
                    <Text text="공연 일정" style={themed($performanceLabel)} />
                    {post.performance.dates.map((date, index) => (
                      <Text key={index} text={`• ${date}`} style={themed($performanceDate)} />
                    ))}
                  </View>
                </View>
              )}
              {post.performance.venue && (
                <View style={themed($performanceInfoRow)}>
                  <Text text="🏛️" style={themed($infoIcon)} />
                  <View style={themed($performanceDetails)}>
                    <Text text="공연 장소" style={themed($performanceLabel)} />
                    <Text text={post.performance.venue} style={themed($performanceText)} />
                  </View>
                </View>
              )}
              {post.performance.ticketPrice && (
                <View style={themed($performanceInfoRow)}>
                  <Text text="🎫" style={themed($infoIcon)} />
                  <View style={themed($performanceDetails)}>
                    <Text text="티켓 가격" style={themed($performanceLabel)} />
                    <Text text={post.performance.ticketPrice} style={themed($performanceText)} />
                  </View>
                </View>
              )}
              {post.performance.targetAudience && (
                <View style={themed($performanceInfoRow)}>
                  <Text text="👥" style={themed($infoIcon)} />
                  <View style={themed($performanceDetails)}>
                    <Text text="관객 대상" style={themed($performanceLabel)} />
                    <Text text={post.performance.targetAudience} style={themed($performanceText)} />
                  </View>
                </View>
              )}
              {post.performance.genre && (
                <View style={themed($performanceInfoRow)}>
                  <Text text="🎨" style={themed($infoIcon)} />
                  <View style={themed($performanceDetails)}>
                    <Text text="장르" style={themed($performanceLabel)} />
                    <Text text={post.performance.genre} style={themed($performanceText)} />
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 혜택 정보 */}
        {post.benefits && (
          <View style={themed($section)}>
            <Text preset="subheading" text="혜택 정보" style={themed($sectionTitle)} />
            <View style={themed($benefitsCard)}>
              {post.benefits.fee && (
                <View style={themed($benefitRow)}>
                  <Text text="💰" style={themed($benefitIcon)} />
                  <View style={themed($benefitContent)}>
                    <Text text="출연료/활동비" style={themed($benefitLabel)} />
                    <Text text={post.benefits.fee} style={themed($benefitValue)} />
                  </View>
                </View>
              )}
              
              {/* 제공 혜택들 */}
              <View style={themed($providedBenefits)}>
                <Text text="🎁 제공 혜택" style={themed($benefitSectionTitle)} />
                <View style={themed($benefitsList)}>
                  {post.benefits.transportation && (
                    <View style={themed($benefitItem)}>
                      <Text text="✅ 🚗 교통비 지원" style={themed($benefitItemText)} />
                    </View>
                  )}
                  {post.benefits.costume && (
                    <View style={themed($benefitItem)}>
                      <Text text="✅ 👗 의상 제공" style={themed($benefitItemText)} />
                    </View>
                  )}
                  {post.benefits.portfolio && (
                    <View style={themed($benefitItem)}>
                      <Text text="✅ 📸 포트폴리오 제공" style={themed($benefitItemText)} />
                    </View>
                  )}
                  {post.benefits.photography && (
                    <View style={themed($benefitItem)}>
                      <Text text="✅ 📷 프로필 촬영" style={themed($benefitItemText)} />
                    </View>
                  )}
                  {post.benefits.meals && (
                    <View style={themed($benefitItem)}>
                      <Text text="✅ 🍽️ 식사 제공" style={themed($benefitItemText)} />
                    </View>
                  )}
                </View>
              </View>

              {/* 기타 혜택 */}
              {post.benefits.other && post.benefits.other.length > 0 && (
                <View style={themed($otherBenefits)}>
                  <Text text="🌟 기타 혜택" style={themed($benefitSectionTitle)} />
                  {post.benefits.other.map((benefit, index) => (
                    <View key={index} style={themed($benefitItem)}>
                      <Text text="•" style={themed($bulletPoint)} />
                      <Text text={benefit} style={themed($otherBenefitText)} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* 연락처 */}
        {post.contact && (
          <View style={themed($section)}>
            <Text preset="subheading" text="연락처 정보" style={themed($sectionTitle)} />
            <View style={themed($contactCard)}>
              <View style={themed($contactRow)}>
                <Text text="📧" style={themed($contactIcon)} />
                <View style={themed($contactContent)}>
                  <Text text="담당자 이메일" style={themed($contactLabel)} />
                  <Text text={post.contact.email} style={themed($contactText) as any} />
                </View>
              </View>
              
              {post.contact.phone && (
                <View style={themed($contactRow)}>
                  <Text text="📞" style={themed($contactIcon)} />
                  <View style={themed($contactContent)}>
                    <Text text="연락처" style={themed($contactLabel)} />
                    <Text text={post.contact.phone} style={themed($contactValue)} />
                  </View>
                </View>
              )}

              {post.contact.applicationMethod && (
                <View style={themed($contactRow)}>
                  <Text text="📝" style={themed($contactIcon)} />
                  <View style={themed($contactContent)}>
                    <Text text="지원 방법" style={themed($contactLabel)} />
                    <Text text={post.contact.applicationMethod} style={themed($contactValue)} />
                  </View>
                </View>
              )}

              {post.contact.requiredDocuments && post.contact.requiredDocuments.length > 0 && (
                <View style={themed($documentsSection)}>
                  <View style={themed($contactRow)}>
                    <Text text="📄" style={themed($contactIcon)} />
                    <View style={themed($contactContent)}>
                      <Text text="제출 서류" style={themed($contactLabel)} />
                      <View style={themed($documentsList)}>
                        {post.contact.requiredDocuments.map((document, index) => (
                          <View key={index} style={themed($documentItem)}>
                            <Text text="•" style={themed($bulletPoint)} />
                            <Text text={document} style={themed($documentText)} />
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 태그 정보 */}
        {post.tags && post.tags.length > 0 && (
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
  flexGrow: 1,
  backgroundColor: "transparent",
  paddingHorizontal: spacing.lg,
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
  justifyContent: "space-around" as const,
  alignItems: "center" as const,
  marginTop: spacing?.sm || 8,
  marginBottom: spacing?.md || 12,
})

const $infoItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  flex: 1,
  justifyContent: "center" as const,
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
  justifyContent: "space-around" as const,
  alignItems: "center" as const,
  marginTop: spacing?.sm || 8,
  marginBottom: spacing?.md || 12,
})

const $statItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  flex: 1,
  justifyContent: "center" as const,
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

// 기존 지원하기 버튼과 동일한 스타일 유지
const $applicationButtonContainer = ({ spacing }) => ({
  flex: 1,
})

const $appliedButtonsRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing?.sm || 8,
  width: "100%",
  alignItems: "stretch" as const,
})

// 기존 $applyButton 스타일을 기반으로 상태별 색상만 변경
// 지원하기 버튼과 정확히 동일한 스타일, 상태별 색상만 변경
const $statusButton = (status: string) => ({ colors, spacing }) => ({
  backgroundColor: 
    status === 'pending' ? colors.palette.warning500 :
    status === 'accepted' ? '#22c55e' : // 초록색
    status === 'rejected' ? colors.palette.angry500 :
    colors.palette.neutral500,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  flex: 1,
  minWidth: 100,
})

// 지원하기 버튼과 동일한 텍스트 스타일
const $statusButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

// 지원하기 버튼과 정확히 동일한 스타일, 색상만 빨간색
const $withdrawButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.angry500,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  flex: 1,
  minWidth: 100,
})

const $withdrawButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

// 오디션 정보 스타일들
const $auditionCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral50,
  borderRadius: 12,
  padding: spacing?.md || 12,
  borderLeftWidth: 4,
  borderLeftColor: colors.palette.primary500,
})

const $auditionInfoRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

const $preparationSection = ({ spacing }) => ({
  marginTop: spacing?.md || 12,
  paddingTop: spacing?.sm || 8,
  borderTopWidth: 1,
  borderTopColor: "rgba(0,0,0,0.1)",
})

const $preparationTitle = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.xs || 4,
})

const $preparationItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "flex-start" as const,
  marginBottom: spacing?.xs || 4,
})

const $preparationText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
  flex: 1,
  marginLeft: 8,
})

const $bulletPoint = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
  marginRight: 4,
})

// 공연 정보 스타일들
const $performanceCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.secondary50 || colors.palette.neutral50,
  borderRadius: 12,
  padding: spacing?.md || 12,
  borderLeftWidth: 4,
  borderLeftColor: colors.palette.secondary500 || colors.tint,
})

const $performanceInfoRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "flex-start" as const,
  marginBottom: spacing?.md || 12,
})

const $performanceDetails = {
  flex: 1,
  marginLeft: 8,
}

const $performanceLabel = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.xs || 4,
})

const $performanceText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
})

const $performanceDate = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
  marginBottom: spacing?.xs || 4,
})

// 혜택 정보 스타일들
const $benefitsCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary50 || colors.palette.neutral50,
  borderRadius: 12,
  padding: spacing?.md || 12,
  borderLeftWidth: 4,
  borderLeftColor: colors.palette.primary500,
})

const $benefitRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.md || 12,
})

const $benefitIcon = {
  fontSize: 20,
  marginRight: 12,
}

const $benefitContent = {
  flex: 1,
}

const $benefitLabel = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.xs || 4,
})

const $benefitValue = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.palette.primary600,
  fontWeight: "600" as const,
})

const $providedBenefits = ({ spacing }) => ({
  marginTop: spacing?.sm || 8,
  paddingTop: spacing?.sm || 8,
  borderTopWidth: 1,
  borderTopColor: "rgba(0,0,0,0.1)",
})

const $benefitSectionTitle = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.sm || 8,
})

const $benefitsList = ({ spacing }) => ({
  marginBottom: spacing?.sm || 8,
})

const $benefitItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

const $benefitItemText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
})

const $otherBenefits = ({ spacing }) => ({
  marginTop: spacing?.sm || 8,
  paddingTop: spacing?.sm || 8,
  borderTopWidth: 1,
  borderTopColor: "rgba(0,0,0,0.1)",
})

const $otherBenefitText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
  marginLeft: 8,
  flex: 1,
})

// 연락처 정보 스타일들
const $contactCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral50,
  borderRadius: 12,
  padding: spacing?.md || 12,
  borderLeftWidth: 4,
  borderLeftColor: colors.palette.secondary500 || colors.tint,
})

const $contactRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "flex-start" as const,
  marginBottom: spacing?.md || 12,
})

const $contactIcon = {
  fontSize: 18,
  marginRight: 12,
  marginTop: 2,
}

const $contactContent = {
  flex: 1,
}

const $contactLabel = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.xs || 4,
})

const $contactValue = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
})

const $documentsSection = ({ spacing }) => ({
  marginTop: spacing?.xs || 4,
})

const $documentsList = ({ spacing }) => ({
  marginTop: spacing?.xs || 4,
})

const $documentItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "flex-start" as const,
  marginBottom: spacing?.xs || 4,
})

const $documentText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
  marginLeft: 8,
  flex: 1,
})

// 태그 스타일들 (PostCard에서 가져옴)
const $tagsContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  marginTop: spacing?.xs || 4,
})

const $tag = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary100,
  paddingHorizontal: spacing?.sm || 8,
  paddingVertical: spacing?.xs || 4,
  borderRadius: 16,
  marginRight: spacing?.xs || 4,
  marginBottom: spacing?.xs || 4,
})

const $tagText = ({ colors, typography }) => ({
  color: colors.palette.primary600,
  fontSize: 12,
  fontFamily: typography.primary.medium,
})

// 전체 너비 이미지 섹션
const $fullWidthImageSection = ({ spacing }) => ({
  marginHorizontal: -(spacing?.lg || 16), // container의 padding을 정확히 상쇄
  marginVertical: spacing?.md || 12,
})

// 이미지 갤러리 스타일들 (인스타그램 스타일)
const $imageGalleryContainer = {
  position: "relative" as const,
  width: screenWidth,
  height: screenWidth,
}

const $imageScrollView = {
  flex: 1,
}

const $imageContainer = {
  width: screenWidth,
  height: screenWidth,
  overflow: "hidden" as const,
}

const $galleryImage = {
  width: screenWidth,
  height: screenWidth,
  resizeMode: "cover" as const,
}

const $indicatorContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  position: "absolute" as const,
  bottom: 16,
  left: 0,
  right: 0,
  zIndex: 10,
})

const $activeIndicator = ({ colors }) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  marginHorizontal: 3,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
})

const $inactiveIndicator = ({ colors }) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "rgba(255, 255, 255, 0.4)",
  marginHorizontal: 3,
})

const $counterContainer = ({ colors, spacing }) => ({
  position: "absolute" as const,
  top: 16,
  right: 16,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 16,
  zIndex: 10,
})

const $counterText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 12,
  fontFamily: typography.primary.medium,
})