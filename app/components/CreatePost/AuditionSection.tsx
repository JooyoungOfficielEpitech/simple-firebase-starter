import React from "react"
import { View, TextInput, TouchableOpacity, Modal, Platform } from "react-native"
import DateTimePicker from '@react-native-community/datetimepicker'
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { FormData } from "@/hooks/useCreatePostForm"
import { parseDate, createDateChangeHandler } from "@/utils/dateHelpers"

interface AuditionSectionProps {
  formData: FormData
  updateFormData: (field: string, value: string) => void
  showAuditionDatePicker: boolean
  setShowAuditionDatePicker: (show: boolean) => void
  showAuditionResultPicker: boolean
  setShowAuditionResultPicker: (show: boolean) => void
}

export const AuditionSection: React.FC<AuditionSectionProps> = ({
  formData,
  updateFormData,
  showAuditionDatePicker,
  setShowAuditionDatePicker,
  showAuditionResultPicker,
  setShowAuditionResultPicker,
}) => {
  const { themed, theme: { colors } } = useAppTheme()

  const handleAuditionDateChange = createDateChangeHandler(
    setShowAuditionDatePicker,
    updateFormData,
    "auditionDate",
    Platform.OS as 'ios' | 'android'
  )

  const handleAuditionResultChange = createDateChangeHandler(
    setShowAuditionResultPicker,
    updateFormData,
    "auditionResultDate",
    Platform.OS as 'ios' | 'android'
  )

  return (
    <View style={themed($formSection)}>
      <Text text="🎯 오디션 정보" style={themed($sectionHeader)} />
      
      <View style={themed($inputSection)}>
        <Text text="오디션 일정" style={themed($label) as any} />
        <TouchableOpacity
          style={themed($dateInput)}
          onPress={() => setShowAuditionDatePicker(true)}
          accessibilityRole="button"
          accessibilityLabel="오디션 일정 선택"
        >
          <Text 
            text={formData.auditionDate || "날짜 선택"} 
            style={[themed($dateInputText), !formData.auditionDate && themed($placeholderText)]} 
          />
          <Text text="📅" style={themed($dateIcon)} />
        </TouchableOpacity>
        
        {showAuditionDatePicker && Platform.OS === 'ios' && (
          <Modal transparent animationType="slide">
            <View style={themed($dateModalOverlay)}>
              <View style={themed($dateModalContainer)}>
                <View style={themed($dateModalHeader)}>
                  <TouchableOpacity onPress={() => setShowAuditionDatePicker(false)}>
                    <Text text="취소" style={themed($dateModalCancelText)} />
                  </TouchableOpacity>
                  <Text text="오디션 일정 선택" style={themed($dateModalTitle)} />
                  <TouchableOpacity onPress={() => setShowAuditionDatePicker(false)}>
                    <Text text="완료" style={themed($dateModalDoneText)} />
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={parseDate(formData.auditionDate)}
                  mode="date"
                  display="spinner"
                  onChange={handleAuditionDateChange}
                  minimumDate={new Date()}
                  style={themed($datePicker)}
                />
              </View>
            </View>
          </Modal>
        )}
        
        {showAuditionDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={parseDate(formData.auditionDate)}
            mode="date"
            display="default"
            onChange={handleAuditionDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>
      
      <View style={themed($inputSection)}>
        <Text text="결과 발표일" style={themed($label) as any} />
        <TouchableOpacity
          style={themed($dateInput)}
          onPress={() => setShowAuditionResultPicker(true)}
          accessibilityRole="button"
          accessibilityLabel="결과 발표일 선택"
        >
          <Text 
            text={formData.auditionResultDate || "날짜 선택"} 
            style={[themed($dateInputText), !formData.auditionResultDate && themed($placeholderText)]} 
          />
          <Text text="📅" style={themed($dateIcon)} />
        </TouchableOpacity>
        
        {showAuditionResultPicker && Platform.OS === 'ios' && (
          <Modal transparent animationType="slide">
            <View style={themed($dateModalOverlay)}>
              <View style={themed($dateModalContainer)}>
                <View style={themed($dateModalHeader)}>
                  <TouchableOpacity onPress={() => setShowAuditionResultPicker(false)}>
                    <Text text="취소" style={themed($dateModalCancelText)} />
                  </TouchableOpacity>
                  <Text text="결과 발표일 선택" style={themed($dateModalTitle)} />
                  <TouchableOpacity onPress={() => setShowAuditionResultPicker(false)}>
                    <Text text="완료" style={themed($dateModalDoneText)} />
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={parseDate(formData.auditionResultDate)}
                  mode="date"
                  display="spinner"
                  onChange={handleAuditionResultChange}
                  minimumDate={new Date()}
                  style={themed($datePicker)}
                />
              </View>
            </View>
          </Modal>
        )}
        
        {showAuditionResultPicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={parseDate(formData.auditionResultDate)}
            mode="date"
            display="default"
            onChange={handleAuditionResultChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      <View style={themed($inputSection)}>
        <Text text="오디션 장소" style={themed($label) as any} />
        <TextInput
          style={themed($textInput)}
          value={formData.auditionLocation}
          onChangeText={(text) => updateFormData("auditionLocation", text)}
          placeholder="예: 대학로 소극장"
          placeholderTextColor={colors.textDim}
        />
      </View>

      <View style={themed($inputSection)}>
        <Text text="준비사항" style={themed($label) as any} />
        <TextInput
          style={themed($textInput)}
          value={formData.auditionRequirements}
          onChangeText={(text) => updateFormData("auditionRequirements", text)}
          placeholder="예: 자기소개, 자유곡 1분"
          placeholderTextColor={colors.textDim}
        />
        <Text text="💡 쉼표로 구분해서 입력해주세요" style={themed($hintText)} />
      </View>
    </View>
  )
}

// Styles
const $formSection = ({ spacing }) => ({
  marginBottom: spacing?.xl || 24,
})

const $sectionHeader = ({ colors, spacing, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.md || 12,
})

const $inputSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
  marginTop: spacing?.xs || 4,
  flex: 1,
})

const $label = ({ colors, spacing, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.medium,
  fontSize: 16,
  marginBottom: spacing.xs,
})

const $textInput = ({ colors, spacing, typography }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  padding: spacing?.md || 12,
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.text,
  backgroundColor: colors.background,
  minHeight: 44,
  flex: 1,
  marginBottom: spacing?.xs || 4,
})

const $hintText = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: spacing?.xs || 4,
  fontStyle: "italic" as const,
  lineHeight: 16,
})

const $dateInput = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  paddingHorizontal: spacing?.md || 12,
  paddingVertical: spacing?.md || 12,
  backgroundColor: colors.background,
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  minHeight: 44,
})

const $dateInputText = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.text,
  flex: 1,
})

const $placeholderText = ({ colors }) => ({
  color: colors.textDim,
})

const $dateIcon = {
  fontSize: 16,
  marginLeft: 8,
}

const $dateModalOverlay = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "flex-end" as const,
})

const $dateModalContainer = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingBottom: spacing.xl,
})

const $dateModalHeader = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $dateModalTitle = ({ colors, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  color: colors.text,
})

const $dateModalCancelText = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
})

const $dateModalDoneText = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary500,
})

const $datePicker = () => ({
  height: 200,
})
