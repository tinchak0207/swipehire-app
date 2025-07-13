import { type NextRequest, NextResponse } from 'next/server';
import type {
  ApiResponse,
  MatchedKeyword,
  ResumeAnalysisRequest,
  ResumeAnalysisResponse,
} from '@/lib/types/resume-optimizer';

/**
 * POST /api/resume-optimizer/analyze
 * Analyzes a resume using AI and provides optimization suggestions
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ResumeAnalysisRequest = await request.json();
    const { resumeText, targetJob, templateId } = body;

    // Validate required fields
    if (!resumeText || !targetJob) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resume text and target job information are required',
          timestamp: new Date().toISOString(),
        } as ApiResponse<never>,
        { status: 400 }
      );
    }

    if (!targetJob.title) {
      return NextResponse.json(
        {
          success: false,
          error: 'Target job title is required',
          timestamp: new Date().toISOString(),
        } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // Simulate AI analysis (replace with actual AI service call)
    const analysisResult = await performResumeAnalysis(resumeText, targetJob, templateId);

    const response: ApiResponse<ResumeAnalysisResponse> = {
      success: true,
      data: analysisResult,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Resume analysis error:', error);

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze resume',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * Performs the actual resume analysis
 * This is a mock implementation - replace with actual AI service integration
 */
async function performResumeAnalysis(
  resumeText: string,
  targetJob: ResumeAnalysisRequest['targetJob'],
  templateId?: string
): Promise<ResumeAnalysisResponse> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock analysis logic - replace with actual AI analysis
  const wordCount = resumeText.split(/\s+/).length;
  const hasContactInfo = /email|phone|linkedin/i.test(resumeText);
  const hasExperience = /experience|work|job|position/i.test(resumeText);
  const hasEducation = /education|degree|university|college/i.test(resumeText);
  const hasSkills = /skills|technologies|tools/i.test(resumeText);

  // Calculate keyword match score
  const targetKeywords = targetJob.keywords
    ? targetJob.keywords.split(',').map((k) => k.trim().toLowerCase())
    : [];
  const resumeWords = resumeText.toLowerCase().split(/\s+/);
  const matchedKeywords: MatchedKeyword[] = targetKeywords
    .filter((keyword) =>
      resumeWords.some((word) => word.includes(keyword) || keyword.includes(word))
    )
    .map((keyword) => ({
      keyword,
      frequency: resumeWords.filter((word) => word.includes(keyword)).length,
      relevanceScore: 1.0,
      context: [],
    }));
  const keywordMatchScore =
    targetKeywords.length > 0 ? (matchedKeywords.length / targetKeywords.length) * 100 : 75;

  // Calculate overall score
  let overallScore = 0;
  const scoringFactors = [
    { condition: hasContactInfo, weight: 15, name: 'Contact Information' },
    { condition: hasExperience, weight: 25, name: 'Professional Experience' },
    { condition: hasEducation, weight: 15, name: 'Education' },
    { condition: hasSkills, weight: 20, name: 'Skills Section' },
    { condition: wordCount >= 200 && wordCount <= 800, weight: 10, name: 'Appropriate Length' },
    { condition: keywordMatchScore >= 50, weight: 15, name: 'Keyword Optimization' },
  ];

  scoringFactors.forEach((factor) => {
    if (factor.condition) {
      overallScore += factor.weight;
    }
  });

  // Generate suggestions based on analysis
  const suggestions = [];

  if (!hasContactInfo) {
    suggestions.push({
      id: `suggestion_${Date.now()}_1`,
      type: 'format' as const,
      title: 'Add Contact Information',
      description:
        'Include your email, phone number, and LinkedIn profile at the top of your resume.',
      impact: 'high' as const,
      suggestion: 'Add a contact section with your email, phone, and LinkedIn URL',
      priority: 1,
      estimatedScoreImprovement: 15,
    });
  }

  if (!hasExperience) {
    suggestions.push({
      id: `suggestion_${Date.now()}_2`,
      type: 'structure' as const,
      title: 'Add Professional Experience',
      description: 'Include your work history with specific achievements and quantifiable results.',
      impact: 'high' as const,
      suggestion: 'Add a professional experience section with 3-5 bullet points per job',
      priority: 1,
      estimatedScoreImprovement: 25,
    });
  }

  if (keywordMatchScore < 50) {
    suggestions.push({
      id: `suggestion_${Date.now()}_3`,
      type: 'keyword' as const,
      title: 'Improve Keyword Optimization',
      description: `Your resume matches ${Math.round(keywordMatchScore)}% of target keywords. Consider incorporating more relevant terms from the job description.`,
      impact: 'high' as const,
      suggestion: 'Add relevant keywords from the job description naturally throughout your resume',
      priority: 2,
      estimatedScoreImprovement: 20,
    });
  }

  if (wordCount < 200) {
    suggestions.push({
      id: `suggestion_${Date.now()}_4`,
      type: 'structure' as const,
      title: 'Expand Resume Content',
      description:
        'Your resume is quite short. Add more details about your achievements and responsibilities.',
      impact: 'medium' as const,
      suggestion: 'Expand each job description with more details and quantifiable achievements',
      priority: 3,
      estimatedScoreImprovement: 10,
    });
  }

  if (wordCount > 800) {
    suggestions.push({
      id: `suggestion_${Date.now()}_5`,
      type: 'format' as const,
      title: 'Reduce Resume Length',
      description: 'Your resume is quite long. Consider condensing information to 1-2 pages.',
      impact: 'medium' as const,
      suggestion: 'Remove less relevant experience and condense bullet points',
      priority: 3,
      estimatedScoreImprovement: 5,
    });
  }

  if (!hasSkills) {
    suggestions.push({
      id: `suggestion_${Date.now()}_6`,
      type: 'structure' as const,
      title: 'Add Skills Section',
      description:
        'Include a dedicated skills section highlighting your technical and professional competencies.',
      impact: 'medium' as const,
      suggestion: 'Add a skills section grouped by category (Technical, Soft Skills, etc.)',
      priority: 2,
      estimatedScoreImprovement: 10,
    });
  }

  // Add some general suggestions
  suggestions.push({
    id: `suggestion_${Date.now()}_7`,
    type: 'achievement' as const,
    title: 'Use Action Verbs',
    description:
      'Start bullet points with strong action verbs like "Led," "Developed," "Implemented," etc.',
    impact: 'medium' as const,
    suggestion: 'Rewrite bullet points to start with action verbs',
    priority: 3,
    estimatedScoreImprovement: 5,
  });

  suggestions.push({
    id: `suggestion_${Date.now()}_8`,
    type: 'achievement' as const,
    title: 'Quantify Achievements',
    description: 'Include specific numbers, percentages, and metrics to demonstrate your impact.',
    impact: 'high' as const,
    suggestion: 'Add quantifiable metrics to your achievements (e.g. "Increased sales by 20%")',
    priority: 2,
    estimatedScoreImprovement: 15,
  });

  // Calculate ATS compatibility score
  const atsScore = Math.min(
    100,
    overallScore + (hasContactInfo ? 10 : 0) + keywordMatchScore * 0.3
  );

  const analysisResult: ResumeAnalysisResponse = {
    id: `analysis_${Date.now()}`,
    overallScore: Math.round(overallScore),
    atsScore: Math.round(atsScore),
    suggestions,
    grammarCheck: {
      score: 85,
      totalIssues: 2,
      issues: [],
      overallReadability: 80,
    },
    formatAnalysis: {
      score: 80,
      atsCompatibility: 75,
      issues: [],
      recommendations: ['Use consistent formatting', 'Ensure proper section headers'],
      sectionStructure: [
        {
          name: 'Contact Information',
          present: true,
          order: 1,
          recommended: true,
        },
        {
          name: 'Professional Summary',
          present: false,
          order: 2,
          recommended: true,
        },
      ],
    },
    quantitativeAnalysis: {
      score: 60,
      achievementsWithNumbers: 1,
      totalAchievements: 5,
      suggestions: [],
      impactWords: [],
    },
    createdAt: new Date().toISOString(),
    processingTime: 2000,
    strengths: [
      ...(hasContactInfo ? ['Clear contact information'] : []),
      ...(hasExperience ? ['Professional experience included'] : []),
      ...(hasEducation ? ['Education background provided'] : []),
      ...(hasSkills ? ['Skills section present'] : []),
      ...(wordCount >= 200 && wordCount <= 800 ? ['Appropriate resume length'] : []),
      ...(keywordMatchScore >= 70 ? ['Good keyword optimization'] : []),
    ],
    weaknesses: [
      ...(!hasContactInfo ? ['Missing contact information'] : []),
      ...(!hasExperience ? ['Lacks professional experience details'] : []),
      ...(!hasEducation ? ['No education information'] : []),
      ...(!hasSkills ? ['Missing skills section'] : []),
      ...(wordCount < 200 ? ['Resume too short'] : []),
      ...(wordCount > 800 ? ['Resume too long'] : []),
      ...(keywordMatchScore < 50 ? ['Poor keyword optimization'] : []),
    ],
    keywordAnalysis: {
      score: Math.round(keywordMatchScore),
      totalKeywords: targetKeywords.length,
      matchedKeywords,
      missingKeywords: targetKeywords
        .filter((keyword) => !matchedKeywords.some((mk) => mk.keyword === keyword))
        .map((keyword) => ({
          keyword,
          importance: 'high' as const,
          suggestedPlacement: ['summary', 'skills'],
          relatedTerms: [],
        })),
      keywordDensity: matchedKeywords.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.keyword]: curr.frequency / resumeWords.length,
        }),
        {} as Record<string, number>
      ),
      recommendations:
        matchedKeywords.length < targetKeywords.length / 2
          ? ['Add more keywords from job description']
          : ['Consider reordering keywords to appear earlier in resume'],
    },
    sectionAnalysis: {
      contact: {
        present: hasContactInfo,
        score: hasContactInfo ? 90 : 0,
        suggestions: hasContactInfo ? [] : ['Add email, phone, and LinkedIn profile'],
      },
      summary: {
        present: /summary|objective|profile/i.test(resumeText),
        score: /summary|objective|profile/i.test(resumeText) ? 80 : 40,
        suggestions: /summary|objective|profile/i.test(resumeText)
          ? ['Consider tailoring summary to target role']
          : ['Add a professional summary section'],
      },
      experience: {
        present: hasExperience,
        score: hasExperience ? 85 : 0,
        suggestions: hasExperience
          ? ['Use more action verbs', 'Quantify achievements']
          : ['Add professional experience section'],
      },
      education: {
        present: hasEducation,
        score: hasEducation ? 80 : 60,
        suggestions: hasEducation
          ? ['Include graduation year if recent']
          : ['Add education background'],
      },
      skills: {
        present: hasSkills,
        score: hasSkills ? 85 : 30,
        suggestions: hasSkills
          ? ['Organize skills by category', 'Include proficiency levels']
          : ['Add technical and soft skills section'],
      },
    },
    optimizedContent: generateOptimizedContent(resumeText, targetJob, suggestions),
    metadata: {
      analysisDate: new Date().toISOString(),
      targetJobTitle: targetJob.title,
      ...(targetJob.company && { targetCompany: targetJob.company }),
      ...(templateId && { templateUsed: templateId }),
      wordCount,
      processingTime: 2000,
    },
  };

  return analysisResult;
}

/**
 * Generates optimized content suggestions
 */
function generateOptimizedContent(
  originalText: string,
  targetJob: ResumeAnalysisRequest['targetJob'],
  suggestions: ResumeAnalysisResponse['suggestions']
): string {
  // This is a simplified version - in a real implementation,
  // you would use AI to generate actual optimized content

  let optimizedText = originalText;

  // Add missing sections based on suggestions
  const highImpactSuggestions = suggestions.filter((s) => s.impact === 'high');

  if (highImpactSuggestions.some((s) => s.category === 'contact')) {
    optimizedText = `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile]

${optimizedText}`;
  }

  if (
    highImpactSuggestions.some((s) => s.category === 'content' && s.title.includes('Experience'))
  ) {
    optimizedText += `

PROFESSIONAL EXPERIENCE

[Job Title] | [Company Name] | [Start Date] - [End Date]
• [Achievement with quantifiable result]
• [Achievement with quantifiable result]
• [Achievement with quantifiable result]`;
  }

  // Add keyword optimization note
  if (targetJob.keywords) {
    optimizedText += `

[Note: Consider incorporating these keywords naturally throughout your resume: ${targetJob.keywords}]`;
  }

  return optimizedText;
}
