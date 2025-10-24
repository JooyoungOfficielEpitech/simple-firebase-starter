import React, { FC, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNotification } from '@/context/NotificationContext'
import { PushNotificationProps } from '@/utils/pushNotificationService'

const { width: screenWidth } = Dimensions.get('window')

interface NotificationBannerProps {
  autoHideDuration?: number // 자동 숨김 시간 (밀리초)
  onNotificationPress?: (notification: PushNotificationProps) => void
}

export const NotificationBanner: FC<NotificationBannerProps> = ({
  autoHideDuration = 4000,
  onNotificationPress,
}) => {
  const { latestNotification, clearLatestNotification } = useNotification()
  const [isVisible, setIsVisible] = useState(false)
  const [slideAnim] = useState(new Animated.Value(-100))
  const insets = useSafeAreaInsets()

  // 새 알림이 있을 때 배너 표시
  useEffect(() => {
    if (latestNotification) {
      setIsVisible(true)
      // 슬라이드 인 애니메이션
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start()

      // 자동 숨김 타이머
      const timer = setTimeout(() => {
        hideBanner()
      }, autoHideDuration)

      return () => clearTimeout(timer)
    }
  }, [latestNotification])

  const hideBanner = () => {
    // 슬라이드 아웃 애니메이션
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false)
      clearLatestNotification()
    })
  }

  const handleBannerPress = () => {
    if (latestNotification && onNotificationPress) {
      onNotificationPress(latestNotification)
    }
    hideBanner()
  }

  const handleClosePress = () => {
    hideBanner()
  }

  if (!isVisible || !latestNotification) {
    return null
  }

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: insets.top,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleBannerPress}
        style={{
          backgroundColor: '#ffffff',
          marginHorizontal: 16,
          marginTop: 8,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'flex-start',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
          borderLeftWidth: 4,
          borderLeftColor: '#007AFF',
        }}
      >
        {/* 알림 아이콘 */}
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#007AFF',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 16, color: '#ffffff' }}>🔔</Text>
        </View>

        {/* 알림 내용 */}
        <View style={{ flex: 1 }}>
          {latestNotification.title && (
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#000000',
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {latestNotification.title}
            </Text>
          )}
          {latestNotification.body && (
            <Text
              style={{
                fontSize: 14,
                color: '#666666',
                lineHeight: 20,
              }}
              numberOfLines={2}
            >
              {latestNotification.body}
            </Text>
          )}
        </View>

        {/* 닫기 버튼 */}
        <TouchableOpacity
          onPress={handleClosePress}
          style={{
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ fontSize: 16, color: '#999999' }}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default NotificationBanner