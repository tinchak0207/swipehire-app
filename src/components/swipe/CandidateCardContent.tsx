'use client';

import {
  BarChartHorizontal,
  Brain,
  Briefcase,
  CheckCircle,
  ChevronsUpDown,
  Eye,
  Info,
  Lightbulb,
  ListChecks,
  Loader2,
  Lock,
  XCircle as LucideXCircle,
  MapPin,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  UserCircle as UserCircleIcon,
  Users2,
  Video,
} from 'lucide-react';
import NextImage from 'next/image';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { recommendProfile } from '@/ai/flows/profile-recommender';
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
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle as ShadDialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import type {
  Candidate,
  CandidateProfileForAI,
  JobCriteriaForAI,
  PersonalityTraitAssessment,
  ProfileRecommenderOutput,
  RecruiterPerspectiveWeights,
  UserAIWeights,
} from '@/lib/types';
import { Availability, EducationLevel, LocationPreference, WorkExperienceLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CardDescription, CardFooter, CardTitle } from '../ui/card';

const CUSTOM_BACKEND_URL = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';

interface CandidateCardContentProps {
  candidate: Candidate;
  onSwipeAction: (candidateId: string, action: 'like' | 'pass') => void;
  isLiked: boolean;
  isGuestMode?: boolean;
  isPreviewMode?: boolean;
}

const SWIPE_THRESHOLD = 75;
const MAX_ROTATION = 10;
const MAX_SUMMARY_LENGTH_MODAL_INITIAL = 200;

type RecruiterWeightedScores = ProfileRecommenderOutput['weightedScores'];

const incrementAnalytic = (key: string) => {
  if (typeof window !== 'undefined') {
    const currentCount = Number.parseInt(localStorage.getItem(`analytics_${key}`) || '0', 10);
    localStorage.setItem(`analytics_${key}`, (currentCount + 1).toString());
  }
};

const getThemeClass = (themeKey?: string) => {
  if (!themeKey || themeKey === 'default') return '';
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
  onShareProfile,
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
  onShareProfile: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFullSummaryModal, setShowFullSummaryModal] = useState(false);

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

  const renderPersonalityFitIcon = (fit: PersonalityTraitAssessment['fit']) => {
    switch (fit) {
      case 'positive':
        return <CheckCircle className="mr-1.5 h-4 w-4 shrink-0 text-green-500" />;
      case 'neutral':
        return <Info className="mr-1.5 h-4 w-4 shrink-0 text-yellow-500" />;
      case 'negative':
        return <LucideXCircle className="mr-1.5 h-4 w-4 shrink-0 text-red-500" />;
      default:
        return null;
    }
  };

  const modalAvatarSrc = candidate.avatarUrl?.startsWith('/uploads/')
    ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}`
    : candidate.avatarUrl;
  const needsUnoptimizedModal =
    modalAvatarSrc?.startsWith(CUSTOM_BACKEND_URL) ||
    modalAvatarSrc?.startsWith('http://localhost');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col bg-background p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <DialogHeader className="sticky top-0 z-10 flex-row items-center space-x-3 border-b bg-background p-4 pb-3 sm:p-6">
          {modalAvatarSrc && modalAvatarSrc !== 'https://placehold.co/500x700.png' ? (
            <NextImage
              src={modalAvatarSrc || 'https://placehold.co/500x700.png'}
              alt={candidate.name}
              width={60}
              height={60}
              className="rounded-full border-2 border-accent object-cover"
              data-ai-hint={candidate.dataAiHint || 'person'}
              unoptimized={!!needsUnoptimizedModal}
            />
          ) : (
            <UserCircleIcon className="h-16 w-16 rounded-full border-2 border-accent p-1 text-muted-foreground" />
          )}
          <div className="flex-grow">
            <ShadDialogTitle className="font-heading text-primary text-xl sm:text-2xl">
              {candidate.name}
            </ShadDialogTitle>
            <CardDescription className="truncate font-heading text-muted-foreground text-sm">
              {candidate.role}
            </CardDescription>
            {candidate.location && (
              <div className="mt-0.5 flex items-center text-muted-foreground text-xs">
                <MapPin className="mr-1 h-3 w-3 shrink-0 text-accent" />
                <span>{candidate.location}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {candidate.isUnderestimatedTalent && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="shrink-0 cursor-default border-yellow-500 bg-yellow-500/10 px-2 py-1 text-yellow-600"
                    >
                      <Sparkles className="mr-1 h-4 w-4 text-yellow-500" />
                      Hidden Gem
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs">
                      {candidate.underestimatedReasoning ||
                        'This candidate shows unique potential!'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button variant="outline" size="sm" onClick={onShareProfile} disabled={isGuestMode}>
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
          <div className="space-y-4 p-4 pt-4 sm:p-6">
            {candidate.videoResumeUrl && (
              <section className="mb-4">
                <h3 className="mb-2 flex items-center font-heading font-semibold text-foreground text-lg">
                  <Video className="mr-2 h-5 w-5 text-primary" /> Video Resume
                </h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted shadow-md">
                  <video
                    ref={videoRef}
                    src={candidate.videoResumeUrl}
                    controls={!isGuestMode}
                    muted={false}
                    autoPlay={false}
                    loop
                    playsInline
                    className="h-full w-full bg-black object-cover"
                    poster={modalAvatarSrc || 'https://placehold.co/600x400.png'}
                    data-ai-hint="candidate video"
                  />
                </div>
              </section>
            )}
            <Separator className="my-4" />

            <section>
              <h3 className="mb-1.5 flex items-center font-heading font-semibold text-foreground text-lg">
                <Briefcase className="mr-2 h-5 w-5 text-primary" /> Experience Summary
              </h3>
              <p className="whitespace-pre-line text-muted-foreground text-sm leading-relaxed">
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
                      disabled={isGuestMode}
                      data-no-drag="true"
                    >
                      {showFullSummaryModal ? 'Read less' : 'Read more'}
                    </Button>
                  )}
              </p>
            </section>
            <Separator className="my-4" />

            {candidate.desiredWorkStyle && (
              <section>
                <h3 className="mb-1.5 flex items-center font-heading font-semibold text-foreground text-lg">
                  <Lightbulb className="mr-2 h-5 w-5 text-primary" /> Desired Work Style
                </h3>
                <p className="text-muted-foreground text-sm">{candidate.desiredWorkStyle}</p>
              </section>
            )}
            <Separator className="my-4" />

            {candidate.skills && candidate.skills.length > 0 && (
              <section>
                <h3 className="mb-2.5 flex items-center font-heading font-semibold text-foreground text-lg">
                  <ListChecks className="mr-2 h-5 w-5 text-primary" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-2.5 py-1 text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
            <Separator className="my-4" />

            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={activeAccordionItem || ''}
              onValueChange={(value) => setActiveAccordionItem(value)}
            >
              <AccordionItem value="ai-assessment">
                <AccordionTrigger className="font-heading font-semibold text-foreground text-lg hover:no-underline data-[state=open]:text-primary">
                  <div className="flex items-center">
                    <Brain className="mr-2 h-5 w-5" /> AI Assessment (Recruiter Perspective){' '}
                    <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/70" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <p className="mb-2.5 text-muted-foreground text-xs italic">
                    Our AI assesses candidates by considering key factors such as skill alignment
                    with typical role requirements, relevance of experience described, potential
                    cultural synergy based on desired work style, and inferred growth capacity. The
                    final score reflects weights you can customize in Settings.
                  </p>
                  {isGuestMode ? (
                    <div className="flex items-center rounded-md border border-red-300 bg-red-50 p-3 text-red-500 text-sm italic shadow-sm">
                      <Lock className="mr-2 h-4 w-4" />
                      Sign in to view AI Assessment and detailed insights.
                    </div>
                  ) : isLoadingAiAnalysis ? (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Analyzing fit...</span>
                    </div>
                  ) : aiRecruiterMatchScore !== null ? (
                    <div className="space-y-2.5 rounded-md bg-muted/30 p-3 shadow-sm">
                      <div className="text-foreground text-md">
                        <span className="font-semibold">Overall Match Score:</span>
                        <span
                          className={cn(
                            'ml-1.5 font-bold text-lg',
                            aiRecruiterMatchScore >= 75
                              ? 'text-green-600'
                              : aiRecruiterMatchScore >= 50
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          )}
                        >
                          {aiRecruiterMatchScore}%
                        </span>
                      </div>
                      {aiRecruiterReasoning && (
                        <p className="text-muted-foreground text-sm italic leading-relaxed">
                          {aiRecruiterReasoning}
                        </p>
                      )}
                      {aiRecruiterWeightedScores && (
                        <div className="mt-2.5 border-border/70 border-t pt-2.5">
                          <p className="mb-1.5 font-medium text-foreground text-sm">
                            Score Breakdown (Individual Assessments):
                          </p>
                          <ul className="list-none space-y-1 text-muted-foreground text-xs">
                            <li>
                              Skills Match:{' '}
                              <span className="font-semibold text-foreground">
                                {aiRecruiterWeightedScores.skillsMatchScore}%
                              </span>
                            </li>
                            <li>
                              Experience Relevance:{' '}
                              <span className="font-semibold text-foreground">
                                {aiRecruiterWeightedScores.experienceRelevanceScore}%
                              </span>
                            </li>
                            <li>
                              Culture Fit:{' '}
                              <span className="font-semibold text-foreground">
                                {aiRecruiterWeightedScores.cultureFitScore}%
                              </span>
                            </li>
                            <li>
                              Growth Potential:{' '}
                              <span className="font-semibold text-foreground">
                                {aiRecruiterWeightedScores.growthPotentialScore}%
                              </span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      AI assessment currently unavailable for this candidate.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
              <Separator className="my-4" />
              <AccordionItem value="coworker-fit">
                <AccordionTrigger className="font-heading font-semibold text-foreground text-lg hover:no-underline data-[state=open]:text-primary">
                  <div className="flex items-center">
                    <Users2 className="mr-2 h-5 w-5" /> Coworker Fit Profile{' '}
                    <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/70" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  {isGuestMode ? (
                    <div className="flex items-center rounded-md border border-red-300 bg-red-50 p-3 text-red-500 text-sm italic shadow-sm">
                      <Lock className="mr-2 h-4 w-4" />
                      Sign in to view detailed Coworker Fit Profile.
                    </div>
                  ) : (
                    <div className="space-y-2.5 rounded-md bg-muted/30 p-3 shadow-sm">
                      {candidate.personalityAssessment &&
                      candidate.personalityAssessment.length > 0 ? (
                        <div className="mb-2.5 space-y-1.5">
                          <p className="font-medium text-foreground text-sm">
                            Personality Insights:
                          </p>
                          {candidate.personalityAssessment.map((item, index) => (
                            <div key={index} className="flex items-start text-sm">
                              {renderPersonalityFitIcon(item.fit)}
                              <div className="min-w-0">
                                <span className="font-semibold">{item.trait}:</span>
                                <span className="ml-1.5 text-muted-foreground">
                                  {item.reason ||
                                    (item.fit === 'positive'
                                      ? 'Good fit.'
                                      : item.fit === 'neutral'
                                        ? 'Consider.'
                                        : 'Potential challenge.')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">
                          No personality insights available.
                        </p>
                      )}
                      {candidate.optimalWorkStyles && candidate.optimalWorkStyles.length > 0 ? (
                        <div>
                          <p className="font-medium text-foreground text-sm">Optimal Work Style:</p>
                          <ul className="list-inside list-disc space-y-1 pl-4 text-muted-foreground text-sm">
                            {candidate.optimalWorkStyles.map((style, index) => (
                              <li key={index}>{style}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">
                          No optimal work styles defined.
                        </p>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Separator className="my-4" />

            {candidate.profileStrength && !isGuestMode && (
              <section>
                <h3 className="mb-1.5 flex items-center font-heading font-semibold text-foreground text-lg">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Profile Strength
                </h3>
                <div className="flex items-center font-medium text-md">
                  <Progress value={candidate.profileStrength} className="mr-2 h-2.5 w-2/3" />
                  <span className="font-semibold text-accent">{candidate.profileStrength}%</span>
                  {candidate.profileStrength > 89 && (
                    <Badge
                      variant="default"
                      className="ml-2 bg-green-500 px-2 py-0.5 text-white text-xs hover:bg-green-600"
                    >
                      Top Talent
                    </Badge>
                  )}
                </div>
              </section>
            )}
            {isGuestMode && (
              <section className="flex items-center rounded-md border border-red-300 bg-red-50 p-3 text-red-500 text-sm italic shadow-sm">
                <Lock className="mr-2 h-4 w-4" />
                Profile Strength visible to registered users.
              </section>
            )}
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 z-10 border-t bg-background p-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CandidateCardContent({
  candidate,
  onSwipeAction,
  isLiked,
  isGuestMode,
  isPreviewMode,
}: CandidateCardContentProps) {
  const cardRootRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingAiAnalysis, setIsLoadingAiAnalysis] = useState(false);
  const [aiRecruiterMatchScore, setAiRecruiterMatchScore] = useState<number | null>(null);
  const [aiRecruiterReasoning, setAiRecruiterReasoning] = useState<string | null>(null);
  const [aiRecruiterWeightedScores, setAiRecruiterWeightedScores] =
    useState<RecruiterWeightedScores | null>(null);
  const [activeAccordionItemModal, setActiveAccordionItemModal] = useState<string | undefined>(
    undefined
  );
  const [isShareCandidateModalOpen, setIsShareCandidateModalOpen] = useState(false);

  const isThemedCard = !!(candidate.cardTheme && candidate.cardTheme !== 'default');
  const isProfessionalDarkTheme = candidate.cardTheme === 'professional-dark';
  const isLavenderTheme = candidate.cardTheme === 'lavender';
  const isTextLightOnTheme =
    isThemedCard &&
    (candidate.cardTheme === 'ocean' ||
      candidate.cardTheme === 'sunset' ||
      candidate.cardTheme === 'forest' ||
      candidate.cardTheme === 'professional-dark');

  const fetchAiRecruiterAnalysis = useCallback(async () => {
    if (isPreviewMode || !candidate || isGuestMode) {
      if (isGuestMode) {
        setAiRecruiterMatchScore(null);
        setAiRecruiterReasoning('AI Assessment disabled for guest users.');
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
        role: candidate.role,
        experienceSummary: candidate.experienceSummary,
        skills: candidate.skills,
        location: candidate.location || '',
        desiredWorkStyle: candidate.desiredWorkStyle || '',
        pastProjects: Array.isArray(candidate.pastProjects)
          ? candidate.pastProjects.join(', ')
          : candidate.pastProjects || '',
        educationLevel: candidate.educationLevel || EducationLevel.UNSPECIFIED,
        locationPreference: candidate.locationPreference || LocationPreference.UNSPECIFIED,
        languages: candidate.languages || [],
        salaryExpectationMin: candidate.salaryExpectationMin || 0,
        salaryExpectationMax: candidate.salaryExpectationMax || 0,
        availability: candidate.availability || Availability.UNSPECIFIED,
        jobTypePreference: candidate.jobTypePreference || [],
        personalityAssessment: candidate.personalityAssessment || [],
      };
      const genericJobCriteria: JobCriteriaForAI = {
        title: candidate.role || 'General Role Assessment',
        description: `Assessing overall potential and fit for a role similar to ${candidate.role || "the candidate's stated preference"}. Considering their skills and experience level. Company culture emphasizes innovation and collaboration.`,
        requiredSkills: candidate.skills?.slice(0, 3) || ['communication', 'problem-solving'],
        requiredExperienceLevel: candidate.workExperienceLevel || WorkExperienceLevel.MID_LEVEL,
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
        candidateProfile: {
          ...candidateForAI,
          role: candidateForAI.role || '',
          skills: candidateForAI.skills || [],
          location: candidateForAI.location || '',
          experienceSummary: candidateForAI.experienceSummary || '',
          desiredWorkStyle: candidateForAI.desiredWorkStyle || '',
          pastProjects: candidateForAI.pastProjects || '',
          workExperienceLevel:
            candidateForAI.workExperienceLevel || WorkExperienceLevel.UNSPECIFIED,
          educationLevel: candidateForAI.educationLevel || EducationLevel.UNSPECIFIED,
          locationPreference: candidateForAI.locationPreference || LocationPreference.UNSPECIFIED,
          languages: candidateForAI.languages || [],
          salaryExpectationMin: candidateForAI.salaryExpectationMin || 0,
          salaryExpectationMax: candidateForAI.salaryExpectationMax || 0,
          availability: candidateForAI.availability || Availability.UNSPECIFIED,
          jobTypePreference: candidateForAI.jobTypePreference || [],
          personalityAssessment: candidateForAI.personalityAssessment || [],
        },
        jobCriteria: genericJobCriteria,
        ...(userAIWeights && { userAIWeights }),
      });
      setAiRecruiterMatchScore(result.matchScore);
      setAiRecruiterReasoning(result.reasoning);
      setAiRecruiterWeightedScores(result.weightedScores);
      setActiveAccordionItemModal('ai-assessment');
    } catch (error: any) {
      console.error(`Error fetching AI recruiter analysis for candidate ${candidate.name}:`, error);
      toast({
        title: 'AI Analysis Error',
        description: `Could not get AI assessment for ${candidate.name}. ${error.message || ''}`,
        variant: 'destructive',
        duration: 3000,
      });
      setAiRecruiterMatchScore(0);
      setAiRecruiterReasoning('AI analysis failed to complete.');
      setAiRecruiterWeightedScores(null);
    } finally {
      setIsLoadingAiAnalysis(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    candidate.id,
    candidate.name,
    candidate.role,
    candidate.experienceSummary,
    candidate.skills,
    candidate.location,
    candidate.desiredWorkStyle,
    candidate.pastProjects,
    candidate.workExperienceLevel,
    candidate.educationLevel,
    candidate.locationPreference,
    candidate.languages,
    candidate.salaryExpectationMin,
    candidate.salaryExpectationMax,
    candidate.availability,
    candidate.jobTypePreference,
    candidate.personalityAssessment,
    isGuestMode,
    isPreviewMode,
    toast,
    candidate,
  ]);

  const handleLocalSwipeAction = (actionType: 'like' | 'pass') => {
    if (isPreviewMode) return;
    if (actionType === 'like') {
      incrementAnalytic('candidate_likes');
    } else if (actionType === 'pass') {
      incrementAnalytic('candidate_passes');
    }
    onSwipeAction(candidate.id, actionType);
  };

  const handleDetailsButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreviewMode && !isGuestMode) {
      if (!aiRecruiterMatchScore && !isLoadingAiAnalysis) fetchAiRecruiterAnalysis();
    } else if (isGuestMode) {
      setAiRecruiterMatchScore(null);
      setAiRecruiterReasoning('AI Assessment disabled in Guest Mode.');
      setAiRecruiterWeightedScores(null);
      setIsLoadingAiAnalysis(false);
      setActiveAccordionItemModal(undefined);
    }
    setIsDetailsModalOpen(true);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPreviewMode || isGuestMode) return;
    const targetElement = e.target as HTMLElement;
    if (
      targetElement.closest(
        'video[controls], button, a, [data-no-drag="true"], .no-swipe-area, [role="dialog"], input, textarea, [role="listbox"], [role="option"], [data-radix-scroll-area-viewport]'
      )
    ) {
      if (targetElement.tagName === 'VIDEO' && targetElement.hasAttribute('controls')) {
        const video = targetElement as HTMLVideoElement;
        const rect = video.getBoundingClientRect();
        if (e.clientY > rect.bottom - 40) {
          return;
        }
      } else if (
        targetElement.closest(
          'button, a, [data-no-drag="true"], [role="dialog"], input, textarea, [role="listbox"], [role="option"], [data-radix-scroll-area-viewport]'
        )
      ) {
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
    if (isPreviewMode || !isDragging || !cardRootRef.current || isGuestMode) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUpOrLeave = (_e: React.MouseEvent<HTMLDivElement>) => {
    if (isPreviewMode || !isDragging || !cardRootRef.current || isGuestMode) return;
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
    if (isPreviewMode || !isDragging || isGuestMode) return 'translateX(0px) rotateZ(0deg)';
    const deltaX = currentX - startX;
    const rotationFactor = Math.min(Math.abs(deltaX) / (SWIPE_THRESHOLD * 2), 1);
    const rotation = MAX_ROTATION * (deltaX > 0 ? 1 : -1) * rotationFactor;
    return `translateX(${deltaX}px) rotateZ(${rotation}deg)`;
  };

  const openShareModalForCandidate = () => {
    if (isPreviewMode || isGuestMode) {
      toast({
        title: 'Feature Locked',
        description: 'Sign in to share profiles.',
        variant: 'default',
      });
      return;
    }
    setIsShareCandidateModalOpen(true);
  };

  const cardAvatarSrc = candidate.avatarUrl?.startsWith('/uploads/')
    ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}`
    : candidate.avatarUrl;
  const needsUnoptimizedCard =
    cardAvatarSrc?.startsWith(CUSTOM_BACKEND_URL) || cardAvatarSrc?.startsWith('http://localhost');

  const ActionButton = ({
    action,
    Icon,
    label,
    className: extraClassName,
    isSpecificActionLiked,
  }: {
    action: 'like' | 'pass' | 'details' | 'share_trigger';
    Icon: React.ElementType;
    label: string;
    className?: string;
    isSpecificActionLiked?: boolean;
  }) => {
    const baseClasses =
      'flex-col h-auto py-2.5 text-xs sm:text-sm group rounded-lg hover:scale-105 hover:shadow-md active:scale-95 transition-all duration-200 ease-in-out';
    let colorClasses = '';
    let hoverBgClass = '';
    let iconFillClass = '';

    if (isGuestMode && (action === 'like' || action === 'pass' || action === 'share_trigger')) {
      colorClasses = 'text-white';
      hoverBgClass = 'hover:bg-red-500/80';
    } else if (isProfessionalDarkTheme) {
      colorClasses =
        isSpecificActionLiked && action === 'like'
          ? 'text-green-300'
          : 'text-primary-foreground/90';
      iconFillClass = isSpecificActionLiked && action === 'like' ? 'fill-green-300' : '';
      hoverBgClass = 'hover:bg-white/10';
      if (action === 'like') colorClasses = cn(colorClasses, 'hover:text-green-300');
      else if (action === 'pass') colorClasses = cn(colorClasses, 'hover:text-red-300');
      else if (action === 'details') colorClasses = cn(colorClasses, 'hover:text-blue-300');
      else colorClasses = cn(colorClasses, 'hover:text-primary-foreground');
    } else if (isLavenderTheme) {
      colorClasses =
        isSpecificActionLiked && action === 'like' ? 'text-green-600' : 'text-foreground/80';
      iconFillClass = isSpecificActionLiked && action === 'like' ? 'fill-green-600' : '';
      hoverBgClass = 'hover:bg-black/5';
      if (action === 'like') colorClasses = cn(colorClasses, 'hover:text-green-600');
      else if (action === 'pass')
        colorClasses = cn('text-destructive', 'hover:text-destructive-foreground');
      else if (action === 'details') colorClasses = cn('text-primary', 'hover:text-primary');
      else colorClasses = cn(colorClasses, 'hover:text-foreground');
      if (action === 'pass') hoverBgClass = 'hover:bg-destructive/10';
      if (action === 'like') hoverBgClass = 'hover:bg-green-500/10';
      if (action === 'details') hoverBgClass = 'hover:bg-primary/10';
    } else if (isThemedCard) {
      colorClasses = isSpecificActionLiked && action === 'like' ? 'text-green-300' : 'text-white';
      iconFillClass = isSpecificActionLiked && action === 'like' ? 'fill-green-300' : '';
      hoverBgClass = 'hover:bg-black/10';
      if (action === 'like') colorClasses = cn(colorClasses, 'hover:text-green-300');
      else if (action === 'pass') colorClasses = cn(colorClasses, 'hover:text-red-300');
      else if (action === 'details') colorClasses = cn(colorClasses, 'hover:text-blue-300');
      else colorClasses = cn(colorClasses, 'hover:text-white');
    } else {
      switch (action) {
        case 'like':
          colorClasses = isSpecificActionLiked ? 'text-green-500' : 'text-muted-foreground';
          iconFillClass = isSpecificActionLiked ? 'fill-green-500' : '';
          hoverBgClass = 'hover:text-green-500 hover:bg-green-500/10';
          break;
        case 'pass':
          colorClasses = 'text-destructive';
          hoverBgClass = 'hover:bg-destructive/10';
          break;
        case 'details':
          colorClasses = 'text-primary';
          hoverBgClass = 'hover:text-primary hover:bg-primary/10';
          break;
        case 'share_trigger':
          colorClasses = 'text-muted-foreground';
          hoverBgClass = 'hover:text-gray-600 hover:bg-gray-500/10';
          break;
        default:
          colorClasses = 'text-muted-foreground';
      }
    }

    const effectiveOnClick =
      action === 'details'
        ? handleDetailsButtonClick
        : (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!isPreviewMode && !isGuestMode) {
              if (action !== 'share_trigger') {
                handleLocalSwipeAction(action as 'like' | 'pass');
              } else {
                openShareModalForCandidate();
              }
            } else if (
              isGuestMode &&
              (action === 'like' || action === 'pass' || action === 'share_trigger')
            ) {
              toast({
                title: 'Feature Locked',
                description: 'Sign in to interact.',
                variant: 'default',
              });
            } else if (isGuestMode) {
              handleDetailsButtonClick(e);
            }
          };

    const buttonElement = (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          baseClasses,
          colorClasses,
          hoverBgClass,
          isGuestMode &&
            (action === 'like' || action === 'pass' || action === 'share_trigger') &&
            '!text-white bg-red-400',
          extraClassName
        )}
        onClick={effectiveOnClick}
        disabled={
          isPreviewMode ||
          (isGuestMode && (action === 'like' || action === 'pass' || action === 'share_trigger'))
        }
        aria-label={`${label} ${candidate.name}`}
        data-no-drag="true"
        data-modal-trigger={action === 'details' ? 'true' : undefined}
      >
        {(isGuestMode && (action === 'like' || action === 'pass' || action === 'share_trigger')) ||
        isPreviewMode ? (
          <Lock className="mb-1 h-5 w-5 transition-transform group-hover:scale-110" />
        ) : (
          <Icon
            className={cn('mb-1 h-5 w-5 transition-transform group-hover:scale-110', iconFillClass)}
          />
        )}
        <span className="text-xs">{label}</span>
      </Button>
    );
    return (
      <TooltipProvider>
        <Tooltip>
          {' '}
          <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
          <TooltipContent
            side="bottom"
            className={cn(
              (isGuestMode || isPreviewMode) &&
                (action === 'like' || action === 'pass' || action === 'share_trigger') &&
                'border-red-600 bg-red-500 text-white'
            )}
          >
            <p>
              {(isGuestMode || isPreviewMode) &&
              (action === 'like' || action === 'pass' || action === 'share_trigger')
                ? 'Interaction disabled'
                : label}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  const [appOriginForShare, setAppOriginForShare] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppOriginForShare(window.location.origin);
    } else {
      setAppOriginForShare('https://swipehire-app.com');
    }
  }, []);

  return (
    <>
      <div
        ref={cardRootRef}
        className="flex h-full flex-col overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{
          cursor: isGuestMode || isPreviewMode ? 'default' : 'grab',
          transform: getCardTransform(),
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        <div
          className={cn(
            'relative flex h-52 shrink-0 items-center justify-center p-4 sm:h-56',
            isThemedCard ? getThemeClass(candidate.cardTheme) : 'bg-slate-100 dark:bg-slate-800'
          )}
        >
          <div className="relative h-28 w-28 sm:h-32 sm:w-32">
            {cardAvatarSrc && cardAvatarSrc !== 'https://placehold.co/500x700.png' ? (
              <NextImage
                src={cardAvatarSrc || 'https://placehold.co/500x700.png'}
                alt={candidate.name}
                fill
                className={cn(
                  'rounded-full border-2 object-cover shadow-lg',
                  isThemedCard &&
                    candidate.cardTheme !== 'default' &&
                    candidate.cardTheme !== 'lavender'
                    ? 'border-accent'
                    : isLavenderTheme
                      ? 'border-primary/30'
                      : 'border-accent'
                )}
                data-ai-hint={candidate.dataAiHint || 'person professional'}
                priority
                unoptimized={!!needsUnoptimizedCard}
              />
            ) : (
              <UserCircleIcon className="h-full w-full rounded-full border-2 border-accent bg-white p-1 text-gray-300 shadow-lg dark:bg-slate-700 dark:text-gray-500" />
            )}
          </div>
          {candidate.isUnderestimatedTalent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="default"
                    className="absolute top-3 right-3 cursor-default bg-yellow-400 px-2 py-1 text-black text-xs shadow-md hover:bg-yellow-500"
                  >
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Gem
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs bg-black text-white">
                  <p className="text-xs">
                    {candidate.underestimatedReasoning || 'This candidate shows unique potential!'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div
          className={cn(
            'w-full border-t-4',
            isThemedCard && isTextLightOnTheme
              ? 'border-primary-foreground/30'
              : isThemedCard && !isTextLightOnTheme
                ? 'border-primary/20'
                : 'border-primary'
          )}
        />
        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-4 pt-5 sm:space-y-3 sm:p-5">
          <div className="mt-0 mb-3 text-center sm:mb-4">
            <CardTitle
              className={cn(
                'font-extrabold font-heading text-2xl sm:text-3xl',
                isTextLightOnTheme ? 'text-primary-foreground' : 'text-foreground'
              )}
            >
              {candidate.name}
            </CardTitle>
            <CardDescription
              className={cn(
                'mt-1 font-heading font-medium text-lg sm:text-xl',
                isTextLightOnTheme ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}
            >
              {candidate.role}
            </CardDescription>
          </div>
          <Separator className="my-3 sm:my-4" />
          <div className="space-y-2.5 text-sm">
            {candidate.location && (
              <div
                className={cn(
                  'flex items-center gap-2.5',
                  isTextLightOnTheme ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}
              >
                <MapPin
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isTextLightOnTheme ? 'text-primary-foreground/70' : 'text-accent'
                  )}
                />
                <span className="line-clamp-1">{candidate.location}</span>
              </div>
            )}
            {candidate.workExperienceLevel &&
              candidate.workExperienceLevel !== WorkExperienceLevel.UNSPECIFIED && (
                <div
                  className={cn(
                    'flex items-center gap-2.5',
                    isTextLightOnTheme ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  <Briefcase
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isTextLightOnTheme ? 'text-primary-foreground/70' : 'text-accent'
                    )}
                  />
                  <span className="line-clamp-1">{candidate.workExperienceLevel}</span>
                </div>
              )}
            {candidate.profileStrength !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-2.5',
                  isTextLightOnTheme ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}
              >
                <BarChartHorizontal
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isTextLightOnTheme ? 'text-primary-foreground/70' : 'text-accent'
                  )}
                />
                <span>
                  Profile Strength:{' '}
                  <span className="font-semibold text-accent">{candidate.profileStrength}%</span>
                </span>
              </div>
            )}
          </div>
          <Separator className="my-3 sm:my-4" />
          {candidate.experienceSummary && (
            <div className="mt-2.5 min-h-[3.5em] pt-1">
              <p
                className={cn(
                  'line-clamp-3 text-sm leading-relaxed sm:line-clamp-4',
                  isTextLightOnTheme ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}
              >
                {candidate.experienceSummary}
              </p>
            </div>
          )}
          <Separator className="my-3 sm:my-4" />
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mt-2.5 pt-1.5">
              <h4
                className={cn(
                  'mb-2 font-semibold text-xs uppercase tracking-wider',
                  isTextLightOnTheme ? 'text-primary-foreground/60' : 'text-muted-foreground'
                )}
              >
                Top Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-2.5 py-1 text-xs">
                    {skill}
                  </Badge>
                ))}
                {candidate.skills.length > 4 && (
                  <Badge variant="outline" className="px-2.5 py-1 text-xs">
                    +{candidate.skills.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        <CardFooter
          className={cn(
            'no-swipe-area grid shrink-0 grid-cols-4 gap-1.5 border-t p-1.5 pt-3 sm:pt-4',
            isThemedCard ? '' : 'bg-card'
          )}
        >
          <ActionButton action="pass" Icon={ThumbsDown} label="Pass" />
          <ActionButton action="details" Icon={Eye} label="Profile" />
          <ActionButton
            action="like"
            Icon={ThumbsUp}
            label="Like"
            isSpecificActionLiked={isLiked}
          />
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
        isGuestMode={isGuestMode || false}
        activeAccordionItem={activeAccordionItemModal}
        setActiveAccordionItem={setActiveAccordionItemModal}
        onFetchAiAnalysis={fetchAiRecruiterAnalysis}
        onShareProfile={openShareModalForCandidate}
      />
      <ShareModal
        isOpen={isShareCandidateModalOpen}
        onOpenChange={setIsShareCandidateModalOpen}
        title={`Share ${candidate.name}'s Profile`}
        itemName={candidate.name}
        itemDescription={candidate.role}
        itemType="candidate profile"
        shareUrl={candidate.id ? `${appOriginForShare}/candidate/${candidate.id}` : ''}
        qrCodeLogoUrl="/assets/logo-favicon.png"
      />
    </>
  );
}
