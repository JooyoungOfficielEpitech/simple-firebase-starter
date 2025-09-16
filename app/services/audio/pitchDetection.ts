/**
 * 피치 검출 서비스
 * Autocorrelation 기반 기본 주파수(F0) 추출
 */

export interface PitchDetectionResult {
  frequency: number        // 검출된 주파수 (Hz)
  confidence: number       // 신뢰도 (0-1)
  amplitude: number        // 음성 크기 (0-1)
  isVoiced: boolean        // 유성음 여부
}

export interface PitchDetectionConfig {
  sampleRate: number       // 샘플링 레이트 (기본: 44100)
  bufferSize: number       // 분석 버퍼 크기 (기본: 4096)
  minFreq: number         // 최소 주파수 (기본: 80Hz)
  maxFreq: number         // 최대 주파수 (기본: 1000Hz)
  threshold: number       // 유성음 임계값 (기본: 0.3)
}

export class PitchDetector {
  private config: PitchDetectionConfig
  private autocorrelationBuffer: Float32Array
  
  constructor(config: Partial<PitchDetectionConfig> = {}) {
    this.config = {
      sampleRate: 44100,
      bufferSize: 4096,
      minFreq: 80,
      maxFreq: 1000,
      threshold: 0.3,
      ...config
    }
    
    this.autocorrelationBuffer = new Float32Array(this.config.bufferSize)
  }
  
  /**
   * 오디오 샘플에서 피치 검출
   */
  detectPitch(audioBuffer: Float32Array): PitchDetectionResult {
    // 1. 음성 활동 감지 (Voice Activity Detection)
    const amplitude = this.calculateAmplitude(audioBuffer)
    const isVoiced = amplitude > this.config.threshold
    
    if (!isVoiced) {
      return {
        frequency: 0,
        confidence: 0,
        amplitude,
        isVoiced: false
      }
    }
    
    // 2. Pre-emphasis 필터 적용 (고주파 강조)
    const emphasizedBuffer = this.applyPreEmphasis(audioBuffer)
    
    // 3. Autocorrelation 계산
    this.calculateAutocorrelation(emphasizedBuffer)
    
    // 4. 피치 주기 검출
    const { period, confidence } = this.findPitchPeriod()
    
    // 5. 주파수 계산
    const frequency = period > 0 ? this.config.sampleRate / period : 0
    
    return {
      frequency: this.clampFrequency(frequency),
      confidence,
      amplitude,
      isVoiced: frequency > 0 && confidence > 0.5
    }
  }
  
  /**
   * 음성 크기(RMS) 계산
   */
  private calculateAmplitude(buffer: Float32Array): number {
    let sum = 0
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i]
    }
    return Math.sqrt(sum / buffer.length)
  }
  
  /**
   * Pre-emphasis 필터 적용
   * 고주파 성분을 강조하여 피치 검출 정확도 향상
   */
  private applyPreEmphasis(buffer: Float32Array): Float32Array {
    const alpha = 0.97
    const result = new Float32Array(buffer.length)
    
    result[0] = buffer[0]
    for (let i = 1; i < buffer.length; i++) {
      result[i] = buffer[i] - alpha * buffer[i - 1]
    }
    
    return result
  }
  
  /**
   * Autocorrelation 함수 계산
   * 신호의 주기성을 분석하여 피치 검출
   */
  private calculateAutocorrelation(buffer: Float32Array): void {
    const bufferLength = buffer.length
    
    // Autocorrelation 계산
    for (let lag = 0; lag < this.autocorrelationBuffer.length; lag++) {
      let sum = 0
      for (let i = 0; i < bufferLength - lag; i++) {
        sum += buffer[i] * buffer[i + lag]
      }
      
      // 정규화
      this.autocorrelationBuffer[lag] = lag === 0 ? 1.0 : sum / (bufferLength - lag)
    }
  }
  
  /**
   * Autocorrelation에서 피치 주기 검출
   */
  private findPitchPeriod(): { period: number; confidence: number } {
    const minPeriod = Math.floor(this.config.sampleRate / this.config.maxFreq)
    const maxPeriod = Math.floor(this.config.sampleRate / this.config.minFreq)
    
    let maxCorrelation = 0
    let bestPeriod = 0
    
    // 주파수 범위 내에서 최대 correlation 검색
    for (let period = minPeriod; period <= maxPeriod && period < this.autocorrelationBuffer.length; period++) {
      const correlation = this.autocorrelationBuffer[period]
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation
        bestPeriod = period
      }
    }
    
    // 서브샘플 정확도 향상을 위한 포물선 보간
    const refinedPeriod = this.parabolicInterpolation(bestPeriod, maxCorrelation)
    
    return {
      period: refinedPeriod,
      confidence: maxCorrelation
    }
  }
  
  /**
   * 포물선 보간을 통한 피치 정확도 향상
   */
  private parabolicInterpolation(peakIndex: number, peakValue: number): number {
    if (peakIndex === 0 || peakIndex >= this.autocorrelationBuffer.length - 1) {
      return peakIndex
    }
    
    const y1 = this.autocorrelationBuffer[peakIndex - 1]
    const y2 = peakValue
    const y3 = this.autocorrelationBuffer[peakIndex + 1]
    
    // 포물선 최대값 위치 계산
    const a = (y1 - 2 * y2 + y3) / 2
    if (Math.abs(a) < 1e-10) return peakIndex
    
    const offset = (y3 - y1) / (4 * a)
    return peakIndex + offset
  }
  
  /**
   * 주파수를 설정된 범위로 제한
   */
  private clampFrequency(frequency: number): number {
    if (frequency < this.config.minFreq || frequency > this.config.maxFreq) {
      return 0
    }
    return frequency
  }
  
  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<PitchDetectionConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.autocorrelationBuffer = new Float32Array(this.config.bufferSize)
  }
}

/**
 * 주파수를 음정으로 변환하는 유틸리티 함수들
 */
export class PitchUtils {
  /**
   * 주파수를 MIDI 노트 번호로 변환
   * A4(440Hz) = MIDI 69
   */
  static frequencyToMidiNote(frequency: number): number {
    if (frequency <= 0) return 0
    return 69 + 12 * Math.log2(frequency / 440)
  }
  
  /**
   * MIDI 노트 번호를 주파수로 변환
   */
  static midiNoteToFrequency(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12)
  }
  
  /**
   * 주파수를 음정 이름으로 변환 (C, C#, D, ...)
   */
  static frequencyToNoteName(frequency: number): { note: string; octave: number; cents: number } {
    const midiNote = this.frequencyToMidiNote(frequency)
    const noteIndex = Math.round(midiNote) % 12
    const octave = Math.floor(Math.round(midiNote) / 12) - 1
    const cents = Math.round((midiNote - Math.round(midiNote)) * 100)
    
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    
    return {
      note: noteNames[noteIndex],
      octave,
      cents
    }
  }

  /**
   * 주파수를 한글 음정 이름으로 변환 (도, 도#, 레, ...)
   */
  static frequencyToKoreanNoteName(frequency: number): { note: string; octave: number; cents: number } {
    const midiNote = this.frequencyToMidiNote(frequency)
    const noteIndex = Math.round(midiNote) % 12
    const octave = Math.floor(Math.round(midiNote) / 12) - 1
    const cents = Math.round((midiNote - Math.round(midiNote)) * 100)
    
    const koreanNoteNames = ['도', '도#', '레', '레#', '미', '파', '파#', '솔', '솔#', '라', '라#', '시']
    
    return {
      note: koreanNoteNames[noteIndex],
      octave,
      cents
    }
  }

  /**
   * MusicXML 형식을 한글 음정 이름으로 변환
   */
  static musicXMLToKoreanNoteName(step: string, octave: number, alter: number = 0): string {
    const noteMap: { [key: string]: string } = {
      'C': '도',
      'D': '레', 
      'E': '미',
      'F': '파',
      'G': '솔',
      'A': '라',
      'B': '시'
    }

    const koreanNote = noteMap[step] || step
    const alteration = alter > 0 ? '#' : alter < 0 ? '♭' : ''
    
    return `${koreanNote}${alteration}${octave}`
  }
  
  /**
   * MusicXML 형식의 음정을 주파수로 변환
   * MusicXML 옥타브 4 = 중간 C (C4) = MIDI 60
   */
  static musicXMLToFrequency(step: string, octave: number, alter: number = 0): number {
    const noteOffsets = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
    const baseOffset = noteOffsets[step as keyof typeof noteOffsets]
    
    if (baseOffset === undefined) {
      console.warn('⚠️ 잘못된 음계:', step)
      return 440 // 기본값 A4
    }
    
    // MusicXML 옥타브를 MIDI 노트로 변환: C4(MusicXML) = C4(MIDI) = 60
    const midiNote = octave * 12 + baseOffset + alter + 12 // +12는 C0 = MIDI 12 때문
    
    console.log('🎼 주파수 변환:', {
      step,
      octave,
      alter,
      baseOffset,
      midiNote,
      expectedFreq: this.midiNoteToFrequency(midiNote).toFixed(2) + 'Hz'
    })
    
    return this.midiNoteToFrequency(midiNote)
  }
  
  /**
   * 두 주파수 간의 센트 차이 계산
   */
  static calculateCentsDifference(frequency1: number, frequency2: number): number {
    if (frequency1 <= 0 || frequency2 <= 0) return 0
    return 1200 * Math.log2(frequency2 / frequency1)
  }
  
  /**
   * 음정 정확도 계산 (0-1)
   */
  static calculatePitchAccuracy(targetFreq: number, actualFreq: number, toleranceCents: number = 50): number {
    const centsDiff = Math.abs(this.calculateCentsDifference(targetFreq, actualFreq))
    return Math.max(0, 1 - centsDiff / toleranceCents)
  }
}