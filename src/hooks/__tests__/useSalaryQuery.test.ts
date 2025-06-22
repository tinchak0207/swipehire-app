import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import type {
  ContributeSalaryData,
  SalaryDataPoint,
  SalaryQueryCriteria,
  SalaryQueryResponse,
  SalaryStatistics,
} from '@/services/salaryDataService';
import * as salaryDataService from '@/services/salaryDataService';
import {
  useSalaryComparison,
  useSalaryContribution,
  useSalaryQuery,
  useSalaryStatistics,
  useTrendingSalary,
} from '../useSalaryQuery';

// Mock the salary data service
jest.mock('@/services/salaryDataService', () => ({
  ...jest.requireActual('@/services/salaryDataService'),
  salaryDataService: {
    querySalaryData: jest.fn(),
    getSalaryStatistics: jest.fn(),
    contributeSalaryData: jest.fn(),
    getTrendingSalaryData: jest.fn(),
    compareSalaries: jest.fn(),
  },
}));

// Mock data
const mockSalaryData: SalaryDataPoint[] = [
  {
    id: 'test-1',
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
    timestamp: '2024-01-01T00:00:00Z',
    source: 'api',
    verified: true,
  },
  {
    id: 'test-2',
    jobTitle: 'Senior Software Engineer',
    industry: 'Technology',
    region: 'San Francisco, CA',
    experienceLevel: 'senior',
    education: 'master',
    companySize: 'large',
    baseSalary: 160000,
    totalCompensation: 220000,
    bonus: 25000,
    equity: 35000,
    benefits: ['Health Insurance', '401k', 'Stock Options', 'Unlimited PTO'],
    currency: 'USD',
    timestamp: '2024-01-01T00:00:00Z',
    source: 'api',
    verified: true,
  },
];

const mockStatistics: SalaryStatistics = {
  count: 2,
  median: 145000,
  mean: 145000,
  min: 130000,
  max: 160000,
  percentile25: 137500,
  percentile75: 152500,
  percentile90: 158000,
  standardDeviation: 15000,
  currency: 'USD',
  lastUpdated: '2024-01-01T00:00:00Z',
};

const mockQueryResponse: SalaryQueryResponse = {
  data: mockSalaryData,
  statistics: mockStatistics,
  metadata: {
    totalCount: 2,
    page: 1,
    pageSize: 10,
    hasMore: false,
    queryId: 'test-query-id',
  },
};

// Test wrapper component
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useSalaryQuery', () => {
  const mockSalaryDataService = salaryDataService.salaryDataService as jest.Mocked<
    typeof salaryDataService.salaryDataService
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useSalaryQuery hook', () => {
    it('should fetch salary data successfully', async () => {
      const wrapper = createWrapper();
      const criteria: SalaryQueryCriteria = { jobTitle: 'Software Engineer' };

      // Mock successful response with filtered data
      const filteredData = [mockSalaryData[0]]; // Only the first item matches "Software Engineer"
      const mockResponse = {
        ...mockQueryResponse,
        data: filteredData,
        statistics: { ...mockStatistics, count: filteredData.length },
      };
      mockSalaryDataService.querySalaryData.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSalaryQuery(criteria), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeDefined();
      expect(result.current.salaryData).toHaveLength(1);
      expect(result.current.salaryData[0].jobTitle).toBe('Software Engineer');
      expect(result.current.statistics).toBeDefined();
      expect(result.current.metadata).toBeDefined();
    });

    it('should handle empty criteria', async () => {
      const wrapper = createWrapper();

      mockSalaryDataService.querySalaryData.mockResolvedValue(mockQueryResponse);

      const { result } = renderHook(() => useSalaryQuery({}), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeDefined();
      expect(result.current.salaryData).toHaveLength(2);
    });

    it('should handle pagination parameters', async () => {
      const wrapper = createWrapper();
      const criteria: SalaryQueryCriteria = { jobTitle: 'Software Engineer' };

      const mockResponseWithPagination = {
        ...mockQueryResponse,
        metadata: { ...mockQueryResponse.metadata, page: 2, pageSize: 5 },
      };
      mockSalaryDataService.querySalaryData.mockResolvedValue(mockResponseWithPagination);

      const { result } = renderHook(() => useSalaryQuery(criteria, 2, 5), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.metadata?.page).toBe(2);
      expect(result.current.metadata?.pageSize).toBe(5);
      expect(mockSalaryDataService.querySalaryData).toHaveBeenCalledWith(criteria, 2, 5);
    });

    it('should handle network errors', async () => {
      const wrapper = createWrapper();
      const criteria: SalaryQueryCriteria = { jobTitle: 'error' };

      mockSalaryDataService.querySalaryData.mockRejectedValue(
        new Error('Network Error: Internal server error')
      );

      const { result } = renderHook(() => useSalaryQuery(criteria, 1, 10, { retry: false }), {
        wrapper,
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('Network Error');
    });

    it('should support custom options', async () => {
      const wrapper = createWrapper();
      const criteria: SalaryQueryCriteria = { jobTitle: 'Software Engineer' };

      const { result } = renderHook(() => useSalaryQuery(criteria, 1, 10, { enabled: false }), {
        wrapper,
      });

      // Should not fetch when disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockSalaryDataService.querySalaryData).not.toHaveBeenCalled();
    });

    it('should provide refetch and invalidate functions', async () => {
      const wrapper = createWrapper();
      const criteria: SalaryQueryCriteria = { jobTitle: 'Software Engineer' };

      mockSalaryDataService.querySalaryData.mockResolvedValue(mockQueryResponse);

      const { result } = renderHook(() => useSalaryQuery(criteria), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.invalidate).toBe('function');
    });
  });

  describe('useSalaryStatistics hook', () => {
    it('should fetch salary statistics successfully', async () => {
      const wrapper = createWrapper();
      const criteria: SalaryQueryCriteria = { jobTitle: 'Software Engineer' };

      mockSalaryDataService.getSalaryStatistics.mockResolvedValue(mockStatistics);

      const { result } = renderHook(() => useSalaryStatistics(criteria), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.median).toBe(145000);
      expect(result.current.data?.count).toBe(2);
    });

    it('should handle errors in statistics fetch', async () => {
      const wrapper = createWrapper();
      const criteria: SalaryQueryCriteria = { jobTitle: 'error' };

      mockSalaryDataService.getSalaryStatistics.mockRejectedValue(
        new Error('Network Error: Internal server error')
      );

      const { result } = renderHook(() => useSalaryStatistics(criteria, { retry: false }), {
        wrapper,
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useSalaryContribution hook', () => {
    it('should contribute salary data successfully', async () => {
      const wrapper = createWrapper();

      mockSalaryDataService.contributeSalaryData.mockResolvedValue({
        success: true,
        id: 'contribution-123',
      });

      const { result } = renderHook(() => useSalaryContribution(), { wrapper });

      const contributionData: ContributeSalaryData = {
        jobTitle: 'Software Engineer',
        industry: 'Technology',
        region: 'San Francisco, CA',
        experienceLevel: 'mid',
        education: 'bachelor',
        companySize: 'large',
        baseSalary: 130000,
        totalCompensation: 180000,
        currency: 'USD',
        anonymous: true,
      };

      result.current.mutate(contributionData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.success).toBe(true);
      expect(result.current.data?.id).toBe('contribution-123');
    });

    it('should handle contribution errors', async () => {
      const wrapper = createWrapper();

      mockSalaryDataService.contributeSalaryData.mockRejectedValue(
        new Error('Validation Error: Invalid data')
      );

      const { result } = renderHook(() => useSalaryContribution(), { wrapper });

      const contributionData: ContributeSalaryData = {
        jobTitle: 'Software Engineer',
        industry: 'Technology',
        region: 'San Francisco, CA',
        experienceLevel: 'mid',
        education: 'bachelor',
        companySize: 'large',
        baseSalary: 130000,
        totalCompensation: 180000,
        currency: 'USD',
        anonymous: true,
      };

      result.current.mutate(contributionData);

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useTrendingSalary hook', () => {
    it('should fetch trending salary data successfully', async () => {
      const wrapper = createWrapper();

      mockSalaryDataService.getTrendingSalaryData.mockResolvedValue(mockSalaryData);

      const { result } = renderHook(() => useTrendingSalary('month'), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveLength(2);
    });

    it('should handle different timeframes', async () => {
      const wrapper = createWrapper();

      mockSalaryDataService.getTrendingSalaryData.mockResolvedValue(mockSalaryData);

      const { result } = renderHook(() => useTrendingSalary('week'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeDefined();
      expect(mockSalaryDataService.getTrendingSalaryData).toHaveBeenCalledWith('week');
    });
  });

  describe('useSalaryComparison hook', () => {
    it('should compare salary data successfully', async () => {
      const wrapper = createWrapper();
      const criteria1: SalaryQueryCriteria = { experienceLevel: 'mid' };
      const criteria2: SalaryQueryCriteria = { experienceLevel: 'senior' };

      const mockComparisonResult = {
        comparison1: mockStatistics,
        comparison2: { ...mockStatistics, median: 160000, mean: 160000 },
        difference: {
          median: 15000,
          mean: 15000,
          percentageChange: 10.34,
        },
      };

      mockSalaryDataService.compareSalaries.mockResolvedValue(mockComparisonResult);

      const { result } = renderHook(() => useSalaryComparison(criteria1, criteria2), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.comparison1).toBeDefined();
      expect(result.current.data?.comparison2).toBeDefined();
      expect(result.current.data?.difference).toBeDefined();
      expect(result.current.data?.difference.percentageChange).toBe(10.34);
    });
  });

  describe('Hook state management', () => {
    it('should properly manage loading states', async () => {
      const wrapper = createWrapper();
      const criteria: SalaryQueryCriteria = { jobTitle: 'Software Engineer' };

      mockSalaryDataService.querySalaryData.mockResolvedValue(mockQueryResponse);

      const { result } = renderHook(() => useSalaryQuery(criteria), { wrapper });

      // Initial loading state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);
      expect(result.current.status).toBe('pending');

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Success state
      expect(result.current.isFetching).toBe(false);
      expect(result.current.status).toBe('success');
      expect(result.current.isError).toBe(false);
    });

    it('should handle parameter changes correctly', async () => {
      const wrapper = createWrapper();
      let criteria: SalaryQueryCriteria = { jobTitle: 'Software Engineer' };

      // Mock responses for different criteria
      const softwareEngineerResponse = {
        ...mockQueryResponse,
        data: [mockSalaryData[0]],
        statistics: { ...mockStatistics, count: 1 },
      };

      const seniorEngineerResponse = {
        ...mockQueryResponse,
        data: [mockSalaryData[1]],
        statistics: { ...mockStatistics, count: 1 },
      };

      mockSalaryDataService.querySalaryData
        .mockResolvedValueOnce(softwareEngineerResponse)
        .mockResolvedValueOnce(seniorEngineerResponse);

      const { result, rerender } = renderHook(() => useSalaryQuery(criteria), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.salaryData).toHaveLength(1);
      expect(result.current.salaryData[0].jobTitle).toBe('Software Engineer');

      // Change criteria
      criteria = { jobTitle: 'Senior Software Engineer' };
      rerender();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.salaryData).toHaveLength(1);
      expect(result.current.salaryData[0].jobTitle).toBe('Senior Software Engineer');
    });
  });
});
