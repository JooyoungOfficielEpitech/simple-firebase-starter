import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Calendar } from 'lucide-react-native'
import { OrphiHeader, OrphiButton, orphiTokens } from '@/design-system'
import { OrphiTextInput } from '@/components/TextInput'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '@/core/context/AuthContext'
import { UserService } from '@/core/services/firestore/userService'
import firestore from '@react-native-firebase/firestore'
import { UserGender } from '@/core/types/user'

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Form state
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState<UserGender | ''>('')
  const [birthday, setBirthday] = useState('')
  const [heightCm, setHeightCm] = useState('')

  // DatePicker state
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1))

  const userService = new UserService(firestore())

  // Load existing profile
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    if (!user?.uid) return

    try {
      setLoadingProfile(true)
      const profile = await userService.getUserProfile(user.uid)
      if (profile) {
        setName(profile.name || '')
        setPhoneNumber(profile.phoneNumber || '')
        setGender(profile.gender || '')
        setBirthday(profile.birthday || '')
        setHeightCm(profile.heightCm ? profile.heightCm.toString() : '')

        // Parse birthday to Date object
        if (profile.birthday) {
          const [year, month, day] = profile.birthday.split('-').map(Number)
          setSelectedDate(new Date(year, month - 1, day))
        }
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error)
      Alert.alert('오류', '프로필을 불러오는데 실패했습니다.')
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }

    if (date) {
      setSelectedDate(date)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      setBirthday(`${year}-${month}-${day}`)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('입력 오류', '이름을 입력해주세요.')
      return
    }

    if (phoneNumber && !/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(phoneNumber)) {
      Alert.alert('입력 오류', '올바른 전화번호 형식을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      await userService.updateUserProfile({
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        gender: gender || undefined,
        birthday: birthday.trim() || undefined,
        heightCm: heightCm ? parseInt(heightCm, 10) : undefined,
      })

      Alert.alert('성공', '프로필이 업데이트되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error('프로필 업데이트 실패:', error)
      Alert.alert('오류', '프로필 업데이트에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
    return (
      <View style={styles.container}>
        <OrphiHeader
          title="프로필 수정"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>프로필 불러오는 중...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <OrphiHeader
        title="프로필 수정"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <OrphiTextInput
          label="이름 *"
          placeholder="이름을 입력하세요"
          value={name}
          onChangeText={setName}
        />

        <OrphiTextInput
          label="이메일"
          placeholder="이메일"
          value={user?.email || ''}
          editable={false}
          style={styles.disabledInput}
        />

        <OrphiTextInput
          label="전화번호"
          placeholder="010-1234-5678"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        {/* Gender Selector */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>성별</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'male' && styles.genderButtonActive,
              ]}
              onPress={() => setGender('male')}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === 'male' && styles.genderButtonTextActive,
                ]}
              >
                남성
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'female' && styles.genderButtonActive,
              ]}
              onPress={() => setGender('female')}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === 'female' && styles.genderButtonTextActive,
                ]}
              >
                여성
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Birthday Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>생년월일</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.datePickerText, !birthday && styles.datePickerPlaceholder]}>
              {birthday || 'YYYY-MM-DD'}
            </Text>
            <Calendar size={20} color={orphiTokens.colors.gray500} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
          />
        )}

        {Platform.OS === 'ios' && showDatePicker && (
          <View style={styles.datePickerActions}>
            <OrphiButton
              variant="secondary"
              size="sm"
              onPress={() => setShowDatePicker(false)}
            >
              완료
            </OrphiButton>
          </View>
        )}

        <OrphiTextInput
          label="키 (cm)"
          placeholder="170"
          value={heightCm}
          onChangeText={setHeightCm}
          keyboardType="number-pad"
        />

        <OrphiButton
          variant="primary"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
        >
          저장
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
  content: {
    padding: orphiTokens.spacing.base,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: orphiTokens.typography.sizes.base,
    color: orphiTokens.colors.gray600,
  },
  disabledInput: {
    backgroundColor: orphiTokens.colors.gray50,
    color: orphiTokens.colors.gray500,
  },
  fieldContainer: {
    marginBottom: orphiTokens.spacing.base,
  },
  label: {
    fontSize: orphiTokens.typography.sizes.sm,
    fontWeight: orphiTokens.typography.weights.medium,
    color: orphiTokens.colors.gray700,
    marginBottom: orphiTokens.spacing.xs,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: orphiTokens.spacing.md,
  },
  genderButton: {
    flex: 1,
    paddingVertical: orphiTokens.spacing.md,
    borderRadius: orphiTokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: orphiTokens.colors.gray200,
    backgroundColor: orphiTokens.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonActive: {
    borderColor: orphiTokens.colors.green600,
    backgroundColor: orphiTokens.colors.green100,
  },
  genderButtonText: {
    fontSize: orphiTokens.typography.sizes.base,
    color: orphiTokens.colors.gray600,
  },
  genderButtonTextActive: {
    color: orphiTokens.colors.green600,
    fontWeight: orphiTokens.typography.weights.semibold,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: orphiTokens.colors.white,
    borderRadius: orphiTokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: orphiTokens.colors.gray200,
    paddingHorizontal: orphiTokens.spacing.base,
    paddingVertical: orphiTokens.spacing.md,
  },
  datePickerText: {
    fontSize: orphiTokens.typography.sizes.base,
    color: orphiTokens.colors.gray900,
  },
  datePickerPlaceholder: {
    color: orphiTokens.colors.gray400,
  },
  datePickerActions: {
    alignItems: 'flex-end',
    marginTop: orphiTokens.spacing.sm,
    marginBottom: orphiTokens.spacing.base,
  },
  saveButton: {
    marginTop: orphiTokens.spacing.lg,
  },
})
