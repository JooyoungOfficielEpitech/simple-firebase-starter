/**
 * CodeBlock Component
 * 코드 예제를 표시하는 컴포넌트
 */

import { FC, useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { Icon } from "@/components/Icon";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Types
// ==========================================

export interface CodeBlockProps {
  /** Code to display */
  code: string;
  /** Programming language for syntax highlighting hint */
  language?: "typescript" | "javascript" | "jsx" | "tsx" | "json" | "bash";
  /** Title for the code block */
  title?: string;
  /** Whether to show copy button */
  showCopy?: boolean;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Maximum height before scrolling */
  maxHeight?: number;
  /** Custom container style */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

export const CodeBlock: FC<CodeBlockProps> = ({
  code,
  language = "typescript",
  title,
  showCopy = true,
  showLineNumbers = true,
  maxHeight = 300,
  style,
}) => {
  const { themed, theme } = useAppTheme();
  const [copied, setCopied] = useState(false);

  const lines = code.trim().split("\n");

  const handleCopy = useCallback(() => {
    // Note: In production, use expo-clipboard for actual copy functionality
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const getLanguageLabel = useCallback((lang: string) => {
    const labels: Record<string, string> = {
      typescript: "TypeScript",
      javascript: "JavaScript",
      jsx: "JSX",
      tsx: "TSX",
      json: "JSON",
      bash: "Bash",
    };
    return labels[lang] || lang;
  }, []);

  return (
    <View style={[themed($container), style]}>
      {/* Header */}
      <View style={themed($header)}>
        <View style={themed($titleContainer)}>
          {title && (
            <Text style={themed($title)}>{title}</Text>
          )}
          <View style={themed($languageBadge)}>
            <Text style={themed($languageText)}>{getLanguageLabel(language)}</Text>
          </View>
        </View>
        {showCopy && (
          <Pressable
            style={({ pressed }) => [
              themed($copyButton),
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleCopy}
          >
            <Icon
              icon={copied ? "check" : "menu"}
              size={16}
              color={copied ? theme.colors.palette.secondary500 : theme.colors.textDim}
            />
            <Text style={themed($copyText)}>
              {copied ? "Copied!" : "Copy"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Code Content */}
      <ScrollView
        style={[themed($codeContainer), { maxHeight }]}
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
      >
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <View style={themed($codeContent)}>
            {showLineNumbers && (
              <View style={themed($lineNumbers)}>
                {lines.map((_, index) => (
                  <Text key={index} style={themed($lineNumber)}>
                    {index + 1}
                  </Text>
                ))}
              </View>
            )}
            <View style={themed($codeLines)}>
              {lines.map((line, index) => (
                <Text key={index} style={themed($codeLine)}>
                  {line || " "}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral800,
  borderRadius: 12,
  overflow: "hidden",
  marginVertical: spacing.sm,
});

const $header: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  backgroundColor: colors.palette.neutral700,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral600,
});

const $titleContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
});

const $title: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 13,
  fontWeight: "600",
});

const $languageBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
  backgroundColor: colors.palette.neutral600,
  borderRadius: 4,
});

const $languageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral300,
  fontSize: 10,
  fontWeight: "500",
});

const $copyButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
});

const $copyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral300,
  fontSize: 12,
});

const $codeContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
});

const $codeContent: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
});

const $lineNumbers: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.md,
  borderRightWidth: 1,
  borderRightColor: "rgba(255,255,255,0.1)",
  paddingRight: spacing.sm,
});

const $lineNumber: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontFamily: "monospace",
  fontSize: 12,
  lineHeight: 20,
  color: colors.palette.neutral500,
  textAlign: "right",
  minWidth: 24,
});

const $codeLines: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $codeLine: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontFamily: "monospace",
  fontSize: 12,
  lineHeight: 20,
  color: colors.palette.neutral100,
});

export default CodeBlock;
