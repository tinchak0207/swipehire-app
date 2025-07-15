import { type NextRequest, NextResponse } from 'next/server';
import type {
  MatchedKeyword,
  ResumeAnalysisRequest,
  ResumeAnalysisResponse,
  OptimizationSuggestion,
} from '@/lib/types/resume-optimizer';

// --- Helper Functions for Analysis ---

function checkContent(resumeText: string) {
  return {
    hasContactInfo: /email|phone|linkedin/i.test(resumeText),
    hasExperience: /experience|work|job|position/i.test(resumeText),
    hasEducation: /education|degree|university|college/i.test(resumeText),
    hasSkills: /skills|technologies|tools/i.test(resumeText),
    wordCount: resumeText.split(/\s+/).length,
  };
}

function calculateKeywordMatch(resumeText: string, targetJob: ResumeAnalysisRequest['targetJob']) {
  const targetKeywords = targetJob.keywords?.split(',').map((k) => k.trim().toLowerCase()) || [];
  if (targetKeywords.length === 0) {
    return { matchedKeywords: [], keywordMatchScore: 75, missingKeywords: [] };
  }

  const resumeWords = resumeText.toLowerCase().split(/\s+/);
  const matchedKeywords: MatchedKeyword[] = targetKeywords
    .filter((keyword) => resumeWords.some((word) => word.includes(keyword)))
    .map((keyword) => ({
      keyword,
      frequency: resumeWords.filter((word) => word.includes(keyword)).length,
      relevanceScore: 1.0,
      context: [],
    }));

  const missingKeywords = targetKeywords
    .filter((keyword) => !matchedKeywords.some((mk) => mk.keyword === keyword))
    .map((keyword) => ({
      keyword,
      importance: 'high' as const,
      suggestedPlacement: ['summary', 'skills'],
      relatedTerms: [],
    }));

  const keywordMatchScore = (matchedKeywords.length / targetKeywords.length) * 100;
  return { matchedKeywords, keywordMatchScore, missingKeywords };
}

function calculateOverallScore(
  contentCheck: ReturnType<typeof checkContent>,
  keywordMatchScore: number
) {
  const scoringFactors = [
    { condition: contentCheck.hasContactInfo, weight: 15 },
    { condition: contentCheck.hasExperience, weight: 25 },
    { condition: contentCheck.hasEducation, weight: 15 },
    { condition: contentCheck.hasSkills, weight: 20 },
    { condition: contentCheck.wordCount >= 200 && contentCheck.wordCount <= 800, weight: 10 },
    { condition: keywordMatchScore >= 50, weight: 15 },
  ];
  return scoringFactors.reduce(
    (score, factor) => score + (factor.condition ? factor.weight : 0),
    0
  );
}

function generateSuggestions(
  contentCheck: ReturnType<typeof checkContent>,
  keywordMatchScore: number
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  if (!contentCheck.hasContactInfo) {
    suggestions.push({
      id: 's1',
      type: 'format',
      title: 'Add Contact Information',
      description: 'Include your email, phone, and LinkedIn.',
      impact: 'high',
      suggestion: 'Add a contact information section at the top of your resume with your email, phone number, and LinkedIn profile URL.',
      priority: 1,
      estimatedScoreImprovement: 15,
    });
  }
  if (!contentCheck.hasExperience) {
    suggestions.push({
      id: 's2',
      type: 'structure',
      title: 'Add Professional Experience',
      description: 'Include your work history.',
      impact: 'high',
      suggestion: 'Add a professional experience section with your previous job titles, companies, dates, and key achievements.',
      priority: 1,
      estimatedScoreImprovement: 25,
    });
  }
  if (keywordMatchScore < 50) {
    suggestions.push({
      id: 's3',
      type: 'keyword',
      title: 'Improve Keyword Optimization',
      description: `Match is ${Math.round(keywordMatchScore)}%. Add more relevant terms.`,
      impact: 'high',
      suggestion: 'Include more keywords from the job description in your resume to improve ATS matching.',
      priority: 2,
      estimatedScoreImprovement: 20,
    });
  }
  if (contentCheck.wordCount < 200) {
    suggestions.push({
      id: 's4',
      type: 'structure',
      title: 'Expand Resume Content',
      description: 'Resume is too short. Add more detail.',
      impact: 'medium',
      suggestion: 'Add more detail to your experience descriptions, including specific achievements and quantifiable results.',
      priority: 3,
      estimatedScoreImprovement: 10,
    });
  }
  if (contentCheck.wordCount > 800) {
    suggestions.push({
      id: 's5',
      type: 'format',
      title: 'Reduce Resume Length',
      description: 'Resume is too long. Condense to 1-2 pages.',
      impact: 'medium',
      suggestion: 'Condense your resume to 1-2 pages by removing less relevant information and focusing on your most impactful achievements.',
      priority: 3,
      estimatedScoreImprovement: 5,
    });
  }
  if (!contentCheck.hasSkills) {
    suggestions.push({
      id: 's6',
      type: 'structure',
      title: 'Add Skills Section',
      description: 'Include a dedicated skills section.',
      impact: 'medium',
      suggestion: 'Add a skills section highlighting your technical and soft skills relevant to the position.',
      priority: 2,
      estimatedScoreImprovement: 10,
    });
  }
  suggestions.push({
    id: 's7',
    type: 'achievement',
    title: 'Use Action Verbs',
    description: 'Start bullet points with strong action verbs.',
    impact: 'medium',
    suggestion: 'Begin each bullet point with strong action verbs like "Led", "Developed", "Implemented", "Improved", etc.',
    priority: 3,
    estimatedScoreImprovement: 5,
  });
  suggestions.push({
    id: 's8',
    type: 'achievement',
    title: 'Quantify Achievements',
    description: 'Include numbers and metrics.',
    impact: 'high',
    suggestion: 'Add specific numbers, percentages, and metrics to demonstrate the impact of your work.',
    priority: 2,
    estimatedScoreImprovement: 15,
  });
  return suggestions;
}

/**
 * POST /api/resume-optimizer/analyze
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ResumeAnalysisRequest = await request.json();
    if (!body.resumeText || !body.targetJob?.title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const analysisResult = await performResumeAnalysis(
      body.resumeText,
      body.targetJob,
      body.templateId
    );
    return NextResponse.json({ success: true, data: analysisResult });
  } catch (error) {
    console.error('Resume analysis error:', error);
    const message = error instanceof Error ? error.message : 'Failed to analyze resume';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * Performs the actual resume analysis (mock implementation)
 */
async function performResumeAnalysis(
  resumeText: string,
  targetJob: ResumeAnalysisRequest['targetJob'],
  templateId?: string
): Promise<ResumeAnalysisResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate processing

  const contentCheck = checkContent(resumeText);
  const { matchedKeywords, keywordMatchScore, missingKeywords } = calculateKeywordMatch(
    resumeText,
    targetJob
  );
  const overallScore = calculateOverallScore(contentCheck, keywordMatchScore);
  const suggestions = generateSuggestions(contentCheck, keywordMatchScore);
  const atsScore = Math.min(
    100,
    overallScore + (contentCheck.hasContactInfo ? 10 : 0) + keywordMatchScore * 0.3
  );

  const response: ResumeAnalysisResponse = {
    id: `analysis_${Date.now()}`,
    overallScore: Math.round(overallScore),
    atsScore: Math.round(atsScore),
    suggestions,
    keywordAnalysis: {
      score: Math.round(keywordMatchScore),
      totalKeywords: targetJob.keywords?.split(',').length || 0,
      matchedKeywords,
      missingKeywords,
      recommendations: keywordMatchScore < 50 ? ['Add more keywords'] : [],
      keywordDensity: {},
    },
    strengths: ['Well-structured professional experience'],
    weaknesses: ['Lacks a dedicated skills section'],
    optimizedContent: '[Optimized version of the resume based on suggestions...]',
    grammarCheck: { score: 0, totalIssues: 0, issues: [], overallReadability: 85 },
    formatAnalysis: { score: 0, atsCompatibility: 80, issues: [], recommendations: [], sectionStructure: [] },
    quantitativeAnalysis: {
      score: 0,
      achievementsWithNumbers: 0,
      totalAchievements: 0,
      suggestions: [],
      impactWords: [],
    },
    createdAt: new Date().toISOString(),
    processingTime: 1500,
    metadata: {
      analysisDate: new Date().toISOString(),
      targetJobTitle: targetJob.title,
      ...(targetJob.company && { targetCompany: targetJob.company }),
      ...(templateId && { templateUsed: templateId }),
      wordCount: contentCheck.wordCount,
      processingTime: 1500,
    },
  };
  return response;
}
