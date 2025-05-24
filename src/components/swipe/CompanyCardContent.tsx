
import type { Company } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Briefcase as JobTypeIcon, DollarSign } from 'lucide-react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import React, { useEffect, useRef } from 'react';

interface CompanyCardContentProps {
  company: Company;
  onAction?: (companyId: string, action: 'like' | 'pass' | 'superlike' | 'details' | 'save' | 'share') => void;
  isLiked?: boolean;
  isSuperLiked?: boolean;
}

export function CompanyCardContent({ company, onAction, isLiked, isSuperLiked }: CompanyCardContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    if (!currentVideoRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentVideoRef.play().catch(error => console.log("Autoplay prevented for company video:", error));
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
  }, [company.introVideoUrl]); // Re-run if video URL changes

  return (
    <div className="flex flex-col h-full">
      <div className="relative w-full bg-muted">
        {company.introVideoUrl ? (
          <video
            ref={videoRef}
            src={company.introVideoUrl}
            controls
            autoPlay // Autoplay will be controlled by IntersectionObserver
            muted // Start muted
            loop
            className="w-full h-auto max-h-[350px] sm:max-h-[400px] md:max-h-[450px] object-cover bg-black aspect-video" // Maintain aspect ratio
            data-ai-hint="company video"
            poster={company.logoUrl || `https://placehold.co/600x338.png?text=${company.name}`}
          >
            Your browser does not support the video tag.
          </video>
        ) : company.logoUrl ? (
          <Image
            src={company.logoUrl}
            alt={company.name + " logo"}
            width={600}
            height={450}
            className="object-contain w-full h-auto max-h-[350px] sm:max-h-[400px] md:max-h-[450px] aspect-[4/3] p-4"
            data-ai-hint={company.dataAiHint || "company logo"}
          />
        ) : (
          <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-muted flex items-center justify-center" data-ai-hint="company building">
            <Building className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-xl font-bold text-primary truncate">{company.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{company.industry}</CardDescription>
          {company.jobOpenings && company.jobOpenings.length > 0 && (
            <p className="text-lg font-semibold text-foreground mt-1">{company.jobOpenings[0].title}</p>
          )}
        </CardHeader>

        <CardContent className="p-0 mb-3 space-y-2 text-sm">
          {company.location && (
             <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 shrink-0" />
                <span>{company.location || "Not specified"}</span>
            </div>
          )}
          {company.salaryRange && (
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2 shrink-0" />
              <span>{company.salaryRange}</span>
            </div>
          )}
          {company.jobType && (
            <div className="flex items-center text-muted-foreground">
              <JobTypeIcon className="h-4 w-4 mr-2 shrink-0" />
              <span>{company.jobType}</span>
            </div>
          )}
          
          <p className="text-muted-foreground line-clamp-3">
            {company.description}
            {company.description.length > 100 && <span className="text-primary cursor-pointer hover:underline ml-1">Read more</span>}
          </p>

          {company.cultureHighlights && company.cultureHighlights.length > 0 && (
            <div className="mt-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Culture:</h4>
              <div className="flex flex-wrap gap-1">
                {company.cultureHighlights.slice(0, 3).map((highlight) => (
                  <Badge key={highlight} variant="secondary" className="text-xs">{highlight}</Badge>
                ))}
                 {company.cultureHighlights.length > 3 && <Badge variant="outline" className="text-xs">+{company.cultureHighlights.length-3} more</Badge>}
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}
