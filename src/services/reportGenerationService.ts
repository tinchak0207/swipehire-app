import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SalaryDataPoint, SalaryStatistics } from './salaryDataService';

// Types for report generation
export interface ReportData {
  salaryData: SalaryDataPoint[];
  statistics: SalaryStatistics | null;
  searchCriteria: Record<string, string | undefined>;
  generatedAt: string;
}

export interface ReportOptions {
  title?: string;
  includeStatistics?: boolean;
  includeCharts?: boolean;
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export interface CSVOptions {
  includeHeaders?: boolean;
  delimiter?: string;
  includeStatistics?: boolean;
}

// Custom error types
export class ReportGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ReportGenerationError';
  }
}

export class PDFGenerationError extends ReportGenerationError {
  constructor(message: string, details?: unknown) {
    super(message, 'PDF_GENERATION_ERROR', details);
    this.name = 'PDFGenerationError';
  }
}

export class CSVGenerationError extends ReportGenerationError {
  constructor(message: string, details?: unknown) {
    super(message, 'CSV_GENERATION_ERROR', details);
    this.name = 'CSVGenerationError';
  }
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

const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const escapeCSV = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// Main service class
export class ReportGenerationService {
  /**
   * Generate a PDF report from salary data
   */
  async generatePDFReport(data: ReportData, options: ReportOptions = {}): Promise<Blob> {
    try {
      const {
        title = 'Salary Market Analysis Report',
        includeStatistics = true,
        format = 'A4',
        orientation = 'portrait',
      } = options;

      // Initialize PDF document
      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format,
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight: number): void => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
      };

      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Add generation info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${formatDate(data.generatedAt)}`, margin, yPosition);
      yPosition += 10;

      // Add search criteria
      if (Object.keys(data.searchCriteria).length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Search Criteria', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        for (const [key, value] of Object.entries(data.searchCriteria)) {
          if (value) {
            const formattedKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());
            doc.text(`${formattedKey}: ${value}`, margin, yPosition);
            yPosition += 5;
          }
        }
        yPosition += 10;
      }

      // Add statistics section
      if (includeStatistics && data.statistics) {
        checkPageBreak(60);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Salary Statistics', margin, yPosition);
        yPosition += 8;

        const stats = data.statistics;
        const statisticsData = [
          ['Metric', 'Value'],
          ['Total Records', stats.count.toLocaleString()],
          ['Median Salary', formatCurrency(stats.median, stats.currency)],
          ['Average Salary', formatCurrency(stats.mean, stats.currency)],
          ['Minimum Salary', formatCurrency(stats.min, stats.currency)],
          ['Maximum Salary', formatCurrency(stats.max, stats.currency)],
          ['25th Percentile', formatCurrency(stats.percentile25, stats.currency)],
          ['75th Percentile', formatCurrency(stats.percentile75, stats.currency)],
          ['90th Percentile', formatCurrency(stats.percentile90, stats.currency)],
          ['Standard Deviation', formatCurrency(stats.standardDeviation, stats.currency)],
        ];

        autoTable(doc, {
          head: [statisticsData[0] as any],
          body: statisticsData.slice(1),
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 9 },
          margin: { left: margin, right: margin },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Add salary data table
      if (data.salaryData.length > 0) {
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Detailed Salary Data', margin, yPosition);
        yPosition += 8;

        const tableHeaders = [
          'Job Title',
          'Industry',
          'Region',
          'Experience',
          'Base Salary',
          'Total Comp.',
          'Company Size',
        ];

        const tableData = data.salaryData.map((item) => {
          return [
            item.jobTitle?.toString() || '',
            item.industry?.toString() || '',
            item.region?.toString() || '',
            item.experienceLevel?.toString() || '',
            formatCurrency(item.baseSalary, item.currency),
            formatCurrency(item.totalCompensation, item.currency),
            item.companySize?.toString() || '',
          ];
        });

        autoTable(doc, {
          head: [tableHeaders],
          body: tableData,
          startY: yPosition,
          theme: 'striped',
          headStyles: { fillColor: [52, 152, 219] },
          styles: { fontSize: 8 },
          margin: { left: margin, right: margin },
          columnStyles: {
            0: { cellWidth: 25 }, // Job Title
            1: { cellWidth: 20 }, // Industry
            2: { cellWidth: 25 }, // Region
            3: { cellWidth: 15 }, // Experience
            4: { cellWidth: 20 }, // Base Salary
            5: { cellWidth: 20 }, // Total Comp
            6: { cellWidth: 15 }, // Company Size
          },
        });
      }

      // Add footer
      const totalPages = (doc as any).getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('Generated by SwipeHire Market Salary Analysis', pageWidth / 2, pageHeight - 5, {
          align: 'center',
        });
      }

      // Convert to blob
      const pdfBlob = new Blob([doc.output('arraybuffer')], {
        type: 'application/pdf',
      });

      return pdfBlob;
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new PDFGenerationError(
        `Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Generate a CSV report from salary data
   */
  async generateCSVReport(data: ReportData, options: CSVOptions = {}): Promise<Blob> {
    try {
      const { includeHeaders = true, delimiter = ',', includeStatistics = true } = options;

      const lines: string[] = [];

      // Add metadata header
      lines.push('# Salary Market Analysis Report');
      lines.push(`# Generated on: ${formatDate(data.generatedAt)}`);
      lines.push('');

      // Add search criteria
      if (Object.keys(data.searchCriteria).length > 0) {
        lines.push('# Search Criteria:');
        for (const [key, value] of Object.entries(data.searchCriteria)) {
          if (value) {
            const formattedKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());
            lines.push(`# ${formattedKey}: ${value}`);
          }
        }
        lines.push('');
      }

      // Add statistics
      if (includeStatistics && data.statistics) {
        lines.push('# Statistics:');
        const stats = data.statistics;
        lines.push(`# Total Records: ${stats.count.toLocaleString()}`);
        lines.push(`# Median Salary: ${formatCurrency(stats.median, stats.currency)}`);
        lines.push(`# Average Salary: ${formatCurrency(stats.mean, stats.currency)}`);
        lines.push(`# Minimum Salary: ${formatCurrency(stats.min, stats.currency)}`);
        lines.push(`# Maximum Salary: ${formatCurrency(stats.max, stats.currency)}`);
        lines.push(`# 25th Percentile: ${formatCurrency(stats.percentile25, stats.currency)}`);
        lines.push(`# 75th Percentile: ${formatCurrency(stats.percentile75, stats.currency)}`);
        lines.push(`# 90th Percentile: ${formatCurrency(stats.percentile90, stats.currency)}`);
        lines.push(
          `# Standard Deviation: ${formatCurrency(stats.standardDeviation, stats.currency)}`
        );
        lines.push('');
      }

      // Add headers
      if (includeHeaders) {
        const headers = [
          'Job Title',
          'Industry',
          'Region',
          'Experience Level',
          'Education',
          'Company Size',
          'Base Salary',
          'Total Compensation',
          'Bonus',
          'Equity',
          'Benefits',
          'Currency',
          'Timestamp',
          'Source',
          'Verified',
        ];
        lines.push(headers.map((header) => escapeCSV(header)).join(delimiter));
      }

      // Add data rows
      for (const item of data.salaryData) {
        const row = [
          escapeCSV(item.jobTitle),
          escapeCSV(item.industry),
          escapeCSV(item.region),
          escapeCSV(item.experienceLevel),
          escapeCSV(item.education),
          escapeCSV(item.companySize),
          escapeCSV(item.baseSalary),
          escapeCSV(item.totalCompensation),
          escapeCSV(item.bonus || ''),
          escapeCSV(item.equity || ''),
          escapeCSV(
            Array.isArray(item.benefits)
              ? item.benefits.join('; ')
              : (item.benefits as any)?.toString() || ''
          ),
          escapeCSV(item.currency),
          escapeCSV(item.timestamp),
          escapeCSV(item.source),
          escapeCSV(item.verified ? 'Yes' : 'No'),
        ];
        lines.push(row.join(delimiter));
      }

      // Create blob
      const csvContent = lines.join('\n');
      const csvBlob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      });

      return csvBlob;
    } catch (error) {
      console.error('CSV generation failed:', error);
      throw new CSVGenerationError(
        `Failed to generate CSV report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Generate filename for report download
   */
  generateFilename(
    type: 'pdf' | 'csv',
    searchCriteria: Record<string, string | undefined> = {}
  ): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const jobTitle = searchCriteria.jobTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'salary';
    const region = searchCriteria.region?.replace(/[^a-zA-Z0-9]/g, '_') || 'market';

    return `${jobTitle}_${region}_salary_report_${timestamp}.${type}`;
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob: Blob, filename: string): void {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Download failed:', error);
      throw new ReportGenerationError(
        `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DOWNLOAD_ERROR',
        error
      );
    }
  }
}

// Export singleton instance
export const reportGenerationService = new ReportGenerationService();
