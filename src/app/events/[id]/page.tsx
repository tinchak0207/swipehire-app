'use client';

import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  BookmarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ShareIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import { useEvent, useRegisterEvent, useSaveEvent } from '@/hooks/useEvents';
import { generateEventSchema, StructuredData } from '@/lib/structured-data';
import { EventFormat, type EventSpeaker, type IndustryEvent } from '@/lib/types';

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
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

const SpeakerCard: React.FC<{ speaker: EventSpeaker }> = ({ speaker }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        {speaker.photoUrl && (
          <Image
            src={speaker.photoUrl}
            alt={speaker.name}
            className="h-12 w-12 rounded-full object-cover"
            width={48}
            height={48}
          />
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-gray-900">{speaker.name}</h4>
          {speaker.title && <p className="text-gray-600 text-sm">{speaker.title}</p>}
          {speaker.company && <p className="text-gray-500 text-sm">{speaker.company}</p>}
          {speaker.bio && <p className="mt-2 line-clamp-2 text-gray-600 text-sm">{speaker.bio}</p>}
        </div>
        {speaker.linkedinUrl && (
          <Button variant="ghost" size="sm" asChild>
            <a
              href={speaker.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

const EventDetailPage: React.FC<EventDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { mongoDbUserId } = useUserPreferences();
  const [eventId, setEventId] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then(({ id }) => setEventId(id));
  }, [params]);

  const { data: event, isLoading, isError, error } = useEvent(eventId || '');
  const { saveEvent, unsaveEvent, isSaving, isUnsaving } = useSaveEvent();
  const { mutate: registerForEvent, isPending: isRegistering } = useRegisterEvent();

  const handleSaveToggle = () => {
    if (!mongoDbUserId || !event) return;

    if (event.isSaved) {
      unsaveEvent({ eventId: event.id, userId: mongoDbUserId });
    } else {
      saveEvent({ eventId: event.id, userId: mongoDbUserId });
    }
  };

  const handleRegister = () => {
    if (!mongoDbUserId || !event) return;

    if (event.registrationUrl) {
      window.open(event.registrationUrl, '_blank', 'noopener,noreferrer');
    } else {
      registerForEvent({ eventId: event.id, userId: mongoDbUserId });
    }
  };

  const handleShare = async () => {
    if (!event) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (_error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link Copied',
          description: 'Event link has been copied to your clipboard.',
        });
      } catch (_error) {
        toast({
          title: 'Share Failed',
          description: 'Unable to share this event.',
          variant: 'destructive',
        });
      }
    }
  };

  const addToCalendar = () => {
    if (!event) return;

    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);

    // Format dates for Google Calendar
    const formatDate = (date: Date) => `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

    const calendarUrl = new URL('https://calendar.google.com/calendar/render');
    calendarUrl.searchParams.set('action', 'TEMPLATE');
    calendarUrl.searchParams.set('text', event.title);
    calendarUrl.searchParams.set('dates', `${formatDate(startDate)}/${formatDate(endDate)}`);
    calendarUrl.searchParams.set('details', event.description);

    if (event.location.type === EventFormat.VIRTUAL && event.location.meetingUrl) {
      calendarUrl.searchParams.set('location', event.location.meetingUrl);
    } else if (event.location.address) {
      calendarUrl.searchParams.set('location', event.location.address);
    }

    window.open(calendarUrl.toString(), '_blank', 'noopener,noreferrer');
  };

  if (isLoading || !eventId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="font-bold text-2xl text-gray-900">Event Not Found</h1>
          <p className="mt-2 text-gray-600">
            {error instanceof Error ? error.message : "The event you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push('/events')} className="mt-4">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getEventStatusInfo(event);
  const isEventFull = event.capacity && event.registeredCount >= event.capacity;
  const eventSchema = generateEventSchema(event);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{event.title} - SwipeHire Events</title>
        <meta name="description" content={event.description} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description} />
        <meta property="og:type" content="event" />
        {event.bannerUrl && <meta property="og:image" content={event.bannerUrl} />}
        <meta property="og:url" content={`https://swipehire.top/events/${event.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <StructuredData data={eventSchema} />

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-lg bg-white shadow-sm">
            {event.bannerUrl && (
              <div className="relative h-64 w-full sm:h-80">
                <Image
                  src={event.bannerUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}

            <div
              className={`p-6 sm:p-8 ${event.bannerUrl ? '-mt-20 relative rounded-t-lg bg-white' : ''}`}
            >
              {/* Status and badges */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className={statusInfo.className}>
                  {getFormatIcon(event.format!)} {statusInfo.text}
                </Badge>
                <Badge variant="secondary">{formatEventType(event.eventType)}</Badge>
                {event.featured && <Badge className="bg-yellow-500 text-white">Featured</Badge>}
                {event.isRegistered && (
                  <Badge className="bg-green-600 text-white">Registered</Badge>
                )}
              </div>

              {/* Title and actions */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="font-bold text-2xl text-gray-900 sm:text-3xl">{event.title}</h1>
                  <p className="mt-2 text-gray-600 text-lg">Organized by {event.organizer.name}</p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-shrink-0 gap-2">
                  {mongoDbUserId && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveToggle}
                          disabled={isSaving || isUnsaving}
                        >
                          {event.isSaved ? (
                            <BookmarkSolidIcon className="h-4 w-4 text-blue-600" />
                          ) : (
                            <BookmarkIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {event.isSaved ? 'Remove from saved' : 'Save event'}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <ShareIcon className="h-4 w-4" />
                  </Button>

                  <Button onClick={addToCalendar} variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Add to Calendar</span>
                  </Button>

                  <Button
                    onClick={handleRegister}
                    disabled={(isEventFull && !event.isRegistered) || isRegistering}
                    className="gap-2"
                  >
                    {isRegistering ? (
                      'Registering...'
                    ) : isEventFull && !event.isRegistered ? (
                      'Event Full'
                    ) : event.isRegistered ? (
                      'View Registration'
                    ) : (
                      <>
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        Register
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {event.description.split('\n').map((paragraph, index) => (
                      <p
                        key={`paragraph-${index}-${paragraph.slice(0, 20)}`}
                        className="mb-4 last:mb-0"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Agenda */}
              {event.agenda && event.agenda.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Agenda</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {event.agenda.map((session, index) => (
                        <div key={session.id}>
                          {index > 0 && <Separator className="my-4" />}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-gray-900">{session.title}</h4>
                                {session.description && (
                                  <p className="text-gray-600 text-sm">{session.description}</p>
                                )}
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <p className="font-medium text-gray-900 text-sm">
                                  {format(new Date(session.startTime), 'h:mm a')}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {format(new Date(session.endTime), 'h:mm a')}
                                </p>
                              </div>
                            </div>

                            {session.speakers && session.speakers.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {session.speakers.map((speaker) => (
                                  <Badge key={speaker.id} variant="outline" className="text-xs">
                                    {speaker.name}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {session.track && (
                              <Badge variant="secondary" className="text-xs">
                                {session.track}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Speakers */}
              {event.speakers && event.speakers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Speakers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {event.speakers.map((speaker) => (
                        <SpeakerCard key={speaker.id} speaker={speaker} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date and Time */}
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(event.startDateTime), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {format(new Date(event.startDateTime), 'h:mm a')} -{' '}
                        {format(new Date(event.endDateTime), 'h:mm a')} ({event.timezone})
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {event.format === EventFormat.VIRTUAL
                          ? 'Virtual Event'
                          : event.location.venue || 'In Person'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {event.format === EventFormat.VIRTUAL
                          ? event.location.platform || 'Online'
                          : event.location.city
                            ? `${event.location.city}${event.location.state ? `, ${event.location.state}` : ''}`
                            : 'Location TBA'}
                      </p>
                      {event.location.address && event.format !== EventFormat.VIRTUAL && (
                        <p className="mt-1 text-gray-500 text-xs">{event.location.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-start gap-3">
                    <CurrencyDollarIcon className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{formatPrice()}</p>
                    </div>
                  </div>

                  {/* Attendance */}
                  <div className="flex items-start gap-3">
                    <UsersIcon className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{event.registeredCount} attendees</p>
                      {event.capacity && (
                        <p className="text-gray-600 text-sm">
                          {event.capacity - event.registeredCount} spots remaining
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags and Industries */}
              <Card>
                <CardHeader>
                  <CardTitle>Topics & Industries</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.industry.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium text-gray-900 text-sm">Industries</h4>
                      <div className="flex flex-wrap gap-1">
                        {event.industry.map((industry) => (
                          <Badge key={industry} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.tags.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium text-gray-900 text-sm">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.targetAudience.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium text-gray-900 text-sm">Target Audience</h4>
                      <div className="flex flex-wrap gap-1">
                        {event.targetAudience.map((audience) => (
                          <Badge key={audience} variant="outline" className="text-xs">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommendation Reasons */}
              {event.recommendationReasons && event.recommendationReasons.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Why this event?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {event.recommendationReasons.map((reason, index) => (
                        <div
                          key={`reason-${index}-${reason.slice(0, 20)}`}
                          className="flex items-start gap-2"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                          <span className="text-gray-600 text-sm">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
