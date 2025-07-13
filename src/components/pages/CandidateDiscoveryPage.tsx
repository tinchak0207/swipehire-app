'use client';

import {
  Bookmark,
  Brain,
  Briefcase,
  ChevronsUpDown,
  Clock,
  Filter,
  Globe,
  Loader2,
  Lock,
  MapPin,
  RotateCcw,
  SearchX,
  Send,
  Sparkles,
  Target,
  ThumbsDown,
  Trash2 as TrashIcon,
  Video,
} from 'lucide-react';
import NextImage from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { recommendProfile } from '@/ai/flows/profile-recommender';
import ProfileCard from '@/components/cards/ProfileCard';
import { CandidateFilterPanel } from '@/components/filters/CandidateFilterPanel';
import { ShareModal } from '@/components/share/ShareModal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import { mockCandidates } from '@/lib/mockData';
import type {
  Candidate,
  CandidateFilters,
  CandidateProfileForAI,
  JobCriteriaForAI,
  ProfileRecommenderOutput,
  RecruiterPerspectiveWeights,
  UserAIWeights,
} from '@/lib/types';
import { Availability, EducationLevel, LocationPreference, WorkExperienceLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { passCandidate, retrieveCandidate } from '@/services/interactionService';
import { recordLike } from '@/services/matchService';

const ITEMS_PER_BATCH = 3;
const envBackendUrl = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL;
const CUSTOM_BACKEND_URL =
  envBackendUrl && envBackendUrl.trim() !== '' ? envBackendUrl : 'http://localhost:5000';
const MAX_SUMMARY_LENGTH_MODAL_INITIAL = 200;

type RecruiterWeightedScores = ProfileRecommenderOutput['weightedScores'];

// Helper to format enum values for display
const formatEnumLabel = (value: string) => {
  if (!value) return '';
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const initialFilters: CandidateFilters = {
  experienceLevels: new Set(),
  educationLevels: new Set(),
  locationPreferences: new Set(),
  jobTypes: new Set(),
};

function CandidateDetailsModal({
  isOpen,
  onOpenChange,
  candidate,
  aiRecruiterMatchScore,
  aiRecruiterReasoning,
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
  isLoadingAiAnalysis: boolean;
  isGuestMode?: boolean;
  activeAccordionItem: string | undefined;
  setActiveAccordionItem: (value: string | undefined) => void;
  onFetchAiAnalysis: () => void;
  onPassCandidate: (candidateId: string) => void;
  onShareProfile: () => void;
  aiRecruiterWeightedScores: RecruiterWeightedScores | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFullSummaryModal, setShowFullSummaryModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && candidate && !aiRecruiterMatchScore && !isLoadingAiAnalysis && !isGuestMode) {
      onFetchAiAnalysis();
    }
  }, [
    isOpen,
    candidate,
    aiRecruiterMatchScore,
    isLoadingAiAnalysis,
    isGuestMode,
    onFetchAiAnalysis,
  ]);

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    if (!currentVideoRef || !isOpen || !candidate?.videoResumeUrl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          currentVideoRef
            .play()
            .catch((error) =>
              console.log(
                'Autoplay prevented for candidate video in modal:',
                error.name,
                error.message
              )
            );
        } else {
          currentVideoRef.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(currentVideoRef);
    return () => {
      if (currentVideoRef) observer.unobserve(currentVideoRef);
    };
  }, [isOpen, candidate?.videoResumeUrl]);

  if (!candidate) return null;

  const summaryForModalDisplay =
    candidate.experienceSummary &&
    candidate.experienceSummary.length > MAX_SUMMARY_LENGTH_MODAL_INITIAL &&
    !showFullSummaryModal
      ? `${candidate.experienceSummary.substring(0, MAX_SUMMARY_LENGTH_MODAL_INITIAL)}...`
      : candidate.experienceSummary;

  const modalAvatarSrc = candidate.avatarUrl
    ? candidate.avatarUrl.startsWith('/uploads/')
      ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}`
      : candidate.avatarUrl
    : 'https://placehold.co/80x80.png';

  const needsUnoptimizedModal =
    modalAvatarSrc?.startsWith(CUSTOM_BACKEND_URL) ||
    modalAvatarSrc?.startsWith('http://localhost');

  const handleSaveForLater = () => {
    if (isGuestMode) {
      toast({
        title: 'Feature Locked',
        description: 'Please sign in to save candidates.',
        variant: 'default',
      });
      return;
    }
    console.log(`Candidate ${candidate.id} saved for later.`);
    toast({
      title: 'Saved for Later',
      description: `${candidate.name} has been saved to your list.`,
    });
  };

  const handleAdvanceToInterview = () => {
    if (isGuestMode) {
      toast({
        title: 'Feature Locked',
        description: 'Please sign in to advance candidates.',
        variant: 'default',
      });
      return;
    }
    console.log(`Candidate ${candidate.id} advanced to interview.`);
    toast({
      title: 'Advanced to Interview',
      description: `An interview request process has been initiated for ${candidate.name}.`,
    });
  };

  const getSkillBadgeClass = (skill: string) => {
    const lowerSkill = skill.toLowerCase();
    if (lowerSkill === 'firebase')
      return 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200';
    if (lowerSkill === 'c++') return 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200';
    if (lowerSkill === 'flexible')
      return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
    return 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[95vh] flex-col rounded-xl bg-background p-0 shadow-2xl sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <DialogHeader className="relative flex flex-row items-start space-x-4 rounded-t-xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 sm:p-6">
          <div className="relative shrink-0">
            <NextImage
              src={modalAvatarSrc}
              alt={candidate.name}
              width={80}
              height={80}
              className="rounded-lg border-2 border-white object-cover shadow-md"
              data-ai-hint={candidate.dataAiHint || 'person'}
              unoptimized={needsUnoptimizedModal}
            />
            <div className="-bottom-1 -right-1 absolute h-4 w-4 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div className="flex-grow pt-1">
            <DialogTitle className="font-bold font-heading text-2xl text-slate-800 sm:text-3xl">
              {candidate.name}
            </DialogTitle>
            <DialogDescription className="mt-0.5 font-heading text-md text-primary">
              {candidate.role}
            </DialogDescription>
            <div className="mt-1.5 space-y-0.5 text-muted-foreground text-xs">
              {candidate.location && (
                <div className="flex items-center">
                  <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                  <span>{candidate.location}</span>
                </div>
              )}
              <div className="flex items-center">
                <Clock className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {candidate.availability
                    ? formatEnumLabel(candidate.availability)
                    : 'Availability not specified'}
                </span>
              </div>
              <div className="flex items-center">
                <Globe className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {candidate.locationPreference
                    ? `Open to ${formatEnumLabel(candidate.locationPreference).toLowerCase()}`
                    : 'Location preference not specified'}
                </span>
              </div>
            </div>
          </div>
          {/* The "X" close button is provided by DialogContent itself */}
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 bg-white">
          <div className="space-y-6 p-4 sm:p-6">
            <section>
              <div className="mb-2 flex items-center">
                <div className="mr-3 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 p-2 shadow-md">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-slate-700 text-xl">
                  Experience Summary
                </h3>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 shadow-sm">
                <p className="whitespace-pre-line text-orange-800 text-sm leading-relaxed">
                  {summaryForModalDisplay}
                  {candidate.experienceSummary &&
                    candidate.experienceSummary.length > MAX_SUMMARY_LENGTH_MODAL_INITIAL && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFullSummaryModal(!showFullSummaryModal);
                        }}
                        className="ml-1 h-auto p-0 font-semibold text-primary text-xs hover:underline"
                        data-no-drag="true"
                      >
                        {showFullSummaryModal ? 'Read less' : 'Read more'}
                      </Button>
                    )}
                </p>
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center">
                <div className="mr-3 rounded-lg bg-gradient-to-tr from-green-500 to-emerald-600 p-2 shadow-md">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-slate-700 text-xl">
                  Desired Work Style
                </h3>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
                <div>
                  <Label className="block font-semibold text-base text-green-800">
                    {candidate.desiredWorkStyle || 'Flexible'}
                  </Label>
                  <p className="text-green-700 text-sm">Preferred working arrangement</p>
                </div>
                <Badge className={cn('text-xs', getSkillBadgeClass('flexible'))}>Flexible</Badge>
              </div>
            </section>

            {candidate.skills && candidate.skills.length > 0 && (
              <section>
                <div className="mb-2 flex items-center">
                  <div className="mr-3 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 p-2 shadow-md">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-slate-700 text-xl">
                    Technical Skills
                  </h3>
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge
                      key={skill}
                      className={cn(
                        'px-3 py-1.5 font-medium text-sm shadow-sm',
                        getSkillBadgeClass(skill)
                      )}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={activeAccordionItem || ''}
              onValueChange={setActiveAccordionItem}
            >
              <AccordionItem value="ai-assessment" className="border-b-0">
                <AccordionTrigger className="group -mx-1 px-1 py-3 font-heading font-semibold text-slate-700 text-xl hover:no-underline data-[state=open]:text-primary">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 p-2 shadow-md transition-all group-data-[state=open]:ring-2 group-data-[state=open]:ring-pink-300">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    AI Assessment
                    <ChevronsUpDown className="ml-auto h-5 w-5 text-muted-foreground/70 transition-colors group-hover:text-primary" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-2 pl-1 sm:pl-2">
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 shadow-sm">
                    {isGuestMode ? (
                      <div className="flex items-center rounded-md border border-red-300 bg-red-100 p-3 text-red-600 text-sm italic shadow-sm">
                        <Lock className="mr-2 h-4 w-4" />
                        Sign in to view AI Assessment.
                      </div>
                    ) : isLoadingAiAnalysis ? (
                      <div className="flex items-center text-purple-700 text-sm">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>Analyzing fit...</span>
                      </div>
                    ) : aiRecruiterMatchScore !== null ? (
                      <div className="space-y-2 text-center">
                        <Label className="block font-medium text-purple-800 text-sm">
                          Overall Match Score
                        </Label>
                        <p className="my-1 font-bold text-4xl text-amber-600">
                          {aiRecruiterMatchScore}%
                        </p>
                        <Progress
                          value={aiRecruiterMatchScore}
                          className="h-2.5 bg-slate-200 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500"
                        />
                        {aiRecruiterReasoning && (
                          <p className="pt-1.5 text-left text-purple-700 text-xs italic leading-relaxed">
                            {aiRecruiterReasoning}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-purple-700 text-sm italic">
                        AI assessment currently unavailable for this candidate.
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {candidate.videoResumeUrl && (
              <section>
                <div className="mb-2 flex items-center">
                  <div className="mr-3 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-600 p-2 shadow-md">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-slate-700 text-xl">
                    Video Resume
                  </h3>
                </div>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-800 shadow-md">
                  <video
                    ref={videoRef}
                    src={candidate.videoResumeUrl}
                    controls={!isGuestMode}
                    muted={false}
                    autoPlay={false}
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                    poster={modalAvatarSrc || 'https://placehold.co/600x400.png'}
                    data-ai-hint="candidate video"
                  />
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="flex flex-col space-y-2 rounded-b-xl border-t bg-slate-50 p-4 sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0 sm:p-6">
          <Button
            onClick={() => {
              if (!isGuestMode) onPassCandidate(candidate.id);
              else toast({ title: 'Guest Mode', description: 'Interactions disabled.' });
            }}
            variant="default"
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 px-6 py-2.5 text-base text-white shadow-md transition-all hover:from-pink-600 hover:to-red-600 hover:shadow-lg sm:w-auto"
            disabled={isGuestMode}
          >
            <ThumbsDown className="mr-2 h-4 w-4" /> Pass
          </Button>
          <Button
            variant="outline"
            className="w-full border-slate-300 px-6 py-2.5 text-base text-slate-700 shadow-sm transition-all hover:bg-slate-100 hover:shadow-md sm:w-auto"
            onClick={handleSaveForLater}
            disabled={isGuestMode}
          >
            <Bookmark className="mr-2 h-4 w-4" /> Save for Later
          </Button>
          <Button
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2.5 text-base text-white shadow-md transition-all hover:from-green-600 hover:to-emerald-700 hover:shadow-lg sm:w-auto"
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

interface CandidateDiscoveryPageProps {
  searchTerm?: string;
  isGuestMode?: boolean;
}

export function CandidateDiscoveryPage({
  searchTerm = '',
  isGuestMode,
}: CandidateDiscoveryPageProps) {
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
  const [selectedCandidateForDetails, setSelectedCandidateForDetails] = useState<Candidate | null>(
    null
  );
  const [aiRecruiterMatchScoreModal, setAiRecruiterMatchScoreModal] = useState<number | null>(null);
  const [aiRecruiterReasoningModal, setAiRecruiterReasoningModal] = useState<string | null>(null);
  const [aiRecruiterWeightedScoresModal, setAiRecruiterWeightedScoresModal] =
    useState<RecruiterWeightedScores | null>(null);
  const [isLoadingAiAnalysisModal, setIsLoadingAiAnalysisModal] = useState(false);
  const [activeAccordionItemModal, setActiveAccordionItemModal] = useState<string | undefined>(
    undefined
  );
  const [isShareCandidateModalOpen, setIsShareCandidateModalOpen] = useState(false);

  const { toast } = useToast();
  const {
    mongoDbUserId,
    passedCandidateIds: passedCandidateProfileIdsFromContext,
    updatePassedCandidateIds,
  } = useUserPreferences();
  const [recruiterRepresentedCompanyId, setRecruiterRepresentedCompanyId] = useState<string | null>(
    null
  );

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const fetchBackendCandidates = useCallback(async () => {
    setIsInitialLoading(true);
    setIsLoading(true);
    console.log(
      `[CandidateDiscovery] Starting fetchBackendCandidates. isGuestMode: ${isGuestMode}, mongoDbUserId: ${mongoDbUserId}`
    );
    try {
      if (isGuestMode && !mongoDbUserId) {
        console.log('[CandidateDiscovery] Guest mode active. Using mock data for candidates.');
        setAllCandidates([...mockCandidates]);
        setIsInitialLoading(false);
        setIsLoading(false);
        return;
      }

      console.log('[CandidateDiscovery] Attempting to fetch candidates from backend...');
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/profiles/jobseekers`);
      console.log(
        `[CandidateDiscovery] Backend response status for jobseekers: ${response.status}`
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `[CandidateDiscovery] Failed to fetch candidate profiles: ${response.status} - ${errorBody.substring(0, 200)}`
        );
        throw new Error(`Failed to fetch candidate profiles: ${response.status}`);
      }
      const data: Candidate[] = await response.json();

      if (data && data.length > 0) {
        console.log(
          `[CandidateDiscovery] Successfully fetched ${data.length} candidates from backend.`
        );
        setAllCandidates(data.map((c) => ({ ...c, id: (c as any)._id || c.id })));
      } else {
        console.log(
          '[CandidateDiscovery] Backend returned 0 candidates. Logging success but empty. Falling back to mock data.'
        );
        toast({
          title: 'No Live Candidates Found',
          description:
            'Showing sample candidate profiles. Your database might be empty or filters too restrictive.',
          variant: 'default',
          duration: 7000,
        });
        setAllCandidates([...mockCandidates]);
      }
    } catch (error) {
      console.error('[CandidateDiscovery] Error fetching candidates from backend:', error);
      toast({
        title: 'Error Loading Candidates',
        description: 'Could not load candidate profiles from backend. Using mock data.',
        variant: 'destructive',
        duration: 7000,
      });
      setAllCandidates([...mockCandidates]);
    } finally {
      setIsInitialLoading(false);
      setIsLoading(false);
      console.log('[CandidateDiscovery] fetchBackendCandidates finished.');
    }
  }, [toast, mongoDbUserId, isGuestMode]);

  useEffect(() => {
    if (!isGuestMode || mongoDbUserId) {
      fetchBackendCandidates();
    } else if (isGuestMode) {
      fetchBackendCandidates();
    }
  }, [fetchBackendCandidates, isGuestMode, mongoDbUserId]);

  useEffect(() => {
    if (mongoDbUserId) {
      const storedCompanyId = localStorage.getItem(`user_${mongoDbUserId}_representedCompanyId`);
      setRecruiterRepresentedCompanyId(storedCompanyId || 'comp-placeholder-recruiter');
    }
  }, [mongoDbUserId]);

  const trashBinCandidates = useMemo(() => {
    if (isInitialLoading || allCandidates.length === 0 || !passedCandidateProfileIdsFromContext)
      return [];
    return allCandidates.filter((c) => passedCandidateProfileIdsFromContext.has(c.id));
  }, [allCandidates, passedCandidateProfileIdsFromContext, isInitialLoading]);

  const filteredCandidatesMemo = useMemo(() => {
    if (isInitialLoading) return [];
    let candidates = [...allCandidates];

    if (activeFilters.experienceLevels.size > 0) {
      candidates = candidates.filter(
        (c) => c.workExperienceLevel && activeFilters.experienceLevels.has(c.workExperienceLevel)
      );
    }
    if (activeFilters.educationLevels.size > 0) {
      candidates = candidates.filter(
        (c) => c.educationLevel && activeFilters.educationLevels.has(c.educationLevel)
      );
    }
    if (activeFilters.locationPreferences.size > 0) {
      candidates = candidates.filter(
        (c) => c.locationPreference && activeFilters.locationPreferences.has(c.locationPreference)
      );
    }
    if (activeFilters.jobTypes.size > 0) {
      candidates = candidates.filter((c) =>
        c.jobTypePreference?.some((jt) => activeFilters.jobTypes.has(jt))
      );
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    if (searchTerm.trim()) {
      candidates = candidates.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(lowerSearchTerm) ||
          candidate.role?.toLowerCase().includes(lowerSearchTerm) ||
          candidate.skills?.some((skill) => skill.toLowerCase().includes(lowerSearchTerm))
      );
    }
    const finalFiltered = candidates.filter((c) => !passedCandidateProfileIdsFromContext.has(c.id));
    return finalFiltered;
  }, [
    allCandidates,
    activeFilters,
    searchTerm,
    passedCandidateProfileIdsFromContext,
    isInitialLoading,
  ]);

  useEffect(() => {
    if (!isInitialLoading && filteredCandidatesMemo) {
      const initialBatch = filteredCandidatesMemo.slice(0, ITEMS_PER_BATCH);
      setDisplayedCandidates(initialBatch);
      setCurrentIndex(initialBatch.length);
      setHasMore(initialBatch.length < filteredCandidatesMemo.length);
    }
  }, [filteredCandidatesMemo, isInitialLoading]);

  const loadMoreCandidates = useCallback(() => {
    if (
      isLoading ||
      !hasMore ||
      isInitialLoading ||
      currentIndex >= filteredCandidatesMemo.length
    ) {
      if (currentIndex >= filteredCandidatesMemo.length) setHasMore(false);
      return;
    }

    setIsLoading(true);
    const nextBatch = filteredCandidatesMemo.slice(currentIndex, currentIndex + ITEMS_PER_BATCH);

    setDisplayedCandidates((prev) => [
      ...prev,
      ...nextBatch.filter((item) => !prev.find((p) => p.id === item.id)),
    ]);
    setCurrentIndex((prev) => prev + nextBatch.length);
    setHasMore(currentIndex + nextBatch.length < filteredCandidatesMemo.length);
    setIsLoading(false);
  }, [isLoading, hasMore, isInitialLoading, currentIndex, filteredCandidatesMemo]);

  useEffect(() => {
    if (isInitialLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !isLoading) {
          loadMoreCandidates();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px 300px 0px' }
    );
    if (loadMoreTriggerRef.current) {
      observer.current.observe(loadMoreTriggerRef.current);
    }
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, isLoading, loadMoreCandidates, isInitialLoading]);

  const fetchAiRecruiterAnalysisForModal = useCallback(async () => {
    if (!selectedCandidateForDetails || isGuestMode) {
      if (isGuestMode) {
        setAiRecruiterMatchScoreModal(null);
        setAiRecruiterReasoningModal('AI Assessment disabled for guest users.');
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
        id: selectedCandidateForDetails.id,
        role: selectedCandidateForDetails.role || '',
        experienceSummary: selectedCandidateForDetails.experienceSummary || '',
        skills: selectedCandidateForDetails.skills || [],
        location: selectedCandidateForDetails.location || '',
        desiredWorkStyle: selectedCandidateForDetails.desiredWorkStyle || '',
        pastProjects: selectedCandidateForDetails.pastProjects || '',
        workExperienceLevel:
          selectedCandidateForDetails.workExperienceLevel || WorkExperienceLevel.UNSPECIFIED,
        educationLevel: selectedCandidateForDetails.educationLevel || EducationLevel.UNSPECIFIED,
        locationPreference:
          selectedCandidateForDetails.locationPreference || LocationPreference.UNSPECIFIED,
        languages: selectedCandidateForDetails.languages || [],
        salaryExpectationMin:
          selectedCandidateForDetails.salaryExpectationMin ||
          selectedCandidateForDetails.salaryExpectationMax ||
          0,
        salaryExpectationMax: selectedCandidateForDetails.salaryExpectationMax || 0,
        availability: selectedCandidateForDetails.availability || Availability.UNSPECIFIED,
        jobTypePreference: selectedCandidateForDetails.jobTypePreference || [],
        personalityAssessment: selectedCandidateForDetails.personalityAssessment || [],
      };
      const genericJobCriteria: JobCriteriaForAI = {
        title: selectedCandidateForDetails.role || 'General Role Assessment',
        description: `Assessing overall potential and fit for a role similar to ${selectedCandidateForDetails.role || "the candidate's stated preference"}. Considering their skills and experience level. Company culture emphasizes innovation and collaboration.`,
        requiredSkills: selectedCandidateForDetails.skills?.slice(0, 3) || [
          'communication',
          'problem-solving',
        ],
        requiredExperienceLevel:
          selectedCandidateForDetails.workExperienceLevel || WorkExperienceLevel.MID_LEVEL,
        companyCultureKeywords: ['innovative', 'collaborative', 'driven', 'growth-oriented'],
        companyIndustry: 'Technology / General Business',
      };

      let userAIWeights: UserAIWeights | undefined;
      if (typeof window !== 'undefined') {
        const storedWeights = localStorage.getItem('userRecruiterAIWeights');
        if (storedWeights) {
          try {
            const parsedRecruiterWeights: RecruiterPerspectiveWeights = JSON.parse(storedWeights);
            if (
              Object.values(parsedRecruiterWeights).reduce(
                (sum, val) => sum + Number(val || 0),
                0
              ) === 100
            ) {
              userAIWeights = { recruiterPerspective: parsedRecruiterWeights };
            }
          } catch (e) {
            console.warn('Could not parse userRecruiterAIWeights from localStorage', e);
          }
        }
      }

      const result = await recommendProfile({
        candidateProfile: candidateForAI,
        jobCriteria: genericJobCriteria,
        userAIWeights,
      });
      setAiRecruiterMatchScoreModal(result.matchScore);
      setAiRecruiterReasoningModal(result.reasoning);
      setAiRecruiterWeightedScoresModal(result.weightedScores);
      setActiveAccordionItemModal('ai-assessment');
    } catch (error: any) {
      console.error(
        'Error fetching AI recruiter analysis for candidate ' +
          selectedCandidateForDetails.name +
          ':',
        error
      );
      toast({
        title: 'AI Analysis Error',
        description: `Could not get AI assessment for ${selectedCandidateForDetails.name}. ${error.message || ''}`,
        variant: 'destructive',
        duration: 3000,
      });
      setAiRecruiterMatchScoreModal(0);
      setAiRecruiterReasoningModal('AI analysis failed to complete.');
      setAiRecruiterWeightedScoresModal(null);
    } finally {
      setIsLoadingAiAnalysisModal(false);
    }
  }, [selectedCandidateForDetails, isGuestMode, toast]);

  const handleAction = async (candidateId: string, action: 'like' | 'pass' | 'viewProfile') => {
    const candidate = allCandidates.find((c) => c.id === candidateId);
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
      toast({
        title: 'Login Required',
        description: 'Please login to interact.',
        variant: 'destructive',
      });
      return;
    }

    if (action === 'like') {
      if (!recruiterRepresentedCompanyId) {
        toast({
          title: 'Profile Incomplete',
          description:
            'Your recruiter profile needs to be associated with a company to make matches.',
          variant: 'destructive',
        });
        return;
      }
      setLikedCandidateProfileIds((prev) => new Set(prev).add(candidateId));
      try {
        const response = await recordLike({
          likingUserId: mongoDbUserId,
          likedProfileId: candidateId,
          likedProfileType: 'candidate',
          likingUserRole: 'recruiter',
          likingUserRepresentsCompanyId: recruiterRepresentedCompanyId,
        });
        if (response.success) {
          toast({ title: `Liked ${candidate.name}` });
          if (response.matchMade) {
            toast({
              title: "🎉 It's a Mutual Match!",
              description: `You and ${candidate.name} are both interested! Check 'My Matches'.`,
              duration: 7000,
            });
          }
        } else {
          toast({ title: 'Like Failed', description: response.message, variant: 'destructive' });
          setLikedCandidateProfileIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(candidateId);
            return newSet;
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error Liking',
          description: error.message || 'Could not record like.',
          variant: 'destructive',
        });
        setLikedCandidateProfileIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(candidateId);
          return newSet;
        });
      }
    } else if (action === 'pass') {
      try {
        const response = await passCandidate(mongoDbUserId, candidateId);
        updatePassedCandidateIds(response.passedCandidateProfileIds || []);
        toast({ title: `Moved ${candidate.name} to Trash Bin`, variant: 'default' });
      } catch (error: any) {
        toast({
          title: 'Error Passing Candidate',
          description: error.message || 'Could not pass candidate.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRetrieveCandidate = async (candidateId: string) => {
    if (!mongoDbUserId) {
      toast({ title: 'Login Required', variant: 'destructive' });
      return;
    }
    try {
      const response = await retrieveCandidate(mongoDbUserId, candidateId);
      updatePassedCandidateIds(response.passedCandidateProfileIds || []);
      toast({
        title: 'Candidate Retrieved',
        description: `${allCandidates.find((c) => c.id === candidateId)?.name || 'Candidate'} is back in the discovery feed.`,
      });
      setIsTrashBinOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error Retrieving Candidate',
        description: error.message || 'Could not retrieve candidate.',
        variant: 'destructive',
      });
    }
  };

  const openShareModal = () => {
    if (selectedCandidateForDetails) {
      setIsShareCandidateModalOpen(true);
    } else {
      toast({
        title: 'No Candidate Selected',
        description: "Open a candidate's profile to share it.",
        variant: 'default',
      });
    }
  };

  const handleFilterChange = <K extends keyof CandidateFilters>(
    filterType: K,
    value: CandidateFilters[K] extends Set<infer T> ? T : never,
    isChecked: boolean
  ) => {
    setActiveFilters((prevFilters) => {
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
  const appOriginForShare =
    typeof window !== 'undefined' ? window.location.origin : 'https://swipehire-app.com';

  if (isInitialLoading) {
    return (
      <div
        className="flex flex-grow items-center justify-center bg-background"
        style={{ height: `calc(100vh - ${fixedElementsHeight})` }}
      >
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="fixed right-4 bottom-20 z-20 h-14 w-14 rounded-full shadow-lg sm:right-6 sm:bottom-6"
            aria-label="Open filters"
          >
            <Filter className="h-6 w-6" />
            {numActiveFilters > 0 && (
              <Badge variant="secondary" className="-top-1 -right-1 absolute px-1.5 py-0.5 text-xs">
                {numActiveFilters}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full p-0 sm:max-w-sm">
          <CandidateFilterPanel
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onApplyFilters={handleApplyFilters}
          />
        </SheetContent>
      </Sheet>

      <Button
        variant="outline"
        size="icon"
        className="fixed right-4 bottom-36 z-20 h-14 w-14 rounded-full border-muted-foreground/50 shadow-lg sm:right-6 sm:bottom-24"
        onClick={() => setIsTrashBinOpen(true)}
        aria-label="Open Trash Bin"
      >
        <TrashIcon className="h-6 w-6 text-muted-foreground" />
        {trashBinCandidates.length > 0 && (
          <Badge variant="destructive" className="-top-1 -right-1 absolute px-1.5 py-0.5 text-xs">
            {trashBinCandidates.length}
          </Badge>
        )}
      </Button>

      <Dialog open={isTrashBinOpen} onOpenChange={setIsTrashBinOpen}>
        <DialogContent className="flex max-h-[80vh] flex-col p-0 sm:max-w-lg">
          <DialogHeader className="border-b p-4 sm:p-6">
            <DialogTitle className="flex items-center text-primary text-xl">
              <TrashIcon className="mr-2 h-5 w-5" /> Trash Bin - Passed Candidates
            </DialogTitle>
            <DialogDescription>
              Candidates you've passed on. You can retrieve them here.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-3 p-4 sm:p-6">
              {trashBinCandidates.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">Your trash bin is empty.</p>
              ) : (
                trashBinCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center space-x-3 rounded-md border p-3 shadow-sm"
                  >
                    {candidate.avatarUrl && (
                      <NextImage
                        src={
                          candidate.avatarUrl.startsWith('/uploads/')
                            ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}`
                            : candidate.avatarUrl
                        }
                        alt={candidate.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                        data-ai-hint={candidate.dataAiHint || 'person'}
                        unoptimized={
                          candidate.avatarUrl?.startsWith(CUSTOM_BACKEND_URL) ||
                          candidate.avatarUrl?.startsWith('http://localhost')
                        }
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground text-sm">
                        {candidate.name}
                      </p>
                      <p className="truncate text-muted-foreground text-xs">{candidate.role}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetrieveCandidate(candidate.id)}
                      className="border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Retrieve
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="border-t p-4">
            <Button variant="outline" onClick={() => setIsTrashBinOpen(false)}>
              Close
            </Button>
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
          isGuestMode={!!isGuestMode}
          activeAccordionItem={activeAccordionItemModal}
          setActiveAccordionItem={setActiveAccordionItemModal}
          onFetchAiAnalysis={fetchAiRecruiterAnalysisForModal}
          onPassCandidate={(candidateId) => handleAction(candidateId, 'pass')}
          onShareProfile={openShareModal}
        />
      )}
      {selectedCandidateForDetails && (
        <ShareModal
          isOpen={isShareCandidateModalOpen}
          onOpenChange={setIsShareCandidateModalOpen}
          title={`Share ${selectedCandidateForDetails.name}'s Profile`}
          itemName={selectedCandidateForDetails.name}
          itemDescription={selectedCandidateForDetails.role}
          itemType="candidate profile"
          shareUrl={
            selectedCandidateForDetails.id
              ? `${appOriginForShare}/candidate/${selectedCandidateForDetails.id}`
              : ''
          }
          qrCodeLogoUrl="/assets/logo-favicon.png"
        />
      )}

      <div
        className="no-scrollbar w-full flex-grow snap-y snap-mandatory overflow-y-auto scroll-smooth pb-40"
        style={{ height: `calc(100vh - ${fixedElementsHeight})` }}
      >
        {displayedCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="flex min-h-full snap-start snap-always flex-col items-center justify-center bg-transparent p-2 sm:p-4"
          >
            <ProfileCard
              candidate={candidate}
              onAction={handleAction}
              isLiked={likedCandidateProfileIds.has(candidate.id)}
              isGuestMode={!!isGuestMode}
            />
          </div>
        ))}
        {isLoading && !isInitialLoading && (
          <div className="flex h-full snap-start snap-always items-center justify-center p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {!isLoading &&
          !isInitialLoading &&
          filteredCandidatesMemo.length > 0 &&
          displayedCandidates.length < filteredCandidatesMemo.length && (
            <div ref={loadMoreTriggerRef} className="h-1 opacity-0">
              Load More Trigger
            </div>
          )}

        {!isLoading && !isInitialLoading && displayedCandidates.length === 0 && (
          <div className="flex h-full snap-start snap-always flex-col items-center justify-center bg-background p-6 text-center">
            <SearchX className="mb-6 h-20 w-20 text-muted-foreground" />
            <h2 className="mb-3 font-semibold text-2xl text-foreground">
              {searchTerm || numActiveFilters > 0 ? 'No Candidates Found' : 'No More Candidates'}
            </h2>
            <p className="text-muted-foreground">
              {searchTerm || numActiveFilters > 0
                ? 'Try adjusting your search or filters.'
                : "You've seen everyone for now, or check your Trash Bin."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
