import { ai } from '@/ai/genkit';
import type {
  FormatAnalysis,
  KeywordAnalysis,
  MatchedKeyword,
  MissingKeyword,
  OptimizationSuggestion,
  QuantitativeAnalysis,
  ResumeAnalysisResponse,
  TargetJobInfo,
} from '@/lib/types/resume-optimizer';

/**
 * Advanced AI-powered resume analysis service using state-of-the-art techniques
 */
export class AIResumeAnalyzer {
  private readonly model = 'mistral-large-latest';
  private readonly temperature = 0.3; // Lower temperature for more consistent analysis

  /**
   * Perform comprehensive AI-powered resume analysis
   */
  async analyzeResume(
    resumeText: string,
    targetJob: TargetJobInfo,
    templateId?: string
  ): Promise<ResumeAnalysisResponse> {
    const startTime = Date.now();

    try {
      // Run multiple analysis tasks in parallel for efficiency
      const [
        keywordAnalysis,
        grammarCheck,
        formatAnalysis,
        quantitativeAnalysis,
        overallAssessment,
      ] = await Promise.all([
        this.analyzeKeywords(resumeText, targetJob),
        this.checkGrammar(resumeText),
        this.analyzeFormat(resumeText),
        this.analyzeQuantitativeAchievements(resumeText),
        this.getOverallAssessment(resumeText, targetJob),
      ]);

      // Calculate scores
      const overallScore = this.calculateOverallScore({
        keywordScore: keywordAnalysis.score,
        grammarScore: grammarCheck.score,
        formatScore: formatAnalysis.score,
        quantitativeScore: quantitativeAnalysis.score,
      });

      const atsScore = this.calculateATSScore({
        keywordScore: keywordAnalysis.score,
        formatScore: formatAnalysis.score,
        structureScore: formatAnalysis.atsCompatibility,
      });

      // Generate optimization suggestions
      const suggestions = await this.generateOptimizationSuggestions(resumeText, targetJob, {
        keywordAnalysis,
        grammarCheck,
        formatAnalysis,
        quantitativeAnalysis,
      });

      const processingTime = Date.now() - startTime;

      return {
        id: `ai_analysis_${Date.now()}`,
        overallScore,
        atsScore,
        keywordAnalysis,
        grammarCheck,
        formatAnalysis,
        quantitativeAnalysis,
        suggestions,
        strengths: overallAssessment.strengths,
        weaknesses: overallAssessment.weaknesses,
        optimizedContent: await this.generateOptimizedContent(resumeText, suggestions),
        createdAt: new Date().toISOString(),
        processingTime,
        metadata: {
          analysisDate: new Date().toISOString(),
          targetJobTitle: targetJob.title,
          targetCompany: targetJob.company || '',
          templateUsed: templateId,
          wordCount: resumeText.split(/\s+/).length,
          processingTime,
          aiModel: this.model,
          analysisVersion: '2.0',
        } as any,
      };
    } catch (error) {
      console.error('AI Resume Analysis Error:', error);
      throw new Error(
        `Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Advanced keyword analysis using AI
   */
  private async analyzeKeywords(
    resumeText: string,
    targetJob: TargetJobInfo
  ): Promise<KeywordAnalysis> {
    const prompt = `Analyze the following resume for keyword optimization against this job description.

JOB DESCRIPTION:
Title: ${targetJob.title}
Company: ${targetJob.company || 'Not specified'}
Description: ${targetJob.description || 'Not provided'}
Required Skills: ${targetJob.keywords || 'Not specified'}

RESUME TEXT:
${resumeText}

Provide a detailed keyword analysis in the following JSON format:
{
  "score": <number 0-100>,
  "totalKeywords": <number>,
  "matchedKeywords": [
    {
      "keyword": "<keyword>",
      "frequency": <number>,
      "relevanceScore": <number 0-1>,
      "context": ["<context1>", "<context2>"]
    }
  ],
  "missingKeywords": [
    {
      "keyword": "<keyword>",
      "importance": "high|medium|low",
      "suggestedPlacement": ["<section1>", "<section2>"],
      "relatedTerms": ["<term1>", "<term2>"]
    }
  ],
  "keywordDensity": {
    "<keyword>": <percentage>
  },
  "recommendations": ["<recommendation1>", "<recommendation2>"]
}

Focus on:
1. Technical skills and tools
2. Industry-specific terminology
3. Action verbs and power words
4. Certifications and qualifications
5. Soft skills mentioned in job description`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: this.temperature,
        maxTokens: 2000,
      });

      const analysis = JSON.parse(response.text);
      return {
        score: Math.min(100, Math.max(0, analysis.score)),
        totalKeywords: analysis.totalKeywords || 0,
        matchedKeywords: analysis.matchedKeywords || [],
        missingKeywords: analysis.missingKeywords || [],
        keywordDensity: analysis.keywordDensity || {},
        recommendations: analysis.recommendations || [],
      };
    } catch (error) {
      console.error('Keyword analysis error:', error);
      return this.getFallbackKeywordAnalysis(resumeText, targetJob);
    }
  }

  /**
   * AI-powered grammar and readability check
   */
  private async checkGrammar(resumeText: string): Promise<any> {
    const prompt = `Analyze the following resume text for grammar, spelling, and readability issues.

RESUME TEXT:
${resumeText}

Provide a detailed grammar analysis in the following JSON format:
{
  "score": <number 0-100>,
  "totalIssues": <number>,
  "overallReadability": <number 0-100>,
  "issues": [
    {
      "type": "grammar|spelling|punctuation|style",
      "severity": "high|medium|low",
      "message": "<description>",
      "suggestion": "<correction>",
      "position": {
        "start": <number>,
        "end": <number>
      },
      "context": "<surrounding text>"
    }
  ]
}

Check for:
1. Grammar errors
2. Spelling mistakes
3. Punctuation issues
4. Consistency in tense and voice
5. Clarity and conciseness
6. Professional tone
7. Readability score`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: this.temperature,
        maxTokens: 1500,
      });

      const analysis = JSON.parse(response.text);
      return {
        score: Math.min(100, Math.max(0, analysis.score)),
        totalIssues: analysis.totalIssues || 0,
        overallReadability: Math.min(100, Math.max(0, analysis.overallReadability)),
        issues: analysis.issues || [],
      };
    } catch (error) {
      console.error('Grammar check error:', error);
      return this.getFallbackGrammarCheck();
    }
  }

  /**
   * AI-powered format and structure analysis
   */
  private async analyzeFormat(resumeText: string): Promise<FormatAnalysis> {
    const prompt = `Analyze the following resume for formatting, structure, and ATS compatibility.

RESUME TEXT:
${resumeText}

Provide a detailed format analysis in the following JSON format:
{
  "score": <number 0-100>,
  "atsCompatibility": <number 0-100>,
  "issues": [
    {
      "type": "formatting|structure|ats",
      "severity": "high|medium|low",
      "message": "<description>",
      "suggestion": "<correction>"
    }
  ],
  "recommendations": ["<recommendation1>", "<recommendation2>"],
  "sectionStructure": [
    {
      "name": "<section name>",
      "present": <boolean>,
      "order": <number>,
      "recommended": <boolean>
    }
  ]
}

Evaluate:
1. Section organization and order
2. Consistency in formatting
3. Use of bullet points and white space
4. ATS-friendly structure
5. Contact information placement
6. Date formatting consistency
7. Font and styling consistency (if detectable)`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: this.temperature,
        maxTokens: 1500,
      });

      const analysis = JSON.parse(response.text);
      return {
        score: Math.min(100, Math.max(0, analysis.score)),
        atsCompatibility: Math.min(100, Math.max(0, analysis.atsCompatibility)),
        issues: analysis.issues || [],
        recommendations: analysis.recommendations || [],
        sectionStructure: analysis.sectionStructure || [],
      };
    } catch (error) {
      console.error('Format analysis error:', error);
      return this.getFallbackFormatAnalysis();
    }
  }

  /**
   * AI-powered quantitative achievements analysis
   */
  private async analyzeQuantitativeAchievements(resumeText: string): Promise<QuantitativeAnalysis> {
    const prompt = `Analyze the following resume for quantitative achievements and impact metrics.

RESUME TEXT:
${resumeText}

Provide a detailed quantitative analysis in the following JSON format:
{
  "score": <number 0-100>,
  "achievementsWithNumbers": <number>,
  "totalAchievements": <number>,
  "impactWords": ["<word1>", "<word2>"],
  "suggestions": [
    {
      "type": "add_metrics|strengthen_impact|quantify_achievement",
      "description": "<suggestion>",
      "example": "<example>"
    }
  ]
}

Look for:
1. Numbers, percentages, dollar amounts
2. Quantified results and outcomes
3. Impact verbs and power words
4. Measurable achievements
5. ROI and performance metrics
6. Team sizes, project scales
7. Time-based improvements`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: this.temperature,
        maxTokens: 1000,
      });

      const analysis = JSON.parse(response.text);
      return {
        score: Math.min(100, Math.max(0, analysis.score)),
        achievementsWithNumbers: analysis.achievementsWithNumbers || 0,
        totalAchievements: analysis.totalAchievements || 0,
        impactWords: analysis.impactWords || [],
        suggestions: analysis.suggestions || [],
      };
    } catch (error) {
      console.error('Quantitative analysis error:', error);
      return this.getFallbackQuantitativeAnalysis(resumeText);
    }
  }

  /**
   * Generate comprehensive optimization suggestions
   */
  private async generateOptimizationSuggestions(
    resumeText: string,
    targetJob: TargetJobInfo,
    analyses: {
      keywordAnalysis: KeywordAnalysis;
      grammarCheck: any;
      formatAnalysis: FormatAnalysis;
      quantitativeAnalysis: QuantitativeAnalysis;
    }
  ): Promise<OptimizationSuggestion[]> {
    const prompt = `Based on the following resume and analysis results, generate specific, actionable optimization suggestions.

RESUME TEXT:
${resumeText}

TARGET JOB:
${targetJob.title} at ${targetJob.company || 'target company'}

ANALYSIS RESULTS:
- Keyword Score: ${analyses.keywordAnalysis.score}/100
- Grammar Score: ${analyses.grammarCheck.score}/100
- Format Score: ${analyses.formatAnalysis.score}/100
- Quantitative Score: ${analyses.quantitativeAnalysis.score}/100

Provide optimization suggestions in the following JSON format:
[
  {
    "id": "<unique_id>",
    "type": "keyword|grammar|format|achievement|structure|ats",
    "title": "<short title>",
    "description": "<detailed description>",
    "impact": "high|medium|low",
    "suggestion": "<specific actionable advice>",
    "section": "<resume section>",
    "priority": <number 1-5>,
    "estimatedScoreImprovement": <number 1-20>,
    "category": "content|formatting|optimization"
  }
]

Generate 5-10 high-impact suggestions prioritized by potential improvement.`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: this.temperature,
        maxTokens: 2000,
      });

      const suggestions = JSON.parse(response.text);
      return suggestions.map((s: any, index: number) => ({
        id: s.id || `suggestion_${index + 1}`,
        type: s.type || 'content',
        title: s.title || 'Optimization Suggestion',
        description: s.description || '',
        impact: s.impact || 'medium',
        suggestion: s.suggestion || '',
        section: s.section,
        priority: s.priority || 3,
        estimatedScoreImprovement: s.estimatedScoreImprovement || 5,
        category: s.category || 'content',
      }));
    } catch (error) {
      console.error('Suggestion generation error:', error);
      return this.getFallbackSuggestions();
    }
  }

  /**
   * Get overall assessment with strengths and weaknesses
   */
  private async getOverallAssessment(
    resumeText: string,
    targetJob: TargetJobInfo
  ): Promise<{ strengths: string[]; weaknesses: string[] }> {
    const prompt = `Provide an overall assessment of this resume for the target job.

RESUME TEXT:
${resumeText}

TARGET JOB:
${targetJob.title} at ${targetJob.company || 'target company'}

Provide assessment in the following JSON format:
{
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"]
}

Focus on:
1. Relevant experience alignment
2. Skills match
3. Career progression
4. Achievement presentation
5. Overall professional presentation`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: this.temperature,
        maxTokens: 800,
      });

      const assessment = JSON.parse(response.text);
      return {
        strengths: assessment.strengths || ['Professional presentation'],
        weaknesses: assessment.weaknesses || ['Could benefit from optimization'],
      };
    } catch (error) {
      console.error('Overall assessment error:', error);
      return {
        strengths: ['Professional presentation', 'Clear structure'],
        weaknesses: [
          'Could benefit from keyword optimization',
          'Consider adding more quantified achievements',
        ],
      };
    }
  }

  /**
   * Generate optimized resume content
   */
  private async generateOptimizedContent(
    resumeText: string,
    suggestions: OptimizationSuggestion[]
  ): Promise<string> {
    const highPrioritySuggestions = suggestions
      .filter((s) => s.priority <= 2 && s.impact === 'high')
      .slice(0, 3);

    if (highPrioritySuggestions.length === 0) {
      return resumeText; // Return original if no high-priority suggestions
    }

    const prompt = `Apply the following high-priority optimization suggestions to improve this resume:

ORIGINAL RESUME:
${resumeText}

SUGGESTIONS TO APPLY:
${highPrioritySuggestions.map((s) => `- ${s.title}: ${s.suggestion}`).join('\n')}

Provide the optimized resume text with the suggested improvements applied. Maintain the original structure and formatting while incorporating the improvements naturally.`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: 0.2, // Lower temperature for more consistent optimization
        maxTokens: 3000,
      });

      return response.text;
    } catch (error) {
      console.error('Content optimization error:', error);
      return resumeText; // Return original on error
    }
  }

  /**
   * Calculate overall score based on component scores
   */
  private calculateOverallScore(scores: {
    keywordScore: number;
    grammarScore: number;
    formatScore: number;
    quantitativeScore: number;
  }): number {
    const weights = {
      keyword: 0.35,
      grammar: 0.25,
      format: 0.25,
      quantitative: 0.15,
    };

    const weightedScore =
      scores.keywordScore * weights.keyword +
      scores.grammarScore * weights.grammar +
      scores.formatScore * weights.format +
      scores.quantitativeScore * weights.quantitative;

    return Math.round(Math.min(100, Math.max(0, weightedScore)));
  }

  /**
   * Calculate ATS compatibility score
   */
  private calculateATSScore(scores: {
    keywordScore: number;
    formatScore: number;
    structureScore: number;
  }): number {
    const weights = {
      keyword: 0.5,
      format: 0.3,
      structure: 0.2,
    };

    const atsScore =
      scores.keywordScore * weights.keyword +
      scores.formatScore * weights.format +
      scores.structureScore * weights.structure;

    return Math.round(Math.min(100, Math.max(0, atsScore)));
  }

  // Fallback methods for when AI analysis fails
  private getFallbackKeywordAnalysis(
    resumeText: string,
    targetJob: TargetJobInfo
  ): KeywordAnalysis {
    const keywords = targetJob.keywords?.split(',').map((k) => k.trim()) || [];
    const resumeLower = resumeText.toLowerCase();

    const matchedKeywords: MatchedKeyword[] = keywords
      .filter((keyword) => resumeLower.includes(keyword.toLowerCase()))
      .map((keyword) => ({
        keyword,
        frequency: (resumeText.match(new RegExp(keyword, 'gi')) || []).length,
        relevanceScore: 0.8,
        context: [],
      }));

    const missingKeywords: MissingKeyword[] = keywords
      .filter((keyword) => !resumeLower.includes(keyword.toLowerCase()))
      .map((keyword) => ({
        keyword,
        importance: 'high' as const,
        suggestedPlacement: ['skills', 'experience'],
        relatedTerms: [],
      }));

    return {
      score:
        keywords.length > 0 ? Math.round((matchedKeywords.length / keywords.length) * 100) : 75,
      totalKeywords: keywords.length,
      matchedKeywords,
      missingKeywords,
      keywordDensity: {},
      recommendations: ['Consider adding more relevant keywords from the job description'],
    };
  }

  private getFallbackGrammarCheck(): any {
    return {
      score: 85,
      totalIssues: 0,
      overallReadability: 80,
      issues: [],
    };
  }

  private getFallbackFormatAnalysis(): FormatAnalysis {
    return {
      score: 80,
      atsCompatibility: 75,
      issues: [],
      recommendations: ['Ensure consistent formatting throughout'],
      sectionStructure: [
        { name: 'Contact Information', present: true, order: 1, recommended: true },
        { name: 'Professional Summary', present: false, order: 2, recommended: true },
        { name: 'Experience', present: true, order: 3, recommended: true },
        { name: 'Education', present: true, order: 4, recommended: true },
        { name: 'Skills', present: false, order: 5, recommended: true },
      ],
    };
  }

  private getFallbackQuantitativeAnalysis(resumeText: string): QuantitativeAnalysis {
    const numbers = resumeText.match(/\d+/g) || [];
    return {
      score: Math.min(100, numbers.length * 10),
      achievementsWithNumbers: numbers.length,
      totalAchievements: 5,
      impactWords: ['improved', 'increased', 'developed'],
      suggestions: [
        {
          section: 'experience',
          originalText: 'Managed a team.',
          suggestedText: 'Managed a team of 5 engineers.',
          reasoning: 'Adding numbers to achievements makes them more impactful.',
          description: 'Add quantifiable metrics to your achievements',
        },
      ],
    };
  }

  private getFallbackSuggestions(): OptimizationSuggestion[] {
    return [
      {
        id: 'fallback_1',
        type: 'keyword',
        title: 'Optimize Keywords',
        description: 'Add more relevant keywords from the job description',
        impact: 'high',
        suggestion:
          'Review the job description and incorporate missing keywords naturally into your resume',
        priority: 1,
        estimatedScoreImprovement: 15,
        category: 'content',
      },
      {
        id: 'fallback_2',
        type: 'achievement',
        title: 'Quantify Achievements',
        description: 'Add numbers and metrics to demonstrate impact',
        impact: 'high',
        suggestion: 'Include specific numbers, percentages, and metrics in your accomplishments',
        priority: 2,
        estimatedScoreImprovement: 12,
        category: 'content',
      },
    ];
  }
}

export const aiResumeAnalyzer = new AIResumeAnalyzer();
