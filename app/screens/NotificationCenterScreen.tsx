import { FC, useEffect, useState } from "react"
import { View, ViewStyle, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import { notificationService } from "@/services/firestore/notificationService"
import type { ThemedStyle } from "@/theme/types"
import type { Notification } from "@/types/notification"
import type { TextStyle } from "react-native"

interface NotificationCenterScreenProps {
  navigation?: any
}

export const NotificationCenterScreen: FC<NotificationCenterScreenProps> = ({ navigation }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // 실시간 구독 방식이므로 특별한 새로고침 로직이 필요하지 않음
    // 잠시 기다렸다가 리프레시 상태만 종료
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

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
        
        // 운영자가 받는 알림 (지원자 관리 화면으로)
        if (notification.type === 'application_received' || notification.type === 'application_cancelled') {
          navigation?.navigate("BulletinBoard", {
            screen: "ApplicationManagement",
            params: { 
              postId: notification.postId,
              postTitle: notification.postTitle || "게시글"
            }
          })
        } 
        // 지원자가 받는 알림 (게시글 상세로)
        else {
          navigation?.navigate("BulletinBoard", {
            screen: "PostDetail",
            params: { postId: notification.postId }
          })
        }
      }
    } catch (error) {
      console.error("❌ [NotificationCenter] 알림 처리 오류:", error)
    }
  }

  const formatRelativeTime = (timestamp: any) => {
    try {
      const now = Date.now()
      let notificationTime: number
      
      if (timestamp && timestamp.seconds) {
        notificationTime = timestamp.seconds * 1000
      } else if (timestamp && timestamp.toDate) {
        notificationTime = timestamp.toDate().getTime()
      } else {
        return "시간 알 수 없음"
      }
      
      const diff = now - notificationTime
      
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (minutes < 1) return "방금 전"
      if (minutes < 60) return `${minutes}분 전`
      if (hours < 24) return `${hours}시간 전`
      return `${days}일 전`
    } catch (error) {
      console.error('❌ [NotificationCenter] 시간 형식 오류:', error)
      return "시간 오류"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application_received":
        return "👤"
      case "application_accepted":
        return "✅"
      case "application_rejected":
        return "❌"
      case "application_cancelled":
        return "🚫"
      case "post_status_changed":
        return "📝"
      case "post_updated":
        return "✏️"
      default:
        return "🔔"
    }
  }

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View
      style={{
        backgroundColor: '#F8F9FA',
        marginVertical: 8,
        padding: 20,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: item.isRead ? '#E9ECEF' : '#007AFF',
        minHeight: 100,
      }}
    >
      <View style={{ marginBottom: 8 }}>
        <Text 
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1A1A1A',
            marginBottom: 4,
          }}
        >
          {getNotificationIcon(item.type)} {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: '#8E8E93' }}>
          {formatRelativeTime(item.createdAt)}
        </Text>
      </View>
      
      <Text 
        style={{ 
          fontSize: 16, 
          color: '#3C3C43',
          lineHeight: 22,
        }}
      >
        {item.message}
      </Text>
      
      {!item.isRead && (
        <View style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: '#007AFF',
        }} />
      )}
    </View>
  )

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (isLoading) {
    return (
      <Screen style={themed($root)} preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader title="알림" showNotificationIcon={false} />
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.palette.primary500} />
          <Text style={themed($loadingText)}>알림을 불러오는 중...</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen style={themed($root)} preset="fixed" safeAreaEdges={[]}>
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
        <View style={{ flex: 1, padding: 16 }}>
          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{
                backgroundColor: item.isRead ? '#FFFFFF' : '#F0F9FF',
                marginVertical: 8,
                padding: 20,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: item.isRead ? '#E5E7EB' : '#3B82F6',
                minHeight: 120,
              }}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text 
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#1A1A1A',
                    lineHeight: 24,
                    flex: 1,
                  }}
                >
                  {getNotificationIcon(item.type)} {item.title}
                </Text>
                
                <Text style={{ 
                  fontSize: 12, 
                  color: '#999999',
                  fontWeight: '500',
                  marginLeft: 8,
                }}>
                  {formatRelativeTime(item.createdAt)}
                </Text>
              </View>
              
              <Text 
                style={{
                  fontSize: 15,
                  color: '#333333',
                  lineHeight: 22,
                }}
              >
                {item.message}
              </Text>
              
              {!item.isRead && (
                <View style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#FF3B30',
                }} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Screen>
  )
}

const $root: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.textDim,
  marginTop: spacing.md,
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
})

const $emptyIcon: ThemedStyle<TextStyle> = () => ({
  fontSize: 48,
  marginBottom: 16,
})

const $emptyTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 8,
})

const $emptyMessage: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 20,
})

const $notificationList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.md,
})

const $notificationItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.background,
  borderRadius: spacing.sm,
  marginVertical: spacing.xs,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
})

const $unreadItem: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary50,
  borderColor: colors.palette.primary200,
})

const $notificationContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $notificationHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.xs,
})

const $notificationIcon: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 20,
  marginRight: spacing.sm,
})

const $notificationTextContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $notificationTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $unreadText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
})

const $notificationTime: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $notificationMessage: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  lineHeight: 20,
  marginTop: spacing.xs,
})

const $unreadDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: colors.palette.primary500,
  marginLeft: 8,
})