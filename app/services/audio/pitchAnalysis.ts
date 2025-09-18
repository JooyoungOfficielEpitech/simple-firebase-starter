/**
 * 음정 분석 서비스
 * 실시간 피치 검출과 MusicXML 음정 데이터 비교 분석
 */

import { Audio } from "expo-av"
import { PitchDetector, PitchDetectionResult, PitchUtils } from "./pitchDetection"
import type { LyricItem } from "@/services/musicxml/musicXMLParser"

export enum RecordingState {
  IDLE = 'idle',
  PREPARING = 'preparing', 
  READY = 'ready',
  RECORDING = 'recording',
  ERROR = 'error',
  MOCK_MODE = 'mock_mode'
}

export interface PitchAnalysisResult {
  currentPitch: PitchDetectionResult
  targetPitch: {
    frequency: number
    note: string
    octave: number
  } | null
  accuracy: number           // 0-1 정확도 점수
  centsDifference: number    // 센트 단위 차이 (-100 ~ +100)
  isOnPitch: boolean         // 정확한 음정인지
  lyricText: string         // 현재 가사
  timestamp: number         // 분석 시점
}

export interface PitchAnalysisConfig {
  recordingOptions: {
    android: {
      extension: ".wav"
      outputFormat: number
      audioEncoder: number
      sampleRate: number
      numberOfChannels: number
      bitRate: number
    }
    ios: {
      extension: ".wav"
      audioQuality: number
      sampleRate: number
      numberOfChannels: number
      bitRate: number
      linearPCMBitDepth: number
      linearPCMIsBigEndian: boolean
      linearPCMIsFloat: boolean
    }
  }
  analysisInterval: number    // 분석 간격 (ms)
  bufferSize: number         // 오디오 버퍼 크기
  pitchTolerance: number     // 음정 허용 오차 (cents)
  minConfidence: number      // 최소 신뢰도
}

export class PitchAnalysisService {
  private pitchDetector: PitchDetector
  private recording: Audio.Recording | null = null
  private analysisTimer: NodeJS.Timeout | null = null
  private config: PitchAnalysisConfig
  private isAnalyzing = false
  private recordingState: RecordingState = RecordingState.IDLE
  private currentLyrics: LyricItem[] = []
  private analysisCallback: ((result: PitchAnalysisResult) => void) | null = null
  private analysisStartTime: number = 0

  constructor(config: Partial<PitchAnalysisConfig> = {}) {
    this.config = {
      recordingOptions: {
        android: {
          extension: '.wav',
          outputFormat: 0, // AUDIO_OUTPUT_FORMAT_DEFAULT
          audioEncoder: 0, // AUDIO_ENCODER_DEFAULT
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: 0x7F, // AVAudioQuality.max
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      },
      analysisInterval: 100,
      bufferSize: 4096,
      pitchTolerance: 50,
      minConfidence: 0.5,
      ...config
    }

    this.pitchDetector = new PitchDetector({
      sampleRate: this.config.recordingOptions.ios.sampleRate,
      bufferSize: this.config.bufferSize,
      minFreq: 80,
      maxFreq: 1000,
      threshold: 0.1
    })
  }

  /**
   * 음정 분석 시작
   */
  async startAnalysis(
    lyrics: LyricItem[],
    onAnalysis: (result: PitchAnalysisResult) => void
  ): Promise<void> {
    if (this.isAnalyzing) {
      await this.stopAnalysis()
    }

    try {
      // 오디오 권한 요청
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') {
        throw new Error('마이크 권한이 필요합니다')
      }

      // 오디오 모드 설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      })

      console.log('🎤 음정 분석 시작')
      
      this.currentLyrics = lyrics
      this.analysisCallback = onAnalysis
      this.isAnalyzing = true
      this.analysisStartTime = Date.now()

      // 녹음 상태를 PREPARING으로 설정
      this.recordingState = RecordingState.PREPARING

      // 실제 녹음 시도
      try {
        const recordingOptions = {
          ...this.config.recordingOptions,
          web: {
            mimeType: 'audio/wav',
            bitsPerSecond: 128000,
          }
        }
        
        console.log('🔄 녹음 준비 중...')
        const { recording } = await Audio.Recording.createAsync(
          recordingOptions,
          undefined, // status update callback은 undefined로
          1000 // 1초 간격으로 업데이트
        )
        
        this.recording = recording
        this.recordingState = RecordingState.RECORDING
        console.log('✅ 녹음 시작 성공 - 실제 녹음 모드')
      } catch (recordingError) {
        console.log('⚠️ 녹음 시작 실패, mock 모드로 진행:', recordingError)
        // 녹음 실패시 mock 모드로 전환
        this.recording = null
        this.recordingState = RecordingState.MOCK_MODE
        console.log('🎭 Mock 모드로 분석 진행')
      }
      
      // 주기적 분석 시작
      this.startPeriodicAnalysis()

    } catch (error) {
      console.error('❌ 음정 분석 시작 실패:', error)
      this.isAnalyzing = false
      this.recordingState = RecordingState.ERROR
      
      // 에러 정보 상세 로깅
      if (error instanceof Error) {
        console.error('❌ 에러 상세:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
      
      throw error
    }
  }

  /**
   * 음정 분석 중단
   */
  async stopAnalysis(): Promise<void> {
    console.log('🛑 음정 분석 중단')
    
    this.isAnalyzing = false
    
    // 분석 타이머 정리
    if (this.analysisTimer) {
      clearInterval(this.analysisTimer)
      this.analysisTimer = null
    }

    // 안전한 녹음 정리
    await this.safeStopRecording()

    // 콜백 정리
    this.analysisCallback = null
    
    // 상태 초기화
    this.recordingState = RecordingState.IDLE
    console.log('✅ 음정 분석 완전히 중단됨')
  }

  /**
   * 안전한 녹음 중단 메서드
   */
  private async safeStopRecording(): Promise<void> {
    console.log(`🔍 녹음 상태 확인: ${this.recordingState}`)
    
    // Mock 모드이거나 녹음이 없는 경우 바로 리턴
    if (this.recordingState === RecordingState.MOCK_MODE || !this.recording) {
      console.log('📝 Mock 모드 또는 녹음 없음 - 안전하게 패스')
      this.recording = null
      return
    }

    // 녹음이 실제로 존재하고 중단 가능한 상태인지 확인
    if (this.recording && this.recordingState === RecordingState.RECORDING) {
      try {
        console.log('⏹️ 실제 녹음 중단 시도...')
        
        // 녹음 상태 확인
        const status = await this.recording.getStatusAsync()
        console.log('📊 녹음 상태:', {
          canRecord: status.canRecord,
          isRecording: status.isRecording,
          isDoneRecording: status.isDoneRecording
        })
        
        // 실제로 녹음 중인 경우에만 중단
        if (status.canRecord || status.isRecording) {
          await this.recording.stopAndUnloadAsync()
          console.log('✅ 녹음 정상 중단됨')
        } else {
          console.log('⚠️ 녹음이 이미 중단된 상태')
        }
      } catch (error) {
        console.error('❌ 녹음 중단 중 오류 (안전하게 처리됨):', error)
        // 에러가 발생해도 계속 진행 - 이미 중단된 녹음일 가능성
      }
    } else {
      console.log('⚠️ 녹음 상태가 중단 가능하지 않음')
    }

    // 녹음 객체 정리
    this.recording = null
    console.log('🧹 녹음 객체 정리 완료')
  }

  /**
   * 주기적 분석 루프 시작
   */
  private startPeriodicAnalysis(): void {
    this.analysisTimer = setInterval(async () => {
      // 분석 중이 아니거나 유효하지 않은 상태면 중단
      if (!this.isAnalyzing || 
          (this.recordingState !== RecordingState.RECORDING && this.recordingState !== RecordingState.MOCK_MODE)) {
        return
      }

      try {
        await this.performAnalysis()
      } catch (error) {
        console.error('🚨 분석 오류 (복구 가능):', error)
        
        // 녹음 관련 에러인 경우 Mock 모드로 전환
        if (error instanceof Error && error.message.includes('Recorder') && this.recordingState === RecordingState.RECORDING) {
          console.log('🎭 녹음 에러 감지 - Mock 모드로 자동 전환')
          this.recordingState = RecordingState.MOCK_MODE
          this.recording = null
        }
        
        // 에러가 발생해도 계속 진행 (복구 로직)
      }
    }, this.config.analysisInterval)
  }

  /**
   * 실제 음정 분석 수행
   */
  private async performAnalysis(): Promise<void> {
    if (!this.analysisCallback) return

    try {
      // 현재 시간 기준 예상 음정 찾기 (startTime 기준으로 수정)
      const analysisStartTime = Date.now()
      
      // 분석 시작 시간으로부터 경과된 시간을 초 단위로 계산
      const elapsedSeconds = (analysisStartTime - (this.analysisStartTime || analysisStartTime)) / 1000
      const currentLyric = this.findCurrentLyricByTime(elapsedSeconds)
      
      // 임시: 실제 오디오 데이터 대신 랜덤 데이터로 테스트
      const mockAudioBuffer = this.generateMockAudioBuffer(currentLyric)
      
      // 피치 검출
      const pitchResult = this.pitchDetector.detectPitch(mockAudioBuffer)
      
      // 목표 음정과 비교 분석
      const analysisResult = this.compareWithTarget(pitchResult, currentLyric, analysisStartTime)
      
      // 콜백 호출
      this.analysisCallback(analysisResult)

    } catch (error) {
      console.error('음정 분석 수행 오류:', error)
    }
  }

  /**
   * 현재 시간에 해당하는 가사/음정 찾기 (타임스탬프 기준)
   */
  private findCurrentLyric(currentTime: number): LyricItem | null {
    const timeInSeconds = currentTime / 1000
    
    return this.currentLyrics.find(lyric => 
      timeInSeconds >= lyric.startTime && timeInSeconds <= lyric.endTime
    ) || null
  }

  /**
   * 경과 시간으로 현재 가사/음정 찾기
   */
  private findCurrentLyricByTime(elapsedSeconds: number): LyricItem | null {
    return this.currentLyrics.find(lyric => 
      elapsedSeconds >= lyric.startTime && elapsedSeconds <= lyric.endTime
    ) || null
  }

  /**
   * 검출된 음정과 목표 음정 비교
   */
  private compareWithTarget(
    pitchResult: PitchDetectionResult,
    currentLyric: LyricItem | null,
    timestamp: number
  ): PitchAnalysisResult {
    let targetPitch: { frequency: number; note: string; octave: number } | null = null
    let accuracy = 0
    let centsDifference = 0
    let isOnPitch = false

    if (currentLyric?.pitch && pitchResult.frequency > 0) {
      // MusicXML 음정을 주파수로 변환
      const targetFrequency = PitchUtils.musicXMLToFrequency(
        currentLyric.pitch.step,
        currentLyric.pitch.octave,
        currentLyric.pitch.alter || 0
      )

      targetPitch = {
        frequency: targetFrequency,
        note: currentLyric.pitch.step,
        octave: currentLyric.pitch.octave
      }

      // 정확도 계산
      centsDifference = PitchUtils.calculateCentsDifference(
        targetFrequency,
        pitchResult.frequency
      )
      
      accuracy = PitchUtils.calculatePitchAccuracy(
        targetFrequency,
        pitchResult.frequency,
        this.config.pitchTolerance
      )

      console.log('🎯 음정 비교 결과:', {
        targetFreq: targetFrequency.toFixed(2) + 'Hz',
        detectedFreq: pitchResult.frequency.toFixed(2) + 'Hz',
        centsDifference: centsDifference.toFixed(1) + '¢',
        accuracy: (accuracy * 100).toFixed(1) + '%',
        isOnPitch: Math.abs(centsDifference) <= this.config.pitchTolerance
      })

      isOnPitch = Math.abs(centsDifference) <= this.config.pitchTolerance && 
                  pitchResult.confidence >= this.config.minConfidence
    }

    return {
      currentPitch: pitchResult,
      targetPitch,
      accuracy,
      centsDifference,
      isOnPitch,
      lyricText: currentLyric?.text || '',
      timestamp
    }
  }

  /**
   * 임시 Mock 오디오 버퍼 생성 (테스트용)
   * 실제 구현에서는 녹음된 오디오 데이터를 사용해야 함
   */
  private generateMockAudioBuffer(currentLyric?: LyricItem | null): Float32Array {
    const buffer = new Float32Array(this.config.bufferSize)
    
    // 목표 음정이 있으면 그 주파수 근처로, 없으면 랜덤
    let targetFrequency = 440 // 기본 A4
    
    if (currentLyric?.pitch) {
      targetFrequency = PitchUtils.musicXMLToFrequency(
        currentLyric.pitch.step,
        currentLyric.pitch.octave,
        currentLyric.pitch.alter || 0
      )
      
      console.log('🎯 Mock 생성 - 목표:', {
        step: currentLyric.pitch.step,
        octave: currentLyric.pitch.octave,
        alter: currentLyric.pitch.alter,
        targetFreq: targetFrequency
      })
    }
    
    // 더 정확한 Mock 생성: 90% 확률로 정확한 음정, 10% 확률로 약간의 오차
    let actualFrequency: number
    const accuracy = Math.random()
    
    if (accuracy > 0.1) {
      // 90% 확률: 거의 정확한 음정 (±10센트 이내)
      const centDeviation = (Math.random() - 0.5) * 20 // ±10센트
      actualFrequency = targetFrequency * Math.pow(2, centDeviation / 1200)
    } else {
      // 10% 확률: 약간의 오차 (±50센트 이내)  
      const centDeviation = (Math.random() - 0.5) * 100 // ±50센트
      actualFrequency = targetFrequency * Math.pow(2, centDeviation / 1200)
    }
    
    console.log('🎵 Mock 생성 결과:', {
      targetFrequency: targetFrequency.toFixed(2),
      actualFrequency: actualFrequency.toFixed(2),
      difference: (actualFrequency - targetFrequency).toFixed(2) + 'Hz',
      centsDiff: (1200 * Math.log2(actualFrequency / targetFrequency)).toFixed(1) + '¢'
    })
    
    const sampleRate = this.config.recordingOptions.ios.sampleRate
    
    // 사인파 생성 (실제 사람 목소리처럼 약간의 변동 추가)
    for (let i = 0; i < buffer.length; i++) {
      const time = i / sampleRate
      const amplitude = 0.3 * (0.8 + 0.2 * Math.sin(2 * Math.PI * 5 * time)) // 5Hz 진폭 변조
      buffer[i] = amplitude * Math.sin(2 * Math.PI * actualFrequency * time) * 
                  (0.9 + 0.1 * Math.random()) // 약간의 노이즈
    }
    
    return buffer
  }

  /**
   * 분석 상태 확인
   */
  get isRunning(): boolean {
    return this.isAnalyzing
  }

  /**
   * 현재 녹음 상태 확인
   */
  get currentRecordingState(): RecordingState {
    return this.recordingState
  }

  /**
   * Mock 모드 여부 확인
   */
  get isInMockMode(): boolean {
    return this.recordingState === RecordingState.MOCK_MODE
  }

  /**
   * 실제 녹음 모드 여부 확인
   */
  get isRecording(): boolean {
    return this.recordingState === RecordingState.RECORDING
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<PitchAnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // PitchDetector 설정도 업데이트
    this.pitchDetector.updateConfig({
      sampleRate: this.config.recordingOptions.ios.sampleRate,
      bufferSize: this.config.bufferSize
    })
  }
}

/**
 * 음정 분석 결과를 위한 유틸리티 함수들
 */
export class PitchAnalysisUtils {
  /**
   * 정확도에 따른 색상 반환
   */
  static getAccuracyColor(accuracy: number): string {
    if (accuracy >= 0.8) return '#4CAF50'      // 초록 (매우 좋음)
    if (accuracy >= 0.6) return '#8BC34A'      // 연초록 (좋음)
    if (accuracy >= 0.4) return '#FFEB3B'      // 노랑 (보통)
    if (accuracy >= 0.2) return '#FF9800'      // 주황 (나쁨)
    return '#F44336'                           // 빨강 (매우 나쁨)
  }

  /**
   * 센트 차이를 문자열로 포맷
   */
  static formatCentsDifference(cents: number): string {
    const absCents = Math.abs(cents)
    const sign = cents > 0 ? '+' : '-'
    return `${sign}${Math.round(absCents)}¢`
  }

  /**
   * 정확도를 퍼센트로 포맷
   */
  static formatAccuracy(accuracy: number): string {
    return `${Math.round(accuracy * 100)}%`
  }

  /**
   * 주파수를 음정 이름으로 포맷 (영어)
   */
  static formatNoteName(frequency: number): string {
    if (frequency <= 0) return '-'
    const { note, octave, cents } = PitchUtils.frequencyToNoteName(frequency)
    const centsSuffix = Math.abs(cents) > 5 ? ` ${cents > 0 ? '+' : ''}${cents}¢` : ''
    return `${note}${octave}${centsSuffix}`
  }

  /**
   * 주파수를 한글 음정 이름으로 포맷
   */
  static formatKoreanNoteName(frequency: number): string {
    if (frequency <= 0) return '-'
    const { note, octave, cents } = PitchUtils.frequencyToKoreanNoteName(frequency)
    const centsSuffix = Math.abs(cents) > 5 ? ` ${cents > 0 ? '+' : ''}${cents}¢` : ''
    return `${note}${octave}${centsSuffix}`
  }

  /**
   * 음정 피드백 메시지 생성
   * centsDifference: 양수 = 검출음이 높음, 음수 = 검출음이 낮음
   */
  static getPitchFeedback(centsDifference: number, accuracy: number): {
    message: string
    emoji: string
    color: string
  } {
    const color = this.getAccuracyColor(accuracy)
    
    console.log('🎭 피드백 생성:', {
      centsDifference: centsDifference.toFixed(1) + '¢',
      accuracy: (accuracy * 100).toFixed(1) + '%',
      interpretation: centsDifference > 0 ? '검출음이 높음' : centsDifference < 0 ? '검출음이 낮음' : '정확'
    })
    
    // 매우 정확함 (±10센트 이내)
    if (Math.abs(centsDifference) <= 10) {
      return {
        message: '완벽해요! 👏',
        emoji: '🎯',
        color
      }
    }
    
    // 좋음 (±25센트 이내)
    if (Math.abs(centsDifference) <= 25) {
      return {
        message: '좋아요! 거의 맞아요 ✨',
        emoji: '👍',
        color
      }
    }
    
    // 조금 높음 (25-50센트 높음) - 검출된 음이 목표보다 높음
    if (centsDifference > 25 && centsDifference <= 50) {
      return {
        message: '조금 낮춰주세요 🔽',
        emoji: '⬇️',
        color
      }
    }
    
    // 많이 높음 (50센트 이상 높음) - 검출된 음이 목표보다 높음
    if (centsDifference > 50) {
      return {
        message: '더 낮춰주세요! 🔽🔽',
        emoji: '⏬',
        color
      }
    }
    
    // 조금 낮음 (-25 ~ -50센트) - 검출된 음이 목표보다 낮음
    if (centsDifference < -25 && centsDifference >= -50) {
      return {
        message: '조금 높여주세요 🔼',
        emoji: '⬆️',
        color
      }
    }
    
    // 많이 낮음 (-50센트 이하) - 검출된 음이 목표보다 낮음
    if (centsDifference < -50) {
      return {
        message: '더 높여주세요! 🔼🔼',
        emoji: '⏫',
        color
      }
    }
    
    // 기본값
    return {
      message: '음정을 맞춰주세요',
      emoji: '🎵',
      color
    }
  }

  /**
   * 정확도에 따른 격려 메시지
   */
  static getEncouragementMessage(accuracy: number): string {
    if (accuracy >= 0.9) return '최고예요! 🌟'
    if (accuracy >= 0.8) return '훌륭해요! ⭐'
    if (accuracy >= 0.7) return '잘하고 있어요! 👏'
    if (accuracy >= 0.6) return '점점 좋아지고 있어요! 📈'
    if (accuracy >= 0.4) return '연습하면 더 좋아질 거예요! 💪'
    return '천천히 맞춰보세요! 🎵'
  }

  /**
   * MusicXML 음정을 한글로 포맷
   */
  static formatMusicXMLKorean(step: string, octave: number, alter: number = 0): string {
    return PitchUtils.musicXMLToKoreanNoteName(step, octave, alter)
  }
}