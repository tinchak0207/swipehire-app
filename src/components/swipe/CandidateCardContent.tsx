
import type { Candidate, PersonalityTraitAssessment, JobCriteriaForAI, CandidateProfileForAI } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Lightbulb, MapPin, Zap, Users, CheckCircle, AlertTriangle, XCircle, Sparkles, Share2, Brain, Loader2, ThumbsDown, Info, ThumbsUp } from 'lucide-react';
import { CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { recommendProfile } from '@/ai/flows/profile-recommender';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CandidateCardContentProps {
  candidate: Candidate;
  onSwipeAction: (candidateId: string, action: 'like' | 'pass' | 'details' | 'share') => void;
  isLiked: boolean;
}

const SWIPE_THRESHOLD = 75;
const MAX_ROTATION = 10; // degrees

export function CandidateCardContent({ candidate, onSwipeAction, isLiked }: CandidateCardContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  
  const [isLoadingAiAnalysis, setIsLoadingAiAnalysis] = useState(false);
  const [aiRecruiterMatchScore, setAiRecruiterMatchScore] = useState<number | null>(null);
  const [aiRecruiterReasoning, setAiRecruiterReasoning] = useState<string | null>(null);

  const fetchAiRecruiterAnalysis = useCallback(async () => {
    if (!candidate) return;
    setIsLoadingAiAnalysis(true);
    setAiRecruiterMatchScore(null);
    setAiRecruiterReasoning(null);

    try {
      const candidateForAI: CandidateProfileForAI = {
        id: candidate.id,
        role: candidate.role || undefined,
        experienceSummary: candidate.experienceSummary || undefined,
        skills: candidate.skills || [],
        location: candidate.location || undefined,
        desiredWorkStyle: candidate.desiredWorkStyle || undefined,
        pastProjects: candidate.pastProjects || undefined,
        workExperienceLevel: candidate.workExperienceLevel || WorkExperienceLevel.UNSPECIFIED,
        educationLevel: candidate.educationLevel || EducationLevel.UNSPECIFIED,
        locationPreference: candidate.locationPreference || LocationPreference.UNSPECIFIED,
        languages: candidate.languages || [],
        salaryExpectationMin: candidate.salaryExpectationMin,
        salaryExpectationMax: candidate.salaryExpectationMax,
        availability: candidate.availability || Availability.UNSPECIFIED,
        jobTypePreference: candidate.jobTypePreference || [],
        personalityAssessment: candidate.personalityAssessment || [],
      };

      const genericJobCriteria: JobCriteriaForAI = {
        title: "General Talent Assessment",
        description: "Assessing overall potential and fit for a variety of roles within a dynamic company.",
        requiredSkills: candidate.skills?.slice(0,3) || ["communication", "problem-solving"],
        requiredExperienceLevel: candidate.workExperienceLevel || WorkExperienceLevel.MID_LEVEL,
        requiredEducationLevel: candidate.educationLevel || EducationLevel.UNIVERSITY,
        companyCultureKeywords: candidate.desiredWorkStyle?.split(',').map(s => s.trim()).filter(s => s.length > 0) || ["innovative", "collaborative"],
        companyIndustry: "Technology", 
      };

      const result = await recommendProfile({ candidateProfile: candidateForAI, jobCriteria: genericJobCriteria });
      setAiRecruiterMatchScore(result.matchScore);
      setAiRecruiterReasoning(result.reasoning);

    } catch (error: any) {
      console.error("Error fetching AI recruiter analysis for candidate " + candidate.name + ":", error);
      toast({ title: "AI Analysis Error", description: `Could not get AI assessment for ${candidate.name}. ${error.message || ''}`, variant: "destructive", duration: 3000 });
    } finally {
      setIsLoadingAiAnalysis(false);
    }
  }, [candidate, toast]); 

  useEffect(() => {
    fetchAiRecruiterAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate.id]);


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

    observer.observe(currentVideoRef);

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
      if (targetElement.tagName === 'VIDEO' && targetElement.hasAttribute('controls')) {
          const videoElement = targetElement as HTMLVideoElement;
          const rect = videoElement.getBoundingClientRect();
          if (e.clientY > rect.bottom - 40) { 
              return; 
          }
      } else {
        return; 
      }
    }
    e.preventDefault(); 
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

  const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLDivElement>) => { 
    if (!isDragging || !cardContentRef.current) return;
    
    const finalDeltaX = currentX - startX; 
    
    cardContentRef.current.style.transition = 'transform 0.3s ease-out';
    cardContentRef.current.style.transform = 'translateX(0px) rotateZ(0deg)';

    if (Math.abs(finalDeltaX) > SWIPE_THRESHOLD) {
      if (finalDeltaX < 0) { 
        onSwipeAction(candidate.id, 'pass');
      } else { 
        onSwipeAction(candidate.id, 'like');
      }
    }
    
    setIsDragging(false);
    setStartX(0); 
    setCurrentX(0); 
    if (cardContentRef.current) {
      cardContentRef.current.style.cursor = 'grab';
    }
    document.body.style.userSelect = ''; 
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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Check out this candidate profile on SwipeHire: ${candidate.name} - ${candidate.role}.`;
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://swipehire.example.com';

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SwipeHire: ${candidate.name}`,
          text: shareText,
          url: shareUrl,
        });
        toast({ title: "Shared!", description: "Candidate profile shared successfully." });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} See more at: ${shareUrl}`);
        toast({ title: "Copied to Clipboard!", description: "Candidate profile link copied." });
      } catch (err)
      {
        console.error('Failed to copy: ', err);
        toast({ title: "Copy Failed", description: "Could not copy link to clipboard.", variant: "destructive" });
      }
    }
  };

  return (
    <div
      ref={cardContentRef}
      className="flex flex-col h-full overflow-hidden relative bg-card"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      style={{ 
        cursor: 'grab',
        transform: getCardTransform(),
        transition: isDragging ? 'none' : 'transform 0.3s ease-out', 
      }}
    >
      <div className="relative w-full bg-muted shrink-0 h-[60%] max-h-[calc(100vh_-_300px)] md:max-h-[calc(100vh_-_250px)]">
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

      <div className="p-3 sm:p-4 flex-grow flex flex-col h-[40%] overflow-hidden">
        <CardHeader className="p-0 mb-2">
          <div className="flex items-start justify-between">
            <div className="flex-grow min-w-0"> 
                <CardTitle className="text-lg sm:text-xl font-bold text-primary truncate">{candidate.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground truncate">{candidate.role}</CardDescription>
            </div>
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
           {candidate.location && (
            <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 shrink-0" />
                <span className="truncate">{candidate.location}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0 mb-2 sm:mb-3 space-y-1.5 text-xs sm:text-sm flex-grow overflow-hidden">
          <p className="text-muted-foreground line-clamp-3">
            {candidate.experienceSummary}
          </p>

          {candidate.desiredWorkStyle && (
              <div className="flex items-center text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5 mr-1.5 sm:mr-2 shrink-0" />
                  <span className="line-clamp-1">{candidate.desiredWorkStyle}</span>
              </div>
          )}

          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mt-1.5 sm:mt-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Skills:</h4>
              <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5">{skill}</Badge>
                ))}
                {candidate.skills.length > 3 && <Badge variant="outline" className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5">+{candidate.skills.length-3} more</Badge>}
              </div>
            </div>
          )}
        </CardContent>

        <div className="mt-2 pt-2 border-t border-border/50 text-xs overflow-hidden">
            <h4 className="font-semibold text-muted-foreground mb-1.5 flex items-center">
                <Brain className="h-4 w-4 mr-1.5 text-primary" /> AI Assessment:
            </h4>
            {isLoadingAiAnalysis && (
                <div className="flex items-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Analyzing...</span>
                </div>
            )}
            {!isLoadingAiAnalysis && aiRecruiterMatchScore !== null && (
                <div className="space-y-1">
                    <div className="text-sm text-foreground">
                        <span className="font-semibold">Match Score:</span>
                        <span className={cn(
                            "ml-1 font-bold",
                            aiRecruiterMatchScore >= 75 ? 'text-green-600' : 
                            aiRecruiterMatchScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                        )}>
                            {aiRecruiterMatchScore}%
                        </span>
                    </div>
                    {aiRecruiterReasoning && (
                        <p className="text-xs text-muted-foreground italic line-clamp-2">
                            {aiRecruiterReasoning}
                        </p>
                    )}
                </div>
            )}
            {!isLoadingAiAnalysis && aiRecruiterMatchScore === null && (
                 <p className="text-xs text-muted-foreground italic">AI assessment unavailable.</p>
            )}
        </div>

        {(candidate.personalityAssessment || candidate.optimalWorkStyles) && (
          <div className="mt-2 pt-2 border-t border-border/50 text-xs overflow-hidden">
            <h4 className="font-semibold text-muted-foreground mb-1.5 flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-primary" /> Coworker Fit Profile:
            </h4>
            {candidate.personalityAssessment && candidate.personalityAssessment.length > 0 && (
              <div className="mb-1 space-y-0.5">
                <p className="font-medium text-foreground text-xs">Personality Insights:</p>
                {candidate.personalityAssessment.slice(0,1).map((item, index) => ( 
                  <div key={index} className="flex items-start">
                    {renderPersonalityFitIcon(item.fit)}
                    <div className="min-w-0">
                      <span className="font-semibold line-clamp-1">{item.trait}:</span>
                      <span className="text-muted-foreground ml-1 line-clamp-1">{item.reason || (item.fit === 'positive' ? 'Good fit.' : item.fit === 'neutral' ? 'Consider.' : 'Potential challenge.')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {candidate.optimalWorkStyles && candidate.optimalWorkStyles.length > 0 && (
              <div>
                <p className="font-medium text-foreground text-xs">Optimal Work Style:</p>
                <ul className="list-disc list-inside pl-4 text-muted-foreground space-y-0.5">
                  {candidate.optimalWorkStyles.slice(0, 1).map((style, index) => ( 
                    <li key={index} className="line-clamp-1">{style}</li>
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
      <CardFooter className="p-2 sm:p-3 grid grid-cols-4 gap-1 sm:gap-2 border-t bg-card shrink-0 no-swipe-area">
        <Button variant="ghost" size="sm" className="flex-col h-auto py-1.5 sm:py-2 hover:bg-destructive/10 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onSwipeAction(candidate.id, 'pass');}} aria-label={`Pass on ${candidate.name}`}>
          <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" /> <span className="text-xs">Pass</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-col h-auto py-1.5 sm:py-2 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); onSwipeAction(candidate.id, 'details');}} aria-label={`View details for ${candidate.name}`}>
          <Info className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" /> <span className="text-xs">Details</span>
        </Button>
        <Button variant="ghost" size="sm" className={cn("flex-col h-auto py-1.5 sm:py-2 hover:bg-green-500/10", isLiked ? 'text-green-600' : 'text-muted-foreground hover:text-green-600')} onClick={(e) => { e.stopPropagation(); onSwipeAction(candidate.id, 'like');}} aria-label={`Like ${candidate.name}`}>
          <ThumbsUp className={cn("h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1", isLiked ? 'fill-green-500' : '')} /> <span className="text-xs">Like</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-col h-auto py-1.5 sm:py-2 hover:bg-gray-500/10 text-muted-foreground hover:text-gray-600" onClick={(e) => {e.stopPropagation(); handleShare(e);}} aria-label={`Share ${candidate.name}`}>
          <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" /> <span className="text-xs">Share</span>
        </Button>
      </CardFooter>
    </div>
  );
}
