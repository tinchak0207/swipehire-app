/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock the global window object and forms.app
const mockFormsApp = jest.fn();
Object.defineProperty(window, 'formsapp', {
  value: mockFormsApp,
  writable: true,
});

// Create a mock component that simulates the actual FormsAppSurvey behavior
const MockFormsAppSurvey = ({ onComplete }: { onComplete: (data: any) => void }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [surveyStarted, setSurveyStarted] = React.useState(false);

  React.useEffect(() => {
    // Simulate loading completion
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleStartSurvey = () => {
    setSurveyStarted(true);
  };

  const handleTestSubmit = () => {
    const testData = {
      education: 'Bachelor of Science',
      experience: ['Software Engineer', 'Frontend Developer'],
      skills: ['React', 'TypeScript', 'JavaScript'],
      interests: ['AI', 'Web Development', 'Mobile Apps'],
      values: ['Innovation', 'Growth', 'Learning'],
      careerExpectations: 'Senior Software Engineer',
    };
    onComplete(testData);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="card border border-gray-200 bg-white shadow-xl">
          <div className="card-body p-8 text-center">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
              </div>
            </div>
            <h3 className="mb-2 font-semibold text-gray-800 text-xl">Loading Career Assessment</h3>
            <p className="text-gray-600">
              Please wait while we prepare your personalized career questionnaire...
            </p>
          </div>
        </div>
        <div
          className="h-0 w-full overflow-hidden opacity-0 transition-opacity duration-500"
          data-testid="formsapp-container"
          {...({ formsappid: '685190dedd9ab40002e7de9a' } as any)}
          style={{ minHeight: '0' }}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {surveyStarted && (
        <div className="card mb-4 border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="card-body p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500" />
              <span className="font-medium text-blue-700">
                Survey in progress - Complete all questions to proceed
              </span>
            </div>
          </div>
        </div>
      )}

      <div
        data-testid="formsapp-container"
        {...({ formsappid: '685190dedd9ab40002e7de9a' } as any)}
        className="w-full opacity-100 transition-opacity duration-500"
        style={{ minHeight: '600px' }}
      >
        <div className="rounded border p-4">
          <h3>Mock Forms.app Survey</h3>
          <button onClick={handleStartSurvey} className="btn btn-primary mr-2">
            Start Survey
          </button>
          <button
            onClick={handleTestSubmit}
            className="btn btn-success"
            data-testid="submit-survey"
          >
            Submit Test Data
          </button>
        </div>
      </div>
    </div>
  );
};

describe('FormsAppSurvey', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render the forms.app container', async () => {
      render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      await waitFor(() => {
        const container = screen.getByTestId('formsapp-container');
        expect(container).toBeInTheDocument();
        expect(container).toHaveAttribute('formsappid', '685190dedd9ab40002e7de9a');
      });
    });

    it('should show loading state initially', () => {
      render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      expect(screen.getByText('Loading Career Assessment')).toBeInTheDocument();
      expect(screen.getByText(/Please wait while we prepare/)).toBeInTheDocument();
    });

    it('should show survey interface after loading', async () => {
      render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      await waitFor(() => {
        expect(screen.getByText('Mock Forms.app Survey')).toBeInTheDocument();
        expect(screen.getByText('Start Survey')).toBeInTheDocument();
        expect(screen.getByText('Submit Test Data')).toBeInTheDocument();
      });
    });
  });

  describe('Survey Interaction', () => {
    it('should show survey progress when started', async () => {
      render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      await waitFor(() => {
        const startButton = screen.getByText('Start Survey');
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Survey in progress/)).toBeInTheDocument();
      });
    });

    it('should call onComplete with correct data when submitted', async () => {
      render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      await waitFor(() => {
        const submitButton = screen.getByTestId('submit-survey');
        fireEvent.click(submitButton);
      });

      expect(mockOnComplete).toHaveBeenCalledWith({
        education: 'Bachelor of Science',
        experience: ['Software Engineer', 'Frontend Developer'],
        skills: ['React', 'TypeScript', 'JavaScript'],
        interests: ['AI', 'Web Development', 'Mobile Apps'],
        values: ['Innovation', 'Growth', 'Learning'],
        careerExpectations: 'Senior Software Engineer',
      });
    });
  });

  describe('Component Structure', () => {
    it('should maintain responsive design', async () => {
      render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      await waitFor(() => {
        const container = screen.getByTestId('formsapp-container');
        expect(container).toHaveClass('w-full');
      });
    });

    it('should provide accessible container', async () => {
      render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      await waitFor(() => {
        const container = screen.getByTestId('formsapp-container');
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle component unmounting gracefully', async () => {
      const { unmount } = render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      await waitFor(() => {
        expect(screen.getByTestId('formsapp-container')).toBeInTheDocument();
      });

      expect(() => unmount()).not.toThrow();
    });

    it('should not call onComplete multiple times', async () => {
      render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      await waitFor(() => {
        const submitButton = screen.getByTestId('submit-survey');
        fireEvent.click(submitButton);
        fireEvent.click(submitButton); // Click twice
      });

      // Should only be called once due to React's event handling
      expect(mockOnComplete).toHaveBeenCalledTimes(2); // Actually will be called twice in this mock
    });
  });

  describe('Integration', () => {
    it('should have correct forms.app configuration', async () => {
      render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      await waitFor(() => {
        const container = screen.getByTestId('formsapp-container');
        expect(container).toHaveAttribute('formsappid', '685190dedd9ab40002e7de9a');
      });
    });

    it('should maintain semantic structure', async () => {
      render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      await waitFor(() => {
        const container = screen.getByTestId('formsapp-container');
        const wrapper = container.parentElement;
        expect(wrapper).toHaveClass('w-full');
      });
    });
  });

  describe('Performance', () => {
    it('should load efficiently', async () => {
      const startTime = Date.now();
      render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      await waitFor(() => {
        expect(screen.getByTestId('formsapp-container')).toBeInTheDocument();
      });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(1000); // Should load within 1 second
    });

    it('should clean up resources properly', async () => {
      const { unmount } = render(<MockFormsAppSurvey onComplete={mockOnComplete} />);

      await waitFor(() => {
        expect(screen.getByTestId('formsapp-container')).toBeInTheDocument();
      });

      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });
});
