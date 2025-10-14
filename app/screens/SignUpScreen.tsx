import { type FC, useCallback, useEffect } from "react"
import { View, type TextStyle, type ViewStyle } from "react-native"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { $styles } from "@/theme/styles"
import { $authHeaderContainer, $authTitle, $authSubtitle, $authFormContainer, $authErrorText } from "@/theme/authStyles"

import { AlertModal } from "@/components/AlertModal"
import { BackButton } from "@/components/BackButton"
import { Button } from "@/components/Button"
import { FormTextField } from "@/components/FormTextField"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { useAlert } from "@/hooks/useAlert"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"

// 회원가입 스키마
const signUpSchema = z
  .object({
    email: z.email(translate("auth:validation.emailInvalid")),
    password: z
      .string()
      .min(1, translate("auth:validation.passwordRequired"))
      .min(6, translate("auth:validation.passwordMinLength"))
      .regex(
        /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/,
        translate("auth:validation.passwordPattern"),
      ),
    confirmPassword: z.string().min(1, translate("auth:validation.passwordRequired")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: translate("auth:validation.passwordMismatch"),
    path: ["confirmPassword"],
  })

type SignUpFormData = z.infer<typeof signUpSchema>

interface SignUpScreenProps extends AppStackScreenProps<"SignUp"> {}

export const SignUpScreen: FC<SignUpScreenProps> = function SignUpScreen({ navigation }) {
  const { themed } = useAppTheme()
  const { signUpWithEmail, signInWithGoogle, authError, clearAuthError, isLoading } = useAuth()
  const { alert, alertState, hideAlert } = useAlert()

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  // password 필드 변경을 감지하여 confirmPassword 재검증
  const passwordValue = signUpForm.watch("password")
  const confirmPasswordValue = signUpForm.watch("confirmPassword")

  useEffect(() => {
    if (confirmPasswordValue) {
      signUpForm.trigger("confirmPassword")
    }
  }, [passwordValue, signUpForm, confirmPasswordValue])

  const handleEmailSignUp = useCallback(async () => {
    try {
      const isValid = await signUpForm.trigger()
      if (!isValid) return

      const data = signUpForm.getValues()
      await signUpWithEmail(data.email, data.password)

      alert(
        translate("signUpScreen:signUpSuccess"),
        translate("signUpScreen:emailVerificationMessage"),
        [{ text: translate("common:ok") }],
      )
    } catch (error) {
      alert(
        translate("signUpScreen:errorTitle"),
        error instanceof Error ? error.message : translate("signUpScreen:signUpFailed"),
      )
    }
  }, [signUpForm, signUpWithEmail])

  const handleGoogleAuth = useCallback(async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      alert(
        translate("signUpScreen:errorTitle"),
        error instanceof Error ? error.message : translate("signUpScreen:googleFailed"),
      )
    }
  }, [signInWithGoogle])

  const handleBeforeGoBack = useCallback(() => {
    signUpForm.reset()
    clearAuthError()
  }, [signUpForm, clearAuthError])

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} style={$styles.flex1}>
      <View style={themed($authHeaderContainer)}>
        <Text tx="signUpScreen:title" style={themed($authTitle)} />
        <Text tx="signUpScreen:subtitle" style={themed($authSubtitle)} />
      </View>

      <View style={themed($authFormContainer)}>
        <FormTextField
          control={signUpForm.control}
          name="email"
          placeholderTx="signUpScreen:emailPlaceholder"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <FormTextField
          control={signUpForm.control}
          name="password"
          placeholderTx="signUpScreen:passwordPlaceholder"
          secureTextEntry
          autoComplete="password"
        />

        <FormTextField
          control={signUpForm.control}
          name="confirmPassword"
          placeholderTx="signUpScreen:passwordPlaceholder"
          secureTextEntry
          autoComplete="password"
        />

        {authError && <Text text={authError} style={themed($authErrorText)} />}

        <Button
          preset="accent"
          tx="signUpScreen:signUpButton"
          onPress={handleEmailSignUp}
          isLoading={isLoading || signUpForm.formState.isSubmitting}
          disabled={!signUpForm.formState.isValid}
        />

        <Button tx="signUpScreen:googleButton" onPress={handleGoogleAuth} disabled={isLoading} />

        <BackButton 
          variant="text"
          tx="signUpScreen:backToSignIn"
          onBeforeGoBack={handleBeforeGoBack}
          disabled={isLoading}
        />
      </View>
      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
        dismissable={alertState.dismissable}
      />
    </Screen>
  )
}

