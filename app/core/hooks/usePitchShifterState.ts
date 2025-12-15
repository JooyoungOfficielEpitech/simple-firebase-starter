/**
 * usePitchShifterState Hook
 *
 * TrackPlayer의 usePlaybackState를 대체하는 PitchShifter용 hook
 * onPlaybackStateChanged 이벤트를 구독하여 재생 상태를 반환
 */

import { useState, useEffect } from 'react';
import PitchShifterService from '../services/pitchShifterService';

export interface PlaybackState {
  isPlaying: boolean;
}

/**
 * PitchShifter의 재생 상태를 추적하는 Hook
 * @returns {PlaybackState} 현재 재생 상태 (isPlaying)
 */
export function usePitchShifterState(): PlaybackState {
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
  });

  useEffect(() => {
    // onPlaybackStateChanged 이벤트 구독
    const unsubscribe = PitchShifterService.addPlaybackStateListener((event) => {
      setState({
        isPlaying: event.isPlaying,
      });
    });

    // 초기 상태 확인
    PitchShifterService.isPlaying().then((isPlaying) => {
      setState({ isPlaying });
    }).catch((error) => {
      console.warn('⚠️ Failed to get initial playback state:', error);
    });

    // Cleanup: 컴포넌트 언마운트 시 구독 해제
    return unsubscribe;
  }, []);

  return state;
}
