# 농구장 대관 데이터 Import 스크립트

## 사전 준비

1. Firebase Admin SDK 설치:
```bash
npm install --save-dev firebase-admin ts-node @types/node
```

2. Firebase Admin SDK 서비스 계정 키 파일이 프로젝트 루트에 있는지 확인:
```
yangdo-1319c-firebase-adminsdk-fbsvc-0aaad51400.json
```

## 사용법

### TypeScript로 실행
```bash
cd mobile-app/scripts
npx ts-node importCourtData.ts ../all_2025-11-16_01-34-34.json
```

### 다른 JSON 파일 import
```bash
npx ts-node importCourtData.ts /path/to/your/court-data.json
```

## 스크립트 기능

- ✅ JSON 파일에서 농구장 대관 데이터 읽기
- ✅ 중복 체크 (URL 기반)
- ✅ Firestore `court_rentals` 컬렉션에 저장
- ✅ Batch 처리 (500개씩)
- ✅ 상세한 진행 상황 로그

## 데이터 구조

Import된 데이터는 다음 필드를 포함합니다:

- `id`: 문서 ID
- `platform`: 플랫폼 (daum, naver 등)
- `title`: 포스트 제목
- `author`: 작성자
- `posted_at`: 게시 날짜
- `url`: 원본 포스트 URL
- `content`: 전체 내용
- `crawled_at`: 크롤링 시간
- `extracted_info`: 추출된 정보
  - `event_date`: 행사 날짜
  - `event_time`: 시작 시간
  - `event_time_end`: 종료 시간
  - `location`: 위치
  - `price`: 가격
  - `contact`: 연락처
- `is_available`: 사용 가능 여부 (true)
- `createdAt`: 생성 시간
- `updatedAt`: 수정 시간

## 주의사항

- 중복된 URL은 자동으로 건너뜁니다
- Firestore batch 제한(500개)에 맞춰 자동으로 분할 처리됩니다
- 실행 전 Firebase 프로젝트 설정을 확인하세요
