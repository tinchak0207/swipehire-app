/**
 * @jest-environment jsdom
 */

import type { FileValidationResult } from '@/lib/resume-types';
import {
  FileParsingError,
  formatFileSize,
  getFileTypeIcon,
  validateFile,
} from '../fileParsingService';

// Mock PDF.js
jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      numPages: 2,
      getPage: jest.fn((pageNum) =>
        Promise.resolve({
          getTextContent: jest.fn(() =>
            Promise.resolve({
              items: [{ str: 'Sample PDF text content' }, { str: 'from page ' + pageNum }],
            })
          ),
        })
      ),
    }),
  })),
  version: '3.11.174',
}));

// Mock Mammoth
jest.mock('mammoth', () => ({
  extractRawText: jest.fn(() =>
    Promise.resolve({
      value: 'Sample DOCX text content extracted successfully',
      messages: [],
    })
  ),
}));

describe('fileParsingService', () => {
  describe('validateFile', () => {
    it('should validate PDF files correctly', () => {
      const pdfFile = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
      const result: FileValidationResult = validateFile(pdfFile);

      expect(result.isValid).toBe(true);
      expect(result.fileInfo).toEqual({
        name: 'resume.pdf',
        size: 4, // 'test' is 4 bytes
        type: 'application/pdf',
      });
    });

    it('should validate DOCX files correctly', () => {
      const docxFile = new File(['test'], 'resume.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const result: FileValidationResult = validateFile(docxFile);

      expect(result.isValid).toBe(true);
      expect(result.fileInfo).toEqual({
        name: 'resume.docx',
        size: 4,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    });

    it('should validate DOC files correctly', () => {
      const docFile = new File(['test'], 'resume.doc', { type: 'application/msword' });
      const result: FileValidationResult = validateFile(docFile);

      expect(result.isValid).toBe(true);
      expect(result.fileInfo).toEqual({
        name: 'resume.doc',
        size: 4,
        type: 'application/msword',
      });
    });

    it('should reject unsupported file types', () => {
      const txtFile = new File(['test'], 'resume.txt', { type: 'text/plain' });
      const result: FileValidationResult = validateFile(txtFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please upload a PDF, DOC, or DOCX file only.');
    });

    it('should reject files that are too large', () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const largeFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      const result: FileValidationResult = validateFile(largeFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File size must be less than 10MB.');
    });

    it('should reject empty files', () => {
      const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
      const result: FileValidationResult = validateFile(emptyFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('The selected file appears to be empty.');
    });

    it('should validate files by extension when MIME type is missing', () => {
      const pdfFile = new File(['test'], 'resume.pdf', { type: '' });
      const result: FileValidationResult = validateFile(pdfFile);

      expect(result.isValid).toBe(true);
    });
  });

  describe('utility functions', () => {
    describe('formatFileSize', () => {
      it('should format bytes correctly', () => {
        expect(formatFileSize(0)).toBe('0 Bytes');
        expect(formatFileSize(1024)).toBe('1 KB');
        expect(formatFileSize(1024 * 1024)).toBe('1 MB');
        expect(formatFileSize(1536)).toBe('1.5 KB');
        expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      });
    });

    describe('getFileTypeIcon', () => {
      it('should return correct icons for file types', () => {
        expect(getFileTypeIcon('resume.pdf')).toBe('📄');
        expect(getFileTypeIcon('resume.docx')).toBe('📝');
        expect(getFileTypeIcon('resume.doc')).toBe('📝');
        expect(getFileTypeIcon('resume.txt')).toBe('📄');
      });
    });
  });

  describe('FileParsingError', () => {
    it('should create error with correct properties', () => {
      const originalError = new Error('Original error');
      const error = new FileParsingError('Test message', 'TEST_CODE', originalError);

      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.originalError).toBe(originalError);
      expect(error.name).toBe('FileParsingError');
    });
  });
});
