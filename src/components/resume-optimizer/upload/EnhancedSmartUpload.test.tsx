import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SmartUploadProps } from '../types';
import { EnhancedSmartUpload } from './EnhancedSmartUpload';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock react-spring
vi.mock('react-spring', () => ({
  useSpring: () => ({}),
  animated: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock Radix UI components
vi.mock('@radix-ui/react-progress', () => ({
  Root: ({ children, ...props }: any) => (
    <div role="progressbar" {...props}>
      {children}
    </div>
  ),
  Indicator: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children }: any) => children,
  Root: ({ children }: any) => children,
  Trigger: ({ children, asChild, ...props }: any) =>
    asChild ? React.cloneElement(children, props) : <div {...props}>{children}</div>,
  Portal: ({ children }: any) => children,
  Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Arrow: ({ ...props }: any) => <div {...props} />,
}));

vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, open }: any) => (open ? children : null),
  Portal: ({ children }: any) => children,
  Overlay: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Title: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  Close: ({ children, asChild, ...props }: any) =>
    asChild ? React.cloneElement(children, props) : <button {...props}>{children}</button>,
}));

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
  },
});

describe('EnhancedSmartUpload', () => {
  const defaultProps: SmartUploadProps = {
    acceptedFormats: [
      { extension: '.pdf', mimeType: 'application/pdf', maxSize: 10 * 1024 * 1024 },
      {
        extension: '.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        maxSize: 10 * 1024 * 1024,
      },
    ],
    maxFileSize: 10 * 1024 * 1024,
    enableMultipleFiles: true,
    enableCloudImport: true,
    enableSmartSuggestions: true,
    onUploadProgress: vi.fn(),
    onContentAnalysis: vi.fn(),
    onContentExtracted: vi.fn(),
    onUploadComplete: vi.fn(),
    onAnalysisReady: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the upload component with all features', () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    // Check main upload area
    expect(screen.getByText('🚀 Upload your resume')).toBeInTheDocument();
    expect(
      screen.getByText('Drag & drop, click to browse, or use our smart import options')
    ).toBeInTheDocument();

    // Check multi-modal options
    expect(screen.getByText('Cloud Import')).toBeInTheDocument();
    expect(screen.getByText('Camera')).toBeInTheDocument();
    expect(screen.getByText('Batch Upload')).toBeInTheDocument();

    // Check smart tips
    expect(screen.getByText('Smart Upload Tips')).toBeInTheDocument();
  });

  it('shows accepted file formats', () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('DOCX')).toBeInTheDocument();
  });

  it('opens cloud storage modal when cloud import is clicked', () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    const cloudButton = screen.getByText('Cloud Import');
    fireEvent.click(cloudButton);

    // Modal should be rendered (mocked to show when open=true)
    expect(screen.getByText('Import from Cloud Storage')).toBeInTheDocument();
  });

  it('opens camera modal when camera button is clicked', () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    const cameraButton = screen.getByText('Camera');
    fireEvent.click(cameraButton);

    // Modal should be rendered (mocked to show when open=true)
    expect(screen.getByText('Camera Capture')).toBeInTheDocument();
  });

  it('handles file selection through input', async () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(defaultProps.onUploadProgress).toHaveBeenCalled();
    });
  });

  it('validates file size and shows error for oversized files', async () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    const oversizedFile = new File(['x'.repeat(20 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [oversizedFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'FILE_TOO_LARGE',
        })
      );
    });
  });

  it('validates file type and shows error for unsupported files', async () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    const unsupportedFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [unsupportedFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INVALID_FILE_TYPE',
        })
      );
    });
  });

  it('handles drag and drop events', () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    const dropZone = screen.getByRole('button', { name: /upload resume files/i });

    // Test drag enter
    fireEvent.dragEnter(dropZone);
    expect(screen.getByText('🎯 Drop your files here')).toBeInTheDocument();

    // Test drag leave
    fireEvent.dragLeave(dropZone);

    // Test drop
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });
  });

  it('disables multiple files when enableMultipleFiles is false', async () => {
    const props = { ...defaultProps, enableMultipleFiles: false };
    render(<EnhancedSmartUpload {...props} />);

    const file1 = new File(['test1'], 'test1.pdf', { type: 'application/pdf' });
    const file2 = new File(['test2'], 'test2.pdf', { type: 'application/pdf' });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file1, file2],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'MULTIPLE_FILES_NOT_ALLOWED',
        })
      );
    });
  });

  it('hides cloud import when disabled', () => {
    const props = { ...defaultProps, enableCloudImport: false };
    render(<EnhancedSmartUpload {...props} />);

    expect(screen.queryByText('Cloud Import')).not.toBeInTheDocument();
  });

  it('hides smart suggestions when disabled', () => {
    const props = { ...defaultProps, enableSmartSuggestions: false };
    render(<EnhancedSmartUpload {...props} />);

    expect(screen.queryByText('Smart Upload Tips')).not.toBeInTheDocument();
  });

  it('shows processing overlay when files are being processed', async () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Should show processing overlay
    await waitFor(() => {
      expect(screen.getByText('Processing your files...')).toBeInTheDocument();
      expect(
        screen.getByText('AI is analyzing your content for optimal results')
      ).toBeInTheDocument();
    });
  });

  it('calls all callback functions during upload process', async () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Wait for all callbacks to be called
    await waitFor(
      () => {
        expect(defaultProps.onUploadProgress).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        expect(defaultProps.onContentExtracted).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        expect(defaultProps.onContentAnalysis).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        expect(defaultProps.onAnalysisReady).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        expect(defaultProps.onUploadComplete).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it('supports keyboard navigation', () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    const dropZone = screen.getByRole('button', { name: /upload resume files/i });
    dropZone.focus();

    // Test Enter key
    fireEvent.keyDown(document, { key: 'Enter' });

    // Test Space key
    fireEvent.keyDown(document, { key: ' ' });
  });
});

describe('EnhancedSmartUpload Accessibility', () => {
  const defaultProps: SmartUploadProps = {
    acceptedFormats: [
      { extension: '.pdf', mimeType: 'application/pdf', maxSize: 10 * 1024 * 1024 },
    ],
    maxFileSize: 10 * 1024 * 1024,
    enableMultipleFiles: true,
    enableCloudImport: true,
    enableSmartSuggestions: true,
    onUploadProgress: vi.fn(),
    onContentAnalysis: vi.fn(),
    onContentExtracted: vi.fn(),
    onUploadComplete: vi.fn(),
    onAnalysisReady: vi.fn(),
    onError: vi.fn(),
  };

  it('has proper ARIA labels', () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    const dropZone = screen.getByRole('button', {
      name: 'Upload resume files with enhanced features',
    });
    expect(dropZone).toBeInTheDocument();
  });

  it('has proper focus management', () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    const dropZone = screen.getByRole('button');
    expect(dropZone).toHaveAttribute('tabIndex', '0');
  });

  it('provides screen reader announcements', () => {
    render(<EnhancedSmartUpload {...defaultProps} />);

    // Check for hidden file input
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('aria-hidden', 'true');
  });
});
