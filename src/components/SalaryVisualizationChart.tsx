'use client';

import { format } from 'date-fns';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SalaryDataPoint, SalaryStatistics } from '@/services/salaryDataService';

// Chart type options
export type ChartType = 'bar' | 'box' | 'line' | 'area' | 'pie' | 'composed';

// Component props interface
export interface SalaryVisualizationChartProps {
  /** Salary data points to visualize */
  data: SalaryDataPoint[];
  /** Salary statistics for additional context */
  statistics?: SalaryStatistics | undefined;
  /** Type of chart to display */
  chartType?: ChartType;
  /** Chart title */
  title?: string;
  /** Chart height in pixels */
  height?: number;
  /** Whether to show data source and timestamp */
  showMetadata?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | undefined;
  /** Custom color scheme */
  colorScheme?: string[];
  /** Whether to show interactive tooltips */
  showTooltips?: boolean;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Currency symbol for formatting */
  currency?: string;
  /** Callback when chart type changes */
  onChartTypeChange?: (chartType: ChartType) => void;
  /** Additional CSS classes */
  className?: string;
}

// Chart configuration
const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
];

const CHART_MARGIN = { top: 20, right: 30, left: 20, bottom: 5 };

// Utility functions
const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  currency?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  currency = 'USD',
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="max-w-xs rounded-lg border border-base-300 bg-base-100 p-4 shadow-lg">
      {label && <p className="mb-2 font-semibold text-base-content">{label}</p>}
      {payload.map((entry, index) => (
        <div key={index} className="mb-1 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-base-content/70 text-sm">{entry.name}:</span>
          <span className="font-medium text-base-content text-sm">
            {typeof entry.value === 'number' ? formatCurrency(entry.value, currency) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Chart type selector component
interface ChartTypeSelectorProps {
  currentType: ChartType;
  onTypeChange: (type: ChartType) => void;
  disabled?: boolean;
}

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  currentType,
  onTypeChange,
  disabled = false,
}) => {
  const chartTypes: Array<{ value: ChartType; label: string; icon: string }> = [
    { value: 'bar', label: 'Bar Chart', icon: '📊' },
    { value: 'line', label: 'Line Chart', icon: '📈' },
    { value: 'area', label: 'Area Chart', icon: '📉' },
    { value: 'pie', label: 'Pie Chart', icon: '🥧' },
    { value: 'composed', label: 'Combined', icon: '📋' },
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {chartTypes.map((type) => (
        <button
          key={type.value}
          type="button"
          className={`btn btn-sm ${currentType === type.value ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onTypeChange(type.value)}
          disabled={disabled}
          aria-label={`Switch to ${type.label}`}
        >
          <span className="mr-1" aria-hidden="true">
            {type.icon}
          </span>
          {type.label}
        </button>
      ))}
    </div>
  );
};

// Statistics summary component
interface StatisticsSummaryProps {
  statistics: SalaryStatistics;
  currency?: string;
}

const StatisticsSummary: React.FC<StatisticsSummaryProps> = ({ statistics, currency = 'USD' }) => {
  const stats = [
    { label: 'Count', value: formatNumber(statistics.count), icon: '👥' },
    { label: 'Median', value: formatCurrency(statistics.median, currency), icon: '📊' },
    { label: 'Average', value: formatCurrency(statistics.mean, currency), icon: '📈' },
    { label: 'Min', value: formatCurrency(statistics.min, currency), icon: '⬇️' },
    { label: 'Max', value: formatCurrency(statistics.max, currency), icon: '⬆️' },
    { label: '75th %ile', value: formatCurrency(statistics.percentile75, currency), icon: '📋' },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <div key={stat.label} className="stat rounded-lg bg-base-200 p-4">
          <div className="stat-figure text-2xl" aria-hidden="true">
            {stat.icon}
          </div>
          <div className="stat-title text-xs">{stat.label}</div>
          <div className="stat-value font-bold text-sm">{stat.value}</div>
        </div>
      ))}
    </div>
  );
};

// Main component
export const SalaryVisualizationChart: React.FC<SalaryVisualizationChartProps> = ({
  data,
  statistics,
  chartType = 'bar',
  title = 'Salary Visualization',
  height = 400,
  showMetadata = true,
  loading = false,
  error,
  colorScheme = DEFAULT_COLORS,
  showTooltips = true,
  showLegend = true,
  currency = 'USD',
  onChartTypeChange,
  className = '',
}) => {
  const [currentChartType, setCurrentChartType] = useState<ChartType>(chartType);

  // Handle chart type change
  const handleChartTypeChange = useCallback(
    (newType: ChartType) => {
      setCurrentChartType(newType);
      onChartTypeChange?.(newType);
    },
    [onChartTypeChange]
  );

  // Process data for different chart types
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    switch (currentChartType) {
      case 'bar':
      case 'line':
      case 'area':
        return data.map((item, index) => ({
          name: `${item.jobTitle} (${item.experienceLevel})`,
          bonus: item.bonus || 0,
          equity: item.equity || 0,
          index,
          ...item,
        }));

      case 'pie': {
        // Group by experience level for pie chart
        const experienceGroups = data.reduce(
          (acc, item) => {
            const key = item.experienceLevel;
            if (!acc[key]) {
              acc[key] = { name: key, value: 0, count: 0 };
            }
            acc[key].value += item.totalCompensation;
            acc[key].count += 1;
            return acc;
          },
          {} as Record<string, { name: string; value: number; count: number }>
        );

        return Object.values(experienceGroups).map((group) => ({
          ...group,
          value: Math.round(group.value / group.count), // Average compensation
        }));
      }

      case 'composed':
        return data.map((item, index) => ({
          name: item.jobTitle.substring(0, 10) + (item.jobTitle.length > 10 ? '...' : ''),
          bonus: item.bonus || 0,
          index,
          ...item,
        }));

      default:
        return data;
    }
  }, [data, currentChartType]);

  // Render different chart types
  const renderChart = useCallback(() => {
    if (!processedData || processedData.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center text-center">
            {/* Icon with gradient background */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            {/* Title and message */}
            <h3 className="mb-2 font-semibold text-white text-lg">No Data Available</h3>
            <p className="text-white/70 text-sm">No data available to display in chart</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: processedData,
      margin: CHART_MARGIN,
    };

    switch (currentChartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis tickFormatter={(value) => formatCurrency(value, currency)} fontSize={12} />
              {showTooltips && <Tooltip content={<CustomTooltip currency={currency} />} />}
              {showLegend && <Legend />}
              <Bar
                dataKey="baseSalary"
                name="Base Salary"
                fill={colorScheme[0]}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="totalCompensation"
                name="Total Compensation"
                fill={colorScheme[1]}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis tickFormatter={(value) => formatCurrency(value, currency)} fontSize={12} />
              {showTooltips && <Tooltip content={<CustomTooltip currency={currency} />} />}
              {showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey="baseSalary"
                name="Base Salary"
                stroke={colorScheme[0]}
                strokeWidth={2}
                dot={{ fill: colorScheme[0], strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="totalCompensation"
                name="Total Compensation"
                stroke={colorScheme[1]}
                strokeWidth={2}
                dot={{ fill: colorScheme[1], strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis tickFormatter={(value) => formatCurrency(value, currency)} fontSize={12} />
              {showTooltips && <Tooltip content={<CustomTooltip currency={currency} />} />}
              {showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey="baseSalary"
                name="Base Salary"
                stackId="1"
                stroke={colorScheme[0]}
                fill={colorScheme[0]}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="bonus"
                name="Bonus"
                stackId="1"
                stroke={colorScheme[2]}
                fill={colorScheme[2]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatCurrency(value, currency)}`}
                outerRadius={Math.min(height * 0.3, 120)}
                fill="#8884d8"
                dataKey="value"
              >
                {processedData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorScheme[index % colorScheme.length]} />
                ))}
              </Pie>
              {showTooltips && <Tooltip content={<CustomTooltip currency={currency} />} />}
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis tickFormatter={(value) => formatCurrency(value, currency)} fontSize={12} />
              {showTooltips && <Tooltip content={<CustomTooltip currency={currency} />} />}
              {showLegend && <Legend />}
              <Bar
                dataKey="baseSalary"
                name="Base Salary"
                fill={colorScheme[0]}
                radius={[2, 2, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="totalCompensation"
                name="Total Compensation"
                stroke={colorScheme[1]}
                strokeWidth={3}
                dot={{ fill: colorScheme[1], strokeWidth: 2, r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  }, [processedData, currentChartType, height, colorScheme, showTooltips, showLegend, currency]);

  // Loading state
  if (loading) {
    return (
      <div className={`card bg-base-100 shadow-xl ${className}`}>
        <div className="card-body">
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary" />
              <p className="text-base-content/70">Loading salary data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`card bg-base-100 shadow-xl ${className}`}>
        <div className="card-body">
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Error loading chart data</h3>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-xl ${className}`}>
      <div className="card-body">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="card-title text-2xl">{title}</h2>
          <ChartTypeSelector
            currentType={currentChartType}
            onTypeChange={handleChartTypeChange}
            disabled={loading}
          />
        </div>

        {/* Statistics Summary */}
        {statistics && <StatisticsSummary statistics={statistics} currency={currency} />}

        {/* Chart */}
        <div className="w-full" role="img" aria-label={`${title} - ${currentChartType} chart`}>
          {renderChart()}
        </div>

        {/* Metadata */}
        {showMetadata && data && data.length > 0 && (
          <div className="mt-6 border-base-300 border-t pt-4">
            <div className="flex flex-col gap-2 text-base-content/70 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span>📊 Data Points: {data.length}</span>
                {statistics && <span>🕒 Last Updated: {formatDate(statistics.lastUpdated)}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span>💰 Currency: {currency}</span>
                {data[0]?.source && <span>📍 Source: {data[0].source}</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryVisualizationChart;
