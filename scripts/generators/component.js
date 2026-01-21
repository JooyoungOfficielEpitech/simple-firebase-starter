#!/usr/bin/env node
/**
 * Component Generator
 * 새로운 컴포넌트 파일을 생성하는 스크립트
 *
 * 사용법: node scripts/generators/component.js ComponentName [--variant filled|outlined]
 */

const fs = require("fs");
const path = require("path");

const COMPONENTS_DIR = path.resolve(__dirname, "../../app/components");

// 컴포넌트 템플릿
const getComponentTemplate = (name, options = {}) => {
  const { hasVariant = false, hasSize = false, hasAnimation = false } = options;

  let imports = `import { FC } from "react";
import { View, ViewStyle, TextStyle } from "react-native";
`;

  if (hasAnimation) {
    imports += `import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
`;
  }

  imports += `
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";
`;

  let types = `// ==========================================
// Types
// ==========================================

`;

  if (hasVariant) {
    types += `export type ${name}Variant = "default" | "primary" | "secondary";
`;
  }

  if (hasSize) {
    types += `export type ${name}Size = "sm" | "md" | "lg";
`;
  }

  types += `
export interface ${name}Props {
  /** Main content */
  children?: React.ReactNode;`;

  if (hasVariant) {
    types += `
  /** Visual variant */
  variant?: ${name}Variant;`;
  }

  if (hasSize) {
    types += `
  /** Size variant */
  size?: ${name}Size;`;
  }

  types += `
  /** Disabled state */
  disabled?: boolean;
  /** Container style override */
  style?: ViewStyle;
}
`;

  const component = `
// ==========================================
// Component
// ==========================================

export const ${name}: FC<${name}Props> = ({
  children,${hasVariant ? "\n  variant = \"default\"," : ""}${hasSize ? "\n  size = \"md\"," : ""}
  disabled = false,
  style,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();
${
  hasAnimation
    ? `
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
`
    : ""
}
  return (
    <${hasAnimation ? "Animated." : ""}View
      style={[
        themed($container),
        disabled && { opacity: 0.5 },
        style,${hasAnimation ? "\n        animatedStyle," : ""}
      ]}
    >
      {children}
    </${hasAnimation ? "Animated." : ""}View>
  );
};
`;

  const styles = `
// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  backgroundColor: colors.background,
  borderRadius: 8,
});
`;

  return `/**
 * ${name} Component
 * ${name} 컴포넌트
 */

${imports}${types}${component}${styles}`;
};

// 메인 실행
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("사용법: node scripts/generators/component.js ComponentName [options]");
    console.log("옵션:");
    console.log("  --variant    Variant prop 추가");
    console.log("  --size       Size prop 추가");
    console.log("  --animated   Animation 지원 추가");
    process.exit(1);
  }

  const componentName = args[0];
  const hasVariant = args.includes("--variant");
  const hasSize = args.includes("--size");
  const hasAnimation = args.includes("--animated");

  // 유효성 검사
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
    console.error("오류: 컴포넌트 이름은 PascalCase여야 합니다 (예: MyComponent)");
    process.exit(1);
  }

  const filePath = path.join(COMPONENTS_DIR, `${componentName}.tsx`);

  // 이미 존재하는지 확인
  if (fs.existsSync(filePath)) {
    console.error(`오류: ${filePath} 파일이 이미 존재합니다`);
    process.exit(1);
  }

  // 컴포넌트 생성
  const content = getComponentTemplate(componentName, {
    hasVariant,
    hasSize,
    hasAnimation,
  });

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✅ 컴포넌트가 생성되었습니다: ${filePath}`);

  // index.ts 업데이트 안내
  console.log(`\n📝 app/components/index.ts에 다음을 추가하세요:`);
  console.log(`export * from "./${componentName}";`);
}

main();
