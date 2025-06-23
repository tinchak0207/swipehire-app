'use client';

import type React from 'react';
import { useCallback, useId, useMemo, useState } from 'react';
import type { SalaryDataPoint, SalaryStatistics } from '@/services/salaryDataService';

// TypeScript interfaces
export interface SalaryDataTableProps {
  data: SalaryDataPoint[];
  statistics: SalaryStatistics | undefined;
  loading?: boolean;
  error?: string | undefined;
  className?: string;
  showStatistics?: boolean;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  pageSize?: number;
  onRowClick?: (dataPoint: SalaryDataPoint) => void;
  emptyStateMessage?: string;
}

// Sort configuration
type SortField = keyof SalaryDataPoint | 'totalCompensation' | 'baseSalary';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Filter configuration
interface FilterConfig {
  jobTitle: string;
  industry: string;
  region: string;
  experienceLevel: string;
  education: string;
  companySize: string;
  minSalary: string;
  maxSalary: string;
}

// Column configuration
interface ColumnConfig {
  key: SortField;
  label: string;
  sortable: boolean;
  formatter?: (value: unknown, row: SalaryDataPoint) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

// Utility functions
const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

const formatExperienceLevel = (level: string): string => {
  const levelMap: Record<string, string> = {
    entry: 'Entry Level',
    mid: 'Mid Level',
    senior: 'Senior Level',
    executive: 'Executive',
  };
  return levelMap[level] || level;
};

const formatEducation = (education: string): string => {
  const educationMap: Record<string, string> = {
    high_school: 'High School',
    bachelor: "Bachelor's",
    master: "Master's",
    phd: 'PhD',
  };
  return educationMap[education] || education;
};

const formatCompanySize = (size: string): string => {
  const sizeMap: Record<string, string> = {
    startup: 'Startup',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    enterprise: 'Enterprise',
  };
  return sizeMap[size] || size;
};

// Column definitions
const getColumnConfig = (): ColumnConfig[] => [
  {
    key: 'jobTitle',
    label: 'Job Title',
    sortable: true,
    className: 'font-medium text-gray-900',
  },
  {
    key: 'industry',
    label: 'Industry',
    sortable: true,
    className: 'text-gray-800',
  },
  {
    key: 'region',
    label: 'Region',
    sortable: true,
    className: 'text-gray-800',
  },
  {
    key: 'experienceLevel',
    label: 'Experience',
    sortable: true,
    formatter: (value) => formatExperienceLevel(value as string),
    className: 'text-gray-800',
  },
  {
    key: 'education',
    label: 'Education',
    sortable: true,
    formatter: (value) => formatEducation(value as string),
    className: 'text-gray-800',
  },
  {
    key: 'companySize',
    label: 'Company Size',
    sortable: true,
    formatter: (value) => formatCompanySize(value as string),
    className: 'text-gray-800',
  },
  {
    key: 'baseSalary',
    label: 'Base Salary',
    sortable: true,
    formatter: (value, row) => formatCurrency(value as number, row.currency),
    className: 'text-right font-mono text-gray-900',
    headerClassName: 'text-right',
  },
  {
    key: 'totalCompensation',
    label: 'Total Comp',
    sortable: true,
    formatter: (value, row) => formatCurrency(value as number, row.currency),
    className: 'text-right font-mono font-semibold text-gray-900',
    headerClassName: 'text-right',
  },
  {
    key: 'timestamp',
    label: 'Date',
    sortable: true,
    formatter: (value) => formatDate(value as string),
    className: 'text-sm text-gray-600',
  },
];

// Filter component
interface FilterBarProps {
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
  disabled?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange, disabled }) => {
  const handleFilterChange = useCallback(
    (field: keyof FilterConfig, value: string) => {
      onFiltersChange({
        ...filters,
        [field]: value,
      });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    onFiltersChange({
      jobTitle: '',
      industry: '',
      region: '',
      experienceLevel: '',
      education: '',
      companySize: '',
      minSalary: '',
      maxSalary: '',
    });
  }, [onFiltersChange]);

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  return (
    <div className="mb-4 rounded-lg border border-gray-200/50 bg-white/70 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Filters</h3>
        {hasActiveFilters && (
          <button
            type="button"
            className="rounded-lg border border-gray-200/50 bg-white/60 px-3 py-1 font-medium text-gray-700 text-sm transition-all duration-200 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            onClick={clearFilters}
            disabled={disabled}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="block font-medium text-gray-700 text-sm">Job Title</label>
          <input
            type="text"
            placeholder="Filter by job title..."
            className="w-full rounded-lg border border-gray-200/50 bg-white/60 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={filters.jobTitle}
            onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700 text-sm">Industry</label>
          <input
            type="text"
            placeholder="Filter by industry..."
            className="w-full rounded-lg border border-gray-200/50 bg-white/60 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={filters.industry}
            onChange={(e) => handleFilterChange('industry', e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700 text-sm">Region</label>
          <input
            type="text"
            placeholder="Filter by region..."
            className="w-full rounded-lg border border-gray-200/50 bg-white/60 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700 text-sm">Experience Level</label>
          <select
            className="w-full rounded-lg border border-gray-200/50 bg-white/60 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={filters.experienceLevel}
            onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
            disabled={disabled}
            aria-label="Filter by experience level"
          >
            <option value="">All Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700 text-sm">Education</label>
          <select
            className="w-full rounded-lg border border-gray-200/50 bg-white/60 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={filters.education}
            onChange={(e) => handleFilterChange('education', e.target.value)}
            disabled={disabled}
            aria-label="Filter by education level"
          >
            <option value="">All Education</option>
            <option value="high_school">High School</option>
            <option value="bachelor">Bachelor's</option>
            <option value="master">Master's</option>
            <option value="phd">PhD</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700 text-sm">Company Size</label>
          <select
            className="w-full rounded-lg border border-gray-200/50 bg-white/60 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={filters.companySize}
            onChange={(e) => handleFilterChange('companySize', e.target.value)}
            disabled={disabled}
            aria-label="Filter by company size"
          >
            <option value="">All Sizes</option>
            <option value="startup">Startup</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700 text-sm">Min Salary</label>
          <input
            type="number"
            placeholder="Min salary..."
            className="w-full rounded-lg border border-gray-200/50 bg-white/60 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={filters.minSalary}
            onChange={(e) => handleFilterChange('minSalary', e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700 text-sm">Max Salary</label>
          <input
            type="number"
            placeholder="Max salary..."
            className="w-full rounded-lg border border-gray-200/50 bg-white/60 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={filters.maxSalary}
            onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

// Statistics summary component
interface StatisticsSummaryProps {
  statistics: SalaryStatistics;
  filteredCount: number;
}

const StatisticsSummary: React.FC<StatisticsSummaryProps> = ({ statistics, filteredCount }) => {
  return (
    <div className="mb-4 rounded-lg border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
      <h3 className="mb-3 font-semibold text-gray-900 text-lg">Statistics Summary</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <div className="stat">
          <div className="stat-title text-gray-600 text-xs">Count</div>
          <div className="stat-value text-gray-900 text-lg">{filteredCount.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="stat-title text-gray-600 text-xs">Median</div>
          <div className="stat-value text-gray-900 text-lg">
            {formatCurrency(statistics.median, statistics.currency)}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-gray-600 text-xs">Average</div>
          <div className="stat-value text-gray-900 text-lg">
            {formatCurrency(statistics.mean, statistics.currency)}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-gray-600 text-xs">Min</div>
          <div className="stat-value text-gray-900 text-lg">
            {formatCurrency(statistics.min, statistics.currency)}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-gray-600 text-xs">Max</div>
          <div className="stat-value text-gray-900 text-lg">
            {formatCurrency(statistics.max, statistics.currency)}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-gray-600 text-xs">75th %ile</div>
          <div className="stat-value text-gray-900 text-lg">
            {formatCurrency(statistics.percentile75, statistics.currency)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sort icon component
interface SortIconProps {
  direction: SortDirection | undefined;
  active: boolean;
}

const SortIcon: React.FC<SortIconProps> = ({ direction, active }) => {
  if (!active) {
    return (
      <svg className="h-4 w-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  }

  if (direction === 'asc') {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  }

  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
};

// Main component
export const SalaryDataTable: React.FC<SalaryDataTableProps> = ({
  data,
  statistics,
  loading = false,
  error = null,
  className = '',
  showStatistics = true,
  enableFiltering = true,
  enableSorting = true,
  pageSize = 50,
  onRowClick,
  emptyStateMessage = 'No salary data available',
}) => {
  const tableId = useId();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'totalCompensation',
    direction: 'desc',
  });
  const [filters, setFilters] = useState<FilterConfig>({
    jobTitle: '',
    industry: '',
    region: '',
    experienceLevel: '',
    education: '',
    companySize: '',
    minSalary: '',
    maxSalary: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => getColumnConfig(), []);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesJobTitle =
        !filters.jobTitle || item.jobTitle.toLowerCase().includes(filters.jobTitle.toLowerCase());
      const matchesIndustry =
        !filters.industry || item.industry.toLowerCase().includes(filters.industry.toLowerCase());
      const matchesRegion =
        !filters.region || item.region.toLowerCase().includes(filters.region.toLowerCase());
      const matchesExperience =
        !filters.experienceLevel || item.experienceLevel === filters.experienceLevel;
      const matchesEducation = !filters.education || item.education === filters.education;
      const matchesCompanySize = !filters.companySize || item.companySize === filters.companySize;
      const matchesMinSalary =
        !filters.minSalary || item.totalCompensation >= Number.parseInt(filters.minSalary, 10);
      const matchesMaxSalary =
        !filters.maxSalary || item.totalCompensation <= Number.parseInt(filters.maxSalary, 10);

      return (
        matchesJobTitle &&
        matchesIndustry &&
        matchesRegion &&
        matchesExperience &&
        matchesEducation &&
        matchesCompanySize &&
        matchesMinSalary &&
        matchesMaxSalary
      );
    });
  }, [data, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!enableSorting) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.field as keyof SalaryDataPoint];
      const bValue = b[sortConfig.field as keyof SalaryDataPoint];

      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sortConfig, enableSorting]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sorting
  const handleSort = useCallback(
    (field: SortField) => {
      if (!enableSorting) return;

      setSortConfig((prev) => ({
        field,
        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
      }));
      setCurrentPage(1);
    },
    [enableSorting]
  );

  // Handle filtering
  const handleFiltersChange = useCallback((newFilters: FilterConfig) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle row click
  const handleRowClick = useCallback(
    (dataPoint: SalaryDataPoint) => {
      if (onRowClick) {
        onRowClick(dataPoint);
      }
    },
    [onRowClick]
  );

  // Loading state
  if (loading) {
    return (
      <div
        className={`rounded-lg border border-white/20 bg-white/80 shadow-lg backdrop-blur-sm ${className}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <span className="ml-3 text-gray-900 text-lg">Loading salary data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`rounded-lg border border-red-200/50 bg-white/80 shadow-lg backdrop-blur-sm ${className}`}
      >
        <div className="p-6">
          <div className="flex items-start space-x-4 rounded-lg border border-red-200/50 bg-red-50/80 p-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold text-red-900">Error loading salary data</h3>
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div
        className={`rounded-lg border border-white/20 bg-white/80 shadow-lg backdrop-blur-sm ${className}`}
      >
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-16">
            {/* Icon with gradient background */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100/80 to-indigo-100/80 backdrop-blur-sm">
              <svg
                className="h-10 w-10 text-blue-600"
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

            {/* Title with consistent styling */}
            <h3 className="mb-3 font-bold text-gray-900 text-2xl">No Data Available</h3>

            {/* Message with improved typography */}
            <p className="mb-6 max-w-md text-center text-gray-600 leading-relaxed">
              {emptyStateMessage}
            </p>

            {/* Action suggestions */}
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex items-center gap-2 rounded-lg border border-blue-200/50 bg-blue-50/80 px-4 py-2 backdrop-blur-sm">
                <svg
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-blue-700">Try adjusting your search filters</span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-green-200/50 bg-green-50/80 px-4 py-2 backdrop-blur-sm">
                <svg
                  className="h-4 w-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="text-sm text-green-700">Broaden your search terms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-white/20 bg-white/80 shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-2xl text-gray-900">Salary Data Table</h2>
          <div className="rounded-full border border-blue-200/50 bg-blue-50/80 px-3 py-1 backdrop-blur-sm">
            <span className="font-semibold text-blue-700 text-sm">{sortedData.length} records</span>
          </div>
        </div>

        {/* Statistics Summary */}
        {showStatistics && statistics && (
          <StatisticsSummary statistics={statistics} filteredCount={sortedData.length} />
        )}

        {/* Filters */}
        {enableFiltering && (
          <FilterBar filters={filters} onFiltersChange={handleFiltersChange} disabled={loading} />
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200/50 bg-white/60 backdrop-blur-sm">
          <table id={tableId} className="w-full" aria-label="Salary data table">
            <thead className="bg-gray-50/80">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left font-semibold text-gray-900 text-xs uppercase tracking-wider ${column.headerClassName || ''} ${
                      enableSorting && column.sortable ? 'cursor-pointer hover:bg-gray-100/80' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                    role="columnheader"
                    aria-sort={
                      sortConfig.field === column.key
                        ? sortConfig.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    tabIndex={enableSorting && column.sortable ? 0 : -1}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && column.sortable) {
                        e.preventDefault();
                        handleSort(column.key);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {enableSorting && column.sortable && (
                        <SortIcon
                          direction={
                            sortConfig.field === column.key ? sortConfig.direction : undefined
                          }
                          active={sortConfig.field === column.key}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {paginatedData.map((row, index) => (
                <tr
                  key={row.id}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-blue-50/50' : ''} ${
                    row.verified ? '' : 'opacity-75'
                  } ${index % 2 === 0 ? 'bg-white/40' : 'bg-gray-50/40'}`}
                  onClick={() => handleRowClick(row)}
                  tabIndex={onRowClick ? 0 : -1}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                      e.preventDefault();
                      handleRowClick(row);
                    }
                  }}
                  aria-label={`Salary data for ${row.jobTitle} at ${row.industry}`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap text-gray-900 text-sm ${column.className || ''}`}
                    >
                      {column.formatter
                        ? column.formatter(row[column.key as keyof SalaryDataPoint], row)
                        : String(row[column.key as keyof SalaryDataPoint] || '')}
                      {column.key === 'jobTitle' && !row.verified && (
                        <span className="ml-2 inline-flex items-center rounded-full border border-gray-300/50 bg-gray-100/80 px-2 py-1 text-xs text-gray-600">
                          Unverified
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-lg border border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-sm">
              <button
                type="button"
                className="rounded-l-lg border-gray-200/50 border-r bg-white/60 px-4 py-2 font-medium text-gray-700 text-sm transition-all duration-200 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                «
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`border-gray-200/50 border-r px-4 py-2 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                      currentPage === pageNum
                        ? 'bg-blue-50/80 text-blue-700'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                    aria-label={`Page ${pageNum}`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                className="rounded-r-lg bg-white/60 px-4 py-2 font-medium text-gray-700 text-sm transition-all duration-200 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                »
              </button>
            </div>
          </div>
        )}

        {/* Table info */}
        <div className="mt-4 text-center text-gray-600 text-sm">
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          {filteredData.length !== data.length && (
            <span> (filtered from {data.length} total entries)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryDataTable;
