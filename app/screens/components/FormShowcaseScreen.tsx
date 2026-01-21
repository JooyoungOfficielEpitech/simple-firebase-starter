/**
 * Form Showcase Screen
 * TextField, FormTextField 컴포넌트 데모
 */

import { FC, useState } from "react";
import { ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { CodeBlock } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Code Examples
// ==========================================

const TEXTFIELD_CODE = `import { TextField } from "@/components/TextField";

// Basic text field
<TextField
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
/>

// With helper text
<TextField
  label="Password"
  placeholder="Enter password"
  helper="Must be at least 8 characters"
  secureTextEntry
/>

// With error state
<TextField
  label="Username"
  value={username}
  status="error"
  helper="Username already taken"
/>`;

const FORM_TEXTFIELD_CODE = `import { FormTextField } from "@/components/FormTextField";
import { useForm } from "react-hook-form";

const { control } = useForm();

// With react-hook-form integration
<FormTextField
  name="email"
  control={control}
  label="Email"
  placeholder="Enter your email"
  rules={{ required: "Email is required" }}
/>

<FormTextField
  name="password"
  control={control}
  label="Password"
  secureTextEntry
  rules={{
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be 8+ characters"
    }
  }}
/>`;

const ACCESSORIES_CODE = `// With left accessory
<TextField
  label="Search"
  placeholder="Search..."
  LeftAccessory={() => (
    <Icon icon="menu" size={20} />
  )}
/>

// With right accessory
<TextField
  label="Password"
  secureTextEntry={!showPassword}
  RightAccessory={() => (
    <Pressable onPress={togglePassword}>
      <Icon icon={showPassword ? "x" : "check"} />
    </Pressable>
  )}
/>`;

// ==========================================
// Component
// ==========================================

export const FormShowcaseScreen: FC = function FormShowcaseScreen() {
  const { themed, theme } = useAppTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("taken_user");
  const [search, setSearch] = useState("");

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Form</Text>
          <Text preset="default" style={themed($subtitle)}>
            TextField and FormTextField input components
          </Text>
        </View>

        {/* Basic TextField */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            TextField
          </Text>
          <View style={themed($previewCard)}>
            <TextField
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={themed($inputMargin)}
            />
            <TextField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              helper="Must be at least 8 characters"
              containerStyle={themed($inputMargin)}
            />
            <TextField
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              status="error"
              helper="This username is already taken"
              containerStyle={themed($inputMargin)}
            />
          </View>
          <CodeBlock title="TextField Usage" code={TEXTFIELD_CODE} language="tsx" />
        </View>

        {/* With Accessories */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            With Accessories
          </Text>
          <View style={themed($previewCard)}>
            <TextField
              label="Search"
              placeholder="Search for items..."
              value={search}
              onChangeText={setSearch}
              LeftAccessory={() => (
                <Icon
                  icon="menu"
                  size={20}
                  color={theme.colors.textDim}
                  containerStyle={themed($accessoryContainer)}
                />
              )}
              containerStyle={themed($inputMargin)}
            />
            <TextField
              label="Amount"
              placeholder="0.00"
              keyboardType="decimal-pad"
              LeftAccessory={() => (
                <Text style={themed($currencySymbol)}>$</Text>
              )}
              containerStyle={themed($inputMargin)}
            />
            <TextField
              label="Website"
              placeholder="example.com"
              autoCapitalize="none"
              LeftAccessory={() => (
                <Text style={themed($prefixText)}>https://</Text>
              )}
              containerStyle={themed($inputMargin)}
            />
          </View>
          <CodeBlock title="Accessories" code={ACCESSORIES_CODE} language="tsx" />
        </View>

        {/* States */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            States
          </Text>
          <View style={themed($previewCard)}>
            <TextField
              label="Default"
              placeholder="Default state"
              containerStyle={themed($inputMargin)}
            />
            <TextField
              label="Disabled"
              placeholder="Disabled state"
              value="Cannot edit this"
              editable={false}
              containerStyle={themed($inputMargin)}
            />
            <TextField
              label="Error"
              placeholder="Error state"
              value="Invalid input"
              status="error"
              helper="Please enter a valid value"
              containerStyle={themed($inputMargin)}
            />
          </View>
        </View>

        {/* FormTextField */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            FormTextField
          </Text>
          <View style={themed($infoCard)}>
            <Icon icon="check" size={20} color={theme.colors.palette.secondary500} />
            <Text style={themed($infoText)}>
              FormTextField integrates with react-hook-form for form validation
              and state management. It automatically handles error states and
              validation messages.
            </Text>
          </View>
          <CodeBlock title="FormTextField with react-hook-form" code={FORM_TEXTFIELD_CODE} language="tsx" />
        </View>

        {/* Props Table */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            TextField Props
          </Text>
          <View style={themed($propsCard)}>
            {[
              { name: "label", type: "string", desc: "Input label text" },
              { name: "labelTx", type: "TxKeyPath", desc: "i18n label key" },
              { name: "placeholder", type: "string", desc: "Placeholder text" },
              { name: "helper", type: "string", desc: "Helper/error text" },
              { name: "status", type: '"error" | "disabled"', desc: "Input status" },
              { name: "LeftAccessory", type: "ComponentType", desc: "Left component" },
              { name: "RightAccessory", type: "ComponentType", desc: "Right component" },
              { name: "editable", type: "boolean", desc: "Enable/disable input" },
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

const $inputMargin: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
});

const $accessoryContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.sm,
});

const $currencySymbol: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.textDim,
  marginLeft: spacing.sm,
});

const $prefixText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginLeft: spacing.sm,
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

export default FormShowcaseScreen;
