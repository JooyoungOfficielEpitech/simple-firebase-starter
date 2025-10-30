/**
 * Global type definitions for TrackPlayer service
 */

declare global {
  /**
   * A-B 루프 설정 함수
   * @param enabled - 루프 활성화 여부
   * @param pointA - A 지점 (초 단위)
   * @param pointB - B 지점 (초 단위)
   */
  var setABLoop: ((enabled: boolean, pointA: number | null, pointB: number | null) => void) | undefined

  /**
   * TrackPlayer 초기화 상태 확인 함수
   * @returns TrackPlayer가 초기화되었는지 여부
   */
  var isPlayerInitialized: (() => boolean) | undefined

  /**
   * TrackPlayer 초기화 상태 설정 함수
   * @param initialized - 초기화 상태
   */
  var setPlayerInitialized: ((initialized: boolean) => void) | undefined

  /**
   * A-B 루프 체크 시작 함수 (백그라운드)
   */
  var startABLoopCheck: (() => void) | undefined

  /**
   * A-B 루프 체크 중지 함수 (백그라운드)
   */
  var stopABLoopCheck: (() => void) | undefined
}

export {}
