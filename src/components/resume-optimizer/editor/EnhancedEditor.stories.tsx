/**
 * Enhanced Editor Storybook Stories
 *
 * Interactive documentation and testing for the Enhanced Editor component
 * Showcases all component states, features, and use cases
 *
 * Stories include:
 * - Default editor state
 * - Editor with AI suggestions
 * - Collaboration mode
 * - Mobile responsive view
 * - Different user profiles and goals
 * - Various analysis results
 * - Error states and edge cases
 */

import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import type {
  CategoryScores,
  EnhancedAnalysisResult,
  OptimizationGoals,
  Suggestion,
  UserProfile,
} from '../types';
import { EnhancedEditor } from './EnhancedEditor';

// Mock data for stories
const mockUserProfile: UserProfile = {
  id: 'user-123',
  email: 'sarah.johnson@example.com',
  name: 'Sarah Johnson',
  role: 'admin',
  industry: 'Technology',
  experienceLevel: 'senior',
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      analysisComplete: true,
      weeklyTips: true,
    },
    privacy: {
      shareAnalytics: true,
      allowPeerReview: true,
      publicProfile: false,
    },
  },
  createdAt: new Date('2022-03-15'),
  lastActive: new Date(),
};

const juniorUserProfile: UserProfile = {
  ...mockUserProfile,
  id: 'user-456',
  name: 'Alex Chen',
  role: 'user',
  experienceLevel: 'entry',
};

const executiveUserProfile: UserProfile = {
  ...mockUserProfile,
  id: 'user-789',
  name: 'Michael Rodriguez',
  role: 'admin',
  experienceLevel: 'executive',
  industry: 'Finance',
};

const mockOptimizationGoals: OptimizationGoals = {
  primaryObjective: 'ats-optimization',
  targetIndustry: 'Technology',
  targetRole: 'Senior Software Engineer',
  timeframe: 'week',
  experienceLevel: 'senior',
};

const quickOptimizationGoals: OptimizationGoals = {
  ...mockOptimizationGoals,
  primaryObjective: 'content-improvement',
  timeframe: 'immediate',
};

const comprehensiveOptimizationGoals: OptimizationGoals = {
  ...mockOptimizationGoals,
  primaryObjective: 'keyword-optimization',
  timeframe: 'month',
};

const mockCategoryScores: CategoryScores = {
  ats: 85,
  keywords: 78,
  format: 92,
  content: 88,
  impact: 82,
  readability: 90,
};

const lowCategoryScores: CategoryScores = {
  ats: 45,
  keywords: 38,
  format: 52,
  content: 48,
  impact: 42,
  readability: 50,
};

const highCategoryScores: CategoryScores = {
  ats: 95,
  keywords: 98,
  format: 96,
  content: 94,
  impact: 92,
  readability: 97,
};

const mockSuggestions: Suggestion[] = [
  {
    id: 'suggestion-1',
    type: 'keyword-optimization',
    priority: 'critical',
    category: 'keywords',
    title: 'Add critical industry keywords',
    description: 'Include React, TypeScript, and AWS to improve ATS compatibility for senior roles',
    impact: {
      scoreIncrease: 8,
      atsCompatibility: 15,
      readabilityImprovement: 0,
      keywordDensity: 20,
    },
    effort: {
      timeMinutes: 5,
      difficulty: 'easy',
      requiresManualReview: false,
    },
    beforePreview: 'Developed web applications using modern frameworks',
    afterPreview: 'Developed scalable web applications using React, TypeScript, and AWS services',
    isApplied: false,
    canAutoApply: true,
  },
  {
    id: 'suggestion-2',
    type: 'content-enhancement',
    priority: 'high',
    category: 'content',
    title: 'Quantify achievements',
    description: 'Add specific metrics and numbers to demonstrate impact',
    impact: {
      scoreIncrease: 6,
      atsCompatibility: 5,
      readabilityImprovement: 10,
      keywordDensity: 0,
    },
    effort: {
      timeMinutes: 15,
      difficulty: 'medium',
      requiresManualReview: true,
    },
    beforePreview: 'Improved application performance',
    afterPreview: 'Improved application performance by 40%, reducing load times from 3.2s to 1.9s',
    isApplied: false,
    canAutoApply: false,
  },
  {
    id: 'suggestion-3',
    type: 'grammar-correction',
    priority: 'medium',
    category: 'readability',
    title: 'Fix grammar and style',
    description: 'Correct minor grammatical errors and improve sentence structure',
    impact: {
      scoreIncrease: 3,
      atsCompatibility: 0,
      readabilityImprovement: 8,
      keywordDensity: 0,
    },
    effort: {
      timeMinutes: 8,
      difficulty: 'easy',
      requiresManualReview: false,
    },
    beforePreview: 'Responsible for managing team and delivering projects on time',
    afterPreview: 'Managed cross-functional teams and consistently delivered projects on schedule',
    isApplied: false,
    canAutoApply: true,
  },
];

const mockAnalysisResult: EnhancedAnalysisResult = {
  id: 'analysis-123',
  overallScore: 85,
  categoryScores: mockCategoryScores,
  suggestions: mockSuggestions,
  achievements: [
    {
      id: 'achievement-1',
      title: 'First Optimization',
      description: 'Completed your first resume optimization',
      icon: '🎯',
      category: 'first-steps',
      points: 100,
      unlockedAt: new Date(),
      rarity: 'common',
    },
    {
      id: 'achievement-2',
      title: 'ATS Master',
      description: 'Achieved 90+ ATS compatibility score',
      icon: '🤖',
      category: 'optimization-master',
      points: 250,
      unlockedAt: new Date(),
      rarity: 'rare',
    },
  ],
  nextMilestones: [
    {
      id: 'milestone-1',
      title: 'Score Perfectionist',
      description: 'Reach an overall score of 95',
      targetScore: 95,
      currentProgress: 85,
      reward: {
        id: 'reward-1',
        title: 'Perfectionist Badge',
        description: 'Awarded for achieving near-perfect resume score',
        icon: '💎',
        category: 'optimization-master',
        points: 500,
        unlockedAt: new Date(),
        rarity: 'legendary',
      },
      estimatedTimeToComplete: 30,
    },
  ],
  industryBenchmarks: {
    industry: 'Technology',
    role: 'Senior Software Engineer',
    averageScore: 75,
    topPercentileScore: 95,
    commonKeywords: ['React', 'JavaScript', 'Node.js', 'TypeScript', 'AWS'],
    trendingSkills: ['Next.js', 'Docker', 'Kubernetes', 'GraphQL', 'Microservices'],
  },
  analysisTimestamp: new Date(),
  version: '1.0.0',
};

const lowScoreAnalysisResult: EnhancedAnalysisResult = {
  ...mockAnalysisResult,
  id: 'analysis-low',
  overallScore: 45,
  categoryScores: lowCategoryScores,
  suggestions: [
    ...mockSuggestions,
    {
      id: 'suggestion-4',
      type: 'format-improvement',
      priority: 'critical',
      category: 'format',
      title: 'Improve resume structure',
      description: 'Reorganize sections for better ATS parsing',
      impact: {
        scoreIncrease: 12,
        atsCompatibility: 20,
        readabilityImprovement: 15,
        keywordDensity: 0,
      },
      effort: {
        timeMinutes: 25,
        difficulty: 'medium',
        requiresManualReview: true,
      },
      isApplied: false,
      canAutoApply: false,
    },
  ],
  achievements: [],
  nextMilestones: [
    {
      id: 'milestone-basic',
      title: 'Basic Optimization',
      description: 'Reach a score of 60',
      targetScore: 60,
      currentProgress: 45,
      reward: {
        id: 'reward-basic',
        title: 'Getting Started',
        description: 'First step towards optimization',
        icon: '🌟',
        category: 'first-steps',
        points: 50,
        unlockedAt: new Date(),
        rarity: 'common',
      },
      estimatedTimeToComplete: 15,
    },
  ],
};

const highScoreAnalysisResult: EnhancedAnalysisResult = {
  ...mockAnalysisResult,
  id: 'analysis-high',
  overallScore: 95,
  categoryScores: highCategoryScores,
  suggestions: [
    {
      id: 'suggestion-polish',
      type: 'content-enhancement',
      priority: 'low',
      category: 'content',
      title: 'Polish final details',
      description: 'Minor style improvements for perfection',
      impact: {
        scoreIncrease: 2,
        atsCompatibility: 1,
        readabilityImprovement: 3,
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
    ...mockAnalysisResult.achievements,
    {
      id: 'achievement-expert',
      title: 'Resume Expert',
      description: 'Achieved 95+ overall score',
      icon: '👑',
      category: 'optimization-master',
      points: 1000,
      unlockedAt: new Date(),
      rarity: 'legendary',
    },
  ],
};

const sampleResumeContent = `
SARAH JOHNSON
Senior Software Engineer
sarah.johnson@example.com | (555) 123-4567 | LinkedIn: /in/sarahjohnson

PROFESSIONAL SUMMARY
Experienced Senior Software Engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions that improve performance by 40% and reduce costs by $200K annually.

TECHNICAL SKILLS
• Languages: JavaScript, TypeScript, Python, Java
• Frontend: React, Vue.js, Angular, HTML5, CSS3
• Backend: Node.js, Express, Django, Spring Boot
• Cloud: AWS, Azure, Docker, Kubernetes
• Databases: PostgreSQL, MongoDB, Redis

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2020 - Present
• Led development of microservices architecture serving 2M+ users
• Improved application performance by 40% through code optimization
• Mentored 5 junior developers and conducted technical interviews
• Implemented CI/CD pipelines reducing deployment time by 60%

Software Engineer | StartupXYZ | 2018 - 2020
• Developed responsive web applications using React and Node.js
• Collaborated with cross-functional teams to deliver features on time
• Optimized database queries improving response times by 25%
• Participated in code reviews and maintained high code quality standards

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2014 - 2018
GPA: 3.8/4.0

CERTIFICATIONS
• AWS Certified Solutions Architect
• Certified Kubernetes Administrator (CKA)
`;

// Storybook configuration
const meta: Meta<typeof EnhancedEditor> = {
  title: 'Resume Optimizer/Enhanced Editor',
  component: EnhancedEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Enhanced Editor Experience

The Enhanced Editor is a comprehensive resume editing component that provides:

## Key Features
- **Real-time collaboration** with live preview and multi-user editing
- **Smart AI suggestions** while typing with context-aware recommendations
- **Version history tracking** with rollback capability
- **AI writing assistant** for grammar, tone, and style improvements
- **Visual enhancement tools** including template switcher and format painter
- **Content blocks system** with drag-and-drop resume sections
- **Smart formatting** with auto-adjust spacing and alignment
- **Mobile-optimized editing** with touch-friendly controls

## Use Cases
- Professional resume optimization
- Collaborative editing sessions
- AI-powered content improvement
- Template-based formatting
- Version control and history tracking

## Accessibility
- WCAG 2.1 AA compliant
- Full keyboard navigation support
- Screen reader compatible
- High contrast mode support
        `,
      },
    },
  },
  argTypes: {
    enableCollaboration: {
      control: 'boolean',
      description: 'Enable real-time collaboration features',
    },
    enableAIAssistant: {
      control: 'boolean',
      description: 'Enable AI-powered suggestions and assistance',
    },
    enableVersionHistory: {
      control: 'boolean',
      description: 'Enable version history and rollback functionality',
    },
    userProfile: {
      control: 'object',
      description: 'User profile information for personalization',
    },
    optimizationGoals: {
      control: 'object',
      description: 'User optimization goals and preferences',
    },
  },
  args: {
    onContentChange: action('content-changed'),
    onSectionReorder: action('sections-reordered'),
    onSuggestionApply: action('suggestion-applied'),
    onTemplateChange: action('template-changed'),
    onExport: action('export-requested'),
  },
};

export default meta;
type Story = StoryObj<typeof EnhancedEditor>;

// Default story
export const Default: Story = {
  args: {
    initialContent: sampleResumeContent,
    analysisResult: mockAnalysisResult,
    userProfile: mockUserProfile,
    optimizationGoals: mockOptimizationGoals,
    enableCollaboration: true,
    enableAIAssistant: true,
    enableVersionHistory: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default enhanced editor with all features enabled and sample content.',
      },
    },
  },
};

// Editor with AI suggestions
export const WithAISuggestions: Story = {
  args: {
    ...Default.args,
    analysisResult: {
      ...mockAnalysisResult,
      suggestions: [
        ...mockSuggestions,
        {
          id: 'suggestion-ai-1',
          type: 'keyword-optimization',
          priority: 'high',
          category: 'keywords',
          title: 'Add trending technologies',
          description: 'Include Next.js and GraphQL to match current market demands',
          impact: {
            scoreIncrease: 7,
            atsCompatibility: 12,
            readabilityImprovement: 0,
            keywordDensity: 18,
          },
          effort: {
            timeMinutes: 8,
            difficulty: 'easy',
            requiresManualReview: false,
          },
          beforePreview: 'Frontend development experience',
          afterPreview: 'Frontend development experience with React, Next.js, and GraphQL',
          isApplied: false,
          canAutoApply: true,
        },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor showcasing AI-powered suggestions with different priorities and types.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the component to render
    await expect(canvas.getByText('AI Assistant')).toBeInTheDocument();

    // Check that suggestions are displayed
    await expect(canvas.getByText('4')).toBeInTheDocument(); // Badge count
  },
};

// Low score scenario
export const LowScoreOptimization: Story = {
  args: {
    ...Default.args,
    analysisResult: lowScoreAnalysisResult,
    userProfile: juniorUserProfile,
    optimizationGoals: quickOptimizationGoals,
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor for a resume with low scores, showing critical improvements needed.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify low score is displayed
    await expect(canvas.getByText('45')).toBeInTheDocument();

    // Check for critical suggestions
    await expect(canvas.getByText('AI Assistant')).toBeInTheDocument();
  },
};

// High score scenario
export const HighScorePolishing: Story = {
  args: {
    ...Default.args,
    analysisResult: highScoreAnalysisResult,
    userProfile: executiveUserProfile,
    optimizationGoals: comprehensiveOptimizationGoals,
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor for a high-scoring resume, focusing on final polishing touches.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify high score is displayed
    await expect(canvas.getByText('95')).toBeInTheDocument();

    // Check for achievements
    await expect(canvas.getByText('Live Score')).toBeInTheDocument();
  },
};

// Collaboration mode
export const CollaborationMode: Story = {
  args: {
    ...Default.args,
    enableCollaboration: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor in collaboration mode with multiple users editing simultaneously.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for collaboration indicators
    await expect(canvas.getByText('Enhanced Resume Editor')).toBeInTheDocument();
  },
};

// Mobile responsive view
export const MobileView: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Editor optimized for mobile devices with touch-friendly controls.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify mobile layout
    await expect(canvas.getByText('Enhanced Resume Editor')).toBeInTheDocument();
  },
};

// Minimal features
export const MinimalFeatures: Story = {
  args: {
    ...Default.args,
    enableCollaboration: false,
    enableAIAssistant: false,
    enableVersionHistory: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic editor with minimal features enabled for simple editing tasks.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify basic functionality
    await expect(canvas.getByText('Enhanced Resume Editor')).toBeInTheDocument();

    // AI Assistant should not be present
    await expect(canvas.queryByText('AI Assistant')).not.toBeInTheDocument();
  },
};

// No analysis result
export const WithoutAnalysis: Story = {
  args: {
    initialContent: sampleResumeContent,
    userProfile: mockUserProfile,
    optimizationGoals: mockOptimizationGoals,
    enableCollaboration: true,
    enableAIAssistant: true,
    enableVersionHistory: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor without analysis results, showing basic editing capabilities.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should still render main editor
    await expect(canvas.getByText('Enhanced Resume Editor')).toBeInTheDocument();
  },
};

// Interactive editing demo
export const InteractiveDemo: Story = {
  args: {
    ...Default.args,
    initialContent: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing the editing workflow from empty state.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    // Wait for component to load
    await expect(canvas.getByText('Enhanced Resume Editor')).toBeInTheDocument();

    // Click on contact information block
    const contactBlock = canvas.getByText('Click to add contact information...');
    await user.click(contactBlock);

    // Verify textarea appears
    await expect(
      canvas.getByPlaceholderText('Enter your contact information here...')
    ).toBeInTheDocument();
  },
};

// Template switching demo
export const TemplateSwitching: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demo of template switching functionality.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    // Click template button
    const templateButton = canvas.getByRole('button', { name: /template/i });
    await user.click(templateButton);

    // Verify modal opens
    await expect(canvas.getByText('Choose Template')).toBeInTheDocument();
  },
};

// Version history demo
export const VersionHistoryDemo: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demo of version history and rollback functionality.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    // Click history button
    const historyButton = canvas.getByRole('button', { name: /history/i });
    await user.click(historyButton);

    // Verify modal opens
    await expect(canvas.getByText('Version History')).toBeInTheDocument();
  },
};

// Error state
export const ErrorState: Story = {
  args: {
    ...Default.args,
    analysisResult: {
      ...mockAnalysisResult,
      suggestions: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor in error state or with no suggestions available.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should handle empty suggestions gracefully
    await expect(canvas.getByText('Enhanced Resume Editor')).toBeInTheDocument();
  },
};

// Performance test with large content
export const LargeContentPerformance: Story = {
  args: {
    ...Default.args,
    initialContent: sampleResumeContent.repeat(10), // Large content
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance test with large resume content to verify efficient rendering.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should handle large content efficiently
    await expect(canvas.getByText('Enhanced Resume Editor')).toBeInTheDocument();
  },
};
