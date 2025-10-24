import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  useProgress,
  RepeatMode,
} from 'react-native-track-player';

const MusicPlayer = () => {
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const [isInitialized, setIsInitialized] = useState(false);
  const [abLoop, setAbLoop] = useState({ a: null, b: null, enabled: false });

  // TrackPlayer 초기화
  useEffect(() => {
    const initializePlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
        
        // 백그라운드 재생 설정
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
          ],
        });

        // 샘플 트랙 추가
        await TrackPlayer.add({
          id: 'track1',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          title: 'Sample Song 1',
          artist: 'Sample Artist',
          duration: 194,
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize player:', error);
        Alert.alert('오류', '플레이어 초기화에 실패했습니다.');
      }
    };

    initializePlayer();
  }, []);

  // A-B 루프 체크
  useEffect(() => {
    if (abLoop.enabled && abLoop.a !== null && abLoop.b !== null) {
      if (progress.position >= abLoop.b) {
        TrackPlayer.seekTo(abLoop.a);
      }
    }
  }, [progress.position, abLoop]);

  const togglePlayback = async () => {
    if (playbackState === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const setLoopPoint = (point: 'a' | 'b') => {
    const currentPosition = progress.position;
    setAbLoop(prev => ({
      ...prev,
      [point]: currentPosition,
    }));
    Alert.alert('루프 포인트 설정', `${point.toUpperCase()} 포인트: ${Math.floor(currentPosition)}초`);
  };

  const toggleLoop = () => {
    if (abLoop.a !== null && abLoop.b !== null) {
      setAbLoop(prev => ({ ...prev, enabled: !prev.enabled }));
    } else {
      Alert.alert('알림', 'A, B 포인트를 먼저 설정해주세요.');
    }
  };

  const clearLoop = () => {
    setAbLoop({ a: null, b: null, enabled: false });
    Alert.alert('루프 해제', 'A-B 루프가 해제되었습니다.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text>플레이어 초기화 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>뮤직 플레이어</Text>
      
      {/* 진행률 표시 */}
      <View style={styles.progressContainer}>
        <Text>{formatTime(progress.position)}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(progress.position / progress.duration) * 100}%` }
            ]} 
          />
          
          {/* A-B 루프 포인트 표시 */}
          {abLoop.a !== null && (
            <View 
              style={[
                styles.loopPoint, 
                styles.pointA,
                { left: `${(abLoop.a / progress.duration) * 100}%` }
              ]} 
            />
          )}
          {abLoop.b !== null && (
            <View 
              style={[
                styles.loopPoint, 
                styles.pointB,
                { left: `${(abLoop.b / progress.duration) * 100}%` }
              ]} 
            />
          )}
        </View>
        <Text>{formatTime(progress.duration)}</Text>
      </View>

      {/* 재생 컨트롤 */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={togglePlayback}
        >
          <Text style={styles.buttonText}>
            {playbackState === State.Playing ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* A-B 루프 컨트롤 */}
      <View style={styles.loopControls}>
        <TouchableOpacity 
          style={[styles.smallButton, abLoop.a !== null && styles.activeButton]} 
          onPress={() => setLoopPoint('a')}
        >
          <Text style={styles.smallButtonText}>A 설정</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.smallButton, abLoop.b !== null && styles.activeButton]} 
          onPress={() => setLoopPoint('b')}
        >
          <Text style={styles.smallButtonText}>B 설정</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.smallButton, 
            abLoop.enabled && styles.loopActiveButton
          ]} 
          onPress={toggleLoop}
        >
          <Text style={styles.smallButtonText}>
            루프 {abLoop.enabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.smallButton} 
          onPress={clearLoop}
        >
          <Text style={styles.smallButtonText}>루프 해제</Text>
        </TouchableOpacity>
      </View>

      {/* 상태 정보 */}
      <View style={styles.status}>
        <Text>상태: {playbackState}</Text>
        {abLoop.enabled && (
          <Text style={styles.loopStatus}>
            🔄 A-B 루프 활성 ({formatTime(abLoop.a)} - {formatTime(abLoop.b)})
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 10,
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  loopPoint: {
    position: 'absolute',
    width: 3,
    height: 20,
    top: -8,
  },
  pointA: {
    backgroundColor: '#ff4444',
  },
  pointB: {
    backgroundColor: '#44ff44',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loopControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  smallButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  loopActiveButton: {
    backgroundColor: '#ff6600',
  },
  smallButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  status: {
    alignItems: 'center',
  },
  loopStatus: {
    color: '#ff6600',
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default MusicPlayer;