/**
 * Theme Showcase Screen
 * 테마 시스템 데모 화면
 */

import { FC, useCallback } from "react";
import { ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { Button } from "@/components/Button";
import { CodeBlock } from "@/components/CodeBlock";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Code Examples
// ==========================================

const THEME_USAGE_CODE = `import { useAppTheme } from "@/theme/context";

function MyComponent() {
  const { themed, theme } = useAppTheme();

  return (
    <View style={themed($container)}>
      <Text style={{ color: theme.colors.text }}>
        Hello World
      </Text>
    </View>
  );
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  padding: spacing.md,
});`;

const THEME_TOGGLE_CODE = `import { useThemeActions } from "@/theme/context";

function ThemeToggle() {
  const { setThemeScheme, themeContext } = useThemeActions();

  return (
    <Button
      text={themeContext === "dark" ? "Light Mode" : "Dark Mode"}
      onPress={() => setThemeScheme(
        themeContext === "dark" ? "light" : "dark"
      )}
    />
  );
}`;

// ==========================================
// Component
// ==========================================

export const ThemeShowcaseScreen: FC = function ThemeShowcaseScreen() {
  const { themed, theme, themeContext, setThemeContextOverride } = useAppTheme();

  const handleToggleTheme = useCallback(() => {
    setThemeContextOverride(themeContext === "dark" ? "light" : "dark");
  }, [setThemeContextOverride, themeContext]);

  const handleSetLight = useCallback(() => {
    setThemeContextOverride("light");
  }, [setThemeContextOverride]);

  const handleSetDark = useCallback(() => {
    setThemeContextOverride("dark");
  }, [setThemeContextOverride]);

  const handleSetSystem = useCallback(() => {
    setThemeContextOverride(undefined);
  }, [setThemeContextOverride]);

  const renderColorSwatch = useCallback(
    (name: string, color: string) => (
      <View key={name} style={themed($colorSwatch)}>
        <View style={[$colorBox, { backgroundColor: color }]} />
        <Text style={themed($colorName)}>{name}</Text>
        <Text style={themed($colorValue)}>{color}</Text>
      </View>
    ),
    [themed],
  );

  const renderSpacingSwatch = useCallback(
    (name: string, value: number) => (
      <View key={name} style={themed($spacingSwatch)}>
        <View style={themed($spacingLabel)}>
          <Text style={themed($spacingName)}>{name}</Text>
          <Text style={themed($spacingValue)}>{value}px</Text>
        </View>
        <View style={[$spacingBar, { width: value, backgroundColor: theme.colors.tint }]} />
      </View>
    ),
    [themed, theme.colors.tint],
  );

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Theme System</Text>
          <Text preset="default" style={themed($subtitle)}>
            Light/Dark mode with full TypeScript support
          </Text>
        </View>

        {/* Current Theme */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Current Theme
          </Text>
          <View style={themed($currentTheme)}>
            <Text style={themed($currentThemeText)}>
              {themeContext === undefined ? "System" : themeContext === "dark" ? "Dark" : "Light"} Mode
            </Text>
          </View>
        </View>

        {/* Theme Toggle Buttons */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Theme Controls
          </Text>
          <View style={themed($buttonRow)}>
            <Button
              preset={themeContext === "light" ? "filled" : "default"}
              text="Light"
              onPress={handleSetLight}
              style={themed($themeButton)}
            />
            <Button
              preset={themeContext === "dark" ? "filled" : "default"}
              text="Dark"
              onPress={handleSetDark}
              style={themed($themeButton)}
            />
            <Button
              preset={themeContext === undefined ? "filled" : "default"}
              text="System"
              onPress={handleSetSystem}
              style={themed($themeButton)}
            />
          </View>
          <Button
            text="Toggle Theme"
            onPress={handleToggleTheme}
            style={themed($toggleButton)}
          />
        </View>

        {/* Color Palette */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Color Palette
          </Text>
          <View style={themed($colorGrid)}>
            {renderColorSwatch("text", theme.colors.text)}
            {renderColorSwatch("textDim", theme.colors.textDim)}
            {renderColorSwatch("background", theme.colors.background)}
            {renderColorSwatch("tint", theme.colors.tint)}
            {renderColorSwatch("error", theme.colors.error)}
            {renderColorSwatch("separator", theme.colors.separator)}
          </View>
        </View>

        {/* Spacing System */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Spacing System
          </Text>
          <View style={themed($spacingContainer)}>
            {renderSpacingSwatch("xxs", theme.spacing.xxs)}
            {renderSpacingSwatch("xs", theme.spacing.xs)}
            {renderSpacingSwatch("sm", theme.spacing.sm)}
            {renderSpacingSwatch("md", theme.spacing.md)}
            {renderSpacingSwatch("lg", theme.spacing.lg)}
            {renderSpacingSwatch("xl", theme.spacing.xl)}
            {renderSpacingSwatch("xxl", theme.spacing.xxl)}
          </View>
        </View>

        {/* Code Examples */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Usage Examples
          </Text>
          <CodeBlock
            title="Using Theme in Components"
            code={THEME_USAGE_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Theme Toggle"
            code={THEME_TOGGLE_CODE}
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

const $currentTheme: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  padding: spacing.md,
  borderRadius: 12,
  alignItems: "center",
});

const $currentThemeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "700",
});

const $buttonRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  marginBottom: spacing.sm,
});

const $themeButton: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $toggleButton: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
});

const $colorGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
});

const $colorSwatch: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "30%",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  padding: spacing.sm,
  alignItems: "center",
});

const $colorBox: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 8,
  marginBottom: 8,
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.1)",
};

const $colorName: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 11,
  fontWeight: "600",
});

const $colorValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 9,
  marginTop: 2,
});

const $spacingContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
});

const $spacingSwatch: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
});

const $spacingLabel: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.xxs,
});

const $spacingName: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 12,
  fontWeight: "600",
});

const $spacingValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 12,
});

const $spacingBar: ViewStyle = {
  height: 8,
  borderRadius: 4,
};

export default ThemeShowcaseScreen;
