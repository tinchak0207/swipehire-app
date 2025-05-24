
import type { Company } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Building, Sparkles, Users, PlayCircle } from 'lucide-react';
import { CardContent, CardFooter, CardHeader } from '../ui/card';

interface CompanyCardContentProps {
  company: Company;
}

export function CompanyCardContent({ company }: CompanyCardContentProps) {
  return (
    <div className="flex flex-col h-full">
      <CardHeader className="p-0 relative">
        {company.introVideoUrl ? (
           <div className="w-full h-64 sm:h-80 bg-black flex flex-col items-center justify-center text-white relative" data-ai-hint="video content">
            <Image
              src={company.logoUrl || 'https://placehold.co/500x350.png'} // Use logo as poster or generic
              alt={company.name + " intro video poster"}
              layout="fill"
              objectFit="cover"
              className="opacity-50"
              data-ai-hint={company.dataAiHint || "logo brand"}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4">
              <PlayCircle className="w-16 h-16 text-white/80 mb-2" />
              <span className="text-lg font-semibold">Watch Company Intro</span>
              <span className="text-sm text-white/70">(Feature coming soon)</span>
            </div>
          </div>
        ) : company.logoUrl ? (
          <Image
            src={company.logoUrl}
            alt={company.name}
            width={500}
            height={350}
            className="object-cover w-full h-64 sm:h-80" 
            data-ai-hint={company.dataAiHint || "logo brand"}
          />
        ) : (
          <div className="w-full h-64 sm:h-80 bg-muted flex items-center justify-center" data-ai-hint="company logo">
            <Building className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-12">
          <h2 className="text-2xl font-bold text-white truncate">{company.name}</h2>
          <p className="text-md text-primary-foreground/90 truncate">{company.industry}</p>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground mb-3 h-16 overflow-hidden line-clamp-3">
          {company.description}
        </p>
        
        {company.jobOpenings && company.jobOpenings.length > 0 && (
          <div className="mb-3">
             <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center">
                <Users className="h-3.5 w-3.5 mr-1.5" /> Open Roles:
            </h4>
            <div className="flex flex-wrap gap-1.5">
                {company.jobOpenings.slice(0,2).map(job => (
                    <Badge key={job.title} variant="outline" className="text-xs">{job.title}</Badge>
                ))}
                {company.jobOpenings.length > 2 && <Badge variant="outline" className="text-xs">+{company.jobOpenings.length - 2} more</Badge>}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-accent" /> Culture Highlights:
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {company.cultureHighlights.slice(0, 3).map((highlight) => (
              <Badge key={highlight} variant="secondary" className="text-xs bg-accent/10 text-accent-foreground hover:bg-accent/20">{highlight}</Badge>
            ))}
            {company.cultureHighlights.length > 3 && <Badge variant="secondary" className="text-xs bg-accent/10 text-accent-foreground hover:bg-accent/20">...</Badge>}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t bg-muted/30">
        {company.introVideoUrl ? (
          <p className="text-xs text-primary font-medium">
              Swipe to see more or learn about roles!
          </p>
        ) : (
           <p className="text-xs text-muted-foreground">
              Learn more about their culture and open roles.
          </p>
        )}
      </CardFooter>
    </div>
  );
}
