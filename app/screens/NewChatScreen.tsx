import { type FC, useCallback, useEffect, useState } from "react";
import {
  FlatList,
  type ListRenderItem,
  type TextStyle,
  TouchableOpacity,
  View,
  type ViewStyle,
  ActivityIndicator,
  Image,
  type ImageStyle,
} from "react-native";
import auth from "@react-native-firebase/auth";

import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { SearchBar } from "@/components/SearchBar";
import { Text } from "@/components/Text";
import type { ChatStackScreenProps } from "@/navigators/ChatNavigator";
import { chatService } from "@/services/chat";
import { userService } from "@/services/firestore";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import type { UserProfile } from "@/types/user";

export interface NewChatScreenProps extends ChatStackScreenProps<"NewChat"> {}

/**
 * New chat screen for selecting a user to start a conversation with.
 * Features:
 * - Search users by name or email
 * - Display user list
 * - Create new chat room on selection
 */
export const NewChatScreen: FC<NewChatScreenProps> = function NewChatScreen({
  navigation,
}) {
  const { themed, theme } = useAppTheme();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = auth().currentUser;

  /**
   * Load users on mount
   */
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const userList = await userService.getUsers(50);
        setUsers(userList);
        setFilteredUsers(userList);
      } catch (error) {
        console.error("사용자 목록 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  /**
   * Filter users based on search query
   */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(lowerQuery) ||
        user.email?.toLowerCase().includes(lowerQuery),
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  /**
   * Handle user selection - create chat room and navigate
   */
  const handleUserSelect = useCallback(
    async (selectedUser: UserProfile) => {
      if (isCreating || !currentUser) return;

      setIsCreating(true);

      try {
        // Create participant info map
        const participantInfoMap = {
          [currentUser.uid]: {
            name: currentUser.displayName || currentUser.email?.split("@")[0] || "나",
            avatar: currentUser.photoURL || undefined,
          },
          [selectedUser.uid]: {
            name: selectedUser.name,
            avatar: selectedUser.media?.[0],
          },
        };

        // Create or get existing chat room
        const chatId = await chatService.createChatRoom(
          [currentUser.uid, selectedUser.uid],
          participantInfoMap,
        );

        // Navigate to the chat room
        navigation.replace("ChatRoom", {
          chatId,
          partnerName: selectedUser.name,
          partnerAvatar: selectedUser.media?.[0],
          partnerId: selectedUser.uid,
        });
      } catch (error) {
        console.error("채팅방 생성 실패:", error);
        setIsCreating(false);
      }
    },
    [currentUser, isCreating, navigation],
  );

  /**
   * Render user item
   */
  const renderUserItem: ListRenderItem<UserProfile> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={themed($userItem)}
        onPress={() => handleUserSelect(item)}
        disabled={isCreating}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}님과 채팅 시작`}
      >
        {item.media?.[0] ? (
          <Image source={{ uri: item.media[0] }} style={themed($avatar)} />
        ) : (
          <View style={themed($avatarPlaceholder)}>
            <Text style={themed($avatarText)}>
              {item.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}
        <View style={themed($userInfo)}>
          <Text style={themed($userName)}>{item.name}</Text>
          <Text style={themed($userEmail)}>{item.email}</Text>
        </View>
      </TouchableOpacity>
    ),
    [themed, handleUserSelect, isCreating],
  );

  /**
   * Extract unique key for FlatList
   */
  const keyExtractor = useCallback((item: UserProfile) => item.uid, []);

  /**
   * Render empty state
   */
  const renderEmptyState = useCallback(
    () => (
      <View style={themed($emptyContainer)}>
        <Text style={themed($emptyText)}>
          {searchQuery ? "검색 결과가 없습니다" : "사용자가 없습니다"}
        </Text>
      </View>
    ),
    [themed, searchQuery],
  );

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
        <Header
          title="새 채팅"
          leftIcon="back"
          onLeftPress={() => navigation.goBack()}
        />
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
          <Text style={themed($loadingText)}>사용자 목록을 불러오는 중...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <Header
        title="새 채팅"
        leftIcon="back"
        onLeftPress={() => navigation.goBack()}
      />

      {/* Search Bar */}
      <View style={themed($searchContainer)}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="이름 또는 이메일로 검색"
        />
      </View>

      {/* Creating indicator */}
      {isCreating && (
        <View style={themed($creatingOverlay)}>
          <ActivityIndicator size="small" color={theme.colors.tint} />
          <Text style={themed($creatingText)}>채팅방 생성 중...</Text>
        </View>
      )}

      {/* User List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={themed($listContent)}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        accessibilityRole="list"
        accessibilityLabel="사용자 목록"
      />
    </Screen>
  );
};

const $searchContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
});

const $listContent: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
});

const $userItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  minHeight: 64,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $avatar: ThemedStyle<ImageStyle> = () => ({
  width: 50,
  height: 50,
  borderRadius: 25,
});

const $avatarPlaceholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
});

const $avatarText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  fontWeight: "600",
  color: colors.background,
});

const $userInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginLeft: spacing.md,
});

const $userName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
});

const $userEmail: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginTop: 2,
});

const $loadingContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
});

const $loadingText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.textDim,
  marginTop: spacing.md,
});

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.xxxl,
});

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
  textAlign: "center",
});

const $creatingOverlay: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.sm,
  backgroundColor: colors.background,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $creatingText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginLeft: spacing.sm,
});
