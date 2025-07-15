'use client';

import { CloudUploadIcon, EyeIcon, ImageIcon, MusicIcon, VideoIcon, X } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUploadMedia } from '@/hooks/usePortfolio';
import type { AudioMedia, ImageMedia, Media, VideoMedia } from '@/lib/types/portfolio';

interface MediaUploaderProps {
  media: Media[];
  onMediaUpdate: (media: Media[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

/**
 * MediaUploader Component
 *
 * A comprehensive media upload component supporting images, videos, and audio files.
 * Features:
 * - Drag and drop upload
 * - File type validation
 * - Upload progress tracking
 * - Media preview
 * - Media management (remove, reorder)
 * - Alt text editing for images
 */
const MediaUploader: React.FC<MediaUploaderProps> = ({
  media,
  onMediaUpdate,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*', 'audio/*'],
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);

  const uploadMediaMutation = useUploadMedia();
 
  /**
   * Handle file selection
   */
  const uploadFile = useCallback(
    async (file: File) => {
      // Validate file type
      const isValidType = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        toast({
          title: 'Invalid File Type',
          description: `File type ${file.type} is not supported.`,
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: 'File Too Large',
          description: 'File size must be less than 10MB.',
          variant: 'destructive',
        });
        return;
      }

      const fileId = `${Date.now()}-${file.name}`;

      try {
        // Initialize progress
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', file.type.split('/')[0] || ''); // image, video, or audio

        // Upload file
        const result = await uploadMediaMutation.mutateAsync(formData);

        // Create media object based on type
        let newMedia: Media;
        const mediaType = file.type.split('/')[0];

        switch (mediaType) {
          case 'image':
            newMedia = {
              type: 'image',
              url: result.url,
              alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for alt text
              width: result.width,
              height: result.height,
              size: result.size,
            } as ImageMedia;
            break;
          case 'video':
            newMedia = {
              type: 'video',
              url: result.url,
              duration: result.duration,
              size: result.size,
            } as VideoMedia;
            break;
          case 'audio':
            newMedia = {
              type: 'audio',
              url: result.url,
              duration: result.duration,
              size: result.size,
            } as AudioMedia;
            break;
          default:
            throw new Error('Unsupported media type');
        }

        // Add to media array
        onMediaUpdate([...media, newMedia]);

        toast({
          title: 'Upload Successful',
          description: `${file.name} has been uploaded successfully.`,
        });
      } catch (_error) {
        toast({
          title: 'Upload Failed',
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: 'destructive',
        });
      } finally {
        // Remove progress
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }
    },
    [acceptedTypes, media, onMediaUpdate, uploadMediaMutation, toast]
  );

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      // Check file limit
      if (media.length + fileArray.length > maxFiles) {
        toast({
          title: 'Too Many Files',
          description: `Maximum ${maxFiles} files allowed. You can upload ${maxFiles - media.length} more files.`,
          variant: 'destructive',
        });
        return;
      }

      // Validate and upload files
      for (const file of fileArray) {
        await uploadFile(file);
      }
    },
    [media.length, maxFiles, toast, uploadFile]
  );

  
  /**
   * Handle drag events
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files);
      }
    },
    [handleFileSelect]
  );

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files);
      }
      // Reset input value to allow re-uploading same file
      e.target.value = '';
    },
    [handleFileSelect]
  );

  /**
   * Remove media
   */
  const handleRemoveMedia = useCallback(
    (index: number) => {
      const updatedMedia = media.filter((_, i) => i !== index);
      onMediaUpdate(updatedMedia);
    },
    [media, onMediaUpdate]
  );

  /**
   * Update image alt text
   */
  const handleUpdateAltText = useCallback(
    (index: number, altText: string) => {
      const updatedMedia = media.map((item, i) => {
        if (i === index && item.type === 'image') {
          return { ...item, alt: altText } as ImageMedia;
        }
        return item;
      });
      onMediaUpdate(updatedMedia);
    },
    [media, onMediaUpdate]
  );

  /**
   * Get media icon
   */
  const getMediaIcon = (mediaType: Media['type']) => {
    switch (mediaType) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'video':
        return <VideoIcon className="h-5 w-5" />;
      case 'audio':
        return <MusicIcon className="h-5 w-5" />;
    }
  };

  /**
   * Get media preview
   */
  const getMediaPreview = (mediaItem: Media) => {
    switch (mediaItem.type) {
      case 'image':
        return (
          <div className="group relative">
            <Image
              src={mediaItem.url}
              alt={mediaItem.alt}
              width={120}
              height={120}
              className="h-24 w-full rounded-lg object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                className="btn btn-ghost btn-sm text-white"
                onClick={() => setPreviewMedia(mediaItem)}
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="relative">
            <video
              src={mediaItem.url}
              poster={mediaItem.poster}
              className="h-24 w-full rounded-lg object-cover"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoIcon className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="flex h-24 w-full items-center justify-center rounded-lg bg-base-200">
            <MusicIcon className="h-8 w-8 text-base-content/60" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary/50'
        } ${media.length >= maxFiles ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={media.length >= maxFiles}
        />

        <CloudUploadIcon className="mx-auto mb-4 h-12 w-12 text-base-content/40" />

        <div className="space-y-2">
          <p className="font-medium text-lg">
            {isDragging ? 'Drop files here' : 'Upload Media Files'}
          </p>
          <p className="text-base-content/60 text-sm">
            Drag and drop files here, or{' '}
            <button
              className="link link-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={media.length >= maxFiles}
            >
              browse files
            </button>
          </p>
          <p className="text-base-content/50 text-xs">
            Supports images, videos, and audio files (max 10MB each)
          </p>
          <p className="text-base-content/50 text-xs">
            {media.length} / {maxFiles} files uploaded
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <progress className="progress progress-primary w-full" value={progress} max="100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {media.map((mediaItem, index) => (
            <div key={index} className="space-y-2">
              {/* Media Preview */}
              <div className="relative">
                {getMediaPreview(mediaItem)}

                {/* Remove Button */}
                <button
                  className="-top-2 -right-2 btn btn-circle btn-xs btn-error absolute"
                  onClick={() => handleRemoveMedia(index)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* Media Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-base-content/60 text-xs">
                  {getMediaIcon(mediaItem.type)}
                  <span className="capitalize">{mediaItem.type}</span>
                </div>

                {/* Alt Text for Images */}
                {mediaItem.type === 'image' && (
                  <input
                    type="text"
                    placeholder="Alt text..."
                    className="input input-bordered input-xs w-full"
                    value={mediaItem.alt}
                    onChange={(e) => handleUpdateAltText(index, e.target.value)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Preview Modal */}
      {previewMedia && previewMedia.type === 'image' && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Image Preview</h3>
              <button className="btn btn-sm btn-circle" onClick={() => setPreviewMedia(null)}>
                ✕
              </button>
            </div>

            <div className="relative">
              <Image
                src={previewMedia.url}
                alt={previewMedia.alt}
                width={800}
                height={600}
                className="h-auto w-full rounded-lg"
              />
            </div>

            <div className="mt-4">
              <p className="text-base-content/60 text-sm">
                Alt text: {previewMedia.alt || 'No alt text provided'}
              </p>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setPreviewMedia(null)} />
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
