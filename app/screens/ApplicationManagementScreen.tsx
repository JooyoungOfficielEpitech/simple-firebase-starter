import React, { useEffect, useState, useCallback } from "react"
import { View, FlatList, TouchableOpacity, Linking, ScrollView } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { Icon } from "@/components/Icon"
import { AlertModal } from "@/components/AlertModal"
import { applicationService } from "@/services/firestore"
import { Application, ApplicationStatus } from "@/services/firestore/applicationService"
import { useAppTheme } from "@/theme/context"
import { useAlert } from "@/hooks/useAlert"
import { AppStackParamList } from "@/navigators/types"

type NavigationProp = NativeStackNavigationProp<AppStackParamList>
type RoutePropType = RouteProp<AppStackParamList, "ApplicationManagement">

// Helper function to safely format Firestore Timestamp
const formatApplicationDate = (timestamp: FirebaseFirestoreTypes.Timestamp | undefined): string => {
  if (!timestamp) return "알 수 없음"
  
  try {
    const date = timestamp.toDate()
    return date ? date.toLocaleDateString('ko-KR') : "알 수 없음"
  } catch (error) {
    console.warn('ApplicationManagement - Date formatting error:', error)
    return "알 수 없음"
  }
}

export const ApplicationManagementScreen = () => {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RoutePropType>()
  const { postId, postTitle } = route.params
  
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const { alertState, alert, hideAlert } = useAlert()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<ApplicationStatus | "all">("all")
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])

  const filterTabs = React.useMemo(() => {
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {} as Record<ApplicationStatus, number>)

    return [
      { key: "all" as const, label: "전체", count: applications.length },
      { key: "pending" as const, label: "대기중", count: statusCounts.pending || 0 },
      { key: "accepted" as const, label: "승인됨", count: statusCounts.accepted || 0 },
      { key: "rejected" as const, label: "거절됨", count: statusCounts.rejected || 0 },
    ]
  }, [applications])

  useEffect(() => {
    if (!postId?.trim()) {
      console.warn('ApplicationManagement - Invalid postId:', postId)
      setLoading(false)
      return
    }

    // 지원자 목록 실시간 구독
    const unsubscribe = applicationService.subscribeToApplicationsByPost(
      postId,
      (apps) => {
        setApplications(apps || [])
        setLoading(false)
      }
    )

    return unsubscribe
  }, [postId])

  // 필터링 적용
  useEffect(() => {
    const filtered = selectedFilter === "all" 
      ? applications 
      : applications.filter(app => app?.status === selectedFilter)
    
    setFilteredApplications(filtered)
  }, [applications, selectedFilter])

  const handleStatusChange = useCallback(async (applicationId: string, newStatus: ApplicationStatus) => {
    if (!applicationId?.trim()) {
      alert("오류", "잘못된 지원서 ID입니다.")
      return
    }

    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus)
      
      const statusLabels: Record<ApplicationStatus, string> = {
        accepted: "승인",
        rejected: "거절", 
        pending: "대기",
        withdrawn: "철회"
      }
      
      const statusText = statusLabels[newStatus]
      alert("상태 변경 완료", `지원자 상태가 ${statusText}으로 변경되었습니다.`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "상태 변경에 실패했습니다."
      console.error('ApplicationManagement - Status update error:', error)
      alert("상태 변경 실패", errorMessage)
    }
  }, [])

  const handleCall = useCallback((phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl)
        } else {
          alert("오류", "전화 앱을 열 수 없습니다.")
        }
      })
      .catch(error => {
        console.error('ApplicationManagement - Phone call error:', error)
        alert("오류", "전화를 걸 수 없습니다.")
      })
  }, [])

  const handleOpenPortfolio = useCallback((url: string) => {
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url)
        } else {
          alert("오류", "링크를 열 수 없습니다.")
        }
      })
      .catch(error => {
        console.error('ApplicationManagement - Portfolio URL error:', error)
        alert("오류", "링크를 열 수 없습니다.")
      })
  }, [])

  const showApplicationOptions = useCallback((application: Application) => {
    const options: Array<{
      text: string
      onPress?: () => void
      style?: "default" | "cancel" | "destructive"
    }> = [
      { text: "취소", style: "cancel" },
    ]

    // 전화 걸기 옵션 - null check 추가
    if (application.phoneNumber?.trim()) {
      options.push({
        text: "📞 전화하기",
        onPress: () => handleCall(application.phoneNumber!),
      })
    }

    // 포트폴리오 보기 옵션 - null check 추가
    if (application.portfolio?.trim()) {
      options.push({
        text: "🔗 포트폴리오 보기",
        onPress: () => handleOpenPortfolio(application.portfolio!),
      })
    }

    // 상태 변경 옵션들
    if (application.status === "pending") {
      options.push(
        { 
          text: "✅ 승인", 
          onPress: () => handleStatusChange(application.id, "accepted"),
        },
        { 
          text: "❌ 거절", 
          onPress: () => handleStatusChange(application.id, "rejected"),
          style: "destructive"
        }
      )
    } else {
      options.push({
        text: "🔄 대기중으로 변경",
        onPress: () => handleStatusChange(application.id, "pending"),
      })
    }

    const statusLabels: Record<ApplicationStatus, string> = {
      pending: "대기중",
      accepted: "승인됨",
      rejected: "거절됨",
      withdrawn: "철회됨"
    }

    alert(
      application.applicantName,
      `${application.applicantEmail}\n상태: ${statusLabels[application.status]}`,
      options
    )
  }, [handleCall, handleOpenPortfolio, handleStatusChange])

  const renderApplicationItem = useCallback(({ item }: { item: Application }) => {
    const statusColors: Record<ApplicationStatus, string> = {
      pending: colors.palette.secondary500 || colors.tint,
      accepted: colors.palette.primary500 || colors.tint,
      rejected: colors.error,
      withdrawn: colors.palette.neutral400 || colors.textDim,
    }

    const statusLabels: Record<ApplicationStatus, string> = {
      pending: "대기중",
      accepted: "승인됨",
      rejected: "거절됨",
      withdrawn: "철회됨",
    }

    const statusColor = statusColors[item.status]
    const statusText = statusLabels[item.status]

    return (
      <TouchableOpacity 
        style={themed($applicationCard)}
        onPress={() => showApplicationOptions(item)}
        disabled={item.status === "withdrawn"}
        accessibilityRole="button"
        accessibilityLabel={`${item.applicantName} 지원서`}
        accessibilityHint="터치하여 지원서 관리 옵션 보기"
      >
        {/* Header with name and status */}
        <View style={themed($cardHeader)}>
          <View style={themed($nameStatusRow)}>
            <Text preset="subheading" text={item.applicantName} style={themed($applicantName)} />
            <View style={[themed($statusBadge), { backgroundColor: statusColor }]}>
              <Text text={statusText} style={themed($statusText)} />
            </View>
          </View>
          <Text text={item.applicantEmail} style={themed($applicantEmail)} />
          <Text 
            text={`지원일: ${formatApplicationDate(item.createdAt)}`} 
            style={themed($dateText)} 
          />
        </View>

        {/* Contact info section */}
        <View style={themed($infoSection)}>
          {item.phoneNumber?.trim() && (
            <TouchableOpacity 
              style={themed($infoRow)} 
              onPress={() => handleCall(item.phoneNumber!)}
              accessibilityRole="button"
              accessibilityLabel={`${item.phoneNumber}로 전화하기`}
            >
              <Icon icon="bell" size={16} color={colors.tint} />
              <Text text={item.phoneNumber} style={themed($linkText)} />
            </TouchableOpacity>
          )}

          {item.portfolio?.trim() && (
            <TouchableOpacity 
              style={themed($infoRow)} 
              onPress={() => handleOpenPortfolio(item.portfolio!)}
              accessibilityRole="button"
              accessibilityLabel="포트폴리오 링크 열기"
            >
              <Icon icon="caretRight" size={16} color={colors.tint} />
              <Text text="포트폴리오 보기" style={themed($linkText)} />
            </TouchableOpacity>
          )}

          {item.rolePreference?.trim() && (
            <View style={themed($infoRow)}>
              <Icon icon="settings" size={16} color={colors.textDim} />
              <Text text={`희망 역할: ${item.rolePreference}`} style={themed($infoText)} />
            </View>
          )}
        </View>

        {/* Experience section */}
        {item.experience?.trim() && (
          <View style={themed($messageSection)}>
            <Text text="경력 및 경험" style={themed($sectionLabel)} />
            <Text text={item.experience} style={themed($messageText)} />
          </View>
        )}
        
        {/* Application message section */}
        {item.message?.trim() && (
          <View style={themed($messageSection)}>
            <Text text="지원 동기" style={themed($sectionLabel)} />
            <Text text={item.message} style={themed($messageText)} />
          </View>
        )}
      </TouchableOpacity>
    )
  }, [colors, themed, showApplicationOptions])

  if (loading && applications.length === 0) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader 
          title="지원서 확인"
          backButtonProps={{
            onPress: () => navigation.goBack()
          }}
        />
        <View style={themed($container)}>
          <View style={themed($loadingContainer)}>
            <View style={themed($loadingIconContainer)}>
              <Text text="📋" style={themed($loadingIcon)} />
            </View>
            <Text text="지원서를 불러오는 중..." style={themed($loadingText)} />
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={[]}>
      <ScreenHeader 
        title="지원서 확인"
        backButtonProps={{
          onPress: () => navigation.goBack()
        }}
      />
      <View style={themed($container)}>
        {/* Content */}
        <View style={themed($content)}>
          {/* Post info */}
          <View style={themed($postInfo)}>
            <Text text={postTitle} style={themed($postTitle)} />
            <Text text={`총 ${applications.length}명의 지원자`} style={themed($statsText)} />
          </View>

          {/* Filter tabs */}
          <View style={themed($filterTabs)}>
            {filterTabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={themed(selectedFilter === tab.key ? $activeFilterTab : $filterTab)}
                onPress={() => setSelectedFilter(tab.key)}
                accessibilityRole="button"
                accessibilityLabel={`${tab.label} ${tab.count}개 필터`}
                accessibilityState={{ selected: selectedFilter === tab.key }}
              >
                <Text 
                  text={`${tab.label} (${tab.count})`} 
                  style={themed(selectedFilter === tab.key ? $activeFilterTabText : $filterTabText)} 
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Applications list */}
          {filteredApplications.length === 0 ? (
            <View style={themed($emptyContainer)}>
              <View style={themed($emptyIconContainer)}>
                <Text text="📝" style={themed($emptyIcon)} />
              </View>
              <Text text="아직 지원자가 없습니다." style={themed($emptyText)} />
              <Text text="지원자가 있으면 여기에 표시됩니다." style={themed($emptySubText)} />
            </View>
          ) : (
            <View style={themed($applicationsContainer)}>
              {filteredApplications.map(item => (
                <View key={item.id}>
                  {renderApplicationItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
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

// 스타일들 - BulletinBoardScreen과 동일한 구조
const $container = ({ spacing }) => ({
  flex: 1,
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

const $appTitle = ({ colors, typography }) => ({
  textAlign: "center" as const,
  color: colors.palette.primary500,
  fontFamily: typography.primary.bold,
  flex: 1,
})

const $headerButtons = () => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  minWidth: 44,
})

const $content = ({ spacing }) => ({
  flex: 1,
  paddingTop: spacing.md,
})

const $postInfo = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $loadingContainer = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  paddingHorizontal: spacing.xl,
})

const $loadingIconContainer = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $loadingIcon = () => ({
  fontSize: 48,
  textAlign: "center" as const,
})

const $loadingText = ({ colors, typography, spacing }) => ({
  fontSize: 16,
  lineHeight: 24,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center" as const,
  marginTop: spacing.sm,
})

const $emptyIconContainer = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $emptyIcon = () => ({
  fontSize: 48,
  textAlign: "center" as const,
})

const $emptySubText = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center" as const,
  marginTop: spacing.xs,
})

const $applicationsContainer = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $postTitle = ({ colors, typography, spacing }) => ({
  fontSize: 18,
  lineHeight: 24,
  color: colors.text,
  fontFamily: typography.primary.medium,
  marginBottom: spacing.xs,
})

const $statsText = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  marginBottom: spacing.lg,
})

const $list = ({ spacing }) => ({
  flex: 1,
})

const $scrollContainer = ({ spacing }) => ({
  flex: 1,
  paddingTop: spacing.sm,
})

// Card styles inspired by PostCard
const $applicationCard = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing.md,
  marginBottom: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
})

const $cardHeader = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $nameStatusRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing.xs,
})

const $applicantName = ({ colors, spacing }) => ({
  color: colors.text,
  flex: 1,
  marginRight: spacing.xs,
})

const $statusBadge = ({ spacing }) => ({
  paddingHorizontal: spacing.xs,
  paddingVertical: 4,
  borderRadius: 6,
})

const $statusText = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "bold" as const,
  color: colors.palette.neutral100,
})

const $applicantEmail = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.tint,
  fontFamily: typography.primary.medium,
  marginBottom: spacing.xs,
})

const $dateText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 18,
  color: colors.textDim,
  fontFamily: typography.primary.medium,
})

const $infoSection = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $infoRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing.xs,
  paddingVertical: spacing.xs,
})

const $infoText = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.text,
  fontFamily: typography.primary.normal,
  marginLeft: spacing.xs,
  flex: 1,
})

const $linkText = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.tint,
  fontFamily: typography.primary.medium,
  marginLeft: spacing.xs,
  textDecorationLine: "underline" as const,
})

const $messageSection = ({ spacing }) => ({
  marginTop: spacing.xs,
  marginBottom: spacing.sm,
})

const $sectionLabel = ({ colors, typography, spacing }) => ({
  fontSize: 13,
  lineHeight: 18,
  color: colors.textDim,
  fontFamily: typography.primary.medium,
  marginBottom: spacing.xs,
})

const $messageText = ({ colors, typography }) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontStyle: "italic" as const,
})

const $emptyContainer = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.xl,
})

const $emptyText = ({ colors, typography }) => ({
  fontSize: 16,
  lineHeight: 24,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center" as const,
})

// 필터 탭 스타일들
const $filterTabs = ({ spacing }) => ({
  flexDirection: "row" as const,
  marginBottom: spacing?.lg || 16,
  borderRadius: 8,
  backgroundColor: "rgba(0, 0, 0, 0.05)",
  padding: 4,
})

const $filterTab = ({ spacing }) => ({
  flex: 1,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.xs || 4,
  alignItems: "center" as const,
  borderRadius: 6,
})

const $activeFilterTab = ({ colors, spacing }) => ({
  flex: 1,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.xs || 4,
  alignItems: "center" as const,
  borderRadius: 6,
  backgroundColor: colors.palette.primary500,
})

const $filterTabText = ({ colors, typography }) => ({
  fontSize: 13,
  lineHeight: 18,
  color: colors.textDim,
  fontFamily: typography.primary.medium,
})

const $activeFilterTabText = ({ colors, typography }) => ({
  fontSize: 13,
  lineHeight: 18,
  color: colors.palette.neutral100,
  fontFamily: typography.primary.medium,
})