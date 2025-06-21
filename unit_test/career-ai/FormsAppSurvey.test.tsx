import { render, screen, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import FormsAppSurvey from '@/components/career-ai/FormsAppSurvey'

// Mock window.addEventListener and forms.app script loading
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true
})

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true
})

// Mock document.createElement and appendChild
const mockScript = {
  src: '',
  type: '',
  async: false,
  defer: false,
  onload: null as (() => void) | null
}

const mockCreateElement = jest.fn().mockReturnValue(mockScript)
const mockAppendChild = jest.fn()
const mockRemoveChild = jest.fn()

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true
})

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true
})

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true
})

// Mock forms.app constructor
const mockFormsApp = jest.fn()
Object.defineProperty(window, 'formsapp', {
  value: mockFormsApp,
  writable: true
})

describe('FormsAppSurvey', () => {
  const mockOnComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Initialization', () => {
    it('should render the forms.app container', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      const container = screen.getByRole('generic')
      expect(container).toHaveAttribute('formsappId', '685190dedd9ab40002e7de9a')
    })

    it('should set up message event listener on mount', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })

    it('should load forms.app script on mount', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      expect(mockCreateElement).toHaveBeenCalledWith('script')
      expect(mockScript.src).toBe('https://forms.app/cdn/embed.js')
      expect(mockScript.type).toBe('text/javascript')
      expect(mockScript.async).toBe(true)
      expect(mockScript.defer).toBe(true)
      expect(mockAppendChild).toHaveBeenCalledWith(mockScript)
    })

    it('should initialize forms.app when script loads', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      // Simulate script load
      if (mockScript.onload) {
        mockScript.onload()
      }
      
      expect(mockFormsApp).toHaveBeenCalledWith(
        '685190dedd9ab40002e7de9a',
        'standard',
        {
          width: '100vw',
          height: '600px'
        },
        'https://17scaqk8.forms.app'
      )
    })
  })

  describe('Message Handling', () => {
    it('should process forms.app message and call onComplete', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      // Get the message handler
      const messageHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1]
      
      expect(messageHandler).toBeDefined()
      
      // Simulate forms.app message
      const mockEvent = {
        data: {
          type: 'formsapp',
          data: {
            education: 'Bachelor of Science',
            experience: 'Software Engineer,Frontend Developer',
            skills: 'React,TypeScript,JavaScript',
            interests: 'AI,Web Development,Mobile Apps',
            values: 'Innovation,Growth,Learning',
            careerExpectations: 'Senior Software Engineer'
          }
        }
      }
      
      messageHandler(mockEvent)
      
      expect(mockOnComplete).toHaveBeenCalledWith({
        education: 'Bachelor of Science',
        experience: ['Software Engineer', 'Frontend Developer'],
        skills: ['React', 'TypeScript', 'JavaScript'],
        interests: ['AI', 'Web Development', 'Mobile Apps'],
        values: ['Innovation', 'Growth', 'Learning'],
        careerExpectations: 'Senior Software Engineer'
      })
    })

    it('should handle empty or undefined comma-separated values', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      const messageHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1]
      
      const mockEvent = {
        data: {
          type: 'formsapp',
          data: {
            education: 'Master of Science',
            experience: undefined,
            skills: '',
            interests: 'AI',
            values: null,
            careerExpectations: 'Tech Lead'
          }
        }
      }
      
      messageHandler(mockEvent)
      
      expect(mockOnComplete).toHaveBeenCalledWith({
        education: 'Master of Science',
        experience: [],
        skills: [],
        interests: ['AI'],
        values: [],
        careerExpectations: 'Tech Lead'
      })
    })

    it('should ignore non-formsapp messages', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      const messageHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1]
      
      const mockEvent = {
        data: {
          type: 'other',
          data: { some: 'data' }
        }
      }
      
      messageHandler(mockEvent)
      
      expect(mockOnComplete).not.toHaveBeenCalled()
    })
  })

  describe('Component Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const { unmount } = render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      unmount()
      
      expect(mockRemoveEventListener).toHaveBeenCalled()
    })

    it('should remove script from DOM on unmount', () => {
      const { unmount } = render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      unmount()
      
      expect(mockRemoveChild).toHaveBeenCalledWith(mockScript)
    })
  })

  describe('Error Handling', () => {
    it('should handle script loading errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      // Simulate script error
      const scriptElement = mockCreateElement.mock.results[0].value
      if (scriptElement.onerror) {
        scriptElement.onerror(new Error('Script load failed'))
      }
      
      // Should not throw or crash
      expect(consoleSpy).not.toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should handle malformed message data', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      const messageHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1]
      
      const mockEvent = {
        data: {
          type: 'formsapp',
          data: null
        }
      }
      
      expect(() => messageHandler(mockEvent)).not.toThrow()
      expect(mockOnComplete).not.toHaveBeenCalled()
    })
  })

  describe('Integration', () => {
    it('should have correct forms.app configuration', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      // Simulate script load
      if (mockScript.onload) {
        mockScript.onload()
      }
      
      expect(mockFormsApp).toHaveBeenCalledWith(
        '685190dedd9ab40002e7de9a', // Form ID
        'standard', // Display mode
        {
          width: '100vw',
          height: '600px'
        }, // Dimensions
        'https://17scaqk8.forms.app' // Base URL
      )
    })

    it('should maintain responsive design', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      const container = screen.getByRole('generic')
      expect(container).toHaveClass('w-full')
    })
  })

  describe('Accessibility', () => {
    it('should provide accessible container', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      const container = screen.getByRole('generic')
      expect(container).toBeInTheDocument()
    })

    it('should maintain semantic structure', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      const wrapper = screen.getByRole('generic').parentElement
      expect(wrapper).toHaveClass('w-full')
    })
  })

  describe('Performance', () => {
    it('should load script asynchronously', () => {
      render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      expect(mockScript.async).toBe(true)
      expect(mockScript.defer).toBe(true)
    })

    it('should clean up resources properly', () => {
      const { unmount } = render(<FormsAppSurvey onComplete={mockOnComplete} />)
      
      unmount()
      
      expect(mockRemoveEventListener).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
    })
  })
})