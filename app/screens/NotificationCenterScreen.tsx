import React, { useEffect, useState } from 'react'
import { View, FlatList, StyleSheet, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { OrphiHeader, orphiTokens } from '@/design-system'
import { NotificationCard } from '@/components/NotificationCard'
import { NotificationService } from '@/core/services/firestore'
import { useAuth } from '@/core/context/AuthContext'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  description: string
  timestamp: Date
  read: boolean
}

export const NotificationCenterScreen: React.FC = () => {
  const navigation = useNavigation()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      if (!user) return

      // TODO: Implement NotificationService methods
      // const notifs = await NotificationService.getUserNotifications(user.uid)
      const notifs: Notification[] = [] // Temporary empty array
      setNotifications(notifs)

      const unread = notifs.filter((n) => !n.read).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const handleMarkRead = async (notificationId: string) => {
    try {
      if (!user) return

      // TODO: Implement NotificationService.markAsRead
      // await NotificationService.markAsRead(user.uid, notificationId)

      // 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      if (!user) return

      // TODO: Implement NotificationService.deleteNotification
      // await NotificationService.deleteNotification(user.uid, notificationId)

      // 로컬 상태 업데이트
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return timestamp.toLocaleDateString()
  }

  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationCard
      type={item.type}
      title={item.title}
      description={item.description}
      timestamp={formatRelativeTime(item.timestamp)}
      onMarkRead={!item.read ? () => handleMarkRead(item.id) : undefined}
      onDelete={() => handleDelete(item.id)}
    />
  )

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>알림이 없습니다</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <OrphiHeader
        title="알림"
        subtitle={unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : undefined}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Notification List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orphiTokens.colors.background,
  },
  listContent: {
    padding: orphiTokens.spacing.base,
  },
  emptyState: {
    paddingVertical: orphiTokens.spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: orphiTokens.typography.sizes.base,
    color: orphiTokens.colors.gray500,
  },
})
