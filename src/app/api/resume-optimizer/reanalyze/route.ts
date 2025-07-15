import { type NextRequest, NextResponse } from 'next/server';
import type {
  MatchedKeyword,
  ResumeAnalysisRequest,
  ResumeAnalysisResponse,
  OptimizationSuggestion,
} from '@/lib/types/resume-optimizer';

// --- Helper Functions for Re-analysis ---

function checkContent(resumeText: string) {
  return {
    hasContactInfo: /email|phone|linkedin/i.test(resumeText),
    hasExperience: /experience|work|job|position/i.test(resumeText),
    hasEducation: /education|degree|university|college/i.test(resumeText),
    hasSkills: /skills|technologies|tools/i.test(resumeText),
    hasSummary: /summary|objective|profile/i.test(resumeText),
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
      frequency: resumeWords.filter((w) => w.includes(keyword)).length,
      relevanceScore: 1.0,
      context: [],
    }));

  const missingKeywords = targetKeywords
    .filter((keyword) => !matchedKeywords.some((mk) => mk.keyword === keyword))
    .map((keyword) => ({
      keyword,
      importance: 'medium' as const,
      suggestedPlacement: [],
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
    { condition: contentCheck.hasSummary, weight: 10 },
    { condition: contentCheck.wordCount >= 200 && contentCheck.wordCount <= 800, weight: 10 },
    { condition: keywordMatchScore >= 50, weight: 15 },
  ];
  const score = scoringFactors.reduce(
    (acc, factor) => acc + (factor.condition ? factor.weight : 0),
    0
  );
  return Math.min(100, score + 5); // Add bonus for re-analysis
}

function generateSuggestions(
  contentCheck: ReturnType<typeof checkContent>,
  keywordMatchScore: number,
  targetKeywords: string[]
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  if (!contentCheck.hasContactInfo) {
    suggestions.push({
      id: 'contact',
      type: 'ats',
      title: 'Add Contact Information',
      description: 'Include email, phone, and LinkedIn.',
      impact: 'high',
      suggestion: 'Add a contact information section at the top of your resume with your email, phone number, and LinkedIn profile URL.',
      priority: 1,
      estimatedScoreImprovement: 15,
    });
  }
  if (!contentCheck.hasSummary) {
    suggestions.push({
      id: 'summary',
      type: 'structure',
      title: 'Add Professional Summary',
      description: 'Add a compelling summary.',
      impact: 'high',
      suggestion: 'Add a professional summary section at the top of your resume that highlights your key qualifications and career objectives.',
      priority: 2,
      estimatedScoreImprovement: 10,
    });
  }
  if (keywordMatchScore < 70) {
    suggestions.push({
      id: 'keywords',
      type: 'keyword',
      title: 'Improve Keyword Optimization',
      description: `Match is ${Math.round(keywordMatchScore)}%. Add more relevant terms.`,
      impact: 'high',
      priority: 3,
      estimatedScoreImprovement: 15,
      suggestion: `Incorporate: ${targetKeywords.join(', ')}`,
    });
  }
  suggestions.push({
    id: 'ats',
    type: 'ats',
    title: 'Optimize for ATS',
    description: 'Use standard headings and formatting.',
    impact: 'medium',
    suggestion: 'Use standard section headings like "Experience", "Education", "Skills" and avoid complex formatting that ATS systems might not parse correctly.',
    priority: 4,
    estimatedScoreImprovement: 5,
  });
  suggestions.push({
    id: 'tailor',
    type: 'achievement',
    title: 'Tailor to Role',
    description: 'Emphasize relevant experience.',
    suggestion: 'Tailor your resume to the specific role by emphasizing the most relevant experience and skills for this position.',
    impact: 'high',
    priority: 5,
    estimatedScoreImprovement: 10,
  });
  return suggestions;
}

/**
 * POST /api/resume-optimizer/reanalyze
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    if (!body.resumeText || !body.targetJob?.title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const analysisResult = await performResumeReanalysis(
      body.resumeText,
      body.targetJob,
      body.originalAnalysisId
    );
    return NextResponse.json({ success: true, data: analysisResult });
  } catch (error) {
    console.error('Resume re-analysis error:', error);
    const message = error instanceof Error ? error.message : 'Failed to re-analyze resume';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * Performs resume re-analysis (mock implementation)
 */
async function performResumeReanalysis(
  resumeText: string,
  targetJob: ResumeAnalysisRequest['targetJob'],
  templateId?: string
): Promise<ResumeAnalysisResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const contentCheck = checkContent(resumeText);
  const { matchedKeywords, keywordMatchScore, missingKeywords } = calculateKeywordMatch(
    resumeText,
    targetJob
  );
  const overallScore = calculateOverallScore(contentCheck, keywordMatchScore);
  const suggestions = generateSuggestions(
    contentCheck,
    keywordMatchScore,
    targetJob.keywords?.split(',') || []
  );
  const atsScore = Math.min(
    100,
    overallScore + (contentCheck.hasContactInfo ? 10 : 0) + keywordMatchScore * 0.3
  );

  const response: ResumeAnalysisResponse = {
    id: `reanalysis_${Date.now()}`,
    overallScore: Math.round(overallScore),
    atsScore: Math.round(atsScore),
    suggestions,
    keywordAnalysis: {
      score: Math.round(keywordMatchScore),
      totalKeywords: targetJob.keywords?.split(',').length || 0,
      matchedKeywords,
      missingKeywords,
      recommendations: [],
      keywordDensity: {},
    },
    strengths: ['Improved content structure', 'Better alignment with target role'],
    weaknesses: ['Needs better keyword optimization'],
    optimizedContent: '[Optimized version based on re-analysis...]',
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
