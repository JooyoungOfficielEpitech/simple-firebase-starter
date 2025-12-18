import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

/**
 * Props for the useMetronome hook
 *
 * @interface UseMetronomeProps
 * @property {number} bpm - Beats per minute (recommended range: 40-240)
 * @property {boolean} enabled - Whether the metronome is active
 * @property {number} [volume=0.7] - Volume level (0.0 to 1.0)
 * @property {Object} [timeSignature={ beats: 4, noteValue: 4 }] - Time signature configuration
 * @property {number} timeSignature.beats - Number of beats per measure
 * @property {number} timeSignature.noteValue - Note value that gets one beat
 */
interface UseMetronomeProps {
  bpm: number;
  enabled: boolean;
  volume?: number;
  timeSignature?: { beats: number; noteValue: number };
}

/**
 * Return value from the useMetronome hook
 *
 * @interface UseMetronomeReturn
 * @property {number} currentBeat - Current beat index (0-based, wraps at totalBeats)
 * @property {number} totalBeats - Total number of beats in the measure
 * @property {boolean} isReady - Whether the metronome sounds are loaded and ready
 * @property {string | null} error - Error message if sound loading failed, null otherwise
 * @property {() => void} resetBeat - Function to reset the beat counter to 0
 */
interface UseMetronomeReturn {
  currentBeat: number;
  totalBeats: number;
  isReady: boolean;
  error: string | null;
  resetBeat: () => void;
}

/**
 * 메트로놈 Hook
 *
 * BPM 기반 정확한 타이밍으로 메트로놈을 실행합니다.
 * expo-av를 사용하여 사운드를 재생하며, 강박/약박을 구분합니다.
 *
 * @param bpm - 분당 박자수 (40-240)
 * @param enabled - 메트로놈 활성화 여부
 * @param volume - 볼륨 (0.0-1.0, 기본값: 0.7)
 * @param timeSignature - 박자 정보 (기본값: 4/4 박자)
 * @returns 현재 박자, 전체 박자 수, 준비 상태, 에러 정보
 */
export const useMetronome = ({
  bpm,
  enabled,
  volume = 0.7,
  timeSignature = { beats: 4, noteValue: 4 },
}: UseMetronomeProps): UseMetronomeReturn => {
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const highTick = useRef<Audio.Sound | null>(null);
  const lowTick = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const beatCounterRef = useRef(0); // 박자 카운터를 ref로 관리

  // 컴포넌트 마운트 상태 추적
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 박자 리셋 함수 (A-B 루프 재시작 시 호출용)
  const resetBeat = useCallback(() => {
    console.log('🔄 메트로놈 박자 리셋 (A-B 루프 재시작)');
    beatCounterRef.current = 0;
    setCurrentBeat(0);
  }, []);

  // 사운드 로드
  useEffect(() => {
    let mounted = true;

    const loadSounds = async () => {
      try {
        console.log('🎵 메트로놈 사운드 로드 시작...');

        // Audio 세션 설정 (iOS에서 다른 오디오와 믹싱 가능하도록)
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });

        // 사운드 객체 생성
        const high = new Audio.Sound();
        const low = new Audio.Sound();

        try {
          // 사운드 파일 로드 시도 (WAV 형식)
          await high.loadAsync(require('../../assets/sounds/metronome-high.wav'));
          await low.loadAsync(require('../../assets/sounds/metronome-low.wav'));

          console.log('✅ 메트로놈 사운드 파일 로드 완료');
        } catch (loadError) {
          console.warn('⚠️ 메트로놈 사운드 파일 로드 실패:', loadError);
          console.warn('무음 모드로 실행됩니다 (박자 시각화만 동작)');
          // 사운드 파일이 없어도 메트로놈은 동작 (currentBeat 카운팅)
        }

        if (!mounted) {
          await high.unloadAsync().catch(() => {});
          await low.unloadAsync().catch(() => {});
          return;
        }

        highTick.current = high;
        lowTick.current = low;

        // 볼륨 설정 (사운드가 로드된 경우만)
        try {
          const highStatus = await high.getStatusAsync();
          const lowStatus = await low.getStatusAsync();

          if (highStatus.isLoaded) {
            await high.setVolumeAsync(volume);
          }
          if (lowStatus.isLoaded) {
            await low.setVolumeAsync(volume);
          }
        } catch (volumeError) {
          console.warn('⚠️ 볼륨 설정 실패 (무시하고 계속):', volumeError);
        }

        setIsReady(true);
        setError(null);
        console.log('✅ 메트로놈 준비 완료');
      } catch (error) {
        console.error('❌ 메트로놈 사운드 로드 실패:', error);
        setError('메트로놈 사운드 로드 실패');
        // 에러가 발생해도 무음 모드로 동작 가능
        setIsReady(true);
      }
    };

    loadSounds();

    // cleanup
    return () => {
      mounted = false;
      console.log('🧹 메트로놈 사운드 언로드 시작');

      // 타이머 정리
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // 사운드 언로드
      const unloadSounds = async () => {
        try {
          if (highTick.current) {
            await highTick.current.unloadAsync();
            highTick.current = null;
          }
          if (lowTick.current) {
            await lowTick.current.unloadAsync();
            lowTick.current = null;
          }
          console.log('✅ 메트로놈 사운드 언로드 완료');
        } catch (error) {
          console.error('메트로놈 사운드 언로드 오류:', error);
        }
      };

      unloadSounds();
    };
  }, []);

  // 볼륨 업데이트
  useEffect(() => {
    const updateVolume = async () => {
      try {
        if (highTick.current) {
          const status = await highTick.current.getStatusAsync();
          if (status.isLoaded) {
            await highTick.current.setVolumeAsync(volume);
          }
        }
        if (lowTick.current) {
          const status = await lowTick.current.getStatusAsync();
          if (status.isLoaded) {
            await lowTick.current.setVolumeAsync(volume);
          }
        }
      } catch (error) {
        console.warn('⚠️ 볼륨 설정 오류 (무시하고 계속):', error);
      }
    };

    if (isReady) {
      updateVolume();
    }
  }, [volume, isReady]);

  // 메트로놈 실행
  useEffect(() => {
    if (!enabled || !isReady) {
      // 메트로놈 비활성화 시 정리
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      beatCounterRef.current = 0;
      setCurrentBeat(0);
      return;
    }

    // BPM을 밀리초 간격으로 변환
    const interval = 60000 / bpm;
    beatCounterRef.current = 0; // 시작 시 리셋

    console.log(`🎵 메트로놈 시작 - BPM: ${bpm}, Interval: ${interval.toFixed(2)}ms`);

    const playTick = async () => {
      if (!isMountedRef.current) return;

      try {
        // 강박(첫 박) vs 약박
        const isFirstBeat = beatCounterRef.current === 0;
        const sound = isFirstBeat ? highTick.current : lowTick.current;

        // 사운드가 로드되어 있으면 재생
        if (sound) {
          try {
            // replayAsync: 재생 중이면 정지하고 처음부터 다시 재생
            await sound.replayAsync();
          } catch (replayError) {
            // replayAsync 실패 시 fallback: 수동으로 정지 후 재생
            try {
              await sound.stopAsync();
              await sound.setPositionAsync(0);
              await sound.playAsync();
            } catch (fallbackError) {
              // 재생 실패는 무시 (박자 카운팅은 계속)
            }
          }
        }

        // 현재 박자 업데이트 (사운드가 없어도 동작)
        setCurrentBeat(beatCounterRef.current);

        // 다음 박자로 이동
        beatCounterRef.current = (beatCounterRef.current + 1) % timeSignature.beats;
      } catch (error) {
        // 최상위 에러는 로깅만 하고 박자 카운팅은 계속
        if (__DEV__) console.warn('메트로놈 재생 경고:', error.message);
        setCurrentBeat(beatCounterRef.current);
        beatCounterRef.current = (beatCounterRef.current + 1) % timeSignature.beats;
      }
    };

    // 초기 즉시 재생
    playTick();

    // 이후 interval로 반복
    timerRef.current = setInterval(playTick, interval);

    // cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      console.log('🛑 메트로놈 중지');
    };
  }, [enabled, bpm, isReady, timeSignature.beats]);

  return {
    currentBeat,
    totalBeats: timeSignature.beats,
    isReady,
    error,
    resetBeat,
  };
};
