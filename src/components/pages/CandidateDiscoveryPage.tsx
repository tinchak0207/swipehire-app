
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Candidate, CandidateFilters, ProfileRecommenderOutput, RecruiterPerspectiveWeights, CandidateProfileForAI, JobCriteriaForAI, UserAIWeights, PersonalityTraitAssessment } from '@/lib/types';
import { mockCandidates } from '@/lib/mockData';
import ProfileCard from '@/components/cards/ProfileCard';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX, Filter, X as CloseIcon, RotateCcw, Trash2 as TrashIcon, Briefcase, Lightbulb, MapPin, CheckCircle, XCircle as LucideXCircle, Sparkles, Brain, ThumbsDown, Info, ThumbsUp, Lock, Video, ListChecks, Users2, ChevronsUpDown, Eye, TrendingUp, Star as StarIcon, BarChartHorizontal, Target, Activity, Bookmark, Send, CalendarDays } from 'lucide-react';
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
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { recommendProfile } from '@/ai/flows/profile-recommender';
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Progress } from '@/components/ui/progress';


const ITEMS_PER_BATCH = 3;
const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';
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
    isGuestMode,
    activeAccordionItem,
    setActiveAccordionItem,
    onFetchAiAnalysis,
    onPassCandidate,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    candidate: Candidate | null;
    aiRecruiterMatchScore: number | null;
    aiRecruiterReasoning: string | null;
    aiRecruiterWeightedScores: RecruiterWeightedScores | null;
    isLoadingAiAnalysis: boolean;
    isGuestMode?: boolean;
    activeAccordionItem: string | undefined;
    setActiveAccordionItem: (value: string | undefined) => void;
    onFetchAiAnalysis: () => void;
    onPassCandidate: (candidateId: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFullSummaryModal, setShowFullSummaryModal] = useState(false);
  const { toast } = useToast();

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

  const summaryForModalDisplay = candidate.experienceSummary && candidate.experienceSummary.length > MAX_SUMMARY_LENGTH_MODAL_INITIAL && !showFullSummaryModal
    ? `${candidate.experienceSummary.substring(0, MAX_SUMMARY_LENGTH_MODAL_INITIAL)}...`
    : candidate.experienceSummary;

  const renderPersonalityFitIcon = (fit: PersonalityTraitAssessment['fit']) => {
    switch (fit) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-500 mr-1.5 shrink-0" />;
      case 'neutral': return <Info className="h-4 w-4 text-amber-500 mr-1.5 shrink-0" />;
      case 'negative': return <LucideXCircle className="h-4 w-4 text-red-500 mr-1.5 shrink-0" />;
      default: return null;
    }
  };

  const modalAvatarSrc = candidate.avatarUrl && candidate.avatarUrl.startsWith('/uploads/')
  ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}`
  : candidate.avatarUrl;
  const needsUnoptimizedModal = modalAvatarSrc?.startsWith(CUSTOM_BACKEND_URL) || modalAvatarSrc?.startsWith('http://localhost');

  const handleSaveForLater = () => {
    if (isGuestMode) {
      toast({ title: "Feature Locked", description: "Please sign in to save candidates.", variant: "default" });
      return;
    }
    console.log(`Candidate ${candidate.id} saved for later.`);
    toast({ title: "Saved for Later", description: `${candidate.name} has been saved to your list.` });
  };

  const handleAdvanceToInterview = () => {
     if (isGuestMode) {
      toast({ title: "Feature Locked", description: "Please sign in to advance candidates.", variant: "default" });
      return;
    }
    console.log(`Candidate ${candidate.id} advanced to interview.`);
    toast({ title: "Advanced to Interview", description: `An interview request process has been initiated for ${candidate.name}.` });
  };

  const getSkillBadgeClass = (skill: string) => {
    const lowerSkill = skill.toLowerCase();
    if (lowerSkill === 'firebase') return 'bg-gradient-to-r from-orange-400 to-amber-500 text-white border-orange-600 hover:opacity-90 shadow-sm';
    if (lowerSkill === 'c++') return 'bg-gradient-to-r from-blue-500 to-sky-600 text-white border-blue-700 hover:opacity-90 shadow-sm';
    if (lowerSkill === 'flexible') return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-600 hover:opacity-90 shadow-sm';
    return 'bg-muted border-border text-muted-foreground hover:bg-muted/80 shadow-sm'; // Default
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[95vh] flex flex-col p-0 bg-background shadow-2xl rounded-xl">
        <DialogHeader className="p-4 sm:p-6 border-b flex-row items-center space-x-4 sticky top-0 bg-gradient-to-r from-slate-800 to-purple-900 text-primary-foreground z-10 rounded-t-xl">
          {modalAvatarSrc && modalAvatarSrc !== 'https://placehold.co/500x700.png' ? (
            <NextImage
              src={modalAvatarSrc || 'https://placehold.co/500x700.png'}
              alt={candidate.name}
              width={72}
              height={72}
              className="object-cover rounded-full border-2 border-primary-foreground/50 shadow-lg"
              data-ai-hint={candidate.dataAiHint || "person"}
              unoptimized={needsUnoptimizedModal}
            />
          ) : (
             <UserCircle className="w-18 h-18 text-primary-foreground/70 border-2 border-primary-foreground/50 rounded-full p-1" />
          )}
          <div className="flex-grow">
            <DialogTitle className="text-2xl sm:text-3xl font-bold font-heading">{candidate.name}</DialogTitle>
            <DialogDescription className="truncate text-md text-primary-foreground/80 font-heading">{candidate.role}</DialogDescription>
            {candidate.location && (
                <div className="flex items-center text-xs text-primary-foreground/70 mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                    <span>{candidate.location}</span>
                </div>
            )}
          </div>
          {candidate.isUnderestimatedTalent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="ml-auto border-yellow-400 text-yellow-300 bg-yellow-500/20 cursor-default shrink-0 py-1.5 px-3 shadow-md">
                    <Sparkles className="h-4 w-4 mr-1.5 text-yellow-400" />
                    Hidden Gem
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs bg-popover text-popover-foreground">
                  <p className="text-xs">{candidate.underestimatedReasoning || "This candidate shows unique potential!"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 bg-background">
          <div className="p-4 sm:p-6 space-y-6">
            {candidate.videoResumeUrl && (
              <section className="mb-4">
                <div className="flex items-center mb-3">
                    <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-rose-500 to-pink-600 shadow-md">
                        <Video className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground font-heading">Video Resume</h3>
                </div>
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
            
            <section>
                <div className="flex items-center mb-3">
                    <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                        <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground font-heading">Experience Summary</h3>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 shadow-sm">
                    <p className="text-sm text-purple-800 whitespace-pre-line leading-relaxed">
                        {summaryForModalDisplay}
                        {candidate.experienceSummary && candidate.experienceSummary.length > MAX_SUMMARY_LENGTH_MODAL_INITIAL && (
                            <Button
                                variant="link" size="sm"
                                onClick={(e) => {e.stopPropagation(); setShowFullSummaryModal(!showFullSummaryModal);}}
                                className="text-purple-600 hover:text-purple-800 p-0 h-auto ml-1 text-xs font-semibold"
                                disabled={isGuestMode}
                                data-no-drag="true"
                            >
                                {showFullSummaryModal ? "Read less" : "Read more"}
                            </Button>
                        )}
                    </p>
                </div>
            </section>

            <section>
                <div className="flex items-center mb-3">
                    <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground font-heading">Current Status & Work Style</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200 shadow-sm">
                        <Label className="text-xs font-semibold text-green-700 uppercase block mb-1">Availability</Label>
                        <p className="text-green-800 font-medium">
                            {candidate.availability ? formatEnumLabel(candidate.availability) : "Not specified"}
                        </p>
                    </div>
                    <div className="p-4 rounded-lg bg-sky-50 border border-sky-200 shadow-sm">
                        <Label className="text-xs font-semibold text-sky-700 uppercase block mb-1">Desired Work Style</Label>
                        <p className="text-sky-800">{candidate.desiredWorkStyle || "Not specified"}</p>
                    </div>
                </div>
            </section>

            {candidate.skills && candidate.skills.length > 0 && (
              <section>
                <div className="flex items-center mb-3">
                    <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md">
                         <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground font-heading">Technical Skills</h3>
                </div>
                <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 shadow-sm">
                    <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                        <Badge key={skill} className={cn("text-sm px-3 py-1", getSkillBadgeClass(skill))}>
                        {skill}
                        </Badge>
                    ))}
                    </div>
                </div>
              </section>
            )}
            
            <Accordion type="single" collapsible className="w-full" value={activeAccordionItem} onValueChange={setActiveAccordionItem}>
              <AccordionItem value="ai-assessment" className="border-b-0">
                <AccordionTrigger className="text-xl font-semibold text-foreground hover:no-underline data-[state=open]:text-primary font-heading py-3 group">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-amber-500 to-orange-600 shadow-md group-data-[state=open]:ring-2 group-data-[state=open]:ring-amber-300 transition-all">
                        <Brain className="h-5 w-5 text-white" />
                    </div>
                    AI Assessment (Recruiter Perspective)
                    <ChevronsUpDown className="ml-auto h-5 w-5 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 pl-1 sm:pl-2">
                    <div className="p-4 rounded-lg bg-orange-50 border border-orange-200 shadow-sm">
                        <p className="text-xs text-orange-700 italic mb-3 leading-relaxed">
                            Our AI assesses candidates by considering key factors such as skill alignment with typical role requirements, relevance of experience described, potential cultural synergy based on desired work style, and inferred growth capacity. The final score reflects weights you can customize in Settings.
                        </p>
                        {isGuestMode ? (
                            <div className="text-sm text-red-600 italic flex items-center p-3 border border-red-300 bg-red-100 rounded-md shadow-sm">
                                <Lock className="h-4 w-4 mr-2"/>Sign in to view AI Assessment and detailed insights.
                            </div>
                        ) : isLoadingAiAnalysis ? (
                            <div className="flex items-center text-orange-700 text-sm">
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                <span>Analyzing fit...</span>
                            </div>
                        ) : aiRecruiterMatchScore !== null ? (
                            <div className="space-y-3">
                                <div className="text-center">
                                    <span className="text-sm font-medium text-orange-800">Overall Match Score</span>
                                    <p className={cn(
                                        "font-bold text-4xl my-1",
                                        aiRecruiterMatchScore >= 75 ? 'text-green-600' :
                                        aiRecruiterMatchScore >= 50 ? 'text-amber-600' : 'text-red-600'
                                    )}>
                                        {aiRecruiterMatchScore}%
                                    </p>
                                    <Progress value={aiRecruiterMatchScore} className="h-3 bg-orange-200 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500" />
                                </div>
                                {aiRecruiterReasoning && (
                                    <p className="text-xs text-orange-700 italic leading-relaxed border-l-2 border-orange-300 pl-3">
                                        {aiRecruiterReasoning}
                                    </p>
                                )}
                                {aiRecruiterWeightedScores && (
                                    <div className="pt-3 mt-3 border-t border-orange-200">
                                        <p className="font-medium text-orange-800 text-sm mb-1.5">Score Breakdown:</p>
                                        <ul className="list-none space-y-1 text-xs text-orange-700">
                                            <li>Skills Match: <span className="font-semibold text-orange-900">{aiRecruiterWeightedScores.skillsMatchScore}%</span></li>
                                            <li>Experience Relevance: <span className="font-semibold text-orange-900">{aiRecruiterWeightedScores.experienceRelevanceScore}%</span></li>
                                            <li>Culture Fit: <span className="font-semibold text-orange-900">{aiRecruiterWeightedScores.cultureFitScore}%</span></li>
                                            <li>Growth Potential: <span className="font-semibold text-orange-900">{aiRecruiterWeightedScores.growthPotentialScore}%</span></li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-orange-700 italic">AI assessment currently unavailable for this candidate.</p>
                        )}
                    </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="coworker-fit" className="border-b-0">
                <AccordionTrigger className="text-xl font-semibold text-foreground hover:no-underline data-[state=open]:text-primary font-heading py-3 group">
                  <div className="flex items-center">
                     <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-sky-500 to-blue-600 shadow-md group-data-[state=open]:ring-2 group-data-[state=open]:ring-sky-300 transition-all">
                        <Users2 className="h-5 w-5 text-white" />
                    </div>
                    Coworker Fit Profile
                    <ChevronsUpDown className="ml-auto h-5 w-5 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 pl-1 sm:pl-2">
                    <div className="p-4 rounded-lg bg-sky-50 border border-sky-200 shadow-sm">
                        {isGuestMode ? (
                            <div className="text-sm text-red-600 italic flex items-center p-3 border border-red-300 bg-red-100 rounded-md shadow-sm">
                                <Lock className="h-4 w-4 mr-2"/>Sign in to view detailed Coworker Fit Profile.
                            </div>
                        ) : (
                            <div className="space-y-3">
                            {candidate.personalityAssessment && candidate.personalityAssessment.length > 0 ? (
                                <div className="space-y-1.5">
                                <p className="font-medium text-sky-800 text-sm">Personality Insights:</p>
                                {candidate.personalityAssessment.map((item, index) => (
                                    <div key={index} className="flex items-start text-sm">
                                    {renderPersonalityFitIcon(item.fit)}
                                    <div className="min-w-0">
                                        <span className="font-semibold text-sky-900">{item.trait}:</span>
                                        <span className="text-sky-700 ml-1.5">{item.reason || (item.fit === 'positive' ? 'Good fit.' : item.fit === 'neutral' ? 'Consider.' : 'Potential challenge.')}</span>
                                    </div>
                                    </div>
                                ))}
                                </div>
                            ) : <p className="text-sm text-sky-700 italic">No personality insights available.</p>}
                            {candidate.optimalWorkStyles && candidate.optimalWorkStyles.length > 0 ? (
                                <div>
                                <p className="font-medium text-sky-800 text-sm">Optimal Work Style:</p>
                                <ul className="list-disc list-inside pl-4 text-sky-700 space-y-1 text-sm">
                                    {candidate.optimalWorkStyles.map((style, index) => (
                                    <li key={index}>{style}</li>
                                    ))}
                                </ul>
                                </div>
                            ) : <p className="text-sm text-sky-700 italic">No optimal work styles defined.</p>}
                            </div>
                        )}
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </div>
        </ScrollArea>
        <DialogFooter className="p-4 sm:p-6 border-t sticky bottom-0 bg-background z-10 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 rounded-b-xl">
            <Button 
              onClick={() => { if (!isGuestMode) onPassCandidate(candidate.id); else toast({title: "Guest Mode", description: "Interactions disabled."}) }} 
              variant="destructive" 
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-md hover:shadow-lg transition-all"
              disabled={isGuestMode}
            >
                <ThumbsDown className="mr-2 h-4 w-4" /> Pass
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto shadow-sm hover:shadow-md transition-all"
              onClick={handleSaveForLater}
              disabled={isGuestMode}
            >
                <Bookmark className="mr-2 h-4 w-4" /> Save for Later
            </Button>
            <Button 
              className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
              onClick={handleAdvanceToInterview}
              disabled={isGuestMode}
            >
                <Send className="mr-2 h-4 w-4" /> Advance to Interview
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


const initialFilters: CandidateFilters = {
  experienceLevels: new Set(),
  educationLevels: new Set(),
  locationPreferences: new Set(),
  jobTypes: new Set(),
};

interface CandidateDiscoveryPageProps {
  searchTerm?: string;
  isGuestMode?: boolean;
}

// Helper to format enum values for display
const formatEnumLabel = (value: string) => {
  if (!value) return "";
  return value
    .replace(/_/g, ' ') 
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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
    if (!mongoDbUserId && !isGuestMode) {
        console.log("[CandidateDiscovery] Skipping fetch: no mongoDbUserId and not in guest mode.");
        setAllCandidates([...mockCandidates]); 
        setIsInitialLoading(false);
        return;
    }
    console.log("[CandidateDiscovery] Fetching candidates from backend...");
    setIsLoading(true); 
    setIsInitialLoading(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/profiles/jobseekers`);
      if (!response.ok) throw new Error(`Failed to fetch candidate profiles: ${response.status}`);
      const data: Candidate[] = await response.json();
      setAllCandidates(data.length > 0 ? data.map(c => ({...c, id: (c as any)._id || c.id })) : [...mockCandidates]);
      console.log(`[CandidateDiscovery] Fetched candidates from backend: ${data.length}`);
    } catch (error) {
      console.error("Error fetching candidates from backend:", error);
      toast({ title: "Error Loading Candidates", description: "Could not load candidate profiles. Using mock data.", variant: "destructive" });
      setAllCandidates([...mockCandidates]);
    } finally {
      setIsInitialLoading(false);
      setIsLoading(false);
    }
  }, [toast, mongoDbUserId, isGuestMode]);

 useEffect(() => {
    if (allCandidates.length === 0 && (mongoDbUserId || isGuestMode)) {
      fetchBackendCandidates();
    } else if (allCandidates.length === 0 && !mongoDbUserId && !isGuestMode && isInitialLoading) {
        setAllCandidates([...mockCandidates]);
        setIsInitialLoading(false);
    }
  }, [fetchBackendCandidates, mongoDbUserId, isGuestMode, allCandidates.length, isInitialLoading]);


  useEffect(() => {
    if (mongoDbUserId) {
        const storedCompanyId = localStorage.getItem(`user_${mongoDbUserId}_representedCompanyId`);
        setRecruiterRepresentedCompanyId(storedCompanyId || 'comp-placeholder-recruiter');
        if(!passedCandidateProfileIdsFromContext || passedCandidateProfileIdsFromContext.size === 0) {
            fetchAndSetUserPreferences(mongoDbUserId); 
        }
    }
  }, [mongoDbUserId, fetchAndSetUserPreferences, passedCandidateProfileIdsFromContext]);

  const trashBinCandidates = useMemo(() => {
    if (isInitialLoading || allCandidates.length === 0 || !passedCandidateProfileIdsFromContext) return [];
    return allCandidates.filter(c => passedCandidateProfileIdsFromContext.has(c.id));
  }, [allCandidates, passedCandidateProfileIdsFromContext, isInitialLoading]);

  const filteredCandidatesMemo = useMemo(() => {
    if (isInitialLoading) return [];
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
    if (isLoading || !hasMore || isInitialLoading || currentIndex >= filteredCandidatesMemo.length) {
       if (currentIndex >= filteredCandidatesMemo.length) setHasMore(false);
      return;
    }
    
    setIsLoading(true);
    const nextBatch = filteredCandidatesMemo.slice(currentIndex, currentIndex + ITEMS_PER_BATCH);
    
    setDisplayedCandidates(prev => [...prev, ...nextBatch]);
    setCurrentIndex(prev => prev + nextBatch.length);
    setHasMore(currentIndex + nextBatch.length < filteredCandidatesMemo.length);
    setIsLoading(false);
  }, [
    isLoading, 
    hasMore,   
    isInitialLoading, 
    currentIndex, 
    filteredCandidatesMemo,
  ]);

  useEffect(() => {
    if (!isInitialLoading) {
        const initialBatch = filteredCandidatesMemo.slice(0, ITEMS_PER_BATCH);
        setDisplayedCandidates(initialBatch);
        setCurrentIndex(initialBatch.length);
        setHasMore(initialBatch.length < filteredCandidatesMemo.length);
    }
  }, [filteredCandidatesMemo, isInitialLoading]);


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
      setAiRecruiterMatchScoreModal(null); 
      setAiRecruiterReasoningModal(null);
      setAiRecruiterWeightedScoresModal(null);
      setIsLoadingAiAnalysisModal(false);
      setActiveAccordionItemModal(undefined);
      setIsDetailsModalOpen(true);
      return;
    }

    if (isGuestMode || !mongoDbUserId) {
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
            onPassCandidate={(candidateId) => handleAction(candidateId, 'pass')}
        />
      )}

      <div className="w-full snap-y snap-mandatory overflow-y-auto scroll-smooth no-scrollbar flex-grow" style={{ height: `calc(100vh - ${fixedElementsHeight})` }} tabIndex={0}>
        {displayedCandidates.map((candidate) => (
          <div key={candidate.id} className="h-full snap-start snap-always flex flex-col items-center justify-center p-2 sm:p-4 bg-transparent">
             <ProfileCard
                candidate={candidate}
                onAction={handleAction}
                isLiked={likedCandidateProfileIds.has(candidate.id)}
                isGuestMode={isGuestMode}
            />
          </div>
        ))}
        {isLoading && !isInitialLoading && <div className="h-full snap-start snap-always flex items-center justify-center p-4"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
        
        {!isLoading && !isInitialLoading && filteredCandidatesMemo.length > 0 && displayedCandidates.length < filteredCandidatesMemo.length && <div ref={loadMoreTriggerRef} className="h-1 opacity-0">Load More Trigger</div>}

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


    