import { type NextRequest, NextResponse } from 'next/server';
import {
  type ATSAnalysisParams,
  atsCompatibilityService,
} from '@/services/atsCompatibilityService';

export async function POST(request: NextRequest) {
  try {
    const params: ATSAnalysisParams = await request.json();

    // Validate required fields
    if (!params.resumeText || params.resumeText.trim().length === 0) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    // Perform ATS compatibility analysis
    const result = await atsCompatibilityService.analyzeATSCompatibility(params);

    // Log analysis for monitoring (remove in production)
    console.log(
      `ATS Analysis completed - Score: ${result.overallScore}, Suggestions: ${result.suggestions.length}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('ATS analysis error:', error);

    return NextResponse.json(
      {
        error: 'ATS analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'ATS Compatibility Scanner API',
    version: '1.0.0',
    endpoints: {
      'POST /api/resume-optimizer/ats-scan': 'Analyze ATS compatibility',
    },
    supportedFeatures: [
      'Real-time formatting analysis',
      'Keyword density optimization',
      'Structure compliance checking',
      'Industry-specific recommendations',
      'Risk factor identification',
      'Optimization suggestions',
    ],
  });
}
