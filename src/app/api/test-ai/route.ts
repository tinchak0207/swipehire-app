/**
 * API Route to test Mistral AI integration
 * GET /api/test-ai - Test basic AI functionality
 */

import { type NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import aiService from '@/services/enhancedAIService';

export async function GET(_request: NextRequest) {
  try {
    // Check if AI service is available
    const isAvailable = aiService.isAIServiceAvailable();

    if (!isAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service not available - MISTRAL_API_KEY not configured',
          solution: 'Add MISTRAL_API_KEY to your environment variables',
        },
        { status: 500 }
      );
    }

    // Test basic generation
    const testResponse = await ai.generate({
      prompt: 'Respond with "AI service is working correctly!" and nothing else.',
      model: 'mistral-small',
      temperature: 0.1,
      maxTokens: 50,
    });

    // Test profile recommendation with minimal data
    const profileTest = await aiService.recommendProfile({
      candidateProfile: {
        id: 'test-123',
        role: 'Developer',
        experienceSummary: 'Software developer with React experience',
        skills: ['React', 'JavaScript'],
      },
      jobCriteria: {
        title: 'Frontend Developer',
        description: 'React developer position',
        requiredSkills: ['React'],
        companyIndustry: 'Technology',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mistral AI integration is working correctly!',
      tests: {
        basicGeneration: {
          response: testResponse.text,
          model: testResponse.model,
          usage: testResponse.usage,
        },
        profileRecommendation: {
          candidateId: profileTest.candidateId,
          matchScore: profileTest.matchScore,
          hasReasoning: !!profileTest.reasoning,
        },
        availableModels: aiService.getAvailableModels(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Test Error:', error);

    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      if (error.message.includes('MISTRAL_API_KEY')) {
        statusCode = 401;
      } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
        statusCode = 401;
        errorMessage = 'Invalid API key';
      } else if (error.message.includes('429')) {
        statusCode = 429;
        errorMessage = 'Rate limit exceeded';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model = 'mistral-small' } = body;

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt is required',
        },
        { status: 400 }
      );
    }

    const response = await ai.generate({
      prompt,
      model: model,
      temperature: 0.7,
      maxTokens: 500,
    });

    return NextResponse.json({
      success: true,
      response: response.text,
      model: response.model,
      usage: response.usage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Generation Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
