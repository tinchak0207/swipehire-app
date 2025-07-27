/**
 * Analysis Dashboard Storybook Stories
 *
 * Interactive documentation and testing for the Analysis Dashboard component
 * Showcases different states, data scenarios, and user interactions
 */

import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import type { BenchmarkData, EnhancedAnalysisResult, OptimizationGoals } from '../types';
import { AnalysisDashboard } from './AnalysisDashboard';

// Mock data generators
const createMockAnalysisResult = (
  overrides: Partial<EnhancedAnalysisResult> = {}
): EnhancedAnalysisResult => ({
  id: 'analysis-1',
  overallScore: 78,
  categoryScores: {
    ats: 85,
    keywords: 72,
    format: 90,
    content: 68,
    impact: 75,
    readability: 82,
  },
  suggestions: [
    {
      id: 'suggestion-1',
      type: 'keyword-optimization',
      priority: 'high',
      category: 'keywords',
      title: 'Add Industry Keywords',
      description:
        'Include more relevant keywords for your target role to improve ATS compatibility',
      impact: {
        scoreIncrease: 8,
        atsCompatibility: 15,
        readabilityImprovement: 0,
        keywordDensity: 12,
      },
      effort: {
        timeMinutes: 10,
        difficulty: 'easy',
        requiresManualReview: false,
      },
      beforePreview: 'Managed team projects',
      afterPreview: 'Led cross-functional team projects using Agile methodologies',
      isApplied: false,
      canAutoApply: true,
    },
    {
      id: 'suggestion-2',
      type: 'format-improvement',
      priority: 'critical',
      category: 'format',
      title: 'Fix Formatting Issues',
      description: 'Standardize bullet point formatting throughout resume for better readability',
      impact: {
        scoreIncrease: 12,
        atsCompatibility: 20,
        readabilityImprovement: 15,
        keywordDensity: 0,
      },
      effort: {
        timeMinutes: 5,
        difficulty: 'easy',
        requiresManualReview: false,
      },
      beforePreview:
        '• Inconsistent bullet points\n- Mixed formatting styles\n* Various symbols used',
      afterPreview:
        '• Consistent bullet points\n• Standardized formatting\n• Professional appearance',
      isApplied: false,
      canAutoApply: true,
    },
    {
      id: 'suggestion-3',
      type: 'content-enhancement',
      priority: 'medium',
      category: 'content',
      title: 'Quantify Achievements',
      description: 'Add specific numbers and metrics to demonstrate impact',
      impact: {
        scoreIncrease: 15,
        atsCompatibility: 5,
        readabilityImprovement: 10,
        keywordDensity: 0,
      },
      effort: {
        timeMinutes: 20,
        difficulty: 'medium',
        requiresManualReview: true,
      },
      beforePreview: 'Improved team productivity',
      afterPreview:
        'Improved team productivity by 35% through implementation of automated workflows',
      isApplied: false,
      canAutoApply: false,
    },
    {
      id: 'suggestion-4',
      type: 'ats-compatibility',
      priority: 'low',
      category: 'ats',
      title: 'Optimize Section Headers',
      description: 'Use standard section headers that ATS systems recognize',
      impact: {
        scoreIncrease: 5,
        atsCompatibility: 10,
        readabilityImprovement: 0,
        keywordDensity: 0,
      },
      effort: {
        timeMinutes: 3,
        difficulty: 'easy',
        requiresManualReview: false,
      },
      isApplied: true,
      canAutoApply: true,
    },
  ],
  achievements: [
    {
      id: 'achievement-1',
      title: 'First Analysis',
      description: 'Completed your first resume analysis',
      icon: 'trophy',
      category: 'first-steps',
      points: 100,
      unlockedAt: new Date('2024-01-01'),
      rarity: 'common',
    },
    {
      id: 'achievement-2',
      title: 'Score Improver',
      description: 'Increased your resume score by 10+ points',
      icon: 'star',
      category: 'optimization-master',
      points: 250,
      unlockedAt: new Date('2024-01-02'),
      rarity: 'rare',
    },
    {
      id: 'achievement-3',
      title: 'Keyword Master',
      description: 'Optimized keyword density to industry standards',
      icon: 'key',
      category: 'optimization-master',
      points: 300,
      unlockedAt: new Date('2024-01-03'),
      rarity: 'epic',
    },
  ],
  nextMilestones: [
    {
      id: 'milestone-1',
      title: 'Score Master',
      description: 'Reach a resume score of 85',
      targetScore: 85,
      currentProgress: 78,
      reward: {
        id: 'reward-1',
        title: 'Score Master Badge',
        description: 'Achieved excellent resume score',
        icon: 'medal',
        category: 'optimization-master',
        points: 500,
        unlockedAt: new Date(),
        rarity: 'epic',
      },
      estimatedTimeToComplete: 15,
    },
    {
      id: 'milestone-2',
      title: 'ATS Champion',
      description: 'Achieve 95+ ATS compatibility score',
      targetScore: 95,
      currentProgress: 85,
      reward: {
        id: 'reward-2',
        title: 'ATS Champion Badge',
        description: 'Mastered ATS optimization',
        icon: 'shield',
        category: 'optimization-master',
        points: 750,
        unlockedAt: new Date(),
        rarity: 'legendary',
      },
      estimatedTimeToComplete: 25,
    },
  ],
  industryBenchmarks: {
    industry: 'Technology',
    role: 'Software Engineer',
    averageScore: 72,
    topPercentileScore: 88,
    commonKeywords: ['JavaScript', 'React', 'Node.js', 'Python'],
    trendingSkills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes'],
  },
  analysisTimestamp: new Date('2024-01-01'),
  version: '1.0.0',
  ...overrides,
});

const mockUserGoals: OptimizationGoals = {
  primaryObjective: 'ats-optimization',
  targetIndustry: 'Technology',
  targetRole: 'Software Engineer',
  timeframe: 'week',
  experienceLevel: 'mid',
};

const mockBenchmarkData: BenchmarkData = {
  industry: 'Technology',
  role: 'Software Engineer',
  averageScore: 72,
  topPercentileScore: 88,
  commonKeywords: ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'SQL', 'AWS', 'Docker'],
  trendingSkills: [
    'TypeScript',
    'AWS',
    'Docker',
    'Kubernetes',
    'GraphQL',
    'Next.js',
    'Terraform',
    'Microservices',
  ],
};

const meta: Meta<typeof AnalysisDashboard> = {
  title: 'Resume Optimizer/Analysis/Dashboard',
  component: AnalysisDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Analysis Dashboard

The Interactive Analysis Dashboard is the centerpiece of the resume optimization experience. It provides:

## Key Features
- **Gamified Scoring System**: Animated score reveals with visual progress indicators
- **Interactive Suggestions**: Priority-based sorting with one-click apply functionality
- **Achievement System**: Badges and milestones to encourage engagement
- **Industry Benchmarks**: Compare performance against industry standards
- **Real-time Updates**: Live collaboration and instant feedback
- **Mobile-First Design**: Responsive layout optimized for all devices

## Design Principles
- **Progressive Disclosure**: Information revealed as needed
- **Visual Hierarchy**: Clear prioritization of important elements
- **Accessibility First**: WCAG 2.1 AA compliant
- **Performance Optimized**: Smooth animations and fast interactions

## Usage
The dashboard adapts to different user goals and experience levels, providing personalized recommendations and benchmarks.
        `,
      },
    },
  },
  argTypes: {
    analysisResult: {
      description: 'Complete analysis result with scores, suggestions, and achievements',
      control: { type: 'object' },
    },
    userGoals: {
      description: 'User optimization goals and preferences',
      control: { type: 'object' },
    },
    industryBenchmarks: {
      description: 'Industry-specific benchmark data',
      control: { type: 'object' },
    },
    enableRealTimeUpdates: {
      description: 'Enable real-time collaboration features',
      control: { type: 'boolean' },
    },
    onSuggestionInteraction: {
      description: 'Callback for suggestion interactions',
      action: 'suggestion-interaction',
    },
    onScoreUpdate: {
      description: 'Callback for score updates',
      action: 'score-update',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AnalysisDashboard>;

// Default story with typical data
export const Default: Story = {
  args: {
    analysisResult: createMockAnalysisResult(),
    userGoals: mockUserGoals,
    industryBenchmarks: mockBenchmarkData,
    enableRealTimeUpdates: true,
    onSuggestionInteraction: action('suggestion-interaction'),
    onScoreUpdate: action('score-update'),
  },
};

// High-performing resume
export const HighScore: Story = {
  args: {
    analysisResult: createMockAnalysisResult({
      overallScore: 92,
      categoryScores: {
        ats: 95,
        keywords: 88,
        format: 98,
        content: 90,
        impact: 89,
        readability: 94,
      },
      suggestions: [
        {
          id: 'suggestion-minor',
          type: 'content-enhancement',
          priority: 'low',
          category: 'content',
          title: 'Minor Content Polish',
          description: 'Small improvements to make your resume even better',
          impact: {
            scoreIncrease: 3,
            atsCompatibility: 2,
            readabilityImprovement: 5,
            keywordDensity: 0,
          },
          effort: {
            timeMinutes: 5,
            difficulty: 'easy',
            requiresManualReview: false,
          },
          isApplied: false,
          canAutoApply: true,
        },
      ],
      achievements: [
        ...createMockAnalysisResult().achievements,
        {
          id: 'achievement-expert',
          title: 'Resume Expert',
          description: 'Achieved a score above 90',
          icon: 'crown',
          category: 'optimization-master',
          points: 1000,
          unlockedAt: new Date(),
          rarity: 'legendary',
        },
      ],
    }),
    userGoals: mockUserGoals,
    industryBenchmarks: mockBenchmarkData,
    enableRealTimeUpdates: true,
    onSuggestionInteraction: action('suggestion-interaction'),
    onScoreUpdate: action('score-update'),
  },
};

// Low-performing resume with many issues
export const LowScore: Story = {
  args: {
    analysisResult: createMockAnalysisResult({
      overallScore: 45,
      categoryScores: {
        ats: 35,
        keywords: 40,
        format: 30,
        content: 50,
        impact: 45,
        readability: 55,
      },
      suggestions: [
        {
          id: 'critical-1',
          type: 'format-improvement',
          priority: 'critical',
          category: 'format',
          title: 'Fix Major Formatting Issues',
          description:
            'Your resume has significant formatting problems that prevent ATS systems from reading it properly',
          impact: {
            scoreIncrease: 20,
            atsCompatibility: 35,
            readabilityImprovement: 25,
            keywordDensity: 0,
          },
          effort: {
            timeMinutes: 30,
            difficulty: 'medium',
            requiresManualReview: true,
          },
          isApplied: false,
          canAutoApply: false,
        },
        {
          id: 'critical-2',
          type: 'keyword-optimization',
          priority: 'critical',
          category: 'keywords',
          title: 'Add Essential Keywords',
          description: 'Your resume is missing critical keywords for your target role',
          impact: {
            scoreIncrease: 18,
            atsCompatibility: 25,
            readabilityImprovement: 0,
            keywordDensity: 30,
          },
          effort: {
            timeMinutes: 25,
            difficulty: 'medium',
            requiresManualReview: true,
          },
          isApplied: false,
          canAutoApply: false,
        },
        {
          id: 'high-1',
          type: 'content-enhancement',
          priority: 'high',
          category: 'content',
          title: 'Improve Content Quality',
          description: 'Add more specific achievements and quantifiable results',
          impact: {
            scoreIncrease: 15,
            atsCompatibility: 5,
            readabilityImprovement: 20,
            keywordDensity: 0,
          },
          effort: {
            timeMinutes: 45,
            difficulty: 'hard',
            requiresManualReview: true,
          },
          isApplied: false,
          canAutoApply: false,
        },
      ],
      achievements: [
        {
          id: 'first-step',
          title: 'Getting Started',
          description: 'Uploaded your first resume',
          icon: 'upload',
          category: 'first-steps',
          points: 50,
          unlockedAt: new Date(),
          rarity: 'common',
        },
      ],
      nextMilestones: [
        {
          id: 'basic-milestone',
          title: 'Basic Optimization',
          description: 'Reach a resume score of 60',
          targetScore: 60,
          currentProgress: 45,
          reward: {
            id: 'basic-reward',
            title: 'Optimizer Badge',
            description: 'Completed basic optimization',
            icon: 'gear',
            category: 'optimization-master',
            points: 200,
            unlockedAt: new Date(),
            rarity: 'common',
          },
          estimatedTimeToComplete: 60,
        },
      ],
    }),
    userGoals: mockUserGoals,
    industryBenchmarks: mockBenchmarkData,
    enableRealTimeUpdates: true,
    onSuggestionInteraction: action('suggestion-interaction'),
    onScoreUpdate: action('score-update'),
  },
};

// No suggestions - perfect resume
export const PerfectResume: Story = {
  args: {
    analysisResult: createMockAnalysisResult({
      overallScore: 98,
      categoryScores: {
        ats: 100,
        keywords: 95,
        format: 100,
        content: 98,
        impact: 96,
        readability: 99,
      },
      suggestions: [],
      achievements: [
        ...createMockAnalysisResult().achievements,
        {
          id: 'perfect',
          title: 'Perfection Achieved',
          description: 'Created a near-perfect resume',
          icon: 'diamond',
          category: 'optimization-master',
          points: 2000,
          unlockedAt: new Date(),
          rarity: 'legendary',
        },
      ],
      nextMilestones: [],
    }),
    userGoals: mockUserGoals,
    industryBenchmarks: mockBenchmarkData,
    enableRealTimeUpdates: true,
    onSuggestionInteraction: action('suggestion-interaction'),
    onScoreUpdate: action('score-update'),
  },
};

// Entry-level user
export const EntryLevel: Story = {
  args: {
    analysisResult: createMockAnalysisResult({
      suggestions: [
        {
          id: 'entry-1',
          type: 'content-enhancement',
          priority: 'high',
          category: 'content',
          title: 'Add Education Details',
          description: 'Include relevant coursework and academic projects',
          impact: {
            scoreIncrease: 12,
            atsCompatibility: 8,
            readabilityImprovement: 5,
            keywordDensity: 10,
          },
          effort: {
            timeMinutes: 15,
            difficulty: 'easy',
            requiresManualReview: false,
          },
          isApplied: false,
          canAutoApply: true,
        },
        {
          id: 'entry-2',
          type: 'keyword-optimization',
          priority: 'medium',
          category: 'keywords',
          title: 'Add Technical Skills',
          description: 'Include programming languages and tools you know',
          impact: {
            scoreIncrease: 10,
            atsCompatibility: 15,
            readabilityImprovement: 0,
            keywordDensity: 20,
          },
          effort: {
            timeMinutes: 10,
            difficulty: 'easy',
            requiresManualReview: false,
          },
          isApplied: false,
          canAutoApply: true,
        },
      ],
    }),
    userGoals: {
      ...mockUserGoals,
      experienceLevel: 'entry',
    },
    industryBenchmarks: {
      ...mockBenchmarkData,
      averageScore: 65, // Lower average for entry-level
      topPercentileScore: 82,
    },
    enableRealTimeUpdates: true,
    onSuggestionInteraction: action('suggestion-interaction'),
    onScoreUpdate: action('score-update'),
  },
};

// Executive level user
export const ExecutiveLevel: Story = {
  args: {
    analysisResult: createMockAnalysisResult({
      overallScore: 85,
      suggestions: [
        {
          id: 'exec-1',
          type: 'content-enhancement',
          priority: 'medium',
          category: 'content',
          title: 'Highlight Leadership Impact',
          description: 'Emphasize strategic initiatives and team leadership',
          impact: {
            scoreIncrease: 8,
            atsCompatibility: 5,
            readabilityImprovement: 10,
            keywordDensity: 5,
          },
          effort: {
            timeMinutes: 20,
            difficulty: 'medium',
            requiresManualReview: true,
          },
          isApplied: false,
          canAutoApply: false,
        },
      ],
    }),
    userGoals: {
      ...mockUserGoals,
      experienceLevel: 'executive',
      targetRole: 'Chief Technology Officer',
    },
    industryBenchmarks: {
      ...mockBenchmarkData,
      role: 'Chief Technology Officer',
      averageScore: 78, // Higher average for executive level
      topPercentileScore: 92,
      commonKeywords: ['Leadership', 'Strategy', 'Digital Transformation', 'Team Building'],
      trendingSkills: [
        'AI/ML Strategy',
        'Cloud Architecture',
        'Digital Innovation',
        'Agile Transformation',
      ],
    },
    enableRealTimeUpdates: true,
    onSuggestionInteraction: action('suggestion-interaction'),
    onScoreUpdate: action('score-update'),
  },
};

// Real-time updates disabled
export const StaticMode: Story = {
  args: {
    analysisResult: createMockAnalysisResult(),
    userGoals: mockUserGoals,
    industryBenchmarks: mockBenchmarkData,
    enableRealTimeUpdates: false,
    onSuggestionInteraction: action('suggestion-interaction'),
    onScoreUpdate: action('score-update'),
  },
};

// Different industry - Marketing
export const MarketingIndustry: Story = {
  args: {
    analysisResult: createMockAnalysisResult({
      industryBenchmarks: {
        industry: 'Marketing',
        role: 'Digital Marketing Manager',
        averageScore: 70,
        topPercentileScore: 85,
        commonKeywords: ['SEO', 'SEM', 'Analytics', 'Content Marketing'],
        trendingSkills: ['Marketing Automation', 'Data Analytics', 'Social Media', 'CRM'],
      },
    }),
    userGoals: {
      ...mockUserGoals,
      targetIndustry: 'Marketing',
      targetRole: 'Digital Marketing Manager',
    },
    industryBenchmarks: {
      industry: 'Marketing',
      role: 'Digital Marketing Manager',
      averageScore: 70,
      topPercentileScore: 85,
      commonKeywords: ['SEO', 'SEM', 'Analytics', 'Content Marketing', 'PPC', 'Email Marketing'],
      trendingSkills: [
        'Marketing Automation',
        'Data Analytics',
        'Social Media',
        'CRM',
        'Growth Hacking',
        'Conversion Optimization',
      ],
    },
    enableRealTimeUpdates: true,
    onSuggestionInteraction: action('suggestion-interaction'),
    onScoreUpdate: action('score-update'),
  },
};

// Mobile viewport simulation
export const MobileView: Story = {
  args: {
    analysisResult: createMockAnalysisResult(),
    userGoals: mockUserGoals,
    industryBenchmarks: mockBenchmarkData,
    enableRealTimeUpdates: true,
    onSuggestionInteraction: action('suggestion-interaction'),
    onScoreUpdate: action('score-update'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
