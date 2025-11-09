//
//  RNPitchShifter.swift
//  simplefirebasestarter
//
//  독립적인 Pitch 조절을 위한 네이티브 모듈
//  AVAudioEngine + AVAudioUnitTimePitch 사용
//

import Foundation
import AVFoundation
import React

@objc(RNPitchShifter)
class RNPitchShifter: RCTEventEmitter {

  // MARK: - Properties

  private let audioEngine = AVAudioEngine()
  private let playerNode = AVAudioPlayerNode()
  private let pitchNode = AVAudioUnitTimePitch()

  private var audioFile: AVAudioFile?
  private var audioFormat: AVAudioFormat?
  private var audioLengthSeconds: Double = 0.0
  private var isPlaying = false
  private var currentFrame: AVAudioFramePosition = 0
  private var lastRenderTime: AVAudioTime?

  // Timer for progress updates
  private var progressTimer: Timer?

  // MARK: - A-B Loop Properties

  private var abLoopEnabled = false
  private var abLoopStart: Double = 0.0
  private var abLoopEnd: Double = 0.0
  private var loopCheckTimer: Timer?

  // MARK: - Initialization

  override init() {
    super.init()
    setupAudioEngine()
    setupNotifications()
  }

  deinit {
    cleanup()
  }

  // MARK: - RCTEventEmitter overrides

  override func supportedEvents() -> [String]! {
    return ["onPlaybackProgress", "onPlaybackEnd", "onPlaybackError", "onPlaybackStateChanged"]
  }

  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  // MARK: - Audio Engine Setup

  private func setupAudioEngine() {
    // Configure AVAudioSession for background playback
    do {
      let session = AVAudioSession.sharedInstance()
      try session.setCategory(.playback, mode: .default, options: [])
      try session.setActive(true)
      print("✅ [RNPitchShifter] AVAudioSession configured for background playback")
    } catch {
      print("❌ [RNPitchShifter] Failed to configure AVAudioSession: \(error)")
    }

    // Attach nodes to engine
    audioEngine.attach(playerNode)
    audioEngine.attach(pitchNode)

    // Connect nodes: playerNode → pitchNode → mainMixer → output
    let mixer = audioEngine.mainMixerNode
    let output = audioEngine.outputNode
    let outputFormat = output.inputFormat(forBus: 0)

    audioEngine.connect(playerNode, to: pitchNode, format: nil)
    audioEngine.connect(pitchNode, to: mixer, format: nil)
    audioEngine.connect(mixer, to: output, format: outputFormat)

    // Start engine
    do {
      try audioEngine.start()
      print("✅ [RNPitchShifter] AVAudioEngine started successfully")
    } catch {
      print("❌ [RNPitchShifter] Failed to start AVAudioEngine: \(error)")
      sendEvent(withName: "onPlaybackError", body: ["error": error.localizedDescription])
    }
  }

  private func setupNotifications() {
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleInterruption),
      name: AVAudioSession.interruptionNotification,
      object: nil
    )
  }

  @objc private func handleInterruption(notification: Notification) {
    guard let userInfo = notification.userInfo,
          let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
          let type = AVAudioSession.InterruptionType(rawValue: typeValue) else {
      return
    }

    switch type {
    case .began:
      // Interruption began - pause playback
      if isPlaying {
        playerNode.pause()
        isPlaying = false
        stopProgressTimer()
      }
    case .ended:
      // Interruption ended - can resume if needed
      guard let optionsValue = userInfo[AVAudioSessionInterruptionOptionKey] as? UInt else {
        return
      }
      let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
      if options.contains(.shouldResume) {
        // Resume playback if it was interrupted
        if !playerNode.isPlaying && audioFile != nil {
          if !audioEngine.isRunning {
            try? audioEngine.start()
          }
          playerNode.play()
          isPlaying = true
          startProgressTimer()
          sendEvent(withName: "onPlaybackStateChanged", body: ["isPlaying": true])
        }
      }
    @unknown default:
      break
    }
  }

  // MARK: - React Native Methods

  @objc func loadAudioFile(_ urlString: String,
                           resolver resolve: @escaping RCTPromiseResolveBlock,
                           rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.global(qos: .userInitiated).async { [weak self] in
      guard let self = self else { return }

      do {
        // Parse URL
        guard let url = URL(string: urlString) else {
          throw NSError(domain: "RNPitchShifter", code: 1, userInfo: [
            NSLocalizedDescriptionKey: "Invalid URL: \(urlString)"
          ])
        }

        print("🎵 [RNPitchShifter] Loading audio file: \(url)")

        // Determine local file URL
        let localFileUrl: URL

        if url.scheme == "http" || url.scheme == "https" {
          // HTTP/HTTPS URL - download to temp directory
          print("🌐 [RNPitchShifter] Downloading audio file from remote URL...")

          let tempDir = FileManager.default.temporaryDirectory
          let fileName = url.lastPathComponent.isEmpty ? "temp_audio.mp3" : url.lastPathComponent
          let tempFileUrl = tempDir.appendingPathComponent(fileName)

          // Download file
          let data = try Data(contentsOf: url)
          try data.write(to: tempFileUrl)

          print("✅ [RNPitchShifter] Downloaded to: \(tempFileUrl.path)")
          localFileUrl = tempFileUrl
        } else if url.scheme == "file" {
          // Already a local file URL
          localFileUrl = url
        } else {
          throw NSError(domain: "RNPitchShifter", code: 2, userInfo: [
            NSLocalizedDescriptionKey: "Unsupported URL scheme: \(url.scheme ?? "nil")"
          ])
        }

        // Load audio file from local path
        let audioFile = try AVAudioFile(forReading: localFileUrl)
        self.audioFile = audioFile
        self.audioFormat = audioFile.processingFormat

        // Calculate duration
        let frameCount = Double(audioFile.length)
        let sampleRate = audioFile.processingFormat.sampleRate
        self.audioLengthSeconds = frameCount / sampleRate

        print("✅ [RNPitchShifter] Audio file loaded successfully")
        print("   Duration: \(self.audioLengthSeconds)s")
        print("   Sample Rate: \(sampleRate)Hz")
        print("   Channels: \(audioFile.processingFormat.channelCount)")

        DispatchQueue.main.async {
          resolve([
            "duration": self.audioLengthSeconds,
            "sampleRate": sampleRate,
            "channels": audioFile.processingFormat.channelCount
          ])
        }
      } catch {
        print("❌ [RNPitchShifter] Failed to load audio file: \(error)")
        DispatchQueue.main.async {
          reject("LOAD_ERROR", "Failed to load audio file: \(error.localizedDescription)", error)
        }
      }
    }
  }

  @objc func setPitch(_ semitones: Float) {
    print("🎹 [RNPitchShifter] Setting pitch to \(semitones) semitones")

    // AVAudioUnitTimePitch uses cents (100 cents = 1 semitone)
    let cents = semitones * 100.0
    pitchNode.pitch = cents

    print("✅ [RNPitchShifter] Pitch set to \(cents) cents")
  }

  @objc func setRate(_ rate: Float) {
    print("⚡ [RNPitchShifter] Setting rate to \(rate)")
    pitchNode.rate = rate
    print("✅ [RNPitchShifter] Rate set to \(rate)")
  }

  @objc func play(_ resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let audioFile = audioFile else {
      reject("NO_AUDIO_FILE", "No audio file loaded", nil)
      return
    }

    do {
      print("▶️ [RNPitchShifter] Starting playback")

      // If already playing, stop first
      if playerNode.isPlaying {
        playerNode.stop()
      }

      // Schedule audio file for playback
      playerNode.scheduleFile(audioFile, at: nil) { [weak self] in
        DispatchQueue.main.async {
          self?.handlePlaybackCompletion()
        }
      }

      // Start playback
      if !audioEngine.isRunning {
        try audioEngine.start()
      }

      playerNode.play()
      isPlaying = true

      // Start progress timer
      startProgressTimer()

      // Send state change event
      sendEvent(withName: "onPlaybackStateChanged", body: ["isPlaying": true])

      print("✅ [RNPitchShifter] Playback started")
      resolve(["success": true])
    } catch {
      print("❌ [RNPitchShifter] Failed to start playback: \(error)")
      reject("PLAYBACK_ERROR", "Failed to start playback: \(error.localizedDescription)", error)
    }
  }

  @objc func pause() {
    print("⏸ [RNPitchShifter] Pausing playback")

    if playerNode.isPlaying {
      playerNode.pause()
      isPlaying = false
      stopProgressTimer()

      // Send state change event
      sendEvent(withName: "onPlaybackStateChanged", body: ["isPlaying": false])

      print("✅ [RNPitchShifter] Playback paused")
    }
  }

  @objc func stop() {
    print("⏹ [RNPitchShifter] Stopping playback")

    if playerNode.isPlaying {
      playerNode.stop()
      isPlaying = false
      currentFrame = 0
      stopProgressTimer()

      // Send state change event
      sendEvent(withName: "onPlaybackStateChanged", body: ["isPlaying": false])

      print("✅ [RNPitchShifter] Playback stopped")
    }
  }

  @objc func seek(_ timeSeconds: Double,
                  resolver resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let audioFile = audioFile, let format = audioFormat else {
      reject("NO_AUDIO_FILE", "No audio file loaded", nil)
      return
    }

    do {
      print("⏩ [RNPitchShifter] Seeking to \(timeSeconds)s")

      let wasPlaying = playerNode.isPlaying

      // Stop current playback
      if wasPlaying {
        playerNode.stop()
      }

      // Calculate frame position
      let sampleRate = format.sampleRate
      let framePosition = AVAudioFramePosition(timeSeconds * sampleRate)
      let frameCount = AVAudioFrameCount(audioFile.length - framePosition)

      // Validate position
      guard framePosition >= 0 && framePosition < audioFile.length else {
        throw NSError(domain: "RNPitchShifter", code: 2, userInfo: [
          NSLocalizedDescriptionKey: "Seek position out of bounds"
        ])
      }

      // Schedule from new position
      playerNode.scheduleSegment(
        audioFile,
        startingFrame: framePosition,
        frameCount: frameCount,
        at: nil
      ) { [weak self] in
        DispatchQueue.main.async {
          self?.handlePlaybackCompletion()
        }
      }

      currentFrame = framePosition

      // Resume playback if it was playing
      if wasPlaying {
        if !audioEngine.isRunning {
          try audioEngine.start()
        }
        playerNode.play()
      }

      print("✅ [RNPitchShifter] Seeked to \(timeSeconds)s (frame: \(framePosition))")
      resolve(["currentTime": timeSeconds])
    } catch {
      print("❌ [RNPitchShifter] Failed to seek: \(error)")
      reject("SEEK_ERROR", "Failed to seek: \(error.localizedDescription)", error)
    }
  }

  @objc func getCurrentTime(_ resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard audioFormat != nil else {
      reject("NO_AUDIO_FILE", "No audio file loaded", nil)
      return
    }

    let currentTime = getCurrentTimeInternal()
    resolve(["currentTime": currentTime])
  }

  @objc func isPlayerPlaying(_ resolve: @escaping RCTPromiseResolveBlock,
                             rejecter reject: @escaping RCTPromiseRejectBlock) {
    resolve(["isPlaying": isPlaying])
  }

  // MARK: - A-B Loop Methods

  @objc func setABLoop(_ enabled: Bool, start: Double, end: Double) {
    print("🔁 [RNPitchShifter] setABLoop - enabled: \(enabled), start: \(start), end: \(end)")

    abLoopEnabled = enabled
    abLoopStart = start
    abLoopEnd = end

    if enabled {
      startABLoopCheck()
    } else {
      stopABLoopCheck()
    }
  }

  private func startABLoopCheck() {
    stopABLoopCheck()

    guard abLoopEnd > abLoopStart else {
      print("⚠️ [RNPitchShifter] Invalid A-B loop range")
      return
    }

    print("✅ [RNPitchShifter] Starting A-B loop check timer")

    loopCheckTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
      self?.checkABLoop()
    }
  }

  private func stopABLoopCheck() {
    loopCheckTimer?.invalidate()
    loopCheckTimer = nil
    print("🛑 [RNPitchShifter] Stopped A-B loop check timer")
  }

  private func checkABLoop() {
    guard abLoopEnabled, isPlaying else { return }

    let currentTime = getCurrentTimeInternal()

    // Check if current position is beyond loop end
    if currentTime >= abLoopEnd {
      print("🔁 [RNPitchShifter] Loop restart: \(currentTime)s -> \(abLoopStart)s")

      // Seek back to loop start
      DispatchQueue.main.async { [weak self] in
        guard let self = self else { return }

        let wasPlaying = self.playerNode.isPlaying

        if wasPlaying {
          self.playerNode.stop()
        }

        guard let audioFile = self.audioFile, let format = self.audioFormat else { return }

        let sampleRate = format.sampleRate
        let framePosition = AVAudioFramePosition(self.abLoopStart * sampleRate)
        let frameCount = AVAudioFrameCount(audioFile.length - framePosition)

        self.playerNode.scheduleSegment(
          audioFile,
          startingFrame: framePosition,
          frameCount: frameCount,
          at: nil
        ) { [weak self] in
          DispatchQueue.main.async {
            self?.handlePlaybackCompletion()
          }
        }

        self.currentFrame = framePosition

        if wasPlaying {
          if !self.audioEngine.isRunning {
            try? self.audioEngine.start()
          }
          self.playerNode.play()
        }
      }
    }
  }

  // MARK: - Private Methods

  private func getCurrentTimeInternal() -> Double {
    guard let format = audioFormat, let nodeTime = playerNode.lastRenderTime else {
      return 0.0
    }

    if let playerTime = playerNode.playerTime(forNodeTime: nodeTime) {
      let currentTimeSeconds = Double(currentFrame + playerTime.sampleTime) / format.sampleRate
      return min(currentTimeSeconds, audioLengthSeconds)
    }

    return 0.0
  }

  private func startProgressTimer() {
    stopProgressTimer()

    progressTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
      guard let self = self, self.isPlaying else { return }

      let currentTime = self.getCurrentTimeInternal()

      self.sendEvent(withName: "onPlaybackProgress", body: [
        "currentTime": currentTime,
        "duration": self.audioLengthSeconds
      ])
    }
  }

  private func stopProgressTimer() {
    progressTimer?.invalidate()
    progressTimer = nil
  }

  private func handlePlaybackCompletion() {
    print("🎵 [RNPitchShifter] Playback completed")

    isPlaying = false
    currentFrame = 0
    stopProgressTimer()

    sendEvent(withName: "onPlaybackEnd", body: ["reason": "ended"])
  }

  private func cleanup() {
    print("🧹 [RNPitchShifter] Cleaning up")

    stopProgressTimer()
    stopABLoopCheck()

    if playerNode.isPlaying {
      playerNode.stop()
    }

    if audioEngine.isRunning {
      audioEngine.stop()
    }

    NotificationCenter.default.removeObserver(self)
  }
}
