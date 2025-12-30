import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SheepCharacter, SheepVariant } from './SheepCharacter';

export interface Post {
  id: string;
  author: string;
  character: SheepVariant;
  title: string;
  content: string;
  timestamp: string;
  url?: string;
}

interface PostCardProps {
  post: Post;
  onPress: (post: Post) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PostCard: React.FC<PostCardProps> = ({ post, onPress }) => {
  const pressed = useSharedValue(0);

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: 200 });
  };

  const handlePress = () => {
    onPress(post);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.98]);

    return {
      transform: [{ scale }],
    };
  });

  const formatTimestamp = (timestamp: string) => {
    // Simple time ago formatter - would need proper implementation
    return timestamp;
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animatedStyle]}
      accessible={true}
      accessibilityLabel={`${post.author}의 게시글, ${post.title}, ${formatTimestamp(post.timestamp)} 전 작성`}
      accessibilityHint="탭하여 게시글 전체 보기"
      accessibilityRole="button"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <SheepCharacter
            variant={post.character}
            size="medium"
            animate={false}
          />
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author}</Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(post.timestamp)}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>

      {/* Content */}
      <Text style={styles.content} numberOfLines={2}>
        {post.content}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    minHeight: 180,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    color: '#111111',
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#222222',
    opacity: 0.6,
    marginTop: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
    color: '#111111',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#222222',
  },
});
