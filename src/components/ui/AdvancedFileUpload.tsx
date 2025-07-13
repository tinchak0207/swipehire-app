'use client';

import {
  AlertCircle,
  Archive,
  Camera,
  CheckCircle,
  Download,
  Eye,
  File as FileIcon,
  FileText,
  Loader2,
  Music,
  Paperclip,
  RotateCcw,
  Upload,
  Video,
  X,
} from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * TypeScript interfaces for file upload system
 */
export type FileStatus = 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

export interface UploadedFile {
  readonly id: string;
  readonly file: File;
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly category: FileCategory;
  readonly status: FileStatus;
  readonly progress: number;
  readonly url?: string;
  readonly thumbnailUrl?: string;
  readonly error?: string;
  readonly metadata?: Record<string, unknown>;
  readonly uploadedAt?: Date;
}

export interface FileValidation {
  readonly maxSize: number; // in bytes
  readonly allowedTypes: readonly string[];
  readonly maxFiles: number;
  readonly minFiles?: number;
  readonly allowDuplicates?: boolean;
}

export interface UploadOptions {
  readonly url: string;
  readonly method?: 'POST' | 'PUT';
  readonly headers?: Record<string, string>;
  readonly fieldName?: string;
  readonly chunkSize?: number;
  readonly retryAttempts?: number;
  readonly timeout?: number;
}

export interface AdvancedFileUploadProps {
  readonly validation: FileValidation;
  readonly uploadOptions?: UploadOptions;
  readonly onFilesChange: (files: readonly UploadedFile[]) => void;
  readonly onUploadComplete?: (files: readonly UploadedFile[]) => void;
  readonly onUploadError?: (error: string, file: UploadedFile) => void;
  readonly initialFiles?: readonly UploadedFile[];
  readonly disabled?: boolean;
  readonly multiple?: boolean;
  readonly showPreview?: boolean;
  readonly showMetadata?: boolean;
  readonly allowCamera?: boolean;
  readonly allowMicrophone?: boolean;
  readonly dragAndDrop?: boolean;
  readonly autoUpload?: boolean;
  readonly className?: string;
  readonly placeholder?: string;
  readonly description?: string;
}

/**
 * File type detection and categorization
 */
const getFileCategory = (type: string): FileCategory => {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document';
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return 'archive';
  return 'other';
};

/**
 * File icon mapping
 */
const FILE_ICONS: Record<FileCategory, React.ElementType> = {
  image: FileText,
  video: Video,
  audio: Music,
  document: FileText,
  archive: Archive,
  other: FileIcon,
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

/**
 * File preview component
 */
const FilePreview: React.FC<{
  file: UploadedFile;
  onRemove: () => void;
  onRetry?: () => void;
  showMetadata?: boolean;
}> = ({ file, onRemove, onRetry, showMetadata = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  const Icon = FILE_ICONS[file.category];
  const previewUrl = file.url || (file.file ? URL.createObjectURL(file.file) : undefined);

  const handleRemove = useCallback(() => {
    onRemove();
  }, [onRemove]);

  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  const renderPreview = () => {
    if (file.category === 'image' && previewUrl) {
      return (
        <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted">
          <Image
            src={previewUrl}
            alt={file.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      );
    }

    if (file.category === 'video' && previewUrl) {
      return (
        <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted">
          <video src={previewUrl} className="h-full w-full object-cover" controls={false} muted />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Video className="h-8 w-8 text-white" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-32 w-full items-center justify-center rounded-md bg-muted">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        file.status === 'error' && 'border-destructive',
        file.status === 'success' && 'border-green-500'
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Preview */}
          {renderPreview()}

          {/* File Info */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-medium text-sm" title={file.name}>
                  {file.name}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {formatFileSize(file.size)} • {file.type}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {file.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {file.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                {file.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="h-6 w-6 p-0"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {file.status === 'uploading' && (
              <div className="space-y-1">
                <Progress value={file.progress} className="h-2" />
                <p className="text-center text-muted-foreground text-xs">
                  {file.progress}% uploaded
                </p>
              </div>
            )}

            {/* Error Message */}
            {file.status === 'error' && (
              <div className="space-y-2">
                <p className="text-destructive text-xs">{file.error}</p>
                {onRetry && (
                  <Button variant="outline" size="sm" onClick={handleRetry} className="w-full">
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Retry
                  </Button>
                )}
              </div>
            )}

            {/* Actions */}
            {file.status === 'success' && (
              <div className="flex gap-2">
                {previewUrl && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-1 h-3 w-3" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{file.name}</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[70vh] overflow-auto">
                        {file.category === 'image' && (
                          <Image
                            src={previewUrl}
                            alt={file.name}
                            width={800}
                            height={600}
                            className="h-auto w-full"
                          />
                        )}
                        {file.category === 'video' && (
                          <video src={previewUrl} controls className="h-auto w-full" />
                        )}
                        {file.category === 'audio' && (
                          <audio src={previewUrl} controls className="w-full" />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {file.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                )}
              </div>
            )}

            {/* Metadata */}
            {showMetadata && file.metadata && (
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="h-auto p-0 text-xs"
                >
                  {showDetails ? 'Hide details' : 'Show details'}
                </Button>

                {showDetails && (
                  <div className="space-y-1 text-muted-foreground text-xs">
                    {Object.entries(file.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Camera capture component
 */
const CameraCapture: React.FC<{
  onCapture: (file: File) => void;
  onClose: () => void;
}> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [_isCapturing, _setIsCapturing] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        }
      },
      'image/jpeg',
      0.9
    );
  }, [onCapture, onClose]);

  const handleClose = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onClose();
  }, [stream, onClose]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="h-auto w-full" />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleCapture} className="flex-1">
          <Camera className="mr-2 h-4 w-4" />
          Capture
        </Button>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

/**
 * Main Advanced File Upload Component
 */
export const AdvancedFileUpload: React.FC<AdvancedFileUploadProps> = ({
  validation,
  uploadOptions,
  onFilesChange,
  onUploadError,
  initialFiles = [],
  disabled = false,
  multiple = true,
  showPreview = true,
  showMetadata = false,
  allowCamera = false,
  dragAndDrop = true,
  autoUpload = true,
  className,
  placeholder = 'Drop files here or click to browse',
  description,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([...initialFiles]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const cameraRef = useRef<HTMLDivElement>(null);

  // Validate file against rules
  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > validation.maxSize) {
        return `File size exceeds ${formatFileSize(validation.maxSize)}`;
      }

      if (!validation.allowedTypes.includes(file.type)) {
        return `File type ${file.type} is not allowed`;
      }

      if (!validation.allowDuplicates) {
        const duplicate = files.find((f) => f.name === file.name && f.size === file.size);
        if (duplicate) {
          return 'Duplicate file detected';
        }
      }

      return null;
    },
    [validation, files]
  );

  // Create UploadedFile object from File
  const createUploadedFile = useCallback((file: File): UploadedFile => {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      category: getFileCategory(file.type),
      status: 'pending',
      progress: 0,
    };
  }, []);

  // Upload file to server
  const uploadFile = useCallback(
    async (uploadedFile: UploadedFile): Promise<void> => {
      if (!uploadOptions) return;

      const formData = new FormData();
      formData.append(uploadOptions.fieldName || 'file', uploadedFile.file);

      try {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, status: 'uploading' as FileStatus, progress: 0 } : f
          )
        );

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setFiles((prev) =>
              prev.map((f) => (f.id === uploadedFile.id ? { ...f, progress } : f))
            );
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id
                  ? {
                      ...f,
                      status: 'success' as FileStatus,
                      progress: 100,
                      url: response.url,
                      uploadedAt: new Date(),
                    }
                  : f
              )
            );
          } else {
            throw new Error(`Upload failed with status ${xhr.status}`);
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          throw new Error('Upload failed due to network error');
        });

        // Start upload
        xhr.open(uploadOptions.method || 'POST', uploadOptions.url);

        if (uploadOptions.headers) {
          Object.entries(uploadOptions.headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(formData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'error' as FileStatus, error: errorMessage }
              : f
          )
        );

        onUploadError?.(errorMessage, uploadedFile);
      }
    },
    [uploadOptions, onUploadError]
  );

  // Handle file selection
  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const newFiles: UploadedFile[] = [];
      const errors: string[] = [];

      // Check total file count
      if (files.length + fileList.length > validation.maxFiles) {
        errors.push(`Maximum ${validation.maxFiles} files allowed`);
        return;
      }

      // Process each file
      Array.from(fileList).forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          newFiles.push(createUploadedFile(file));
        }
      });

      if (errors.length > 0) {
        // Optionally, handle displaying these errors to the user
        console.error('File validation errors:', errors);
        return;
      }

      // Add files to state
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);

      // Auto-upload if enabled
      if (autoUpload && uploadOptions) {
        newFiles.forEach((file) => {
          uploadFile(file);
        });
      }
    },
    [
      files,
      validation,
      validateFile,
      createUploadedFile,
      onFilesChange,
      autoUpload,
      uploadOptions,
      uploadFile,
    ]
  );

  // Handle drag and drop
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && dragAndDrop) {
        setIsDragOver(true);
      }
    },
    [disabled, dragAndDrop]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    },
    [disabled, handleFiles]
  );

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        handleFiles(selectedFiles);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [handleFiles]
  );

  // Handle camera capture
  const handleCameraCapture = useCallback(
    (file: File) => {
      const fileList = new DataTransfer();
      fileList.items.add(file);
      handleFiles(fileList.files);
      setShowCamera(false);
    },
    [handleFiles]
  );

  // Remove file
  const handleRemoveFile = useCallback(
    (fileId: string) => {
      const updatedFiles = files.filter((f) => f.id !== fileId);
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    },
    [files, onFilesChange]
  );

  // Retry upload
  const handleRetryUpload = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId);
      if (file && uploadOptions) {
        uploadFile(file);
      }
    },
    [files, uploadOptions, uploadFile]
  );

  // Open file browser
  const openFileBrowser = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  // Calculate upload statistics
  const uploadStats = useMemo(() => {
    const total = files.length;
    const completed = files.filter((f) => f.status === 'success').length;
    const failed = files.filter((f) => f.status === 'error').length;
    const uploading = files.filter((f) => f.status === 'uploading').length;

    return { total, completed, failed, uploading };
  }, [files]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileBrowser}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          'hover:border-primary hover:bg-primary/5',
          isDragOver && 'border-primary bg-primary/10',
          disabled && 'cursor-not-allowed opacity-50',
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2'
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="File upload area"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFileBrowser();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={validation.allowedTypes.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
          aria-describedby="upload-description"
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <p className="font-medium text-lg">{placeholder}</p>
            {description && (
              <p id="upload-description" className="text-muted-foreground text-sm">
                {description}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Max {validation.maxFiles} files, {formatFileSize(validation.maxSize)} each
            </p>
          </div>

          {/* Additional Actions */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openFileBrowser();
              }}
              disabled={disabled}
            >
              <Paperclip className="mr-2 h-4 w-4" />
              Browse Files
            </Button>

            {allowCamera && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCamera(true);
                }}
                disabled={disabled}
              >
                <Camera className="mr-2 h-4 w-4" />
                Camera
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Statistics */}
      {files.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Upload Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="font-bold text-2xl">{uploadStats.total}</p>
                <p className="text-muted-foreground text-xs">Total</p>
              </div>
              <div>
                <p className="font-bold text-2xl text-green-600">{uploadStats.completed}</p>
                <p className="text-muted-foreground text-xs">Completed</p>
              </div>
              <div>
                <p className="font-bold text-2xl text-blue-600">{uploadStats.uploading}</p>
                <p className="text-muted-foreground text-xs">Uploading</p>
              </div>
              <div>
                <p className="font-bold text-2xl text-red-600">{uploadStats.failed}</p>
                <p className="text-muted-foreground text-xs">Failed</p>
              </div>
            </div>

            {uploadStats.total > 0 && (
              <Progress value={(uploadStats.completed / uploadStats.total) * 100} className="h-2" />
            )}
          </CardContent>
        </Card>
      )}

      {/* File Previews */}
      {showPreview && files.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <FilePreview
              key={file.id}
              file={file}
              onRemove={() => handleRemoveFile(file.id)}
              onRetry={() => handleRetryUpload(file.id)}
              showMetadata={showMetadata}
            />
          ))}
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <Dialog open={showCamera} onOpenChange={setShowCamera}>
          <DialogContent className="max-w-2xl" ref={cameraRef}>
            <DialogHeader>
              <DialogTitle>Capture Photo</DialogTitle>
            </DialogHeader>
            <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdvancedFileUpload;
