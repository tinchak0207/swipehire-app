'use client';

import type React from 'react';
import { useEffect } from 'react';

interface SalaryEnquiryErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary component for the salary enquiry page
 * Provides a user-friendly error interface with recovery options
 */
const SalaryEnquiryError: React.FC<SalaryEnquiryErrorProps> = ({ error, reset }) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Salary Enquiry Page Error:', error);
  }, [error]);

  const handleRetry = () => {
    reset();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReportIssue = () => {
    // In a real app, this would open a support ticket or feedback form
    const subject = encodeURIComponent('Salary Enquiry Page Error');
    const body = encodeURIComponent(
      `I encountered an error on the Salary Enquiry page:\n\nError: ${error.message}\n\nDigest: ${error.digest || 'N/A'}\n\nPlease help resolve this issue.`
    );
    window.open(`mailto:support@swipehire.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-error to-error-content">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-error-content">
            <h1 className="mb-4 font-bold text-4xl md:text-5xl">Oops! Something went wrong</h1>
            <p className="mx-auto max-w-2xl text-lg opacity-90 md:text-xl">
              We encountered an error while loading the salary enquiry page.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Error Details Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="mb-6 flex items-center gap-4">
                <div className="text-4xl text-error">⚠️</div>
                <div>
                  <h2 className="card-title text-2xl text-error">Error Details</h2>
                  <p className="text-base-content/70">
                    The following error occurred while processing your request:
                  </p>
                </div>
              </div>

              {/* Error Message */}
              <div className="alert alert-error mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold">Error Message</h3>
                  <div className="font-mono text-xs">{error.message}</div>
                  {error.digest && (
                    <div className="mt-1 font-mono text-xs opacity-70">
                      Error ID: {error.digest}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="card-actions justify-center gap-4">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRetry}
                  aria-label="Try to reload the page"
                >
                  🔄 Try Again
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleGoHome}
                  aria-label="Go back to home page"
                >
                  🏠 Go Home
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleReportIssue}
                  aria-label="Report this issue to support"
                >
                  📧 Report Issue
                </button>
              </div>
            </div>
          </div>

          {/* Troubleshooting Tips */}
          <div className="card mt-8 bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-4">Troubleshooting Tips</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-info text-xl">💡</div>
                  <div>
                    <h4 className="font-semibold">Check your connection</h4>
                    <p className="text-base-content/70 text-sm">
                      Make sure you have a stable internet connection and try refreshing the page.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-info text-xl">🔄</div>
                  <div>
                    <h4 className="font-semibold">Clear browser cache</h4>
                    <p className="text-base-content/70 text-sm">
                      Try clearing your browser cache and cookies, then reload the page.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-info text-xl">🕐</div>
                  <div>
                    <h4 className="font-semibold">Try again later</h4>
                    <p className="text-base-content/70 text-sm">
                      If the issue persists, our servers might be experiencing high load. Please try
                      again in a few minutes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-info text-xl">📞</div>
                  <div>
                    <h4 className="font-semibold">Contact support</h4>
                    <p className="text-base-content/70 text-sm">
                      If none of the above solutions work, please contact our support team with the
                      error details above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Actions */}
          <div className="card mt-8 bg-gradient-to-br from-base-100 to-base-200 shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-4">What you can do instead</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-base-200 p-4 text-center">
                  <div className="mb-2 text-3xl">🔍</div>
                  <h4 className="mb-2 font-semibold">Browse Jobs</h4>
                  <p className="mb-3 text-base-content/70 text-sm">
                    Explore available job opportunities while we fix this issue.
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => (window.location.href = '/jobs')}
                  >
                    View Jobs
                  </button>
                </div>
                <div className="rounded-lg bg-base-200 p-4 text-center">
                  <div className="mb-2 text-3xl">📊</div>
                  <h4 className="mb-2 font-semibold">Career Dashboard</h4>
                  <p className="mb-3 text-base-content/70 text-sm">
                    Check your career progress and recommendations.
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => (window.location.href = '/career-dashboard-demo')}
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryEnquiryError;
