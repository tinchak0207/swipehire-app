import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  type ContributeSalaryData,
  NetworkError,
  RateLimitError,
  type SalaryDataPoint,
  SalaryDataServiceError,
  type SalaryQueryCriteria,
  type SalaryQueryResponse,
  type SalaryStatistics,
  salaryDataService,
  ValidationError,
} from '../services/salaryDataService';

// Query keys for React Query
const SALARY_QUERY_KEYS = {
  all: ['salary'] as const,
  queries: () => [...SALARY_QUERY_KEYS.all, 'query'] as const,
  query: (criteria: SalaryQueryCriteria, page: number, pageSize: number) =>
    [...SALARY_QUERY_KEYS.queries(), criteria, page, pageSize] as const,
  statistics: (criteria: SalaryQueryCriteria) =>
    [...SALARY_QUERY_KEYS.all, 'statistics', criteria] as const,
  trending: (timeframe: string) => [...SALARY_QUERY_KEYS.all, 'trending', timeframe] as const,
  comparison: (criteria1: SalaryQueryCriteria, criteria2: SalaryQueryCriteria) =>
    [...SALARY_QUERY_KEYS.all, 'comparison', criteria1, criteria2] as const,
} as const;

// Hook options interface
export interface UseSalaryQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: number | boolean;
  retryDelay?: number | ((attemptIndex: number) => number);
}

// Hook return type for salary query
export interface UseSalaryQueryResult {
  // Data
  data: SalaryQueryResponse | undefined;
  salaryData: SalaryDataPoint[];
  statistics: SalaryStatistics | undefined;
  metadata: SalaryQueryResponse['metadata'] | undefined;

  // Loading states
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;

  // Error states
  error: Error | null;
  isError: boolean;

  // Status
  status: 'pending' | 'error' | 'success';

  // Actions
  refetch: () => void;
  invalidate: () => void;
}

// Hook return type for salary statistics
export interface UseSalaryStatisticsResult {
  data: SalaryStatistics | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  error: Error | null;
  isError: boolean;
  status: 'pending' | 'error' | 'success';
  refetch: () => void;
  invalidate: () => void;
}

// Hook return type for salary contribution
export interface UseSalaryContributionResult {
  mutate: (data: ContributeSalaryData) => void;
  mutateAsync: (data: ContributeSalaryData) => Promise<{ success: boolean; id: string }>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data: { success: boolean; id: string } | undefined;
  reset: () => void;
}

// Hook return type for trending salary data
export interface UseTrendingSalaryResult {
  data: SalaryDataPoint[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  error: Error | null;
  isError: boolean;
  status: 'pending' | 'error' | 'success';
  refetch: () => void;
  invalidate: () => void;
}

// Hook return type for salary comparison
export interface UseSalaryComparisonResult {
  data:
    | {
        comparison1: SalaryStatistics;
        comparison2: SalaryStatistics;
        difference: {
          median: number;
          mean: number;
          percentageChange: number;
        };
      }
    | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  error: Error | null;
  isError: boolean;
  status: 'pending' | 'error' | 'success';
  refetch: () => void;
  invalidate: () => void;
}

/**
 * Custom hook for querying salary data with React Query integration
 *
 * @param criteria - Salary query criteria (optional)
 * @param page - Page number for pagination (default: 1)
 * @param pageSize - Number of items per page (default: 10)
 * @param options - Additional React Query options
 * @returns UseSalaryQueryResult with data, loading states, and actions
 */
export function useSalaryQuery(
  criteria: SalaryQueryCriteria = {},
  page = 1,
  pageSize = 10,
  options: UseSalaryQueryOptions = {}
): UseSalaryQueryResult {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: SALARY_QUERY_KEYS.query(criteria, page, pageSize),
    queryFn: async (): Promise<SalaryQueryResponse> => {
      try {
        return await salaryDataService.querySalaryData(criteria, page, pageSize);
      } catch (error) {
        // Enhanced error handling with specific error types
        if (error instanceof ValidationError) {
          throw new Error(`Validation Error: ${error.message}`);
        }
        if (error instanceof NetworkError) {
          throw new Error(`Network Error: ${error.message}`);
        }
        if (error instanceof RateLimitError) {
          throw new Error(`Rate Limit Error: ${error.message}. Please try again later.`);
        }
        if (error instanceof SalaryDataServiceError) {
          throw new Error(`Service Error: ${error.message}`);
        }
        throw error;
      }
    },
    enabled: options.enabled !== false,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.gcTime ?? 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    refetchOnReconnect: options.refetchOnReconnect ?? true,
    retry: options.retry ?? 3,
    retryDelay: options.retryDelay ?? ((attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)),
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: SALARY_QUERY_KEYS.query(criteria, page, pageSize),
    });
  }, [queryClient, criteria, page, pageSize]);

  const refetch = useCallback(() => {
    queryResult.refetch();
  }, [queryResult]);

  // Memoized derived data
  const salaryData = useMemo(() => queryResult.data?.data ?? [], [queryResult.data]);
  const statistics = useMemo(() => queryResult.data?.statistics, [queryResult.data]);
  const metadata = useMemo(() => queryResult.data?.metadata, [queryResult.data]);

  return {
    data: queryResult.data,
    salaryData,
    statistics,
    metadata,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isRefetching: queryResult.isRefetching,
    error: queryResult.error,
    isError: queryResult.isError,
    status: queryResult.status,
    refetch,
    invalidate,
  };
}

/**
 * Custom hook for fetching salary statistics
 *
 * @param criteria - Salary query criteria
 * @param options - Additional React Query options
 * @returns UseSalaryStatisticsResult with statistics data and states
 */
export function useSalaryStatistics(
  criteria: SalaryQueryCriteria,
  options: UseSalaryQueryOptions = {}
): UseSalaryStatisticsResult {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: SALARY_QUERY_KEYS.statistics(criteria),
    queryFn: async (): Promise<SalaryStatistics> => {
      try {
        return await salaryDataService.getSalaryStatistics(criteria);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new Error(`Validation Error: ${error.message}`);
        }
        if (error instanceof NetworkError) {
          throw new Error(`Network Error: ${error.message}`);
        }
        if (error instanceof RateLimitError) {
          throw new Error(`Rate Limit Error: ${error.message}. Please try again later.`);
        }
        if (error instanceof SalaryDataServiceError) {
          throw new Error(`Service Error: ${error.message}`);
        }
        throw error;
      }
    },
    enabled: options.enabled !== false,
    staleTime: options.staleTime ?? 5 * 60 * 1000,
    gcTime: options.gcTime ?? 10 * 60 * 1000,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    refetchOnReconnect: options.refetchOnReconnect ?? true,
    retry: options.retry ?? 3,
    retryDelay: options.retryDelay ?? ((attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)),
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: SALARY_QUERY_KEYS.statistics(criteria),
    });
  }, [queryClient, criteria]);

  const refetch = useCallback(() => {
    queryResult.refetch();
  }, [queryResult]);

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isRefetching: queryResult.isRefetching,
    error: queryResult.error,
    isError: queryResult.isError,
    status: queryResult.status,
    refetch,
    invalidate,
  };
}

/**
 * Custom hook for contributing salary data
 *
 * @returns UseSalaryContributionResult with mutation functions and states
 */
export function useSalaryContribution(): UseSalaryContributionResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ContributeSalaryData): Promise<{ success: boolean; id: string }> => {
      try {
        return await salaryDataService.contributeSalaryData(data);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new Error(`Validation Error: ${error.message}`);
        }
        if (error instanceof NetworkError) {
          throw new Error(`Network Error: ${error.message}`);
        }
        if (error instanceof RateLimitError) {
          throw new Error(`Rate Limit Error: ${error.message}. Please try again later.`);
        }
        if (error instanceof SalaryDataServiceError) {
          throw new Error(`Service Error: ${error.message}`);
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all salary queries to refresh data
      queryClient.invalidateQueries({
        queryKey: SALARY_QUERY_KEYS.all,
      });
    },
    retry: 1,
    retryDelay: 1000,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

/**
 * Custom hook for fetching trending salary data
 *
 * @param timeframe - Time period for trending data
 * @param options - Additional React Query options
 * @returns UseTrendingSalaryResult with trending data and states
 */
export function useTrendingSalary(
  timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month',
  options: UseSalaryQueryOptions = {}
): UseTrendingSalaryResult {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: SALARY_QUERY_KEYS.trending(timeframe),
    queryFn: async (): Promise<SalaryDataPoint[]> => {
      try {
        return await salaryDataService.getTrendingSalaries(timeframe);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new Error(`Validation Error: ${error.message}`);
        }
        if (error instanceof NetworkError) {
          throw new Error(`Network Error: ${error.message}`);
        }
        if (error instanceof RateLimitError) {
          throw new Error(`Rate Limit Error: ${error.message}. Please try again later.`);
        }
        if (error instanceof SalaryDataServiceError) {
          throw new Error(`Service Error: ${error.message}`);
        }
        throw error;
      }
    },
    enabled: options.enabled !== false,
    staleTime: options.staleTime ?? 15 * 60 * 1000, // 15 minutes for trending data
    gcTime: options.gcTime ?? 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    refetchOnReconnect: options.refetchOnReconnect ?? true,
    retry: options.retry ?? 3,
    retryDelay: options.retryDelay ?? ((attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)),
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: SALARY_QUERY_KEYS.trending(timeframe),
    });
  }, [queryClient, timeframe]);

  const refetch = useCallback(() => {
    queryResult.refetch();
  }, [queryResult]);

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isRefetching: queryResult.isRefetching,
    error: queryResult.error,
    isError: queryResult.isError,
    status: queryResult.status,
    refetch,
    invalidate,
  };
}

/**
 * Custom hook for comparing salary data between two criteria
 *
 * @param criteria1 - First set of criteria for comparison
 * @param criteria2 - Second set of criteria for comparison
 * @param options - Additional React Query options
 * @returns UseSalaryComparisonResult with comparison data and states
 */
export function useSalaryComparison(
  criteria1: SalaryQueryCriteria,
  criteria2: SalaryQueryCriteria,
  options: UseSalaryQueryOptions = {}
): UseSalaryComparisonResult {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: SALARY_QUERY_KEYS.comparison(criteria1, criteria2),
    queryFn: async () => {
      try {
        return await salaryDataService.compareSalaries(criteria1, criteria2);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new Error(`Validation Error: ${error.message}`);
        }
        if (error instanceof NetworkError) {
          throw new Error(`Network Error: ${error.message}`);
        }
        if (error instanceof RateLimitError) {
          throw new Error(`Rate Limit Error: ${error.message}. Please try again later.`);
        }
        if (error instanceof SalaryDataServiceError) {
          throw new Error(`Service Error: ${error.message}`);
        }
        throw error;
      }
    },
    enabled: options.enabled !== false,
    staleTime: options.staleTime ?? 5 * 60 * 1000,
    gcTime: options.gcTime ?? 10 * 60 * 1000,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    refetchOnReconnect: options.refetchOnReconnect ?? true,
    retry: options.retry ?? 3,
    retryDelay: options.retryDelay ?? ((attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)),
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: SALARY_QUERY_KEYS.comparison(criteria1, criteria2),
    });
  }, [queryClient, criteria1, criteria2]);

  const refetch = useCallback(() => {
    queryResult.refetch();
  }, [queryResult]);

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isRefetching: queryResult.isRefetching,
    error: queryResult.error,
    isError: queryResult.isError,
    status: queryResult.status,
    refetch,
    invalidate,
  };
}

// Export query keys for external use (e.g., in components for manual invalidation)
export { SALARY_QUERY_KEYS };

// Export types for external use
export type {
  SalaryQueryCriteria,
  SalaryQueryResponse,
  SalaryStatistics,
  SalaryDataPoint,
  ContributeSalaryData,
};
