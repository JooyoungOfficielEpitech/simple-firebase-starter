# Metronome Sound Files

이 디렉토리에는 메트로놈 사운드 파일이 포함되어 있습니다.

## 현재 파일 (자동 생성됨)

✅ **포함된 파일**:
1. `metronome-high.wav` - 강박용 (첫 박) 1000Hz 비프음
2. `metronome-low.wav` - 약박용 600Hz 비프음

이 파일들은 `scripts/generate-metronome-sounds.js`를 통해 자동 생성되었습니다.

## 사운드 재생성

사운드 파일을 다시 생성하려면:
```bash
node scripts/generate-metronome-sounds.js
```

## 사운드 파일 교체

더 나은 품질의 사운드로 교체하려면:

### Option 1: 온라인 다운로드
- **Freesound.org**: https://freesound.org/search/?q=metronome
- **Zapsplat**: https://www.zapsplat.com/
- 검색어: "metronome click", "metronome beep"

### Option 2: 직접 생성 (Audacity 사용)
1. Audacity 설치: https://www.audacityteam.org/
2. Generate > Tone 선택
3. 강박용 (high):
   - Frequency: 1000 Hz
   - Duration: 0.08-0.1초
   - Waveform: Square
4. 약박용 (low):
   - Frequency: 500-600 Hz
   - Duration: 0.08-0.1초
   - Waveform: Square
5. Export as WAV (또는 MP3)

### Option 3: 전문 샘플 사용
- Logic Pro, Ableton, FL Studio 등의 메트로놈 샘플
- 다양한 악기 사운드 (우드블록, 클릭, 비프 등)

## 파일 형식

**지원 형식**:
- ✅ WAV (현재 사용 중)
- ✅ MP3 (expo-av 지원)
- ✅ AAC
- ✅ M4A

**권장**:
- WAV: 무손실 품질, 파일 크기 작음 (짧은 사운드)
- MP3: 압축 형식, 파일 크기 최소화

## 파일 이름 규칙

useMetronome Hook은 다음 파일을 찾습니다:
```
app/assets/sounds/
  ├── metronome-high.wav  (또는 .mp3)
  ├── metronome-low.wav   (또는 .mp3)
  └── README.md (이 파일)
```

**중요**: 파일 확장자를 변경하면 `app/hooks/useMetronome.ts`의 `require()` 경로도 수정해야 합니다.

## 라이선스 주의사항
- 현재 포함된 WAV 파일: 자동 생성, 라이선스 제한 없음
- 외부 샘플 사용 시: 상업적 사용 가능 라이선스 확인
- 권장: Creative Commons 0 (CC0) 또는 Public Domain

## 문제 해결

### 사운드가 재생되지 않음
1. 파일 경로 확인
2. 파일 형식 확인 (WAV/MP3)
3. 콘솔 로그 확인
4. 무음 모드로 동작 (시각적 박자 표시만)

### 사운드 품질 개선
1. 더 높은 샘플레이트 사용 (44.1kHz 이상)
2. 전문 샘플 다운로드
3. 페이드 인/아웃 적용 (클릭 노이즈 제거)
