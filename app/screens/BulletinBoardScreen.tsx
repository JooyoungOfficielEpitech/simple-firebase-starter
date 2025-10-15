import React, { useEffect, useState, useCallback, useMemo } from "react"
import { View, TouchableOpacity, FlatList } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

import { AlertModal } from "@/components/AlertModal"
import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { ScreenHeader } from "@/components/ScreenHeader"
import { PostCard } from "@/components/PostCard"
import { postService, userService, organizationService, testDataService } from "@/services/firestore"
import auth from "@react-native-firebase/auth"
import { useAppTheme } from "@/theme/context"
import { useAlert } from "@/hooks/useAlert"
import { Post } from "@/types/post"
import { UserProfile } from "@/types/user"
import { Organization } from "@/types/organization"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"
import { createComponentLogger } from "@/utils/logger"
import { translate } from "@/i18n"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>

export const BulletinBoardScreen = () => {
  // All hooks must be called at the top level, unconditionally
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()
  const { alertState, alert, hideAlert } = useAlert()
  
  // State hooks - all called unconditionally
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'announcements' | 'organizations'>('announcements')
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null)
  
  // Create component-specific logger
  const log = createComponentLogger('BulletinBoardScreen')
  

  useEffect(() => {
    log.debug('useEffect 시작')
    
    // Firebase 인증 상태 확인
    const currentUser = auth().currentUser
    log.authInfo(currentUser)
    
    // 사용자 프로필 실시간 구독
    let unsubscribeUserProfile: (() => void) | null = null
    
    if (currentUser) {
      console.log('👤 [BulletinBoardScreen] 사용자 프로필 실시간 구독 시작')
      unsubscribeUserProfile = userService.subscribeToUserProfile(currentUser.uid, (profile) => {
        console.log('👤 [BulletinBoardScreen] 사용자 프로필 업데이트됨:', profile ? { userType: profile.userType, uid: profile.uid, email: profile.email } : null)
        setUserProfile(profile)
      })
    } else {
      console.log('👤 [BulletinBoardScreen] 로그인되지 않아 프로필 구독 스킵')
      setUserProfile(null)
    }

    // 게시글 실시간 구독 (모든 게시글)
    console.log('📱 [BulletinBoardScreen] 게시글 구독 시작')
    const unsubscribePosts = postService.subscribeToActivePosts((posts) => {
      console.log('📱 [BulletinBoardScreen] 게시글 콜백 호출됨')
      console.log(`📱 [BulletinBoardScreen] 받은 게시글 수: ${posts.length}`)
      console.log('📱 [BulletinBoardScreen] 받은 게시글:', posts.map(p => ({ id: p.id, title: p.title, status: p.status })))
      
      setPosts(posts)
      setLoading(false)
      setError(null)
      
      console.log(`📱 [BulletinBoardScreen] 상태 업데이트 완료 - posts: ${posts.length}개, loading: false`)
    })

    // 단체 목록 실시간 구독
    console.log('🏢 [BulletinBoardScreen] 단체 목록 구독 시작')
    const unsubscribeOrganizations = organizationService.subscribeToOrganizations((organizations) => {
      console.log(`🏢 [BulletinBoardScreen] 받은 단체 수: ${organizations.length}`)
      setOrganizations(organizations)
    })

    return () => {
      unsubscribePosts()
      unsubscribeOrganizations()
      if (unsubscribeUserProfile) {
        unsubscribeUserProfile()
      }
    }
  }, [])

  // 선택된 단체에 따른 게시글 필터링
  useEffect(() => {
    let unsubscribeFiltered: (() => void) | null = null
    
    if (selectedOrganizationId) {
      console.log(`🔍 [BulletinBoardScreen] 단체별 필터링 시작: ${selectedOrganizationId}`)
      unsubscribeFiltered = postService.subscribeToOrganizationPosts(selectedOrganizationId, (filteredPosts) => {
        console.log(`🔍 [BulletinBoardScreen] 단체별 게시글 받음: ${filteredPosts.length}개`)
        setFilteredPosts(filteredPosts)
      })
    } else {
      console.log('🔍 [BulletinBoardScreen] 전체 게시글 모드')
      setFilteredPosts([])
    }

    return () => {
      if (unsubscribeFiltered) {
        unsubscribeFiltered()
      }
    }
  }, [selectedOrganizationId])

  const handlePostPress = useCallback((postId: string) => {
    navigation.navigate("PostDetail", { postId })
  }, [navigation])

  const handleCreatePost = useCallback(() => {
    // 관리자 권한 체크 디버깅
    console.log('🔐 [CreatePost] 권한 체크 시작')
    console.log('🔐 [CreatePost] userProfile:', userProfile)
    console.log('🔐 [CreatePost] userProfile?.userType:', userProfile?.userType)
    console.log('🔐 [CreatePost] isOrganizer:', isOrganizer)
    
    if (!isOrganizer) {
      console.log('❌ [CreatePost] 권한 없음 - 알림 표시')
      alert("권한 없음", "게시글 작성은 관리자만 가능합니다.")
      return
    }
    
    console.log('✅ [CreatePost] 권한 확인됨 - 게시글 작성 페이지로 이동')
    navigation.navigate("CreatePost", { isEdit: false })
  }, [navigation, userProfile?.userType])

  const handleOrganizationPress = useCallback((organizationId: string) => {
    console.log('🏢 [BulletinBoardScreen] 단체 선택:', {
      organizationId,
      currentUserId: userProfile?.uid
    })
    
    setSelectedOrganizationId(organizationId)
    setActiveTab('announcements') // 단체 선택 후 공고 탭으로 이동
  }, [userProfile?.uid])

  const getFilteredPosts = useMemo(() => {
    let result;
    if (selectedOrganizationId) {
      result = filteredPosts
    } else {
      result = posts
    }
    
    console.log('📄 [getFilteredPosts] result length:', result.length);
    return result;
  }, [selectedOrganizationId, filteredPosts, posts])

  const handleBackToAllPosts = useCallback(() => {
    setSelectedOrganizationId(null)
    setActiveTab('organizations') // 단체 목록으로 돌아가기
  }, [])


  const isOrganizer = useMemo(() => userProfile?.userType === "organizer", [userProfile?.userType])


  // 테스트 데이터 추가 함수
  const addTestData = async () => {
    try {
      await testDataService.addTestData()






      alert('성공', '테스트 데이터가 추가되었습니다!')
    } catch (error) {
      console.error('❌ [BulletinBoardScreen] 테스트 데이터 추가 실패:', error)
      alert('오류', '데이터 추가에 실패했습니다.')
    }
  }
  
  // 렌더링 상태 디버그
  // 해결: 데이터 상태 상세 디버깅
  console.log('🔴 [BulletinBoardScreen] === 렌더링 상태 체크 ===');
  console.log('📊 [DATA] loading:', loading, '| posts:', posts.length, '| filteredPosts:', filteredPosts.length, '| getFilteredPosts:', getFilteredPosts.length);
  console.log('🎯 [TAB] activeTab:', activeTab, '| selectedOrgId:', selectedOrganizationId);
  console.log('👤 [USER] userProfile:', userProfile ? `${userProfile.userType} (${userProfile.uid})` : 'null', '| isOrganizer:', isOrganizer);
  console.log('❌ [ERROR]', error);
  
  // 해결: 데이터 내용 체크
  if (posts.length > 0) {
    console.log('📄 [POSTS SAMPLE]', posts.slice(0, 2).map(p => ({ id: p.id, title: p.title, status: p.status })));
  }
  if (organizations.length > 0) {
    console.log('🏢 [ORGS SAMPLE]', organizations.slice(0, 2).map(o => ({ id: o.id, name: o.name })));
  }
  
  // 권한 상태 상세 디버그
  console.log('🔐 [BulletinBoardScreen] 권한 상태 상세:', {
    userProfileExists: !!userProfile,
    userType: userProfile?.userType,
    userTypeCheck: userProfile?.userType === "organizer",
    isOrganizerResult: isOrganizer,
    currentUser: auth().currentUser ? { uid: auth().currentUser?.uid, email: auth().currentUser?.email } : null
  })
  
  console.log('📏 [BulletinBoardScreen] 스타일 디버그:', {
    top,
    spacingLg: spacing?.lg || 16,
    containerHeight: '확인 필요',
    scrollViewHeight: '확인 필요'
  })

  if (loading && posts.length === 0) {
    console.log('⏳ [BulletinBoardScreen] 로딩 화면 렌더링')
    return (
      <Screen preset="fixed" safeAreaEdges={[]}>
        <ScreenHeader 
          title={translate("bulletinBoard:title")}
          showBackButton={false}
        />
        <View style={themed($container)}>
          <View style={themed($loadingContainer)}>
            <View style={themed($loadingIconContainer)}>
              <Text text="🎭" style={themed($loadingIcon)} />
            </View>
            <Text text={translate("bulletinBoard:loading")} style={themed($loadingText)} />
          </View>
        </View>
      </Screen>
    )
  }

  const headerTitle = selectedOrganizationId ? 
    organizations.find(org => org.id === selectedOrganizationId)?.name || translate("bulletinBoard:tabs.organizations") : 
    translate("bulletinBoard:title")

  // 알림 구독은 ScreenHeader에서 처리하므로 여기서는 제거

  // 알림 아이콘은 ScreenHeader에서 기본 제공되므로 커스텀 rightComponent는 불필요

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
        {/* 해결: 렌더링 디버깅 */}
        {(() => {
          console.log('🔵 [RENDER] activeTab:', activeTab, '| posts:', getFilteredPosts.length, '| orgs:', organizations.length)
          console.log('🔵 [RENDER] 조건:', 'activeTab === announcements:', activeTab === 'announcements')
          return null
        })()}
        
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
                {/* 탭 메뉴 (단체가 선택되지 않았을 때만 표시) */}
                {!selectedOrganizationId && (
                  <View style={themed($tabContainer)}>
                    <TouchableOpacity
                      style={themed(activeTab === 'announcements' ? $activeTabButton : $tabButton)}
                      onPress={() => setActiveTab('announcements')}
                    >
                      <Text 
                        text={translate("bulletinBoard:tabs.announcements")} 
                        style={themed(activeTab === 'announcements' ? $activeTabText : $tabText)} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={themed(activeTab === 'announcements' ? $tabButton : $activeTabButton)}
                      onPress={() => {
                        setActiveTab('organizations')
                        organizationService.updateAllActivePostCounts()
                      }}
                    >
                      <Text 
                        text={translate("bulletinBoard:tabs.organizations")} 
                        style={themed(activeTab === 'announcements' ? $tabText : $activeTabText)} 
                      />
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* 게시글 작성 버튼 */}
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
              <View style={themed($emptyStateContainer)}>
                <View style={themed($emptyIconContainer)}>
                  <Text text="🎭" style={themed($emptyIcon)} />
                </View>
                <Text text={translate("bulletinBoard:empty.posts.title")} style={themed($emptyTitle)} />
                <Text 
                  text={selectedOrganizationId 
                    ? translate("bulletinBoard:empty.posts.organizationDescription")
                    : translate("bulletinBoard:empty.posts.description")} 
                  style={themed($emptyDescription)} 
                />
                
                <View style={themed($emptyActions)}>
                  {!selectedOrganizationId && (
                    <Button
                      text={translate("bulletinBoard:actions.exploreOrganizations")}
                      style={themed($secondaryEmptyButton)}
                      textStyle={themed($secondaryEmptyButtonText)}
                      onPress={() => setActiveTab('organizations')}
                    />
                  )}
                  
                  {__DEV__ && (
                    <Button
                      text={translate("bulletinBoard:actions.addSampleData")}
                      style={themed($sampleDataButton)}
                      textStyle={themed($sampleDataButtonText)}
                      onPress={addTestData}
                    />
                  )}
                </View>
              </View>
              )}
              style={themed($flatListContainer)}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false} // 해결: 렌더링 문제 방지
              maxToRenderPerBatch={5}
              windowSize={5}
              initialNumToRender={3}
            />
          ) : (
            <FlatList
              data={organizations}
              keyExtractor={(item) => item.id}
              renderItem={({ item: organization }) => (
              <TouchableOpacity
                style={themed($organizationCard)}
                onPress={() => handleOrganizationPress(organization.id)}
              >
                <View style={themed($organizationHeader)}>
                  <Text preset="subheading" text={organization.name} style={themed($organizationName)} />
                  {organization.isVerified && (
                    <View style={themed($verifiedBadge)}>
                      <Text text={translate("bulletinBoard:status.verified")} style={themed($verifiedText)} />
                    </View>
                  )}
                </View>
                
                <Text text={organization.description} style={themed($organizationDescription)} numberOfLines={2} />
                
                <View style={themed($organizationFooter)}>
                  <Text text={organization.location} style={themed($organizationLocation)} />
                  <Text text={`활성 공고 ${organization.activePostCount}개`} style={themed($organizationStats)} />
                </View>

                {organization.tags && organization.tags.length > 0 && (
                  <View style={themed($tagsContainer)}>
                    {organization.tags.slice(0, 3).map((tag, tagIndex) => (
                      <View key={tagIndex} style={themed($tag)}>
                        <Text text={tag} style={themed($tagText)} />
                      </View>
                    ))}
                    {organization.tags.length > 3 && (
                      <View style={themed($tag)}>
                        <Text text={`+${organization.tags.length - 3}`} style={themed($tagText)} />
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
              )}
              ListHeaderComponent={() => (
              <View>
                {/* 탭 메뉴 */}
                <View style={themed($tabContainer)}>
                  <TouchableOpacity
                    style={themed(activeTab === 'organizations' ? $tabButton : $activeTabButton)}
                    onPress={() => setActiveTab('announcements')}
                  >
                    <Text 
                      text={translate("bulletinBoard:tabs.announcements")} 
                      style={themed(activeTab === 'organizations' ? $tabText : $activeTabText)} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={themed(activeTab === 'organizations' ? $activeTabButton : $tabButton)}
                    onPress={() => {
                      setActiveTab('organizations')
                      organizationService.updateAllActivePostCounts()
                    }}
                  >
                    <Text 
                      text={translate("bulletinBoard:tabs.organizations")} 
                      style={themed(activeTab === 'organizations' ? $activeTabText : $tabText)} 
                    />
                  </TouchableOpacity>
                </View>
                
              </View>
              )}
              ListEmptyComponent={() => (
                <View style={themed($emptyStateContainer)}>
                  <View style={themed($emptyIconContainer)}>
                    <Text text="🏢" style={themed($emptyIcon)} />
                  </View>
                  <Text text={translate("bulletinBoard:empty.organizations.title")} style={themed($emptyTitle)} />
                  <Text text={translate("bulletinBoard:empty.organizations.description")} style={themed($emptyDescription)} />
                </View>
              )}
              style={themed($flatListContainer)}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false} // 해결: 렌더링 문제 방지
              maxToRenderPerBatch={5}
              windowSize={5}
              initialNumToRender={3}
            />
          )}
        </View>
      </View>

      {/* Alert Modal */}
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
  minHeight: 500, // 최소 높이 강제 지정
})

const $flatListContainer = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
  minHeight: 400, // FlatList 최소 높이 보장
})




const $createPostButtonContainer = ({ spacing }) => ({
  marginBottom: spacing?.md || 12,
})

const $createPostButton = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  paddingHorizontal: spacing?.md || 12,
  paddingVertical: spacing?.sm || 8,
})

// 새로운 빈 상태 스타일들
const $emptyStateContainer = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.xl,
})

const $emptyIconContainer = ({ colors, spacing }) => ({
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginBottom: spacing.lg,
})

const $emptyIcon = {
  fontSize: 40,
}

const $emptyTitle = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "600" as const,
  textAlign: "center" as const,
  marginBottom: spacing.sm,
})

const $emptyDescription = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  textAlign: "center" as const,
  lineHeight: 20,
  marginBottom: spacing.xl,
})

const $emptyActions = ({ spacing }) => ({
  marginTop: spacing.lg,
})

const $sampleDataButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing?.lg || 16,
  paddingVertical: spacing?.sm || 8,
})

const $sampleDataButtonText = ({ colors }) => ({
  color: colors.palette.neutral600,
  fontSize: 14,
})

// 로딩 상태 스타일들
const $loadingContainer = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  paddingHorizontal: spacing?.xl || 24,
})

const $loadingIconContainer = ({ colors, spacing }) => ({
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.md || 12,
})

const $loadingIcon = {
  fontSize: 30,
}

const $loadingText = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
  textAlign: "center" as const,
})

// PostCard styles moved to PostCard component
const $tagsContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  marginTop: spacing?.xs || 4,
})

const $tag = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 2,
  borderRadius: 4,
  marginRight: spacing?.xs || 4,
  marginBottom: 4,
})

const $tagText = ({ colors }) => ({
  color: colors.palette.neutral600,
  fontSize: 12,
})





const $tabContainer = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: 4,
  marginBottom: spacing?.lg || 16,
})

const $tabButton = ({ spacing }) => ({
  flex: 1,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 4,
  alignItems: "center" as const,
})

const $activeTabButton = ({ colors, spacing }) => ({
  flex: 1,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 4,
  alignItems: "center" as const,
  backgroundColor: colors.background,
})

const $tabText = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
  fontWeight: "500" as const,
})

const $activeTabText = ({ colors }) => ({
  color: colors.text,
  fontSize: 14,
  fontWeight: "500" as const,
})

// 단체 카드 스타일들 - BOLD: Using secondary color theme for organization cards
const $organizationCard = ({ colors, spacing }) => ({
  backgroundColor: colors.secondaryAction + '20', // Secondary color background
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.md || 12,
  borderWidth: 2, // Thicker border for emphasis
  borderColor: colors.secondaryAction + '60', // Secondary color border
})

const $organizationHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "flex-start" as const,
  marginBottom: spacing?.xs || 4,
})

const $organizationName = ({ colors, spacing }) => ({
  color: colors.secondaryAction, // BOLD: Organization name in secondary color
  flex: 1,
  marginRight: spacing?.xs || 4,
  fontWeight: "600" as const, // Make it bolder
})

const $verifiedBadge = ({ colors, spacing }) => ({
  backgroundColor: colors.tint + "20",
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
})

const $verifiedText = ({ colors }) => ({
  color: colors.tint,
  fontSize: 12,
  fontWeight: "bold" as const,
})

const $organizationDescription = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  lineHeight: 20,
  marginBottom: spacing?.sm || 8,
})

const $organizationFooter = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

const $organizationLocation = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
})

const $organizationStats = ({ colors }) => ({
  color: colors.tint,
  fontSize: 14,
  fontWeight: "500" as const,
})


// PostCard detail styles moved to PostCard component


const $secondaryEmptyButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.palette.primary500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  marginBottom: spacing?.sm || 8,
  minHeight: 56,
})

const $secondaryEmptyButtonText = ({ colors, typography }) => ({
  color: colors.palette.primary500,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  textAlign: "center" as const,
})