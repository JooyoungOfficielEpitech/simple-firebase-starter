import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { OrphiButton, orphiTokens } from '@/design-system'
import { OrphiTextInput } from '@/components/TextInput'
import { useAuth } from '@/core/context/AuthContext'

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation()
  const { signInWithEmail, signInWithGoogle, authError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '유효한 이메일을 입력해주세요'
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validate()) return

    try {
      setLoading(true)
      await signInWithEmail(email, password)
      // 성공시 자동으로 네비게이션됨
    } catch (error) {
      console.error('Login error:', error)
      Alert.alert('로그인 실패', authError || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
    } catch (error) {
      console.error('Google sign in error:', error)
      Alert.alert('로그인 실패', authError || 'Google 로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#581c87', '#7e22ce', '#db2777']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.icon}>🎭</Text>
            <Text style={styles.title}>Orphi</Text>
            <Text style={styles.subtitle}>뮤지컬 배우를 위한 플랫폼</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.cardTitle}>로그인</Text>

            {/* Email Input */}
            <OrphiTextInput
              label="이메일"
              placeholder="이메일을 입력하세요"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            {/* Password Input */}
            <OrphiTextInput
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            {/* Login Button */}
            <OrphiButton
              variant="primary"
              gradient
              fullWidth
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
            >
              로그인
            </OrphiButton>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* Google Sign In Button */}
            <OrphiButton
              variant="secondary"
              fullWidth
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              Google로 계속하기
            </OrphiButton>

            {/* Helper Text */}
            <Text style={styles.helper}>
              계정이 없으신가요? 로그인하면 자동으로 생성됩니다.
            </Text>
          </View>

          {/* Footer Quote */}
          <View style={styles.footer}>
            <Text style={styles.quote}>"누구나 세상을 날아오를 수 있어"</Text>
            <Text style={styles.attribution}>- 엘파바</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: orphiTokens.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: orphiTokens.spacing['3xl'],
  },
  icon: {
    fontSize: 64,
    marginBottom: orphiTokens.spacing.base,
  },
  title: {
    fontSize: orphiTokens.typography.sizes['2xl'],
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.white,
    marginBottom: orphiTokens.spacing.xs,
  },
  subtitle: {
    fontSize: orphiTokens.typography.sizes.base,
    color: orphiTokens.colors.white,
    opacity: 0.9,
  },
  loginCard: {
    backgroundColor: orphiTokens.colors.white,
    borderRadius: orphiTokens.borderRadius.lg,
    padding: orphiTokens.spacing.xl,
    ...orphiTokens.shadows.xl,
  },
  cardTitle: {
    fontSize: orphiTokens.typography.sizes.xl,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray900,
    marginBottom: orphiTokens.spacing.xl,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: orphiTokens.spacing.base,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: orphiTokens.spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: orphiTokens.colors.gray200,
  },
  dividerText: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray500,
    marginHorizontal: orphiTokens.spacing.base,
  },
  helper: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray600,
    textAlign: 'center',
    marginTop: orphiTokens.spacing.base,
  },
  footer: {
    alignItems: 'center',
    marginTop: orphiTokens.spacing['3xl'],
  },
  quote: {
    fontSize: orphiTokens.typography.sizes.lg,
    fontStyle: 'italic',
    color: orphiTokens.colors.white,
    textAlign: 'center',
    marginBottom: orphiTokens.spacing.xs,
  },
  attribution: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.white,
    opacity: 0.8,
  },
})
