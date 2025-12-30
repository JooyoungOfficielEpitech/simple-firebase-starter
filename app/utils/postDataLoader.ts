import type { Post } from '../components/PostCard';
import type { SheepVariant } from '../components/SheepCharacter';

// JSON 파일 조건부 import (파일이 없으면 빈 데이터 사용)
let postsData: any = { posts: [] };
try {
  postsData = require('../../all_2025-11-16_01-34-34.json');
} catch (error) {
  console.log('JSON 파일을 찾을 수 없습니다. 빈 게시판으로 시작합니다.');
}

/**
 * JSON 데이터 구조 정의
 */
interface CrawledPost {
  platform: 'naver' | 'daum' | 'all';
  title: string;
  author: string;
  posted_at: string;
  url: string;
  content: string;
  crawled_at: string;
  extracted_info: {
    event_date: string | null;
    event_time: string | null;
    location: string | null;
    price: string | null;
    contact: string | null;
  };
}

interface CrawledData {
  posts: CrawledPost[];
}

/**
 * 플랫폼에 따라 양 캐릭터를 매핑
 * - naver: 검은양 (black)
 * - daum: 흰양 (white)
 * - all: 흰양 (white, 기본값)
 */
const getSheepVariantFromPlatform = (platform: string): SheepVariant => {
  switch (platform) {
    case 'naver':
      return 'black';
    case 'daum':
      return 'white';
    default:
      return 'white';
  }
};

/**
 * 작성자 이름 정리
 * 예: "업템포원\n멤버등급 : 국가대표" → "업템포원"
 */
const cleanAuthorName = (author: string): string => {
  return author.split('\n')[0].trim();
};

/**
 * 날짜 형식을 "N시간 전", "N일 전" 형식으로 변환
 */
const formatTimestamp = (postedAt: string): string => {
  try {
    // "2025.10.25." 또는 "25.11.06" 형식 처리
    let dateStr = postedAt.replace(/\./g, '-').replace(/-$/, '');

    // 2자리 연도를 4자리로 변환
    if (dateStr.match(/^\d{2}-/)) {
      dateStr = '20' + dateStr;
    }

    const postDate = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 30) {
      return `${diffInDays}일 전`;
    } else {
      return postedAt;
    }
  } catch (error) {
    return postedAt;
  }
};

/**
 * 본문 생성
 * content가 없으면 extracted_info에서 정보 생성
 */
const generateContent = (crawledPost: CrawledPost): string => {
  if (crawledPost.content && crawledPost.content.trim()) {
    return crawledPost.content.trim();
  }

  // content가 없으면 추출된 정보로 본문 생성
  const { extracted_info } = crawledPost;
  const parts: string[] = [];

  if (extracted_info.event_date) {
    parts.push(`📅 일시: ${extracted_info.event_date}`);
    if (extracted_info.event_time) {
      parts[parts.length - 1] += ` ${extracted_info.event_time}`;
    }
  }

  if (extracted_info.location) {
    parts.push(`📍 장소: ${extracted_info.location}`);
  }

  if (extracted_info.price) {
    const priceNum = parseInt(extracted_info.price);
    const formattedPrice = priceNum.toLocaleString('ko-KR');
    parts.push(`💰 대관료: ${formattedPrice}원`);
  }

  if (extracted_info.contact) {
    parts.push(`📞 연락처: ${extracted_info.contact}`);
  }

  return parts.length > 0
    ? parts.join('\n\n')
    : '자세한 내용은 원문을 확인해주세요.';
};

/**
 * URL에서 고유 ID 생성
 * 중복 방지를 위해 URL 해시 사용
 */
const generateIdFromUrl = (url: string): string => {
  // URL의 마지막 부분을 ID로 사용
  const match = url.match(/articles\/(\d+)|datanum=(\d+)/);
  if (match) {
    return match[1] || match[2];
  }

  // 매칭 실패시 URL 전체의 간단한 해시 사용
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString();
};

/**
 * 크롤링된 데이터를 Post 형식으로 변환
 */
const convertCrawledPostToPost = (crawledPost: CrawledPost): Post => {
  return {
    id: generateIdFromUrl(crawledPost.url),
    author: cleanAuthorName(crawledPost.author),
    character: getSheepVariantFromPlatform(crawledPost.platform),
    timestamp: formatTimestamp(crawledPost.posted_at),
    title: crawledPost.title,
    content: generateContent(crawledPost),
    url: crawledPost.url,
  };
};

/**
 * JSON 파일에서 모든 게시글 로드
 */
export const loadPostsFromJson = (): Post[] => {
  try {
    const data = postsData as CrawledData;

    if (!data.posts || !Array.isArray(data.posts)) {
      console.warn('Invalid posts data format');
      return [];
    }

    return data.posts
      .map(convertCrawledPostToPost)
      .sort((a, b) => {
        // 최신 게시글이 위로 오도록 정렬 (ID 기준 내림차순)
        return parseInt(b.id) - parseInt(a.id);
      });
  } catch (error) {
    console.error('Failed to load posts from JSON:', error);
    return [];
  }
};

/**
 * ID로 특정 게시글 찾기
 */
export const getPostById = (postId: string): Post | null => {
  const posts = loadPostsFromJson();
  return posts.find(post => post.id === postId) || null;
};

/**
 * 플랫폼별 게시글 필터링
 */
export const getPostsByPlatform = (platform: 'naver' | 'daum' | 'all'): Post[] => {
  const posts = loadPostsFromJson();

  if (platform === 'all') {
    return posts;
  }

  const targetVariant = getSheepVariantFromPlatform(platform);
  return posts.filter(post => post.character === targetVariant);
};
