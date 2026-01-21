/**
 * Layout Showcase Screen
 * Screen, Header, Divider, Spacer 등 레이아웃 컴포넌트 데모
 */

import { FC } from "react";
import { ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { CodeBlock } from "@/components/CodeBlock";
import { Divider } from "@/components/Divider";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Spacer } from "@/components/Spacer";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Code Examples
// ==========================================

const SCREEN_CODE = `import { Screen } from "@/components/Screen";

// Scroll preset (scrollable content)
<Screen preset="scroll" safeAreaEdges={["top"]}>
  <YourContent />
</Screen>

// Fixed preset (static content)
<Screen preset="fixed" safeAreaEdges={["top", "bottom"]}>
  <YourContent />
</Screen>

// Auto preset (smart scrolling)
<Screen preset="auto">
  <YourContent />
</Screen>`;

const HEADER_CODE = `import { Header } from "@/components/Header";

// Basic header
<Header title="Settings" />

// With back button
<Header
  title="Profile"
  leftIcon="back"
  onLeftPress={() => navigation.goBack()}
/>

// With right action
<Header
  title="Chat"
  rightIcon="settings"
  onRightPress={openSettings}
/>

// With translation
<Header titleTx="settings:title" />`;

const DIVIDER_CODE = `import { Divider } from "@/components/Divider";

// Horizontal divider (default)
<Divider />

// With custom margin spacing
<Divider spacing={16} />

// Vertical divider
<Divider orientation="vertical" />

// With custom color and variant
<Divider color={colors.tint} variant="dashed" />`;

const SPACER_CODE = `import { Spacer } from "@/components/Spacer";

// Vertical spacer (default)
<Spacer size="md" />

// Horizontal spacer (width only)
<Spacer size="lg" height={0} />

// Flexible spacer (fills available space)
<Spacer flex={1} />`;

// ==========================================
// Component
// ==========================================

export const LayoutShowcaseScreen: FC = function LayoutShowcaseScreen() {
  const { themed, theme } = useAppTheme();

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Layout</Text>
          <Text preset="default" style={themed($subtitle)}>
            Screen, Header, Divider, and Spacer components
          </Text>
        </View>

        {/* Screen Component */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Screen
          </Text>
          <View style={themed($infoCard)}>
            <Icon icon="check" size={20} color={theme.colors.palette.secondary500} />
            <Text style={themed($infoText)}>
              The Screen component provides safe area handling, keyboard
              avoiding behavior, and scroll presets for consistent layouts.
            </Text>
          </View>
          <View style={themed($previewCard)}>
            <View style={themed($presetRow)}>
              <View style={themed($presetBadge)}>
                <Text style={themed($presetText)}>scroll</Text>
              </View>
              <Text style={themed($presetDesc)}>
                Content is scrollable, keyboard aware
              </Text>
            </View>
            <View style={themed($presetRow)}>
              <View style={themed($presetBadge)}>
                <Text style={themed($presetText)}>fixed</Text>
              </View>
              <Text style={themed($presetDesc)}>
                Static content, no scrolling
              </Text>
            </View>
            <View style={themed($presetRow)}>
              <View style={themed($presetBadge)}>
                <Text style={themed($presetText)}>auto</Text>
              </View>
              <Text style={themed($presetDesc)}>
                Smart scroll based on content
              </Text>
            </View>
          </View>
          <CodeBlock title="Screen Usage" code={SCREEN_CODE} language="tsx" />
        </View>

        {/* Header Component */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Header
          </Text>
          <View style={themed($previewCard)}>
            <View style={themed($headerPreview)}>
              <Icon icon="back" size={24} color={theme.colors.text} />
              <Text style={themed($headerTitle)}>Settings</Text>
              <Icon icon="settings" size={24} color={theme.colors.text} />
            </View>
            <Divider style={themed($previewDivider)} />
            <View style={themed($headerPreview)}>
              <Icon icon="back" size={24} color={theme.colors.text} />
              <Text style={themed($headerTitle)}>Profile</Text>
              <View style={{ width: 24 }} />
            </View>
            <Divider style={themed($previewDivider)} />
            <View style={themed($headerPreview)}>
              <View style={{ width: 24 }} />
              <Text style={themed($headerTitle)}>Welcome</Text>
              <View style={{ width: 24 }} />
            </View>
          </View>
          <CodeBlock title="Header Usage" code={HEADER_CODE} language="tsx" />
        </View>

        {/* Divider Component */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Divider
          </Text>
          <View style={themed($previewCard)}>
            <Text style={themed($dividerLabel)}>Horizontal (default)</Text>
            <Divider />
            <Spacer size="md" />
            <Text style={themed($dividerLabel)}>With larger spacing</Text>
            <Divider spacing={16} />
            <Spacer size="md" />
            <Text style={themed($dividerLabel)}>Vertical (in row)</Text>
            <View style={themed($verticalDividerRow)}>
              <Text style={themed($dividerText)}>Left</Text>
              <Divider orientation="vertical" style={themed($verticalDivider)} />
              <Text style={themed($dividerText)}>Right</Text>
            </View>
          </View>
          <CodeBlock title="Divider Usage" code={DIVIDER_CODE} language="tsx" />
        </View>

        {/* Spacer Component */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Spacer
          </Text>
          <View style={themed($previewCard)}>
            <Text style={themed($spacerLabel)}>Vertical spacers</Text>
            <View style={themed($spacerDemo)}>
              <View style={themed($spacerBox)} />
              <Spacer size="xs" />
              <View style={themed($spacerBox)} />
              <Spacer size="sm" />
              <View style={themed($spacerBox)} />
              <Spacer size="md" />
              <View style={themed($spacerBox)} />
              <Spacer size="lg" />
              <View style={themed($spacerBox)} />
            </View>
            <Spacer size="md" />
            <Text style={themed($spacerLabel)}>Horizontal spacers</Text>
            <View style={themed($horizontalSpacerDemo)}>
              <View style={themed($spacerBox)} />
              <Spacer size="xs" height={0} />
              <View style={themed($spacerBox)} />
              <Spacer size="sm" height={0} />
              <View style={themed($spacerBox)} />
              <Spacer size="md" height={0} />
              <View style={themed($spacerBox)} />
            </View>
          </View>
          <CodeBlock title="Spacer Usage" code={SPACER_CODE} language="tsx" />
        </View>

        {/* Props Table */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Screen Props
          </Text>
          <View style={themed($propsCard)}>
            {[
              { name: "preset", type: '"fixed" | "scroll" | "auto"', desc: "Layout behavior" },
              { name: "safeAreaEdges", type: 'Array<"top"|"bottom"|"left"|"right">', desc: "Safe area edges" },
              { name: "backgroundColor", type: "string", desc: "Background color" },
              { name: "statusBarStyle", type: '"light" | "dark"', desc: "Status bar style" },
              { name: "KeyboardAvoidingViewProps", type: "object", desc: "Keyboard behavior" },
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
});

const $presetRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  gap: spacing.sm,
});

const $presetBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  backgroundColor: colors.tint + "20",
  borderRadius: 6,
});

const $presetText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "600",
  fontFamily: "monospace",
  color: colors.tint,
});

const $presetDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  fontSize: 13,
  color: colors.textDim,
});

const $headerPreview: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.sm,
});

const $headerTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
});

const $previewDivider: ThemedStyle<ViewStyle> = () => ({});

const $dividerLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginBottom: spacing.sm,
});

const $dividerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
});

const $verticalDividerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.md,
  height: 40,
});

const $verticalDivider: ThemedStyle<ViewStyle> = () => ({
  height: 30,
});

const $spacerLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginBottom: spacing.sm,
});

const $spacerDemo: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
});

const $horizontalSpacerDemo: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
});

const $spacerBox: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 30,
  height: 30,
  backgroundColor: colors.tint,
  borderRadius: 4,
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

export default LayoutShowcaseScreen;
