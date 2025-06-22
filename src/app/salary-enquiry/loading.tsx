import type React from 'react';

/**
 * Loading component for the salary enquiry page
 * Provides a skeleton UI while the page is loading
 */
const SalaryEnquiryLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-200">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-96 animate-pulse rounded-lg bg-primary-content/20" />
            <div className="mx-auto h-6 w-full max-w-2xl animate-pulse rounded-lg bg-primary-content/20" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Form Skeleton */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="mb-6 h-8 w-64 animate-pulse rounded-lg bg-base-300" />

              <div className="space-y-6">
                {/* Form fields skeleton */}
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="form-control">
                    <div className="mb-2 h-4 w-24 animate-pulse rounded bg-base-300" />
                    <div className="h-12 w-full animate-pulse rounded-lg bg-base-300" />
                  </div>
                ))}

                {/* Form actions skeleton */}
                <div className="card-actions justify-end gap-4 pt-4">
                  <div className="h-10 w-20 animate-pulse rounded-lg bg-base-300" />
                  <div className="h-10 w-32 animate-pulse rounded-lg bg-primary/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Getting Started Section Skeleton */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="mb-4 h-8 w-48 animate-pulse rounded-lg bg-base-300" />
              <div className="grid gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-full bg-base-300" />
                    <div className="mx-auto mb-2 h-6 w-24 animate-pulse rounded bg-base-300" />
                    <div className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-base-300" />
                      <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-base-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features Section Skeleton */}
          <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-lg">
            <div className="card-body">
              <div className="mb-6 h-8 w-64 animate-pulse rounded-lg bg-base-300" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-8 w-8 animate-pulse rounded bg-base-300" />
                    <div className="flex-1">
                      <div className="mb-2 h-5 w-24 animate-pulse rounded bg-base-300" />
                      <div className="space-y-1">
                        <div className="h-3 w-full animate-pulse rounded bg-base-300" />
                        <div className="h-3 w-3/4 animate-pulse rounded bg-base-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed right-4 bottom-4">
        <div className="flex items-center gap-2 rounded-lg bg-base-100 px-4 py-2 shadow-lg">
          <span className="loading loading-spinner loading-sm text-primary" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default SalaryEnquiryLoading;
