/**
 * Analytics Dashboard API Endpoint
 *
 * RESTful API for retrieving comprehensive analytics dashboard data
 * with filtering, caching, and real-time capabilities
 */

import { type NextRequest, NextResponse } from 'next/server';
import type {
  AnalyticsAPIResponse,
  AnalyticsDashboardData,
  AnalyticsFilter,
} from '@/lib/types/analytics';
import { resumeAnalyticsService } from '@/services/resumeAnalyticsService';

/**
 * GET /api/analytics/dashboard
 * Retrieve comprehensive dashboard analytics data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const userId = searchParams.get('userId') || undefined;
    const timeRange = searchParams.get('timeRange') || 'month';
    const industries = searchParams.get('industries')?.split(',') || [];
    const roles = searchParams.get('roles')?.split(',') || [];
    const experienceLevels = searchParams.get('experienceLevels')?.split(',') || [];
    const sessionTypes = (searchParams.get('sessionTypes')?.split(',') as any[]) || [];
    const onlyCompleted = searchParams.get('onlyCompleted') === 'true';
    const minImprovementScore = searchParams.get('minImprovementScore')
      ? parseInt(searchParams.get('minImprovementScore') ?? '0')
      : undefined;

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Override with custom date range if provided
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');

    const filters: AnalyticsFilter = {
      dateRange: {
        start: customStart || startDate.toISOString(),
        end: customEnd || now.toISOString(),
      },
      industries,
      roles,
      experienceLevels,
      sessionTypes,
      onlyCompleted,
      ...(minImprovementScore !== undefined && { minImprovementScore }),
    };

    // Get dashboard data
    const dashboardData = await resumeAnalyticsService.getDashboardAnalytics(userId, filters);

    const processingTime = Date.now() - startTime;

    const response: AnalyticsAPIResponse<AnalyticsDashboardData> = {
      success: true,
      data: dashboardData,
      metadata: {
        total: dashboardData.recentSessions.length,
        page: 1,
        limit: 10,
        filters,
        processingTime,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dashboard analytics API error:', error);

    const response: AnalyticsAPIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve dashboard analytics',
      metadata: {
        total: 0,
        page: 1,
        limit: 10,
        filters: {
          dateRange: {
            start: new Date().toISOString(),
            end: new Date().toISOString(),
          },
        },
        processingTime: Date.now() - startTime,
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/analytics/dashboard
 * Create or update dashboard configuration
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Here you would typically save dashboard configuration to a database
    // For now, we'll just return a success response

    const response: AnalyticsAPIResponse = {
      success: true,
      data: {
        message: 'Dashboard configuration updated successfully',
        userId: body.userId,
        configuration: body.configuration || {},
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dashboard configuration update error:', error);

    const response: AnalyticsAPIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update dashboard configuration',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
