/**
 * Firestore Offline Configuration Service
 * Firestore 오프라인 설정 및 캐싱 전략 서비스
 */

import firestore from "@react-native-firebase/firestore";

// ==========================================
// Types
// ==========================================

export interface FirestoreOfflineConfig {
  /** Enable offline persistence (default: true) */
  persistenceEnabled: boolean;
  /** Cache size in bytes (default: 100MB, -1 for unlimited) */
  cacheSizeBytes: number;
  /** Enable multi-tab persistence (web only) */
  synchronizeTabs?: boolean;
}

export interface CacheStrategy {
  /** Collection name */
  collection: string;
  /** Max age in seconds before data is considered stale */
  maxAgeSeconds: number;
  /** Whether to prefer cache over network */
  preferCache: boolean;
  /** Priority level (higher = more important to keep in cache) */
  priority: "high" | "medium" | "low";
}

export type FirestoreSource = "default" | "server" | "cache";

// ==========================================
// Default Configuration
// ==========================================

const DEFAULT_CACHE_SIZE = 100 * 1024 * 1024; // 100MB

const DEFAULT_CONFIG: FirestoreOfflineConfig = {
  persistenceEnabled: true,
  cacheSizeBytes: DEFAULT_CACHE_SIZE,
};

/**
 * Default cache strategies for important collections
 * 중요 컬렉션별 기본 캐싱 전략
 */
export const DEFAULT_CACHE_STRATEGIES: CacheStrategy[] = [
  {
    collection: "users",
    maxAgeSeconds: 3600, // 1 hour
    preferCache: true,
    priority: "high",
  },
  {
    collection: "chats",
    maxAgeSeconds: 300, // 5 minutes
    preferCache: false,
    priority: "high",
  },
  {
    collection: "messages",
    maxAgeSeconds: 60, // 1 minute
    preferCache: false,
    priority: "medium",
  },
  {
    collection: "notifications",
    maxAgeSeconds: 600, // 10 minutes
    preferCache: true,
    priority: "medium",
  },
  {
    collection: "matches",
    maxAgeSeconds: 1800, // 30 minutes
    preferCache: true,
    priority: "medium",
  },
  {
    collection: "subscriptions",
    maxAgeSeconds: 3600, // 1 hour
    preferCache: true,
    priority: "low",
  },
];

// ==========================================
// Firestore Config Service
// ==========================================

class FirestoreConfigService {
  private initialized = false;
  private config: FirestoreOfflineConfig = DEFAULT_CONFIG;
  private cacheStrategies: Map<string, CacheStrategy> = new Map();

  constructor() {
    // Initialize cache strategies
    DEFAULT_CACHE_STRATEGIES.forEach((strategy) => {
      this.cacheStrategies.set(strategy.collection, strategy);
    });
  }

  /**
   * Initialize Firestore with offline configuration
   * 오프라인 설정으로 Firestore 초기화
   */
  async initialize(config?: Partial<FirestoreOfflineConfig>): Promise<void> {
    if (this.initialized) {
      console.warn("[FirestoreConfig] Already initialized");
      return;
    }

    try {
      // Merge with default config
      this.config = { ...DEFAULT_CONFIG, ...config };

      // Configure Firestore settings
      await firestore().settings({
        persistence: this.config.persistenceEnabled,
        cacheSizeBytes: this.config.cacheSizeBytes,
      });

      this.initialized = true;
      console.log("[FirestoreConfig] Initialized with config:", {
        persistenceEnabled: this.config.persistenceEnabled,
        cacheSizeBytes: `${Math.round(this.config.cacheSizeBytes / 1024 / 1024)}MB`,
      });
    } catch (error) {
      console.error("[FirestoreConfig] Initialization error:", error);
      throw error;
    }
  }

  /**
   * Get current configuration
   * 현재 설정 조회
   */
  getConfig(): FirestoreOfflineConfig {
    return { ...this.config };
  }

  /**
   * Check if Firestore is initialized
   * Firestore 초기화 여부 확인
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get cache strategy for a collection
   * 컬렉션별 캐시 전략 조회
   */
  getCacheStrategy(collection: string): CacheStrategy | undefined {
    return this.cacheStrategies.get(collection);
  }

  /**
   * Set cache strategy for a collection
   * 컬렉션별 캐시 전략 설정
   */
  setCacheStrategy(strategy: CacheStrategy): void {
    this.cacheStrategies.set(strategy.collection, strategy);
  }

  /**
   * Determine the best source for a query based on network state and cache strategy
   * 네트워크 상태와 캐시 전략에 따라 최적의 데이터 소스 결정
   */
  getOptimalSource(
    collection: string,
    isOnline: boolean,
  ): FirestoreSource {
    const strategy = this.cacheStrategies.get(collection);

    if (!isOnline) {
      return "cache";
    }

    if (strategy?.preferCache) {
      return "cache";
    }

    return "default";
  }

  /**
   * Clear Firestore cache
   * Firestore 캐시 삭제
   */
  async clearCache(): Promise<void> {
    try {
      await firestore().clearPersistence();
      console.log("[FirestoreConfig] Cache cleared");
    } catch (error) {
      console.error("[FirestoreConfig] Failed to clear cache:", error);
      throw error;
    }
  }

  /**
   * Wait for pending writes to complete
   * 대기 중인 쓰기 작업 완료 대기
   */
  async waitForPendingWrites(): Promise<void> {
    try {
      await firestore().waitForPendingWrites();
      console.log("[FirestoreConfig] All pending writes completed");
    } catch (error) {
      console.error("[FirestoreConfig] Error waiting for pending writes:", error);
      throw error;
    }
  }

  /**
   * Enable network connection
   * 네트워크 연결 활성화
   */
  async enableNetwork(): Promise<void> {
    try {
      await firestore().enableNetwork();
      console.log("[FirestoreConfig] Network enabled");
    } catch (error) {
      console.error("[FirestoreConfig] Failed to enable network:", error);
      throw error;
    }
  }

  /**
   * Disable network connection (force offline mode)
   * 네트워크 연결 비활성화 (강제 오프라인 모드)
   */
  async disableNetwork(): Promise<void> {
    try {
      await firestore().disableNetwork();
      console.log("[FirestoreConfig] Network disabled");
    } catch (error) {
      console.error("[FirestoreConfig] Failed to disable network:", error);
      throw error;
    }
  }

  /**
   * Terminate Firestore instance
   * Firestore 인스턴스 종료
   */
  async terminate(): Promise<void> {
    try {
      await firestore().terminate();
      this.initialized = false;
      console.log("[FirestoreConfig] Terminated");
    } catch (error) {
      console.error("[FirestoreConfig] Failed to terminate:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const firestoreConfig = new FirestoreConfigService();
