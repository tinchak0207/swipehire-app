import type { Company } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Briefcase as JobTypeIcon, DollarSign, HelpCircle } from 'lucide-react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface CompanyCardContentProps {
  company: Company;
  onSwipeAction: (companyId: string, action: 'like' | 'pass' | 'details' | 'save' | 'superlike') => void;
}

const MAX_DESCRIPTION_LENGTH = 100;

export function CompanyCardContent({ company, onSwipeAction }: CompanyCardContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const SWIPE_THRESHOLD = 75;
  const MAX_ROTATION = 10;

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
    const targetElement = e.target as HTMLElement;
    if (targetElement.closest('video[controls]') && targetElement.tagName !== 'VIDEO') {
      const videoElement = targetElement.closest('video');
      if (videoElement) {
          const rect = videoElement.getBoundingClientRect();
          if (e.clientY > rect.bottom - 40) return; 
      }
    }
    if (targetElement.closest('button, a, input, textarea, [data-no-drag="true"], .no-swipe-area')) {
      return;
    }
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX); // Initialize currentX
    if (cardContentRef.current) {
      cardContentRef.current.style.cursor = 'grabbing';
      cardContentRef.current.style.transition = 'none'; // Remove transition during drag
    }
    document.body.style.userSelect = 'none'; // Prevent text selection during drag
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !cardContentRef.current) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !cardContentRef.current) return;

    cardContentRef.current.style.transition = 'transform 0.3s ease-out'; // Add transition back for snap
    const finalDeltaX = e.clientX - startX;
    setCurrentX(startX); // Reset for visual snap back

    if (Math.abs(finalDeltaX) > SWIPE_THRESHOLD) {
      if (finalDeltaX < 0) { 
        onSwipeAction(company.id, 'pass');
      } else { 
        onSwipeAction(company.id, 'like');
      }
    } else {
      // If not a swipe, ensure the card snaps back to center smoothly
       if (cardContentRef.current) {
         cardContentRef.current.style.transform = 'translateX(0px) rotateZ(0deg)';
       }
    }
    
    setIsDragging(false);
    if (cardContentRef.current) {
      cardContentRef.current.style.cursor = 'grab';
    }
    document.body.style.userSelect = ''; // Re-enable text selection
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && cardContentRef.current) {
      cardContentRef.current.style.transition = 'transform 0.3s ease-out';
      setCurrentX(startX); // Reset for visual snap back
      setIsDragging(false);
      cardContentRef.current.style.cursor = 'grab';
      document.body.style.userSelect = '';
    }
  };

  const getCardTransform = () => {
    if (!isDragging) return 'translateX(0px) rotateZ(0deg)'; // Default position
    const deltaX = currentX - startX;
    const rotationFactor = Math.min(Math.abs(deltaX) / (SWIPE_THRESHOLD * 2), 1);
    const rotation = MAX_ROTATION * (deltaX > 0 ? 1 : -1) * rotationFactor;
    return `translateX(${deltaX}px) rotateZ(${rotation}deg)`;
  };

  const toggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card swipe when clicking "Read more/less"
    setShowFullDescription(!showFullDescription);
  };
  
  const descriptionText = jobOpening ? jobOpening.description : company.description;
  const displayedDescription = showFullDescription
    ? descriptionText
    : descriptionText.slice(0, MAX_DESCRIPTION_LENGTH) + (descriptionText.length > MAX_DESCRIPTION_LENGTH ? "..." : "");

  return (
    <div
      ref={cardContentRef}
      className="flex flex-col h-full overflow-hidden relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ 
        cursor: 'grab',
        transform: getCardTransform(),
      }}
    >
      <div className="relative w-full bg-muted shrink-0 h-[55%] md:h-[60%]">
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
            data-no-drag="true"
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

      <div className="p-3 sm:p-4 flex-grow flex flex-col overflow-y-auto overscroll-y-contain no-scrollbar h-[45%] md:h-[40%]">
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

          <p className="text-muted-foreground pt-1">
            {displayedDescription}
            {descriptionText.length > MAX_DESCRIPTION_LENGTH && (
              <button onClick={toggleDescription} className="text-primary hover:underline ml-1 text-xs font-semibold" data-no-drag="true">
                {showFullDescription ? "Read less" : "Read more"}
              </button>
            )}
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

        <div className="mt-auto pt-2 border-t border-border/50 no-swipe-area">
          <Button variant="outline" size="sm" className="w-full text-muted-foreground" disabled>
            <HelpCircle className="mr-2 h-4 w-4" />
            Instant Q&A (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
}
