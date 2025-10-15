#!/usr/bin/env node

/**
 * Firebase Storage 보안 규칙 테스트 스크립트
 * 실제 Firebase Storage 인스턴스에 대해 규칙 검증 수행
 */

const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');

// Firebase 설정 (실제 프로젝트 설정)
const firebaseConfig = {
  // .env 파일에서 실제 설정 로드 필요
  // 여기서는 테스트용 설정만 표시
};

console.log('🔥 Firebase Storage 보안 규칙 테스트 시작\n');

// 테스트 시나리오
const testScenarios = [
  {
    name: '✅ 인증된 사용자의 정상적인 이미지 업로드',
    description: 'JPEG 이미지 5MB 이하를 posts/ 경로에 업로드',
    shouldSucceed: true,
    test: async (storage, auth) => {
      // 테스트용 작은 이미지 데이터 생성
      const testImageData = new Uint8Array([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46  // JPEG 헤더
      ]);
      
      const storageRef = ref(storage, 'posts/test-image.jpg');
      await uploadBytes(storageRef, testImageData, {
        contentType: 'image/jpeg'
      });
      
      // 업로드 성공 시 URL 가져오기
      const downloadURL = await getDownloadURL(storageRef);
      console.log(`  ✅ 업로드 성공: ${downloadURL.substring(0, 50)}...`);
      
      // 테스트 파일 정리
      await deleteObject(storageRef);
      console.log('  🗑️ 테스트 파일 삭제 완료');
    }
  },
  
  {
    name: '❌ 비인증 사용자의 업로드 시도',
    description: '로그아웃 상태에서 파일 업로드 시도',
    shouldSucceed: false,
    test: async (storage, auth) => {
      // 로그아웃
      await signOut(auth);
      
      const testImageData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
      const storageRef = ref(storage, 'posts/unauthorized-test.jpg');
      
      try {
        await uploadBytes(storageRef, testImageData, {
          contentType: 'image/jpeg'
        });
        throw new Error('업로드가 성공했습니다 (예상: 실패)');
      } catch (error) {
        if (error.code === 'storage/unauthorized') {
          console.log('  ✅ 예상대로 접근 거부됨');
        } else {
          throw error;
        }
      }
    }
  },
  
  {
    name: '❌ 허용되지 않는 파일 타입 업로드',
    description: '텍스트 파일을 이미지 경로에 업로드 시도',
    shouldSucceed: false,
    test: async (storage, auth) => {
      const textData = new TextEncoder().encode('This is a text file');
      const storageRef = ref(storage, 'posts/malicious-file.txt');
      
      try {
        await uploadBytes(storageRef, textData, {
          contentType: 'text/plain'
        });
        throw new Error('업로드가 성공했습니다 (예상: 실패)');
      } catch (error) {
        if (error.code === 'storage/unauthorized') {
          console.log('  ✅ 예상대로 잘못된 파일 타입 거부됨');
        } else {
          throw error;
        }
      }
    }
  },
  
  {
    name: '❌ 대용량 파일 업로드 시도',
    description: '5MB 초과 파일 업로드 시도',
    shouldSucceed: false,
    test: async (storage, auth) => {
      // 6MB 크기의 테스트 데이터 생성
      const largeData = new Uint8Array(6 * 1024 * 1024);
      largeData.fill(0xFF); // 데이터로 채우기
      
      const storageRef = ref(storage, 'posts/large-file.jpg');
      
      try {
        await uploadBytes(storageRef, largeData, {
          contentType: 'image/jpeg'
        });
        throw new Error('업로드가 성공했습니다 (예상: 실패)');
      } catch (error) {
        if (error.code === 'storage/unauthorized') {
          console.log('  ✅ 예상대로 대용량 파일 거부됨');
        } else {
          throw error;
        }
      }
    }
  },
  
  {
    name: '✅ 사용자 프로필 경로 접근 제어',
    description: '본인의 프로필 폴더에 이미지 업로드',
    shouldSucceed: true,
    test: async (storage, auth) => {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('사용자가 로그인되어 있지 않습니다');
      }
      
      const testImageData = new Uint8Array([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46
      ]);
      
      const storageRef = ref(storage, `profiles/${user.uid}/profile-pic.jpg`);
      await uploadBytes(storageRef, testImageData, {
        contentType: 'image/jpeg'
      });
      
      console.log('  ✅ 프로필 이미지 업로드 성공');
      
      // 테스트 파일 정리
      await deleteObject(storageRef);
      console.log('  🗑️ 프로필 테스트 파일 삭제 완료');
    }
  }
];

// 메인 테스트 실행 함수
async function runStorageRulesTests() {
  console.log('🚀 Firebase Storage 보안 규칙 검증 시작...\n');
  
  try {
    // Firebase 초기화
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    const auth = getAuth(app);
    
    // 테스트용 사용자로 로그인 (실제 환경에서는 테스트 계정 사용)
    console.log('👤 테스트 사용자 로그인 중...');
    // await signInWithEmailAndPassword(auth, 'test@example.com', 'password');
    console.log('⚠️ 실제 테스트를 위해서는 테스트 계정 정보가 필요합니다\n');
    
    // 각 테스트 시나리오 실행
    let passedTests = 0;
    let totalTests = testScenarios.length;
    
    for (const scenario of testScenarios) {
      console.log(`📋 테스트: ${scenario.name}`);
      console.log(`   설명: ${scenario.description}`);
      
      try {
        await scenario.test(storage, auth);
        
        if (scenario.shouldSucceed) {
          console.log('   ✅ 테스트 통과\n');
          passedTests++;
        } else {
          console.log('   ❌ 테스트 실패 (성공했지만 실패해야 함)\n');
        }
      } catch (error) {
        if (!scenario.shouldSucceed) {
          console.log('   ✅ 테스트 통과 (예상대로 실패)\n');
          passedTests++;
        } else {
          console.log(`   ❌ 테스트 실패: ${error.message}\n`);
        }
      }
    }
    
    // 테스트 결과 요약
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(50));
    console.log(`통과한 테스트: ${passedTests}/${totalTests}`);
    console.log(`성공률: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 모든 보안 규칙 테스트가 성공적으로 통과되었습니다!');
      console.log('✅ Firebase Storage 보안 규칙이 올바르게 구성되었습니다.');
    } else {
      console.log('\n⚠️ 일부 테스트가 실패했습니다. 보안 규칙을 다시 확인해주세요.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error.message);
    process.exit(1);
  }
}

// 실제 테스트 실행을 위한 도움말
console.log('📝 테스트 실행 가이드');
console.log('='.repeat(50));
console.log('1. .env 파일에 Firebase 설정 추가');
console.log('2. 테스트용 Firebase 사용자 계정 생성');
console.log('3. 계정 정보를 스크립트에 추가');
console.log('4. npm install firebase 실행');
console.log('5. node test-storage-rules.js 실행');
console.log('');

console.log('🔧 수동 테스트 방법');
console.log('='.repeat(50));
console.log('1. Firebase Console → Storage → Rules 탭에서 규칙 확인');
console.log('2. 테스트 앱에서 이미지 업로드 시도');
console.log('3. 다양한 파일 타입과 크기로 테스트');
console.log('4. 브라우저 개발자 도구에서 오류 메시지 확인');

// 실제 프로덕션에서는 이 함수를 주석 해제하여 실행
// runStorageRulesTests();