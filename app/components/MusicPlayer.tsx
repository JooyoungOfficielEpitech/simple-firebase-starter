import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  useProgress,
  RepeatMode,
} from 'react-native-track-player';
import { Audio } from 'expo-av';
import { UrgentDebug } from './URGENT_DEBUG';
import { MetronomeControl } from './MusicPlayer/MetronomeControl';
import { SimpleTest } from './MusicPlayer/SimpleTest';
import { useMetronome } from '../hooks/useMetronome';

const MusicPlayer = () => {
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const [isInitialized, setIsInitialized] = useState(false);
  const [abLoop, setAbLoop] = useState({ a: null, b: null, enabled: false });
  const [initStatus, setInitStatus] = useState('대기 중...');

  // A-B 루프 재시작 감지를 위한 이전 위치 추적
  const prevPositionRef = useRef(0);

  // 메트로놈 상태
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(120);
  const [metronomeVolume, setMetronomeVolume] = useState(0.7);

  // 메트로놈 Hook 사용
  const { currentBeat, totalBeats, isReady, error, resetBeat } = useMetronome({
    bpm: metronomeBpm,
    enabled: metronomeEnabled,
    volume: metronomeVolume,
  });

  // TrackPlayer 초기화 (DevSettings 방식과 동일하게)
  useEffect(() => {
    const initializePlayer = async () => {
      try {
        setInitStatus('초기화 시작...');
        console.log('🎵 MusicPlayer TrackPlayer 초기화 시작...');
        console.log('🔍 MusicPlayer 현재 TrackPlayer 상태 확인...');
        
        // 현재 TrackPlayer 상태 먼저 확인
        try {
          const currentState = await TrackPlayer.getState();
          console.log('📊 MusicPlayer 현재 TrackPlayer 상태:', currentState);
        } catch (stateError) {
          console.log('⚠️ MusicPlayer TrackPlayer 상태 확인 실패:', stateError.message);
        }
        
        // service.js 로드 상태 확인
        console.log('🔍 service.js 로드 상태 확인...');
        console.log('global.setABLoop 존재 여부:', typeof global.setABLoop);
        console.log('global.getABLoop 존재 여부:', typeof global.getABLoop);
        console.log('global.isPlayerInitialized 존재 여부:', typeof global.isPlayerInitialized);
        
        // 이미 초기화되었는지 확인
        if (typeof global.isPlayerInitialized === 'function' && global.isPlayerInitialized()) {
          console.log('✅ MusicPlayer TrackPlayer 이미 초기화됨 - 건너뛰기');
          setInitStatus('✅ 이미 초기화됨 (중복 방지)');
        } else {
          // DevSettings와 동일한 방식으로 초기화
          setInitStatus('설정 중...');
          console.log('⚙️ MusicPlayer TrackPlayer.setupPlayer() 호출...');
          await TrackPlayer.setupPlayer({
            waitForBuffer: true,
          });
          console.log('✅ MusicPlayer TrackPlayer.setupPlayer() 완료');
          setInitStatus('✅ 새로 초기화 완료');
          
          // 초기화 상태 업데이트
          if (typeof global.setPlayerInitialized === 'function') {
            global.setPlayerInitialized(true);
          }
        }
        
        // 이전 큐가 있다면 클리어
        try {
          await TrackPlayer.reset();
          console.log('🧹 TrackPlayer 큐 클리어 완료');
        } catch (resetError) {
          console.log('ℹ️ TrackPlayer 큐 클리어 스킵 (빈 큐)');
        }
        
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
          // iOS 백그라운드 재생을 위한 추가 설정
          progressUpdateEventInterval: 1,
        });
        console.log('⚙️ TrackPlayer 옵션 설정 완료');

        // 음량을 최대치로 설정
        await TrackPlayer.setVolume(1.0);
        console.log('🔊 TrackPlayer 음량 최대치로 설정 (1.0)');

        // 샘플 트랙 추가
        await TrackPlayer.add({
          id: 'music-player-track',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          title: 'Music Player Song',
          artist: 'Music Player',
          duration: 194,
        });
        console.log('🎵 트랙 추가 완료');

        setIsInitialized(true);
        setInitStatus('✅ 완전 초기화 완료');
        console.log('✅ MusicPlayer 초기화 완료');
      } catch (error) {
        console.error('❌ TrackPlayer 초기화 실패:', error);
        console.error('❌ 에러 스택:', error.stack);
        
        // 더 구체적인 에러 메시지
        let errorMessage = '플레이어 초기화에 실패했습니다.';
        if (error.message?.includes('not initialized')) {
          errorMessage = 'TrackPlayer 서비스 등록 문제입니다.';
        } else if (error.message?.includes('permission')) {
          errorMessage = '오디오 권한 문제입니다.';
        }
        
        setInitStatus(`❌ 오류: ${errorMessage}`);
        Alert.alert('TrackPlayer 오류', `${errorMessage}\n\n${error.message}`);
        setIsInitialized(false);
      }
    };

    // service.js가 완전히 로드될 때까지 잠시 대기
    setTimeout(() => {
      initializePlayer();
    }, 1000); // 1초 지연

    // cleanup 함수 - 컴포넌트 언마운트 시 호출
    return () => {
      console.log('🧹 MusicPlayer cleanup 시작');
      try {
        // A-B 루프 비활성화
        if (typeof global.setABLoop === 'function') {
          global.setABLoop(false, null, null);
        }
        // A-B 루프 체크 중지
        if (typeof global.stopABLoopCheck === 'function') {
          global.stopABLoopCheck();
        }
      } catch (error) {
        console.error('MusicPlayer cleanup 오류:', error);
      }
    };
  }, []);

  // A-B 루프는 이제 service.js에서 처리됩니다
  // 포그라운드에서는 상태만 서비스에 전달
  useEffect(() => {
    if (typeof global.setABLoop === 'function') {
      global.setABLoop(abLoop.enabled, abLoop.a, abLoop.b);
    }
  }, [abLoop]);

  // A-B 루프 재시작 감지 → 메트로놈 박자 리셋
  useEffect(() => {
    if (!abLoop.enabled || !metronomeEnabled || abLoop.a === null || abLoop.b === null) {
      // 비활성화 시 이전 위치 초기화
      prevPositionRef.current = 0;
      return;
    }

    const currentPosition = progress.position;

    // 위치가 뒤로 점프했고 (B → A), A 포인트 근처라면 루프 재시작으로 판단
    if (currentPosition < prevPositionRef.current - 1 && // 1초 이상 뒤로 점프
        Math.abs(currentPosition - abLoop.a) < 2) { // A 포인트 근처 (±2초)
      console.log(`🔄 A-B 루프 재시작 감지: ${prevPositionRef.current.toFixed(1)}s → ${currentPosition.toFixed(1)}s`);
      resetBeat();
    }

    prevPositionRef.current = currentPosition;
  }, [progress.position, abLoop, metronomeEnabled, resetBeat]);

  const togglePlayback = async () => {
    if (!isInitialized) {
      Alert.alert('알림', 'TrackPlayer가 아직 초기화되지 않았습니다.');
      return;
    }

    try {
      if (playbackState?.state === State.Playing) {
        await TrackPlayer.pause();
        console.log('⏸️ TrackPlayer 일시정지');
      } else {
        await TrackPlayer.play();
        console.log('▶️ TrackPlayer 재생');
      }
    } catch (error) {
      console.error('❌ 재생/일시정지 오류:', error);
      Alert.alert('재생 오류', error.message);
    }
  };

  const setLoopPoint = async (point: 'a' | 'b') => {
    if (!isInitialized) {
      Alert.alert('알림', 'TrackPlayer가 아직 초기화되지 않았습니다.');
      return;
    }

    try {
      // 실시간 위치를 직접 가져오기 (progress.position은 지연될 수 있음)
      const currentPosition = await TrackPlayer.getPosition();

      if (!currentPosition || currentPosition === 0) {
        Alert.alert('알림', '재생 중일 때 루프 포인트를 설정할 수 있습니다.');
        return;
      }

      setAbLoop(prev => ({
        ...prev,
        [point]: currentPosition,
      }));

      console.log(`📍 ${point.toUpperCase()} 포인트 설정: ${currentPosition.toFixed(2)}초`);
      Alert.alert('루프 포인트 설정', `${point.toUpperCase()} 포인트: ${currentPosition.toFixed(1)}초`);
    } catch (error) {
      console.error('❌ 루프 포인트 설정 오류:', error);
      Alert.alert('오류', '루프 포인트 설정에 실패했습니다.');
    }
  };

  const toggleLoop = () => {
    if (abLoop.a !== null && abLoop.b !== null) {
      const newEnabled = !abLoop.enabled;
      setAbLoop(prev => ({ ...prev, enabled: newEnabled }));
      Alert.alert(
        'A-B 루프', 
        newEnabled 
          ? `백그라운드 A-B 루프 활성화!\nA: ${Math.floor(abLoop.a)}초 → B: ${Math.floor(abLoop.b)}초`
          : 'A-B 루프 비활성화'
      );
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
        <UrgentDebug />
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ff0000', textAlign: 'center', marginTop: 20 }}>
          플레이어 초기화 중...
        </Text>
      </View>
    );
  }

  // 로딩 상태 체크: 플레이어 초기화 중이거나 메트로놈이 준비되지 않았을 때
  const isLoading = !isInitialized || !isReady

  // 로딩 중이면 스피너 표시
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          음악과 메트로놈을 준비하는 중...
        </Text>
        <Text style={{ marginTop: 8, fontSize: 14, color: '#999' }}>
          {initStatus}
        </Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <UrgentDebug />
      <Text style={styles.title}>뮤직 플레이어</Text>

      {/* 테스트 컴포넌트 - 이게 보이면 렌더링 성공 */}
      <SimpleTest />

      {/* 디버그: 컴포넌트 렌더링 확인 */}
      <View style={{ backgroundColor: '#ffcccc', padding: 10, marginVertical: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ff0000' }}>🔍 디버그 정보</Text>
        <Text>메트로놈 활성: {metronomeEnabled ? 'ON' : 'OFF'}</Text>
        <Text>BPM: {metronomeBpm}</Text>
        <Text>현재 박자: {currentBeat}/{totalBeats}</Text>
        <Text>메트로놈 준비: {isReady ? 'YES' : 'NO'}</Text>
        <Text>메트로놈 에러: {error || '없음'}</Text>
      </View>

      {/* 메트로놈 컨트롤 */}
      <View style={{ backgroundColor: '#ccffcc', padding: 10, marginVertical: 5 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#008800' }}>
          ⬇️ MetronomeControl 컴포넌트 (아래에 렌더링되어야 함)
        </Text>
      </View>
      <MetronomeControl
        enabled={metronomeEnabled}
        bpm={metronomeBpm}
        volume={metronomeVolume}
        currentBeat={currentBeat}
        totalBeats={totalBeats}
        isReady={isReady}
        error={error}
        onToggle={() => setMetronomeEnabled(!metronomeEnabled)}
        onBpmChange={setMetronomeBpm}
        onVolumeChange={setMetronomeVolume}
      />

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
            {playbackState?.state === State.Playing ? '⏸️' : '▶️'}
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
            {abLoop.enabled ? '🔁 백그라운드 루프 ON' : '🔁 루프 OFF'}
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
        <Text style={styles.initStatus}>초기화: {initStatus}</Text>
        <Text>재생 상태: {playbackState?.state ?? 'Unknown'}</Text>
        {abLoop.enabled && (
          <Text style={styles.loopStatus}>
            🔄 백그라운드 A-B 루프 활성 ({formatTime(abLoop.a)} - {formatTime(abLoop.b)})
          </Text>
        )}
        {metronomeEnabled && (
          <Text style={styles.metronomeStatus}>
            🎵 메트로놈 활성 ({metronomeBpm} BPM)
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
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
  initStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  loopStatus: {
    color: '#ff6600',
    fontWeight: 'bold',
    marginTop: 5,
  },
  metronomeStatus: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 5,
  },
  pitchStatus: {
    color: '#FF9500',
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export { MusicPlayer };
export default MusicPlayer;