
import type { Candidate, PersonalityTraitAssessment, JobCriteriaForAI, CandidateProfileForAI } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Lightbulb, MapPin, Zap, Users, CheckCircle, AlertTriangle, XCircle, Sparkles, Share2, Brain, Loader2, ThumbsDown, Info, ThumbsUp, Lock, Video, ListChecks, Users2, ChevronsUpDown, Eye } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { recommendProfile } from '@/ai/flows/profile-recommender';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

interface CandidateCardContentProps {
  candidate: Candidate;
  onSwipeAction: (candidateId: string, action: 'like' | 'pass' | 'details' | 'share') => void;
  isLiked: boolean;
  isGuestMode?: boolean;
}

const SWIPE_THRESHOLD = 75;
const MAX_ROTATION = 10; // degrees
const MAX_SUMMARY_LENGTH_CARD = 70; // Shortened for card display
const MAX_SUMMARY_LENGTH_MODAL_INITIAL = 250;


function CandidateDetailsModal({ 
    isOpen, 
    onOpenChange, 
    candidate, 
    aiRecruiterMatchScore, 
    aiRecruiterReasoning, 
    isLoadingAiAnalysis,
    isGuestMode 
}: { 
    isOpen: boolean; 
    onOpenChange: (open: boolean) => void; 
    candidate: Candidate; 
    aiRecruiterMatchScore: number | null; 
    aiRecruiterReasoning: string | null; 
    isLoadingAiAnalysis: boolean;
    isGuestMode?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFullSummaryModal, setShowFullSummaryModal] = useState(false);

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    if (!currentVideoRef || !isOpen) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentVideoRef.play().catch(error => console.log("Autoplay prevented for candidate video in modal:", error.name, error.message));
        } else {
          currentVideoRef.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(currentVideoRef);
    return () => {
      if (currentVideoRef) observer.unobserve(currentVideoRef);
      observer.disconnect();
    };
  }, [isOpen, candidate.videoResumeUrl]);
  
  const summaryForModalDisplay = candidate.experienceSummary.length > MAX_SUMMARY_LENGTH_MODAL_INITIAL && !showFullSummaryModal
    ? `${candidate.experienceSummary.substring(0, MAX_SUMMARY_LENGTH_MODAL_INITIAL)}...`
    : candidate.experienceSummary;

  const renderPersonalityFitIcon = (fit: PersonalityTraitAssessment['fit']) => {
    switch (fit) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-500 mr-1.5 shrink-0" />;
      case 'neutral': return <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1.5 shrink-0" />;
      case 'negative': return <XCircle className="h-4 w-4 text-red-500 mr-1.5 shrink-0" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 border-b flex-row items-center space-x-3">
          {candidate.avatarUrl && (
            <Image
              src={candidate.avatarUrl}
              alt={candidate.name}
              width={60}
              height={60}
              className="object-cover rounded-full border-2 border-primary"
              data-ai-hint={candidate.dataAiHint || "person"}
            />
          )}
          <div className="flex-grow">
            <DialogTitle className="text-2xl text-primary">{candidate.name}</DialogTitle>
            <CardDescription className="truncate">{candidate.role}</CardDescription>
            {candidate.location && (
                <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3 mr-1 shrink-0" />
                    <span>{candidate.location}</span>
                </div>
            )}
          </div>
          {candidate.isUnderestimatedTalent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="ml-auto border-yellow-500 text-yellow-600 bg-yellow-500/10 cursor-default shrink-0 py-1 px-2">
                    <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
                    Hidden Gem
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">{candidate.underestimatedReasoning || "This candidate shows unique potential!"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 p-4 sm:p-6 overscroll-y-contain no-scrollbar">
          <div className="space-y-5">
            {candidate.videoResumeUrl && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                  <Video className="mr-2 h-5 w-5 text-primary" /> Video Resume
                </h3>
                <div className="relative w-full bg-muted aspect-video rounded-lg overflow-hidden shadow-md">
                  <video
                    ref={videoRef}
                    src={candidate.videoResumeUrl}
                    controls={!isGuestMode}
                    muted={false} // Allow sound in modal
                    autoPlay={false} // User explicitly opens modal, can control play
                    loop
                    playsInline
                    className="w-full h-full object-cover bg-black"
                    poster={candidate.avatarUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(candidate.name)}`}
                    data-ai-hint="candidate video resume player"
                  />
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-primary" /> Experience Summary
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {summaryForModalDisplay}
                {candidate.experienceSummary.length > MAX_SUMMARY_LENGTH_MODAL_INITIAL && (
                    <Button
                        variant="link" size="sm"
                        onClick={(e) => {e.stopPropagation(); setShowFullSummaryModal(!showFullSummaryModal);}}
                        className="text-primary hover:underline p-0 h-auto ml-1 text-xs font-semibold"
                        disabled={isGuestMode}
                    >
                        {showFullSummaryModal ? "Read less" : "Read more"}
                    </Button>
                )}
              </p>
            </div>

            {candidate.desiredWorkStyle && (
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-primary" /> Desired Work Style
                    </h3>
                    <p className="text-sm text-muted-foreground">{candidate.desiredWorkStyle}</p>
                </div>
            )}

            {candidate.skills && candidate.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                    <ListChecks className="mr-2 h-5 w-5 text-primary" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm px-2 py-1">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
         
            {/* AI Assessment Section */}
            <div className="pt-3 border-t">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                    <Brain className="mr-2 h-5 w-5 text-primary" /> AI Assessment
                </h3>
                {isGuestMode ? (
                   <div className="text-sm text-red-500 italic flex items-center p-3 border border-red-300 bg-red-50 rounded-md">
                       <Lock className="h-4 w-4 mr-2"/>Sign in to view AI Assessment and detailed insights.
                   </div>
                ) : isLoadingAiAnalysis ? (
                    <div className="flex items-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span>Analyzing fit...</span>
                    </div>
                ) : aiRecruiterMatchScore !== null ? (
                    <div className="space-y-1 p-3 bg-muted/30 rounded-md">
                        <div className="text-md text-foreground">
                            <span className="font-semibold">Recruiter Match Score:</span>
                            <span className={cn(
                                "ml-1.5 font-bold text-lg",
                                aiRecruiterMatchScore >= 75 ? 'text-green-600' : 
                                aiRecruiterMatchScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                            )}>
                                {aiRecruiterMatchScore}%
                            </span>
                        </div>
                        {aiRecruiterReasoning && (
                            <p className="text-sm text-muted-foreground italic">
                                {aiRecruiterReasoning}
                            </p>
                        )}
                    </div>
                ) : (
                     <p className="text-sm text-muted-foreground italic">AI assessment currently unavailable for this candidate.</p>
                )}
            </div>

            {/* Coworker Fit Section */}
            <div className="pt-3 border-t">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                  <Users2 className="mr-2 h-5 w-5 text-primary" /> Coworker Fit Profile
                </h3>
                {isGuestMode ? (
                   <div className="text-sm text-red-500 italic flex items-center p-3 border border-red-300 bg-red-50 rounded-md">
                       <Lock className="h-4 w-4 mr-2"/>Sign in to view detailed Coworker Fit Profile.
                   </div>
                ) : (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-md">
                    {candidate.personalityAssessment && candidate.personalityAssessment.length > 0 ? (
                      <div className="mb-2 space-y-1">
                        <p className="font-medium text-foreground text-sm">Personality Insights:</p>
                        {candidate.personalityAssessment.map((item, index) => ( 
                          <div key={index} className="flex items-start text-sm">
                            {renderPersonalityFitIcon(item.fit)}
                            <div className="min-w-0">
                              <span className="font-semibold">{item.trait}:</span>
                              <span className="text-muted-foreground ml-1">{item.reason || (item.fit === 'positive' ? 'Good fit.' : item.fit === 'neutral' ? 'Consider.' : 'Potential challenge.')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-muted-foreground italic">No personality insights available.</p>}
                    {candidate.optimalWorkStyles && candidate.optimalWorkStyles.length > 0 ? (
                      <div>
                        <p className="font-medium text-foreground text-sm">Optimal Work Style:</p>
                        <ul className="list-disc list-inside pl-4 text-muted-foreground space-y-0.5 text-sm">
                          {candidate.optimalWorkStyles.map((style, index) => ( 
                            <li key={index}>{style}</li>
                          ))}
                        </ul>
                      </div>
                    ) : <p className="text-sm text-muted-foreground italic">No optimal work styles defined.</p>}
                  </div>
                )}
            </div>
            
            {/* Profile Strength Section */}
            {candidate.profileStrength && !isGuestMode && (
              <div className="pt-3 border-t">
                <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-primary" /> Profile Strength
                </h3>
                <div className="flex items-center text-md text-primary font-medium">
                  {candidate.profileStrength}%
                  {candidate.profileStrength > 89 && <Badge variant="default" className="ml-2 text-xs px-2 py-0.5 bg-green-500 hover:bg-green-600 text-white">Top Talent</Badge>}
                </div>
              </div>
            )}
            {isGuestMode && (
              <div className="pt-3 border-t text-sm text-red-500 italic flex items-center p-3 border border-red-300 bg-red-50 rounded-md">
                  <Lock className="h-4 w-4 mr-2"/>Profile Strength visible to registered users.
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="p-4 sm:p-6 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export function CandidateCardContent({ candidate, onSwipeAction, isLiked, isGuestMode }: CandidateCardContentProps) {
  const cardContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingAiAnalysis, setIsLoadingAiAnalysis] = useState(false);
  const [aiRecruiterMatchScore, setAiRecruiterMatchScore] = useState<number | null>(null);
  const [aiRecruiterReasoning, setAiRecruiterReasoning] = useState<string | null>(null);


  const fetchAiRecruiterAnalysis = useCallback(async () => {
    if (!candidate || isGuestMode) {
        if (isGuestMode) {
            setAiRecruiterMatchScore(null);
            setAiRecruiterReasoning("AI Assessment disabled for guest users.");
        }
        return;
    }
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
  }, [candidate, toast, isGuestMode]); 

  useEffect(() => {
    if (!isGuestMode) {
        fetchAiRecruiterAnalysis();
    } else {
        setAiRecruiterMatchScore(null);
        setAiRecruiterReasoning("AI Assessment disabled in Guest Mode.");
        setIsLoadingAiAnalysis(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate.id, isGuestMode]); // fetchAiRecruiterAnalysis dependency removed to prevent potential loops, it's stable


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGuestMode) return;
    const targetElement = e.target as HTMLElement;
    // More refined check to allow interaction with modal trigger (Details button)
    if (targetElement.closest('button[data-modal-trigger="true"], a, [data-no-drag="true"], .no-swipe-area')) {
      return; 
    }
    if (targetElement.closest('video[controls]')) {
        const videoElement = targetElement.closest('video[controls]') as HTMLVideoElement;
        const rect = videoElement.getBoundingClientRect();
        if (e.clientY > rect.bottom - 40) { // Approx height of controls
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
    if (!isDragging || !cardContentRef.current || isGuestMode) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLDivElement>) => { 
    if (!isDragging || !cardContentRef.current || isGuestMode) return;
    
    const deltaX = currentX - startX; 
    
    cardContentRef.current.style.transition = 'transform 0.3s ease-out';
    cardContentRef.current.style.transform = 'translateX(0px) rotateZ(0deg)';

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) { 
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
    if (!isDragging || isGuestMode) return 'translateX(0px) rotateZ(0deg)';
    const deltaX = currentX - startX;
    const rotationFactor = Math.min(Math.abs(deltaX) / (SWIPE_THRESHOLD * 2), 1); 
    const rotation = MAX_ROTATION * (deltaX > 0 ? 1 : -1) * rotationFactor;
    return `translateX(${deltaX}px) rotateZ(${rotation}deg)`;
  };
  
  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isGuestMode) {
        toast({ title: "Feature Locked", description: "Sign in to share profiles.", variant: "default"});
        return;
    }
    const shareText = `Check out this candidate profile on SwipeHire: ${candidate.name} - ${candidate.role}.`;
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://swipehire.example.com';

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SwipeHire Candidate: ${candidate.name}`,
          text: shareText,
          url: shareUrl,
        });
        toast({ title: "Profile Shared!", description: "Candidate profile link shared successfully." });
      } catch (error) {
        console.error('Error sharing:', error);
        // toast({ title: "Share Failed", description: "Could not share profile.", variant: "destructive" });
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} See more at: ${shareUrl}`);
        toast({ title: "Copied to Clipboard!", description: "Candidate profile link copied." });
      } catch (err) {
        console.error('Failed to copy to clipboard: ', err);
        toast({ title: "Copy Failed", description: "Could not copy link to clipboard.", variant: "destructive" });
      }
    }
  };
  
  const summaryForCardDisplay = candidate.experienceSummary.length > MAX_SUMMARY_LENGTH_CARD
    ? `${candidate.experienceSummary.substring(0, MAX_SUMMARY_LENGTH_CARD)}...`
    : candidate.experienceSummary;

  const ActionButton = ({
    action,
    Icon,
    label,
    className: extraClassName,
    isSpecificActionLiked,
    onClickOverride // For "Details" button to open modal
  }: {
    action: 'like' | 'pass' | 'details' | 'share';
    Icon: React.ElementType;
    label: string;
    className?: string;
    activeClassName?: string; // No longer needed as active state is on the main card
    isSpecificActionLiked?: boolean;
    onClickOverride?: (e: React.MouseEvent) => void;
  }) => {
    const baseClasses = "flex-col h-auto py-1 text-xs sm:text-sm"; // Adjusted text size
    const guestClasses = "bg-red-400 text-white cursor-not-allowed hover:bg-red-500";
    const regularClasses = extraClassName;
    const effectiveOnClick = onClickOverride || ((e: React.MouseEvent) => { e.stopPropagation(); if (!isGuestMode) onSwipeAction(candidate.id, action); });

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm" // Ensure consistent button size
              className={cn(baseClasses, isGuestMode ? guestClasses : regularClasses)}
              onClick={effectiveOnClick}
              disabled={isGuestMode && action !== 'details'} // Details button has its own guest check
              aria-label={`${label} ${candidate.name}`}
              data-no-drag="true"
              data-modal-trigger={action === 'details' ? 'true' : undefined} // Mark details button
            >
              {isGuestMode ? <Lock className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5" /> : <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 mb-0.5", isSpecificActionLiked && action === 'like' ? "fill-green-500 text-green-500" : "")} />}
              <span className="text-xs">{label}</span>
            </Button>
          </TooltipTrigger>
          {isGuestMode && (
            <TooltipContent side="bottom" className="bg-red-500 text-white border-red-600">
              <p>Sign in to interact</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <div 
        ref={cardContentRef}
        className="flex flex-col h-full overflow-hidden relative bg-card"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{ 
          cursor: isGuestMode ? 'default' : 'grab',
          transform: getCardTransform(),
          transition: isDragging ? 'none' : 'transform 0.3s ease-out', 
        }}
      >
        {/* Media Area (Image Only for Card Surface) */}
        <div className="relative w-full bg-muted shrink-0 h-[60%]">
          {candidate.avatarUrl ? (
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

        {/* Text Content Area (Limited on card) */}
        <div className="flex-1 min-h-0 p-3 sm:p-4 space-y-1 text-xs sm:text-sm">
          <CardHeader className="p-0">
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
                        Gem
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

          <p className="text-muted-foreground line-clamp-2 sm:line-clamp-3"> {/* Limited lines for summary on card */}
            {summaryForCardDisplay}
          </p>

          {candidate.desiredWorkStyle && (
              <div className="flex items-center text-muted-foreground pt-1">
                  <Lightbulb className="h-3.5 w-3.5 mr-1.5 sm:mr-2 shrink-0" />
                  <span className="line-clamp-1">Prefers: {candidate.desiredWorkStyle}</span>
              </div>
          )}

           {candidate.skills && candidate.skills.length > 0 && (
            <div className="pt-1">
              <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 2).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs px-1.5 py-0.5">{skill}</Badge>
                ))}
                {candidate.skills.length > 2 && <Badge variant="outline" className="text-xs px-1.5 py-0.5">+{candidate.skills.length-2} more</Badge>}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <CardFooter className="p-2 grid grid-cols-4 gap-1 sm:gap-2 border-t bg-card shrink-0 no-swipe-area">
          <ActionButton action="pass" Icon={ThumbsDown} label="Pass" className="hover:bg-destructive/10 text-destructive hover:text-destructive" />
          <ActionButton 
            action="details" 
            Icon={Info} 
            label="Details" 
            className="hover:bg-blue-500/10 text-blue-500 hover:text-blue-600" 
            onClickOverride={(e) => {
              e.stopPropagation();
              if (isGuestMode) {
                toast({ title: "Feature Locked", description: "Sign in to view full candidate details.", variant: "default"});
                return;
              }
              setIsDetailsModalOpen(true);
            }}
          />
          <ActionButton action="like" Icon={ThumbsUp} label="Like" className={isLiked ? 'text-green-600 fill-green-500' : 'text-muted-foreground hover:text-green-600'} isSpecificActionLiked={isLiked} />
          <ActionButton action="share" Icon={Share2} label="Share" className="hover:bg-gray-500/10 text-muted-foreground hover:text-gray-600" onClickOverride={handleShareClick} />
        </CardFooter>
      </div>
      
      <CandidateDetailsModal 
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        candidate={candidate}
        aiRecruiterMatchScore={aiRecruiterMatchScore}
        aiRecruiterReasoning={aiRecruiterReasoning}
        isLoadingAiAnalysis={isLoadingAiAnalysis}
        isGuestMode={isGuestMode}
      />
    </>
  );
}

