import { View, TouchableOpacity } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { Post } from "@/types/post"
import { Application } from "@/services/firestore/applicationService"
import {
  $heroCard,
  $statusHeader,
  $activeBadge,
  $closedBadge,
  $activeText,
  $closedText,
  $deadlineText,
  $postTitle,
  $productionText,
  $organizationText,
  $keyInfoRow,
  $infoItem,
  $infoIcon,
  $infoText,
  $statsRow,
  $statItem,
  $statIcon,
  $statText,
  $actionButtonsRow,
  $applicationButtonContainer,
  $applyButton,
  $applyButtonText,
  $withdrawButton,
  $withdrawButtonText,
  $statusButton,
  $statusButtonText,
  $manageButton,
  $manageButtonText,
  $contactButton,
  $contactButtonText,
} from "@/screens/PostDetailScreen.styles"

interface HeroCardProps {
  post: Post
  isMyPost: boolean
  applicationsCount: number
  hasApplied: boolean
  myApplication: Application | null
  submittingApplication: boolean
  onApplyClick: () => void
  onWithdraw: () => void
  onViewApplications: () => void
}

export const HeroCard = ({
  post,
  isMyPost,
  applicationsCount,
  hasApplied,
  myApplication,
  submittingApplication,
  onApplyClick,
  onWithdraw,
  onViewApplications,
}: HeroCardProps) => {
  const { themed } = useAppTheme()

  // 디버깅: 렌더링 시 상태 로그
  console.log("🎨 [HeroCard] 렌더링:", {
    hasApplied,
    applicationStatus: myApplication?.status,
    applicationId: myApplication?.id,
    timestamp: new Date().toISOString()
  })

  return (
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

      <View style={themed($statsRow)}>
        <View style={themed($statItem)}>
          <Text text="👁️" style={themed($statIcon)} />
          <Text text={`조회 ${post.viewCount || 0}`} style={themed($statText)} />
        </View>
        <View style={themed($statItem)}>
          <Text text="👥" style={themed($statIcon)} />
          <Text text={`지원자 ${isMyPost ? applicationsCount : 0}`} style={themed($statText)} />
        </View>
      </View>
      
      <View style={themed($actionButtonsRow)}>
        {!isMyPost && (
          <View style={themed($applicationButtonContainer)}>
            {(() => {
              if (!hasApplied || !myApplication) {
                return (
                  <TouchableOpacity
                    style={themed($applyButton)}
                    onPress={onApplyClick}
                    disabled={post.status !== "active"}
                  >
                    <Text
                      text="지원하기"
                      style={themed($applyButtonText)}
                    />
                  </TouchableOpacity>
                )
              }

              if (myApplication.status === 'pending') {
                return (
                  <TouchableOpacity
                    style={themed($withdrawButton)}
                    onPress={onWithdraw}
                    disabled={submittingApplication}
                  >
                    <Text
                      text={submittingApplication ? "철회 중..." : "지원 취소"}
                      style={themed($withdrawButtonText)}
                    />
                  </TouchableOpacity>
                )
              }

              return (
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
              )
            })()}
          </View>
        )}
        
        {isMyPost && (
          <TouchableOpacity 
            style={themed($manageButton)}
            onPress={onViewApplications}
          >
            <Text text={`👥 지원자 관리 (${applicationsCount})`} style={themed($manageButtonText)} />
          </TouchableOpacity>
        )}

        {post.contact && (
          <TouchableOpacity 
            style={themed($contactButton)}
            onPress={() => console.log("Quick contact", post.contact)}
          >
            <Text text="📞 문의하기" style={themed($contactButtonText)} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
