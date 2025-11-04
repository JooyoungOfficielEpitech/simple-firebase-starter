import React from "react"
import { View, TouchableOpacity } from "react-native"
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"
import { Text } from "@/components/Text"
import { Icon } from "@/components/Icon"
import { Application, ApplicationStatus } from "@/services/firestore/applicationService"
import { useAppTheme } from "@/theme/context"
import { applicationCardStyles } from "./ApplicationCard.styles"

interface ApplicationCardProps {
  application: Application
  onPress: (application: Application) => void
  onCall: (phoneNumber: string) => void
  onOpenPortfolio: (url: string) => void
}

const formatApplicationDate = (timestamp: FirebaseFirestoreTypes.Timestamp | undefined): string => {
  if (!timestamp) return "알 수 없음"
  
  try {
    const date = timestamp.toDate()
    return date ? date.toLocaleDateString('ko-KR') : "알 수 없음"
  } catch (error) {
    console.warn('ApplicationCard - Date formatting error:', error)
    return "알 수 없음"
  }
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onPress,
  onCall,
  onOpenPortfolio,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

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

  const statusColor = statusColors[application.status]
  const statusText = statusLabels[application.status]

  const styles = applicationCardStyles()

  return (
    <TouchableOpacity 
      style={themed(styles.$card)}
      onPress={() => onPress(application)}
      disabled={application.status === "withdrawn"}
      accessibilityRole="button"
      accessibilityLabel={`${application.applicantName} 지원서`}
      accessibilityHint="터치하여 지원서 관리 옵션 보기"
    >
      {/* Header with name and status */}
      <View style={themed(styles.$header)}>
        <View style={themed(styles.$nameStatusRow)}>
          <Text preset="subheading" text={application.applicantName} style={themed(styles.$applicantName)} />
          <View style={[themed(styles.$statusBadge), { backgroundColor: statusColor }]}>
            <Text text={statusText} style={themed(styles.$statusText)} />
          </View>
        </View>
        <Text text={application.applicantEmail} style={themed(styles.$applicantEmail)} />
        <Text 
          text={`지원일: ${formatApplicationDate(application.createdAt)}`} 
          style={themed(styles.$dateText)} 
        />
      </View>

      {/* Contact info section */}
      <View style={themed(styles.$infoSection)}>
        {application.phoneNumber?.trim() && (
          <TouchableOpacity 
            style={themed(styles.$infoRow)} 
            onPress={() => onCall(application.phoneNumber!)}
            accessibilityRole="button"
            accessibilityLabel={`${application.phoneNumber}로 전화하기`}
          >
            <Icon icon="bell" size={16} color={colors.tint} />
            <Text text={application.phoneNumber} style={themed(styles.$linkText)} />
          </TouchableOpacity>
        )}

        {application.portfolio?.trim() && (
          <TouchableOpacity 
            style={themed(styles.$infoRow)} 
            onPress={() => onOpenPortfolio(application.portfolio!)}
            accessibilityRole="button"
            accessibilityLabel="포트폴리오 링크 열기"
          >
            <Icon icon="caretRight" size={16} color={colors.tint} />
            <Text text="포트폴리오 보기" style={themed(styles.$linkText)} />
          </TouchableOpacity>
        )}

        {application.rolePreference?.trim() && (
          <View style={themed(styles.$infoRow)}>
            <Icon icon="settings" size={16} color={colors.textDim} />
            <Text text={`희망 역할: ${application.rolePreference}`} style={themed(styles.$infoText)} />
          </View>
        )}
      </View>

      {/* Experience section */}
      {application.experience?.trim() && (
        <View style={themed(styles.$messageSection)}>
          <Text text="경력 및 경험" style={themed(styles.$sectionLabel)} />
          <Text text={application.experience} style={themed(styles.$messageText)} />
        </View>
      )}
      
      {/* Application message section */}
      {application.message?.trim() && (
        <View style={themed(styles.$messageSection)}>
          <Text text="지원 동기" style={themed(styles.$sectionLabel)} />
          <Text text={application.message} style={themed(styles.$messageText)} />
        </View>
      )}
    </TouchableOpacity>
  )
}
