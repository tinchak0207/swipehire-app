'use client';

import type React from 'react';
import { useState } from 'react';
import { useSalaryQuery } from '@/hooks/useSalaryQuery';
import type { SalaryQueryCriteria } from '@/services/salaryDataService';
import type { SalaryQueryFormData } from './SalaryQueryForm';
import { SalaryQueryForm } from './SalaryQueryForm';
import type { ChartType } from './SalaryVisualizationChart';
import { SalaryVisualizationChart } from './SalaryVisualizationChart';

/**
 * Integration example showing how to use SalaryVisualizationChart with SalaryQueryForm
 * and the useSalaryQuery hook for a complete salary analysis workflow.
 */
export const SalaryVisualizationIntegration: React.FC = () => {
  const [queryCriteria, setQueryCriteria] = useState<SalaryQueryCriteria>({});
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Use the salary query hook to fetch data
  const { salaryData, statistics, isLoading, error, refetch } = useSalaryQuery(
    queryCriteria,
    1,
    50,
    {
      enabled: hasSubmitted,
    }
  );

  // Handle form submission
  const handleFormSubmit = (formData: SalaryQueryFormData) => {
    // Convert form data to query criteria
    const criteria: SalaryQueryCriteria = {
      jobTitle: formData.jobTitle,
      industry: formData.industry,
      region: formData.region,
      experienceLevel: mapExperienceLevel(formData.experience),
      education: mapEducationLevel(formData.education),
      companySize: formData.companySize as any,
    };

    setQueryCriteria(criteria);
    setHasSubmitted(true);
  };

  // Handle chart type changes
  const handleChartTypeChange = (newType: ChartType) => {
    setChartType(newType);
  };

  // Handle retry on error
  const handleRetry = () => {
    refetch();
  };

  // Reset the form and results
  const handleReset = () => {
    setQueryCriteria({});
    setHasSubmitted(false);
    setChartType('bar');
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-4 font-bold text-4xl">Salary Market Analysis</h1>
        <p className="mx-auto max-w-2xl text-base-content/70 text-lg">
          Discover competitive salary ranges for your role and experience level. Use our
          comprehensive database to make informed career decisions.
        </p>
      </div>

      {/* Query Form */}
      <div className="mx-auto max-w-4xl">
        <SalaryQueryForm
          loading={isLoading}
          initialData={hasSubmitted ? convertCriteriaToFormData(queryCriteria) : {}}
          onSubmitAction={handleFormSubmit}
        />
      </div>

      {/* Results Section */}
      {hasSubmitted && (
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <h2 className="font-bold text-2xl">Analysis Results</h2>
              {statistics && (
                <div className="badge badge-primary">{statistics.count} data points</div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleRetry}
                disabled={isLoading}
              >
                🔄 Refresh
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset}>
                🔍 New Search
              </button>
            </div>
          </div>

          {/* Visualization Chart */}
          <SalaryVisualizationChart
            data={salaryData}
            statistics={statistics}
            chartType={chartType}
            title={generateChartTitle(queryCriteria)}
            loading={isLoading}
            error={error?.message}
            onChartTypeChange={handleChartTypeChange}
            showMetadata={true}
            height={500}
            className="shadow-lg"
          />

          {/* Additional Insights */}
          {statistics && !isLoading && !error && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="card bg-gradient-to-br from-primary to-primary-focus text-primary-content">
                <div className="card-body">
                  <h3 className="card-title text-lg">Market Position</h3>
                  <div className="font-bold text-3xl">{getMarketPosition(statistics)}</div>
                  <p className="text-sm opacity-90">Based on median salary comparison</p>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-secondary to-secondary-focus text-secondary-content">
                <div className="card-body">
                  <h3 className="card-title text-lg">Salary Range</h3>
                  <div className="font-bold text-2xl">
                    ${(statistics.percentile25 / 1000).toFixed(0)}k - $
                    {(statistics.percentile75 / 1000).toFixed(0)}k
                  </div>
                  <p className="text-sm opacity-90">25th to 75th percentile</p>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-accent to-accent-focus text-accent-content">
                <div className="card-body">
                  <h3 className="card-title text-lg">Growth Potential</h3>
                  <div className="font-bold text-2xl">
                    +
                    {(
                      ((statistics.percentile90 - statistics.median) / statistics.median) *
                      100
                    ).toFixed(0)}
                    %
                  </div>
                  <p className="text-sm opacity-90">Potential salary increase</p>
                </div>
              </div>
            </div>
          )}

          {/* Tips and Recommendations */}
          {statistics && !isLoading && !error && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">💡 Insights & Recommendations</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold">Negotiation Tips</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      <li>
                        Research shows the median salary is ${(statistics.median / 1000).toFixed(0)}
                        k
                      </li>
                      <li>
                        Top performers earn up to ${(statistics.percentile90 / 1000).toFixed(0)}k
                      </li>
                      <li>Consider total compensation including benefits</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Market Trends</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      <li>Data based on {statistics.count} verified submissions</li>
                      <li>
                        Standard deviation: ${(statistics.standardDeviation / 1000).toFixed(0)}k
                      </li>
                      <li>Last updated: {new Date(statistics.lastUpdated).toLocaleDateString()}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Getting Started Guide */}
      {!hasSubmitted && (
        <div className="mx-auto max-w-4xl">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">🚀 How to Get Started</h3>
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-content text-xl">
                    1
                  </div>
                  <h4 className="mb-2 font-semibold">Fill the Form</h4>
                  <p className="text-base-content/70 text-sm">
                    Enter your job details, experience level, and location preferences
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary font-bold text-secondary-content text-xl">
                    2
                  </div>
                  <h4 className="mb-2 font-semibold">View Results</h4>
                  <p className="text-base-content/70 text-sm">
                    Explore interactive charts and detailed salary statistics
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent font-bold text-accent-content text-xl">
                    3
                  </div>
                  <h4 className="mb-2 font-semibold">Make Decisions</h4>
                  <p className="text-base-content/70 text-sm">
                    Use insights for negotiations, career planning, and job searches
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function mapExperienceLevel(
  experience: string
): 'entry' | 'mid' | 'senior' | 'executive' | undefined {
  const mapping: Record<string, 'entry' | 'mid' | 'senior' | 'executive'> = {
    'entry-level': 'entry',
    'mid-level': 'mid',
    'senior-level': 'senior',
    'executive-level': 'executive',
  };
  return mapping[experience];
}

function mapEducationLevel(
  education: string
): 'high_school' | 'bachelor' | 'master' | 'phd' | undefined {
  const mapping: Record<string, 'high_school' | 'bachelor' | 'master' | 'phd'> = {
    'high-school': 'high_school',
    associate: 'high_school', // Map associate to high_school as closest match
    bachelor: 'bachelor',
    master: 'master',
    doctorate: 'phd',
  };
  return mapping[education];
}

function convertCriteriaToFormData(criteria: SalaryQueryCriteria): Partial<SalaryQueryFormData> {
  return {
    jobTitle: criteria.jobTitle || '',
    industry: criteria.industry || '',
    region: criteria.region || '',
    experience: criteria.experienceLevel ? `${criteria.experienceLevel}-level` : '',
    education: criteria.education === 'high_school' ? 'high-school' : criteria.education || '',
    companySize: criteria.companySize || '',
  };
}

function generateChartTitle(criteria: SalaryQueryCriteria): string {
  const parts = [];

  if (criteria.jobTitle) parts.push(criteria.jobTitle);
  if (criteria.experienceLevel) parts.push(`${criteria.experienceLevel} level`);
  if (criteria.industry) parts.push(`in ${criteria.industry}`);
  if (criteria.region) parts.push(`- ${criteria.region}`);

  return parts.length > 0 ? `Salary Analysis: ${parts.join(' ')}` : 'Salary Analysis';
}

function getMarketPosition(statistics: any): string {
  const median = statistics.median;
  const mean = statistics.mean;

  if (median > mean * 1.1) return 'Above Average';
  if (median < mean * 0.9) return 'Below Average';
  return 'Market Average';
}

export default SalaryVisualizationIntegration;
