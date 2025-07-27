/**
 * AI Service Caching Layer
 *
 * Implements intelligent caching for AI API calls to improve performance
 * and reduce costs while maintaining data freshness.
 */

import type { AIGenerateParams, AIGenerateResponse } from '../ai/genkit';

/**
 * Cache entry structure
 */
interface CacheEntry {
  response: AIGenerateResponse;
  timestamp: number;
  hits: number;
  expiresAt: number;
}

/**
 * Cache configuration
 */
interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // in milliseconds
  enableMemoryCache: boolean;
  enableLocalStorage: boolean;
  compressionEnabled: boolean;
}

/**
 * AI request fingerprint for cache key generation
 */
interface RequestFingerprint {
  prompt: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Default cache configuration
 */
const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 100, // Maximum cached responses
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  enableMemoryCache: true,
  enableLocalStorage: true,
  compressionEnabled: true,
};

/**
 * AI Cache Manager
 */
class AICacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private metricsEnabled = process.env.NODE_ENV === 'development';
  private metrics = {
    hits: 0,
    misses: 0,
    saves: 0,
    evictions: 0,
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
    this.setupCleanupInterval();
  }

  /**
   * Generate cache key from AI request parameters
   */
  private generateCacheKey(params: RequestFingerprint): string {
    const normalized = {
      prompt: params.prompt.trim().toLowerCase(),
      model: params.model || 'mistral-small',
      systemPrompt: params.systemPrompt?.trim().toLowerCase() || '',
      temperature: Math.round((params.temperature || 0.7) * 100) / 100,
      maxTokens: params.maxTokens || 1000,
    };

    // Create deterministic hash
    const keyString = JSON.stringify(normalized);
    return this.simpleHash(keyString);
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `ai_cache_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Check if cache entry is valid
   */
  private isValidEntry(entry: CacheEntry): boolean {
    return entry.expiresAt > Date.now();
  }

  /**
   * Get cached response if available and valid
   */
  get(params: RequestFingerprint): AIGenerateResponse | null {
    const key = this.generateCacheKey(params);

    // Check memory cache first
    if (this.config.enableMemoryCache) {
      const entry = this.memoryCache.get(key);
      if (entry && this.isValidEntry(entry)) {
        entry.hits++;
        this.logMetrics('hit', 'memory');
        return entry.response;
      }
    }

    // Check localStorage if memory cache misses
    if (this.config.enableLocalStorage) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const entry: CacheEntry = JSON.parse(stored);
          if (this.isValidEntry(entry)) {
            entry.hits++;

            // Restore to memory cache
            if (this.config.enableMemoryCache) {
              this.memoryCache.set(key, entry);
            }

            this.logMetrics('hit', 'localStorage');
            return entry.response;
          }
          // Remove expired entry
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.warn('Failed to read from localStorage cache:', error);
      }
    }

    this.logMetrics('miss');
    return null;
  }

  /**
   * Store response in cache
   */
  set(params: RequestFingerprint, response: AIGenerateResponse, customTTL?: number): void {
    const key = this.generateCacheKey(params);
    const ttl = customTTL || this.config.defaultTTL;
    const entry: CacheEntry = {
      response,
      timestamp: Date.now(),
      hits: 0,
      expiresAt: Date.now() + ttl,
    };

    // Store in memory cache
    if (this.config.enableMemoryCache) {
      this.memoryCache.set(key, entry);
      this.enforceMemoryCacheSize();
    }

    // Store in localStorage
    if (this.config.enableLocalStorage) {
      try {
        localStorage.setItem(key, JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to write to localStorage cache:', error);
        // Try to clear some space
        this.clearExpiredFromStorage();
      }
    }

    this.logMetrics('save');
  }

  /**
   * Enforce memory cache size limit using LFU eviction
   */
  private enforceMemoryCacheSize(): void {
    if (this.memoryCache.size <= this.config.maxSize) return;

    // Sort by hits (ascending) then by timestamp (ascending)
    const entries = Array.from(this.memoryCache.entries()).sort(([, a], [, b]) => {
      if (a.hits !== b.hits) return a.hits - b.hits;
      return a.timestamp - b.timestamp;
    });

    // Remove least frequently used entries
    const toRemove = entries.slice(0, this.memoryCache.size - this.config.maxSize);
    toRemove.forEach(([key]) => {
      this.memoryCache.delete(key);
      this.logMetrics('eviction');
    });
  }

  /**
   * Clear expired entries from localStorage
   */
  private clearExpiredFromStorage(): void {
    if (!this.config.enableLocalStorage) return;

    try {
      const keys = Object.keys(localStorage);
      const aiCacheKeys = keys.filter((key) => key.startsWith('ai_cache_'));

      aiCacheKeys.forEach((key) => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            if (!this.isValidEntry(entry)) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clean localStorage cache:', error);
    }
  }

  /**
   * Load cache entries from localStorage to memory
   */
  private loadFromStorage(): void {
    if (!this.config.enableLocalStorage || !this.config.enableMemoryCache) return;

    try {
      const keys = Object.keys(localStorage);
      const aiCacheKeys = keys.filter((key) => key.startsWith('ai_cache_'));

      aiCacheKeys.forEach((key) => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            if (this.isValidEntry(entry)) {
              this.memoryCache.set(key, entry);
            }
          }
        } catch {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      });

      this.enforceMemoryCacheSize();
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  /**
   * Setup periodic cleanup of expired entries
   */
  private setupCleanupInterval(): void {
    // Clean up every 10 minutes
    setInterval(
      () => {
        this.cleanup();
      },
      10 * 60 * 1000
    );
  }

  /**
   * Clean up expired entries from both memory and localStorage
   */
  cleanup(): void {
    // Clean memory cache
    if (this.config.enableMemoryCache) {
      const toDelete: string[] = [];
      this.memoryCache.forEach((entry, key) => {
        if (!this.isValidEntry(entry)) {
          toDelete.push(key);
        }
      });
      toDelete.forEach((key) => this.memoryCache.delete(key));
    }

    // Clean localStorage cache
    this.clearExpiredFromStorage();
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear();

    if (this.config.enableLocalStorage) {
      try {
        const keys = Object.keys(localStorage);
        const aiCacheKeys = keys.filter((key) => key.startsWith('ai_cache_'));
        aiCacheKeys.forEach((key) => localStorage.removeItem(key));
      } catch (error) {
        console.warn('Failed to clear localStorage cache:', error);
      }
    }

    this.resetMetrics();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      config: this.config,
      metrics: this.metrics,
      hitRate: this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0,
    };
  }

  /**
   * Log metrics for monitoring
   */
  private logMetrics(type: 'hit' | 'miss' | 'save' | 'eviction', location?: string): void {
    if (!this.metricsEnabled) return;

    (this.metrics as any)[type === 'eviction' ? 'evictions' : type === 'save' ? 'saves' : type]++;

    if (type === 'hit' && location) {
      console.debug(`[AI Cache] Hit from ${location}`);
    }
  }

  /**
   * Reset metrics
   */
  private resetMetrics(): void {
    this.metrics = { hits: 0, misses: 0, saves: 0, evictions: 0 };
  }
}

/**
 * Default cache instance
 */
export const aiCache = new AICacheManager();

/**
 * Cache-aware AI generation wrapper
 */
export async function cachedGenerate(
  generateFn: (params: AIGenerateParams) => Promise<AIGenerateResponse>,
  params: AIGenerateParams,
  options: {
    skipCache?: boolean;
    customTTL?: number;
    cacheableThreshold?: number; // Minimum response length to cache
  } = {}
): Promise<AIGenerateResponse> {
  const { skipCache = false, customTTL, cacheableThreshold = 50 } = options;

  // Skip cache for streaming or specific conditions
  if (skipCache || params.temperature === undefined || params.temperature > 0.9) {
    return generateFn(params);
  }

  // Create fingerprint for caching
  const fingerprint: RequestFingerprint = {
    prompt: params.prompt,
    model: params.model as any,
    ...(params.systemPrompt && { systemPrompt: params.systemPrompt }),
    temperature: params.temperature,
    maxTokens: params.maxTokens || 1000,
  };

  // Try to get from cache
  const cached = aiCache.get(fingerprint);
  if (cached) {
    return cached;
  }

  // Generate new response
  const response = await generateFn(params);

  // Cache if response is substantial enough
  if (response.text.length >= cacheableThreshold) {
    aiCache.set(fingerprint, response, customTTL);
  }

  return response;
}

/**
 * Specialized cache configurations for different AI use cases
 */
export const cacheConfigs = {
  // Short-lived cache for user-specific content
  personal: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 20,
  },

  // Medium-lived cache for job analysis
  jobAnalysis: {
    defaultTTL: 30 * 60 * 1000, // 30 minutes
    maxSize: 50,
  },

  // Long-lived cache for general content
  general: {
    defaultTTL: 2 * 60 * 60 * 1000, // 2 hours
    maxSize: 100,
  },

  // Very long-lived cache for static content
  static: {
    defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 30,
  },
};

/**
 * Create specialized cache instances
 */
export const createAICache = (config: Partial<CacheConfig>) => new AICacheManager(config);

export default aiCache;
