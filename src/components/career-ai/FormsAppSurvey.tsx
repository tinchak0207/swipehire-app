'use client';

import { useEffect, useRef, useState } from 'react';

interface FormsAppSurveyProps {
  onCompleteAction: (data: any) => void;
}

declare global {
  interface Window {
    formsapp: any;
  }
}

export default function FormsAppSurvey({ onCompleteAction }: FormsAppSurveyProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [surveyStarted, setSurveyStarted] = useState(false);
  const scriptLoadedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize forms.app listener for survey completion
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from forms.app
      if (event.origin === 'https://17scaqk8.forms.app') {
        console.log('Forms.app message received:', event.data);

        // Track survey interaction
        if (
          event.data &&
          (event.data.type === 'form_started' ||
            event.data.type === 'form_loaded' ||
            event.data.event === 'start' ||
            event.data.event === 'loaded')
        ) {
          console.log('Survey started/loaded');
          setSurveyStarted(true);
          return;
        }

        // Only process actual form submission events after survey has started
        if (
          surveyStarted &&
          event.data &&
          (event.data.type === 'form_submit' ||
            event.data.type === 'form_completed' ||
            event.data.type === 'form_submission' ||
            event.data.type === 'submission' ||
            event.data.event === 'submit' ||
            event.data.event === 'complete' ||
            event.data.event === 'form_completed' ||
            // Check for actual form data with meaningful content
            (event.data.data &&
              typeof event.data.data === 'object' &&
              Object.keys(event.data.data).length > 0 &&
              !event.data.type?.includes('load') &&
              !event.data.type?.includes('init')))
        ) {
          console.log('Form submission detected:', event.data);

          try {
            // Extract relevant data from survey response
            const rawData =
              event.data.data ||
              event.data.answers ||
              event.data.responses ||
              event.data.submission ||
              event.data;

            // Only proceed if we have actual meaningful form data
            if (rawData && typeof rawData === 'object' && Object.keys(rawData).length > 0) {
              // Check if this looks like actual survey responses (not just metadata)
              const hasRealData = Object.values(rawData).some(
                (value) => value && typeof value === 'string' && value.length > 2
              );

              if (hasRealData) {
                // Format data to match expected structure
                const formattedData = {
                  education:
                    rawData.education ||
                    rawData.Education ||
                    rawData['What is your education level?'] ||
                    'Not specified',
                  experience: (
                    rawData.experience ||
                    rawData.Experience ||
                    rawData['What is your work experience?'] ||
                    'General experience'
                  )
                    .toString()
                    .split(',')
                    .map((s: string) => s.trim()),
                  skills: (
                    rawData.skills ||
                    rawData.Skills ||
                    rawData['What are your key skills?'] ||
                    'Communication, Problem solving'
                  )
                    .toString()
                    .split(',')
                    .map((s: string) => s.trim()),
                  interests: (
                    rawData.interests ||
                    rawData.Interests ||
                    rawData['What are your interests?'] ||
                    'Career development'
                  )
                    .toString()
                    .split(',')
                    .map((s: string) => s.trim()),
                  values: (
                    rawData.values ||
                    rawData.Values ||
                    rawData['What do you value in work?'] ||
                    'Growth, Learning'
                  )
                    .toString()
                    .split(',')
                    .map((s: string) => s.trim()),
                  careerExpectations:
                    rawData.careerExpectations ||
                    rawData['Career Expectations'] ||
                    rawData.expectations ||
                    rawData['What are your career goals?'] ||
                    'Seeking career advancement opportunities',
                };

                console.log('Formatted survey data:', formattedData);
                onCompleteAction(formattedData);
              } else {
                console.log('Form data appears to be metadata, not actual responses');
              }
            } else {
              console.log('No valid form data found in message');
            }
          } catch (error) {
            console.error('Error processing forms.app data:', error);
          }
        } else if (!surveyStarted) {
          console.log(
            'Survey not started yet, ignoring message:',
            event.data.type || 'unknown type'
          );
        } else {
          console.log(
            'Non-submission message from forms.app (ignored):',
            event.data.type || 'unknown type'
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onCompleteAction, surveyStarted]);

  useEffect(() => {
    // Prevent multiple script loads
    if (scriptLoadedRef.current) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://forms.app/cdn/embed.js"]');
    if (existingScript) {
      // Script exists, initialize the form
      initializeForm();
      return;
    }

    // Create and load the forms.app script exactly as provided
    const script = document.createElement('script');
    script.src = 'https://forms.app/cdn/embed.js';
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;

    // Use the exact onload function as provided by forms.app
    script.onload = () => {
      console.log('Forms.app script loaded successfully');
      initializeForm();
    };

    script.onerror = () => {
      console.error('Failed to load forms.app script');
      setIsLoading(false);
      setHasError(true);
    };

    document.head.appendChild(script);
    scriptLoadedRef.current = true;

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [initializeForm]);

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
              width: '100vw',
              height: '600px',
            },
            'https://17scaqk8.forms.app'
          );
          setIsLoading(false);

          // Fallback: If we don't receive a start event within 3 seconds, assume survey is ready
          setTimeout(() => {
            if (!surveyStarted) {
              console.log('Fallback: Setting survey as started after timeout');
              setSurveyStarted(true);
            }
          }, 3000);
        } else {
          console.error('Forms.app function not available');
          setHasError(true);
          setIsLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error('Error initializing forms.app:', error);
      setHasError(true);
      setIsLoading(false);
    }
  };

  if (hasError) {
    return (
      <div className="card border border-red-200 bg-white shadow-xl">
        <div className="card-body p-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 font-semibold text-gray-800 text-xl">Survey Unavailable</h3>
          <p className="mb-4 text-gray-600">
            We're having trouble loading the career assessment survey. Please try refreshing the
            page.
          </p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLoading && (
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
      )}

      {/* Survey loaded indicator */}
      {!isLoading && !surveyStarted && (
        <div className="card mb-4 border border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="card-body p-6 text-center">
            <div className="mb-3 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="mb-2 font-semibold text-gray-800 text-lg">Career Assessment Ready</h3>
            <p className="text-gray-600 text-sm">
              Your personalized career questionnaire is loaded and ready. Please complete the survey
              below to get your career recommendations.
            </p>
          </div>
        </div>
      )}

      {/* Survey in progress indicator */}
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

      {/* Use the exact div structure provided by forms.app */}
      <div
        ref={containerRef}
        data-testid="formsapp-container"
        {...({ formsappid: '685190dedd9ab40002e7de9a' } as any)}
        className={`w-full transition-opacity duration-500 ${isLoading ? 'h-0 overflow-hidden opacity-0' : 'opacity-100'}`}
        style={{ minHeight: isLoading ? '0' : '600px' }}
      />
    </div>
  );
}
