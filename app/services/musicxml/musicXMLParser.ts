import { XMLParser } from "fast-xml-parser"

// 가사 동기화 데이터 구조
export interface LyricItem {
  startTime: number    // 시작 시간 (초)
  endTime: number      // 종료 시간 (초)
  text: string         // 가사 텍스트
  syllabic: string     // 음절 정보 (single, begin, middle, end)
  pitch?: {            // 음정 정보 (음정 분석용)
    step: string       // C, D, E, F, G, A, B
    octave: number     // 옥타브
    alter?: number     // 변화표 (#, ♭)
  }
}

export interface LyricsData {
  title: string
  totalDuration: number  // 총 길이 (초)
  lyrics: LyricItem[]
  bpm?: number          // BPM (추정값)
}

// MusicXML 파싱 결과 타입
interface ParsedNote {
  pitch?: {
    step: string
    octave: number
    alter?: number
  }
  duration: number
  lyric?: {
    syllabic: string
    text: string
  }
}

interface ParsedMusicXML {
  title: string
  divisions: number
  notes: ParsedNote[]
}

/**
 * MusicXML 파일을 파싱하여 가사 동기화 데이터를 생성합니다
 */
export class MusicXMLParser {
  private parser: XMLParser

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: true,
      parseNodeValue: true,
    })
  }

  /**
   * MusicXML 내용을 파싱합니다
   */
  async parseMusicXML(xmlContent: string): Promise<ParsedMusicXML> {
    try {
      const parsed = this.parser.parse(xmlContent)
      const scorePartwise = parsed["score-partwise"]

      // 기본 정보 추출
      const title = scorePartwise["movement-title"] || "Unknown"
      const parts = Array.isArray(scorePartwise.part) ? scorePartwise.part : [scorePartwise.part]
      const firstPart = parts[0]
      
      // divisions 추출 (시간 단위)
      let divisions = 10080 // 기본값
      const firstMeasure = Array.isArray(firstPart.measure) ? firstPart.measure[0] : firstPart.measure
      if (firstMeasure?.attributes?.divisions) {
        divisions = firstMeasure.attributes.divisions
      }

      // 모든 음표 추출
      const notes: ParsedNote[] = []
      const measures = Array.isArray(firstPart.measure) ? firstPart.measure : [firstPart.measure]

      for (const measure of measures) {
        const measureNotes = Array.isArray(measure.note) ? measure.note : [measure.note]
        
        for (const note of measureNotes) {
          if (!note) continue

          const parsedNote: ParsedNote = {
            duration: note.duration || 0
          }

          // 음정 정보 추출
          if (note.pitch) {
            parsedNote.pitch = {
              step: note.pitch.step,
              octave: note.pitch.octave,
              alter: note.pitch.alter
            }
          }

          // 가사 정보 추출
          if (note.lyric) {
            const lyric = Array.isArray(note.lyric) ? note.lyric[0] : note.lyric
            parsedNote.lyric = {
              syllabic: lyric.syllabic || "single",
              text: lyric.text || lyric["#text"] || ""
            }
          }

          notes.push(parsedNote)
        }
      }

      return {
        title,
        divisions,
        notes: notes.filter(note => note.lyric?.text) // 가사가 있는 음표만
      }
    } catch (error) {
      console.error("MusicXML 파싱 오류:", error)
      throw new Error("MusicXML 파일을 파싱할 수 없습니다")
    }
  }

  /**
   * 파싱된 MusicXML을 가사 동기화 데이터로 변환합니다
   */
  convertToLyricsData(
    parsed: ParsedMusicXML, 
    totalAudioDuration: number,  // MP3 파일의 실제 길이
    estimatedBPM: number = 120   // 추정 BPM
  ): LyricsData {
    const { title, divisions, notes } = parsed

    // 총 duration 계산 (MusicXML 기준)
    const totalMusicXMLDuration = notes.reduce((sum, note) => sum + note.duration, 0)
    
    // duration을 실제 시간으로 변환하는 비율
    const timeRatio = totalAudioDuration / (totalMusicXMLDuration / divisions)
    
    console.log("🎼 MusicXML 변환 정보:", {
      totalMusicXMLDuration,
      divisions,
      totalAudioDuration,
      timeRatio,
      estimatedBPM
    })

    const lyrics: LyricItem[] = []
    let currentTime = 0

    for (const note of notes) {
      if (!note.lyric?.text) continue

      // duration을 실제 시간(초)으로 변환
      const noteDuration = (note.duration / divisions) * timeRatio
      
      const lyricItem: LyricItem = {
        startTime: currentTime,
        endTime: currentTime + noteDuration,
        text: note.lyric.text,
        syllabic: note.lyric.syllabic
      }

      // 음정 정보 추가
      if (note.pitch) {
        lyricItem.pitch = {
          step: note.pitch.step,
          octave: note.pitch.octave,
          alter: note.pitch.alter
        }
      }

      lyrics.push(lyricItem)
      currentTime += noteDuration
    }

    return {
      title,
      totalDuration: totalAudioDuration,
      lyrics,
      bpm: estimatedBPM
    }
  }

  /**
   * 파일에서 MusicXML을 로드하고 가사 데이터로 변환합니다
   */
  async parseFromFile(
    xmlContent: string,
    totalAudioDuration: number,
    estimatedBPM?: number
  ): Promise<LyricsData> {
    const parsed = await this.parseMusicXML(xmlContent)
    return this.convertToLyricsData(parsed, totalAudioDuration, estimatedBPM)
  }
}