'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Candidate, Company, Match } from '@/lib/types';
import { ApplicantCard } from './ApplicantCard';

interface TikTokApplicantScrollerProps {
  applicants: (Match & { candidate: Candidate; company: Company })[];
  onInviteToInterview: (match: Match) => void;
  onRejectApplicant: (match: Match) => void;
  onArchiveMatch: (matchId: string) => void;
  onFocusedMatchChange?: (match: Match & { candidate: Candidate; company: Company }) => void;
}

export function TikTokApplicantScroller({
  applicants,
  onInviteToInterview,
  onRejectApplicant,
  onArchiveMatch,
  onFocusedMatchChange,
}: TikTokApplicantScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // Handle scroll events to detect which card is active
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const cardHeight = window.innerHeight * 0.9; // 90% of viewport height
      const newIndex = Math.round(scrollPosition / cardHeight);

      if (newIndex >= 0 && newIndex < applicants.length) {
        setCurrentIndex(newIndex);
        // Notify parent about focused match change
        if (onFocusedMatchChange && applicants[newIndex]) {
          onFocusedMatchChange(applicants[newIndex]);
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    // Trigger initial check
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [applicants, onFocusedMatchChange]);

  // Scroll to a specific applicant card
  const scrollToApplicant = useCallback((index: number) => {
    if (!containerRef.current) return;

    const cardHeight = window.innerHeight * 0.9;
    const targetPosition = index * cardHeight;

    containerRef.current.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  }, []);

  // Navigation functions
  const goToNext = () => {
    const nextIndex = Math.min(currentIndex + 1, applicants.length - 1);
    scrollToApplicant(nextIndex);
  };

  const goToPrevious = () => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    scrollToApplicant(prevIndex);
  };

  // Handle applicant card actions
  const _handleApplicantCardClick = (match: Match & { candidate: Candidate; company: Company }) => {
    toast({
      title: 'View Resume',
      description: `Conceptual: Navigating to ${match.candidate.name}'s full profile.`,
      duration: 3000,
    });
  };

  // Set card ref
  const setCardRef = useCallback((matchId: string, element: HTMLDivElement | null) => {
    if (element) {
      cardRefs.current.set(matchId, element);
    } else {
      cardRefs.current.delete(matchId);
    }
  }, []);

  return (
    <div className="relative h-[75vh] w-full overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Main scroller container */}
      <div
        ref={containerRef}
        className="h-full snap-y snap-mandatory overflow-y-auto scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {applicants.map((applicant, index) => (
          <div
            key={applicant._id}
            ref={(el) => setCardRef(applicant._id, el)}
            className="flex h-[67.5vh] w-full snap-start items-center justify-center p-4"
          >
            <div className="h-full w-[50.625vh] max-w-full">
              {' '}
              {/* 3:4 aspect ratio (3:4 width:height) - height changed from 90vh to 67.5vh */}
              <ApplicantCard
                match={applicant}
                onInviteToInterview={onInviteToInterview}
                onRejectApplicant={onRejectApplicant}
                onArchiveMatch={onArchiveMatch}
                isFocused={index === currentIndex}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      <div className="-translate-y-1/2 absolute top-1/2 right-4 flex transform flex-col gap-2">
        <Button
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg"
          onClick={goToNext}
          disabled={currentIndex === applicants.length - 1}
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>

      {/* Current position indicator */}
      <div className="-translate-x-1/2 absolute bottom-4 left-1/2 transform">
        <div className="flex space-x-1 rounded-full bg-black/20 px-3 py-2">
          {applicants.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
