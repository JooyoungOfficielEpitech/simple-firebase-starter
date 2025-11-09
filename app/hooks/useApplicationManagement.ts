import { useEffect, useState, useCallback, useMemo } from "react"
import { Linking } from "react-native"
import { applicationService } from "@/services/firestore"
import { Application, ApplicationStatus } from "@/services/firestore/applicationService"
import { FilterTab } from "@/components/ApplicationManagement/StatusFilterBar"

interface UseApplicationManagementProps {
  postId: string
  alert: (title: string, message?: string, buttons?: Array<{
    text: string
    onPress?: () => void
    style?: "default" | "cancel" | "destructive"
  }>) => void
}

export const useApplicationManagement = ({ postId, alert }: UseApplicationManagementProps) => {

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<ApplicationStatus | "all">("all")
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])

  // Calculate filter tabs
  const filterTabs = useMemo<FilterTab[]>(() => {
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

  // Subscribe to applications
  useEffect(() => {
    if (!postId?.trim()) {
      console.warn('useApplicationManagement - Invalid postId:', postId)
      setLoading(false)
      return
    }

    const unsubscribe = applicationService.subscribeToApplicationsByPost(
      postId,
      (apps) => {
        setApplications(apps || [])
        setLoading(false)
      }
    )

    return unsubscribe
  }, [postId])

  // Apply filtering
  useEffect(() => {
    const filtered = selectedFilter === "all" 
      ? applications 
      : applications.filter(app => app?.status === selectedFilter)
    
    setFilteredApplications(filtered)
  }, [applications, selectedFilter])

  // Handle status change
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
      console.error('useApplicationManagement - Status update error:', error)
      alert("상태 변경 실패", errorMessage)
    }
  }, [alert])

  // Handle phone call
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
        console.error('useApplicationManagement - Phone call error:', error)
        alert("오류", "전화를 걸 수 없습니다.")
      })
  }, [alert])

  // Handle open portfolio
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
        console.error('useApplicationManagement - Portfolio URL error:', error)
        alert("오류", "링크를 열 수 없습니다.")
      })
  }, [alert])

  // Show application options
  const showApplicationOptions = useCallback((application: Application) => {
    const options: Array<{
      text: string
      onPress?: () => void
      style?: "default" | "cancel" | "destructive"
    }> = [
      { text: "취소", style: "cancel" },
    ]

    // Add phone call option
    if (application.phoneNumber?.trim()) {
      options.push({
        text: "📞 전화하기",
        onPress: () => handleCall(application.phoneNumber!),
      })
    }

    // Add portfolio option
    if (application.portfolio?.trim()) {
      options.push({
        text: "🔗 포트폴리오 보기",
        onPress: () => handleOpenPortfolio(application.portfolio!),
      })
    }

    // Add status change options
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
  }, [handleCall, handleOpenPortfolio, handleStatusChange, alert])

  return {
    applications,
    loading,
    selectedFilter,
    setSelectedFilter,
    filteredApplications,
    filterTabs,
    handleCall,
    handleOpenPortfolio,
    showApplicationOptions,
  }
}
