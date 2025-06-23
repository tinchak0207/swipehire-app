import {
  CSVGenerationError,
  PDFGenerationError,
  type ReportData,
  ReportGenerationService,
  reportGenerationService,
} from '../reportGenerationService';
import type { SalaryDataPoint, SalaryStatistics } from '../salaryDataService';

// Mock jsPDF and autoTable
jest.mock('jspdf', () => {
  const mockDoc = {
    internal: {
      pageSize: {
        getWidth: jest.fn(() => 210),
        getHeight: jest.fn(() => 297),
      },
    },
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    addPage: jest.fn(),
    output: jest.fn(() => new ArrayBuffer(8)),
    getNumberOfPages: jest.fn(() => 1),
    setPage: jest.fn(),
    lastAutoTable: { finalY: 100 },
  };

  return jest.fn(() => mockDoc);
});

jest.mock('jspdf-autotable', () => jest.fn());

// Mock URL.createObjectURL and related DOM methods
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn(),
  },
});

// Mock document methods for download functionality
const mockLink = {
  href: '',
  download: '',
  style: { display: '' },
  click: jest.fn(),
  // Minimal HTMLAnchorElement properties required by the tests
  accessKey: '',
  accessKeyLabel: '',
  autocapitalize: '',
  dir: '',
  hidden: false,
  id: '',
  lang: '',
  tabIndex: 0,
  title: '',
  blur: jest.fn(),
  focus: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
} as unknown as HTMLAnchorElement;

const originalCreateElement = document.createElement;
document.createElement = jest.fn((tagName) => {
  if (tagName === 'a') {
    return mockLink;
  }
  return originalCreateElement.call(document, tagName);
});

document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

describe('ReportGenerationService', () => {
  let service: ReportGenerationService;
  let mockSalaryData: SalaryDataPoint[];
  let mockStatistics: SalaryStatistics;
  let mockReportData: ReportData;

  beforeEach(() => {
    service = new ReportGenerationService();

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
        benefits: ['Health Insurance', '401k', 'Stock Options'],
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
        benefits: ['Health Insurance', '401k', 'Stock Options', 'Remote Work'],
        currency: 'USD',
        timestamp: '2024-01-16T14:20:00Z',
        source: 'test',
        verified: true,
      },
    ];

    mockStatistics = {
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

    mockReportData = {
      salaryData: mockSalaryData,
      statistics: mockStatistics,
      searchCriteria: {
        jobTitle: 'Software Engineer',
        industry: 'Technology',
        region: 'San Francisco, CA',
      },
      generatedAt: '2024-01-16T15:30:00Z',
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('PDF Report Generation', () => {
    it('should generate PDF report with default options', async () => {
      const result = await service.generatePDFReport(mockReportData);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    it('should generate PDF report with custom options', async () => {
      const options = {
        title: 'Custom Salary Report',
        includeStatistics: false,
        format: 'Letter' as const,
        orientation: 'landscape' as const,
      };

      const result = await service.generatePDFReport(mockReportData, options);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    it('should handle empty salary data', async () => {
      const emptyReportData = {
        ...mockReportData,
        salaryData: [],
      };

      const result = await service.generatePDFReport(emptyReportData);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    it('should handle missing statistics', async () => {
      const noStatsReportData = {
        ...mockReportData,
        statistics: null,
      };

      const result = await service.generatePDFReport(noStatsReportData);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    it('should throw PDFGenerationError on failure', async () => {
      // Mock jsPDF to throw an error
      const jsPDF = require('jspdf');
      jsPDF.mockImplementation(() => {
        throw new Error('PDF generation failed');
      });

      await expect(service.generatePDFReport(mockReportData)).rejects.toThrow(PDFGenerationError);
      await expect(service.generatePDFReport(mockReportData)).rejects.toThrow(
        'Failed to generate PDF report'
      );
    });
  });

  describe('CSV Report Generation', () => {
    it('should generate CSV report with default options', async () => {
      const result = await service.generateCSVReport(mockReportData);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv;charset=utf-8;');
    });

    it('should generate CSV report with custom options', async () => {
      const options = {
        includeHeaders: false,
        delimiter: ';',
        includeStatistics: false,
      };

      const result = await service.generateCSVReport(mockReportData, options);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv;charset=utf-8;');
    });

    it('should handle empty salary data', async () => {
      const emptyReportData = {
        ...mockReportData,
        salaryData: [],
      };

      const result = await service.generateCSVReport(emptyReportData);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv;charset=utf-8;');
    });

    it('should handle missing statistics', async () => {
      const noStatsReportData = {
        ...mockReportData,
        statistics: null,
      };

      const result = await service.generateCSVReport(noStatsReportData);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv;charset=utf-8;');
    });

    it('should properly escape CSV values', async () => {
      const dataWithSpecialChars = {
        ...mockReportData,
        salaryData: [
          {
            ...mockSalaryData[0],
            id: 'test-special-chars',
            jobTitle: 'Software Engineer, Senior',
            industry: 'Technology "AI/ML"',
            region: 'San Francisco, CA\nBay Area',
            experienceLevel: 'mid',
            education: 'bachelor',
            companySize: 'large',
            baseSalary: 130000,
            totalCompensation: 180000,
            currency: 'USD',
            timestamp: '2024-01-15T10:30:00Z',
            source: 'test',
            verified: true,
            bonus: 20000,
            equity: 30000,
            benefits: ['Health Insurance'],
          },
        ],
      };

      const result = await service.generateCSVReport(dataWithSpecialChars);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should throw CSVGenerationError on failure', async () => {
      // Mock Blob constructor to throw an error
      const originalBlob = global.Blob;
      global.Blob = jest.fn(() => {
        throw new Error('Blob creation failed');
      }) as any;

      await expect(service.generateCSVReport(mockReportData)).rejects.toThrow(CSVGenerationError);
      await expect(service.generateCSVReport(mockReportData)).rejects.toThrow(
        'Failed to generate CSV report'
      );

      // Restore original Blob
      global.Blob = originalBlob;
    });
  });

  describe('Filename Generation', () => {
    it('should generate PDF filename with default criteria', () => {
      const filename = service.generateFilename('pdf');

      expect(filename).toMatch(
        /^salary_market_salary_report_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.pdf$/
      );
    });

    it('should generate CSV filename with search criteria', () => {
      const searchCriteria = {
        jobTitle: 'Software Engineer',
        region: 'San Francisco, CA',
      };

      const filename = service.generateFilename('csv', searchCriteria);

      expect(filename).toMatch(
        /^Software_Engineer_San_Francisco__CA_salary_report_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.csv$/
      );
    });

    it('should sanitize special characters in filename', () => {
      const searchCriteria = {
        jobTitle: 'Software Engineer/Developer',
        region: 'San Francisco, CA (Bay Area)',
      };

      const filename = service.generateFilename('pdf', searchCriteria);

      expect(filename).not.toContain('/');
      expect(filename).not.toContain('(');
      expect(filename).not.toContain(')');
      expect(filename).toMatch(
        /^Software_Engineer_Developer_San_Francisco__CA__Bay_Area__salary_report_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.pdf$/
      );
    });
  });

  describe('File Download', () => {
    it('should download blob as file', () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      const filename = 'test-file.txt';

      service.downloadBlob(mockBlob, filename);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe(filename);
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
    });

    it('should handle download errors', () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      const filename = 'test-file.txt';

      (document.createElement as jest.Mock).mockImplementation(() => {
        throw new Error('DOM manipulation failed');
      });

      expect(() => service.downloadBlob(mockBlob, filename)).toThrow('Failed to download file');
    });
  });

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(reportGenerationService).toBeInstanceOf(ReportGenerationService);
    });

    it('should return the same instance on multiple imports', () => {
      const { reportGenerationService: instance1 } = require('../reportGenerationService');
      const { reportGenerationService: instance2 } = require('../reportGenerationService');

      expect(instance1).toBe(instance2);
    });
  });

  describe('Error Handling', () => {
    it('should create proper error instances', () => {
      const pdfError = new PDFGenerationError('PDF failed', { detail: 'test' });
      expect(pdfError).toBeInstanceOf(PDFGenerationError);
      expect(pdfError.code).toBe('PDF_GENERATION_ERROR');
      expect(pdfError.details).toEqual({ detail: 'test' });

      const csvError = new CSVGenerationError('CSV failed', { detail: 'test' });
      expect(csvError).toBeInstanceOf(CSVGenerationError);
      expect(csvError.code).toBe('CSV_GENERATION_ERROR');
      expect(csvError.details).toEqual({ detail: 'test' });
    });
  });

  describe('Data Formatting', () => {
    it('should format currency values correctly', async () => {
      const result = await service.generateCSVReport(mockReportData);

      // Check that the result is a proper CSV blob
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv;charset=utf-8;');

      // Convert blob to text to check content
      const csvText = await new Response(result).text();
      expect(csvText).toContain('130000');
      expect(csvText).toContain('180000');
    });

    it('should format dates correctly', async () => {
      const result = await service.generateCSVReport(mockReportData);

      // Check that the result is a proper CSV blob
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv;charset=utf-8;');

      // Convert blob to text to check content
      const csvText = await new Response(result).text();
      expect(csvText).toContain('2024-01-15T10:30:00Z');
      expect(csvText).toContain('2024-01-16T14:20:00Z');
    });

    it('should handle missing optional fields', async () => {
      const dataWithMissingFields = {
        ...mockReportData,
        salaryData: [
          {
            id: 'test-missing-optional',
            jobTitle: 'Software Engineer',
            industry: 'Technology',
            region: 'San Francisco, CA',
            experienceLevel: 'mid',
            education: 'bachelor',
            companySize: 'large',
            baseSalary: 130000,
            totalCompensation: 180000,
            currency: 'USD',
            timestamp: '2024-01-15T10:30:00Z',
            source: 'test',
            verified: true,
          },
        ],
      };

      const result = await service.generateCSVReport(dataWithMissingFields);
      expect(result).toBeInstanceOf(Blob);
    });
  });
});
