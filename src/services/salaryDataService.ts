import { z } from 'zod';

// TypeScript interfaces for API responses and errors
export interface SalaryQueryCriteria {
  jobTitle?: string;
  industry?: string;
  region?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive' | undefined;
  education?: 'high_school' | 'bachelor' | 'master' | 'phd' | undefined;
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | undefined;
}

export interface SalaryDataPoint {
  id: string;
  jobTitle: string;
  industry: string;
  region: string;
  experienceLevel: string;
  education: string;
  companySize: string;
  baseSalary: number;
  totalCompensation: number;
  bonus?: number;
  equity?: number;
  benefits?: string[];
  currency: string;
  timestamp: string;
  source: string;
  verified: boolean;
}

export interface SalaryStatistics {
  count: number;
  median: number;
  mean: number;
  min: number;
  max: number;
  percentile25: number;
  percentile75: number;
  percentile90: number;
  standardDeviation: number;
  currency: string;
  lastUpdated: string;
}

export interface SalaryQueryResponse {
  data: SalaryDataPoint[];
  statistics: SalaryStatistics;
  metadata: {
    totalCount: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
    queryId: string;
  };
}

export interface ContributeSalaryData {
  jobTitle: string;
  industry: string;
  region: string;
  experienceLevel: string;
  education: string;
  companySize: string;
  baseSalary: number;
  totalCompensation: number;
  bonus?: number;
  equity?: number;
  benefits?: string[];
  currency: string;
  anonymous: boolean;
}

// Validation schemas
const salaryQueryCriteriaSchema = z.object({
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  region: z.string().optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
  education: z.enum(['high_school', 'bachelor', 'master', 'phd']).optional(),
  companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
});

// Custom error types
export class SalaryDataServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SalaryDataServiceError';
  }
}

export class ValidationError extends SalaryDataServiceError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends SalaryDataServiceError {
  constructor(message: string, statusCode?: number) {
    super(message, 'NETWORK_ERROR', statusCode);
    this.name = 'NetworkError';
  }
}

export class RateLimitError extends SalaryDataServiceError {
  constructor(message: string, retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

// Configuration
interface SalaryDataServiceConfig {
  baseUrl: string;
  apiKey?: string | undefined;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

const defaultConfig: SalaryDataServiceConfig = {
  baseUrl: process.env['NEXT_PUBLIC_SALARY_API_URL'] || 'https://api.salarydata.com/v1',
  apiKey: process.env['NEXT_PUBLIC_SALARY_API_KEY'],
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Utility functions
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempts: number,
  delayMs: number
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) {
      throw error;
    }

    // Don't retry on validation errors or client errors (4xx except 429)
    if (
      error instanceof ValidationError ||
      (error instanceof NetworkError &&
        error.statusCode &&
        error.statusCode >= 400 &&
        error.statusCode < 500 &&
        error.statusCode !== 429)
    ) {
      throw error;
    }

    await delay(delayMs);
    return retryWithBackoff(fn, attempts - 1, delayMs * 2);
  }
}

// Fallback data for when API is unavailable
const fallbackSalaryData: SalaryQueryResponse = {
  data: [
    {
      id: 'fallback-1',
      jobTitle: 'Software Engineer',
      industry: 'Technology',
      region: 'San Francisco, CA',
      experienceLevel: 'mid',
      education: 'bachelor',
      companySize: 'large',
      baseSalary: 130000,
      totalCompensation: 180000,
      bonus: 20000,
      equity: 30000,
      benefits: ['Health Insurance', '401k', 'Stock Options'],
      currency: 'USD',
      timestamp: new Date().toISOString(),
      source: 'fallback',
      verified: false,
    },
  ],
  statistics: {
    count: 1,
    median: 130000,
    mean: 130000,
    min: 130000,
    max: 130000,
    percentile25: 130000,
    percentile75: 130000,
    percentile90: 130000,
    standardDeviation: 0,
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
  },
  metadata: {
    totalCount: 1,
    page: 1,
    pageSize: 10,
    hasMore: false,
    queryId: 'fallback-query',
  },
};

// Main service class
export class SalaryDataService {
  private config: SalaryDataServiceConfig;

  constructor(config?: Partial<SalaryDataServiceConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (this.config.apiKey) {
      headers.set('Authorization', `Bearer ${this.config.apiKey}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new RateLimitError(
            'Rate limit exceeded',
            retryAfter ? Number.parseInt(retryAfter, 10) : undefined
          );
        }

        if (response.status >= 400 && response.status < 500) {
          const errorData = await response.json().catch(() => ({}));
          throw new ValidationError(
            errorData.message || `Client error: ${response.status}`,
            errorData
          );
        }

        throw new NetworkError(
          `HTTP error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof SalaryDataServiceError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timeout');
        }
        throw new NetworkError(`Network error: ${error.message}`);
      }

      throw new NetworkError('Unknown network error');
    }
  }

  async querySalaryData(
    criteria: SalaryQueryCriteria,
    page = 1,
    pageSize = 10
  ): Promise<SalaryQueryResponse> {
    try {
      // Validate input
      const validatedCriteria = salaryQueryCriteriaSchema.parse(criteria);

      const queryParams = new URLSearchParams();
      queryParams.set('page', page.toString());
      queryParams.set('pageSize', pageSize.toString());

      for (const [key, value] of Object.entries(validatedCriteria)) {
        if (value !== undefined) {
          queryParams.set(key, value.toString());
        }
      }

      return await retryWithBackoff(
        () => this.makeRequest<SalaryQueryResponse>(`/salary/query?${queryParams}`),
        this.config.retryAttempts,
        this.config.retryDelay
      );
    } catch (error) {
      console.warn('Failed to fetch salary data from API, using fallback:', error);
      const filteredData = fallbackSalaryData.data.filter((item) =>
        Object.entries(criteria).every(
          ([key, value]) => !value || item[key as keyof SalaryDataPoint] === value
        )
      );

      return {
        ...fallbackSalaryData,
        data: filteredData,
        statistics: {
          ...fallbackSalaryData.statistics,
          count: filteredData.length,
        },
        metadata: {
          ...fallbackSalaryData.metadata,
          totalCount: filteredData.length,
          page,
          pageSize,
        },
      };
    }
  }

  async getSalaryStatistics(criteria: SalaryQueryCriteria): Promise<SalaryStatistics> {
    // This is a mock implementation. In a real scenario, this would be a separate API endpoint.
    const response = await this.querySalaryData(criteria, 1, 1000); // Fetch a large sample
    return response.statistics;
  }

  async contributeSalaryData(
    data: ContributeSalaryData
  ): Promise<{ success: boolean; id: string }> {
    // This is a mock implementation.
    console.log('Contributing salary data:', data);
    return Promise.resolve({ success: true, id: `contribution-${Date.now()}` });
  }

  async getTrendingSalaries(timeframe: string): Promise<SalaryDataPoint[]> {
    // This is a mock implementation.
    console.log(`Fetching trending salaries for timeframe: ${timeframe}`);
    return Promise.resolve(fallbackSalaryData.data);
  }

  async compareSalaries(
    criteria1: SalaryQueryCriteria,
    criteria2: SalaryQueryCriteria
  ): Promise<any> {
    // This is a mock implementation.
    const stats1 = await this.getSalaryStatistics(criteria1);
    const stats2 = await this.getSalaryStatistics(criteria2);
    return Promise.resolve({
      comparison1: stats1,
      comparison2: stats2,
      difference: {
        median: stats2.median - stats1.median,
        mean: stats2.mean - stats1.mean,
        percentageChange: ((stats2.median - stats1.median) / stats1.median) * 100,
      },
    });
  }
}

// Export singleton instance
export const salaryDataService = new SalaryDataService();
