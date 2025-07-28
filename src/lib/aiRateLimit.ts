/**
 * AI Rate Limiting Service
 *
 * Implements intelligent rate limiting for AI API calls to prevent abuse,
 * manage costs, and ensure fair usage across users.
 */

/**
 * Rate limit window types
 */
type WindowType = 'minute' | 'hour' | 'day';

/**
 * Rate limit rule configuration
 */
interface RateLimitRule {
  window: WindowType;
  maxRequests: number;
  costWeight?: number; // For cost-based limiting
  userType?: 'guest' | 'free' | 'premium' | 'admin';
}

/**
 * Usage tracking entry
 */
interface UsageEntry {
  timestamp: number;
  requests: number;
  tokens: number;
  cost: number;
}

/**
 * Rate limit result
 */
interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  retryAfter?: number;
  reason?: string;
}

/**
 * AI service usage metrics
 */
interface UsageMetrics {
  totalRequests: number;
  totalTokens: number;
  estimatedCost: number;
  currentWindowUsage: Record<WindowType, UsageEntry>;
}

/**
 * Rate limiter configuration
 */
interface RateLimiterConfig {
  enabled: boolean;
  rules: Record<string, RateLimitRule[]>;
  costPerToken: number; // Estimated cost per token in USD
  emergencyBrake: {
    enabled: boolean;
    maxDailyCost: number;
    maxHourlyCost: number;
  };
  adaptiveThrottling: boolean;
}

/**
 * Default rate limiting configuration
 */
const DEFAULT_CONFIG: RateLimiterConfig = {
  enabled: true,
  rules: {
    guest: [
      { window: 'minute', maxRequests: 2 },
      { window: 'hour', maxRequests: 10 },
      { window: 'day', maxRequests: 25 },
    ],
    free: [
      { window: 'minute', maxRequests: 5 },
      { window: 'hour', maxRequests: 50 },
      { window: 'day', maxRequests: 200 },
    ],
    premium: [
      { window: 'minute', maxRequests: 15 },
      { window: 'hour', maxRequests: 300 },
      { window: 'day', maxRequests: 1000 },
    ],
    admin: [
      { window: 'minute', maxRequests: 30 },
      { window: 'hour', maxRequests: 1000 },
      { window: 'day', maxRequests: 5000 },
    ],
  },
  costPerToken: 0.0002, // Estimated cost for Mistral Small
  emergencyBrake: {
    enabled: true,
    maxDailyCost: 50.0, // $50 per day
    maxHourlyCost: 10.0, // $10 per hour
  },
  adaptiveThrottling: true,
};

/**
 * AI Rate Limiter
 */
class AIRateLimiter {
  private config: RateLimiterConfig;
  private userUsage = new Map<string, Record<WindowType, UsageEntry[]>>();
  private globalUsage: Record<WindowType, UsageEntry[]> = {
    minute: [],
    hour: [],
    day: [],
  };

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupCleanupInterval();
  }

  /**
   * Check if request is allowed under rate limits
   */
  async checkRateLimit(
    userId: string,
    userType = 'free',
    estimatedTokens = 1000
  ): Promise<RateLimitResult> {
    if (!this.config.enabled) {
      return { allowed: true, remainingRequests: Infinity, resetTime: 0 };
    }

    const now = Date.now();
    const rules = this.config.rules[userType] || this.config.rules.free;

    // Check emergency brake first
    const emergencyCheck = this.checkEmergencyBrake(estimatedTokens);
    if (!emergencyCheck.allowed) {
      return emergencyCheck;
    }

    // Check each rate limit rule
    for (const rule of rules || []) {
      const result = this.checkRule(userId, rule, now);
      if (!result.allowed) {
        return result;
      }
    }

    // Check adaptive throttling
    if (this.config.adaptiveThrottling) {
      const adaptiveResult = this.checkAdaptiveThrottling(userId, userType);
      if (!adaptiveResult.allowed) {
        return adaptiveResult;
      }
    }

    return {
      allowed: true,
      remainingRequests: this.getRemainingRequests(userId, userType),
      resetTime: 0,
    };
  }

  /**
   * Record successful AI request
   */
  recordRequest(userId: string, tokens: number, _userType = 'free'): void {
    if (!this.config.enabled) return;

    const now = Date.now();
    const estimatedCost = tokens * this.config.costPerToken;

    // Record user usage
    this.recordUserUsage(userId, now, tokens, estimatedCost);

    // Record global usage
    this.recordGlobalUsage(now, tokens, estimatedCost);
  }

  /**
   * Check individual rate limit rule
   */
  private checkRule(userId: string, rule: RateLimitRule, now: number): RateLimitResult {
    const windowMs = this.getWindowMilliseconds(rule.window);
    const windowStart = now - windowMs;

    const userUsage = this.getUserUsage(userId, rule.window);
    const currentWindowUsage = userUsage.filter((entry) => entry.timestamp > windowStart);

    if (currentWindowUsage.length >= rule.maxRequests) {
      const oldestRequest = Math.min(...currentWindowUsage.map((u) => u.timestamp));
      const resetTime = oldestRequest + windowMs;

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime,
        retryAfter: resetTime - now,
        reason: `Rate limit exceeded for ${rule.window}ly window`,
      };
    }

    return {
      allowed: true,
      remainingRequests: rule.maxRequests - currentWindowUsage.length,
      resetTime: now + windowMs,
    };
  }

  /**
   * Check emergency brake for cost protection
   */
  private checkEmergencyBrake(estimatedTokens: number): RateLimitResult {
    if (!this.config.emergencyBrake.enabled) {
      return { allowed: true, remainingRequests: Infinity, resetTime: 0 };
    }

    const now = Date.now();
    const estimatedCost = estimatedTokens * this.config.costPerToken;

    // Check hourly cost limit
    const hourStart = now - 60 * 60 * 1000;
    const hourlyUsage = this.globalUsage.hour.filter((entry) => entry.timestamp > hourStart);
    const hourlyCost = hourlyUsage.reduce((sum, entry) => sum + entry.cost, 0);

    if (hourlyCost + estimatedCost > this.config.emergencyBrake.maxHourlyCost) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: hourStart + 60 * 60 * 1000,
        reason: 'Hourly cost limit exceeded',
      };
    }

    // Check daily cost limit
    const dayStart = now - 24 * 60 * 60 * 1000;
    const dailyUsage = this.globalUsage.day.filter((entry) => entry.timestamp > dayStart);
    const dailyCost = dailyUsage.reduce((sum, entry) => sum + entry.cost, 0);

    if (dailyCost + estimatedCost > this.config.emergencyBrake.maxDailyCost) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: dayStart + 24 * 60 * 60 * 1000,
        reason: 'Daily cost limit exceeded',
      };
    }

    return { allowed: true, remainingRequests: Infinity, resetTime: 0 };
  }

  /**
   * Check adaptive throttling based on system load
   */
  private checkAdaptiveThrottling(userId: string, userType: string): RateLimitResult {
    const now = Date.now();
    const systemLoad = this.calculateSystemLoad();

    // If system is under high load, apply stricter limits
    if (systemLoad > 0.8) {
      const throttleMultiplier = userType === 'premium' ? 0.7 : userType === 'free' ? 0.5 : 0.3;
      const rules = this.config.rules[userType] || this.config.rules.free;

      for (const rule of rules || []) {
        const adjustedLimit = Math.floor(rule.maxRequests * throttleMultiplier);
        const windowMs = this.getWindowMilliseconds(rule.window);
        const windowStart = now - windowMs;

        const userUsage = this.getUserUsage(userId, rule.window);
        const currentWindowUsage = userUsage.filter((entry) => entry.timestamp > windowStart);

        if (currentWindowUsage.length >= adjustedLimit) {
          return {
            allowed: false,
            remainingRequests: 0,
            resetTime: now + windowMs,
            reason: 'System under high load - reduced limits applied',
          };
        }
      }
    }

    return { allowed: true, remainingRequests: Infinity, resetTime: 0 };
  }

  /**
   * Calculate current system load based on recent usage
   */
  private calculateSystemLoad(): number {
    const now = Date.now();
    const minuteStart = now - 60 * 1000;

    const recentRequests = this.globalUsage.minute.filter(
      (entry) => entry.timestamp > minuteStart
    ).length;

    // Estimate load based on requests per minute (adjust threshold as needed)
    const maxRequestsPerMinute = 100;
    return Math.min(recentRequests / maxRequestsPerMinute, 1.0);
  }

  /**
   * Get user usage for specific window
   */
  private getUserUsage(userId: string, window: WindowType): UsageEntry[] {
    if (!this.userUsage.has(userId)) {
      this.userUsage.set(userId, { minute: [], hour: [], day: [] });
    }
    const userUsage = this.userUsage.get(userId)?.[window];
    return userUsage ?? [];
  }

  /**
   * Record user usage
   */
  private recordUserUsage(userId: string, timestamp: number, tokens: number, cost: number): void {
    const usage = this.getUserUsage(userId, 'minute');
    const entry: UsageEntry = { timestamp, requests: 1, tokens, cost };

    usage.push(entry);
    this.userUsage.get(userId)?.hour.push(entry);
    this.userUsage.get(userId)?.day.push(entry);
  }

  /**
   * Record global usage
   */
  private recordGlobalUsage(timestamp: number, tokens: number, cost: number): void {
    const entry: UsageEntry = { timestamp, requests: 1, tokens, cost };

    this.globalUsage.minute.push(entry);
    this.globalUsage.hour.push(entry);
    this.globalUsage.day.push(entry);
  }

  /**
   * Get remaining requests for user
   */
  private getRemainingRequests(userId: string, userType: string): number {
    const rules = this.config.rules[userType] || this.config.rules.free;
    const now = Date.now();

    let minRemaining = Infinity;

    for (const rule of rules || []) {
      const windowMs = this.getWindowMilliseconds(rule.window);
      const windowStart = now - windowMs;
      const userUsage = this.getUserUsage(userId, rule.window);
      const currentWindowUsage = userUsage.filter((entry) => entry.timestamp > windowStart);
      const remaining = rule.maxRequests - currentWindowUsage.length;

      minRemaining = Math.min(minRemaining, remaining);
    }

    return minRemaining;
  }

  /**
   * Convert window type to milliseconds
   */
  private getWindowMilliseconds(window: WindowType): number {
    switch (window) {
      case 'minute':
        return 60 * 1000;
      case 'hour':
        return 60 * 60 * 1000;
      case 'day':
        return 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Setup periodic cleanup of old usage data
   */
  private setupCleanupInterval(): void {
    setInterval(
      () => {
        this.cleanup();
      },
      10 * 60 * 1000
    ); // Clean every 10 minutes
  }

  /**
   * Clean up old usage data
   */
  private cleanup(): void {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    // Clean global usage
    this.globalUsage.minute = this.globalUsage.minute.filter(
      (entry) => entry.timestamp > now - 60 * 1000
    );
    this.globalUsage.hour = this.globalUsage.hour.filter(
      (entry) => entry.timestamp > now - 60 * 60 * 1000
    );
    this.globalUsage.day = this.globalUsage.day.filter((entry) => entry.timestamp > dayAgo);

    // Clean user usage
    for (const [userId, usage] of this.userUsage.entries()) {
      usage.minute = usage.minute.filter((entry) => entry.timestamp > now - 60 * 1000);
      usage.hour = usage.hour.filter((entry) => entry.timestamp > now - 60 * 60 * 1000);
      usage.day = usage.day.filter((entry) => entry.timestamp > dayAgo);

      // Remove empty user records
      if (usage.minute.length === 0 && usage.hour.length === 0 && usage.day.length === 0) {
        this.userUsage.delete(userId);
      }
    }
  }

  /**
   * Get usage metrics for monitoring
   */
  getUsageMetrics(userId?: string): UsageMetrics {
    const now = Date.now();

    if (userId) {
      const userUsage = this.userUsage.get(userId);
      if (!userUsage) {
        return {
          totalRequests: 0,
          totalTokens: 0,
          estimatedCost: 0,
          currentWindowUsage: {
            minute: { timestamp: now, requests: 0, tokens: 0, cost: 0 },
            hour: { timestamp: now, requests: 0, tokens: 0, cost: 0 },
            day: { timestamp: now, requests: 0, tokens: 0, cost: 0 },
          },
        };
      }

      return {
        totalRequests: userUsage.day.length,
        totalTokens: userUsage.day.reduce((sum, entry) => sum + entry.tokens, 0),
        estimatedCost: userUsage.day.reduce((sum, entry) => sum + entry.cost, 0),
        currentWindowUsage: {
          minute:
            userUsage.minute.length > 0
              ? userUsage.minute[userUsage.minute.length - 1]
              : ({ timestamp: now, requests: 0, tokens: 0, cost: 0 } as any),
          hour:
            userUsage.hour.length > 0
              ? userUsage.hour[userUsage.hour.length - 1]
              : ({ timestamp: now, requests: 0, tokens: 0, cost: 0 } as any),
          day:
            userUsage.day.length > 0
              ? userUsage.day[userUsage.day.length - 1]
              : ({ timestamp: now, requests: 0, tokens: 0, cost: 0 } as any),
        },
      };
    }

    return {
      totalRequests: this.globalUsage.day.length,
      totalTokens: this.globalUsage.day.reduce((sum, entry) => sum + entry.tokens, 0),
      estimatedCost: this.globalUsage.day.reduce((sum, entry) => sum + entry.cost, 0),
      currentWindowUsage: {
        minute:
          this.globalUsage.minute.length > 0
            ? this.globalUsage.minute[this.globalUsage.minute.length - 1]
            : ({ timestamp: now, requests: 0, tokens: 0, cost: 0 } as any),
        hour:
          this.globalUsage.hour.length > 0
            ? this.globalUsage.hour[this.globalUsage.hour.length - 1]
            : ({ timestamp: now, requests: 0, tokens: 0, cost: 0 } as any),
        day:
          this.globalUsage.day.length > 0
            ? this.globalUsage.day[this.globalUsage.day.length - 1]
            : ({ timestamp: now, requests: 0, tokens: 0, cost: 0 } as any),
      },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RateLimiterConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Default rate limiter instance
 */
export const aiRateLimiter = new AIRateLimiter();

/**
 * Rate-limited AI generation wrapper
 */
export async function rateLimitedGenerate<T>(
  generateFn: () => Promise<T>,
  userId: string,
  userType = 'free',
  estimatedTokens = 1000
): Promise<T> {
  const rateLimit = await aiRateLimiter.checkRateLimit(userId, userType, estimatedTokens);

  if (!rateLimit.allowed) {
    const error = new Error(`Rate limit exceeded: ${rateLimit.reason}`);
    (error as any).rateLimitInfo = rateLimit;
    throw error;
  }
  const result = await generateFn();

  // Record successful request
  aiRateLimiter.recordRequest(userId, estimatedTokens, userType);

  return result;
}

/**
 * Export types for external use
 */
export type { RateLimitResult, UsageMetrics, RateLimitRule, RateLimiterConfig };

export default aiRateLimiter;
