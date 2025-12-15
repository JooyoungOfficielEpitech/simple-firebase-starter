import React, { useState, useEffect } from 'react'
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { OrphiHeader, OrphiText, OrphiCard, OrphiFAB, orphiTokens } from '@/design-system'
import { PostCard } from '@/components/PostCard'
import { postService } from '@/core/services/firestore'
import type { Post } from '@/core/types/post'
import type { AppStackParamList } from '@/core/navigators/types'
import { Plus } from 'lucide-react-native'

type NavigationProp = NativeStackNavigationProp<AppStackParamList>

export const BulletinBoardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      console.log('📋 공고 목록 로딩 시작...')

      // Firebase에서 공고 목록 가져오기 (활성 공고만 서버 사이드 필터링)
      const { posts: postList } = await postService.getPosts(20)

      console.log(`✅ 공고 ${postList.length}개 로드 완료`)
      setPosts(postList)
    } catch (error) {
      console.error('❌ 공고 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadPosts()
    setRefreshing(false)
  }

  const handlePostPress = (post: Post) => {
    navigation.navigate('PostDetail', { postId: post.id })
  }

  const handleCreatePost = () => {
    navigation.navigate('CreatePost', {})
  }

  const handleNotificationPress = () => {
    navigation.navigate('NotificationCenter')
  }

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard post={item} onPress={() => handlePostPress(item)} />
  )

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <OrphiCard style={styles.emptyCard}>
        <OrphiText variant="h3" style={styles.emptyTitle}>
          등록된 공고가 없습니다
        </OrphiText>
        <OrphiText variant="body" color="gray600" style={styles.emptyDescription}>
          첫 번째 공고를 등록해보세요!
        </OrphiText>
      </OrphiCard>
    </View>
  )

  const renderFooter = () => {
    if (!loading) return null
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={orphiTokens.colors.green600} />
      </View>
    )
  }

  if (loading && posts.length === 0) {
    return (
      <View style={styles.container}>
        <OrphiHeader
          title="공고 게시판"
          showBell
          bellBadgeCount={unreadNotifications}
          onBellPress={handleNotificationPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={orphiTokens.colors.green600} />
          <OrphiText variant="body" color="gray600" style={styles.loadingText}>
            공고를 불러오는 중...
          </OrphiText>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <OrphiHeader
        title="공고 게시판"
        subtitle={`총 ${posts.length}개의 공고`}
        showBell
        bellBadgeCount={unreadNotifications}
        onBellPress={handleNotificationPress}
      />

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={orphiTokens.colors.green600}
          />
        }
      />

      {/* 공고 작성 FAB */}
      <OrphiFAB
        icon={<Plus size={32} color={orphiTokens.colors.white} strokeWidth={2.5} />}
        onPress={handleCreatePost}
        position="bottomRight"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orphiTokens.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: orphiTokens.spacing.md,
  },
  listContent: {
    padding: orphiTokens.spacing.base,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: orphiTokens.spacing['3xl'],
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: orphiTokens.spacing['2xl'],
    paddingHorizontal: orphiTokens.spacing.xl,
  },
  emptyTitle: {
    marginBottom: orphiTokens.spacing.md,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
  },
  footer: {
    paddingVertical: orphiTokens.spacing.lg,
    alignItems: 'center',
  },
})
