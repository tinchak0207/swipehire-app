'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number; // Added maxRating prop
  size?: number;
  disabled?: boolean;
}

export function StarRatingInput({
  rating,
  onRatingChange,
  maxRating = 5, // Default to 5 stars
  size = 24,
  disabled = false,
}: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (index: number) => {
    if (disabled) return;
    onRatingChange(index);
  };

  const handleStarHover = (index: number) => {
    if (disabled) return;
    setHoverRating(index);
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxRating)].map((_, i) => {
        const starValue = i + 1;
        return (
          <Star
            key={starValue}
            size={size}
            className={cn(
              'cursor-pointer transition-colors duration-150 ease-in-out',
              disabled
                ? 'cursor-not-allowed text-muted-foreground/50'
                : 'text-muted-foreground/50 hover:text-yellow-400',
              (hoverRating || rating) >= starValue
                ? disabled
                  ? 'fill-yellow-500/70 text-yellow-500/70'
                  : 'fill-yellow-400 text-yellow-400'
                : disabled
                  ? 'fill-muted-foreground/30'
                  : 'fill-muted-foreground/30'
            )}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${starValue} out of ${maxRating} stars`}
          />
        );
      })}
    </div>
  );
}
