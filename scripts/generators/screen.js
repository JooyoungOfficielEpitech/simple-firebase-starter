#!/usr/bin/env node
/**
 * Screen Generator
 * 새로운 스크린 파일을 생성하는 스크립트
 *
 * 사용법: node scripts/generators/screen.js ScreenName [--list|--form|--detail]
 */

const fs = require("fs");
const path = require("path");

const SCREENS_DIR = path.resolve(__dirname, "../../app/screens");

// 기본 스크린 템플릿
const getBaseScreenTemplate = (name) => {
  const screenName = name.endsWith("Screen") ? name : `${name}Screen`;

  return `/**
 * ${screenName}
 * ${screenName} 화면
 */

import { FC } from "react";
import { View, ViewStyle } from "react-native";

import { Screen, Text, Header, Button } from "@/components";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

interface ${screenName}Props {
  // navigation props will be added here
}

export const ${screenName}: FC<${screenName}Props> = () => {
  const { themed } = useAppTheme();

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <Header title="${name.replace("Screen", "")}" leftIcon="back" />
      <View style={themed($container)}>
        <Text preset="heading">${name.replace("Screen", "")}</Text>
        {/* Add your content here */}
      </View>
    </Screen>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  padding: spacing.md,
});
`;
};

// 리스트 스크린 템플릿
const getListScreenTemplate = (name) => {
  const screenName = name.endsWith("Screen") ? name : `${name}Screen`;
  const itemName = name.replace("Screen", "").replace("List", "");

  return `/**
 * ${screenName}
 * ${itemName} 목록 화면
 */

import { FC, useState, useCallback } from "react";
import { View, ViewStyle, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { Screen, Text, Header, ListItem, EmptyState, Skeleton } from "@/components";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

interface ${itemName}Item {
  id: string;
  title: string;
  subtitle?: string;
}

interface ${screenName}Props {
  // navigation props will be added here
}

export const ${screenName}: FC<${screenName}Props> = () => {
  const { themed, theme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<${itemName}Item[]>([]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch data
    setRefreshing(false);
  }, []);

  const handleItemPress = useCallback((item: ${itemName}Item) => {
    // TODO: Navigate to detail
    console.log("Item pressed:", item);
  }, []);

  const renderItem = ({ item }: { item: ${itemName}Item }) => (
    <ListItem
      text={item.title}
      textStyle={themed($itemText)}
      bottomSeparator
      onPress={() => handleItemPress(item)}
      RightComponent={
        <Text style={themed($itemSubtitle)}>{item.subtitle}</Text>
      }
    />
  );

  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <Header title="${itemName} List" leftIcon="back" />
        <View style={themed($container)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="text" height={60} style={{ marginBottom: 8 }} />
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]}>
      <Header title="${itemName} List" leftIcon="back" />
      <View style={themed($container)}>
        {items.length === 0 ? (
          <EmptyState
            preset="generic"
            heading="No ${itemName}s Found"
            content="There are no items to display."
            button="Refresh"
            buttonOnPress={handleRefresh}
          />
        ) : (
          <FlashList
            data={items}
            renderItem={renderItem}
            estimatedItemSize={60}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.tint}
              />
            }
          />
        )}
      </View>
    </Screen>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $itemText: ThemedStyle<ViewStyle> = ({ typography }) => ({
  fontFamily: typography.primary.medium,
});

const $itemSubtitle: ThemedStyle<ViewStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
});
`;
};

// 폼 스크린 템플릿
const getFormScreenTemplate = (name) => {
  const screenName = name.endsWith("Screen") ? name : `${name}Screen`;

  return `/**
 * ${screenName}
 * ${name.replace("Screen", "")} 폼 화면
 */

import { FC, useState } from "react";
import { View, ViewStyle, Alert } from "react-native";

import {
  Screen,
  Text,
  Header,
  Button,
  TextField,
  LoadingOverlay,
} from "@/components";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

interface ${screenName}Props {
  // navigation props will be added here
}

export const ${screenName}: FC<${screenName}Props> = () => {
  const { themed } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    field1: "",
    field2: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.field1.trim()) {
      newErrors.field1 = "This field is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Submit form data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert("Success", "Form submitted successfully!");
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <LoadingOverlay visible={loading} />
      <Header title="${name.replace("Screen", "")}" leftIcon="back" />
      <View style={themed($container)}>
        <View style={themed($formSection)}>
          <TextField
            label="Field 1"
            placeholder="Enter value"
            value={formData.field1}
            onChangeText={(text) => updateField("field1", text)}
            helper={errors.field1}
            status={errors.field1 ? "error" : undefined}
          />

          <TextField
            label="Field 2"
            placeholder="Enter value"
            value={formData.field2}
            onChangeText={(text) => updateField("field2", text)}
            helper={errors.field2}
            status={errors.field2 ? "error" : undefined}
          />
        </View>

        <Button
          text="Submit"
          onPress={handleSubmit}
          disabled={loading}
          style={themed($submitButton)}
        />
      </View>
    </Screen>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  padding: spacing.md,
});

const $formSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  marginBottom: spacing.lg,
});

const $submitButton: ThemedStyle<ViewStyle> = () => ({
  marginTop: "auto",
});
`;
};

// 상세 스크린 템플릿
const getDetailScreenTemplate = (name) => {
  const screenName = name.endsWith("Screen") ? name : `${name}Screen`;
  const itemName = name.replace("Screen", "").replace("Detail", "");

  return `/**
 * ${screenName}
 * ${itemName} 상세 화면
 */

import { FC, useState, useEffect } from "react";
import { View, ViewStyle, ScrollView } from "react-native";

import {
  Screen,
  Text,
  Header,
  Button,
  Card,
  Skeleton,
  SkeletonGroup,
} from "@/components";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

interface ${itemName}Data {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  // Add more fields as needed
}

interface ${screenName}Props {
  // navigation props will be added here
  // ${itemName.toLowerCase()}Id: string;
}

export const ${screenName}: FC<${screenName}Props> = () => {
  const { themed } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<${itemName}Data | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Fetch data from API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setData({
        id: "1",
        title: "Sample ${itemName}",
        description: "This is a sample description.",
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen preset="scroll" safeAreaEdges={["top"]}>
        <Header title="${itemName} Detail" leftIcon="back" />
        <View style={themed($container)}>
          <SkeletonGroup count={3} gap={16} skeletonProps={{ height: 20 }} />
          <Skeleton variant="rectangular" height={200} borderRadius={8} style={{ marginTop: 16 }} />
        </View>
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen preset="scroll" safeAreaEdges={["top"]}>
        <Header title="${itemName} Detail" leftIcon="back" />
        <View style={themed($container)}>
          <Text preset="subheading">Not found</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <Header title="${itemName} Detail" leftIcon="back" />
      <View style={themed($container)}>
        <Card
          heading={data.title}
          content={data.description}
          footer={\`Created: \${data.createdAt.toLocaleDateString()}\`}
          style={themed($card)}
        />

        <View style={themed($actionButtons)}>
          <Button text="Edit" preset="default" onPress={() => {}} />
          <Button text="Delete" preset="filled" onPress={() => {}} />
        </View>
      </View>
    </Screen>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  padding: spacing.md,
});

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
});

const $actionButtons: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
});
`;
};

// 메인 실행
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("사용법: node scripts/generators/screen.js ScreenName [options]");
    console.log("옵션:");
    console.log("  --list      리스트 스크린 템플릿");
    console.log("  --form      폼 스크린 템플릿");
    console.log("  --detail    상세 스크린 템플릿");
    process.exit(1);
  }

  const screenName = args[0];
  const isListScreen = args.includes("--list");
  const isFormScreen = args.includes("--form");
  const isDetailScreen = args.includes("--detail");

  // 유효성 검사
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(screenName)) {
    console.error("오류: 스크린 이름은 PascalCase여야 합니다 (예: MyScreen)");
    process.exit(1);
  }

  const finalName = screenName.endsWith("Screen") ? screenName : `${screenName}Screen`;
  const filePath = path.join(SCREENS_DIR, `${finalName}.tsx`);

  // 이미 존재하는지 확인
  if (fs.existsSync(filePath)) {
    console.error(`오류: ${filePath} 파일이 이미 존재합니다`);
    process.exit(1);
  }

  // 템플릿 선택
  let content;
  if (isListScreen) {
    content = getListScreenTemplate(screenName);
  } else if (isFormScreen) {
    content = getFormScreenTemplate(screenName);
  } else if (isDetailScreen) {
    content = getDetailScreenTemplate(screenName);
  } else {
    content = getBaseScreenTemplate(screenName);
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✅ 스크린이 생성되었습니다: ${filePath}`);

  // Navigator 업데이트 안내
  console.log(`\n📝 Navigator에 스크린을 추가하세요:`);
  console.log(`1. app/navigators/AppNavigator.tsx에 ParamList 타입 추가`);
  console.log(`2. <Stack.Screen name="${finalName.replace("Screen", "")}" component={${finalName}} />`);
}

main();
