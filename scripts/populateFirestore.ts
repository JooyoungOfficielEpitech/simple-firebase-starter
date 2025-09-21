/**
 * Firebase Firestore에 샘플 데이터를 추가하는 스크립트
 * 
 * 실행 방법:
 * 1. Firebase Console에서 새 사용자를 생성
 * 2. 아래 사용자 ID들을 실제 Firebase Auth UID로 교체
 * 3. 이 스크립트를 실행하여 데이터 추가
 */

import firestore from "@react-native-firebase/firestore"
import { UserProfile, UserType } from "@/types/user"
import { Post, CreatePost } from "@/types/post"

// 실제 Firebase Auth UID로 교체해야 함
const SAMPLE_USER_IDS = {
  // 일반 사용자들
  general1: "REPLACE_WITH_ACTUAL_UID_1",
  general2: "REPLACE_WITH_ACTUAL_UID_2", 
  // 단체 운영자들
  organizer1: "REPLACE_WITH_ACTUAL_UID_3",
  organizer2: "REPLACE_WITH_ACTUAL_UID_4",
  organizer3: "REPLACE_WITH_ACTUAL_UID_5",
}

export async function populateFirestoreData() {
  const db = firestore()

  console.log("🔥 Firebase 샘플 데이터 추가 시작...")

  try {
    // 1. 사용자 프로필 데이터 추가
    console.log("👥 사용자 프로필 추가 중...")
    
    const users: Array<{ id: string; data: UserProfile }> = [
      // 일반 사용자 1
      {
        id: SAMPLE_USER_IDS.general1,
        data: {
          uid: SAMPLE_USER_IDS.general1,
          email: "user1@example.com",
          name: "김일반",
          gender: "female",
          birthday: "1995-03-15",
          heightCm: 165,
          media: [],
          requiredProfileComplete: false,
          userType: "general" as UserType,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        } as UserProfile,
      },
      // 일반 사용자 2
      {
        id: SAMPLE_USER_IDS.general2,
        data: {
          uid: SAMPLE_USER_IDS.general2,
          email: "user2@example.com",
          name: "박관객",
          gender: "male",
          birthday: "1992-07-22",
          heightCm: 175,
          media: [],
          requiredProfileComplete: false,
          userType: "general" as UserType,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        } as UserProfile,
      },
      // 단체 운영자 1
      {
        id: SAMPLE_USER_IDS.organizer1,
        data: {
          uid: SAMPLE_USER_IDS.organizer1,
          email: "theater1@example.com",
          name: "이연출",
          gender: "female",
          birthday: "1988-11-03",
          heightCm: 160,
          media: [],
          requiredProfileComplete: true,
          userType: "organizer" as UserType,
          organizationId: SAMPLE_USER_IDS.organizer1,
          organizationName: "서울뮤지컬단",
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        } as UserProfile,
      },
      // 단체 운영자 2
      {
        id: SAMPLE_USER_IDS.organizer2,
        data: {
          uid: SAMPLE_USER_IDS.organizer2,
          email: "theater2@example.com",
          name: "김감독",
          gender: "male",
          birthday: "1985-05-17",
          heightCm: 180,
          media: [],
          requiredProfileComplete: true,
          userType: "organizer" as UserType,
          organizationId: SAMPLE_USER_IDS.organizer2,
          organizationName: "대학로극장",
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        } as UserProfile,
      },
      // 단체 운영자 3
      {
        id: SAMPLE_USER_IDS.organizer3,
        data: {
          uid: SAMPLE_USER_IDS.organizer3,
          email: "theater3@example.com",
          name: "최프로듀서",
          gender: "female",
          birthday: "1990-09-12",
          heightCm: 167,
          media: [],
          requiredProfileComplete: true,
          userType: "organizer" as UserType,
          organizationId: SAMPLE_USER_IDS.organizer3,
          organizationName: "청년극단 희망",
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        } as UserProfile,
      },
    ]

    for (const user of users) {
      await db.collection("users").doc(user.id).set(user.data)
      console.log(`✅ 사용자 프로필 추가: ${user.data.name}`)
    }

    // 2. 게시글 데이터 추가
    console.log("📝 게시글 추가 중...")
    
    const posts: Array<Omit<CreatePost, "organizationId" | "authorId" | "authorName">> = [
      // 서울뮤지컬단 - 지킬앤 하이드
      {
        title: "[7월 공연] 지킬앤 하이드 남/여 주연 모집",
        description: `🎭 서울뮤지컬단에서 7월 공연 '지킬앤 하이드'의 주연 배우를 모집합니다!

📍 모집 역할:
- 지킬/하이드 역 (남성, 20-35세)
- 루시 역 (여성, 20-30세)
- 엠마 역 (여성, 20-28세)

🎯 자격 요건:
- 뮤지컬 경험자 우대
- 고음 가능자
- 연기 경험 필수

💬 연락처: theater1@example.com
📞 010-1234-5678`,
        production: "지킬앤 하이드",
        rehearsalSchedule: "매주 일요일 오후 2시-6시",
        location: "건대입구역 앞 아트센터 3층",
        organizationId: SAMPLE_USER_IDS.organizer1,
        organizationName: "서울뮤지컬단",
        authorId: SAMPLE_USER_IDS.organizer1,
        authorName: "이연출",
        status: "active",
        tags: ["뮤지컬", "남성역할", "여성역할", "주연"],
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      // 대학로극장 - 맘마미아
      {
        title: "[8월 공연] 맘마미아 앙상블 단원 모집",
        description: `🌟 대학로극장에서 8월 공연 '맘마미아'의 앙상블 단원을 모집합니다!

📍 모집 역할:
- 앙상블 (남/여 구분 없음, 20-40세)
- 댄스 가능자 우대

🎯 자격 요건:
- 춤 실력 필수
- 노래 가능자
- 밝은 성격

📅 오디션: 6월 15일 (토) 오후 2시
💬 연락처: theater2@example.com`,
        production: "맘마미아",
        rehearsalSchedule: "매주 화, 목, 토 오후 7시-10시",
        location: "대학로 소극장",
        organizationId: SAMPLE_USER_IDS.organizer2,
        organizationName: "대학로극장",
        authorId: SAMPLE_USER_IDS.organizer2,
        authorName: "김감독",
        status: "active",
        tags: ["뮤지컬", "앙상블", "댄스", "남녀무관"],
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      // 청년극단 희망 - 로미오와 줄리엣
      {
        title: "[9월 공연] 로미오와 줄리엣 주연 모집",
        description: `💕 청년극단 희망에서 9월 공연 '로미오와 줄리엣'의 주연을 모집합니다!

📍 모집 역할:
- 로미오 역 (남성, 20-30세)
- 줄리엣 역 (여성, 18-25세)

🎯 자격 요건:
- 연기 경험 필수
- 감정 표현력 우수자
- 체력 좋은 분

📅 연습 기간: 7월-9월 (3개월간)
💬 연락처: theater3@example.com
📱 카카오톡: hope_theater`,
        production: "로미오와 줄리엣",
        rehearsalSchedule: "매주 수, 금, 일 오후 6시-9시",
        location: "홍대 연습실",
        organizationId: SAMPLE_USER_IDS.organizer3,
        organizationName: "청년극단 희망",
        authorId: SAMPLE_USER_IDS.organizer3,
        authorName: "최프로듀서",
        status: "active",
        tags: ["연극", "주연", "로맨스", "청년"],
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      // 서울뮤지컬단 - 마감된 공연
      {
        title: "[마감] 오페라의 유령 조연 모집",
        description: `🎭 서울뮤지컬단에서 6월 공연 '오페라의 유령'의 조연을 모집했습니다.

모집이 마감되었습니다. 많은 관심 감사합니다!`,
        production: "오페라의 유령",
        rehearsalSchedule: "매주 토, 일 오후 1시-5시",
        location: "강남 아트센터",
        organizationId: SAMPLE_USER_IDS.organizer1,
        organizationName: "서울뮤지컬단",
        authorId: SAMPLE_USER_IDS.organizer1,
        authorName: "이연출",
        status: "closed",
        tags: ["뮤지컬", "조연", "마감"],
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      // 대학로극장 - 캣츠
      {
        title: "[10월 공연] 캣츠 댄서 모집",
        description: `🐱 대학로극장에서 10월 공연 '캣츠'의 댄서를 모집합니다!

📍 모집 역할:
- 메인 댄서 (남/여, 20-35세)
- 앙상블 댄서 (남/여, 18-40세)

🎯 자격 요건:
- 현대무용, 재즈댄스 경험자
- 유연성 필수
- 고양이 연기 가능자 우대

📅 오디션: 7월 20일 (토) 오후 3시
💪 체력 테스트 포함
💬 연락처: theater2@example.com`,
        production: "캣츠",
        rehearsalSchedule: "매주 월, 수, 금 오후 8시-11시",
        location: "대학로 무용스튜디오",
        organizationId: SAMPLE_USER_IDS.organizer2,
        organizationName: "대학로극장",
        authorId: SAMPLE_USER_IDS.organizer2,
        authorName: "김감독",
        status: "active",
        tags: ["뮤지컬", "댄스", "현대무용", "앙상블"],
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
    ]

    for (const post of posts) {
      const docRef = await db.collection("posts").add(post)
      console.log(`✅ 게시글 추가: ${post.title} (ID: ${docRef.id})`)
    }

    console.log("🎉 Firebase 샘플 데이터 추가 완료!")
    console.log("\n📋 추가된 데이터:")
    console.log(`- 사용자: ${users.length}명 (일반 ${users.filter(u => u.data.userType === 'general').length}명, 운영자 ${users.filter(u => u.data.userType === 'organizer').length}명)`)
    console.log(`- 게시글: ${posts.length}개 (활성 ${posts.filter(p => p.status === 'active').length}개, 마감 ${posts.filter(p => p.status === 'closed').length}개)`)
    
    console.log("\n⚠️  주의사항:")
    console.log("1. 실제 Firebase Auth UID로 SAMPLE_USER_IDS를 교체해야 합니다")
    console.log("2. Firebase Console에서 해당 UID의 사용자를 먼저 생성해야 합니다")
    console.log("3. 테스트를 위해 각 사용자 타입으로 로그인해보세요")

  } catch (error) {
    console.error("❌ 데이터 추가 중 오류 발생:", error)
    throw error
  }
}

// 스크립트 실행을 위한 함수
export async function runPopulateScript() {
  try {
    await populateFirestoreData()
  } catch (error) {
    console.error("스크립트 실행 실패:", error)
  }
}