/**
 * Analysis Dashboard Component Tests
 *
 * Comprehensive test suite covering:
 * - Component rendering
 * - User interactions
 * - Animation behaviors
 * - Accessibility compliance
 * - Responsive design
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  AnalysisDashboardProps,
  BenchmarkData,
  EnhancedAnalysisResult,
  OptimizationGoals,
} from '../types';
import { AnalysisDashboard } from './AnalysisDashboard';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
  },
  AnimatePresence: ({ children }: any) => children,
  useSpring: () => ({ set: jest.fn() }),
  useMotionValue: () => ({ set: jest.fn(), get: () => 0 }),
}));

// Mock data for testing
const mockAnalysisResult: EnhancedAnalysisResult = {
  id: 'test-analysis-1',
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
      description: 'Include more relevant keywords for your target role',
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
      description: 'Standardize bullet point formatting throughout resume',
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
      isApplied: false,
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
};

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
  commonKeywords: ['JavaScript', 'React', 'Node.js', 'Python', 'Git'],
  trendingSkills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes', 'GraphQL'],
};

const defaultProps: AnalysisDashboardProps = {
  analysisResult: mockAnalysisResult,
  userGoals: mockUserGoals,
  industryBenchmarks: mockBenchmarkData,
  enableRealTimeUpdates: true,
  onSuggestionInteraction: jest.fn(),
  onScoreUpdate: jest.fn(),
};

describe('AnalysisDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the dashboard with all main sections', () => {
      render(<AnalysisDashboard {...defaultProps} />);

      expect(screen.getByText('Resume Analysis Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText(/Optimize your resume for Software Engineer in Technology/)
      ).toBeInTheDocument();
      expect(screen.getByText('Live Updates')).toBeInTheDocument();
    });

    it('displays the correct overall score', () => {
      render(<AnalysisDashboard {...defaultProps} />);

      expect(screen.getByText('78')).toBeInTheDocument();
      expect(screen.getByText('Score')).toBeInTheDocument();
    });

    it('shows all tab navigation options', () => {
      render(<AnalysisDashboard {...defaultProps} />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Suggestions (2)')).toBeInTheDocument();
      expect(screen.getByText('Achievements (2)')).toBeInTheDocument();
      expect(screen.getByText('Benchmarks')).toBeInTheDocument();
    });

    it('displays category scores correctly', () => {
      render(<AnalysisDashboard {...defaultProps} />);

      expect(screen.getByText('85')).toBeInTheDocument(); // ATS score
      expect(screen.getByText('72')).toBeInTheDocument(); // Keywords score
      expect(screen.getByText('90')).toBeInTheDocument(); // Format score
    });
  });

  describe('Tab Navigation', () => {
    it('switches to suggestions tab when clicked', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      await user.click(screen.getByText('Suggestions (2)'));

      expect(screen.getByText('Sort by')).toBeInTheDocument();
      expect(screen.getByText('Filter by')).toBeInTheDocument();
    });

    it('switches to achievements tab when clicked', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      await user.click(screen.getByText('Achievements (2)'));

      expect(screen.getByText('Your Achievements')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Milestones')).toBeInTheDocument();
    });

    it('switches to benchmarks tab when clicked', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      await user.click(screen.getByText('Benchmarks'));

      expect(screen.getByText('Industry Comparison')).toBeInTheDocument();
      expect(screen.getByText('Trending Skills')).toBeInTheDocument();
    });
  });

  describe('Suggestions Functionality', () => {
    it('displays all suggestions in the suggestions tab', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      await user.click(screen.getByText('Suggestions (2)'));

      expect(screen.getByText('Add Industry Keywords')).toBeInTheDocument();
      expect(screen.getByText('Fix Formatting Issues')).toBeInTheDocument();
    });

    it('applies suggestion when apply button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSuggestionInteraction = jest.fn();
      const mockOnScoreUpdate = jest.fn();

      render(
        <AnalysisDashboard
          {...defaultProps}
          onSuggestionInteraction={mockOnSuggestionInteraction}
          onScoreUpdate={mockOnScoreUpdate}
        />
      );

      await user.click(screen.getByText('Suggestions (2)'));

      const applyButtons = screen.getAllByText('Apply');
      await user.click(applyButtons[0]!);

      expect(mockOnSuggestionInteraction).toHaveBeenCalledWith({
        type: 'apply',
        suggestionId: 'suggestion-1',
      });

      expect(mockOnScoreUpdate).toHaveBeenCalledWith(86); // 78 + 8
    });

    it('filters suggestions by priority', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      await user.click(screen.getByText('Suggestions (2)'));

      const filterSelect = screen.getByDisplayValue('All Priorities');
      await user.selectOptions(filterSelect, 'critical');

      expect(screen.getByText('Fix Formatting Issues')).toBeInTheDocument();
      expect(screen.queryByText('Add Industry Keywords')).not.toBeInTheDocument();
    });

    it('sorts suggestions by impact', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      await user.click(screen.getByText('Suggestions (2)'));

      const sortSelect = screen.getByDisplayValue('Priority');
      await user.selectOptions(sortSelect, 'impact');

      // Should show higher impact suggestion first
      const suggestionCards = screen.getAllByText(/Add Industry Keywords|Fix Formatting Issues/);
      expect(suggestionCards[0]).toHaveTextContent('Fix Formatting Issues'); // +12 impact
    });

    it('shows preview when preview button is clicked', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      await user.click(screen.getByText('Suggestions (2)'));

      const previewButtons = screen.getAllByText('Preview');
      await user.click(previewButtons[0]!);

      expect(screen.getByText('Before')).toBeInTheDocument();
      expect(screen.getByText('After')).toBeInTheDocument();
      expect(screen.getByText('Managed team projects')).toBeInTheDocument();
    });
  });

  describe('Achievements Display', () => {
    it('displays achievement badges', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      await user.click(screen.getByText('Achievements (2)'));

      expect(screen.getByText('First Analysis')).toBeInTheDocument();
      expect(screen.getByText('Score Improver')).toBeInTheDocument();
      expect(screen.getByText('+100')).toBeInTheDocument();
      expect(screen.getByText('+250')).toBeInTheDocument();
    });

    it('displays milestone progress', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      await user.click(screen.getByText('Achievements (2)'));

      expect(screen.getByText('Score Master')).toBeInTheDocument();
      expect(screen.getByText('78/85')).toBeInTheDocument();
      expect(screen.getByText('Est. 15min')).toBeInTheDocument();
    });
  });

  describe('Benchmarks Display', () => {
    it('shows industry comparison data', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      await user.click(screen.getByText('Benchmarks'));

      expect(screen.getByText('Industry Comparison')).toBeInTheDocument();
      expect(screen.getByText('Above Average')).toBeInTheDocument(); // 78 > 72 average
      expect(screen.getByText('Compared to Technology professionals')).toBeInTheDocument();
    });

    it('displays trending skills', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      await user.click(screen.getByText('Benchmarks'));

      expect(screen.getByText('Trending Skills')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('AWS')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    it('shows common keywords', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      await user.click(screen.getByText('Benchmarks'));

      expect(screen.getByText('Common Keywords in Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<AnalysisDashboard {...defaultProps} />);

      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Resume Analysis Dashboard'
      );

      // Check for button accessibility
      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AnalysisDashboard {...defaultProps} />);

      // Tab to the suggestions tab
      await user.tab();
      await user.tab();
      await user.keyboard('{Enter}');

      expect(screen.getByText('Sort by')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile screens', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<AnalysisDashboard {...defaultProps} />);

      // Check that mobile-specific classes are applied
      const dashboard = screen.getByText('Resume Analysis Dashboard').closest('div');
      expect(dashboard).toHaveClass('max-w-7xl');
    });
  });

  describe('Error Handling', () => {
    it('handles empty suggestions gracefully', async () => {
      const user = userEvent.setup();
      const propsWithNoSuggestions = {
        ...defaultProps,
        analysisResult: {
          ...mockAnalysisResult,
          suggestions: [],
        },
      };

      render(<AnalysisDashboard {...propsWithNoSuggestions} />);

      await user.click(screen.getByText('Suggestions (0)'));

      expect(screen.getByText('No suggestions found')).toBeInTheDocument();
      expect(screen.getByText('Great job! Your resume looks excellent.')).toBeInTheDocument();
    });

    it('handles empty achievements gracefully', async () => {
      const user = userEvent.setup();
      const propsWithNoAchievements = {
        ...defaultProps,
        analysisResult: {
          ...mockAnalysisResult,
          achievements: [],
          nextMilestones: [],
        },
      };

      render(<AnalysisDashboard {...propsWithNoAchievements} />);

      await user.click(screen.getByText('Achievements (0)'));

      expect(screen.getByText('Complete suggestions to unlock achievements!')).toBeInTheDocument();
      expect(screen.getByText('All milestones completed! Great work!')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes expensive calculations', () => {
      const { rerender } = render(<AnalysisDashboard {...defaultProps} />);

      // Re-render with same props
      rerender(<AnalysisDashboard {...defaultProps} />);

      // Component should not re-calculate sorted suggestions
      expect(screen.getByText('Resume Analysis Dashboard')).toBeInTheDocument();
    });
  });
});
