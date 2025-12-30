import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { SheepCharacter } from '../components/SheepCharacter';
import type { SheepVariant } from '../components/SheepCharacter';
import { SpeechBubble } from '../components/SpeechBubble';
import type { BubblePosition } from '../components/SpeechBubble';
import type { Post } from '../components/PostCard';
import { courtService } from '../services/firestore';
import type { CourtRental } from '../types/court';
import { getRandomSheepMessage, getRandomBubblePosition } from '../utils/sheepMessages';

type RootStackParamList = {
  Home: undefined;
  PostList: undefined;
  PostDetail: { postId: string };
  CreatePost: undefined;
};

type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;
type PostDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PostDetail'
>;

const { width } = Dimensions.get('window');

const PostDetailScreen: React.FC = () => {
  const route = useRoute<PostDetailScreenRouteProp>();
  const navigation = useNavigation<PostDetailScreenNavigationProp>();
  const { postId } = route.params;

  // 상태 관리
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSpeech, setShowSpeech] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [bubblePosition, setBubblePosition] = useState<BubblePosition>('topRight');

  // Firestore에서 게시글 로드
  useEffect(() => {
    loadPostData();
  }, [postId]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      const rental = await courtService.getCourtRental(postId);

      if (rental) {
        // CourtRental → Post 변환
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

        const convertedPost: Post = {
          id: rental.id,
          author: rental.author,
          character: getSheepVariant(rental.platform),
          title: rental.title,
          content: rental.content,
          timestamp: formatTimestamp(rental.posted_at),
          url: rental.url,
        };

        setPost(convertedPost);
      }
    } catch (error) {
      console.error('게시글 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSheepPress = () => {
    // 햅틱 피드백
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 랜덤 메시지와 위치 선택
    const message = getRandomSheepMessage();
    const position = getRandomBubblePosition();
    setCurrentMessage(message);
    setBubblePosition(position);
    setShowSpeech(true);
  };

  const handleSpeechDismiss = () => {
    setShowSpeech(false);
  };

  const handleOpenOriginalPost = async () => {
    if (!post?.url) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const supported = await Linking.canOpenURL(post.url);
      if (supported) {
        await Linking.openURL(post.url);
      } else {
        console.error('URL을 열 수 없습니다:', post.url);
      }
    } catch (error) {
      console.error('링크 열기 오류:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return timestamp;
  };

  // 로딩 중
  if (loading) {
    return (
      <LinearGradient
        colors={['#F5B740', '#F2A93F']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.errorContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.errorText}>게시글을 불러오는 중...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // 게시글 없음
  if (!post) {
    return (
      <LinearGradient
        colors={['#F5B740', '#F2A93F']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>게시글을 찾을 수 없습니다.</Text>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>돌아가기</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#F5B740', '#F2A93F']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Pressable
              onPress={handleBack}
              style={styles.headerBackButton}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true }}
            >
              <ArrowLeft size={24} color="#111111" />
            </Pressable>
            <Text style={styles.headerTitle}>게시글</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Sheep Character - Top Section */}
          <View style={styles.sheepSection}>
            <Pressable
              onPress={handleSheepPress}
              style={styles.sheepPressable}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: true }}
            >
              {/* 말풍선 */}
              <SpeechBubble
                message={currentMessage}
                visible={showSpeech}
                position={bubblePosition}
                onDismiss={handleSpeechDismiss}
              />

              {/* 양 캐릭터 */}
              <SheepCharacter
                variant={post.character}
                size="large"
                animate={true}
              />
            </Pressable>
          </View>

          {/* Post Card */}
          <View style={styles.postCard}>
            {/* Author Info */}
            <View style={styles.authorSection}>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{post.author}</Text>
                <Text style={styles.timestamp}>
                  {formatTimestamp(post.timestamp)}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Title */}
            <Text style={styles.title}>{post.title}</Text>

            {/* Content */}
            <Text style={styles.content}>{post.content}</Text>

            {/* Original Post Link Button */}
            {post.url && (
              <>
                <View style={styles.divider} />
                <Pressable
                  style={styles.linkButton}
                  onPress={handleOpenOriginalPost}
                  android_ripple={{ color: 'rgba(245, 183, 64, 0.2)' }}
                >
                  <ExternalLink size={20} color="#F5B740" strokeWidth={2} />
                  <Text style={styles.linkButtonText}>원글 가기</Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
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
  headerBackButton: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  sheepSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  sheepPressable: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: '#111111',
  },
  timestamp: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#222222',
    opacity: 0.6,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: '#111111',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#222222',
    letterSpacing: -0.2,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F5B740',
    backgroundColor: '#FFF9F0',
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5B740',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
    color: '#111111',
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#111111',
  },
});

export default PostDetailScreen;
