
import type { Candidate } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Lightbulb, MapPin, Zap } from 'lucide-react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import React, { useEffect, useRef } from 'react';

interface CandidateCardContentProps {
  candidate: Candidate;
}

export function CandidateCardContent({ candidate }: CandidateCardContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    if (!currentVideoRef) return;

    // Ensure this observer is re-created if the video element itself changes,
    // though for a single card, it's more about visibility.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentVideoRef.play().catch(error => console.log("Autoplay prevented for candidate video:", error.name, error.message));
        } else {
          currentVideoRef.pause();
        }
      },
      { threshold: 0.5 } // Play when 50% of the video is visible in its scroll container
    );

    observer.observe(currentVideoRef);

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
       observer.disconnect(); // General cleanup
    };
  }, [candidate.videoResumeUrl]); // Dependency: re-observe if the video source changes

  return (
    // flex-grow allows this content area to take available space within the SwipeCard (which is flex-col)
    <div className="flex flex-col h-full overflow-hidden"> 
      <div className="relative w-full bg-muted shrink-0"> {/* Video/Image container should not grow/shrink */}
        {candidate.videoResumeUrl ? (
          <video
            ref={videoRef}
            src={candidate.videoResumeUrl}
            controls
            muted // Start muted
            loop
            playsInline // Important for mobile autoplay
            className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-cover bg-black aspect-video"
            data-ai-hint="candidate video resume"
            poster={candidate.avatarUrl || `https://placehold.co/600x338.png?text=${encodeURIComponent(candidate.name)}`}
          >
            Your browser does not support the video tag.
          </video>
        ) : candidate.avatarUrl ? (
          <Image
            src={candidate.avatarUrl}
            alt={candidate.name}
            width={600}
            height={450} 
            className="object-cover w-full h-auto max-h-[50vh] sm:max-h-[60vh] aspect-[4/3]"
            data-ai-hint={candidate.dataAiHint || "person"}
            priority // Prioritize loading image if it's the main visual
          />
        ) : (
          <div className="w-full h-[200px] sm:h-[250px] bg-muted flex items-center justify-center" data-ai-hint="profile avatar placeholder">
            <Briefcase className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content area should scroll if it overflows, but primary scroll is for cards */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col overflow-y-auto"> {/* Allow internal scroll if content too long */}
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
                {candidate.skills.slice(0, 4).map((skill) => ( // Show fewer skills initially in compact view
                  <Badge key={skill} variant="secondary" className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5">{skill}</Badge>
                ))}
                {candidate.skills.length > 4 && <Badge variant="outline" className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5">+{candidate.skills.length-4} more</Badge>}
              </div>
            </div>
          )}
        </CardContent>

        {candidate.profileStrength && (
          <div className="mt-auto pt-1.5 sm:pt-2 border-t border-border/50"> {/* mt-auto pushes this to bottom */}
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
