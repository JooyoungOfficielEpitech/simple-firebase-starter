import {
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";

import GoogleIcon from "@/components/Icons/GoogleIcon";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

export interface GoogleSignInButtonProps {
  /**
   * Called when the button is pressed.
   */
  onPress?: () => void;
  /**
   * Whether the button is disabled.
   */
  disabled?: boolean;
  /**
   * An optional style override for the button.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * Google Sign-In button component following Google's design guidelines.
 * Matches the exact CSS styles from Google's Material Design button.
 */
export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  const { onPress, disabled, style } = props;
  const { themed } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={themed([$googleSignInButton, disabled && $disabledButton, style])}
      activeOpacity={0.88} // 12% opacity state when pressed
    >
      <View style={themed($contentWrapper)}>
        <View style={themed($iconContainer)}>
          <GoogleIcon />
        </View>
        <Text
          text="Sign in with Google"
          style={themed([$buttonContents, disabled && $disabledText])}
        />
      </View>
    </TouchableOpacity>
  );
}

// Google Material Button styles - matches CSS exactly
const $googleSignInButton: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#747775",
  borderRadius: 4,
  height: Platform.OS === "ios" ? 44 : 40,
  paddingHorizontal: 12,
  position: "relative",
  overflow: "hidden",
  maxWidth: 400,
  minWidth: "auto",
  // Shadow effect for hover state (approximated for React Native)
  shadowColor: "rgba(60, 64, 67, 0.3)",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
  elevation: 2,
});

const $disabledButton: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#ffffff61",
  borderColor: "#1f1f1f1f",
});

const $contentWrapper: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  flexDirection: "row",
  flexWrap: "nowrap",
  height: "100%",
  justifyContent: "center",
  position: "relative",
  width: "100%",
});

const $iconContainer: ThemedStyle<ViewStyle> = () => ({
  height: 20,
  marginRight: Platform.OS === "ios" ? 12 : 10,
  marginLeft: Platform.OS === "ios" ? 16 : 12,
  minWidth: 20,
  width: 20,
});

const $buttonContents: ThemedStyle<TextStyle> = () => ({
  fontFamily: "Roboto",
  fontWeight: "500",
  fontSize: 14,
  letterSpacing: 0.25,
  color: "#1f1f1f",
  overflow: "hidden",
  textAlign: "center",
  verticalAlign: "top",
  flexGrow: 0,
});

const $disabledText: ThemedStyle<TextStyle> = () => ({
  opacity: 0.38,
});
