/**
 * 오디오 관련 타입 정의
 * 메트로놈, Pitch 조절, 음악 플레이어
 */

/**
 * 메트로놈 상태
 */
export interface MetronomeState {
  /** 메트로놈 활성화 여부 */
  enabled: boolean;

  /** 분당 박자수 (40 ~ 240) */
  bpm: number;

  /** 볼륨 (0.0 ~ 1.0) */
  volume: number;

  /** 박자 정보 */
  timeSignature: {
    /** 한 마디의 박자 수 (예: 4) */
    beats: number;

    /** 음표 단위 (예: 4분음표 = 4) */
    noteValue: number;
  };

  /** 현재 박자 (0부터 시작) */
  currentBeat: number;
}

/**
 * Pitch 조절 상태
 */
export interface PitchState {
  /** Pitch 조절 활성화 여부 */
  enabled: boolean;

  /** 반음 단위 조절 (-6 ~ +6) */
  semitones: number;
}

/**
 * A-B 루프 상태
 */
export interface ABLoopState {
  /** A 포인트 시작 시간 (초) */
  a: number | null;

  /** B 포인트 종료 시간 (초) */
  b: number | null;

  /** 루프 활성화 여부 */
  enabled: boolean;
}

/**
 * 음악 플레이어 통합 상태
 */
export interface MusicPlayerState {
  /** 재생 상태 */
  playback: {
    /** 재생 중 여부 */
    isPlaying: boolean;

    /** 현재 재생 위치 (초) */
    position: number;

    /** 총 재생 시간 (초) */
    duration: number;
  };

  /** A-B 루프 상태 */
  abLoop: ABLoopState;

  /** 메트로놈 상태 */
  metronome: MetronomeState;

  /** Pitch 조절 상태 */
  pitch: PitchState;
}

/**
 * 메트로놈 Hook Props
 */
export interface UseMetronomeProps {
  /** 분당 박자수 */
  bpm: number;

  /** 활성화 여부 */
  enabled: boolean;

  /** 볼륨 (선택, 기본값: 0.7) */
  volume?: number;

  /** 박자 (선택, 기본값: 4/4) */
  timeSignature?: {
    beats: number;
    noteValue: number;
  };
}

/**
 * Pitch Shift Hook Props
 */
export interface UsePitchShiftProps {
  /** 오디오 Sound 객체 */
  sound: any; // expo-av Sound 타입

  /** 반음 단위 조절 */
  semitones: number;

  /** 활성화 여부 */
  enabled: boolean;
}

/**
 * 메트로놈 컨트롤 Props
 */
export interface MetronomeControlProps {
  /** 활성화 여부 */
  enabled: boolean;

  /** 분당 박자수 */
  bpm: number;

  /** 볼륨 */
  volume: number;

  /** 현재 박자 */
  currentBeat: number;

  /** 전체 박자 수 */
  totalBeats: number;

  /** 토글 핸들러 */
  onToggle: () => void;

  /** BPM 변경 핸들러 */
  onBpmChange: (bpm: number) => void;

  /** 볼륨 변경 핸들러 */
  onVolumeChange: (volume: number) => void;
}

/**
 * Pitch 컨트롤 Props
 */
export interface PitchControlProps {
  /** 반음 단위 조절 값 */
  semitones: number;

  /** Pitch 변경 핸들러 */
  onPitchChange: (semitones: number) => void;

  /** 초기화 핸들러 */
  onReset: () => void;
}

/**
 * 메트로놈 박자 표시기 Props
 */
export interface MetronomeBeatIndicatorProps {
  /** 현재 박자 (0부터 시작) */
  currentBeat: number;

  /** 전체 박자 수 */
  totalBeats: number;

  /** 활성 색상 (선택) */
  activeColor?: string;

  /** 비활성 색상 (선택) */
  inactiveColor?: string;

  /** 강박 색상 (선택) */
  accentColor?: string;
}

/**
 * 오디오 처리 서비스 인터페이스
 */
export interface AudioProcessingService {
  /**
   * Pitch shift 적용
   * @param audioData 원본 오디오 데이터
   * @param semitones 반음 단위 조절 (-6 ~ +6)
   * @returns 처리된 오디오 데이터
   */
  applyPitchShift(audioData: ArrayBuffer, semitones: number): Promise<ArrayBuffer>;

  /**
   * Time stretching (템포 변경 없이 길이 조절)
   * @param audioData 원본 오디오 데이터
   * @param factor 조절 비율 (1.0 = 원본)
   * @returns 처리된 오디오 데이터
   */
  applyTimeStretch(audioData: ArrayBuffer, factor: number): Promise<ArrayBuffer>;
}

/**
 * 메트로놈 서비스 인터페이스
 */
export interface MetronomeService {
  /**
   * 메트로놈 시작
   * @param bpm 분당 박자수
   * @param timeSignature 박자
   * @param onBeat 박자마다 호출되는 콜백
   */
  start(
    bpm: number,
    timeSignature: { beats: number; noteValue: number },
    onBeat: (beatIndex: number) => void
  ): void;

  /**
   * 메트로놈 중지
   */
  stop(): void;

  /**
   * BPM 변경
   * @param bpm 새로운 분당 박자수
   */
  setBpm(bpm: number): void;

  /**
   * 볼륨 변경
   * @param volume 볼륨 (0.0 ~ 1.0)
   */
  setVolume(volume: number): void;
}

/**
 * 음악 플레이어 설정
 */
export interface MusicPlayerConfig {
  /** 자동 재생 여부 */
  autoPlay?: boolean;

  /** 반복 재생 여부 */
  loop?: boolean;

  /** 백그라운드 재생 여부 */
  backgroundPlayback?: boolean;

  /** 메트로놈 기본 설정 */
  defaultMetronome?: {
    bpm: number;
    volume: number;
    timeSignature: { beats: number; noteValue: number };
  };

  /** Pitch 기본 설정 */
  defaultPitch?: {
    semitones: number;
  };
}

/**
 * BPM 범위 상수
 */
export const BPM_RANGE = {
  MIN: 40,
  MAX: 240,
  DEFAULT: 120,
} as const;

/**
 * Pitch 범위 상수
 */
export const PITCH_RANGE = {
  MIN: -6,
  MAX: 6,
  DEFAULT: 0,
} as const;

/**
 * 시간 단위 변환 유틸리티 타입
 */
export type TimeUnit = 'seconds' | 'milliseconds' | 'minutes';

/**
 * 오디오 품질 설정
 */
export interface AudioQualitySettings {
  /** 샘플레이트 (Hz) */
  sampleRate?: number;

  /** 비트레이트 (kbps) */
  bitRate?: number;

  /** 채널 수 (1: 모노, 2: 스테레오) */
  channels?: 1 | 2;

  /** Pitch correction 품질 */
  pitchCorrectionQuality?: 'low' | 'medium' | 'high';
}
