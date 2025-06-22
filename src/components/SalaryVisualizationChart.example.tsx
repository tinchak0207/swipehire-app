'use client';

import type React from 'react';
import { useState } from 'react';
import type { SalaryDataPoint, SalaryStatistics } from '@/services/salaryDataService';
import type { ChartType } from './SalaryVisualizationChart';
import { SalaryVisualizationChart } from './SalaryVisualizationChart';

// Example data for demonstration
const exampleSalaryData: SalaryDataPoint[] = [
  {
    id: 'example-1',
    jobTitle: 'Software Engineer',
    industry: 'Technology',
    region: 'San Francisco, CA',
    experienceLevel: 'mid',
    education: 'bachelor',
    companySize: 'large',
    baseSalary: 130000,
    totalCompensation: 180000,
    bonus: 20000,
    equity: 30000,
    benefits: ['Health Insurance', '401k', 'Stock Options'],
    currency: 'USD',
    timestamp: '2024-01-15T10:00:00Z',
    source: 'company-survey',
    verified: true,
  },
  {
    id: 'example-2',
    jobTitle: 'Senior Software Engineer',
    industry: 'Technology',
    region: 'New York, NY',
    experienceLevel: 'senior',
    education: 'master',
    companySize: 'medium',
    baseSalary: 160000,
    totalCompensation: 220000,
    bonus: 25000,
    equity: 35000,
    benefits: ['Health Insurance', '401k', 'Stock Options', 'Remote Work'],
    currency: 'USD',
    timestamp: '2024-01-16T10:00:00Z',
    source: 'company-survey',
    verified: true,
  },
  {
    id: 'example-3',
    jobTitle: 'Product Manager',
    industry: 'Technology',
    region: 'Seattle, WA',
    experienceLevel: 'senior',
    education: 'bachelor',
    companySize: 'large',
    baseSalary: 140000,
    totalCompensation: 200000,
    bonus: 30000,
    equity: 30000,
    benefits: ['Health Insurance', '401k', 'Stock Options'],
    currency: 'USD',
    timestamp: '2024-01-17T10:00:00Z',
    source: 'company-survey',
    verified: false,
  },
  {
    id: 'example-4',
    jobTitle: 'Data Scientist',
    industry: 'Technology',
    region: 'Austin, TX',
    experienceLevel: 'mid',
    education: 'master',
    companySize: 'startup',
    baseSalary: 120000,
    totalCompensation: 150000,
    bonus: 15000,
    equity: 15000,
    benefits: ['Health Insurance', '401k'],
    currency: 'USD',
    timestamp: '2024-01-18T10:00:00Z',
    source: 'company-survey',
    verified: true,
  },
  {
    id: 'example-5',
    jobTitle: 'Engineering Manager',
    industry: 'Technology',
    region: 'Boston, MA',
    experienceLevel: 'executive',
    education: 'master',
    companySize: 'large',
    baseSalary: 180000,
    totalCompensation: 250000,
    bonus: 40000,
    equity: 30000,
    benefits: ['Health Insurance', '401k', 'Stock Options', 'Executive Benefits'],
    currency: 'USD',
    timestamp: '2024-01-19T10:00:00Z',
    source: 'company-survey',
    verified: true,
  },
];

const exampleStatistics: SalaryStatistics = {
  count: 5,
  median: 160000,
  mean: 166000,
  min: 120000,
  max: 250000,
  percentile25: 140000,
  percentile75: 200000,
  percentile90: 220000,
  standardDeviation: 45000,
  currency: 'USD',
  lastUpdated: '2024-01-19T12:00:00Z',
};

/**
 * Example component demonstrating various usage patterns of SalaryVisualizationChart
 */
export const SalaryVisualizationChartExample: React.FC = () => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleChartTypeChange = (newType: ChartType) => {
    setLoading(true);
    setChartType(newType);

    // Simulate loading delay
    setTimeout(() => setLoading(false), 500);
  };

  const toggleError = () => {
    setShowError(!showError);
  };

  const toggleLoading = () => {
    setLoading(!loading);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">SalaryVisualizationChart Examples</h1>
        <p className="text-base-content/70 mb-6">
          Interactive examples demonstrating different features and states of the
          SalaryVisualizationChart component.
        </p>
      </div>

      {/* Control Panel */}
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Demo Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              className={`btn ${loading ? 'btn-secondary' : 'btn-primary'}`}
              onClick={toggleLoading}
            >
              {loading ? 'Stop Loading' : 'Show Loading State'}
            </button>
            <button
              type="button"
              className={`btn ${showError ? 'btn-secondary' : 'btn-error'}`}
              onClick={toggleError}
            >
              {showError ? 'Hide Error' : 'Show Error State'}
            </button>
          </div>
        </div>
      </div>

      {/* Basic Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
        <SalaryVisualizationChart
          data={exampleSalaryData}
          statistics={exampleStatistics}
          title="Technology Sector Salary Analysis"
          chartType={chartType}
          loading={loading}
          error={showError ? 'Failed to load salary data. Please try again.' : undefined}
          onChartTypeChange={handleChartTypeChange}
        />
      </section>

      {/* Minimal Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Minimal Configuration</h2>
        <SalaryVisualizationChart
          data={exampleSalaryData.slice(0, 3)}
          title="Simple Salary Chart"
          showMetadata={false}
        />
      </section>

      {/* Custom Styling Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Custom Styling</h2>
        <SalaryVisualizationChart
          data={exampleSalaryData}
          statistics={exampleStatistics}
          title="Custom Styled Chart"
          chartType="line"
          height={500}
          colorScheme={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']}
          currency="EUR"
          className="border-2 border-primary rounded-xl"
        />
      </section>

      {/* Different Chart Types */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Chart Type Variations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalaryVisualizationChart
            data={exampleSalaryData}
            title="Bar Chart"
            chartType="bar"
            height={300}
            showMetadata={false}
          />
          <SalaryVisualizationChart
            data={exampleSalaryData}
            title="Line Chart"
            chartType="line"
            height={300}
            showMetadata={false}
          />
          <SalaryVisualizationChart
            data={exampleSalaryData}
            title="Area Chart"
            chartType="area"
            height={300}
            showMetadata={false}
          />
          <SalaryVisualizationChart
            data={exampleSalaryData}
            title="Pie Chart"
            chartType="pie"
            height={300}
            showMetadata={false}
          />
        </div>
      </section>

      {/* Empty State Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Empty State</h2>
        <SalaryVisualizationChart data={[]} title="No Data Available" />
      </section>

      {/* Loading State Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Loading State</h2>
        <SalaryVisualizationChart data={exampleSalaryData} title="Loading Example" loading={true} />
      </section>

      {/* Error State Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Error State</h2>
        <SalaryVisualizationChart
          data={exampleSalaryData}
          title="Error Example"
          error="Network connection failed. Please check your internet connection and try again."
        />
      </section>

      {/* Code Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Usage Examples</h2>
        <div className="space-y-4">
          <div className="mockup-code">
            <pre data-prefix="$">
              <code>npm install recharts date-fns</code>
            </pre>
          </div>

          <div className="mockup-code">
            <pre data-prefix="1">
              <code>
                import {'{'} SalaryVisualizationChart {'}'} from
                '@/components/SalaryVisualizationChart';
              </code>
            </pre>
            <pre data-prefix="2">
              <code />
            </pre>
            <pre data-prefix="3">
              <code>// Basic usage</code>
            </pre>
            <pre data-prefix="4">
              <code>&lt;SalaryVisualizationChart</code>
            </pre>
            <pre data-prefix="5">
              <code>
                {' '}
                data={'{'}salaryData{'}'}
              </code>
            </pre>
            <pre data-prefix="6">
              <code>
                {' '}
                statistics={'{'}statistics{'}'}
              </code>
            </pre>
            <pre data-prefix="7">
              <code> title="Salary Analysis"</code>
            </pre>
            <pre data-prefix="8">
              <code> chartType="bar"</code>
            </pre>
            <pre data-prefix="9">
              <code>/&gt;</code>
            </pre>
          </div>

          <div className="mockup-code">
            <pre data-prefix="1">
              <code>// Interactive example</code>
            </pre>
            <pre data-prefix="2">
              <code>&lt;SalaryVisualizationChart</code>
            </pre>
            <pre data-prefix="3">
              <code>
                {' '}
                data={'{'}salaryData{'}'}
              </code>
            </pre>
            <pre data-prefix="4">
              <code>
                {' '}
                chartType={'{'}chartType{'}'}
              </code>
            </pre>
            <pre data-prefix="5">
              <code>
                {' '}
                loading={'{'}loading{'}'}
              </code>
            </pre>
            <pre data-prefix="6">
              <code>
                {' '}
                onChartTypeChange={'{'}setChartType{'}'}
              </code>
            </pre>
            <pre data-prefix="7">
              <code>
                {' '}
                colorScheme={'{'}['#FF6B6B', '#4ECDC4']{'}'}
              </code>
            </pre>
            <pre data-prefix="8">
              <code>/&gt;</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            '📊 Multiple chart types (Bar, Line, Area, Pie, Composed)',
            '🎨 Customizable color schemes',
            '📱 Fully responsive design',
            '♿ WCAG 2.1 AA accessibility compliance',
            '🔄 Interactive chart type switching',
            '💰 Multi-currency support',
            '📈 Statistics summary display',
            '🔍 Interactive tooltips',
            '⚡ Performance optimized',
            '🎯 TypeScript support',
            '🧪 Comprehensive test coverage',
            '📚 Detailed documentation',
          ].map((feature, index) => (
            <div key={index} className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <p className="text-sm">{feature}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SalaryVisualizationChartExample;
