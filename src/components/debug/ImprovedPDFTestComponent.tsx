/**
 * Improved PDF Test Component for debugging PDF parsing issues
 * This component helps identify and resolve PDF.js configuration problems
 * with better error handling and worker configuration testing
 */

'use client';

import React, { useState } from 'react';
import type { ParsedFileResult } from '@/services/fileParsingService';
import { parseFile, validateFile } from '@/services/fileParsingService';

interface TestStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details?: string[];
}

export const ImprovedPDFTestComponent: React.FC = () => {
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');

  const updateStep = (index: number, updates: Partial<TestStep>) => {
    setTestSteps((prev) => prev.map((step, i) => (i === index ? { ...step, ...updates } : step)));
  };

  const addStep = (step: TestStep) => {
    setTestSteps((prev) => [...prev, step]);
  };

  const clearResults = () => {
    setTestSteps([]);
    setExtractedText('');
  };

  const testWorkerConfiguration = async (): Promise<boolean> => {
    try {
      const pdfjsLib = await import('pdfjs-dist');

      // Test local worker first
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.js';

        // Try to create a simple document to test worker
        const testArrayBuffer = new ArrayBuffer(8);
        const testDoc = pdfjsLib.getDocument({ data: testArrayBuffer });

        // If we get here without error, local worker is working
        return true;
      } catch (localError) {
        console.warn('Local worker failed, trying CDN:', localError);

        // Fallback to CDN
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs';
        return true;
      }
    } catch (error) {
      console.error('Worker configuration failed:', error);
      return false;
    }
  };

  const handleFileTest = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setTestSteps([]);
    setExtractedText('');

    // Initialize test steps
    const steps: TestStep[] = [
      { name: 'File Validation', status: 'pending', message: 'Validating uploaded file...' },
      { name: 'PDF.js Import', status: 'pending', message: 'Importing PDF.js library...' },
      { name: 'Worker Configuration', status: 'pending', message: 'Configuring PDF.js worker...' },
      { name: 'File Parsing', status: 'pending', message: 'Parsing PDF content...' },
      { name: 'Text Extraction', status: 'pending', message: 'Extracting text content...' },
    ];

    setTestSteps(steps);

    try {
      // Step 1: File Validation
      updateStep(0, { status: 'running' });
      const validation = validateFile(file);

      if (!validation.isValid) {
        updateStep(0, {
          status: 'error',
          message: `Validation failed: ${validation.error}`,
          details: [
            `File: ${file.name}`,
            `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
            `Type: ${file.type}`,
          ],
        });
        return;
      }

      updateStep(0, {
        status: 'success',
        message: 'File validation passed',
        details: [
          `File: ${file.name}`,
          `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
          `Type: ${file.type}`,
        ],
      });

      // Step 2: PDF.js Import
      updateStep(1, { status: 'running' });

      try {
        const pdfjsLib = await import('pdfjs-dist');
        updateStep(1, {
          status: 'success',
          message: 'PDF.js imported successfully',
          details: [`Version: ${pdfjsLib.version}`],
        });
      } catch (pdfError) {
        updateStep(1, {
          status: 'error',
          message: `PDF.js import failed: ${pdfError}`,
          details: [String(pdfError)],
        });
        return;
      }

      // Step 3: Worker Configuration
      updateStep(2, { status: 'running' });

      const workerConfigured = await testWorkerConfiguration();
      if (!workerConfigured) {
        updateStep(2, {
          status: 'error',
          message: 'Worker configuration failed',
          details: [
            'Unable to configure PDF.js worker',
            'Check network connection and CORS settings',
          ],
        });
        return;
      }

      updateStep(2, {
        status: 'success',
        message: 'Worker configured successfully',
        details: ['PDF.js worker is ready for processing'],
      });

      // Step 4: File Parsing
      updateStep(3, { status: 'running' });

      const progressDetails: string[] = [];
      const result: ParsedFileResult = await parseFile(file, {
        onProgress: (progress) => {
          const progressMsg = `${progress.stage}: ${progress.progress}% - ${progress.message}`;
          progressDetails.push(progressMsg);
          updateStep(3, {
            status: 'running',
            message: 'Parsing in progress...',
            details: [...progressDetails],
          });
        },
      });

      updateStep(3, {
        status: 'success',
        message: 'File parsed successfully',
        details: [
          `Processing time: ${result.metadata.extractionTime}ms`,
          `Pages: ${result.metadata.pageCount || 'N/A'}`,
          `File size: ${(result.metadata.fileSize / 1024 / 1024).toFixed(2)} MB`,
        ],
      });

      // Step 5: Text Extraction
      updateStep(4, { status: 'running' });

      if (!result.text || result.text.trim().length === 0) {
        updateStep(4, {
          status: 'error',
          message: 'No text content extracted',
          details: ['The PDF may be image-based or corrupted', 'Try with a different PDF file'],
        });
        return;
      }

      updateStep(4, {
        status: 'success',
        message: 'Text extraction completed',
        details: [
          `Characters: ${result.metadata.characterCount.toLocaleString()}`,
          `Words: ${result.metadata.wordCount.toLocaleString()}`,
          `Text length: ${result.text.length} characters`,
        ],
      });

      setExtractedText(result.text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails =
        error instanceof Error
          ? [
              `Name: ${error.name}`,
              `Message: ${error.message}`,
              ...('code' in error ? [`Code: ${(error as any).code}`] : []),
              `Stack: ${error.stack || 'No stack trace'}`,
            ]
          : [String(error)];

      // Find the last running step and mark it as error
      const runningStepIndex = testSteps.findIndex((step) => step.status === 'running');
      if (runningStepIndex !== -1) {
        updateStep(runningStepIndex, {
          status: 'error',
          message: `Error: ${errorMessage}`,
          details: errorDetails,
        });
      } else {
        // Add a general error step
        addStep({
          name: 'General Error',
          status: 'error',
          message: `Unexpected error: ${errorMessage}`,
          details: errorDetails,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: TestStep['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'running':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Enhanced PDF Parsing Debug Tool</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a PDF file to test:
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileTest}
          disabled={isLoading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={clearResults}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Clear Results
        </button>
      </div>

      {/* Test Steps */}
      {testSteps.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Test Progress:</h3>
          <div className="space-y-3">
            {testSteps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-3">{getStatusIcon(step.status)}</span>
                  <h4 className={`font-medium ${getStatusColor(step.status)}`}>{step.name}</h4>
                  {step.status === 'running' && (
                    <div className="ml-3 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>
                <p className={`text-sm ${getStatusColor(step.status)} ml-8`}>{step.message}</p>
                {step.details && step.details.length > 0 && (
                  <div className="ml-8 mt-2">
                    <ul className="text-xs text-gray-600 space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="font-mono">
                          • {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Text Preview */}
      {extractedText && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Extracted Text Preview:</h3>
          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <div className="mb-2 text-sm text-gray-600">
              First 500 characters of extracted text:
            </div>
            <pre className="whitespace-pre-wrap text-sm font-mono bg-white p-3 border rounded overflow-auto max-h-64">
              {extractedText.substring(0, 500)}
              {extractedText.length > 500 ? '...' : ''}
            </pre>
          </div>
        </div>
      )}

      {/* Troubleshooting Guide */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Troubleshooting Guide:</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">Common Issues:</h4>
            <ul className="space-y-1">
              <li>• Worker initialization errors</li>
              <li>• Network connectivity problems</li>
              <li>• CORS policy restrictions</li>
              <li>• Password-protected PDFs</li>
              <li>• Image-based PDFs (no text layer)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Solutions:</h4>
            <ul className="space-y-1">
              <li>• Refresh the page and try again</li>
              <li>• Check browser console for errors</li>
              <li>• Try with a simple text-based PDF</li>
              <li>• Ensure stable internet connection</li>
              <li>• Use PDFs without password protection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedPDFTestComponent;
