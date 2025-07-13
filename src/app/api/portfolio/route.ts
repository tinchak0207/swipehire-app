/**
 * Portfolio API Routes - Core CRUD Operations
 *
 * Implements the main portfolio endpoints for listing and creating portfolios
 * with proper validation, authentication, and error handling.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Portfolio } from '@/lib/types/portfolio';

// Validation schemas using Zod
const portfolioCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  projects: z.array(
    z.object({
      title: z.string().min(1, 'Project title is required'),
      description: z.string().min(1, 'Project description is required'),
      media: z.array(
        z.object({
          type: z.literal('image'),
          url: z.string().url('Invalid media URL'),
          alt: z.string().optional(),
          poster: z.string().url().optional(),
          duration: z.number().optional(),
          size: z.number().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
        })
      ),
      links: z.array(
        z.object({
          type: z.enum(['github', 'demo', 'behance', 'dribbble', 'linkedin', 'website', 'other']),
          url: z.string().url('Invalid link URL'),
          label: z.string().min(1, 'Link label is required'),
          icon: z.string().optional(),
        })
      ),
      tags: z.array(z.string()),
      order: z.number().int().min(0),
      featured: z.boolean(),
      status: z.enum(['draft', 'published', 'archived']),
    })
  ),
  layout: z.enum(['grid', 'list', 'carousel', 'masonry']),
  theme: z.enum(['light', 'dark', 'auto', 'colorful', 'minimal']),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
  visibility: z.enum(['public', 'private', 'unlisted']),
  url: z
    .string()
    .min(1, 'URL slug is required')
    .regex(/^[a-z0-9-]+$/, 'URL must contain only lowercase letters, numbers, and hyphens'),
  customCss: z.string().optional(),
  customDomain: z.string().url().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  socialImage: z.string().url().optional(),
});

const portfolioFiltersSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  layout: z.enum(['grid', 'list', 'carousel', 'masonry']).optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'views', 'likes']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// Mock database - In production, replace with actual database operations
const portfolios: Portfolio[] = [];
let nextId = 1;

/**
 * Authentication middleware - checks for valid user session
 */
async function authenticateUser(request: NextRequest): Promise<string | null> {
  // TODO: Implement actual authentication logic
  // For now, return a mock user ID
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Mock user ID - replace with actual JWT validation
  return 'user-123';
}

/**
 * Generate unique portfolio URL slug
 */
function generateUniqueUrl(baseUrl: string, userId: string): string {
  const existingUrls = portfolios.filter((p) => p.userId === userId).map((p) => p.url);

  let url = baseUrl;
  let counter = 1;

  while (existingUrls.includes(url)) {
    url = `${baseUrl}-${counter}`;
    counter++;
  }

  return url;
}

/**
 * Create portfolio stats object
 */
function createPortfolioStats(): Portfolio['stats'] {
  const now = new Date().toISOString();
  return {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    lastViewed: now,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * GET /api/portfolio - List user portfolios with filtering and pagination
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const rawFilters = {
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      layout: searchParams.get('layout') || undefined,
      visibility: searchParams.get('visibility') || undefined,
      sortBy: searchParams.get('sortBy') || 'updatedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    // Validate filters
    const validationResult = portfolioFiltersSchema.safeParse(rawFilters);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid filters',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const filters = validationResult.data;

    // Filter portfolios by user
    let userPortfolios = portfolios.filter((p) => p.userId === userId);

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      userPortfolios = userPortfolios.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply tag filter
    if (filters.tags && filters.tags.length > 0) {
      userPortfolios = userPortfolios.filter((p) =>
        filters.tags!.some((tag) => p.tags.includes(tag))
      );
    }

    // Apply layout filter
    if (filters.layout) {
      userPortfolios = userPortfolios.filter((p) => p.layout === filters.layout);
    }

    // Apply visibility filter
    if (filters.visibility) {
      userPortfolios = userPortfolios.filter((p) => p.visibility === filters.visibility);
    }

    // Sort portfolios
    userPortfolios.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof Portfolio] as string | number;
      const bValue = b[filters.sortBy as keyof Portfolio] as string | number;

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

    // Calculate pagination
    const startIndex = (filters.page! - 1) * filters.limit!;
    const endIndex = startIndex + filters.limit!;
    const paginatedPortfolios = userPortfolios.slice(startIndex, endIndex);

    return NextResponse.json(paginatedPortfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/portfolio - Create new portfolio
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validationResult = portfolioCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const portfolioData = validationResult.data;

    // Check if URL is already taken by this user
    const existingPortfolio = portfolios.find(
      (p) => p.userId === userId && p.url === portfolioData.url
    );

    if (existingPortfolio) {
      return NextResponse.json(
        { success: false, error: 'URL slug already exists' },
        { status: 409 }
      );
    }

    // Generate unique URL if needed
    const uniqueUrl = generateUniqueUrl(portfolioData.url, userId);

    // Create new portfolio
    const now = new Date().toISOString();
    const newPortfolio: Portfolio = {
      id: `portfolio-${nextId++}`,
      userId,
      title: portfolioData.title,
      description: portfolioData.description,
      projects: portfolioData.projects.map((project, index) => ({
        id: `project-${Date.now()}-${index}`,
        title: project.title,
        description: project.description,
        media: project.media.map((mediaItem) => {
          if (mediaItem.type === 'image') {
            return {
              type: 'image' as const,
              url: mediaItem.url,
              alt: mediaItem.alt || '',
              ...(mediaItem.width !== undefined && { width: mediaItem.width }),
              ...(mediaItem.height !== undefined && { height: mediaItem.height }),
              ...(mediaItem.size !== undefined && { size: mediaItem.size }),
            };
          }
          if (mediaItem.type === 'video') {
            return {
              type: 'video' as const,
              url: mediaItem.url,
              ...(mediaItem.poster && { poster: mediaItem.poster }),
              ...(mediaItem.duration !== undefined && { duration: mediaItem.duration }),
              ...(mediaItem.size !== undefined && { size: mediaItem.size }),
            };
          }
          return {
            type: 'audio' as const,
            url: mediaItem.url,
            ...(mediaItem.duration !== undefined && { duration: mediaItem.duration }),
            ...(mediaItem.size !== undefined && { size: mediaItem.size }),
          };
        }),
        links: project.links,
        tags: project.tags,
        order: project.order,
        createdAt: now,
        updatedAt: now,
        comments: [],
        likes: 0,
        isPublished: project.status === 'published',
        technologies: [],
        duration: '',
        role: '',
      })),
      layout: portfolioData.layout,
      theme: portfolioData.theme,
      tags: portfolioData.tags,
      createdAt: now,
      updatedAt: now,
      stats: createPortfolioStats(),
      isPublished: portfolioData.isPublished,
      visibility: portfolioData.visibility,
      url: uniqueUrl,
      customCss: portfolioData.customCss || '',
      seoTitle: portfolioData.seoTitle || '',
      seoDescription: portfolioData.seoDescription || '',
      socialImage: portfolioData.socialImage || '',
    };

    // Save to mock database
    portfolios.push(newPortfolio);

    return NextResponse.json(newPortfolio, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
