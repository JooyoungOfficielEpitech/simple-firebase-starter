/**
 * Firebase Storage Audio Upload Script
 *
 * This script uploads audio files to Firebase Storage
 * Run: node scripts/uploadAudio.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'simple-firebase-starter-8d6fd.appspot.com' // Replace with your actual bucket name
});

const bucket = admin.storage().bucket();

/**
 * Upload a file to Firebase Storage
 * @param {string} localFilePath - Local file path
 * @param {string} destination - Destination path in Storage
 * @returns {Promise<string>} Download URL
 */
async function uploadFile(localFilePath, destination) {
  try {
    console.log(`📤 Uploading ${localFilePath} to ${destination}...`);

    // Upload file
    await bucket.upload(localFilePath, {
      destination,
      metadata: {
        contentType: 'audio/mpeg',
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Make file publicly accessible
    await bucket.file(destination).makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

    console.log(`✅ Upload successful!`);
    console.log(`📎 Public URL: ${publicUrl}`);

    return publicUrl;
  } catch (error) {
    console.error(`❌ Upload failed:`, error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Path to sample.mp3
    const audioFilePath = path.join(__dirname, '../assets/audio/sample.mp3');

    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`File not found: ${audioFilePath}`);
    }

    console.log('🎵 Starting audio file upload...\n');

    // Upload sample.mp3
    const url = await uploadFile(audioFilePath, 'karaoke/songs/sample.mp3');

    console.log('\n✅ All uploads completed!');
    console.log('\n📋 Summary:');
    console.log(`   Sample Audio: ${url}`);
    console.log('\n🔥 Next steps:');
    console.log('   1. Update Firestore songs with mrUrl');
    console.log('   2. Test audio playback from URL');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { uploadFile };
