
import type { Company } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Building, Sparkles, Users, MapPin, Briefcase as JobTypeIcon, DollarSign, ThumbsDown, Info, Star, ThumbsUp, Save, Share2 } from 'lucide-react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface CompanyCardContentProps {
  company: Company;
  onAction?: (companyId: string, action: 'like' | 'pass' | 'superlike' | 'details' | 'save' | 'share') => void; // Added for card-specific actions
  isLiked?: boolean;
  isSuperLiked?: boolean;
}

export function CompanyCardContent({ company, onAction, isLiked, isSuperLiked }: CompanyCardContentProps) {
  const handleAction = (action: 'like' | 'pass' | 'superlike' | 'details' | 'save' | 'share') => {
    onAction?.(company.id, action);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Video or Logo Section - Top 60% if video exists */}
      <div className="relative w-full" style={{ paddingTop: company.introVideoUrl ? '56.25%' : '0' /* 16:9 aspect ratio for video */ }}>
        {company.introVideoUrl ? (
          <video
            src={company.introVideoUrl}
            controls
            autoPlay
            muted
            loop
            className="absolute top-0 left-0 w-full h-full object-cover bg-black"
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
            height={350}
            className="object-contain w-full h-48 sm:h-56 md:h-64 bg-muted p-4"
            data-ai-hint={company.dataAiHint || "company logo"}
          />
        ) : (
          <div className="w-full h-48 sm:h-56 md:h-64 bg-muted flex items-center justify-center" data-ai-hint="company building">
            <Building className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-grow flex flex-col">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-xl font-bold text-primary truncate">{company.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{company.industry}</CardDescription>
          {company.jobOpenings && company.jobOpenings.length > 0 && (
            <p className="text-lg font-semibold text-foreground mt-1">{company.jobOpenings[0].title}</p>
          )}
           {/* Location can be added here if available in Company type */}
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
        
        {/* Action Buttons - Placed in CardFooter in the parent DiscoveryPage to manage state */}
      </div>
    </div>
  );
}

// Add location to Company type if not already there and update mockData
// Update JobDiscoveryPage.tsx to pass onAction, isLiked, isSuperLiked and render buttons in its CardFooter
