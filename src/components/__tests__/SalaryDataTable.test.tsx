import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import type { SalaryDataPoint, SalaryStatistics } from '@/services/salaryDataService';
import { SalaryDataTable } from '../SalaryDataTable';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock data
const mockSalaryData: SalaryDataPoint[] = [
  {
    id: '1',
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
    timestamp: '2024-01-15T10:30:00Z',
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
    baseSalary: 140000,
    totalCompensation: 190000,
    bonus: 25000,
    equity: 25000,
    benefits: ['Health Insurance', '401k'],
    currency: 'USD',
    timestamp: '2024-01-14T14:20:00Z',
    source: 'user_contribution',
    verified: true,
  },
  {
    id: '3',
    jobTitle: 'Data Scientist',
    industry: 'Finance',
    region: 'Chicago, IL',
    experienceLevel: 'entry',
    education: 'master',
    companySize: 'large',
    baseSalary: 110000,
    totalCompensation: 140000,
    bonus: 15000,
    equity: 15000,
    benefits: ['Health Insurance'],
    currency: 'USD',
    timestamp: '2024-01-13T09:15:00Z',
    source: 'api_scraping',
    verified: false,
  },
];

const mockStatistics: SalaryStatistics = {
  count: 3,
  median: 140000,
  mean: 170000,
  min: 140000,
  max: 190000,
  percentile25: 140000,
  percentile75: 180000,
  percentile90: 190000,
  standardDeviation: 25000,
  currency: 'USD',
  lastUpdated: '2024-01-15T12:00:00Z',
};

describe('SalaryDataTable', () => {
  const defaultProps = {
    data: mockSalaryData,
    statistics: mockStatistics,
  };

  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the table with data correctly', () => {
      render(<SalaryDataTable {...defaultProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Salary Data Table')).toBeInTheDocument();
      expect(screen.getByText('3 records')).toBeInTheDocument();

      // Check if data rows are rendered
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Product Manager')).toBeInTheDocument();
      expect(screen.getByText('Data Scientist')).toBeInTheDocument();
    });

    it('renders statistics summary when showStatistics is true', () => {
      render(<SalaryDataTable {...defaultProps} showStatistics={true} />);

      expect(screen.getByText('Statistics Summary')).toBeInTheDocument();
      // $140,000 appears in statistics (median, min) and in table data
      expect(screen.getAllByText('$140,000').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('$170,000')).toBeInTheDocument(); // Mean
    });

    it('hides statistics summary when showStatistics is false', () => {
      render(<SalaryDataTable {...defaultProps} showStatistics={false} />);

      expect(screen.queryByText('Statistics Summary')).not.toBeInTheDocument();
    });

    it('renders filter bar when enableFiltering is true', () => {
      render(<SalaryDataTable {...defaultProps} enableFiltering={true} />);

      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Filter by job title...')).toBeInTheDocument();
    });

    it('hides filter bar when enableFiltering is false', () => {
      render(<SalaryDataTable {...defaultProps} enableFiltering={false} />);

      expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<SalaryDataTable {...defaultProps} className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Loading and Error States', () => {
    it('renders loading state correctly', () => {
      render(<SalaryDataTable {...defaultProps} loading={true} />);

      expect(screen.getByText('Loading salary data...')).toBeInTheDocument();
      expect(screen.getByText('Loading salary data...')).toBeInTheDocument();
    });

    it('renders error state correctly', () => {
      const errorMessage = 'Failed to load data';
      render(<SalaryDataTable {...defaultProps} error={errorMessage} />);

      expect(screen.getByText('Error loading salary data')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('renders empty state when no data provided', () => {
      render(<SalaryDataTable data={[]} statistics={undefined} />);

      expect(screen.getByText('No Data Available')).toBeInTheDocument();
      expect(screen.getByText('No salary data available')).toBeInTheDocument();
    });

    it('renders custom empty state message', () => {
      const customMessage = 'Custom empty message';
      render(<SalaryDataTable data={[]} statistics={undefined} emptyStateMessage={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('sorts data by column when header is clicked', async () => {
      const user = userEvent.setup();
      render(<SalaryDataTable {...defaultProps} enableSorting={true} />);

      const jobTitleHeader = screen.getByRole('columnheader', { name: /job title/i });
      await user.click(jobTitleHeader);

      // Check if data is sorted alphabetically
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Data Scientist'); // First data row after header
    });

    it('toggles sort direction on repeated clicks', async () => {
      const user = userEvent.setup();
      render(<SalaryDataTable {...defaultProps} enableSorting={true} />);

      const salaryHeader = screen.getByRole('columnheader', { name: /total comp/i });

      // First click - ascending
      await user.click(salaryHeader);
      expect(salaryHeader).toHaveAttribute('aria-sort', 'ascending');

      // Second click - descending
      await user.click(salaryHeader);
      expect(salaryHeader).toHaveAttribute('aria-sort', 'descending');
    });

    it('disables sorting when enableSorting is false', async () => {
      const user = userEvent.setup();
      render(<SalaryDataTable {...defaultProps} enableSorting={false} />);

      const jobTitleHeader = screen.getByRole('columnheader', { name: /job title/i });
      expect(jobTitleHeader).not.toHaveClass('cursor-pointer');

      await user.click(jobTitleHeader);
      expect(jobTitleHeader).toHaveAttribute('aria-sort', 'none');
    });

    it('supports keyboard navigation for sorting', async () => {
      const user = userEvent.setup();
      render(<SalaryDataTable {...defaultProps} enableSorting={true} />);

      const jobTitleHeader = screen.getByRole('columnheader', { name: /job title/i });
      jobTitleHeader.focus();

      await user.keyboard('{Enter}');
      expect(jobTitleHeader).toHaveAttribute('aria-sort', 'ascending');

      await user.keyboard(' ');
      expect(jobTitleHeader).toHaveAttribute('aria-sort', 'descending');
    });
  });

  describe('Filtering Functionality', () => {
    it('filters data by job title', async () => {
      const user = userEvent.setup();
      render(<SalaryDataTable {...defaultProps} enableFiltering={true} />);

      const jobTitleFilter = screen.getByPlaceholderText('Filter by job title...');
      await user.type(jobTitleFilter, 'Software');

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        expect(screen.queryByText('Product Manager')).not.toBeInTheDocument();
        expect(screen.queryByText('Data Scientist')).not.toBeInTheDocument();
      });
    });

    it('filters data by experience level', async () => {
      const user = userEvent.setup();
      render(<SalaryDataTable {...defaultProps} enableFiltering={true} />);

      const experienceFilter = screen.getByDisplayValue('All Levels');
      await user.selectOptions(experienceFilter, 'senior');

      await waitFor(() => {
        expect(screen.getByText('Product Manager')).toBeInTheDocument();
        expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
        expect(screen.queryByText('Data Scientist')).not.toBeInTheDocument();
      });
    });

    it('filters data by salary range', async () => {
      const user = userEvent.setup();
      render(<SalaryDataTable {...defaultProps} enableFiltering={true} />);

      const minSalaryFilter = screen.getByPlaceholderText('Min salary...');
      await user.type(minSalaryFilter, '150000');

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        expect(screen.getByText('Product Manager')).toBeInTheDocument();
        expect(screen.queryByText('Data Scientist')).not.toBeInTheDocument();
      });
    });

    it('clears all filters when Clear All button is clicked', async () => {
      const user = userEvent.setup();
      render(<SalaryDataTable {...defaultProps} enableFiltering={true} />);

      // Apply a filter
      const jobTitleFilter = screen.getByPlaceholderText('Filter by job title...');
      await user.type(jobTitleFilter, 'Software');

      // Clear filters
      const clearButton = screen.getByText('Clear All');
      await user.click(clearButton);

      await waitFor(() => {
        expect(jobTitleFilter).toHaveValue('');
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        expect(screen.getByText('Product Manager')).toBeInTheDocument();
        expect(screen.getByText('Data Scientist')).toBeInTheDocument();
      });
    });

    it('updates record count when filters are applied', async () => {
      const user = userEvent.setup();
      render(<SalaryDataTable {...defaultProps} enableFiltering={true} />);

      expect(screen.getByText('3 records')).toBeInTheDocument();

      const jobTitleFilter = screen.getByPlaceholderText('Filter by job title...');
      await user.type(jobTitleFilter, 'Software');

      await waitFor(() => {
        expect(screen.getByText('1 records')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    const largeMockData: SalaryDataPoint[] = Array.from({ length: 25 }, (_, i) => ({
      ...mockSalaryData[0]!,
      id: `item-${i}`,
      jobTitle: `Job Title ${i}`,
    }));

    it('paginates data correctly', () => {
      render(<SalaryDataTable data={largeMockData} statistics={mockStatistics} pageSize={10} />);

      // Should show pagination controls
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();

      // Should show correct page info
      expect(screen.getByText(/Showing 1 to 10 of 25 entries/)).toBeInTheDocument();
    });

    it('navigates between pages', async () => {
      const user = userEvent.setup();
      render(<SalaryDataTable data={largeMockData} statistics={mockStatistics} pageSize={10} />);

      const nextButton = screen.getByLabelText('Next page');
      await user.click(nextButton);

      expect(screen.getByText(/Showing 11 to 20 of 25 entries/)).toBeInTheDocument();
    });

    it('disables navigation buttons appropriately', () => {
      render(<SalaryDataTable data={largeMockData} statistics={mockStatistics} pageSize={10} />);

      const prevButton = screen.getByLabelText('Previous page');
      expect(prevButton).toBeDisabled();
    });
  });

  describe('Row Interaction', () => {
    it('calls onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      const mockOnRowClick = jest.fn();
      render(<SalaryDataTable {...defaultProps} onRowClick={mockOnRowClick} />);

      const firstRow = screen.getAllByRole('row')[1]; // Skip header row
      if (!firstRow) throw new Error('First row not found');
      await user.click(firstRow);

      expect(mockOnRowClick).toHaveBeenCalledTimes(1);
      expect(mockOnRowClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          jobTitle: expect.any(String),
          industry: expect.any(String),
        })
      );
    });

    it('supports keyboard navigation for row selection', async () => {
      const user = userEvent.setup();
      const mockOnRowClick = jest.fn();
      render(<SalaryDataTable {...defaultProps} onRowClick={mockOnRowClick} />);

      const firstRow = screen.getAllByRole('row')[1]; // Skip header row
      if (!firstRow) throw new Error('First row not found');
      firstRow.focus();

      await user.keyboard('{Enter}');
      expect(mockOnRowClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(mockOnRowClick).toHaveBeenCalledTimes(2);
    });

    it('does not make rows clickable when onRowClick is not provided', () => {
      render(<SalaryDataTable {...defaultProps} />);

      const firstRow = screen.getAllByRole('row')[1]; // Skip header row
      expect(firstRow).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Data Formatting', () => {
    it('formats currency values correctly', () => {
      render(<SalaryDataTable {...defaultProps} />);

      expect(screen.getAllByText('$130,000')).toHaveLength(1);
      expect(screen.getAllByText('$180,000')).toHaveLength(2); // Statistics and table
    });

    it('formats dates correctly', () => {
      render(<SalaryDataTable {...defaultProps} />);

      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 14, 2024')).toBeInTheDocument();
    });

    it('formats experience levels correctly', () => {
      render(<SalaryDataTable {...defaultProps} />);

      // Check in table cells, not filter options
      const tableCells = screen.getAllByRole('cell');
      const experienceCells = tableCells.filter(
        (cell) =>
          cell.textContent === 'Mid Level' ||
          cell.textContent === 'Senior Level' ||
          cell.textContent === 'Entry Level'
      );
      expect(experienceCells.length).toBeGreaterThan(0);
    });

    it('shows verification status', () => {
      render(<SalaryDataTable {...defaultProps} />);

      expect(screen.getByText('Unverified')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<SalaryDataTable {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA labels and roles', () => {
      render(<SalaryDataTable {...defaultProps} />);

      expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'Salary data table');
      expect(screen.getAllByRole('columnheader')).toHaveLength(9);
      expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 data rows
    });

    it('has proper sort indicators for screen readers', () => {
      render(<SalaryDataTable {...defaultProps} enableSorting={true} />);

      const headers = screen.getAllByRole('columnheader');
      headers.forEach((header) => {
        expect(header).toHaveAttribute('aria-sort');
      });
    });

    it('has proper focus management', async () => {
      const user = userEvent.setup();
      render(<SalaryDataTable {...defaultProps} enableSorting={true} />);

      // Tab through elements to reach the first sortable header
      await user.tab(); // First input
      await user.tab(); // Second input
      await user.tab(); // Third input
      await user.tab(); // First select
      await user.tab(); // Second select
      await user.tab(); // Third select
      await user.tab(); // Fourth input
      await user.tab(); // Fifth input
      await user.tab(); // First header

      const firstHeader = screen.getByRole('columnheader', { name: /job title/i });
      expect(firstHeader).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('handles large datasets efficiently', () => {
      const largeDataset: SalaryDataPoint[] = Array.from({ length: 1000 }, (_, i) => ({
        ...mockSalaryData[0]!,
        id: `large-item-${i}`,
        jobTitle: `Job ${i}`,
      }));

      const startTime = performance.now();
      render(<SalaryDataTable data={largeDataset} statistics={mockStatistics} pageSize={50} />);
      const endTime = performance.now();

      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('only renders visible rows when paginated', () => {
      const largeDataset: SalaryDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        ...mockSalaryData[0]!,
        id: `large-item-${i}`,
        jobTitle: `Job ${i}`,
      }));

      render(<SalaryDataTable data={largeDataset} statistics={mockStatistics} pageSize={10} />);

      // Should only render 10 data rows + 1 header row
      expect(screen.getAllByRole('row')).toHaveLength(11);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing optional data gracefully', () => {
      const incompleteData: SalaryDataPoint[] = [
        {
          id: '1',
          jobTitle: 'Test Job',
          industry: 'Test Industry',
          region: 'Test Region',
          experienceLevel: 'mid',
          education: 'bachelor',
          companySize: 'medium',
          baseSalary: 100000,
          totalCompensation: 120000,
          currency: 'USD',
          timestamp: '2024-01-01T00:00:00Z',
          source: 'test',
          verified: true,
          // Missing optional fields
        },
      ];

      render(<SalaryDataTable data={incompleteData} statistics={mockStatistics} />);
      expect(screen.getByText('Test Job')).toBeInTheDocument();
    });

    it('handles zero values correctly', () => {
      const zeroData: SalaryDataPoint[] = [
        {
          ...mockSalaryData[0]!,
          baseSalary: 0,
          totalCompensation: 0,
        },
      ];

      render(<SalaryDataTable data={zeroData} statistics={mockStatistics} />);
      expect(screen.getAllByText('$0')).toHaveLength(2); // Base salary and total compensation
    });

    it('handles very long text values', () => {
      const longTextData: SalaryDataPoint[] = [
        {
          ...mockSalaryData[0]!,
          jobTitle: 'Very Long Job Title That Should Be Handled Gracefully Without Breaking Layout',
          region: 'Very Long Region Name That Might Cause Layout Issues If Not Handled Properly',
        },
      ];

      render(<SalaryDataTable data={longTextData} statistics={mockStatistics} />);
      expect(screen.getByText(/Very Long Job Title/)).toBeInTheDocument();
    });
  });
});
