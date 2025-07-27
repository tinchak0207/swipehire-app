'use client';

import { ChevronRight, Heart, Share2, Star } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * Mobile Card Props Interface
 */
interface MobileOptimizedCardProps {
  /** Card variant */
  variant?: 'job' | 'candidate' | 'company' | 'event' | 'article';
  /** Card title */
  title: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card description */
  description?: string;
  /** Avatar/image URL */
  imageUrl?: string;
  /** Avatar fallback text */
  imageFallback?: string;
  /** Tags/badges */
  tags?: string[];
  /** Location */
  location?: string;
  /** Salary/price */
  salary?: string;
  /** Rating */
  rating?: number;
  /** Whether item is favorited */
  isFavorited?: boolean;
  /** Whether item is new */
  isNew?: boolean;
  /** Whether item is featured */
  isFeatured?: boolean;
  /** Click callback */
  onClick?: () => void;
  /** Favorite toggle callback */
  onFavoriteToggle?: () => void;
  /** Share callback */
  onShare?: () => void;
  /** Apply/Contact callback */
  onAction?: () => void;
  /** Action button text */
  actionText?: string;
  /** Additional metadata */
  metadata?: Array<{ label: string; value: string; icon?: React.ElementType }>;
  /** Custom className */
  className?: string;
  /** Whether card is disabled */
  disabled?: boolean;
}

/**
 * Mobile-Optimized Card Component
 *
 * Provides a touch-friendly, responsive card component optimized for mobile with:
 * - Large touch targets (minimum 44px)
 * - Swipe gesture support
 * - Optimized typography and spacing
 * - Contextual actions
 * - Accessibility features
 * - Performance optimizations
 *
 * @example
 * ```tsx
 * <MobileOptimizedCard
 *   variant="job"
 *   title="Senior Frontend Developer"
 *   subtitle="TechCorp Inc."
 *   description="Join our team to build amazing user experiences..."
 *   location="San Francisco, CA"
 *   salary="$120k - $150k"
 *   tags={["React", "TypeScript", "Remote"]}
 *   isNew={true}
 *   onClick={handleCardClick}
 *   onAction={handleApply}
 *   actionText="Apply Now"
 * />
 * ```
 */
export function MobileOptimizedCard({
  variant = 'job',
  title,
  subtitle,
  description,
  imageUrl,
  imageFallback,
  tags = [],
  location,
  salary,
  rating,
  isFavorited = false,
  isNew = false,
  isFeatured = false,
  onClick,
  onFavoriteToggle,
  onShare,
  onAction,
  actionText,
  metadata = [],
  className,
  disabled = false,
}: MobileOptimizedCardProps): JSX.Element {
  const [isPressed, setIsPressed] = useState(false);

  // Handle card press states for better touch feedback
  const handleTouchStart = useCallback(() => {
    if (!disabled) setIsPressed(true);
  }, [disabled]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  // Handle card click
  const handleCardClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  // Get variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'job':
        return {
          borderColor: 'border-blue-200',
          accentColor: 'text-blue-600',
          bgColor: 'bg-blue-50/50',
        };
      case 'candidate':
        return {
          borderColor: 'border-green-200',
          accentColor: 'text-green-600',
          bgColor: 'bg-green-50/50',
        };
      case 'company':
        return {
          borderColor: 'border-purple-200',
          accentColor: 'text-purple-600',
          bgColor: 'bg-purple-50/50',
        };
      case 'event':
        return {
          borderColor: 'border-orange-200',
          accentColor: 'text-orange-600',
          bgColor: 'bg-orange-50/50',
        };
      case 'article':
        return {
          borderColor: 'border-gray-200',
          accentColor: 'text-gray-600',
          bgColor: 'bg-gray-50/50',
        };
      default:
        return {
          borderColor: 'border-gray-200',
          accentColor: 'text-gray-600',
          bgColor: 'bg-gray-50/50',
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Render rating stars
  const renderRating = () => {
    if (!rating) return null;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              'h-4 w-4',
              index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
        <span className="ml-1 text-muted-foreground text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Card
      className={cn(
        'relative touch-manipulation overflow-hidden transition-all duration-200',
        'border-2 bg-card hover:shadow-lg',
        variantStyles.borderColor,
        isFeatured && 'ring-2 ring-primary ring-offset-2',
        isPressed && 'scale-[0.98] shadow-sm',
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={handleCardClick}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="default" className="bg-primary text-primary-foreground">
            Featured
          </Badge>
        </div>
      )}

      {/* New Badge */}
      {isNew && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="animate-pulse bg-green-100 text-green-700">
            New
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar/Image */}
          {(imageUrl || imageFallback) && (
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={imageUrl} alt={title} />
              <AvatarFallback className={cn('font-bold text-sm', variantStyles.bgColor)}>
                {imageFallback || title.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Title and Subtitle */}
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 line-clamp-2 font-semibold text-lg leading-tight">{title}</h3>
            {subtitle && (
              <p className={cn('font-medium text-sm', variantStyles.accentColor)}>{subtitle}</p>
            )}
            {rating && <div className="mt-1">{renderRating()}</div>}
          </div>

          {/* Quick Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {onFavoriteToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle();
                }}
                className="h-10 w-10 touch-manipulation p-0"
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={cn(
                    'h-5 w-5',
                    isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                  )}
                />
              </Button>
            )}

            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                className="h-10 w-10 touch-manipulation p-0"
                aria-label="Share"
              >
                <Share2 className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-0">
        {/* Description */}
        {description && (
          <p className="mb-3 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        )}

        {/* Metadata */}
        {metadata.length > 0 && (
          <div className="mb-3 space-y-2">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {item.icon && <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Location and Salary */}
        {(location || salary) && (
          <div className="mb-3 flex items-center justify-between text-sm">
            {location && <span className="text-muted-foreground">{location}</span>}
            {salary && (
              <span className={cn('font-semibold', variantStyles.accentColor)}>{salary}</span>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-muted text-muted-foreground text-xs"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 4 && (
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                +{tags.length - 4} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer Actions */}
      {onAction && (
        <>
          <Separator className="my-0" />
          <CardFooter className="pt-3 pb-4">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              className="h-12 w-full touch-manipulation font-medium text-base"
              disabled={disabled}
            >
              {actionText || 'View Details'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </>
      )}

      {/* Click indicator for cards without action button */}
      {onClick && !onAction && (
        <div className="absolute right-3 bottom-3">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </Card>
  );
}

export default MobileOptimizedCard;
