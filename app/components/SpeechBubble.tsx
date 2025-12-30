import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

export type BubblePosition = 'topLeft' | 'topRight';

interface SpeechBubbleProps {
  message: string;
  visible: boolean;
  position: BubblePosition;
  onDismiss: () => void;
}

/**
 * 말풍선 컴포넌트
 * 양 캐릭터 위에 표시되는 애니메이션 말풍선
 */
export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  message,
  visible,
  position,
  onDismiss,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // 등장 애니메이션
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
      });
      opacity.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
      });

      // 2.5초 후 자동으로 사라지기
      const dismissTimer = setTimeout(() => {
        scale.value = withSpring(0, {
          damping: 12,
          stiffness: 200,
        });
        opacity.value = withSpring(0, {
          damping: 12,
          stiffness: 200,
        }, () => {
          runOnJS(onDismiss)();
        });
      }, 2500);

      return () => clearTimeout(dismissTimer);
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [visible, message]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  if (!visible) return null;

  // 위치에 따른 스타일 결정
  const isLeftPosition = position === 'topLeft';
  const containerStyle = isLeftPosition ? styles.containerLeft : styles.containerRight;

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      <View style={styles.bubble}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // 왼쪽 위 위치
  containerLeft: {
    position: 'absolute',
    top: -20,
    left: -80, // 양의 왼쪽
    zIndex: 1000,
    pointerEvents: 'none',
  },
  // 오른쪽 위 위치
  containerRight: {
    position: 'absolute',
    top: -20,
    right: -100, // 양의 오른쪽
    zIndex: 1000,
    pointerEvents: 'none',
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 160,
    maxWidth: 200,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#F5B740',
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#111111',
    textAlign: 'center',
  },
});
