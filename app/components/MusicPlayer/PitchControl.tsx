import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';

/**
 * Pitch Control Component
 *
 * 음정(키) 조절을 위한 UI 컴포넌트
 * - 반음 단위 슬라이더 (-6 ~ +6)
 * - 현재 값 표시 (예: "+2 반음 (♯♯)")
 * - 프리셋 버튼 (남성 -2, 여성 +2, 초기화)
 * - Android 음질 제한 경고 메시지
 */
interface PitchControlProps {
  semitones: number;
  onPitchChange: (semitones: number) => void;
  onReset: () => void;
  enabled: boolean;
  onToggle: () => void;
}

export const PitchControl: React.FC<PitchControlProps> = ({
  semitones,
  onPitchChange,
  onReset,
  enabled,
  onToggle,
}) => {
  /**
   * 피치 레이블 렌더링
   * @param semitones - 반음 값
   * @returns 포맷된 레이블 (예: "+2 반음 (♯♯)", "-3 반음 (♭♭♭)")
   */
  const renderPitchLabel = (semitones: number) => {
    if (semitones === 0) return '원본 키';

    const symbol = semitones > 0 ? '♯' : '♭';
    const count = Math.abs(semitones);
    const symbols = symbol.repeat(count);

    return `${semitones > 0 ? '+' : ''}${semitones} 반음 (${symbols})`;
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>키 조절 (Pitch)</Text>
        <TouchableOpacity
          style={[styles.toggleButton, enabled && styles.toggleButtonActive]}
          onPress={onToggle}
        >
          <Text style={styles.toggleText}>{enabled ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>

      {/* 피치 슬라이더 */}
      <View style={styles.control}>
        <View style={styles.labelRow}>
          <Text style={styles.rangeLabel}>-6 (낮게)</Text>
          <Text style={styles.currentValue}>{renderPitchLabel(semitones)}</Text>
          <Text style={styles.rangeLabel}>+6 (높게)</Text>
        </View>

        <Slider
          style={styles.slider}
          minimumValue={-6}
          maximumValue={6}
          step={1}
          value={semitones}
          onValueChange={onPitchChange}
          minimumTrackTintColor="#FF9500"
          maximumTrackTintColor="#ddd"
          disabled={!enabled}
        />
      </View>

      {/* 프리셋 버튼 */}
      <View style={styles.presets}>
        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => onPitchChange(-2)}
          disabled={!enabled}
        >
          <Text style={[styles.presetText, !enabled && styles.presetTextDisabled]}>
            남성 -2
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.presetButton}
          onPress={onReset}
          disabled={!enabled}
        >
          <Text style={[styles.presetText, !enabled && styles.presetTextDisabled]}>
            초기화 (0)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => onPitchChange(2)}
          disabled={!enabled}
        >
          <Text style={[styles.presetText, !enabled && styles.presetTextDisabled]}>
            여성 +2
          </Text>
        </TouchableOpacity>
      </View>

      {/* 설명 및 경고 메시지 */}
      <View style={styles.hintContainer}>
        <Text style={styles.hint}>
          💡 반음 단위로 키를 조절할 수 있습니다. 템포는 변하지 않습니다.
        </Text>

        {/* Android 음질 경고 */}
        {Platform.OS === 'android' && enabled && (
          <Text style={styles.warning}>
            ⚠️ Android에서는 음질이 iOS보다 낮을 수 있습니다.
          </Text>
        )}

        {/* 피치 활성화 안내 */}
        {enabled && (
          <Text style={styles.info}>
            ℹ️ 피치 조절을 사용하려면 TrackPlayer를 일시정지하고 expo-av를 재생하세요.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: '#FF9500',
  },
  toggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  control: {
    marginBottom: 15,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#999',
  },
  currentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  presetButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  presetText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  presetTextDisabled: {
    color: '#999',
  },
  hintContainer: {
    marginTop: 5,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  warning: {
    fontSize: 12,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 11,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 5,
  },
});
