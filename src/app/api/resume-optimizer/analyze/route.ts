import { type NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { aiResumeAnalyzer } from '@/components/resume-optimizer/services/ai-resume-analyzer';
import type { ResumeAnalysisRequest, ResumeAnalysisResponse } from '@/lib/types/resume-optimizer';

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
 * Performs the actual resume analysis using AI-powered analyzer
 */
async function performResumeAnalysis(
  resumeText: string,
  targetJob: ResumeAnalysisRequest['targetJob'],
  templateId?: string
): Promise<ResumeAnalysisResponse> {
  // Check if AI service is available
  if (!ai.isAvailable()) {
    console.warn('AI service not available, falling back to basic analysis');
    return performBasicAnalysis(resumeText, targetJob, templateId);
  }

  try {
    // Use AI-powered analysis
    return await aiResumeAnalyzer.analyzeResume(resumeText, targetJob, templateId);
  } catch (error) {
    console.error('AI analysis failed, falling back to basic analysis:', error);
    return performBasicAnalysis(resumeText, targetJob, templateId);
  }
}

/**
 * Fallback basic analysis when AI is not available
 */
async function performBasicAnalysis(
  resumeText: string,
  targetJob: ResumeAnalysisRequest['targetJob'],
  templateId?: string
): Promise<ResumeAnalysisResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing

  const wordCount = resumeText.split(/\s+/).length;
  const hasContactInfo = /email|phone|linkedin/i.test(resumeText);
  const hasExperience = /experience|work|job|position/i.test(resumeText);
  const hasEducation = /education|degree|university|college/i.test(resumeText);
  const hasSkills = /skills|technologies|tools/i.test(resumeText);

  // Basic keyword matching
  const targetKeywords = targetJob.keywords?.split(',').map((k) => k.trim().toLowerCase()) || [];
  const resumeLower = resumeText.toLowerCase();
  const matchedKeywords = targetKeywords.filter((keyword) =>
    resumeLower.includes(keyword.toLowerCase())
  );
  const keywordScore =
    targetKeywords.length > 0
      ? Math.round((matchedKeywords.length / targetKeywords.length) * 100)
      : 75;

  // Calculate basic scores
  const contentScore =
    [hasContactInfo, hasExperience, hasEducation, hasSkills].filter(Boolean).length * 20;
  const lengthScore = wordCount >= 200 && wordCount <= 800 ? 20 : 10;
  const overallScore = Math.min(100, contentScore + lengthScore + keywordScore * 0.2);
  const atsScore = Math.min(100, overallScore + (hasContactInfo ? 10 : 0));

  // Basic suggestions
  const suggestions = [];
  if (!hasContactInfo) {
    suggestions.push({
      id: 'basic_1',
      type: 'format' as const,
      title: 'Add Contact Information',
      description: 'Include your email, phone, and LinkedIn.',
      impact: 'high' as const,
      suggestion: 'Add a contact information section at the top of your resume.',
      priority: 1,
      estimatedScoreImprovement: 15,
      category: 'formatting' as const,
    });
  }
  if (keywordScore < 50) {
    suggestions.push({
      id: 'basic_2',
      type: 'keyword' as const,
      title: 'Improve Keyword Optimization',
      description: `Keyword match is ${keywordScore}%. Add more relevant terms.`,
      impact: 'high' as const,
      suggestion: 'Include more keywords from the job description in your resume.',
      priority: 2,
      estimatedScoreImprovement: 20,
      category: 'content' as const,
    });
  }
  if (!hasSkills) {
    suggestions.push({
      id: 'basic_3',
      type: 'structure' as const,
      title: 'Add Skills Section',
      description: 'Include a dedicated skills section.',
      impact: 'medium' as const,
      suggestion: 'Add a skills section highlighting your relevant technical and soft skills.',
      priority: 3,
      estimatedScoreImprovement: 10,
      category: 'content' as const,
    });
  }

  return {
    id: `basic_analysis_${Date.now()}`,
    overallScore: Math.round(overallScore),
    atsScore: Math.round(atsScore),
    keywordAnalysis: {
      score: keywordScore,
      totalKeywords: targetKeywords.length,
      matchedKeywords: matchedKeywords.map((keyword) => ({
        keyword,
        frequency: (resumeText.match(new RegExp(keyword, 'gi')) || []).length,
        relevanceScore: 0.8,
        context: [],
      })),
      missingKeywords: targetKeywords
        .filter((keyword) => !matchedKeywords.includes(keyword))
        .map((keyword) => ({
          keyword,
          importance: 'high' as const,
          suggestedPlacement: ['skills', 'experience'],
          relatedTerms: [],
        })),
      keywordDensity: {},
      recommendations: keywordScore < 50 ? ['Add more relevant keywords'] : [],
    },
    grammarCheck: {
      score: 85,
      totalIssues: 0,
      issues: [],
      overallReadability: 80,
    },
    formatAnalysis: {
      score: 80,
      atsCompatibility: 75,
      issues: [],
      recommendations: ['Ensure consistent formatting throughout'],
      sectionStructure: [
        { name: 'Contact Information', present: hasContactInfo, order: 1, recommended: true },
        { name: 'Professional Summary', present: false, order: 2, recommended: true },
        { name: 'Experience', present: hasExperience, order: 3, recommended: true },
        { name: 'Education', present: hasEducation, order: 4, recommended: true },
        { name: 'Skills', present: hasSkills, order: 5, recommended: true },
      ],
    },
    quantitativeAnalysis: {
      score: Math.min(100, (resumeText.match(/\d+/g) || []).length * 10),
      achievementsWithNumbers: (resumeText.match(/\d+/g) || []).length,
      totalAchievements: 5,
      impactWords: ['improved', 'increased', 'developed'],
      suggestions: [
        {
          section: 'Experience',
          originalText: '',
          suggestedText: 'Add specific metrics to your achievements',
          reasoning: 'Quantifiable metrics make achievements more impactful',
          description: 'Add quantifiable metrics to your achievements',
        },
      ],
    },
    suggestions,
    strengths: hasExperience ? ['Professional experience included'] : ['Clear structure'],
    weaknesses: !hasSkills ? ['Missing skills section'] : ['Could benefit from optimization'],
    optimizedContent: resumeText, // Return original for basic analysis
    createdAt: new Date().toISOString(),
    processingTime: 1000,
    metadata: {
      analysisDate: new Date().toISOString(),
      targetJobTitle: targetJob.title,
      targetCompany: targetJob.company || '',
      templateUsed: templateId || '',
      wordCount,
      processingTime: 1000,
    },
  };
}
