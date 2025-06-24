'use client';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportDisplay from './ReportDisplay';
import type { ResumeAnalysisResponse } from '@/lib/types/resume-optimizer';

// Mock data for testing
const mockAnalysisResult: ResumeAnalysisResponse = {
  id: 'test-analysis-123',
  overallScore: 78,
  atsScore: 85,
  keywordAnalysis: {
    score: 72,
    totalKeywords: 10,
    matchedKeywords: [
      {
        keyword: 'JavaScript',
        frequency: 3,
        relevanceScore: 9,
        context: ['Frontend development', 'React applications'],
      },
    ],
    missingKeywords: [
      {
        keyword: 'Docker',
        importance: 'high',
        suggestedPlacement: ['Technical Skills'],
        relatedTerms: ['containerization'],
      },
    ],
    keywordDensity: { 'JavaScript': 2.1 },
    recommendations: ['Add Docker experience'],
  },
  suggestions: [
    {
      id: 'suggestion-1',
      type: 'keyword',
      title: 'Add Docker Experience',
      description: 'Docker is important for this role',
      impact: 'high',
      suggestion: 'Add Docker to your skills',
      priority: 9,
      estimatedScoreImprovement: 8,
      section: 'Technical Skills',
    },
    {
      id: 'suggestion-2',
      type: 'achievement',
      title: 'Quantify Achievements',
      description: 'Add numbers to your achievements',
      impact: 'medium',
      suggestion: 'Add specific metrics',
      beforeText: 'Improved performance',
      afterText: 'Improved performance by 40%',
      priority: 7,
      estimatedScoreImprovement: 5,
      section: 'Experience',
    },
  ],
  grammarCheck: {
    score: 88,
    totalIssues: 2,
    overallReadability: 82,
    issues: [
      {
        id: 'grammar-1',
        type: 'grammar',
        severity: 'warning',
        message: 'Verb tense issue',
        context: 'developing applications',
        suggestions: ['developed applications'],
        position: { start: 100, end: 120 },
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
        description: 'Missing summary',
        recommendation: 'Add professional summary',
      },
    ],
    recommendations: ['Use standard headers'],
    sectionStructure: [
      { name: 'Contact', present: true, order: 1, recommended: true },
    ],
  },
  quantitativeAnalysis: {
    score: 65,
    achievementsWithNumbers: 2,
    totalAchievements: 5,
    suggestions: [
      {
        section: 'Experience',
        originalText: 'Led team',
        suggestedText: 'Led team of 5 developers',
        reasoning: 'Quantify team size',
      },
    ],
    impactWords: ['Led', 'Developed'],
  },
  strengths: ['Good technical skills', 'Clear structure'],
  weaknesses: ['Missing quantified achievements', 'Grammar issues'],
  createdAt: new Date().toISOString(),
  processingTime: 1500,
  metadata: {
    analysisDate: new Date().toISOString(),
    targetJobTitle: 'Frontend Developer',
    wordCount: 500,
    processingTime: 1500,
  },
};

describe('ReportDisplay Integration Tests', () => {
  const mockOnSuggestionAdopt = vi.fn();
  const mockOnSuggestionIgnore = vi.fn();
  const mockOnSuggestionModify = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    render(
      <ReportDisplay
        analysisResult={null}
        isLoading={true}
        onSuggestionAdopt={mockOnSuggestionAdopt}
        onSuggestionIgnore={mockOnSuggestionIgnore}
      />
    );

    expect(screen.getByText('Analyzing Your Resume')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we generate your optimization report...')).toBeInTheDocument();
  });

  it('renders empty state when no analysis result', () => {
    render(
      <ReportDisplay
        analysisResult={null}
        isLoading={false}
        onSuggestionAdopt={mockOnSuggestionAdopt}
        onSuggestionIgnore={mockOnSuggestionIgnore}
      />
    );

    expect(screen.getByText('No Analysis Available')).toBeInTheDocument();
    expect(screen.getByText('The resume analysis report is not available. Please try analyzing your resume again.')).toBeInTheDocument();
  });

  it('renders complete analysis result', () => {
    render(
      <ReportDisplay
        analysisResult={mockAnalysisResult}
        isLoading={false}
        onSuggestionAdopt={mockOnSuggestionAdopt}
        onSuggestionIgnore={mockOnSuggestionIgnore}
      />
    );

    // Check header
    expect(screen.getByText('Resume Optimization Report')).toBeInTheDocument();
    expect(screen.getByText('Target Role: Frontend Developer')).toBeInTheDocument();

    // Check tabs
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();

    // Check scores in overview
    expect(screen.getByText('Overall Score')).toBeInTheDocument();
    expect(screen.getByText('ATS Compatibility')).toBeInTheDocument();
    expect(screen.getByText('Keyword Match')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    render(
      <ReportDisplay
        analysisResult={mockAnalysisResult}
        isLoading={false}
        onSuggestionAdopt={mockOnSuggestionAdopt}
        onSuggestionIgnore={mockOnSuggestionIgnore}
      />
    );

    // Initially on Overview tab
    expect(screen.getByText('Overall Score')).toBeInTheDocument();

    // Switch to Suggestions tab
    fireEvent.click(screen.getByText('Suggestions'));
    await waitFor(() => {
      expect(screen.getByText('Optimization Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Add Docker Experience')).toBeInTheDocument();
    });

    // Switch to Details tab
    fireEvent.click(screen.getByText('Details'));
    await waitFor(() => {
      expect(screen.getByText('ATS Friendliness Analysis')).toBeInTheDocument();
    });
  });

  it('handles suggestion adoption correctly', async () => {
    const adoptedSuggestions = new Set<string>();
    const ignoredSuggestions = new Set<string>();

    render(
      <ReportDisplay
        analysisResult={mockAnalysisResult}
        isLoading={false}
        onSuggestionAdopt={mockOnSuggestionAdopt}
        onSuggestionIgnore={mockOnSuggestionIgnore}
        adoptedSuggestions={adoptedSuggestions}
        ignoredSuggestions={ignoredSuggestions}
      />
    );

    // Switch to Suggestions tab
    fireEvent.click(screen.getByText('Suggestions'));

    // Find and click adopt button
    await waitFor(() => {
      const adoptButtons = screen.getAllByText('Adopt');
      expect(adoptButtons.length).toBeGreaterThan(0);
      fireEvent.click(adoptButtons[0]);
    });

    expect(mockOnSuggestionAdopt).toHaveBeenCalledWith('suggestion-1');
  });

  it('handles suggestion ignore correctly', async () => {
    const adoptedSuggestions = new Set<string>();
    const ignoredSuggestions = new Set<string>();

    render(
      <ReportDisplay
        analysisResult={mockAnalysisResult}
        isLoading={false}
        onSuggestionAdopt={mockOnSuggestionAdopt}
        onSuggestionIgnore={mockOnSuggestionIgnore}
        adoptedSuggestions={adoptedSuggestions}
        ignoredSuggestions={ignoredSuggestions}
      />
    );

    // Switch to Suggestions tab
    fireEvent.click(screen.getByText('Suggestions'));

    // Find and click ignore button
    await waitFor(() => {
      const ignoreButtons = screen.getAllByText('Ignore');
      expect(ignoreButtons.length).toBeGreaterThan(0);
      fireEvent.click(ignoreButtons[0]);
    });

    expect(mockOnSuggestionIgnore).toHaveBeenCalledWith('suggestion-1');
  });

  it('displays adopted suggestions correctly', () => {
    const adoptedSuggestions = new Set<string>(['suggestion-1']);
    const ignoredSuggestions = new Set<string>();

    render(
      <ReportDisplay
        analysisResult={mockAnalysisResult}
        isLoading={false}
        onSuggestionAdopt={mockOnSuggestionAdopt}
        onSuggestionIgnore={mockOnSuggestionIgnore}
        adoptedSuggestions={adoptedSuggestions}
        ignoredSuggestions={ignoredSuggestions}
      />
    );

    // Switch to Suggestions tab
    fireEvent.click(screen.getByText('Suggestions'));

    // Check that adopted suggestion shows adopted state
    expect(screen.getByText('Adopted')).toBeInTheDocument();
  });

  it('displays ignored suggestions correctly', () => {
    const adoptedSuggestions = new Set<string>();
    const ignoredSuggestions = new Set<string>(['suggestion-1']);

    render(
      <ReportDisplay
        analysisResult={mockAnalysisResult}
        isLoading={false}
        onSuggestionAdopt={mockOnSuggestionAdopt}
        onSuggestionIgnore={mockOnSuggestionIgnore}
        adoptedSuggestions={adoptedSuggestions}
        ignoredSuggestions={ignoredSuggestions}
      />
    );

    // Switch to Suggestions tab
    fireEvent.click(screen.getByText('Suggestions'));

    // Check that ignored suggestion shows ignored state
    expect(screen.getByText('Ignored')).toBeInTheDocument();
  });

  it('expands and collapses detail sections', async () => {
    render(
      <ReportDisplay
        analysisResult={mockAnalysisResult}
        isLoading={false}
        onSuggestionAdopt={mockOnSuggestionAdopt}
        onSuggestionIgnore={mockOnSuggestionIgnore}
      />
    );

    // Switch to Details tab
    fireEvent.click(screen.getByText('Details'));

    // Find a collapsible section
    await waitFor(() => {
      const atsSection = screen.getByText('ATS Friendliness Analysis');
      expect(atsSection).toBeInTheDocument();
      
      // Click to expand (it should be expanded by default)
      fireEvent.click(atsSection);
    });

    // Check that section content is visible
    expect(screen.getByText('ATS Compatibility Score')).toBeInTheDocument();
  });

  it('handles suggestion modification', async () => {
    render(
      <ReportDisplay
        analysisResult={mockAnalysisResult}
        isLoading={false}
        onSuggestionAdopt={mockOnSuggestionAdopt}
        onSuggestionIgnore={mockOnSuggestionIgnore}
        onSuggestionModify={mockOnSuggestionModify}
      />
    );

    // Switch to Suggestions tab
    fireEvent.click(screen.getByText('Suggestions'));

    // Find and click modify button
    await waitFor(() => {
      const modifyButtons = screen.getAllByText('Modify');
      if (modifyButtons.length > 0) {
        fireEvent.click(modifyButtons[0]);
      }
    });

    // Check if modify interface appears (textarea should be visible)
    await waitFor(() => {
      const textareas = screen.getAllByRole('textbox');
      if (textareas.length > 0) {
        const textarea = textareas.find(el => 
          el.getAttribute('placeholder')?.includes('Modify') ||
          el.className.includes('textarea')
        );
        if (textarea) {
          fireEvent.change(textarea, { target: { value: 'Modified suggestion text' } });
          
          // Find and click save button
          const saveButton = screen.getByText('Save');
          fireEvent.click(saveButton);
          
          expect(mockOnSuggestionModify).toHaveBeenCalledWith('suggestion-1', 'Modified suggestion text');
        }
      }
    });
  });

  it('displays correct statistics in overview', () => {
    render(
      <ReportDisplay
        analysisResult={mockAnalysisResult}
        isLoading={false}
        onSuggestionAdopt={mockOnSuggestionAdopt}
        onSuggestionIgnore={mockOnSuggestionIgnore}
      />
    );

    // Check quick stats
    expect(screen.getByText('Matched Keywords')).toBeInTheDocument();
    expect(screen.getByText('Grammar Issues')).toBeInTheDocument();
    expect(screen.getByText('Quantified Achievements')).toBeInTheDocument();
    expect(screen.getByText('Suggestions')).toBeInTheDocument();

    // Check specific values
    expect(screen.getByText('1')).toBeInTheDocument(); // Matched keywords
    expect(screen.getByText('2')).toBeInTheDocument(); // Grammar issues and suggestions count
  });

  it('applies custom className correctly', () => {
    const { container } = render(
      <ReportDisplay
        analysisResult={mockAnalysisResult}
        isLoading={false}
        className="custom-test-class"
        onSuggestionAdopt={mockOnSuggestionAdopt}
        onSuggestionIgnore={mockOnSuggestionIgnore}
      />
    );

    expect(container.firstChild).toHaveClass('custom-test-class');
  });
});

export default {};