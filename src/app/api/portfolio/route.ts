/**
 * Portfolio API Routes - Core CRUD Operations
 *
 * Implements the main portfolio endpoints for listing and creating portfolios
 * with proper validation, authentication, and error handling.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Portfolio } from '@/lib/types/portfolio';

// --- Zod Schemas ---

const portfolioCreateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  // ... other fields
});

const portfolioFiltersSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// --- Mock Database ---

const portfolios: Portfolio[] = [];
let nextId = 1;

// --- Helper Functions ---

async function getAuthenticatedUser(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  return authHeader?.startsWith('Bearer ') ? 'user-123' : null;
}

function parsePortfolioFilters(searchParams: URLSearchParams) {
  const rawFilters = {
    search: searchParams.get('search') || undefined,
    tags: searchParams.get('tags')?.split(',') || undefined,
    sortBy: searchParams.get('sortBy') || 'updatedAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '10', 10),
  };
  return portfolioFiltersSchema.safeParse(rawFilters);
}

function applyPortfolioFilters(
  portfolios: Portfolio[],
  filters: z.infer<typeof portfolioFiltersSchema>
) {
  let filtered = [...portfolios];
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
    );
  }
  if (filters.tags?.length) {
    filtered = filtered.filter((p) => filters.tags?.every((tag) => p.tags.includes(tag)));
  }
  return filtered;
}

function sortPortfolios(portfolios: Portfolio[], sortBy: string, sortOrder: string) {
  return [...portfolios].sort((a, b) => {
    const aValue = a[sortBy as keyof Portfolio] as string | number;
    const bValue = b[sortBy as keyof Portfolio] as string | number;
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : 1;
    }
    return aValue > bValue ? -1 : 1;
  });
}

// --- API Route Handlers ---

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const validation = parsePortfolioFilters(request.nextUrl.searchParams);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid filters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const filters = validation.data;
    const userPortfolios = portfolios.filter((p) => p.userId === userId);
    const filteredPortfolios = applyPortfolioFilters(userPortfolios, filters);
    const sortedPortfolios = sortPortfolios(filteredPortfolios, filters.sortBy, filters.sortOrder);

    const startIndex = (filters.page - 1) * filters.limit;
    const paginatedPortfolios = sortedPortfolios.slice(startIndex, startIndex + filters.limit);

    return NextResponse.json(paginatedPortfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = portfolioCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newPortfolio: Portfolio = {
      id: `portfolio-${nextId++}`,
      userId,
      ...validation.data,
      layout: 'grid',
      tags: [],
      createdAt: now,
      updatedAt: now,
      stats: { views: 0, likes: 0, comments: 0, shares: 0, lastViewed: '' },
      projects: [],
      isPublished: false,
      visibility: 'private',
      url: validation.data.title.toLowerCase().replace(/\s+/g, '-'),
      theme: 'light',
      customCss: '',
      seoTitle: validation.data.title,
      seoDescription: validation.data.description,
      socialImage: '',
    } as Portfolio;

    portfolios.push(newPortfolio);
    return NextResponse.json(newPortfolio, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
