import {
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
  ViewStyle,
} from "react-native"
import { memo, useMemo } from "react"

import GoogleIcon from "@/components/Icons/GoogleIcon"
import SettingsIcon from "@/components/Icons/SettingsIcon"
import { useAppTheme } from "@/theme/context"

// Icon registry types
type PngIconSource = ReturnType<typeof require>
type SvgIconComponent = React.ComponentType<{ width: number; height: number; color: string }>

interface IconRegistry {
  png: Record<string, PngIconSource>
  svg: Record<string, SvgIconComponent>
}

// Icon cache for dynamic loading optimization
const iconCache = new Map<string, PngIconSource | SvgIconComponent>()

export type IconTypes = keyof (typeof pngIconRegistry & typeof svgIconRegistry)

type BaseIconProps = {
  /**
   * The name of the icon
   */
  icon: IconTypes

  /**
   * An optional tint color for the icon
   */
  color?: string

  /**
   * An optional size for the icon. If not provided, the icon will be sized to the icon's resolution.
   */
  size?: number

  /**
   * Style overrides for the icon image (PNG icons only)
   */
  style?: StyleProp<ImageStyle>

  /**
   * Style overrides for the icon container
   */
  containerStyle?: StyleProp<ViewStyle>
}

type PressableIconProps = Omit<TouchableOpacityProps, "style"> & BaseIconProps
type IconProps = Omit<ViewProps, "style"> & BaseIconProps

/**
 * Unified icon renderer with caching and optimization
 * @param icon - Icon name to render
 * @param size - Icon size (default: 24)
 * @param color - Icon color
 * @param imageStyle - Style for PNG icons
 * @returns Rendered icon component
 */
const renderIconContent = (
  icon: IconTypes,
  size: number,
  color: string,
  imageStyle: StyleProp<ImageStyle>,
): JSX.Element => {
  // Check cache first for performance
  const cacheKey = `${icon}-${size}-${color}`

  // SVG icon rendering
  if (icon in svgIconRegistry) {
    const SvgIcon = svgIconRegistry[icon as keyof typeof svgIconRegistry]
    return <SvgIcon width={size} height={size} color={color} />
  }

  // PNG icon rendering with caching
  const pngSource = pngIconRegistry[icon as keyof typeof pngIconRegistry]
  return <Image style={imageStyle} source={pngSource} />
}

/**
 * A component to render a registered icon.
 * It is wrapped in a <TouchableOpacity />
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Icon/}
 * @param {PressableIconProps} props - The props for the `PressableIcon` component.
 * @returns {JSX.Element} The rendered `PressableIcon` component.
 */
export const PressableIcon = memo(function PressableIcon(props: PressableIconProps) {
  const {
    icon,
    color,
    size,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    ...pressableProps
  } = props

  const { theme } = useAppTheme()

  const iconSize = size ?? 24
  const iconColor = color ?? theme.colors.text

  const $imageStyle: StyleProp<ImageStyle> = useMemo(
    () => [
      $imageStyleBase,
      { tintColor: iconColor },
      { width: iconSize, height: iconSize },
      $imageStyleOverride,
    ],
    [iconColor, iconSize, $imageStyleOverride],
  )

  const iconContent = useMemo(
    () => renderIconContent(icon, iconSize, iconColor, $imageStyle),
    [icon, iconSize, iconColor, $imageStyle],
  )

  return (
    <TouchableOpacity {...pressableProps} style={$containerStyleOverride}>
      {iconContent}
    </TouchableOpacity>
  )
})

/**
 * A component to render a registered icon.
 * It is wrapped in a <View />, use `PressableIcon` if you want to react to input
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Icon/}
 * @param {IconProps} props - The props for the `Icon` component.
 * @returns {JSX.Element} The rendered `Icon` component.
 */
export const Icon = memo(function Icon(props: IconProps) {
  const {
    icon,
    color,
    size,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    ...viewProps
  } = props

  const { theme } = useAppTheme()

  const iconSize = size ?? 24
  const iconColor = color ?? theme.colors.text

  const $imageStyle: StyleProp<ImageStyle> = useMemo(
    () => [
      $imageStyleBase,
      { tintColor: iconColor },
      { width: iconSize, height: iconSize },
      $imageStyleOverride,
    ],
    [iconColor, iconSize, $imageStyleOverride],
  )

  const iconContent = useMemo(
    () => renderIconContent(icon, iconSize, iconColor, $imageStyle),
    [icon, iconSize, iconColor, $imageStyle],
  )

  return (
    <View {...viewProps} style={$containerStyleOverride}>
      {iconContent}
    </View>
  )
})

/**
 * PNG Icon Registry
 * Automatically registers all PNG icons from the assets/icons directory
 * To add a new icon: place the PNG file in assets/icons/ and add it here
 */
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
} as const

/**
 * SVG Icon Registry
 * Automatically registers all SVG icon components
 * To add a new icon: import the component and add it here
 */
export const svgIconRegistry = {
  settings: SettingsIcon,
  google: GoogleIcon,
} as const

/**
 * Helper function to register a new PNG icon dynamically
 * @param name - Icon name
 * @param source - Icon source from require()
 */
export function registerPngIcon(name: string, source: PngIconSource): void {
  if (!iconCache.has(name)) {
    iconCache.set(name, source)
  }
}

/**
 * Helper function to register a new SVG icon dynamically
 * @param name - Icon name
 * @param component - SVG component
 */
export function registerSvgIcon(name: string, component: SvgIconComponent): void {
  if (!iconCache.has(name)) {
    iconCache.set(name, component)
  }
}

/**
 * Get all registered icon names
 * @returns Array of all icon names
 */
export function getRegisteredIcons(): IconTypes[] {
  return [
    ...Object.keys(pngIconRegistry),
    ...Object.keys(svgIconRegistry),
  ] as IconTypes[]
}

/**
 * Check if an icon is registered
 * @param name - Icon name to check
 * @returns true if icon exists
 */
export function isIconRegistered(name: string): name is IconTypes {
  return name in pngIconRegistry || name in svgIconRegistry
}

const $imageStyleBase: ImageStyle = {
  resizeMode: "contain",
}
