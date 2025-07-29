/**
 * Portfolio API Routes - Backend Integration
 *
 * Implements portfolio endpoints that connect to the SwipeHire backend
 * for persistent storage and retrieval of portfolio data.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import API_CONFIG from '@/config/api';

// --- Zod Schemas ---

const portfolioCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  projects: z.array(z.any()).default([]),
  layout: z.enum(['grid', 'list', 'carousel', 'masonry']).default('grid'),
  tags: z.array(z.string()).max(10, 'Too many tags').default([]),
  isPublished: z.boolean().default(false),
  visibility: z.enum(['public', 'private', 'unlisted']).default('private'),
  theme: z.string().default('default'),
  customCss: z.string().max(10000, 'Custom CSS too long').default(''),
  seoTitle: z.string().max(60, 'SEO title too long').optional(),
  seoDescription: z.string().max(160, 'SEO description too long').optional(),
  socialImage: z.string().url('Invalid social image URL').optional().or(z.literal('')),
});

const portfolioFiltersSchema = z.object({
  search: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'views', 'likes']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  includePrivate: z.boolean().default(true),
});

// --- Helper Functions ---

async function getAuthenticatedUser(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    // For testing purposes, return a valid ObjectId format
    return '507f1f77bcf86cd799439011';
  }

  // Extract Firebase UID from the token
  // In a real app, you'd validate the JWT token here
  // For now, we'll extract a simple user ID from the token
  const token = authHeader.substring(7);
  return token || '507f1f77bcf86cd799439011';
}

async function makeBackendRequest(
  endpoint: string,
  options: RequestInit = {},
  userId?: string
): Promise<Response> {
  const baseUrl = API_CONFIG.baseUrl;
  if (!baseUrl) {
    throw new Error('Backend URL not configured');
  }

  const url = `${baseUrl}${endpoint}`;
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Forward the actual Firebase ID token instead of the user ID
  if (userId && userId !== '507f1f77bcf86cd799439011') {
    headers['Authorization'] = `Bearer ${userId}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

function parsePortfolioFilters(searchParams: URLSearchParams) {
  const rawFilters = {
    search: searchParams.get('search') || undefined,
    tags: searchParams.get('tags') || undefined,
    sortBy: searchParams.get('sortBy') || 'updatedAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '10', 10),
    includePrivate: searchParams.get('includePrivate') !== 'false',
  };
  return portfolioFiltersSchema.safeParse(rawFilters);
}

// --- API Route Handlers ---

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const validation = parsePortfolioFilters(request.nextUrl.searchParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid filters',
          errors: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const filters = validation.data;

    // Build query parameters for backend
    const queryParams = new URLSearchParams({
      page: filters.page.toString(),
      limit: filters.limit.toString(),
      includePrivate: filters.includePrivate.toString(),
    });

    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    if (filters.tags) queryParams.append('tags', filters.tags);

    const response = await makeBackendRequest(
      `/api/portfolios/my?${queryParams.toString()}`,
      { method: 'GET' },
      userId
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || 'Failed to fetch portfolios',
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = portfolioCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid data',
          errors: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const portfolioData = {
      ...validation.data,
      userId,
    };

    const response = await makeBackendRequest(
      '/api/portfolios',
      {
        method: 'POST',
        body: JSON.stringify(portfolioData),
      },
      userId
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || 'Failed to create portfolio',
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
