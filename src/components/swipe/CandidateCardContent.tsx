
"use client";

import type { Candidate, PersonalityTraitAssessment, JobCriteriaForAI, CandidateProfileForAI, ProfileRecommenderOutput, UserAIWeights, RecruiterPerspectiveWeights } from '@/lib/types';
import NextImage from 'next/image'; // Renamed to NextImage to avoid conflict
import { Badge } from '@/components/ui/badge';
import { Briefcase, Lightbulb, MapPin, CheckCircle, XCircle as LucideXCircle, Sparkles, Share2, Brain, Loader2, ThumbsDown, Info, ThumbsUp, Lock, Video, ListChecks, Users2, ChevronsUpDown, Eye, TrendingUp, Star as StarIcon, Link as LinkIcon, Mail, Twitter, Linkedin, UserCircle as UserCircleIcon, BarChartHorizontal } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { recommendProfile } from '@/ai/flows/profile-recommender';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle as ShadDialogTitle, DialogClose } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from '@/components/ui/progress';


const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

interface CandidateCardContentProps {
  candidate: Candidate;
  onSwipeAction: (candidateId: string, action: 'like' | 'pass') => void; // Removed 'details' and 'share'
  isLiked: boolean;
  isGuestMode?: boolean;
}

const SWIPE_THRESHOLD = 75;
const MAX_ROTATION = 10;
const MAX_SUMMARY_LENGTH_MODAL_INITIAL = 200;

type RecruiterWeightedScores = ProfileRecommenderOutput['weightedScores'];

const incrementAnalytic = (key: string) => {
  if (typeof window !== 'undefined') {
    const currentCount = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (currentCount + 1).toString());
  }
};

const getThemeClass = (themeKey?: string) => {
  if (!themeKey || themeKey === 'default') return ''; // For default, let Tailwind Card component handle it.
  return `card-theme-${themeKey}`;
};


function CandidateDetailsModal({
    isOpen,
    onOpenChange,
    candidate,
    aiRecruiterMatchScore,
    aiRecruiterReasoning,
    aiRecruiterWeightedScores,
    isLoadingAiAnalysis,
    isGuestMode,
    activeAccordionItem,
    setActiveAccordionItem,
    onFetchAiAnalysis,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    candidate: Candidate;
    aiRecruiterMatchScore: number | null;
    aiRecruiterReasoning: string | null;
    aiRecruiterWeightedScores: RecruiterWeightedScores | null;
    isLoadingAiAnalysis: boolean;
    isGuestMode?: boolean;
    activeAccordionItem: string | undefined;
    setActiveAccordionItem: (value: string | undefined) => void;
    onFetchAiAnalysis: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFullSummaryModal, setShowFullSummaryModal] = useState(false);

  useEffect(() => {
    if (isOpen && candidate && !aiRecruiterMatchScore && !isLoadingAiAnalysis && !isGuestMode) {
      onFetchAiAnalysis();
    }
  }, [isOpen, candidate, aiRecruiterMatchScore, isLoadingAiAnalysis, isGuestMode, onFetchAiAnalysis]);


  useEffect(() => {
    const currentVideoRef = videoRef.current;
    if (!currentVideoRef || !isOpen || !candidate?.videoResumeUrl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentVideoRef.play().catch(error => console.log("Autoplay prevented for candidate video in modal:", error.name, error.message));
        } else {
          currentVideoRef.pause();
        }
      }, { threshold: 0.5 }
    );
    observer.observe(currentVideoRef);
    return () => { if (currentVideoRef) observer.unobserve(currentVideoRef); };
  }, [isOpen, candidate?.videoResumeUrl]);

  if (!candidate) return null;

  const summaryForModalDisplay = candidate.experienceSummary.length > MAX_SUMMARY_LENGTH_MODAL_INITIAL && !showFullSummaryModal
    ? `${candidate.experienceSummary.substring(0, MAX_SUMMARY_LENGTH_MODAL_INITIAL)}...`
    : candidate.experienceSummary;

  const renderPersonalityFitIcon = (fit: PersonalityTraitAssessment['fit']) => {
    switch (fit) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-500 mr-1.5 shrink-0" />;
      case 'neutral': return <Info className="h-4 w-4 text-yellow-500 mr-1.5 shrink-0" />;
      case 'negative': return <LucideXCircle className="h-4 w-4 text-red-500 mr-1.5 shrink-0" />;
      default: return null;
    }
  };

  const modalAvatarSrc = candidate.avatarUrl && candidate.avatarUrl.startsWith('/uploads/')
  ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}`
  : candidate.avatarUrl;
  const needsUnoptimizedModal = modalAvatarSrc?.startsWith(CUSTOM_BACKEND_URL) || modalAvatarSrc?.startsWith('http://localhost');


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col p-0 bg-background">
        <DialogHeader className="p-4 sm:p-6 border-b flex-row items-center space-x-3 sticky top-0 bg-background z-10 pb-3">
          {modalAvatarSrc && modalAvatarSrc !== 'https://placehold.co/500x700.png' ? (
            <NextImage
              src={modalAvatarSrc || 'https://placehold.co/500x700.png'}
              alt={candidate.name}
              width={60}
              height={60}
              className="object-cover rounded-full border-2 border-primary"
              data-ai-hint={candidate.dataAiHint || "person"}
              unoptimized={needsUnoptimizedModal}
            />
          ) : (
             <UserCircleIcon className="w-16 h-16 text-muted-foreground border-2 border-primary rounded-full p-1" />
          )}
          <div className="flex-grow">
            <ShadDialogTitle className="text-xl sm:text-2xl text-primary font-heading">{candidate.name}</ShadDialogTitle>
            <CardDescription className="truncate text-sm text-muted-foreground font-heading">{candidate.role}</CardDescription>
            {candidate.location && (
                <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3 mr-1 shrink-0 text-accent" />
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

        <div className="flex-1 min-h-0 overflow-y-auto bg-background">
          <div className="p-4 sm:p-6 space-y-4 pt-4">
            {candidate.videoResumeUrl && (
              <section className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center font-heading">
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
                    poster={modalAvatarSrc || `https://placehold.co/600x400.png`}
                    data-ai-hint="candidate video"
                  />
                </div>
              </section>
            )}
            <Separator className="my-4" />

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-1.5 flex items-center font-heading">
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
             <Separator className="my-4" />

            {candidate.desiredWorkStyle && (
                <section>
                    <h3 className="text-lg font-semibold text-foreground mb-1.5 flex items-center font-heading">
                        <Lightbulb className="mr-2 h-5 w-5 text-primary" /> Desired Work Style
                    </h3>
                    <p className="text-sm text-muted-foreground">{candidate.desiredWorkStyle}</p>
                </section>
            )}
             <Separator className="my-4" />

            {candidate.skills && candidate.skills.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2.5 flex items-center font-heading">
                    <ListChecks className="mr-2 h-5 w-5 text-primary" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm px-2.5 py-1">{skill}</Badge>
                  ))}
                </div>
              </section>
            )}
            <Separator className="my-4" />
            
            <Accordion type="single" collapsible className="w-full" value={activeAccordionItem} onValueChange={setActiveAccordionItem}>
              <AccordionItem value="ai-assessment">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline data-[state=open]:text-primary font-heading">
                  <div className="flex items-center">
                    <Brain className="mr-2 h-5 w-5" /> AI Assessment (Recruiter Perspective) <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/70" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <p className="text-xs text-muted-foreground italic mb-2.5">
                    Our AI assesses candidates by considering key factors such as skill alignment with typical role requirements, relevance of experience described, potential cultural synergy based on desired work style, and inferred growth capacity. The final score reflects weights you can customize in Settings.
                  </p>
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
                      <div className="space-y-2.5 p-3 bg-muted/30 rounded-md shadow-sm">
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
                              <div className="pt-2.5 mt-2.5 border-t border-border/70">
                                  <p className="font-medium text-foreground text-sm mb-1.5">Score Breakdown (Individual Assessments):</p>
                                  <ul className="list-none space-y-1 text-xs text-muted-foreground">
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
                </AccordionContent>
              </AccordionItem>
              <Separator className="my-4" />
              <AccordionItem value="coworker-fit">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline data-[state=open]:text-primary font-heading">
                  <div className="flex items-center">
                    <Users2 className="mr-2 h-5 w-5" /> Coworker Fit Profile <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/70" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  {isGuestMode ? (
                     <div className="text-sm text-red-500 italic flex items-center p-3 border border-red-300 bg-red-50 rounded-md shadow-sm">
                         <Lock className="h-4 w-4 mr-2"/>Sign in to view detailed Coworker Fit Profile.
                     </div>
                  ) : (
                    <div className="space-y-2.5 p-3 bg-muted/30 rounded-md shadow-sm">
                      {candidate.personalityAssessment && candidate.personalityAssessment.length > 0 ? (
                        <div className="mb-2.5 space-y-1.5">
                          <p className="font-medium text-foreground text-sm">Personality Insights:</p>
                          {candidate.personalityAssessment.map((item, index) => (
                            <div key={index} className="flex items-start text-sm">
                              {renderPersonalityFitIcon(item.fit)}
                              <div className="min-w-0">
                                <span className="font-semibold">{item.trait}:</span>
                                <span className="text-muted-foreground ml-1.5">{item.reason || (item.fit === 'positive' ? 'Good fit.' : item.fit === 'neutral' ? 'Consider.' : 'Potential challenge.')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-muted-foreground italic">No personality insights available.</p>}
                      {candidate.optimalWorkStyles && candidate.optimalWorkStyles.length > 0 ? (
                        <div>
                          <p className="font-medium text-foreground text-sm">Optimal Work Style:</p>
                          <ul className="list-disc list-inside pl-4 text-muted-foreground space-y-1 text-sm">
                            {candidate.optimalWorkStyles.map((style, index) => (
                              <li key={index}>{style}</li>
                            ))}
                          </ul>
                        </div>
                      ) : <p className="text-sm text-muted-foreground italic">No optimal work styles defined.</p>}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
             <Separator className="my-4" />

            {candidate.profileStrength && !isGuestMode && (
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-1.5 flex items-center font-heading">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Profile Strength
                </h3>
                <div className="flex items-center text-md font-medium">
                  <Progress value={candidate.profileStrength} className="w-2/3 h-2.5 mr-2" />
                  <span className="text-accent font-semibold">{candidate.profileStrength}%</span>
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
        </div>
        <DialogFooter className="p-4 border-t sticky bottom-0 bg-background z-10">
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export function CandidateCardContent({ candidate, onSwipeAction, isLiked, isGuestMode }: CandidateCardContentProps) {
  const cardRootRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingAiAnalysis, setIsLoadingAiAnalysis] = useState(false);
  const [aiRecruiterMatchScore, setAiRecruiterMatchScore] = useState<number | null>(null);
  const [aiRecruiterReasoning, setAiRecruiterReasoning] = useState<string | null>(null);
  const [aiRecruiterWeightedScores, setAiRecruiterWeightedScores] = useState<RecruiterWeightedScores | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeAccordionItemModal, setActiveAccordionItemModal] = useState<string | undefined>(undefined);

  const isThemedCard = candidate.cardTheme && candidate.cardTheme !== 'default';
  const isProfessionalDarkTheme = candidate.cardTheme === 'professional-dark';
  const isLavenderTheme = candidate.cardTheme === 'lavender';
  const isLightBgThemedCard = isThemedCard && (isLavenderTheme || ['ocean', 'sunset', 'forest'].includes(candidate.cardTheme!));
  const defaultCard = !isThemedCard;


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
        id: candidate.id, role: candidate.role || undefined, experienceSummary: candidate.experienceSummary || undefined,
        skills: candidate.skills || [], location: candidate.location || undefined, desiredWorkStyle: candidate.desiredWorkStyle || undefined,
        pastProjects: candidate.pastProjects || undefined, workExperienceLevel: candidate.workExperienceLevel || WorkExperienceLevel.UNSPECIFIED,
        educationLevel: candidate.educationLevel || EducationLevel.UNSPECIFIED, locationPreference: candidate.locationPreference || LocationPreference.UNSPECIFIED,
        languages: candidate.languages || [], salaryExpectationMin: candidate.salaryExpectationMin, salaryExpectationMax: candidate.salaryExpectationMax,
        availability: candidate.availability || Availability.UNSPECIFIED, jobTypePreference: candidate.jobTypePreference || [],
        personalityAssessment: candidate.personalityAssessment || [],
      };
      const genericJobCriteria: JobCriteriaForAI = {
        title: candidate.role || "General Role Assessment",
        description: `Assessing overall potential and fit for a role similar to ${candidate.role || 'the candidate\'s stated preference'}. Considering their skills and experience level. Company culture emphasizes innovation and collaboration.`,
        requiredSkills: candidate.skills?.slice(0,3) || ["communication", "problem-solving"],
        requiredExperienceLevel: candidate.workExperienceLevel || WorkExperienceLevel.MID_LEVEL,
        companyCultureKeywords: ["innovative", "collaborative", "driven", "growth-oriented"],
        companyIndustry: "Technology / General Business",
      };
      
      let userAIWeights: UserAIWeights | undefined = undefined;
      if (typeof window !== 'undefined') {
        const storedWeights = localStorage.getItem('userRecruiterAIWeights');
        if (storedWeights) {
          try {
            const parsedRecruiterWeights: RecruiterPerspectiveWeights = JSON.parse(storedWeights);
            if (Object.values(parsedRecruiterWeights).reduce((sum, val) => sum + Number(val || 0), 0) === 100) { // Ensure weights sum to 100
              userAIWeights = { recruiterPerspective: parsedRecruiterWeights };
            }
          } catch (e) { console.warn("Could not parse userRecruiterAIWeights from localStorage", e); }
        }
      }

      const result = await recommendProfile({ candidateProfile: candidateForAI, jobCriteria: genericJobCriteria, userAIWeights });
      setAiRecruiterMatchScore(result.matchScore);
      setAiRecruiterReasoning(result.reasoning);
      setAiRecruiterWeightedScores(result.weightedScores);
      setActiveAccordionItemModal("ai-assessment");

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
  }, [candidate.id, candidate.name, candidate.role, candidate.experienceSummary, candidate.skills, candidate.location, candidate.desiredWorkStyle, candidate.pastProjects, candidate.workExperienceLevel, candidate.educationLevel, candidate.locationPreference, candidate.languages, candidate.salaryExpectationMin, candidate.salaryExpectationMax, candidate.availability, candidate.jobTypePreference, candidate.personalityAssessment, isGuestMode, toast]);


  const handleLocalSwipeAction = (actionType: 'like' | 'pass') => { // Removed 'details'
    if (actionType === 'like') {
      incrementAnalytic('analytics_candidate_likes');
    } else if (actionType === 'pass') {
      incrementAnalytic('analytics_candidate_passes');
    }
    onSwipeAction(candidate.id, actionType);
  };

  const handleDetailsButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isGuestMode) {
       if (!aiRecruiterMatchScore && !isLoadingAiAnalysis) fetchAiRecruiterAnalysis();
    } else {
      setAiRecruiterMatchScore(null);
      setAiRecruiterReasoning("AI Assessment disabled in Guest Mode.");
      setAiRecruiterWeightedScores(null);
      setIsLoadingAiAnalysis(false);
      setActiveAccordionItemModal(undefined); 
    }
    setIsDetailsModalOpen(true);
  };


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGuestMode) return;
    const targetElement = e.target as HTMLElement;
    if (targetElement.closest('video[controls], button, a, [data-no-drag="true"], .no-swipe-area, [role="dialog"], input, textarea, [role="listbox"], [role="option"], [data-radix-scroll-area-viewport]')) {
        if (targetElement.tagName === 'VIDEO' && targetElement.hasAttribute('controls')) {
            const video = targetElement as HTMLVideoElement;
            const rect = video.getBoundingClientRect();
            if (e.clientY > rect.bottom - 40) { 
                return; 
            }
        } else if (targetElement.closest('button, a, [data-no-drag="true"], [role="dialog"], input, textarea, [role="listbox"], [role="option"], [data-radix-scroll-area-viewport]')) {
           return; 
        }
    }
    
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    if (cardRootRef.current) {
      cardRootRef.current.style.cursor = 'grabbing';
      cardRootRef.current.style.transition = 'none';
    }
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !cardRootRef.current || isGuestMode) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !cardRootRef.current || isGuestMode) return;

    const deltaX = currentX - startX;

    cardRootRef.current.style.transition = 'transform 0.3s ease-out';
    cardRootRef.current.style.transform = 'translateX(0px) rotateZ(0deg)';

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        handleLocalSwipeAction('pass');
      } else {
        handleLocalSwipeAction('like');
      }
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
    if (cardRootRef.current) {
      cardRootRef.current.style.cursor = 'grab';
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
  
  const handleShareAction = (action: 'copy' | 'email' | 'linkedin' | 'twitter') => {
    if (isGuestMode) {
      toast({ title: "Feature Locked", description: "Sign in to share profiles.", variant: "default" });
      return;
    }
    const profileUrl = typeof window !== 'undefined' ? window.location.origin : 'https://swipehire-app.com'; 
    const shareText = `Check out this profile on SwipeHire: ${candidate.name} - ${candidate.role}. Visit ${profileUrl}`;
    const emailSubject = `Interesting Profile on SwipeHire: ${candidate.name}`;
    const emailBody = `I found this profile on SwipeHire and thought you might be interested:\n\nName: ${candidate.name}\nRole: ${candidate.role}\n\nView more at: ${profileUrl}\n\nShared from SwipeHire.`;

    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(profileUrl)
          .then(() => toast({ title: "Link Copied!", description: "Profile link copied to clipboard." }))
          .catch(() => toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" }));
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&title=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`, '_blank', 'noopener,noreferrer');
        break;
    }
  };

  const cardAvatarSrc = candidate.avatarUrl && candidate.avatarUrl.startsWith('/uploads/')
  ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}`
  : candidate.avatarUrl;
  const needsUnoptimizedCard = cardAvatarSrc?.startsWith(CUSTOM_BACKEND_URL) || cardAvatarSrc?.startsWith('http://localhost');


  const ActionButton = ({
    action,
    Icon,
    label,
    className: extraClassName,
    isSpecificActionLiked,
    onClickOverride,
  }: {
    action: 'like' | 'pass' | 'details' | 'share_trigger';
    Icon: React.ElementType;
    label: string;
    className?: string;
    isSpecificActionLiked?: boolean;
    onClickOverride?: (e: React.MouseEvent) => void;
  }) => {
    const baseClasses = "flex-col h-auto py-2.5 text-xs sm:text-sm group rounded-lg hover:scale-105 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out";
    let colorClasses = "";
    let hoverBgClass = "hover:bg-accent/10"; // Default hover for un-themed
    let iconFillClass = "";

    if (isGuestMode && (action === 'like' || action === 'pass' || action === 'share_trigger')) {
        colorClasses = "text-white"; 
        hoverBgClass = "hover:bg-red-500/80"; // Guest mode specific override
    } else if (isProfessionalDarkTheme) { // Dark theme (professional-dark)
        colorClasses = isSpecificActionLiked && action === 'like' ? "text-green-300" : "text-primary-foreground/90";
        iconFillClass = isSpecificActionLiked && action === 'like' ? "fill-green-300" : "";
        hoverBgClass = "hover:bg-white/10";
        if (action === 'like') colorClasses = cn(colorClasses, "hover:text-green-300");
        else if (action === 'pass') colorClasses = cn(colorClasses, "hover:text-red-300");
        else if (action === 'details') colorClasses = cn(colorClasses, "hover:text-blue-300");
        else colorClasses = cn(colorClasses, "hover:text-primary-foreground");
    } else if (isLightBgThemedCard) { // Light themes (ocean, sunset, forest, lavender)
        colorClasses = isSpecificActionLiked && action === 'like' ? "text-green-600" : "text-foreground/80";
        iconFillClass = isSpecificActionLiked && action === 'like' ? "fill-green-600" : "";
        hoverBgClass = "hover:bg-black/5"; // Subtle dark hover for light themes
        if (action === 'like') colorClasses = cn(colorClasses, "hover:text-green-600");
        else if (action === 'pass') colorClasses = cn("text-destructive", "hover:text-destructive-foreground"); // Make pass always red
        else if (action === 'details') colorClasses = cn("text-primary", "hover:text-primary");
        else colorClasses = cn(colorClasses, "hover:text-foreground");

         // Override hover for specific actions on light themes if needed
        if (action === 'pass') hoverBgClass = "hover:bg-destructive/10";
        if (action === 'like') hoverBgClass = "hover:bg-green-500/10";
        if (action === 'details') hoverBgClass = "hover:bg-primary/10";


    } else { // Default card (light background from Tailwind's bg-card)
        colorClasses = isSpecificActionLiked && action === 'like' ? "text-green-600" 
                    : action === 'details' ? "text-primary" 
                    : action === 'pass' ? "text-destructive"
                    : "text-muted-foreground";
        iconFillClass = isSpecificActionLiked && action === 'like' ? "fill-green-600" : "";
        if (action === 'like') hoverBgClass = "hover:bg-green-500/10";
        else if (action === 'pass') hoverBgClass = "hover:bg-destructive/10";
        else if (action === 'details') hoverBgClass = "hover:bg-primary/10";
        else hoverBgClass = "hover:bg-muted";
    }
    
    const effectiveOnClick = onClickOverride || ((e: React.MouseEvent) => { 
        e.stopPropagation(); 
        if (!isGuestMode) {
            if (action === 'like' || action === 'pass') {
                handleLocalSwipeAction(action);
            }
            // Details click is handled by onClickOverride now
        } else if (isGuestMode && (action === 'like' || action === 'pass' || action === 'share_trigger')) {
            toast({ title: "Feature Locked", description: "Sign in to interact.", variant: "default" });
        } else if (isGuestMode && action === 'details') {
             if(onClickOverride) onClickOverride(e); // Allow details modal to open for guests
        }
    });

    const buttonElement = (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            baseClasses, 
            colorClasses, 
            hoverBgClass, 
            isGuestMode && (action === 'like' || action === 'pass' || action === 'share_trigger') && "bg-red-400 !text-white", 
            extraClassName
          )}
          onClick={action !== 'share_trigger' ? effectiveOnClick : undefined}
          disabled={isGuestMode && (action === 'like' || action === 'pass' || action === 'share_trigger')}
          aria-label={`${label} ${candidate.name}`}
          data-no-drag="true"
          data-modal-trigger={action === 'details' ? 'true' : undefined}
        >
          {isGuestMode && (action === 'like' || action === 'pass' || action === 'share_trigger') ? <Lock className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" /> : <Icon className={cn("h-5 w-5 mb-1 group-hover:scale-110 transition-transform", iconFillClass)} />}
          <span className="text-xs">{label}</span>
        </Button>
    );

    if (action === 'share_trigger') {
        return (
            <DropdownMenu onOpenChange={setIsShareModalOpen}>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                {buttonElement}
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                         <TooltipContent side="bottom" className={cn(isGuestMode && "bg-red-500 text-white border-red-600")}>
                            <p>{isGuestMode ? "Sign in to share" : label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <DropdownMenuContent align="end" className="w-40" data-no-drag="true">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('copy') }} data-no-drag="true">
                        <LinkIcon className="mr-2 h-4 w-4" /> Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('email') }} data-no-drag="true">
                        <Mail className="mr-2 h-4 w-4" /> Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('linkedin') }} data-no-drag="true">
                        <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('twitter') }} data-no-drag="true">
                        <Twitter className="mr-2 h-4 w-4" /> X / Twitter
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonElement}
          </TooltipTrigger>
          <TooltipContent side="bottom" className={cn(isGuestMode && (action === 'like' || action === 'pass') && "bg-red-500 text-white border-red-600")}>
              <p>{isGuestMode && (action === 'like' || action === 'pass') ? "Sign in to interact" : label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <div
        ref={cardRootRef}
        className="flex flex-col h-full overflow-hidden" 
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
        <div className={cn(
            "shrink-0 h-48 sm:h-52 flex justify-center items-center p-4 relative", 
             isThemedCard ? getThemeClass(candidate.cardTheme) : 'bg-slate-100 dark:bg-slate-800'
            )}>
            <div className="relative w-28 h-28 sm:w-32 sm:h-32"> 
                {candidate.avatarUrl && candidate.avatarUrl !== 'https://placehold.co/500x700.png' ? (
                <NextImage
                    src={cardAvatarSrc || 'https://placehold.co/500x700.png'}
                    alt={candidate.name}
                    fill
                    className={cn(
                        "rounded-full object-cover shadow-lg border-2",
                        isThemedCard && candidate.cardTheme !== 'default' && candidate.cardTheme !== 'lavender' ? "border-accent" : (isLavenderTheme ? "border-primary/30" : "border-accent") 
                    )}
                    data-ai-hint={candidate.dataAiHint || "person professional"}
                    priority
                    unoptimized={needsUnoptimizedCard}
                />
                ) : (
                <UserCircleIcon className="w-full h-full text-gray-300 dark:text-gray-500 bg-white dark:bg-slate-700 rounded-full p-1 shadow-lg border-2 border-accent" />
                )}
            </div>
          {candidate.isUnderestimatedTalent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="default" className="absolute top-3 right-3 bg-yellow-400 hover:bg-yellow-500 text-black shadow-md cursor-default text-xs px-2 py-1">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Gem
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs bg-black text-white">
                  <p className="text-xs">{candidate.underestimatedReasoning || "This candidate shows unique potential!"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className={cn("w-full border-t-4", 
             isThemedCard && candidate.cardTheme !== 'default' && candidate.cardTheme !== 'lavender' ? "border-accent" 
             : (isLavenderTheme ? "border-primary/20" : "border-primary")
          )}></div>

        <div className="flex-1 p-4 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto min-h-0">
            <div className="text-center mt-2 mb-3">
                <CardTitle className={cn("text-2xl sm:text-3xl font-extrabold font-heading", 
                    isProfessionalDarkTheme ? 'text-primary-foreground' : 'text-foreground'
                )}>{candidate.name}</CardTitle>
                <CardDescription className={cn("text-lg sm:text-xl font-medium mt-1 font-heading", 
                    isProfessionalDarkTheme ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}>{candidate.role}</CardDescription>
            </div>
            <Separator className="my-3"/>

            <div className="space-y-2.5 text-sm">
                {candidate.location && (
                    <div className={cn("flex items-center", isProfessionalDarkTheme ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      <MapPin className={cn("h-5 w-5 mr-2.5 shrink-0", isProfessionalDarkTheme ? 'text-primary-foreground/70' : (defaultCard || isLavenderTheme ? 'text-accent' : 'text-primary-foreground/80'))} />
                      <span className="line-clamp-1">{candidate.location}</span>
                    </div>
                )}
                 {candidate.workExperienceLevel && candidate.workExperienceLevel !== WorkExperienceLevel.UNSPECIFIED && (
                    <div className={cn("flex items-center", isProfessionalDarkTheme ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      <Briefcase className={cn("h-5 w-5 mr-2.5 shrink-0", isProfessionalDarkTheme ? 'text-primary-foreground/70' : (defaultCard || isLavenderTheme ? 'text-accent' : 'text-primary-foreground/80'))} />
                      <span className="line-clamp-1">{candidate.workExperienceLevel}</span>
                    </div>
                )}
                {candidate.profileStrength !== undefined && (
                    <div className={cn("flex items-center", isProfessionalDarkTheme ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                        <BarChartHorizontal className={cn("h-5 w-5 mr-2.5 shrink-0", isProfessionalDarkTheme ? 'text-primary-foreground/70' : (defaultCard || isLavenderTheme ? 'text-accent' : 'text-primary-foreground/80'))} />
                        <span>Profile Strength: <span className={cn("font-semibold text-accent")}>{candidate.profileStrength}%</span></span>
                    </div>
                )}
            </div>
            <Separator className="my-4"/>
            
            {candidate.experienceSummary && (
                <div className="mt-3 pt-1.5 min-h-[3em]"> 
                    <p className={cn("text-sm line-clamp-3 sm:line-clamp-4 leading-relaxed", isProfessionalDarkTheme ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                        {candidate.experienceSummary}
                    </p>
                </div>
            )}
            <Separator className="my-4"/>
            
            {candidate.skills && candidate.skills.length > 0 && (
                <div className="pt-2 mt-3">
                    <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-2", isProfessionalDarkTheme ? 'text-primary-foreground/60' : 'text-muted-foreground')}>Top Skills</h4>
                    <div className="flex flex-wrap gap-2">
                        {candidate.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs px-2.5 py-1">{skill}</Badge>
                        ))}
                        {candidate.skills.length > 4 && <Badge variant="outline" className="text-xs px-2.5 py-1">+{candidate.skills.length - 4}</Badge>}
                    </div>
                </div>
            )}
        </div>
            
        <CardFooter className={cn(
            "p-1.5 pt-3 sm:pt-4 grid grid-cols-4 gap-1.5 border-t shrink-0 no-swipe-area",
            isThemedCard ? '' : 'bg-card' 
        )}>
          <ActionButton action="pass" Icon={ThumbsDown} label="Pass" />
          <ActionButton action="details" Icon={Eye} label="Profile" onClickOverride={handleDetailsButtonClick} />
          <ActionButton action="like" Icon={ThumbsUp} label="Like" isSpecificActionLiked={isLiked} />
          <ActionButton action="share_trigger" Icon={Share2} label="Share" />
        </CardFooter>
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
        activeAccordionItem={activeAccordionItemModal}
        setActiveAccordionItem={setActiveAccordionItemModal}
        onFetchAiAnalysis={fetchAiRecruiterAnalysis}
      />
    </>
  );
}

    