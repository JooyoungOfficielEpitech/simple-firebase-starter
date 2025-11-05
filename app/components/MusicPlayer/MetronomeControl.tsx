import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface MetronomeControlProps {
  enabled: boolean;
  bpm: number;
  volume: number;
  currentBeat: number;
  totalBeats: number;
  isReady: boolean;
  error: string | null;
  onToggle: () => void;
  onBpmChange: (bpm: number) => void;
  onVolumeChange: (volume: number) => void;
}

/**
 * 메트로놈 컨트롤 UI 컴포넌트
 *
 * 메트로놈 ON/OFF, BPM, 볼륨 조절 및 현재 박자 시각화를 제공합니다.
 *
 * @param enabled - 메트로놈 활성화 여부
 * @param bpm - 현재 BPM 값
 * @param volume - 현재 볼륨 값 (0.0-1.0)
 * @param currentBeat - 현재 박자 (0부터 시작)
 * @param totalBeats - 전체 박자 수
 * @param isReady - 메트로놈 준비 상태
 * @param error - 에러 메시지
 * @param onToggle - ON/OFF 토글 핸들러
 * @param onBpmChange - BPM 변경 핸들러
 * @param onVolumeChange - 볼륨 변경 핸들러
 */
export const MetronomeControl: React.FC<MetronomeControlProps> = ({
  enabled,
  bpm,
  volume,
  currentBeat,
  totalBeats,
  isReady,
  error,
  onToggle,
  onBpmChange,
  onVolumeChange,
}) => {
  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>메트로놈</Text>
          {!isReady && <Text style={styles.loadingText}>로딩 중...</Text>}
          {error && <Text style={styles.errorText}>⚠️ 무음 모드</Text>}
        </View>
        <TouchableOpacity
          style={[styles.toggleButton, enabled && styles.toggleButtonActive]}
          onPress={onToggle}
          disabled={!isReady}
        >
          <Text style={styles.toggleText}>{enabled ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>

      {/* BPM 슬라이더 */}
      <View style={styles.control}>
        <Text style={styles.label}>템포</Text>
        <Slider
          style={styles.slider}
          minimumValue={40}
          maximumValue={240}
          step={1}
          value={bpm}
          onValueChange={onBpmChange}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ddd"
          disabled={!enabled || !isReady}
          thumbTintColor={enabled && isReady ? '#007AFF' : '#ccc'}
        />
        <Text style={styles.value}>{bpm} BPM</Text>
      </View>

      {/* 볼륨 슬라이더 */}
      <View style={styles.control}>
        <Text style={styles.label}>볼륨</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={volume}
          onValueChange={onVolumeChange}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ddd"
          disabled={!enabled || !isReady}
          thumbTintColor={enabled && isReady ? '#007AFF' : '#ccc'}
        />
        <Text style={styles.value}>{Math.round(volume * 100)}%</Text>
      </View>

      {/* 박자 표시기 */}
      {enabled && isReady && (
        <View style={styles.beatIndicatorContainer}>
          <Text style={styles.beatLabel}>박자</Text>
          <View style={styles.beatIndicator}>
            {Array.from({ length: totalBeats }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.beat,
                  i === currentBeat && styles.beatActive,
                  i === 0 && styles.beatFirst,
                  i > 0 && { marginLeft: 8 },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* 도움말 */}
      {!error && (
        <Text style={styles.hint}>
          💡 BPM 40-240 범위로 조절 가능합니다.
        </Text>
      )}
      {error && (
        <Text style={styles.hint}>
          ℹ️ 사운드 파일이 없어도 박자는 시각적으로 표시됩니다.
          {'\n'}app/assets/sounds/README.md를 참고하세요.
        </Text>
      )}
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#34C759',
  },
  toggleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  control: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  value: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  beatIndicatorContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  beatLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  beatIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beat: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  beatActive: {
    backgroundColor: '#007AFF',
    transform: [{ scale: 1.3 }],
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  beatFirst: {
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },
});
