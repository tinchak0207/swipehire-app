
import type { Candidate, PersonalityTraitAssessment } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Lightbulb, MapPin, Zap, Users, CheckCircle, AlertTriangle, XCircle, Eye, Sparkles, Share2 } from 'lucide-react'; // Added Share2
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast'; // Added useToast

interface CandidateCardContentProps {
  candidate: Candidate;
  onSwipeAction: (candidateId: string, action: 'like' | 'pass' | 'details' | 'save' | 'superlike' | 'share') => void;
}

const MAX_SUMMARY_LENGTH = 120;

export function CandidateCardContent({ candidate, onSwipeAction }: CandidateCardContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const { toast } = useToast(); // Initialize toast

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
    const targetElement = e.target as HTMLElement;
    if (targetElement.closest('video[controls], button, a, [data-no-drag="true"], .no-swipe-area')) {
        if (targetElement.tagName === 'VIDEO') {
            const videoElement = targetElement as HTMLVideoElement;
            const rect = videoElement.getBoundingClientRect();
            if (e.clientY > rect.bottom - 40) return;
        } else {
          return;
        }
    }
    e.preventDefault(); // Prevent text selection during drag
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    if (cardContentRef.current) {
      cardContentRef.current.style.cursor = 'grabbing';
      cardContentRef.current.style.transition = 'none';
    }
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !cardContentRef.current) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !cardContentRef.current) return;
    
    cardContentRef.current.style.transition = 'transform 0.3s ease-out';
    const finalDeltaX = e.clientX - startX;
    setCurrentX(startX);

    if (Math.abs(finalDeltaX) > SWIPE_THRESHOLD) {
      if (finalDeltaX < 0) { 
        onSwipeAction(candidate.id, 'pass'); // Swiped Left (original: 'pass')
      } else { 
        onSwipeAction(candidate.id, 'like'); // Swiped Right (original: 'like')
      }
    } else {
      if (cardContentRef.current) {
         cardContentRef.current.style.transform = 'translateX(0px) rotateZ(0deg)';
      }
    }
    
    setIsDragging(false);
    if (cardContentRef.current) {
      cardContentRef.current.style.cursor = 'grab';
    }
    document.body.style.userSelect = '';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && cardContentRef.current) {
      cardContentRef.current.style.transition = 'transform 0.3s ease-out';
      setCurrentX(startX);
      if (cardContentRef.current) {
        cardContentRef.current.style.transform = 'translateX(0px) rotateZ(0deg)';
      }
      setIsDragging(false);
      cardContentRef.current.style.cursor = 'grab';
      document.body.style.userSelect = '';
    }
  };
  
  const getCardTransform = () => {
    if (!isDragging) return 'translateX(0px) rotateZ(0deg)';
    const deltaX = currentX - startX;
    const rotationFactor = Math.min(Math.abs(deltaX) / (SWIPE_THRESHOLD * 2), 1);
    const rotation = MAX_ROTATION * (deltaX > 0 ? 1 : -1) * rotationFactor;
    return `translateX(${deltaX}px) rotateZ(${rotation}deg)`;
  };
  
  const renderPersonalityFitIcon = (fit: PersonalityTraitAssessment['fit']) => {
    switch (fit) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-500 mr-1.5 shrink-0" />;
      case 'neutral':
        return <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1.5 shrink-0" />;
      case 'negative':
        return <XCircle className="h-4 w-4 text-red-500 mr-1.5 shrink-0" />;
      default:
        return null;
    }
  };

  const toggleSummary = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setShowFullSummary(!showFullSummary);
  };

  const displayedSummary = showFullSummary 
    ? candidate.experienceSummary 
    : candidate.experienceSummary.slice(0, MAX_SUMMARY_LENGTH) + (candidate.experienceSummary.length > MAX_SUMMARY_LENGTH ? "..." : "");

  return (
    <div
      ref={cardContentRef}
      className="flex flex-col h-full overflow-hidden relative bg-card"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ 
        cursor: 'grab',
        transform: getCardTransform(),
      }}
    >
      <div className="relative w-full bg-muted shrink-0 h-[60%] md:h-[60%] max-h-[calc(100vh_-_300px)] md:max-h-[calc(100vh_-_250px)]"> {/* Adjusted max-height */}
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
            data-no-drag="true"
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

      <div className="p-3 sm:p-4 flex-grow flex flex-col overflow-y-auto overscroll-y-contain no-scrollbar h-[40%]">
        <CardHeader className="p-0 mb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl font-bold text-primary truncate">{candidate.name}</CardTitle>
            {candidate.isUnderestimatedTalent && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-600 bg-yellow-500/10 cursor-default shrink-0">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                      Hidden Gem
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs">{candidate.underestimatedReasoning || "This candidate shows unique potential!"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">{candidate.role}</CardDescription>
           {candidate.location && (
            <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 shrink-0" />
                <span>{candidate.location}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0 mb-2 sm:mb-3 space-y-1.5 text-xs sm:text-sm">
          <p className="text-muted-foreground">
            {displayedSummary}
            {candidate.experienceSummary.length > MAX_SUMMARY_LENGTH && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={toggleSummary} 
                className="text-primary hover:underline p-0 h-auto ml-1 text-xs font-semibold no-swipe-area" 
                data-no-drag="true"
              >
                {showFullSummary ? "Read less" : "Read more"}
              </Button>
            )}
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

        {(candidate.personalityAssessment || candidate.optimalWorkStyles) && (
          <div className="mt-2 pt-2 border-t border-border/50 text-xs">
            <h4 className="font-semibold text-muted-foreground mb-1.5 flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-primary" /> Coworker Fit Profile:
            </h4>
            {candidate.personalityAssessment && candidate.personalityAssessment.length > 0 && (
              <div className="mb-2 space-y-1">
                <p className="font-medium text-foreground">Personality Insights:</p>
                {candidate.personalityAssessment.map((item, index) => (
                  <div key={index} className="flex items-start">
                    {renderPersonalityFitIcon(item.fit)}
                    <div>
                      <span className="font-semibold">{item.trait}:</span>
                      <span className="text-muted-foreground ml-1">{item.reason || (item.fit === 'positive' ? 'Likely a good fit.' : item.fit === 'neutral' ? 'Potential to consider.' : 'Potential challenge.')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {candidate.optimalWorkStyles && candidate.optimalWorkStyles.length > 0 && (
              <div>
                <p className="font-medium text-foreground">Optimal Work Style:</p>
                <ul className="list-disc list-inside pl-4 text-muted-foreground space-y-0.5">
                  {candidate.optimalWorkStyles.map((style, index) => (
                    <li key={index}>{style}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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
