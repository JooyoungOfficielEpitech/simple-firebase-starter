import React from "react"
import { View, Modal, ScrollView, TouchableOpacity, Switch } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { AlertModal } from "@/components/AlertModal"
import { useAppTheme } from "@/theme/context"
import { useAlert } from "@/hooks/useAlert"
import { useCreatePostForm } from "@/hooks/useCreatePostForm"
import { BulletinBoardStackParamList } from "@/navigators/types"
import { POST_TEMPLATES } from "@/utils/postTemplates"

// Sub-components
import { ModeSelector } from "@/components/CreatePost/ModeSelector"
import { BasicInfoSection } from "@/components/CreatePost/BasicInfoSection"
import { RoleSection } from "@/components/CreatePost/RoleSection"
import { AuditionSection } from "@/components/CreatePost/AuditionSection"
import { BenefitsSection } from "@/components/CreatePost/BenefitsSection"
import { ContactSection } from "@/components/CreatePost/ContactSection"
import { ImageUpload } from "@/components/CreatePost/ImageUpload"

// Styles
import * as styles from "./CreatePostScreen.styles"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>
type RoutePropType = RouteProp<BulletinBoardStackParamList, "CreatePost">

export const CreatePostScreen = () => {
  useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RoutePropType>()
  const params = route.params || {}
  const postId = params.postId
  const isEdit = params.isEdit
  
  const appTheme = useAppTheme()
  const themed = appTheme.themed
  const colors = appTheme.theme.colors

  const alertHook = useAlert()

  const formHook = useCreatePostForm({
    postId,
    isEdit,
    onSuccess: (message) => alertHook.alert("성공", message),
    onError: (title, message) => alertHook.alert(title, message),
    onNavigateBack: () => navigation.goBack(),
  })

  // Loading state
  if (!formHook.userProfile) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader title="게시글 작성" />
        <View style={themed(styles.$container)}>
          <View style={themed(styles.$centerContainer) as any}>
            <Text text="사용자 정보를 불러오는 중..." style={themed(styles.$messageText) as any} />
          </View>
        </View>
      </Screen>
    )
  }

  // Non-organizer state
  if (formHook.userProfile.userType !== "organizer") {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader title="게시글 작성" />
        <View style={themed(styles.$container)}>
          <View style={themed(styles.$centerContainer) as any}>
            <Text text="단체 운영자만 게시글을 작성할 수 있습니다." style={themed(styles.$messageText) as any} />
            <Text text={"현재 사용자 타입: " + formHook.userProfile.userType} style={themed(styles.$debugInfoText) as any} />
            <Button
              text="설정에서 운영자로 전환"
              onPress={() => navigation.navigate("Settings" as any)}
              style={themed(styles.$convertButton)}
            />
          </View>
        </View>
      </Screen>
    )
  }

  const completeness = formHook.calculateCompleteness()

  return (
    <Screen preset="scroll" safeAreaEdges={[]}>
      <ScreenHeader title={isEdit ? "게시글 수정" : "게시글 작성"} />
      <View style={themed(styles.$container)}>
        <ModeSelector 
          postMode={formHook.postMode} 
          onModeChange={formHook.setPostMode} 
          isEdit={isEdit} 
        />

        {formHook.postMode === 'text' && (
          <View style={themed(styles.$templateSection)}>
            <Text text="⚡ 빠른 작성" style={themed(styles.$sectionHeader)} />
            <TouchableOpacity 
              style={themed(styles.$templateButton)}
              onPress={() => formHook.setShowTemplateModal(true)}
              activeOpacity={0.7}
            >
              <View style={themed(styles.$templateButtonContent)}>
                <Text text="📝 템플릿 선택하기" style={themed(styles.$templateButtonText)} />
                <Text text=">" style={themed(styles.$templateButtonArrow)} />
              </View>
              <Text text="미리 만들어진 양식으로 쉽게 작성하세요" style={themed(styles.$templateButtonSubText)} />
            </TouchableOpacity>
            
            {formHook.selectedTemplate && (
              <View style={themed(styles.$selectedTemplateIndicator)}>
                <Text text={formHook.selectedTemplate.icon + " " + formHook.selectedTemplate.name + " 적용됨"} style={themed(styles.$selectedTemplateText)} />
                <TouchableOpacity onPress={() => formHook.setSelectedTemplate(null)}>
                  <Text text="✖" style={themed(styles.$removeTemplateButton)} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {formHook.postMode === 'images' && (
          <ImageUpload
            selectedImages={formHook.selectedImages}
            uploadingImages={formHook.uploadingImages}
            onPickImages={formHook.pickImages}
            onRemoveImage={formHook.removeImage}
          />
        )}

        <View style={themed(styles.$progressSection)}>
          <View style={themed(styles.$progressHeader)}>
            <Text text={"📊 작성 진행률: " + completeness + "%"} style={themed(styles.$progressTitle)} />
          </View>
          
          <View style={themed(styles.$progressBarContainer)}>
            <View
              style={[
                themed(styles.$progressBar),
                { width: `${completeness}%` }
              ]}
            />
          </View>
          
          <View style={themed(styles.$progressTips)}>
            {completeness < 100 && (
              <Text text="💡 모든 필수 정보를 입력하면 더 많은 지원자를 모집할 수 있어요!" style={themed(styles.$progressTipText)} />
            )}
            {completeness >= 100 && (
              <Text text="✨ 완벽해요! 이제 게시글을 작성할 준비가 되었습니다." style={themed(styles.$progressCompletedText)} />
            )}
          </View>
        </View>

        <BasicInfoSection
          postMode={formHook.postMode}
          formData={formHook.formData}
          updateFormData={formHook.updateFormData}
          showDeadlinePicker={formHook.showDeadlinePicker}
          setShowDeadlinePicker={formHook.setShowDeadlinePicker}
        />

        {formHook.postMode === 'text' && (
          <RoleSection formData={formHook.formData} setFormData={formHook.setFormData} />
        )}

        {formHook.postMode === 'text' && (
          <AuditionSection
            formData={formHook.formData}
            updateFormData={formHook.updateFormData}
            showAuditionDatePicker={formHook.showAuditionDatePicker}
            setShowAuditionDatePicker={formHook.setShowAuditionDatePicker}
            showAuditionResultPicker={formHook.showAuditionResultPicker}
            setShowAuditionResultPicker={formHook.setShowAuditionResultPicker}
          />
        )}

        {formHook.postMode === 'text' && (
          <BenefitsSection formData={formHook.formData} updateFormData={formHook.updateFormData} />
        )}

        <ContactSection
          postMode={formHook.postMode}
          formData={formHook.formData}
          updateFormData={formHook.updateFormData}
        />

        <View style={themed(styles.$formSection)}>
          <Text text="⚙️ 모집 설정" style={themed(styles.$sectionHeader)} />
          
          <View style={themed(styles.$inputSection)}>
            <View style={themed(styles.$switchContainer)}>
              <View style={themed(styles.$switchLabelContainer)}>
                <Text text="모집 상태" style={themed(styles.$label) as any} />
                <Text 
                  text={formHook.formData.status === "active" ? "🟢 모집중" : "🔴 모집마감"} 
                  style={themed(styles.$statusText)} 
                />
              </View>
              <Switch
                value={formHook.formData.status === "active"}
                onValueChange={(value) => formHook.updateFormData("status", value ? "active" : "closed")}
                trackColor={{ false: colors.palette.neutral300, true: colors.palette.primary200 }}
                thumbColor={formHook.formData.status === "active" ? colors.palette.primary500 : colors.palette.neutral400}
                ios_backgroundColor={colors.palette.neutral300}
              />
            </View>
            <Text 
              text={formHook.formData.status === "active" ? "💡 지원자들이 이 게시글을 볼 수 있습니다" : "⏸️ 지원을 받지 않는 상태입니다"} 
              style={themed(styles.$hintText)} 
            />
          </View>
        </View>

        <View style={themed(styles.$saveSection)}>
          <Button
            text={isEdit ? "수정 완료" : "게시글 작성"}
            onPress={formHook.handleSave}
            isLoading={formHook.loading}
            style={themed(styles.$saveButton)}
          />
        </View>
      </View>

      <Modal
        visible={formHook.showTemplateModal}
        transparent
        animationType="slide"
        onRequestClose={() => formHook.setShowTemplateModal(false)}
      >
        <View style={themed(styles.$modalOverlay)}>
          <TouchableOpacity 
            style={themed(styles.$modalContainer)}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={themed(styles.$modalHeader)}>
              <Text text="📝 템플릿 선택" style={themed(styles.$modalTitle)} />
              <TouchableOpacity
                onPress={() => formHook.setShowTemplateModal(false)}
                style={themed(styles.$modalCloseButton)}
              >
                <Text text="✖" style={themed(styles.$modalCloseText)} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={themed(styles.$templateScrollView)} showsVerticalScrollIndicator={false}>
              {POST_TEMPLATES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={themed(styles.$templateItem)}
                  onPress={() => formHook.applyTemplate(item)}
                  activeOpacity={0.7}
                >
                  <View style={themed(styles.$templateItemHeader)}>
                    <Text text={item.icon} style={themed(styles.$templateIcon)} />
                    <View style={themed(styles.$templateInfo)}>
                      <Text text={item.name} style={themed(styles.$templateName)} />
                      <Text text={item.category} style={themed(styles.$templateCategory)} />
                    </View>
                  </View>
                  <Text 
                    text={item.template.description ? item.template.description.substring(0, 100) + "..." : "템플릿 미리보기"} 
                    style={themed(styles.$templatePreview)} 
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </View>
      </Modal>

      <AlertModal
        visible={alertHook.alertState.visible}
        title={alertHook.alertState.title}
        message={alertHook.alertState.message}
        buttons={alertHook.alertState.buttons}
        onDismiss={alertHook.hideAlert}
        dismissable={alertHook.alertState.dismissable}
      />
    </Screen>
  )
}
