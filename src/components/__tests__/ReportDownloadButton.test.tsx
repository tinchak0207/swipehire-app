import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { reportGenerationService } from '@/services/reportGenerationService';
import type { SalaryDataPoint, SalaryStatistics } from '@/services/salaryDataService';
import { ReportDownloadButton } from '../ReportDownloadButton';

// Mock the report generation service
jest.mock('@/services/reportGenerationService', () => ({
  reportGenerationService: {
    generatePDFReport: jest.fn(),
    generateCSVReport: jest.fn(),
    generateFilename: jest.fn(),
    downloadBlob: jest.fn(),
  },
  ReportGenerationError: class ReportGenerationError extends Error {
    constructor(
      message: string,
      public code: string
    ) {
      super(message);
      this.name = 'ReportGenerationError';
    }
  },
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Download: () => <div data-testid="download-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  Table: () => <div data-testid="table-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
}));

describe('ReportDownloadButton', () => {
  let mockSalaryData: SalaryDataPoint[];
  let mockStatistics: SalaryStatistics;
  let mockReportGenerationService: jest.Mocked<typeof reportGenerationService>;

  beforeEach(() => {
    mockSalaryData = [
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
    ];

    mockStatistics = {
      count: 1,
      median: 130000,
      mean: 130000,
      min: 130000,
      max: 130000,
      percentile25: 130000,
      percentile75: 130000,
      percentile90: 130000,
      standardDeviation: 0,
      currency: 'USD',
      lastUpdated: '2024-01-15T10:30:00Z',
    };

    mockReportGenerationService = reportGenerationService as jest.Mocked<
      typeof reportGenerationService
    >;

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockReportGenerationService.generatePDFReport.mockResolvedValue(
      new Blob(['pdf content'], { type: 'application/pdf' })
    );
    mockReportGenerationService.generateCSVReport.mockResolvedValue(
      new Blob(['csv content'], { type: 'text/csv' })
    );
    mockReportGenerationService.generateFilename.mockReturnValue('test-report.pdf');
    mockReportGenerationService.downloadBlob.mockImplementation(() => {});
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ReportDownloadButton salaryData={mockSalaryData} statistics={mockStatistics} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Download Report')).toBeInTheDocument();
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });

    it('should render with custom button text', () => {
      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          buttonText="Export Data"
        />
      );

      expect(screen.getByText('Export Data')).toBeInTheDocument();
    });

    it('should render dropdown when showDropdown is true', async () => {
      const user = userEvent.setup();

      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={true}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('Download PDF')).toBeInTheDocument();
      expect(screen.getByText('Download CSV')).toBeInTheDocument();
      expect(screen.getByText('1 records available')).toBeInTheDocument();
    });

    it('should render single button when showDropdown is false', () => {
      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={false}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should not show dropdown options
      expect(screen.queryByText('Download PDF')).not.toBeInTheDocument();
      expect(screen.queryByText('Download CSV')).not.toBeInTheDocument();
    });

    it('should be disabled when no data is available', () => {
      render(<ReportDownloadButton salaryData={[]} statistics={null} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when explicitly disabled', () => {
      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should apply custom CSS classes', () => {
      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          className="custom-class"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should apply different variants and sizes', () => {
      const { rerender } = render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          variant="secondary"
          size="lg"
        />
      );

      let button = screen.getByRole('button');
      expect(button).toHaveClass('btn-secondary', 'btn-lg');

      rerender(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          variant="outline"
          size="sm"
        />
      );

      button = screen.getByRole('button');
      expect(button).toHaveClass('btn-outline', 'btn-sm');
    });
  });

  describe('PDF Download', () => {
    it('should handle PDF download successfully', async () => {
      const onDownloadStart = jest.fn();
      const onDownloadSuccess = jest.fn();

      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={false}
          onDownloadStart={onDownloadStart}
          onDownloadSuccess={onDownloadSuccess}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onDownloadStart).toHaveBeenCalledWith('pdf');
      });

      await waitFor(() => {
        expect(mockReportGenerationService.generatePDFReport).toHaveBeenCalled();
        expect(mockReportGenerationService.downloadBlob).toHaveBeenCalled();
        expect(onDownloadSuccess).toHaveBeenCalledWith('pdf', 'test-report.pdf');
      });
    });

    it('should handle PDF download from dropdown', async () => {
      const user = userEvent.setup();

      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={true}
        />
      );

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      // Click PDF option
      const pdfOption = screen.getByText('Download PDF');
      await user.click(pdfOption);

      await waitFor(() => {
        expect(mockReportGenerationService.generatePDFReport).toHaveBeenCalled();
      });
    });

    it('should show loading state during PDF generation', async () => {
      // Make PDF generation take some time
      mockReportGenerationService.generatePDFReport.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(new Blob()), 100))
      );

      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={false}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

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

    it('should handle PDF generation errors', async () => {
      const onDownloadError = jest.fn();
      const error = new Error('PDF generation failed');

      mockReportGenerationService.generatePDFReport.mockRejectedValue(error);

      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={false}
          onDownloadError={onDownloadError}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onDownloadError).toHaveBeenCalledWith('pdf', error);
      });

      // Should show error feedback
      await waitFor(() => {
        expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      });
    });
  });

  describe('CSV Download', () => {
    it('should handle CSV download from dropdown', async () => {
      const user = userEvent.setup();
      const onDownloadStart = jest.fn();
      const onDownloadSuccess = jest.fn();

      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={true}
          onDownloadStart={onDownloadStart}
          onDownloadSuccess={onDownloadSuccess}
        />
      );

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      // Click CSV option
      const csvOption = screen.getByText('Download CSV');
      await user.click(csvOption);

      await waitFor(() => {
        expect(onDownloadStart).toHaveBeenCalledWith('csv');
      });

      await waitFor(() => {
        expect(mockReportGenerationService.generateCSVReport).toHaveBeenCalled();
        expect(mockReportGenerationService.downloadBlob).toHaveBeenCalled();
        expect(onDownloadSuccess).toHaveBeenCalledWith('csv', 'test-report.pdf');
      });
    });

    it('should show loading state during CSV generation', async () => {
      const user = userEvent.setup();

      // Make CSV generation take some time
      mockReportGenerationService.generateCSVReport.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(new Blob()), 100))
      );

      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={true}
        />
      );

      // Open dropdown and click CSV
      const button = screen.getByRole('button');
      await user.click(button);

      const csvOption = screen.getByText('Download CSV');
      await user.click(csvOption);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Generating CSV...')).toBeInTheDocument();
      });

      // Wait for completion
      await waitFor(
        () => {
          expect(screen.getByText('Download Report')).toBeInTheDocument();
        },
        { timeout: 200 }
      );
    });

    it('should handle CSV generation errors', async () => {
      const user = userEvent.setup();
      const onDownloadError = jest.fn();
      const error = new Error('CSV generation failed');

      mockReportGenerationService.generateCSVReport.mockRejectedValue(error);

      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={true}
          onDownloadError={onDownloadError}
        />
      );

      // Open dropdown and click CSV
      const button = screen.getByRole('button');
      await user.click(button);

      const csvOption = screen.getByText('Download CSV');
      await user.click(csvOption);

      await waitFor(() => {
        expect(onDownloadError).toHaveBeenCalledWith('csv', error);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('should update ARIA attributes when dropdown is opened', async () => {
      const user = userEvent.setup();

      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={true}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={true}
        />
      );

      const button = screen.getByRole('button');

      // Should open dropdown with Enter key
      await user.type(button, '{enter}');
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });

    it('should have proper tooltip text', () => {
      render(<ReportDownloadButton salaryData={[]} statistics={null} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'No data available for download');
    });
  });

  describe('Feedback System', () => {
    it('should show success feedback after successful download', async () => {
      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={false}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      });
    });

    it('should auto-hide feedback after timeout', async () => {
      jest.useFakeTimers();

      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={false}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      });

      // Fast-forward time
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.queryByTestId('check-circle-icon')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Props Validation', () => {
    it('should handle missing optional props gracefully', () => {
      render(<ReportDownloadButton salaryData={mockSalaryData} statistics={mockStatistics} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should pass custom options to service methods', async () => {
      const customPdfOptions = { title: 'Custom Report', includeStatistics: false };
      const customCsvOptions = { delimiter: ';', includeHeaders: false };

      render(
        <ReportDownloadButton
          salaryData={mockSalaryData}
          statistics={mockStatistics}
          showDropdown={false}
          pdfOptions={customPdfOptions}
          csvOptions={customCsvOptions}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockReportGenerationService.generatePDFReport).toHaveBeenCalledWith(
          expect.any(Object),
          customPdfOptions
        );
      });
    });
  });
});
