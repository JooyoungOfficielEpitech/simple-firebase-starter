import { MusicXMLParser, LyricsData } from "./musicXMLParser"

/**
 * MusicXML 서비스 - 가사 동기화 데이터 관리
 */
export class MusicXMLService {
  private static parser = new MusicXMLParser()
  private static cache = new Map<string, LyricsData>()

  /**
   * 로컬 MusicXML 파일에서 가사 데이터를 로드합니다
   */
  static async loadLyricsFromAsset(
    fileName: string,
    audioDuration: number,
    estimatedBPM: number = 120
  ): Promise<LyricsData> {
    try {
      // 캐시 확인
      const cacheKey = `${fileName}_${audioDuration}_${estimatedBPM}`
      if (this.cache.has(cacheKey)) {
        console.log("🎵 캐시에서 가사 데이터 로드:", fileName)
        return this.cache.get(cacheKey)!
      }

      console.log("🎼 MusicXML 파일 로드 시작:", fileName)

      // 파일 내용 로드 (React Native에서는 fetch 사용)
      const xmlContent = await this.loadMusicXMLFile(fileName)
      
      // 파싱 및 변환
      const lyricsData = await this.parser.parseFromFile(
        xmlContent,
        audioDuration,
        estimatedBPM
      )

      // 캐시 저장
      this.cache.set(cacheKey, lyricsData)

      console.log("✅ 가사 데이터 로드 완료:", {
        title: lyricsData.title,
        lyricsCount: lyricsData.lyrics.length,
        duration: lyricsData.totalDuration
      })

      return lyricsData
    } catch (error) {
      console.error("❌ MusicXML 로드 실패:", fileName, error)
      throw new Error(`MusicXML 파일 로드 실패: ${fileName}`)
    }
  }

  /**
   * 특정 시간에 해당하는 가사를 찾습니다
   */
  static getCurrentLyric(lyricsData: LyricsData, currentTime: number) {
    return lyricsData.lyrics.find(
      lyric => currentTime >= lyric.startTime && currentTime <= lyric.endTime
    )
  }

  /**
   * 특정 시간에 해당하는 가사의 인덱스를 찾습니다
   */
  static getCurrentLyricIndex(lyricsData: LyricsData, currentTime: number): number {
    return lyricsData.lyrics.findIndex(
      lyric => currentTime >= lyric.startTime && currentTime <= lyric.endTime
    )
  }

  /**
   * 다음에 나올 가사들을 가져옵니다 (미리보기용)
   */
  static getUpcomingLyrics(
    lyricsData: LyricsData, 
    currentTime: number, 
    count: number = 3
  ) {
    const currentIndex = this.getCurrentLyricIndex(lyricsData, currentTime)
    const startIndex = Math.max(0, currentIndex + 1)
    return lyricsData.lyrics.slice(startIndex, startIndex + count)
  }

  /**
   * MusicXML 파일 내용을 로드합니다
   */
  private static async loadMusicXMLFile(fileName: string): Promise<string> {
    try {
      // React Native에서 로컬 파일 로드 방법
      // assets 폴더의 파일은 번들에 포함되므로 fetch로 로드 가능
      
      // 개발 환경에서는 Metro bundler의 asset resolver 사용
      const response = await fetch(`/assets/musicXML/${fileName}`)
      if (!response.ok) {
        throw new Error(`파일을 찾을 수 없습니다: ${fileName}`)
      }
      return await response.text()
    } catch (error) {
      console.error("파일 로드 오류:", error)
      
      // 대체 방법: require로 로드 (단, 파일이 .js로 export되어야 함)
      // 또는 실제 프로덕션에서는 Firebase Storage에서 로드
      throw error
    }
  }

  /**
   * 캐시 클리어
   */
  static clearCache() {
    this.cache.clear()
  }
}

export { MusicXMLParser, type LyricsData, type LyricItem } from "./musicXMLParser"