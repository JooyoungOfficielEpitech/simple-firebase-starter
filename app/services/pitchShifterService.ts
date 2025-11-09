/**
 * Pitch Shifter Service
 *
 * AVAudioEngine + AVAudioUnitTimePitch를 사용한 네이티브 피치 조절
 * 템포를 유지하면서 피치만 독립적으로 조절 가능
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

interface RNPitchShifterType {
  // Load audio file
  loadAudioFile(urlString: string): Promise<{
    duration: number;
    sampleRate: number;
    channels: number;
  }>;

  // Set pitch (in semitones, -12 to +12)
  setPitch(semitones: number): void;

  // Set rate (tempo multiplier, 0.5 to 2.0)
  setRate(rate: number): void;

  // Playback controls
  play(): Promise<{ success: boolean }>;
  pause(): void;
  stop(): void;

  // Seek to position (in seconds)
  seek(timeSeconds: number): Promise<{ currentTime: number }>;

  // Get current playback time
  getCurrentTime(): Promise<{ currentTime: number }>;

  // Check if player is playing
  isPlayerPlaying(): Promise<{ isPlaying: boolean }>;

  // A-B Loop control
  setABLoop(enabled: boolean, start: number, end: number): void;
}

// Events
export interface PlaybackProgressEvent {
  currentTime: number;
  duration: number;
}

export interface PlaybackEndEvent {
  reason: 'ended' | 'stopped' | 'error';
}

export interface PlaybackErrorEvent {
  error: string;
}

export interface PlaybackStateChangedEvent {
  isPlaying: boolean;
}

// Get native module
const PitchShifterModule = NativeModules.RNPitchShifter as RNPitchShifterType | undefined;

// Event emitter
let eventEmitter: NativeEventEmitter | null = null;

if (PitchShifterModule) {
  eventEmitter = new NativeEventEmitter(NativeModules.RNPitchShifter);
}

// Service class
class PitchShifterService {
  private static instance: PitchShifterService;

  private constructor() {
    if (!this.isAvailable()) {
      console.warn('⚠️ RNPitchShifter is not available on this platform');
    }
  }

  static getInstance(): PitchShifterService {
    if (!PitchShifterService.instance) {
      PitchShifterService.instance = new PitchShifterService();
    }
    return PitchShifterService.instance;
  }

  /**
   * Check if pitch shifter is available on this platform
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' && !!PitchShifterModule;
  }

  /**
   * Load audio file from URL
   */
  async loadAudioFile(urlString: string): Promise<{
    duration: number;
    sampleRate: number;
    channels: number;
  }> {
    if (!this.isAvailable() || !PitchShifterModule) {
      throw new Error('RNPitchShifter is not available');
    }

    console.log('🎵 [PitchShifterService] Loading audio file:', urlString);
    return await PitchShifterModule.loadAudioFile(urlString);
  }

  /**
   * Set pitch in semitones (-12 to +12)
   * 0 = original pitch
   * +12 = one octave higher
   * -12 = one octave lower
   */
  setPitch(semitones: number): void {
    if (!this.isAvailable() || !PitchShifterModule) {
      console.warn('⚠️ RNPitchShifter is not available');
      return;
    }

    console.log(`🎹 [PitchShifterService] Setting pitch to ${semitones} semitones`);
    PitchShifterModule.setPitch(semitones);
  }

  /**
   * Set playback rate (tempo multiplier)
   * 1.0 = normal speed
   * 2.0 = 2x faster
   * 0.5 = 0.5x slower
   */
  setRate(rate: number): void {
    if (!this.isAvailable() || !PitchShifterModule) {
      console.warn('⚠️ RNPitchShifter is not available');
      return;
    }

    console.log(`⚡ [PitchShifterService] Setting rate to ${rate}`);
    PitchShifterModule.setRate(rate);
  }

  /**
   * Start playback
   */
  async play(): Promise<void> {
    if (!this.isAvailable() || !PitchShifterModule) {
      throw new Error('RNPitchShifter is not available');
    }

    console.log('▶️ [PitchShifterService] Playing');
    await PitchShifterModule.play();
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.isAvailable() || !PitchShifterModule) {
      console.warn('⚠️ RNPitchShifter is not available');
      return;
    }

    console.log('⏸ [PitchShifterService] Pausing');
    PitchShifterModule.pause();
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (!this.isAvailable() || !PitchShifterModule) {
      console.warn('⚠️ RNPitchShifter is not available');
      return;
    }

    console.log('⏹ [PitchShifterService] Stopping');
    PitchShifterModule.stop();
  }

  /**
   * Seek to position (in seconds)
   */
  async seek(timeSeconds: number): Promise<number> {
    if (!this.isAvailable() || !PitchShifterModule) {
      throw new Error('RNPitchShifter is not available');
    }

    console.log(`⏩ [PitchShifterService] Seeking to ${timeSeconds}s`);
    const result = await PitchShifterModule.seek(timeSeconds);
    return result.currentTime;
  }

  /**
   * Get current playback time
   */
  async getCurrentTime(): Promise<number> {
    if (!this.isAvailable() || !PitchShifterModule) {
      throw new Error('RNPitchShifter is not available');
    }

    const result = await PitchShifterModule.getCurrentTime();
    return result.currentTime;
  }

  /**
   * Check if player is playing
   */
  async isPlaying(): Promise<boolean> {
    if (!this.isAvailable() || !PitchShifterModule) {
      return false;
    }

    const result = await PitchShifterModule.isPlayerPlaying();
    return result.isPlaying;
  }

  /**
   * Add event listener for playback progress
   */
  addProgressListener(callback: (event: PlaybackProgressEvent) => void): () => void {
    if (!eventEmitter) {
      console.warn('⚠️ Event emitter is not available');
      return () => {};
    }

    const subscription = eventEmitter.addListener('onPlaybackProgress', callback);
    return () => subscription.remove();
  }

  /**
   * Add event listener for playback end
   */
  addPlaybackEndListener(callback: (event: PlaybackEndEvent) => void): () => void {
    if (!eventEmitter) {
      console.warn('⚠️ Event emitter is not available');
      return () => {};
    }

    const subscription = eventEmitter.addListener('onPlaybackEnd', callback);
    return () => subscription.remove();
  }

  /**
   * Add event listener for playback errors
   */
  addErrorListener(callback: (event: PlaybackErrorEvent) => void): () => void {
    if (!eventEmitter) {
      console.warn('⚠️ Event emitter is not available');
      return () => {};
    }

    const subscription = eventEmitter.addListener('onPlaybackError', callback);
    return () => subscription.remove();
  }

  /**
   * Add event listener for playback state changes
   */
  addPlaybackStateListener(callback: (event: PlaybackStateChangedEvent) => void): () => void {
    if (!eventEmitter) {
      console.warn('⚠️ Event emitter is not available');
      return () => {};
    }

    const subscription = eventEmitter.addListener('onPlaybackStateChanged', callback);
    return () => subscription.remove();
  }

  /**
   * Set A-B loop for repeated playback of a specific time range
   * @param enabled - Enable or disable A-B loop
   * @param start - Loop start time in seconds
   * @param end - Loop end time in seconds
   */
  setABLoop(enabled: boolean, start: number, end: number): void {
    if (!this.isAvailable() || !PitchShifterModule) {
      console.warn('⚠️ RNPitchShifter is not available');
      return;
    }

    console.log(`🔁 [PitchShifterService] Setting A-B loop: ${enabled ? `${start}s - ${end}s` : 'disabled'}`);
    PitchShifterModule.setABLoop(enabled, start, end);
  }
}

export default PitchShifterService.getInstance();
