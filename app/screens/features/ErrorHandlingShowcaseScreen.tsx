/**
 * Error Handling Showcase Screen
 * 에러 바운더리 및 크래시 리포팅 데모 화면
 */

import { FC, useCallback, useState } from "react";
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { CodeBlock } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Constants
// ==========================================

const ERROR_TYPES = [
  {
    id: "render",
    name: "Render Errors",
    description: "Caught by Error Boundary",
    example: "Component crash",
  },
  {
    id: "async",
    name: "Async Errors",
    description: "Promise rejections",
    example: "API failures",
  },
  {
    id: "native",
    name: "Native Crashes",
    description: "Reported to Crashlytics",
    example: "Memory issues",
  },
];

// ==========================================
// Code Examples
// ==========================================

const ERROR_BOUNDARY_CODE = `import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary";

// Wrap your app or components
<ErrorBoundary catchErrors="always">
  <App />
</ErrorBoundary>

// Or use with fallback
<ErrorBoundary
  catchErrors={Config.catchErrors}
  onError={(error, stackTrace) => {
    reportError(error, stackTrace);
  }}
>
  <MyComponent />
</ErrorBoundary>`;

const ERROR_DETAILS_CODE = `// ErrorDetails component shows error info
<ErrorDetails
  error={error}
  errorInfo={errorInfo}
  onReset={() => {
    // Reset state and retry
    this.setState({ error: null });
  }}
/>`;

const CRASH_REPORTING_CODE = `import crashlytics from "@react-native-firebase/crashlytics";

// Report non-fatal errors
export const reportError = (error: Error, context?: string) => {
  if (__DEV__) {
    console.error(error);
  } else {
    crashlytics().recordError(error);
    if (context) {
      crashlytics().log(context);
    }
  }
};

// Set user context for better debugging
crashlytics().setUserId(user.uid);
crashlytics().setAttributes({
  email: user.email,
  plan: user.subscription,
});`;

const TRY_CATCH_CODE = `// API error handling pattern
const fetchData = async () => {
  try {
    const result = await api.getData();
    setData(result);
  } catch (error) {
    if (error instanceof NetworkError) {
      showOfflineMessage();
    } else if (error instanceof AuthError) {
      redirectToLogin();
    } else {
      reportError(error, "fetchData");
      showGenericError();
    }
  }
};`;

// ==========================================
// Component
// ==========================================

export const ErrorHandlingShowcaseScreen: FC = function ErrorHandlingShowcaseScreen() {
  const { themed, theme } = useAppTheme();
  const [simulatedError, setSimulatedError] = useState<string | null>(null);

  const simulateError = useCallback((type: string) => {
    setSimulatedError(type);
    setTimeout(() => setSimulatedError(null), 2000);
  }, []);

  const renderErrorType = useCallback(
    (errorType: (typeof ERROR_TYPES)[0]) => (
      <View key={errorType.id} style={themed($errorTypeCard)}>
        <View style={themed($errorTypeHeader)}>
          <Icon
            icon="x"
            size={20}
            color={theme.colors.palette.angry500}
          />
          <Text style={themed($errorTypeName)}>{errorType.name}</Text>
        </View>
        <Text style={themed($errorTypeDesc)}>{errorType.description}</Text>
        <View style={themed($errorExample)}>
          <Text style={themed($errorExampleLabel)}>Example:</Text>
          <Text style={themed($errorExampleText)}>{errorType.example}</Text>
        </View>
      </View>
    ),
    [themed, theme.colors.palette.angry500],
  );

  const renderFeature = useCallback(
    (title: string, description: string) => (
      <View key={title} style={themed($featureRow)}>
        <Icon
          icon="check"
          size={16}
          color={theme.colors.palette.secondary500}
        />
        <View style={themed($featureContent)}>
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
          <Text preset="heading">Error Handling</Text>
          <Text preset="default" style={themed($subtitle)}>
            Robust error boundaries and crash reporting
          </Text>
        </View>

        {/* Error Simulator */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Error Simulator
          </Text>
          <View style={themed($simulatorCard)}>
            {simulatedError ? (
              <View style={themed($errorDisplay)}>
                <Icon
                  icon="x"
                  size={32}
                  color={theme.colors.palette.angry500}
                />
                <Text style={themed($errorMessage)}>
                  Simulated {simulatedError} error!
                </Text>
                <Text style={themed($errorSubMessage)}>
                  This would be caught and handled gracefully.
                </Text>
              </View>
            ) : (
              <View style={themed($buttonGrid)}>
                <Pressable
                  style={({ pressed }) => [
                    themed($simButton),
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => simulateError("render")}
                >
                  <Text style={themed($simButtonText)}>Render Error</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    themed($simButton),
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => simulateError("async")}
                >
                  <Text style={themed($simButtonText)}>Async Error</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    themed($simButton),
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => simulateError("network")}
                >
                  <Text style={themed($simButtonText)}>Network Error</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Error Types */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Error Categories
          </Text>
          <View style={themed($errorTypesContainer)}>
            {ERROR_TYPES.map(renderErrorType)}
          </View>
        </View>

        {/* Error Flow */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Error Handling Flow
          </Text>
          <View style={themed($flowCard)}>
            <View style={themed($flowStep)}>
              <View style={[themed($flowBadge), { backgroundColor: theme.colors.palette.angry500 }]}>
                <Text style={themed($flowBadgeText)}>1</Text>
              </View>
              <View style={themed($flowStepContent)}>
                <Text style={themed($flowStepTitle)}>Error Occurs</Text>
                <Text style={themed($flowStepDesc)}>
                  Component crash, API failure, etc.
                </Text>
              </View>
            </View>
            <View style={themed($flowArrow)}>
              <Text style={themed($flowArrowText)}>↓</Text>
            </View>
            <View style={themed($flowStep)}>
              <View style={[themed($flowBadge), { backgroundColor: theme.colors.palette.accent500 }]}>
                <Text style={themed($flowBadgeText)}>2</Text>
              </View>
              <View style={themed($flowStepContent)}>
                <Text style={themed($flowStepTitle)}>Error Boundary Catches</Text>
                <Text style={themed($flowStepDesc)}>
                  Prevents crash, shows fallback UI
                </Text>
              </View>
            </View>
            <View style={themed($flowArrow)}>
              <Text style={themed($flowArrowText)}>↓</Text>
            </View>
            <View style={themed($flowStep)}>
              <View style={[themed($flowBadge), { backgroundColor: theme.colors.palette.secondary500 }]}>
                <Text style={themed($flowBadgeText)}>3</Text>
              </View>
              <View style={themed($flowStepContent)}>
                <Text style={themed($flowStepTitle)}>Report & Recover</Text>
                <Text style={themed($flowStepDesc)}>
                  Log to Crashlytics, offer retry
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Features
          </Text>
          <View style={themed($featuresCard)}>
            {renderFeature("Error Boundary", "Catches render errors gracefully")}
            {renderFeature("Crashlytics Integration", "Automatic crash reporting")}
            {renderFeature("User Context", "Include user info in reports")}
            {renderFeature("Custom Attributes", "Add debugging metadata")}
            {renderFeature("Non-Fatal Logging", "Log handled errors too")}
            {renderFeature("Recovery Options", "Reset and retry capabilities")}
          </View>
        </View>

        {/* Code Examples */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Implementation
          </Text>
          <CodeBlock
            title="Error Boundary Usage"
            code={ERROR_BOUNDARY_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Error Details Component"
            code={ERROR_DETAILS_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Crash Reporting"
            code={CRASH_REPORTING_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Try-Catch Pattern"
            code={TRY_CATCH_CODE}
            language="tsx"
          />
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

const $simulatorCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.lg,
  minHeight: 150,
  justifyContent: "center",
});

const $errorDisplay: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.sm,
});

const $errorMessage: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.palette.angry500,
});

const $errorSubMessage: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
  textAlign: "center",
});

const $buttonGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
  justifyContent: "center",
});

const $simButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.angry500,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 8,
});

const $simButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.palette.neutral100,
});

const $errorTypesContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
});

const $errorTypeCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
});

const $errorTypeHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginBottom: spacing.xs,
});

const $errorTypeName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  fontWeight: "600",
  color: colors.text,
});

const $errorTypeDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
});

const $errorExample: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  marginTop: spacing.sm,
  backgroundColor: colors.palette.neutral300,
  padding: spacing.xs,
  borderRadius: 6,
});

const $errorExampleLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  color: colors.textDim,
});

const $errorExampleText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  fontWeight: "500",
  color: colors.text,
});

const $flowCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
});

const $flowStep: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.md,
});

const $flowBadge: ThemedStyle<ViewStyle> = () => ({
  width: 28,
  height: 28,
  borderRadius: 14,
  justifyContent: "center",
  alignItems: "center",
});

const $flowBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "700",
  color: colors.palette.neutral100,
});

const $flowStepContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $flowStepTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $flowStepDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
});

const $flowArrow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingLeft: 7,
  paddingVertical: spacing.xs,
});

const $flowArrowText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
});

const $featuresCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.sm,
});

const $featureRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.sm,
});

const $featureContent: ThemedStyle<ViewStyle> = () => ({
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

export default ErrorHandlingShowcaseScreen;
