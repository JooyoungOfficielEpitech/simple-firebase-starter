/**
 * Offline Showcase Screen
 * 오프라인 지원 및 데이터 동기화 데모 화면
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

const SYNC_LAYERS = [
  {
    id: "firestore",
    name: "Firestore Persistence",
    description: "Automatic offline data caching",
    status: "active",
  },
  {
    id: "mmkv",
    name: "MMKV Storage",
    description: "Fast local key-value storage",
    status: "active",
  },
  {
    id: "queue",
    name: "Sync Queue",
    description: "Pending operations queue",
    status: "active",
  },
];

// ==========================================
// Code Examples
// ==========================================

const FIRESTORE_OFFLINE_CODE = `import firestore from "@react-native-firebase/firestore";

// Enable offline persistence (enabled by default)
firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

// Works offline - reads from cache
const users = await firestore()
  .collection("users")
  .get({ source: "cache" });

// Or auto-fallback to cache when offline
const data = await firestore()
  .collection("posts")
  .get();`;

const MMKV_CODE = `import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

// Synchronous operations - ultra fast
storage.set("user.preferences", JSON.stringify(prefs));
const prefs = storage.getString("user.preferences");

// With encryption
const secureStorage = new MMKV({
  id: "secure-storage",
  encryptionKey: "your-encryption-key",
});`;

const SYNC_QUEUE_CODE = `interface PendingOperation {
  id: string;
  type: "create" | "update" | "delete";
  collection: string;
  data: unknown;
  timestamp: number;
}

class SyncQueue {
  private queue: PendingOperation[] = [];

  async addOperation(op: PendingOperation) {
    this.queue.push(op);
    await this.persistQueue();
  }

  async processQueue() {
    while (this.queue.length > 0) {
      const op = this.queue[0];
      try {
        await this.executeOperation(op);
        this.queue.shift();
        await this.persistQueue();
      } catch (error) {
        // Will retry on next sync
        break;
      }
    }
  }
}`;

const NETWORK_AWARE_CODE = `import NetInfo from "@react-native-community/netinfo";

const NetworkAwareComponent = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });
    return unsubscribe;
  }, []);

  return isOnline ? <OnlineView /> : <OfflineView />;
};`;

// ==========================================
// Component
// ==========================================

export const OfflineShowcaseScreen: FC = function OfflineShowcaseScreen() {
  const { themed, theme } = useAppTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingOps, setPendingOps] = useState(0);

  const toggleNetwork = useCallback(() => {
    setIsOnline((prev) => !prev);
    if (isOnline) {
      // Simulate going offline - add pending ops
      setPendingOps(3);
    } else {
      // Simulate coming online - sync pending ops
      setPendingOps(0);
    }
  }, [isOnline]);

  const renderSyncLayer = useCallback(
    (layer: (typeof SYNC_LAYERS)[0]) => (
      <View key={layer.id} style={themed($layerCard)}>
        <View
          style={[
            themed($layerStatus),
            {
              backgroundColor:
                layer.status === "active"
                  ? theme.colors.palette.secondary500
                  : theme.colors.palette.neutral400,
            },
          ]}
        />
        <View style={themed($layerContent)}>
          <Text style={themed($layerName)}>{layer.name}</Text>
          <Text style={themed($layerDesc)}>{layer.description}</Text>
        </View>
        <Icon
          icon="check"
          size={20}
          color={theme.colors.palette.secondary500}
        />
      </View>
    ),
    [themed, theme.colors.palette.secondary500, theme.colors.palette.neutral400],
  );

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Offline Support</Text>
          <Text preset="default" style={themed($subtitle)}>
            Seamless offline experience with data sync
          </Text>
        </View>

        {/* Network Status Simulator */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Network Simulator
          </Text>
          <View style={themed($simulatorCard)}>
            <View style={themed($statusRow)}>
              <View style={themed($statusInfo)}>
                <View
                  style={[
                    themed($statusDot),
                    {
                      backgroundColor: isOnline
                        ? theme.colors.palette.secondary500
                        : theme.colors.palette.angry500,
                    },
                  ]}
                />
                <Text style={themed($statusLabel)}>
                  {isOnline ? "Online" : "Offline"}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  themed($toggleButton),
                  { backgroundColor: isOnline ? theme.colors.palette.angry500 : theme.colors.palette.secondary500 },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={toggleNetwork}
              >
                <Text style={themed($toggleText)}>
                  {isOnline ? "Go Offline" : "Go Online"}
                </Text>
              </Pressable>
            </View>

            {/* Pending Operations */}
            {pendingOps > 0 && (
              <View style={themed($pendingBanner)}>
                <Icon icon="menu" size={16} color={theme.colors.palette.accent500} />
                <Text style={themed($pendingText)}>
                  {pendingOps} pending operations waiting for sync
                </Text>
              </View>
            )}

            {/* Sync Status */}
            <View style={themed($syncStatus)}>
              <View style={themed($syncItem)}>
                <Text style={themed($syncLabel)}>Cache Size</Text>
                <Text style={themed($syncValue)}>24.5 MB</Text>
              </View>
              <View style={themed($syncDivider)} />
              <View style={themed($syncItem)}>
                <Text style={themed($syncLabel)}>Last Sync</Text>
                <Text style={themed($syncValue)}>2 min ago</Text>
              </View>
              <View style={themed($syncDivider)} />
              <View style={themed($syncItem)}>
                <Text style={themed($syncLabel)}>Pending</Text>
                <Text style={themed($syncValue)}>{pendingOps}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sync Layers */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Data Layers
          </Text>
          <View style={themed($layersContainer)}>
            {SYNC_LAYERS.map(renderSyncLayer)}
          </View>
        </View>

        {/* Offline Capabilities */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Offline Capabilities
          </Text>
          <View style={themed($capabilitiesGrid)}>
            <View style={themed($capabilityCard)}>
              <Icon icon="menu" size={28} color={theme.colors.tint} />
              <Text style={themed($capabilityTitle)}>Read Data</Text>
              <Text style={themed($capabilityDesc)}>
                Access cached data offline
              </Text>
            </View>
            <View style={themed($capabilityCard)}>
              <Icon icon="check" size={28} color={theme.colors.tint} />
              <Text style={themed($capabilityTitle)}>Write Data</Text>
              <Text style={themed($capabilityDesc)}>
                Queue writes for sync
              </Text>
            </View>
            <View style={themed($capabilityCard)}>
              <Icon icon="menu" size={28} color={theme.colors.tint} />
              <Text style={themed($capabilityTitle)}>Auto Sync</Text>
              <Text style={themed($capabilityDesc)}>
                Automatic reconnection
              </Text>
            </View>
            <View style={themed($capabilityCard)}>
              <Icon icon="settings" size={28} color={theme.colors.tint} />
              <Text style={themed($capabilityTitle)}>Conflict Resolution</Text>
              <Text style={themed($capabilityDesc)}>
                Smart merge strategies
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
            title="Firestore Offline"
            code={FIRESTORE_OFFLINE_CODE}
            language="tsx"
          />
          <CodeBlock
            title="MMKV Local Storage"
            code={MMKV_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Sync Queue"
            code={SYNC_QUEUE_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Network-Aware Components"
            code={NETWORK_AWARE_CODE}
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

const $simulatorCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
});

const $statusRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.md,
});

const $statusInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
});

const $statusDot: ThemedStyle<ViewStyle> = () => ({
  width: 12,
  height: 12,
  borderRadius: 6,
});

const $statusLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
});

const $toggleButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: 8,
});

const $toggleText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.palette.neutral100,
});

const $pendingBanner: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  backgroundColor: colors.palette.accent500 + "20",
  padding: spacing.sm,
  borderRadius: 8,
  marginBottom: spacing.md,
});

const $pendingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.palette.accent500,
});

const $syncStatus: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  backgroundColor: colors.palette.neutral300,
  borderRadius: 8,
  padding: spacing.sm,
});

const $syncItem: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "center",
});

const $syncLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  color: colors.textDim,
});

const $syncValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $syncDivider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 1,
  height: "100%",
  backgroundColor: colors.separator,
});

const $layersContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
});

const $layerCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.md,
});

const $layerStatus: ThemedStyle<ViewStyle> = () => ({
  width: 8,
  height: 8,
  borderRadius: 4,
});

const $layerContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $layerName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $layerDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
});

const $capabilitiesGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
});

const $capabilityCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "48%",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  alignItems: "center",
  gap: spacing.xs,
});

const $capabilityTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.text,
  textAlign: "center",
});

const $capabilityDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  color: colors.textDim,
  textAlign: "center",
});

export default OfflineShowcaseScreen;
