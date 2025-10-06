import { FC, useEffect, useState } from "react"
import { View, ViewStyle, TouchableOpacity, ActivityIndicator } from "react-native"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import { notificationService } from "@/services/firestore/notificationService"
import type { ThemedStyle } from "@/theme/types"
import type { Notification } from "@/types/notification"

// 알림 타입별 아이콘 매핑
const NOTIFICATION_ICONS = {
  application_received: "👤",
  application_accepted: "✅", 
  application_rejected: "❌",
  application_cancelled: "🚫",
  post_status_changed: "📝",
  post_updated: "✏️",
  default: "🔔"
} as const

// 시간 변환 상수
const TIME_UNITS = {
  MINUTE: 60000,
  HOUR: 3600000,
  DAY: 86400000
} as const

// 알림 카드 스타일 상수
const CARD_STYLES = {
  READ: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB'
  },
  unread: {
    backgroundColor: '#F0F9FF', 
    borderColor: '#3B82F6'
  }
} as const

interface NotificationCenterScreenProps {
  navigation?: any
}

export const NotificationCenterScreen: FC<NotificationCenterScreenProps> = ({ navigation }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    console.log('🔔 [NotificationCenter] 알림 구독 시작:', user.uid)
    
    // 실시간 알림 구독
    const unsubscribe = notificationService.subscribeToUserNotifications(
      user.uid,
      (notifications) => {
        console.log('🔔 [NotificationCenter] 알림 업데이트됨:', notifications.length)
        setNotifications(notifications)
        setIsLoading(false)
      }
    )

    return () => {
      console.log('🔔 [NotificationCenter] 알림 구독 해제')
      unsubscribe()
    }
  }, [user])


  const handleNotificationPress = async (notification: Notification) => {
    try {
      // 읽지 않은 알림인 경우 읽음 처리
      if (!notification.isRead) {
        console.log('🔔 [NotificationCenter] 알림 읽음 처리:', notification.id)
        await notificationService.markAsRead(notification.id)
      }

      // 알림 타입에 따른 네비게이션
      if (notification.postId) {
        console.log('🔔 [NotificationCenter] 게시글로 이동:', notification.postId)
        
        // 알림센터를 먼저 닫고 타겟 화면으로 이동
        navigation?.goBack()
        
        // 짧은 딜레이 후 타겟 화면으로 이동 (스택 안정화)
        setTimeout(() => {
          // 운영자가 받는 알림 (지원자 관리 화면으로)
          if (notification.type === 'application_received' || notification.type === 'application_cancelled') {
            navigation?.navigate("Main", {
              screen: "BulletinBoard", 
              params: {
                screen: "ApplicationManagement",
                params: { 
                  postId: notification.postId,
                  postTitle: notification.postTitle || "게시글"
                }
              }
            })
          } 
          // 지원자가 받는 알림 (게시글 상세로)
          else {
            navigation?.navigate("Main", {
              screen: "BulletinBoard",
              params: {
                screen: "PostDetail",
                params: { postId: notification.postId }
              }
            })
          }
        }, 100)
      }
    } catch (error) {
      console.error("❌ [NotificationCenter] 알림 처리 오류:", error)
    }
  }

  const formatRelativeTime = (timestamp: any): string => {
    try {
      const now = Date.now()
      const notificationTime = timestamp?.seconds 
        ? timestamp.seconds * 1000
        : timestamp?.toDate?.()?.getTime()
      
      if (!notificationTime) return "시간 알 수 없음"
      
      const diff = now - notificationTime
      const minutes = Math.floor(diff / TIME_UNITS.MINUTE)
      const hours = Math.floor(diff / TIME_UNITS.HOUR)
      const days = Math.floor(diff / TIME_UNITS.DAY)
      
      if (minutes < 1) return "방금 전"
      if (minutes < 60) return `${minutes}분 전`
      if (hours < 24) return `${hours}시간 전`
      return `${days}일 전`
    } catch (error) {
      console.error('❌ [NotificationCenter] 시간 형식 오류:', error)
      return "시간 오류"
    }
  }

  const getNotificationIcon = (type: string): string => 
    NOTIFICATION_ICONS[type as keyof typeof NOTIFICATION_ICONS] || NOTIFICATION_ICONS.default


  const unreadCount = notifications.filter(n => !n.isRead).length

  if (isLoading) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader title="알림" showNotificationIcon={false} />
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.palette.primary500} />
          <Text style={themed($loadingText)}>알림을 불러오는 중...</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={[]}>
      <ScreenHeader 
        title={`알림 ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
        showNotificationIcon={false}
      />
      
      {notifications.length === 0 ? (
        <View style={themed($emptyContainer)}>
          <Text style={themed($emptyIcon)}>🔔</Text>
          <Text style={themed($emptyTitle)}>알림이 없습니다</Text>
          <Text style={themed($emptyMessage)}>
            새로운 알림이 있으면 여기에 표시됩니다.
          </Text>
        </View>
      ) : (
        <View style={themed($notificationContainer)}>
          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={themed($notificationCard(item.isRead))}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={themed($cardHeader)}>
                <Text style={themed($cardTitle)}>
                  {getNotificationIcon(item.type)} {item.title}
                </Text>
                
                <Text style={themed($cardTime)}>
                  {formatRelativeTime(item.createdAt)}
                </Text>
              </View>
              
              <Text style={themed($cardMessage)}>
                {item.message}
              </Text>
              
              {!item.isRead && (
                <View style={themed($unreadDot)} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Screen>
  )
}

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
})

const $loadingText: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.textDim,
  marginTop: spacing.md,
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
  minHeight: 400,
})

const $emptyIcon: ThemedStyle<ViewStyle> = () => ({
  fontSize: 48,
  marginBottom: 16,
})

const $emptyTitle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 8,
})

const $emptyMessage: ThemedStyle<ViewStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 20,
})

const $notificationContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
})

const $notificationCard = (isRead: boolean): ThemedStyle<ViewStyle> => ({ colors, spacing }) => ({
  backgroundColor: isRead ? colors.background : colors.palette.neutral100,
  borderColor: isRead ? colors.border : colors.palette.primary500,
  borderWidth: 1,
  borderRadius: 12,
  padding: spacing.lg,
  marginBottom: spacing.md,
  minHeight: 120,
  position: "relative",
})

const $cardHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: spacing.xs,
})

const $cardTitle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "bold",
  color: colors.text,
  lineHeight: 24,
  flex: 1,
})

const $cardTime: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontWeight: "500",
  marginLeft: spacing.xs,
})

const $cardMessage: ThemedStyle<ViewStyle> = ({ colors }) => ({
  fontSize: 15,
  color: colors.textDim,
  lineHeight: 22,
})

const $unreadDot: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  top: spacing.md,
  right: spacing.md,
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "#FF3B30",
})

