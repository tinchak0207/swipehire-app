/**
 * Individual Portfolio API Routes - Backend Integration
 *
 * Implements GET, PUT, and DELETE operations for individual portfolios
 * with backend integration for persistent storage.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import API_CONFIG from '@/config/api';

// --- Zod Schemas ---

const portfolioUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  projects: z.array(z.any()).optional(),
  layout: z.enum(['grid', 'list', 'carousel', 'masonry']).optional(),
  tags: z.array(z.string()).max(10, 'Too many tags').optional(),
  isPublished: z.boolean().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
  theme: z.string().optional(),
  customCss: z.string().max(10000, 'Custom CSS too long').optional(),
  seoTitle: z.string().max(60, 'SEO title too long').optional(),
  seoDescription: z.string().max(160, 'SEO description too long').optional(),
  socialImage: z.string().url('Invalid social image URL').optional().or(z.literal(''))
});

// --- Helper Functions ---

async function getAuthenticatedUser(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    // For testing purposes, return a valid ObjectId format
    return '507f1f77bcf86cd799439011';
  }
  
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

// --- API Route Handlers ---

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUser(request);
    const { searchParams } = request.nextUrl;
    const incrementViews = searchParams.get('incrementViews') === 'true';

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (incrementViews) {
      queryParams.append('incrementViews', 'true');
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/portfolios/${id}${queryString ? `?${queryString}` : ''}`;

    const response = await makeBackendRequest(endpoint, { method: 'GET' }, userId || undefined);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        message: errorData.message || 'Portfolio not found'
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUser(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    const body = await request.json();
    const validation = portfolioUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid data',
        errors: validation.error.errors
      }, { status: 400 });
    }

    const response = await makeBackendRequest(
      `/api/portfolios/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(validation.data)
      },
      userId
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        message: errorData.message || 'Failed to update portfolio'
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUser(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    const response = await makeBackendRequest(
      `/api/portfolios/${id}`,
      { method: 'DELETE' },
      userId
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        message: errorData.message || 'Failed to delete portfolio'
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
