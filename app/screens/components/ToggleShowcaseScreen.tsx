/**
 * Toggle Showcase Screen
 * Switch, Checkbox, Radio 컴포넌트 데모
 */

import { FC, useState } from "react";
import { ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { CodeBlock } from "@/components/CodeBlock";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Checkbox } from "@/components/Toggle/Checkbox";
import { Radio } from "@/components/Toggle/Radio";
import { Switch } from "@/components/Toggle/Switch";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Code Examples
// ==========================================

const SWITCH_CODE = `import { Switch } from "@/components/Toggle/Switch";

const [isEnabled, setIsEnabled] = useState(false);

<Switch
  value={isEnabled}
  onValueChange={setIsEnabled}
  label="Enable notifications"
/>

// With helper text
<Switch
  value={isEnabled}
  onValueChange={setIsEnabled}
  label="Dark Mode"
  helper="Switch between light and dark themes"
/>`;

const CHECKBOX_CODE = `import { Checkbox } from "@/components/Toggle/Checkbox";

const [isChecked, setIsChecked] = useState(false);

<Checkbox
  value={isChecked}
  onValueChange={setIsChecked}
  label="I agree to terms"
/>

// Multiple checkboxes
<Checkbox value={option1} label="Option 1" />
<Checkbox value={option2} label="Option 2" />
<Checkbox value={option3} label="Option 3" />`;

const RADIO_CODE = `import { Radio } from "@/components/Toggle/Radio";

const [selected, setSelected] = useState("option1");

<Radio
  value={selected === "option1"}
  onValueChange={() => setSelected("option1")}
  label="Option 1"
/>
<Radio
  value={selected === "option2"}
  onValueChange={() => setSelected("option2")}
  label="Option 2"
/>`;

// ==========================================
// Component
// ==========================================

export const ToggleShowcaseScreen: FC = function ToggleShowcaseScreen() {
  const { themed } = useAppTheme();

  // Switch states
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(true);
  const [switch3, setSwitch3] = useState(false);

  // Checkbox states
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(true);
  const [check3, setCheck3] = useState(false);

  // Radio state
  const [radioValue, setRadioValue] = useState("option1");

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Toggle</Text>
          <Text preset="default" style={themed($subtitle)}>
            Switch, Checkbox, and Radio button components
          </Text>
        </View>

        {/* Switch Section */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Switch
          </Text>
          <View style={themed($previewCard)}>
            <Switch
              value={switch1}
              onValueChange={setSwitch1}
              label="Notifications"
              containerStyle={themed($toggleRow)}
            />
            <Switch
              value={switch2}
              onValueChange={setSwitch2}
              label="Dark Mode"
              helper="Switch between light and dark themes"
              containerStyle={themed($toggleRow)}
            />
            <Switch
              value={switch3}
              onValueChange={setSwitch3}
              label="Auto-sync"
              helper="Automatically sync data when online"
              containerStyle={themed($toggleRow)}
            />
            <Switch
              value={false}
              label="Disabled Switch"
              editable={false}
              containerStyle={themed($toggleRow)}
            />
          </View>
          <CodeBlock title="Switch Usage" code={SWITCH_CODE} language="tsx" />
        </View>

        {/* Checkbox Section */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Checkbox
          </Text>
          <View style={themed($previewCard)}>
            <Checkbox
              value={check1}
              onValueChange={setCheck1}
              label="Receive email updates"
              containerStyle={themed($toggleRow)}
            />
            <Checkbox
              value={check2}
              onValueChange={setCheck2}
              label="Enable push notifications"
              containerStyle={themed($toggleRow)}
            />
            <Checkbox
              value={check3}
              onValueChange={setCheck3}
              label="Share usage data"
              helper="Help us improve by sharing anonymous data"
              containerStyle={themed($toggleRow)}
            />
            <Checkbox
              value={true}
              label="Disabled Checkbox"
              editable={false}
              containerStyle={themed($toggleRow)}
            />
          </View>
          <CodeBlock title="Checkbox Usage" code={CHECKBOX_CODE} language="tsx" />
        </View>

        {/* Radio Section */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Radio
          </Text>
          <View style={themed($previewCard)}>
            <Text preset="formLabel" style={themed($radioGroupLabel)}>
              Select your plan:
            </Text>
            <Radio
              value={radioValue === "free"}
              onValueChange={() => setRadioValue("free")}
              label="Free Plan"
              helper="Basic features, limited storage"
              containerStyle={themed($toggleRow)}
            />
            <Radio
              value={radioValue === "pro"}
              onValueChange={() => setRadioValue("pro")}
              label="Pro Plan"
              helper="All features, 100GB storage"
              containerStyle={themed($toggleRow)}
            />
            <Radio
              value={radioValue === "enterprise"}
              onValueChange={() => setRadioValue("enterprise")}
              label="Enterprise Plan"
              helper="Unlimited features and storage"
              containerStyle={themed($toggleRow)}
            />
          </View>
          <CodeBlock title="Radio Usage" code={RADIO_CODE} language="tsx" />
        </View>

        {/* Use Cases */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Common Use Cases
          </Text>
          <View style={themed($useCasesCard)}>
            <View style={themed($useCase)}>
              <Text style={themed($useCaseTitle)}>Switch</Text>
              <Text style={themed($useCaseDesc)}>
                On/off settings, feature toggles, mode switches
              </Text>
            </View>
            <View style={themed($useCase)}>
              <Text style={themed($useCaseTitle)}>Checkbox</Text>
              <Text style={themed($useCaseDesc)}>
                Multiple selections, agreements, filters
              </Text>
            </View>
            <View style={themed($useCase)}>
              <Text style={themed($useCaseTitle)}>Radio</Text>
              <Text style={themed($useCaseDesc)}>
                Single selection from multiple options
              </Text>
            </View>
          </View>
        </View>

        {/* Props Table */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Common Props
          </Text>
          <View style={themed($propsCard)}>
            {[
              { name: "value", type: "boolean", desc: "Current toggle state" },
              { name: "onValueChange", type: "(value: boolean) => void", desc: "Change handler" },
              { name: "label", type: "string", desc: "Label text" },
              { name: "labelTx", type: "TxKeyPath", desc: "i18n label key" },
              { name: "helper", type: "string", desc: "Helper text" },
              { name: "editable", type: "boolean", desc: "Enable/disable input" },
              { name: "containerStyle", type: "ViewStyle", desc: "Container style" },
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

const $toggleRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $radioGroupLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.sm,
});

const $useCasesCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.md,
});

const $useCase: ThemedStyle<ViewStyle> = () => ({});

const $useCaseTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.tint,
});

const $useCaseDesc: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
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

export default ToggleShowcaseScreen;
