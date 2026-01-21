import { CompositeScreenProps } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import { ChatListScreen } from "@/screens/ChatListScreen";
import { ChatRoomScreen } from "@/screens/ChatRoomScreen";
import { NewChatScreen } from "@/screens/NewChatScreen";
import { useAppTheme } from "@/theme/context";

import { AppStackParamList, AppStackScreenProps } from "./AppNavigator";
import { MainTabParamList, MainTabScreenProps } from "./MainNavigator";

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: {
    chatId: string;
    partnerName: string;
    partnerAvatar?: string;
    partnerId: string;
  };
  NewChat: undefined;
};

/**
 * Helper for automatically generating navigation prop types for each route.
 */
export type ChatStackScreenProps<T extends keyof ChatStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ChatStackParamList, T>,
    CompositeScreenProps<
      MainTabScreenProps<keyof MainTabParamList>,
      AppStackScreenProps<keyof AppStackParamList>
    >
  >;

const Stack = createNativeStackNavigator<ChatStackParamList>();

/**
 * Chat navigator containing chat list and chat room screens.
 */
export function ChatNavigator() {
  const {
    theme: { colors },
  } = useAppTheme();

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="NewChat" component={NewChatScreen} />
    </Stack.Navigator>
  );
}
