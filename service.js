import TrackPlayer, { Event } from 'react-native-track-player';

// A-B 루프 상태를 전역으로 관리
let abLoopState = {
  enabled: false,
  pointA: null,
  pointB: null,
};

// service.js 로딩 상태 추적
let serviceLoaded = false;
let playerInitialized = false;

global.isServiceLoaded = () => serviceLoaded;
global.isPlayerInitialized = () => playerInitialized;
global.setPlayerInitialized = (status) => { playerInitialized = status; };

// A-B 루프 상태 설정 함수
global.setABLoop = (enabled, pointA = null, pointB = null) => {
  abLoopState = { enabled, pointA, pointB };
  console.log('🔄 [Service] A-B 루프 설정:', abLoopState);
};

// A-B 루프 상태 가져오기 함수
global.getABLoop = () => abLoopState;

module.exports = async function() {
  // 기본 리모트 컨트롤 이벤트
  TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());
  TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause());
  TrackPlayer.addEventListener('remote-stop', () => TrackPlayer.destroy());
  
  // 재생 위치 변경 이벤트 리스너 (A-B 루프용)
  TrackPlayer.addEventListener('playback-track-changed', async () => {
    console.log('🎵 [Service] 트랙 변경됨');
  });

  // A-B 루프 체크 함수 (안전한 setInterval 방식)
  const checkABLoop = async () => {
    if (!abLoopState.enabled || abLoopState.pointA === null || abLoopState.pointB === null) {
      return;
    }

    try {
      // TrackPlayer 상태 먼저 확인
      const state = await TrackPlayer.getState();
      if (state !== 'playing' && state !== 'buffering') {
        return; // 재생 중이 아니면 루프 체크 하지 않음
      }
      
      const position = await TrackPlayer.getProgress();
      
      // B 지점에 도달하면 A 지점으로 이동
      if (position.position >= abLoopState.pointB) {
        console.log(`🔄 [Service] A-B 루프: ${abLoopState.pointB}s → ${abLoopState.pointA}s`);
        await TrackPlayer.seekTo(abLoopState.pointA);
      }
    } catch (error) {
      // TrackPlayer가 초기화되지 않았으면 조용히 스킵
      if (error.message?.includes('not initialized')) {
        return; // 로그도 출력하지 않음 (스팸 방지)
      }
      console.error('❌ [Service] A-B 루프 체크 오류:', error);
    }
  };

  // 백그라운드에서도 작동하는 setInterval (iOS에서 허용하는 범위 내)
  let abLoopInterval;

  const startABLoopCheck = () => {
    if (abLoopInterval) {
      clearInterval(abLoopInterval);
    }
    // 1초 간격으로 체크 (배터리 절약)
    abLoopInterval = setInterval(checkABLoop, 1000);
    console.log('🔄 [Service] A-B 루프 체크 시작 (1초 간격)');
  };

  const stopABLoopCheck = () => {
    if (abLoopInterval) {
      clearInterval(abLoopInterval);
      abLoopInterval = null;
      console.log('🛑 [Service] A-B 루프 체크 중지');
    }
  };

  // 전역 함수로 노출
  global.startABLoopCheck = startABLoopCheck;
  global.stopABLoopCheck = stopABLoopCheck;

  // TrackPlayer가 준비된 후에 시작
  setTimeout(() => {
    startABLoopCheck();
  }, 2000); // 2초 후 시작

  // service.js 로딩 완료 표시
  serviceLoaded = true;
  console.log('✅ [Service] TrackPlayer 서비스 시작됨 (A-B 루프 포함)');
};