'use client';

import type React from 'react';
import { useCallback, useState } from 'react';
import { SalaryDataTable } from '@/components/SalaryDataTable';
import { type ChartType, SalaryVisualizationChart } from '@/components/SalaryVisualizationChart';
import { type SalaryQueryFormData, TypeformSalaryQuery } from '@/components/TypeformSalaryQuery';
import { useSalaryQuery } from '@/hooks/useSalaryQuery';
import type { SalaryQueryCriteria } from '@/services/salaryDataService';

// Convert form data to query criteria
const convertFormDataToCriteria = (formData: SalaryQueryFormData): SalaryQueryCriteria => {
  const criteria: SalaryQueryCriteria = {};

  if (formData.jobTitle) criteria.jobTitle = formData.jobTitle;
  if (formData.industry) criteria.industry = formData.industry;
  if (formData.region) criteria.region = formData.region;

  // Map form values to service enum values
  if (formData.experience) {
    const experienceMap: Record<string, 'entry' | 'mid' | 'senior' | 'executive'> = {
      'entry-level': 'entry',
      'mid-level': 'mid',
      'senior-level': 'senior',
      'executive-level': 'executive',
    };
    const mappedExperience = experienceMap[formData.experience];
    if (mappedExperience) {
      criteria.experienceLevel = mappedExperience;
    }
  }

  if (formData.education) {
    const educationMap: Record<string, 'high_school' | 'bachelor' | 'master' | 'phd'> = {
      'high-school': 'high_school',
      associate: 'bachelor', // Map associate to bachelor as closest match
      bachelor: 'bachelor',
      master: 'master',
      doctorate: 'phd',
      other: 'bachelor', // Default mapping
    };
    const mappedEducation = educationMap[formData.education];
    if (mappedEducation) {
      criteria.education = mappedEducation;
    }
  }

  if (formData.companySize) {
    const companySizeMap: Record<string, 'startup' | 'small' | 'medium' | 'large' | 'enterprise'> =
      {
        startup: 'startup',
        small: 'small',
        medium: 'medium',
        large: 'large',
        enterprise: 'enterprise',
      };
    const mappedCompanySize = companySizeMap[formData.companySize];
    if (mappedCompanySize) {
      criteria.companySize = mappedCompanySize;
    }
  }

  return criteria;
};

/**
 * Market Salary Typeform Page Component
 *
 * This component provides a streamlined user experience for salary research:
 * 1. Shows the typeform-styled form initially
 * 2. After form completion, displays results in the enquiry page format
 * 3. Maintains the sidebar throughout the process
 *
 * Features:
 * - Typeform-styled multi-step form interface
 * - Seamless transition to results view
 * - Comprehensive salary data visualization
 * - Interactive data table with filtering and sorting
 * - Responsive design with DaisyUI components
 * - Accessibility features and keyboard navigation
 * - Error handling and loading states
 * - Performance optimized with React Query
 */
interface MarketSalaryTypeformPageProps {
  /** Whether the app is in guest mode */
  isGuestMode?: boolean;
  /** Current user's role */
  currentUserRole?: string | null;
  /** Optional CSS class name */
  className?: string;
}

const MarketSalaryTypeformPage: React.FC<MarketSalaryTypeformPageProps> = ({ className = '' }) => {
  // State management
  const [queryCriteria, setQueryCriteria] = useState<SalaryQueryCriteria>({});
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [showResults, setShowResults] = useState(false);

  // Fetch salary data using the hook
  const { salaryData, statistics, metadata, isLoading, isFetching, error, refetch } =
    useSalaryQuery(queryCriteria, currentPage, pageSize, {
      enabled: hasSearched,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });

  // Handle form submission
  const handleFormSubmit = useCallback((formData: SalaryQueryFormData) => {
    const criteria = convertFormDataToCriteria(formData);
    setQueryCriteria(criteria);
    setHasSearched(true);
    setCurrentPage(1);
    setShowResults(true);
  }, []);

  // Handle chart type change
  const handleChartTypeChange = useCallback((newChartType: ChartType) => {
    setChartType(newChartType);
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle data table row click
  const handleRowClick = useCallback((dataPoint: any) => {
    console.log('Selected salary data point:', dataPoint);
    // Could implement modal or detailed view here
  }, []);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle back to form
  const handleBackToForm = useCallback(() => {
    setShowResults(false);
    setHasSearched(false);
    setQueryCriteria({});
  }, []);

  // Generate search summary
  const getSearchSummary = useCallback(() => {
    if (!hasSearched) return null;

    const parts: string[] = [];
    if (queryCriteria.jobTitle) parts.push(`"${queryCriteria.jobTitle}"`);
    if (queryCriteria.industry) parts.push(`in ${queryCriteria.industry}`);
    if (queryCriteria.region) parts.push(`in ${queryCriteria.region}`);
    if (queryCriteria.experienceLevel) parts.push(`(${queryCriteria.experienceLevel} level)`);

    return parts.length > 0 ? parts.join(' ') : 'All positions';
  }, [queryCriteria, hasSearched]);

  // Show typeform if results are not being displayed
  if (!showResults) {
    return (
      <div className={`flex-1 ${className}`}>
        <TypeformSalaryQuery
          onSubmitAction={handleFormSubmit}
          loading={isLoading}
          className="min-h-[calc(100vh-8rem)]"
        />
      </div>
    );
  }

  // Show results page
  return (
    <div
      className={`flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 ${className}`}
    >
      {/* Page Header */}
      <div className="border-gray-200/60 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleBackToForm}
                className="inline-flex items-center rounded-lg border border-gray-200/50 bg-white/60 px-4 py-2 font-medium text-gray-700 text-sm transition-all duration-200 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                aria-label="Back to form"
              >
                <svg
                  className="mr-2 h-4 w-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                New Search
              </button>
              <h1 className="font-bold text-3xl text-gray-900 md:text-4xl">
                Salary Analysis Results
              </h1>
            </div>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg md:text-xl">
              Here are your personalized salary insights based on your search criteria.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Search Summary */}
          <div className="rounded-lg border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="mb-2 font-semibold text-gray-900 text-xl">
                  Search Results for: {getSearchSummary()}
                </h2>
                {metadata && (
                  <p className="text-gray-600">
                    Found {metadata.totalCount.toLocaleString()} salary records
                    {statistics && (
                      <span className="ml-2 font-medium text-gray-800">
                        • Median:{' '}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: statistics.currency,
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(statistics.median)}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  onClick={handleBackToForm}
                  aria-label="Start new search"
                >
                  🔍 New Search
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center rounded-lg border border-gray-200/50 bg-white/60 px-4 py-2 font-medium text-gray-700 text-sm transition-all duration-200 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${isFetching ? 'cursor-not-allowed opacity-50' : ''}`}
                  onClick={handleRetry}
                  disabled={isLoading || isFetching}
                  aria-label="Refresh salary data"
                >
                  {isFetching ? 'Refreshing...' : '🔄 Refresh'}
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-red-200/60 bg-red-50/80 p-4 shadow-lg backdrop-blur-sm">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 shrink-0 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                    <h3 className="font-bold text-red-900">Error Loading Salary Data</h3>
                    <div className="text-red-700 text-sm">{error.message}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg border border-red-200/50 bg-white/60 px-3 py-2 font-medium text-red-700 text-sm transition-all duration-200 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  onClick={handleRetry}
                  aria-label="Retry loading data"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Visualization Section */}
          {salaryData && salaryData.length > 0 && (
            <section aria-labelledby="visualization-heading">
              <h2 id="visualization-heading" className="sr-only">
                Salary Data Visualization
              </h2>
              <SalaryVisualizationChart
                data={salaryData}
                statistics={statistics}
                chartType={chartType}
                title="Salary Distribution Analysis"
                height={400}
                loading={isLoading}
                error={error?.message}
                showMetadata={true}
                showTooltips={true}
                showLegend={true}
                currency={statistics?.currency || 'USD'}
                onChartTypeChange={handleChartTypeChange}
                className="w-full"
              />
            </section>
          )}

          {/* Data Table Section */}
          {salaryData && (
            <section aria-labelledby="data-table-heading">
              <h2 id="data-table-heading" className="sr-only">
                Detailed Salary Data Table
              </h2>
              <SalaryDataTable
                data={salaryData}
                statistics={statistics}
                loading={isLoading}
                error={error?.message}
                showStatistics={true}
                enableFiltering={true}
                enableSorting={true}
                pageSize={pageSize}
                onRowClick={handleRowClick}
                emptyStateMessage="No salary data found for your search criteria. Try adjusting your filters or search terms."
                className="w-full"
              />
            </section>
          )}

          {/* Pagination Controls */}
          {metadata && metadata.totalCount > pageSize && (
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-sm">
                <button
                  type="button"
                  className="rounded-l-lg border-gray-200/50 border-r bg-white/60 px-4 py-2 font-medium text-gray-700 text-sm transition-all duration-200 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  aria-label="Previous page"
                >
                  « Previous
                </button>

                <button
                  type="button"
                  className="border-gray-200/50 border-r bg-blue-50/80 px-4 py-2 font-medium text-blue-700 text-sm"
                  disabled
                  aria-current="page"
                >
                  Page {currentPage}
                </button>

                <button
                  type="button"
                  className="rounded-r-lg bg-white/60 px-4 py-2 font-medium text-gray-700 text-sm transition-all duration-200 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!metadata.hasMore || isLoading}
                  aria-label="Next page"
                >
                  Next »
                </button>
              </div>
            </div>
          )}

          {/* Insights Section */}
          <section className="rounded-lg border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            <h2 className="mb-6 font-bold text-2xl text-gray-900">Key Insights</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50/80">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">Market Analysis</h3>
                  <p className="text-gray-600 text-sm">
                    Based on {metadata?.totalCount || 0} verified salary data points from the
                    market.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-50/80">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">Competitive Range</h3>
                  <p className="text-gray-600 text-sm">
                    {statistics && (
                      <>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: statistics.currency,
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(statistics.percentile25)}{' '}
                        -{' '}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: statistics.currency,
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(statistics.percentile75)}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50/80">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">Growth Potential</h3>
                  <p className="text-gray-600 text-sm">
                    Explore career progression opportunities in your field.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50/80">
                  <svg
                    className="h-6 w-6 text-orange-600"
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
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">Personalized</h3>
                  <p className="text-gray-600 text-sm">
                    Results tailored to your experience level and location.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && hasSearched && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-lg border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <h3 className="mb-2 font-semibold text-gray-900 text-lg">Analyzing Salary Data</h3>
              <p className="text-gray-600">
                Please wait while we process your personalized salary insights...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketSalaryTypeformPage;
