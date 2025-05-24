
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentVideoRef.play().catch(error => console.log("Autoplay prevented for candidate video:", error));
        } else {
          currentVideoRef.pause();
        }
      },
      { threshold: 0.5 } // Play when 50% of the video is visible
    );

    observer.observe(currentVideoRef);

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
       observer.disconnect();
    };
  }, [candidate.videoResumeUrl]); // Re-run if video URL changes, though unlikely for a specific candidate

  return (
    <div className="flex flex-col h-full">
      <div className="relative w-full bg-muted">
        {candidate.videoResumeUrl ? (
          <video
            ref={videoRef}
            src={candidate.videoResumeUrl}
            controls
            autoPlay // Autoplay will be controlled by IntersectionObserver
            muted // Start muted as per common practice
            loop
            className="w-full h-auto max-h-[350px] sm:max-h-[400px] md:max-h-[450px] object-cover bg-black aspect-video" // Maintain aspect ratio
            data-ai-hint="candidate video resume"
            poster={candidate.avatarUrl || `https://placehold.co/600x338.png?text=${candidate.name}`}
          >
            Your browser does not support the video tag.
          </video>
        ) : candidate.avatarUrl ? (
          <Image
            src={candidate.avatarUrl}
            alt={candidate.name}
            width={600}
            height={450} 
            className="object-cover w-full h-auto max-h-[350px] sm:max-h-[400px] md:max-h-[450px] aspect-[4/3]" // Maintain aspect ratio for images too
            data-ai-hint={candidate.dataAiHint || "person"}
          />
        ) : (
          <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-muted flex items-center justify-center" data-ai-hint="profile avatar placeholder">
            <Briefcase className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-xl font-bold text-primary truncate">{candidate.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{candidate.role}</CardDescription>
           {candidate.location && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span>{candidate.location}</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-0 mb-3 space-y-2 text-sm">
          <p className="text-muted-foreground line-clamp-3">
            {candidate.experienceSummary}
             {candidate.experienceSummary.length > 100 && <span className="text-primary cursor-pointer hover:underline ml-1">Read more</span>}
          </p>
          
          {candidate.desiredWorkStyle && (
              <div className="flex items-center text-muted-foreground">
                  <Lightbulb className="h-4 w-4 mr-2 shrink-0" />
                  <span>{candidate.desiredWorkStyle}</span>
              </div>
          )}
          
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mt-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Skills:</h4>
              <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
                {candidate.skills.length > 5 && <Badge variant="outline" className="text-xs">+{candidate.skills.length-5} more</Badge>}
              </div>
            </div>
          )}
        </CardContent>

        {candidate.profileStrength && (
          <div className="mt-auto pt-2 border-t border-border/50">
            <div className="flex items-center text-xs text-primary font-medium">
              <Zap className="h-4 w-4 mr-1.5 text-accent shrink-0" />
              Profile Strength: {candidate.profileStrength}%
              {candidate.profileStrength > 89 && <Badge variant="default" className="ml-2 text-xs bg-green-500 hover:bg-green-600 text-white">Top Talent</Badge>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
