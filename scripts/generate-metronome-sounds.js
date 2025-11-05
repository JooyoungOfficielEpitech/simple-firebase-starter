/**
 * Generate simple metronome beep sounds
 *
 * This script creates basic WAV files for metronome clicks.
 * These are placeholder sounds that can be replaced with better quality audio later.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate a simple beep WAV file
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {string} filename - Output filename
 */
function generateBeep(frequency, duration, filename) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * duration);

  // WAV header
  const header = Buffer.alloc(44);

  // RIFF chunk descriptor
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + numSamples * 2, 4);
  header.write('WAVE', 8);

  // fmt sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20); // AudioFormat (PCM)
  header.writeUInt16LE(1, 22); // NumChannels (Mono)
  header.writeUInt32LE(sampleRate, 24); // SampleRate
  header.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  header.writeUInt16LE(2, 32); // BlockAlign
  header.writeUInt16LE(16, 34); // BitsPerSample

  // data sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(numSamples * 2, 40);

  // Generate audio samples (simple sine wave)
  const samples = Buffer.alloc(numSamples * 2);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const amplitude = Math.sin(2 * Math.PI * frequency * t);

    // Apply envelope (fade in/out to avoid clicks)
    let envelope = 1.0;
    const fadeLength = Math.floor(sampleRate * 0.005); // 5ms fade
    if (i < fadeLength) {
      envelope = i / fadeLength;
    } else if (i > numSamples - fadeLength) {
      envelope = (numSamples - i) / fadeLength;
    }

    // Convert to 16-bit PCM
    const sample = Math.floor(amplitude * envelope * 32767 * 0.5); // 50% volume
    samples.writeInt16LE(sample, i * 2);
  }

  // Write file
  const outputPath = path.join(__dirname, '..', 'app', 'assets', 'sounds', filename);
  const wavData = Buffer.concat([header, samples]);
  fs.writeFileSync(outputPath, wavData);
  console.log(`✅ Generated: ${filename} (${frequency}Hz, ${duration}s)`);
}

// Create sounds directory if it doesn't exist
const soundsDir = path.join(__dirname, '..', 'app', 'assets', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Generate metronome sounds
console.log('🎵 Generating metronome sound files...');
generateBeep(1000, 0.08, 'metronome-high.wav'); // High beep (강박)
generateBeep(600, 0.08, 'metronome-low.wav');   // Low beep (약박)
console.log('✅ Metronome sounds generated successfully!');
console.log('');
console.log('📝 Note: These are WAV files. For better compatibility,');
console.log('consider converting to MP3 using ffmpeg or similar tool.');
