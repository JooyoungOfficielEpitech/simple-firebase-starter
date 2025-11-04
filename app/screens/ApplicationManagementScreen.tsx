import React from "react"
import { View } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"

import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { Text } from "@/components/Text"
import { AlertModal } from "@/components/AlertModal"
import { ApplicationCard, StatusFilterBar } from "@/components/ApplicationManagement"
import { useApplicationManagement } from "@/hooks/useApplicationManagement"
import { useAppTheme } from "@/theme/context"
import { useAlert } from "@/hooks/useAlert"
import { AppStackParamList } from "@/navigators/types"
import { applicationManagementStyles } from "./ApplicationManagementScreen.styles"

type NavigationProp = NativeStackNavigationProp<AppStackParamList>
type RoutePropType = RouteProp<AppStackParamList, "ApplicationManagement">

export const ApplicationManagementScreen = () => {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RoutePropType>()
  const { postId, postTitle } = route.params
  
  const { themed } = useAppTheme()
  const { alertState, hideAlert } = useAlert()
  const styles = applicationManagementStyles()

  const {
    applications,
    loading,
    selectedFilter,
    setSelectedFilter,
    filteredApplications,
    filterTabs,
    handleCall,
    handleOpenPortfolio,
    showApplicationOptions,
  } = useApplicationManagement({ postId })

  // Loading state
  if (loading && applications.length === 0) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader 
          title="지원서 확인"
          backButtonProps={{
            onPress: () => navigation.goBack()
          }}
        />
        <View style={themed(styles.$container)}>
          <View style={themed(styles.$loadingContainer)}>
            <View style={themed(styles.$loadingIconContainer)}>
              <Text text="📋" style={themed(styles.$loadingIcon)} />
            </View>
            <Text text="지원서를 불러오는 중..." style={themed(styles.$loadingText)} />
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={[]}>
      <ScreenHeader 
        title="지원서 확인"
        backButtonProps={{
          onPress: () => navigation.goBack()
        }}
      />
      <View style={themed(styles.$container)}>
        <View style={themed(styles.$content)}>
          {/* Post info */}
          <View style={themed(styles.$postInfo)}>
            <Text text={postTitle} style={themed(styles.$postTitle)} />
            <Text text={`총 ${applications.length}명의 지원자`} style={themed(styles.$statsText)} />
          </View>

          {/* Filter tabs */}
          <StatusFilterBar
            filterTabs={filterTabs}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />

          {/* Applications list */}
          {filteredApplications.length === 0 ? (
            <View style={themed(styles.$emptyContainer)}>
              <View style={themed(styles.$emptyIconContainer)}>
                <Text text="📝" style={themed(styles.$emptyIcon)} />
              </View>
              <Text text="아직 지원자가 없습니다." style={themed(styles.$emptyText)} />
              <Text text="지원자가 있으면 여기에 표시됩니다." style={themed(styles.$emptySubText)} />
            </View>
          ) : (
            <View style={themed(styles.$applicationsContainer)}>
              {filteredApplications.map(item => (
                <ApplicationCard
                  key={item.id}
                  application={item}
                  onPress={showApplicationOptions}
                  onCall={handleCall}
                  onOpenPortfolio={handleOpenPortfolio}
                />
              ))}
            </View>
          )}
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
