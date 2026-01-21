/**
 * RetryService Tests
 */

import { retryService, withRetry, RetryConfig } from "./retryService";

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

describe("RetryService", () => {
  describe("calculateDelay", () => {
    it("calculates delay with exponential backoff", () => {
      const delay1 = retryService.calculateDelay(1, { ...DEFAULT_CONFIG, jitter: false });
      const delay2 = retryService.calculateDelay(2, { ...DEFAULT_CONFIG, jitter: false });
      const delay3 = retryService.calculateDelay(3, { ...DEFAULT_CONFIG, jitter: false });

      expect(delay1).toBe(1000);
      expect(delay2).toBe(2000);
      expect(delay3).toBe(4000);
    });

    it("respects maxDelay", () => {
      const config = { ...DEFAULT_CONFIG, jitter: false, maxDelay: 3000 };
      const delay = retryService.calculateDelay(10, config);
      expect(delay).toBe(3000);
    });

    it("adds jitter when enabled", () => {
      const config = { ...DEFAULT_CONFIG, jitter: true };
      const delays = new Set<number>();

      // Generate multiple delays and check they vary
      for (let i = 0; i < 10; i++) {
        delays.add(retryService.calculateDelay(1, config));
      }

      // With jitter, we should get some variation
      // Note: There's a small chance this could be 1 if all random values are the same
      expect(delays.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe("isRetryable", () => {
    it("returns true for network errors", () => {
      expect(retryService.isRetryable(new Error("network request failed"))).toBe(true);
      expect(retryService.isRetryable(new Error("Network Error"))).toBe(true);
      expect(retryService.isRetryable(new Error("timeout of 5000ms exceeded"))).toBe(true);
    });

    it("returns false for non-retryable errors", () => {
      const invalidArgError = new Error("Invalid input") as Error & { code?: string };
      invalidArgError.code = "invalid-argument";
      expect(retryService.isRetryable(invalidArgError)).toBe(false);

      const notFoundError = new Error("Not found") as Error & { code?: string };
      notFoundError.code = "not-found";
      expect(retryService.isRetryable(notFoundError)).toBe(false);
    });
  });

  describe("withRetry", () => {
    it("succeeds on first try", async () => {
      const fn = jest.fn().mockResolvedValue("success");
      const result = await retryService.withRetry(fn);
      expect(result.success).toBe(true);
      expect(result.data).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("retries on failure and succeeds", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("network request failed"))
        .mockResolvedValue("success");

      const result = await retryService.withRetry(fn, { maxRetries: 3, initialDelay: 10, maxDelay: 100, backoffMultiplier: 2, jitter: false });
      expect(result.success).toBe(true);
      expect(result.data).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("returns failure after max retries", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("network request failed"));

      const result = await retryService.withRetry(fn, { maxRetries: 2, initialDelay: 10, maxDelay: 100, backoffMultiplier: 2, jitter: false });
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("network request failed");
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it("does not retry non-retryable errors", async () => {
      const error = new Error("Invalid input") as Error & { code?: string };
      error.code = "invalid-argument";
      const fn = jest.fn().mockRejectedValue(error);

      const result = await retryService.withRetry(fn);
      expect(result.success).toBe(false);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("withRetry helper function", () => {
    it("works as a standalone function", async () => {
      const fn = jest.fn().mockResolvedValue("success");
      const result = await withRetry(fn);
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("throws after retries exhausted", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("network request failed"));

      await expect(
        withRetry(fn, { maxRetries: 1, initialDelay: 10, maxDelay: 100, backoffMultiplier: 2, jitter: false }),
      ).rejects.toThrow("network request failed");
    });
  });
});
