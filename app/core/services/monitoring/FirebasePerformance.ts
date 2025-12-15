/**
 * Firebase Performance SDK 통합
 * Custom Trace 및 모니터링
 */

import perf, { FirebasePerformanceTypes } from "@react-native-firebase/perf"
import { logger } from "@/core/utils/logger"

export class FirebasePerformance {
  private traces: Map<string, FirebasePerformanceTypes.Trace> = new Map()

  /**
   * Custom Trace 시작
   */
  async startTrace(traceName: string): Promise<void> {
    try {
      const trace = await perf().startTrace(traceName)
      this.traces.set(traceName, trace)
      logger.debug('FirebasePerformance', `🔥 Started trace: ${traceName}`)
    } catch (error) {
      logger.error('FirebasePerformance', `Failed to start trace ${traceName}`, { error })
    }
  }

  /**
   * Custom Trace 종료
   */
  async stopTrace(traceName: string): Promise<void> {
    try {
      const trace = this.traces.get(traceName)
      if (trace) {
        await trace.stop()
        this.traces.delete(traceName)
        logger.debug('FirebasePerformance', `🔥 Stopped trace: ${traceName}`)
      }
    } catch (error) {
      logger.error('FirebasePerformance', `Failed to stop trace ${traceName}`, { error })
    }
  }

  /**
   * Trace에 속성 추가
   */
  putTraceAttribute(traceName: string, attribute: string, value: string): void {
    const trace = this.traces.get(traceName)
    if (trace) {
      trace.putAttribute(attribute, value)
    }
  }

  /**
   * Trace에 메트릭 추가
   */
  putTraceMetric(traceName: string, metric: string, value: number): void {
    const trace = this.traces.get(traceName)
    if (trace) {
      trace.putMetric(metric, value)
    }
  }
}

// 전역 인스턴스
export const firebasePerformance = new FirebasePerformance()

// 헬퍼 함수: Trace 래퍼
export async function withTrace<T>(
  traceName: string,
  operation: () => Promise<T>
): Promise<T> {
  await firebasePerformance.startTrace(traceName)
  try {
    const result = await operation()
    await firebasePerformance.stopTrace(traceName)
    return result
  } catch (error) {
    await firebasePerformance.stopTrace(traceName)
    throw error
  }
}
