/**
 * Portfolio React Query Hooks
 *
 * Provides React Query hooks for fetching, creating, updating, and deleting portfolios
 * and projects, as well as handling media uploads with centralized loading and error states.
 */

import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  CreatePortfolioRequest,
  MediaUploadResponse,
  Portfolio,
  PortfolioListResponse,
  PortfolioSearchParams,
  UpdatePortfolioRequest,
} from '../lib/types/portfolio';

// API base URL - in production, this should come from environment variables
const API_BASE_URL = '/api';

// Query keys for React Query
export const portfolioKeys = {
  all: ['portfolios'] as const,
  lists: () => [...portfolioKeys.all, 'list'] as const,
  list: (filters: PortfolioSearchParams) => [...portfolioKeys.lists(), filters] as const,
  details: () => [...portfolioKeys.all, 'detail'] as const,
  detail: (id: string) => [...portfolioKeys.details(), id] as const,
  upload: () => [...portfolioKeys.all, 'upload'] as const,
};

// API service functions
class PortfolioService {
  private static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    // TODO: Replace with actual authentication token
    const token = 'mock-token';

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response;
  }

  static async getPortfolios(filters: PortfolioSearchParams = {}): Promise<PortfolioListResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          searchParams.set(key, value.join(','));
        } else {
          searchParams.set(key, String(value));
        }
      }
    });

    const url = `${API_BASE_URL}/portfolio?${searchParams.toString()}`;
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  static async getPortfolio(id: string): Promise<Portfolio> {
    const url = `${API_BASE_URL}/portfolio/${id}`;
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  static async createPortfolio(data: CreatePortfolioRequest): Promise<Portfolio> {
    try {
      const url = `${API_BASE_URL}/portfolio`;
      const response = await this.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      throw error;
    }
  }

  static async updatePortfolio(id: string, data: UpdatePortfolioRequest): Promise<Portfolio> {
    const url = `${API_BASE_URL}/portfolio/${id}`;
    const response = await this.fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async deletePortfolio(id: string): Promise<{ success: boolean }> {
    const url = `${API_BASE_URL}/portfolio/${id}`;
    const response = await this.fetchWithAuth(url, {
      method: 'DELETE',
    });
    return response.json();
  }

  static async uploadMedia(formData: FormData): Promise<MediaUploadResponse> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/portfolio/upload`, {
        method: 'POST',
        body: formData,
      });
      return response.json();
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  }

  static async getUploadInfo(): Promise<{ maxSize: number; allowedTypes: string[] }> {
    const url = `${API_BASE_URL}/portfolio/upload`;
    const response = await this.fetchWithAuth(url);
    return response.json();
  }
}

// React Query Hooks

/**
 * Hook to fetch portfolios with filtering and pagination
 */
export function usePortfolios(
  filters: PortfolioSearchParams = {}
): UseQueryResult<PortfolioListResponse, Error> {
  return useQuery({
    queryKey: portfolioKeys.list(filters),
    queryFn: () => PortfolioService.getPortfolios(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch a specific portfolio by ID
 */
export function usePortfolio(id: string): UseQueryResult<Portfolio, Error> {
  return useQuery({
    queryKey: portfolioKeys.detail(id),
    queryFn: () => PortfolioService.getPortfolio(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to create a new portfolio
 */
export function useCreatePortfolio(): UseMutationResult<Portfolio, Error, CreatePortfolioRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => PortfolioService.createPortfolio(data),
    onSuccess: (data) => {
      // Invalidate and refetch portfolios list
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });

      // Add the new portfolio to the cache
      queryClient.setQueryData(portfolioKeys.detail(data.id), data);
    },
    onError: (error) => {
      console.error('Failed to create portfolio:', error);
    },
  });
}

/**
 * Hook to update an existing portfolio
 */
export function useUpdatePortfolio(): UseMutationResult<
  Portfolio,
  Error,
  { id: string; data: UpdatePortfolioRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => PortfolioService.updatePortfolio(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch portfolios list
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });

      // Update the specific portfolio in cache
      queryClient.setQueryData(portfolioKeys.detail(variables.id), data);
    },
    onError: (error) => {
      console.error('Failed to update portfolio:', error);
    },
  });
}

/**
 * Hook to delete a portfolio
 */
export function useDeletePortfolio(): UseMutationResult<{ success: boolean }, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (portfolioId) => PortfolioService.deletePortfolio(portfolioId),
    onSuccess: (_, portfolioId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: portfolioKeys.detail(portfolioId) });

      // Invalidate and refetch portfolios list
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete portfolio:', error);
    },
  });
}

/**
 * Hook to upload media files
 */
export function useUploadMedia(): UseMutationResult<MediaUploadResponse, Error, FormData> {
  return useMutation({
    mutationFn: PortfolioService.uploadMedia,
    onError: (error) => {
      console.error('Failed to upload media:', error);
    },
  });
}

/**
 * Hook to get upload information (limits, allowed types, etc.)
 */
export function useUploadInfo(): UseQueryResult<
  { maxSize: number; allowedTypes: string[] },
  Error
> {
  return useQuery({
    queryKey: portfolioKeys.upload(),
    queryFn: PortfolioService.getUploadInfo,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook for optimistic updates when liking/unliking portfolios
 */
export function useLikePortfolio(): UseMutationResult<
  void,
  Error,
  { portfolioId: string; isLiked: boolean }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // TODO: Implement actual like/unlike API endpoint
      await new Promise((resolve) => setTimeout(resolve, 500)); // Mock delay
    },
    onMutate: async ({ portfolioId, isLiked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: portfolioKeys.detail(portfolioId) });

      // Snapshot the previous value
      const previousPortfolio = queryClient.getQueryData<Portfolio>(
        portfolioKeys.detail(portfolioId)
      );

      // Optimistically update the cache
      if (previousPortfolio) {
        const updatedPortfolio = {
          ...previousPortfolio,
          stats: {
            ...previousPortfolio.stats,
            likes: previousPortfolio.stats.likes + (isLiked ? 1 : -1),
          },
        };
        queryClient.setQueryData(portfolioKeys.detail(portfolioId), updatedPortfolio);
      }

      // Return a context object with the snapshotted value
      return { previousPortfolio };
    },
    onError: (_, { portfolioId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPortfolio) {
        queryClient.setQueryData(portfolioKeys.detail(portfolioId), context.previousPortfolio);
      }
    },
    onSettled: (_, __, { portfolioId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: portfolioKeys.detail(portfolioId) });
    },
  });
}

/**
 * Custom hook for managing portfolio draft state with auto-save
 */
export function usePortfolioDraft(portfolioId?: string) {
  // Get existing portfolio data if editing
  const { data: existingPortfolio } = usePortfolio(portfolioId || '');

  // Auto-save draft to localStorage
  const saveDraft = (draft: Partial<CreatePortfolioRequest>) => {
    const key = portfolioId ? `portfolio-draft-${portfolioId}` : 'portfolio-draft-new';
    localStorage.setItem(key, JSON.stringify(draft));
  };

  // Load draft from localStorage
  const loadDraft = (): Partial<CreatePortfolioRequest> | null => {
    const key = portfolioId ? `portfolio-draft-${portfolioId}` : 'portfolio-draft-new';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  };

  // Clear draft from localStorage
  const clearDraft = () => {
    const key = portfolioId ? `portfolio-draft-${portfolioId}` : 'portfolio-draft-new';
    localStorage.removeItem(key);
  };

  return {
    existingPortfolio,
    saveDraft,
    loadDraft,
    clearDraft,
  };
}

/**
 * Hook for batch operations on portfolios
 */
export function useBatchPortfolioOperations() {
  const queryClient = useQueryClient();

  const batchDelete = useMutation({
    mutationFn: async (portfolioIds: string[]) => {
      const results = await Promise.allSettled(
        portfolioIds.map((id) => PortfolioService.deletePortfolio(id))
      );
      return results;
    },
    onSuccess: () => {
      // Invalidate all portfolio queries
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });

  const batchPublish = useMutation({
    mutationFn: async (portfolioIds: string[]) => {
      const results = await Promise.allSettled(
        portfolioIds.map((id) => PortfolioService.updatePortfolio(id, { isPublished: true }))
      );
      return results;
    },
    onSuccess: () => {
      // Invalidate all portfolio queries
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });

  const batchUnpublish = useMutation({
    mutationFn: async (portfolioIds: string[]) => {
      const results = await Promise.allSettled(
        portfolioIds.map((id) => PortfolioService.updatePortfolio(id, { isPublished: false }))
      );
      return results;
    },
    onSuccess: () => {
      // Invalidate all portfolio queries
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });

  return {
    batchDelete,
    batchPublish,
    batchUnpublish,
  };
}
