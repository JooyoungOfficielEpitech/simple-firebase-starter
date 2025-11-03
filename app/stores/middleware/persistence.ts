/**
 * Zustand AsyncStorage 지속성 미들웨어
 */
import { StateCreator, StoreMutatorIdentifier } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"

type PersistListener<S> = (state: S) => void
type SetStateInternal<S> = (
  partial: S | Partial<S> | ((state: S) => S | Partial<S>),
  replace?: boolean | undefined,
) => void

export interface PersistOptions<S, PersistedState = S> {
  /** 스토리지 키 이름 */
  name: string
  /** 지속할 상태 선택 (기본값: 전체 상태) */
  partialize?: (state: S) => PersistedState
  /** 스토리지에서 불러온 상태를 실제 상태로 변환 */
  merge?: (persistedState: unknown, currentState: S) => S
  /** 버전 관리 */
  version?: number
  /** 버전 마이그레이션 */
  migrate?: (persistedState: any, version: number) => Promise<S> | S
  /** 하이드레이션 완료 콜백 */
  onRehydrateStorage?: (state: S) => PersistListener<S> | void
}

type Persist = <
  S,
  Ps extends Partial<S> = Partial<S>,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<S, [["zustand/persist", Ps]], Mps>,
  options: PersistOptions<S, Ps>,
) => StateCreator<S, [["zustand/persist", Ps]], Mps>

/**
 * AsyncStorage 기반 지속성 미들웨어
 */
export const persist: Persist = (config, options) => (set, get, api) => {
  const {
    name,
    partialize = (state) => state,
    merge = (persistedState, currentState) => ({
      ...currentState,
      ...(persistedState as any),
    }),
    version = 0,
    migrate,
    onRehydrateStorage,
  } = options

  let hasHydrated = false

  // 스토리지에서 상태 불러오기
  const hydrate = async () => {
    try {
      const item = await AsyncStorage.getItem(name)
      if (!item) {
        console.log(`[Persist] No stored state for "${name}"`)
        onRehydrateStorage?.(get())
        return
      }

      const parsed = JSON.parse(item)
      const { state: persistedState, version: persistedVersion = 0 } = parsed

      // 버전 마이그레이션
      let migratedState = persistedState
      if (migrate && persistedVersion < version) {
        console.log(
          `[Persist] Migrating "${name}" from version ${persistedVersion} to ${version}`,
        )
        migratedState = await migrate(persistedState, persistedVersion)
      }

      // 상태 병합
      const mergedState = merge(migratedState, get())
      ;(set as SetStateInternal<any>)(mergedState, true)

      console.log(`[Persist] Hydrated "${name}" successfully`)
      onRehydrateStorage?.(get())
      hasHydrated = true
    } catch (error) {
      console.error(`[Persist] Failed to hydrate "${name}":`, error)
      onRehydrateStorage?.(get())
    }
  }

  // 스토리지에 상태 저장
  const persistState = async (state: any) => {
    try {
      const partialState = partialize(state)
      const data = JSON.stringify({
        state: partialState,
        version,
      })
      await AsyncStorage.setItem(name, data)
    } catch (error) {
      console.error(`[Persist] Failed to persist "${name}":`, error)
    }
  }

  // 초기 하이드레이션
  hydrate()

  // 상태 변경 시 자동 저장
  return config(
    ((args: any, ...rest: any[]) => {
      set(args, ...rest)
      // 하이드레이션 완료 후에만 저장
      if (hasHydrated) {
        persistState(get())
      }
    }) as any,
    get,
    api,
  )
}

/**
 * 특정 스토어 초기화 (스토리지에서 삭제)
 */
export const clearPersistedStore = async (name: string) => {
  try {
    await AsyncStorage.removeItem(name)
    console.log(`[Persist] Cleared persisted state for "${name}"`)
  } catch (error) {
    console.error(`[Persist] Failed to clear "${name}":`, error)
  }
}

/**
 * 모든 지속 스토어 초기화
 */
export const clearAllPersistedStores = async (storeNames: string[]) => {
  try {
    await Promise.all(storeNames.map((name) => AsyncStorage.removeItem(name)))
    console.log("[Persist] Cleared all persisted stores")
  } catch (error) {
    console.error("[Persist] Failed to clear all stores:", error)
  }
}
