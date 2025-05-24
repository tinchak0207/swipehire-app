
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

export function CompanyCardContent({ company }: CompanyCardContentProps) { // Removed onAction, isLiked, isSuperLiked as they are handled in parent
  const videoRef = useRef<HTMLVideoElement>(null);

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

    observer.observe(currentVideoRef);

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
      observer.disconnect();
    };
  }, [company.introVideoUrl]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="relative w-full bg-muted shrink-0">
        {company.introVideoUrl ? (
          <video
            ref={videoRef}
            src={company.introVideoUrl}
            controls
            muted
            loop
            playsInline
            className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-cover bg-black aspect-video"
            data-ai-hint="company video"
            poster={company.logoUrl || `https://placehold.co/600x338.png?text=${encodeURIComponent(company.name)}`}
          >
            Your browser does not support the video tag.
          </video>
        ) : company.logoUrl ? (
          <Image
            src={company.logoUrl}
            alt={company.name + " logo"}
            width={600}
            height={338} // Adjusted to a more standard banner/logo aspect
            className="object-contain w-full h-auto max-h-[50vh] sm:max-h-[60vh] aspect-[16/9] p-4" // aspect-video might be better for logos if wide
            data-ai-hint={company.dataAiHint || "company logo"}
            priority
          />
        ) : (
          <div className="w-full h-[200px] sm:h-[250px] bg-muted flex items-center justify-center" data-ai-hint="company building">
            <Building className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex-grow flex flex-col overflow-y-auto">
        <CardHeader className="p-0 mb-1.5 sm:mb-2">
          <CardTitle className="text-lg sm:text-xl font-bold text-primary truncate">{company.name}</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">{company.industry}</CardDescription>
          {company.jobOpenings && company.jobOpenings.length > 0 && (
            <p className="text-base sm:text-lg font-semibold text-foreground mt-0.5 sm:mt-1 line-clamp-2">{company.jobOpenings[0].title}</p>
          )}
        </CardHeader>

        <CardContent className="p-0 mb-2 sm:mb-3 space-y-1 sm:space-y-1.5 text-xs sm:text-sm">
          {company.location && (
             <div className="flex items-center text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span>{company.location || "Not specified"}</span>
            </div>
          )}
          {company.salaryRange && (
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span>{company.salaryRange}</span>
            </div>
          )}
          {company.jobType && (
            <div className="flex items-center text-muted-foreground">
              <JobTypeIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span>{company.jobType}</span>
            </div>
          )}
          
          <p className="text-muted-foreground line-clamp-2 sm:line-clamp-3 pt-1">
            {(company.jobOpenings && company.jobOpenings.length > 0 ? company.jobOpenings[0].description : company.description)}
            {(company.jobOpenings && company.jobOpenings.length > 0 ? company.jobOpenings[0].description : company.description).length > 100 && <span className="text-primary cursor-pointer hover:underline ml-1 text-xs">Read more</span>}
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
         {/* Spacer to push footer down if content is short, not strictly needed if CardFooter is outside this scrollable div */}
         {/* <div className="flex-grow"></div>  */}
      </div>
    </div>
  );
}
