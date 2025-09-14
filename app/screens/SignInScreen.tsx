// 로그인 화면
import { type FC, useCallback } from "react"
import { View, Alert, type TextStyle, type ViewStyle } from "react-native"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { GoogleSignInButton } from "@/components/GoogleSignInButton"
import { $styles } from "@/theme/styles"

import { Button } from "../components/Button"
import { FormTextField } from "../components/FormTextField"
import { Screen } from "../components/Screen"
import { Text } from "../components/Text"
import { useAuth } from "../context/AuthContext"
import { translate } from "../i18n/translate"
import type { AppStackScreenProps } from "../navigators/AppNavigator"
import { useAppTheme } from "../theme/context"
import { type ThemedStyle } from "../theme/types"

// 로그인 스키마
const signinSchema = z.object({
  email: z.email(translate("auth:validation.emailInvalid")),
  password: z.string().min(1, translate("auth:validation.passwordRequired")),
})

type SignInFormData = z.infer<typeof signinSchema>

interface SignInScreenProps extends AppStackScreenProps<"SignIn"> {}

export const SignInScreen: FC<SignInScreenProps> = function SignInScreen({ navigation }) {
  const { themed } = useAppTheme()
  const { signInWithEmail, signInWithGoogle, clearAuthError, isLoading } = useAuth()

  const signinForm = useForm<SignInFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  const handleEmailSignIn = useCallback(async () => {
    try {
      const data = signinForm.getValues()
      const validation = signinSchema.safeParse(data)

      if (!validation.success) {
        const firstError = validation.error.issues[0]
        Alert.alert(translate("signInScreen:errorTitle"), firstError.message)
        return
      }

      await signInWithEmail(data.email, data.password)
    } catch (error) {
      Alert.alert(
        translate("signInScreen:errorTitle"),
        error instanceof Error ? error.message : translate("signInScreen:authFailed"),
      )
    }
  }, [signinForm, signInWithEmail])

  const handleGoogleAuth = useCallback(async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      Alert.alert(
        translate("signInScreen:errorTitle"),
        error instanceof Error ? error.message : translate("signInScreen:googleFailed"),
      )
    }
  }, [signInWithGoogle])

  const handleNavigateToSignUp = useCallback(() => {
    signinForm.reset()
    clearAuthError()
    navigation.navigate("SignUp")
  }, [signinForm, clearAuthError, navigation])

  const handleNavigateToForgotPassword = useCallback(() => {
    signinForm.reset()
    clearAuthError()
    navigation.navigate("ForgotPassword")
  }, [signinForm, clearAuthError, navigation])

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} style={$styles.flex1}>
      <View style={themed($headerContainer)}>
        <Text tx="signInScreen:title" style={themed($title)} />
        <Text tx="signInScreen:subtitle" style={themed($subtitle)} />
      </View>

      <View style={themed($formContainer)}>
        <FormTextField
          control={signinForm.control}
          name="email"
          placeholderTx="signInScreen:emailPlaceholder"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <FormTextField
          control={signinForm.control}
          name="password"
          placeholderTx="signInScreen:passwordPlaceholder"
          secureTextEntry
          autoComplete="password"
        />

        <Button
          preset="cta"
          tx="signInScreen:signInButton"
          onPress={handleEmailSignIn}
          isLoading={isLoading || signinForm.formState.isSubmitting}
          disabled={!signinForm.watch("email") || !signinForm.watch("password")}
        />

        <Button
          tx="signInScreen:forgotPasswordButton"
          onPress={handleNavigateToForgotPassword}
          disabled={isLoading}
          preset="default"
        />

        <GoogleSignInButton onPress={handleGoogleAuth} disabled={isLoading} />

        <Button
          tx="signInScreen:switchToSignUp"
          onPress={handleNavigateToSignUp}
          disabled={isLoading}
        />
      </View>
    </Screen>
  )
}

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.xl,
})

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 24,
  fontWeight: "bold",
  marginBottom: spacing.xs,
})
const $subtitle: ThemedStyle<TextStyle> = () => ({
  fontSize: 16,
  textAlign: "center",
})

const $formContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  gap: spacing.md,
})
