'use client';

import {
  ArrowTopRightOnSquareIcon,
  BookmarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import Link from 'next/link';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSaveEvent } from '@/hooks/useEvents';
import type { EventFormat, IndustryEvent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: IndustryEvent;
  userId?: string;
  className?: string;
  showDescription?: boolean;
  compact?: boolean;
}

const formatEventType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getFormatIcon = (format: EventFormat) => {
  switch (format) {
    case 'in_person':
      return '📍';
    case 'virtual':
      return '💻';
    case 'hybrid':
      return '🔄';
    default:
      return '📅';
  }
};

const getEventStatusInfo = (event: IndustryEvent) => {
  const now = new Date();
  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);

  if (isBefore(now, startDate)) {
    return {
      status: 'upcoming',
      text: `Starts ${formatDistanceToNow(startDate, { addSuffix: true })}`,
      className: 'text-blue-600 bg-blue-50',
    };
  }
  if (isAfter(now, startDate) && isBefore(now, endDate)) {
    return {
      status: 'live',
      text: 'Live now',
      className: 'text-green-600 bg-green-50',
    };
  }
  return {
    status: 'ended',
    text: `Ended ${formatDistanceToNow(endDate, { addSuffix: true })}`,
    className: 'text-gray-600 bg-gray-50',
  };
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  userId,
  className,
  showDescription = true,
  compact = false,
}) => {
  const { saveEvent, unsaveEvent, isSaving, isUnsaving } = useSaveEvent();
  const statusInfo = getEventStatusInfo(event);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) return;

    if (event.isSaved) {
      unsaveEvent({ eventId: event.id, userId });
    } else {
      saveEvent({ eventId: event.id, userId });
    }
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (event.registrationUrl) {
      window.open(event.registrationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatPrice = () => {
    if (event.isFree) return 'Free';
    if (event.price) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: event.currency || 'USD',
      }).format(event.price);
    }
    return 'Price TBA';
  };

  const isEventFull = event.capacity && event.registeredCount >= event.capacity;

  return (
    <Card
      className={cn(
        'group hover:-translate-y-1 relative overflow-hidden transition-all duration-200 hover:shadow-lg',
        'border border-gray-200 bg-white',
        compact ? 'h-auto' : 'h-full',
        className
      )}
    >
      {/* Featured badge */}
      {event.featured && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="default" className="bg-yellow-500 text-white">
            Featured
          </Badge>
        </div>
      )}

      {/* Save button */}
      {userId && (
        <div className="absolute top-3 right-3 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveToggle}
                disabled={isSaving || isUnsaving}
                className="h-8 w-8 rounded-full bg-white/90 p-0 shadow-sm hover:bg-white hover:shadow-md"
              >
                {event.isSaved ? (
                  <BookmarkSolidIcon className="h-4 w-4 text-blue-600" />
                ) : (
                  <BookmarkIcon className="h-4 w-4 text-gray-600" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{event.isSaved ? 'Remove from saved' : 'Save event'}</TooltipContent>
          </Tooltip>
        </div>
      )}

      <Link href={`/events/${event.id}`} className="block h-full">
        {/* Event image */}
        {event.bannerUrl && !compact && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        <CardHeader className={cn('space-y-2', compact ? 'pb-3' : 'pb-4')}>
          {/* Event status and type */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className={statusInfo.className}>
              {getFormatIcon(event.format)} {statusInfo.text}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {formatEventType(event.eventType)}
            </Badge>
          </div>

          {/* Title */}
          <h3
            className={cn(
              'line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-blue-600',
              compact ? 'text-base' : 'text-lg'
            )}
          >
            {event.title}
          </h3>

          {/* Description */}
          {showDescription && !compact && event.description && (
            <p className="line-clamp-2 text-gray-600 text-sm">{event.description}</p>
          )}
        </CardHeader>

        <CardContent className={cn('space-y-3', compact ? 'pt-0' : 'pt-0')}>
          {/* Date and time */}
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <CalendarIcon className="h-4 w-4 flex-shrink-0" />
            <span>
              {format(new Date(event.startDateTime), 'MMM d, yyyy')}
              {!compact && (
                <>
                  {' at '}
                  {format(new Date(event.startDateTime), 'h:mm a')}
                </>
              )}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPinIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {event.format === 'virtual'
                ? event.location.platform || 'Virtual Event'
                : event.location.city
                  ? `${event.location.city}${event.location.state ? `, ${event.location.state}` : ''}`
                  : 'Location TBA'}
            </span>
          </div>

          {/* Organizer */}
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <UsersIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{event.organizer.name}</span>
          </div>

          {/* Price and attendance */}
          {!compact && (
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <CurrencyDollarIcon className="h-4 w-4" />
                <span className={cn(event.isFree ? 'font-medium text-green-600' : 'text-gray-900')}>
                  {formatPrice()}
                </span>
              </div>

              <div className="flex items-center gap-1 text-gray-500">
                <UsersIcon className="h-3 w-3" />
                <span className="text-xs">
                  {event.registeredCount}
                  {event.capacity && ` / ${event.capacity}`}
                </span>
              </div>
            </div>
          )}

          {/* Industries and recommendation tags */}
          {!compact && (
            <div className="space-y-2">
              {/* Industry tags */}
              {event.industry && event.industry.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {event.industry.slice(0, 2).map((industry: string) => (
                    <Badge key={industry} variant="outline" className="text-xs">
                      {industry}
                    </Badge>
                  ))}
                  {event.industry.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{event.industry.length - 2} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Recommendation reasons */}
              {event.recommendationReasons && event.recommendationReasons.length > 0 && (
                <div className="space-y-1">
                  {event.recommendationReasons.slice(0, 1).map((reason, index) => (
                    <div key={index} className="flex items-center gap-1 text-blue-600 text-xs">
                      <span className="h-1 w-1 rounded-full bg-blue-600" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>

        {/* Footer with actions */}
        <CardFooter
          className={cn('flex items-center justify-between gap-2', compact ? 'pt-3' : 'pt-4')}
        >
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            {event.isRegistered && (
              <Badge variant="default" className="bg-green-600">
                Registered
              </Badge>
            )}
            {isEventFull && !event.isRegistered && <Badge variant="destructive">Full</Badge>}
          </div>

          {event.registrationUrl && (
            <Button variant="outline" size="sm" onClick={handleExternalLink} className="gap-1">
              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              {compact ? 'Register' : 'View Details'}
            </Button>
          )}
        </CardFooter>
      </Link>
    </Card>
  );
};
