// 게시글 템플릿 시스템

export interface PostTemplate {
  id: string
  name: string
  icon: string
  category: string
  template: {
    title: string
    production: string
    description: string
    roles: Array<{
      name: string
      gender: "male" | "female" | "any"
      ageRange: string
      requirements: string
      count: number
    }>
    auditionDate: string
    auditionLocation: string
    auditionRequirements: string
    auditionResultDate: string
    auditionMethod: "대면" | "화상" | "서류"
    performanceDates: string
    performanceVenue: string
    ticketPrice: string
    targetAudience: string
    genre: "연극" | "뮤지컬" | "창작" | "기타"
    fee: string
    transportation: boolean
    costume: boolean
    portfolio: boolean
    photography: boolean
    meals: boolean
    otherBenefits: string
    contactEmail: string
    contactPhone: string
    applicationMethod: "이메일" | "전화" | "온라인폼" | "방문"
    requiredDocuments: string
    tags: string
  }
}

export const POST_TEMPLATES: PostTemplate[] = [
  {
    id: "musical-ensemble",
    name: "뮤지컬 양상블 모집",
    icon: "🎵",
    category: "뮤지컬",
    template: {
      title: "[뮤지컬] 레미제라블 양상블 모집",
      production: "레미제라블",
      description: `🎵 레미제라블 양상블을 모집합니다!

클래식 뮤지컬 레미제라블에서 함께할 앙상블 멤버들을 찾고 있습니다.
열정적이고 성실한 분들의 많은 지원 바랍니다.

📅 공연 예정: 2024년 12월
🎭 연습 기간: 2개월
🏟️ 공연 장소: 대학로 소극장`,
      roles: [{
        name: "레미제라블 양상블",
        gender: "any",
        ageRange: "20-40세",
        requirements: "노래 가능자, 단체 연기 경험자",
        count: 8
      }],
      auditionDate: "2024년 10월 20일 (일) 오후 2시",
      auditionLocation: "대학로 소극장",
      auditionRequirements: "자기소개, 자유곡 1분",
      auditionResultDate: "2024년 10월 22일 (화)",
      auditionMethod: "대면",
      performanceDates: "2024년 12월 7일, 8일, 14일, 15일",
      performanceVenue: "대학로 소극장",
      ticketPrice: "일반 3만원, 학생 2만원",
      targetAudience: "전체 관람가",
      genre: "뮤지컬",
      fee: "회차당 5만원",
      transportation: true,
      costume: true,
      portfolio: false,
      photography: false,
      meals: true,
      otherBenefits: "",
      contactEmail: "contact@example.com",
      contactPhone: "010-1234-5678",
      applicationMethod: "이메일",
      requiredDocuments: "이력서, 자기소개서, 프로필 사진",
      tags: "뮤지컬, 양상블, 레미제라블"
    }
  },
  {
    id: "play-lead",
    name: "연극 주연 모집",
    icon: "🎭",
    category: "연극",
    template: {
      title: "[연극] 햄릿 주연 모집",
      production: "햄릿",
      description: `🎭 셰익스피어의 대표작 햄릿 주연을 모집합니다!

클래식한 작품에 도전하고 싶은 열정적인 배우를 찾고 있습니다.
깊이 있는 캐릭터 분석과 탄탄한 연기력이 필요합니다.

📅 공연 예정: 2024년 11월
🎭 연습 기간: 3개월
🏟️ 공연 장소: 대학로 중극장`,
      roles: [{
        name: "햄릿 (주인공)",
        gender: "male",
        ageRange: "25-35세",
        requirements: "연극 경험 3년 이상, 서울/경기 거주자",
        count: 1
      }],
      auditionDate: "2024년 10월 25일 (금) 오후 7시",
      auditionLocation: "대학로 중극장 연습실",
      auditionRequirements: "독백 3분, 즉흥 연기",
      auditionResultDate: "2024년 10월 27일 (일)",
      auditionMethod: "대면",
      performanceDates: "2024년 11월 매주 금토일",
      performanceVenue: "대학로 중극장",
      ticketPrice: "일반 4만원, 학생 3만원",
      targetAudience: "15세 이상",
      genre: "연극",
      fee: "총 출연료 200만원",
      transportation: true,
      costume: true,
      portfolio: true,
      photography: true,
      meals: false,
      otherBenefits: "포스터 촬영, 홍보 영상 촬영",
      contactEmail: "theater@example.com",
      contactPhone: "010-9876-5432",
      applicationMethod: "이메일",
      requiredDocuments: "이력서, 연기 경력, 프로필 사진, 포트폴리오",
      tags: "연극, 주연, 햄릿, 셰익스피어"
    }
  },
  {
    id: "creative-musical",
    name: "창작 뮤지컬",
    icon: "✨",
    category: "창작",
    template: {
      title: "[창작뮤지컬] 새로운 이야기 함께 만들어요",
      production: "청춘, 그 찬란한 순간",
      description: `✨ 창작 뮤지컬에 함께 참여할 멤버를 모집합니다!

새로운 이야기를 함께 만들어가고 싶은 열정적인 분들을 찾습니다.
창작 과정부터 무대까지 모든 과정에 참여하실 수 있습니다.

📝 대본: 창작 진행 중
🎼 음악: 오리지널 넘버
🎭 연습 기간: 4개월`,
      roles: [{
        name: "주인공 (남/여)",
        gender: "any",
        ageRange: "20-30세",
        requirements: "창작에 대한 열정, 노래와 연기 모두 가능",
        count: 2
      }],
      auditionDate: "2024년 11월 1일 (금) 오후 6시",
      auditionLocation: "홍대 연습실",
      auditionRequirements: "자기소개, 자유곡, 즉흥 연기",
      auditionResultDate: "2024년 11월 3일 (일)",
      auditionMethod: "대면",
      performanceDates: "2025년 3월 예정",
      performanceVenue: "홍대 소극장",
      ticketPrice: "미정",
      targetAudience: "전체 관람가",
      genre: "뮤지컬",
      fee: "협의 후 결정",
      transportation: false,
      costume: false,
      portfolio: false,
      photography: false,
      meals: false,
      otherBenefits: "창작 과정 참여, 네트워킹",
      contactEmail: "creative@example.com",
      contactPhone: "",
      applicationMethod: "이메일",
      requiredDocuments: "간단한 자기소개서, 프로필 사진",
      tags: "창작뮤지컬, 새로운도전, 청춘"
    }
  },
  {
    id: "audition-general",
    name: "일반 오디션",
    icon: "🎪",
    category: "오디션",
    template: {
      title: "[오디션] 다양한 역할 모집",
      production: "종합 공연",
      description: `🎪 다양한 장르의 공연에 참여할 배우들을 모집합니다!

여러 작품에 도전해보고 싶은 분들에게 좋은 기회입니다.
본인의 장점을 살릴 수 있는 역할을 매칭해드립니다.

🎭 다양한 장르: 연극, 뮤지컬, 코미디
📅 프로젝트별 일정 상이`,
      roles: [{
        name: "다양한 역할",
        gender: "any",
        ageRange: "18세 이상",
        requirements: "성실하고 열정적인 분",
        count: 10
      }],
      auditionDate: "상시 모집",
      auditionLocation: "상황에 따라 안내",
      auditionRequirements: "자기소개, 특기 선택",
      auditionResultDate: "개별 안내",
      auditionMethod: "대면",
      performanceDates: "프로젝트별 상이",
      performanceVenue: "프로젝트별 상이",
      ticketPrice: "프로젝트별 상이",
      targetAudience: "프로젝트별 상이",
      genre: "기타",
      fee: "프로젝트별 협의",
      transportation: false,
      costume: false,
      portfolio: false,
      photography: false,
      meals: false,
      otherBenefits: "다양한 경험, 네트워킹",
      contactEmail: "audition@example.com",
      contactPhone: "010-1111-2222",
      applicationMethod: "이메일",
      requiredDocuments: "이력서, 프로필 사진",
      tags: "오디션, 다양한역할, 상시모집"
    }
  }
]

export const getTemplateById = (id: string): PostTemplate | undefined => {
  return POST_TEMPLATES.find(template => template.id === id)
}

export const getTemplatesByCategory = (category: string): PostTemplate[] => {
  return POST_TEMPLATES.filter(template => template.category === category)
}