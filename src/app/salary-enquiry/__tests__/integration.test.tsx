import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { reportGenerationService } from '@/services/reportGenerationService';
import MarketSalaryEnquiryPage from '../page';

// Mock the services
jest.mock('@/services/reportGenerationService', () => ({
  reportGenerationService: {
    generatePDFReport: jest.fn(),
    generateCSVReport: jest.fn(),
    generateFilename: jest.fn(),
    downloadBlob: jest.fn(),
  },
}));

jest.mock('@/services/salaryDataService', () => ({
  salaryDataService: {
    querySalaryData: jest.fn(),
  },
}));

// Mock the hooks
jest.mock('@/hooks/useSalaryQuery', () => ({
  useSalaryQuery: jest.fn(),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Download: () => <div data-testid="download-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  Table: () => <div data-testid="table-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
}));

// Mock the form component
jest.mock('@/components/SalaryQueryForm', () => ({
  SalaryQueryForm: ({ onSubmitAction }: { onSubmitAction: (data: any) => void }) => (
    <div data-testid="salary-query-form">
      <button
        type="button"
        onClick={() =>
          onSubmitAction({
            jobTitle: 'Software Engineer',
            industry: 'Technology',
            region: 'San Francisco, CA',
            experience: 'mid-level',
            education: 'bachelor',
            companySize: 'large',
          })
        }
      >
        Submit Search
      </button>
    </div>
  ),
}));

// Mock the data table component
jest.mock('@/components/SalaryDataTable', () => ({
  SalaryDataTable: ({ data }: { data: any[] }) => (
    <div data-testid="salary-data-table">{data.length} salary records</div>
  ),
}));

// Mock the visualization chart component
jest.mock('@/components/SalaryVisualizationChart', () => ({
  SalaryVisualizationChart: ({ data }: { data: any[] }) => (
    <div data-testid="salary-visualization-chart">Chart with {data.length} data points</div>
  ),
}));

describe('MarketSalaryEnquiryPage Integration', () => {
  let queryClient: QueryClient;
  let mockUseSalaryQuery: jest.Mock;
  let mockReportGenerationService: jest.Mocked<typeof reportGenerationService>;

  const mockSalaryData = [
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
      benefits: ['Health Insurance', '401k'],
      currency: 'USD',
      timestamp: '2024-01-15T10:30:00Z',
      source: 'test',
      verified: true,
    },
    {
      id: 'test-2',
      jobTitle: 'Senior Software Engineer',
      industry: 'Technology',
      region: 'San Francisco, CA',
      experienceLevel: 'senior',
      education: 'master',
      companySize: 'startup',
      baseSalary: 160000,
      totalCompensation: 220000,
      bonus: 25000,
      equity: 35000,
      benefits: ['Health Insurance', '401k', 'Remote Work'],
      currency: 'USD',
      timestamp: '2024-01-16T14:20:00Z',
      source: 'test',
      verified: true,
    },
  ];

  const mockStatistics = {
    count: 2,
    median: 145000,
    mean: 145000,
    min: 130000,
    max: 160000,
    percentile25: 137500,
    percentile75: 152500,
    percentile90: 158000,
    standardDeviation: 15000,
    currency: 'USD',
    lastUpdated: '2024-01-16T15:00:00Z',
  };

  const mockMetadata = {
    totalCount: 2,
    page: 1,
    pageSize: 20,
    hasMore: false,
    queryId: 'test-query',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock the useSalaryQuery hook
    mockUseSalaryQuery = require('@/hooks/useSalaryQuery').useSalaryQuery;
    mockUseSalaryQuery.mockReturnValue({
      data: {
        data: mockSalaryData,
        statistics: mockStatistics,
        metadata: mockMetadata,
      },
      salaryData: mockSalaryData,
      statistics: mockStatistics,
      metadata: mockMetadata,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
    });

    // Mock the report generation service
    mockReportGenerationService = reportGenerationService as jest.Mocked<
      typeof reportGenerationService
    >;
    mockReportGenerationService.generatePDFReport.mockResolvedValue(
      new Blob(['pdf content'], { type: 'application/pdf' })
    );
    mockReportGenerationService.generateCSVReport.mockResolvedValue(
      new Blob(['csv content'], { type: 'text/csv' })
    );
    mockReportGenerationService.generateFilename.mockReturnValue('test-report.pdf');
    mockReportGenerationService.downloadBlob.mockImplementation(() => {});

    jest.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  describe('Initial Page Load', () => {
    it('should render the page with all main sections', () => {
      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      expect(screen.getByText('Market Salary Enquiry')).toBeInTheDocument();
      expect(screen.getByTestId('salary-query-form')).toBeInTheDocument();
      expect(screen.getByText('How It Works')).toBeInTheDocument();
      expect(screen.getByText('Why Use Our Salary Data?')).toBeInTheDocument();
    });

    it('should not show results section initially', () => {
      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      expect(screen.queryByText('Search Results for:')).not.toBeInTheDocument();
      expect(screen.queryByTestId('salary-data-table')).not.toBeInTheDocument();
      expect(screen.queryByTestId('salary-visualization-chart')).not.toBeInTheDocument();
    });

    it('should not show download button initially', () => {
      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      expect(screen.queryByText('Download Report')).not.toBeInTheDocument();
    });
  });

  describe('Search Flow', () => {
    it('should show results after form submission', async () => {
      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      const submitButton = screen.getByText('Submit Search');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Search Results for:/)).toBeInTheDocument();
        expect(screen.getByTestId('salary-data-table')).toBeInTheDocument();
        expect(screen.getByTestId('salary-visualization-chart')).toBeInTheDocument();
      });
    });

    it('should show download button after search', async () => {
      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      const submitButton = screen.getByText('Submit Search');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Download Report')).toBeInTheDocument();
      });
    });

    it('should display search summary correctly', async () => {
      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      const submitButton = screen.getByText('Submit Search');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Software Engineer.*in Technology.*in San Francisco, CA.*\(mid level\)/)
        ).toBeInTheDocument();
      });
    });

    it('should display statistics correctly', async () => {
      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      const submitButton = screen.getByText('Submit Search');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Found 2 salary records')).toBeInTheDocument();
        expect(screen.getByText(/Median: \$145,000/)).toBeInTheDocument();
      });
    });
  });

  describe('Download Functionality', () => {
    beforeEach(async () => {
      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      const submitButton = screen.getByText('Submit Search');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Download Report')).toBeInTheDocument();
      });
    });

    it('should open dropdown when download button is clicked', async () => {
      const user = userEvent.setup();
      const downloadButton = screen.getByText('Download Report');

      await user.click(downloadButton);

      expect(screen.getByText('Download PDF')).toBeInTheDocument();
      expect(screen.getByText('Download CSV')).toBeInTheDocument();
      expect(screen.getByText('2 records available')).toBeInTheDocument();
    });

    it('should trigger PDF download when PDF option is selected', async () => {
      const user = userEvent.setup();
      const downloadButton = screen.getByText('Download Report');

      await user.click(downloadButton);

      const pdfOption = screen.getByText('Download PDF');
      await user.click(pdfOption);

      await waitFor(() => {
        expect(mockReportGenerationService.generatePDFReport).toHaveBeenCalledWith(
          expect.objectContaining({
            salaryData: mockSalaryData,
            statistics: mockStatistics,
            searchCriteria: expect.objectContaining({
              jobTitle: 'Software Engineer',
              industry: 'Technology',
              region: 'San Francisco, CA',
            }),
          }),
          {}
        );
        expect(mockReportGenerationService.downloadBlob).toHaveBeenCalled();
      });
    });

    it('should trigger CSV download when CSV option is selected', async () => {
      const user = userEvent.setup();
      const downloadButton = screen.getByText('Download Report');

      await user.click(downloadButton);

      const csvOption = screen.getByText('Download CSV');
      await user.click(csvOption);

      await waitFor(() => {
        expect(mockReportGenerationService.generateCSVReport).toHaveBeenCalledWith(
          expect.objectContaining({
            salaryData: mockSalaryData,
            statistics: mockStatistics,
            searchCriteria: expect.objectContaining({
              jobTitle: 'Software Engineer',
              industry: 'Technology',
              region: 'San Francisco, CA',
            }),
          }),
          {}
        );
        expect(mockReportGenerationService.downloadBlob).toHaveBeenCalled();
      });
    });

    it('should show loading state during download', async () => {
      const user = userEvent.setup();

      // Make PDF generation take some time
      mockReportGenerationService.generatePDFReport.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(new Blob()), 100))
      );

      const downloadButton = screen.getByText('Download Report');
      await user.click(downloadButton);

      const pdfOption = screen.getByText('Download PDF');
      await user.click(pdfOption);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Generating PDF...')).toBeInTheDocument();
      });

      // Wait for completion
      await waitFor(
        () => {
          expect(screen.getByText('Download Report')).toBeInTheDocument();
        },
        { timeout: 200 }
      );
    });

    it('should handle download errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockReportGenerationService.generatePDFReport.mockRejectedValue(
        new Error('PDF generation failed')
      );

      const downloadButton = screen.getByText('Download Report');
      await user.click(downloadButton);

      const pdfOption = screen.getByText('Download PDF');
      await user.click(pdfOption);

      await waitFor(() => {
        expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('should show loading overlay during initial search', () => {
      mockUseSalaryQuery.mockReturnValue({
        data: null,
        salaryData: null,
        statistics: null,
        metadata: null,
        isLoading: true,
        isFetching: false,
        error: null,
        refetch: jest.fn(),
      });

      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      const submitButton = screen.getByText('Submit Search');
      fireEvent.click(submitButton);

      expect(screen.getByText('Searching Salary Data')).toBeInTheDocument();
      expect(
        screen.getByText('Please wait while we gather the latest compensation information...')
      ).toBeInTheDocument();
    });

    it('should disable download button during data fetching', async () => {
      mockUseSalaryQuery.mockReturnValue({
        data: {
          data: mockSalaryData,
          statistics: mockStatistics,
          metadata: mockMetadata,
        },
        salaryData: mockSalaryData,
        statistics: mockStatistics,
        metadata: mockMetadata,
        isLoading: false,
        isFetching: true,
        error: null,
        refetch: jest.fn(),
      });

      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      const submitButton = screen.getByText('Submit Search');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const downloadButton = screen.getByText('Download Report');
        expect(downloadButton).toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error state when query fails', async () => {
      mockUseSalaryQuery.mockReturnValue({
        data: null,
        salaryData: null,
        statistics: null,
        metadata: null,
        isLoading: false,
        isFetching: false,
        error: new Error('Failed to fetch salary data'),
        refetch: jest.fn(),
      });

      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      const submitButton = screen.getByText('Submit Search');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Salary Data')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch salary data')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      const mockRefetch = jest.fn();

      mockUseSalaryQuery.mockReturnValue({
        data: null,
        salaryData: null,
        statistics: null,
        metadata: null,
        isLoading: false,
        isFetching: false,
        error: new Error('Failed to fetch salary data'),
        refetch: mockRefetch,
      });

      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      const submitButton = screen.getByText('Submit Search');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const retryButton = screen.getByText('Try Again');
        fireEvent.click(retryButton);
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      expect(
        screen.getByRole('heading', { level: 1, name: 'Market Salary Enquiry' })
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'How It Works' })).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: 'Why Use Our Salary Data?' })
      ).toBeInTheDocument();
    });

    it('should have proper ARIA labels and sections', () => {
      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      expect(screen.getByLabelText('Salary Search Form')).toBeInTheDocument();
    });

    it('should have proper loading indicators with ARIA labels', () => {
      mockUseSalaryQuery.mockReturnValue({
        data: null,
        salaryData: null,
        statistics: null,
        metadata: null,
        isLoading: true,
        isFetching: false,
        error: null,
        refetch: jest.fn(),
      });

      renderWithQueryClient(<MarketSalaryEnquiryPage />);

      const submitButton = screen.getByText('Submit Search');
      fireEvent.click(submitButton);

      const refreshButton = screen.getByLabelText('Refresh salary data');
      expect(refreshButton).toBeDisabled();
    });
  });
});
