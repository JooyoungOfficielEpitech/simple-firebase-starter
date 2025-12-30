import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Calendar, Clock, MapPin, DollarSign, Phone } from 'lucide-react-native';

import { CourtRental } from '../types/court';
import { SheepCharacter } from './SheepCharacter';

interface CourtCardProps {
  rental: CourtRental;
  onPress: (rental: CourtRental) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CourtCard: React.FC<CourtCardProps> = ({ rental, onPress }) => {
  const pressed = useSharedValue(0);

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: 200 });
  };

  const handlePress = () => {
    onPress(rental);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.98]);

    return {
      transform: [{ scale }],
    };
  });

  // Format date: 2025-12-26 -> 12월 26일 (목)
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '날짜 미정';

    try {
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
      return `${month}월 ${day}일 (${dayOfWeek})`;
    } catch {
      return dateStr;
    }
  };

  // Format time: 22:00 -> 오후 10:00
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '';

    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? '오후' : '오전';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${period} ${displayHour}:${minutes}`;
    } catch {
      return timeStr;
    }
  };

  // Format price: 70000 -> 7만원
  const formatPrice = (priceStr: string | null) => {
    if (!priceStr) return '가격 협의';

    try {
      const price = parseInt(priceStr, 10);
      if (price >= 10000) {
        const manWon = Math.floor(price / 10000);
        const remainder = price % 10000;
        if (remainder === 0) {
          return `${manWon}만원`;
        } else {
          return `${manWon}.${Math.floor(remainder / 1000)}만원`;
        }
      }
      return `${price.toLocaleString()}원`;
    } catch {
      return priceStr;
    }
  };

  const { extracted_info } = rental;
  const timeRange = extracted_info.event_time && extracted_info.event_time_end
    ? `${formatTime(extracted_info.event_time)} ~ ${formatTime(extracted_info.event_time_end)}`
    : extracted_info.event_time
    ? formatTime(extracted_info.event_time)
    : '시간 미정';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animatedStyle]}
      accessible={true}
      accessibilityLabel={`${extracted_info.location || '위치 미정'} 농구장 대관, ${formatDate(extracted_info.event_date)}, ${timeRange}`}
      accessibilityHint="탭하여 상세 정보 보기"
      accessibilityRole="button"
    >
      {/* Platform Badge with Sheep */}
      <View style={styles.platformBadge}>
        <SheepCharacter
          variant={rental.platform === 'daum' ? 'white' : 'black'}
          size="medium"
        />
        <View style={styles.platformTextBubble}>
          <Text style={styles.platformText}>
            {rental.platform === 'daum' ? '다음카페' : '네이버 카페'}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {rental.title}
      </Text>

      {/* Info Grid */}
      <View style={styles.infoContainer}>
        {/* Date */}
        {extracted_info.event_date && (
          <View key="date" style={styles.infoRow}>
            <Calendar size={16} color="#F5B740" strokeWidth={2} />
            <Text style={styles.infoText}>
              {formatDate(extracted_info.event_date)}
            </Text>
          </View>
        )}

        {/* Time */}
        {(extracted_info.event_time || extracted_info.event_time_end) && (
          <View key="time" style={styles.infoRow}>
            <Clock size={16} color="#F5B740" strokeWidth={2} />
            <Text style={styles.infoText}>{timeRange}</Text>
          </View>
        )}

        {/* Location */}
        {extracted_info.location && (
          <View key="location" style={styles.infoRow}>
            <MapPin size={16} color="#F5B740" strokeWidth={2} />
            <Text style={styles.infoText} numberOfLines={1}>
              {extracted_info.location}
            </Text>
          </View>
        )}

        {/* Price */}
        {extracted_info.price && (
          <View key="price" style={styles.infoRow}>
            <DollarSign size={16} color="#F5B740" strokeWidth={2} />
            <Text style={styles.infoPrice}>
              {formatPrice(extracted_info.price)}
            </Text>
          </View>
        )}

        {/* Contact */}
        {extracted_info.contact && (
          <View key="contact" style={styles.infoRow}>
            <Phone size={16} color="#F5B740" strokeWidth={2} />
            <Text style={styles.infoText}>{extracted_info.contact}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.authorText}>작성자: {rental.author}</Text>
        <Text style={styles.dateText}>{rental.posted_at}</Text>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  platformBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  platformTextBubble: {
    backgroundColor: '#F5B740',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    color: '#111111',
    marginBottom: 16,
  },
  infoContainer: {
    gap: 10,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#222222',
    flex: 1,
  },
  infoPrice: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    color: '#F5B740',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  authorText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#222222',
    opacity: 0.7,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#222222',
    opacity: 0.5,
  },
});
