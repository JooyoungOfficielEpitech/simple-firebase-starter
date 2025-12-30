import * as fs from "fs"
import * as path from "path"
import * as admin from "firebase-admin"
import { CreateCourtRental, CourtPlatform } from "../app/types/court"

// Firebase Admin SDK 초기화
const serviceAccountPath = path.join(__dirname, "../../yangdo-1319c-firebase-adminsdk-fbsvc-0aaad51400.json")
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

// JSON 파일 인터페이스
interface JsonPost {
  platform: string
  title: string
  author: string
  posted_at: string
  url: string
  content: string
  crawled_at: string
  extracted_info: {
    event_date: string | null
    event_time: string | null
    event_time_end: string | null
    location: string | null
    price: string | null
    contact: string | null
  }
}

interface JsonData {
  posts: JsonPost[]
  metadata: {
    total_count: number
    crawl_timestamp: string
    platform: string
    crawler_version: string
  }
}

/**
 * JSON 데이터를 Firestore로 import
 */
async function importCourtData(jsonFilePath: string) {
  console.log("🏀 농구장 대관 데이터 import 시작...")
  console.log(`📄 파일: ${jsonFilePath}`)

  // JSON 파일 읽기
  const jsonData: JsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"))
  console.log(`📊 총 ${jsonData.posts.length}개의 포스트 발견`)

  // Batch 처리 준비
  const batch = db.batch()
  const collectionRef = db.collection("court_rentals")
  let importedCount = 0
  let skippedCount = 0

  for (const post of jsonData.posts) {
    try {
      // 중복 체크 (URL 기준)
      const existingDocs = await collectionRef.where("url", "==", post.url).limit(1).get()

      if (!existingDocs.empty) {
        console.log(`⏭️  중복 건너뜀: ${post.title}`)
        skippedCount++
        continue
      }

      // CreateCourtRental 형식으로 변환
      const rentalData: CreateCourtRental = {
        platform: post.platform as CourtPlatform,
        title: post.title,
        author: post.author,
        posted_at: post.posted_at,
        url: post.url,
        content: post.content,
        crawled_at: post.crawled_at,
        extracted_info: {
          event_date: post.extracted_info.event_date,
          event_time: post.extracted_info.event_time,
          event_time_end: post.extracted_info.event_time_end,
          location: post.extracted_info.location,
          price: post.extracted_info.price,
          contact: post.extracted_info.contact,
        },
      }

      // 새 문서 생성
      const docRef = collectionRef.doc()
      const now = admin.firestore.Timestamp.now()

      batch.set(docRef, {
        id: docRef.id,
        ...rentalData,
        is_available: true,
        createdAt: now,
        updatedAt: now,
      })

      importedCount++

      // 500개마다 batch commit (Firestore 제한)
      if (importedCount % 500 === 0) {
        await batch.commit()
        console.log(`✅ ${importedCount}개 커밋 완료`)
      }
    } catch (error) {
      console.error(`❌ 오류 발생 (${post.title}):`, error)
    }
  }

  // 남은 데이터 커밋
  if (importedCount % 500 !== 0) {
    await batch.commit()
  }

  console.log("\n🎉 Import 완료!")
  console.log(`✅ 성공: ${importedCount}개`)
  console.log(`⏭️  건너뜀: ${skippedCount}개`)
  console.log(`📊 총: ${jsonData.posts.length}개`)
}

// CLI 실행
const args = process.argv.slice(2)
if (args.length === 0) {
  console.error("사용법: ts-node importCourtData.ts <json-file-path>")
  console.error("예제: ts-node importCourtData.ts ../all_2025-11-16_01-34-34.json")
  process.exit(1)
}

const jsonFilePath = path.resolve(args[0])

if (!fs.existsSync(jsonFilePath)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${jsonFilePath}`)
  process.exit(1)
}

importCourtData(jsonFilePath)
  .then(() => {
    console.log("✅ 스크립트 완료")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ 스크립트 오류:", error)
    process.exit(1)
  })
