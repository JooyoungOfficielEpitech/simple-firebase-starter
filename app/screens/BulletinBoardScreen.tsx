import React, { useEffect, useState } from "react"
import { View, Alert, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { ScreenHeader } from "@/components/ScreenHeader"
import { postService, userService, organizationService } from "@/services/firestore"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import { useAppTheme } from "@/theme/context"
import { Post } from "@/types/post"
import { UserProfile } from "@/types/user"
import { Organization } from "@/types/organization"
import { BulletinBoardStackParamList } from "@/navigators/BulletinBoardStackNavigator"
import { createComponentLogger } from "@/utils/logger"

type NavigationProp = NativeStackNavigationProp<BulletinBoardStackParamList>

export const BulletinBoardScreen = () => {
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()
  
  // Create component-specific logger
  const log = createComponentLogger('BulletinBoardScreen')

  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'announcements' | 'organizations'>('announcements')
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null)
  

  useEffect(() => {
    log.debug('useEffect 시작')
    
    // Firebase 인증 상태 확인
    const currentUser = auth().currentUser
    log.authInfo(currentUser)
    
    // 사용자 프로필 실시간 구독
    let unsubscribeUserProfile = () => {}
    
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
      unsubscribeUserProfile()
    }
  }, [])

  // 선택된 단체에 따른 게시글 필터링
  useEffect(() => {
    if (selectedOrganizationId) {
      console.log(`🔍 [BulletinBoardScreen] 단체별 필터링 시작: ${selectedOrganizationId}`)
      const unsubscribeFiltered = postService.subscribeToOrganizationPosts(selectedOrganizationId, (filteredPosts) => {
        console.log(`🔍 [BulletinBoardScreen] 단체별 게시글 받음: ${filteredPosts.length}개`)
        setFilteredPosts(filteredPosts)
      })

      return unsubscribeFiltered
    } else {
      console.log('🔍 [BulletinBoardScreen] 전체 게시글 모드')
      setFilteredPosts([])
    }
  }, [selectedOrganizationId])

  const handlePostPress = (postId: string) => {
    navigation.navigate("PostDetail", { postId })
  }

  const handleCreatePost = () => {
    // 관리자 권한 체크 디버깅
    console.log('🔐 [CreatePost] 권한 체크 시작')
    console.log('🔐 [CreatePost] userProfile:', userProfile)
    console.log('🔐 [CreatePost] userProfile?.userType:', userProfile?.userType)
    console.log('🔐 [CreatePost] isOrganizer:', isOrganizer)
    
    if (!isOrganizer) {
      console.log('❌ [CreatePost] 권한 없음 - 알림 표시')
      Alert.alert("권한 없음", "게시글 작성은 관리자만 가능합니다.")
      return
    }
    
    console.log('✅ [CreatePost] 권한 확인됨 - 게시글 작성 페이지로 이동')
    navigation.navigate("CreatePost", { isEdit: false })
  }

  const handleOrganizationPress = (organizationId: string) => {
    console.log('🏢 [BulletinBoardScreen] 단체 선택:', {
      organizationId,
      currentUserId: userProfile?.uid
    })
    
    setSelectedOrganizationId(organizationId)
    setActiveTab('announcements') // 단체 선택 후 공고 탭으로 이동
  }

  const getFilteredPosts = () => {
    if (selectedOrganizationId) {
      return filteredPosts
    }
    return posts
  }

  const handleBackToAllPosts = () => {
    setSelectedOrganizationId(null)
    setActiveTab('organizations') // 단체 목록으로 돌아가기
  }

  const handleCreateOrganization = () => {
    navigation.navigate("CreateOrganization", {})
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

      // 1.5. 단체 데이터 추가
      const organizationData = {
        name: '테스트극단',
        description: '클래식 연극부터 현대극까지 다양한 장르를 선보이는 극단입니다.',
        contactEmail: 'contact@testcompany.com',
        contactPhone: '02-1234-5678',
        website: 'https://testcompany.com',
        location: '서울특별시 종로구',
        establishedDate: '2020-01-01',
        tags: ['연극', '뮤지컬', '클래식'],
        logoUrl: null,
        isVerified: true,
        ownerId: 'test-organizer',
        ownerName: '테스트 운영자',
        memberCount: 15,
        activePostCount: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }

      await db.collection('organizations').doc('test-organizer').set(organizationData)
      console.log('✅ [AddTestData] 단체 데이터 추가 완료')

      // 추가 단체 데이터
      const organizationData2 = {
        name: '새로운극단',
        description: '실험적이고 창의적인 연극을 추구하는 극단입니다.',
        contactEmail: 'info@newcompany.com',
        contactPhone: '02-9876-5432',
        location: '서울특별시 마포구',
        establishedDate: '2021-06-15',
        tags: ['실험극', '창작극', '소극장'],
        logoUrl: null,
        isVerified: false,
        ownerId: 'test-organizer-2',
        ownerName: '새로운 운영자',
        memberCount: 8,
        activePostCount: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }

      await db.collection('organizations').doc('test-organizer-2').set(organizationData2)
      console.log('✅ [AddTestData] 추가 단체 데이터 추가 완료')

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
        
        // 새로운 필드들
        roles: [
          {
            name: '햄릿',
            gender: 'male',
            ageRange: '25-35세',
            requirements: '연기 경험 5년 이상, 셰익스피어 작품 경험자 우대',
            count: 1
          },
          {
            name: '오필리어',
            gender: 'female',
            ageRange: '20-30세',
            requirements: '연기 경험 3년 이상, 노래 가능자',
            count: 1
          },
          {
            name: '클로디어스',
            gender: 'male',
            ageRange: '40-55세',
            requirements: '중후한 연기력, 악역 연기 경험',
            count: 1
          }
        ],
        
        audition: {
          date: '2024년 10월 15일 (화) 오후 2시',
          location: '대학로 연습실 (3호선 안국역 2번 출구)',
          requirements: ['자기소개 3분', '자유 연기 5분', '셰익스피어 대사 암송'],
          resultDate: '2024년 10월 18일 (금)',
          method: '대면 오디션'
        },
        
        performance: {
          dates: ['2024년 12월 15일 (일) 19:30', '2024년 12월 16일 (월) 19:30', '2024년 12월 17일 (화) 19:30'],
          venue: '대학로 소극장 블루',
          ticketPrice: '일반 35,000원 / 학생 25,000원',
          targetAudience: '중학생 이상',
          genre: '클래식 연극'
        },
        
        benefits: {
          fee: '회차당 50,000원',
          transportation: true,
          costume: true,
          portfolio: true,
          photography: true,
          meals: false,
          other: ['공연 DVD 제공', '추천서 발급 가능']
        },
        
        contact: {
          email: 'casting@testcompany.com',
          phone: '02-1234-5678',
          applicationMethod: '이메일 또는 전화',
          requiredDocuments: ['이력서', '프로필 사진', '연기 영상 (선택)']
        },
        
        deadline: '2024년 10월 12일 (토) 18:00',
        totalApplicants: 15,
        viewCount: 234,
        
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }

      const postRef = await db.collection('posts').add(postData)
      console.log('✅ [AddTestData] 게시글 데이터 추가 완료, ID:', postRef.id)
      console.log('📝 [AddTestData] 추가된 게시글 데이터:', {
        title: postData.title,
        rolesCount: postData.roles?.length || 0,
        hasAudition: !!postData.audition,
        hasPerformance: !!postData.performance,
        hasBenefits: !!postData.benefits,
        hasContact: !!postData.contact,
      })

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
        
        // 새로운 필드들
        roles: [
          {
            name: '혁명군 앙상블',
            gender: 'male',
            ageRange: '20-40세',
            requirements: '노래 실력 중급 이상, 군무 가능자',
            count: 8
          },
          {
            name: '시민 앙상블',
            gender: 'any',
            ageRange: '20-50세',
            requirements: '기본적인 노래 실력, 연기 경험',
            count: 12
          }
        ],
        
        audition: {
          date: '2024년 10월 20일 (일) 오후 1시',
          location: '대학로 뮤지컬 연습실 (4호선 혜화역 1번 출구)',
          requirements: ['자기소개 2분', '자유곡 1곡 (2분 이내)', '간단한 안무'],
          resultDate: '2024년 10월 22일 (화)',
          method: '대면 오디션'
        },
        
        performance: {
          dates: ['2025년 1월 10일 (금) 20:00', '2025년 1월 11일 (토) 15:00, 19:00', '2025년 1월 12일 (일) 15:00'],
          venue: '대학로 뮤지컬홀',
          ticketPrice: 'R석 50,000원 / S석 40,000원 / A석 30,000원',
          targetAudience: '전체 관람가',
          genre: '뮤지컬'
        },
        
        benefits: {
          fee: '회차당 30,000원',
          transportation: true,
          costume: true,
          portfolio: false,
          photography: false,
          meals: true,
          other: ['뮤지컬 OST 앨범 제공']
        },
        
        contact: {
          email: 'musical@testcompany.com',
          phone: '02-9876-5432',
          applicationMethod: '이메일 지원',
          requiredDocuments: ['이력서', '노래 영상 (필수)']
        },
        
        deadline: '2024년 10월 18일 (금) 23:59',
        totalApplicants: 42,
        viewCount: 156,
        
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }

      const postRef2 = await db.collection('posts').add(postData2)
      console.log('✅ [AddTestData] 추가 게시글 데이터 추가 완료, ID:', postRef2.id)
      console.log('📝 [AddTestData] 추가된 레미제라블 데이터:', {
        title: postData2.title,
        rolesCount: postData2.roles?.length || 0,
        hasAudition: !!postData2.audition,
        hasPerformance: !!postData2.performance,
        hasBenefits: !!postData2.benefits,
        hasContact: !!postData2.contact,
      })

      // 활성 공고 수 업데이트
      console.log('🔄 [AddTestData] 활성 공고 수 업데이트 시작...')
      await organizationService.updateAllActivePostCounts()
      console.log('✅ [AddTestData] 활성 공고 수 업데이트 완료')

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
    userProfile: userProfile ? { userType: userProfile.userType, uid: userProfile.uid, email: userProfile.email } : null,
    isOrganizer,
    error
  })
  
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
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed($container)}>
          {/* Header */}
          <View style={themed($header)}>
            <Text
              text="게시판"
              preset="heading"
              style={themed($appTitle)}
            />
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
      <View style={themed($container)}>
        {/* Header */}
        <View style={themed($header)}>
          {!!selectedOrganizationId && (
            <TouchableOpacity
              style={themed($backButton)}
              onPress={handleBackToAllPosts}
              accessibilityRole="button"
              accessibilityLabel="뒤로가기"
            >
              <Text text="←" style={themed($backButtonText)} />
            </TouchableOpacity>
          )}
          <Text
            text={selectedOrganizationId ? 
              organizations.find(org => org.id === selectedOrganizationId)?.name || "단체" : 
              "게시판 📊"}
            preset="heading"
            style={themed($appTitle)}
          />
          <View style={themed($headerButtons)}>
            <Button
              text="📊"
              preset="filled"
              onPress={addTestData}
              style={themed($testDataButton)}
              textStyle={themed($buttonText)}
            />
            <Button
              text="+"
              preset="default"
              onPress={handleCreatePost}
              style={themed($createButton)}
              textStyle={themed($createButtonText)}
            />
          </View>
        </View>

        {/* 탭 메뉴 (단체가 선택되지 않았을 때만 표시) */}
        {!selectedOrganizationId && (
          <View style={themed($tabContainer)}>
            <TouchableOpacity
              style={themed(activeTab === 'announcements' ? $activeTabButton : $tabButton)}
              onPress={() => setActiveTab('announcements')}
            >
              <Text 
                text="공고" 
                style={themed(activeTab === 'announcements' ? $activeTabText : $tabText)} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={themed(activeTab === 'organizations' ? $activeTabButton : $tabButton)}
              onPress={() => {
                setActiveTab('organizations')
                // 단체 탭으로 전환할 때마다 활성 공고 수 갱신
                organizationService.updateAllActivePostCounts()
              }}
            >
              <Text 
                text="단체" 
                style={themed(activeTab === 'organizations' ? $activeTabText : $tabText)} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* 컨텐츠 영역 */}
        <View style={themed($contentContainer)}>
          {activeTab === 'announcements' ? (
            getFilteredPosts().length === 0 ? (
              (() => {
                console.log('📋 [BulletinBoardScreen] 빈 상태 렌더링 - 게시글이 없음')
                return (
                  <View style={themed($emptyStateContainer)}>
                    <View style={themed($emptyIconContainer)}>
                      <Text text="🎭" style={themed($emptyIcon)} />
                    </View>
                    <Text text="아직 모집 공고가 없어요" style={themed($emptyTitle)} />
                    <Text 
                      text={selectedOrganizationId 
                        ? "이 단체의 모집 공고가 아직 없습니다.\n단체 운영자가 공고를 올리면 여기에 나타납니다."
                        : "연극, 뮤지컬 배우 모집 공고가\n여기에 표시됩니다."} 
                      style={themed($emptyDescription)} 
                    />
                    
                    {/* Show different CTAs based on user type and context */}
                    <View style={themed($emptyActions)}>
                      {isOrganizer && !selectedOrganizationId ? (
                        <Button
                          text="첫 모집 공고 작성하기"
                          style={themed($primaryEmptyButton)}
                          textStyle={themed($primaryEmptyButtonText)}
                          onPress={handleCreatePost}
                        />
                      ) : null}
                      
                      {!selectedOrganizationId && (
                        <Button
                          text="다른 단체 둘러보기"
                          style={themed($secondaryEmptyButton)}
                          textStyle={themed($secondaryEmptyButtonText)}
                          onPress={() => setActiveTab('organizations')}
                        />
                      )}
                      
                      {/* 개발용 테스트 버튼 - 개발 모드에서만 */}
                      {__DEV__ && (
                        <Button
                          text="샘플 데이터 추가"
                          style={themed($sampleDataButton)}
                          textStyle={themed($sampleDataButtonText)}
                          onPress={addTestData}
                        />
                      )}
                    </View>
                  </View>
                )
              })()
            ) : (
              (() => {
                console.log(`📋 [BulletinBoardScreen] 게시글 목록 렌더링 - ${getFilteredPosts().length}개 게시글`)
                return getFilteredPosts().map((post, index) => {
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
                        accessibilityRole="button"
                        accessibilityLabel={`${post.title} - ${post.production} 모집공고`}
                        accessibilityHint="터치하여 상세정보 보기"
                      >
                        <View style={themed($postCardHeader)}>
                          <View style={themed($postStatusRow)}>
                            <View style={themed(post.status === "active" ? $activeBadge : $closedBadge)}>
                              <Text
                                text={post.status === "active" ? "모집중" : "마감"}
                                style={themed(post.status === "active" ? $activeText : $closedText)}
                              />
                            </View>
                            {post.deadline && (
                              <Text text={`마감 ${post.deadline}`} style={themed($deadlineText)} />
                            )}
                          </View>
                          <Text preset="subheading" text={post.title} style={themed($postTitle)} />
                          <Text text={post.production} style={themed($production)} />
                        </View>
                        
                        <View style={themed($postMeta)}>
                          <View style={themed($organizationRow)}>
                            <Text text={post.organizationName} style={themed($organization)} />
                            {post.totalApplicants && (
                              <Text text={`지원자 ${post.totalApplicants}명`} style={themed($applicantCount)} />
                            )}
                          </View>
                          <Text text={post.location} style={themed($location)} />
                          <Text text={post.rehearsalSchedule} style={themed($schedule)} />
                        </View>

                        {/* Role summary for quick scanning */}
                        {post.roles && post.roles.length > 0 && (
                          <View style={themed($rolesPreview)}>
                            <Text 
                              text={post.roles.slice(0, 2).map(role => `${role.name}(${role.count}명)`).join(", ")}
                              style={themed($rolesPreviewText)}
                              numberOfLines={1}
                            />
                            {post.roles.length > 2 && (
                              <Text text={`외 ${post.roles.length - 2}개 역할`} style={themed($moreRoles)} />
                            )}
                          </View>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <View style={themed($tagsContainer)}>
                            {post.tags.slice(0, 3).map((tag, tagIndex) => (
                              <View key={tagIndex} style={themed($tag)}>
                                <Text text={tag} style={themed($tagText)} />
                              </View>
                            ))}
                            {post.tags.length > 3 && (
                              <View style={themed($tag)}>
                                <Text text={`+${post.tags.length - 3}`} style={themed($tagText)} />
                              </View>
                            )}
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
            )
          ) : (
            <View>
              {/* 단체 등록 버튼 */}
              {isOrganizer && (
                <View style={themed($createOrgButtonContainer)}>
                  <Button
                    text="새 단체 등록"
                    onPress={handleCreateOrganization}
                    style={themed($createOrgButton)}
                    LeftAccessory={(props) => (
                      <Icon icon="check" size={20} color={props.style.color} />
                    )}
                  />
                </View>
              )}

              {organizations.length === 0 ? (
                <View style={themed($emptyStateContainer)}>
                  <View style={themed($emptyIconContainer)}>
                    <Text text="🏢" style={themed($emptyIcon)} />
                  </View>
                  <Text text="등록된 단체가 없습니다" style={themed($emptyTitle)} />
                  <Text text="단체가 등록되면\n여기에 표시됩니다" style={themed($emptyDescription)} />
                </View>
              ) : (
                organizations.map((organization) => (
                <TouchableOpacity
                  key={organization.id}
                  style={themed($organizationCard)}
                  onPress={() => handleOrganizationPress(organization.id)}
                >
                  <View style={themed($organizationHeader)}>
                    <Text preset="subheading" text={organization.name} style={themed($organizationName)} />
                    {organization.isVerified && (
                      <View style={themed($verifiedBadge)}>
                        <Text text="인증" style={themed($verifiedText)} />
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
                ))
              )}
            </View>
          )}
        </View>
      </View>
    </Screen>
  )
}

const $container = ({ spacing }) => ({
  flexGrow: 1,
  backgroundColor: "transparent",
  paddingHorizontal: spacing.lg,
})

const $header = ({ spacing, colors }) => ({
  paddingHorizontal: 0,
  paddingVertical: spacing.md,
  backgroundColor: colors.background,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $appTitle = ({ colors, typography, spacing }) => ({
  textAlign: "center",
  color: colors.palette.primary500,
  fontFamily: typography.primary.bold,
  flex: 1,
})

const $backButton = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  minWidth: 44,
  minHeight: 44,
  justifyContent: "center",
  alignItems: "center",
})

const $backButtonText = ({ colors, typography }) => ({
  fontSize: 24,
  color: colors.palette.primary500,
  fontFamily: typography.primary.bold,
})


const $contentContainer = {
  // 게시글 목록 컨테이너
}

const $createButton = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  paddingHorizontal: 0,
  paddingVertical: 0,
  minHeight: 40,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.tint,
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

const $postCard = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.md || 12,
  borderWidth: 1,
  borderColor: colors.border,
})

const $postHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "flex-start" as const,
  marginBottom: spacing?.xs || 4,
})

const $postTitle = ({ colors, spacing }) => ({
  color: colors.text,
  flex: 1,
  marginRight: spacing?.xs || 4,
})


const $activeBadge = ({ colors, spacing }) => ({
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: colors.tint + "20",
})

const $closedBadge = ({ colors, spacing }) => ({
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: colors.textDim + "20",
})


const $activeText = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "bold" as const,
  color: colors.tint,
})

const $closedText = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "bold" as const,
  color: colors.textDim,
})

const $production = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "600" as const,
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

const $location = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginBottom: 2,
})

const $schedule = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
})

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


const $headerButtons = () => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
})

const $testDataButton = ({ colors, spacing }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  paddingHorizontal: 0,
  paddingVertical: 0,
  marginRight: spacing.sm,
  minHeight: 40,
  backgroundColor: colors.palette.orange500,
})

const $buttonText = ({ colors }) => ({
  fontSize: 18,
  color: colors.palette.neutral100,
})

const $createButtonText = ({ colors }) => ({
  fontSize: 24,
  fontWeight: "bold" as const,
  color: colors.tint,
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

// 단체 카드 스타일들
const $organizationCard = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.md || 12,
  borderWidth: 1,
  borderColor: colors.border,
})

const $organizationHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "flex-start" as const,
  marginBottom: spacing?.xs || 4,
})

const $organizationName = ({ colors, spacing }) => ({
  color: colors.text,
  flex: 1,
  marginRight: spacing?.xs || 4,
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

const $createOrgButtonContainer = ({ spacing }) => ({
  marginBottom: spacing?.md || 12,
})

const $createOrgButton = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  paddingHorizontal: spacing?.md || 12,
  paddingVertical: spacing?.sm || 8,
})

// 새로운 Post Card 스타일들
const $postCardHeader = ({ spacing }) => ({
  marginBottom: spacing?.sm || 8,
})

const $postStatusRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

const $deadlineText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 18,
  color: colors.textDim,
  fontFamily: typography.primary.medium,
})

const $postMeta = ({ spacing }) => ({
  marginBottom: spacing?.sm || 8,
})

const $organizationRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

const $applicantCount = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 18,
  color: colors.palette.primary500,
  fontFamily: typography.primary.medium,
})

const $rolesPreview = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
  paddingVertical: spacing?.xxxs || 2,
})

const $rolesPreviewText = ({ colors, typography }) => ({
  flex: 1,
  fontSize: 13,
  lineHeight: 20,
  color: colors.text,
  fontFamily: typography.primary.normal,
})

const $moreRoles = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 18,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

// Empty State 버튼 스타일들
const $primaryEmptyButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  marginBottom: spacing?.sm || 8,
  minHeight: 56,
})

const $primaryEmptyButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  textAlign: "center" as const,
})

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