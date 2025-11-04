import React from "react"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

import { Button } from "@/components/Button"
import { AlertModal } from "@/components/AlertModal"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { BasicInfoSection, SocialMediaSection, DetailedInfoSection } from "@/components/organization"
import { useOrganizationForm } from "@/hooks/useOrganizationForm"
import { useAppTheme } from "@/theme/context"
import { useAlert } from "@/hooks/useAlert"
import { AppStackParamList } from "@/navigators/types"
import * as styles from "./CreateOrganizationScreen.styles"

type NavigationProp = NativeStackNavigationProp<AppStackParamList, "CreateOrganization">
type RouteProp = import("@react-navigation/native").RouteProp<AppStackParamList, "CreateOrganization">

export const CreateOrganizationScreen = () => {
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProp>()
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()

  const { alertState, alert, hideAlert } = useAlert()

  const { organizationId, isEdit = false, isOrganizerConversion = false } = route.params || {}

  const {
    formData,
    loading,
    updateFormData,
    addArrayItem,
    removeArrayItem,
    handleSubmit: submitForm,
  } = useOrganizationForm({
    organizationId,
    isEdit,
    isOrganizerConversion,
    onSuccess: () => {
      const successMessage = isEdit 
        ? "단체 정보가 수정되었습니다."
        : isOrganizerConversion 
          ? "운영자 계정으로 전환되고 단체가 등록되었습니다."
          : "단체가 등록되었습니다."
      alert("성공", successMessage)
      navigation.goBack()
    },
    onError: alert,
  })

  const handleSubmit = async () => {
    await submitForm()
  }

  const getTitle = () => {
    if (isEdit) return "단체 수정"
    if (isOrganizerConversion) return "운영자 계정 전환"
    return "단체 등록"
  }

  const getButtonText = () => {
    if (isEdit) return "수정하기"
    if (isOrganizerConversion) return "운영자로 전환하기"
    return "등록하기"
  }

  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader title={getTitle()} />
        <View style={[themed(styles.$container), { paddingTop: top + (spacing?.lg || 16) }]}>
          <View style={themed(styles.$loadingContainer)}>
            <Text text="단체 정보를 불러오는 중..." style={themed(styles.$loadingText)} />
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={[]}>
      <ScreenHeader title={getTitle()} />
      <View style={[themed(styles.$container), { paddingTop: top + (spacing?.lg || 16) }]}>
        <View style={themed(styles.$form)}>
          <BasicInfoSection 
            formData={formData} 
            onUpdate={updateFormData} 
          />

          <SocialMediaSection 
            formData={formData} 
            onUpdate={updateFormData} 
          />

          <DetailedInfoSection
            formData={formData}
            onUpdate={updateFormData}
            onAddArrayItem={addArrayItem}
            onRemoveArrayItem={removeArrayItem}
          />

          <Button
            text={getButtonText()}
            onPress={handleSubmit}
            style={themed(styles.$submitButton)}
          />
        </View>
      </View>
      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
        dismissable={alertState.dismissable}
      />
    </Screen>
  )
}
