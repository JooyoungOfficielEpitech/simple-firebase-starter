/**
 * Card Showcase Screen
 * Card 컴포넌트의 다양한 스타일과 사용법 데모
 */

import { FC } from "react";
import { ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { Card } from "@/components/Card";
import { CodeBlock } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Code Examples
// ==========================================

const BASIC_USAGE_CODE = `import { Card } from "@/components/Card";

// Basic card with heading and content
<Card
  heading="Card Title"
  content="Card content goes here"
/>

// With translation keys
<Card
  headingTx="feature:title"
  contentTx="feature:description"
/>`;

const PRESETS_CODE = `// Default preset
<Card
  preset="default"
  heading="Default Card"
  content="With default styling"
/>

// Reversed preset (dark)
<Card
  preset="reversed"
  heading="Reversed Card"
  content="With dark styling"
/>`;

const ACCESSORIES_CODE = `// With right accessory
<Card
  heading="Settings"
  content="Manage your preferences"
  RightComponent={
    <Icon icon="caretRight" size={20} />
  }
/>

// With left accessory
<Card
  heading="Profile"
  LeftComponent={
    <Icon icon="user" size={24} />
  }
  content="View your profile"
/>

// With footer
<Card
  heading="Premium"
  content="Unlock all features"
  footer="Tap to upgrade"
/>`;

const VERTICAL_CODE = `// Vertical alignment
<Card
  verticalAlignment="top"
  heading="Top Aligned"
  content="Content here"
/>

<Card
  verticalAlignment="center"
  heading="Center Aligned"
  content="Content here"
/>`;

// ==========================================
// Component
// ==========================================

export const CardShowcaseScreen: FC = function CardShowcaseScreen() {
  const { themed, theme } = useAppTheme();

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Card</Text>
          <Text preset="default" style={themed($subtitle)}>
            A flexible container for grouping related content
          </Text>
        </View>

        {/* Presets Section */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Presets
          </Text>
          <Card
            preset="default"
            heading="Default Card"
            content="This is the default card style with a light background."
            style={themed($cardMargin)}
          />
          <Card
            preset="reversed"
            heading="Reversed Card"
            content="This is the reversed card style with a dark background."
            style={themed($cardMargin)}
          />
          <CodeBlock title="Presets Usage" code={PRESETS_CODE} language="tsx" />
        </View>

        {/* With Accessories */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            With Accessories
          </Text>
          <Card
            heading="Notifications"
            content="Manage your notification preferences"
            RightComponent={
              <Icon icon="caretRight" size={20} color={theme.colors.textDim} />
            }
            style={themed($cardMargin)}
          />
          <Card
            heading="Account"
            content="View and edit your account details"
            LeftComponent={
              <View style={themed($iconContainer)}>
                <Icon icon="user" size={24} color={theme.colors.tint} />
              </View>
            }
            RightComponent={
              <Icon icon="caretRight" size={20} color={theme.colors.textDim} />
            }
            style={themed($cardMargin)}
          />
          <Card
            preset="reversed"
            heading="Premium Features"
            content="Unlock all advanced features with a premium subscription"
            footer="Starting at $9.99/month"
            LeftComponent={
              <View style={themed($iconContainerReversed)}>
                <Icon icon="heart" size={24} color={theme.colors.palette.primary500} />
              </View>
            }
            style={themed($cardMargin)}
          />
          <CodeBlock title="Accessories" code={ACCESSORIES_CODE} language="tsx" />
        </View>

        {/* Vertical Alignment */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Vertical Alignment
          </Text>
          <View style={themed($alignmentGrid)}>
            <Card
              verticalAlignment="top"
              heading="Top"
              content="Aligned to top"
              style={themed($alignmentCard)}
              contentStyle={themed($alignmentContent)}
            />
            <Card
              verticalAlignment="center"
              heading="Center"
              content="Aligned to center"
              style={themed($alignmentCard)}
              contentStyle={themed($alignmentContent)}
            />
          </View>
          <CodeBlock title="Vertical Alignment" code={VERTICAL_CODE} language="tsx" />
        </View>

        {/* Interactive Cards */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Interactive Cards
          </Text>
          <Card
            heading="Tap me!"
            content="Cards can respond to press events"
            onPress={() => console.log("Card pressed")}
            RightComponent={
              <Icon icon="caretRight" size={20} color={theme.colors.textDim} />
            }
            style={themed($cardMargin)}
          />
          <Card
            heading="Long press me!"
            content="Cards can also respond to long press events"
            onLongPress={() => console.log("Card long pressed")}
            style={themed($cardMargin)}
          />
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
              { name: "preset", type: '"default" | "reversed"', desc: "Card style preset" },
              { name: "heading", type: "string", desc: "Card heading text" },
              { name: "content", type: "string", desc: "Card content text" },
              { name: "footer", type: "string", desc: "Card footer text" },
              { name: "LeftComponent", type: "ReactElement", desc: "Left side component" },
              { name: "RightComponent", type: "ReactElement", desc: "Right side component" },
              { name: "verticalAlignment", type: '"top" | "center" | "bottom"', desc: "Content alignment" },
              { name: "onPress", type: "function", desc: "Press handler" },
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

const $cardMargin: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
});

const $iconContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 44,
  height: 44,
  borderRadius: 10,
  backgroundColor: colors.palette.neutral200,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.sm,
});

const $iconContainerReversed: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 44,
  height: 44,
  borderRadius: 10,
  backgroundColor: colors.palette.neutral700,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.sm,
});

const $alignmentGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
});

const $alignmentCard: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minHeight: 120,
});

const $alignmentContent: ThemedStyle<ViewStyle> = () => ({});

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

export default CardShowcaseScreen;
