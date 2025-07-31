import { type NextRequest, NextResponse } from 'next/server';
import { analyzeResumeIntelligence } from '@/services/resumeIntelligenceService';

/**
 * API endpoint for automatic resume intelligence detection
 * Analyzes resume text and returns target job information predictions
 */
export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Resume text is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (resumeText.trim().length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resume text is too short for meaningful analysis',
        },
        { status: 400 }
      );
    }

    // Analyze resume intelligence
    const intelligence = await analyzeResumeIntelligence(resumeText);

    return NextResponse.json({
      success: true,
      data: intelligence,
    });
  } catch (error) {
    console.error('Resume intelligence analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze resume intelligence. Please try again.',
      },
      { status: 500 }
    );
  }
}
