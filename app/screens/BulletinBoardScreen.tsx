import React, { useCallback, useState } from "react"
import { View, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { CompositeNavigationProp } from "@react-navigation/native"

import { AlertModal } from "@/components/AlertModal"
import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { PostCard } from "@/components/PostCard"
import { TabBar, OrganizationCard, EmptyState, LoadingState } from "@/components/BulletinBoard"
import { organizationService, testDataService } from "@/services/firestore"
import { useAppTheme } from "@/theme/context"
import { useAlert } from "@/hooks/useAlert"
import { usePostList } from "@/hooks/usePostList"
import { BulletinBoardStackParamList, AppStackParamList } from "@/navigators/types"
import { createComponentLogger } from "@/utils/logger"
import { translate } from "@/i18n"

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<BulletinBoardStackParamList>,
  NativeStackNavigationProp<AppStackParamList>
>

export const BulletinBoardScreen = () => {
  const navigation = useNavigation<NavigationProp>()
  const { themed } = useAppTheme()
  const { alertState, alert, hideAlert } = useAlert()
  const log = createComponentLogger('BulletinBoardScreen')
  
  const [activeTab, setActiveTab] = useState<'announcements' | 'organizations'>('announcements')
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null)
  
  const {
    organizations,
    loading,
    isOrganizer,
    getFilteredPosts,
  } = usePostList(selectedOrganizationId)

  const handlePostPress = useCallback((postId: string) => {
    navigation.navigate("PostDetail", { postId })
  }, [navigation])

  const handleCreatePost = useCallback(() => {
    log.debug('권한 체크 시작')
    
    if (!isOrganizer) {
      log.debug('권한 없음 - 알림 표시')
      alert("권한 없음", "게시글 작성은 관리자만 가능합니다.")
      return
    }
    
    log.debug('권한 확인됨 - 게시글 작성 페이지로 이동')
    navigation.navigate("CreatePost", { isEdit: false })
  }, [navigation, isOrganizer, alert, log])

  const handleOrganizationPress = useCallback((organizationId: string) => {
    log.debug('단체 선택:', organizationId)
    setSelectedOrganizationId(organizationId)
    setActiveTab('announcements')
  }, [log])

  const handleBackToAllPosts = useCallback(() => {
    setSelectedOrganizationId(null)
    setActiveTab('organizations')
  }, [])

  const handleTabChange = useCallback((tab: 'announcements' | 'organizations') => {
    setActiveTab(tab)
    if (tab === 'organizations') {
      organizationService.updateAllActivePostCounts()
    }
  }, [])

  const addTestData = async () => {
    try {
      await testDataService.addTestData()
      alert('성공', '테스트 데이터가 추가되었습니다!')
    } catch (error) {
      console.error('테스트 데이터 추가 실패:', error)
      alert('오류', '데이터 추가에 실패했습니다.')
    }
  }

  if (loading && getFilteredPosts.length === 0) {
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader 
          title={translate("bulletinBoard:title")}
          showBackButton={false}
        />
        <LoadingState />
      </Screen>
    )
  }

  const headerTitle = selectedOrganizationId ? 
    organizations.find(org => org.id === selectedOrganizationId)?.name || translate("bulletinBoard:tabs.organizations") : 
    translate("bulletinBoard:title")

  return (
    <Screen preset="fixed" safeAreaEdges={[]} contentContainerStyle={{ flex: 1 }}>
      <ScreenHeader 
        title={headerTitle}
        showBackButton={!!selectedOrganizationId}
        backButtonProps={{
          onPress: handleBackToAllPosts
        }}
      />
      <View style={themed($container)}>
        <View style={themed($contentContainer)}>
          {activeTab === 'announcements' ? (
            <FlatList
              data={getFilteredPosts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PostCard
                  post={item}
                  onPress={handlePostPress}
                />
              )}
              ListHeaderComponent={() => (
                <View>
                  {!selectedOrganizationId && (
                    <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
                  )}
                  
                  {isOrganizer && (
                    <View style={themed($createPostButtonContainer)}>
                      <Button
                        text="새 공고 작성"
                        onPress={handleCreatePost}
                        style={themed($createPostButton)}
                        LeftAccessory={(props) => (
                          <Icon icon="more" size={20} color={props.style.color} />
                        )}
                      />
                    </View>
                  )}
                </View>
              )}
              ListEmptyComponent={() => (
                <EmptyState
                  type="posts"
                  hasOrganizationFilter={!!selectedOrganizationId}
                  onExploreOrganizations={() => setActiveTab('organizations')}
                  onAddSampleData={addTestData}
                  showSampleData={__DEV__}
                />
              )}
              style={themed($flatListContainer)}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
              maxToRenderPerBatch={5}
              windowSize={5}
              initialNumToRender={3}
            />
          ) : (
            <FlatList
              data={organizations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <OrganizationCard
                  organization={item}
                  onPress={handleOrganizationPress}
                />
              )}
              ListHeaderComponent={() => (
                <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
              )}
              ListEmptyComponent={() => (
                <EmptyState type="organizations" />
              )}
              style={themed($flatListContainer)}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
              maxToRenderPerBatch={5}
              windowSize={5}
              initialNumToRender={3}
            />
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

const $container = ({ spacing }) => ({
  flex: 1,
  backgroundColor: "transparent",
  paddingHorizontal: spacing.lg,
})

const $contentContainer = () => ({
  flex: 1,
  minHeight: 500,
})

const $flatListContainer = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
  minHeight: 400,
})

const $createPostButtonContainer = ({ spacing }) => ({
  marginBottom: spacing?.md || 12,
})

const $createPostButton = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  paddingHorizontal: spacing?.md || 12,
  paddingVertical: spacing?.sm || 8,
})
