/**
 * Text Showcase Screen
 * Text 컴포넌트의 다양한 프리셋과 사용법 데모
 */

import { FC } from "react";
import { ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { CodeBlock } from "@/components/CodeBlock";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Code Examples
// ==========================================

const BASIC_USAGE_CODE = `import { Text } from "@/components/Text";

// Basic text
<Text text="Hello World" />

// With translation key
<Text tx="common:ok" />

// With children
<Text>Hello World</Text>`;

const PRESETS_CODE = `// Default
<Text preset="default">Default text style</Text>

// Bold
<Text preset="bold">Bold text style</Text>

// Heading
<Text preset="heading">Heading</Text>

// Subheading
<Text preset="subheading">Subheading</Text>

// Form Label
<Text preset="formLabel">Form Label</Text>

// Form Helper
<Text preset="formHelper">Helper text</Text>`;

const STYLING_CODE = `// Custom size
<Text size="xl" text="Extra Large" />
<Text size="lg" text="Large" />
<Text size="md" text="Medium" />
<Text size="sm" text="Small" />
<Text size="xs" text="Extra Small" />

// Custom weight
<Text weight="bold" text="Bold Weight" />
<Text weight="semiBold" text="SemiBold Weight" />
<Text weight="medium" text="Medium Weight" />
<Text weight="normal" text="Normal Weight" />
<Text weight="light" text="Light Weight" />`;

const TRANSLATION_CODE = `// Simple translation
<Text tx="common:ok" />

// With interpolation
<Text
  tx="homeScreen:hero.welcome"
  txOptions={{ name: "John" }}
/>`;

// ==========================================
// Component
// ==========================================

export const TextShowcaseScreen: FC = function TextShowcaseScreen() {
  const { themed } = useAppTheme();

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Text</Text>
          <Text preset="default" style={themed($subtitle)}>
            Typography component with presets and i18n support
          </Text>
        </View>

        {/* Presets Section */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Presets
          </Text>
          <View style={themed($previewCard)}>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>default</Text>
              <Text preset="default">Default text style</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>bold</Text>
              <Text preset="bold">Bold text style</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>heading</Text>
              <Text preset="heading">Heading</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>subheading</Text>
              <Text preset="subheading">Subheading</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>formLabel</Text>
              <Text preset="formLabel">Form Label</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>formHelper</Text>
              <Text preset="formHelper">Helper text</Text>
            </View>
          </View>
          <CodeBlock title="Presets Usage" code={PRESETS_CODE} language="tsx" />
        </View>

        {/* Sizes Section */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Sizes
          </Text>
          <View style={themed($previewCard)}>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>xxl</Text>
              <Text size="xxl">Extra Extra Large</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>xl</Text>
              <Text size="xl">Extra Large</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>lg</Text>
              <Text size="lg">Large</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>md</Text>
              <Text size="md">Medium</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>sm</Text>
              <Text size="sm">Small</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>xs</Text>
              <Text size="xs">Extra Small</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>xxs</Text>
              <Text size="xxs">Extra Extra Small</Text>
            </View>
          </View>
        </View>

        {/* Weights Section */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Weights
          </Text>
          <View style={themed($previewCard)}>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>bold</Text>
              <Text weight="bold">Bold Weight</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>semiBold</Text>
              <Text weight="semiBold">SemiBold Weight</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>medium</Text>
              <Text weight="medium">Medium Weight</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>normal</Text>
              <Text weight="normal">Normal Weight</Text>
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>light</Text>
              <Text weight="light">Light Weight</Text>
            </View>
          </View>
          <CodeBlock title="Styling Options" code={STYLING_CODE} language="tsx" />
        </View>

        {/* i18n Section */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Internationalization
          </Text>
          <View style={themed($previewCard)}>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>tx prop</Text>
              <Text tx="common:ok" />
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>tx prop</Text>
              <Text tx="common:cancel" />
            </View>
            <View style={themed($textRow)}>
              <Text style={themed($label)}>tx prop</Text>
              <Text tx="common:back" />
            </View>
          </View>
          <CodeBlock title="Translation Usage" code={TRANSLATION_CODE} language="tsx" />
        </View>

        {/* Basic Usage */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Basic Usage
          </Text>
          <CodeBlock title="Basic Usage" code={BASIC_USAGE_CODE} language="tsx" />
        </View>

        {/* Props Table */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Props
          </Text>
          <View style={themed($propsCard)}>
            {[
              { name: "preset", type: '"default" | "bold" | "heading" | ...', desc: "Text style preset" },
              { name: "text", type: "string", desc: "Text content" },
              { name: "tx", type: "TxKeyPath", desc: "i18n translation key" },
              { name: "txOptions", type: "object", desc: "Translation options" },
              { name: "size", type: '"xxs" | "xs" | "sm" | "md" | ...', desc: "Font size" },
              { name: "weight", type: '"light" | "normal" | "medium" | ...', desc: "Font weight" },
              { name: "style", type: "TextStyle", desc: "Custom style override" },
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

const $previewCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
});

const $textRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $label: ThemedStyle<TextStyle> = ({ colors }) => ({
  width: 90,
  fontSize: 11,
  fontFamily: "monospace",
  color: colors.textDim,
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

export default TextShowcaseScreen;
