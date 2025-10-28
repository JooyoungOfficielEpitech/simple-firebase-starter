import React, { memo, useMemo } from "react"
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

// Icon type discriminator for type safety
type IconType = "png" | "svg"

interface IconMetadata {
  type: IconType
  source: PngIconSource | SvgIconComponent
}

// Enhanced icon cache with metadata for better type discrimination
const iconMetadataCache = new Map<string, IconMetadata>()

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
 * Get icon metadata with caching for optimal performance
 * @param icon - Icon name
 * @returns Icon metadata with type and source
 */
const getIconMetadata = (icon: IconTypes): IconMetadata => {
  // Check cache first
  if (iconMetadataCache.has(icon)) {
    return iconMetadataCache.get(icon)!
  }

  // Determine icon type and source
  let metadata: IconMetadata

  if (icon in svgIconRegistry) {
    metadata = {
      type: "svg",
      source: svgIconRegistry[icon as keyof typeof svgIconRegistry],
    }
  } else {
    metadata = {
      type: "png",
      source: pngIconRegistry[icon as keyof typeof pngIconRegistry],
    }
  }

  // Cache for future use
  iconMetadataCache.set(icon, metadata)
  return metadata
}

/**
 * Unified icon renderer with enhanced caching and type safety
 * @param icon - Icon name to render
 * @param size - Icon size (default: 24)
 * @param color - Icon color
 * @param imageStyle - Style for PNG icons
 * @returns Rendered icon component
 */
const RenderIconContent = memo(function RenderIconContent({
  icon,
  size,
  color,
  imageStyle,
}: {
  icon: IconTypes
  size: number
  color: string
  imageStyle: StyleProp<ImageStyle>
}) {
  const metadata = getIconMetadata(icon)

  // Unified rendering logic based on icon type
  if (metadata.type === "svg") {
    const SvgIcon = metadata.source as SvgIconComponent
    return <SvgIcon width={size} height={size} color={color} />
  }

  // PNG icon rendering
  const pngSource = metadata.source as PngIconSource
  return <Image style={imageStyle} source={pngSource} />
})

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

  return (
    <TouchableOpacity {...pressableProps} style={$containerStyleOverride}>
      <RenderIconContent icon={icon} size={iconSize} color={iconColor} imageStyle={$imageStyle} />
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

  return (
    <View {...viewProps} style={$containerStyleOverride}>
      <RenderIconContent icon={icon} size={iconSize} color={iconColor} imageStyle={$imageStyle} />
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
  if (!iconMetadataCache.has(name)) {
    iconMetadataCache.set(name, {
      type: "png",
      source,
    })
  }
}

/**
 * Helper function to register a new SVG icon dynamically
 * @param name - Icon name
 * @param component - SVG component
 */
export function registerSvgIcon(name: string, component: SvgIconComponent): void {
  if (!iconMetadataCache.has(name)) {
    iconMetadataCache.set(name, {
      type: "svg",
      source: component,
    })
  }
}

/**
 * Clear icon metadata cache (useful for testing or dynamic reloading)
 */
export function clearIconCache(): void {
  iconMetadataCache.clear()
}

/**
 * Get icon type for a registered icon
 * @param name - Icon name
 * @returns Icon type or undefined if not registered
 */
export function getIconType(name: string): IconType | undefined {
  if (name in svgIconRegistry) return "svg"
  if (name in pngIconRegistry) return "png"
  return undefined
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
