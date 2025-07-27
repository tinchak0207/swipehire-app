/**
 * Enhanced AI Service Tests
 *
 * Comprehensive test suite for the AI services including caching,
 * rate limiting, and core functionality.
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { aiCache } from '../../lib/aiCache';
import { aiRateLimiter } from '../../lib/aiRateLimit';
import type { CompanyQAInput, ProfileRecommenderInput } from '../../lib/types';
import aiService from '../enhancedAIService';

// Mock AI dependencies
jest.mock('../../ai/genkit', () => ({
  ai: {
    generate: jest.fn(),
    isAvailable: jest.fn(() => true),
    getAvailableModels: jest.fn(() => ['mistral-small', 'mistral-large-latest']),
  },
  AIError: class AIError extends Error {
    constructor(
      message: string,
      public code?: string,
      public statusCode?: number
    ) {
      super(message);
      this.name = 'AIError';
    }
  },
}));

// Test data

const mockProfileInput: ProfileRecommenderInput = {
  candidateProfile: {
    id: 'candidate-123',
    role: 'Software Engineer',
    experienceSummary: 'Full-stack developer with 5 years experience',
    skills: ['React', 'TypeScript', 'Node.js'],
    location: 'San Francisco, CA',
    desiredWorkStyle: 'Remote',
    pastProjects: 'Built multiple web applications',
    workExperienceLevel: 'SENIOR' as any,
    educationLevel: 'BACHELOR' as any,
    locationPreference: 'REMOTE' as any,
    languages: ['English'],
    salaryExpectationMin: 80000,
    salaryExpectationMax: 120000,
    availability: 'IMMEDIATE' as any,
    jobTypePreference: ['FULL_TIME'] as any,
    personalityAssessment: [],
  },
  jobCriteria: {
    title: 'Senior Frontend Developer',
    description: 'A senior frontend developer role',
    requiredSkills: ['React', 'TypeScript', 'JavaScript'],
    companyIndustry: 'Technology',
    companyCultureKeywords: ['Innovation', 'Collaboration'],
    // salaryRange: { min: 90000, max: 130000 },
  },
};

const mockCompanyQAInput: CompanyQAInput = {
  companyName: 'TechCorp',
  companyIndustry: 'Technology',
  companyDescription: 'Leading software company',
  companyCultureKeywords: ['Innovation', 'Diversity'],
  question: 'What is the company culture like?',
};

describe('AI Service', () => {
  const mockGenerate = jest.mocked(require('../../ai/genkit').ai.generate);

  beforeEach(() => {
    jest.clearAllMocks();
    aiCache.clear();

    // Setup default mock response
    mockGenerate.mockResolvedValue({
      text: JSON.stringify({
        candidateId: 'candidate-123',
        matchScore: 85,
        reasoning: 'Strong technical skills match',
        weightedScores: {
          skillsMatchScore: 90,
          experienceRelevanceScore: 85,
          cultureFitScore: 80,
          growthPotentialScore: 85,
        },
        isUnderestimatedTalent: false,
        personalityAssessment: [
          { trait: 'Technical', fit: 'positive', reason: 'Strong technical background' },
        ],
        optimalWorkStyles: ['Remote', 'Collaborative'],
        candidateJobFitAnalysis: {
          matchScoreForCandidate: 88,
          reasoningForCandidate: 'Great growth opportunity',
          weightedScoresForCandidate: {
            cultureFitScore: 85,
            jobRelevanceScore: 90,
            growthOpportunityScore: 88,
            jobConditionFitScore: 85,
          },
        },
      }),
      model: 'mistral-small',
    });
  });

  afterEach(() => {
    aiCache.clear();
  });

  describe('Profile Recommendation', () => {
    it('should successfully recommend a profile', async () => {
      const result = await aiService.recommendProfile(mockProfileInput);

      expect(result).toBeDefined();
      expect(result.candidateId).toBe('candidate-123');
      expect(result.matchScore).toBe(85);
      expect(result.weightedScores).toBeDefined();
      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mistral-small',
          temperature: 0.2,
          maxTokens: 2500,
        })
      );
    });

    it('should handle AI service errors gracefully', async () => {
      mockGenerate.mockRejectedValue(new Error('API Error'));

      await expect(aiService.recommendProfile(mockProfileInput)).rejects.toThrow(
        'Profile recommendation failed'
      );
    });

    it('should handle malformed JSON responses', async () => {
      mockGenerate.mockResolvedValue({
        text: 'Invalid JSON response',
        model: 'mistral-small',
      });

      const result = await aiService.recommendProfile(mockProfileInput);

      expect(result).toBeDefined();
      expect(result.matchScore).toBe(50); // Fallback value
    });

    it('should respect retry logic on failures', async () => {
      mockGenerate
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockRejectedValueOnce(new Error('Another error'))
        .mockResolvedValueOnce({
          text: JSON.stringify({ candidateId: 'candidate-123', matchScore: 75 }),
          model: 'mistral-small',
        });

      const result = await aiService.recommendProfile(mockProfileInput);

      expect(mockGenerate).toHaveBeenCalledTimes(3);
      expect(result.candidateId).toBe('candidate-123');
    });
  });

  describe('Company Q&A', () => {
    it('should answer company questions', async () => {
      mockGenerate.mockResolvedValue({
        text: JSON.stringify({
          answer: 'TechCorp has a collaborative and innovative culture',
          confidence: 85,
          sources: ['Company description', 'Culture keywords'],
        }),
        model: 'mistral-small',
      });

      const result = await aiService.answerCompanyQuestion(mockCompanyQAInput);

      expect(result.answer).toContain('collaborative');
      expect(result.confidence).toBe(85);
      expect(result.sources).toHaveLength(2);
    });

    it('should use longer cache TTL for company info', async () => {
      const cacheSetSpy = jest.spyOn(aiCache, 'set');

      await aiService.answerCompanyQuestion(mockCompanyQAInput);

      expect(cacheSetSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        3600000 // 1 hour
      );
    });
  });

  describe('Video Script Generation', () => {
    it('should generate video scripts', async () => {
      mockGenerate.mockResolvedValue({
        text: JSON.stringify({
          script: 'Hello, I am excited to introduce myself...',
          tips: ['Practice multiple times', 'Maintain eye contact'],
        }),
        model: 'mistral-small',
      });

      const result = await aiService.generateVideoScript({
        candidateProfile: 'Software engineer with React experience',
        jobDescription: 'Frontend developer role',
        tone: 'professional',
        duration: 60,
      });

      expect(result.script).toContain('Hello');
      expect(result.tips).toHaveLength(2);
    });

    it('should use appropriate temperature for creative content', async () => {
      await aiService.generateVideoScript({
        candidateProfile: 'Test profile',
        tone: 'enthusiastic' as any,
      });

      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7, // Higher temperature for creative content
        })
      );
    });
  });

  describe('Icebreaker Generation', () => {
    it('should generate icebreaker messages', async () => {
      mockGenerate.mockResolvedValue({
        text: JSON.stringify({
          icebreaker: 'Hi! I noticed your React skills align perfectly with our needs.',
          alternatives: [
            'Your background looks like a great fit!',
            'Would love to discuss this opportunity with you.',
          ],
        }),
        model: 'mistral-small',
      });

      const result = await aiService.generateIcebreaker({
        candidateProfile: mockProfileInput.candidateProfile,
        jobCriteria: mockProfileInput.jobCriteria,
        tone: 'friendly',
      });

      expect(result.icebreaker).toContain('React');
      expect(result.alternatives).toHaveLength(2);
      expect(result.icebreakerQuestion).toBe(result.icebreaker);
    });
  });

  describe('Resume Analysis', () => {
    it('should analyze resumes', async () => {
      mockGenerate.mockResolvedValue({
        text: JSON.stringify({
          score: 78,
          feedback: ['Strong technical skills', 'Good project descriptions'],
          strengths: ['Technical expertise', 'Clear formatting'],
          improvements: ['Add more quantified achievements', 'Include soft skills'],
        }),
        model: 'mistral-small',
      });

      const resumeText = 'John Doe\nSoftware Engineer\n5 years experience with React...';
      const result = await aiService.analyzeResume(resumeText);

      expect(result.score).toBe(78);
      expect(result.feedback).toHaveLength(2);
      expect(result.strengths).toHaveLength(2);
      expect(result.improvements).toHaveLength(2);
    });

    it('should use lower temperature for analytical content', async () => {
      await aiService.analyzeResume('Test resume content');

      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.3, // Lower temperature for analysis
        })
      );
    });
  });

  describe('Caching Functionality', () => {
    it('should cache responses and reuse them', async () => {
      // First call
      await aiService.recommendProfile(mockProfileInput);
      expect(mockGenerate).toHaveBeenCalledTimes(1);

      // Second call with same parameters should use cache
      await aiService.recommendProfile(mockProfileInput);
      expect(mockGenerate).toHaveBeenCalledTimes(1); // No additional calls
    });
  });
});

describe('AI Cache', () => {
  beforeEach(() => {
    aiCache.clear();
  });

  it('should cache and retrieve responses', () => {
    const fingerprint = {
      prompt: 'test prompt',
      model: 'mistral-small',
      temperature: 0.7,
      maxTokens: 1000,
    };

    const response = {
      text: 'test response',
      model: 'mistral-small',
    };

    aiCache.set(fingerprint, response);
    const cached = aiCache.get(fingerprint);

    expect(cached).toEqual(response);
  });

  it('should return null for non-existent cache entries', () => {
    const fingerprint = {
      prompt: 'non-existent prompt',
      model: 'mistral-small',
    };

    const cached = aiCache.get(fingerprint);
    expect(cached).toBeNull();
  });

  it('should handle cache expiration', () => {
    const fingerprint = {
      prompt: 'expiring prompt',
      model: 'mistral-small',
    };

    const response = {
      text: 'expiring response',
      model: 'mistral-small',
    };

    // Set with very short TTL
    aiCache.set(fingerprint, response, 1); // 1ms TTL

    // Wait for expiration
    setTimeout(() => {
      const cached = aiCache.get(fingerprint);
      expect(cached).toBeNull();
    }, 10);
  });
});

describe('AI Rate Limiter', () => {
  beforeEach(() => {
    // Reset rate limiter state
    aiRateLimiter.getUsageMetrics(); // This helps clean up internal state
  });

  it('should allow requests within limits', async () => {
    const result = await aiRateLimiter.checkRateLimit('user-1', 'free', 1000);

    expect(result.allowed).toBe(true);
    expect(result.remainingRequests).toBeGreaterThan(0);
  });

  it('should block requests when limits exceeded', async () => {
    const userId = 'user-2';
    const userType = 'guest';

    // Make multiple requests to exceed the limit (guest: 2 per minute)
    await aiRateLimiter.checkRateLimit(userId, userType, 100);
    aiRateLimiter.recordRequest(userId, 100, userType);

    await aiRateLimiter.checkRateLimit(userId, userType, 100);
    aiRateLimiter.recordRequest(userId, 100, userType);

    // Third request should be blocked
    const result = await aiRateLimiter.checkRateLimit(userId, userType, 100);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Rate limit exceeded');
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('should track usage metrics', () => {
    const userId = 'user-3';

    aiRateLimiter.recordRequest(userId, 500, 'free');
    aiRateLimiter.recordRequest(userId, 300, 'free');

    const metrics = aiRateLimiter.getUsageMetrics(userId);

    expect(metrics.totalRequests).toBe(2);
    expect(metrics.totalTokens).toBe(800);
    expect(metrics.estimatedCost).toBeGreaterThan(0);
  });
});
