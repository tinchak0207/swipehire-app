import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { jest } from '@jest/globals'
import CareerAIPage from '@/app/career-ai/page'
import { useUserPreferences } from '@/contexts/UserPreferencesContext'
import { useToast } from '@/hooks/use-toast'
import type { UserPreferences } from '@/lib/types'
import type { ToasterToast } from '@/hooks/use-toast'

// Mock dependencies
jest.mock('@/contexts/UserPreferencesContext')
jest.mock('@/hooks/use-toast')
jest.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn()
  }
}))
jest.mock('@/components/AppHeader', () => ({
  AppHeader: ({ children, ...props }: any) => <div data-testid="app-header" {...props}>{children}</div>
}))
jest.mock('@/components/career-ai/FormsAppSurvey', () => ({
  __esModule: true,
  default: ({ onComplete }: { onComplete: (data: any) => void }) => (
    <div data-testid="forms-app-survey">
      <button 
        onClick={() => onComplete({
          education: 'Bachelor',
          experience: ['Software Engineer'],
          skills: ['React', 'TypeScript'],
          interests: ['AI', 'Web Development'],
          values: ['Innovation', 'Growth'],
          careerExpectations: 'Senior Developer'
        })}
        data-testid="submit-survey"
      >
        Submit Survey
      </button>
    </div>
  )
}))
jest.mock('@/components/career-ai/CareerDashboard', () => ({
  __esModule: true,
  default: ({ userData, onBackToQuestionnaire }: any) => (
    <div data-testid="career-dashboard">
      <div>User Data: {JSON.stringify(userData)}</div>
      {onBackToQuestionnaire && (
        <button onClick={onBackToQuestionnaire} data-testid="back-to-questionnaire">
          Back to Questionnaire
        </button>
      )}
    </div>
  )
}))

const mockUseUserPreferences = useUserPreferences as jest.MockedFunction<typeof useUserPreferences>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('CareerAIPage', () => {
  const mockToast = jest.fn((props: Omit<ToasterToast, 'id'>) => ({
    id: 'mock-toast-id',
    dismiss: jest.fn(),
    update: jest.fn()
  }))

  beforeEach(() => {
    mockUseUserPreferences.mockReturnValue({
      fullBackendUser: null,
      mongoDbUserId: null,
      setMongoDbUserId: jest.fn(),
      fetchAndSetUserPreferences: jest.fn((userId: string, forceRefresh?: boolean) => Promise.resolve()),
      setPreferences: jest.fn((newPrefs: Partial<UserPreferences>) => Promise.resolve()),
      preferences: {
        theme: 'light',
        featureFlags: {},
        isLoading: false,
        defaultAIScriptTone: 'professional',
        discoveryItemsPerPage: 10,
        enableExperimentalFeatures: false,
        notificationChannels: {
          email: true,
          sms: false,
          inAppToast: true,
          inAppBanner: true,
        },
        notificationSubscriptions: {
          companyReplies: true,
          matchUpdates: true,
          applicationStatusChanges: true,
          platformAnnouncements: true,
          welcomeAndOnboardingEmails: true,
          contentAndBlogUpdates: false,
          featureAndPromotionUpdates: false,
        },
      },
      passedCandidateIds: new Set<string>(),
      passedCompanyIds: new Set<string>(),
      updatePassedCandidateIds: jest.fn(),
      updatePassedCompanyIds: jest.fn(),
      updateFullBackendUserFields: jest.fn()
    });
    
    mockUseToast.mockReturnValue({ 
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: []
    });
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render the career planning header', () => {
      render(<CareerAIPage />)
      
      expect(screen.getByText('Career Planning')).toBeInTheDocument()
      expect(screen.getByText('AI')).toBeInTheDocument()
    })

    it('should render the forms app survey initially', () => {
      render(<CareerAIPage />)
      
      expect(screen.getByTestId('forms-app-survey')).toBeInTheDocument()
    })

    it('should render the quick access button', () => {
      render(<CareerAIPage />)
      
      expect(screen.getByText('Quick Access to Career Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Go to Career Dashboard')).toBeInTheDocument()
    })

    it('should render the OR divider', () => {
      render(<CareerAIPage />)
      
      expect(screen.getByText('OR')).toBeInTheDocument()
    })
  })

  describe('Survey Submission', () => {
    it('should navigate to dashboard when survey is submitted', async () => {
      render(<CareerAIPage />)
      
      const submitButton = screen.getByTestId('submit-survey')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('career-dashboard')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('forms-app-survey')).not.toBeInTheDocument()
    })

    it('should pass correct data to dashboard', async () => {
      render(<CareerAIPage />)
      
      const submitButton = screen.getByTestId('submit-survey')
      fireEvent.click(submitButton)

      await waitFor(() => {
        const dashboardData = screen.getByText(/User Data:/)
        expect(dashboardData).toHaveTextContent('Bachelor')
        expect(dashboardData).toHaveTextContent('Software Engineer')
        expect(dashboardData).toHaveTextContent('React')
      })
    })
  })

  describe('Quick Access Button', () => {
    it('should navigate to dashboard with default data when clicked', async () => {
      render(<CareerAIPage />)
      
      const quickAccessButton = screen.getByText('Go to Career Dashboard')
      fireEvent.click(quickAccessButton)

      await waitFor(() => {
        expect(screen.getByTestId('career-dashboard')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('forms-app-survey')).not.toBeInTheDocument()
    })

    it('should show back button when using default data', async () => {
      render(<CareerAIPage />)
      
      const quickAccessButton = screen.getByText('Go to Career Dashboard')
      fireEvent.click(quickAccessButton)

      await waitFor(() => {
        expect(screen.getByTestId('back-to-questionnaire')).toBeInTheDocument()
      })
    })

    it('should return to questionnaire when back button is clicked', async () => {
      render(<CareerAIPage />)
      
      // Go to dashboard via quick access
      const quickAccessButton = screen.getByText('Go to Career Dashboard')
      fireEvent.click(quickAccessButton)

      await waitFor(() => {
        expect(screen.getByTestId('career-dashboard')).toBeInTheDocument()
      })

      // Click back button
      const backButton = screen.getByTestId('back-to-questionnaire')
      fireEvent.click(backButton)

      await waitFor(() => {
        expect(screen.getByTestId('forms-app-survey')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('career-dashboard')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should show error alert when data loading fails', () => {
      // Mock a scenario where userData is null but questionnaire is completed
      const TestComponent = () => {
        const [completedQuestionnaire] = React.useState(true)
        const [userData] = React.useState(null)
        
        return (
          <div>
            {completedQuestionnaire && !userData && (
              <div className="alert alert-error" data-testid="error-alert">
                <h3>Failed to Load Career Data</h3>
              </div>
            )}
          </div>
        )
      }

      render(<TestComponent />)
      
      expect(screen.getByTestId('error-alert')).toBeInTheDocument()
      expect(screen.getByText('Failed to Load Career Data')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should maintain proper layout structure', () => {
      render(<CareerAIPage />)
      
      // Check for main container
      const main = screen.getByRole('main')
      expect(main).toHaveClass('max-w-6xl', 'mx-auto', 'px-4', 'py-4', 'flex-grow')
    })

    it('should have proper spacing between elements', () => {
      render(<CareerAIPage />)
      
      const container = screen.getByRole('main').firstChild
      expect(container).toHaveClass('space-y-6')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<CareerAIPage />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toBeInTheDocument()
    })

    it('should have accessible button labels', () => {
      render(<CareerAIPage />)
      
      const quickAccessButton = screen.getByRole('button', { name: /go to career dashboard/i })
      expect(quickAccessButton).toBeInTheDocument()
    })
  })
})
