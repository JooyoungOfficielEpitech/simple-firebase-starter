import { useState, useRef, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import TrackPlayer from 'react-native-track-player';

/**
 * Dual Player Hook
 *
 * TrackPlayer와 Expo AV 사이를 전환하는 hook
 * - 피치 비활성화: TrackPlayer 사용
 * - 피치 활성화: Expo AV 사용 (pitch 지원)
 */

export type PlayerType = 'trackplayer' | 'expoav';

interface UseDualPlayerProps {
  audioUrl?: string;
  onPlaybackUpdate?: (status: AVPlaybackStatus) => void;
}

export const useDualPlayer = ({ audioUrl, onPlaybackUpdate }: UseDualPlayerProps = {}) => {
  const [playerType, setPlayerType] = useState<PlayerType>('trackplayer');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  /**
   * TrackPlayer → Expo AV 전환 (피치 활성화)
   */
  const switchToExpoAV = useCallback(async (pitchSemitones: number) => {
    if (!audioUrl || isTransitioning || playerType === 'expoav') return;

    setIsTransitioning(true);

    try {
      // 1. TrackPlayer 현재 위치 가져오기
      const position = await TrackPlayer.getPosition();
      const rate = await TrackPlayer.getRate();

      // 2. TrackPlayer 일시정지
      await TrackPlayer.pause();

      if (__DEV__) {
        console.log(`🔄 Switching to Expo AV at ${position.toFixed(2)}s (pitch: ${pitchSemitones})`);
      }

      // 3. Expo AV 로드 및 재생
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        {
          positionMillis: position * 1000,
          rate,
          shouldPlay: true,
          pitchCorrectionQuality: Audio.PitchCorrectionQuality.High,
        },
        onPlaybackUpdate
      );

      // 4. 피치 적용 (expo-av의 rate with pitch correction)
      // pitchSemitones를 rate로 변환: 2^(semitones/12)
      const pitchRate = Math.pow(2, pitchSemitones / 12);
      await sound.setRateAsync(pitchRate, true); // true = pitch correction

      soundRef.current = sound;
      setPlayerType('expoav');

      if (__DEV__) {
        console.log(`✅ Expo AV activated (pitchRate: ${pitchRate.toFixed(3)})`);
      }
    } catch (error) {
      console.error('❌ Expo AV 전환 오류:', error);
    } finally {
      setIsTransitioning(false);
    }
  }, [audioUrl, isTransitioning, playerType, onPlaybackUpdate]);

  /**
   * Expo AV → TrackPlayer 전환 (피치 비활성화)
   */
  const switchToTrackPlayer = useCallback(async () => {
    if (isTransitioning || playerType === 'trackplayer') return;

    setIsTransitioning(true);

    try {
      const sound = soundRef.current;
      if (!sound) {
        setPlayerType('trackplayer');
        setIsTransitioning(false);
        return;
      }

      // 1. Expo AV 현재 위치 가져오기
      const status = await sound.getStatusAsync();
      const position = status.isLoaded ? status.positionMillis / 1000 : 0;

      if (__DEV__) {
        console.log(`🔄 Switching to TrackPlayer at ${position.toFixed(2)}s`);
      }

      // 2. Expo AV 정지 및 해제
      await sound.stopAsync();
      await sound.unloadAsync();
      soundRef.current = null;

      // 3. TrackPlayer 재개
      await TrackPlayer.seekTo(position);
      await TrackPlayer.play();

      setPlayerType('trackplayer');

      if (__DEV__) {
        console.log('✅ TrackPlayer activated');
      }
    } catch (error) {
      console.error('❌ TrackPlayer 전환 오류:', error);
    } finally {
      setIsTransitioning(false);
    }
  }, [isTransitioning, playerType]);

  /**
   * Expo AV 피치 업데이트 (이미 Expo AV 모드일 때)
   */
  const updatePitch = useCallback(async (pitchSemitones: number) => {
    const sound = soundRef.current;
    if (!sound || playerType !== 'expoav') return;

    try {
      const pitchRate = Math.pow(2, pitchSemitones / 12);
      await sound.setRateAsync(pitchRate, true);

      if (__DEV__) {
        console.log(`🎹 Pitch updated: ${pitchSemitones} semitones (rate: ${pitchRate.toFixed(3)})`);
      }
    } catch (error) {
      console.error('❌ Pitch 업데이트 오류:', error);
    }
  }, [playerType]);

  /**
   * Get current position (supports both players)
   */
  const getPosition = useCallback(async (): Promise<number> => {
    try {
      if (playerType === 'trackplayer') {
        return await TrackPlayer.getPosition();
      } else if (playerType === 'expoav') {
        const sound = soundRef.current;
        if (sound) {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            return status.positionMillis / 1000;
          }
        }
      }
    } catch (error) {
      console.error('❌ Get Position 오류:', error);
    }
    return 0;
  }, [playerType]);

  /**
   * Seek to position (supports both players)
   */
  const seekTo = useCallback(async (positionSeconds: number) => {
    try {
      if (playerType === 'trackplayer') {
        await TrackPlayer.seekTo(positionSeconds);
      } else if (playerType === 'expoav') {
        const sound = soundRef.current;
        if (sound) {
          await sound.setPositionAsync(positionSeconds * 1000);
        }
      }
    } catch (error) {
      console.error('❌ Seek 오류:', error);
    }
  }, [playerType]);

  /**
   * Play/Pause controls (supports both players)
   */
  const play = useCallback(async () => {
    try {
      if (playerType === 'trackplayer') {
        await TrackPlayer.play();
      } else if (playerType === 'expoav') {
        const sound = soundRef.current;
        if (sound) {
          await sound.playAsync();
        }
      }
    } catch (error) {
      console.error('❌ Play 오류:', error);
    }
  }, [playerType]);

  const pause = useCallback(async () => {
    try {
      if (playerType === 'trackplayer') {
        await TrackPlayer.pause();
      } else if (playerType === 'expoav') {
        const sound = soundRef.current;
        if (sound) {
          await sound.pauseAsync();
        }
      }
    } catch (error) {
      console.error('❌ Pause 오류:', error);
    }
  }, [playerType]);

  /**
   * Cleanup
   */
  const cleanup = useCallback(async () => {
    const sound = soundRef.current;
    if (sound) {
      try {
        await sound.unloadAsync();
        soundRef.current = null;
      } catch (error) {
        console.error('❌ Cleanup 오류:', error);
      }
    }
  }, []);

  return {
    playerType,
    isTransitioning,
    switchToExpoAV,
    switchToTrackPlayer,
    updatePitch,
    getPosition,
    seekTo,
    play,
    pause,
    cleanup,
    expoSound: soundRef.current,
  };
};
