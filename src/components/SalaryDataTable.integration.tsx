'use client';

import type React from 'react';
import { useState } from 'react';
import { useSalaryQuery } from '@/hooks/useSalaryQuery';
import { SalaryDataTable } from './SalaryDataTable';
import { SalaryVisualizationChart } from './SalaryVisualizationChart';
import type { SalaryQueryFormData } from './TypeformSalaryQuery';
import { TypeformSalaryQuery } from './TypeformSalaryQuery';

/**
 * Integration component demonstrating how SalaryDataTable works with other salary components
 * This shows the complete salary enquiry workflow with Typeform-style interface
 */
export const SalaryDataTableIntegration: React.FC = () => {
  const [queryData, setQueryData] = useState<SalaryQueryFormData | null>(null);

  // Convert form data to query criteria
  const queryCriteria = queryData
    ? {
        jobTitle: queryData.jobTitle,
        industry: queryData.industry,
        region: queryData.region,
        experienceLevel: queryData.experience as 'entry' | 'mid' | 'senior' | 'executive',
        education: queryData.education as 'high_school' | 'bachelor' | 'master' | 'phd',
        companySize: queryData.companySize as
          | 'startup'
          | 'small'
          | 'medium'
          | 'large'
          | 'enterprise',
      }
    : {};

  const { salaryData, statistics, isLoading, error } = useSalaryQuery(queryCriteria, 1, 20, {
    enabled: !!queryData,
  });

  const handleFormSubmit = (formData: SalaryQueryFormData) => {
    setQueryData(formData);
  };

  const handleRowClick = (dataPoint: any) => {
    alert(
      `Selected: ${dataPoint.jobTitle} at ${dataPoint.industry}\nSalary: ${new Intl.NumberFormat(
        'en-US',
        {
          style: 'currency',
          currency: dataPoint.currency,
        }
      ).format(dataPoint.totalCompensation)}`
    );
  };

  return (
    <div className="min-h-screen">
      {/* Typeform-style Query Form */}
      {!queryData && <TypeformSalaryQuery onSubmitAction={handleFormSubmit} loading={isLoading} />}

      {/* Results Section */}
      {queryData && (
        <div className="container mx-auto min-h-screen space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
          <div className="prose max-w-none">
            <h1 className="text-slate-800">Salary Analysis Results</h1>
            <p className="text-slate-600">
              Here are your personalized salary insights based on your criteria.
            </p>
          </div>


          <div className="space-y-6">
            <div className="divider">
              <span className="font-semibold text-lg text-slate-700">
                Results for: {queryData.jobTitle}
              </span>
            </div>

            {/* Visualization Chart */}
            <SalaryVisualizationChart
              data={salaryData}
              statistics={statistics || undefined}
              loading={isLoading}
              error={error?.message}
              chartType="box"
              title={`Salary Analysis: ${queryData.jobTitle} in ${queryData.industry}`}
            />

            {/* Data Table */}
            <SalaryDataTable
              data={salaryData}
              statistics={statistics}
              loading={isLoading}
              error={error?.message}
              onRowClick={handleRowClick}
              showStatistics={true}
              enableFiltering={true}
              enableSorting={true}
              pageSize={10}
              className="mt-6"
            />

            {/* Summary Stats */}
            {statistics && !isLoading && (
              <div className="card border border-white/20 bg-white/80 shadow-xl backdrop-blur-sm">
                <div className="card-body">
                  <h2 className="card-title text-slate-800">Query Summary</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="stat">
                      <div className="stat-title text-slate-600">Total Records</div>
                      <div className="stat-value text-primary">{statistics.count}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title text-slate-600">Median Salary</div>
                      <div className="stat-value text-secondary">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: statistics.currency,
                        }).format(statistics.median)}
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-title text-slate-600">Salary Range</div>
                      <div className="stat-value text-accent text-lg">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: statistics.currency,
                        }).format(statistics.min)}{' '}
                        -{' '}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: statistics.currency,
                        }).format(statistics.max)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryDataTableIntegration;
