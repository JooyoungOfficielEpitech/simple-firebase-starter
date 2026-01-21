/**
 * Network Showcase Screen
 * 네트워크 상태 모니터링 데모 화면
 */

import { FC, useCallback, useState } from "react";
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { CodeBlock } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Constants
// ==========================================

const CONNECTION_TYPES = [
  { id: "wifi", name: "WiFi", icon: "check", speed: "Fast" },
  { id: "cellular", name: "Cellular", icon: "check", speed: "Variable" },
  { id: "none", name: "Offline", icon: "x", speed: "N/A" },
];

// ==========================================
// Code Examples
// ==========================================

const NETINFO_BASIC_CODE = `import NetInfo from "@react-native-community/netinfo";

// Get current state
const state = await NetInfo.fetch();
console.log("Connected:", state.isConnected);
console.log("Type:", state.type);

// Subscribe to changes
const unsubscribe = NetInfo.addEventListener((state) => {
  console.log("Network changed:", state.type);
  console.log("Is connected:", state.isConnected);
});

// Clean up
unsubscribe();`;

const NETWORK_CONTEXT_CODE = `// NetworkContext.tsx
interface NetworkState {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean;
}

export const NetworkProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<NetworkState>({
    isConnected: true,
    type: "unknown",
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState) => {
      setState({
        isConnected: netState.isConnected ?? false,
        type: netState.type,
        isInternetReachable: netState.isInternetReachable ?? false,
      });
    });
    return unsubscribe;
  }, []);

  return (
    <NetworkContext.Provider value={state}>
      {children}
    </NetworkContext.Provider>
  );
};`;

const OFFLINE_BANNER_CODE = `const OfflineBanner: FC = () => {
  const { isConnected } = useNetwork();

  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <Icon name="wifi-off" size={16} />
      <Text>You're offline. Some features may be limited.</Text>
    </View>
  );
};`;

const NETWORK_AWARE_FETCH_CODE = `const networkAwareFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const state = await NetInfo.fetch();

  if (!state.isConnected) {
    // Return cached data if available
    const cached = await cache.get(url);
    if (cached) return cached;
    throw new OfflineError("No network connection");
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    // Cache successful responses
    await cache.set(url, data);
    return data;
  } catch (error) {
    // Try cache on network error
    const cached = await cache.get(url);
    if (cached) return cached;
    throw error;
  }
};`;

// ==========================================
// Component
// ==========================================

export const NetworkShowcaseScreen: FC = function NetworkShowcaseScreen() {
  const { themed, theme } = useAppTheme();
  const [connectionType, setConnectionType] = useState("wifi");
  const [isReachable, setIsReachable] = useState(true);

  const simulateConnection = useCallback((type: string) => {
    setConnectionType(type);
    setIsReachable(type !== "none");
  }, []);

  const renderConnectionType = useCallback(
    (conn: (typeof CONNECTION_TYPES)[0]) => {
      const isActive = connectionType === conn.id;
      return (
        <Pressable
          key={conn.id}
          style={({ pressed }) => [
            themed($connectionCard),
            isActive && themed($connectionCardActive),
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => simulateConnection(conn.id)}
        >
          <Icon
            icon={conn.icon as "check" | "x"}
            size={24}
            color={isActive ? theme.colors.tint : theme.colors.textDim}
          />
          <Text
            style={[
              themed($connectionName),
              isActive && themed($connectionNameActive),
            ]}
          >
            {conn.name}
          </Text>
          <Text style={themed($connectionSpeed)}>{conn.speed}</Text>
        </Pressable>
      );
    },
    [themed, theme.colors.tint, theme.colors.textDim, connectionType, simulateConnection],
  );

  const renderFeature = useCallback(
    (title: string, description: string) => (
      <View key={title} style={themed($featureRow)}>
        <Icon
          icon="check"
          size={16}
          color={theme.colors.palette.secondary500}
        />
        <View style={themed($featureContent)}>
          <Text style={themed($featureTitle)}>{title}</Text>
          <Text style={themed($featureDesc)}>{description}</Text>
        </View>
      </View>
    ),
    [themed, theme.colors.palette.secondary500],
  );

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Network Status</Text>
          <Text preset="default" style={themed($subtitle)}>
            Real-time network monitoring with NetInfo
          </Text>
        </View>

        {/* Current Status */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Current Status
          </Text>
          <View style={themed($statusCard)}>
            <View style={themed($statusMain)}>
              <View
                style={[
                  themed($statusDot),
                  {
                    backgroundColor: isReachable
                      ? theme.colors.palette.secondary500
                      : theme.colors.palette.angry500,
                  },
                ]}
              />
              <Text style={themed($statusText)}>
                {isReachable ? "Connected" : "Offline"}
              </Text>
            </View>
            <View style={themed($statusDetails)}>
              <View style={themed($statusItem)}>
                <Text style={themed($statusLabel)}>Type</Text>
                <Text style={themed($statusValue)}>
                  {connectionType.charAt(0).toUpperCase() + connectionType.slice(1)}
                </Text>
              </View>
              <View style={themed($statusDivider)} />
              <View style={themed($statusItem)}>
                <Text style={themed($statusLabel)}>Internet</Text>
                <Text style={themed($statusValue)}>
                  {isReachable ? "Reachable" : "Unreachable"}
                </Text>
              </View>
              <View style={themed($statusDivider)} />
              <View style={themed($statusItem)}>
                <Text style={themed($statusLabel)}>Quality</Text>
                <Text style={themed($statusValue)}>
                  {connectionType === "wifi" ? "Excellent" : connectionType === "cellular" ? "Good" : "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Connection Type Simulator */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Simulate Connection
          </Text>
          <View style={themed($connectionGrid)}>
            {CONNECTION_TYPES.map(renderConnectionType)}
          </View>
        </View>

        {/* Offline Banner Preview */}
        {!isReachable && (
          <View style={themed($section)}>
            <View style={themed($offlineBanner)}>
              <Icon icon="x" size={16} color={theme.colors.palette.neutral100} />
              <Text style={themed($offlineBannerText)}>
                You're offline. Some features may be limited.
              </Text>
            </View>
          </View>
        )}

        {/* Features */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Features
          </Text>
          <View style={themed($featuresCard)}>
            {renderFeature("Real-time Monitoring", "Instant connection state updates")}
            {renderFeature("Connection Type", "Detect WiFi, cellular, or offline")}
            {renderFeature("Internet Reachability", "Verify actual internet access")}
            {renderFeature("Offline Banner", "Inform users when offline")}
            {renderFeature("Network-Aware Fetching", "Graceful offline handling")}
            {renderFeature("Connection Quality", "Signal strength indicators")}
          </View>
        </View>

        {/* Use Cases */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Use Cases
          </Text>
          <View style={themed($useCasesGrid)}>
            <View style={themed($useCaseCard)}>
              <Icon icon="menu" size={24} color={theme.colors.tint} />
              <Text style={themed($useCaseTitle)}>Data Sync</Text>
              <Text style={themed($useCaseDesc)}>
                Queue changes when offline
              </Text>
            </View>
            <View style={themed($useCaseCard)}>
              <Icon icon="check" size={24} color={theme.colors.tint} />
              <Text style={themed($useCaseTitle)}>UX Feedback</Text>
              <Text style={themed($useCaseDesc)}>
                Show offline indicators
              </Text>
            </View>
            <View style={themed($useCaseCard)}>
              <Icon icon="settings" size={24} color={theme.colors.tint} />
              <Text style={themed($useCaseTitle)}>Adaptive</Text>
              <Text style={themed($useCaseDesc)}>
                Reduce quality on slow networks
              </Text>
            </View>
            <View style={themed($useCaseCard)}>
              <Icon icon="menu" size={24} color={theme.colors.tint} />
              <Text style={themed($useCaseTitle)}>Caching</Text>
              <Text style={themed($useCaseDesc)}>
                Serve cached content offline
              </Text>
            </View>
          </View>
        </View>

        {/* Code Examples */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Implementation
          </Text>
          <CodeBlock
            title="NetInfo Basics"
            code={NETINFO_BASIC_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Network Context Provider"
            code={NETWORK_CONTEXT_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Offline Banner Component"
            code={OFFLINE_BANNER_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Network-Aware Fetching"
            code={NETWORK_AWARE_FETCH_CODE}
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

const $statusCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
});

const $statusMain: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginBottom: spacing.md,
});

const $statusDot: ThemedStyle<ViewStyle> = () => ({
  width: 12,
  height: 12,
  borderRadius: 6,
});

const $statusText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
});

const $statusDetails: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  backgroundColor: colors.palette.neutral300,
  borderRadius: 8,
  padding: spacing.sm,
});

const $statusItem: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "center",
});

const $statusLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  color: colors.textDim,
});

const $statusValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.text,
});

const $statusDivider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 1,
  height: "100%",
  backgroundColor: colors.separator,
});

const $connectionGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
});

const $connectionCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  alignItems: "center",
  gap: spacing.xs,
  borderWidth: 2,
  borderColor: "transparent",
});

const $connectionCardActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.tint,
  backgroundColor: colors.tint + "10",
});

const $connectionName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.text,
});

const $connectionNameActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
});

const $connectionSpeed: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  color: colors.textDim,
});

const $offlineBanner: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  backgroundColor: colors.palette.angry500,
  padding: spacing.md,
  borderRadius: 8,
});

const $offlineBannerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.palette.neutral100,
  flex: 1,
});

const $featuresCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.sm,
});

const $featureRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.sm,
});

const $featureContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $featureTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $featureDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
});

const $useCasesGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
});

const $useCaseCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "48%",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  alignItems: "center",
  gap: spacing.xs,
});

const $useCaseTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.text,
});

const $useCaseDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  color: colors.textDim,
  textAlign: "center",
});

export default NetworkShowcaseScreen;
