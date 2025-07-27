/**
 * Integration tests for Resume Optimizer Service Backend API Integration
 * Tests the complete flow of resume analysis with backend AI service
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { AnalysisLoadingState } from '../../hooks/useResumeAnalysis';
import type { ResumeAnalysisRequest } from '../../lib/types/resume-optimizer';
import {
  analyzeResume,
  checkBackendAvailability,
  ResumeAnalysisError,
  reanalyzeResume,
} from '../resumeOptimizerService';

// Mock environment variables
const originalEnv = process.env;

// Get reference to the global fetch mock
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('Resume Optimizer Service - Backend API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL = 'http://localhost:5000';

    // Reset the global fetch mock
    mockFetch.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('analyzeResume', () => {
    const mockRequest: ResumeAnalysisRequest = {
      resumeText:
        'John Smith\nSoftware Engineer with 5 years experience in React, Node.js, and TypeScript development. Built multiple web applications and led development teams.',
      targetJob: {
        title: 'Senior Software Engineer',
        keywords: 'React, Node.js, TypeScript',
        description: 'We are looking for a senior software engineer...',
        company: 'Tech Corp',
      },
      userId: 'test-user-123',
      templateId: 'software-engineer',
    };

    const mockBackendResponse = {
      success: true,
      data: {
        analysisId: 'analysis-123',
        overallScore: 85,
        atsCompatibilityScore: 90,
        keywordAnalysis: {
          score: 80,
          matchedKeywords: [
            {
              keyword: 'React',
              frequency: 3,
              relevanceScore: 0.9,
              context: ['Frontend development with React'],
            },
          ],
          missingKeywords: [
            {
              keyword: 'TypeScript',
              importance: 'high' as const,
              suggestedPlacement: ['skills', 'experience'],
              relatedTerms: ['JavaScript', 'Type Safety'],
            },
          ],
          keywordDensity: { React: 0.02 },
          recommendations: ['Add more TypeScript mentions'],
        },
        grammarAnalysis: {
          score: 95,
          totalIssues: 2,
          issues: [],
          readabilityScore: 88,
        },
        formatAnalysis: {
          score: 85,
          atsCompatibility: 90,
          issues: [],
          sectionStructure: [],
        },
        quantitativeAnalysis: {
          score: 75,
          achievementsWithNumbers: 3,
          totalAchievements: 5,
          suggestions: [],
          impactWords: ['improved', 'increased', 'developed'],
        },
        optimizationSuggestions: [
          {
            id: 'suggestion-1',
            type: 'keyword' as const,
            title: 'Add TypeScript keyword',
            description: 'Include TypeScript in your skills section',
            impact: 'high' as const,
            suggestion: 'Add TypeScript to technical skills',
            priority: 1,
            estimatedScoreImprovement: 10,
          },
        ],
        processingTime: 2500,
        createdAt: new Date().toISOString(),
      },
    };

    it('should successfully analyze resume with backend API', async () => {
      // Mock successful backend response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendResponse,
      } as Response);

      const progressStates: AnalysisLoadingState[] = [];
      const onProgress = (state: any) => {
        progressStates.push(state);
      };

      const result = await analyzeResume(mockRequest, onProgress);

      // Verify API call
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/resume/analyze',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Request-ID': expect.stringMatching(/^resume-analysis-\d+$/),
          }),
          body: JSON.stringify({
            resumeText: mockRequest.resumeText,
            targetJob: mockRequest.targetJob,
            analysisOptions: {
              includeATSAnalysis: true,
              includeKeywordAnalysis: true,
              includeGrammarCheck: true,
              includeQuantitativeAnalysis: true,
              includeFormatAnalysis: true,
            },
            userId: mockRequest.userId,
            templateId: mockRequest.templateId,
          }),
          credentials: 'include',
        })
      );

      // Verify result structure
      expect(result).toMatchObject({
        id: 'analysis-123',
        overallScore: 85,
        atsScore: 90,
        keywordAnalysis: expect.objectContaining({
          score: 80,
          matchedKeywords: expect.arrayContaining([
            expect.objectContaining({
              keyword: 'React',
              frequency: 3,
            }),
          ]),
        }),
        suggestions: expect.arrayContaining([
          expect.objectContaining({
            id: 'suggestion-1',
            type: 'keyword',
            title: 'Add TypeScript keyword',
          }),
        ]),
      });

      // Verify progress tracking
      expect(progressStates.length).toBeGreaterThan(0);
      expect(progressStates[0]).toMatchObject({
        isLoading: true,
        progress: 10,
        stage: 'parsing',
      });
      expect(progressStates[progressStates.length - 1]).toMatchObject({
        isLoading: false,
        progress: 100,
        message: 'Analysis complete!',
      });
    });

    it('should fallback to local analysis when backend is unavailable', async () => {
      // Mock network error for backend
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Mock successful local API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'local-analysis-123',
            overallScore: 75,
            atsScore: 80,
            keywordAnalysis: {
              score: 70,
              totalKeywords: 5,
              matchedKeywords: [],
              missingKeywords: [],
              keywordDensity: {},
              recommendations: [],
            },
            suggestions: [],
            grammarCheck: {
              score: 85,
              totalIssues: 0,
              issues: [],
              overallReadability: 90,
            },
            formatAnalysis: {
              score: 80,
              atsCompatibility: 85,
              issues: [],
              recommendations: [],
              sectionStructure: [],
            },
            quantitativeAnalysis: {
              score: 75,
              achievementsWithNumbers: 2,
              totalAchievements: 3,
              suggestions: [],
              impactWords: [],
            },
            createdAt: new Date().toISOString(),
            processingTime: 1500,
          },
        }),
      } as Response);

      const result = await analyzeResume(mockRequest);

      // Should have called backend first, then local API
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'http://localhost:5000/api/resume/analyze',
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        '/api/resume-optimizer/analyze',
        expect.any(Object)
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe('local-analysis-123');
    });

    it('should validate input parameters', async () => {
      // Test empty resume text
      const invalidRequest = {
        ...mockRequest,
        resumeText: '',
      };

      await expect(analyzeResume(invalidRequest)).rejects.toThrow(ResumeAnalysisError);
      await expect(analyzeResume(invalidRequest)).rejects.toThrow('too short');

      // Test missing job title
      const invalidRequest2 = {
        ...mockRequest,
        targetJob: { ...mockRequest.targetJob, title: '' },
      };

      await expect(analyzeResume(invalidRequest2)).rejects.toThrow(ResumeAnalysisError);
      await expect(analyzeResume(invalidRequest2)).rejects.toThrow('required');
    });

    it('should handle backend validation errors', async () => {
      // Mock validation error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Resume text is too short',
          code: 'INVALID_RESUME_TEXT',
          details: { minLength: 100 },
        }),
      } as Response);

      await expect(analyzeResume(mockRequest)).rejects.toThrow(ResumeAnalysisError);
      await expect(analyzeResume(mockRequest)).rejects.toThrow('Resume text is too short');
    });

    it('should handle authentication errors', async () => {
      // Mock authentication error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        }),
      } as Response);

      await expect(analyzeResume(mockRequest)).rejects.toThrow(ResumeAnalysisError);
      await expect(analyzeResume(mockRequest)).rejects.toThrow('Authentication required');
    });

    it('should handle rate limiting', async () => {
      // Mock rate limit error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          error: 'Too many requests',
          code: 'RATE_LIMITED',
        }),
      } as Response);

      await expect(analyzeResume(mockRequest)).rejects.toThrow(ResumeAnalysisError);
      await expect(analyzeResume(mockRequest)).rejects.toThrow('Too many requests');
    });
  });

  describe('reanalyzeResume', () => {
    const mockResumeText =
      'Updated resume text with TypeScript experience and comprehensive background in software development with multiple years of experience in various technologies and frameworks.';
    const mockOriginalAnalysisId = 'original-analysis-123';
    const mockTargetJob = {
      title: 'Senior Software Engineer',
      keywords: 'React, Node.js, TypeScript',
    };

    it('should successfully re-analyze resume', async () => {
      // Mock successful re-analysis response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            analysisId: 'reanalysis-456',
            overallScore: 90,
            atsCompatibilityScore: 92,
            keywordAnalysis: {
              score: 85,
              matchedKeywords: [],
              missingKeywords: [],
              keywordDensity: {},
              recommendations: [],
            },
            grammarAnalysis: {
              score: 95,
              totalIssues: 1,
              issues: [],
              readabilityScore: 90,
            },
            formatAnalysis: {
              score: 88,
              atsCompatibility: 92,
              issues: [],
              sectionStructure: [],
            },
            quantitativeAnalysis: {
              score: 80,
              achievementsWithNumbers: 4,
              totalAchievements: 5,
              suggestions: [],
              impactWords: [],
            },
            optimizationSuggestions: [],
            processingTime: 2000,
            createdAt: new Date().toISOString(),
          },
        }),
      } as Response);

      const result = await reanalyzeResume(mockResumeText, mockOriginalAnalysisId, mockTargetJob);

      // Verify API call
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/resume/reanalyze',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining(mockResumeText),
        })
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe('reanalysis-456');
      expect(result?.overallScore).toBe(90);
    });

    it('should fallback to local re-analysis when backend fails', async () => {
      // Mock backend failure
      mockFetch.mockRejectedValueOnce(new Error('Backend unavailable'));

      // Mock local re-analysis response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'local-reanalysis-789',
            overallScore: 85,
            atsScore: 88,
            keywordAnalysis: {
              score: 80,
              totalKeywords: 5,
              matchedKeywords: [],
              missingKeywords: [],
              keywordDensity: {},
              recommendations: [],
            },
            suggestions: [],
            grammarCheck: {
              score: 90,
              totalIssues: 0,
              issues: [],
              overallReadability: 92,
            },
            formatAnalysis: {
              score: 85,
              atsCompatibility: 88,
              issues: [],
              recommendations: [],
              sectionStructure: [],
            },
            quantitativeAnalysis: {
              score: 82,
              achievementsWithNumbers: 3,
              totalAchievements: 4,
              suggestions: [],
              impactWords: [],
            },
            createdAt: new Date().toISOString(),
            processingTime: 1800,
          },
        }),
      } as Response);

      const result = await reanalyzeResume(mockResumeText, mockOriginalAnalysisId, mockTargetJob);

      // Should have tried backend first, then local
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result?.id).toBe('local-reanalysis-789');
    });
  });

  describe('checkBackendAvailability', () => {
    it('should return true when backend is available', async () => {
      // Mock successful health check
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      const isAvailable = await checkBackendAvailability();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/health',
        expect.objectContaining({
          method: 'GET',
          headers: { Accept: 'application/json' },
        })
      );

      expect(isAvailable).toBe(true);
    });

    it('should return false when backend is unavailable', async () => {
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const isAvailable = await checkBackendAvailability();

      expect(isAvailable).toBe(false);
    });

    it('should return false when backend returns error status', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const isAvailable = await checkBackendAvailability();

      expect(isAvailable).toBe(false);
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle different resume content lengths', async () => {
      const validResumeText =
        'John Smith\nSoftware Developer with comprehensive background and experience in software development with multiple years of professional experience.';

      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            analysisId: 'test-valid',
            overallScore: 75,
            atsCompatibilityScore: 80,
            keywordAnalysis: {
              score: 70,
              matchedKeywords: [],
              missingKeywords: [],
              keywordDensity: {},
              recommendations: [],
            },
            grammarAnalysis: {
              score: 80,
              totalIssues: 0,
              issues: [],
              readabilityScore: 85,
            },
            formatAnalysis: {
              score: 75,
              atsCompatibility: 80,
              issues: [],
              sectionStructure: [],
            },
            quantitativeAnalysis: {
              score: 70,
              achievementsWithNumbers: 2,
              totalAchievements: 3,
              suggestions: [],
              impactWords: [],
            },
            optimizationSuggestions: [],
            processingTime: 1500,
            createdAt: new Date().toISOString(),
          },
        }),
      } as Response);

      // Should succeed for valid length
      const result = await analyzeResume({
        resumeText: validResumeText,
        targetJob: { title: 'Test Job', keywords: 'test' },
      });
      expect(result).toBeDefined();
      expect(result?.id).toBe('test-valid');
    });
  });
});

describe('Resume Optimizer Service - Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL = 'http://localhost:5000';

    // Reset the global fetch mock
    mockFetch.mockClear();
  });

  it('should handle concurrent analysis requests', async () => {
    // Mock multiple successful responses
    for (let i = 0; i < 3; i++) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            analysisId: `concurrent-${i}`,
            overallScore: 75 + i,
            atsCompatibilityScore: 80 + i,
            keywordAnalysis: {
              score: 70,
              matchedKeywords: [],
              missingKeywords: [],
              keywordDensity: {},
              recommendations: [],
            },
            grammarAnalysis: {
              score: 80,
              totalIssues: 0,
              issues: [],
              readabilityScore: 85,
            },
            formatAnalysis: {
              score: 75,
              atsCompatibility: 80,
              issues: [],
              sectionStructure: [],
            },
            quantitativeAnalysis: {
              score: 70,
              achievementsWithNumbers: 2,
              totalAchievements: 3,
              suggestions: [],
              impactWords: [],
            },
            optimizationSuggestions: [],
            processingTime: 1500,
            createdAt: new Date().toISOString(),
          },
        }),
      } as Response);
    }

    const requests = Array.from({ length: 3 }, (_, i) =>
      analyzeResume({
        resumeText: `Resume content ${i} with comprehensive background and experience in software development with multiple years of professional experience.`,
        targetJob: { title: `Job ${i}`, keywords: 'test' },
      })
    );

    const results = await Promise.all(requests);

    expect(results).toHaveLength(3);
    results.forEach((result, i) => {
      expect(result?.id).toBe(`concurrent-${i}`);
      expect(result?.overallScore).toBe(75 + i);
    });
  });

  it('should handle large resume content efficiently', async () => {
    const largeResumeText =
      'Large resume content with comprehensive background and experience in software development.\n'.repeat(
        1000
      ); // ~100KB

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          analysisId: 'large-content-test',
          overallScore: 80,
          atsCompatibilityScore: 85,
          keywordAnalysis: {
            score: 75,
            matchedKeywords: [],
            missingKeywords: [],
            keywordDensity: {},
            recommendations: [],
          },
          grammarAnalysis: {
            score: 85,
            totalIssues: 0,
            issues: [],
            readabilityScore: 90,
          },
          formatAnalysis: {
            score: 80,
            atsCompatibility: 85,
            issues: [],
            sectionStructure: [],
          },
          quantitativeAnalysis: {
            score: 75,
            achievementsWithNumbers: 3,
            totalAchievements: 4,
            suggestions: [],
            impactWords: [],
          },
          optimizationSuggestions: [],
          processingTime: 3000,
          createdAt: new Date().toISOString(),
        },
      }),
    } as Response);

    const startTime = Date.now();
    const result = await analyzeResume({
      resumeText: largeResumeText,
      targetJob: { title: 'Test Job', keywords: 'test' },
    });
    const endTime = Date.now();

    expect(result).toBeDefined();
    expect(result?.id).toBe('large-content-test');

    // Should complete within reasonable time (adjust threshold as needed)
    expect(endTime - startTime).toBeLessThan(5000);
  }, 10000); // 10 second timeout for large content test
});
