/**
 * Offline Operation Queue Service
 * 오프라인 작업 큐 서비스 - MMKV 기반 영구 저장
 */

import { MMKV } from "react-native-mmkv";

// ==========================================
// Types
// ==========================================

export type OperationType = "create" | "update" | "delete";

export type OperationStatus = "pending" | "processing" | "completed" | "failed";

export interface QueuedOperation {
  /** Unique operation ID */
  id: string;
  /** Type of operation */
  type: OperationType;
  /** Target collection */
  collection: string;
  /** Document ID (optional for create) */
  documentId?: string;
  /** Data to write (for create/update) */
  data?: Record<string, unknown>;
  /** Timestamp when operation was queued */
  createdAt: number;
  /** Number of retry attempts */
  retryCount: number;
  /** Current status */
  status: OperationStatus;
  /** Error message if failed */
  error?: string;
  /** Priority (higher = process first) */
  priority: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

export interface OfflineQueueConfig {
  /** Maximum retry attempts */
  maxRetries: number;
  /** Delay between retries in ms */
  retryDelay: number;
  /** Maximum queue size */
  maxQueueSize: number;
  /** Auto-process when online */
  autoProcess: boolean;
}

type QueueEventType = "added" | "processed" | "failed" | "cleared";
type QueueEventListener = (
  event: QueueEventType,
  operation?: QueuedOperation,
) => void;

// ==========================================
// Constants
// ==========================================

const STORAGE_KEY = "offline_operation_queue";
const STATS_KEY = "offline_queue_stats";

const DEFAULT_CONFIG: OfflineQueueConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  maxQueueSize: 100,
  autoProcess: true,
};

// ==========================================
// Offline Queue Service
// ==========================================

class OfflineQueueService {
  private storage: MMKV;
  private config: OfflineQueueConfig;
  private listeners: Set<QueueEventListener> = new Set();
  private isProcessing = false;
  private processHandler?: (
    operation: QueuedOperation,
  ) => Promise<boolean>;

  constructor() {
    this.storage = new MMKV({ id: "offline-queue" });
    this.config = DEFAULT_CONFIG;
  }

  /**
   * Configure the queue service
   * 큐 서비스 설정
   */
  configure(config: Partial<OfflineQueueConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set the process handler for operations
   * 작업 처리 핸들러 설정
   */
  setProcessHandler(
    handler: (operation: QueuedOperation) => Promise<boolean>,
  ): void {
    this.processHandler = handler;
  }

  /**
   * Add operation to queue
   * 작업을 큐에 추가
   */
  enqueue(
    type: OperationType,
    collection: string,
    documentId?: string,
    data?: Record<string, unknown>,
    priority = 0,
  ): QueuedOperation {
    const queue = this.getQueue();

    // Check queue size limit
    if (queue.length >= this.config.maxQueueSize) {
      // Remove oldest completed or failed operations
      const cleaned = queue.filter(
        (op) => op.status === "pending" || op.status === "processing",
      );
      this.saveQueue(cleaned);
    }

    const operation: QueuedOperation = {
      id: this.generateId(),
      type,
      collection,
      documentId,
      data,
      createdAt: Date.now(),
      retryCount: 0,
      status: "pending",
      priority,
    };

    const updatedQueue = [...this.getQueue(), operation];
    this.saveQueue(updatedQueue);
    this.notifyListeners("added", operation);

    console.log("[OfflineQueue] Operation enqueued:", {
      id: operation.id,
      type,
      collection,
      documentId,
    });

    return operation;
  }

  /**
   * Get all queued operations
   * 모든 대기 중인 작업 조회
   */
  getQueue(): QueuedOperation[] {
    try {
      const data = this.storage.getString(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get pending operations only
   * 대기 중인 작업만 조회
   */
  getPendingOperations(): QueuedOperation[] {
    return this.getQueue()
      .filter((op) => op.status === "pending")
      .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
  }

  /**
   * Get queue statistics
   * 큐 통계 조회
   */
  getStats(): QueueStats {
    const queue = this.getQueue();
    return {
      pending: queue.filter((op) => op.status === "pending").length,
      processing: queue.filter((op) => op.status === "processing").length,
      completed: queue.filter((op) => op.status === "completed").length,
      failed: queue.filter((op) => op.status === "failed").length,
      total: queue.length,
    };
  }

  /**
   * Process all pending operations
   * 모든 대기 중인 작업 처리
   */
  async processQueue(): Promise<{ success: number; failed: number }> {
    if (this.isProcessing) {
      console.log("[OfflineQueue] Already processing");
      return { success: 0, failed: 0 };
    }

    if (!this.processHandler) {
      console.warn("[OfflineQueue] No process handler set");
      return { success: 0, failed: 0 };
    }

    this.isProcessing = true;
    let success = 0;
    let failed = 0;

    try {
      const pendingOps = this.getPendingOperations();
      console.log(`[OfflineQueue] Processing ${pendingOps.length} operations`);

      for (const operation of pendingOps) {
        const result = await this.processOperation(operation);
        if (result) {
          success++;
        } else {
          failed++;
        }
      }

      console.log(
        `[OfflineQueue] Processing complete: ${success} success, ${failed} failed`,
      );
    } finally {
      this.isProcessing = false;
    }

    return { success, failed };
  }

  /**
   * Process a single operation
   * 단일 작업 처리
   */
  private async processOperation(
    operation: QueuedOperation,
  ): Promise<boolean> {
    if (!this.processHandler) return false;

    // Update status to processing
    this.updateOperationStatus(operation.id, "processing");

    try {
      const success = await this.processHandler(operation);

      if (success) {
        this.updateOperationStatus(operation.id, "completed");
        this.notifyListeners("processed", operation);
        return true;
      } else {
        throw new Error("Operation failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Check if should retry
      if (operation.retryCount < this.config.maxRetries) {
        this.updateOperation(operation.id, {
          status: "pending",
          retryCount: operation.retryCount + 1,
          error: errorMessage,
        });

        console.log(
          `[OfflineQueue] Operation ${operation.id} will retry (${operation.retryCount + 1}/${this.config.maxRetries})`,
        );
      } else {
        this.updateOperationStatus(operation.id, "failed", errorMessage);
        this.notifyListeners("failed", operation);

        console.error(
          `[OfflineQueue] Operation ${operation.id} failed after ${this.config.maxRetries} retries`,
        );
      }

      return false;
    }
  }

  /**
   * Retry a failed operation
   * 실패한 작업 재시도
   */
  retry(operationId: string): void {
    this.updateOperation(operationId, {
      status: "pending",
      retryCount: 0,
      error: undefined,
    });
  }

  /**
   * Remove an operation from the queue
   * 큐에서 작업 제거
   */
  remove(operationId: string): void {
    const queue = this.getQueue().filter((op) => op.id !== operationId);
    this.saveQueue(queue);
  }

  /**
   * Clear all operations with specified status
   * 특정 상태의 모든 작업 삭제
   */
  clearByStatus(status: OperationStatus): void {
    const queue = this.getQueue().filter((op) => op.status !== status);
    this.saveQueue(queue);
    this.notifyListeners("cleared");
  }

  /**
   * Clear all operations
   * 모든 작업 삭제
   */
  clearAll(): void {
    this.saveQueue([]);
    this.notifyListeners("cleared");
    console.log("[OfflineQueue] All operations cleared");
  }

  /**
   * Subscribe to queue events
   * 큐 이벤트 구독
   */
  subscribe(listener: QueueEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Check if queue is currently processing
   * 큐가 현재 처리 중인지 확인
   */
  isQueueProcessing(): boolean {
    return this.isProcessing;
  }

  // ==========================================
  // Private Methods
  // ==========================================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveQueue(queue: QueuedOperation[]): void {
    this.storage.set(STORAGE_KEY, JSON.stringify(queue));
  }

  private updateOperationStatus(
    id: string,
    status: OperationStatus,
    error?: string,
  ): void {
    this.updateOperation(id, { status, error });
  }

  private updateOperation(
    id: string,
    updates: Partial<QueuedOperation>,
  ): void {
    const queue = this.getQueue();
    const index = queue.findIndex((op) => op.id === id);

    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      this.saveQueue(queue);
    }
  }

  private notifyListeners(
    event: QueueEventType,
    operation?: QueuedOperation,
  ): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event, operation);
      } catch (error) {
        console.error("[OfflineQueue] Listener error:", error);
      }
    });
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueService();
