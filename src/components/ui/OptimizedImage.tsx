/**
 * Performance-optimized Image Component with accessibility features
 * Provides lazy loading, responsive images, and accessibility support
 */

import Image, { type ImageProps } from 'next/image';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useLazyImage } from '@/hooks/usePerformance';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  showLoadingSpinner?: boolean;
  loadingClassName?: string;
  errorClassName?: string;
  containerClassName?: string;
  lazy?: boolean;
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2' | 'auto';
  onLoadComplete?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  showLoadingSpinner = true,
  loadingClassName,
  errorClassName,
  containerClassName,
  lazy = true,
  aspectRatio = 'auto',
  className,
  onLoadComplete,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);

  // Use lazy loading hook if enabled
  const lazyImage = useLazyImage(src as string, {
    rootMargin: '50px',
    threshold: 0.1,
  });

  const handleLoad = useCallback(() => {
    setImageState('loaded');
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback(() => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setImageState('loading');
    } else {
      setImageState('error');
      onError?.();
    }
  }, [fallbackSrc, currentSrc, onError]);

  const getAspectRatioClasses = () => {
    const ratios = {
      square: 'aspect-square',
      '16/9': 'aspect-video',
      '4/3': 'aspect-[4/3]',
      '3/2': 'aspect-[3/2]',
      auto: '',
    };
    return ratios[aspectRatio];
  };

  const shouldUseLazy = lazy && typeof src === 'string';
  const imageSrc = shouldUseLazy ? lazyImage.src : src;

  return (
    <div className={cn('relative overflow-hidden', getAspectRatioClasses(), containerClassName)}>
      {/* Loading State */}
      {imageState === 'loading' && showLoadingSpinner && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-base-200',
            loadingClassName
          )}
          aria-hidden="true"
        >
          <div className="loading loading-spinner loading-md" />
        </div>
      )}

      {/* Error State */}
      {imageState === 'error' && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-base-200 text-base-content/50',
            errorClassName
          )}
          role="img"
          aria-label={`Failed to load image: ${alt}`}
        >
          <div className="text-center">
            <svg
              className="mx-auto mb-2 h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      )}

      {/* Actual Image */}
      {imageSrc && imageState !== 'error' && (
        <Image
          ref={shouldUseLazy ? lazyImage.imgRef : undefined}
          src={currentSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            {
              'opacity-0': imageState === 'loading',
              'opacity-100': imageState === 'loaded',
            },
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Screen reader loading announcement */}
      {imageState === 'loading' && (
        <span className="sr-only" aria-live="polite">
          Loading image: {alt}
        </span>
      )}

      {/* Screen reader error announcement */}
      {imageState === 'error' && (
        <span className="sr-only" aria-live="polite">
          Failed to load image: {alt}
        </span>
      )}
    </div>
  );
}

// Avatar component with optimized image
export interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackInitials?: string;
  className?: string;
  online?: boolean;
}

export function OptimizedAvatar({
  src,
  alt,
  size = 'md',
  fallbackInitials,
  className,
  online,
}: OptimizedAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getSizeClasses = () => {
    const sizes = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-24 h-24',
    };
    return sizes[size];
  };

  const getTextSizeClasses = () => {
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-2xl',
    };
    return sizes[size];
  };

  return (
    <div className={cn('avatar', { online: online }, className)}>
      <div className={cn('rounded-full', getSizeClasses())}>
        {src && !imageError ? (
          <OptimizedImage
            src={src}
            alt={alt}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            lazy={false} // Avatars are usually above the fold
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral text-neutral-content">
            <span className={cn('font-medium', getTextSizeClasses())}>
              {fallbackInitials || alt.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Gallery component with optimized images
export interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ImageGallery({ images, columns = 3, gap = 'md', className }: ImageGalleryProps) {
  const getGridClasses = () => {
    const gridCols = {
      2: 'grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };
    return gridCols[columns];
  };

  const getGapClasses = () => {
    const gaps = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };
    return gaps[gap];
  };

  return (
    <div
      className={cn('grid', getGridClasses(), getGapClasses(), className)}
      role="img"
      aria-label="Image gallery"
    >
      {images.map((image, index) => (
        <figure key={index} className="group">
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            width={400}
            height={300}
            className="h-auto w-full rounded-lg transition-transform duration-200 group-hover:scale-105"
            aspectRatio="4/3"
          />

          {image.caption && (
            <figcaption className="mt-2 text-center text-base-content/70 text-sm">
              {image.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

// Hero image component with optimized loading
export interface HeroImageProps {
  src: string;
  alt: string;
  overlay?: boolean;
  overlayOpacity?: number;
  children?: React.ReactNode;
  className?: string;
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'screen';
}

export function HeroImage({
  src,
  alt,
  overlay = false,
  overlayOpacity = 0.5,
  children,
  className,
  height = 'lg',
}: HeroImageProps) {
  const getHeightClasses = () => {
    const heights = {
      sm: 'h-64',
      md: 'h-80',
      lg: 'h-96',
      xl: 'h-[32rem]',
      screen: 'h-screen',
    };
    return heights[height];
  };

  return (
    <div className={cn('relative', getHeightClasses(), className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority // Hero images should load with high priority
        lazy={false}
      />

      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
          aria-hidden="true"
        />
      )}

      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="z-10 text-center text-white">{children}</div>
        </div>
      )}
    </div>
  );
}
