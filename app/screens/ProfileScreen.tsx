import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { User, Mail, Phone, Calendar, Ruler, CheckCircle } from 'lucide-react-native'
import { OrphiHeader, OrphiCard, OrphiButton, orphiTokens } from '@/design-system'
import { useAuth } from '@/core/context/AuthContext'
import { UserService } from '@/core/services/firestore/userService'
import { UserProfile } from '@/core/types/user'
import type { AppStackParamList } from '@/core/navigators/types'
import firestore from '@react-native-firebase/firestore'

type NavigationProp = NativeStackNavigationProp<AppStackParamList>

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>()
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const userService = new UserService(firestore())

  useEffect(() => {
    loadProfile()

    // 화면이 포커스될 때마다 프로필 다시 로드
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile()
    })

    return unsubscribe
  }, [navigation])

  const loadProfile = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const userProfile = await userService.getUserProfile(user.uid)
      setProfile(userProfile)
    } catch (error) {
      console.error('프로필 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const profileCompleteness = profile?.requiredProfileComplete
    ? 100
    : Math.round(
        ((profile?.phoneNumber ? 25 : 0) +
          (profile?.gender ? 25 : 0) +
          (profile?.birthday ? 25 : 0) +
          (profile?.heightCm ? 25 : 0)) *
          1
      )

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as never)
  }

  const handleChangePassword = () => {
    // 비밀번호 변경 로직
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleNotificationPress = () => {
    navigation.navigate('NotificationCenter')
  }

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode
    label: string
    value: string
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        {icon}
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  )

  const formatGender = (gender?: string) => {
    if (gender === 'male') return '남성'
    if (gender === 'female') return '여성'
    return '미입력'
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <OrphiHeader
          title="프로필"
          showBell
          bellBadgeCount={unreadNotifications}
          onBellPress={handleNotificationPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={orphiTokens.colors.green600} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <OrphiHeader
        title="프로필"
        showBell
        bellBadgeCount={unreadNotifications}
        onBellPress={handleNotificationPress}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <OrphiCard style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color={orphiTokens.colors.white} strokeWidth={2} />
            </View>
          </View>

          {/* User Info */}
          <Text style={styles.username}>{profile?.name || user?.displayName || user?.email || '사용자'}</Text>
          <Text style={styles.role}>{profile?.userType === 'organizer' ? '운영자' : '배우'}</Text>

          {/* Edit Profile Button */}
          <OrphiButton
            variant="primary"
            size="sm"
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            프로필 편집
          </OrphiButton>
        </OrphiCard>

        {/* 기본 정보 Section */}
        <OrphiCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={orphiTokens.colors.green600} strokeWidth={2} />
            <Text style={styles.sectionTitle}>기본 정보</Text>
          </View>

          <View style={styles.sectionContent}>
            <InfoRow
              icon={<Mail size={16} color={orphiTokens.colors.gray500} strokeWidth={2} />}
              label="이메일"
              value={profile?.email || user?.email || '미입력'}
            />
            <InfoRow
              icon={<Phone size={16} color={orphiTokens.colors.gray500} strokeWidth={2} />}
              label="전화번호"
              value={profile?.phoneNumber || '미입력'}
            />
            <InfoRow
              icon={<User size={16} color={orphiTokens.colors.gray500} strokeWidth={2} />}
              label="성별"
              value={formatGender(profile?.gender)}
            />
            <InfoRow
              icon={<Calendar size={16} color={orphiTokens.colors.gray500} strokeWidth={2} />}
              label="생년월일"
              value={profile?.birthday || '미입력'}
            />
            <InfoRow
              icon={<Ruler size={16} color={orphiTokens.colors.gray500} strokeWidth={2} />}
              label="키"
              value={profile?.heightCm ? `${profile.heightCm}cm` : '미입력'}
            />
          </View>
        </OrphiCard>

        {/* 계정 상태 Section */}
        <OrphiCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <CheckCircle size={20} color={orphiTokens.colors.green600} strokeWidth={2} />
            <Text style={styles.sectionTitle}>계정 상태</Text>
          </View>

          <View style={styles.sectionContent}>
            {/* 이메일 인증 */}
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>이메일 인증</Text>
              <View style={styles.statusBadge}>
                <CheckCircle
                  size={14}
                  color={orphiTokens.colors.green600}
                  strokeWidth={2}
                  fill={orphiTokens.colors.green600}
                />
                <Text style={styles.statusBadgeText}>완료</Text>
              </View>
            </View>

            {/* 프로필 완성도 */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>프로필 완성도</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${profileCompleteness}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{profileCompleteness}%</Text>
            </View>
          </View>
        </OrphiCard>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <OrphiButton variant="secondary" size="sm" onPress={handleChangePassword}>
            비밀번호 변경
          </OrphiButton>

          <OrphiButton variant="danger" size="sm" onPress={handleLogout}>
            로그아웃
          </OrphiButton>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orphiTokens.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: orphiTokens.spacing.base,
    paddingBottom: 120,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: orphiTokens.spacing.xl,
    marginBottom: orphiTokens.spacing.base,
  },
  avatarContainer: {
    marginBottom: orphiTokens.spacing.base,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: orphiTokens.colors.green600,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: orphiTokens.colors.green100,
  },
  username: {
    fontSize: orphiTokens.typography.sizes.xl,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray900,
    marginBottom: orphiTokens.spacing.xs,
  },
  role: {
    fontSize: orphiTokens.typography.sizes.base,
    color: orphiTokens.colors.gray600,
  },
  editButton: {
    marginTop: orphiTokens.spacing.base,
  },
  section: {
    marginBottom: orphiTokens.spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: orphiTokens.spacing.sm,
    marginBottom: orphiTokens.spacing.base,
  },
  sectionTitle: {
    fontSize: orphiTokens.typography.sizes.lg,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray900,
  },
  sectionContent: {
    gap: orphiTokens.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: orphiTokens.spacing.sm,
  },
  labelText: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray600,
  },
  valueText: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray900,
    fontWeight: orphiTokens.typography.weights.medium,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray600,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: orphiTokens.spacing.sm,
    paddingVertical: 4,
    backgroundColor: orphiTokens.colors.green100,
    borderRadius: orphiTokens.borderRadius.full,
  },
  statusBadgeText: {
    fontSize: orphiTokens.typography.sizes.xs,
    color: orphiTokens.colors.green600,
    fontWeight: orphiTokens.typography.weights.medium,
  },
  progressContainer: {
    gap: orphiTokens.spacing.xs,
  },
  progressLabel: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray600,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: orphiTokens.colors.gray200,
    borderRadius: orphiTokens.borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: orphiTokens.colors.orange300,
    borderRadius: orphiTokens.borderRadius.full,
  },
  progressText: {
    fontSize: orphiTokens.typography.sizes.xs,
    color: orphiTokens.colors.orange800,
    fontWeight: orphiTokens.typography.weights.semibold,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: orphiTokens.spacing.md,
    marginTop: orphiTokens.spacing.base,
  },
})
