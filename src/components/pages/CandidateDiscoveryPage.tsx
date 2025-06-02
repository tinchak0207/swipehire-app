
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Candidate, CandidateFilters, ProfileRecommenderOutput, RecruiterPerspectiveWeights, CandidateProfileForAI, JobCriteriaForAI, UserAIWeights, PersonalityTraitAssessment } from '@/lib/types';
import { mockCandidates } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CandidateCardContent } from '@/components/swipe/CandidateCardContent';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX, Filter, X as CloseIcon, RotateCcw, Trash2 as TrashIcon, Briefcase, Lightbulb, MapPin, CheckCircle, XCircle as LucideXCircle, Sparkles, Share2, Brain, ThumbsDown, Info, ThumbsUp, Lock, Video, ListChecks, Users2, ChevronsUpDown, Eye, TrendingUp, Star as StarIcon, Link as LinkIcon, Mail, Twitter, Linkedin, UserCircle as UserCircleIcon, BarChartHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CandidateFilterPanel } from "@/components/filters/CandidateFilterPanel";
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { recordLike } from '@/services/matchService';
import NextImage from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { passCandidate, retrieveCandidate } from '@/services/interactionService';
// Removed incorrect import: import { CandidateDetailsModal } from '@/components/swipe/CandidateCardContent';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { recommendProfile } from '@/ai/flows/profile-recommender';
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Progress } from '@/components/ui/progress';


const ITEMS_PER_BATCH = 3;
const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';
const MAX_SUMMARY_LENGTH_MODAL_INITIAL = 200; // From CandidateCardContent, might need to be here too

interface CandidateDiscoveryPageProps {
  searchTerm?: string;
  isGuestMode?: boolean;
}

const initialFilters: CandidateFilters = {
  experienceLevels: new Set(),
  educationLevels: new Set(),
  locationPreferences: new Set(),
  jobTypes: new Set(),
};

type RecruiterWeightedScores = ProfileRecommenderOutput['weightedScores'];


// Define CandidateDetailsModal directly within this file or ensure it's correctly imported if it's now a separate component.
// For now, assuming it was moved here during the rollback.
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
    candidate: Candidate | null; // Can be null if no candidate selected
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, candidate, aiRecruiterMatchScore, isLoadingAiAnalysis, isGuestMode]);


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

  const summaryForModalDisplay = candidate.experienceSummary && candidate.experienceSummary.length > MAX_SUMMARY_LENGTH_MODAL_INITIAL && !showFullSummaryModal
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
              className="object-cover rounded-full border-2 border-accent"
              data-ai-hint={candidate.dataAiHint || "person"}
              unoptimized={needsUnoptimizedModal}
            />
          ) : (
             <UserCircleIcon className="w-16 h-16 text-muted-foreground border-2 border-accent rounded-full p-1" />
          )}
          <div className="flex-grow">
            <DialogTitle className="text-xl sm:text-2xl text-primary font-heading">{candidate.name}</DialogTitle>
            <DialogDescription className="truncate text-sm text-muted-foreground font-heading">{candidate.role}</DialogDescription>
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

        <ScrollArea className="flex-1 min-h-0 bg-background">
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
                {candidate.experienceSummary && candidate.experienceSummary.length > MAX_SUMMARY_LENGTH_MODAL_INITIAL && (
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
        </ScrollArea>
        <DialogFooter className="p-4 border-t sticky bottom-0 bg-background z-10">
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export function CandidateDiscoveryPage({ searchTerm = "", isGuestMode }: CandidateDiscoveryPageProps) {
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [displayedCandidates, setDisplayedCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isTrashBinOpen, setIsTrashBinOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState<CandidateFilters>(initialFilters);
  const [likedCandidateProfileIds, setLikedCandidateProfileIds] = useState<Set<string>>(new Set());

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCandidateForDetails, setSelectedCandidateForDetails] = useState<Candidate | null>(null);
  const [aiRecruiterMatchScoreModal, setAiRecruiterMatchScoreModal] = useState<number | null>(null);
  const [aiRecruiterReasoningModal, setAiRecruiterReasoningModal] = useState<string | null>(null);
  const [aiRecruiterWeightedScoresModal, setAiRecruiterWeightedScoresModal] = useState<RecruiterWeightedScores | null>(null);
  const [isLoadingAiAnalysisModal, setIsLoadingAiAnalysisModal] = useState(false);
  const [activeAccordionItemModal, setActiveAccordionItemModal] = useState<string | undefined>(undefined);


  const { toast } = useToast();
  const { mongoDbUserId, preferences, passedCandidateIds: passedCandidateProfileIdsFromContext, updatePassedCandidateIds, fetchAndSetUserPreferences } = useUserPreferences();
  const [recruiterRepresentedCompanyId, setRecruiterRepresentedCompanyId] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const fetchBackendCandidates = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/profiles/jobseekers`);
      if (!response.ok) {
        throw new Error(`Failed to fetch candidate profiles: ${response.status}`);
      }
      const data: Candidate[] = await response.json();
      if (data.length === 0) {
        setAllCandidates([...mockCandidates]);
      } else {
        setAllCandidates(data.map(c => ({...c, id: (c as any)._id || c.id })));
      }
    } catch (error) {
      console.error("Error fetching candidates from backend:", error);
      toast({ title: "Error Loading Candidates", description: "Could not load candidate profiles. Using mock data.", variant: "destructive" });
      setAllCandidates([...mockCandidates]);
    } finally {
      setIsInitialLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (((mongoDbUserId && !isGuestMode) || isGuestMode) && allCandidates.length === 0 && !isInitialLoading) {
      fetchBackendCandidates();
    } else if (allCandidates.length === 0 && isInitialLoading) {
      // This handles the very first load
      fetchBackendCandidates();
    }
  }, [fetchBackendCandidates, mongoDbUserId, isGuestMode, allCandidates.length, isInitialLoading]);


  useEffect(() => {
    if (mongoDbUserId) {
        const storedCompanyId = localStorage.getItem(`user_${mongoDbUserId}_representedCompanyId`);
        setRecruiterRepresentedCompanyId(storedCompanyId || 'comp-placeholder-recruiter');
        fetchAndSetUserPreferences(mongoDbUserId);
    }
  }, [mongoDbUserId, fetchAndSetUserPreferences]);

  const trashBinCandidates = useMemo(() => {
    if (isInitialLoading || allCandidates.length === 0 || !passedCandidateProfileIdsFromContext) return [];
    return allCandidates.filter(c => passedCandidateProfileIdsFromContext.has(c.id));
  }, [allCandidates, passedCandidateProfileIdsFromContext, isInitialLoading]);

  const filteredCandidatesMemo = useMemo(() => {
    if (isInitialLoading || !passedCandidateProfileIdsFromContext) return [];
    let candidates = [...allCandidates];

    if (activeFilters.experienceLevels.size > 0) {
      candidates = candidates.filter(c => c.workExperienceLevel && activeFilters.experienceLevels.has(c.workExperienceLevel));
    }
    if (activeFilters.educationLevels.size > 0) {
      candidates = candidates.filter(c => c.educationLevel && activeFilters.educationLevels.has(c.educationLevel));
    }
    if (activeFilters.locationPreferences.size > 0) {
      candidates = candidates.filter(c => c.locationPreference && activeFilters.locationPreferences.has(c.locationPreference));
    }
    if (activeFilters.jobTypes.size > 0) {
        candidates = candidates.filter(c => c.jobTypePreference && c.jobTypePreference.some(jt => activeFilters.jobTypes.has(jt)));
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    if (searchTerm.trim()) {
      candidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(lowerSearchTerm) ||
        (candidate.role && candidate.role.toLowerCase().includes(lowerSearchTerm)) ||
        (candidate.skills && candidate.skills.some(skill => skill.toLowerCase().includes(lowerSearchTerm)))
      );
    }
    const finalFiltered = candidates.filter(c => !passedCandidateProfileIdsFromContext.has(c.id));
    return finalFiltered;
  }, [allCandidates, activeFilters, searchTerm, passedCandidateProfileIdsFromContext, isInitialLoading]);

  const loadMoreCandidates = useCallback(() => {
    if (isInitialLoading || isLoading || !hasMore || currentIndex >= filteredCandidatesMemo.length) {
      if (currentIndex >= filteredCandidatesMemo.length && filteredCandidatesMemo.length > 0) {
        setHasMore(false);
      } else if (filteredCandidatesMemo.length === 0) {
        setHasMore(false);
      }
      return;
    }
    setIsLoading(true);
    const newLoadIndex = currentIndex + ITEMS_PER_BATCH;
    const newBatch = filteredCandidatesMemo.slice(currentIndex, newLoadIndex);
    setDisplayedCandidates(prev => {
      const updatedDisplay = [...prev, ...newBatch.filter(item => !prev.find(p => p.id === item.id))];
      return updatedDisplay;
    });
    setCurrentIndex(newLoadIndex);
    setHasMore(newLoadIndex < filteredCandidatesMemo.length);
    setIsLoading(false);

  }, [isInitialLoading, isLoading, hasMore, currentIndex, filteredCandidatesMemo]);

  useEffect(() => {
    if (isInitialLoading) return;
    setDisplayedCandidates([]);
    setCurrentIndex(0);
    const hasFilteredItems = filteredCandidatesMemo.length > 0;
    setHasMore(hasFilteredItems);
    if (hasFilteredItems) {
        loadMoreCandidates();
    }
  }, [filteredCandidatesMemo, isInitialLoading, loadMoreCandidates]);

  useEffect(() => {
    if (isInitialLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMoreCandidates();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 300px 0px' });
    if (loadMoreTriggerRef.current) {
        observer.current.observe(loadMoreTriggerRef.current);
    }
    return () => { if (observer.current) observer.current.disconnect(); };
  }, [hasMore, isLoading, loadMoreCandidates, isInitialLoading]);

  const fetchAiRecruiterAnalysisForModal = useCallback(async () => {
    if (!selectedCandidateForDetails || isGuestMode) {
        if (isGuestMode) {
            setAiRecruiterMatchScoreModal(null);
            setAiRecruiterReasoningModal("AI Assessment disabled for guest users.");
            setAiRecruiterWeightedScoresModal(null);
        }
        return;
    }
    setIsLoadingAiAnalysisModal(true);
    setAiRecruiterMatchScoreModal(null);
    setAiRecruiterReasoningModal(null);
    setAiRecruiterWeightedScoresModal(null);

    try {
      const candidateForAI: CandidateProfileForAI = {
        id: selectedCandidateForDetails.id, role: selectedCandidateForDetails.role || undefined, experienceSummary: selectedCandidateForDetails.experienceSummary || undefined,
        skills: selectedCandidateForDetails.skills || [], location: selectedCandidateForDetails.location || undefined, desiredWorkStyle: selectedCandidateForDetails.desiredWorkStyle || undefined,
        pastProjects: selectedCandidateForDetails.pastProjects || undefined, workExperienceLevel: selectedCandidateForDetails.workExperienceLevel || WorkExperienceLevel.UNSPECIFIED,
        educationLevel: selectedCandidateForDetails.educationLevel || EducationLevel.UNSPECIFIED, locationPreference: selectedCandidateForDetails.locationPreference || LocationPreference.UNSPECIFIED,
        languages: selectedCandidateForDetails.languages || [], salaryExpectationMin: selectedCandidateForDetails.salaryExpectationMin, salaryExpectationMax: selectedCandidateForDetails.salaryExpectationMax,
        availability: selectedCandidateForDetails.availability || Availability.UNSPECIFIED, jobTypePreference: selectedCandidateForDetails.jobTypePreference || [],
        personalityAssessment: selectedCandidateForDetails.personalityAssessment || [],
      };
      const genericJobCriteria: JobCriteriaForAI = {
        title: selectedCandidateForDetails.role || "General Role Assessment",
        description: `Assessing overall potential and fit for a role similar to ${selectedCandidateForDetails.role || 'the candidate\'s stated preference'}. Considering their skills and experience level. Company culture emphasizes innovation and collaboration.`,
        requiredSkills: selectedCandidateForDetails.skills?.slice(0,3) || ["communication", "problem-solving"],
        requiredExperienceLevel: selectedCandidateForDetails.workExperienceLevel || WorkExperienceLevel.MID_LEVEL,
        companyCultureKeywords: ["innovative", "collaborative", "driven", "growth-oriented"],
        companyIndustry: "Technology / General Business",
      };
      
      let userAIWeights: UserAIWeights | undefined = undefined;
      if (typeof window !== 'undefined') {
        const storedWeights = localStorage.getItem('userRecruiterAIWeights');
        if (storedWeights) {
          try {
            const parsedRecruiterWeights: RecruiterPerspectiveWeights = JSON.parse(storedWeights);
            if (Object.values(parsedRecruiterWeights).reduce((sum, val) => sum + Number(val || 0), 0) === 100) {
              userAIWeights = { recruiterPerspective: parsedRecruiterWeights };
            }
          } catch (e) { console.warn("Could not parse userRecruiterAIWeights from localStorage", e); }
        }
      }

      const result = await recommendProfile({ candidateProfile: candidateForAI, jobCriteria: genericJobCriteria, userAIWeights });
      setAiRecruiterMatchScoreModal(result.matchScore);
      setAiRecruiterReasoningModal(result.reasoning);
      setAiRecruiterWeightedScoresModal(result.weightedScores);
      setActiveAccordionItemModal("ai-assessment");

    } catch (error: any) {
      console.error("Error fetching AI recruiter analysis for candidate " + selectedCandidateForDetails.name + ":", error);
      toast({ title: "AI Analysis Error", description: `Could not get AI assessment for ${selectedCandidateForDetails.name}. ${error.message || ''}`, variant: "destructive", duration: 3000 });
      setAiRecruiterMatchScoreModal(0);
      setAiRecruiterReasoningModal("AI analysis failed to complete.");
      setAiRecruiterWeightedScoresModal(null);
    } finally {
      setIsLoadingAiAnalysisModal(false);
    }
  }, [selectedCandidateForDetails, isGuestMode, toast]);


  const handleAction = async (candidateId: string, action: 'like' | 'pass' | 'viewProfile') => {
    const candidate = allCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    if (action === 'viewProfile') {
      setSelectedCandidateForDetails(candidate);
      setAiRecruiterMatchScoreModal(null); // Reset AI data for new modal
      setAiRecruiterReasoningModal(null);
      setAiRecruiterWeightedScoresModal(null);
      setIsLoadingAiAnalysisModal(false);
      setActiveAccordionItemModal(undefined);
      setIsDetailsModalOpen(true);
      // AI analysis will be fetched when modal opens if needed
      return;
    }

    if (!mongoDbUserId) {
      toast({ title: "Login Required", description: "Please login to interact.", variant: "destructive" });
      return;
    }

    if (action === 'like') {
      if (!recruiterRepresentedCompanyId) {
        toast({ title: "Profile Incomplete", description: "Your recruiter profile needs to be associated with a company to make matches.", variant: "destructive" });
        return;
      }
      setLikedCandidateProfileIds(prev => new Set(prev).add(candidateId));
      try {
        const response = await recordLike({
          likingUserId: mongoDbUserId, likedProfileId: candidateId, likedProfileType: 'candidate',
          likingUserRole: 'recruiter', likingUserRepresentsCompanyId: recruiterRepresentedCompanyId,
        });
        if (response.success) {
          toast({ title: `Liked ${candidate.name}` });
          if (response.matchMade) {
            toast({ title: "🎉 It's a Mutual Match!", description: `You and ${candidate.name} are both interested! Check 'My Matches'.`, duration: 7000 });
          }
        } else {
          toast({ title: "Like Failed", description: response.message, variant: "destructive" });
          setLikedCandidateProfileIds(prev => { const newSet = new Set(prev); newSet.delete(candidateId); return newSet; });
        }
      } catch (error: any) {
        toast({ title: "Error Liking", description: error.message || "Could not record like.", variant: "destructive" });
        setLikedCandidateProfileIds(prev => { const newSet = new Set(prev); newSet.delete(candidateId); return newSet; });
      }
    } else if (action === 'pass') {
      try {
        const response = await passCandidate(mongoDbUserId, candidateId);
        updatePassedCandidateIds(response.passedCandidateProfileIds || []);
        setDisplayedCandidates(prev => prev.filter(c => c.id !== candidateId));
        toast({ title: `Moved ${candidate.name} to Trash Bin`, variant: "default" });
      } catch (error: any) {
        toast({ title: "Error Passing Candidate", description: error.message || "Could not pass candidate.", variant: "destructive" });
      }
    }
  };

  const handleRetrieveCandidate = async (candidateId: string) => {
    if (!mongoDbUserId) {
      toast({ title: "Login Required", variant: "destructive"});
      return;
    }
    try {
      const response = await retrieveCandidate(mongoDbUserId, candidateId);
      updatePassedCandidateIds(response.passedCandidateProfileIds || []);
      toast({ title: "Candidate Retrieved", description: `${allCandidates.find(c=>c.id === candidateId)?.name || 'Candidate'} is back in the discovery feed.` });
      setIsTrashBinOpen(false);
    } catch (error: any) {
      toast({ title: "Error Retrieving Candidate", description: error.message || "Could not retrieve candidate.", variant: "destructive" });
    }
  };

  const handleFilterChange = <K extends keyof CandidateFilters>(
    filterType: K,
    value: CandidateFilters[K] extends Set<infer T> ? T : never,
    isChecked: boolean
  ) => {
    setActiveFilters(prevFilters => {
      const newSet = new Set(prevFilters[filterType] as Set<any>);
      if (isChecked) newSet.add(value);
      else newSet.delete(value);
      return { ...prevFilters, [filterType]: newSet };
    });
  };

  const handleClearFilters = () => {
      setActiveFilters(initialFilters);
      setIsFilterSheetOpen(false);
  };
  const handleApplyFilters = () => setIsFilterSheetOpen(false);
  const numActiveFilters = Object.values(activeFilters).reduce((acc, set) => acc + set.size, 0);
  const fixedElementsHeight = '120px';

  if (isInitialLoading && allCandidates.length === 0) {
    return <div className="flex flex-grow items-center justify-center bg-background" style={{ height: `calc(100vh - ${fixedElementsHeight})` }}><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col h-full relative">
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="default" size="icon" className="fixed bottom-20 right-4 z-20 rounded-full w-14 h-14 shadow-lg sm:bottom-6 sm:right-6" aria-label="Open filters">
            <Filter className="h-6 w-6" />
            {numActiveFilters > 0 && <Badge variant="secondary" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">{numActiveFilters}</Badge>}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-sm p-0">
          <CandidateFilterPanel activeFilters={activeFilters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} onApplyFilters={handleApplyFilters} />
        </SheetContent>
      </Sheet>

      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-36 right-4 z-20 rounded-full w-14 h-14 shadow-lg sm:bottom-24 sm:right-6 border-muted-foreground/50"
        onClick={() => setIsTrashBinOpen(true)}
        aria-label="Open Trash Bin"
      >
        <TrashIcon className="h-6 w-6 text-muted-foreground" />
        {trashBinCandidates.length > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">{trashBinCandidates.length}</Badge>}
      </Button>

      <Dialog open={isTrashBinOpen} onOpenChange={setIsTrashBinOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 sm:p-6 border-b">
            <DialogTitle className="text-xl text-primary flex items-center">
              <TrashIcon className="mr-2 h-5 w-5" /> Trash Bin - Passed Candidates
            </DialogTitle>
            <DialogDescription>
              Candidates you've passed on. You can retrieve them here.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 sm:p-6 space-y-3">
              {trashBinCandidates.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Your trash bin is empty.</p>
              ) : (
                trashBinCandidates.map(candidate => (
                  <div key={candidate.id} className="flex items-center p-3 space-x-3 shadow-sm border rounded-md">
                    {candidate.avatarUrl && (
                        <NextImage
                            src={candidate.avatarUrl.startsWith('/uploads/') ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}` : candidate.avatarUrl}
                            alt={candidate.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                            data-ai-hint={candidate.dataAiHint || "person"}
                            unoptimized={candidate.avatarUrl?.startsWith(CUSTOM_BACKEND_URL) || candidate.avatarUrl?.startsWith('http://localhost')}
                        />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-sm text-foreground">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{candidate.role}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRetrieveCandidate(candidate.id)} className="text-primary hover:bg-primary/10 border-primary/50">
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Retrieve
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t">
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedCandidateForDetails && (
         <CandidateDetailsModal
            isOpen={isDetailsModalOpen}
            onOpenChange={setIsDetailsModalOpen}
            candidate={selectedCandidateForDetails}
            aiRecruiterMatchScore={aiRecruiterMatchScoreModal}
            aiRecruiterReasoning={aiRecruiterReasoningModal}
            aiRecruiterWeightedScores={aiRecruiterWeightedScoresModal}
            isLoadingAiAnalysis={isLoadingAiAnalysisModal}
            isGuestMode={isGuestMode}
            activeAccordionItem={activeAccordionItemModal}
            setActiveAccordionItem={setActiveAccordionItemModal}
            onFetchAiAnalysis={fetchAiRecruiterAnalysisForModal}
        />
      )}

      <div className="w-full snap-y snap-mandatory overflow-y-auto scroll-smooth no-scrollbar flex-grow" style={{ height: `calc(100vh - ${fixedElementsHeight})` }} tabIndex={0}>
        {displayedCandidates.map((candidate) => (
          <div key={candidate.id} className="h-full snap-start snap-always flex flex-col items-center justify-center p-2 sm:p-4 bg-transparent">
             <SwipeCard className={cn(
                "w-full max-w-md sm:max-w-lg md:max-w-xl flex flex-col shadow-xl rounded-2xl overflow-hidden max-h-[calc(100vh-150px)] sm:max-h-[calc(100vh-160px)] -mt-[60px]", // Adjust -mt if needed
                likedCandidateProfileIds.has(candidate.id) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl',
                // getThemeClass(candidate.cardTheme) // Applied directly to SwipeCard
             )}>
                <CandidateCardContent
                    candidate={candidate}
                    onSwipeAction={handleAction} // 'like' and 'pass' are handled here
                    isLiked={likedCandidateProfileIds.has(candidate.id)}
                    isGuestMode={isGuestMode}
                />
              </SwipeCard>
          </div>
        ))}
        {isLoading && !isInitialLoading && <div className="h-full snap-start snap-always flex items-center justify-center p-4"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
        {hasMore && !isLoading && !isInitialLoading && filteredCandidatesMemo.length > 0 && displayedCandidates.length < filteredCandidatesMemo.length && <div ref={loadMoreTriggerRef} className="h-1 opacity-0">Load More</div>}
        {!isLoading && !isInitialLoading && displayedCandidates.length === 0 && (
          <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-background">
            <SearchX className="h-20 w-20 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-foreground">{searchTerm || numActiveFilters > 0 ? "No Candidates Found" : "No More Candidates"}</h2>
            <p className="text-muted-foreground">{searchTerm || numActiveFilters > 0 ? "Try adjusting your search or filters." : "You've seen everyone for now, or check your Trash Bin."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
