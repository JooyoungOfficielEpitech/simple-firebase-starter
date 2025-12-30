import React, { useCallback, useMemo, forwardRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { X, Calendar, DollarSign, MapPin, Tag, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export interface FilterOptions {
  startDate: Date | null;
  endDate: Date | null;
  maxPrice: number;
  location: string[];
  platform: string[];
}

interface FilterBottomSheetProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApply: () => void;
  onReset: () => void;
}

const LOCATIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산'];
const PLATFORMS = [
  { value: 'daum', label: '다음카페' },
  { value: 'naver', label: '네이버 카페' },
];

const PRICE_OPTIONS = [
  { value: 200000, label: '전체' },
  { value: 50000, label: '5만원' },
  { value: 100000, label: '10만원' },
  { value: 150000, label: '15만원' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Animated Chip Component
const AnimatedChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}> = ({ label, active, onPress, icon }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[animatedStyle]}
    >
      {active ? (
        <LinearGradient
          colors={['#F5B740', '#F2A93F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chipGradient}
        >
          {icon && <View style={styles.chipIcon}>{icon}</View>}
          <Text style={styles.chipTextActive}>{label}</Text>
        </LinearGradient>
      ) : (
        <View style={styles.chip}>
          {icon && <View style={styles.chipIcon}>{icon}</View>}
          <Text style={styles.chipText}>{label}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

// Custom Price Slider Component
const CustomSlider: React.FC<{
  value: number;
  onValueChange: (value: number) => void;
}> = ({ value, onValueChange }) => {
  const formatSliderValue = (val: number) => {
    if (val >= 200000) return '제한 없음';
    const manWon = Math.floor(val / 10000);
    return `${manWon}만원 이하`;
  };

  const percentage = ((value - 10000) / (200000 - 10000)) * 100;

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderValueDisplay}>
        <Text style={styles.sliderValueText}>{formatSliderValue(value)}</Text>
      </View>

      {/* Visual Slider Track */}
      <View style={styles.sliderTrack}>
        <Animated.View style={[styles.sliderFilled, { width: `${percentage}%` }]}>
          <LinearGradient
            colors={['#F5B740', '#F2A93F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sliderGradient}
          />
        </Animated.View>
      </View>

      {/* Quick Select Buttons */}
      <View style={styles.priceButtons}>
        {PRICE_OPTIONS.map((option) => (
          <AnimatedChip
            key={option.value}
            label={option.label}
            active={value === option.value}
            onPress={() => onValueChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
};

// Custom Date Picker Component
const CustomDatePicker: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  minimumDate?: Date;
}> = ({ visible, onClose, onSelect, minimumDate }) => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const years = Array.from({ length: 2 }, (_, i) => today.getFullYear() + i);
  const months = Array.from({ length: 12 }, (_, i) => i);
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    onSelect(date);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerModal}>
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>날짜 선택</Text>
          </View>

          <View style={styles.datePickerContent}>
            {/* Year Selector */}
            <View style={styles.datePickerSection}>
              <Text style={styles.datePickerLabel}>년도</Text>
              <View style={styles.datePickerRow}>
                {years.map((year) => (
                  <Pressable
                    key={year}
                    onPress={() => setSelectedYear(year)}
                    style={[
                      styles.datePickerButton,
                      selectedYear === year && styles.datePickerButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.datePickerButtonText,
                        selectedYear === year && styles.datePickerButtonTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Month Selector */}
            <View style={styles.datePickerSection}>
              <Text style={styles.datePickerLabel}>월</Text>
              <View style={styles.datePickerGrid}>
                {months.map((month) => (
                  <Pressable
                    key={month}
                    onPress={() => setSelectedMonth(month)}
                    style={[
                      styles.datePickerGridButton,
                      selectedMonth === month && styles.datePickerButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.datePickerButtonText,
                        selectedMonth === month && styles.datePickerButtonTextActive,
                      ]}
                    >
                      {month + 1}월
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Day Selector */}
            <View style={styles.datePickerSection}>
              <Text style={styles.datePickerLabel}>일</Text>
              <ScrollView style={styles.datePickerScrollView}>
                <View style={styles.datePickerGrid}>
                  {days.map((day) => (
                    <Pressable
                      key={day}
                      onPress={() => setSelectedDay(day)}
                      style={[
                        styles.datePickerGridButton,
                        selectedDay === day && styles.datePickerButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.datePickerButtonText,
                          selectedDay === day && styles.datePickerButtonTextActive,
                        ]}
                      >
                        {day}일
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          <View style={styles.datePickerFooter}>
            <Pressable onPress={onClose} style={styles.datePickerCancelButton}>
              <Text style={styles.datePickerCancelText}>취소</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={styles.datePickerConfirmButton}>
              <Text style={styles.datePickerConfirmText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const FilterBottomSheet = forwardRef<BottomSheet, FilterBottomSheetProps>(
  ({ filters, onFiltersChange, onApply, onReset }, ref) => {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['80%', '95%'], []);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const handleLocationToggle = (location: string) => {
      const newLocations = filters.location.includes(location)
        ? filters.location.filter((l) => l !== location)
        : [...filters.location, location];
      onFiltersChange({ ...filters, location: newLocations });
    };

    const handlePlatformToggle = (platform: string) => {
      const newPlatforms = filters.platform.includes(platform)
        ? filters.platform.filter((p) => p !== platform)
        : [...filters.platform, platform];
      onFiltersChange({ ...filters, platform: newPlatforms });
    };

    const formatDate = (date: Date | null) => {
      if (!date) return '선택 안 함';
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    const formatPrice = (price: number) => {
      if (price >= 200000) return '제한 없음';
      const manWon = Math.floor(price / 10000);
      return `${manWon}만원 이하`;
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        topInset={insets.top}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Header */}
          <LinearGradient
            colors={['#F5B740', '#F2A93F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Sparkles size={20} color="#111111" />
              <Text style={styles.headerTitle}>필터</Text>
              <Pressable onPress={onReset} style={styles.resetButton}>
                <Text style={styles.resetText}>초기화</Text>
              </Pressable>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Date Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 날짜</Text>
              <View style={styles.chipContainer}>
                <AnimatedChip
                  label="전체"
                  active={!filters.startDate && !filters.endDate}
                  onPress={() => onFiltersChange({ ...filters, startDate: null, endDate: null })}
                />

                <AnimatedChip
                  label="오늘부터"
                  active={!!filters.startDate && !filters.endDate}
                  onPress={() => {
                    const today = new Date();
                    onFiltersChange({ ...filters, startDate: today, endDate: null });
                  }}
                />

                <AnimatedChip
                  label="이번주"
                  active={!!filters.endDate}
                  onPress={() => {
                    const today = new Date();
                    const nextWeek = new Date();
                    nextWeek.setDate(today.getDate() + 7);
                    onFiltersChange({ ...filters, startDate: today, endDate: nextWeek });
                  }}
                />

                <AnimatedChip
                  label="커스텀 날짜"
                  active={false}
                  onPress={() => setShowStartDatePicker(true)}
                  icon={<Calendar size={16} color="#666666" />}
                />
              </View>

              {filters.startDate && (
                <View style={styles.selectedDateInfo}>
                  <Text style={styles.selectedDateText}>
                    {formatDate(filters.startDate)}
                    {filters.endDate && ` ~ ${formatDate(filters.endDate)}`}
                  </Text>
                </View>
              )}

              <CustomDatePicker
                visible={showStartDatePicker}
                onClose={() => setShowStartDatePicker(false)}
                onSelect={(date) => {
                  onFiltersChange({ ...filters, startDate: date });
                  setShowEndDatePicker(true);
                }}
              />

              <CustomDatePicker
                visible={showEndDatePicker}
                onClose={() => setShowEndDatePicker(false)}
                onSelect={(date) => {
                  onFiltersChange({ ...filters, endDate: date });
                }}
                minimumDate={filters.startDate || undefined}
              />
            </View>

            {/* Price Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 가격</Text>
              <CustomSlider
                value={filters.maxPrice}
                onValueChange={(value) => onFiltersChange({ ...filters, maxPrice: value })}
              />
            </View>

            {/* Location Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 지역</Text>
              <View style={styles.chipContainer}>
                {LOCATIONS.map((location) => (
                  <AnimatedChip
                    key={location}
                    label={location}
                    active={filters.location.includes(location)}
                    onPress={() => handleLocationToggle(location)}
                  />
                ))}
              </View>
            </View>

            {/* Platform Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏷️ 플랫폼</Text>
              <View style={styles.chipContainer}>
                {PLATFORMS.map((platform) => (
                  <AnimatedChip
                    key={platform.value}
                    label={platform.label}
                    active={filters.platform.includes(platform.value)}
                    onPress={() => handlePlatformToggle(platform.value)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
            <Pressable style={styles.applyButton} onPress={onApply}>
              <Text style={styles.applyButtonText}>필터 적용</Text>
            </Pressable>
          </View>

        </BottomSheetView>
      </BottomSheet>
    );
  }
);

FilterBottomSheet.displayName = 'FilterBottomSheet';

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#E5E5E5',
    width: 40,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
  },
  selectedDateInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF9F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F5B740',
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  chipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: '#F5B740',
    borderColor: '#F5B740',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  chipTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  applyButton: {
    backgroundColor: '#F5B740',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  sliderContainer: {
    marginTop: 12,
  },
  sliderValueDisplay: {
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderValueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5B740',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sliderFilled: {
    height: '100%',
  },
  sliderGradient: {
    flex: 1,
  },
  priceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  priceButtonActive: {
    backgroundColor: '#F5B740',
    borderColor: '#F5B740',
  },
  priceButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  priceButtonTextActive: {
    color: '#111111',
  },
  // Date Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.85,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  datePickerHeader: {
    backgroundColor: '#F5B740',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  datePickerContent: {
    padding: 20,
  },
  datePickerSection: {
    marginBottom: 20,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  datePickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  datePickerScrollView: {
    maxHeight: 150,
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  datePickerGridButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    minWidth: '22%',
    alignItems: 'center',
  },
  datePickerButtonActive: {
    backgroundColor: '#F5B740',
    borderColor: '#F5B740',
  },
  datePickerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  datePickerButtonTextActive: {
    color: '#111111',
  },
  datePickerFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  datePickerCancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  datePickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  datePickerConfirmButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F5B740',
  },
  datePickerConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
});
