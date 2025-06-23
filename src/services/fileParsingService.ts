/**
 * File Parsing Service
 * Handles extraction of text content from PDF and DOCX files
 * Supports validation, error handling, and progress tracking
 */

import mammoth from 'mammoth';
import type { FileValidationResult, ResumeParsingProgress } from '@/lib/resume-types';

// Dynamic import for PDF.js to avoid SSR issues
let pdfjsLib: any = null;

// Initialize PDF.js only on client side
const initializePDFJS = async () => {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    try {
      pdfjsLib = await import('pdfjs-dist');
      
      // Configure worker with local file first, then fallback to CDN
      // This avoids the template literal issue and provides better reliability
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.js';
      
      console.log('PDF.js initialized successfully with local worker, version:', pdfjsLib.version);
      return true;
    } catch (error) {
      console.error('Failed to initialize PDF.js with local worker:', error);
      // Fallback to CDN if local worker fails
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        console.log('PDF.js fallback to cdnjs worker');
        return true;
      } catch (fallbackError) {
        console.error('PDF.js CDN fallback also failed:', fallbackError);
        // Last resort: try unpkg with a fixed version
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
          console.log('PDF.js final fallback to unpkg');
          return true;
        } catch (finalError) {
          console.error('All PDF.js worker sources failed:', finalError);
          return false;
        }
      }
    }
  }
  return pdfjsLib !== null;
};

export interface ParsedFileResult {
  text: string;
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: string;
    pageCount?: number;
    wordCount: number;
    characterCount: number;
    extractionTime: number;
  };
}

export interface FileParsingOptions {
  onProgress?: (progress: ResumeParsingProgress) => void;
  maxFileSize?: number; // in bytes, default 10MB
  timeout?: number; // in milliseconds, default 30 seconds
}

export class FileParsingError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'FileParsingError';
  }
}

/**
 * Validates file before parsing
 */
export function validateFile(file: File): FileValidationResult {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword', // .doc files
  ];
  
  const allowedExtensions = ['.pdf', '.docx', '.doc'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

  // Check file type
  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'Please upload a PDF, DOC, or DOCX file only.',
    };
  }

  // Check file size (default 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB.',
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'The selected file appears to be empty.',
    };
  }

  return {
    isValid: true,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
    },
  };
}

/**
 * Extracts text from PDF files using PDF.js with enhanced error handling
 */
async function parsePDF(
  file: File,
  options: FileParsingOptions = {}
): Promise<ParsedFileResult> {
  const startTime = Date.now();
  
  try {
    // Initialize PDF.js if not already done
    const isInitialized = await initializePDFJS();
    if (!isInitialized || !pdfjsLib) {
      throw new FileParsingError(
        'PDF processing is not available. Please try refreshing the page.',
        'PDF_INIT_ERROR'
      );
    }

    options.onProgress?.({
      stage: 'extracting',
      progress: 10,
      message: 'Loading PDF document...',
    });

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    options.onProgress?.({
      stage: 'extracting',
      progress: 30,
      message: 'Parsing PDF structure...',
    });

    // Enhanced PDF.js configuration with better error handling
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0, // Suppress console warnings
      useSystemFonts: true,
      disableFontFace: false,
      password: '', // Empty password for initial attempt
    });

    // Handle password-protected PDFs
    loadingTask.onPassword = () => {
      throw new FileParsingError(
        'This PDF is password-protected. Please remove the password and try again.',
        'PDF_PASSWORD_PROTECTED'
      );
    };

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    if (numPages === 0) {
      throw new FileParsingError(
        'This PDF appears to be empty or corrupted.',
        'PDF_EMPTY'
      );
    }

    let fullText = '';

    // Extract text from each page with better error handling
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const progress = 30 + (pageNum / numPages) * 60;
        options.onProgress?.({
          stage: 'extracting',
          progress: Math.round(progress),
          message: `Extracting text from page ${pageNum} of ${numPages}...`,
        });

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items with proper spacing and line breaks
        const pageText = textContent.items
          .map((item: any) => {
            if (item && typeof item === 'object' && 'str' in item) {
              return item.str;
            }
            return '';
          })
          .filter((text: string) => text.trim().length > 0) // Remove empty strings
          .join(' ');
        
        if (pageText.trim()) {
          fullText += pageText + '\n\n';
        }
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        // Continue with other pages instead of failing completely
        fullText += `[Page ${pageNum}: Text extraction failed]\n\n`;
      }
    }

    const extractionTime = Date.now() - startTime;
    
    options.onProgress?.({
      stage: 'processing',
      progress: 95,
      message: 'Finalizing text extraction...',
    });

    // Clean up the extracted text
    const cleanedText = cleanExtractedText(fullText);

    if (!cleanedText || cleanedText.trim().length === 0) {
      throw new FileParsingError(
        'No text content could be extracted from this PDF. It may be an image-based PDF or corrupted.',
        'PDF_NO_TEXT'
      );
    }

    return {
      text: cleanedText,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        pageCount: numPages,
        wordCount: countWords(cleanedText),
        characterCount: cleanedText.length,
        extractionTime,
      },
    };
  } catch (error) {
    console.error('PDF parsing error details:', error);
    
    if (error instanceof FileParsingError) {
      throw error;
    }
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Failed to parse PDF file.';
    let errorCode = 'PDF_PARSE_ERROR';
    
    if (error instanceof Error) {
      const errorString = error.message.toLowerCase();
      
      if (errorString.includes('password')) {
        errorMessage = 'This PDF is password-protected. Please remove the password and try again.';
        errorCode = 'PDF_PASSWORD_PROTECTED';
      } else if (errorString.includes('invalid') || errorString.includes('corrupt')) {
        errorMessage = 'This PDF file appears to be corrupted or invalid. Please try with a different file.';
        errorCode = 'PDF_CORRUPTED';
      } else if (errorString.includes('network') || errorString.includes('worker')) {
        errorMessage = 'Failed to load PDF processing resources. Please check your internet connection and try again.';
        errorCode = 'PDF_WORKER_ERROR';
      } else if (errorString.includes('memory') || errorString.includes('size')) {
        errorMessage = 'This PDF file is too large or complex to process. Please try with a smaller file.';
        errorCode = 'PDF_TOO_LARGE';
      } else if (errorString.includes('fetch') || errorString.includes('load')) {
        errorMessage = 'Unable to load PDF processing library. Please refresh the page and try again.';
        errorCode = 'PDF_LOAD_ERROR';
      }
    }
    
    throw new FileParsingError(errorMessage, errorCode, error as Error);
  }
}

/**
 * Extracts text from DOCX files using Mammoth
 */
async function parseDOCX(
  file: File,
  options: FileParsingOptions = {}
): Promise<ParsedFileResult> {
  const startTime = Date.now();
  
  try {
    options.onProgress?.({
      stage: 'extracting',
      progress: 20,
      message: 'Loading DOCX document...',
    });

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    options.onProgress?.({
      stage: 'extracting',
      progress: 50,
      message: 'Extracting text content...',
    });

    // Extract text using Mammoth with enhanced options
    const result = await mammoth.extractRawText({ 
      arrayBuffer,
      // Additional options for better text extraction
      convertImage: mammoth.images.ignoreAll, // Ignore images for text extraction
    });
    
    if (result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }

    const extractionTime = Date.now() - startTime;
    
    options.onProgress?.({
      stage: 'processing',
      progress: 90,
      message: 'Processing extracted text...',
    });

    // Clean up the extracted text
    const cleanedText = cleanExtractedText(result.value);

    if (!cleanedText || cleanedText.trim().length === 0) {
      throw new FileParsingError(
        'No text content could be extracted from this DOCX file.',
        'DOCX_NO_TEXT'
      );
    }

    return {
      text: cleanedText,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        wordCount: countWords(cleanedText),
        characterCount: cleanedText.length,
        extractionTime,
      },
    };
  } catch (error) {
    if (error instanceof FileParsingError) {
      throw error;
    }
    
    throw new FileParsingError(
      'Failed to parse DOCX file. The file may be corrupted or in an unsupported format.',
      'DOCX_PARSE_ERROR',
      error as Error
    );
  }
}

/**
 * Extracts text from DOC files (legacy Word format)
 * Note: This is a simplified approach as DOC parsing is complex
 */
async function parseDOC(
  file: File,
  options: FileParsingOptions = {}
): Promise<ParsedFileResult> {
  const startTime = Date.now();
  
  try {
    options.onProgress?.({
      stage: 'extracting',
      progress: 20,
      message: 'Loading DOC document...',
    });

    // For DOC files, we'll try to use Mammoth as well
    // Mammoth has limited support for .doc files
    const arrayBuffer = await file.arrayBuffer();
    
    options.onProgress?.({
      stage: 'extracting',
      progress: 50,
      message: 'Attempting to extract text...',
    });

    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      const extractionTime = Date.now() - startTime;
      const cleanedText = cleanExtractedText(result.value);

      if (!cleanedText || cleanedText.trim().length === 0) {
        throw new FileParsingError(
          'No text content could be extracted from this DOC file. Please convert it to DOCX format for better compatibility.',
          'DOC_NO_TEXT'
        );
      }

      return {
        text: cleanedText,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          wordCount: countWords(cleanedText),
          characterCount: cleanedText.length,
          extractionTime,
        },
      };
    } catch (mammothError) {
      // If Mammoth fails, provide a helpful error message
      throw new FileParsingError(
        'Unable to parse this DOC file. Please convert it to DOCX format or PDF for better compatibility.',
        'DOC_PARSE_ERROR',
        mammothError as Error
      );
    }
  } catch (error) {
    if (error instanceof FileParsingError) {
      throw error;
    }
    throw new FileParsingError(
      'Failed to parse DOC file. Please try converting to DOCX or PDF format.',
      'DOC_PARSE_ERROR',
      error as Error
    );
  }
}

/**
 * Main function to parse any supported file type
 */
export async function parseFile(
  file: File,
  options: FileParsingOptions = {}
): Promise<ParsedFileResult> {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new FileParsingError(
      validation.error || 'Invalid file',
      'VALIDATION_ERROR'
    );
  }

  // Set up timeout
  const timeout = options.timeout || 30000; // 30 seconds default
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new FileParsingError(
        'File parsing timed out. Please try with a smaller file.',
        'TIMEOUT_ERROR'
      ));
    }, timeout);
  });

  options.onProgress?.({
    stage: 'uploading',
    progress: 5,
    message: 'Starting file processing...',
  });

  try {
    // Determine file type and parse accordingly
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    let parsePromise: Promise<ParsedFileResult>;
    
    if (file.type === 'application/pdf' || fileExtension === '.pdf') {
      parsePromise = parsePDF(file, options);
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileExtension === '.docx'
    ) {
      parsePromise = parseDOCX(file, options);
    } else if (file.type === 'application/msword' || fileExtension === '.doc') {
      parsePromise = parseDOC(file, options);
    } else {
      throw new FileParsingError(
        'Unsupported file type. Please upload a PDF, DOC, or DOCX file.',
        'UNSUPPORTED_TYPE'
      );
    }

    // Race between parsing and timeout
    const result = await Promise.race([parsePromise, timeoutPromise]);
    
    options.onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'File processing complete!',
    });

    return result;
  } catch (error) {
    if (error instanceof FileParsingError) {
      throw error;
    }
    throw new FileParsingError(
      'An unexpected error occurred while parsing the file.',
      'UNKNOWN_ERROR',
      error as Error
    );
  }
}

/**
 * Cleans up extracted text by removing excessive whitespace and formatting
 */
function cleanExtractedText(text: string): string {
  if (!text || typeof text !== 'string') {
    return 'No text content could be extracted from this file.';
  }

  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove excessive line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Remove special characters that might cause issues
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Trim whitespace from start and end
    .trim()
    // Ensure we don't have empty result
    || 'No text content could be extracted from this file.';
}

/**
 * Counts words in text
 */
function countWords(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Utility function to format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Utility function to get file type icon
 */
export function getFileTypeIcon(fileName: string): string {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  switch (extension) {
    case '.pdf':
      return '??';
    case '.docx':
    case '.doc':
      return '??';
    default:
      return '??';
  }
}
