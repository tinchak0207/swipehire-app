import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ai } from '@/ai/genkit';
import type { TargetJobInfo } from '@/lib/types/resume-optimizer';
import { AIResumeAnalyzer } from './ai-resume-analyzer';

// Mock the AI service
jest.mock('@/ai/genkit', () => ({
  ai: {
    generate: jest.fn(),
    isAvailable: jest.fn(),
  },
}));

const mockAI = ai as jest.Mocked<typeof ai>;

describe('AIResumeAnalyzer', () => {
  let analyzer: AIResumeAnalyzer;

  const sampleResumeText = `
    John Doe
    Software Engineer
    john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe
    
    EXPERIENCE
    Senior Software Engineer | Tech Corp | 2020-2023
    • Developed React applications serving 100,000+ users
    • Improved system performance by 40% through optimization
    • Led a team of 5 developers on critical projects
    
    Software Engineer | StartupXYZ | 2018-2020
    • Built scalable Node.js APIs handling 1M+ requests daily
    • Implemented CI/CD pipelines reducing deployment time by 60%
    
    EDUCATION
    Bachelor of Science in Computer Science | University ABC | 2018
    
    SKILLS
    JavaScript, TypeScript, React, Node.js, AWS, Docker, Kubernetes
  `;

  const sampleTargetJob: TargetJobInfo = {
    title: 'Senior Full Stack Developer',
    company: 'Google',
    description:
      'We are looking for a senior full stack developer with experience in React, Node.js, and cloud technologies.',
    keywords: 'React, Node.js, TypeScript, AWS, Docker, Kubernetes, Python, GraphQL',
  };

  beforeEach(() => {
    analyzer = new AIResumeAnalyzer();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('analyzeResume', () => {
    it('should perform comprehensive AI analysis when AI is available', async () => {
      // Mock AI responses
      mockAI.isAvailable.mockReturnValue(true);

      const mockKeywordResponse = {
        text: JSON.stringify({
          score: 85,
          totalKeywords: 8,
          matchedKeywords: [
            {
              keyword: 'React',
              frequency: 2,
              relevanceScore: 0.9,
              context: ['React applications'],
            },
            { keyword: 'Node.js', frequency: 2, relevanceScore: 0.9, context: ['Node.js APIs'] },
            { keyword: 'TypeScript', frequency: 1, relevanceScore: 0.8, context: ['TypeScript'] },
          ],
          missingKeywords: [
            {
              keyword: 'Python',
              importance: 'medium',
              suggestedPlacement: ['skills'],
              relatedTerms: [],
            },
            {
              keyword: 'GraphQL',
              importance: 'low',
              suggestedPlacement: ['skills'],
              relatedTerms: [],
            },
          ],
          keywordDensity: { React: 2.1, 'Node.js': 2.1 },
          recommendations: [
            'Add Python to skills section',
            'Consider mentioning GraphQL experience',
          ],
        }),
      };

      const mockGrammarResponse = {
        text: JSON.stringify({
          score: 92,
          totalIssues: 1,
          overallReadability: 88,
          issues: [
            {
              type: 'style',
              severity: 'low',
              message: 'Consider using active voice',
              suggestion: 'Change "was responsible for" to "managed"',
              position: { start: 100, end: 120 },
              context: 'was responsible for managing',
            },
          ],
        }),
      };

      const mockFormatResponse = {
        text: JSON.stringify({
          score: 88,
          atsCompatibility: 85,
          issues: [
            {
              type: 'formatting',
              severity: 'low',
              message: 'Inconsistent date formatting',
              suggestion: 'Use consistent MM/YYYY format',
            },
          ],
          recommendations: ['Use consistent bullet points', 'Ensure proper section headers'],
          sectionStructure: [
            { name: 'Contact Information', present: true, order: 1, recommended: true },
            { name: 'Experience', present: true, order: 2, recommended: true },
            { name: 'Education', present: true, order: 3, recommended: true },
            { name: 'Skills', present: true, order: 4, recommended: true },
          ],
        }),
      };

      const mockQuantitativeResponse = {
        text: JSON.stringify({
          score: 75,
          achievementsWithNumbers: 4,
          totalAchievements: 6,
          impactWords: ['improved', 'developed', 'led', 'built', 'implemented'],
          suggestions: [
            {
              type: 'add_metrics',
              description: 'Add more quantifiable results',
              example: 'Reduced load time by 25%',
            },
          ],
        }),
      };

      const mockSuggestionsResponse = {
        text: JSON.stringify([
          {
            id: 'ai_suggestion_1',
            type: 'keyword',
            title: 'Add Missing Keywords',
            description: 'Include Python and GraphQL to improve keyword match',
            impact: 'medium',
            suggestion: 'Add Python and GraphQL to your skills section',
            section: 'skills',
            priority: 2,
            estimatedScoreImprovement: 8,
            category: 'content',
          },
          {
            id: 'ai_suggestion_2',
            type: 'achievement',
            title: 'Quantify More Achievements',
            description: 'Add specific metrics to demonstrate impact',
            impact: 'high',
            suggestion: 'Include percentage improvements and specific numbers',
            section: 'experience',
            priority: 1,
            estimatedScoreImprovement: 12,
            category: 'content',
          },
        ]),
      };

      const mockAssessmentResponse = {
        text: JSON.stringify({
          strengths: [
            'Strong technical experience with relevant technologies',
            'Quantified achievements showing measurable impact',
            'Clear career progression',
          ],
          weaknesses: [
            'Missing some key technologies mentioned in job description',
            'Could benefit from more leadership examples',
          ],
        }),
      };

      const mockOptimizedContentResponse = {
        text: `${sampleResumeText}\n\nSKILLS (Updated)\nJavaScript, TypeScript, React, Node.js, AWS, Docker, Kubernetes, Python, GraphQL`,
      };

      // Set up mock responses in order of calls
      mockAI.generate
        .mockResolvedValueOnce({ ...mockKeywordResponse, model: 'test-model' })
        .mockResolvedValueOnce({ ...mockGrammarResponse, model: 'test-model' })
        .mockResolvedValueOnce({ ...mockFormatResponse, model: 'test-model' })
        .mockResolvedValueOnce({ ...mockQuantitativeResponse, model: 'test-model' })
        .mockResolvedValueOnce({ ...mockAssessmentResponse, model: 'test-model' })
        .mockResolvedValueOnce({ ...mockSuggestionsResponse, model: 'test-model' })
        .mockResolvedValueOnce({ ...mockOptimizedContentResponse, model: 'test-model' });

      const result = await analyzer.analyzeResume(sampleResumeText, sampleTargetJob);

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.atsScore).toBeGreaterThan(0);
      expect(result.keywordAnalysis.score).toBe(85);
      expect(result.grammarCheck.score).toBe(92);
      expect(result.formatAnalysis.score).toBe(88);
      expect(result.quantitativeAnalysis.score).toBe(75);
      expect(result.suggestions).toHaveLength(2);
      expect(result.strengths).toHaveLength(3);
      expect(result.weaknesses).toHaveLength(2);
      expect((result.metadata as any).aiModel).toBe('mistral-large-latest');
      expect((result.metadata as any).analysisVersion).toBe('2.0');
    });

    it('should handle AI service errors gracefully', async () => {
      mockAI.isAvailable.mockReturnValue(true);
      mockAI.generate.mockRejectedValue(new Error('AI service error'));

      await expect(analyzer.analyzeResume(sampleResumeText, sampleTargetJob)).rejects.toThrow(
        'Failed to analyze resume'
      );
    });

    it('should provide fallback analysis when AI parsing fails', async () => {
      mockAI.isAvailable.mockReturnValue(true);
      mockAI.generate.mockResolvedValue({ text: 'invalid json', model: 'test-model' });

      const result = await analyzer.analyzeResume(sampleResumeText, sampleTargetJob);

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.keywordAnalysis).toBeDefined();
      expect(result.grammarCheck).toBeDefined();
      expect(result.formatAnalysis).toBeDefined();
      expect(result.quantitativeAnalysis).toBeDefined();
    });

    it('should calculate scores correctly', async () => {
      mockAI.isAvailable.mockReturnValue(true);

      // Mock responses with specific scores
      const mockResponses = [
        {
          text: JSON.stringify({
            score: 80,
            totalKeywords: 5,
            matchedKeywords: [],
            missingKeywords: [],
            keywordDensity: {},
            recommendations: [],
          }),
          model: 'test-model',
        },
        {
          text: JSON.stringify({ score: 90, totalIssues: 0, overallReadability: 90, issues: [] }),
          model: 'test-model',
        },
        {
          text: JSON.stringify({
            score: 85,
            atsCompatibility: 80,
            issues: [],
            recommendations: [],
            sectionStructure: [],
          }),
          model: 'test-model',
        },
        {
          text: JSON.stringify({
            score: 70,
            achievementsWithNumbers: 3,
            totalAchievements: 5,
            impactWords: [],
            suggestions: [],
          }),
          model: 'test-model',
        },
        {
          text: JSON.stringify({
            strengths: ['Good structure'],
            weaknesses: ['Needs improvement'],
          }),
          model: 'test-model',
        },
        { text: JSON.stringify([]), model: 'test-model' },
        { text: sampleResumeText, model: 'test-model' },
      ];

      mockResponses.forEach((response) => {
        mockAI.generate.mockResolvedValueOnce(response);
      });

      const result = await analyzer.analyzeResume(sampleResumeText, sampleTargetJob);

      // Overall score should be weighted average: 80*0.35 + 90*0.25 + 85*0.25 + 70*0.15 = 81.5
      expect(result.overallScore).toBe(82); // Rounded

      // ATS score should be: 80*0.5 + 85*0.3 + 80*0.2 = 81.5
      expect(result.atsScore).toBe(82); // Rounded
    });

    it('should handle empty resume text', async () => {
      await expect(analyzer.analyzeResume('', sampleTargetJob)).rejects.toThrow();
    });

    it('should process different resume formats', async () => {
      const bulletPointResume = `
        • Software Engineer with 5 years experience
        • Proficient in React, Node.js, Python
        • Led team of 10 developers
        • Increased performance by 50%
      `;

      mockAI.isAvailable.mockReturnValue(true);

      // Mock minimal responses
      const mockResponses = Array(7).fill({ text: JSON.stringify({}), model: 'test-model' });
      mockResponses.forEach((response) => {
        mockAI.generate.mockResolvedValueOnce(response);
      });

      const result = await analyzer.analyzeResume(bulletPointResume, sampleTargetJob);
      expect(result).toBeDefined();
      expect((result.metadata as any).wordCount).toBeGreaterThan(0);
    });
  });

  describe('score calculation', () => {
    it('should calculate overall score with correct weights', () => {
      const scores = {
        keywordScore: 80,
        grammarScore: 90,
        formatScore: 85,
        quantitativeScore: 70,
      };

      // Access private method through any cast for testing
      const overallScore = (analyzer as any).calculateOverallScore(scores);

      // Expected: 80*0.35 + 90*0.25 + 85*0.25 + 70*0.15 = 81.5 -> 82
      expect(overallScore).toBe(82);
    });

    it('should calculate ATS score correctly', () => {
      const scores = {
        keywordScore: 80,
        formatScore: 85,
        structureScore: 75,
      };

      const atsScore = (analyzer as any).calculateATSScore(scores);

      // Expected: 80*0.5 + 85*0.3 + 75*0.2 = 80.5 -> 81
      expect(atsScore).toBe(81);
    });

    it('should cap scores at 100', () => {
      const highScores = {
        keywordScore: 100,
        grammarScore: 100,
        formatScore: 100,
        quantitativeScore: 100,
      };

      const overallScore = (analyzer as any).calculateOverallScore(highScores);
      expect(overallScore).toBe(100);
    });

    it('should handle minimum scores of 0', () => {
      const lowScores = {
        keywordScore: 0,
        grammarScore: 0,
        formatScore: 0,
        quantitativeScore: 0,
      };

      const overallScore = (analyzer as any).calculateOverallScore(lowScores);
      expect(overallScore).toBe(0);
    });
  });

  describe('fallback methods', () => {
    it('should provide meaningful fallback keyword analysis', () => {
      const fallbackAnalysis = (analyzer as any).getFallbackKeywordAnalysis(
        sampleResumeText,
        sampleTargetJob
      );

      expect(fallbackAnalysis.score).toBeGreaterThan(0);
      expect(fallbackAnalysis.totalKeywords).toBeGreaterThan(0);
      expect(fallbackAnalysis.matchedKeywords).toBeDefined();
      expect(fallbackAnalysis.missingKeywords).toBeDefined();
    });

    it('should provide fallback grammar check', () => {
      const fallbackGrammar = (analyzer as any).getFallbackGrammarCheck(sampleResumeText);

      expect(fallbackGrammar.score).toBe(85);
      expect(fallbackGrammar.totalIssues).toBe(0);
      expect(fallbackGrammar.overallReadability).toBe(80);
      expect(fallbackGrammar.issues).toEqual([]);
    });

    it('should provide fallback format analysis', () => {
      const fallbackFormat = (analyzer as any).getFallbackFormatAnalysis(sampleResumeText);

      expect(fallbackFormat.score).toBe(80);
      expect(fallbackFormat.atsCompatibility).toBe(75);
      expect(fallbackFormat.sectionStructure).toHaveLength(5);
    });

    it('should provide fallback quantitative analysis', () => {
      const fallbackQuantitative = (analyzer as any).getFallbackQuantitativeAnalysis(
        sampleResumeText
      );

      expect(fallbackQuantitative.score).toBeGreaterThan(0);
      expect(fallbackQuantitative.achievementsWithNumbers).toBeGreaterThan(0);
      expect(fallbackQuantitative.suggestions).toHaveLength(1);
    });

    it('should provide fallback suggestions', () => {
      const mockAnalyses = {
        keywordAnalysis: { score: 50 },
        grammarCheck: { score: 80 },
        formatAnalysis: { score: 70 },
        quantitativeAnalysis: { score: 60 },
      };

      const fallbackSuggestions = (analyzer as any).getFallbackSuggestions(mockAnalyses);

      expect(fallbackSuggestions).toHaveLength(2);
      expect(fallbackSuggestions[0].type).toBe('keyword');
      expect(fallbackSuggestions[1].type).toBe('achievement');
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON responses', async () => {
      mockAI.isAvailable.mockReturnValue(true);
      mockAI.generate.mockResolvedValue({ text: '{ invalid json }', model: 'test-model' });

      const result = await analyzer.analyzeResume(sampleResumeText, sampleTargetJob);

      // Should fall back to default values
      expect(result).toBeDefined();
      expect(result.keywordAnalysis).toBeDefined();
    });

    it('should handle network timeouts gracefully', async () => {
      mockAI.isAvailable.mockReturnValue(true);
      mockAI.generate.mockRejectedValue(new Error('Network timeout'));

      await expect(analyzer.analyzeResume(sampleResumeText, sampleTargetJob)).rejects.toThrow(
        'Failed to analyze resume'
      );
    });

    it('should handle partial AI responses', async () => {
      mockAI.isAvailable.mockReturnValue(true);

      // Mock partial responses (some succeed, some fail)
      mockAI.generate
        .mockResolvedValueOnce({ text: JSON.stringify({ score: 80 }), model: 'test-model' }) // keyword analysis
        .mockRejectedValueOnce(new Error('Grammar analysis failed'))
        .mockResolvedValueOnce({ text: JSON.stringify({ score: 85 }), model: 'test-model' }) // format analysis
        .mockRejectedValueOnce(new Error('Quantitative analysis failed'))
        .mockResolvedValueOnce({
          text: JSON.stringify({ strengths: [], weaknesses: [] }),
          model: 'test-model',
        })
        .mockResolvedValueOnce({ text: JSON.stringify([]), model: 'test-model' })
        .mockResolvedValueOnce({ text: sampleResumeText, model: 'test-model' });

      const result = await analyzer.analyzeResume(sampleResumeText, sampleTargetJob);

      expect(result).toBeDefined();
      expect(result.keywordAnalysis.score).toBe(80);
      expect(result.formatAnalysis.score).toBe(85);
      // Failed analyses should use fallback values
      expect(result.grammarCheck.score).toBe(85); // fallback
      expect(result.quantitativeAnalysis.score).toBeGreaterThan(0); // fallback
    });
  });
});
