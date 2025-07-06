import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import type React from 'react';
import type { SalaryDataPoint, SalaryStatistics } from '@/services/salaryDataService';
import type { SalaryVisualizationChartProps } from '../SalaryVisualizationChart';
import { SalaryVisualizationChart } from '../SalaryVisualizationChart';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Recharts components to avoid canvas rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composed-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock date-fns format function
jest.mock('date-fns', () => ({
  format: jest.fn((date: Date, _formatStr: string) => {
    return new Date(date).toLocaleDateString();
  }),
}));

// Test data
const mockSalaryData: SalaryDataPoint[] = [
  {
    id: 'test-1',
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
    source: 'test-source',
    verified: true,
  },
  {
    id: 'test-2',
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
    source: 'test-source',
    verified: true,
  },
  {
    id: 'test-3',
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
    source: 'test-source',
    verified: false,
  },
];

const mockStatistics: SalaryStatistics = {
  count: 3,
  median: 160000,
  mean: 166667,
  min: 130000,
  max: 220000,
  percentile25: 140000,
  percentile75: 200000,
  percentile90: 210000,
  standardDeviation: 36515,
  currency: 'USD',
  lastUpdated: '2024-01-17T12:00:00Z',
};

// Default props for testing
const defaultProps: SalaryVisualizationChartProps = {
  data: mockSalaryData,
  statistics: mockStatistics,
  chartType: 'bar',
  title: 'Test Salary Chart',
};

describe('SalaryVisualizationChart', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<SalaryVisualizationChart {...defaultProps} />);
      expect(screen.getByText('Test Salary Chart')).toBeInTheDocument();
    });

    it('renders with default props when minimal props provided', () => {
      render(<SalaryVisualizationChart data={mockSalaryData} />);
      expect(screen.getByText('Salary Visualization')).toBeInTheDocument();
    });

    it('displays chart title correctly', () => {
      const customTitle = 'Custom Salary Analysis';
      render(<SalaryVisualizationChart {...defaultProps} title={customTitle} />);
      expect(screen.getByText(customTitle)).toBeInTheDocument();
    });

    it('renders statistics summary when statistics provided', () => {
      render(<SalaryVisualizationChart {...defaultProps} />);

      expect(screen.getByText('Count')).toBeInTheDocument();
      expect(screen.getByText('Median')).toBeInTheDocument();
      expect(screen.getByText('Average')).toBeInTheDocument();
      expect(screen.getByText('Min')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('75th %ile')).toBeInTheDocument();
    });

    it('does not render statistics summary when statistics not provided', () => {
      render(<SalaryVisualizationChart data={mockSalaryData} />);

      expect(screen.queryByText('Count')).not.toBeInTheDocument();
      expect(screen.queryByText('Median')).not.toBeInTheDocument();
    });

    it('renders metadata when showMetadata is true', () => {
      render(<SalaryVisualizationChart {...defaultProps} showMetadata={true} />);

      expect(screen.getByText(/Data Points: 3/)).toBeInTheDocument();
      expect(screen.getByText(/Currency: USD/)).toBeInTheDocument();
      expect(screen.getByText(/Source: test-source/)).toBeInTheDocument();
    });

    it('does not render metadata when showMetadata is false', () => {
      render(<SalaryVisualizationChart {...defaultProps} showMetadata={false} />);

      expect(screen.queryByText(/Data Points:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Currency:/)).not.toBeInTheDocument();
    });
  });

  describe('Chart Types', () => {
    it('renders bar chart by default', () => {
      render(<SalaryVisualizationChart {...defaultProps} chartType="bar" />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('renders line chart when chartType is line', () => {
      render(<SalaryVisualizationChart {...defaultProps} chartType="line" />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('renders area chart when chartType is area', () => {
      render(<SalaryVisualizationChart {...defaultProps} chartType="area" />);
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('renders pie chart when chartType is pie', () => {
      render(<SalaryVisualizationChart {...defaultProps} chartType="pie" />);
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('renders composed chart when chartType is composed', () => {
      render(<SalaryVisualizationChart {...defaultProps} chartType="composed" />);
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });
  });

  describe('Chart Type Selector', () => {
    it('renders chart type selector buttons', () => {
      render(<SalaryVisualizationChart {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Switch to Bar Chart/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch to Line Chart/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch to Area Chart/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch to Pie Chart/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch to Combined/ })).toBeInTheDocument();
    });

    it('highlights current chart type button', () => {
      render(<SalaryVisualizationChart {...defaultProps} chartType="bar" />);

      const barButton = screen.getByRole('button', { name: /Switch to Bar Chart/ });
      expect(barButton).toHaveClass('btn-primary');
    });

    it('calls onChartTypeChange when chart type button is clicked', async () => {
      const user = userEvent.setup();
      const onChartTypeChange = jest.fn();

      render(<SalaryVisualizationChart {...defaultProps} onChartTypeChange={onChartTypeChange} />);

      const lineButton = screen.getByRole('button', { name: /Switch to Line Chart/ });
      await user.click(lineButton);

      expect(onChartTypeChange).toHaveBeenCalledWith('line');
    });

    it('changes chart type when button is clicked', async () => {
      const user = userEvent.setup();

      render(<SalaryVisualizationChart {...defaultProps} chartType="bar" />);

      // Initially shows bar chart
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

      // Click line chart button
      const lineButton = screen.getByRole('button', { name: /Switch to Line Chart/ });
      await user.click(lineButton);

      // Should now show line chart
      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });

    it('disables chart type buttons when loading', () => {
      render(<SalaryVisualizationChart {...defaultProps} loading={true} />);

      // When loading, chart type selector is not rendered
      expect(screen.queryByRole('button', { name: /Switch to/ })).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays loading spinner when loading is true', () => {
      render(<SalaryVisualizationChart {...defaultProps} loading={true} />);

      expect(screen.getByText('Loading salary data...')).toBeInTheDocument();
      // Check for loading spinner by class instead of role
      expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
    });

    it('does not display chart when loading', () => {
      render(<SalaryVisualizationChart {...defaultProps} loading={true} />);

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when error prop is provided', () => {
      const errorMessage = 'Failed to load salary data';
      render(<SalaryVisualizationChart {...defaultProps} error={errorMessage} />);

      expect(screen.getByText('Error loading chart data')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('does not display chart when error occurs', () => {
      render(<SalaryVisualizationChart {...defaultProps} error="Test error" />);

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
  });

  describe('Empty Data State', () => {
    it('displays no data message when data array is empty', () => {
      render(<SalaryVisualizationChart {...defaultProps} data={[]} />);

      expect(screen.getByText('No data available to display')).toBeInTheDocument();
    });

    it('displays no data message when data is undefined', () => {
      render(<SalaryVisualizationChart {...defaultProps} data={undefined as any} />);

      expect(screen.getByText('No data available to display')).toBeInTheDocument();
    });
  });

  describe('Currency Formatting', () => {
    it('formats currency values correctly in statistics', () => {
      render(<SalaryVisualizationChart {...defaultProps} currency="USD" />);

      // Check if currency formatting is applied (should contain $ symbol)
      expect(screen.getByText(/\$160,000/)).toBeInTheDocument(); // Median
      expect(screen.getByText(/\$166,667/)).toBeInTheDocument(); // Average
    });

    it('uses custom currency when provided', () => {
      render(<SalaryVisualizationChart {...defaultProps} currency="EUR" />);

      // Should display EUR currency in metadata
      expect(screen.getByText(/Currency: EUR/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies custom className when provided', () => {
      const customClass = 'custom-chart-class';
      const { container } = render(
        <SalaryVisualizationChart {...defaultProps} className={customClass} />
      );

      expect(container.firstChild).toHaveClass(customClass);
    });

    it('uses custom height when provided', () => {
      render(<SalaryVisualizationChart {...defaultProps} height={600} />);

      // ResponsiveContainer should be rendered (mocked)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for chart', () => {
      render(<SalaryVisualizationChart {...defaultProps} />);

      const chartContainer = screen.getByRole('img');
      expect(chartContainer).toHaveAttribute('aria-label', 'Test Salary Chart - bar chart');
    });

    it('has proper button labels for chart type selector', () => {
      render(<SalaryVisualizationChart {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Switch to Bar Chart/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch to Line Chart/ })).toBeInTheDocument();
    });

    it('should not have accessibility violations', async () => {
      const { container } = render(<SalaryVisualizationChart {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations in loading state', async () => {
      const { container } = render(<SalaryVisualizationChart {...defaultProps} loading={true} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations in error state', async () => {
      const { container } = render(
        <SalaryVisualizationChart {...defaultProps} error="Test error" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Data Processing', () => {
    it('processes data correctly for different chart types', async () => {
      const user = userEvent.setup();

      render(<SalaryVisualizationChart {...defaultProps} />);

      // Test bar chart (default)
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

      // Switch to pie chart
      const pieButton = screen.getByRole('button', { name: /Switch to Pie Chart/ });
      await user.click(pieButton);

      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
    });

    it('handles data with missing optional fields', () => {
      const dataWithMissingFields: SalaryDataPoint[] = [
        {
          ...mockSalaryData[0]!,
          bonus: 0,
          equity: 0,
          benefits: [],
        },
      ];

      render(<SalaryVisualizationChart data={dataWithMissingFields} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with large datasets', () => {
      // Create a large dataset
      const largeDataset: SalaryDataPoint[] = Array.from({ length: 1000 }, (_, index) => ({
        ...mockSalaryData[0]!,
        id: `test-${index}`,
        baseSalary: 100000 + index * 1000,
        totalCompensation: 150000 + index * 1500,
        jobTitle: `Job Title ${index}`,
      }));

      const startTime = performance.now();
      render(<SalaryVisualizationChart data={largeDataset} />);
      const endTime = performance.now();

      // Should render within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Integration', () => {
    it('works correctly with all props combined', () => {
      const onChartTypeChange = jest.fn();

      render(
        <SalaryVisualizationChart
          data={mockSalaryData}
          statistics={mockStatistics}
          chartType="line"
          title="Integration Test Chart"
          height={500}
          showMetadata={true}
          loading={false}
          error={undefined}
          colorScheme={['#FF0000', '#00FF00', '#0000FF']}
          showTooltips={true}
          showLegend={true}
          currency="EUR"
          onChartTypeChange={onChartTypeChange}
          className="integration-test-class"
        />
      );

      expect(screen.getByText('Integration Test Chart')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByText(/Currency: EUR/)).toBeInTheDocument();
    });
  });
});
