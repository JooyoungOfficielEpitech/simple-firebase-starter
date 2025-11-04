import React from "react"
import { View, TextInput, TouchableOpacity, Modal, Platform } from "react-native"
import DateTimePicker from '@react-native-community/datetimepicker'
import { Text } from "@/components/Text"
import { Dropdown } from "@/components/Dropdown"
import { useAppTheme } from "@/theme/context"
import { PostType } from "@/types/post"
import { FormData } from "@/hooks/useCreatePostForm"
import { parseDate, createDateChangeHandler } from "@/utils/dateHelpers"

interface BasicInfoSectionProps {
  postMode: PostType
  formData: FormData
  updateFormData: (field: string, value: string | boolean) => void
  showDeadlinePicker: boolean
  setShowDeadlinePicker: (show: boolean) => void
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  postMode,
  formData,
  updateFormData,
  showDeadlinePicker,
  setShowDeadlinePicker,
}) => {
  const { themed, theme: { colors } } = useAppTheme()

  const handleDeadlineChange = createDateChangeHandler(
    setShowDeadlinePicker,
    updateFormData,
    "deadline",
    Platform.OS as 'ios' | 'android'
  )

  return (
    <View style={themed($formSection)}>
      <Text text="📝 기본 정보" style={themed($sectionHeader)} />
      
      {/* 제목 */}
      <View style={themed($inputSection)}>
        <View style={themed($labelRow)}>
          <Text text="제목" style={themed($label) as any} />
          <Text text="*" style={themed($required)} />
        </View>
        <TextInput
          style={themed($textInput)}
          value={formData.title}
          onChangeText={(text) => updateFormData("title", text)}
          placeholder={postMode === 'images' ? "예: 햄릿 주연 모집" : "예: [테스트] 레미제라블 양상블 모집"}
          placeholderTextColor={colors.textDim}
          accessibilityLabel="모집공고 제목"
          accessibilityHint="모집공고의 제목을 입력하세요"
        />
        <Text text="💡 구체적이고 매력적인 제목을 작성해주세요" style={themed($hintText)} />
      </View>
      
      {/* 작품명 - Text 모드에서만 필수 */}
      {postMode === 'text' && (
        <View style={themed($inputSection)}>
          <View style={themed($labelRow)}>
            <Text text="작품명" style={themed($label) as any} />
            <Text text="*" style={themed($required)} />
          </View>
          <TextInput
            style={themed($textInput)}
            value={formData.production}
            onChangeText={(text) => updateFormData("production", text)}
            placeholder="햄릿"
            placeholderTextColor={colors.textDim}
            accessibilityLabel="작품명"
          />
        </View>
      )}
      
      {/* Images 모드에서는 선택적 */}
      {postMode === 'images' && (
        <View style={themed($inputSection)}>
          <Text text="작품명 (선택사항)" style={themed($label) as any} />
          <TextInput
            style={themed($textInput)}
            value={formData.production}
            onChangeText={(text) => updateFormData("production", text)}
            placeholder="작품명을 입력하세요"
            placeholderTextColor={colors.textDim}
            accessibilityLabel="작품명"
          />
        </View>
      )}
      
      {/* 장르 */}
      <View style={themed($inputSection)}>
        <Text text="장르" style={themed($label) as any} />
        <Dropdown
          value={formData.genre}
          options={[
            { label: "연극", value: "연극" },
            { label: "뮤지컬", value: "뮤지컬" },
            { label: "창작", value: "창작" },
            { label: "기타", value: "기타" }
          ]}
          placeholder="장르를 선택하세요"
          onSelect={(value) => updateFormData("genre", value as any)}
        />
      </View>

      {/* 단체명 - read only */}
      <View style={themed($inputSection)}>
        <Text text="단체명" style={themed($label) as any} />
        <View style={themed($readOnlyContainer)}>
          <Text text={formData.organizationName || "단체명 없음"} style={themed($readOnlyText) as any} />
          <Text text="(소속 단체로 자동 설정됩니다)" style={themed($helpText) as any} />
        </View>
      </View>

      {/* 추가 기본 정보 - Text 모드에서만 */}
      {postMode === 'text' && (
        <>
          {/* 연습 일정 */}
          <View style={themed($inputSection)}>
            <Text text="연습 일정 *" style={themed($label) as any} />
            <TextInput
              style={themed($textInput)}
              value={formData.rehearsalSchedule}
              onChangeText={(text) => updateFormData("rehearsalSchedule", text)}
              placeholder="예: 매주 일요일 오후 2시-6시"
              placeholderTextColor={colors.textDim}
            />
          </View>

          {/* 장소 */}
          <View style={themed($inputSection)}>
            <View style={themed($labelRow)}>
              <Text text="장소" style={themed($label) as any} />
              <Text text="*" style={themed($required)} />
            </View>
            <TextInput
              style={themed($textInput)}
              value={formData.location}
              onChangeText={(text) => updateFormData("location", text)}
              placeholder="예: 대학로 소극장"
              placeholderTextColor={colors.textDim}
            />
          </View>

          {/* 마감일 */}
          <View style={themed($inputSection)}>
            <Text text="모집 마감일" style={themed($label) as any} />
            <TouchableOpacity
              style={themed($dateInput)}
              onPress={() => setShowDeadlinePicker(true)}
              accessibilityRole="button"
              accessibilityLabel="마감일 선택"
              accessibilityHint="터치하면 날짜 선택기가 열립니다"
            >
              <Text 
                text={formData.deadline || "날짜를 선택해주세요"} 
                style={[themed($dateInputText), !formData.deadline && themed($placeholderText)]} 
              />
              <Text text="📅" style={themed($dateIcon)} />
            </TouchableOpacity>
            
            {/* 마감일 선택 모달 */}
            {showDeadlinePicker && Platform.OS === 'ios' && (
              <Modal transparent animationType="slide">
                <View style={themed($dateModalOverlay)}>
                  <View style={themed($dateModalContainer)}>
                    <View style={themed($dateModalHeader)}>
                      <TouchableOpacity onPress={() => setShowDeadlinePicker(false)}>
                        <Text text="취소" style={themed($dateModalCancelText)} />
                      </TouchableOpacity>
                      <Text text="마감일 선택" style={themed($dateModalTitle)} />
                      <TouchableOpacity onPress={() => setShowDeadlinePicker(false)}>
                        <Text text="완료" style={themed($dateModalDoneText)} />
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={parseDate(formData.deadline)}
                      mode="date"
                      display="spinner"
                      onChange={handleDeadlineChange}
                      minimumDate={new Date()}
                      style={themed($datePicker)}
                    />
                  </View>
                </View>
              </Modal>
            )}
            
            {showDeadlinePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={parseDate(formData.deadline)}
                mode="date"
                display="default"
                onChange={handleDeadlineChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        </>
      )}
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

const $labelRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

const $required = ({ colors, typography }) => ({
  color: colors.palette.angry500,
  marginLeft: 2,
  fontSize: 14,
  fontFamily: typography.primary.normal,
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

const $readOnlyContainer = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  padding: spacing.md,
  backgroundColor: colors.background,
  opacity: 0.7,
})

const $readOnlyText = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
  fontWeight: "500" as const,
})

const $helpText = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: 4,
  fontStyle: "italic" as const,
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
