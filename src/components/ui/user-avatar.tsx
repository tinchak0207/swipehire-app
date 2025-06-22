'use client';

import { UserCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallbackIcon?: boolean;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12',
};

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-7 w-7',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export function UserAvatar({
  src,
  alt = 'User avatar',
  fallbackText,
  size = 'md',
  className,
  showFallbackIcon = true,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [_imageLoading, setImageLoading] = useState(true);

  // Generate fallback text from alt or use provided fallbackText
  const getFallbackText = () => {
    if (fallbackText) return fallbackText;
    if (alt && alt !== 'User avatar') {
      return alt
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  // Check if we should show the image
  const shouldShowImage = src && !imageError && src.trim() !== '';

  const handleImageError = () => {
    console.warn(`[UserAvatar] Failed to load image: ${src}`);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {shouldShowImage && (
        <AvatarImage
          src={src}
          alt={alt}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className="object-cover"
        />
      )}
      <AvatarFallback
        className={cn('bg-primary/10 font-medium text-primary', textSizeClasses[size])}
      >
        {showFallbackIcon ? (
          <UserCircle className={cn('text-muted-foreground', iconSizeClasses[size])} />
        ) : (
          getFallbackText()
        )}
      </AvatarFallback>
    </Avatar>
  );
}

// Alternative implementation using Next.js Image with better error handling
export function UserAvatarWithNextImage({
  src,
  alt = 'User avatar',
  fallbackText,
  size = 'md',
  className,
  showFallbackIcon = true,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Generate fallback text from alt or use provided fallbackText
  const getFallbackText = () => {
    if (fallbackText) return fallbackText;
    if (alt && alt !== 'User avatar') {
      return alt
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  // Check if we should show the image
  const shouldShowImage = src && !imageError && src.trim() !== '';

  const handleImageError = () => {
    console.warn(`[UserAvatarWithNextImage] Failed to load image: ${src}`);
    setImageError(true);
  };

  const sizePixels = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  };

  if (shouldShowImage) {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-full bg-primary/10',
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={sizePixels[size]}
          height={sizePixels[size]}
          className="rounded-full object-cover"
          onError={handleImageError}
          unoptimized={src.startsWith('http')} // Don't optimize external images
          priority={false}
        />
      </div>
    );
  }

  // Fallback UI
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-full bg-primary/10 font-medium text-primary',
        sizeClasses[size],
        textSizeClasses[size],
        className
      )}
    >
      {showFallbackIcon ? (
        <UserCircle className={cn('text-muted-foreground', iconSizeClasses[size])} />
      ) : (
        getFallbackText()
      )}
    </div>
  );
}
