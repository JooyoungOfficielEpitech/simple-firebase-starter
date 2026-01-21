/**
 * Feedback Showcase Screen
 * LoadingOverlay, EmptyState 등 피드백 컴포넌트 데모
 */

import { FC, useState } from "react";
import { ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { Button } from "@/components/Button";
import { CodeBlock } from "@/components/CodeBlock";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Code Examples
// ==========================================

const LOADING_OVERLAY_CODE = `import { LoadingOverlay } from "@/components/LoadingOverlay";

// Basic loading overlay
<LoadingOverlay visible={isLoading} />

// With custom message
<LoadingOverlay
  visible={isLoading}
  message="Saving changes..."
/>

// With translucent background
<LoadingOverlay
  visible={isLoading}
  message="Processing..."
  translucent
/>`;

const EMPTY_STATE_CODE = `import { EmptyState } from "@/components/EmptyState";

// Basic empty state
<EmptyState
  heading="No items found"
  content="Add your first item to get started"
/>

// With custom image
<EmptyState
  imageSource={require("@assets/images/empty.png")}
  heading="No favorites"
  content="Items you favorite will appear here"
/>

// With action button
<EmptyState
  heading="No notifications"
  content="You're all caught up!"
  button="Enable Notifications"
  buttonOnPress={enableNotifications}
/>`;

const FEEDBACK_PATTERNS_CODE = `// Loading state pattern
const [isLoading, setIsLoading] = useState(false);
const [data, setData] = useState([]);

if (isLoading) {
  return <LoadingOverlay visible />;
}

if (data.length === 0) {
  return (
    <EmptyState
      heading="No data"
      content="Pull to refresh"
    />
  );
}

return <DataList data={data} />;`;

// ==========================================
// Component
// ==========================================

export const FeedbackShowcaseScreen: FC = function FeedbackShowcaseScreen() {
  const { themed, theme } = useAppTheme();
  const [showLoading, setShowLoading] = useState(false);

  const handleShowLoading = () => {
    setShowLoading(true);
    setTimeout(() => setShowLoading(false), 2000);
  };

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Feedback</Text>
          <Text preset="default" style={themed($subtitle)}>
            Loading states, empty states, and user feedback components
          </Text>
        </View>

        {/* Loading Overlay */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            LoadingOverlay
          </Text>
          <View style={themed($infoCard)}>
            <Icon icon="check" size={20} color={theme.colors.palette.secondary500} />
            <Text style={themed($infoText)}>
              LoadingOverlay displays a full-screen loading indicator with optional
              message. Use it during async operations to block user interaction.
            </Text>
          </View>
          <View style={themed($previewCard)}>
            <Button
              text="Show Loading (2s)"
              preset="filled"
              onPress={handleShowLoading}
              style={themed($demoButton)}
            />
            <Text style={themed($demoHint)}>
              Tap to see loading overlay in action
            </Text>
          </View>
          <CodeBlock title="LoadingOverlay Usage" code={LOADING_OVERLAY_CODE} language="tsx" />
        </View>

        {/* Empty State */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            EmptyState
          </Text>
          <View style={themed($previewCard)}>
            <View style={themed($emptyStatePreview)}>
              <EmptyState
                heading="No results found"
                content="Try adjusting your search or filters"
                style={themed($emptyStateDemo)}
              />
            </View>
          </View>
          <View style={themed($previewCard)}>
            <Text style={themed($previewLabel)}>With Image and Button</Text>
            <View style={themed($emptyStatePreview)}>
              <EmptyState
                heading="No favorites yet"
                content="Items you favorite will appear here for quick access"
                button="Browse Items"
                buttonOnPress={() => console.log("Browse pressed")}
                style={themed($emptyStateDemo)}
              />
            </View>
          </View>
          <CodeBlock title="EmptyState Usage" code={EMPTY_STATE_CODE} language="tsx" />
        </View>

        {/* Common Patterns */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Common Patterns
          </Text>
          <View style={themed($patternCard)}>
            <View style={themed($patternRow)}>
              <View style={themed($patternIcon)}>
                <Icon icon="check" size={24} color={theme.colors.palette.primary500} />
              </View>
              <View style={themed($patternContent)}>
                <Text style={themed($patternTitle)}>Loading → Data → Empty</Text>
                <Text style={themed($patternDesc)}>
                  Standard flow: show loading during fetch, display data or empty state
                </Text>
              </View>
            </View>
            <View style={themed($patternRow)}>
              <View style={themed($patternIcon)}>
                <Icon icon="check" size={24} color={theme.colors.palette.primary500} />
              </View>
              <View style={themed($patternContent)}>
                <Text style={themed($patternTitle)}>Optimistic Updates</Text>
                <Text style={themed($patternDesc)}>
                  Update UI immediately, revert on error with feedback
                </Text>
              </View>
            </View>
            <View style={themed($patternRow)}>
              <View style={themed($patternIcon)}>
                <Icon icon="check" size={24} color={theme.colors.palette.primary500} />
              </View>
              <View style={themed($patternContent)}>
                <Text style={themed($patternTitle)}>Skeleton Loading</Text>
                <Text style={themed($patternDesc)}>
                  Show content placeholders while data is loading
                </Text>
              </View>
            </View>
          </View>
          <CodeBlock title="State Flow Pattern" code={FEEDBACK_PATTERNS_CODE} language="tsx" />
        </View>

        {/* Best Practices */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Best Practices
          </Text>
          <View style={themed($practicesCard)}>
            {[
              {
                title: "Always provide context",
                desc: "Include messages explaining what's happening or why state is empty",
              },
              {
                title: "Use appropriate duration",
                desc: "Show loading for operations >300ms, use skeleton for faster loads",
              },
              {
                title: "Provide actionable empty states",
                desc: "Include CTAs when users can take action to change empty state",
              },
              {
                title: "Handle edge cases",
                desc: "Consider error states, partial data, and offline scenarios",
              },
            ].map((practice) => (
              <View key={practice.title} style={themed($practiceRow)}>
                <Text style={themed($practiceTitle)}>{practice.title}</Text>
                <Text style={themed($practiceDesc)}>{practice.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Props Table */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            LoadingOverlay Props
          </Text>
          <View style={themed($propsCard)}>
            {[
              { name: "visible", type: "boolean", desc: "Show/hide overlay" },
              { name: "message", type: "string", desc: "Loading message" },
              { name: "messageTx", type: "TxKeyPath", desc: "i18n message key" },
              { name: "translucent", type: "boolean", desc: "Semi-transparent background" },
            ].map((prop) => (
              <View key={prop.name} style={themed($propRow)}>
                <Text style={themed($propName)}>{prop.name}</Text>
                <Text style={themed($propType)}>{prop.type}</Text>
                <Text style={themed($propDesc)}>{prop.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            EmptyState Props
          </Text>
          <View style={themed($propsCard)}>
            {[
              { name: "heading", type: "string", desc: "Main heading text" },
              { name: "content", type: "string", desc: "Description text" },
              { name: "imageSource", type: "ImageSource", desc: "Custom image" },
              { name: "button", type: "string", desc: "Action button text" },
              { name: "buttonOnPress", type: "function", desc: "Button press handler" },
              { name: "preset", type: '"generic"', desc: "Preset style" },
            ].map((prop) => (
              <View key={prop.name} style={themed($propRow)}>
                <Text style={themed($propName)}>{prop.name}</Text>
                <Text style={themed($propType)}>{prop.type}</Text>
                <Text style={themed($propDesc)}>{prop.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay Demo */}
      <LoadingOverlay visible={showLoading} message="Loading..." />
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

const $infoCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  backgroundColor: colors.palette.secondary500 + "15",
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.sm,
  marginBottom: spacing.md,
});

const $infoText: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  fontSize: 13,
  color: colors.text,
  lineHeight: 20,
});

const $previewCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  marginBottom: spacing.sm,
});

const $previewLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginBottom: spacing.sm,
});

const $demoButton: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "center",
});

const $demoHint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  textAlign: "center",
  marginTop: spacing.sm,
});

const $emptyStatePreview: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderRadius: 8,
  minHeight: 200,
  justifyContent: "center",
});

const $emptyStateDemo: ThemedStyle<ViewStyle> = () => ({});

const $patternCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.md,
});

const $patternRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.sm,
});

const $patternIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 36,
  height: 36,
  borderRadius: 8,
  backgroundColor: colors.palette.primary500 + "15",
  justifyContent: "center",
  alignItems: "center",
});

const $patternContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $patternTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $patternDesc: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 13,
  color: colors.textDim,
  marginTop: spacing.xxs,
});

const $practicesCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
});

const $practiceRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $practiceTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $practiceDesc: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 13,
  color: colors.textDim,
  marginTop: spacing.xxs,
});

const $propsCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
});

const $propRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $propName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.tint,
  fontFamily: "monospace",
});

const $propType: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontFamily: "monospace",
  marginTop: spacing.xxs,
});

const $propDesc: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 13,
  color: colors.text,
  marginTop: spacing.xxs,
});

export default FeedbackShowcaseScreen;
