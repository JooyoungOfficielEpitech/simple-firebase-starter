# Firebase Storage Security Rules Setup

Firebase Storage Security Rules 설정 가이드

## Storage Bucket Structure

```
gs://your-project-id.appspot.com/
├── users/
│   └── {userId}/
│       ├── profile/
│       │   └── avatar.jpg          # 프로필 이미지
│       └── photos/
│           └── {photoId}.jpg       # 추가 사진들
├── public/
│   └── assets/                     # 공개 이미지 (앱 아이콘 등)
└── temp/
    └── {userId}/
        └── {uploadId}.jpg          # 임시 업로드 (24시간 후 삭제)
```

## Security Rules

Firebase Console > Storage > Rules 탭에서 아래 규칙을 설정하세요.

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // ========================================
    // Helper Functions
    // ========================================

    // 인증된 사용자인지 확인
    function isAuthenticated() {
      return request.auth != null;
    }

    // 본인 확인
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // 이미지 파일 타입 확인
    function isImageFile() {
      return request.resource.contentType.matches('image/.*');
    }

    // 파일 크기 제한 (5MB)
    function isValidSize() {
      return request.resource.size < 5 * 1024 * 1024;
    }

    // 이미지 업로드 유효성 검사
    function isValidImageUpload() {
      return isImageFile() && isValidSize();
    }

    // ========================================
    // User Profile Images
    // ========================================

    // /users/{userId}/profile/{fileName}
    match /users/{userId}/profile/{fileName} {
      // 읽기: 인증된 모든 사용자
      allow read: if isAuthenticated();

      // 쓰기: 본인만 + 이미지 파일 + 5MB 이하
      allow write: if isOwner(userId)
                   && isValidImageUpload();

      // 삭제: 본인만
      allow delete: if isOwner(userId);
    }

    // ========================================
    // User Additional Photos
    // ========================================

    // /users/{userId}/photos/{photoId}
    match /users/{userId}/photos/{photoId} {
      // 읽기: 인증된 모든 사용자
      allow read: if isAuthenticated();

      // 쓰기: 본인만 + 이미지 파일 + 5MB 이하
      allow write: if isOwner(userId)
                   && isValidImageUpload();

      // 삭제: 본인만
      allow delete: if isOwner(userId);
    }

    // ========================================
    // Public Assets
    // ========================================

    // /public/assets/{fileName}
    match /public/assets/{fileName} {
      // 읽기: 모든 사용자 (인증 불필요)
      allow read: if true;

      // 쓰기: 불허 (Firebase Console에서만 관리)
      allow write: if false;
    }

    // ========================================
    // Temporary Uploads
    // ========================================

    // /temp/{userId}/{uploadId}
    match /temp/{userId}/{uploadId} {
      // 읽기: 본인만
      allow read: if isOwner(userId);

      // 쓰기: 본인만 + 이미지 파일 + 5MB 이하
      allow write: if isOwner(userId)
                   && isValidImageUpload();

      // 삭제: 본인만
      allow delete: if isOwner(userId);
    }

    // ========================================
    // Deny All Other Paths
    // ========================================

    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Rules 설명

### Helper Functions

| Function | Description |
|----------|-------------|
| `isAuthenticated()` | Firebase Auth로 로그인한 사용자인지 확인 |
| `isOwner(userId)` | 요청한 경로의 userId와 로그인한 사용자가 동일한지 확인 |
| `isImageFile()` | 업로드 파일이 이미지 타입인지 확인 |
| `isValidSize()` | 파일 크기가 5MB 이하인지 확인 |
| `isValidImageUpload()` | 이미지 파일 + 크기 제한 조합 검증 |

### 경로별 권한

| Path | Read | Write | Delete |
|------|------|-------|--------|
| `/users/{userId}/profile/` | 인증된 사용자 | 본인만 | 본인만 |
| `/users/{userId}/photos/` | 인증된 사용자 | 본인만 | 본인만 |
| `/public/assets/` | 모든 사용자 | 불허 | 불허 |
| `/temp/{userId}/` | 본인만 | 본인만 | 본인만 |

## Storage Lifecycle Rules (선택사항)

Firebase Console에서 Object Lifecycle Management를 설정하여 임시 파일을 자동 삭제할 수 있습니다.

### Google Cloud Console에서 설정

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. Storage > Browser > your-project-id.appspot.com 선택
3. Lifecycle 탭 클릭
4. Add a rule 클릭
5. 아래 조건 설정:
   - Object name prefix: `temp/`
   - Age: 1 day
   - Action: Delete

### JSON 설정 예시

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": 1,
          "matchesPrefix": ["temp/"]
        }
      }
    ]
  }
}
```

## CORS 설정 (Web 지원 시)

웹에서 Storage에 접근하려면 CORS 설정이 필요합니다.

### cors.json 파일 생성

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
  }
]
```

### gsutil로 적용

```bash
gsutil cors set cors.json gs://your-project-id.appspot.com
```

## 테스트

### Rules Playground 사용

Firebase Console > Storage > Rules 탭 > Rules Playground

테스트 시나리오:
1. 인증된 사용자가 본인 프로필 이미지 업로드
2. 인증된 사용자가 타인 프로필 이미지 업로드 시도 (실패해야 함)
3. 비인증 사용자가 public 이미지 읽기 (성공해야 함)
4. 5MB 초과 파일 업로드 시도 (실패해야 함)

### 로컬 에뮬레이터 테스트

```bash
# Firebase Emulator 시작
firebase emulators:start --only storage

# 에뮬레이터 URL
# http://localhost:9199
```

## 참고 사항

- **파일 크기 제한**: 5MB (필요시 조정 가능)
- **지원 파일 형식**: image/* (JPEG, PNG, GIF, WebP 등)
- **임시 파일**: 24시간 후 자동 삭제 (Lifecycle Rules 설정 시)
- **프로필 이미지 경로**: `/users/{userId}/profile/avatar.jpg` 고정 권장

## 다음 단계

1. [x] Security Rules 설정
2. [ ] Image Upload Service 구현 (Phase 1.2.2)
3. [ ] Profile Image Component 구현 (Phase 1.2.3)
