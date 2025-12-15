/**
 * Generate simple metronome beep sounds
 *
 * This script creates basic WAV files for metronome clicks.
 * These are placeholder sounds that can be replaced with better quality audio later.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate a classic metronome "tick" sound (wood block style)
 * @param {boolean} isAccent - True for accented beat (강박), false for regular beat (약박)
 * @param {string} filename - Output filename
 */
function generateMetronomeTick(isAccent, filename) {
  const sampleRate = 44100;
  const duration = 0.05; // Very short click (50ms)
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

  // Generate classic "tick" sound (wood block simulation)
  const samples = Buffer.alloc(numSamples * 2);

  // Different frequencies for accent vs regular beat
  const baseFreq = isAccent ? 1200 : 800; // Higher pitch for accent
  const attackTime = 0.001; // 1ms attack
  const decayTime = duration - attackTime;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Mix multiple harmonics for richer "wood block" sound
    let amplitude = 0;
    amplitude += Math.sin(2 * Math.PI * baseFreq * t) * 0.6;
    amplitude += Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.2;
    amplitude += Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.1;

    // Add some noise for "click" character
    amplitude += (Math.random() - 0.5) * 0.15;

    // Sharp attack and fast exponential decay (classic tick envelope)
    let envelope = 0;
    if (t < attackTime) {
      // Fast attack
      envelope = t / attackTime;
    } else {
      // Exponential decay for natural "tick" sound
      const decayProgress = (t - attackTime) / decayTime;
      envelope = Math.exp(-8 * decayProgress); // Faster decay
    }

    // Higher volume for accented beat
    const volume = isAccent ? 0.8 : 0.6;

    // Convert to 16-bit PCM
    const sample = Math.floor(amplitude * envelope * 32767 * volume);
    samples.writeInt16LE(Math.max(-32768, Math.min(32767, sample)), i * 2);
  }

  // Write file
  const outputPath = path.join(__dirname, '..', 'app', 'assets', 'sounds', filename);
  const wavData = Buffer.concat([header, samples]);
  fs.writeFileSync(outputPath, wavData);
  const beatType = isAccent ? 'ACCENT (강박)' : 'regular (약박)';
  console.log(`✅ Generated: ${filename} - Classic tick sound (${beatType})`);
}

// Create sounds directory if it doesn't exist
const soundsDir = path.join(__dirname, '..', 'app', 'assets', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Generate metronome sounds
console.log('🎵 Generating classic metronome tick sounds...');
generateMetronomeTick(true, 'metronome-high.wav');  // Accented beat (강박) - 딱!
generateMetronomeTick(false, 'metronome-low.wav');  // Regular beat (약박) - 딱
console.log('✅ Classic metronome "tick" sounds generated successfully!');
console.log('');
console.log('📝 Wood block style metronome sounds created.');
console.log('   These are short, sharp "tick" sounds like a traditional metronome.');
