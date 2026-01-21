/**
 * I18n Showcase Screen
 * 다국어 지원 시스템 데모 화면
 */

import { FC, useCallback, useState } from "react";
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native";
import i18n from "i18next";

import { CodeBlock } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { translate } from "@/i18n/translate";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Constants
// ==========================================

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
];

// ==========================================
// Code Examples
// ==========================================

const TRANSLATE_CODE = `import { translate } from "@/i18n/translate";

// Simple translation
const title = translate("common:ok");

// With interpolation
const greeting = translate("homeScreen:hero.welcome", {
  name: "John"
});`;

const TX_PROP_CODE = `import { Text } from "@/components/Text";

// Using tx prop for translations
<Text tx="common:ok" />

// With txOptions for interpolation
<Text
  tx="homeScreen:hero.welcome"
  txOptions={{ name: "John" }}
/>`;

const CHANGE_LANGUAGE_CODE = `import i18n from "i18next";

// Change language programmatically
i18n.changeLanguage("ko");

// Get current language
const currentLang = i18n.language;`;

// ==========================================
// Component
// ==========================================

export const I18nShowcaseScreen: FC = function I18nShowcaseScreen() {
  const { themed, theme } = useAppTheme();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const handleLanguageChange = useCallback((langCode: string) => {
    i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
  }, []);

  const renderLanguageButton = useCallback(
    (lang: (typeof SUPPORTED_LANGUAGES)[0]) => {
      const isSelected = currentLang.startsWith(lang.code);
      return (
        <Pressable
          key={lang.code}
          style={({ pressed }) => [
            themed($languageButton),
            isSelected && themed($languageButtonSelected),
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => handleLanguageChange(lang.code)}
        >
          <Text style={themed($flag)}>{lang.flag}</Text>
          <View style={themed($languageInfo)}>
            <Text
              style={[
                themed($languageName),
                isSelected && themed($languageNameSelected),
              ]}
            >
              {lang.nativeName}
            </Text>
            <Text style={themed($languageCode)}>{lang.code.toUpperCase()}</Text>
          </View>
          {isSelected && (
            <Icon icon="check" size={20} color={theme.colors.tint} />
          )}
        </Pressable>
      );
    },
    [themed, theme.colors.tint, currentLang, handleLanguageChange],
  );

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Internationalization</Text>
          <Text preset="default" style={themed($subtitle)}>
            8 languages supported with RTL support
          </Text>
        </View>

        {/* Current Language */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Current Language
          </Text>
          <View style={themed($currentLangCard)}>
            <Text style={themed($currentLangFlag)}>
              {SUPPORTED_LANGUAGES.find((l) => currentLang.startsWith(l.code))?.flag || "🌐"}
            </Text>
            <Text style={themed($currentLangName)}>
              {SUPPORTED_LANGUAGES.find((l) => currentLang.startsWith(l.code))?.nativeName || currentLang}
            </Text>
          </View>
        </View>

        {/* Language Selector */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Select Language
          </Text>
          <View style={themed($languageGrid)}>
            {SUPPORTED_LANGUAGES.map(renderLanguageButton)}
          </View>
        </View>

        {/* Live Translation Preview */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Live Translation Preview
          </Text>
          <View style={themed($previewCard)}>
            <View style={themed($previewRow)}>
              <Text style={themed($previewLabel)}>common:ok</Text>
              <Text style={themed($previewValue)}>{translate("common:ok")}</Text>
            </View>
            <View style={themed($previewRow)}>
              <Text style={themed($previewLabel)}>common:cancel</Text>
              <Text style={themed($previewValue)}>{translate("common:cancel")}</Text>
            </View>
            <View style={themed($previewRow)}>
              <Text style={themed($previewLabel)}>common:back</Text>
              <Text style={themed($previewValue)}>{translate("common:back")}</Text>
            </View>
            <View style={themed($previewRow)}>
              <Text style={themed($previewLabel)}>mainNavigator:homeTab</Text>
              <Text style={themed($previewValue)}>{translate("mainNavigator:homeTab")}</Text>
            </View>
            <View style={themed($previewRow)}>
              <Text style={themed($previewLabel)}>mainNavigator:settingsTab</Text>
              <Text style={themed($previewValue)}>{translate("mainNavigator:settingsTab")}</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Features
          </Text>
          <View style={themed($featuresGrid)}>
            <View style={themed($featureItem)}>
              <Icon icon="check" size={20} color={theme.colors.palette.secondary500} />
              <Text style={themed($featureText)}>8 Languages</Text>
            </View>
            <View style={themed($featureItem)}>
              <Icon icon="check" size={20} color={theme.colors.palette.secondary500} />
              <Text style={themed($featureText)}>RTL Support</Text>
            </View>
            <View style={themed($featureItem)}>
              <Icon icon="check" size={20} color={theme.colors.palette.secondary500} />
              <Text style={themed($featureText)}>Type-Safe Keys</Text>
            </View>
            <View style={themed($featureItem)}>
              <Icon icon="check" size={20} color={theme.colors.palette.secondary500} />
              <Text style={themed($featureText)}>Interpolation</Text>
            </View>
            <View style={themed($featureItem)}>
              <Icon icon="check" size={20} color={theme.colors.palette.secondary500} />
              <Text style={themed($featureText)}>Date Formatting</Text>
            </View>
            <View style={themed($featureItem)}>
              <Icon icon="check" size={20} color={theme.colors.palette.secondary500} />
              <Text style={themed($featureText)}>Pluralization</Text>
            </View>
          </View>
        </View>

        {/* Code Examples */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Usage Examples
          </Text>
          <CodeBlock
            title="Using translate() function"
            code={TRANSLATE_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Using tx prop in Text component"
            code={TX_PROP_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Changing language"
            code={CHANGE_LANGUAGE_CODE}
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

const $currentLangCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  padding: spacing.md,
  borderRadius: 12,
  gap: spacing.md,
});

const $currentLangFlag: ThemedStyle<TextStyle> = () => ({
  fontSize: 40,
});

const $currentLangName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  fontWeight: "700",
  color: colors.text,
});

const $languageGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
});

const $languageButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  padding: spacing.md,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: "transparent",
});

const $languageButtonSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.tint,
  backgroundColor: colors.tint + "10",
});

const $flag: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 28,
  marginRight: spacing.sm,
});

const $languageInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $languageName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
});

const $languageNameSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
});

const $languageCode: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
});

const $previewCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
});

const $previewRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $previewLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontFamily: "monospace",
});

const $previewValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $featuresGrid: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.sm,
});

const $featureItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  width: "45%",
  gap: spacing.xs,
});

const $featureText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.text,
});

export default I18nShowcaseScreen;
