import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, Phone, ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { courtService } from '../services/firestore';
import { CourtRental } from '../types/court';
import { PrimaryButton, SheepCharacter, SpeechBubble } from '../components';
import { getRandomSheepMessage, getRandomBubblePosition } from '../utils/sheepMessages';
import type { BubblePosition } from '../components/SpeechBubble';

type RootStackParamList = {
  Home: undefined;
  CourtList: undefined;
  CourtDetail: { rentalId: string };
};

type CourtDetailScreenRouteProp = RouteProp<RootStackParamList, 'CourtDetail'>;
type CourtDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CourtDetail'
>;

const { width } = Dimensions.get('window');

const CourtDetailScreen: React.FC = () => {
  const route = useRoute<CourtDetailScreenRouteProp>();
  const navigation = useNavigation<CourtDetailScreenNavigationProp>();
  const { rentalId } = route.params;

  const [rental, setRental] = useState<CourtRental | null>(null);
  const [loading, setLoading] = useState(true);

  // 양 말풍선 상태 (각 양마다 독립적인 state)
  const [heroSheepBubble, setHeroSheepBubble] = useState({ visible: false, message: '', position: 'topLeft' as BubblePosition });
  const [sheep1Bubble, setSheep1Bubble] = useState({ visible: false, message: '', position: 'topLeft' as BubblePosition });
  const [sheep2Bubble, setSheep2Bubble] = useState({ visible: false, message: '', position: 'topRight' as BubblePosition });
  const [sheep3Bubble, setSheep3Bubble] = useState({ visible: false, message: '', position: 'topLeft' as BubblePosition });

  useEffect(() => {
    loadRentalDetail();
  }, [rentalId]);

  const loadRentalDetail = async () => {
    try {
      setLoading(true);
      const data = await courtService.getCourtRental(rentalId);
      setRental(data);
    } catch (error) {
      console.error('대관 정보 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleOpenOriginalPost = async () => {
    if (!rental?.url) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const supported = await Linking.canOpenURL(rental.url);
      if (supported) {
        await Linking.openURL(rental.url);
      } else {
        console.error('URL을 열 수 없습니다:', rental.url);
      }
    } catch (error) {
      console.error('링크 열기 오류:', error);
    }
  };

  const handleCallContact = async () => {
    if (!rental?.extracted_info.contact) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const phoneNumber = rental.extracted_info.contact.replace(/-/g, '');
    const url = `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error('전화 앱을 열 수 없습니다');
      }
    } catch (error) {
      console.error('전화 걸기 오류:', error);
    }
  };

  // 양 터치 핸들러
  const handleHeroSheepPress = () => {
    setHeroSheepBubble({
      visible: true,
      message: getRandomSheepMessage(),
      position: getRandomBubblePosition(),
    });
  };

  const handleSheep1Press = () => {
    setSheep1Bubble({
      visible: true,
      message: getRandomSheepMessage(),
      position: getRandomBubblePosition(),
    });
  };

  const handleSheep2Press = () => {
    setSheep2Bubble({
      visible: true,
      message: getRandomSheepMessage(),
      position: getRandomBubblePosition(),
    });
  };

  const handleSheep3Press = () => {
    setSheep3Bubble({
      visible: true,
      message: getRandomSheepMessage(),
      position: getRandomBubblePosition(),
    });
  };

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

  if (loading) {
    return (
      <LinearGradient
        colors={['#F5B740', '#F2A93F']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['bottom']}>
          {/* Background Decorative Sheep - Top Left */}
          <Pressable style={styles.decorativeSheepTopLeft} onPress={handleSheep1Press}>
            <SheepCharacter variant="white" size="medium" />
            <SpeechBubble
              message={sheep1Bubble.message}
              visible={sheep1Bubble.visible}
              position={sheep1Bubble.position}
              onDismiss={() => setSheep1Bubble({ ...sheep1Bubble, visible: false })}
            />
          </Pressable>

          {/* Background Decorative Sheep - Top Right */}
          <Pressable style={styles.decorativeSheepTopRight} onPress={handleSheep2Press}>
            <SheepCharacter variant="black" size="medium" />
            <SpeechBubble
              message={sheep2Bubble.message}
              visible={sheep2Bubble.visible}
              position={sheep2Bubble.position}
              onDismiss={() => setSheep2Bubble({ ...sheep2Bubble, visible: false })}
            />
          </Pressable>

          {/* Background Decorative Sheep - Bottom Left */}
          <Pressable style={styles.decorativeSheepBottomLeft} onPress={handleSheep3Press}>
            <SheepCharacter variant="white" size="medium" />
            <SpeechBubble
              message={sheep3Bubble.message}
              visible={sheep3Bubble.visible}
              position={sheep3Bubble.position}
              onDismiss={() => setSheep3Bubble({ ...sheep3Bubble, visible: false })}
            />
          </Pressable>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>로딩 중...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!rental) {
    return (
      <LinearGradient
        colors={['#F5B740', '#F2A93F']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['bottom']}>
          {/* Background Decorative Sheep - Top Left */}
          <Pressable style={styles.decorativeSheepTopLeft} onPress={handleSheep1Press}>
            <SheepCharacter variant="white" size="medium" />
            <SpeechBubble
              message={sheep1Bubble.message}
              visible={sheep1Bubble.visible}
              position={sheep1Bubble.position}
              onDismiss={() => setSheep1Bubble({ ...sheep1Bubble, visible: false })}
            />
          </Pressable>

          {/* Background Decorative Sheep - Top Right */}
          <Pressable style={styles.decorativeSheepTopRight} onPress={handleSheep2Press}>
            <SheepCharacter variant="black" size="medium" />
            <SpeechBubble
              message={sheep2Bubble.message}
              visible={sheep2Bubble.visible}
              position={sheep2Bubble.position}
              onDismiss={() => setSheep2Bubble({ ...sheep2Bubble, visible: false })}
            />
          </Pressable>

          {/* Background Decorative Sheep - Bottom Left */}
          <Pressable style={styles.decorativeSheepBottomLeft} onPress={handleSheep3Press}>
            <SheepCharacter variant="white" size="medium" />
            <SpeechBubble
              message={sheep3Bubble.message}
              visible={sheep3Bubble.visible}
              position={sheep3Bubble.position}
              onDismiss={() => setSheep3Bubble({ ...sheep3Bubble, visible: false })}
            />
          </Pressable>

          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>대관 정보를 찾을 수 없습니다.</Text>
            <Pressable onPress={handleBack} style={styles.backButtonError}>
              <Text style={styles.backButtonTextError}>돌아가기</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const { extracted_info } = rental;
  const timeRange = extracted_info.event_time && extracted_info.event_time_end
    ? `${formatTime(extracted_info.event_time)} ~ ${formatTime(extracted_info.event_time_end)}`
    : extracted_info.event_time
    ? formatTime(extracted_info.event_time)
    : '시간 미정';

  return (
    <LinearGradient
      colors={['#F5B740', '#F2A93F']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Background Decorative Sheep - Top Left */}
        <Pressable style={styles.decorativeSheepTopLeft} onPress={handleSheep1Press}>
          <SheepCharacter variant="white" size="medium" />
          <SpeechBubble
            message={sheep1Bubble.message}
            visible={sheep1Bubble.visible}
            position={sheep1Bubble.position}
            onDismiss={() => setSheep1Bubble({ ...sheep1Bubble, visible: false })}
          />
        </Pressable>

        {/* Background Decorative Sheep - Top Right */}
        <Pressable style={styles.decorativeSheepTopRight} onPress={handleSheep2Press}>
          <SheepCharacter variant="black" size="medium" />
          <SpeechBubble
            message={sheep2Bubble.message}
            visible={sheep2Bubble.visible}
            position={sheep2Bubble.position}
            onDismiss={() => setSheep2Bubble({ ...sheep2Bubble, visible: false })}
          />
        </Pressable>

        {/* Background Decorative Sheep - Bottom Left */}
        <Pressable style={styles.decorativeSheepBottomLeft} onPress={handleSheep3Press}>
          <SheepCharacter variant="white" size="medium" />
          <SpeechBubble
            message={sheep3Bubble.message}
            visible={sheep3Bubble.visible}
            position={sheep3Bubble.position}
            onDismiss={() => setSheep3Bubble({ ...sheep3Bubble, visible: false })}
          />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true }}
          >
            <ArrowLeft size={24} color="#111111" />
          </Pressable>
          <Text style={styles.headerTitle}>대관 정보</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Sheep */}
          <View style={styles.heroSheepSection}>
            <Pressable onPress={handleHeroSheepPress}>
              <View style={styles.heroSheepContainer}>
                <SheepCharacter
                  variant={rental.platform === 'daum' ? 'white' : 'black'}
                  size="large"
                />
                <SpeechBubble
                  message={heroSheepBubble.message}
                  visible={heroSheepBubble.visible}
                  position={heroSheepBubble.position}
                  onDismiss={() => setHeroSheepBubble({ ...heroSheepBubble, visible: false })}
                />
              </View>
            </Pressable>
          </View>

          {/* Main Card */}
          <View style={styles.mainCard}>
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
            <Text style={styles.title}>{rental.title}</Text>

            {/* Info Section */}
            <View style={styles.infoSection}>
              {extracted_info.event_date && (
                <View key="date" style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Calendar size={20} color="#F5B740" strokeWidth={2} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>날짜</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(extracted_info.event_date)}
                    </Text>
                  </View>
                </View>
              )}

              {(extracted_info.event_time || extracted_info.event_time_end) && (
                <View key="time" style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Clock size={20} color="#F5B740" strokeWidth={2} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>시간</Text>
                    <Text style={styles.infoValue}>{timeRange}</Text>
                  </View>
                </View>
              )}

              {extracted_info.location && (
                <View key="location" style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <MapPin size={20} color="#F5B740" strokeWidth={2} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>위치</Text>
                    <Text style={styles.infoValue}>{extracted_info.location}</Text>
                  </View>
                </View>
              )}

              {extracted_info.price && (
                <View key="price" style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <DollarSign size={20} color="#F5B740" strokeWidth={2} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>가격</Text>
                    <Text style={styles.infoPriceValue}>
                      {formatPrice(extracted_info.price)}
                    </Text>
                  </View>
                </View>
              )}

              {extracted_info.contact && (
                <View key="contact" style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Phone size={20} color="#F5B740" strokeWidth={2} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>연락처</Text>
                    <Pressable onPress={handleCallContact}>
                      <Text style={[styles.infoValue, styles.contactLink]}>
                        {extracted_info.contact}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.contentSection}>
              <Text style={styles.contentLabel}>상세 내용</Text>
              <Text style={styles.contentText}>{rental.content}</Text>
            </View>

            {/* Meta Info */}
            <View style={styles.metaSection}>
              <Text style={styles.metaText}>작성자: {rental.author}</Text>
              <Text style={styles.metaText}>게시일: {rental.posted_at}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            {extracted_info.contact && (
              <Pressable
                style={styles.callButton}
                onPress={handleCallContact}
                android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Phone size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.callButtonText}>전화하기</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.linkButton}
              onPress={handleOpenOriginalPost}
              android_ripple={{ color: 'rgba(17, 17, 17, 0.1)' }}
            >
              <ExternalLink size={20} color="#111111" strokeWidth={2} />
              <Text style={styles.linkButtonText}>원본 글 보기</Text>
            </Pressable>
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
    position: 'relative',
  },
  decorativeSheepTopLeft: {
    position: 'absolute',
    top: 40,
    left: 40,
    opacity: 0.2,
    zIndex: 0,
  },
  decorativeSheepTopRight: {
    position: 'absolute',
    top: 80,
    right: 40,
    opacity: 0.2,
    zIndex: 0,
  },
  decorativeSheepBottomLeft: {
    position: 'absolute',
    bottom: 128,
    left: 64,
    opacity: 0.15,
    zIndex: 0,
  },
  loadingContainer: {
    zIndex: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 24,
    zIndex: 10,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  backButtonError: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonTextError: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  header: {
    backgroundColor: '#F5B740',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  heroSheepSection: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroSheepContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 9999,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    zIndex: 10,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  platformBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  platformTextBubble: {
    backgroundColor: '#F5B740',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    color: '#111111',
    marginBottom: 24,
  },
  infoSection: {
    gap: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111111',
    lineHeight: 22,
  },
  infoPriceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F5B740',
    lineHeight: 24,
  },
  contactLink: {
    color: '#F5B740',
    textDecorationLine: 'underline',
  },
  contentSection: {
    marginBottom: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#222222',
  },
  metaSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
  },
  actionSection: {
    marginTop: 16,
    gap: 12,
  },
  callButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  linkButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
});

export default CourtDetailScreen;
