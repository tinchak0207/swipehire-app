'use client';

import type React from 'react';
import { useCallback, useState } from 'react';
import { SalaryDataTable } from '@/components/SalaryDataTable';
import { SalaryQueryForm, type SalaryQueryFormData } from '@/components/SalaryQueryForm';
import { type ChartType, SalaryVisualizationChart } from '@/components/SalaryVisualizationChart';
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
    const experienceMap: Record<string, SalaryQueryCriteria['experienceLevel']> = {
      'entry-level': 'entry',
      'mid-level': 'mid',
      'senior-level': 'senior',
      'executive-level': 'executive',
    };
    criteria.experienceLevel = experienceMap[formData.experience];
  }

  if (formData.education) {
    const educationMap: Record<string, SalaryQueryCriteria['education']> = {
      'high-school': 'high_school',
      associate: 'bachelor', // Map associate to bachelor as closest match
      bachelor: 'bachelor',
      master: 'master',
      doctorate: 'phd',
      other: 'bachelor', // Default mapping
    };
    criteria.education = educationMap[formData.education];
  }

  if (formData.companySize) {
    const companySizeMap: Record<string, SalaryQueryCriteria['companySize']> = {
      startup: 'startup',
      small: 'small',
      medium: 'medium',
      large: 'large',
      enterprise: 'enterprise',
    };
    criteria.companySize = companySizeMap[formData.companySize];
  }

  return criteria;
};

// Main page component
const MarketSalaryEnquiryPage: React.FC = () => {
  // State management
  const [queryCriteria, setQueryCriteria] = useState<SalaryQueryCriteria>({});
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Fetch salary data using the hook
  const {
    data: salaryResponse,
    salaryData,
    statistics,
    metadata,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useSalaryQuery(queryCriteria, currentPage, pageSize, {
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

  return (
    <div className="min-h-screen bg-base-200">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-white">
            <h1 className="mb-4 font-bold text-4xl text-white md:text-5xl">
              Market Salary Enquiry
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white opacity-90 md:text-xl">
              Discover competitive salary ranges and compensation data for your industry and role.
              Get insights into market rates, benefits, and total compensation packages.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Search Form Section */}
          <section aria-labelledby="search-form-heading">
            <h2 id="search-form-heading" className="sr-only">
              Salary Search Form
            </h2>
            <SalaryQueryForm onSubmitAction={handleFormSubmit} loading={isLoading || isFetching} />
          </section>

          {/* Results Section */}
          {hasSearched && (
            <>
              {/* Search Summary */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-semibold text-white text-xl">
                        Search Results for: {getSearchSummary()}
                      </h2>
                      {metadata && (
                        <p className="text-white">
                          Found {metadata.totalCount.toLocaleString()} salary records
                          {statistics && (
                            <span className="ml-2 text-white">
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
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`btn btn-outline btn-sm ${isFetching ? 'loading' : ''}`}
                        onClick={handleRetry}
                        disabled={isLoading || isFetching}
                        aria-label="Refresh salary data"
                      >
                        {isFetching ? 'Refreshing...' : '🔄 Refresh'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="alert alert-error shadow-lg">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-white"
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
                        <h3 className="font-bold text-white">Error Loading Salary Data</h3>
                        <div className="text-white text-xs">{error.message}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-white"
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
                  <div className="join">
                    <button
                      type="button"
                      className="join-item btn text-white"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                      aria-label="Previous page"
                    >
                      « Previous
                    </button>

                    <button
                      type="button"
                      className="join-item btn btn-active text-white"
                      disabled
                      aria-current="page"
                    >
                      Page {currentPage}
                    </button>

                    <button
                      type="button"
                      className="join-item btn text-white"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!metadata.hasMore || isLoading}
                      aria-label="Next page"
                    >
                      Next »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Getting Started Section (shown when no search has been performed) */}
          {!hasSearched && (
            <section className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4 text-2xl text-white">How It Works</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <div className="mb-4 text-4xl">🔍</div>
                    <h3 className="mb-2 font-semibold text-lg text-white">1. Search</h3>
                    <p className="text-white">
                      Enter your job title, industry, location, and other criteria to find relevant
                      salary data.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mb-4 text-4xl">📊</div>
                    <h3 className="mb-2 font-semibold text-lg text-white">2. Analyze</h3>
                    <p className="text-white">
                      View comprehensive salary statistics, charts, and detailed breakdowns of
                      compensation data.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mb-4 text-4xl">💡</div>
                    <h3 className="mb-2 font-semibold text-lg text-white">3. Decide</h3>
                    <p className="text-white">
                      Use the insights to negotiate better compensation or make informed career
                      decisions.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Features Section */}
          <section className="card bg-gradient-to-br from-base-100 to-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-6 text-2xl text-white">Why Use Our Salary Data?</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h3 className="font-semibold text-white">Verified Data</h3>
                    <p className="text-sm text-white">
                      Our salary data is verified and regularly updated from reliable sources.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🌍</div>
                  <div>
                    <h3 className="font-semibold text-white">Global Coverage</h3>
                    <p className="text-sm text-white">
                      Access salary data from multiple regions and countries worldwide.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📈</div>
                  <div>
                    <h3 className="font-semibold text-white">Detailed Analytics</h3>
                    <p className="text-sm text-white">
                      Get comprehensive statistics including median, percentiles, and trends.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔒</div>
                  <div>
                    <h3 className="font-semibold text-white">Privacy First</h3>
                    <p className="text-sm text-white">
                      All data is anonymized to protect individual privacy while providing insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && hasSearched && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="card bg-base-100 shadow-2xl">
            <div className="card-body items-center text-center">
              <span className="loading loading-spinner loading-lg text-primary" />
              <h3 className="mt-4 font-semibold text-lg text-white">Searching Salary Data</h3>
              <p className="text-white">
                Please wait while we gather the latest compensation information...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketSalaryEnquiryPage;
