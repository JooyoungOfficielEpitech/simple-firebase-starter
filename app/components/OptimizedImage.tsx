import React, { useState, useCallback } from "react"
import { View, Image, ImageProps, ImageErrorEventData, NativeSyntheticEvent, DimensionValue } from "react-native"
import { useAppTheme } from "@/theme/context"
import { LoadingSpinner } from "./LoadingSpinner"
import { Text } from "./Text"

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError' | 'onLoadStart'> {
  fallbackText?: string
  showLoading?: boolean
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'
  onLoadComplete?: () => void
  onLoadError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void
}

export const OptimizedImage = React.memo(({
  source,
  style,
  fallbackText = "이미지를 불러올 수 없습니다",
  showLoading = true,
  resizeMode = 'cover',
  onLoadComplete,
  onLoadError,
  ...rest
}: OptimizedImageProps) => {
  const { themed } = useAppTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoadStart = useCallback(() => {
    setLoading(true)
    setError(false)
  }, [])

  const handleLoad = useCallback(() => {
    setLoading(false)
    setError(false)
    onLoadComplete?.()
  }, [onLoadComplete])

  const handleError = useCallback((e: NativeSyntheticEvent<ImageErrorEventData>) => {
    setLoading(false)
    setError(true)
    onLoadError?.(e)
  }, [onLoadError])

  if (error) {
    return (
      <View style={[themed($errorContainer), style]}>
        <Text text="🖼️" style={themed($errorIcon)} />
        <Text text={fallbackText} style={themed($errorText)} />
      </View>
    )
  }

  return (
    <View style={[themed($container), style]}>
      <Image
        source={source}
        style={[themed($image), style]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        // Performance optimizations
        progressiveRenderingEnabled={true}
        fadeDuration={200}
        {...rest}
      />
      
      {loading && showLoading && (
        <View style={themed($loadingOverlay)}>
          <LoadingSpinner size="small" overlay={false} />
        </View>
      )}
    </View>
  )
})

// Optimized Avatar component for user profiles
export const Avatar = React.memo(({
  uri,
  name,
  size = 40,
  backgroundColor,
}: {
  uri?: string
  name?: string
  size?: number
  backgroundColor?: string
}) => {
  const { themed, theme } = useAppTheme()
  
  const initials = React.useMemo(() => {
    if (!name) return "?"
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }, [name])

  const avatarStyle = React.useMemo(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: backgroundColor || theme.colors.palette.neutral300,
  }), [size, backgroundColor, theme.colors.palette.neutral300])

  if (uri) {
    return (
      <OptimizedImage
        source={{ uri }}
        style={[themed($avatar), avatarStyle]}
        resizeMode="cover"
        showLoading={false}
        fallbackText=""
      />
    )
  }

  return (
    <View style={[themed($avatarFallback), avatarStyle]}>
      <Text text={initials} style={themed($avatarText)} />
    </View>
  )
})

const $container = {
  position: "relative" as const,
}

const $image = {
  width: "100%" as DimensionValue,
  height: "100%" as DimensionValue,
}

const $loadingOverlay = ({ colors }) => ({
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: colors.background + "CC",
  justifyContent: "center" as const,
  alignItems: "center" as const,
})

const $errorContainer = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  padding: spacing.md,
})

const $errorIcon = {
  fontSize: 24,
  marginBottom: 4,
}

const $errorText = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 12,
  textAlign: "center" as const,
})

const $avatar = {
  overflow: "hidden" as const,
}

const $avatarFallback = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
  justifyContent: "center" as const,
  alignItems: "center" as const,
})

const $avatarText = ({ colors }) => ({
  color: colors.text,
  fontSize: 14,
  fontWeight: "600" as const,
})

OptimizedImage.displayName = "OptimizedImage"
Avatar.displayName = "Avatar"