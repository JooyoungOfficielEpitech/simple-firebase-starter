/**
 * Zustand 로거 미들웨어
 * 개발 환경에서 상태 변경 추적
 */
import { StateCreator, StoreMutatorIdentifier } from "zustand"

type Logger = <
  S,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<S, Mps, Mcs>,
  options?: LoggerOptions,
) => StateCreator<S, Mps, Mcs>

export interface LoggerOptions {
  /** 스토어 이름 */
  name?: string
  /** 활성화 여부 (기본값: __DEV__) */
  enabled?: boolean
  /** 상태 diff 표시 */
  diff?: boolean
  /** 콘솔 색상 */
  colors?: {
    prevState?: string
    action?: string
    nextState?: string
  }
}

const defaultColors = {
  prevState: "#9E9E9E",
  action: "#03A9F4",
  nextState: "#4CAF50",
}

/**
 * 상태 diff 계산
 */
const getStateDiff = (prevState: any, nextState: any): Record<string, any> => {
  const diff: Record<string, any> = {}

  // 변경된 키 찾기
  Object.keys(nextState).forEach((key) => {
    if (prevState[key] !== nextState[key]) {
      diff[key] = {
        prev: prevState[key],
        next: nextState[key],
      }
    }
  })

  return diff
}

/**
 * 로거 미들웨어
 */
export const logger: Logger =
  (config, options = {}) =>
  (set, get, api) => {
    const {
      name = "Store",
      enabled = __DEV__,
      diff = true,
      colors = defaultColors,
    } = options

    if (!enabled) {
      return config(set, get, api)
    }

    return config(
      ((args: any, ...rest: any[]) => {
        const prevState = get()
        const timestamp = new Date().toLocaleTimeString()

        // 상태 업데이트 실행
        set(args, ...rest)

        const nextState = get()

        // 로그 출력
        console.group(
          `%c[${name}] %c@ ${timestamp}`,
          `color: ${colors.action}; font-weight: bold`,
          "color: gray; font-weight: lighter",
        )

        if (diff) {
          const stateDiff = getStateDiff(prevState, nextState)
          if (Object.keys(stateDiff).length > 0) {
            console.log("%cprev state", `color: ${colors.prevState}`, prevState)
            console.log("%cdiff", `color: ${colors.action}`, stateDiff)
            console.log("%cnext state", `color: ${colors.nextState}`, nextState)
          } else {
            console.log("No state changes")
          }
        } else {
          console.log("%cprev state", `color: ${colors.prevState}`, prevState)
          console.log("%cnext state", `color: ${colors.nextState}`, nextState)
        }

        console.groupEnd()
      }) as any,
      get,
      api,
    )
  }
