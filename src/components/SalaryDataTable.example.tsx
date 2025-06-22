'use client';

import type React from 'react';
import { useState } from 'react';
import type { SalaryDataPoint, SalaryStatistics } from '@/services/salaryDataService';
import { SalaryDataTable } from './SalaryDataTable';

// Example data for demonstration
const exampleSalaryData: SalaryDataPoint[] = [
  {
    id: '1',
    jobTitle: 'Senior Software Engineer',
    industry: 'Technology',
    region: 'San Francisco, CA',
    experienceLevel: 'senior',
    education: 'bachelor',
    companySize: 'large',
    baseSalary: 165000,
    totalCompensation: 240000,
    bonus: 35000,
    equity: 40000,
    benefits: ['Health Insurance', '401k', 'Stock Options', 'Unlimited PTO'],
    currency: 'USD',
    timestamp: '2024-01-20T10:30:00Z',
    source: 'user_contribution',
    verified: true,
  },
  {
    id: '2',
    jobTitle: 'Product Manager',
    industry: 'Technology',
    region: 'New York, NY',
    experienceLevel: 'senior',
    education: 'master',
    companySize: 'medium',
    baseSalary: 155000,
    totalCompensation: 210000,
    bonus: 30000,
    equity: 25000,
    benefits: ['Health Insurance', '401k', 'Flexible Hours'],
    currency: 'USD',
    timestamp: '2024-01-19T14:20:00Z',
    source: 'user_contribution',
    verified: true,
  },
  {
    id: '3',
    jobTitle: 'Data Scientist',
    industry: 'Finance',
    region: 'Chicago, IL',
    experienceLevel: 'mid',
    education: 'master',
    companySize: 'large',
    baseSalary: 125000,
    totalCompensation: 165000,
    bonus: 20000,
    equity: 20000,
    benefits: ['Health Insurance', '401k'],
    currency: 'USD',
    timestamp: '2024-01-18T09:15:00Z',
    source: 'api_scraping',
    verified: false,
  },
  {
    id: '4',
    jobTitle: 'Frontend Developer',
    industry: 'Technology',
    region: 'Austin, TX',
    experienceLevel: 'mid',
    education: 'bachelor',
    companySize: 'startup',
    baseSalary: 95000,
    totalCompensation: 130000,
    bonus: 10000,
    equity: 25000,
    benefits: ['Health Insurance', 'Stock Options'],
    currency: 'USD',
    timestamp: '2024-01-17T16:45:00Z',
    source: 'user_contribution',
    verified: true,
  },
  {
    id: '5',
    jobTitle: 'DevOps Engineer',
    industry: 'Technology',
    region: 'Seattle, WA',
    experienceLevel: 'senior',
    education: 'bachelor',
    companySize: 'large',
    baseSalary: 145000,
    totalCompensation: 195000,
    bonus: 25000,
    equity: 25000,
    benefits: ['Health Insurance', '401k', 'Stock Options'],
    currency: 'USD',
    timestamp: '2024-01-16T11:30:00Z',
    source: 'user_contribution',
    verified: true,
  },
  {
    id: '6',
    jobTitle: 'UX Designer',
    industry: 'Technology',
    region: 'Los Angeles, CA',
    experienceLevel: 'mid',
    education: 'bachelor',
    companySize: 'medium',
    baseSalary: 105000,
    totalCompensation: 135000,
    bonus: 15000,
    equity: 15000,
    benefits: ['Health Insurance', '401k', 'Design Budget'],
    currency: 'USD',
    timestamp: '2024-01-15T13:20:00Z',
    source: 'user_contribution',
    verified: true,
  },
  {
    id: '7',
    jobTitle: 'Marketing Manager',
    industry: 'Marketing',
    region: 'Boston, MA',
    experienceLevel: 'senior',
    education: 'master',
    companySize: 'medium',
    baseSalary: 115000,
    totalCompensation: 145000,
    bonus: 20000,
    equity: 10000,
    benefits: ['Health Insurance', '401k', 'Marketing Budget'],
    currency: 'USD',
    timestamp: '2024-01-14T08:45:00Z',
    source: 'api_scraping',
    verified: false,
  },
  {
    id: '8',
    jobTitle: 'Sales Director',
    industry: 'Sales',
    region: 'Miami, FL',
    experienceLevel: 'executive',
    education: 'bachelor',
    companySize: 'large',
    baseSalary: 135000,
    totalCompensation: 220000,
    bonus: 60000,
    equity: 25000,
    benefits: ['Health Insurance', '401k', 'Car Allowance'],
    currency: 'USD',
    timestamp: '2024-01-13T15:10:00Z',
    source: 'user_contribution',
    verified: true,
  },
  {
    id: '9',
    jobTitle: 'Software Engineer',
    industry: 'Technology',
    region: 'Denver, CO',
    experienceLevel: 'entry',
    education: 'bachelor',
    companySize: 'startup',
    baseSalary: 75000,
    totalCompensation: 95000,
    bonus: 5000,
    equity: 15000,
    benefits: ['Health Insurance', 'Stock Options'],
    currency: 'USD',
    timestamp: '2024-01-12T12:00:00Z',
    source: 'user_contribution',
    verified: true,
  },
  {
    id: '10',
    jobTitle: 'Business Analyst',
    industry: 'Finance',
    region: 'Charlotte, NC',
    experienceLevel: 'mid',
    education: 'master',
    companySize: 'large',
    baseSalary: 85000,
    totalCompensation: 105000,
    bonus: 12000,
    equity: 8000,
    benefits: ['Health Insurance', '401k', 'Tuition Reimbursement'],
    currency: 'USD',
    timestamp: '2024-01-11T09:30:00Z',
    source: 'api_scraping',
    verified: false,
  },
];

const exampleStatistics: SalaryStatistics = {
  count: 10,
  median: 140000,
  mean: 164000,
  min: 95000,
  max: 240000,
  percentile25: 115000,
  percentile75: 195000,
  percentile90: 220000,
  standardDeviation: 45000,
  currency: 'USD',
  lastUpdated: '2024-01-20T12:00:00Z',
};

// Demo component
export const SalaryDataTableExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatistics, setShowStatistics] = useState(true);
  const [enableFiltering, setEnableFiltering] = useState(true);
  const [enableSorting, setEnableSorting] = useState(true);
  const [pageSize, setPageSize] = useState(5);

  const handleRowClick = (dataPoint: SalaryDataPoint) => {
    alert(
      `Clicked on: ${dataPoint.jobTitle} at ${dataPoint.industry}\nTotal Compensation: ${new Intl.NumberFormat(
        'en-US',
        {
          style: 'currency',
          currency: dataPoint.currency,
        }
      ).format(dataPoint.totalCompensation)}`
    );
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const simulateError = () => {
    setError('Simulated API error - failed to load salary data');
    setTimeout(() => setError(null), 3000);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="prose max-w-none">
        <h1>SalaryDataTable Component Examples</h1>
        <p>
          This page demonstrates the SalaryDataTable component with various configurations and
          states. The component provides a comprehensive table view for salary data with sorting,
          filtering, pagination, and accessibility features.
        </p>
      </div>

      {/* Controls */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Demo Controls</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Show Statistics</span>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={showStatistics}
                  onChange={(e) => setShowStatistics(e.target.checked)}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Enable Filtering</span>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={enableFiltering}
                  onChange={(e) => setEnableFiltering(e.target.checked)}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Enable Sorting</span>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={enableSorting}
                  onChange={(e) => setEnableSorting(e.target.checked)}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Page Size</span>
              </label>
              <select
                className="select select-bordered"
                value={pageSize}
                onChange={(e) => setPageSize(Number.parseInt(e.target.value, 10))}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
          <div className="card-actions justify-start">
            <button
              type="button"
              className="btn btn-primary"
              onClick={simulateLoading}
              disabled={loading}
            >
              Simulate Loading
            </button>
            <button type="button" className="btn btn-error" onClick={simulateError}>
              Simulate Error
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <SalaryDataTable
        data={exampleSalaryData}
        statistics={exampleStatistics}
        loading={loading}
        error={error}
        showStatistics={showStatistics}
        enableFiltering={enableFiltering}
        enableSorting={enableSorting}
        pageSize={pageSize}
        onRowClick={handleRowClick}
        className="mb-8"
      />

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Key Features</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>Sortable columns with visual indicators</li>
              <li>Advanced filtering by multiple criteria</li>
              <li>Pagination for large datasets</li>
              <li>Responsive design with mobile support</li>
              <li>Accessibility compliant (WCAG 2.1 AA)</li>
              <li>Loading and error states</li>
              <li>Statistics summary display</li>
              <li>Row click interactions</li>
              <li>Currency and date formatting</li>
              <li>Verification status indicators</li>
            </ul>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Usage Tips</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>Click column headers to sort data</li>
              <li>Use filters to narrow down results</li>
              <li>Click on rows to view detailed information</li>
              <li>Navigate with keyboard for accessibility</li>
              <li>Adjust page size based on your needs</li>
              <li>Statistics update automatically with filters</li>
              <li>Unverified data is marked with badges</li>
              <li>Currency values are properly formatted</li>
              <li>Dates show in user-friendly format</li>
              <li>Experience levels are human-readable</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Empty State Example */}
      <div className="space-y-4">
        <h2 className="font-bold text-2xl">Empty State Example</h2>
        <SalaryDataTable
          data={[]}
          emptyStateMessage="No salary data matches your current filters"
        />
      </div>

      {/* Minimal Configuration Example */}
      <div className="space-y-4">
        <h2 className="font-bold text-2xl">Minimal Configuration</h2>
        <SalaryDataTable
          data={exampleSalaryData.slice(0, 3)}
          showStatistics={false}
          enableFiltering={false}
          enableSorting={false}
        />
      </div>

      {/* Code Examples */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Code Examples</h2>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-lg">Basic Usage</h3>
              <div className="mockup-code">
                <pre data-prefix="1">
                  <code>
                    import {'{'} SalaryDataTable {'}'} from '@/components/SalaryDataTable';
                  </code>
                </pre>
                <pre data-prefix="2">
                  <code />
                </pre>
                <pre data-prefix="3">
                  <code>&lt;SalaryDataTable</code>
                </pre>
                <pre data-prefix="4">
                  <code> data={'{salaryData}'}</code>
                </pre>
                <pre data-prefix="5">
                  <code> statistics={'{statistics}'}</code>
                </pre>
                <pre data-prefix="6">
                  <code>/&gt;</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-lg">With Custom Configuration</h3>
              <div className="mockup-code">
                <pre data-prefix="1">
                  <code>&lt;SalaryDataTable</code>
                </pre>
                <pre data-prefix="2">
                  <code> data={'{salaryData}'}</code>
                </pre>
                <pre data-prefix="3">
                  <code> statistics={'{statistics}'}</code>
                </pre>
                <pre data-prefix="4">
                  <code> loading={'{loading}'}</code>
                </pre>
                <pre data-prefix="5">
                  <code> error={'{error}'}</code>
                </pre>
                <pre data-prefix="6">
                  <code> showStatistics={'{true}'}</code>
                </pre>
                <pre data-prefix="7">
                  <code> enableFiltering={'{true}'}</code>
                </pre>
                <pre data-prefix="8">
                  <code> enableSorting={'{true}'}</code>
                </pre>
                <pre data-prefix="9">
                  <code> pageSize={'{20}'}</code>
                </pre>
                <pre data-prefix="10">
                  <code> onRowClick={'{handleRowClick}'}</code>
                </pre>
                <pre data-prefix="11">
                  <code> className="custom-table"</code>
                </pre>
                <pre data-prefix="12">
                  <code>/&gt;</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryDataTableExample;
