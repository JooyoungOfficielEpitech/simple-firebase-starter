import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { House, SlidersHorizontal, X } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { CourtCard, SheepCharacter, SpeechBubble, FilterBottomSheet } from '../components';
import type { FilterOptions } from '../components';
import { courtService } from '../services/firestore';
import { CourtRental } from '../types/court';
import { getRandomSheepMessage, getRandomBubblePosition } from '../utils/sheepMessages';
import type { BubblePosition } from '../components/SpeechBubble';

type RootStackParamList = {
  Home: undefined;
  CourtList: undefined;
  CourtDetail: { rentalId: string };
};

type CourtListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CourtList'
>;

const { width } = Dimensions.get('window');

const CourtListScreen: React.FC = () => {
  const navigation = useNavigation<CourtListScreenNavigationProp>();
  const [rentals, setRentals] = useState<CourtRental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<CourtRental[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 양 말풍선 상태 (각 양마다 독립적인 state)
  const [sheep1Bubble, setSheep1Bubble] = useState({ visible: false, message: '', position: 'topLeft' as BubblePosition });
  const [sheep2Bubble, setSheep2Bubble] = useState({ visible: false, message: '', position: 'topRight' as BubblePosition });
  const [sheep3Bubble, setSheep3Bubble] = useState({ visible: false, message: '', position: 'topLeft' as BubblePosition });

  // 필터 상태
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    maxPrice: 200000,
    location: [],
    platform: [],
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    maxPrice: 200000,
    location: [],
    platform: [],
  });

  // Firestore에서 데이터 로드
  const loadRentals = useCallback(async () => {
    try {
      console.log('🔥 [CourtListScreen] Firebase 데이터 로드 시작');
      setLoading(true);
      const data = await courtService.searchCourtRentals({
        is_available: true,
        limit: 50,
      });
      console.log('📦 [CourtListScreen] 받은 데이터:', data.length, '개');
      if (data.length > 0) {
        console.log('📄 [CourtListScreen] 첫 번째 항목:', {
          id: data[0].id,
          title: data[0].title,
          platform: data[0].platform,
        });
      }
      setRentals(data);
    } catch (error) {
      console.error('❌ [CourtListScreen] 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    // Firebase 앱 정보 출력
    import('@react-native-firebase/app').then((firebase) => {
      const app = firebase.default.app();
      console.log('🔧 [Firebase] 연결된 프로젝트:', app.options.projectId);
      console.log('🔧 [Firebase] 앱 이름:', app.name);
    });

    loadRentals();
  }, [loadRentals]);

  // 실시간 리스너 설정 (선택사항)
  useEffect(() => {
    console.log('🔥 [CourtListScreen] Firebase 실시간 구독 시작');

    const unsubscribe = courtService.subscribeToCourtRentals(
      {
        is_available: true,
        limit: 50,
      },
      (updatedRentals) => {
        console.log('📦 [CourtListScreen] 실시간 업데이트:', updatedRentals.length, '개');
        if (updatedRentals.length > 0) {
          console.log('📄 [CourtListScreen] 첫 번째 항목:', {
            id: updatedRentals[0].id,
            title: updatedRentals[0].title,
          });
        }
        setRentals(updatedRentals);
        setLoading(false);
      }
    );

    return () => {
      console.log('🔌 [CourtListScreen] Firebase 구독 해제');
      unsubscribe();
    };
  }, []);

  const handleNavigateToHome = () => {
    navigation.navigate('Home');
  };

  const handleNavigateToCourtDetail = (rentalId: string) => {
    navigation.navigate('CourtDetail', { rentalId });
  };

  // 양 터치 핸들러
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

  // 필터 핸들러
  const handleOpenFilter = () => {
    bottomSheetRef.current?.expand();
  };

  const handleApplyFilter = () => {
    setAppliedFilters(filters);
    bottomSheetRef.current?.close();
  };

  const handleResetFilter = () => {
    const resetFilters: FilterOptions = {
      startDate: null,
      endDate: null,
      maxPrice: 200000,
      location: [],
      platform: [],
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const handleRemoveFilter = (filterType: keyof FilterOptions) => {
    const newFilters = { ...appliedFilters };
    if (filterType === 'startDate' || filterType === 'endDate') {
      newFilters.startDate = null;
      newFilters.endDate = null;
    } else if (filterType === 'maxPrice') {
      newFilters.maxPrice = 200000;
    } else if (filterType === 'location') {
      newFilters.location = [];
    } else if (filterType === 'platform') {
      newFilters.platform = [];
    }
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  };

  // 필터 적용 로직
  useEffect(() => {
    let filtered = [...rentals];

    // 날짜 필터
    if (appliedFilters.startDate) {
      filtered = filtered.filter((rental) => {
        if (!rental.extracted_info.event_date) return false;
        const eventDate = new Date(rental.extracted_info.event_date);
        return eventDate >= appliedFilters.startDate!;
      });
    }

    if (appliedFilters.endDate) {
      filtered = filtered.filter((rental) => {
        if (!rental.extracted_info.event_date) return false;
        const eventDate = new Date(rental.extracted_info.event_date);
        return eventDate <= appliedFilters.endDate!;
      });
    }

    // 가격 필터
    if (appliedFilters.maxPrice < 200000) {
      filtered = filtered.filter((rental) => {
        if (!rental.extracted_info.price) return true;
        const price = parseInt(rental.extracted_info.price);
        return price <= appliedFilters.maxPrice;
      });
    }

    // 지역 필터
    if (appliedFilters.location.length > 0) {
      filtered = filtered.filter((rental) => {
        if (!rental.extracted_info.location) return false;
        return appliedFilters.location.some((loc) =>
          rental.extracted_info.location?.includes(loc)
        );
      });
    }

    // 플랫폼 필터
    if (appliedFilters.platform.length > 0) {
      filtered = filtered.filter((rental) =>
        appliedFilters.platform.includes(rental.platform)
      );
    }

    setFilteredRentals(filtered);
  }, [rentals, appliedFilters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRentals();
    setRefreshing(false);
  }, [loadRentals]);

  const renderItem = ({ item }: { item: CourtRental }) => (
    <CourtCard
      rental={item}
      onPress={() => handleNavigateToCourtDetail(item.id)}
    />
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

  const keyExtractor = (item: CourtRental) => item.id;

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#F5B740" />
          <Text style={styles.emptyText}>대관 정보를 불러오는 중...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>🏀</Text>
        <Text style={styles.emptyText}>
          현재 등록된 대관 정보가 없습니다
        </Text>
        <Text style={styles.emptySubtext}>
          새로운 대관 정보가 곧 업데이트됩니다!
        </Text>
      </View>
    );
  };

  const hasActiveFilters =
    appliedFilters.startDate !== null ||
    appliedFilters.endDate !== null ||
    appliedFilters.maxPrice < 200000 ||
    appliedFilters.location.length > 0 ||
    appliedFilters.platform.length > 0;

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatPrice = (price: number) => {
    const manWon = Math.floor(price / 10000);
    return `${manWon}만원 이하`;
  };

  const renderFilterChips = () => {
    if (!hasActiveFilters) return null;

    return (
      <View style={styles.filterChipsContainer}>
        {appliedFilters.startDate && (
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>
              {formatDate(appliedFilters.startDate)}
              {appliedFilters.endDate && ` ~ ${formatDate(appliedFilters.endDate)}`}
            </Text>
            <Pressable onPress={() => handleRemoveFilter('startDate')}>
              <X size={14} color="#111111" />
            </Pressable>
          </View>
        )}

        {appliedFilters.maxPrice < 200000 && (
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>{formatPrice(appliedFilters.maxPrice)}</Text>
            <Pressable onPress={() => handleRemoveFilter('maxPrice')}>
              <X size={14} color="#111111" />
            </Pressable>
          </View>
        )}

        {appliedFilters.location.length > 0 && (
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>
              {appliedFilters.location.join(', ')}
            </Text>
            <Pressable onPress={() => handleRemoveFilter('location')}>
              <X size={14} color="#111111" />
            </Pressable>
          </View>
        )}

        {appliedFilters.platform.length > 0 && (
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>
              {appliedFilters.platform
                .map((p) => (p === 'daum' ? '다음' : '네이버'))
                .join(', ')}
            </Text>
            <Pressable onPress={() => handleRemoveFilter('platform')}>
              <X size={14} color="#111111" />
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            <View style={styles.headerContent}>
              <Pressable
                onPress={handleNavigateToHome}
                style={styles.homeButton}
                android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true }}
              >
                <House size={24} color="#111111" />
              </Pressable>
              <Text style={styles.headerTitle}>🏀 농구장 대관 정보</Text>
              <Pressable
                onPress={handleOpenFilter}
                style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
                android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true }}
              >
                <SlidersHorizontal size={24} color="#111111" />
              </Pressable>
            </View>
          </View>

          {/* Filter Chips */}
          {renderFilterChips()}

          {/* Court Rental List */}
          <FlatList
            data={filteredRentals}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.listContent,
              filteredRentals.length === 0 && styles.listContentEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={renderRefreshControl()}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            ListEmptyComponent={renderEmptyComponent()}
          />

          {/* Filter Bottom Sheet */}
          <FilterBottomSheet
            ref={bottomSheetRef}
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleApplyFilter}
            onReset={handleResetFilter}
          />
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
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
  header: {
    zIndex: 10,
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
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 32,
    color: '#111111',
  },
  headerSpacer: {
    width: 40,
  },
  filterButton: {
    padding: 8,
    borderRadius: 9999,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5B740',
    zIndex: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    zIndex: 10,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 400,
    zIndex: 10,
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

export default CourtListScreen;
