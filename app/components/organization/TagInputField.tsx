import React, { useState } from "react"
import { View, TouchableOpacity } from "react-native"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { Button } from "@/components/Button"
import { useAppTheme } from "@/theme/context"

interface TagInputFieldProps {
  label: string
  placeholder: string
  items: string[]
  onAdd: (item: string) => boolean
  onRemove: (index: number) => void
}

export const TagInputField: React.FC<TagInputFieldProps> = ({
  label,
  placeholder,
  items,
  onAdd,
  onRemove,
}) => {
  const [input, setInput] = useState("")
  const { themed } = useAppTheme()

  const handleAdd = () => {
    if (onAdd(input)) {
      setInput("")
    }
  }

  return (
    <View style={themed($tagSection)}>
      <Text text={label} style={themed($tagLabel)} />
      <View style={themed($tagInputContainer)}>
        <TextField
          value={input}
          onChangeText={setInput}
          placeholder={placeholder}
          containerStyle={themed($tagInput)}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          blurOnSubmit={true}
        />
        <Button
          text="추가"
          onPress={handleAdd}
          style={themed($addTagButton)}
          textStyle={themed($addTagButtonText)}
        />
      </View>
      
      {items.length > 0 && (
        <View style={themed($tagsContainer)}>
          {items.map((item, index) => (
            <View key={index} style={themed($tag)}>
              <Text text={item} style={themed($tagText)} />
              <TouchableOpacity
                onPress={() => onRemove(index)}
                style={themed($removeTagButton)}
                activeOpacity={0.6}
              >
                <Text text="×" style={themed($removeTagText)} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const $tagSection = ({ spacing }) => ({
  marginTop: spacing?.sm || 8,
})

const $tagLabel = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "500" as const,
  marginBottom: spacing?.xs || 4,
})

const $tagInputContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "flex-end" as const,
  gap: spacing?.sm || 8,
})

const $tagInput = ({ spacing }) => ({
  flex: 1,
  marginRight: spacing?.sm || 8,
})

const $addTagButton = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  paddingHorizontal: spacing?.md || 12,
  paddingVertical: spacing?.xs || 4,
  minHeight: 40,
})

const $addTagButtonText = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
})

const $tagsContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  marginTop: spacing?.sm || 8,
  gap: spacing?.xs || 4,
})

const $tag = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing?.sm || 8,
  paddingVertical: 4,
  borderRadius: 4,
})

const $tagText = ({ colors }) => ({
  color: colors.palette.neutral600,
  fontSize: 12,
  marginRight: 6,
})

const $removeTagButton = ({ colors }) => ({
  width: 18,
  height: 18,
  borderRadius: 9,
  backgroundColor: colors.palette.neutral400,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginLeft: 6,
  opacity: 0.8,
})

const $removeTagText = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 12,
  fontWeight: "bold" as const,
  lineHeight: 12,
  textAlign: "center" as const,
})
