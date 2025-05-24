import type { Candidate } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Lightbulb, MapPin, Zap } from 'lucide-react';
import { CardContent, CardFooter, CardHeader } from '../ui/card';

interface CandidateCardContentProps {
  candidate: Candidate;
}

export function CandidateCardContent({ candidate }: CandidateCardContentProps) {
  return (
    <div className="flex flex-col h-full">
      <CardHeader className="p-0 relative">
        {candidate.avatarUrl ? (
          <Image
            src={candidate.avatarUrl}
            alt={candidate.name}
            width={500}
            height={350}
            className="object-cover w-full h-64 sm:h-80"
            data-ai-hint={candidate.dataAiHint || "person"}
          />
        ) : (
          <div className="w-full h-64 sm:h-80 bg-muted flex items-center justify-center">
            <Briefcase className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-12">
          <h2 className="text-2xl font-bold text-white truncate">{candidate.name}</h2>
          <p className="text-md text-primary-foreground/90 truncate">{candidate.role}</p>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground mb-3 h-16 overflow-hidden line-clamp-3">
          {candidate.experienceSummary}
        </p>
        {candidate.location && (
            <div className="flex items-center text-xs text-muted-foreground mb-1">
                <MapPin className="h-3 w-3 mr-1.5" />
                {candidate.location}
            </div>
        )}
        {candidate.desiredWorkStyle && (
            <div className="flex items-center text-xs text-muted-foreground mb-3">
                <Lightbulb className="h-3 w-3 mr-1.5" />
                {candidate.desiredWorkStyle}
            </div>
        )}
        
        <div className="mb-2">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Skills:</h4>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
            ))}
            {candidate.skills.length > 5 && <Badge variant="secondary" className="text-xs">...</Badge>}
          </div>
        </div>
      </CardContent>

      {candidate.profileStrength && (
        <CardFooter className="p-4 border-t bg-muted/30">
          <div className="flex items-center text-xs text-primary font-medium">
            <Zap className="h-4 w-4 mr-1.5 text-accent" />
            Profile Strength: {candidate.profileStrength}%
            {candidate.profileStrength > 90 && <Badge variant="default" className="ml-2 bg-green-500 hover:bg-green-600 text-white">Top Candidate</Badge>}
          </div>
        </CardFooter>
      )}
    </div>
  );
}
