import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { House } from 'lucide-react-native';

import { PostCard } from '../components';
import type { Post } from '../components';
import type { SheepVariant } from '../components/SheepCharacter';
import { courtService } from '../services/firestore';
import type { CourtRental } from '../types/court';

type RootStackParamList = {
  Home: undefined;
  PostList: undefined;
  PostDetail: { postId: string };
  CreatePost: undefined;
};

type PostListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PostList'
>;

const { width } = Dimensions.get('window');

/**
 * CourtRental 데이터를 Post 형식으로 변환
 */
const convertCourtRentalToPost = (rental: CourtRental): Post => {
  // 플랫폼에 따라 양 캐릭터 선택
  const getSheepVariant = (platform: string): SheepVariant => {
    switch (platform) {
      case 'naver':
        return 'black';
      case 'daum':
        return 'white';
      default:
        return 'white';
    }
  };

  // 날짜 포맷팅
  const formatTimestamp = (dateStr: string): string => {
    try {
      const date = new Date(dateStr.replace('.', '-'));
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInHours < 1) return '방금 전';
      if (diffInHours < 24) return `${diffInHours}시간 전`;
      if (diffInDays < 30) return `${diffInDays}일 전`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return {
    id: rental.id,
    author: rental.author,
    character: getSheepVariant(rental.platform),
    title: rental.title,
    content: rental.content,
    timestamp: formatTimestamp(rental.posted_at),
    url: rental.url,
  };
};

const PostListScreen: React.FC = () => {
  const navigation = useNavigation<PostListScreenNavigationProp>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Firestore 실시간 구독
  useEffect(() => {
    console.log('🔥 [PostListScreen] Firebase 구독 시작');

    const unsubscribe = courtService.subscribeToCourtRentals(
      {
        is_available: true,
        limit: 50,
      },
      (rentals) => {
        console.log('📦 [PostListScreen] 받은 데이터:', rentals.length, '개');
        if (rentals.length > 0) {
          console.log('📄 [PostListScreen] 첫 번째 항목:', {
            id: rentals[0].id,
            title: rentals[0].title,
            platform: rentals[0].platform,
          });
        }
        const convertedPosts = rentals.map(convertCourtRentalToPost);
        setPosts(convertedPosts);
        setLoading(false);
      }
    );

    return () => {
      console.log('🔌 [PostListScreen] Firebase 구독 해제');
      unsubscribe();
    };
  }, []);

  const handleNavigateToHome = () => {
    navigation.navigate('Home');
  };

  const handleNavigateToPostDetail = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const rentals = await courtService.searchCourtRentals({
        is_available: true,
        limit: 50,
      });
      const convertedPosts = rentals.map(convertCourtRentalToPost);
      setPosts(convertedPosts);
    } catch (error) {
      console.error('데이터 새로고침 오류:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderItem = ({ item, index }: { item: Post; index: number }) => (
    <View
      style={[
        styles.postCardWrapper,
        { opacity: index === 0 ? 1 : 0.98 }, // Subtle fade for staggered animation
      ]}
    >
      <PostCard
        post={item}
        onPress={() => handleNavigateToPostDetail(item.id)}
      />
    </View>
  );

  const renderRefreshControl = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#F29A2E"
      colors={['#F29A2E']}
      progressViewOffset={0}
    />
  );

  const keyExtractor = (item: Post) => item.id;

  const getItemLayout = (_data: Post[] | null | undefined, index: number) => ({
    length: 224, // Approximate height of PostCard + margin
    offset: 224 * index,
    index,
  });

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#F5B740" />
          <Text style={styles.emptyText}>게시글을 불러오는 중...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>🐑</Text>
        <Text style={styles.emptyText}>
          아직 등록된 게시글이 없습니다
        </Text>
        <Text style={styles.emptySubtext}>
          새로운 대관 정보가 곧 업데이트됩니다!
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#F5B740', '#F2A93F']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Pressable
              onPress={handleNavigateToHome}
              style={styles.homeButton}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true }}
            >
              <House size={24} color="#111111" />
            </Pressable>
            <Text style={styles.headerTitle}>🐑 양들의 게시판</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        {/* Post List */}
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            posts.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={renderRefreshControl()}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={getItemLayout}
          ListEmptyComponent={renderEmptyComponent()}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#F5B740',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerContent: {
    maxWidth: width,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeButton: {
    padding: 8,
    borderRadius: 9999,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: '#111111',
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  listContentEmpty: {
    flex: 1,
  },
  postCardWrapper: {
    marginBottom: 0, // PostCard has its own marginBottom
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#222222',
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default PostListScreen;
