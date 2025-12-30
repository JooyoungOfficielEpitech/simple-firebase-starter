import React, { useState } from "react"
import { View, ViewStyle, TextStyle, Pressable, ActivityIndicator } from "react-native"
import { useForm, Controller } from "react-hook-form"
import { Screen } from "@/components/Screen"
import { TextField } from "@/components/TextField"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { $styles } from "@/theme/styles"

type SheepType = "white" | "black"

interface CreatePostFormData {
  author: string
  sheepType: SheepType
  title: string
  content: string
}

export const CreatePostScreen = () => {
  const { themed, theme } = useAppTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contentLength, setContentLength] = useState(0)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<CreatePostFormData>({
    defaultValues: {
      author: "",
      sheepType: "white",
      title: "",
      content: "",
    },
    mode: "onChange",
  })

  const sheepType = watch("sheepType")
  const content = watch("content")

  // Update character count when content changes
  React.useEffect(() => {
    setContentLength(content?.length || 0)
  }, [content])

  const onSubmit = async (data: CreatePostFormData) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement API call to create post
      console.log("Creating post:", data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // TODO: Navigate back to post list screen
      // navigation.goBack()
    } catch (error) {
      console.error("Failed to create post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["bottom"]}
      contentContainerStyle={themed($screenContentContainer)}
      style={themed($screenStyle)}
    >
      <View style={themed($formContainer)}>
        {/* Author Name Input */}
        <View style={themed($formCard)}>
          <Controller
            control={control}
            name="author"
            rules={{
              required: "작성자 이름을 입력해주세요",
              minLength: {
                value: 2,
                message: "최소 2자 이상 입력해주세요",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="작성자"
                placeholder="이름을 입력하세요"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                status={errors.author ? "error" : undefined}
                helper={errors.author?.message}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />

          {/* Character Selector */}
          <View style={themed($characterSelectorContainer)}>
            <Text preset="formLabel" style={themed($characterLabel)}>
              양 캐릭터 선택
            </Text>
            <Controller
              control={control}
              name="sheepType"
              render={({ field: { onChange, value } }) => (
                <View style={themed($characterOptions)}>
                  <CharacterOption
                    type="white"
                    selected={value === "white"}
                    onPress={() => onChange("white")}
                  />
                  <CharacterOption
                    type="black"
                    selected={value === "black"}
                    onPress={() => onChange("black")}
                  />
                </View>
              )}
            />
          </View>
        </View>

        {/* Title Input */}
        <View style={themed($formCard)}>
          <Controller
            control={control}
            name="title"
            rules={{
              required: "제목을 입력해주세요",
              maxLength: {
                value: 100,
                message: "제목은 최대 100자까지 입력 가능합니다",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="제목"
                placeholder="제목을 입력하세요"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                status={errors.title ? "error" : undefined}
                helper={errors.title?.message}
                autoCapitalize="sentences"
              />
            )}
          />
        </View>

        {/* Content Textarea */}
        <View style={themed($formCard)}>
          <Controller
            control={control}
            name="content"
            rules={{
              required: "내용을 입력해주세요",
              maxLength: {
                value: 1000,
                message: "내용은 최대 1000자까지 입력 가능합니다",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextField
                  label="내용"
                  placeholder="내용을 입력하세요"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  status={errors.content ? "error" : undefined}
                  helper={errors.content?.message}
                  multiline
                  numberOfLines={8}
                  style={themed($textArea)}
                  inputWrapperStyle={themed($textAreaWrapper)}
                  autoCapitalize="sentences"
                />
                <Text style={themed($characterCount)}>
                  {contentLength} / 1000
                </Text>
              </>
            )}
          />
        </View>

        {/* Submit Button */}
        <Button
          preset="cta"
          text="게시하기"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          isLoading={isSubmitting}
          style={themed($submitButton)}
        />
      </View>
    </Screen>
  )
}

interface CharacterOptionProps {
  type: SheepType
  selected: boolean
  onPress: () => void
}

const CharacterOption: React.FC<CharacterOptionProps> = ({ type, selected, onPress }) => {
  const { themed } = useAppTheme()

  return (
    <Pressable
      onPress={onPress}
      style={themed([$characterOption, selected && $characterOptionSelected])}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={type === "white" ? "화이트양" : "블랙양"}
    >
      <View style={themed($characterIconContainer)}>
        <SheepCharacter type={type} size="medium" />
      </View>
      <Text style={themed($characterOptionText)}>
        {type === "white" ? "화이트양" : "블랙양"}
      </Text>
    </Pressable>
  )
}

interface SheepCharacterProps {
  type: SheepType
  size: "medium"
}

const SheepCharacter: React.FC<SheepCharacterProps> = ({ type, size }) => {
  const { themed, theme } = useAppTheme()

  // Simple sheep character using View components
  // Based on design spec: medium size (60x60 container)
  const bodyColor = type === "white" ? "#FFF8F0" : "#2F2F32"

  return (
    <View style={themed($sheepContainer)}>
      {/* Body */}
      <View style={themed([$sheepBody, { backgroundColor: bodyColor }])} />

      {/* Head */}
      <View style={themed([$sheepHead, { backgroundColor: bodyColor }])}>
        {/* Horns */}
        <View style={themed($hornsContainer)}>
          <View style={themed($horn)} />
          <View style={themed($horn)} />
        </View>

        {/* Eyes */}
        <View style={themed($eyesContainer)}>
          <View style={themed($eye)} />
          <View style={themed($eye)} />
        </View>

        {/* Blush */}
        <View style={themed($blushContainer)}>
          <View style={themed($blush)} />
          <View style={themed($blush)} />
        </View>
      </View>

      {/* Legs */}
      <View style={themed($legsContainer)}>
        <View style={themed($leg)} />
        <View style={themed($leg)} />
      </View>
    </View>
  )
}

// Screen styles
const $screenStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
})

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.lg,
})

const $formContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
})

const $formCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 16,
  padding: spacing.lg,
})

// Character selector styles
const $characterSelectorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})

const $characterLabel: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $characterOptions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
})

const $characterOption: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  padding: spacing.md,
  borderRadius: 12,
  borderWidth: 3,
  borderColor: colors.palette.neutral300,
  backgroundColor: colors.background,
  alignItems: "center",
  gap: spacing.xs,
})

const $characterOptionSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.primary500,
  backgroundColor: "#FFF8F0",
  transform: [{ scale: 1.05 }],
})

const $characterIconContainer: ThemedStyle<ViewStyle> = () => ({
  width: 60,
  height: 60,
  justifyContent: "center",
  alignItems: "center",
})

const $characterOptionText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.bold,
  color: colors.text,
})

// Textarea styles
const $textArea: ThemedStyle<TextStyle> = () => ({
  minHeight: 120,
})

const $textAreaWrapper: ThemedStyle<ViewStyle> = () => ({
  minHeight: 120,
})

const $characterCount: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  textAlign: "right",
  marginTop: spacing.xs,
  opacity: 0.6,
})

// Submit button styles
const $submitButton: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 24,
  minHeight: 56,
})

// Sheep character styles (medium size: 60x60)
const $sheepContainer: ThemedStyle<ViewStyle> = () => ({
  width: 60,
  height: 60,
  position: "relative",
  justifyContent: "center",
  alignItems: "center",
})

const $sheepBody: ThemedStyle<ViewStyle> = () => ({
  width: 40,
  height: 34,
  borderRadius: 9999,
  borderWidth: 3,
  borderColor: "#111111",
  position: "absolute",
  bottom: 0,
})

const $sheepHead: ThemedStyle<ViewStyle> = () => ({
  width: 28,
  height: 28,
  borderRadius: 9999,
  borderWidth: 3,
  borderColor: "#111111",
  position: "absolute",
  top: 8,
  justifyContent: "center",
  alignItems: "center",
})

const $hornsContainer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: -8,
  flexDirection: "row",
  gap: 8,
})

const $horn: ThemedStyle<ViewStyle> = () => ({
  width: 12,
  height: 15.6,
  borderRadius: 9999,
  backgroundColor: "#C49159",
})

const $eyesContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  gap: 8,
  marginTop: 4,
})

const $eye: ThemedStyle<ViewStyle> = () => ({
  width: 4,
  height: 4,
  borderRadius: 9999,
  backgroundColor: "#111111",
})

const $blushContainer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  bottom: 2,
  flexDirection: "row",
  gap: 16,
})

const $blush: ThemedStyle<ViewStyle> = () => ({
  width: 8,
  height: 5.6,
  borderRadius: 9999,
  backgroundColor: "#FFCBC0",
  opacity: 0.6,
})

const $legsContainer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  bottom: 0,
  flexDirection: "row",
  gap: 12,
})

const $leg: ThemedStyle<ViewStyle> = () => ({
  width: 6,
  height: 12,
  borderRadius: 9999,
  backgroundColor: "#111111",
})
