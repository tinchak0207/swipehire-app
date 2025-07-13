/**
 * PDF Test Component for debugging PDF parsing issues
 * This component helps identify and resolve PDF.js configuration problems
 */

'use client';

import type React from 'react';
import { useState } from 'react';
import type { ParsedFileResult } from '@/services/fileParsingService';
import { parseFile, validateFile } from '@/services/fileParsingService';

export const PDFTestComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileTest = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setTestResult('Starting test...\n');

    try {
      // Step 1: Validate file
      setTestResult((prev) => `${prev}Step 1: Validating file "${file.name}"...\n`);
      const validation = validateFile(file);

      if (!validation.isValid) {
        setTestResult((prev) => `${prev}✓ Validation failed: ${validation.error}\n`);
        return;
      }

      setTestResult((prev) => `${prev}✓ File validation passed\n`);
      setTestResult(
        (prev) => `${prev}   - File size: ${(file.size / 1024 / 1024).toFixed(2)} MB\n`
      );
      setTestResult((prev) => `${prev}   - File type: ${file.type}\n`);

      // Step 2: Test PDF.js initialization
      setTestResult((prev) => `${prev}\nStep 2: Testing PDF.js initialization...\n`);

      try {
        const pdfjsLib = await import('pdfjs-dist');
        setTestResult((prev) => `${prev}✓ PDF.js imported successfully\n`);
        setTestResult((prev) => `${prev}   - Version: ${pdfjsLib.version}\n`);

        // Configure worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
        setTestResult((prev) => `${prev}✓ Worker configured\n`);
        setTestResult(
          (prev) => `${prev}   - Worker source: ${pdfjsLib.GlobalWorkerOptions.workerSrc}\n`
        );
      } catch (pdfError) {
        setTestResult((prev) => `${prev}✗ PDF.js initialization failed: ${pdfError}\n`);
        return;
      }

      // Step 3: Parse file
      setTestResult((prev) => `${prev}\nStep 3: Parsing file...\n`);

      const result: ParsedFileResult = await parseFile(file, {
        onProgress: (progress) => {
          setTestResult(
            (prev) => `${prev}   - ${progress.stage}: ${progress.progress}% - ${progress.message}\n`
          );
        },
      });

      setTestResult((prev) => `${prev}\n✓ File parsed successfully!\n`);
      setTestResult(
        (prev) => `${prev}   - Extracted text length: ${result.text.length} characters\n`
      );
      setTestResult((prev) => `${prev}   - Word count: ${result.metadata.wordCount}\n`);
      setTestResult((prev) => `${prev}   - Page count: ${result.metadata.pageCount || 'N/A'}\n`);
      setTestResult((prev) => `${prev}   - Processing time: ${result.metadata.extractionTime}ms\n`);

      // Show first 200 characters of extracted text
      const preview = result.text.substring(0, 200);
      setTestResult(
        (prev) =>
          prev +
          `\nText preview (first 200 chars):\n"${preview}${result.text.length > 200 ? '...' : ''}"\n`
      );
    } catch (error) {
      setTestResult((prev) => `${prev}\n✗ Error occurred:\n`);
      if (error instanceof Error) {
        setTestResult((prev) => `${prev}   - Message: ${error.message}\n`);
        setTestResult((prev) => `${prev}   - Name: ${error.name}\n`);
        if ('code' in error) {
          setTestResult((prev) => `${prev}   - Code: ${(error as any).code}\n`);
        }
        setTestResult((prev) => `${prev}   - Stack: ${error.stack}\n`);
      } else {
        setTestResult((prev) => `${prev}   - Unknown error: ${error}\n`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResult('');
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 font-bold text-2xl">PDF Parsing Debug Tool</h2>

      <div className="mb-4">
        <label className="mb-2 block font-medium text-gray-700 text-sm">
          Select a PDF file to test:
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileTest}
          disabled={isLoading}
          className="block w-full text-gray-500 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 file:text-sm hover:file:bg-blue-100"
        />
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={clearResults}
          disabled={isLoading}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
        >
          Clear Results
        </button>
      </div>

      {isLoading && (
        <div className="mb-4 rounded border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
            <span className="text-blue-800">Processing file...</span>
          </div>
        </div>
      )}

      {testResult && (
        <div className="rounded border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold text-lg">Test Results:</h3>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded border bg-white p-3 font-mono text-sm">
            {testResult}
          </pre>
        </div>
      )}

      <div className="mt-6 rounded border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="mb-2 font-semibold text-lg text-yellow-800">Troubleshooting Tips:</h3>
        <ul className="space-y-1 text-sm text-yellow-700">
          <li>✓ Make sure you have a stable internet connection (PDF.js worker loads from CDN)</li>
          <li>✓ Try with a simple, text-based PDF first</li>
          <li>✓ Check browser console for additional error messages</li>
          <li>✓ Ensure the PDF is not password-protected</li>
          <li>✓ Try refreshing the page if you see worker initialization errors</li>
        </ul>
      </div>
    </div>
  );
};

export default PDFTestComponent;
