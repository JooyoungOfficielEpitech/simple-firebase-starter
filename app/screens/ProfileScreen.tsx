import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { User, Mail, Phone, Calendar, Ruler, CheckCircle } from 'lucide-react-native'
import { OrphiHeader, OrphiCard, OrphiButton, orphiTokens } from '@/design-system'
import { useAuth } from '@/core/context/AuthContext'

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation()
  const { user, logout } = useAuth()

  const profileCompleteness = 20 // 프로필 완성도 (%)

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <OrphiHeader title="프로필" />

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
          <Text style={styles.username}>{user?.displayName || user?.email || '사용자'}</Text>
          <Text style={styles.role}>배우</Text>
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
              value={user?.email || '미입력'}
            />
            <InfoRow
              icon={<Phone size={16} color={orphiTokens.colors.gray500} strokeWidth={2} />}
              label="전화번호"
              value="미입력"
            />
            <InfoRow
              icon={<User size={16} color={orphiTokens.colors.gray500} strokeWidth={2} />}
              label="성별"
              value="미입력"
            />
            <InfoRow
              icon={<Calendar size={16} color={orphiTokens.colors.gray500} strokeWidth={2} />}
              label="생년월일"
              value="미입력"
            />
            <InfoRow
              icon={<Ruler size={16} color={orphiTokens.colors.gray500} strokeWidth={2} />}
              label="키"
              value="미입력"
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
          <OrphiButton
            variant="primary"
            gradient
            fullWidth
            onPress={handleEditProfile}
          >
            프로필 편집 →
          </OrphiButton>

          <OrphiButton variant="secondary" fullWidth onPress={handleChangePassword}>
            비밀번호 변경
          </OrphiButton>

          <OrphiButton variant="danger" fullWidth onPress={handleLogout}>
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
    gap: orphiTokens.spacing.md,
    marginTop: orphiTokens.spacing.base,
  },
})
