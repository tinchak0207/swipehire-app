
import type { Candidate } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Lightbulb, MapPin, Zap, DollarSign, Save, Share2 } from 'lucide-react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface CandidateCardContentProps {
  candidate: Candidate;
}

export function CandidateCardContent({ candidate }: CandidateCardContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Video or Avatar Section */}
       <div className="relative w-full" style={{ paddingTop: candidate.videoResumeUrl ? '56.25%' : '0' }}> {/* 16:9 aspect ratio for video */}
        {candidate.videoResumeUrl ? (
          <video
            src={candidate.videoResumeUrl}
            controls
            autoPlay
            muted
            loop
            className="absolute top-0 left-0 w-full h-full object-cover bg-black"
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
            height={350} // Adjust height as needed, or make it responsive
            className="object-cover w-full h-56 sm:h-64 md:h-72" // Fixed height for image-only
            data-ai-hint={candidate.dataAiHint || "person"}
          />
        ) : (
          <div className="w-full h-56 sm:h-64 md:h-72 bg-muted flex items-center justify-center" data-ai-hint="profile avatar placeholder">
            <Briefcase className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
      </div>


      {/* Content Section */}
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
          
          {/* Placeholder for salary expectation - add to Candidate type if needed */}
          {/* <div className="flex items-center text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2 shrink-0" />
              <span>Expected Salary: $XXk - $YYk</span>
          </div> */}

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
         {/* Action Buttons - Placed in CardFooter in the parent DiscoveryPage to manage state */}
      </div>
    </div>
  );
}
