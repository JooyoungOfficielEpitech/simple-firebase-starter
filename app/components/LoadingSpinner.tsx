import React from "react"
import { View, ActivityIndicator, DimensionValue } from "react-native"
import { useAppTheme } from "@/theme/context"
import { Text } from "./Text"

interface LoadingSpinnerProps {
  size?: "small" | "large"
  text?: string
  overlay?: boolean
}

export const LoadingSpinner = React.memo(({ 
  size = "large", 
  text = "로딩 중...",
  overlay = false 
}: LoadingSpinnerProps) => {
  const { themed, theme } = useAppTheme()

  const containerStyle = overlay ? themed($overlayContainer) : themed($container)

  return (
    <View style={containerStyle}>
      <ActivityIndicator 
        size={size} 
        color={theme.colors.tint} 
        style={themed($spinner)} 
      />
      {text && (
        <Text 
          text={text} 
          style={themed($loadingText)} 
        />
      )}
    </View>
  )
})

// Skeleton loading component for better UX
export const SkeletonLoader = React.memo(({ 
  width = "100%", 
  height = 20, 
  borderRadius = 4 
}: { 
  width?: DimensionValue
  height?: number
  borderRadius?: number 
}) => {
  const { themed } = useAppTheme()

  return (
    <View 
      style={[
        themed($skeleton), 
        { width, height, borderRadius }
      ]} 
    />
  )
})

// Loading placeholder for cards
export const CardSkeleton = React.memo(() => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($cardSkeleton)}>
      <SkeletonLoader width="70%" height={24} />
      <SkeletonLoader width="50%" height={16} />
      <SkeletonLoader width="90%" height={16} />
      <View style={themed($skeletonTagsContainer)}>
        <SkeletonLoader width={60} height={20} borderRadius={10} />
        <SkeletonLoader width={80} height={20} borderRadius={10} />
      </View>
    </View>
  )
})

const $container = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  paddingVertical: spacing.xl,
})

const $overlayContainer = ({ colors, spacing }) => ({
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: colors.background + "CC", // Semi-transparent
  justifyContent: "center" as const,
  alignItems: "center" as const,
  zIndex: 1000,
  paddingVertical: spacing.xl,
})

const $spinner = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $loadingText = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
  textAlign: "center" as const,
})

const $skeleton = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  opacity: 0.6,
})

const $cardSkeleton = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing.md,
  marginBottom: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
  gap: spacing.sm,
})

const $skeletonTagsContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing.xs,
  marginTop: spacing.xs,
})

LoadingSpinner.displayName = "LoadingSpinner"
SkeletonLoader.displayName = "SkeletonLoader"
CardSkeleton.displayName = "CardSkeleton"