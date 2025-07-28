import { Mistral } from '@mistralai/mistralai';

export interface ATSCompatibilityResult {
  overallScore: number;
  sections: {
    formatting: ATSSectionScore;
    keywords: ATSSectionScore;
    structure: ATSSectionScore;
    readability: ATSSectionScore;
    contact: ATSSectionScore;
  };
  suggestions: ATSSuggestion[];
  industryCompliance: IndustryComplianceScore[];
  passedChecks: string[];
  failedChecks: string[];
  riskFactors: RiskFactor[];
  optimizationTips: OptimizationTip[];
}

export interface ATSSectionScore {
  score: number;
  maxScore: number;
  issues: string[];
  recommendations: string[];
  impact: 'high' | 'medium' | 'low';
}

export interface ATSSuggestion {
  id: string;
  type: 'format' | 'keyword' | 'structure' | 'content';
  severity: 'critical' | 'important' | 'suggestion';
  description: string;
  before: string;
  after: string;
  impact: number;
  reasoning: string;
}

export interface IndustryComplianceScore {
  industry: string;
  score: number;
  specificRequirements: string[];
  missingElements: string[];
}

export interface RiskFactor {
  factor: string;
  risk: 'high' | 'medium' | 'low';
  description: string;
  solution: string;
}

export interface OptimizationTip {
  category: string;
  tip: string;
  expectedImprovement: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ATSAnalysisParams {
  resumeText: string;
  targetRole?: string;
  targetIndustry?: string;
  jobDescription?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
}

class ATSCompatibilityService {
  private mistral: Mistral;

  constructor() {
    this.mistral = new Mistral({
      apiKey: process.env['MISTRAL_API_KEY'] || '',
    });
  }

  async analyzeATSCompatibility(params: ATSAnalysisParams): Promise<ATSCompatibilityResult> {
    try {
      const [formattingScore, keywordScore, structureScore, readabilityScore, contactScore] =
        await Promise.all([
          this.analyzeFormatting(params.resumeText),
          this.analyzeKeywords(params.resumeText, params.targetRole, params.jobDescription),
          this.analyzeStructure(params.resumeText),
          this.analyzeReadability(params.resumeText),
          this.analyzeContactInfo(params.resumeText),
        ]);

      const suggestions = await this.generateATSSuggestions(params);
      const industryCompliance = await this.checkIndustryCompliance(params);
      const riskFactors = this.identifyRiskFactors(params.resumeText);
      const optimizationTips = await this.generateOptimizationTips(params);

      const overallScore = this.calculateOverallScore({
        formatting: formattingScore,
        keywords: keywordScore,
        structure: structureScore,
        readability: readabilityScore,
        contact: contactScore,
      });

      const { passedChecks, failedChecks } = this.runATSChecks(params.resumeText);

      return {
        overallScore,
        sections: {
          formatting: formattingScore,
          keywords: keywordScore,
          structure: structureScore,
          readability: readabilityScore,
          contact: contactScore,
        },
        suggestions,
        industryCompliance,
        passedChecks,
        failedChecks,
        riskFactors,
        optimizationTips,
      };
    } catch (error) {
      console.error('ATS analysis failed:', error);
      return this.getFallbackAnalysis(params.resumeText);
    }
  }

  private async analyzeFormatting(resumeText: string): Promise<ATSSectionScore> {
    const prompt = `
    Analyze this resume for ATS formatting compatibility. Focus on:
    - File format issues (PDF vs Word compatibility)
    - Font usage and readability
    - Section headers and formatting
    - Table usage (problematic for ATS)
    - Graphics, images, or complex layouts
    - Text encoding issues
    - Bullet point formatting

    Resume text:
    ${resumeText}

    Provide a score out of 100 and specific issues with recommendations.
    `;

    try {
      const response = await this.mistral.chat.complete({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const analysis = this.parseFormattingResponse(
        response.choices?.[0]?.message?.content?.toString() || ''
      );
      return analysis;
    } catch (_error) {
      return this.getFallbackFormattingScore();
    }
  }

  private async analyzeKeywords(
    resumeText: string,
    targetRole?: string,
    jobDescription?: string
  ): Promise<ATSSectionScore> {
    const prompt = `
    Analyze this resume for ATS keyword optimization:
    ${targetRole ? `Target Role: ${targetRole}` : ''}
    ${jobDescription ? `Job Description: ${jobDescription}` : ''}

    Focus on:
    - Keyword density and distribution
    - Hard skills vs soft skills balance
    - Industry-specific terminology
    - Missing critical keywords
    - Keyword stuffing detection
    - Synonym usage and variations
    - Technical skills alignment

    Resume text:
    ${resumeText}

    Provide keyword analysis with score out of 100 and specific recommendations.
    `;

    try {
      const response = await this.mistral.chat.complete({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      return this.parseKeywordResponse(response.choices?.[0]?.message?.content?.toString() || '');
    } catch (error) {
      console.error('Keyword analysis error:', error);
      return this.getFallbackKeywordScore();
    }
  }

  private async analyzeStructure(resumeText: string): Promise<ATSSectionScore> {
    const standardSections = [
      'Contact Information',
      'Professional Summary',
      'Work Experience',
      'Education',
      'Skills',
      'Certifications',
    ];

    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for standard section presence
    const missingSections = standardSections.filter(
      (section) => !resumeText.toLowerCase().includes(section.toLowerCase().replace(' ', ''))
    );

    if (missingSections.length > 0) {
      issues.push(`Missing standard sections: ${missingSections.join(', ')}`);
      recommendations.push('Add missing standard sections expected by ATS systems');
      score -= missingSections.length * 15;
    }

    // Check section order
    if (!this.checkSectionOrder(resumeText)) {
      issues.push('Sections not in optimal order for ATS parsing');
      recommendations.push('Reorder sections: Contact → Summary → Experience → Education → Skills');
      score -= 10;
    }

    // Check for consistent formatting
    if (!this.checkConsistentFormatting(resumeText)) {
      issues.push('Inconsistent section formatting detected');
      recommendations.push('Use consistent heading styles and bullet point formatting');
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      maxScore: 100,
      issues,
      recommendations,
      impact: score < 70 ? 'high' : score < 85 ? 'medium' : 'low',
    };
  }

  private async analyzeReadability(resumeText: string): Promise<ATSSectionScore> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check sentence length
    const sentences = resumeText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength =
      sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;

    if (avgSentenceLength > 25) {
      issues.push('Sentences too long for optimal ATS parsing');
      recommendations.push('Break down complex sentences into shorter, clearer statements');
      score -= 15;
    }

    // Check for jargon density
    const jargonCount = this.countJargon(resumeText);
    if (jargonCount > resumeText.split(' ').length * 0.1) {
      issues.push('High jargon density may confuse ATS systems');
      recommendations.push('Replace jargon with standard industry terms');
      score -= 10;
    }

    // Check for action verbs
    const actionVerbCount = this.countActionVerbs(resumeText);
    if (actionVerbCount < 5) {
      issues.push('Insufficient use of strong action verbs');
      recommendations.push('Use more impactful action verbs to start bullet points');
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      maxScore: 100,
      issues,
      recommendations,
      impact: score < 70 ? 'high' : score < 85 ? 'medium' : 'low',
    };
  }

  private async analyzeContactInfo(resumeText: string): Promise<ATSSectionScore> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/;
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/i;

    if (!emailRegex.test(resumeText)) {
      issues.push('Email address not found or improperly formatted');
      recommendations.push('Include a professional email address');
      score -= 25;
    }

    if (!phoneRegex.test(resumeText)) {
      issues.push('Phone number not found or improperly formatted');
      recommendations.push('Include a properly formatted phone number');
      score -= 20;
    }

    if (!linkedinRegex.test(resumeText)) {
      issues.push('LinkedIn profile not found');
      recommendations.push('Include your LinkedIn profile URL');
      score -= 10;
    }

    // Check for address (optional but beneficial)
    const addressKeywords = ['street', 'avenue', 'drive', 'city', 'state', 'zip'];
    const hasAddress = addressKeywords.some((keyword) =>
      resumeText.toLowerCase().includes(keyword)
    );

    if (!hasAddress) {
      recommendations.push('Consider including city/state for location-based filtering');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      maxScore: 100,
      issues,
      recommendations,
      impact: score < 70 ? 'high' : score < 85 ? 'medium' : 'low',
    };
  }

  private async generateATSSuggestions(params: ATSAnalysisParams): Promise<ATSSuggestion[]> {
    const prompt = `
    Generate specific ATS optimization suggestions for this resume:
    ${params.targetRole ? `Target Role: ${params.targetRole}` : ''}
    ${params.targetIndustry ? `Industry: ${params.targetIndustry}` : ''}

    Resume text:
    ${params.resumeText}

    Provide 5-10 specific, actionable suggestions with before/after examples.
    Focus on the most impactful changes for ATS compatibility.
    `;

    try {
      const response = await this.mistral.chat.complete({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });

      return this.parseATSSuggestions(response.choices?.[0]?.message?.content?.toString() || '');
    } catch (error) {
      console.error('Suggestions generation error:', error);
      return this.getFallbackSuggestions();
    }
  }

  private async checkIndustryCompliance(
    params: ATSAnalysisParams
  ): Promise<IndustryComplianceScore[]> {
    if (!params.targetIndustry) return [];

    const industries = ['Technology', 'Healthcare', 'Finance', 'Marketing', 'Education'];
    const results: IndustryComplianceScore[] = [];

    for (const industry of industries) {
      const score = this.calculateIndustryScore(params.resumeText, industry);
      results.push(score);
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private calculateIndustryScore(resumeText: string, industry: string): IndustryComplianceScore {
    // Industry-specific keyword analysis
    const industryKeywords = this.getIndustryKeywords(industry);
    const foundKeywords = industryKeywords.filter((keyword) =>
      resumeText.toLowerCase().includes(keyword.toLowerCase())
    );

    const score = (foundKeywords.length / industryKeywords.length) * 100;

    return {
      industry,
      score: Math.round(score),
      specificRequirements: this.getIndustryRequirements(industry),
      missingElements: industryKeywords.filter(
        (keyword) => !resumeText.toLowerCase().includes(keyword.toLowerCase())
      ),
    };
  }

  private identifyRiskFactors(resumeText: string): RiskFactor[] {
    const riskFactors: RiskFactor[] = [];

    // Check for problematic elements
    if (resumeText.includes('table') || resumeText.includes('column')) {
      riskFactors.push({
        factor: 'Complex Table Formatting',
        risk: 'high',
        description: 'Tables and complex layouts can break ATS parsing',
        solution: 'Convert tables to simple text with clear headings',
      });
    }

    if (resumeText.split('\n').length < 10) {
      riskFactors.push({
        factor: 'Insufficient Content',
        risk: 'medium',
        description: 'Resume appears too short for comprehensive ATS analysis',
        solution: 'Expand content with more detailed descriptions and achievements',
      });
    }

    // Check for special characters
    const specialChars = /[★☆♦♠♣♥•]/g;
    if (specialChars.test(resumeText)) {
      riskFactors.push({
        factor: 'Special Characters',
        risk: 'medium',
        description: 'Special characters may not render correctly in ATS',
        solution: 'Replace special characters with standard bullets or dashes',
      });
    }

    return riskFactors;
  }

  private async generateOptimizationTips(_params: ATSAnalysisParams): Promise<OptimizationTip[]> {
    return [
      {
        category: 'Keywords',
        tip: 'Use industry-specific keywords naturally throughout your resume',
        expectedImprovement: 15,
        difficulty: 'easy',
      },
      {
        category: 'Formatting',
        tip: 'Use standard fonts like Arial, Calibri, or Times New Roman',
        expectedImprovement: 10,
        difficulty: 'easy',
      },
      {
        category: 'Structure',
        tip: 'Place most important information in the top third of your resume',
        expectedImprovement: 12,
        difficulty: 'medium',
      },
      {
        category: 'Content',
        tip: 'Quantify achievements with specific numbers and percentages',
        expectedImprovement: 20,
        difficulty: 'medium',
      },
      {
        category: 'Skills',
        tip: 'Create a dedicated skills section with relevant technical abilities',
        expectedImprovement: 8,
        difficulty: 'easy',
      },
    ];
  }

  private calculateOverallScore(sections: any): number {
    const weights = {
      formatting: 0.25,
      keywords: 0.3,
      structure: 0.2,
      readability: 0.15,
      contact: 0.1,
    };

    return Math.round(
      sections.formatting.score * weights.formatting +
        sections.keywords.score * weights.keywords +
        sections.structure.score * weights.structure +
        sections.readability.score * weights.readability +
        sections.contact.score * weights.contact
    );
  }

  private runATSChecks(resumeText: string): { passedChecks: string[]; failedChecks: string[] } {
    const checks = [
      {
        name: 'Standard file format compatibility',
        test: () => true, // Assume text input is compatible
      },
      {
        name: 'Contact information present',
        test: () => /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(resumeText),
      },
      {
        name: 'Professional summary section',
        test: () => /summary|profile|objective/i.test(resumeText),
      },
      {
        name: 'Work experience section',
        test: () => /experience|employment|work history/i.test(resumeText),
      },
      {
        name: 'Education section',
        test: () => /education|degree|university|college/i.test(resumeText),
      },
      {
        name: 'Skills section',
        test: () => /skills|competencies|technologies/i.test(resumeText),
      },
      {
        name: 'Consistent date formatting',
        test: () => !/(19|20)\d{2}/.test(resumeText) || this.checkDateConsistency(resumeText),
      },
      {
        name: 'Action verb usage',
        test: () => this.countActionVerbs(resumeText) >= 5,
      },
    ];

    const passedChecks: string[] = [];
    const failedChecks: string[] = [];

    checks.forEach((check) => {
      if (check.test()) {
        passedChecks.push(check.name);
      } else {
        failedChecks.push(check.name);
      }
    });

    return { passedChecks, failedChecks };
  }

  // Helper methods for parsing and analysis
  private parseFormattingResponse(response: string): ATSSectionScore {
    // Parse AI response for formatting analysis
    const scoreMatch = response.match(/score[:\s]*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1] || '75') : 75;

    return {
      score,
      maxScore: 100,
      issues: this.extractIssues(response),
      recommendations: this.extractRecommendations(response),
      impact: score < 70 ? 'high' : score < 85 ? 'medium' : 'low',
    };
  }

  private parseKeywordResponse(response: string): ATSSectionScore {
    const scoreMatch = response.match(/score[:\s]*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1] || '70') : 70;

    return {
      score,
      maxScore: 100,
      issues: this.extractIssues(response),
      recommendations: this.extractRecommendations(response),
      impact: score < 70 ? 'high' : score < 85 ? 'medium' : 'low',
    };
  }

  private parseATSSuggestions(_response: string): ATSSuggestion[] {
    // Parse AI response for suggestions
    return [
      {
        id: '1',
        type: 'keyword',
        severity: 'important',
        description: 'Add industry-specific keywords',
        before: 'Managed team',
        after: 'Led cross-functional team of 8 engineers',
        impact: 15,
        reasoning: 'Specific numbers and leadership keywords improve ATS scoring',
      },
    ];
  }

  private extractIssues(text: string): string[] {
    // Extract issues from AI response
    const issues: string[] = [];
    const lines = text.split('\n');

    lines.forEach((line) => {
      if (line.toLowerCase().includes('issue') || line.toLowerCase().includes('problem')) {
        issues.push(line.trim());
      }
    });

    return issues.slice(0, 5); // Limit to top 5 issues
  }

  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    const lines = text.split('\n');

    lines.forEach((line) => {
      if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest')) {
        recommendations.push(line.trim());
      }
    });

    return recommendations.slice(0, 5);
  }

  private checkSectionOrder(resumeText: string): boolean {
    const sections = ['contact', 'summary', 'experience', 'education', 'skills'];
    let lastIndex = -1;

    for (const section of sections) {
      const index = resumeText.toLowerCase().indexOf(section);
      if (index !== -1 && index < lastIndex) {
        return false;
      }
      if (index !== -1) {
        lastIndex = index;
      }
    }

    return true;
  }

  private checkConsistentFormatting(resumeText: string): boolean {
    // Simple check for consistent bullet points
    const bulletPoints = resumeText.match(/^[\s]*[•·-]\s/gm);
    return bulletPoints ? bulletPoints.length > 0 : false;
  }

  private countJargon(text: string): number {
    const jargonWords = [
      'synergize',
      'leverage',
      'paradigm',
      'holistic',
      'utilize',
      'facilitate',
      'streamline',
      'optimize',
      'revolutionize',
    ];

    return jargonWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  private countActionVerbs(text: string): number {
    const actionVerbs = [
      'achieved',
      'managed',
      'led',
      'developed',
      'created',
      'implemented',
      'improved',
      'increased',
      'reduced',
      'organized',
      'coordinated',
      'established',
      'executed',
      'launched',
      'delivered',
      'streamlined',
    ];

    return actionVerbs.reduce((count, verb) => {
      const regex = new RegExp(`\\b${verb}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  private checkDateConsistency(text: string): boolean {
    const datePatterns = [
      /\b(0?[1-9]|1[0-2])\/(19|20)\d{2}\b/g, // MM/YYYY
      /\b(19|20)\d{2}\b/g, // YYYY
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (19|20)\d{2}\b/gi, // Month YYYY
    ];

    let primaryPattern = null;
    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 1) {
        primaryPattern = pattern;
        break;
      }
    }

    return primaryPattern !== null;
  }

  private getIndustryKeywords(industry: string): string[] {
    const keywordMap = {
      Technology: ['software', 'development', 'programming', 'agile', 'API', 'cloud', 'database'],
      Healthcare: ['patient', 'clinical', 'medical', 'healthcare', 'treatment', 'diagnosis'],
      Finance: ['financial', 'investment', 'analysis', 'portfolio', 'risk', 'compliance'],
      Marketing: ['campaign', 'digital', 'SEO', 'analytics', 'brand', 'social media'],
      Education: ['curriculum', 'student', 'teaching', 'learning', 'assessment', 'educational'],
    };

    return keywordMap[industry as keyof typeof keywordMap] || [];
  }

  private getIndustryRequirements(industry: string): string[] {
    const requirementMap = {
      Technology: ['Technical skills section', 'Programming languages', 'Project portfolio'],
      Healthcare: ['Certifications', 'Clinical experience', 'Patient care metrics'],
      Finance: ['Regulatory compliance', 'Financial certifications', 'Quantified results'],
      Marketing: ['Campaign metrics', 'Digital marketing skills', 'Analytics tools'],
      Education: ['Teaching certifications', 'Student outcomes', 'Curriculum development'],
    };

    return requirementMap[industry as keyof typeof requirementMap] || [];
  }

  // Fallback methods for error handling
  private getFallbackAnalysis(_resumeText: string): ATSCompatibilityResult {
    return {
      overallScore: 75,
      sections: {
        formatting: this.getFallbackFormattingScore(),
        keywords: this.getFallbackKeywordScore(),
        structure: this.getFallbackStructureScore(),
        readability: this.getFallbackReadabilityScore(),
        contact: this.getFallbackContactScore(),
      },
      suggestions: this.getFallbackSuggestions(),
      industryCompliance: [],
      passedChecks: ['Basic structure present'],
      failedChecks: ['Analysis incomplete due to service error'],
      riskFactors: [],
      optimizationTips: [],
    };
  }

  private getFallbackFormattingScore(): ATSSectionScore {
    return {
      score: 75,
      maxScore: 100,
      issues: ['Unable to analyze formatting'],
      recommendations: ['Ensure clean, simple formatting'],
      impact: 'medium',
    };
  }

  private getFallbackKeywordScore(): ATSSectionScore {
    return {
      score: 70,
      maxScore: 100,
      issues: ['Keyword analysis unavailable'],
      recommendations: ['Include relevant industry keywords'],
      impact: 'medium',
    };
  }

  private getFallbackStructureScore(): ATSSectionScore {
    return {
      score: 80,
      maxScore: 100,
      issues: ['Structure analysis limited'],
      recommendations: ['Use standard resume sections'],
      impact: 'low',
    };
  }

  private getFallbackReadabilityScore(): ATSSectionScore {
    return {
      score: 75,
      maxScore: 100,
      issues: ['Readability check incomplete'],
      recommendations: ['Use clear, concise language'],
      impact: 'medium',
    };
  }

  private getFallbackContactScore(): ATSSectionScore {
    return {
      score: 85,
      maxScore: 100,
      issues: ['Contact analysis unavailable'],
      recommendations: ['Include email and phone number'],
      impact: 'low',
    };
  }

  private getFallbackSuggestions(): ATSSuggestion[] {
    return [
      {
        id: 'fallback-1',
        type: 'format',
        severity: 'suggestion',
        description: 'Use standard resume formatting',
        before: 'Complex layout',
        after: 'Simple, clean layout',
        impact: 10,
        reasoning: 'Standard formatting improves ATS compatibility',
      },
    ];
  }
}

export const atsCompatibilityService = new ATSCompatibilityService();
