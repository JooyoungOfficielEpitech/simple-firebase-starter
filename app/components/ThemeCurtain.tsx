import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '@/core/context/ThemeContext'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// 커튼 주름 개수
const PLEAT_COUNT = 8
const PLEAT_WIDTH = SCREEN_WIDTH / PLEAT_COUNT

export const ThemeCurtain: React.FC = () => {
  const { themeName } = useTheme()
  const leftCurtainAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current
  const rightCurtainAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current
  const railOpacityAnim = useRef(new Animated.Value(0)).current
  const prevTheme = useRef(themeName)

  useEffect(() => {
    // 테마가 변경되었을 때만 애니메이션 실행
    if (prevTheme.current !== themeName) {
      runCurtainAnimation()
      prevTheme.current = themeName
    }
  }, [themeName])

  const runCurtainAnimation = () => {
    // Reset position
    leftCurtainAnim.setValue(-SCREEN_WIDTH)
    rightCurtainAnim.setValue(SCREEN_WIDTH)
    railOpacityAnim.setValue(0)

    // Total duration: 1.8s (1800ms)
    // 0% -> 30%: 540ms (close + rail fade in)
    // 30% -> 70%: 720ms (stay closed)
    // 70% -> 100%: 540ms (open + rail fade out)

    const customEasing = Easing.bezier(0.65, 0, 0.35, 1)

    // 커튼 닫기 + 레일 나타내기 (0% -> 30%: 540ms)
    Animated.parallel([
      Animated.timing(leftCurtainAnim, {
        toValue: 0,
        duration: 540,
        easing: customEasing,
        useNativeDriver: true,
      }),
      Animated.timing(rightCurtainAnim, {
        toValue: 0,
        duration: 540,
        easing: customEasing,
        useNativeDriver: true,
      }),
      Animated.timing(railOpacityAnim, {
        toValue: 1,
        duration: 540,
        easing: customEasing,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 30% ~ 70%: 720ms 동안 멈춤
      setTimeout(() => {
        // 커튼 열기 + 레일 사라지기 (70% -> 100%: 540ms)
        Animated.parallel([
          Animated.timing(leftCurtainAnim, {
            toValue: -SCREEN_WIDTH,
            duration: 540,
            easing: customEasing,
            useNativeDriver: true,
          }),
          Animated.timing(rightCurtainAnim, {
            toValue: SCREEN_WIDTH,
            duration: 540,
            easing: customEasing,
            useNativeDriver: true,
          }),
          Animated.timing(railOpacityAnim, {
            toValue: 0,
            duration: 540,
            easing: customEasing,
            useNativeDriver: true,
          }),
        ]).start()
      }, 720)
    })
  }

  // 커튼 주름 생성
  const renderPleats = () => {
    return Array.from({ length: PLEAT_COUNT }).map((_, index) => (
      <View key={index} style={styles.pleat}>
        <LinearGradient
          colors={['#8B0000', '#DC143C', '#8B0000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.pleatGradient}
        />
      </View>
    ))
  }

  return (
    <>
      {/* Curtain Rail (상단 레일) - 전환시에만 나타남 */}
      <Animated.View
        style={[
          styles.curtainRail,
          {
            opacity: railOpacityAnim,
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['#4A4A4A', '#2A2A2A', '#1A1A1A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.railGradient}
        />
      </Animated.View>

      {/* Left Curtain */}
      <Animated.View
        style={[
          styles.curtain,
          styles.leftCurtain,
          {
            transform: [{ translateX: leftCurtainAnim }],
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['#5A0000', '#8B0000', '#DC143C', '#8B0000', '#5A0000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.curtainBase}
        >
          {/* 주름 효과 */}
          <View style={styles.pleatsContainer}>{renderPleats()}</View>

          {/* 금색 장식 태슬 */}
          <View style={styles.tasselContainer}>
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FFD700']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.tassel}
            />
          </View>

          {/* 벨벳 질감 오버레이 */}
          <View style={styles.velvetTexture} />
        </LinearGradient>
      </Animated.View>

      {/* Right Curtain */}
      <Animated.View
        style={[
          styles.curtain,
          styles.rightCurtain,
          {
            transform: [{ translateX: rightCurtainAnim }],
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['#5A0000', '#8B0000', '#DC143C', '#8B0000', '#5A0000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.curtainBase}
        >
          {/* 주름 효과 */}
          <View style={styles.pleatsContainer}>{renderPleats()}</View>

          {/* 금색 장식 태슬 */}
          <View style={styles.tasselContainer}>
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FFD700']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.tassel}
            />
          </View>

          {/* 벨벳 질감 오버레이 */}
          <View style={styles.velvetTexture} />
        </LinearGradient>
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  // 상단 레일
  curtainRail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 10000,
    elevation: 10000,
  },
  railGradient: {
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },

  // 커튼 베이스
  curtain: {
    position: 'absolute',
    top: 40,
    bottom: 0,
    width: SCREEN_WIDTH,
    zIndex: 9999,
    elevation: 9999,
  },
  leftCurtain: {
    left: 0,
  },
  rightCurtain: {
    right: 0,
  },
  curtainBase: {
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },

  // 주름 효과
  pleatsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  pleat: {
    width: PLEAT_WIDTH,
    height: '100%',
  },
  pleatGradient: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },

  // 금색 태슬 장식
  tasselContainer: {
    position: 'absolute',
    top: '40%',
    right: 20,
    width: 30,
    height: 80,
  },
  tassel: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },

  // 벨벳 질감
  velvetTexture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    opacity: 0.3,
  },
})
