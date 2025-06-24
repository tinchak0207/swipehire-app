import { NextRequest, NextResponse } from 'next/server';
import type {
  ApiResponse,
  ResumeAnalysisRequest,
  ResumeAnalysisResponse,
} from '@/lib/types/resume-optimizer';

/**
 * POST /api/resume-optimizer/reanalyze
 * Re-analyzes a resume with updated content or different target job
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { resumeText, originalAnalysisId, targetJob } = body;

    // Validate required fields
    if (!resumeText || !targetJob) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resume text and target job information are required',
          timestamp: new Date().toISOString()
        } as ApiResponse<never>,
        { status: 400 }
      );
    }

    if (!targetJob.title) {
      return NextResponse.json(
        {
          success: false,
          error: 'Target job title is required',
          timestamp: new Date().toISOString()
        } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // Perform re-analysis
    const analysisResult = await performResumeReanalysis(resumeText, targetJob, originalAnalysisId);

    const response: ApiResponse<ResumeAnalysisResponse> = {
      success: true,
      data: analysisResult,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Resume re-analysis error:', error);

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to re-analyze resume',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * Performs resume re-analysis
 */
async function performResumeReanalysis(
  resumeText: string,
  targetJob: ResumeAnalysisRequest['targetJob'],
  templateId?: string
): Promise<ResumeAnalysisResponse> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock re-analysis logic - similar to original analysis but with improvements
  const wordCount = resumeText.split(/\s+/).length;
  const hasContactInfo = /email|phone|linkedin/i.test(resumeText);
  const hasExperience = /experience|work|job|position/i.test(resumeText);
  const hasEducation = /education|degree|university|college/i.test(resumeText);
  const hasSkills = /skills|technologies|tools/i.test(resumeText);
  const hasSummary = /summary|objective|profile/i.test(resumeText);

  // Calculate keyword match score
  const targetKeywords = targetJob.keywords ? targetJob.keywords.split(',').map(k => k.trim().toLowerCase()) : [];
  const resumeWords = resumeText.toLowerCase().split(/\s+/);
  const matchedKeywords = targetKeywords
    .filter(keyword => resumeWords.some(word => word.includes(keyword) || keyword.includes(word)))
    .map(keyword => ({
      keyword,
      frequency: resumeWords.filter(w => w.includes(keyword)).length,
      relevanceScore: 1.0,
      context: []
    }));
  const keywordMatchScore = targetKeywords.length > 0 ? (matchedKeywords.length / targetKeywords.length) * 100 : 75;

  // Calculate improved overall score (assuming some improvements were made)
  let overallScore = 0;
  const scoringFactors = [
    { condition: hasContactInfo, weight: 15, name: 'Contact Information' },
    { condition: hasExperience, weight: 25, name: 'Professional Experience' },
    { condition: hasEducation, weight: 15, name: 'Education' },
    { condition: hasSkills, weight: 20, name: 'Skills Section' },
    { condition: hasSummary, weight: 10, name: 'Professional Summary' },
    { condition: wordCount >= 200 && wordCount <= 800, weight: 10, name: 'Appropriate Length' },
    { condition: keywordMatchScore >= 50, weight: 15, name: 'Keyword Optimization' },
  ];

  scoringFactors.forEach(factor => {
    if (factor.condition) {
      overallScore += factor.weight;
    }
  });

  // Add bonus points for re-analysis (assuming improvements)
  overallScore = Math.min(100, overallScore + 5);

  // Generate updated suggestions
  const suggestions = [];
  
  if (!hasContactInfo) {
    suggestions.push({
      id: `contact-${Date.now()}`,
      type: 'ats' as const,
      title: 'Add Contact Information',
      description: 'Include your email, phone number, and LinkedIn profile at the top of your resume.',
      impact: 'high' as const,
      effort: 'low' as const,
      suggestion: 'Add a contact section at the top with your email, phone, and LinkedIn profile URL',
      priority: 1,
      estimatedScoreImprovement: 15,
      beforeText: '',
      afterText: ''
    });
  }

  if (!hasSummary) {
    suggestions.push({
      id: `summary-${Date.now()}`,
      type: 'structure' as const,
      title: 'Add Professional Summary',
      description: 'Include a compelling professional summary that highlights your key qualifications.',
      impact: 'high' as const,
      effort: 'medium' as const,
      suggestion: 'Add a 3-4 sentence professional summary highlighting your key skills and experience',
      priority: 2,
      estimatedScoreImprovement: 10,
      beforeText: '',
      afterText: ''
    });
  }

  if (keywordMatchScore < 70) {
    suggestions.push({
      id: `keywords-${Date.now()}`,
      type: 'keyword' as const,
      title: 'Improve Keyword Optimization',
      description: `Your resume matches ${Math.round(keywordMatchScore)}% of target keywords. Consider incorporating more relevant terms naturally.`,
      impact: 'high' as const,
      effort: 'medium' as const,
      suggestion: `Add these keywords naturally throughout your resume: ${targetKeywords.join(', ')}`,
      priority: 3,
      estimatedScoreImprovement: Math.round((70 - keywordMatchScore) * 0.5),
      beforeText: '',
      afterText: ''
    });
  }

  // Add advanced suggestions for re-analysis
  suggestions.push({
    id: `ats-${Date.now()}`,
    type: 'ats' as const,
    title: 'Optimize for ATS Scanning',
    description: 'Use standard section headings and avoid complex formatting that might confuse ATS systems.',
    impact: 'medium' as const,
    effort: 'low' as const,
    suggestion: 'Use standard section headings like "Experience", "Education", "Skills"',
    priority: 4,
    estimatedScoreImprovement: 5,
    beforeText: '',
    afterText: ''
  });

  suggestions.push({
    id: `tailor-${Date.now()}`,
    type: 'achievement' as const,
    title: 'Tailor Content to Role',
    description: 'Emphasize experiences and skills most relevant to the target position.',
    impact: 'high' as const,
    effort: 'medium' as const,
    suggestion: 'Highlight experiences and achievements that directly relate to the target job',
    priority: 5,
    estimatedScoreImprovement: 10,
    beforeText: '',
    afterText: ''
  });

  // Calculate improved ATS compatibility score
  const atsScore = Math.min(100, overallScore + (hasContactInfo ? 10 : 0) + (keywordMatchScore * 0.3));

  const createdAt = new Date().toISOString();
  const grammarCheck = {
    score: 85,
    totalIssues: 3,
    issues: [],
    overallReadability: 90
  };
  
  const formatAnalysis = {
    score: 90,
    atsCompatibility: 85,
    issues: [],
    recommendations: [],
    sectionStructure: []
  };

  const quantitativeAnalysis = {
    score: 80,
    achievementsWithNumbers: 5,
    totalAchievements: 10,
    suggestions: [],
    impactWords: [] 
  };

  const analysisResult: ResumeAnalysisResponse = {
    id: `reanalysis_${Date.now()}`,
    overallScore: Math.round(overallScore),
    atsScore: Math.round(atsScore),
    grammarCheck,
    formatAnalysis, 
    quantitativeAnalysis,
    createdAt,
    processingTime: 1500,
    suggestions,
    strengths: [
      ...(hasContactInfo ? ['Clear contact information'] : []),
      ...(hasExperience ? ['Professional experience included'] : []),
      ...(hasEducation ? ['Education background provided'] : []),
      ...(hasSkills ? ['Skills section present'] : []),
      ...(hasSummary ? ['Professional summary included'] : []),
      ...(wordCount >= 200 && wordCount <= 800 ? ['Appropriate resume length'] : []),
      ...(keywordMatchScore >= 70 ? ['Good keyword optimization'] : []),
      'Improved content structure',
      'Better alignment with target role',
    ],
    weaknesses: [
      ...(!hasContactInfo ? ['Missing contact information'] : []),
      ...(!hasSummary ? ['No professional summary'] : []),
      ...(keywordMatchScore < 50 ? ['Needs better keyword optimization'] : []),
      ...(wordCount < 200 ? ['Resume too short'] : []),
      ...(wordCount > 800 ? ['Resume too long'] : []),
    ],
    keywordAnalysis: {
      score: keywordMatchScore,
      totalKeywords: targetKeywords.length,
      matchedKeywords,
      missingKeywords: targetKeywords
        .filter(keyword => !matchedKeywords.some(mk => mk.keyword === keyword))
        .map(keyword => ({
          keyword,
          importance: 'medium' as const,
          suggestedPlacement: [],
          relatedTerms: []
        })),
      keywordDensity: {},
      recommendations: []
    },
    sectionAnalysis: {
      contact: {
        present: hasContactInfo,
        score: hasContactInfo ? 95 : 0,
        suggestions: hasContactInfo ? ['Consider adding portfolio URL'] : ['Add email, phone, and LinkedIn profile'],
      },
      summary: {
        present: hasSummary,
        score: hasSummary ? 85 : 40,
        suggestions: hasSummary 
          ? ['Tailor summary to target role', 'Include key achievements'] 
          : ['Add a compelling professional summary'],
      },
      experience: {
        present: hasExperience,
        score: hasExperience ? 90 : 0,
        suggestions: hasExperience 
          ? ['Use more specific metrics', 'Highlight relevant achievements'] 
          : ['Add professional experience section'],
      },
      education: {
        present: hasEducation,
        score: hasEducation ? 85 : 60,
        suggestions: hasEducation 
          ? ['Include relevant coursework if recent graduate'] 
          : ['Add education background'],
      },
      skills: {
        present: hasSkills,
        score: hasSkills ? 90 : 30,
        suggestions: hasSkills 
          ? ['Prioritize skills relevant to target role', 'Include proficiency levels'] 
          : ['Add comprehensive skills section'],
      },
    },
    optimizedContent: generateOptimizedContent(resumeText, targetJob, suggestions),
    metadata: {
      analysisDate: new Date().toISOString(),
      targetJobTitle: targetJob.title,
      ...(targetJob.company ? { targetCompany: targetJob.company } : {}),
      ...(templateId ? { templateUsed: templateId } : {}),
      wordCount,
      processingTime: 1500,
    },
  };

  return analysisResult;
}

/**
 * Generates optimized content suggestions for re-analysis
 */
function generateOptimizedContent(
  originalText: string,
  targetJob: ResumeAnalysisRequest['targetJob'],
  suggestions: ResumeAnalysisResponse['suggestions']
): string {
  let optimizedText = originalText;
  
  // Add improvements based on suggestions
  const importantSuggestions = suggestions.filter(s => s.priority <= 3); // Top priority suggestions
  
  // Add professional summary if missing
  if (importantSuggestions.some(s => s.title.includes('Professional Summary'))) {
    const summarySection = `
PROFESSIONAL SUMMARY
Results-driven professional with expertise in ${targetJob.title.toLowerCase()} seeking to contribute to ${targetJob.company || 'your organization'}. Proven track record of delivering high-quality results and driving business success through innovative solutions and collaborative teamwork.

`;
    optimizedText = summarySection + optimizedText;
  }
  
  // Add keyword optimization suggestions
  if (targetJob.keywords) {
    optimizedText += `

[Optimization Note: Consider naturally incorporating these keywords throughout your resume: ${targetJob.keywords}]

[Re-analysis Complete: This version shows improved alignment with the target role and better ATS compatibility.]`;
  }
  
  return optimizedText;
}
