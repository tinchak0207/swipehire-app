'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TikTokEventScroller } from '@/components/events/TikTokEventScroller';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useInfiniteEvents } from '@/hooks/useEvents';
import type { EventFilters, EventFormat, EventType } from '@/lib/types';

const EventsPage: React.FC = () => {
  const { mongoDbUserId } = useUserPreferences();
  const isGuestMode = !mongoDbUserId;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<EventFilters>({
    eventTypes: new Set<EventType>(),
    formats: new Set<EventFormat>(),
    industries: new Set<string>(),
    cities: new Set<string>(),
    dateRange: {},
    priceRange: {},
    skillLevels: new Set<string>(),
    tags: new Set<string>(),
    searchQuery: '',
  });

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update filters with search query
  const searchParams = useMemo(
    () => ({
      filters: {
        ...activeFilters,
        searchQuery: debouncedSearchQuery,
      },
      sortBy: 'relevance' as const,
      limit: 10, // Load fewer items for better performance in TikTok view
    }),
    [activeFilters, debouncedSearchQuery]
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteEvents(searchParams);

  const events = useMemo(() => {
    return data?.pages.flatMap((page) => page.events) ?? [];
  }, [data]);

  const handleFilterChange = useCallback((newFilters: EventFilters) => {
    setActiveFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters({
      eventTypes: new Set<EventType>(),
      formats: new Set<EventFormat>(),
      industries: new Set<string>(),
      cities: new Set<string>(),
      dateRange: {},
      priceRange: {},
      skillLevels: new Set<string>(),
      tags: new Set<string>(),
      searchQuery: '',
    });
    setSearchQuery('');
    setDebouncedSearchQuery('');
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="space-y-4 text-center">
          <div className="animate-spin text-6xl">🎪</div>
          <h2 className="font-semibold text-gray-800 text-xl">Loading amazing events...</h2>
          <p className="text-gray-600">Get ready for the show!</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="space-y-4 text-center">
          <div className="text-6xl">⚠️</div>
          <h2 className="font-semibold text-gray-800 text-xl">Oops! Something went wrong</h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'Failed to load events'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <TikTokEventScroller
        events={events}
        userId={isGuestMode ? undefined : mongoDbUserId}
        onLoadMore={handleLoadMore}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
    </div>
  );
};

export default EventsPage;
