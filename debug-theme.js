const { MMKV } = require('react-native-mmkv');

// 기존 storage와 같은 설정으로 생성
const storage = new MMKV({
  id: "mmecoco-encrypted-storage",
  encryptionKey: process.env.EXPO_PUBLIC_ENCRYPTION_KEY_DEV
});

console.log('=== MMKV Storage Debug ===');

// 모든 키 확인
const allKeys = storage.getAllKeys();
console.log('All keys:', allKeys);

// 테마 관련 키들 확인
const themeKeys = [
  'ignite.themeScheme',
  'ignite.wickedCharacterScheme'
];

themeKeys.forEach(key => {
  const value = storage.getString(key);
  console.log(`${key}: ${value || 'undefined'}`);
});

// 현재 저장된 모든 값들 출력
allKeys.forEach(key => {
  const value = storage.getString(key);
  console.log(`${key}: ${value}`);
});