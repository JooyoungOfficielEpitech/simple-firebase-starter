import React, { useEffect, useState } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { User, Mail, Phone, CheckCircle, XCircle } from 'lucide-react-native'
import { OrphiHeader, OrphiCard, OrphiBadge, orphiTokens } from '@/design-system'
import { useAuth } from '@/core/context/AuthContext'
import type { AppStackParamList } from '@/core/navigators/types'

type ApplicationManagementRouteProp = RouteProp<AppStackParamList, 'ApplicationManagement'>

interface Application {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  role: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedAt: Date
  bio?: string
}

export const ApplicationManagementScreen: React.FC = () => {
  const route = useRoute<ApplicationManagementRouteProp>()
  const navigation = useNavigation()
  const { user } = useAuth()
  const { postId, postTitle } = route.params

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')

  useEffect(() => {
    loadApplications()
  }, [postId])

  const loadApplications = async () => {
    try {
      setLoading(true)
      // TODO: Implement ApplicationService.getApplicationsByPostId
      // const apps = await ApplicationService.getApplicationsByPostId(postId)
      const apps: Application[] = [] // Temporary
      setApplications(apps)
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (applicationId: string) => {
    Alert.alert('지원 승인', '이 지원자를 승인하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '승인',
        onPress: async () => {
          try {
            // TODO: Implement ApplicationService.updateApplicationStatus
            // await ApplicationService.updateApplicationStatus(applicationId, 'accepted')
            setApplications((prev) =>
              prev.map((app) =>
                app.id === applicationId ? { ...app, status: 'accepted' } : app
              )
            )
            Alert.alert('성공', '지원자가 승인되었습니다.')
          } catch (error) {
            console.error('Failed to accept application:', error)
            Alert.alert('오류', '승인에 실패했습니다.')
          }
        },
      },
    ])
  }

  const handleReject = async (applicationId: string) => {
    Alert.alert('지원 거절', '이 지원자를 거절하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '거절',
        style: 'destructive',
        onPress: async () => {
          try {
            // TODO: Implement ApplicationService.updateApplicationStatus
            // await ApplicationService.updateApplicationStatus(applicationId, 'rejected')
            setApplications((prev) =>
              prev.map((app) =>
                app.id === applicationId ? { ...app, status: 'rejected' } : app
              )
            )
            Alert.alert('성공', '지원자가 거절되었습니다.')
          } catch (error) {
            console.error('Failed to reject application:', error)
            Alert.alert('오류', '거절에 실패했습니다.')
          }
        },
      },
    ])
  }

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }

  const renderApplication = ({ item }: { item: Application }) => (
    <OrphiCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <User size={24} color={orphiTokens.colors.green600} strokeWidth={2} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.userRole}>{item.role}</Text>
          </View>
        </View>
        <OrphiBadge
          variant={
            item.status === 'accepted'
              ? 'success'
              : item.status === 'rejected'
              ? 'danger'
              : 'warning'
          }
          size="sm"
        >
          {item.status === 'accepted'
            ? '승인'
            : item.status === 'rejected'
            ? '거절'
            : '대기중'}
        </OrphiBadge>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactRow}>
          <Mail size={16} color={orphiTokens.colors.gray500} strokeWidth={2} />
          <Text style={styles.contactText}>{item.userEmail}</Text>
        </View>
        {item.userPhone && (
          <View style={styles.contactRow}>
            <Phone size={16} color={orphiTokens.colors.gray500} strokeWidth={2} />
            <Text style={styles.contactText}>{item.userPhone}</Text>
          </View>
        )}
      </View>

      {item.bio && (
        <View style={styles.bioContainer}>
          <Text style={styles.bioLabel}>자기소개</Text>
          <Text style={styles.bioText}>{item.bio}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.appliedDate}>
          {item.appliedAt.toLocaleDateString('ko-KR')} 지원
        </Text>
        {item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => handleAccept(item.id)}
              style={[styles.actionButton, styles.acceptButton]}
            >
              <CheckCircle size={16} color={orphiTokens.colors.green600} strokeWidth={2} />
              <Text style={styles.acceptButtonText}>승인</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleReject(item.id)}
              style={[styles.actionButton, styles.rejectButton]}
            >
              <XCircle size={16} color={orphiTokens.colors.red500} strokeWidth={2} />
              <Text style={styles.rejectButtonText}>거절</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </OrphiCard>
  )

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>지원자가 없습니다</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <OrphiHeader
        title="지원자 관리"
        subtitle={postTitle}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            전체 ({statusCounts.all})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            대기 ({statusCounts.pending})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'accepted' && styles.filterTabActive]}
          onPress={() => setFilter('accepted')}
        >
          <Text style={[styles.filterText, filter === 'accepted' && styles.filterTextActive]}>
            승인 ({statusCounts.accepted})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'rejected' && styles.filterTabActive]}
          onPress={() => setFilter('rejected')}
        >
          <Text style={[styles.filterText, filter === 'rejected' && styles.filterTextActive]}>
            거절 ({statusCounts.rejected})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={orphiTokens.colors.green600} />
        </View>
      ) : (
        <FlatList
          data={filteredApplications}
          renderItem={renderApplication}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orphiTokens.colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: orphiTokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: orphiTokens.colors.gray200,
    paddingHorizontal: orphiTokens.spacing.xs,
  },
  filterTab: {
    flex: 1,
    paddingVertical: orphiTokens.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: orphiTokens.colors.green600,
  },
  filterText: {
    fontSize: orphiTokens.typography.sizes.sm,
    fontWeight: orphiTokens.typography.weights.medium,
    color: orphiTokens.colors.gray500,
  },
  filterTextActive: {
    color: orphiTokens.colors.green600,
    fontWeight: orphiTokens.typography.weights.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: orphiTokens.spacing.base,
  },
  card: {
    marginBottom: orphiTokens.spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: orphiTokens.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: orphiTokens.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: orphiTokens.colors.green100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: orphiTokens.typography.sizes.base,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray900,
    marginBottom: orphiTokens.spacing.xs,
  },
  userRole: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray600,
  },
  contactInfo: {
    marginBottom: orphiTokens.spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: orphiTokens.spacing.sm,
    marginBottom: orphiTokens.spacing.xs,
  },
  contactText: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray700,
  },
  bioContainer: {
    marginBottom: orphiTokens.spacing.md,
    padding: orphiTokens.spacing.md,
    backgroundColor: orphiTokens.colors.gray50,
    borderRadius: orphiTokens.borderRadius.sm,
  },
  bioLabel: {
    fontSize: orphiTokens.typography.sizes.xs,
    fontWeight: orphiTokens.typography.weights.semibold,
    color: orphiTokens.colors.gray600,
    marginBottom: orphiTokens.spacing.xs,
  },
  bioText: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray700,
    lineHeight: orphiTokens.typography.lineHeights.relaxed * orphiTokens.typography.sizes.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: orphiTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: orphiTokens.colors.gray200,
  },
  appliedDate: {
    fontSize: orphiTokens.typography.sizes.xs,
    color: orphiTokens.colors.gray500,
  },
  actions: {
    flexDirection: 'row',
    gap: orphiTokens.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: orphiTokens.spacing.md,
    paddingVertical: orphiTokens.spacing.sm,
    borderRadius: orphiTokens.borderRadius.sm,
    borderWidth: 1,
  },
  acceptButton: {
    borderColor: orphiTokens.colors.green600,
    backgroundColor: orphiTokens.colors.green100,
  },
  acceptButtonText: {
    fontSize: orphiTokens.typography.sizes.sm,
    fontWeight: orphiTokens.typography.weights.medium,
    color: orphiTokens.colors.green600,
  },
  rejectButton: {
    borderColor: orphiTokens.colors.red500,
    backgroundColor: orphiTokens.colors.white,
  },
  rejectButtonText: {
    fontSize: orphiTokens.typography.sizes.sm,
    fontWeight: orphiTokens.typography.weights.medium,
    color: orphiTokens.colors.red500,
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
