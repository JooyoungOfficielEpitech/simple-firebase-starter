import {
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

import GoogleIcon from "@/components/Icons/GoogleIcon";
import SettingsIcon from "@/components/Icons/SettingsIcon";
import { useAppTheme } from "@/theme/context";

export type IconTypes = keyof (typeof pngIconRegistry & typeof svgIconRegistry);

type BaseIconProps = {
  /**
   * The name of the icon
   */
  icon: IconTypes;

  /**
   * An optional tint color for the icon
   */
  color?: string;

  /**
   * An optional size for the icon. If not provided, the icon will be sized to the icon's resolution.
   */
  size?: number;

  /**
   * Style overrides for the icon image (PNG icons only)
   */
  style?: StyleProp<ImageStyle>;

  /**
   * Style overrides for the icon container
   */
  containerStyle?: StyleProp<ViewStyle>;
};

type PressableIconProps = Omit<TouchableOpacityProps, "style"> & BaseIconProps;
type IconProps = Omit<ViewProps, "style"> & BaseIconProps;

/**
 * A component to render a registered icon.
 * It is wrapped in a <TouchableOpacity />
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Icon/}
 * @param {PressableIconProps} props - The props for the `PressableIcon` component.
 * @returns {JSX.Element} The rendered `PressableIcon` component.
 */
export function PressableIcon(props: PressableIconProps) {
  const {
    icon,
    color,
    size,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    ...pressableProps
  } = props;

  const { theme } = useAppTheme();

  const $imageStyle: StyleProp<ImageStyle> = [
    $imageStyleBase,
    { tintColor: color ?? theme.colors.text },
    size !== undefined && { width: size, height: size },
    $imageStyleOverride,
  ];

  const renderIcon = () => {
    if (icon in svgIconRegistry) {
      const SvgIcon = svgIconRegistry[icon as keyof typeof svgIconRegistry];
      return (
        <SvgIcon
          width={size ?? 24}
          height={size ?? 24}
          color={color ?? theme.colors.text}
        />
      );
    }

    return (
      <Image
        style={$imageStyle}
        source={pngIconRegistry[icon as keyof typeof pngIconRegistry]}
      />
    );
  };

  return (
    <TouchableOpacity {...pressableProps} style={$containerStyleOverride}>
      {renderIcon()}
    </TouchableOpacity>
  );
}

/**
 * A component to render a registered icon.
 * It is wrapped in a <View />, use `PressableIcon` if you want to react to input
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Icon/}
 * @param {IconProps} props - The props for the `Icon` component.
 * @returns {JSX.Element} The rendered `Icon` component.
 */
export function Icon(props: IconProps) {
  const {
    icon,
    color,
    size,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    ...viewProps
  } = props;

  const { theme } = useAppTheme();

  const $imageStyle: StyleProp<ImageStyle> = [
    $imageStyleBase,
    { tintColor: color ?? theme.colors.text },
    size !== undefined && { width: size, height: size },
    $imageStyleOverride,
  ];

  const renderIcon = () => {
    if (icon in svgIconRegistry) {
      const SvgIcon = svgIconRegistry[icon as keyof typeof svgIconRegistry];
      return (
        <SvgIcon
          width={size ?? 24}
          height={size ?? 24}
          color={color ?? theme.colors.text}
        />
      );
    }

    return (
      <Image
        style={$imageStyle}
        source={pngIconRegistry[icon as keyof typeof pngIconRegistry]}
      />
    );
  };

  return (
    <View {...viewProps} style={$containerStyleOverride}>
      {renderIcon()}
    </View>
  );
}

export const pngIconRegistry = {
  back: require("@assets/icons/back.png"),
  bell: require("@assets/icons/bell.png"),
  caretLeft: require("@assets/icons/caretLeft.png"),
  caretRight: require("@assets/icons/caretRight.png"),
  check: require("@assets/icons/check.png"),
  heart: require("@assets/icons/heart.png"),
  hidden: require("@assets/icons/hidden.png"),
  ladybug: require("@assets/icons/ladybug.png"),
  lock: require("@assets/icons/lock.png"),
  menu: require("@assets/icons/menu.png"),
  more: require("@assets/icons/more.png"),
  user: require("@assets/icons/user.png"),
  view: require("@assets/icons/view.png"),
  x: require("@assets/icons/x.png"),
};

export const svgIconRegistry = {
  settings: SettingsIcon,
  google: GoogleIcon,
} as const;

const $imageStyleBase: ImageStyle = {
  resizeMode: "contain",
};
