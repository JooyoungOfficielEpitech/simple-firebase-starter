// React Native 환경에서 실행할 수 있는 간단한 테스트 데이터 추가 스크립트
// 이 코드를 앱의 임시 버튼에서 실행하거나 개발자 도구에서 실행

import firestore from '@react-native-firebase/firestore';

export async function addTestData() {
  try {
    const db = firestore();
    
    console.log('🔥 테스트 데이터 추가 시작...');

    // 1. 사용자 데이터 추가
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
    };

    await db.collection('users').doc('test-organizer').set(userData);
    console.log('✅ 사용자 데이터 추가 완료');

    // 2. 게시글 데이터 추가
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
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('posts').add(postData);
    console.log('✅ 게시글 데이터 추가 완료');

    // 3. 추가 게시글
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
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('posts').add(postData2);
    console.log('✅ 추가 게시글 데이터 추가 완료');

    console.log('🎉 모든 테스트 데이터 추가 완료!');
    return true;
  } catch (error) {
    console.error('❌ 데이터 추가 실패:', error);
    return false;
  }
}

// 사용법: 앱에서 이 함수를 호출
// addTestData();