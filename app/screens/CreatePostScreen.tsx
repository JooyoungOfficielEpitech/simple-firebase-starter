import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, TextInput, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { OrphiHeader, OrphiText, OrphiCard, OrphiButton, orphiTokens } from '@/design-system'
import { postService } from '@/core/services/firestore'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'

export const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation()

  // 기본 정보
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [production, setProduction] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [location, setLocation] = useState('')
  const [rehearsalSchedule, setRehearsalSchedule] = useState('')
  const [deadline, setDeadline] = useState('')
  const [tags, setTags] = useState('')

  // 역할 정보 (간단한 버전)
  const [roleName, setRoleName] = useState('')
  const [roleGender, setRoleGender] = useState<'male' | 'female' | 'any'>('any')
  const [roleAgeRange, setRoleAgeRange] = useState('')
  const [roleRequirements, setRoleRequirements] = useState('')
  const [roleCount, setRoleCount] = useState('1')

  // 오디션 정보
  const [auditionDate, setAuditionDate] = useState('')
  const [auditionLocation, setAuditionLocation] = useState('')
  const [auditionMethod, setAuditionMethod] = useState('대면')

  // 연락처
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [applicationMethod, setApplicationMethod] = useState('')

  const [loading, setLoading] = useState(false)

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('오류', '제목을 입력해주세요')
      return false
    }
    if (!description.trim()) {
      Alert.alert('오류', '상세 설명을 입력해주세요')
      return false
    }
    if (!production.trim()) {
      Alert.alert('오류', '작품명을 입력해주세요')
      return false
    }
    if (!organizationName.trim()) {
      Alert.alert('오류', '단체명을 입력해주세요')
      return false
    }
    if (!location.trim()) {
      Alert.alert('오류', '장소를 입력해주세요')
      return false
    }
    if (!rehearsalSchedule.trim()) {
      Alert.alert('오류', '연습 일정을 입력해주세요')
      return false
    }
    if (!contactEmail.trim()) {
      Alert.alert('오류', '연락처 이메일을 입력해주세요')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const user = auth().currentUser
    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다')
      return
    }

    try {
      setLoading(true)
      console.log('📝 공고 작성 시작...')

      // 역할 정보 구성
      const roles = roleName.trim()
        ? [
            {
              name: roleName,
              gender: roleGender,
              ageRange: roleAgeRange || '무관',
              requirements: roleRequirements || '없음',
              count: parseInt(roleCount) || 1,
            },
          ]
        : undefined

      // 오디션 정보 구성
      const audition =
        auditionDate && auditionLocation
          ? {
              date: auditionDate,
              location: auditionLocation,
              method: auditionMethod,
              requirements: [],
              resultDate: '',
            }
          : undefined

      // 연락처 정보 구성
      const contact = {
        email: contactEmail,
        phone: contactPhone || undefined,
        applicationMethod: applicationMethod || '이메일',
        requiredDocuments: [],
      }

      // 태그 배열 생성
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const postData = {
        title: title.trim(),
        description: description.trim(),
        production: production.trim(),
        organizationName: organizationName.trim(),
        location: location.trim(),
        rehearsalSchedule: rehearsalSchedule.trim(),
        status: 'active' as const,
        tags: tagArray.length > 0 ? tagArray : ['뮤지컬'],
        deadline: deadline || undefined,
        roles,
        audition,
        contact,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }

      const postId = await postService.createPost(postData, user.displayName || '익명', user.uid)

      console.log('✅ 공고 작성 완료:', postId)

      Alert.alert('성공', '공고가 등록되었습니다', [
        {
          text: '확인',
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    } catch (error) {
      console.error('❌ 공고 작성 실패:', error)
      Alert.alert('오류', '공고 작성에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <OrphiHeader title="공고 작성" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 기본 정보 */}
        <OrphiCard style={styles.section}>
          <OrphiText variant="h4" style={styles.sectionTitle}>
            기본 정보
          </OrphiText>

          <OrphiText variant="body" style={styles.label}>
            제목 *
          </OrphiText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="예: 뮤지컬 '햄릿' 주연 배우 모집"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            작품명 *
          </OrphiText>
          <TextInput
            style={styles.input}
            value={production}
            onChangeText={setProduction}
            placeholder="예: 햄릿"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            단체명 *
          </OrphiText>
          <TextInput
            style={styles.input}
            value={organizationName}
            onChangeText={setOrganizationName}
            placeholder="예: 서울뮤지컬단"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            장소 *
          </OrphiText>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="예: 건대입구역 앞 연습실"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            연습 일정 *
          </OrphiText>
          <TextInput
            style={styles.input}
            value={rehearsalSchedule}
            onChangeText={setRehearsalSchedule}
            placeholder="예: 매주 일요일 오후 2시"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            마감일
          </OrphiText>
          <TextInput
            style={styles.input}
            value={deadline}
            onChangeText={setDeadline}
            placeholder="예: 2025-01-31"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            태그 (쉼표로 구분)
          </OrphiText>
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="예: 뮤지컬, 남성역할, 주연"
            placeholderTextColor={orphiTokens.colors.gray500}
          />
        </OrphiCard>

        {/* 상세 설명 */}
        <OrphiCard style={styles.section}>
          <OrphiText variant="h4" style={styles.sectionTitle}>
            상세 설명 *
          </OrphiText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="공고에 대한 상세한 설명을 입력해주세요"
            placeholderTextColor={orphiTokens.colors.gray500}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </OrphiCard>

        {/* 모집 역할 */}
        <OrphiCard style={styles.section}>
          <OrphiText variant="h4" style={styles.sectionTitle}>
            모집 역할 (선택)
          </OrphiText>

          <OrphiText variant="body" style={styles.label}>
            역할명
          </OrphiText>
          <TextInput
            style={styles.input}
            value={roleName}
            onChangeText={setRoleName}
            placeholder="예: 햄릿"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            성별
          </OrphiText>
          <View style={styles.genderButtons}>
            <OrphiButton
              variant={roleGender === 'male' ? 'primary' : 'text'}
              size="sm"
              onPress={() => setRoleGender('male')}
              style={styles.genderButton}
            >
              남성
            </OrphiButton>
            <OrphiButton
              variant={roleGender === 'female' ? 'primary' : 'text'}
              size="sm"
              onPress={() => setRoleGender('female')}
              style={styles.genderButton}
            >
              여성
            </OrphiButton>
            <OrphiButton
              variant={roleGender === 'any' ? 'primary' : 'text'}
              size="sm"
              onPress={() => setRoleGender('any')}
              style={styles.genderButton}
            >
              무관
            </OrphiButton>
          </View>

          <OrphiText variant="body" style={styles.label}>
            나이대
          </OrphiText>
          <TextInput
            style={styles.input}
            value={roleAgeRange}
            onChangeText={setRoleAgeRange}
            placeholder="예: 25-35세"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            모집 인원
          </OrphiText>
          <TextInput
            style={styles.input}
            value={roleCount}
            onChangeText={setRoleCount}
            placeholder="1"
            keyboardType="number-pad"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            요구사항
          </OrphiText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={roleRequirements}
            onChangeText={setRoleRequirements}
            placeholder="역할에 대한 요구사항을 입력해주세요"
            placeholderTextColor={orphiTokens.colors.gray500}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </OrphiCard>

        {/* 오디션 정보 */}
        <OrphiCard style={styles.section}>
          <OrphiText variant="h4" style={styles.sectionTitle}>
            오디션 정보 (선택)
          </OrphiText>

          <OrphiText variant="body" style={styles.label}>
            오디션 일정
          </OrphiText>
          <TextInput
            style={styles.input}
            value={auditionDate}
            onChangeText={setAuditionDate}
            placeholder="예: 2025-01-15"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            오디션 장소
          </OrphiText>
          <TextInput
            style={styles.input}
            value={auditionLocation}
            onChangeText={setAuditionLocation}
            placeholder="예: 홍대 연습실"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            오디션 방식
          </OrphiText>
          <View style={styles.genderButtons}>
            <OrphiButton
              variant={auditionMethod === '대면' ? 'primary' : 'text'}
              size="sm"
              onPress={() => setAuditionMethod('대면')}
              style={styles.genderButton}
            >
              대면
            </OrphiButton>
            <OrphiButton
              variant={auditionMethod === '화상' ? 'primary' : 'text'}
              size="sm"
              onPress={() => setAuditionMethod('화상')}
              style={styles.genderButton}
            >
              화상
            </OrphiButton>
            <OrphiButton
              variant={auditionMethod === '서류' ? 'primary' : 'text'}
              size="sm"
              onPress={() => setAuditionMethod('서류')}
              style={styles.genderButton}
            >
              서류
            </OrphiButton>
          </View>
        </OrphiCard>

        {/* 연락처 */}
        <OrphiCard style={styles.section}>
          <OrphiText variant="h4" style={styles.sectionTitle}>
            연락처 *
          </OrphiText>

          <OrphiText variant="body" style={styles.label}>
            이메일 *
          </OrphiText>
          <TextInput
            style={styles.input}
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="예: contact@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            전화번호
          </OrphiText>
          <TextInput
            style={styles.input}
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="예: 010-1234-5678"
            keyboardType="phone-pad"
            placeholderTextColor={orphiTokens.colors.gray500}
          />

          <OrphiText variant="body" style={styles.label}>
            지원 방법
          </OrphiText>
          <TextInput
            style={styles.input}
            value={applicationMethod}
            onChangeText={setApplicationMethod}
            placeholder="예: 이메일로 이력서 제출"
            placeholderTextColor={orphiTokens.colors.gray500}
          />
        </OrphiCard>

        {/* Submit Button */}
        <OrphiButton
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitButton}
        >
          {loading ? '등록 중...' : '공고 등록하기'}
        </OrphiButton>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orphiTokens.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: orphiTokens.spacing.base,
  },
  section: {
    marginBottom: orphiTokens.spacing.base,
  },
  sectionTitle: {
    marginBottom: orphiTokens.spacing.md,
  },
  label: {
    marginBottom: orphiTokens.spacing.xs,
    marginTop: orphiTokens.spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: orphiTokens.colors.white,
    borderWidth: 1,
    borderColor: orphiTokens.colors.gray400,
    borderRadius: orphiTokens.borderRadius.md,
    padding: orphiTokens.spacing.md,
    fontSize: 16,
    color: orphiTokens.colors.gray900,
  },
  textArea: {
    minHeight: 100,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: orphiTokens.spacing.sm,
    marginTop: orphiTokens.spacing.xs,
  },
  genderButton: {
    flex: 1,
  },
  submitButton: {
    marginTop: orphiTokens.spacing.md,
    marginBottom: orphiTokens.spacing.xl,
  },
})
