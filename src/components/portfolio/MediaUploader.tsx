'use client';

import {
  CloudUploadIcon,
  EyeIcon,
  ImageIcon,
  MusicIcon,
  TrashIcon,
  VideoIcon,
  X,
} from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUploadMedia } from '@/hooks/usePortfolio';
import { AudioMedia, ImageMedia, Media, VideoMedia } from '@/lib/types/portfolio';

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
    [media.length, maxFiles, toast]
  );

  /**
   * Upload individual file
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
        formData.append('type', file.type.split('/')[0]); // image, video, or audio

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
      } catch (error) {
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
        return <ImageIcon className="w-5 h-5" />;
      case 'video':
        return <VideoIcon className="w-5 h-5" />;
      case 'audio':
        return <MusicIcon className="w-5 h-5" />;
    }
  };

  /**
   * Get media preview
   */
  const getMediaPreview = (mediaItem: Media, index: number) => {
    switch (mediaItem.type) {
      case 'image':
        return (
          <div className="relative group">
            <Image
              src={mediaItem.url}
              alt={mediaItem.alt}
              width={120}
              height={120}
              className="w-full h-24 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <button
                className="btn btn-ghost btn-sm text-white"
                onClick={() => setPreviewMedia(mediaItem)}
              >
                <EyeIcon className="w-4 h-4" />
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
              className="w-full h-24 object-cover rounded-lg"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoIcon className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="w-full h-24 bg-base-200 rounded-lg flex items-center justify-center">
            <MusicIcon className="w-8 h-8 text-base-content/60" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary/50'
        } ${media.length >= maxFiles ? 'opacity-50 pointer-events-none' : ''}`}
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

        <CloudUploadIcon className="w-12 h-12 mx-auto mb-4 text-base-content/40" />

        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragging ? 'Drop files here' : 'Upload Media Files'}
          </p>
          <p className="text-sm text-base-content/60">
            Drag and drop files here, or{' '}
            <button
              className="link link-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={media.length >= maxFiles}
            >
              browse files
            </button>
          </p>
          <p className="text-xs text-base-content/50">
            Supports images, videos, and audio files (max 10MB each)
          </p>
          <p className="text-xs text-base-content/50">
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
                <div className="flex justify-between text-sm mb-1">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((mediaItem, index) => (
            <div key={index} className="space-y-2">
              {/* Media Preview */}
              <div className="relative">
                {getMediaPreview(mediaItem, index)}

                {/* Remove Button */}
                <button
                  className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
                  onClick={() => handleRemoveMedia(index)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Media Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-base-content/60">
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
            <div className="flex justify-between items-center mb-4">
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
                className="w-full h-auto rounded-lg"
              />
            </div>

            <div className="mt-4">
              <p className="text-sm text-base-content/60">
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
