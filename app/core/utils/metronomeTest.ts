/**
 * 메트로놈 타이밍 정확도 테스트 유틸리티
 *
 * 사용법:
 * import { testMetronomeTiming } from '../utils/metronomeTest';
 * testMetronomeTiming(120, 10); // 120 BPM으로 10박자 테스트
 */

export interface TimingTestResult {
  bpm: number;
  expectedInterval: number;
  beats: number;
  timings: number[];
  averageInterval: number;
  maxDeviation: number;
  accuracy: number; // 0-100 percentage
}

/**
 * 메트로놈 타이밍 정확도 테스트
 *
 * @param bpm - 테스트할 BPM
 * @param beats - 테스트할 박자 수
 * @param callback - 각 박자마다 호출될 콜백 (선택)
 * @returns Promise<TimingTestResult>
 */
export const testMetronomeTiming = (
  bpm: number,
  beats: number,
  callback?: (beat: number, deviation: number) => void
): Promise<TimingTestResult> => {
  return new Promise((resolve) => {
    const expectedInterval = 60000 / bpm;
    const timings: number[] = [];
    let lastTime = Date.now();
    let beatCount = 0;

    const interval = setInterval(() => {
      const now = Date.now();
      const actualInterval = now - lastTime;
      timings.push(actualInterval);
      lastTime = now;

      const deviation = actualInterval - expectedInterval;
      if (callback) {
        callback(beatCount, deviation);
      }

      console.log(
        `Beat ${beatCount + 1}/${beats}: ${actualInterval.toFixed(2)}ms (expected: ${expectedInterval.toFixed(2)}ms, deviation: ${deviation > 0 ? '+' : ''}${deviation.toFixed(2)}ms)`
      );

      beatCount++;

      if (beatCount >= beats) {
        clearInterval(interval);

        // Calculate statistics
        const sum = timings.reduce((a, b) => a + b, 0);
        const avg = sum / timings.length;
        const deviations = timings.map((t) => Math.abs(t - expectedInterval));
        const maxDeviation = Math.max(...deviations);
        const accuracy = 100 - (maxDeviation / expectedInterval) * 100;

        const result: TimingTestResult = {
          bpm,
          expectedInterval,
          beats,
          timings,
          averageInterval: avg,
          maxDeviation,
          accuracy: Math.max(0, accuracy),
        };

        console.log('\n📊 타이밍 테스트 결과:');
        console.log(`BPM: ${bpm}`);
        console.log(`예상 간격: ${expectedInterval.toFixed(2)}ms`);
        console.log(`평균 간격: ${avg.toFixed(2)}ms`);
        console.log(`최대 오차: ${maxDeviation.toFixed(2)}ms`);
        console.log(`정확도: ${accuracy.toFixed(2)}%`);

        resolve(result);
      }
    }, expectedInterval);
  });
};

/**
 * 여러 BPM으로 타이밍 테스트 실행
 *
 * @param bpmList - 테스트할 BPM 리스트
 * @param beatsPerTest - 각 테스트당 박자 수
 * @returns Promise<TimingTestResult[]>
 */
export const testMultipleBPMs = async (
  bpmList: number[],
  beatsPerTest: number = 10
): Promise<TimingTestResult[]> => {
  const results: TimingTestResult[] = [];

  for (const bpm of bpmList) {
    console.log(`\n🎵 Testing BPM ${bpm}...`);
    const result = await testMetronomeTiming(bpm, beatsPerTest);
    results.push(result);
    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n📊 전체 테스트 결과 요약:');
  results.forEach((r) => {
    console.log(
      `${r.bpm} BPM: 평균 ${r.averageInterval.toFixed(2)}ms, 최대 오차 ${r.maxDeviation.toFixed(2)}ms, 정확도 ${r.accuracy.toFixed(2)}%`
    );
  });

  return results;
};

/**
 * 표준 BPM 값들로 테스트 (40, 120, 240)
 */
export const runStandardTests = async (): Promise<TimingTestResult[]> => {
  console.log('🧪 표준 BPM 테스트 시작 (40, 120, 240)...\n');
  return testMultipleBPMs([40, 120, 240], 10);
};
