// 비밀번호 찾기 화면
import { type FC, useCallback, useState } from "react"
import { View, Alert, type TextStyle, type ViewStyle } from "react-native"
import { zodResolver } from "@hookform/resolvers/zod"
import auth from "@react-native-firebase/auth"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { $styles } from "@/theme/styles"
import { $authHeaderContainer, $authTitle, $authSubtitle, $authFormContainer } from "@/theme/authStyles"

import { Button } from "@/components/Button"
import { FormTextField } from "@/components/FormTextField"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"

// 비밀번호 재설정 스키마
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: translate("auth:validation.emailInvalid") }),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordScreenProps extends AppStackScreenProps<"ForgotPassword"> {}

export const ForgotPasswordScreen: FC<ForgotPasswordScreenProps> = function ForgotPasswordScreen({
  navigation,
}) {
  const { themed } = useAppTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  })

  // 이메일/비밀번호 로그인 사용자인지 확인하는 함수
  const validateEmailForPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    try {
      const signInMethods = await auth().fetchSignInMethodsForEmail(email)
      return signInMethods.includes("password")
    } catch (error) {
      // 네트워크 오류 등의 경우 false 반환 (보안상 허용하지 않음)
      console.warn("Failed to fetch sign-in methods:", error)
      return false
    }
  }, [])

  const handleSendResetEmail = useCallback(async () => {
    try {
      setIsLoading(true)
      const isValid = await forgotPasswordForm.trigger()
      if (!isValid) return

      const data = forgotPasswordForm.getValues()

      // 이메일/비밀번호 로그인 사용자인지 확인
      const canResetPassword = await validateEmailForPasswordReset(data.email)

      if (!canResetPassword) {
        Alert.alert(
          translate("forgotPasswordScreen:errorTitle"),
          translate("forgotPasswordScreen:emailNotEligible"),
        )
        return
      }

      await auth().sendPasswordResetEmail(data.email)

      setIsEmailSent(true)
      Alert.alert(
        translate("forgotPasswordScreen:successTitle"),
        translate("forgotPasswordScreen:successMessage"),
      )
    } catch (error) {
      Alert.alert(
        translate("forgotPasswordScreen:errorTitle"),
        error instanceof Error ? error.message : translate("forgotPasswordScreen:sendFailed"),
      )
    } finally {
      setIsLoading(false)
    }
  }, [forgotPasswordForm, validateEmailForPasswordReset])

  const handleBackToSignIn = useCallback(() => {
    forgotPasswordForm.reset()
    setIsEmailSent(false)
    navigation.goBack()
  }, [forgotPasswordForm, navigation])

  const handleResendEmail = useCallback(async () => {
    await handleSendResetEmail()
  }, [handleSendResetEmail])

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} style={$styles.flex1}>
      <View style={themed($authHeaderContainer)}>
        <Text tx="forgotPasswordScreen:title" style={themed($authTitle)} />
        <Text
          tx={isEmailSent ? "forgotPasswordScreen:subtitleSent" : "forgotPasswordScreen:subtitle"}
          style={themed($authSubtitle)}
        />
      </View>

      <View style={themed($authFormContainer)}>
        {!isEmailSent ? (
          <>
            <FormTextField
              control={forgotPasswordForm.control}
              name="email"
              placeholderTx="forgotPasswordScreen:emailPlaceholder"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Button
              tx="forgotPasswordScreen:sendButton"
              onPress={handleSendResetEmail}
              disabled={isLoading || forgotPasswordForm.formState.isSubmitting}
            />
          </>
        ) : (
          <View style={themed($sentContainer)}>
            <Text tx="forgotPasswordScreen:checkEmail" style={themed($instructionText)} />

            <Button
              tx="forgotPasswordScreen:resendButton"
              onPress={handleResendEmail}
              disabled={isLoading}
              preset="default"
              style={themed($fullWidthButton)}
            />
          </View>
        )}

        <Button
          tx="forgotPasswordScreen:backToSignIn"
          onPress={handleBackToSignIn}
          disabled={isLoading}
          preset="default"
        />
      </View>
    </Screen>
  )
}


const $sentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.lg,
})

const $instructionText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  fontSize: 14,
  paddingHorizontal: spacing.md,
  lineHeight: 20,
})

const $fullWidthButton: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
})
