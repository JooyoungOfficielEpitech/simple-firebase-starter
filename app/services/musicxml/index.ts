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
      // 🧪 임시: 테스트용 샘플 데이터
      if (fileName === "sample.musicxml") {
        console.log("🎼 샘플 MusicXML 데이터 로드")
        return this.getSampleMusicXMLData()
      }

      // TODO: 실제 구현에서는 Firebase Storage나 다른 방법으로 로드
      throw new Error(`지원하지 않는 파일: ${fileName}`)
    } catch (error) {
      console.error("파일 로드 오류:", error)
      throw error
    }
  }

  /**
   * 테스트용 샘플 MusicXML 데이터
   */
  private static getSampleMusicXMLData(): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE score-partwise  PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <movement-title>This is the Moment</movement-title>
  <identification>
    <creator type="composer">Frank Wildhorn</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Voice</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1000</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
      </attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>500</duration><type>eighth</type><lyric><text>지금</text></lyric></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>500</duration><type>eighth</type><lyric><text>이</text></lyric></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1000</duration><type>quarter</type><lyric><text>순간</text></lyric></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1000</duration><type>quarter</type><lyric><text>나의</text></lyric></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>500</duration><type>eighth</type><lyric><text>온</text></lyric></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>500</duration><type>eighth</type><lyric><text>세상</text></lyric></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1000</duration><type>quarter</type><lyric><text>이</text></lyric></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>1000</duration><type>quarter</type><lyric><text>달라져</text></lyric></note>
    </measure>
    <measure number="3">
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>500</duration><type>eighth</type><lyric><text>꿈꿔왔던</text></lyric></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>500</duration><type>eighth</type><lyric><text>모든</text></lyric></note>
      <note><pitch><step>F</step><octave>5</octave></pitch><duration>1000</duration><type>quarter</type><lyric><text>것들이</text></lyric></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>1000</duration><type>quarter</type><lyric><text>이뤄져</text></lyric></note>
    </measure>
    <measure number="4">
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2000</duration><type>half</type><lyric><text>가네</text></lyric></note>
      <note><rest/><duration>2000</duration><type>half</type></note>
    </measure>
  </part>
</score-partwise>`
  }

  /**
   * 캐시 클리어
   */
  static clearCache() {
    this.cache.clear()
  }
}

export { MusicXMLParser, type LyricsData, type LyricItem } from "./musicXMLParser"