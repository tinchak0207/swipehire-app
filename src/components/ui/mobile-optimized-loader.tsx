'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileOptimizedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function MobileOptimizedLoader({
  size = 'md',
  className,
  text = 'Loading...',
}: MobileOptimizedLoaderProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8 sm:h-6 sm:w-6',
    lg: 'h-12 w-12 sm:h-8 sm:w-8',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 sm:gap-2 p-4 sm:p-2',
        className
      )}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground font-medium">{text}</p>}
    </div>
  );
}
