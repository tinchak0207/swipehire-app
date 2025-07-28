'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import type {
  AnimationConfig,
  CameraCapture,
  ContentAnalysis,
  EnhancedAnalysisResult,
  ExtractedContent,
  FileFormat,
  LivePreview,
  SmartUploadProps,
  UploadError,
  UploadProgress,
  UploadResult,
} from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';
import { CloudStorageModal } from './CloudStorageModal';

/**
 * Enhanced Smart Upload Component with Multi-Modal Input System
 *
 * 📤 Enhanced Upload Features:
 * 1. Multi-Modal Input System:
 *    - Drag & drop with animated feedback
 *    - Camera capture for mobile devices
 *    - Cloud storage integration (Google Drive, Dropbox)
 *    - Batch upload processing
 *
 * 2. Smart Content Detection:
 *    - Auto-section recognition with ML
 *    - Format optimization suggestions
 *    - Missing content alerts
 *    - ATS compatibility checking
 *
 * 3. Real-Time Processing:
 *    - Live preview during upload
 *    - Progress indicators with ETA
 *    - Error recovery mechanisms
 *    - Quality assessment feedback
 *
 * 4. Integration Enhancements:
 *    - Seamless handoff to Enhanced Editor
 *    - Pre-populated content blocks
 *    - Automatic analysis triggering
 *    - Template recommendation based on content
 *
 * DaisyUI Components Used:
 * - card, progress, alert, badge, btn, file-input, modal, drawer
 *
 * Tailwind Classes:
 * - transition-all duration-300 ease-in-out
 * - transform hover:scale-105
 * - bg-gradient-to-r from-blue-500 to-purple-600
 * - shadow-lg hover:shadow-xl
 * - animate-pulse for loading states
 *
 * Accessibility:
 * - ARIA labels and descriptions
 * - Keyboard navigation support
 * - Screen reader announcements
 * - High contrast mode support
 */

interface EnhancedUploadState {
  readonly isDragActive: boolean;
  readonly files: File[];
  readonly uploadProgress: Record<string, UploadProgress>;
  readonly errors: UploadError[];
  readonly isProcessing: boolean;
  readonly livePreview: LivePreview | null;
  readonly extractedContent: ExtractedContent | null;
}

const animationConfig: AnimationConfig = {
  duration: 300,
  easing: 'ease-in-out',
  stagger: 100,
};

const defaultFileFormats: readonly FileFormat[] = [
  { extension: '.pdf', mimeType: 'application/pdf', maxSize: 10 * 1024 * 1024 },
  {
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    maxSize: 10 * 1024 * 1024,
  },
  { extension: '.doc', mimeType: 'application/msword', maxSize: 10 * 1024 * 1024 },
  { extension: '.txt', mimeType: 'text/plain', maxSize: 5 * 1024 * 1024 },
  { extension: '.jpg', mimeType: 'image/jpeg', maxSize: 5 * 1024 * 1024 },
  { extension: '.png', mimeType: 'image/png', maxSize: 5 * 1024 * 1024 },
] as const;

export const EnhancedSmartUpload: React.FC<SmartUploadProps> = ({
  acceptedFormats = defaultFileFormats,
  maxFileSize = 10 * 1024 * 1024,
  enableMultipleFiles = true,
  enableCloudImport = true,
  enableSmartSuggestions = true,
  onUploadProgress,
  onContentAnalysis,
  onContentExtracted,
  onUploadComplete,
  onAnalysisReady,
  onError,
}) => {
  const [state, setState] = useState<EnhancedUploadState>({
    isDragActive: false,
    files: [],
    uploadProgress: {},
    errors: [],
    isProcessing: false,
    livePreview: null,
    extractedContent: null,
  });

  const [showCloudModal, setShowCloudModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraCapture] = useState<CameraCapture>({
    isSupported: typeof navigator !== 'undefined' && !!navigator.mediaDevices,
    isActive: false,
    constraints: { video: { facingMode: 'environment' } },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Spring animations for drag states
  const dropZoneSpring = useSpring({
    scale: state.isDragActive ? 1.02 : 1,
    borderColor: state.isDragActive ? '#3b82f6' : '#e5e7eb',
    backgroundColor: state.isDragActive ? '#eff6ff' : '#ffffff',
    config: { tension: 300, friction: 30 },
  });

  // Enhanced file validation with smart suggestions
  const validateFile = useCallback(
    (file: File): UploadError | null => {
      // Check file size
      if (file.size > maxFileSize) {
        return {
          code: 'FILE_TOO_LARGE',
          message: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxFileSize)})`,
          details: { fileName: file.name, fileSize: file.size, maxSize: maxFileSize },
        };
      }

      // Check file type with smart suggestions
      const isValidType = acceptedFormats.some(
        (format) =>
          file.type === format.mimeType || file.name.toLowerCase().endsWith(format.extension)
      );

      if (!isValidType) {
        const suggestedFormats = acceptedFormats.map((f) => f.extension).join(', ');
        return {
          code: 'INVALID_FILE_TYPE',
          message: `File type not supported. Please upload: ${suggestedFormats}. Consider converting your file or using our camera capture feature.`,
          details: { fileName: file.name, fileType: file.type, suggestedFormats },
        };
      }

      // Check for empty files
      if (file.size === 0) {
        return {
          code: 'EMPTY_FILE',
          message: 'File appears to be empty. Please select a valid document.',
          details: { fileName: file.name },
        };
      }

      return null;
    },
    [acceptedFormats, maxFileSize]
  );

  // Utility functions for preview generation
  const extractTextPreview = useCallback(async (_file: File): Promise<string> => {
    // Simulate text extraction
    return 'John Doe - Software Engineer\nExperienced developer with expertise in...';
  }, []);

  const detectSectionsPreview = useCallback(async (_file: File) => {
    // Simulate section detection
    return [
      {
        id: 'contact',
        type: 'contact' as const,
        title: 'Contact',
        content: 'Contact info...',
        confidence: 0.95,
        suggestions: [],
        isComplete: true,
      },
      {
        id: 'summary',
        type: 'summary' as const,
        title: 'Summary',
        content: 'Professional summary...',
        confidence: 0.88,
        suggestions: [],
        isComplete: false,
      },
    ];
  }, []);

  // Utility functions
  const estimateProcessingTime = useCallback((file: File): number => {
    // Estimate based on file size and type
    const baseTime = 5000; // 5 seconds base
    const sizeMultiplier = file.size / (1024 * 1024); // MB
    return Math.floor(baseTime + sizeMultiplier * 2000);
  }, []);

  const generateRecoverySuggestions = useCallback((error: UploadError): string[] => {
    switch (error.code) {
      case 'FILE_TOO_LARGE':
        return ['Compress your file', 'Use PDF format', 'Remove images if possible'];
      case 'INVALID_FILE_TYPE':
        return ['Convert to PDF or DOCX', 'Use camera capture', 'Try cloud import'];
      case 'EMPTY_FILE':
        return ['Check file content', 'Re-save the document', 'Try a different file'];
      default:
        return ['Try again', 'Check internet connection', 'Contact support'];
    }
  }, []);

  // Get AI-powered suggestions
  const getAISuggestions = async (file: File): Promise<any[]> => {
    const resumeText = await file.text();
    try {
      const response = await fetch('/api/resume-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  // Smart content extraction with ML-like features
  const extractSmartContent = useCallback(
    async (file: File): Promise<ExtractedContent> => {
      // Simulate advanced content extraction
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Replace this with a real API call to your AI service
      const aiSuggestions = await getAISuggestions(file);

      const mockSections = [
        {
          id: 'contact-1',
          type: 'contact' as const,
          title: 'Contact Information',
          content: 'John Doe\nSoftware Engineer\njohn.doe@email.com\n(555) 123-4567',
          confidence: 0.95,
          suggestions: ['Add LinkedIn profile', 'Include location'],
          isComplete: true,
        },
        {
          id: 'summary-1',
          type: 'summary' as const,
          title: 'Professional Summary',
          content: 'Experienced software engineer with 5+ years...',
          confidence: 0.88,
          suggestions: ['Add quantifiable achievements', 'Include key technologies'],
          isComplete: false,
        },
        {
          id: 'experience-1',
          type: 'experience' as const,
          title: 'Work Experience',
          content: 'Senior Software Engineer at TechCorp...',
          confidence: 0.92,
          suggestions: ['Add more bullet points', 'Include impact metrics'],
          isComplete: true,
        },
      ];

      const mockMissingContent = [
        {
          section: 'skills' as const,
          importance: 'required' as const,
          description: 'Technical skills section is missing',
          examples: ['Programming languages', 'Frameworks', 'Tools'],
          impact: 15,
        },
        {
          section: 'education' as const,
          importance: 'recommended' as const,
          description: 'Education background would strengthen your profile',
          examples: ['Degree', 'University', 'Graduation year'],
          impact: 8,
        },
      ];

      return {
        sections: mockSections,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          pageCount: 1,
          wordCount: Math.floor(Math.random() * 300) + 200,
          characterCount: Math.floor(Math.random() * 2000) + 1000,
          modifiedDate: new Date(file.lastModified),
          language: 'en',
        },
        suggestions: aiSuggestions,
        missingContent: mockMissingContent,
        atsCompatibility: {
          score: Math.random() * 0.3 + 0.7,
          issues: [
            {
              type: 'format',
              severity: 'medium',
              description: 'Complex table formatting may not parse correctly',
              location: 'Experience section',
              fix: 'Use simple bullet points instead of tables',
            },
          ],
          recommendations: [
            {
              title: 'Simplify formatting',
              description: 'Use standard fonts and simple layouts',
              impact: 15,
              effort: 'low',
              category: 'Format',
            },
          ],
          formatCompliance: {
            fonts: true,
            spacing: true,
            margins: true,
            headers: true,
            bullets: false,
            tables: false,
            images: true,
            links: true,
          },
        },
      };
    },
    [getAISuggestions]
  );

  // Generate enhanced analysis result
  const generateEnhancedAnalysis = useCallback(
    async (_file: File, extractedContent: ExtractedContent): Promise<EnhancedAnalysisResult> => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const overallScore = Math.floor(Math.random() * 30) + 70;

      return {
        id: generateAnalysisId(),
        overallScore,
        categoryScores: {
          ats: Math.random() * 30 + 70,
          keywords: Math.random() * 40 + 60,
          format: Math.random() * 20 + 80,
          content: Math.random() * 35 + 65,
          impact: Math.random() * 25 + 75,
          readability: Math.random() * 15 + 85,
        },
        suggestions: extractedContent.suggestions.map((suggestion) => ({
          id: suggestion.id,
          type: suggestion.type === 'format' ? 'format-improvement' : 'keyword-optimization',
          priority: suggestion.priority,
          category: suggestion.section === 'experience' ? 'content' : 'keywords',
          title: suggestion.title,
          description: suggestion.description,
          impact: {
            scoreIncrease: suggestion.impact,
            atsCompatibility: Math.random() * 0.2 + 0.1,
            readabilityImprovement: Math.random() * 0.15 + 0.05,
            keywordDensity: Math.random() * 0.1 + 0.05,
          },
          effort: {
            timeMinutes: Math.floor(Math.random() * 15) + 5,
            difficulty: suggestion.autoApplicable ? 'easy' : 'medium',
            requiresManualReview: !suggestion.autoApplicable,
          },
          isApplied: false,
          canAutoApply: suggestion.autoApplicable,
        })),
        achievements: [],
        nextMilestones: [],
        industryBenchmarks: {
          industry: 'Technology',
          role: 'Software Engineer',
          averageScore: 75,
          topPercentileScore: 90,
          commonKeywords: ['JavaScript', 'React', 'Node.js', 'Python'],
          trendingSkills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes'],
        },
        analysisTimestamp: new Date(),
        version: '2.0.0',
      };
    },
    []
  );

  // Enhanced upload simulation with detailed progress
  const simulateEnhancedUpload = useCallback(async (fileId: string) => {
    const steps = [
      { name: 'uploading' as const, duration: 2000, description: 'Uploading file...' },
      { name: 'processing' as const, duration: 3000, description: 'Processing content...' },
      { name: 'analyzing' as const, duration: 2000, description: 'Analyzing structure...' },
    ] as const;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step) continue;
      const baseProgress = (i / steps.length) * 100;

      // Simulate progress within each step
      for (let progress = 0; progress <= 100; progress += 5) {
        const totalProgress = baseProgress + progress / steps.length;
        const remainingSteps = steps.length - i - 1;
        const remainingTime =
          remainingSteps * 2000 + ((100 - progress) * (step.duration || 0)) / 100;

        setState((prev) => {
          const newUploadProgress = { ...prev.uploadProgress };
          newUploadProgress[fileId] = {
            ...newUploadProgress[fileId],
            fileId,
            fileName: newUploadProgress[fileId]?.fileName || '',
            progress: totalProgress,
            estimatedTimeRemaining: remainingTime,
            status: step.name,
          };
          return { ...prev, uploadProgress: newUploadProgress };
        });

        await new Promise((resolve) => setTimeout(resolve, (step.duration || 0) / 20));
      }

      // Update status when step is complete
      setState((prev) => {
        const newUploadProgress = { ...prev.uploadProgress };
        newUploadProgress[fileId] = {
          ...newUploadProgress[fileId],
          fileId,
          fileName: newUploadProgress[fileId]?.fileName || '',
          status: step.name,
          progress: 100,
        };
        return { ...prev, uploadProgress: newUploadProgress };
      });
    }
  }, []);

  // Traditional content analysis for backward compatibility
  const processFileContent = useCallback(async (file: File): Promise<ContentAnalysis> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      extractedText: 'Mock extracted text content...',
      detectedSections: [
        {
          type: 'contact',
          content: 'Contact information',
          startIndex: 0,
          endIndex: 100,
          confidence: 0.95,
        },
        {
          type: 'summary',
          content: 'Professional summary',
          startIndex: 100,
          endIndex: 300,
          confidence: 0.88,
        },
        {
          type: 'experience',
          content: 'Work experience',
          startIndex: 300,
          endIndex: 800,
          confidence: 0.92,
        },
      ],
      fileMetadata: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified),
        wordCount: Math.floor(Math.random() * 500) + 200,
      },
      qualityIndicators: {
        completeness: Math.random() * 0.3 + 0.7,
        formatting: Math.random() * 0.4 + 0.6,
        atsCompatibility: Math.random() * 0.5 + 0.5,
        readability: Math.random() * 0.3 + 0.7,
      },
    };
  }, []);

  // Generate live preview during upload
  const generateLivePreview = useCallback(
    async (file: File) => {
      try {
        // Simulate live preview generation
        await new Promise((resolve) => setTimeout(resolve, 500));

        const preview: LivePreview = {
          isEnabled: true,
          extractedText: await extractTextPreview(file),
          detectedSections: await detectSectionsPreview(file),
          qualityScore: Math.random() * 0.4 + 0.6, // Simulate quality score
        };

        setState((prev) => ({ ...prev, livePreview: preview }));
      } catch (error) {
        console.error('Failed to generate live preview:', error);
      }
    },
    [detectSectionsPreview, extractTextPreview]
  );

  // Enhanced upload process with real-time features
  const startEnhancedUpload = useCallback(
    async (files: File[]) => {
      setState((prev) => ({ ...prev, isProcessing: true }));

      for (const file of files) {
        const fileId = generateFileId(file);

        try {
          // Initialize progress with ETA calculation
          const initialProgress: UploadProgress = {
            fileId,
            fileName: file.name,
            progress: 0,
            status: 'uploading',
            estimatedTimeRemaining: estimateProcessingTime(file),
          };

          setState((prev) => ({
            ...prev,
            uploadProgress: {
              ...prev.uploadProgress,
              [fileId]: initialProgress,
            },
          }));

          onUploadProgress(initialProgress);

          // Start live preview generation
          await generateLivePreview(file);

          // Enhanced upload simulation with real-time feedback
          await simulateEnhancedUpload(fileId);

          // Smart content extraction and analysis
          const extractedContent = await extractSmartContent(file);
          setState((prev) => ({ ...prev, extractedContent }));
          onContentExtracted(extractedContent);

          // Traditional content analysis for backward compatibility
          const analysis = await processFileContent(file);
          onContentAnalysis(analysis);

          // Generate enhanced analysis result
          const enhancedAnalysis = await generateEnhancedAnalysis(file, extractedContent);
          onAnalysisReady(enhancedAnalysis);

          // Complete upload with results
          const result: UploadResult = {
            fileId,
            analysisId: generateAnalysisId(),
            initialScore: enhancedAnalysis.overallScore,
            processingTime: Date.now(),
          };

          onUploadComplete(result);

          // Update final progress
          const finalProgress: UploadProgress = {
            fileId,
            fileName: file.name,
            progress: 100,
            status: 'complete',
          };

          setState((prev) => ({
            ...prev,
            uploadProgress: {
              ...prev.uploadProgress,
              [fileId]: finalProgress,
            },
          }));

          onUploadProgress(finalProgress);
        } catch (error) {
          const uploadError: UploadError = {
            code: 'UPLOAD_FAILED',
            message: error instanceof Error ? error.message : 'Upload failed',
            details: {
              fileName: file.name,
              errorType: error instanceof Error ? error.constructor.name : 'Unknown',
              recoverySuggestions: [
                'Try uploading again',
                'Check your internet connection',
                'Try a different file format',
              ],
            },
          };

          setState((prev) => ({
            ...prev,
            uploadProgress: {
              ...prev.uploadProgress,
              [fileId]: {
                ...(prev.uploadProgress[fileId] || {
                  fileName: file.name,
                  progress: 0,
                  estimatedTimeRemaining: 0,
                }),
                fileId,
                status: 'error',
                error: uploadError.message,
              },
            },
          }));

          onError(uploadError);
        }
      }

      setState((prev) => ({ ...prev, isProcessing: false }));
    },
    [
      onUploadProgress,
      onContentAnalysis,
      onContentExtracted,
      onUploadComplete,
      onAnalysisReady,
      onError,
      estimateProcessingTime,
      extractSmartContent,
      generateEnhancedAnalysis,
      generateLivePreview,
      processFileContent,
      simulateEnhancedUpload,
    ]
  );

  // Enhanced file handling with batch processing
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: UploadError[] = [];

      // Validate each file
      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      });

      // Check multiple files limit
      if (!enableMultipleFiles && validFiles.length > 1) {
        errors.push({
          code: 'MULTIPLE_FILES_NOT_ALLOWED',
          message: 'Only one file can be uploaded at a time. Please select a single file.',
          details: { fileCount: validFiles.length },
        });
        return;
      }

      // Update state with new files
      setState((prev) => ({
        ...prev,
        files: enableMultipleFiles ? [...prev.files, ...validFiles] : validFiles,
        errors: [...prev.errors, ...errors],
      }));

      // Start enhanced upload process for valid files
      if (validFiles.length > 0) {
        await startEnhancedUpload(validFiles);
      }

      // Report errors with recovery suggestions
      errors.forEach((error) => {
        onError({
          ...error,
          details: {
            ...error.details,
            recoverySuggestions: generateRecoverySuggestions(error),
          },
        });
      });
    },
    [validateFile, enableMultipleFiles, onError, generateRecoverySuggestions, startEnhancedUpload]
  );

  // Event handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragActive: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setState((prev) => ({ ...prev, isDragActive: false }));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setState((prev) => ({ ...prev, isDragActive: false }));

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        if (document.activeElement === dropZoneRef.current) {
          event.preventDefault();
          fileInputRef.current?.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Enhanced Main Drop Zone */}
      <animated.div
        ref={dropZoneRef}
        style={dropZoneSpring}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        tabIndex={0}
        role="button"
        aria-label="Upload resume files with enhanced features"
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${state.isDragActive ? 'scale-105 border-primary bg-primary/5' : 'border-base-300 hover:border-primary/50 hover:shadow-lg'} `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={enableMultipleFiles}
          accept={acceptedFormats.map((f) => f.extension).join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={animationConfig}
          className="space-y-6"
        >
          {/* Enhanced Upload Icon */}
          <motion.div
            animate={{
              y: state.isDragActive ? -10 : 0,
              scale: state.isDragActive ? 1.1 : 1,
              rotate: state.isDragActive ? 5 : 0,
            }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary via-secondary to-accent text-3xl text-primary-content shadow-xl"
          >
            📄
          </motion.div>

          {/* Enhanced Upload Text */}
          <div className="space-y-3">
            <h3 className="font-bold text-2xl text-base-content">
              {state.isDragActive ? '�� Drop your files here' : '🚀 Upload your resume'}
            </h3>
            <p className="text-base-content/70 text-lg">
              Drag & drop, click to browse, or use our smart import options
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {acceptedFormats.map((format) => (
                <span key={format.extension} className="badge badge-outline badge-lg">
                  {format.extension.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Multi-Modal Input Options */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {/* Cloud Import Button */}
            {enableCloudImport && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCloudModal(true);
                }}
                className="btn btn-outline btn-lg gap-3 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <span className="text-xl">☁️</span>
                Cloud Import
              </button>
            )}

            {/* Camera Capture Button */}
            {cameraCapture.isSupported && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCameraModal(true);
                }}
                className="btn btn-outline btn-lg gap-3 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <span className="text-xl">📷</span>
                Camera
              </button>
            )}

            {/* Batch Upload Button */}
            {enableMultipleFiles && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="btn btn-outline btn-lg gap-3 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <span className="text-xl">📁</span>
                Batch Upload
              </button>
            )}
          </motion.div>

          {/* Enhanced Smart Suggestions */}
          {enableSmartSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-info/20 bg-gradient-to-r from-info/10 to-success/10 p-6 text-sm"
            >
              <div className="mb-3 flex items-center gap-3 text-info">
                <span className="text-xl">💡</span>
                <span className="font-semibold text-lg">Smart Upload Tips</span>
              </div>
              <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
                <ul className="space-y-2 text-base-content/70">
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    Upload both resume and cover letter for comprehensive analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    PDF format provides the most accurate analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    Ensure your file is up-to-date and error-free
                  </li>
                </ul>
                <ul className="space-y-2 text-base-content/70">
                  <li className="flex items-center gap-2">
                    <span className="text-info">💡</span>
                    Use cloud import for seamless file access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-info">💡</span>
                    Camera capture works best with good lighting
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-info">💡</span>
                    Batch upload multiple versions for comparison
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Loading Overlay */}
        <AnimatePresence>
          {state.isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center rounded-3xl bg-base-100/90 backdrop-blur-md"
            >
              <div className="space-y-6 text-center">
                <div className="relative">
                  <div className="loading loading-spinner loading-lg text-primary" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-base-content text-lg">
                    Processing your files...
                  </p>
                  <p className="text-base-content/60 text-sm">
                    AI is analyzing your content for optimal results
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </animated.div>

      {/* Live Preview Section */}
      <AnimatePresence>
        {state.livePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card border border-primary/20 bg-gradient-to-br from-base-100 to-base-200 shadow-xl"
          >
            <div className="card-body p-6">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="flex items-center gap-3 font-bold text-base-content text-xl">
                  <span className="text-2xl">👁️</span>
                  Live Preview
                  <span className="badge badge-primary badge-lg">Real-time</span>
                </h4>
                <div className="flex items-center gap-3">
                  <div
                    className="radial-progress text-primary"
                    style={
                      {
                        '--value': Math.round(state.livePreview.qualityScore * 100),
                      } as React.CSSProperties
                    }
                  >
                    <span className="font-bold text-sm">
                      {Math.round(state.livePreview.qualityScore * 100)}%
                    </span>
                  </div>
                  <span className="text-base-content/60 text-sm">Quality Score</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Preview Content */}
                <div className="space-y-4">
                  <h5 className="flex items-center gap-2 font-semibold text-lg">
                    <span>📄</span>
                    Content Preview
                  </h5>
                  {state.livePreview.previewUrl ? (
                    <img
                      src={state.livePreview.previewUrl}
                      alt="Document preview"
                      className="h-48 w-full rounded-lg border object-cover shadow-md"
                    />
                  ) : (
                    <div className="rounded-lg bg-base-300 p-4 font-mono text-sm leading-relaxed">
                      {state.livePreview.extractedText?.substring(0, 300)}...
                    </div>
                  )}
                </div>

                {/* Detected Sections */}
                <div className="space-y-4">
                  <h5 className="flex items-center gap-2 font-semibold text-lg">
                    <span>🔍</span>
                    Detected Sections
                  </h5>
                  <div className="space-y-3">
                    {state.livePreview.detectedSections.map((section, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between rounded-lg border bg-base-100 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              section.confidence > 0.8
                                ? 'bg-success'
                                : section.confidence > 0.6
                                  ? 'bg-warning'
                                  : 'bg-error'
                            }`}
                          />
                          <span className="font-medium capitalize">{section.type}</span>
                          {!section.isComplete && (
                            <span className="badge badge-warning badge-sm">Incomplete</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {Math.round(section.confidence * 100)}%
                          </span>
                          <div
                            className="tooltip"
                            data-tip={`Confidence: ${Math.round(section.confidence * 100)}%`}
                          >
                            <div
                              className={`h-2 w-2 rounded-full ${
                                section.confidence > 0.8
                                  ? 'bg-success'
                                  : section.confidence > 0.6
                                    ? 'bg-warning'
                                    : 'bg-error'
                              }`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cloud Storage Modal */}
      {showCloudModal && (
        <CloudStorageModal
          isOpen={showCloudModal}
          onClose={() => setShowCloudModal(false)}
          onFileSelect={handleFiles}
        />
      )}

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <CameraCaptureModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onCapture={handleFiles}
          videoRef={videoRef}
          canvasRef={canvasRef}
        />
      )}
    </div>
  );
};

// Utility Functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

const generateFileId = (file: File): string => {
  return `${file.name}-${file.size}-${file.lastModified}`;
};

const generateAnalysisId = (): string => {
  return `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default EnhancedSmartUpload;
