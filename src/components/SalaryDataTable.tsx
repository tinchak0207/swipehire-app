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
    className: 'font-medium text-base-content',
  },
  {
    key: 'industry',
    label: 'Industry',
    sortable: true,
  },
  {
    key: 'region',
    label: 'Region',
    sortable: true,
  },
  {
    key: 'experienceLevel',
    label: 'Experience',
    sortable: true,
    formatter: (value) => formatExperienceLevel(value as string),
  },
  {
    key: 'education',
    label: 'Education',
    sortable: true,
    formatter: (value) => formatEducation(value as string),
  },
  {
    key: 'companySize',
    label: 'Company Size',
    sortable: true,
    formatter: (value) => formatCompanySize(value as string),
  },
  {
    key: 'baseSalary',
    label: 'Base Salary',
    sortable: true,
    formatter: (value, row) => formatCurrency(value as number, row.currency),
    className: 'text-right font-mono',
    headerClassName: 'text-right',
  },
  {
    key: 'totalCompensation',
    label: 'Total Comp',
    sortable: true,
    formatter: (value, row) => formatCurrency(value as number, row.currency),
    className: 'text-right font-mono font-semibold',
    headerClassName: 'text-right',
  },
  {
    key: 'timestamp',
    label: 'Date',
    sortable: true,
    formatter: (value) => formatDate(value as string),
    className: 'text-sm text-base-content/70',
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
    <div className="mb-4 rounded-lg border bg-base-100 p-4">
      <h3 className="mb-3 font-semibold text-lg">Statistics Summary</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <div className="stat">
          <div className="stat-title text-xs">Count</div>
          <div className="stat-value text-lg">{filteredCount.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="stat-title text-xs">Median</div>
          <div className="stat-value text-lg">
            {formatCurrency(statistics.median, statistics.currency)}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-xs">Average</div>
          <div className="stat-value text-lg">
            {formatCurrency(statistics.mean, statistics.currency)}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-xs">Min</div>
          <div className="stat-value text-lg">
            {formatCurrency(statistics.min, statistics.currency)}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-xs">Max</div>
          <div className="stat-value text-lg">
            {formatCurrency(statistics.max, statistics.currency)}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-xs">75th %ile</div>
          <div className="stat-value text-lg">
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
      <div className={`card bg-base-100 shadow-xl ${className}`}>
        <div className="card-body">
          <div className="flex items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
            <span className="ml-3 text-lg">Loading salary data...</span>
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
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Error loading salary data</h3>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={`card bg-base-100 shadow-xl ${className}`}>
        <div className="card-body">
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="mb-4 h-16 w-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mb-2 font-semibold text-white text-xl">No Data Available</h3>
            <p className="text-white">{emptyStateMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-xl ${className}`}>
      <div className="card-body">
        <div className="card-title mb-6">
          <h2 className="text-2xl">Salary Data Table</h2>
          <div className="badge badge-primary">{sortedData.length} records</div>
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
        <div className="overflow-x-auto">
          <table
            id={tableId}
            className="table-zebra table-pin-rows table"
            aria-label="Salary data table"
          >
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`${column.headerClassName || ''} ${
                      enableSorting && column.sortable ? 'cursor-pointer hover:bg-base-200' : ''
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
            <tbody>
              {paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-base-200' : ''} ${
                    row.verified ? '' : 'opacity-75'
                  }`}
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
                    <td key={column.key} className={column.className || ''}>
                      {column.formatter
                        ? column.formatter(row[column.key as keyof SalaryDataPoint], row)
                        : String(row[column.key as keyof SalaryDataPoint] || '')}
                      {column.key === 'jobTitle' && !row.verified && (
                        <div className="badge badge-ghost badge-xs ml-2">Unverified</div>
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
            <div className="join">
              <button
                type="button"
                className="join-item btn btn-sm"
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
                    className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-active' : ''}`}
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
                className="join-item btn btn-sm"
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
        <div className="mt-4 text-center text-base-content/70 text-sm">
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
