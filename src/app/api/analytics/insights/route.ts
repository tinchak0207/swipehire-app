/**
 * Analytics Insights API Endpoint
 *
 * RESTful API for AI-powered insights, predictions, and recommendations
 * with real-time analysis and personalization
 */

import { type NextRequest, NextResponse } from 'next/server';
import type {
  AIInsight,
  AnalyticsAPIResponse,
  ImprovementPrediction,
  OptimizationSession,
  ResumeAnalysisSnapshot,
} from '@/lib/types/analytics';
import { resumeAnalyticsService } from '@/services/resumeAnalyticsService';

/**
 * GET /api/analytics/insights
 * Retrieve AI-powered insights for user or sessions
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('userId') || undefined;
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const minConfidence = parseFloat(searchParams.get('minConfidence') || '0.5');

    // Mock sessions data (in real implementation, this would come from database)
    const mockSessions: OptimizationSession[] = [
      {
        id: 'session_1',
        userId: userId || 'user_1',
        resumeId: 'resume_1',
        sessionStart: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sessionEnd: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        beforeAnalysis: {
          overallScore: 65,
          atsScore: 70,
          keywordScore: 60,
          grammarScore: 85,
          formatScore: 75,
          quantitativeScore: 45,
          strengthsCount: 3,
          weaknessesCount: 5,
          suggestionsCount: 8,
          wordCount: 350,
          sectionCount: 5,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        afterAnalysis: {
          overallScore: 85,
          atsScore: 90,
          keywordScore: 88,
          grammarScore: 90,
          formatScore: 85,
          quantitativeScore: 78,
          strengthsCount: 6,
          weaknessesCount: 2,
          suggestionsCount: 3,
          wordCount: 420,
          sectionCount: 6,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        suggestionsApplied: 6,
        suggestionsTotal: 8,
        improvementScore: 20,
        timeSpent: 3600,
        targetRole: 'Software Engineer',
        targetIndustry: 'technology',
        sessionType: 'ai_assisted',
        status: 'completed',
      },
    ];

    // Filter sessions by user if specified
    const filteredSessions = userId
      ? mockSessions.filter((s) => s.userId === userId)
      : mockSessions;

    // Generate insights
    const insights = await resumeAnalyticsService.generateAIInsights(filteredSessions);

    // Filter insights by category and confidence
    let filteredInsights = insights.filter((insight) => insight.confidence >= minConfidence);

    if (category) {
      filteredInsights = filteredInsights.filter((insight) => insight.type === category);
    }

    // Apply limit
    const limitedInsights = filteredInsights.slice(0, limit);

    const response: AnalyticsAPIResponse<AIInsight[]> = {
      success: true,
      data: limitedInsights,
      metadata: {
        total: filteredInsights.length,
        page: 1,
        limit,
        filters: { dateRange: { start: '', end: '' } },
        processingTime: Date.now() - startTime,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Insights retrieval error:', error);

    const response: AnalyticsAPIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve insights',
      metadata: {
        total: 0,
        page: 1,
        limit: 10,
        filters: { dateRange: { start: '', end: '' } },
        processingTime: Date.now() - startTime,
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/analytics/insights/predict
 * Generate improvement predictions for current session
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.currentAnalysis || !body.targetRole || !body.targetIndustry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: currentAnalysis, targetRole, targetIndustry',
        },
        { status: 400 }
      );
    }

    const currentAnalysis: ResumeAnalysisSnapshot = body.currentAnalysis;
    const targetRole: string = body.targetRole;
    const targetIndustry: string = body.targetIndustry;
    const userHistory: OptimizationSession[] = body.userHistory || [];

    // Generate prediction using analytics service
    const prediction = await resumeAnalyticsService.predictImprovement(
      currentAnalysis,
      targetRole,
      targetIndustry,
      userHistory
    );

    const response: AnalyticsAPIResponse<ImprovementPrediction> = {
      success: true,
      data: prediction,
      metadata: {
        total: 1,
        page: 1,
        limit: 1,
        filters: { dateRange: { start: '', end: '' } },
        processingTime: Date.now() - startTime,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Prediction generation error:', error);

    const response: AnalyticsAPIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate prediction',
      metadata: {
        total: 0,
        page: 1,
        limit: 1,
        filters: { dateRange: { start: '', end: '' } },
        processingTime: Date.now() - startTime,
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
