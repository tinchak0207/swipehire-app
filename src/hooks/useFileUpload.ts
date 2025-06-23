/**
 * Custom hook for managing file upload and parsing functionality
 * Provides reusable file upload logic with validation, parsing, and error handling
 */

import { useState, useCallback } from 'react';
import type { 
  ResumeUploadState, 
  FileValidationResult, 
  ResumeParsingProgress,
  ParsedFileResult,
  FileParsingOptions 
} from '@/lib/resume-types';

interface ExtendedUploadState extends ResumeUploadState {
  progress: number;
  stage: ResumeParsingProgress['stage'];
  dragActive: boolean;
  metadata?: ParsedFileResult['metadata'];
}

interface UseFileUploadOptions {
  maxFileSize?: number;
  timeout?: number;
  onSuccess?: (result: ParsedFileResult) => void;
  onError?: (error: Error) => void;
}

interface UseFileUploadReturn {
  uploadState: ExtendedUploadState;
  validateFile: (file: File) => FileValidationResult;
  handleFileSelection: (file: File) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  clearFile: () => void;
  parseFile: () => Promise<void>;
  resetState: () => void;
}

/**
 * Custom hook for file upload functionality
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    timeout = 30000, // 30 seconds default
    onSuccess,
    onError
  } = options;

  const [uploadState, setUploadState] = useState<ExtendedUploadState>({
    file: null,
    isUploading: false,
    error: null,
    extractedText: null,
    progress: 0,
    stage: 'uploading',
    dragActive: false,
  });

  const validateFile = useCallback((file: File): FileValidationResult => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword', // .doc files
    ];
    
    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'Please upload a PDF, DOC, or DOCX file only.',
      };
    }

    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB.`,
      };
    }

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
  }, [maxFileSize]);

  const handleFileSelection = useCallback((file: File): void => {
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      setUploadState((prev) => ({
        ...prev,
        error: validation.error || 'Invalid file',
        file: null,
        dragActive: false,
        extractedText: null,
        metadata: undefined,
      }));
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      file,
      error: null,
      dragActive: false,
      progress: 0,
      stage: 'uploading',
      extractedText: null,
      metadata: undefined,
    }));
  }, [validateFile]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  }, [handleFileSelection]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState((prev) => ({ ...prev, dragActive: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState((prev) => ({ ...prev, dragActive: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, [handleFileSelection]);

  const clearFile = useCallback((): void => {
    setUploadState((prev) => ({
      ...prev,
      file: null,
      error: null,
      extractedText: null,
      metadata: undefined,
      progress: 0,
      stage: 'uploading',
      dragActive: false,
    }));
  }, []);

  const parseFile = useCallback(async (): Promise<void> => {
    if (!uploadState.file) {
      return;
    }

    setUploadState((prev) => ({ 
      ...prev, 
      isUploading: true, 
      error: null, 
      progress: 0,
      stage: 'uploading'
    }));

    try {
      // Import the file parsing service dynamically to avoid SSR issues
      const { parseFile: parseFileService } = await import('@/services/fileParsingService');
      
      // Parse the file with progress tracking
      const result = await parseFileService(uploadState.file, {
        onProgress: (progress) => {
          setUploadState((prev) => ({
            ...prev,
            progress: progress.progress,
            stage: progress.stage,
          }));
        },
        maxFileSize,
        timeout,
      });

      // Update state with extracted text and metadata
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        extractedText: result.text,
        metadata: result.metadata,
        progress: 100,
        stage: 'complete',
      }));

      // Call success callback if provided
      onSuccess?.(result);

    } catch (error) {
      console.error('File parsing error:', error);
      
      let errorMessage = 'Failed to process the file. Please try again.';
      
      // Provide more specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'File processing timed out. Please try with a smaller file.';
        } else if (error.message.includes('corrupted')) {
          errorMessage = 'The file appears to be corrupted. Please try with a different file.';
        } else if (error.message.includes('password')) {
          errorMessage = 'Password-protected files are not supported. Please remove the password and try again.';
        } else if (error.message.includes('format')) {
          errorMessage = 'This file format is not supported or the file is corrupted.';
        } else if (error.message.includes('size')) {
          errorMessage = 'File is too large. Please use a file smaller than 10MB.';
        }
      }

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
        stage: 'error',
      }));

      // Call error callback if provided
      onError?.(error as Error);
    }
  }, [uploadState.file, maxFileSize, timeout, onSuccess, onError]);

  const resetState = useCallback((): void => {
    setUploadState({
      file: null,
      isUploading: false,
      error: null,
      extractedText: null,
      progress: 0,
      stage: 'uploading',
      dragActive: false,
    });
  }, []);

  return {
    uploadState,
    validateFile,
    handleFileSelection,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFile,
    parseFile,
    resetState,
  };
}