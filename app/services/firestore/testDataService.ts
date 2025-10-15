import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"

/**
 * 개발 및 테스트용 데이터 생성 서비스
 */
export class TestDataService {
  private db: FirebaseFirestoreTypes.Module

  constructor(firestoreInstance = firestore()) {
    this.db = firestoreInstance
  }

  /**
   * 테스트용 사용자, 단체, 게시글 데이터를 일괄 생성
   */
  async addTestData(): Promise<void> {
    try {
      console.log('🔥 [TestDataService] 테스트 데이터 추가 시작...')
      console.log('🔥 [TestDataService] Firestore DB 인스턴스:', this.db ? 'OK' : 'ERROR')
      
      // 현재 인증 상태 확인
      const currentUser = auth().currentUser
      console.log('🔐 [TestDataService] 현재 인증 상태:', currentUser ? { uid: currentUser.uid, email: currentUser.email } : 'NOT_LOGGED_IN')

      await this.createTestUser()
      await this.createTestOrganizations()
      await this.createTestPosts()

      console.log('✅ [TestDataService] 모든 테스트 데이터 추가 완료!')
    } catch (error) {
      console.error('❌ [TestDataService] 테스트 데이터 추가 실패:', error)
      throw error
    }
  }

  /**
   * 테스트용 사용자 데이터 생성
   */
  private async createTestUser(): Promise<void> {
    const userData = {
      uid: 'test-organizer',
      email: 'test@example.com',
      name: '테스트 운영자',
      gender: 'female',
      birthday: '1990-01-01',
      heightCm: 165,
      requiredProfileComplete: true,
      userType: 'organizer',
      organizationId: 'test-organizer',
      organizationName: '테스트극단',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    }

    await this.db.collection('users').doc('test-organizer').set(userData)
    console.log('✅ [TestDataService] 사용자 데이터 추가 완료')
  }

  /**
   * 테스트용 단체 데이터 생성
   */
  private async createTestOrganizations(): Promise<void> {
    // 메인 테스트 단체
    const organizationData = {
      name: '테스트극단',
      description: '클래식 연극부터 현대극까지 다양한 장르를 선보이는 극단입니다.',
      contactEmail: 'contact@testcompany.com',
      contactPhone: '02-1234-5678',
      website: 'https://testcompany.com',
      location: '서울특별시 종로구',
      establishedDate: '2020-01-01',
      tags: ['연극', '뮤지컬', '클래식'],
      logoUrl: null,
      isVerified: true,
      ownerId: 'test-organizer',
      ownerName: '테스트 운영자',
      memberCount: 15,
      activePostCount: 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    }

    await this.db.collection('organizations').doc('test-organizer').set(organizationData)
    console.log('✅ [TestDataService] 단체 데이터 추가 완료')

    // 추가 테스트 단체
    const organizationData2 = {
      name: '새로운극단',
      description: '실험적이고 창의적인 연극을 추구하는 극단입니다.',
      contactEmail: 'info@newcompany.com',
      contactPhone: '02-9876-5432',
      location: '서울특별시 마포구',
      establishedDate: '2021-06-15',
      tags: ['실험극', '창작극', '소극장'],
      logoUrl: null,
      isVerified: false,
      ownerId: 'test-organizer-2',
      ownerName: '새로운 운영자',
      memberCount: 8,
      activePostCount: 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    }

    await this.db.collection('organizations').doc('test-organizer-2').set(organizationData2)
    console.log('✅ [TestDataService] 추가 단체 데이터 추가 완료')
  }

  /**
   * 테스트용 게시글 데이터 생성
   */
  private async createTestPosts(): Promise<void> {
    // 첫 번째 테스트 게시글 - 햄릿
    const postData = {
      title: '[테스트] 햄릿 주연 모집',
      description: '🎭 테스트극단에서 햄릿 주연을 모집합니다!\n\n📍 모집 역할:\n- 햄릿 역 (남성, 25-35세)\n- 오필리어 역 (여성, 20-30세)\n\n🎯 자격 요건:\n- 연기 경험 필수\n- 셰익스피어 작품 경험자 우대',
      production: '햄릿',
      rehearsalSchedule: '매주 토, 일 오후 2시-6시',
      location: '서울 연습실',
      organizationId: 'test-organizer',
      organizationName: '테스트극단',
      authorId: 'test-organizer',
      authorName: '테스트 운영자',
      status: 'active',
      tags: ['연극', '셰익스피어', '주연'],
      
      roles: [
        {
          name: '햄릿',
          gender: 'male',
          ageRange: '25-35세',
          requirements: '연기 경험 5년 이상, 셰익스피어 작품 경험 필수',
          count: 1
        },
        {
          name: '오필리어',
          gender: 'female',
          ageRange: '20-30세',
          requirements: '연기 경험 3년 이상, 노래 가능자 우대',
          count: 1
        }
      ],
      
      audition: {
        date: '2024년 10월 15일 (화) 오후 2시',
        location: '종로구 예술회관 (3호선 안국역 3번 출구)',
        requirements: ['자기소개 3분', '셰익스피어 독백 5분', '지정 대사 읽기'],
        resultDate: '2024년 10월 17일 (목)',
        method: '대면 오디션'
      },
      
      performance: {
        dates: ['2024년 12월 5일 (목) 19:30', '2024년 12월 6일 (금) 19:30', '2024년 12월 7일 (토) 15:00, 19:30', '2024년 12월 8일 (일) 15:00'],
        venue: '종로아트홀',
        ticketPrice: 'VIP 80,000원 / R석 60,000원 / S석 40,000원',
        targetAudience: '중학생 이상 관람가',
        genre: '연극'
      },
      
      benefits: {
        fee: '회차당 100,000원',
        transportation: true,
        costume: true,
        portfolio: true,
        photography: true,
        meals: false,
        other: ['공연 DVD 제공', '극단 소속 배우 인증서']
      },
      
      contact: {
        email: 'casting@testcompany.com',
        phone: '02-1234-5678',
        applicationMethod: '이메일 또는 전화',
        requiredDocuments: ['이력서', '프로필 사진', '연기 영상 (선택)']
      },
      
      deadline: '2024년 10월 12일 (토) 18:00',
      totalApplicants: 15,
      viewCount: 234,
      
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    }

    const postRef = await this.db.collection('posts').add(postData)
    console.log('✅ [TestDataService] 햄릿 게시글 데이터 추가 완료, ID:', postRef.id)

    // 두 번째 테스트 게시글 - 레미제라블
    const postData2 = {
      title: '[테스트] 레미제라블 앙상블 모집',
      description: '🎵 레미제라블 앙상블을 모집합니다!\n\n📍 모집 역할:\n- 앙상블 (남/여 무관, 20-40세)\n\n🎯 자격 요건:\n- 노래 가능자\n- 단체 연기 경험자',
      production: '레미제라블',
      rehearsalSchedule: '매주 화, 목 오후 7시-10시',
      location: '대학로 소극장',
      organizationId: 'test-organizer',
      organizationName: '테스트극단',
      authorId: 'test-organizer',
      authorName: '테스트 운영자',
      status: 'active',
      tags: ['뮤지컬', '앙상블'],
      
      roles: [
        {
          name: '혁명군 앙상블',
          gender: 'male',
          ageRange: '20-40세',
          requirements: '노래 실력 중급 이상, 군무 가능자',
          count: 8
        },
        {
          name: '시민 앙상블',
          gender: 'any',
          ageRange: '20-50세',
          requirements: '기본적인 노래 실력, 연기 경험',
          count: 12
        }
      ],
      
      audition: {
        date: '2024년 10월 20일 (일) 오후 1시',
        location: '대학로 뮤지컬 연습실 (4호선 혜화역 1번 출구)',
        requirements: ['자기소개 2분', '자유곡 1곡 (2분 이내)', '간단한 안무'],
        resultDate: '2024년 10월 22일 (화)',
        method: '대면 오디션'
      },
      
      performance: {
        dates: ['2025년 1월 10일 (금) 20:00', '2025년 1월 11일 (토) 15:00, 19:00', '2025년 1월 12일 (일) 15:00'],
        venue: '대학로 뮤지컬홀',
        ticketPrice: 'R석 50,000원 / S석 40,000원 / A석 30,000원',
        targetAudience: '전체 관람가',
        genre: '뮤지컬'
      },
      
      benefits: {
        fee: '회차당 30,000원',
        transportation: true,
        costume: true,
        portfolio: false,
        photography: false,
        meals: true,
        other: ['뮤지컬 OST 앨범 제공']
      },
      
      contact: {
        email: 'musical@testcompany.com',
        phone: '02-9876-5432',
        applicationMethod: '이메일 지원',
        requiredDocuments: ['이력서', '노래 영상 (필수)']
      },
      
      deadline: '2024년 10월 18일 (금) 23:59',
      totalApplicants: 42,
      viewCount: 156,
      
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    }

    const postRef2 = await this.db.collection('posts').add(postData2)
    console.log('✅ [TestDataService] 레미제라블 게시글 데이터 추가 완료, ID:', postRef2.id)
  }
}