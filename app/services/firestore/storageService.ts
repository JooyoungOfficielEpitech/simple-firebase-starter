import storage from "@react-native-firebase/storage"
import { Platform } from "react-native"

export class StorageService {
  /**
   * Upload audio file to Firebase Storage
   * @param localFilePath - Local file path (e.g., from assets or file system)
   * @param fileName - Destination file name (e.g., "sample.mp3")
   * @returns Download URL
   */
  static async uploadAudioFile(
    localFilePath: string,
    fileName: string,
  ): Promise<string> {
    try {
      console.log("📤 Uploading audio file:", fileName)

      // Create a reference to the file location
      const reference = storage().ref(`karaoke/songs/${fileName}`)

      // Upload the file
      await reference.putFile(localFilePath)

      // Get the download URL
      const downloadURL = await reference.getDownloadURL()

      console.log("✅ Upload successful:", downloadURL)
      return downloadURL
    } catch (error) {
      console.error("❌ Upload failed:", error)
      throw error
    }
  }

  /**
   * Upload MusicXML file to Firebase Storage
   * @param localFilePath - Local file path
   * @param fileName - Destination file name (e.g., "sample.musicxml")
   * @returns Download URL
   */
  static async uploadMusicXMLFile(
    localFilePath: string,
    fileName: string,
  ): Promise<string> {
    try {
      console.log("📤 Uploading MusicXML file:", fileName)

      const reference = storage().ref(`karaoke/musicxml/${fileName}`)
      await reference.putFile(localFilePath)

      const downloadURL = await reference.getDownloadURL()
      console.log("✅ Upload successful:", downloadURL)
      return downloadURL
    } catch (error) {
      console.error("❌ Upload failed:", error)
      throw error
    }
  }

  /**
   * Delete audio file from Firebase Storage
   * @param fileName - File name to delete
   */
  static async deleteAudioFile(fileName: string): Promise<void> {
    try {
      const reference = storage().ref(`karaoke/songs/${fileName}`)
      await reference.delete()
      console.log("✅ File deleted:", fileName)
    } catch (error) {
      console.error("❌ Delete failed:", error)
      throw error
    }
  }

  /**
   * Delete MusicXML file from Firebase Storage
   * @param fileName - File name to delete
   */
  static async deleteMusicXMLFile(fileName: string): Promise<void> {
    try {
      const reference = storage().ref(`karaoke/musicxml/${fileName}`)
      await reference.delete()
      console.log("✅ File deleted:", fileName)
    } catch (error) {
      console.error("❌ Delete failed:", error)
      throw error
    }
  }

  /**
   * Get download URL for an existing file
   * @param fileName - File name
   * @param type - File type ('audio' | 'musicxml')
   * @returns Download URL
   */
  static async getDownloadURL(
    fileName: string,
    type: "audio" | "musicxml" = "audio",
  ): Promise<string> {
    try {
      const path = type === "audio"
        ? `karaoke/songs/${fileName}`
        : `karaoke/musicxml/${fileName}`

      const reference = storage().ref(path)
      const url = await reference.getDownloadURL()
      return url
    } catch (error) {
      console.error("❌ Failed to get download URL:", error)
      throw error
    }
  }

  /**
   * Check if file exists in storage
   * @param fileName - File name
   * @param type - File type ('audio' | 'musicxml')
   * @returns true if file exists
   */
  static async fileExists(
    fileName: string,
    type: "audio" | "musicxml" = "audio",
  ): Promise<boolean> {
    try {
      const path = type === "audio"
        ? `karaoke/songs/${fileName}`
        : `karaoke/musicxml/${fileName}`

      const reference = storage().ref(path)
      await reference.getMetadata()
      return true
    } catch (error: any) {
      if (error.code === "storage/object-not-found") {
        return false
      }
      throw error
    }
  }

  /**
   * List all audio files in storage
   * @returns Array of file names
   */
  static async listAudioFiles(): Promise<string[]> {
    try {
      const reference = storage().ref("karaoke/songs")
      const result = await reference.listAll()
      return result.items.map(item => item.name)
    } catch (error) {
      console.error("❌ Failed to list files:", error)
      throw error
    }
  }
}
