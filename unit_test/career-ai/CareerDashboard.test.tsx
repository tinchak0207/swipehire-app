import { jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CareerDashboard from '@/components/career-ai/CareerDashboard';
import { getCareerRecommendations } from '@/services/careerService';

// Mock dependencies
jest.mock('@/services/careerService');

const mockGetCareerRecommendations = getCareerRecommendations as jest.MockedFunction<
  typeof getCareerRecommendations
>;

const mockUserData = {
  education: 'Bachelor of Computer Science',
  experience: ['Software Engineer at Tech Corp', 'Frontend Developer at StartupXYZ'],
  skills: ['React', 'TypeScript', 'Node.js', 'Python'],
  interests: ['AI/ML', 'Web Development', 'Mobile Apps'],
  values: ['Innovation', 'Work-life balance', 'Continuous learning'],
  careerExpectations: 'Senior Software Engineer',
};

const mockCareerRecommendations = {
  careerStage: 'early',
  careerPaths: [
    {
      title: 'Senior Frontend Developer',
      description: 'Lead frontend development projects and mentor junior developers',
      requiredSkills: ['React', 'TypeScript', 'Leadership'],
      growthPotential: 8,
      salaryRange: '$80,000 - $120,000',
      educationRequirements: ['Bachelor in Computer Science'],
    },
    {
      title: 'Full Stack Developer',
      description: 'Work on both frontend and backend development',
      requiredSkills: ['React', 'Node.js', 'Database Design'],
      growthPotential: 9,
      salaryRange: '$90,000 - $140,000',
      educationRequirements: ['Bachelor in Computer Science'],
    },
  ],
};

describe('CareerDashboard', () => {
  beforeEach(() => {
    mockGetCareerRecommendations.mockResolvedValue(mockCareerRecommendations);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should show loading state initially', () => {
      render(<CareerDashboard userData={mockUserData} />);

      expect(screen.getByText('Loading Career Insights')).toBeInTheDocument();
      expect(screen.getByText('Analyzing your career data with AI...')).toBeInTheDocument();
    });

    it('should render career stage after loading', async () => {
      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        expect(screen.getByText('Career Stage: Early Career')).toBeInTheDocument();
      });
    });

    it('should render navigation tabs', async () => {
      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        expect(screen.getByText('Career Paths')).toBeInTheDocument();
        expect(screen.getByText('Goals')).toBeInTheDocument();
        expect(screen.getByText('Progress')).toBeInTheDocument();
      });
    });
  });

  describe('Career Paths Tab', () => {
    it('should display career path recommendations', async () => {
      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument();
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
      });
    });

    it('should show career path details', async () => {
      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        expect(
          screen.getByText('Lead frontend development projects and mentor junior developers')
        ).toBeInTheDocument();
        expect(screen.getByText('$80,000 - $120,000')).toBeInTheDocument();
        expect(screen.getByText('8/10')).toBeInTheDocument();
      });
    });

    it('should display required skills as badges', async () => {
      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        const reactElements = screen.getAllByText('React');
        expect(reactElements.length).toBeGreaterThan(0);
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Leadership')).toBeInTheDocument();
      });
    });
  });

  describe('Goals Tab', () => {
    it('should switch to goals tab when clicked', async () => {
      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        const goalsTab = screen.getByText('Goals');
        fireEvent.click(goalsTab);
      });

      expect(screen.getByText('Add New Goals')).toBeInTheDocument();
      expect(screen.getByText('Short Term (3-6 months)')).toBeInTheDocument();
      expect(screen.getByText('Mid Term (6-12 months)')).toBeInTheDocument();
      expect(screen.getByText('Long Term (1+ years)')).toBeInTheDocument();
    });

    it('should add a new goal when button is clicked', async () => {
      // Mock window.prompt
      const mockPrompt = jest.spyOn(window, 'prompt').mockReturnValue('Learn React Native');

      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        const goalsTab = screen.getByText('Goals');
        fireEvent.click(goalsTab);
      });

      const shortTermButton = screen.getByText('Short Term (3-6 months)');
      fireEvent.click(shortTermButton);

      await waitFor(() => {
        expect(screen.getByText('Learn React Native')).toBeInTheDocument();
      });

      mockPrompt.mockRestore();
    });

    it('should toggle goal completion', async () => {
      const mockPrompt = jest.spyOn(window, 'prompt').mockReturnValue('Complete TypeScript course');

      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        const goalsTab = screen.getByText('Goals');
        fireEvent.click(goalsTab);
      });

      const shortTermButton = screen.getByText('Short Term (3-6 months)');
      fireEvent.click(shortTermButton);

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();
      });

      mockPrompt.mockRestore();
    });

    it('should remove a goal when delete button is clicked', async () => {
      const mockPrompt = jest.spyOn(window, 'prompt').mockReturnValue('Goal to be deleted');

      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        const goalsTab = screen.getByText('Goals');
        fireEvent.click(goalsTab);
      });

      const shortTermButton = screen.getByText('Short Term (3-6 months)');
      fireEvent.click(shortTermButton);

      await waitFor(() => {
        // Look for the delete button by its SVG content or class
        const deleteButtons = screen.getAllByRole('button');
        const deleteButton = deleteButtons.find(
          (button) => button.classList.contains('btn-ghost') || button.querySelector('svg')
        );
        if (deleteButton) {
          fireEvent.click(deleteButton);
        }
      });

      await waitFor(() => {
        expect(screen.queryByText('Goal to be deleted')).not.toBeInTheDocument();
      });

      mockPrompt.mockRestore();
    });
  });

  describe('Progress Tab', () => {
    it('should switch to progress tab when clicked', async () => {
      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        const progressTab = screen.getByText('Progress');
        fireEvent.click(progressTab);
      });

      expect(screen.getByText('Goals Progress')).toBeInTheDocument();
      expect(screen.getByText('Skills to Develop')).toBeInTheDocument();
      expect(screen.getByText('Career Development Journey')).toBeInTheDocument();
    });

    it('should display career stage progress', async () => {
      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        const progressTab = screen.getByText('Progress');
        fireEvent.click(progressTab);
      });

      // Check that the progress tab content is displayed
      expect(screen.getByText('Goals Progress')).toBeInTheDocument();
      expect(screen.getByText('Skills to Develop')).toBeInTheDocument();
      expect(screen.getByText('Career Development Journey')).toBeInTheDocument();
    });

    it('should show skills to develop', async () => {
      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        const progressTab = screen.getByText('Progress');
        fireEvent.click(progressTab);
      });

      const leadershipElements = screen.getAllByText('Leadership');
      expect(leadershipElements.length).toBeGreaterThan(0);
      const databaseDesignElements = screen.getAllByText('Database Design');
      expect(databaseDesignElements.length).toBeGreaterThan(0);
    });
  });

  describe('Back to Questionnaire', () => {
    it('should show back button when onBackToQuestionnaire is provided', async () => {
      const mockBackFunction = jest.fn();

      render(<CareerDashboard userData={mockUserData} onBackToQuestionnaire={mockBackFunction} />);

      await waitFor(() => {
        expect(screen.getByText('Back to Assessment')).toBeInTheDocument();
        expect(screen.getByText('Using Default Profile Data')).toBeInTheDocument();
      });
    });

    it('should call onBackToQuestionnaire when back button is clicked', async () => {
      const mockBackFunction = jest.fn();

      render(<CareerDashboard userData={mockUserData} onBackToQuestionnaire={mockBackFunction} />);

      await waitFor(() => {
        const backButton = screen.getByText('Back to Assessment');
        fireEvent.click(backButton);
      });

      expect(mockBackFunction).toHaveBeenCalledTimes(1);
    });

    it('should not show back button when onBackToQuestionnaire is not provided', async () => {
      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        expect(screen.queryByText('Back to Assessment')).not.toBeInTheDocument();
        expect(screen.queryByText('Using Default Profile Data')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API call fails', async () => {
      mockGetCareerRecommendations.mockRejectedValue(new Error('API Error'));

      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Career Data')).toBeInTheDocument();
        expect(
          screen.getByText('Failed to load career recommendations. Please try again.')
        ).toBeInTheDocument();
      });
    });

    it('should handle empty career paths gracefully', async () => {
      mockGetCareerRecommendations.mockResolvedValue({
        careerStage: 'early',
        careerPaths: [],
      });

      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        expect(screen.getByText('No Career Paths Available')).toBeInTheDocument();
        expect(
          screen.getByText('Complete your profile to get personalized career recommendations.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button elements', async () => {
      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        const careerPathsButton = screen.getByText('Career Paths').closest('button');
        expect(careerPathsButton).toBeInTheDocument();
        expect(careerPathsButton?.tagName).toBe('BUTTON');
      });
    });

    it('should support keyboard navigation', async () => {
      render(<CareerDashboard userData={mockUserData} />);

      await waitFor(() => {
        const goalsButton = screen.getByText('Goals').closest('button');
        expect(goalsButton).toBeInTheDocument();
        if (goalsButton) {
          goalsButton.focus();
          expect(goalsButton).toHaveFocus();
        }
      });
    });
  });
});
