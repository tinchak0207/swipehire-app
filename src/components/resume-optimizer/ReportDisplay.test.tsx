'use client';

import { useState } from 'react';
import type { ResumeAnalysisResponse } from '@/lib/types/resume-optimizer';
import ReportDisplay from './ReportDisplay';

/**
 * Mock data for testing the ReportDisplay component
 */
const mockAnalysisResult: ResumeAnalysisResponse = {
  id: 'test-analysis-123',
  overallScore: 78,
  atsScore: 85,
  keywordAnalysis: {
    score: 72,
    totalKeywords: 25,
    matchedKeywords: [
      {
        keyword: 'JavaScript',
        frequency: 5,
        relevanceScore: 9,
        context: ['Frontend development', 'React applications', 'Node.js backend'],
      },
      {
        keyword: 'React',
        frequency: 8,
        relevanceScore: 10,
        context: ['Component development', 'State management', 'UI implementation'],
      },
      {
        keyword: 'TypeScript',
        frequency: 3,
        relevanceScore: 8,
        context: ['Type safety', 'Large-scale applications'],
      },
      {
        keyword: 'Node.js',
        frequency: 4,
        relevanceScore: 8,
        context: ['Backend development', 'API creation', 'Server-side logic'],
      },
      {
        keyword: 'AWS',
        frequency: 2,
        relevanceScore: 7,
        context: ['Cloud deployment', 'Infrastructure management'],
      },
    ],
    missingKeywords: [
      {
        keyword: 'Docker',
        importance: 'high',
        suggestedPlacement: ['Technical Skills', 'DevOps Experience'],
        relatedTerms: ['containerization', 'deployment', 'microservices'],
      },
      {
        keyword: 'Kubernetes',
        importance: 'medium',
        suggestedPlacement: ['Technical Skills', 'Cloud Experience'],
        relatedTerms: ['orchestration', 'scaling', 'container management'],
      },
      {
        keyword: 'GraphQL',
        importance: 'medium',
        suggestedPlacement: ['Technical Skills', 'API Development'],
        relatedTerms: ['API design', 'data fetching', 'query language'],
      },
      {
        keyword: 'CI/CD',
        importance: 'high',
        suggestedPlacement: ['DevOps Experience', 'Technical Skills'],
        relatedTerms: ['automation', 'deployment pipeline', 'continuous integration'],
      },
    ],
    keywordDensity: {
      JavaScript: 2.1,
      React: 3.4,
      TypeScript: 1.3,
      'Node.js': 1.7,
      AWS: 0.8,
    },
    recommendations: [
      'Add more cloud-related keywords like Docker and Kubernetes',
      'Include CI/CD pipeline experience',
      'Mention GraphQL if you have experience with it',
    ],
  },
  suggestions: [
    {
      id: 'suggestion-1',
      type: 'keyword',
      title: 'Add Docker Experience',
      description:
        'Docker is a highly sought-after skill for this role. Consider adding your containerization experience.',
      impact: 'high',
      suggestion:
        'Add "Docker containerization" to your technical skills and mention specific projects where you used Docker for deployment.',
      priority: 9,
      estimatedScoreImprovement: 8,
      section: 'Technical Skills',
    },
    {
      id: 'suggestion-2',
      type: 'achievement',
      title: 'Quantify Performance Improvements',
      description: 'Your achievements would be more impactful with specific numbers and metrics.',
      impact: 'high',
      suggestion:
        'Replace "Improved application performance" with "Improved application performance by 40% through code optimization and caching strategies"',
      beforeText: 'Improved application performance through optimization',
      afterText:
        'Improved application performance by 40% through code optimization and caching strategies, reducing page load times from 3.2s to 1.9s',
      priority: 8,
      estimatedScoreImprovement: 12,
      section: 'Professional Experience',
    },
    {
      id: 'suggestion-3',
      type: 'grammar',
      title: 'Fix Verb Tense Consistency',
      description: 'Maintain consistent verb tense throughout your resume.',
      impact: 'medium',
      suggestion:
        'Change "Developing web applications" to "Developed web applications" for past roles.',
      beforeText: 'Developing web applications using React and Node.js',
      afterText: 'Developed web applications using React and Node.js',
      priority: 5,
      estimatedScoreImprovement: 3,
      section: 'Professional Experience',
    },
    {
      id: 'suggestion-4',
      type: 'ats',
      title: 'Improve ATS Compatibility',
      description: 'Use standard section headers to improve ATS parsing.',
      impact: 'medium',
      suggestion:
        'Change "Tech Stack" to "Technical Skills" and "Work History" to "Professional Experience"',
      priority: 6,
      estimatedScoreImprovement: 5,
      section: 'Formatting',
    },
    {
      id: 'suggestion-5',
      type: 'structure',
      title: 'Add Professional Summary',
      description:
        'A professional summary helps recruiters quickly understand your value proposition.',
      impact: 'high',
      suggestion:
        'Add a 2-3 sentence professional summary at the top of your resume highlighting your key skills and experience.',
      priority: 7,
      estimatedScoreImprovement: 10,
      section: 'Professional Summary',
    },
  ],
  grammarCheck: {
    score: 88,
    totalIssues: 4,
    overallReadability: 82,
    issues: [
      {
        id: 'grammar-1',
        type: 'grammar',
        severity: 'warning',
        message: 'Inconsistent verb tense',
        context: 'Developing web applications using React',
        suggestions: ['Developed web applications using React'],
        position: { start: 245, end: 265 },
      },
      {
        id: 'grammar-2',
        type: 'spelling',
        severity: 'error',
        message: 'Possible spelling error',
        context: 'responsibile for managing',
        suggestions: ['responsible for managing'],
        position: { start: 456, end: 467 },
      },
      {
        id: 'grammar-3',
        type: 'punctuation',
        severity: 'suggestion',
        message: 'Consider adding a comma',
        context: 'JavaScript React and Node.js',
        suggestions: ['JavaScript, React, and Node.js'],
        position: { start: 123, end: 145 },
      },
      {
        id: 'grammar-4',
        type: 'style',
        severity: 'suggestion',
        message: 'Consider using active voice',
        context: 'The project was completed by me',
        suggestions: ['I completed the project'],
        position: { start: 678, end: 705 },
      },
    ],
  },
  formatAnalysis: {
    score: 82,
    atsCompatibility: 85,
    issues: [
      {
        type: 'structure',
        severity: 'medium',
        description: 'Missing professional summary section',
        recommendation: 'Add a professional summary at the top of your resume',
      },
      {
        type: 'sections',
        severity: 'low',
        description: 'Non-standard section header "Tech Stack"',
        recommendation: 'Change "Tech Stack" to "Technical Skills" for better ATS compatibility',
      },
      {
        type: 'length',
        severity: 'low',
        description: 'Resume is slightly long at 2.3 pages',
        recommendation: 'Consider condensing to 2 pages or less',
      },
    ],
    recommendations: [
      'Use standard section headers like "Professional Experience" and "Technical Skills"',
      'Add a professional summary section',
      'Ensure consistent formatting throughout',
      'Use bullet points for better readability',
    ],
    sectionStructure: [
      { name: 'Contact Information', present: true, order: 1, recommended: true },
      { name: 'Professional Summary', present: false, order: 0, recommended: true },
      { name: 'Professional Experience', present: true, order: 2, recommended: true },
      { name: 'Technical Skills', present: true, order: 3, recommended: true },
      { name: 'Education', present: true, order: 4, recommended: true },
      { name: 'Projects', present: true, order: 5, recommended: true },
    ],
  },
  quantitativeAnalysis: {
    score: 65,
    achievementsWithNumbers: 3,
    totalAchievements: 8,
    suggestions: [
      {
        section: 'Professional Experience',
        originalText: 'Improved application performance',
        suggestedText:
          'Improved application performance by 40%, reducing load times from 3.2s to 1.9s',
        reasoning: 'Adding specific metrics makes the achievement more impactful and credible',
      },
      {
        section: 'Professional Experience',
        originalText: 'Led a team of developers',
        suggestedText: 'Led a team of 5 developers to deliver 12 features over 6 months',
        reasoning:
          'Quantifying team size and deliverables demonstrates leadership scale and impact',
      },
      {
        section: 'Professional Experience',
        originalText: 'Increased user engagement',
        suggestedText: 'Increased user engagement by 35% through implementation of new features',
        reasoning: 'Specific percentage increase shows measurable business impact',
      },
    ],
    impactWords: ['Led', 'Improved', 'Developed', 'Implemented', 'Optimized', 'Delivered'],
  },
  strengths: [
    'Strong technical skills in modern web technologies',
    'Good use of action verbs in experience descriptions',
    'Relevant project experience included',
    'Clear education background',
    'Appropriate resume length',
    'Good keyword coverage for core technologies',
  ],
  weaknesses: [
    'Missing quantified achievements in several bullet points',
    'Lacks professional summary section',
    'Some grammar and spelling issues present',
    'Missing important keywords like Docker and CI/CD',
    'Inconsistent verb tense usage',
    'Could improve ATS compatibility with standard headers',
  ],
  createdAt: new Date().toISOString(),
  processingTime: 2847,
  sectionAnalysis: {
    'professional-summary': {
      present: false,
      score: 0,
      suggestions: [
        'Add a 2-3 sentence professional summary',
        'Highlight your key skills and experience level',
        'Include your career objective or value proposition',
      ],
    },
    'professional-experience': {
      present: true,
      score: 78,
      suggestions: [
        'Add more quantified achievements',
        'Use consistent verb tense (past tense for previous roles)',
        'Include more specific technologies and methodologies',
      ],
    },
    'technical-skills': {
      present: true,
      score: 85,
      suggestions: [
        'Add Docker and containerization skills',
        'Include CI/CD pipeline experience',
        'Consider organizing skills by category (Frontend, Backend, DevOps)',
      ],
    },
    education: {
      present: true,
      score: 90,
      suggestions: [
        'Consider adding relevant coursework if recent graduate',
        'Include GPA if above 3.5',
      ],
    },
    projects: {
      present: true,
      score: 75,
      suggestions: [
        'Add more technical details about implementation',
        'Include links to live demos or repositories',
        'Quantify project impact or scale',
      ],
    },
  },
  metadata: {
    analysisDate: new Date().toISOString(),
    targetJobTitle: 'Senior Frontend Developer',
    targetCompany: 'TechCorp Inc.',
    templateUsed: 'software-engineer',
    wordCount: 847,
    processingTime: 2847,
  },
};

/**
 * Test component for ReportDisplay
 * Demonstrates all features with mock data
 */
const ReportDisplayTest: React.FC = () => {
  const [adoptedSuggestions, setAdoptedSuggestions] = useState<Set<string>>(new Set());
  const [ignoredSuggestions, setIgnoredSuggestions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const handleSuggestionAdopt = (suggestionId: string): void => {
    setAdoptedSuggestions((prev) => {
      const newSet = new Set(prev);
      newSet.add(suggestionId);
      return newSet;
    });
    setIgnoredSuggestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });
  };

  const handleSuggestionIgnore = (suggestionId: string): void => {
    setIgnoredSuggestions((prev) => {
      const newSet = new Set(prev);
      newSet.add(suggestionId);
      return newSet;
    });
    setAdoptedSuggestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });
  };

  const handleSuggestionModify = (suggestionId: string, modifiedText: string): void => {
    console.log('Modified suggestion:', suggestionId, modifiedText);
    handleSuggestionAdopt(suggestionId);
  };

  const resetStates = (): void => {
    setAdoptedSuggestions(new Set());
    setIgnoredSuggestions(new Set());
  };

  const simulateLoading = (): void => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Test Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">ReportDisplay Test Component</h2>
          <p className="text-slate-600 mb-6">
            This component demonstrates the ReportDisplay functionality with comprehensive mock
            data. Use the controls below to test different states and interactions.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={simulateLoading}
              className="btn btn-primary btn-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Test Loading State'}
            </button>

            <button
              onClick={() => setShowEmptyState(!showEmptyState)}
              className="btn btn-secondary btn-sm"
            >
              {showEmptyState ? 'Show Report' : 'Test Empty State'}
            </button>

            <button onClick={resetStates} className="btn btn-outline btn-sm">
              Reset Suggestions
            </button>

            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <span>Adopted: {adoptedSuggestions.size}</span>
              <span>Ignored: {ignoredSuggestions.size}</span>
            </div>
          </div>
        </div>

        {/* ReportDisplay Component */}
        <ReportDisplay
          analysisResult={showEmptyState ? null : mockAnalysisResult}
          isLoading={isLoading}
          onSuggestionAdopt={handleSuggestionAdopt}
          onSuggestionIgnore={handleSuggestionIgnore}
          onSuggestionModify={handleSuggestionModify}
          adoptedSuggestions={adoptedSuggestions}
          ignoredSuggestions={ignoredSuggestions}
        />
      </div>
    </div>
  );
};

export default ReportDisplayTest;
