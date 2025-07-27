/**
 * Smart Suggestions Engine Integration Tests
 *
 * Integration tests for the Smart Suggestions Engine component
 * Tests the component's interaction with external systems and real-world scenarios
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SmartSuggestion, SmartSuggestionsEngineProps } from './SmartSuggestionsEngine';
import { SmartSuggestionsEngine } from './SmartSuggestionsEngine';

// Mock external dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Test data for different scenarios
const testScenarios = {
  entryLevel: {
    content:
      'I helped with coding tasks and assisted senior developers. I was responsible for testing and participated in team meetings.',
    targetRole: 'Junior Developer',
    targetIndustry: 'technology',
    experienceLevel: 'entry' as const,
    expectedSuggestions: ['action-verb', 'keyword', 'grammar'],
  },
  midLevel: {
    content:
      'I managed development projects and worked with cross-functional teams. I helped implement new features and assisted with code reviews.',
    targetRole: 'Software Engineer',
    targetIndustry: 'technology',
    experienceLevel: 'mid' as const,
    expectedSuggestions: ['action-verb', 'keyword', 'quantification'],
  },
  seniorLevel: {
    content:
      'Led development teams and managed large projects. Improved system performance and reduced costs. Implemented new technologies.',
    targetRole: 'Senior Software Engineer',
    targetIndustry: 'technology',
    experienceLevel: 'senior' as const,
    expectedSuggestions: ['quantification', 'keyword'],
  },
  executiveLevel: {
    content:
      'Spearheaded digital transformation initiatives. Orchestrated strategic partnerships and drove revenue growth.',
    targetRole: 'Chief Technology Officer',
    targetIndustry: 'technology',
    experienceLevel: 'executive' as const,
    expectedSuggestions: ['keyword', 'quantification'],
  },
  financeIndustry: {
    content:
      'Managed investment portfolios and analyzed market trends. Developed financial models and prepared reports.',
    targetRole: 'Financial Analyst',
    targetIndustry: 'finance',
    experienceLevel: 'mid' as const,
    expectedSuggestions: ['keyword', 'quantification', 'action-verb'],
  },
  marketingIndustry: {
    content:
      'Created marketing campaigns and managed social media accounts. Worked with design teams to develop content.',
    targetRole: 'Digital Marketing Manager',
    targetIndustry: 'marketing',
    experienceLevel: 'mid' as const,
    expectedSuggestions: ['keyword', 'quantification', 'action-verb'],
  },
  atsProblematic: {
    content: '• Managed projects using special characters ◦ Worked with tëams • Delivered résults',
    targetRole: 'Project Manager',
    targetIndustry: 'technology',
    experienceLevel: 'mid' as const,
    expectedSuggestions: ['ats', 'grammar'],
  },
  optimizedContent: {
    content:
      'Spearheaded agile development of cloud-based microservices architecture, increasing system performance by 40% and reducing deployment time by 60%.',
    targetRole: 'Senior Software Engineer',
    targetIndustry: 'technology',
    experienceLevel: 'senior' as const,
    expectedSuggestions: [],
  },
};

describe('SmartSuggestionsEngine Integration Tests', () => {
  let mockProps: SmartSuggestionsEngineProps;
  let generatedSuggestions: SmartSuggestion[] = [];
  let appliedSuggestions: string[] = [];
  let dismissedSuggestions: string[] = [];
  let contentUpdates: string[] = [];

  beforeEach(() => {
    generatedSuggestions = [];
    appliedSuggestions = [];
    dismissedSuggestions = [];
    contentUpdates = [];

    mockProps = {
      content: '',
      targetRole: 'Software Engineer',
      targetIndustry: 'technology',
      experienceLevel: 'mid',
      enableRealTime: true,
      enableMLSuggestions: true,
      onSuggestionGenerated: (suggestions) => {
        generatedSuggestions = suggestions;
      },
      onSuggestionApplied: (suggestionId) => {
        appliedSuggestions.push(suggestionId);
      },
      onSuggestionDismissed: (suggestionId) => {
        dismissedSuggestions.push(suggestionId);
      },
      onContentUpdate: (newContent) => {
        contentUpdates.push(newContent);
      },
    };
  });

  describe('End-to-End Suggestion Workflow', () => {
    it('generates, applies, and tracks suggestions for entry-level resume', async () => {
      const scenario = testScenarios.entryLevel;

      render(
        <SmartSuggestionsEngine
          {...mockProps}
          content={scenario.content}
          targetRole={scenario.targetRole}
          targetIndustry={scenario.targetIndustry}
          experienceLevel={scenario.experienceLevel}
        />
      );

      // Wait for suggestions to be generated
      await waitFor(
        () => {
          expect(generatedSuggestions.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      // Verify expected suggestion types are present
      const suggestionTypes = generatedSuggestions.map((s) => s.type);
      scenario.expectedSuggestions.forEach((expectedType) => {
        expect(suggestionTypes).toContain(expectedType);
      });

      // Apply the first auto-applicable suggestion
      const autoApplicableSuggestion = generatedSuggestions.find((s) => s.canAutoApply);
      if (autoApplicableSuggestion) {
        const applyButton = screen.getAllByText('Apply')[0];
        await userEvent.click(applyButton!);

        await waitFor(() => {
          expect(appliedSuggestions).toContain(autoApplicableSuggestion.id);
          expect(contentUpdates.length).toBeGreaterThan(0);
        });
      }

      // Dismiss a suggestion
      const dismissButton = screen.getAllByText('Dismiss')[0];
      await userEvent.click(dismissButton!);

      await waitFor(() => {
        expect(dismissedSuggestions.length).toBeGreaterThan(0);
      });
    });

    it('handles real-time content updates correctly', async () => {
      const { rerender } = render(<SmartSuggestionsEngine {...mockProps} />);

      // Start with basic content
      rerender(<SmartSuggestionsEngine {...mockProps} content="I helped with tasks." />);

      await waitFor(
        () => {
          expect(generatedSuggestions.length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );

      const initialSuggestionCount = generatedSuggestions.length;

      // Update content to trigger new analysis
      rerender(
        <SmartSuggestionsEngine
          {...mockProps}
          content="I helped with tasks and was responsible for managing projects."
        />
      );

      await waitFor(
        () => {
          expect(generatedSuggestions.length).toBeGreaterThanOrEqual(initialSuggestionCount);
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Industry-Specific Optimization', () => {
    it('generates appropriate suggestions for finance industry', async () => {
      const scenario = testScenarios.financeIndustry;

      render(
        <SmartSuggestionsEngine
          {...mockProps}
          content={scenario.content}
          targetRole={scenario.targetRole}
          targetIndustry={scenario.targetIndustry}
          experienceLevel={scenario.experienceLevel}
        />
      );

      await waitFor(
        () => {
          expect(generatedSuggestions.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      // Check for finance-specific keyword suggestions
      const keywordSuggestions = generatedSuggestions.filter((s) => s.type === 'keyword');
      expect(keywordSuggestions.length).toBeGreaterThan(0);

      // Verify finance keywords are suggested
      const financeKeywords = [
        'financial modeling',
        'risk management',
        'portfolio management',
        'compliance',
      ];
      const suggestedKeywords = keywordSuggestions.map((s) => s.suggestedText.toLowerCase());

      const hasFinanceKeywords = financeKeywords.some((keyword) =>
        suggestedKeywords.some((suggested) => suggested.includes(keyword))
      );
      expect(hasFinanceKeywords).toBe(true);
    });

    it('generates appropriate suggestions for marketing industry', async () => {
      const scenario = testScenarios.marketingIndustry;

      render(
        <SmartSuggestionsEngine
          {...mockProps}
          content={scenario.content}
          targetRole={scenario.targetRole}
          targetIndustry={scenario.targetIndustry}
          experienceLevel={scenario.experienceLevel}
        />
      );

      await waitFor(
        () => {
          expect(generatedSuggestions.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      // Check for marketing-specific suggestions
      const keywordSuggestions = generatedSuggestions.filter((s) => s.type === 'keyword');
      expect(keywordSuggestions.length).toBeGreaterThan(0);

      // Verify marketing keywords are suggested
      const marketingKeywords = [
        'digital marketing',
        'seo',
        'conversion optimization',
        'analytics',
      ];
      const suggestedKeywords = keywordSuggestions.map((s) => s.suggestedText.toLowerCase());

      const hasMarketingKeywords = marketingKeywords.some((keyword) =>
        suggestedKeywords.some((suggested) => suggested.includes(keyword))
      );
      expect(hasMarketingKeywords).toBe(true);
    });
  });

  describe('Experience Level Adaptation', () => {
    it('suggests appropriate action verbs for different experience levels', async () => {
      const scenarios = [
        testScenarios.entryLevel,
        testScenarios.midLevel,
        testScenarios.seniorLevel,
        testScenarios.executiveLevel,
      ];

      for (const scenario of scenarios) {
        render(
          <SmartSuggestionsEngine
            {...mockProps}
            content={scenario.content}
            experienceLevel={scenario.experienceLevel}
          />
        );

        await waitFor(
          () => {
            expect(generatedSuggestions.length).toBeGreaterThan(0);
          },
          { timeout: 3000 }
        );

        const actionVerbSuggestions = generatedSuggestions.filter((s) => s.type === 'action-verb');

        if (actionVerbSuggestions.length > 0) {
          // Verify action verbs are appropriate for experience level
          const suggestedVerbs = actionVerbSuggestions.map((s) => s.suggestedText.toLowerCase());

          switch (scenario.experienceLevel) {
            case 'entry':
              expect(
                suggestedVerbs.some((verb) =>
                  ['assisted', 'supported', 'contributed', 'learned'].includes(verb)
                )
              ).toBe(true);
              break;
            case 'mid':
              expect(
                suggestedVerbs.some((verb) =>
                  ['managed', 'led', 'developed', 'implemented'].includes(verb)
                )
              ).toBe(true);
              break;
            case 'senior':
              expect(
                suggestedVerbs.some((verb) =>
                  ['spearheaded', 'orchestrated', 'pioneered', 'architected'].includes(verb)
                )
              ).toBe(true);
              break;
            case 'executive':
              expect(
                suggestedVerbs.some((verb) =>
                  ['envisioned', 'strategized', 'transformed', 'revolutionized'].includes(verb)
                )
              ).toBe(true);
              break;
          }
        }

        // Clear suggestions for next iteration
        generatedSuggestions = [];
      }
    });
  });

  describe('ATS Optimization', () => {
    it('identifies and suggests fixes for ATS compatibility issues', async () => {
      const scenario = testScenarios.atsProblematic;

      render(
        <SmartSuggestionsEngine
          {...mockProps}
          content={scenario.content}
          targetRole={scenario.targetRole}
          targetIndustry={scenario.targetIndustry}
          experienceLevel={scenario.experienceLevel}
        />
      );

      await waitFor(
        () => {
          expect(generatedSuggestions.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      // Check for ATS-related suggestions
      const atsSuggestions = generatedSuggestions.filter((s) => s.type === 'ats');
      expect(atsSuggestions.length).toBeGreaterThan(0);

      // Verify ATS suggestions have high priority
      atsSuggestions.forEach((suggestion) => {
        expect(['critical', 'high']).toContain(suggestion.priority);
      });

      // Verify ATS suggestions improve compatibility
      atsSuggestions.forEach((suggestion) => {
        expect(suggestion.impact.atsCompatibility).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance and Metrics', () => {
    it('tracks and displays analysis metrics correctly', async () => {
      render(<SmartSuggestionsEngine {...mockProps} content={testScenarios.midLevel.content} />);

      await waitFor(
        () => {
          expect(screen.getByText('Analysis Metrics')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Check that metrics are displayed
      expect(screen.getByText('Processing Time')).toBeInTheDocument();
      expect(screen.getByText('Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Avg Confidence')).toBeInTheDocument();
      expect(screen.getByText('ATS Score')).toBeInTheDocument();

      // Verify metrics have reasonable values
      const processingTimeElement = screen.getByText(/\d+ms/);
      expect(processingTimeElement).toBeInTheDocument();
    });

    it('handles large content efficiently', async () => {
      const largeContent = testScenarios.midLevel.content.repeat(50); // Very large content

      const startTime = Date.now();

      render(<SmartSuggestionsEngine {...mockProps} content={largeContent} />);

      await waitFor(
        () => {
          expect(generatedSuggestions.length).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should complete within reasonable time (5 seconds)
      expect(processingTime).toBeLessThan(5000);
    });
  });

  describe('Filtering and Sorting', () => {
    it('filters suggestions by type correctly', async () => {
      render(<SmartSuggestionsEngine {...mockProps} content={testScenarios.midLevel.content} />);

      await waitFor(
        () => {
          expect(generatedSuggestions.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      // Filter by keyword type
      const filterSelect = screen.getByDisplayValue('All Types');
      await userEvent.selectOptions(filterSelect, 'keyword');

      // Verify only keyword suggestions are shown
      await waitFor(() => {
        const visibleSuggestions = screen.getAllByText(/keyword/i);
        expect(visibleSuggestions.length).toBeGreaterThan(0);
      });
    });

    it('sorts suggestions by different criteria', async () => {
      render(<SmartSuggestionsEngine {...mockProps} content={testScenarios.midLevel.content} />);

      await waitFor(
        () => {
          expect(generatedSuggestions.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      const sortSelect = screen.getByDisplayValue('Priority');

      // Test sorting by confidence
      await userEvent.selectOptions(sortSelect, 'confidence');
      expect(sortSelect).toHaveValue('confidence');

      // Test sorting by impact
      await userEvent.selectOptions(sortSelect, 'impact');
      expect(sortSelect).toHaveValue('impact');
    });
  });

  describe('Manual vs Real-time Analysis', () => {
    it('performs manual analysis when real-time is disabled', async () => {
      render(
        <SmartSuggestionsEngine
          {...mockProps}
          content={testScenarios.midLevel.content}
          enableRealTime={false}
        />
      );

      // Should not generate suggestions automatically
      await new Promise((resolve) => setTimeout(resolve, 1500));
      expect(generatedSuggestions.length).toBe(0);

      // Click analyze button
      const analyzeButton = screen.getByText('Analyze');
      await userEvent.click(analyzeButton!);

      // Should now generate suggestions
      await waitFor(
        () => {
          expect(generatedSuggestions.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );
    });

    it('debounces real-time analysis correctly', async () => {
      const { rerender } = render(
        <SmartSuggestionsEngine {...mockProps} content="" enableRealTime={true} />
      );

      let analysisCount = 0;
      const originalOnGenerated = mockProps.onSuggestionGenerated;
      const testProps = {
        ...mockProps,
        onSuggestionGenerated: (suggestions: SmartSuggestion[]) => {
          analysisCount++;
          if (originalOnGenerated) originalOnGenerated(suggestions);
        },
      };

      // Rapidly change content multiple times
      for (let i = 0; i < 5; i++) {
        rerender(<SmartSuggestionsEngine {...testProps} content={`Content update ${i}`} />);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Wait for debounced analysis
      await waitFor(
        () => {
          expect(analysisCount).toBe(1);
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Error Handling', () => {
    it('handles empty content gracefully', async () => {
      render(<SmartSuggestionsEngine {...mockProps} content="" />);

      // Should not crash and should show appropriate message
      await waitFor(
        () => {
          expect(screen.getByText(/No suggestions found/)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('handles unsupported industry gracefully', async () => {
      render(
        <SmartSuggestionsEngine
          {...mockProps}
          content={testScenarios.midLevel.content}
          targetIndustry="unsupported-industry"
        />
      );

      // Should still generate some suggestions (non-industry specific)
      await waitFor(
        () => {
          expect(generatedSuggestions.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Accessibility Integration', () => {
    it('supports keyboard navigation through suggestions', async () => {
      render(<SmartSuggestionsEngine {...mockProps} content={testScenarios.midLevel.content} />);

      await waitFor(
        () => {
          expect(generatedSuggestions.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      // Test keyboard navigation
      const firstApplyButton = screen.getAllByText('Apply')[0];
      firstApplyButton?.focus();
      expect(firstApplyButton).toHaveFocus();

      // Test Enter key activation
      if (firstApplyButton) fireEvent.keyDown(firstApplyButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(appliedSuggestions.length).toBeGreaterThan(0);
      });
    });

    it('provides proper ARIA labels and descriptions', async () => {
      render(<SmartSuggestionsEngine {...mockProps} content={testScenarios.midLevel.content} />);

      await waitFor(
        () => {
          expect(screen.getByLabelText('Filter by type')).toBeInTheDocument();
          expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
