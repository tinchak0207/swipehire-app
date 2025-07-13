'use client';

import { AlertCircle, CheckCircle, Download, FileText, Table } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import {
  type CSVOptions,
  type ReportData,
  ReportGenerationError,
  type ReportOptions,
  reportGenerationService,
} from '@/services/reportGenerationService';
import type {
  SalaryDataPoint,
  SalaryQueryCriteria,
  SalaryStatistics,
} from '@/services/salaryDataService';

// Component props interface
export interface ReportDownloadButtonProps {
  /** Salary data to include in the report */
  salaryData: SalaryDataPoint[];
  /** Statistics data to include in the report */
  statistics: SalaryStatistics | null;
  /** Search criteria used to generate the data */
  searchCriteria?: SalaryQueryCriteria;
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button should be disabled */
  disabled?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Report options for PDF generation */
  pdfOptions?: ReportOptions;
  /** Report options for CSV generation */
  csvOptions?: CSVOptions;
  /** Callback fired when download starts */
  onDownloadStart?: (type: 'pdf' | 'csv') => void;
  /** Callback fired when download completes successfully */
  onDownloadSuccess?: (type: 'pdf' | 'csv', filename: string) => void;
  /** Callback fired when download fails */
  onDownloadError?: (type: 'pdf' | 'csv', error: Error) => void;
  /** Whether to show dropdown with format options */
  showDropdown?: boolean;
  /** Custom button text */
  buttonText?: string;
}

// Loading state type
type LoadingState = 'idle' | 'pdf' | 'csv';

// Success/Error feedback state
interface FeedbackState {
  type: 'success' | 'error' | null;
  message: string;
  timestamp: number;
}

/**
 * ReportDownloadButton Component
 *
 * A comprehensive button component for downloading salary reports in PDF and CSV formats.
 * Features loading states, error handling, success feedback, and accessibility support.
 */
export const ReportDownloadButton: React.FC<ReportDownloadButtonProps> = ({
  salaryData,
  statistics,
  searchCriteria = {},
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  pdfOptions = {},
  csvOptions = {},
  onDownloadStart,
  onDownloadSuccess,
  onDownloadError,
  showDropdown = true,
  buttonText = 'Download Report',
}) => {
  // State management
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: null,
    message: '',
    timestamp: 0,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Prepare report data
  const prepareReportData = useCallback((): ReportData => {
    return {
      salaryData,
      statistics,
      searchCriteria: Object.fromEntries(
        Object.entries(searchCriteria).map(([key, value]) => [key, value?.toString() || undefined])
      ),
      generatedAt: new Date().toISOString(),
    };
  }, [salaryData, statistics, searchCriteria]);

  // Show feedback message
  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({
      type,
      message,
      timestamp: Date.now(),
    });

    // Auto-hide feedback after 5 seconds
    setTimeout(() => {
      setFeedback((prev) =>
        prev.timestamp === Date.now() - 5000 ? { type: null, message: '', timestamp: 0 } : prev
      );
    }, 5000);
  }, []);

  // Handle PDF download
  const handlePDFDownload = useCallback(async () => {
    if (loadingState !== 'idle' || disabled) return;

    try {
      setLoadingState('pdf');
      setDropdownOpen(false);
      onDownloadStart?.('pdf');

      const reportData = prepareReportData();
      const pdfBlob = await reportGenerationService.generatePDFReport(reportData, pdfOptions);
      const filename = reportGenerationService.generateFilename('pdf', reportData.searchCriteria);

      reportGenerationService.downloadBlob(pdfBlob, filename);

      showFeedback('success', `PDF report downloaded successfully: ${filename}`);
      onDownloadSuccess?.('pdf', filename);
    } catch (error) {
      const errorMessage =
        error instanceof ReportGenerationError ? error.message : 'Failed to generate PDF report';

      console.error('PDF download failed:', error);
      showFeedback('error', errorMessage);
      onDownloadError?.('pdf', error as Error);
    } finally {
      setLoadingState('idle');
    }
  }, [
    loadingState,
    disabled,
    onDownloadStart,
    prepareReportData,
    pdfOptions,
    showFeedback,
    onDownloadSuccess,
    onDownloadError,
  ]);

  // Handle CSV download
  const handleCSVDownload = useCallback(async () => {
    if (loadingState !== 'idle' || disabled) return;

    try {
      setLoadingState('csv');
      setDropdownOpen(false);
      onDownloadStart?.('csv');

      const reportData = prepareReportData();
      const csvBlob = await reportGenerationService.generateCSVReport(reportData, csvOptions);
      const filename = reportGenerationService.generateFilename('csv', reportData.searchCriteria);

      reportGenerationService.downloadBlob(csvBlob, filename);

      showFeedback('success', `CSV report downloaded successfully: ${filename}`);
      onDownloadSuccess?.('csv', filename);
    } catch (error) {
      const errorMessage =
        error instanceof ReportGenerationError ? error.message : 'Failed to generate CSV report';

      console.error('CSV download failed:', error);
      showFeedback('error', errorMessage);
      onDownloadError?.('csv', error as Error);
    } finally {
      setLoadingState('idle');
    }
  }, [
    loadingState,
    disabled,
    onDownloadStart,
    prepareReportData,
    csvOptions,
    showFeedback,
    onDownloadSuccess,
    onDownloadError,
  ]);

  // Get button classes based on variant and size
  const getButtonClasses = useCallback(() => {
    const baseClasses = 'btn gap-2 transition-all duration-200';

    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
    };

    const sizeClasses = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
    };

    const loadingClass = loadingState !== 'idle' ? 'loading' : '';
    const disabledClass = disabled ? 'btn-disabled' : '';

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${loadingClass} ${disabledClass} ${className}`.trim();
  }, [variant, size, loadingState, disabled, className]);

  // Check if data is available
  const hasData = salaryData.length > 0;
  const isDisabled = disabled || !hasData || loadingState !== 'idle';

  // Render loading text
  const getLoadingText = () => {
    switch (loadingState) {
      case 'pdf':
        return 'Generating PDF...';
      case 'csv':
        return 'Generating CSV...';
      default:
        return buttonText;
    }
  };

  // Single button (no dropdown)
  if (!showDropdown) {
    return (
      <div className="relative">
        <button
          type="button"
          className={getButtonClasses()}
          onClick={handlePDFDownload}
          disabled={isDisabled}
          aria-label={`Download salary report as PDF (${salaryData.length} records)`}
          title={!hasData ? 'No data available for download' : 'Download PDF report'}
        >
          {loadingState === 'pdf' ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {getLoadingText()}
        </button>

        {/* Feedback Toast */}
        {feedback.type && (
          <div className={'toast toast-top toast-end z-50'}>
            <div
              className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="text-sm">{feedback.message}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dropdown button
  return (
    <div className="relative">
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className={getButtonClasses()}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setDropdownOpen(!dropdownOpen);
            }
          }}
          aria-label={`Download salary report options (${salaryData.length} records)`}
          aria-expanded={dropdownOpen}
          aria-haspopup="menu"
          title={!hasData ? 'No data available for download' : 'Download report options'}
        >
          {loadingState !== 'idle' ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {getLoadingText()}
          {loadingState === 'idle' && (
            <svg
              className="h-4 w-4 transition-transform duration-200"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>

        {dropdownOpen && (
          <ul className="dropdown-content menu z-[1] w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
            <li role="none">
              <button
                type="button"
                className="flex items-center gap-3 rounded-lg px-4 py-2 text-left transition-colors hover:bg-base-200"
                onClick={handlePDFDownload}
                disabled={loadingState !== 'idle'}
                role="menuitem"
                aria-label="Download as PDF"
              >
                <FileText className="h-4 w-4 text-red-500" />
                <div>
                  <div className="font-medium text-base-content">Download PDF</div>
                  <div className="text-base-content/70 text-xs">Formatted report with charts</div>
                </div>
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                className="flex items-center gap-3 rounded-lg px-4 py-2 text-left transition-colors hover:bg-base-200"
                onClick={handleCSVDownload}
                disabled={loadingState !== 'idle'}
                role="menuitem"
                aria-label="Download as CSV"
              >
                <Table className="h-4 w-4 text-green-500" />
                <div>
                  <div className="font-medium text-base-content">Download CSV</div>
                  <div className="text-base-content/70 text-xs">Raw data for analysis</div>
                </div>
              </button>
            </li>
            <div className="divider my-1" />
            <li role="none">
              <div className="px-4 py-2 text-base-content/50 text-xs">
                {salaryData.length} records available
              </div>
            </li>
          </ul>
        )}
      </div>

      {/* Feedback Toast */}
      {feedback.type && (
        <div className="toast toast-top toast-end z-50">
          <div
            className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm">{feedback.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setDropdownOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDropdownOpen(false);
            }
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default ReportDownloadButton;
