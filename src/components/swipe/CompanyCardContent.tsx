
import type { Company } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Briefcase as JobTypeIcon, DollarSign } from 'lucide-react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import React, { useEffect, useRef, useState } from 'react';

interface CompanyCardContentProps {
  company: Company;
  // Prop to handle actions triggered by swipe
  onSwipeAction: (companyId: string, action: 'pass' | 'details' | 'save') => void;
}

export function CompanyCardContent({ company, onSwipeAction }: CompanyCardContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const SWIPE_THRESHOLD = 75; // Min drag distance in pixels

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    if (!currentVideoRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentVideoRef.play().catch(error => console.log("Autoplay prevented for company video:", error.name, error.message));
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
  }, [company.introVideoUrl]);

  const jobOpening = company.jobOpenings && company.jobOpenings.length > 0 ? company.jobOpenings[0] : null;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
     if ((e.target as HTMLElement).closest('video') && (e.target as HTMLElement).hasAttribute('controls')) {
        const videoElement = (e.target as HTMLElement).closest('video');
        if (videoElement) {
            const rect = videoElement.getBoundingClientRect();
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
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    // Visual feedback could be added here
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (cardContentRef.current) {
      cardContentRef.current.style.cursor = 'grab';
    }
    document.body.style.userSelect = '';

    const deltaX = e.clientX - startX;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) { // Swipe Left
        onSwipeAction(company.id, 'details');
        setTimeout(() => onSwipeAction(company.id, 'save'), 200);
      } else { // Swipe Right
        onSwipeAction(company.id, 'pass');
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
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
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'grab' }}
    >
      {/* Video/Image Container */}
      <div className="relative w-full bg-muted shrink-0 h-[60%]">
        {company.introVideoUrl ? (
          <video
            ref={videoRef}
            src={company.introVideoUrl}
            controls
            muted
            loop
            playsInline
            className="w-full h-full object-cover bg-black"
            data-ai-hint="company video"
            poster={company.logoUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(company.name)}`}
          >
            Your browser does not support the video tag.
          </video>
        ) : company.logoUrl ? (
          <Image
            src={company.logoUrl}
            alt={company.name + " logo"}
            fill
            className="object-contain p-4"
            data-ai-hint={company.dataAiHint || "company logo"}
            priority
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center" data-ai-hint="company building">
            <Building className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col overflow-y-auto overscroll-y-contain no-scrollbar h-[40%]">
        <CardHeader className="p-0 mb-1.5 sm:mb-2">
          <CardTitle className="text-lg sm:text-xl font-bold text-primary truncate">{company.name}</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">{company.industry}</CardDescription>
          {jobOpening && (
            <p className="text-base sm:text-lg font-semibold text-foreground mt-0.5 sm:mt-1 line-clamp-2">{jobOpening.title}</p>
          )}
        </CardHeader>

        <CardContent className="p-0 mb-2 sm:mb-3 space-y-1 sm:space-y-1.5 text-xs sm:text-sm">
          {jobOpening?.location && (
             <div className="flex items-center text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span>{jobOpening.location}</span>
            </div>
          )}
           {(jobOpening?.salaryRange || company.salaryRange) && (
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span>{jobOpening?.salaryRange || company.salaryRange}</span>
            </div>
          )}
          {(jobOpening?.jobType || company.jobType) && (
            <div className="flex items-center text-muted-foreground">
              <JobTypeIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span>{jobOpening?.jobType || company.jobType}</span>
            </div>
          )}

          <p className="text-muted-foreground line-clamp-2 sm:line-clamp-3 pt-1">
            {(jobOpening ? jobOpening.description : company.description)}
            {(jobOpening ? jobOpening.description : company.description).length > 100 && <span className="text-primary cursor-pointer hover:underline ml-1 text-xs">Read more</span>}
          </p>

          {company.cultureHighlights && company.cultureHighlights.length > 0 && (
            <div className="mt-1.5 sm:mt-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Culture:</h4>
              <div className="flex flex-wrap gap-1">
                {company.cultureHighlights.slice(0, 3).map((highlight) => (
                  <Badge key={highlight} variant="secondary" className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5">{highlight}</Badge>
                ))}
                 {company.cultureHighlights.length > 3 && <Badge variant="outline" className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5">+{company.cultureHighlights.length-3} more</Badge>}
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}
