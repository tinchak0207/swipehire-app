'use client';

import {
  ArrowTopRightOnSquareIcon,
  BookmarkIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  TagIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon, HeartIcon } from '@heroicons/react/24/solid';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import type React from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRegisterEvent, useSaveEvent } from '@/hooks/useEvents';
import type { EventFormat, IndustryEvent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TikTokEventCardProps {
  event: IndustryEvent;
  userId?: string;
  isActive?: boolean;
  onBookmark?: () => void;
  onRegister?: () => void;
  'data-index'?: number;
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
      label: 'Upcoming',
      timeText: `Starts ${formatDistanceToNow(startDate, { addSuffix: true })}`,
      color: 'bg-blue-500',
    };
  }
  if (isAfter(now, startDate) && isBefore(now, endDate)) {
    return {
      status: 'live',
      label: 'Live Now',
      timeText: `Ends ${formatDistanceToNow(endDate, { addSuffix: true })}`,
      color: 'bg-red-500 animate-pulse',
    };
  }
  return {
    status: 'ended',
    label: 'Ended',
    timeText: `Ended ${formatDistanceToNow(endDate, { addSuffix: true })}`,
    color: 'bg-gray-500',
  };
};

export const TikTokEventCard: React.FC<TikTokEventCardProps> = ({
  event,
  userId,
  isActive = false,
  onBookmark,
  onRegister,
  'data-index': dataIndex,
}) => {
  const { saveEvent, unsaveEvent, isSaving, isUnsaving } = useSaveEvent();
  const { mutate: registerForEvent, isPending: isRegistering } = useRegisterEvent();
  const [liked, setLiked] = useState(false);

  const statusInfo = getEventStatusInfo(event);
  const isLoadingBookmark = isSaving || isUnsaving;

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (event.isSaved) {
      unsaveEvent({ eventId: event.id, userId });
    } else {
      saveEvent({ eventId: event.id, userId });
    }
    onBookmark?.();
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (event.isRegistered || !userId) {
      // Open external registration link
      window.open(event.registrationUrl, '_blank');
      return;
    }

    registerForEvent({ eventId: event.id, userId });
    onRegister?.();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLiked(!liked);
  };

  return (
    <div
      className={cn(
        'relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100',
        isActive && 'snap-start'
      )}
      data-index={dataIndex}
    >
      {/* Light monochromatic gradient background */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-gradient-to-br from-gray-50 via-white to-gray-100" />
      </div>

      {/* Main Content Container with 9:16 aspect ratio */}
      <div className="flex h-full items-center justify-center p-4">
        <div className="relative mx-auto w-full max-w-sm" style={{ aspectRatio: '9/16' }}>
          {/* Glassmorphism Card */}
          <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/30 bg-white/20 shadow-2xl backdrop-blur-xl">
            {/* Content Overlay */}
            <div className="relative z-10 flex h-full flex-col justify-between p-6 text-gray-800">
              {/* Top Section - Status and Type */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge
                    className={cn(
                      'text-xs font-semibold text-white bg-blue-500/80 backdrop-blur-sm'
                    )}
                  >
                    {statusInfo.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-gray-300/50 bg-white/30 text-gray-700 backdrop-blur-sm"
                  >
                    {getFormatIcon(event.format)} {formatEventType(event.eventType)}
                  </Badge>
                </div>

                {/* Featured Badge */}
                {event.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400/80 to-orange-500/80 font-semibold text-white backdrop-blur-sm">
                    ⭐ Featured
                  </Badge>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 space-y-4">
                {/* Event Title and Description */}
                <div className="space-y-2">
                  <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
                    {event.title}
                  </h1>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {event.shortDescription || event.description}
                  </p>
                </div>

                {/* Event Details in glassmorphism container */}
                <div className="rounded-2xl border border-white/40 bg-white/30 p-4 backdrop-blur-sm">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {/* Date & Time */}
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {format(new Date(event.startDateTime), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-gray-600">
                          {format(new Date(event.startDateTime), 'h:mm a')}
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {event.location.type === 'virtual'
                            ? 'Virtual Event'
                            : event.location.city || 'Location TBD'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {event.location.venue || event.location.platform || ''}
                        </div>
                      </div>
                    </div>

                    {/* Price & Organizer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-gray-900">
                          {event.isFree ? 'Free' : `$${event.price}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BuildingOfficeIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-xs text-gray-600">{event.organizer}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-blue-200/60 bg-blue-50/60 text-blue-700 text-xs backdrop-blur-sm"
                      >
                        #{tag}
                      </Badge>
                    ))}
                    {event.tags.length > 3 && (
                      <Badge
                        variant="outline"
                        className="border-gray-200/60 bg-gray-50/60 text-gray-700 text-xs backdrop-blur-sm"
                      >
                        +{event.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Speakers Preview */}
                {event.speakers.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-800">Featured Speakers</div>
                    <div className="flex space-x-2">
                      {event.speakers.slice(0, 2).map((speaker, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 rounded-full bg-white/40 px-3 py-1 backdrop-blur-sm"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                            {speaker.name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{speaker.name}</span>
                        </div>
                      ))}
                      {event.speakers.length > 2 && (
                        <div className="flex items-center justify-center rounded-full bg-white/40 px-2 py-1 backdrop-blur-sm">
                          <span className="text-xs text-gray-600">
                            +{event.speakers.length - 2}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="rounded-2xl border border-white/40 bg-white/30 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  {/* Left Side Actions */}
                  <div className="flex items-center space-x-4">
                    {/* Like Button */}
                    <button
                      onClick={handleLikeClick}
                      className="flex flex-col items-center space-y-1 transition-transform hover:scale-110"
                    >
                      <HeartIcon
                        className={cn(
                          'h-6 w-6 transition-colors',
                          liked ? 'text-red-500 fill-red-500' : 'text-gray-600'
                        )}
                      />
                      <span className="text-xs text-gray-600">{liked ? '1.2k' : '1.1k'}</span>
                    </button>

                    {/* Bookmark Button */}
                    {userId && (
                      <button
                        onClick={handleBookmarkClick}
                        disabled={isLoadingBookmark}
                        className="flex flex-col items-center space-y-1 transition-transform hover:scale-110 disabled:opacity-50"
                      >
                        {event.isSaved ? (
                          <BookmarkSolidIcon className="h-6 w-6 text-blue-600" />
                        ) : (
                          <BookmarkIcon className="h-6 w-6 text-gray-600" />
                        )}
                        <span className="text-xs text-gray-600">Save</span>
                      </button>
                    )}

                    {/* Share Button */}
                    <button className="flex flex-col items-center space-y-1 transition-transform hover:scale-110">
                      <ArrowTopRightOnSquareIcon className="h-6 w-6 text-gray-600" />
                      <span className="text-xs text-gray-600">Share</span>
                    </button>
                  </div>

                  {/* Right Side - Register Button */}
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={handleRegisterClick}
                      disabled={isRegistering}
                      size="lg"
                      className={cn(
                        'font-semibold transition-all duration-200 hover:scale-105 backdrop-blur-sm',
                        event.isRegistered
                          ? 'bg-green-500/80 text-white hover:bg-green-600/80'
                          : 'bg-blue-500/80 text-white hover:bg-blue-600/80'
                      )}
                    >
                      {isRegistering
                        ? 'Loading...'
                        : event.isRegistered
                          ? 'View Event'
                          : statusInfo.status === 'ended'
                            ? 'View Details'
                            : 'Register Now'}
                    </Button>

                    {statusInfo.status !== 'ended' && (
                      <div className="text-center">
                        <div className="text-xs text-gray-600">{statusInfo.timeText}</div>
                        {event.waitlistAvailable &&
                          event.capacity &&
                          event.registeredCount >= event.capacity && (
                            <div className="text-xs text-amber-600">Join Waitlist</div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
