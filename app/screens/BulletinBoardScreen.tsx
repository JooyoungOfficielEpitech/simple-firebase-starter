import React, { useEffect, useState } from "react"
import { View, ScrollView, Alert, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { postService, userService } from "@/services/firestore"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import { useAppTheme } from "@/theme/context"
import { Post } from "@/types/post"
import { UserProfile } from "@/types/user"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>

export const BulletinBoardScreen = () => {
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  

  useEffect(() => {
    console.log('🎯 [BulletinBoardScreen] useEffect 시작')
    
    // Firebase 인증 상태 확인
    const currentUser = auth().currentUser
    console.log('🔐 [BulletinBoardScreen] 현재 Firebase 인증 상태:', currentUser ? { uid: currentUser.uid, email: currentUser.email } : 'NOT_LOGGED_IN')
    
    // 사용자 프로필 로드
    const loadUserProfile = async () => {
      try {
        console.log('👤 [BulletinBoardScreen] 사용자 프로필 로드 시작')
        const profile = await userService.getUserProfile()
        console.log('👤 [BulletinBoardScreen] 사용자 프로필 로드 완료:', profile)
        setUserProfile(profile)
        
        // 프로필이 없으면 기본 프로필 생성 (게시글 보기에는 영향 없음)
        if (!profile && currentUser) {
          console.log('👤 [BulletinBoardScreen] 프로필이 없어서 기본 프로필 생성 스킵 (게시글 보기에는 문제없음)')
        }
      } catch (error) {
        console.error("❌ [BulletinBoardScreen] 사용자 프로필 로드 오류:", error)
        console.log('👤 [BulletinBoardScreen] 프로필 로드 실패해도 게시글은 볼 수 있음')
      }
    }

    loadUserProfile()

    // 게시글 실시간 구독
    console.log('📱 [BulletinBoardScreen] 게시글 구독 시작')
    const unsubscribe = postService.subscribeToActivePosts((posts) => {
      console.log('📱 [BulletinBoardScreen] 게시글 콜백 호출됨')
      console.log(`📱 [BulletinBoardScreen] 받은 게시글 수: ${posts.length}`)
      console.log('📱 [BulletinBoardScreen] 받은 게시글:', posts.map(p => ({ id: p.id, title: p.title, status: p.status })))
      
      setPosts(posts)
      setLoading(false)
      setError(null)
      
      console.log(`📱 [BulletinBoardScreen] 상태 업데이트 완료 - posts: ${posts.length}개, loading: false`)
    })

    return unsubscribe
  }, [])

  const handlePostPress = (postId: string) => {
    navigation.navigate("PostDetail", { postId })
  }

  const handleCreatePost = () => {
    navigation.navigate("CreatePost", {})
  }

  // 테스트 데이터 추가 함수
  const addTestData = async () => {
    try {
      const db = firestore()
      
      console.log('🔥 [AddTestData] 테스트 데이터 추가 시작...')
      console.log('🔥 [AddTestData] Firestore DB 인스턴스:', db ? 'OK' : 'ERROR')
      
      // 현재 인증 상태 확인
      const currentUser = auth().currentUser
      console.log('🔐 [AddTestData] 현재 인증 상태:', currentUser ? { uid: currentUser.uid, email: currentUser.email } : 'NOT_LOGGED_IN')

      // 1. 사용자 데이터 추가
      const userData = {
        uid: 'test-organizer',
        email: 'test@example.com',
        name: '테스트 운영자',
        gender: 'female',
        birthday: '1990-01-01',
        heightCm: 165,
        media: [],
        requiredProfileComplete: true,
        userType: 'organizer',
        organizationId: 'test-organizer',
        organizationName: '테스트극단',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }

      await db.collection('users').doc('test-organizer').set(userData)
      console.log('✅ [AddTestData] 사용자 데이터 추가 완료')

      // 2. 게시글 데이터 추가
      const postData = {
        title: '[테스트] 햄릿 주연 모집',
        description: '🎭 테스트극단에서 햄릿 주연을 모집합니다!\n\n📍 모집 역할:\n- 햄릿 역 (남성, 25-35세)\n- 오필리어 역 (여성, 20-30세)\n\n🎯 자격 요건:\n- 연기 경험 필수\n- 셰익스피어 작품 경험자 우대',
        production: '햄릿',
        rehearsalSchedule: '매주 토, 일 오후 2시-6시',
        location: '서울 연습실',
        organizationId: 'test-organizer',
        organizationName: '테스트극단',
        authorId: 'test-organizer',
        authorName: '테스트 운영자',
        status: 'active',
        tags: ['연극', '셰익스피어', '주연'],
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }

      const postRef = await db.collection('posts').add(postData)
      console.log('✅ [AddTestData] 게시글 데이터 추가 완료, ID:', postRef.id)

      // 3. 추가 게시글
      const postData2 = {
        title: '[테스트] 레미제라블 앙상블 모집',
        description: '🎵 레미제라블 앙상블을 모집합니다!\n\n📍 모집 역할:\n- 앙상블 (남/여 무관, 20-40세)\n\n🎯 자격 요건:\n- 노래 가능자\n- 단체 연기 경험자',
        production: '레미제라블',
        rehearsalSchedule: '매주 화, 목 오후 7시-10시',
        location: '대학로 소극장',
        organizationId: 'test-organizer',
        organizationName: '테스트극단',
        authorId: 'test-organizer',
        authorName: '테스트 운영자',
        status: 'active',
        tags: ['뮤지컬', '앙상블'],
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }

      const postRef2 = await db.collection('posts').add(postData2)
      console.log('✅ [AddTestData] 추가 게시글 데이터 추가 완료, ID:', postRef2.id)

      Alert.alert('성공', '테스트 데이터가 추가되었습니다!')
    } catch (error) {
      console.error('❌ [AddTestData] 데이터 추가 실패:', error)
      console.error('❌ [AddTestData] 에러 상세:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      })
      Alert.alert('오류', '데이터 추가에 실패했습니다.')
    }
  }

  const isOrganizer = userProfile?.userType === "organizer"
  
  // 렌더링 상태 디버그
  console.log('🎨 [BulletinBoardScreen] 렌더링 상태:', {
    loading,
    postsLength: posts.length,
    userProfile: userProfile ? { userType: userProfile.userType } : null,
    isOrganizer,
    error
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
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed([$container, { paddingTop: top + (spacing?.lg || 16) }])}>
          {/* 헤더 */}
          <View style={themed($header)}>
            <Text preset="heading" text="게시판" style={themed($title)} />
            <View style={themed($headerButtons)}>
              <TouchableOpacity
                style={themed($testDataButton)}
                onPress={addTestData}
              >
                <Text text="📊" style={themed($buttonText)} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={themed($loadingContainer)}>
            <View style={themed($loadingIconContainer)}>
              <Text text="🎭" style={themed($loadingIcon)} />
            </View>
            <Text text="게시글을 불러오는 중..." style={themed($loadingText)} />
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <View style={themed([$container, { paddingTop: top + (spacing?.lg || 16) }])}>
        {/* 헤더 */}
        <View style={themed($header)}>
          <Text preset="heading" text="게시판" style={themed($title)} />
          <View style={themed($headerButtons)}>
            {/* 테스트 데이터 추가 버튼 (임시) */}
            <TouchableOpacity
              style={themed($testDataButton)}
              onPress={addTestData}
            >
              <Text text="📊" style={themed($buttonText)} />
            </TouchableOpacity>
            {isOrganizer && (
              <TouchableOpacity
                style={themed($createButton)}
                onPress={handleCreatePost}
              >
                <Icon icon="plus" size={24} color={colors.tint} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 게시글 목록 */}
        <View style={themed($contentContainer)}>
          {posts.length === 0 ? (
            (() => {
              console.log('📋 [BulletinBoardScreen] 빈 상태 렌더링 - 게시글이 없음')
              return (
                <View style={themed($emptyStateContainer)}>
                  <View style={themed($emptyIconContainer)}>
                    <Text text="🎭" style={themed($emptyIcon)} />
                  </View>
                  <Text text="아직 게시된 모집 공고가 없습니다" style={themed($emptyTitle)} />
                  <Text text="극단에서 배우 모집 공고를 올리면\n여기에 표시됩니다" style={themed($emptyDescription)} />
                  
                  {/* 개발용 테스트 버튼 */}
                  <View style={themed($emptyActions)}>
                    <Button
                      text="샘플 데이터 추가"
                      style={themed($sampleDataButton)}
                      textStyle={themed($sampleDataButtonText)}
                      onPress={addTestData}
                    />
                  </View>
                </View>
              )
            })()
          ) : (
            (() => {
              console.log(`📋 [BulletinBoardScreen] 게시글 목록 렌더링 - ${posts.length}개 게시글`)
              return posts.map((post, index) => {
                console.log(`🎯 [BulletinBoardScreen] 게시글 ${index + 1} 렌더링 시작:`, {
                  id: post.id,
                  title: post.title,
                  production: post.production,
                  organizationName: post.organizationName,
                  location: post.location,
                  rehearsalSchedule: post.rehearsalSchedule,
                  tags: post.tags,
                  status: post.status
                })
                
                try {
                  return (
                    <TouchableOpacity
                      key={post.id}
                      style={themed($postCard)}
                      onPress={() => handlePostPress(post.id)}
                    >
                      <View style={themed($postHeader)}>
                        <Text preset="subheading" text={post.title} style={themed($postTitle)} />
                        <View style={themed([$statusBadge, post.status === "active" ? $activeBadge : $closedBadge])}>
                          <Text
                            text={post.status === "active" ? "모집중" : "마감"}
                            style={themed([$statusText, post.status === "active" ? $activeText : $closedText])}
                          />
                        </View>
                      </View>
                      
                      <Text text={post.production} style={themed($production)} />
                      <Text text={post.organizationName} style={themed($organization)} />
                      
                      <View style={themed($postFooter)}>
                        <Text text={post.location} style={themed($location)} />
                        <Text text={post.rehearsalSchedule} style={themed($schedule)} />
                      </View>

                      {post.tags && post.tags.length > 0 && (
                        <View style={themed($tagsContainer)}>
                          {post.tags.map((tag, tagIndex) => (
                            <View key={tagIndex} style={themed($tag)}>
                              <Text text={tag} style={themed($tagText)} />
                            </View>
                          ))}
                        </View>
                      )}
                    </TouchableOpacity>
                  )
                } catch (renderError) {
                  console.error(`❌ [BulletinBoardScreen] 게시글 ${index + 1} 렌더링 에러:`, renderError)
                  return null
                }
              }).filter(Boolean)
            })()
          )}
        </View>
      </View>
    </Screen>
  )
}

const $container = ({ spacing }) => ({
  paddingHorizontal: spacing?.lg || 16,
})

const $header = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing?.lg || 16,
})

const $title = ({ colors }) => ({
  color: colors.text,
})

const $contentContainer = {
  // 게시글 목록 컨테이너
}

const $createButton = ({ colors, spacing }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
})


const $centerContainer = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $emptyText = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
})

// 새로운 빈 상태 스타일들
const $emptyStateContainer = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing?.xl || 24,
  paddingTop: spacing?.xl || 24,
})

const $emptyIconContainer = ({ colors, spacing }) => ({
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing?.lg || 16,
})

const $emptyIcon = {
  fontSize: 40,
}

const $emptyTitle = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "600",
  textAlign: "center",
  marginBottom: spacing?.sm || 8,
})

const $emptyDescription = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  textAlign: "center",
  lineHeight: 20,
  marginBottom: spacing?.xl || 24,
})

const $emptyActions = ({ spacing }) => ({
  marginTop: spacing?.lg || 16,
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
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing?.xl || 24,
})

const $loadingIconContainer = ({ colors, spacing }) => ({
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing?.md || 12,
})

const $loadingIcon = {
  fontSize: 30,
}

const $loadingText = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
  textAlign: "center",
})

const $postCard = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.md || 12,
  borderWidth: 1,
  borderColor: colors.border,
})

const $postHeader = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: spacing?.xs || 4,
})

const $postTitle = ({ colors, spacing }) => ({
  color: colors.text,
  flex: 1,
  marginRight: spacing?.xs || 4,
})

const $statusBadge = ({ spacing }) => ({
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
})

const $activeBadge = ({ colors }) => ({
  backgroundColor: colors.tint + "20",
})

const $closedBadge = ({ colors }) => ({
  backgroundColor: colors.textDim + "20",
})

const $statusText = {
  fontSize: 12,
  fontWeight: "bold",
}

const $activeText = ({ colors }) => ({
  color: colors.tint,
})

const $closedText = ({ colors }) => ({
  color: colors.textDim,
})

const $production = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "600",
  marginBottom: spacing?.xs || 4,
})

const $organization = ({ colors, spacing }) => ({
  color: colors.tint,
  fontSize: 14,
  marginBottom: spacing?.sm || 8,
})

const $postFooter = ({ spacing }) => ({
  marginBottom: spacing?.sm || 8,
})

const $location = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginBottom: 2,
})

const $schedule = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
})

const $tagsContainer = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
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

const $testButton = ({ spacing }) => ({
  marginTop: spacing?.lg || 16,
  width: 200,
})

const $headerButtons = () => ({
  flexDirection: "row",
  alignItems: "center",
})

const $testDataButton = ({ colors, spacing }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.orange500,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing?.sm || 8,
})

const $buttonText = ({ colors }) => ({
  fontSize: 18,
  color: colors.palette.neutral100,
})