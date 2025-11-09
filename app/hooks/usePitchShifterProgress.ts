/**
 * usePitchShifterProgress Hook
 *
 * TrackPlayer의 useProgress를 대체하는 PitchShifter용 hook
 * onPlaybackProgress 이벤트를 구독하여 실시간 재생 위치를 반환
 */

import { useState, useEffect } from 'react';
import PitchShifterService from '../services/pitchShifterService';

export interface Progress {
  position: number;
  duration: number;
}

/**
 * PitchShifter의 재생 진행 상태를 추적하는 Hook
 * @returns {Progress} 현재 재생 위치와 총 길이
 */
export function usePitchShifterProgress(): Progress {
  const [progress, setProgress] = useState<Progress>({
    position: 0,
    duration: 0,
  });

  useEffect(() => {
    // onPlaybackProgress 이벤트 구독
    const unsubscribe = PitchShifterService.addProgressListener((event) => {
      setProgress({
        position: event.currentTime,
        duration: event.duration,
      });
    });

    // Cleanup: 컴포넌트 언마운트 시 구독 해제
    return unsubscribe;
  }, []);

  return progress;
}
