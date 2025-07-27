/**
 * AI-Powered Template Recommendation Service
 *
 * Advanced service for generating intelligent template recommendations
 * using machine learning algorithms and user behavior analysis
 */

import { ai } from '@/ai/genkit';
import type {
  AITemplateRecommendation,
  ExperienceLevel,
  IndustryTemplate,
  IndustryType,
  SkillsAlignment,
  SmartTemplateRecommendations,
  TemplateGenerationRequest,
  TemplateGenerationResponse,
  UserProfile,
} from '@/lib/types/templates';

export class AITemplateService {
  private readonly model = 'mistral-large-latest';
  private readonly temperature = 0.3;
  private readonly maxTokens = 3000;

  /**
   * Generate intelligent template recommendations based on user profile and job requirements
   */
  async generateRecommendations(
    userProfile: UserProfile,
    targetRole: string,
    targetIndustry: IndustryType,
    experienceLevel: ExperienceLevel,
    availableTemplates: IndustryTemplate[]
  ): Promise<SmartTemplateRecommendations> {
    const startTime = Date.now();

    try {
      const [
        primaryRecommendations,
        alternativeRecommendations,
        trendingRecommendations,
        personalizedRecommendations,
        industrySpecificRecommendations,
      ] = await Promise.all([
        this.generatePrimaryRecommendations(
          userProfile,
          targetRole,
          targetIndustry,
          experienceLevel,
          availableTemplates
        ),
        this.generateAlternativeRecommendations(
          userProfile,
          targetRole,
          targetIndustry,
          availableTemplates
        ),
        this.generateTrendingRecommendations(targetIndustry, experienceLevel, availableTemplates),
        this.generatePersonalizedRecommendations(userProfile, availableTemplates),
        this.generateIndustrySpecificRecommendations(
          targetIndustry,
          targetRole,
          availableTemplates
        ),
      ]);

      const processingTime = Date.now() - startTime;
      console.log(`AI Template Recommendations generated in ${processingTime}ms`);

      return {
        primary: primaryRecommendations,
        alternatives: alternativeRecommendations,
        trending: trendingRecommendations,
        personalized: personalizedRecommendations,
        industrySpecific: industrySpecificRecommendations,
      };
    } catch (error) {
      console.error('AI Template Recommendation Error:', error);
      return this.getFallbackRecommendations(availableTemplates, targetIndustry, experienceLevel);
    }
  }

  /**
   * Generate primary template recommendations using advanced AI analysis
   */
  private async generatePrimaryRecommendations(
    userProfile: UserProfile,
    targetRole: string,
    targetIndustry: IndustryType,
    experienceLevel: ExperienceLevel,
    availableTemplates: IndustryTemplate[]
  ): Promise<AITemplateRecommendation[]> {
    const prompt = `Analyze the following user profile and job requirements to recommend the best resume templates.

USER PROFILE:
- Name: ${userProfile.name}
- Current Role: ${userProfile.role || 'Not specified'}
- Industry: ${userProfile.industry || 'Not specified'}
- Experience Level: ${userProfile.experienceLevel || experienceLevel}
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}

TARGET JOB:
- Role: ${targetRole}
- Industry: ${targetIndustry}
- Experience Level: ${experienceLevel}

AVAILABLE TEMPLATES:
${availableTemplates
  .map(
    (t) => `
- ID: ${t.id}
- Name: ${t.name}
- Industry: ${t.industry}
- Category: ${t.category}
- Experience Levels: ${t.experienceLevel.join(', ')}
- ATS Score: ${t.atsScore}%
- Features: ${t.features.join(', ')}
- Tags: ${t.tags.join(', ')}
`
  )
  .join('\n')}

Provide recommendations in the following JSON format:
[
  {
    "templateId": "<template_id>",
    "confidence": <number 0-1>,
    "reasoning": "<detailed explanation>",
    "expectedImprovements": {
      "atsScore": <number 0-30>,
      "interviewRate": <number 0-50>,
      "responseRate": <number 0-60>
    },
    "customizationSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
    "industryAlignment": <number 0-1>,
    "roleAlignment": <number 0-1>,
    "experienceAlignment": <number 0-1>,
    "skillsAlignment": {
      "technicalSkills": {
        "matched": ["<skill1>", "<skill2>"],
        "missing": ["<skill1>", "<skill2>"],
        "recommended": ["<skill1>", "<skill2>"]
      },
      "softSkills": {
        "matched": ["<skill1>", "<skill2>"],
        "missing": ["<skill1>", "<skill2>"],
        "recommended": ["<skill1>", "<skill2>"]
      },
      "industrySpecific": {
        "matched": ["<skill1>", "<skill2>"],
        "missing": ["<skill1>", "<skill2>"],
        "recommended": ["<skill1>", "<skill2>"]
      }
    }
  }
]

Rank templates by:
1. Industry and role alignment
2. Experience level match
3. ATS optimization score
4. Feature relevance
5. User skill alignment

Return top 3 recommendations with highest confidence scores.`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
      });

      const recommendations = JSON.parse(response.text);
      return this.validateAndEnhanceRecommendations(recommendations, availableTemplates);
    } catch (error) {
      console.error('Primary recommendations error:', error);
      return this.getBasicRecommendations(availableTemplates, targetIndustry, experienceLevel, 3);
    }
  }

  /**
   * Generate alternative template recommendations for variety
   */
  private async generateAlternativeRecommendations(
    userProfile: UserProfile,
    targetRole: string,
    targetIndustry: IndustryType,
    availableTemplates: IndustryTemplate[]
  ): Promise<AITemplateRecommendation[]> {
    const prompt = `Generate alternative template recommendations that offer different approaches or styles for the same user profile.

USER PROFILE:
- Role: ${userProfile.role || 'Not specified'}
- Industry: ${userProfile.industry || 'Not specified'}
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}

TARGET: ${targetRole} in ${targetIndustry}

AVAILABLE TEMPLATES:
${availableTemplates.map((t) => `${t.id}: ${t.name} (${t.industry}, ${t.layout} layout, ${t.atsScore}% ATS)`).join('\n')}

Focus on:
1. Different layout styles (modern vs traditional)
2. Alternative industry approaches
3. Creative vs conservative options
4. Different feature sets

Provide 2-3 alternative recommendations in JSON format with confidence, reasoning, and expected improvements.`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: 0.4, // Slightly higher temperature for more variety
        maxTokens: 2000,
      });

      const recommendations = JSON.parse(response.text);
      return this.validateAndEnhanceRecommendations(recommendations, availableTemplates);
    } catch (error) {
      console.error('Alternative recommendations error:', error);
      return this.getBasicRecommendations(availableTemplates, targetIndustry, 'mid', 2);
    }
  }

  /**
   * Generate trending template recommendations based on current market trends
   */
  private async generateTrendingRecommendations(
    targetIndustry: IndustryType,
    experienceLevel: ExperienceLevel,
    availableTemplates: IndustryTemplate[]
  ): Promise<AITemplateRecommendation[]> {
    // Filter templates by popularity and recent usage
    const trendingTemplates = availableTemplates
      .filter((t) => t.popularity >= 4.5 && t.usageCount > 5000)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 3);

    return trendingTemplates.map((template) => ({
      templateId: template.id,
      confidence: 0.8,
      reasoning: `Trending template with ${template.popularity}/5 rating and ${template.usageCount.toLocaleString()} downloads`,
      expectedImprovements: {
        atsScore: 10,
        interviewRate: 15,
        responseRate: 20,
      },
      customizationSuggestions: [
        'Leverage current design trends',
        'Optimize for modern ATS systems',
        'Include trending industry keywords',
      ],
      industryAlignment: template.industry === targetIndustry ? 1.0 : 0.7,
      roleAlignment: 0.8,
      experienceAlignment: template.experienceLevel.includes(experienceLevel) ? 1.0 : 0.6,
    }));
  }

  /**
   * Generate personalized recommendations based on user history and preferences
   */
  private async generatePersonalizedRecommendations(
    userProfile: UserProfile,
    availableTemplates: IndustryTemplate[]
  ): Promise<AITemplateRecommendation[]> {
    const userPreferences = userProfile.preferences;
    if (!userPreferences) {
      return this.getBasicRecommendations(availableTemplates, 'technology', 'mid', 2);
    }

    // Filter templates based on user preferences
    const personalizedTemplates = availableTemplates.filter((template) => {
      const industryMatch = userPreferences.preferredIndustries.includes(template.industry);
      const layoutMatch = userPreferences.templatePreferences.layouts.includes(template.layout);
      const colorMatch = userPreferences.templatePreferences.colorSchemes.includes(
        template.colorScheme
      );

      return industryMatch || layoutMatch || colorMatch;
    });

    return personalizedTemplates.slice(0, 3).map((template) => ({
      templateId: template.id,
      confidence: 0.85,
      reasoning: 'Matches your personal preferences and past template choices',
      expectedImprovements: {
        atsScore: 12,
        interviewRate: 18,
        responseRate: 22,
      },
      customizationSuggestions: [
        'Customize with your preferred color scheme',
        'Adjust layout to match your style',
        'Include your preferred sections',
      ],
      industryAlignment: 0.9,
      roleAlignment: 0.8,
      experienceAlignment: 0.9,
    }));
  }

  /**
   * Generate industry-specific recommendations with deep domain knowledge
   */
  private async generateIndustrySpecificRecommendations(
    targetIndustry: IndustryType,
    targetRole: string,
    availableTemplates: IndustryTemplate[]
  ): Promise<AITemplateRecommendation[]> {
    const prompt = `Generate industry-specific template recommendations for ${targetRole} in ${targetIndustry}.

AVAILABLE TEMPLATES:
${availableTemplates
  .filter(
    (t) => t.industry === targetIndustry || t.tags.some((tag) => tag.includes(targetIndustry))
  )
  .map((t) => `${t.id}: ${t.name} - ${t.description}`)
  .join('\n')}

Consider industry-specific requirements:
- ${targetIndustry} hiring practices
- Common ATS systems in ${targetIndustry}
- Industry-specific keywords and terminology
- Professional standards and expectations
- Regulatory requirements (if applicable)

Provide 2-3 recommendations optimized specifically for ${targetIndustry} success.`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: this.temperature,
        maxTokens: 1500,
      });

      const recommendations = JSON.parse(response.text);
      return this.validateAndEnhanceRecommendations(recommendations, availableTemplates);
    } catch (error) {
      console.error('Industry-specific recommendations error:', error);

      // Fallback to industry-filtered templates
      const industryTemplates = availableTemplates
        .filter((t) => t.industry === targetIndustry)
        .slice(0, 2);

      return industryTemplates.map((template) => ({
        templateId: template.id,
        confidence: 0.75,
        reasoning: `Optimized for ${targetIndustry} industry standards and requirements`,
        expectedImprovements: {
          atsScore: 15,
          interviewRate: 20,
          responseRate: 25,
        },
        customizationSuggestions: [
          `Include ${targetIndustry}-specific keywords`,
          'Highlight relevant industry experience',
          'Use industry-standard formatting',
        ],
        industryAlignment: 1.0,
        roleAlignment: 0.8,
        experienceAlignment: 0.8,
      }));
    }
  }

  /**
   * Analyze job description and recommend templates
   */
  async analyzeJobDescriptionForTemplates(
    jobDescription: string,
    availableTemplates: IndustryTemplate[]
  ): Promise<AITemplateRecommendation[]> {
    const prompt = `Analyze this job description and recommend the most suitable resume templates.

JOB DESCRIPTION:
${jobDescription}

AVAILABLE TEMPLATES:
${availableTemplates.map((t) => `${t.id}: ${t.name} (${t.industry}, ${t.category})`).join('\n')}

Extract:
1. Industry and role requirements
2. Required skills and qualifications
3. Company culture indicators
4. ATS optimization needs
5. Experience level expectations

Recommend top 3 templates with detailed reasoning and customization suggestions.`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: this.temperature,
        maxTokens: 2000,
      });

      const recommendations = JSON.parse(response.text);
      return this.validateAndEnhanceRecommendations(recommendations, availableTemplates);
    } catch (error) {
      console.error('Job description analysis error:', error);
      return this.getBasicRecommendations(availableTemplates, 'technology', 'mid', 3);
    }
  }

  /**
   * Generate custom template based on specific requirements
   */
  async generateCustomTemplate(
    request: TemplateGenerationRequest
  ): Promise<TemplateGenerationResponse> {
    const startTime = Date.now();

    const prompt = `Generate a custom resume template based on these requirements:

USER PROFILE:
${JSON.stringify(request.userProfile, null, 2)}

TARGET ROLE: ${request.targetRole}
TARGET INDUSTRY: ${request.targetIndustry}
EXPERIENCE LEVEL: ${request.experienceLevel}

PREFERENCES:
${JSON.stringify(request.preferences, null, 2)}

CONTENT:
${JSON.stringify(request.content, null, 2)}

OPTIONS:
${JSON.stringify(request.options, null, 2)}

Generate a comprehensive template specification including:
1. Template metadata and configuration
2. Section layout and organization
3. Styling and design recommendations
4. ATS optimization features
5. Industry-specific customizations
6. Performance predictions

Provide response in JSON format with template specification, recommendations, and analytics.`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: 0.2, // Lower temperature for more consistent generation
        maxTokens: 4000,
      });

      const result = JSON.parse(response.text);
      const processingTime = Date.now() - startTime;

      return {
        templates: result.templates || [],
        recommendations: result.recommendations || [],
        analytics: result.analytics || [],
        customizations: result.customizations || [request.preferences],
        processingTime,
        confidence: result.confidence || 0.8,
      };
    } catch (error) {
      console.error('Custom template generation error:', error);
      throw new Error(
        `Failed to generate custom template: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Optimize existing template for specific requirements
   */
  async optimizeTemplate(
    template: IndustryTemplate,
    userProfile: UserProfile,
    targetRole: string,
    targetIndustry: IndustryType
  ): Promise<{ optimizedTemplate: IndustryTemplate; optimizations: string[] }> {
    const prompt = `Optimize this resume template for the specified user and target role:

CURRENT TEMPLATE:
${JSON.stringify(template, null, 2)}

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

TARGET: ${targetRole} in ${targetIndustry}

Provide optimizations for:
1. Section order and content
2. Keywords and terminology
3. Visual design and layout
4. ATS compatibility
5. Industry-specific requirements

Return optimized template and list of changes made.`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: this.temperature,
        maxTokens: 3000,
      });

      const result = JSON.parse(response.text);
      return {
        optimizedTemplate: result.optimizedTemplate || template,
        optimizations: result.optimizations || [],
      };
    } catch (error) {
      console.error('Template optimization error:', error);
      return {
        optimizedTemplate: template,
        optimizations: ['Unable to generate optimizations at this time'],
      };
    }
  }

  /**
   * Validate and enhance AI-generated recommendations
   */
  private validateAndEnhanceRecommendations(
    recommendations: any[],
    availableTemplates: IndustryTemplate[]
  ): AITemplateRecommendation[] {
    return recommendations
      .filter((rec) => {
        // Validate that template exists
        const template = availableTemplates.find((t) => t.id === rec.templateId);
        return template && rec.confidence >= 0.5;
      })
      .map((rec) => ({
        templateId: rec.templateId,
        confidence: Math.min(1.0, Math.max(0.0, rec.confidence)),
        reasoning: rec.reasoning || 'AI-generated recommendation',
        expectedImprovements: {
          atsScore: Math.min(30, Math.max(0, rec.expectedImprovements?.atsScore || 10)),
          interviewRate: Math.min(50, Math.max(0, rec.expectedImprovements?.interviewRate || 15)),
          responseRate: Math.min(60, Math.max(0, rec.expectedImprovements?.responseRate || 20)),
        },
        customizationSuggestions: rec.customizationSuggestions || [
          'Customize colors to match your personal brand',
          'Adjust sections based on your experience',
          'Optimize keywords for your target role',
        ],
        industryAlignment: Math.min(1.0, Math.max(0.0, rec.industryAlignment || 0.8)),
        roleAlignment: Math.min(1.0, Math.max(0.0, rec.roleAlignment || 0.8)),
        experienceAlignment: Math.min(1.0, Math.max(0.0, rec.experienceAlignment || 0.8)),
        skillsAlignment: rec.skillsAlignment || this.getDefaultSkillsAlignment(),
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get basic recommendations as fallback
   */
  private getBasicRecommendations(
    availableTemplates: IndustryTemplate[],
    targetIndustry: IndustryType,
    experienceLevel: ExperienceLevel,
    count = 3
  ): AITemplateRecommendation[] {
    const filtered = availableTemplates
      .filter(
        (t) =>
          t.industry === targetIndustry ||
          t.experienceLevel.includes(experienceLevel) ||
          t.atsScore >= 90
      )
      .sort((a, b) => b.atsScore - a.atsScore)
      .slice(0, count);

    return filtered.map((template, index) => ({
      templateId: template.id,
      confidence: 0.7 - index * 0.1,
      reasoning: `High-performing template with ${template.atsScore}% ATS score`,
      expectedImprovements: {
        atsScore: 10,
        interviewRate: 15,
        responseRate: 20,
      },
      customizationSuggestions: [
        'Customize for your specific role',
        'Add relevant keywords',
        'Highlight your key achievements',
      ],
      industryAlignment: template.industry === targetIndustry ? 1.0 : 0.7,
      roleAlignment: 0.8,
      experienceAlignment: template.experienceLevel.includes(experienceLevel) ? 1.0 : 0.7,
      skillsAlignment: this.getDefaultSkillsAlignment(),
    }));
  }

  /**
   * Get fallback recommendations when AI fails
   */
  private getFallbackRecommendations(
    availableTemplates: IndustryTemplate[],
    targetIndustry: IndustryType,
    experienceLevel: ExperienceLevel
  ): SmartTemplateRecommendations {
    const basic = this.getBasicRecommendations(
      availableTemplates,
      targetIndustry,
      experienceLevel,
      2
    );

    return {
      primary: basic,
      alternatives: basic.slice(0, 1),
      trending: basic.slice(0, 1),
      personalized: basic.slice(0, 1),
      industrySpecific: basic.slice(0, 1),
    };
  }

  /**
   * Get default skills alignment structure
   */
  private getDefaultSkillsAlignment(): SkillsAlignment {
    return {
      technicalSkills: {
        matched: [],
        missing: [],
        recommended: [],
      },
      softSkills: {
        matched: [],
        missing: [],
        recommended: [],
      },
      industrySpecific: {
        matched: [],
        missing: [],
        recommended: [],
      },
    };
  }

  /**
   * Calculate template compatibility score
   */
  calculateCompatibilityScore(
    template: IndustryTemplate,
    targetRole: string,
    targetIndustry: IndustryType,
    experienceLevel: ExperienceLevel
  ): number {
    let score = 0;

    // Industry alignment (30%)
    if (template.industry === targetIndustry) {
      score += 30;
    } else if (template.tags.some((tag) => tag.includes(targetIndustry))) {
      score += 20;
    }

    // Experience level alignment (25%)
    if (template.experienceLevel.includes(experienceLevel)) {
      score += 25;
    } else {
      const levelMap = { entry: 1, mid: 2, senior: 3, executive: 4 };
      const userLevel = levelMap[experienceLevel];
      const templateLevels = template.experienceLevel.map((l) => levelMap[l]);
      const closestLevel = templateLevels.reduce((prev, curr) =>
        Math.abs(curr - userLevel) < Math.abs(prev - userLevel) ? curr : prev
      );
      const difference = Math.abs(closestLevel - userLevel);
      score += Math.max(0, 25 - difference * 8);
    }

    // ATS score (20%)
    score += (template.atsScore / 100) * 20;

    // Feature relevance (15%)
    const relevantFeatures = template.features.filter(
      (feature) =>
        feature.toLowerCase().includes(targetIndustry) ||
        feature.toLowerCase().includes(targetRole.toLowerCase())
    );
    score += (relevantFeatures.length / template.features.length) * 15;

    // Popularity and usage (10%)
    score += (template.popularity / 5) * 10;

    return Math.min(100, Math.max(0, score));
  }
}

export const aiTemplateService = new AITemplateService();
