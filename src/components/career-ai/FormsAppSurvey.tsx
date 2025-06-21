'use client'

import React, { useEffect, useState, useRef } from 'react'

interface FormsAppSurveyProps {
  onComplete: (data: any) => void
}

declare global {
  interface Window {
    formsapp: any
  }
}

export default function FormsAppSurvey({ onComplete }: FormsAppSurveyProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [surveyStarted, setSurveyStarted] = useState(false)
  const scriptLoadedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize forms.app listener for survey completion
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from forms.app
      if (event.origin === 'https://17scaqk8.forms.app') {
        console.log('Forms.app message received:', event.data)
        
        // Track survey interaction
        if (event.data && (
          event.data.type === 'form_started' || 
          event.data.type === 'form_loaded' ||
          event.data.event === 'start' ||
          event.data.event === 'loaded'
        )) {
          console.log('Survey started/loaded')
          setSurveyStarted(true)
          return
        }
        
        // Only process actual form submission events after survey has started
        if (surveyStarted && event.data && (
          event.data.type === 'form_submit' || 
          event.data.type === 'form_completed' ||
          event.data.type === 'form_submission' ||
          event.data.type === 'submission' ||
          event.data.event === 'submit' || 
          event.data.event === 'complete' ||
          event.data.event === 'form_completed' ||
          // Check for actual form data with meaningful content
          (event.data.data && typeof event.data.data === 'object' && 
           Object.keys(event.data.data).length > 0 && 
           !event.data.type?.includes('load') && 
           !event.data.type?.includes('init'))
        )) {
          console.log('Form submission detected:', event.data)
          
          try {
            // Extract relevant data from survey response
            const rawData = event.data.data || event.data.answers || event.data.responses || event.data.submission || event.data
            
            // Only proceed if we have actual meaningful form data
            if (rawData && typeof rawData === 'object' && Object.keys(rawData).length > 0) {
              // Check if this looks like actual survey responses (not just metadata)
              const hasRealData = Object.values(rawData).some(value => 
                value && typeof value === 'string' && value.length > 2
              )
              
              if (hasRealData) {
                // Format data to match expected structure
                const formattedData = {
                  education: rawData.education || rawData.Education || rawData['What is your education level?'] || 'Not specified',
                  experience: (rawData.experience || rawData.Experience || rawData['What is your work experience?'] || 'General experience').toString().split(',').map((s: string) => s.trim()),
                  skills: (rawData.skills || rawData.Skills || rawData['What are your key skills?'] || 'Communication, Problem solving').toString().split(',').map((s: string) => s.trim()),
                  interests: (rawData.interests || rawData.Interests || rawData['What are your interests?'] || 'Career development').toString().split(',').map((s: string) => s.trim()),
                  values: (rawData.values || rawData.Values || rawData['What do you value in work?'] || 'Growth, Learning').toString().split(',').map((s: string) => s.trim()),
                  careerExpectations: rawData.careerExpectations || rawData['Career Expectations'] || rawData.expectations || rawData['What are your career goals?'] || 'Seeking career advancement opportunities'
                }
                
                console.log('Formatted survey data:', formattedData)
                onComplete(formattedData)
              } else {
                console.log('Form data appears to be metadata, not actual responses')
              }
            } else {
              console.log('No valid form data found in message')
            }
          } catch (error) {
            console.error('Error processing forms.app data:', error)
          }
        } else if (!surveyStarted) {
          console.log('Survey not started yet, ignoring message:', event.data.type || 'unknown type')
        } else {
          console.log('Non-submission message from forms.app (ignored):', event.data.type || 'unknown type')
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [onComplete, surveyStarted])

  useEffect(() => {
    // Prevent multiple script loads
    if (scriptLoadedRef.current) return

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://forms.app/cdn/embed.js"]')
    if (existingScript) {
      // Script exists, initialize the form
      initializeForm()
      return
    }

    // Create and load the forms.app script exactly as provided
    const script = document.createElement('script')
    script.src = 'https://forms.app/cdn/embed.js'
    script.type = 'text/javascript'
    script.async = true
    script.defer = true
    
    // Use the exact onload function as provided by forms.app
    script.onload = () => {
      console.log('Forms.app script loaded successfully')
      initializeForm()
    }
    
    script.onerror = () => {
      console.error('Failed to load forms.app script')
      setIsLoading(false)
      setHasError(true)
    }
    
    document.head.appendChild(script)
    scriptLoadedRef.current = true

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const initializeForm = () => {
    try {
      // Wait a bit for the script to fully initialize
      setTimeout(() => {
        if (typeof window.formsapp === 'function') {
          // Initialize exactly as provided by forms.app
          new window.formsapp(
            '685190dedd9ab40002e7de9a',
            'standard',
            {
              'width': '100vw',
              'height': '600px'
            },
            'https://17scaqk8.forms.app'
          )
          setIsLoading(false)
          
          // Fallback: If we don't receive a start event within 3 seconds, assume survey is ready
          setTimeout(() => {
            if (!surveyStarted) {
              console.log('Fallback: Setting survey as started after timeout')
              setSurveyStarted(true)
            }
          }, 3000)
        } else {
          console.error('Forms.app function not available')
          setHasError(true)
          setIsLoading(false)
        }
      }, 100)
    } catch (error) {
      console.error('Error initializing forms.app:', error)
      setHasError(true)
      setIsLoading(false)
    }
  }

  if (hasError) {
    return (
      <div className="card bg-white shadow-xl border border-red-200">
        <div className="card-body text-center p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Survey Unavailable</h3>
          <p className="text-gray-600 mb-4">
            We're having trouble loading the career assessment survey. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {isLoading && (
        <div className="card bg-white shadow-xl border border-gray-200">
          <div className="card-body text-center p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Career Assessment</h3>
            <p className="text-gray-600">
              Please wait while we prepare your personalized career questionnaire...
            </p>
          </div>
        </div>
      )}
      
      {/* Survey loaded indicator */}
      {!isLoading && !surveyStarted && (
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 mb-4">
          <div className="card-body text-center p-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Career Assessment Ready</h3>
            <p className="text-gray-600 text-sm">
              Your personalized career questionnaire is loaded and ready. Please complete the survey below to get your career recommendations.
            </p>
          </div>
        </div>
      )}
      
      {/* Survey in progress indicator */}
      {surveyStarted && (
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 mb-4">
          <div className="card-body text-center p-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-700 font-medium">Survey in progress - Complete all questions to proceed</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Use the exact div structure provided by forms.app */}
      <div 
        ref={containerRef}
        {...({ formsappid: "685190dedd9ab40002e7de9a" } as any)}
        className={`w-full transition-opacity duration-500 ${isLoading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}
        style={{ minHeight: isLoading ? '0' : '600px' }}
      />
    </div>
  )
}
