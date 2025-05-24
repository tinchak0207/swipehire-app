
import type { Candidate } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Lightbulb, MapPin, Zap } from 'lucide-react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import React, { useEffect, useRef, useState } from 'react';

interface CandidateCardContentProps {
  candidate: Candidate;
  // Prop to handle actions triggered by swipe
  onSwipeAction: (candidateId: string, action: 'pass' | 'details' | 'save') => void;
}

export function CandidateCardContent({ candidate, onSwipeAction }: CandidateCardContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const SWIPE_THRESHOLD = 75; // Min drag distance in pixels to be considered a swipe

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    if (!currentVideoRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentVideoRef.play().catch(error => console.log("Autoplay prevented for candidate video:", error.name, error.message));
        } else {
          currentVideoRef.pause();
        }
      },
      { threshold: 0.5 }
    );

    if (currentVideoRef) {
      observer.observe(currentVideoRef);
    }

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
      observer.disconnect();
    };
  }, [candidate.videoResumeUrl]);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent drag if target is an interactive element like video controls or buttons (if any were inside this component)
    if ((e.target as HTMLElement).closest('video') && (e.target as HTMLElement).hasAttribute('controls')) {
        // More specific: check if click is on controls area of video
        const videoElement = (e.target as HTMLElement).closest('video');
        if (videoElement) {
            const rect = videoElement.getBoundingClientRect();
            // Approximate controls height (usually bottom 30-40px)
            if (e.clientY > rect.bottom - 40) return;
        }
    }
     if ((e.target as HTMLElement).closest('button, a, input, textarea')) {
      return;
    }

    setIsDragging(true);
    setStartX(e.clientX);
    if (cardContentRef.current) {
      cardContentRef.current.style.cursor = 'grabbing';
    }
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    // Here you could add logic for visual feedback (e.g., transform: translateX)
    // For now, we only act on mouseUp
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (cardContentRef.current) {
      cardContentRef.current.style.cursor = 'grab';
    }
    document.body.style.userSelect = ''; // Re-enable text selection

    const deltaX = e.clientX - startX;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) { // Swipe Left
        onSwipeAction(candidate.id, 'details');
        // Add a small delay before saving to ensure 'details' toast (if any) can show
        setTimeout(() => onSwipeAction(candidate.id, 'save'), 200);
      } else { // Swipe Right
        onSwipeAction(candidate.id, 'pass');
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      // Treat as if mouseUp occurred at the point of leaving if needed, or just cancel drag
      setIsDragging(false);
      if (cardContentRef.current) {
        cardContentRef.current.style.cursor = 'grab';
      }
      document.body.style.userSelect = '';
    }
  };


  return (
    <div
      ref={cardContentRef}
      className="flex flex-col h-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave} // Reset if mouse leaves while dragging
      style={{ cursor: 'grab' }} // Initial cursor
    >
      {/* Video/Image Container - Takes up a larger portion of height */}
      <div className="relative w-full bg-muted shrink-0 h-[60%]">
        {candidate.videoResumeUrl ? (
          <video
            ref={videoRef}
            src={candidate.videoResumeUrl}
            controls
            muted
            loop
            playsInline
            className="w-full h-full object-cover bg-black"
            data-ai-hint="candidate video resume"
            poster={candidate.avatarUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(candidate.name)}`}
          >
            Your browser does not support the video tag.
          </video>
        ) : candidate.avatarUrl ? (
          <Image
            src={candidate.avatarUrl}
            alt={candidate.name}
            fill
            className="object-cover"
            data-ai-hint={candidate.dataAiHint || "person"}
            priority
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center" data-ai-hint="profile avatar placeholder">
            <Briefcase className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content Area - Takes remaining height and is scrollable if needed */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col overflow-y-auto overscroll-y-contain no-scrollbar h-[40%]">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-lg sm:text-xl font-bold text-primary truncate">{candidate.name}</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">{candidate.role}</CardDescription>
           {candidate.location && (
            <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 shrink-0" />
                <span>{candidate.location}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0 mb-2 sm:mb-3 space-y-1.5 text-xs sm:text-sm">
          <p className="text-muted-foreground line-clamp-3 sm:line-clamp-4">
            {candidate.experienceSummary}
             {candidate.experienceSummary.length > 120 && <span className="text-primary cursor-pointer hover:underline ml-1 text-xs">Read more</span>}
          </p>

          {candidate.desiredWorkStyle && (
              <div className="flex items-center text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5 mr-1.5 sm:mr-2 shrink-0" />
                  <span>{candidate.desiredWorkStyle}</span>
              </div>
          )}

          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mt-1.5 sm:mt-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Skills:</h4>
              <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5">{skill}</Badge>
                ))}
                {candidate.skills.length > 4 && <Badge variant="outline" className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5">+{candidate.skills.length-4} more</Badge>}
              </div>
            </div>
          )}
        </CardContent>

        {candidate.profileStrength && (
          <div className="mt-auto pt-1.5 sm:pt-2 border-t border-border/50">
            <div className="flex items-center text-xs text-primary font-medium">
              <Zap className="h-3.5 w-3.5 mr-1.5 text-accent shrink-0" />
              Profile Strength: {candidate.profileStrength}%
              {candidate.profileStrength > 89 && <Badge variant="default" className="ml-2 text-xs px-1.5 py-0.5 bg-green-500 hover:bg-green-600 text-white">Top Talent</Badge>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
