/**
 * Auth Showcase Screen
 * Firebase 인증 시스템 데모 화면
 */

import { FC, useCallback, useState } from "react";
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { CodeBlock } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Code Examples
// ==========================================

const AUTH_CONTEXT_CODE = `import { useAuth } from "@/context/AuthContext";

const MyComponent = () => {
  const {
    user,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  } = useAuth();

  // Check authentication status
  if (isAuthenticated) {
    return <Text>Welcome, {user?.email}</Text>;
  }
};`;

const SIGN_IN_CODE = `const { signIn } = useAuth();

try {
  await signIn(email, password);
  // User is now signed in
} catch (error) {
  // Handle sign in error
}`;

const GOOGLE_SIGN_IN_CODE = `import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

const signInWithGoogle = async () => {
  // Check if device supports Google Play
  await GoogleSignin.hasPlayServices();

  // Get user ID token
  const { idToken } = await GoogleSignin.signIn();

  // Create Firebase credential
  const credential = auth.GoogleAuthProvider.credential(idToken);

  // Sign in with credential
  return auth().signInWithCredential(credential);
};`;

const SIGN_OUT_CODE = `const { signOut } = useAuth();

const handleSignOut = async () => {
  await signOut();
  // User is now signed out
  // Navigation will automatically redirect to SignIn
};`;

// ==========================================
// Component
// ==========================================

export const AuthShowcaseScreen: FC = function AuthShowcaseScreen() {
  const { themed, theme } = useAppTheme();
  const { user, isAuthenticated } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  const renderFeatureItem = useCallback(
    (icon: string, title: string, description: string) => (
      <View style={themed($featureItem)} key={title}>
        <Icon
          icon={icon as "check" | "lock" | "user" | "settings"}
          size={20}
          color={theme.colors.palette.secondary500}
        />
        <View style={themed($featureText)}>
          <Text style={themed($featureTitle)}>{title}</Text>
          <Text style={themed($featureDesc)}>{description}</Text>
        </View>
      </View>
    ),
    [themed, theme.colors.palette.secondary500],
  );

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Authentication</Text>
          <Text preset="default" style={themed($subtitle)}>
            Firebase Auth with Email & Google Sign-In
          </Text>
        </View>

        {/* Current User Status */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Current Status
          </Text>
          <Pressable
            style={themed($statusCard)}
            onPress={() => setShowDetails(!showDetails)}
          >
            <View style={themed($statusHeader)}>
              <View
                style={[
                  themed($statusIndicator),
                  {
                    backgroundColor: isAuthenticated
                      ? theme.colors.palette.secondary500
                      : theme.colors.palette.angry500,
                  },
                ]}
              />
              <Text style={themed($statusText)}>
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Text>
              <Icon
                icon={showDetails ? "caretRight" : "caretRight"}
                size={16}
                color={theme.colors.textDim}
              />
            </View>
            {showDetails && isAuthenticated && user && (
              <View style={themed($userDetails)}>
                <View style={themed($detailRow)}>
                  <Text style={themed($detailLabel)}>Email</Text>
                  <Text style={themed($detailValue)}>{user.email || "N/A"}</Text>
                </View>
                <View style={themed($detailRow)}>
                  <Text style={themed($detailLabel)}>UID</Text>
                  <Text style={themed($detailValue)} numberOfLines={1}>
                    {user.uid.slice(0, 20)}...
                  </Text>
                </View>
                <View style={themed($detailRow)}>
                  <Text style={themed($detailLabel)}>Provider</Text>
                  <Text style={themed($detailValue)}>
                    {user.providerId || "password"}
                  </Text>
                </View>
                <View style={themed($detailRow)}>
                  <Text style={themed($detailLabel)}>Verified</Text>
                  <Text style={themed($detailValue)}>
                    {user.emailVerified ? "Yes" : "No"}
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
        </View>

        {/* Auth Methods */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Supported Auth Methods
          </Text>
          <View style={themed($methodsGrid)}>
            <View style={themed($methodCard)}>
              <Icon icon="lock" size={32} color={theme.colors.tint} />
              <Text style={themed($methodName)}>Email/Password</Text>
              <Text style={themed($methodDesc)}>Traditional sign-in</Text>
            </View>
            <View style={themed($methodCard)}>
              <Icon icon="menu" size={32} color={theme.colors.tint} />
              <Text style={themed($methodName)}>Google</Text>
              <Text style={themed($methodDesc)}>OAuth sign-in</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Features
          </Text>
          <View style={themed($featuresCard)}>
            {renderFeatureItem("check", "Persistent Sessions", "Auto-restore auth state")}
            {renderFeatureItem("check", "Secure Token Storage", "Firebase ID tokens")}
            {renderFeatureItem("check", "Email Verification", "Verify user emails")}
            {renderFeatureItem("check", "Password Reset", "Self-service recovery")}
            {renderFeatureItem("check", "Auth State Listener", "Real-time state updates")}
            {renderFeatureItem("check", "Protected Routes", "Automatic navigation")}
          </View>
        </View>

        {/* Code Examples */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Usage Examples
          </Text>
          <CodeBlock
            title="Using AuthContext"
            code={AUTH_CONTEXT_CODE}
            language="tsx"
          />
          <CodeBlock title="Email Sign In" code={SIGN_IN_CODE} language="tsx" />
          <CodeBlock
            title="Google Sign In"
            code={GOOGLE_SIGN_IN_CODE}
            language="tsx"
          />
          <CodeBlock title="Sign Out" code={SIGN_OUT_CODE} language="tsx" />
        </View>

        {/* Auth Flow Diagram */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Auth Flow
          </Text>
          <View style={themed($flowCard)}>
            <View style={themed($flowStep)}>
              <View style={themed($flowNumber)}>
                <Text style={themed($flowNumberText)}>1</Text>
              </View>
              <Text style={themed($flowStepText)}>User opens app</Text>
            </View>
            <View style={themed($flowArrow)}>
              <Text style={themed($flowArrowText)}>↓</Text>
            </View>
            <View style={themed($flowStep)}>
              <View style={themed($flowNumber)}>
                <Text style={themed($flowNumberText)}>2</Text>
              </View>
              <Text style={themed($flowStepText)}>Check auth state</Text>
            </View>
            <View style={themed($flowArrow)}>
              <Text style={themed($flowArrowText)}>↓</Text>
            </View>
            <View style={themed($flowStep)}>
              <View style={themed($flowNumber)}>
                <Text style={themed($flowNumberText)}>3</Text>
              </View>
              <Text style={themed($flowStepText)}>
                Authenticated → Main{"\n"}Not Auth → SignIn
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

// ==========================================
// Styles
// ==========================================

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xxl,
});

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
});

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xs,
});

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  marginTop: spacing.lg,
});

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.md,
});

const $statusCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
});

const $statusHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
});

const $statusIndicator: ThemedStyle<ViewStyle> = () => ({
  width: 12,
  height: 12,
  borderRadius: 6,
});

const $statusText: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
});

const $userDetails: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.md,
  paddingTop: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
});

const $detailRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: spacing.xs,
});

const $detailLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
});

const $detailValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  fontWeight: "500",
  color: colors.text,
  flex: 1,
  textAlign: "right",
});

const $methodsGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
});

const $methodCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  alignItems: "center",
  gap: spacing.xs,
});

const $methodName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $methodDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
});

const $featuresCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.sm,
});

const $featureItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.sm,
});

const $featureText: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $featureTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $featureDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
});

const $flowCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  alignItems: "center",
});

const $flowStep: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
});

const $flowNumber: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
});

const $flowNumberText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "700",
  color: colors.palette.neutral100,
});

const $flowStepText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
  textAlign: "center",
});

const $flowArrow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xs,
});

const $flowArrowText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  color: colors.textDim,
});

export default AuthShowcaseScreen;
