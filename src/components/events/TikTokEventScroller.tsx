'use client';

import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { EventFilters, IndustryEvent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { EventFilterPanel } from './EventFilterPanel';
import { TikTokEventCard } from './TikTokEventCard';

interface TikTokEventScrollerProps {
  events: IndustryEvent[];
  userId?: string | undefined;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  activeFilters: EventFilters;
  onFilterChange: <K extends keyof EventFilters>(
    filterType: K,
    value: EventFilters[K] extends Set<infer T> ? T : never,
    isChecked: boolean
  ) => void;
  onClearFilters: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TikTokEventScroller: React.FC<TikTokEventScrollerProps> = ({
  events,
  userId,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  activeFilters,
  onFilterChange,
  onClearFilters,
  searchQuery,
  onSearchChange,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Create a wrapper function to handle filter changes
  const handleFilterChange = useCallback(
    <K extends keyof EventFilters>(
      filterType: K,
      value: EventFilters[K] extends Set<infer T> ? T : never,
      isChecked: boolean
    ) => {
      onFilterChange(filterType, value, isChecked);
    },
    [onFilterChange]
  );

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const handleMouseMove = () => resetTimer();
    const handleTouchStart = () => resetTimer();

    resetTimer();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // Simple scroll to event
  const scrollToEvent = useCallback((index: number) => {
    if (!scrollerRef.current) return;

    const container = scrollerRef.current;
    const targetY = index * window.innerHeight;

    container.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });

    setCurrentIndex(index);
  }, []);

  // Intersection Observer for tracking current card
  useEffect(() => {
    const container = scrollerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setCurrentIndex(index);

            // Load more when approaching the end
            if (index >= events.length - 2 && hasNextPage && !isFetchingNextPage) {
              onLoadMore?.();
            }
          }
        });
      },
      {
        root: container,
        rootMargin: '0px',
        threshold: 0.5,
      }
    );

    // Observe all event cards
    const cards = container.querySelectorAll('[data-index]');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [events.length, hasNextPage, isFetchingNextPage, onLoadMore]);

  // Enhanced scroll handling for better snap behavior
  useEffect(() => {
    const container = scrollerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const cardHeight = window.innerHeight;
        const currentScrollIndex = Math.round(scrollTop / cardHeight);

        // If we're between cards, snap to the nearest one
        const scrollProgress = scrollTop / cardHeight;
        const distanceFromNearest = Math.abs(scrollProgress - currentScrollIndex);

        if (distanceFromNearest > 0.02) {
          // Reduced from 0.05 to 0.02 (2% threshold)
          const targetIndex = Math.round(scrollProgress);
          if (targetIndex >= 0 && targetIndex < events.length) {
            container.scrollTo({
              top: targetIndex * cardHeight,
              behavior: 'smooth',
            });
          }
        }
      }, 50); // Reduced from 100ms to 50ms for much faster response
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [events.length]);

  // Touch gesture handling for better responsiveness
  useEffect(() => {
    const container = scrollerRef.current;
    if (!container) return;

    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        startY = e.touches[0].clientY;
        startTime = Date.now();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches[0]) {
        const endY = e.changedTouches[0].clientY;
        const endTime = Date.now();
        const deltaY = startY - endY;
        const deltaTime = endTime - startTime;

        // If it's a quick swipe (even small), navigate to next/prev card
        if (Math.abs(deltaY) > 8 && deltaTime < 250) {
          // Reduced from 15px to 8px and 300ms to 250ms
          e.preventDefault();
          if (deltaY > 0 && currentIndex < events.length - 1) {
            // Swipe up - next card
            scrollToEvent(currentIndex + 1);
          } else if (deltaY < 0 && currentIndex > 0) {
            // Swipe down - previous card
            scrollToEvent(currentIndex - 1);
          }
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentIndex, events.length, scrollToEvent]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          if (currentIndex > 0) {
            scrollToEvent(currentIndex - 1);
          }
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          if (currentIndex < events.length - 1) {
            scrollToEvent(currentIndex + 1);
          }
          break;
        case 'Home':
          e.preventDefault();
          scrollToEvent(0);
          break;
        case 'End':
          e.preventDefault();
          scrollToEvent(events.length - 1);
          break;
        case '/': {
          e.preventDefault();
          setShowControls(true);
          const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
          searchInput?.focus();
          break;
        }
        case 'f':
          e.preventDefault();
          setIsFilterOpen(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, events.length, scrollToEvent]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.eventTypes.size > 0) count++;
    if (activeFilters.formats.size > 0) count++;
    if (activeFilters.industries.size > 0) count++;
    if (activeFilters.cities.size > 0) count++;
    if (activeFilters.isFree !== undefined) count++;
    if (activeFilters.dateRange.start || activeFilters.dateRange.end) count++;
    if (activeFilters.priceRange.min !== undefined || activeFilters.priceRange.max !== undefined)
      count++;
    return count;
  };

  if (events.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="space-y-4 text-center">
          <div className="text-4xl">🎪</div>
          <h2 className="font-semibold text-gray-800 text-xl">No events found</h2>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Main Scroller */}
      <div
        ref={scrollerRef}
        className="h-full snap-y snap-proximity overflow-y-scroll"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {events.map((event, index) => (
          <TikTokEventCard
            key={`${event.id}-${index}`}
            event={event}
            userId={userId || ''}
            isActive={index === currentIndex}
            data-index={index}
          />
        ))}

        {/* Loading indicator for infinite scroll */}
        {isFetchingNextPage && (
          <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <div className="space-y-4 text-center">
              <div className="animate-spin text-4xl">🎪</div>
              <p className="text-gray-700">Loading more events...</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Controls */}
      <div
        className={cn(
          'absolute top-4 right-4 left-4 z-50 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-500" />
            <Input
              data-search-input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="rounded-2xl border-white/40 bg-white/30 pl-10 text-gray-800 shadow-lg backdrop-blur-xl placeholder:text-gray-500"
            />
          </div>

          {/* Filter Button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-2xl border-white/40 bg-white/30 text-gray-700 shadow-lg backdrop-blur-xl hover:bg-white/40"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                {getActiveFilterCount() > 0 && (
                  <span className="-top-1 -right-1 absolute rounded-full bg-blue-600 px-1.5 py-0.5 text-white text-xs">
                    {getActiveFilterCount()}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filter Events</SheetTitle>
              </SheetHeader>
              <EventFilterPanel
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={onClearFilters}
                onApplyFilters={() => setIsFilterOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Navigation Indicators */}
      <div
        className={cn(
          '-translate-y-1/2 absolute top-1/2 right-4 z-50 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="flex flex-col space-y-1">
          {events.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, index) => {
            const actualIndex = Math.max(0, currentIndex - 2) + index;
            return (
              <button
                key={actualIndex}
                onClick={() => scrollToEvent(actualIndex)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-200',
                  actualIndex === currentIndex
                    ? 'scale-125 bg-blue-600'
                    : 'bg-gray-400 hover:bg-gray-600'
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div
        className={cn(
          '-translate-x-1/2 absolute bottom-8 left-1/2 z-50 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="flex items-center space-x-4 rounded-2xl border border-white/40 bg-white/30 p-3 shadow-lg backdrop-blur-xl">
          <Button
            variant="outline"
            size="icon"
            onClick={() => currentIndex > 0 && scrollToEvent(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="rounded-xl border-white/50 bg-white/40 text-gray-700 backdrop-blur-sm hover:bg-white/50 disabled:opacity-30"
          >
            <ChevronUpIcon className="h-4 w-4" />
          </Button>

          <div className="px-2 font-medium text-gray-700 text-sm">
            {currentIndex + 1} / {events.length}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => currentIndex < events.length - 1 && scrollToEvent(currentIndex + 1)}
            disabled={currentIndex === events.length - 1}
            className="rounded-xl border-white/50 bg-white/40 text-gray-700 backdrop-blur-sm hover:bg-white/50 disabled:opacity-30"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div
        className={cn(
          'absolute bottom-4 left-4 z-50 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="space-y-1 rounded-2xl border border-white/40 bg-white/30 p-3 text-gray-600 text-xs shadow-lg backdrop-blur-xl">
          <div>↑↓ or j/k: Navigate</div>
          <div>/: Search • f: Filter</div>
        </div>
      </div>
    </div>
  );
};
