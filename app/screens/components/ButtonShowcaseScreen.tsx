/**
 * Button Showcase Screen
 * Button 컴포넌트의 다양한 스타일과 사용법 데모
 */

import { FC, useCallback, useState } from "react";
import { ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { Button } from "@/components/Button";
import { CodeBlock } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Code Examples
// ==========================================

const BASIC_USAGE_CODE = `import { Button } from "@/components/Button";

// Basic button
<Button text="Click Me" onPress={handlePress} />

// With translation key
<Button tx="common:ok" onPress={handlePress} />`;

const PRESETS_CODE = `// Default (outlined)
<Button preset="default" text="Default" />

// Filled
<Button preset="filled" text="Filled" />

// Reversed (dark)
<Button preset="reversed" text="Reversed" />

// CTA (primary color)
<Button preset="cta" text="Call to Action" />`;

const STATES_CODE = `// Disabled state
<Button text="Disabled" disabled />

// Loading state
<Button text="Submit" isLoading />`;

const ACCESSORIES_CODE = `// Left accessory
<Button
  text="Settings"
  LeftAccessory={(props) => (
    <Icon icon="settings" size={20} {...props} />
  )}
/>

// Right accessory
<Button
  text="Next"
  RightAccessory={(props) => (
    <Icon icon="caretRight" size={20} {...props} />
  )}
/>`;

// ==========================================
// Component
// ==========================================

export const ButtonShowcaseScreen: FC = function ButtonShowcaseScreen() {
  const { themed, theme } = useAppTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingPress = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Button</Text>
          <Text preset="default" style={themed($subtitle)}>
            A versatile button component with multiple presets and states
          </Text>
        </View>

        {/* Presets Section */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Presets
          </Text>
          <View style={themed($previewCard)}>
            <View style={themed($buttonRow)}>
              <Button preset="default" text="Default" style={themed($button)} />
              <Button preset="filled" text="Filled" style={themed($button)} />
            </View>
            <View style={themed($buttonRow)}>
              <Button preset="reversed" text="Reversed" style={themed($button)} />
              <Button preset="cta" text="CTA" style={themed($button)} />
            </View>
          </View>
          <CodeBlock title="Presets Usage" code={PRESETS_CODE} language="tsx" />
        </View>

        {/* States Section */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            States
          </Text>
          <View style={themed($previewCard)}>
            <View style={themed($buttonRow)}>
              <Button
                preset="default"
                text="Normal"
                style={themed($button)}
              />
              <Button
                preset="default"
                text="Disabled"
                disabled
                style={themed($button)}
              />
            </View>
            <View style={themed($buttonRow)}>
              <Button
                preset="cta"
                text="Try Loading"
                isLoading={isLoading}
                onPress={handleLoadingPress}
                style={themed($button)}
              />
              <Button
                preset="cta"
                text="Disabled CTA"
                disabled
                style={themed($button)}
              />
            </View>
          </View>
          <CodeBlock title="Button States" code={STATES_CODE} language="tsx" />
        </View>

        {/* With Accessories */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            With Accessories
          </Text>
          <View style={themed($previewCard)}>
            <Button
              preset="default"
              text="Settings"
              LeftAccessory={() => (
                <Icon icon="settings" size={20} color={theme.colors.text} />
              )}
              style={themed($fullButton)}
            />
            <Button
              preset="filled"
              text="Continue"
              RightAccessory={() => (
                <Icon icon="caretRight" size={20} color={theme.colors.text} />
              )}
              style={themed($fullButton)}
            />
            <Button
              preset="cta"
              text="Add to Favorites"
              LeftAccessory={() => (
                <Icon icon="heart" size={20} color={theme.colors.palette.neutral100} />
              )}
              style={themed($fullButton)}
            />
          </View>
          <CodeBlock title="Button Accessories" code={ACCESSORIES_CODE} language="tsx" />
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
              { name: "preset", type: '"default" | "filled" | "reversed" | "cta"', desc: "Button style preset" },
              { name: "text", type: "string", desc: "Button label text" },
              { name: "tx", type: "TxKeyPath", desc: "i18n translation key" },
              { name: "disabled", type: "boolean", desc: "Disable the button" },
              { name: "isLoading", type: "boolean", desc: "Show loading spinner" },
              { name: "LeftAccessory", type: "ComponentType", desc: "Left side component" },
              { name: "RightAccessory", type: "ComponentType", desc: "Right side component" },
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
  gap: spacing.sm,
});

const $buttonRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
});

const $button: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $fullButton: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
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

export default ButtonShowcaseScreen;
