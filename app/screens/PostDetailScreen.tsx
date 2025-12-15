import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import { OrphiHeader, OrphiText, OrphiCard, OrphiBadge, OrphiButton, orphiTokens } from '@/design-system'
import { postService } from '@/core/services/firestore'
import type { Post } from '@/core/types/post'
import type { AppStackParamList } from '@/core/navigators/types'
import { MapPin, Calendar, Users, Mail, Phone, Award, Clock } from 'lucide-react-native'

type PostDetailRouteProp = RouteProp<AppStackParamList, 'PostDetail'>

export const PostDetailScreen: React.FC = () => {
  const route = useRoute<PostDetailRouteProp>()
  const navigation = useNavigation()
  const { postId } = route.params

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPost()
  }, [postId])

  const loadPost = async () => {
    try {
      setLoading(true)
      console.log('📋 공고 상세 로딩:', postId)

      // 조회수 증가
      await postService.incrementViewCount(postId)

      // 공고 상세 정보 가져오기
      const postData = await postService.getPost(postId)

      if (postData) {
        console.log('✅ 공고 상세 로드 완료')
        setPost(postData)
      } else {
        console.error('❌ 공고를 찾을 수 없음')
      }
    } catch (error) {
      console.error('❌ 공고 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return ''
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('ko-KR')
    } catch {
      return ''
    }
  }

  const calculateDDay = (deadline: string): number | null => {
    if (!deadline) return null
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <OrphiHeader title="공고 상세" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={orphiTokens.colors.green600} />
          <OrphiText variant="body" color="gray600" style={styles.loadingText}>
            공고를 불러오는 중...
          </OrphiText>
        </View>
      </View>
    )
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <OrphiHeader title="공고 상세" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <OrphiText variant="h3" color="gray600">
            공고를 찾을 수 없습니다
          </OrphiText>
        </View>
      </View>
    )
  }

  const dDay = post.deadline ? calculateDDay(post.deadline) : null

  return (
    <View style={styles.container}>
      <OrphiHeader title="공고 상세" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header - Status & D-Day */}
        <View style={styles.headerBadges}>
          <OrphiBadge variant={post.status === 'active' ? 'success' : 'neutral'}>
            {post.status === 'active' ? '모집중' : '모집마감'}
          </OrphiBadge>
          {dDay !== null && dDay >= 0 && (
            <OrphiBadge variant="info" style={styles.dDayBadge}>
              D-{dDay}
            </OrphiBadge>
          )}
        </View>

        {/* Title & Organization */}
        <OrphiText variant="h2" style={styles.title}>
          {post.title}
        </OrphiText>
        <OrphiText variant="body" color="gray600" style={styles.organization}>
          {post.organizationName}
        </OrphiText>

        {/* Basic Info */}
        <OrphiCard style={styles.section}>
          <OrphiText variant="h4" style={styles.sectionTitle}>
            기본 정보
          </OrphiText>

          <View style={styles.infoRow}>
            <Award size={20} color={orphiTokens.colors.gray600} />
            <OrphiText variant="body" style={styles.infoLabel}>작품명</OrphiText>
            <OrphiText variant="body" color="gray900">{post.production}</OrphiText>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={20} color={orphiTokens.colors.gray600} />
            <OrphiText variant="body" style={styles.infoLabel}>장소</OrphiText>
            <OrphiText variant="body" color="gray900">{post.location}</OrphiText>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={20} color={orphiTokens.colors.gray600} />
            <OrphiText variant="body" style={styles.infoLabel}>연습 일정</OrphiText>
            <OrphiText variant="body" color="gray900">{post.rehearsalSchedule}</OrphiText>
          </View>

          {post.deadline && (
            <View style={styles.infoRow}>
              <Clock size={20} color={orphiTokens.colors.gray600} />
              <OrphiText variant="body" style={styles.infoLabel}>마감일</OrphiText>
              <OrphiText variant="body" color="gray900">
                {new Date(post.deadline).toLocaleDateString('ko-KR')}
              </OrphiText>
            </View>
          )}
        </OrphiCard>

        {/* Description */}
        <OrphiCard style={styles.section}>
          <OrphiText variant="h4" style={styles.sectionTitle}>
            상세 설명
          </OrphiText>
          <OrphiText variant="body" color="gray700" style={styles.description}>
            {post.description}
          </OrphiText>
        </OrphiCard>

        {/* Roles */}
        {post.roles && post.roles.length > 0 && (
          <OrphiCard style={styles.section}>
            <OrphiText variant="h4" style={styles.sectionTitle}>
              모집 역할
            </OrphiText>
            {post.roles.map((role, index) => (
              <View key={index} style={styles.roleCard}>
                <View style={styles.roleHeader}>
                  <OrphiText variant="h4" color="green600">{role.name}</OrphiText>
                  <OrphiBadge variant="neutral" size="sm">
                    {role.count}명 모집
                  </OrphiBadge>
                </View>
                <OrphiText variant="caption" color="gray600" style={styles.roleDetail}>
                  성별: {role.gender === 'any' ? '무관' : role.gender === 'male' ? '남성' : '여성'}
                </OrphiText>
                <OrphiText variant="caption" color="gray600" style={styles.roleDetail}>
                  나이: {role.ageRange}
                </OrphiText>
                <OrphiText variant="body" color="gray700" style={styles.roleRequirements}>
                  {role.requirements}
                </OrphiText>
              </View>
            ))}
          </OrphiCard>
        )}

        {/* Audition Info */}
        {post.audition && (
          <OrphiCard style={styles.section}>
            <OrphiText variant="h4" style={styles.sectionTitle}>
              오디션 정보
            </OrphiText>
            <View style={styles.infoRow}>
              <OrphiText variant="body" style={styles.infoLabel}>일정</OrphiText>
              <OrphiText variant="body" color="gray900">{post.audition.date}</OrphiText>
            </View>
            <View style={styles.infoRow}>
              <OrphiText variant="body" style={styles.infoLabel}>장소</OrphiText>
              <OrphiText variant="body" color="gray900">{post.audition.location}</OrphiText>
            </View>
            <View style={styles.infoRow}>
              <OrphiText variant="body" style={styles.infoLabel}>방식</OrphiText>
              <OrphiText variant="body" color="gray900">{post.audition.method}</OrphiText>
            </View>
            <View style={styles.infoRow}>
              <OrphiText variant="body" style={styles.infoLabel}>결과 발표</OrphiText>
              <OrphiText variant="body" color="gray900">{post.audition.resultDate}</OrphiText>
            </View>
            {post.audition.requirements.length > 0 && (
              <>
                <OrphiText variant="body" style={styles.requirementsTitle}>
                  준비사항
                </OrphiText>
                {post.audition.requirements.map((req, idx) => (
                  <OrphiText key={idx} variant="body" color="gray700" style={styles.requirement}>
                    • {req}
                  </OrphiText>
                ))}
              </>
            )}
          </OrphiCard>
        )}

        {/* Benefits */}
        {post.benefits && (
          <OrphiCard style={styles.section}>
            <OrphiText variant="h4" style={styles.sectionTitle}>
              혜택
            </OrphiText>
            {post.benefits.fee && (
              <View style={styles.infoRow}>
                <OrphiText variant="body" style={styles.infoLabel}>출연료/활동비</OrphiText>
                <OrphiText variant="body" color="gray900">{post.benefits.fee}</OrphiText>
              </View>
            )}
            <View style={styles.benefitsList}>
              {post.benefits.transportation && (
                <OrphiBadge variant="success" size="sm" style={styles.benefitBadge}>
                  교통비 지원
                </OrphiBadge>
              )}
              {post.benefits.costume && (
                <OrphiBadge variant="success" size="sm" style={styles.benefitBadge}>
                  의상 제공
                </OrphiBadge>
              )}
              {post.benefits.portfolio && (
                <OrphiBadge variant="success" size="sm" style={styles.benefitBadge}>
                  포트폴리오 제공
                </OrphiBadge>
              )}
              {post.benefits.photography && (
                <OrphiBadge variant="success" size="sm" style={styles.benefitBadge}>
                  프로필 촬영
                </OrphiBadge>
              )}
              {post.benefits.meals && (
                <OrphiBadge variant="success" size="sm" style={styles.benefitBadge}>
                  식사 제공
                </OrphiBadge>
              )}
            </View>
            {post.benefits.other && post.benefits.other.length > 0 && (
              <>
                <OrphiText variant="body" style={styles.requirementsTitle}>
                  기타 혜택
                </OrphiText>
                {post.benefits.other.map((benefit, idx) => (
                  <OrphiText key={idx} variant="body" color="gray700" style={styles.requirement}>
                    • {benefit}
                  </OrphiText>
                ))}
              </>
            )}
          </OrphiCard>
        )}

        {/* Contact Info */}
        {post.contact && (
          <OrphiCard style={styles.section}>
            <OrphiText variant="h4" style={styles.sectionTitle}>
              연락처 및 지원 방법
            </OrphiText>
            <View style={styles.infoRow}>
              <Mail size={20} color={orphiTokens.colors.gray600} />
              <OrphiText variant="body" style={styles.infoLabel}>이메일</OrphiText>
              <OrphiText variant="body" color="gray900">{post.contact.email}</OrphiText>
            </View>
            {post.contact.phone && (
              <View style={styles.infoRow}>
                <Phone size={20} color={orphiTokens.colors.gray600} />
                <OrphiText variant="body" style={styles.infoLabel}>전화</OrphiText>
                <OrphiText variant="body" color="gray900">{post.contact.phone}</OrphiText>
              </View>
            )}
            <View style={styles.infoRow}>
              <OrphiText variant="body" style={styles.infoLabel}>지원 방법</OrphiText>
              <OrphiText variant="body" color="gray900">{post.contact.applicationMethod}</OrphiText>
            </View>
            {post.contact.requiredDocuments.length > 0 && (
              <>
                <OrphiText variant="body" style={styles.requirementsTitle}>
                  제출 서류
                </OrphiText>
                {post.contact.requiredDocuments.map((doc, idx) => (
                  <OrphiText key={idx} variant="body" color="gray700" style={styles.requirement}>
                    • {doc}
                  </OrphiText>
                ))}
              </>
            )}
          </OrphiCard>
        )}

        {/* Meta Info */}
        <OrphiCard style={styles.section}>
          <OrphiText variant="caption" color="gray500">
            작성일: {formatDate(post.createdAt)}
          </OrphiText>
          <OrphiText variant="caption" color="gray500">
            조회수: {post.viewCount || 0}
          </OrphiText>
        </OrphiCard>

        {/* Apply Button */}
        {post.status === 'active' && (
          <OrphiButton
            variant="primary"
            size="lg"
            onPress={() => {
              // TODO: 지원하기 기능 구현
              console.log('지원하기:', postId)
            }}
            style={styles.applyButton}
          >
            지원하기
          </OrphiButton>
        )}
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
  loadingText: {
    marginTop: orphiTokens.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: orphiTokens.spacing.base,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: orphiTokens.spacing.sm,
    marginBottom: orphiTokens.spacing.md,
  },
  dDayBadge: {
    marginLeft: orphiTokens.spacing.xs,
  },
  title: {
    marginBottom: orphiTokens.spacing.sm,
  },
  organization: {
    marginBottom: orphiTokens.spacing.lg,
  },
  section: {
    marginBottom: orphiTokens.spacing.base,
  },
  sectionTitle: {
    marginBottom: orphiTokens.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: orphiTokens.spacing.sm,
    gap: orphiTokens.spacing.sm,
  },
  infoLabel: {
    flex: 1,
    fontWeight: '600',
  },
  description: {
    lineHeight: 24,
  },
  roleCard: {
    backgroundColor: orphiTokens.colors.gray50,
    padding: orphiTokens.spacing.md,
    borderRadius: orphiTokens.borderRadius.md,
    marginBottom: orphiTokens.spacing.md,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: orphiTokens.spacing.sm,
  },
  roleDetail: {
    marginBottom: orphiTokens.spacing.xs,
  },
  roleRequirements: {
    marginTop: orphiTokens.spacing.sm,
  },
  requirementsTitle: {
    marginTop: orphiTokens.spacing.md,
    marginBottom: orphiTokens.spacing.sm,
    fontWeight: '600',
  },
  requirement: {
    marginLeft: orphiTokens.spacing.md,
    marginBottom: orphiTokens.spacing.xs,
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: orphiTokens.spacing.sm,
    marginTop: orphiTokens.spacing.sm,
  },
  benefitBadge: {
    marginBottom: orphiTokens.spacing.xs,
  },
  applyButton: {
    marginTop: orphiTokens.spacing.md,
    marginBottom: orphiTokens.spacing.xl,
  },
})
