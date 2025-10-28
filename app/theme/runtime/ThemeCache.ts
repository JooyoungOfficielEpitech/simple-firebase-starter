/**
 * Theme Cache System
 *
 * Provides memory and persistent caching for generated themes.
 * Uses LRU (Least Recently Used) algorithm for memory management.
 */

import { storage } from "@/utils/storage"
import type { Theme } from "../types"

interface CacheEntry {
  theme: Theme
  timestamp: number
  accessCount: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  currentSize: number
  maxSize: number
}

const CACHE_KEY_PREFIX = "theme.cache."
const CACHE_STATS_KEY = "theme.cache.stats"
const DEFAULT_MAX_SIZE = 10 // Max number of themes in memory cache

/**
 * LRU Cache for themes with AsyncStorage persistence
 */
export class ThemeCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxSize: number
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    currentSize: 0,
    maxSize: DEFAULT_MAX_SIZE,
  }

  constructor(maxSize: number = DEFAULT_MAX_SIZE) {
    this.maxSize = maxSize
    this.stats.maxSize = maxSize
    this.loadStatsFromStorage()
  }

  /**
   * Get theme from cache
   * @param key Cache key (typically theme ID)
   * @returns Cached theme or null if not found
   */
  async get(key: string): Promise<Theme | null> {
    // Check memory cache first
    const memoryEntry = this.cache.get(key)
    if (memoryEntry) {
      // Update access metadata
      memoryEntry.accessCount++
      memoryEntry.lastAccessed = Date.now()
      this.stats.hits++
      this.saveStatsToStorage()
      return memoryEntry.theme
    }

    // Check persistent storage
    try {
      const storageKey = CACHE_KEY_PREFIX + key
      const cached = storage.getString(storageKey)
      if (cached) {
        const theme = JSON.parse(cached) as Theme
        // Add to memory cache
        this.set(key, theme, false) // Don't save to storage again
        this.stats.hits++
        this.saveStatsToStorage()
        return theme
      }
    } catch (error) {
      console.warn("Failed to read theme from storage:", error)
    }

    this.stats.misses++
    this.saveStatsToStorage()
    return null
  }

  /**
   * Set theme in cache
   * @param key Cache key
   * @param theme Theme to cache
   * @param persist Whether to persist to AsyncStorage (default: true)
   */
  set(key: string, theme: Theme, persist: boolean = true): void {
    // Check if we need to evict
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    // Add to memory cache
    const entry: CacheEntry = {
      theme,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    }
    this.cache.set(key, entry)
    this.stats.currentSize = this.cache.size

    // Persist to AsyncStorage if requested
    if (persist) {
      this.saveToStorage(key, theme)
    }

    this.saveStatsToStorage()
  }

  /**
   * Check if theme exists in cache
   * @param key Cache key
   * @returns Whether theme exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key) || storage.contains(CACHE_KEY_PREFIX + key)
  }

  /**
   * Remove theme from cache
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    // Remove from memory cache
    this.cache.delete(key)
    this.stats.currentSize = this.cache.size

    // Remove from persistent storage
    try {
      storage.delete(CACHE_KEY_PREFIX + key)
    } catch (error) {
      console.warn("Failed to delete theme from storage:", error)
    }

    this.saveStatsToStorage()
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    // Clear memory cache
    this.cache.clear()
    this.stats.currentSize = 0

    // Clear persistent storage
    try {
      const allKeys = storage.getAllKeys()
      allKeys.forEach((key) => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          storage.delete(key)
        }
      })
    } catch (error) {
      console.warn("Failed to clear theme cache from storage:", error)
    }

    // Reset stats
    this.stats.hits = 0
    this.stats.misses = 0
    this.stats.evictions = 0
    this.saveStatsToStorage()
  }

  /**
   * Get all cached theme IDs
   * @returns Array of cached theme IDs
   */
  getAllKeys(): string[] {
    const memoryKeys = Array.from(this.cache.keys())
    try {
      const storageKeys = storage.getAllKeys()
        .filter((key) => key.startsWith(CACHE_KEY_PREFIX))
        .map((key) => key.replace(CACHE_KEY_PREFIX, ""))

      // Combine and deduplicate
      return Array.from(new Set([...memoryKeys, ...storageKeys]))
    } catch (error) {
      console.warn("Failed to get storage keys:", error)
      return memoryKeys
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Get cache hit rate
   * @returns Hit rate as percentage (0-100)
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses
    return total === 0 ? 0 : (this.stats.hits / total) * 100
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null
    let lruTime = Infinity

    // Find least recently used entry
    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed
        lruKey = key
      }
    })

    // Evict the LRU entry
    if (lruKey) {
      this.cache.delete(lruKey)
      this.stats.evictions++
      console.log(`Evicted theme from cache: ${lruKey}`)
    }
  }

  /**
   * Save theme to persistent storage
   */
  private saveToStorage(key: string, theme: Theme): void {
    try {
      const storageKey = CACHE_KEY_PREFIX + key
      storage.set(storageKey, JSON.stringify(theme))
    } catch (error) {
      console.warn("Failed to save theme to storage:", error)
    }
  }

  /**
   * Save cache stats to storage
   */
  private saveStatsToStorage(): void {
    try {
      storage.set(CACHE_STATS_KEY, JSON.stringify(this.stats))
    } catch (error) {
      console.warn("Failed to save cache stats:", error)
    }
  }

  /**
   * Load cache stats from storage
   */
  private loadStatsFromStorage(): void {
    try {
      const statsJson = storage.getString(CACHE_STATS_KEY)
      if (statsJson) {
        const loaded = JSON.parse(statsJson) as CacheStats
        this.stats = {
          ...loaded,
          currentSize: this.cache.size, // Always use actual cache size
          maxSize: this.maxSize, // Use current max size
        }
      }
    } catch (error) {
      console.warn("Failed to load cache stats:", error)
    }
  }

  /**
   * Prune old entries from persistent storage
   * @param maxAge Maximum age in milliseconds (default: 30 days)
   */
  async pruneOld(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    let prunedCount = 0
    const now = Date.now()

    try {
      const allKeys = storage.getAllKeys()
      allKeys.forEach((storageKey) => {
        if (storageKey.startsWith(CACHE_KEY_PREFIX)) {
          const cached = storage.getString(storageKey)
          if (cached) {
            try {
              const theme = JSON.parse(cached) as Theme
              // Check if theme has timestamp metadata (future enhancement)
              // For now, just check if it's too old based on memory cache
              const key = storageKey.replace(CACHE_KEY_PREFIX, "")
              const memoryEntry = this.cache.get(key)
              if (memoryEntry && now - memoryEntry.timestamp > maxAge) {
                storage.delete(storageKey)
                this.cache.delete(key)
                prunedCount++
              }
            } catch (error) {
              // Invalid entry, delete it
              storage.delete(storageKey)
              prunedCount++
            }
          }
        }
      })
    } catch (error) {
      console.warn("Failed to prune old cache entries:", error)
    }

    this.stats.currentSize = this.cache.size
    this.saveStatsToStorage()
    return prunedCount
  }
}

// Export singleton instance
export const themeCache = new ThemeCache()
