import firestore from "@react-native-firebase/firestore"
import { Song } from "@/types/song"

const SONGS_COLLECTION = "songs"

export class SongService {
  private static collection = firestore().collection(SONGS_COLLECTION)

  /**
   * Get all songs from Firestore
   */
  static async getAllSongs(): Promise<Song[]> {
    try {
      const snapshot = await this.collection.orderBy("title", "asc").get()
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Song[]
    } catch (error) {
      console.error("Failed to fetch songs:", error)
      throw error
    }
  }

  /**
   * Get songs by musical name
   */
  static async getSongsByMusical(musical: string): Promise<Song[]> {
    try {
      const snapshot = await this.collection
        .where("musical", "==", musical)
        .orderBy("title", "asc")
        .get()
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Song[]
    } catch (error) {
      console.error("Failed to fetch songs by musical:", error)
      throw error
    }
  }

  /**
   * Search songs by title or musical name
   */
  static async searchSongs(query: string): Promise<Song[]> {
    try {
      const allSongs = await this.getAllSongs()
      const searchQuery = query.toLowerCase().trim()
      
      return allSongs.filter(song =>
        song.title.toLowerCase().includes(searchQuery) ||
        song.musical.toLowerCase().includes(searchQuery)
      )
    } catch (error) {
      console.error("Failed to search songs:", error)
      throw error
    }
  }

  /**
   * Add a new song (Admin only)
   */
  static async addSong(song: Omit<Song, "id">): Promise<string> {
    try {
      const docRef = await this.collection.add({
        ...song,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      })
      
      return docRef.id
    } catch (error) {
      console.error("Failed to add song:", error)
      throw error
    }
  }

  /**
   * Update a song (Admin only)
   */
  static async updateSong(id: string, updates: Partial<Omit<Song, "id">>): Promise<void> {
    try {
      await this.collection.doc(id).update({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      })
    } catch (error) {
      console.error("Failed to update song:", error)
      throw error
    }
  }

  /**
   * Delete a song (Admin only)
   */
  static async deleteSong(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete()
    } catch (error) {
      console.error("Failed to delete song:", error)
      throw error
    }
  }

  /**
   * Listen to songs in real-time
   */
  static onSongsSnapshot(callback: (songs: Song[]) => void, onError?: (error: Error) => void) {
    return this.collection
      .orderBy("title", "asc")
      .onSnapshot(
        (snapshot) => {
          const songs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Song[]
          callback(songs)
        },
        onError
      )
  }

  /**
   * Initialize sample songs data (for development)
   */
  static async initializeSampleData(): Promise<void> {
    try {
      // Check if songs already exist
      const existing = await this.collection.limit(1).get()
      if (!existing.empty) {
        console.log("Songs already exist, skipping initialization")
        return
      }

      const sampleSongs: Omit<Song, "id">[] = [
        {
          title: "This is the Moment",
          musical: "지킬 앤 하이드",
        },
        {
          title: "Defying Gravity",
          musical: "위키드",
        },
        {
          title: "Memory",
          musical: "캣츠",
        },
        {
          title: "The Phantom of the Opera",
          musical: "오페라의 유령",
        },
        {
          title: "I Dreamed a Dream",
          musical: "레 미제라블",
        },
        {
          title: "Seasons of Love",
          musical: "렌트",
        },
        {
          title: "Don't Cry for Me Argentina",
          musical: "에비타",
        },
        {
          title: "All I Ask of You",
          musical: "오페라의 유령",
        },
      ]

      const batch = firestore().batch()
      
      sampleSongs.forEach((song) => {
        const docRef = this.collection.doc()
        batch.set(docRef, {
          ...song,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        })
      })

      await batch.commit()
      console.log("Sample songs initialized successfully")
    } catch (error) {
      console.error("Failed to initialize sample songs:", error)
      throw error
    }
  }
}