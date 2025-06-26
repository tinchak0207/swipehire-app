# File Upload and Parsing Implementation

## Overview

This document describes the implementation of Task #14: File Upload and Parsing Logic for the SwipeHire Resume Optimizer feature. The implementation provides comprehensive file upload functionality with real-time text extraction from PDF and DOCX files.

## Features Implemented

### ✅ Core Functionality
- **File Upload with Drag & Drop**: Interactive file upload area with drag and drop support
- **File Type Validation**: Supports PDF, DOC, and DOCX files with proper validation
- **Real-time Text Extraction**: Uses `pdfjs-dist` for PDF parsing and `mammoth` for DOCX parsing
- **Progress Tracking**: Real-time progress updates during file processing
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **File Metadata Display**: Shows word count, character count, page count, and processing time

### ✅ Technical Implementation
- **TypeScript Support**: Fully typed with strict TypeScript configuration
- **Reusable Components**: Modular design with reusable hooks and components
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS and DaisyUI
- **Testing**: Comprehensive unit tests with Jest

## File Structure

```
src/
├── services/
│   ├── fileParsingService.ts          # Core file parsing logic
│   └── __tests__/
│       └── fileParsingService.test.ts # Unit tests
├── hooks/
│   └── useFileUpload.ts               # Reusable file upload hook
├── components/
│   └── ui/
│       └── FileUpload.tsx             # Reusable file upload component
├── lib/
│   └── resume-types.ts                # TypeScript type definitions
└── app/
    └── resume-optimizer/
        └── upload/
            └── page.tsx               # Main upload page implementation
```

## Key Components

### 1. File Parsing Service (`fileParsingService.ts`)

The core service that handles file parsing with the following features:

- **PDF Parsing**: Uses `pdfjs-dist` to extract text from PDF files
- **DOCX Parsing**: Uses `mammoth` to extract text from DOCX files
- **DOC Support**: Limited support for legacy DOC files
- **Validation**: File type, size, and content validation
- **Progress Tracking**: Real-time progress callbacks
- **Error Handling**: Custom error types with detailed messages
- **Timeout Support**: Configurable timeout for large files

```typescript
// Example usage
import { parseFile } from '@/services/fileParsingService';

const result = await parseFile(file, {
  onProgress: (progress) => console.log(progress),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  timeout: 30000 // 30 seconds
});
```

### 2. File Upload Hook (`useFileUpload.ts`)

A reusable React hook that manages file upload state:

- **State Management**: Handles file selection, validation, and parsing state
- **Event Handlers**: Drag & drop, file selection, and validation
- **Progress Tracking**: Real-time progress updates
- **Error Handling**: User-friendly error messages
- **Callbacks**: Success and error callbacks for integration

```typescript
// Example usage
import { useFileUpload } from '@/hooks/useFileUpload';

const {
  uploadState,
  handleFileChange,
  handleDrop,
  parseFile,
  clearFile
} = useFileUpload({
  onSuccess: (result) => console.log('File parsed:', result),
  onError: (error) => console.error('Error:', error)
});
```

### 3. File Upload Component (`FileUpload.tsx`)

A reusable UI component for file uploads:

- **Drag & Drop Interface**: Visual feedback for drag and drop operations
- **Progress Display**: Progress bar with stage indicators
- **Metadata Display**: File statistics and processing information
- **Accessibility**: Full keyboard navigation and screen reader support
- **Customizable**: Configurable props for different use cases

```typescript
// Example usage
import { FileUpload } from '@/components/ui/FileUpload';

<FileUpload
  onFileExtracted={(result) => setExtractedText(result.text)}
  showMetadata={true}
  maxFileSize={10 * 1024 * 1024}
/>
```

### 4. Upload Page (`upload/page.tsx`)

The main upload page that integrates all components:

- **Two-Column Layout**: File upload and target job information
- **Real-time Preview**: Shows extracted text with metadata
- **Form Integration**: Target job title and keywords input
- **Navigation**: Back button and breadcrumb navigation
- **Responsive Design**: Mobile-friendly layout

## TypeScript Types

### Core Types

```typescript
interface ParsedFileResult {
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

interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
  };
}

interface ResumeParsingProgress {
  stage: 'uploading' | 'extracting' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
}
```

## Error Handling

### Custom Error Types

```typescript
class FileParsingError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'FileParsingError';
  }
}
```

### Error Codes

- `VALIDATION_ERROR`: File validation failed
- `PDF_PARSE_ERROR`: PDF parsing failed
- `DOCX_PARSE_ERROR`: DOCX parsing failed
- `DOC_PARSE_ERROR`: DOC parsing failed
- `TIMEOUT_ERROR`: File parsing timed out
- `UNKNOWN_ERROR`: Unexpected error occurred

## Testing

### Test Coverage

- ✅ File validation (type, size, content)
- ✅ Error handling and edge cases
- ✅ Utility functions (formatFileSize, getFileTypeIcon)
- ✅ Custom error types
- ✅ TypeScript type safety

### Running Tests

```bash
# Run all tests
npm test

# Run file parsing service tests only
npm test -- src/services/__tests__/fileParsingService.test.ts

# Run tests with coverage
npm run test:coverage
```

## Dependencies

### Production Dependencies

```json
{
  "pdfjs-dist": "^3.11.174",
  "mammoth": "^1.6.0"
}
```

### Development Dependencies

```json
{
  "@types/jest": "^30.0.0",
  "jest": "^30.0.2",
  "jest-environment-jsdom": "^30.0.2"
}
```

## Performance Considerations

### File Size Limits
- **Default**: 10MB maximum file size
- **Configurable**: Can be adjusted per use case
- **Validation**: Early validation prevents unnecessary processing

### Processing Optimization
- **Streaming**: Uses ArrayBuffer for efficient memory usage
- **Progress Tracking**: Non-blocking progress updates
- **Timeout Protection**: Prevents hanging on large files
- **Error Recovery**: Graceful degradation on parsing failures

### Memory Management
- **Cleanup**: Automatic cleanup of temporary objects
- **Garbage Collection**: Proper disposal of large buffers
- **Resource Management**: URL.revokeObjectURL for blob cleanup

## Accessibility Features

### Keyboard Navigation
- **Tab Navigation**: All interactive elements are keyboard accessible
- **Enter/Space**: File selection via keyboard
- **Focus Management**: Proper focus indicators

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all elements
- **Role Attributes**: Proper semantic roles
- **Live Regions**: Progress updates announced to screen readers

### Visual Accessibility
- **High Contrast**: Clear visual indicators
- **Color Independence**: Information not conveyed by color alone
- **Responsive Text**: Scalable text and UI elements

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Required APIs
- **File API**: For file reading and validation
- **ArrayBuffer**: For binary data processing
- **Drag and Drop API**: For drag and drop functionality
- **Web Workers**: For PDF.js processing (automatically handled)

## Security Considerations

### File Validation
- **Type Checking**: MIME type and extension validation
- **Size Limits**: Prevents DoS attacks via large files
- **Content Validation**: Basic content structure validation

### Data Privacy
- **Client-Side Processing**: All parsing happens in the browser
- **No Server Upload**: Files are not sent to external servers
- **Memory Cleanup**: Automatic cleanup of sensitive data

### Error Information
- **Safe Error Messages**: No sensitive information in error messages
- **Logging**: Minimal logging of file processing details

## Future Enhancements

### Planned Features
- [ ] OCR support for scanned PDFs
- [ ] Additional file format support (RTF, TXT)
- [ ] Batch file processing
- [ ] File compression before processing
- [ ] Advanced text cleaning and formatting

### Performance Improvements
- [ ] Web Worker integration for heavy processing
- [ ] Streaming text extraction for large files
- [ ] Caching of parsed results
- [ ] Progressive loading for large documents

## Usage Examples

### Basic File Upload

```typescript
import { FileUpload } from '@/components/ui/FileUpload';

function MyComponent() {
  const handleFileExtracted = (result: ParsedFileResult) => {
    console.log('Extracted text:', result.text);
    console.log('Word count:', result.metadata.wordCount);
  };

  return (
    <FileUpload
      onFileExtracted={handleFileExtracted}
      maxFileSize={5 * 1024 * 1024} // 5MB
      showMetadata={true}
    />
  );
}
```

### Custom Hook Usage

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';

function CustomUploadComponent() {
  const {
    uploadState,
    handleFileChange,
    parseFile,
    clearFile
  } = useFileUpload({
    maxFileSize: 10 * 1024 * 1024,
    onSuccess: (result) => {
      // Handle successful parsing
      setResumeText(result.text);
    },
    onError: (error) => {
      // Handle errors
      setErrorMessage(error.message);
    }
  });

  return (
    <div>
      <input
        type="file"
        accept=".pdf,.docx,.doc"
        onChange={handleFileChange}
      />
      {uploadState.file && (
        <button onClick={parseFile}>
          Extract Text
        </button>
      )}
    </div>
  );
}
```

### Direct Service Usage

```typescript
import { parseFile, validateFile } from '@/services/fileParsingService';

async function processFile(file: File) {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Parse file with progress tracking
  const result = await parseFile(file, {
    onProgress: (progress) => {
      console.log(`${progress.stage}: ${progress.progress}%`);
    },
    timeout: 30000
  });

  return result;
}
```

## Conclusion

The file upload and parsing implementation provides a robust, accessible, and user-friendly solution for extracting text content from resume files. The modular design allows for easy integration and customization, while comprehensive error handling and progress tracking ensure a smooth user experience.

The implementation successfully meets all requirements from Task #14:
- ✅ File upload with validation
- ✅ PDF and DOCX parsing
- ✅ Error handling and loading states
- ✅ TypeScript types and interfaces
- ✅ Progress tracking and user feedback
- ✅ Comprehensive testing

The solution is production-ready and can be easily extended for additional file formats or enhanced functionality in the future.