
import type { Candidate, PersonalityTraitAssessment, JobCriteriaForAI, CandidateProfileForAI, ProfileRecommenderOutput } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Lightbulb, MapPin, Users, CheckCircle, AlertTriangle, XCircle, Sparkles, Share2, Brain, Loader2, ThumbsDown, Info, ThumbsUp, Lock, Video, ListChecks, Users2, ChevronsUpDown, Eye, TrendingUp, Star, Link as LinkIcon, Mail, Twitter, Linkedin, CalendarDays } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { recommendProfile } from '@/ai/flows/profile-recommender';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


interface CandidateCardContentProps {
  candidate: Candidate;
  onSwipeAction: (candidateId: string, action: 'like' | 'pass' | 'details' | 'share') => void;
  isLiked: boolean;
  isGuestMode?: boolean;
}

const SWIPE_THRESHOLD = 75;
const MAX_ROTATION = 10; // degrees
const MAX_SUMMARY_LENGTH_CARD = 60;
const MAX_SUMMARY_LENGTH_MODAL_INITIAL = 200;

type RecruiterWeightedScores = ProfileRecommenderOutput['weightedScores'];


function CandidateDetailsModal({
    isOpen,
    onOpenChange,
    candidate,
    aiRecruiterMatchScore,
    aiRecruiterReasoning,
    aiRecruiterWeightedScores,
    isLoadingAiAnalysis,
    isGuestMode
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    candidate: Candidate;
    aiRecruiterMatchScore: number | null;
    aiRecruiterReasoning: string | null;
    aiRecruiterWeightedScores: RecruiterWeightedScores | null;
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
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col p-0 bg-background">
        <DialogHeader className="p-4 sm:p-6 border-b flex-row items-center space-x-3 sticky top-0 bg-background z-10 pb-3">
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
            <DialogTitle className="text-xl sm:text-2xl text-primary">{candidate.name}</DialogTitle>
            <CardDescription className="truncate text-sm">{candidate.role}</CardDescription>
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

        <ScrollArea className="flex-1 min-h-0 bg-background"> {/* Added bg-background */}
          <div className="p-4 sm:p-6 space-y-4 pt-3"> {/* Reduced top padding */}
            {candidate.videoResumeUrl && (
              <section className="mb-3"> {/* Reduced margin */}
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                  <Video className="mr-2 h-5 w-5 text-primary" /> Video Resume
                </h3>
                <div className="relative w-full bg-muted aspect-video rounded-lg overflow-hidden shadow-md">
                  <video
                    ref={videoRef}
                    src={candidate.videoResumeUrl}
                    controls={!isGuestMode}
                    muted={false}
                    autoPlay={false}
                    loop
                    playsInline
                    className="w-full h-full object-cover bg-black"
                    poster={candidate.avatarUrl || `https://placehold.co/600x400.png`}
                    data-ai-hint="candidate video"
                  />
                </div>
              </section>
            )}
            <Separator className="my-3" />

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-primary" /> Experience Summary
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {summaryForModalDisplay}
                {candidate.experienceSummary.length > MAX_SUMMARY_LENGTH_MODAL_INITIAL && (
                    <Button
                        variant="link" size="sm"
                        onClick={(e) => {e.stopPropagation(); setShowFullSummaryModal(!showFullSummaryModal);}}
                        className="text-primary hover:underline p-0 h-auto ml-1 text-xs font-semibold"
                        disabled={isGuestMode}
                        data-no-drag="true"
                    >
                        {showFullSummaryModal ? "Read less" : "Read more"}
                    </Button>
                )}
              </p>
            </section>
            <Separator className="my-3" />

            {candidate.desiredWorkStyle && (
                <section>
                    <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-primary" /> Desired Work Style
                    </h3>
                    <p className="text-sm text-muted-foreground">{candidate.desiredWorkStyle}</p>
                </section>
            )}
             <Separator className="my-3" />

            {candidate.skills && candidate.skills.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                    <ListChecks className="mr-2 h-5 w-5 text-primary" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm px-2 py-1">{skill}</Badge>
                  ))}
                </div>
              </section>
            )}
            <Separator className="my-3" />

            <section>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center"> {/* text-sm for consistency */}
                    <Brain className="mr-2 h-5 w-5 text-primary" /> AI Assessment (Recruiter Perspective)
                </h3>
                {isGuestMode ? (
                   <div className="text-sm text-red-500 italic flex items-center p-3 border border-red-300 bg-red-50 rounded-md shadow-sm">
                       <Lock className="h-4 w-4 mr-2"/>Sign in to view AI Assessment and detailed insights.
                   </div>
                ) : isLoadingAiAnalysis ? (
                    <div className="flex items-center text-muted-foreground text-sm">
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span>Analyzing fit...</span>
                    </div>
                ) : aiRecruiterMatchScore !== null ? (
                    <div className="space-y-2 p-3 bg-muted/30 rounded-md shadow-sm">
                        <div className="text-md text-foreground">
                            <span className="font-semibold">Overall Match Score:</span>
                            <span className={cn(
                                "ml-1.5 font-bold text-lg",
                                aiRecruiterMatchScore >= 75 ? 'text-green-600' :
                                aiRecruiterMatchScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                            )}>
                                {aiRecruiterMatchScore}%
                            </span>
                        </div>
                        {aiRecruiterReasoning && (
                            <p className="text-sm text-muted-foreground italic leading-relaxed">
                                {aiRecruiterReasoning}
                            </p>
                        )}
                        {aiRecruiterWeightedScores && (
                            <div className="pt-2 mt-2 border-t border-border/70">
                                <p className="font-medium text-foreground text-sm mb-1">Score Breakdown:</p>
                                <ul className="list-none space-y-0.5 text-xs text-muted-foreground">
                                    <li>Skills Match: <span className="font-semibold text-foreground">{aiRecruiterWeightedScores.skillsMatchScore}%</span></li>
                                    <li>Experience Relevance: <span className="font-semibold text-foreground">{aiRecruiterWeightedScores.experienceRelevanceScore}%</span></li>
                                    <li>Culture Fit: <span className="font-semibold text-foreground">{aiRecruiterWeightedScores.cultureFitScore}%</span></li>
                                    <li>Growth Potential: <span className="font-semibold text-foreground">{aiRecruiterWeightedScores.growthPotentialScore}%</span></li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                     <p className="text-sm text-muted-foreground italic">AI assessment currently unavailable for this candidate.</p>
                )}
            </section>
            <Separator className="my-3" />

            <section>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center"> {/* text-sm for consistency */}
                  <Users2 className="mr-2 h-5 w-5 text-primary" /> Coworker Fit Profile
                </h3>
                {isGuestMode ? (
                   <div className="text-sm text-red-500 italic flex items-center p-3 border border-red-300 bg-red-50 rounded-md shadow-sm">
                       <Lock className="h-4 w-4 mr-2"/>Sign in to view detailed Coworker Fit Profile.
                   </div>
                ) : (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-md shadow-sm">
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
            </section>
            <Separator className="my-3" />

            {candidate.profileStrength && !isGuestMode && (
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center"> {/* text-sm for consistency */}
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Profile Strength
                </h3>
                <div className="flex items-center text-md text-primary font-medium">
                  {candidate.profileStrength}%
                  {candidate.profileStrength > 89 && <Badge variant="default" className="ml-2 text-xs px-2 py-0.5 bg-green-500 hover:bg-green-600 text-white">Top Talent</Badge>}
                </div>
              </section>
            )}
            {isGuestMode && (
              <section className="text-sm text-red-500 italic flex items-center p-3 border border-red-300 bg-red-50 rounded-md shadow-sm">
                  <Lock className="h-4 w-4 mr-2"/>Profile Strength visible to registered users.
              </section>
            )}
          </div>
        </ScrollArea>
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
  const [aiRecruiterWeightedScores, setAiRecruiterWeightedScores] = useState<RecruiterWeightedScores | null>(null);


  const fetchAiRecruiterAnalysis = useCallback(async () => {
    if (!candidate || isGuestMode) {
        if (isGuestMode) {
            setAiRecruiterMatchScore(null);
            setAiRecruiterReasoning("AI Assessment disabled for guest users.");
            setAiRecruiterWeightedScores(null);
        }
        return;
    }
    setIsLoadingAiAnalysis(true);
    setAiRecruiterMatchScore(null);
    setAiRecruiterReasoning(null);
    setAiRecruiterWeightedScores(null);

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

      // Using a generic job criteria for recruiter's perspective analysis
      const genericJobCriteria: JobCriteriaForAI = {
        title: candidate.role || "General Role Assessment",
        description: `Assessing overall potential and fit for a role similar to ${candidate.role || 'the candidate\'s stated preference'}. Considering their skills and experience level. Company culture emphasizes innovation and collaboration.`,
        requiredSkills: candidate.skills?.slice(0,3) || ["communication", "problem-solving"],
        requiredExperienceLevel: candidate.workExperienceLevel || WorkExperienceLevel.MID_LEVEL,
        companyCultureKeywords: ["innovative", "collaborative", "driven", "growth-oriented"],
        companyIndustry: "Technology / General Business", // Generic industry
      };

      const result = await recommendProfile({ candidateProfile: candidateForAI, jobCriteria: genericJobCriteria });
      setAiRecruiterMatchScore(result.matchScore);
      setAiRecruiterReasoning(result.reasoning);
      setAiRecruiterWeightedScores(result.weightedScores);

    } catch (error: any) {
      console.error("Error fetching AI recruiter analysis for candidate " + candidate.name + ":", error);
      toast({ title: "AI Analysis Error", description: `Could not get AI assessment for ${candidate.name}. ${error.message || ''}`, variant: "destructive", duration: 3000 });
      setAiRecruiterMatchScore(0);
      setAiRecruiterReasoning("AI analysis failed to complete.");
      setAiRecruiterWeightedScores(null);
    } finally {
      setIsLoadingAiAnalysis(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate.id, candidate.name, candidate.role, candidate.skills, candidate.workExperienceLevel, candidate.experienceSummary, candidate.desiredWorkStyle, candidate.pastProjects, candidate.educationLevel, candidate.locationPreference, candidate.languages, candidate.salaryExpectationMin, candidate.salaryExpectationMax, candidate.availability, candidate.jobTypePreference, candidate.personalityAssessment, isGuestMode, toast]);

  useEffect(() => {
    // Fetch AI analysis when the modal is about to open, if not already fetched or loading, and not in guest mode.
    // This prevents fetching for every card initially.
    if (isDetailsModalOpen && !isGuestMode && !aiRecruiterMatchScore && !isLoadingAiAnalysis) {
        fetchAiRecruiterAnalysis();
    } else if (isGuestMode && isDetailsModalOpen) { // Handle guest mode when modal opens
        setAiRecruiterMatchScore(null);
        setAiRecruiterReasoning("AI Assessment disabled in Guest Mode.");
        setAiRecruiterWeightedScores(null);
        setIsLoadingAiAnalysis(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetailsModalOpen, isGuestMode, fetchAiRecruiterAnalysis]);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGuestMode) return;
    const targetElement = e.target as HTMLElement;
    if (targetElement.closest('button[data-modal-trigger="true"], a, [data-no-drag="true"], .no-swipe-area, [role="dialog"], input, textarea, [role="listbox"], [role="option"]')) {
      if (targetElement.tagName === 'VIDEO' && targetElement.hasAttribute('controls')) {
        const video = targetElement as HTMLVideoElement;
        const rect = video.getBoundingClientRect();
        if (e.clientY > rect.bottom - 40) { // Ignore clicks on video controls area
            return;
        }
      } else if (targetElement.closest('button, a, [data-no-drag="true"], [role="dialog"], input, textarea, [role="listbox"], [role="option"]')) {
        return; // Don't start drag if clicking on interactive elements
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

  const handleShareAction = async (platform: 'copy' | 'email' | 'linkedin' | 'twitter') => {
    if (isGuestMode) {
        toast({ title: "Feature Locked", description: "Sign in to share profiles.", variant: "default"});
        return;
    }
    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/candidate/${candidate.id}` : `https://swipehire.example.com/candidate/${candidate.id}`;
    const shareText = `Check out this candidate on SwipeHire: ${candidate.name} - ${candidate.role || 'Talented Professional'}.`;
    const emailSubject = `Interesting Candidate Profile: ${candidate.name}`;
    const emailBody = `${shareText}\n\nView their profile here: ${profileUrl}`;

    switch(platform) {
        case 'copy':
            try {
                await navigator.clipboard.writeText(`${shareText} Profile: ${profileUrl}`);
                toast({ title: "Copied to Clipboard!", description: "Candidate profile link copied." });
            } catch (err) {
                toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" });
            }
            break;
        case 'email':
            window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            break;
        case 'linkedin':
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&title=${encodeURIComponent(shareText)}`, '_blank');
            break;
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`, '_blank');
            break;
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
    onClickOverride,
    isDropdownTrigger = false,
  }: {
    action: 'like' | 'pass' | 'details' | 'share';
    Icon: React.ElementType;
    label: string;
    className?: string;
    isSpecificActionLiked?: boolean;
    onClickOverride?: (e: React.MouseEvent) => void;
    isDropdownTrigger?: boolean;
  }) => {
    const baseClasses = "flex-col h-auto py-1 text-xs sm:text-sm";
    const guestClasses = "bg-red-400 text-white cursor-not-allowed hover:bg-red-500";
    const regularClasses = extraClassName;
    const effectiveOnClick = onClickOverride || ((e: React.MouseEvent) => { e.stopPropagation(); if (!isGuestMode) onSwipeAction(candidate.id, action); });
    
    const buttonContent = (
        <>
            {isGuestMode && action !== 'details' ? <Lock className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5" /> : <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 mb-0.5", isSpecificActionLiked && action === 'like' ? "fill-green-500 text-green-500" : "")} />}
            <span className="text-xs">{label}</span>
        </>
    );

    if (isDropdownTrigger) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild disabled={isGuestMode}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(baseClasses, isGuestMode ? guestClasses : regularClasses)}
                                aria-label={`${label} ${candidate.name}`}
                                data-no-drag="true"
                                onClick={(e) => e.stopPropagation()} // Prevent card drag
                            >
                                {buttonContent}
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                     {isGuestMode && (
                        <TooltipContent side="bottom" className="bg-red-500 text-white border-red-600">
                            <p>Sign in to share</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(baseClasses, isGuestMode && action !== 'details' ? guestClasses : regularClasses)}
              onClick={effectiveOnClick}
              disabled={isGuestMode && action !== 'details'}
              aria-label={`${label} ${candidate.name}`}
              data-no-drag="true"
              data-modal-trigger={action === 'details' ? 'true' : undefined}
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          {isGuestMode && action !== 'details' && (
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
        {/* Media Area */}
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

         {/* Text Content & Actions Footer */}
        <div className="flex-1 min-h-0 p-3 sm:p-4 flex flex-col"> {/* Removed outer text content wrapper for direct flex layout */}
            {/* Info section that takes available space and truncates */}
            <div className="flex-1 min-h-0 space-y-1 text-xs sm:text-sm"> {/* This div will scroll if content overflows */}
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

                <p className="text-muted-foreground line-clamp-2 sm:line-clamp-3">
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

            {/* Action Buttons Footer - fixed at the bottom of this flex column */}
            <CardFooter className="p-0 pt-2 sm:pt-3 grid grid-cols-4 gap-1 sm:gap-2 border-t bg-card shrink-0 no-swipe-area mt-2 sm:mt-3">
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
              <ActionButton action="like" Icon={ThumbsUp} label="Like" className={isLiked ? 'text-green-600 fill-green-500 hover:bg-green-500/10' : 'text-muted-foreground hover:text-green-600 hover:bg-green-500/10'} isSpecificActionLiked={isLiked} />
              
              <DropdownMenu>
                 <ActionButton action="share" Icon={Share2} label="Share" className="hover:bg-gray-500/10 text-muted-foreground hover:text-gray-600" isDropdownTrigger={true} />
                <DropdownMenuContent side="top" align="end" className="w-40" onClick={(e) => e.stopPropagation()} data-no-drag="true">
                    <DropdownMenuItem onClick={() => handleShareAction('copy')} className="cursor-pointer">
                        <LinkIcon className="mr-2 h-4 w-4" /> Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareAction('email')} className="cursor-pointer">
                        <Mail className="mr-2 h-4 w-4" /> Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareAction('linkedin')} className="cursor-pointer">
                        <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareAction('twitter')} className="cursor-pointer">
                        <Twitter className="mr-2 h-4 w-4" /> X / Twitter
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
        </div>
      </div>

      <CandidateDetailsModal
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        candidate={candidate}
        aiRecruiterMatchScore={aiRecruiterMatchScore}
        aiRecruiterReasoning={aiRecruiterReasoning}
        aiRecruiterWeightedScores={aiRecruiterWeightedScores}
        isLoadingAiAnalysis={isLoadingAiAnalysis}
        isGuestMode={isGuestMode}
      />
    </>
  );
}

