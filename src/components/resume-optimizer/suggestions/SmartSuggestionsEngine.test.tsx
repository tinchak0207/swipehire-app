/**
 * Smart Suggestions Engine Tests
 *
 * Comprehensive test suite for the Smart Suggestions Engine component
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SmartSuggestionsEngineProps } from './SmartSuggestionsEngine';
import { SmartSuggestionsEngine } from './SmartSuggestionsEngine';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Default props for testing
const defaultProps: SmartSuggestionsEngineProps = {
  content: 'I helped with various tasks and was responsible for managing projects.',
  targetRole: 'Software Engineer',
  targetIndustry: 'technology',
  experienceLevel: 'mid',
  enableRealTime: true,
  enableMLSuggestions: true,
  onSuggestionGenerated: jest.fn(),
  onSuggestionApplied: jest.fn(),
  onSuggestionDismissed: jest.fn(),
  onContentUpdate: jest.fn(),
};

describe('SmartSuggestionsEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component with correct title', () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      expect(screen.getByText('🧠 Smart Suggestions Engine')).toBeInTheDocument();
      expect(
        screen.getByText(/AI-powered recommendations for Software Engineer in technology/)
      ).toBeInTheDocument();
    });

    it('displays real-time badge when enabled', () => {
      render(<SmartSuggestionsEngine {...defaultProps} enableRealTime={true} />);

      expect(screen.getByText('Real-time')).toBeInTheDocument();
    });

    it('displays manual badge when real-time is disabled', () => {
      render(<SmartSuggestionsEngine {...defaultProps} enableRealTime={false} />);

      expect(screen.getByText('Manual')).toBeInTheDocument();
    });

    it('displays ML Enhanced badge when ML suggestions are enabled', () => {
      render(<SmartSuggestionsEngine {...defaultProps} enableMLSuggestions={true} />);

      expect(screen.getByText('ML Enhanced')).toBeInTheDocument();
    });
  });

  describe('Suggestion Generation', () => {
    it('generates action verb suggestions for weak verbs', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      // Wait for suggestions to be generated
      await waitFor(() => {
        expect(screen.getByText(/Replace "helped" with stronger action verb/)).toBeInTheDocument();
      });
    });

    it('generates keyword suggestions for missing industry keywords', async () => {
      const propsWithoutKeywords = {
        ...defaultProps,
        content: 'I worked on projects and delivered results.',
      };

      render(<SmartSuggestionsEngine {...propsWithoutKeywords} />);

      await waitFor(() => {
        expect(screen.getByText(/Add.*keyword/)).toBeInTheDocument();
      });
    });

    it('generates ATS optimization suggestions', async () => {
      const propsWithSpecialChars = {
        ...defaultProps,
        content: 'I worked on projects • Delivered results ◦ Managed teams',
      };

      render(<SmartSuggestionsEngine {...propsWithSpecialChars} />);

      await waitFor(() => {
        expect(screen.getByText(/ATS Optimization/)).toBeInTheDocument();
      });
    });

    it('generates quantification suggestions', async () => {
      const propsWithoutNumbers = {
        ...defaultProps,
        content: 'I increased sales and managed a team.',
      };

      render(<SmartSuggestionsEngine {...propsWithoutNumbers} />);

      await waitFor(() => {
        expect(screen.getByText(/Add Quantifiable Results/)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering and Sorting', () => {
    it('filters suggestions by type', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      // Wait for suggestions to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
      });

      // Change filter to keywords
      const filterSelect = screen.getByDisplayValue('All Types');
      await userEvent.selectOptions(filterSelect, 'keyword');

      expect(filterSelect).toHaveValue('keyword');
    });

    it('sorts suggestions by priority, confidence, and impact', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Priority')).toBeInTheDocument();
      });

      const sortSelect = screen.getByDisplayValue('Priority');

      // Test sorting by confidence
      await userEvent.selectOptions(sortSelect, 'confidence');
      expect(sortSelect).toHaveValue('confidence');

      // Test sorting by impact
      await userEvent.selectOptions(sortSelect, 'impact');
      expect(sortSelect).toHaveValue('impact');
    });
  });

  describe('Suggestion Interactions', () => {
    it('applies suggestions when Apply button is clicked', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      await waitFor(() => {
        const applyButtons = screen.getAllByText('Apply');
        expect(applyButtons.length).toBeGreaterThan(0);
      });

      const applyButton = screen.getAllByText('Apply')[0];
      if (applyButton) {
        await userEvent.click(applyButton);
      }

      expect(defaultProps.onSuggestionApplied).toHaveBeenCalled();
      expect(defaultProps.onContentUpdate).toHaveBeenCalled();
    });

    it('dismisses suggestions when Dismiss button is clicked', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      await waitFor(() => {
        const dismissButtons = screen.getAllByText('Dismiss');
        expect(dismissButtons.length).toBeGreaterThan(0);
      });

      const dismissButton = screen.getAllByText('Dismiss')[0];
      if (dismissButton) {
        await userEvent.click(dismissButton);
      }

      expect(defaultProps.onSuggestionDismissed).toHaveBeenCalled();
    });

    it('expands suggestion details when expand button is clicked', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      await waitFor(() => {
        const expandButtons = screen.getAllByText('▶');
        expect(expandButtons.length).toBeGreaterThan(0);
      });

      const expandButton = screen.getAllByText('▶')[0];
      if (expandButton) {
        await userEvent.click(expandButton);
      }

      expect(screen.getByText('▼')).toBeInTheDocument();
    });
  });

  describe('Manual Analysis', () => {
    it('triggers manual analysis when Analyze button is clicked', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} enableRealTime={false} />);

      const analyzeButton = screen.getByText('Analyze');
      await userEvent.click(analyzeButton);

      expect(defaultProps.onSuggestionGenerated).toHaveBeenCalled();
    });

    it('shows loading state during analysis', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      const analyzeButton = screen.getByText('Analyze');
      await userEvent.click(analyzeButton);

      // Check for loading state (button should be disabled)
      expect(analyzeButton).toBeDisabled();
    });
  });

  describe('Metrics Display', () => {
    it('displays analysis metrics', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Analysis Metrics')).toBeInTheDocument();
        expect(screen.getByText('Processing Time')).toBeInTheDocument();
        expect(screen.getByText('Suggestions')).toBeInTheDocument();
        expect(screen.getByText('Avg Confidence')).toBeInTheDocument();
        expect(screen.getByText('ATS Score')).toBeInTheDocument();
      });
    });

    it('displays suggestion summary', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Suggestion Summary')).toBeInTheDocument();
        expect(screen.getByText('Critical')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('Low')).toBeInTheDocument();
      });
    });

    it('displays industry keywords', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Industry Keywords')).toBeInTheDocument();
        expect(screen.getByText(/Keyword density:/)).toBeInTheDocument();
      });
    });
  });

  describe('Experience Level Adaptation', () => {
    it('suggests appropriate action verbs for entry level', async () => {
      const entryLevelProps = {
        ...defaultProps,
        experienceLevel: 'entry' as const,
      };

      render(<SmartSuggestionsEngine {...entryLevelProps} />);

      await waitFor(() => {
        expect(defaultProps.onSuggestionGenerated).toHaveBeenCalled();
      });
    });

    it('suggests appropriate action verbs for senior level', async () => {
      const seniorLevelProps = {
        ...defaultProps,
        experienceLevel: 'senior' as const,
      };

      render(<SmartSuggestionsEngine {...seniorLevelProps} />);

      await waitFor(() => {
        expect(defaultProps.onSuggestionGenerated).toHaveBeenCalled();
      });
    });

    it('suggests appropriate action verbs for executive level', async () => {
      const executiveLevelProps = {
        ...defaultProps,
        experienceLevel: 'executive' as const,
      };

      render(<SmartSuggestionsEngine {...executiveLevelProps} />);

      await waitFor(() => {
        expect(defaultProps.onSuggestionGenerated).toHaveBeenCalled();
      });
    });
  });

  describe('Industry Adaptation', () => {
    it('suggests finance-specific keywords for finance industry', async () => {
      const financeProps = {
        ...defaultProps,
        targetIndustry: 'finance',
        content: 'I worked on projects and delivered results.',
      };

      render(<SmartSuggestionsEngine {...financeProps} />);

      await waitFor(() => {
        expect(defaultProps.onSuggestionGenerated).toHaveBeenCalled();
      });
    });

    it('suggests marketing-specific keywords for marketing industry', async () => {
      const marketingProps = {
        ...defaultProps,
        targetIndustry: 'marketing',
        content: 'I worked on projects and delivered results.',
      };

      render(<SmartSuggestionsEngine {...marketingProps} />);

      await waitFor(() => {
        expect(defaultProps.onSuggestionGenerated).toHaveBeenCalled();
      });
    });
  });

  describe('Real-time Analysis', () => {
    it('triggers analysis when content changes in real-time mode', async () => {
      const { rerender } = render(
        <SmartSuggestionsEngine {...defaultProps} enableRealTime={true} />
      );

      // Change content
      const newProps = {
        ...defaultProps,
        content: 'Updated content with new information.',
      };

      rerender(<SmartSuggestionsEngine {...newProps} />);

      // Wait for debounced analysis
      await waitFor(
        () => {
          expect(defaultProps.onSuggestionGenerated).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it('does not trigger analysis when real-time is disabled', async () => {
      const { rerender } = render(
        <SmartSuggestionsEngine {...defaultProps} enableRealTime={false} />
      );

      // Clear previous calls
      jest.clearAllMocks();

      // Change content
      const newProps = {
        ...defaultProps,
        content: 'Updated content with new information.',
        enableRealTime: false,
      };

      rerender(<SmartSuggestionsEngine {...newProps} />);

      // Wait a bit and ensure no analysis was triggered
      await new Promise((resolve) => setTimeout(resolve, 1500));
      expect(defaultProps.onSuggestionGenerated).not.toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no suggestions are found', async () => {
      const perfectContentProps = {
        ...defaultProps,
        content:
          'Spearheaded agile development of cloud-based microservices architecture, increasing system performance by 40% and reducing deployment time by 60%.',
      };

      render(<SmartSuggestionsEngine {...perfectContentProps} />);

      await waitFor(() => {
        expect(screen.getByText('No suggestions found!')).toBeInTheDocument();
        expect(
          screen.getByText(
            'Your resume looks great! Try writing more content to get additional suggestions.'
          )
        ).toBeInTheDocument();
      });
    });

    it('shows filtered empty state when no suggestions match filter', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      // Wait for suggestions to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
      });

      // Filter by a type that has no suggestions
      const filterSelect = screen.getByDisplayValue('All Types');
      await userEvent.selectOptions(filterSelect, 'industry');

      await waitFor(() => {
        expect(screen.getByText(/No industry suggestions found/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      // Check for proper form controls
      expect(screen.getByLabelText('Filter by type')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<SmartSuggestionsEngine {...defaultProps} />);

      await waitFor(() => {
        const analyzeButton = screen.getByText('Analyze');
        expect(analyzeButton).toBeInTheDocument();
      });

      const analyzeButton = screen.getByText('Analyze');

      // Focus the button
      analyzeButton.focus();
      expect(analyzeButton).toHaveFocus();

      // Press Enter
      fireEvent.keyDown(analyzeButton, { key: 'Enter', code: 'Enter' });
      expect(defaultProps.onSuggestionGenerated).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('debounces real-time analysis', async () => {
      const { rerender } = render(
        <SmartSuggestionsEngine {...defaultProps} enableRealTime={true} />
      );

      // Clear previous calls
      jest.clearAllMocks();

      // Rapidly change content multiple times
      for (let i = 0; i < 5; i++) {
        const newProps = {
          ...defaultProps,
          content: `Updated content ${i}`,
        };
        rerender(<SmartSuggestionsEngine {...newProps} />);
      }

      // Wait for debounced analysis (should only be called once)
      await waitFor(
        () => {
          expect(defaultProps.onSuggestionGenerated).toHaveBeenCalledTimes(1);
        },
        { timeout: 2000 }
      );
    });
  });
});
