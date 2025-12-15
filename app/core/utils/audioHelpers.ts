import { MMKV } from "react-native-mmkv"

export interface SavedSection {
  id: string
  name: string
  pointA: number
  pointB: number
  createdAt: Date
  songId: string  // 곡 ID (곡별 구간 구분용)
}

const storage = new MMKV()
const SAVED_SECTIONS_KEY = "audio_player_saved_sections"

export const formatTime = (milliseconds: number): string => {
  if (!milliseconds || isNaN(milliseconds) || milliseconds < 0) {
    return "0:00"
  }
  
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const loadSavedSections = (): SavedSection[] => {
  try {
    const sectionsString = storage.getString(SAVED_SECTIONS_KEY)
    if (sectionsString) {
      return JSON.parse(sectionsString)
    }
    return []
  } catch (error) {
    console.error("❌ 저장된 구간 로드 실패:", error)
    return []
  }
}

export const saveSectionsToStorage = (sections: SavedSection[]) => {
  try {
    storage.set(SAVED_SECTIONS_KEY, JSON.stringify(sections))
    console.log("✅ 구간을 로컬 스토리지에 저장 완료:", sections.length, "개")
  } catch (error) {
    console.error("❌ 구간 저장 실패:", error)
  }
}
