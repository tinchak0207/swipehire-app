'use client';

import {
  AlertTriangle,
  Brain,
  Briefcase as BriefcaseIcon,
  Building,
  CalendarDays,
  CheckCircle as CheckCircleIcon,
  ChevronsUpDown,
  Clock,
  Code2,
  DollarSign,
  Eye,
  Heart,
  HelpCircle,
  Linkedin,
  Link as LinkIcon,
  ListChecks,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Share2,
  Sparkles,
  Tag,
  TrendingUp,
  Twitter,
  Users2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { answerCompanyQuestion } from '@/ai/flows/company-qa-flow';
import { recommendProfile } from '@/ai/flows/profile-recommender';
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
  DialogHeader,
  DialogDescription as ShadDialogDescription,
  DialogTitle as ShadDialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import type {
  CandidateProfileForAI,
  Company,
  CompanyQAInput,
  JobCriteriaForAI,
  JobSeekerPerspectiveWeights,
  ProfileRecommenderOutput,
  UserAIWeights,
} from '@/lib/types';
import {
  Availability,
  EducationLevel,
  JobType,
  LocationPreference,
  WorkExperienceLevel,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { CardFooter } from '../ui/card';

interface CompanyCardContentProps {
  company: Company;
  onSwipeAction: (companyId: string, action: 'like' | 'pass' | 'details') => void;
  isLiked: boolean;
  isGuestMode?: boolean;
}

const MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL = 200;
const MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL = 200;
const SWIPE_THRESHOLD = 75;
const MAX_ROTATION = 10;

type CandidateJobFitAnalysis = ProfileRecommenderOutput['candidateJobFitAnalysis'];
const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

const incrementAnalytic = (key: string) => {
  if (typeof window !== 'undefined') {
    const currentCount = Number.parseInt(localStorage.getItem(`analytics_${key}`) || '0', 10);
    localStorage.setItem(`analytics_${key}`, (currentCount + 1).toString());
  }
};

const CircularProgressBar = ({
  percentage,
  size = 110,
  displayText,
  isRingHovered,
}: {
  percentage: number;
  size?: number;
  displayText?: string;
  isRingHovered?: boolean;
}) => {
  const radius = size / 2;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const effectivePercentage = displayText === '?' ? 0 : percentage;
  const strokeDashoffset = circumference - (effectivePercentage / 100) * circumference;

  return (
    <svg
      height={size}
      width={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90 transform"
    >
      <circle
        className={cn(
          'fill-transparent transition-[stroke] duration-300 ease-in-out',
          isRingHovered ? 'stroke-purple-400' : 'stroke-white/20'
        )}
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {effectivePercentage > 0 && (
        <circle
          className="fill-transparent"
          stroke="url(#progressGradientCompanyCard)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            strokeLinecap: 'round',
            transition: 'stroke-dashoffset 0.35s ease-out',
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      )}
      <defs>
        <linearGradient id="progressGradientCompanyCard" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y={displayText ? '50%' : '48%'}
        dy=".3em"
        textAnchor="middle"
        className={cn(
          'origin-center rotate-90 transform fill-white font-bold',
          size >= 110 ? 'text-3xl' : size >= 100 ? 'text-3xl' : 'text-2xl'
        )}
      >
        {displayText ? displayText : `${Math.round(percentage)}%`}
      </text>
      {!displayText && (
        <text
          x="50%"
          y="62%"
          dy=".3em"
          textAnchor="middle"
          className={cn(
            'origin-center rotate-90 transform fill-white/80',
            size >= 110 ? 'text-sm' : size >= 100 ? 'text-sm' : 'text-xs'
          )}
        >
          match
        </text>
      )}
    </svg>
  );
};

export function CompanyCardContent({
  company,
  onSwipeAction,
  isLiked,
  isGuestMode,
}: CompanyCardContentProps) {
  const cardRootRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { mongoDbUserId } = useUserPreferences();

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [aiJobFitAnalysis, setAiJobFitAnalysis] = useState<CandidateJobFitAnalysis | null>(null);
  const [isLoadingAiAnalysis, setIsLoadingAiAnalysis] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [showFullJobDescriptionInModal, setShowFullJobDescriptionInModal] = useState(false);
  const [showFullCompanyDescriptionInModal, setShowFullCompanyDescriptionInModal] = useState(false);
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);
  const [currentUserProfileForAI, setCurrentUserProfileForAI] =
    useState<CandidateProfileForAI | null>(null);

  const [isHoveringMatchArea, setIsHoveringMatchArea] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const analysisInitiatedFromCardClickRef = useRef(false);
  const [analysisTriggered, setAnalysisTriggered] = useState(false);

  const jobOpening =
    company.jobOpenings && company.jobOpenings.length > 0 ? company.jobOpenings[0] : null;
  const categoryText = company.industry || 'General';

  const handleDetailsButtonClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isGuestMode && !aiJobFitAnalysis && !isLoadingAiAnalysis) {
      fetchAiAnalysis(true, false);
    } else if (isGuestMode) {
      setAiJobFitAnalysis({
        matchScoreForCandidate: 0,
        reasoningForCandidate: 'AI Analysis disabled in Guest Mode.',
        weightedScoresForCandidate: {
          cultureFitScore: 0,
          jobRelevanceScore: 0,
          growthOpportunityScore: 0,
          jobConditionFitScore: 0,
        },
      });
      setIsLoadingAiAnalysis(false);
      setActiveAccordionItem(undefined);
    }
    setIsDetailsModalOpen(true);
  };

  const fetchCurrentUserProfileForAI = useCallback(async () => {
    if (!mongoDbUserId || isGuestMode) return null;
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}`);
      if (!response.ok) throw new Error("Failed to fetch current user's profile for AI analysis.");
      const userData = await response.json();
      const profile: CandidateProfileForAI = {
        id: userData._id,
        role: userData.profileHeadline || 'Software Developer',
        experienceSummary:
          userData.profileExperienceSummary || 'Experienced in various technologies.',
        skills: userData.profileSkills
          ? userData.profileSkills
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s)
          : ['React', 'Node.js'],
        desiredWorkStyle: userData.profileDesiredWorkStyle || 'Remote, Collaborative',
        pastProjects: userData.profilePastProjects || undefined,
        workExperienceLevel: userData.profileWorkExperienceLevel || WorkExperienceLevel.MID_LEVEL,
        educationLevel: userData.profileEducationLevel || EducationLevel.UNIVERSITY,
        locationPreference: userData.profileLocationPreference || LocationPreference.REMOTE,
        languages: userData.profileLanguages
          ? userData.profileLanguages
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s)
          : ['English'],
        salaryExpectationMin: userData.profileSalaryExpectationMin,
        salaryExpectationMax: userData.profileSalaryExpectationMax,
        availability: userData.profileAvailability || Availability.UNSPECIFIED,
        jobTypePreference: userData.profileJobTypePreference
          ? userData.profileJobTypePreference
              .split(',')
              .map((s: string) => s.trim() as JobType)
              .filter((s: JobType) => s && Object.values(JobType).includes(s))
          : [],
      };
      setCurrentUserProfileForAI(profile);
      return profile;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      toast({
        title: 'Profile Error',
        description: 'Could not load your profile for AI analysis.',
        variant: 'destructive',
      });
      return null;
    }
  }, [mongoDbUserId, isGuestMode, toast]);

  const fetchAiAnalysis = useCallback(
    async (_isModalFetch = false, isCardClick = false) => {
      if (!company || !jobOpening || isGuestMode) {
        if (isGuestMode)
          setAiJobFitAnalysis({
            matchScoreForCandidate: 0,
            reasoningForCandidate: 'AI Analysis disabled in Guest Mode.',
            weightedScoresForCandidate: {
              cultureFitScore: 0,
              jobRelevanceScore: 0,
              growthOpportunityScore: 0,
              jobConditionFitScore: 0,
            },
          });
        return;
      }
      setAnalysisTriggered(true);
      let candidateForAI = currentUserProfileForAI;
      if (!candidateForAI) {
        setIsLoadingAiAnalysis(true);
        candidateForAI = await fetchCurrentUserProfileForAI();
      }
      if (!candidateForAI) {
        setIsLoadingAiAnalysis(false);
        toast({
          title: 'AI Analysis Error',
          description: 'Your profile could not be loaded for analysis.',
          variant: 'destructive',
        });
        return;
      }

      setIsLoadingAiAnalysis(true);
      if (isCardClick) {
        analysisInitiatedFromCardClickRef.current = true;
      }
      setSimulatedProgress(0);

      try {
        const jobCriteria: JobCriteriaForAI = {
          title: jobOpening.title,
          description: jobOpening.description,
          requiredSkills: jobOpening.tags || [],
          requiredExperienceLevel:
            jobOpening.requiredExperienceLevel || WorkExperienceLevel.UNSPECIFIED,
          requiredEducationLevel: jobOpening.requiredEducationLevel || EducationLevel.UNSPECIFIED,
          workLocationType: jobOpening.workLocationType || LocationPreference.UNSPECIFIED,
          jobLocation: jobOpening.location || undefined,
          requiredLanguages: jobOpening.requiredLanguages || [],
          salaryMin: jobOpening.salaryMin,
          salaryMax: jobOpening.salaryMax,
          jobType: jobOpening.jobType || JobType.UNSPECIFIED,
          companyCultureKeywords:
            jobOpening.companyCultureKeywords || company.cultureHighlights || [],
          companyIndustry: company.industry || undefined,
        };
        let userAIWeights: UserAIWeights | undefined;
        if (typeof window !== 'undefined') {
          const storedWeights = localStorage.getItem('userJobSeekerAIWeights');
          if (storedWeights) {
            try {
              const parsedJobSeekerWeights: JobSeekerPerspectiveWeights = JSON.parse(storedWeights);
              const sumOfWeights = Object.values(parsedJobSeekerWeights).reduce(
                (sum, val) => sum + (Number(val) || 0),
                0
              );
              if (Math.abs(sumOfWeights - 100) < 0.01)
                userAIWeights = { jobSeekerPerspective: parsedJobSeekerWeights };
            } catch (e) {
              console.warn('Could not parse userJobSeekerAIWeights from localStorage', e);
            }
          }
        }
        const result = await recommendProfile({
          candidateProfile: candidateForAI,
          jobCriteria: jobCriteria,
          userAIWeights: userAIWeights,
        });

        const currentSimulatedProgress = simulatedProgress;
        const remainingSimulatedTime = (100 - currentSimulatedProgress) * 40;

        setTimeout(
          () => {
            setSimulatedProgress(100);
            if (result.candidateJobFitAnalysis) setAiJobFitAnalysis(result.candidateJobFitAnalysis);
            else
              setAiJobFitAnalysis({
                matchScoreForCandidate: 0,
                reasoningForCandidate:
                  'AI analysis did not provide specific job-to-candidate fit details.',
                weightedScoresForCandidate: {
                  cultureFitScore: 0,
                  jobRelevanceScore: 0,
                  growthOpportunityScore: 0,
                  jobConditionFitScore: 0,
                },
              });
            setIsLoadingAiAnalysis(false);
          },
          Math.max(0, remainingSimulatedTime)
        );
      } catch (error: any) {
        console.error(`Error fetching AI job fit analysis for company ${company.name}:`, error);
        toast({
          title: 'AI Analysis Error',
          description: `Failed to get AI insights. ${error.message || 'Ensure your profile is up to date.'}`,
          variant: 'destructive',
        });
        setAiJobFitAnalysis({
          matchScoreForCandidate: 0,
          reasoningForCandidate: 'Error during AI analysis.',
          weightedScoresForCandidate: {
            cultureFitScore: 0,
            jobRelevanceScore: 0,
            growthOpportunityScore: 0,
            jobConditionFitScore: 0,
          },
        });
        setIsLoadingAiAnalysis(false);
        analysisInitiatedFromCardClickRef.current = false;
      }
    },
    [
      company,
      jobOpening,
      isGuestMode,
      toast,
      currentUserProfileForAI,
      fetchCurrentUserProfileForAI,
      simulatedProgress,
    ]
  );

  useEffect(() => {
    if (!isLoadingAiAnalysis && aiJobFitAnalysis && analysisInitiatedFromCardClickRef.current) {
      setIsDetailsModalOpen(true);
      setActiveAccordionItem('ai-fit-analysis');
      analysisInitiatedFromCardClickRef.current = false;
    }
  }, [isLoadingAiAnalysis, aiJobFitAnalysis]);

  useEffect(() => {
    if (isDetailsModalOpen && !isGuestMode && !aiJobFitAnalysis && !isLoadingAiAnalysis) {
      fetchAiAnalysis(true, false);
    } else if (isGuestMode && isDetailsModalOpen) {
      setAiJobFitAnalysis({
        matchScoreForCandidate: 0,
        reasoningForCandidate: 'AI Analysis disabled in Guest Mode.',
        weightedScoresForCandidate: {
          cultureFitScore: 0,
          jobRelevanceScore: 0,
          growthOpportunityScore: 0,
          jobConditionFitScore: 0,
        },
      });
      setIsLoadingAiAnalysis(false);
      setActiveAccordionItem(undefined);
    }
  }, [isDetailsModalOpen, isGuestMode, aiJobFitAnalysis, isLoadingAiAnalysis, fetchAiAnalysis]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | undefined;
    if (isLoadingAiAnalysis && !isGuestMode) {
      let currentProgress = simulatedProgress;
      progressInterval = setInterval(() => {
        currentProgress += 2.5;
        if (currentProgress <= 100) {
          setSimulatedProgress(currentProgress);
        } else {
          clearInterval(progressInterval);
          if (isLoadingAiAnalysis) setSimulatedProgress(100);
        }
      }, 100);
    }
    return () => clearInterval(progressInterval);
  }, [isLoadingAiAnalysis, isGuestMode, simulatedProgress]);

  const handleLocalSwipeAction = (actionType: 'like' | 'pass' | 'details') => {
    if (actionType === 'like') incrementAnalytic('analytics_company_likes');
    else if (actionType === 'pass') incrementAnalytic('analytics_company_passes');
    if (actionType === 'details') {
      handleDetailsButtonClick();
    } else {
      onSwipeAction(company.id, actionType as 'like' | 'pass');
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGuestMode) return;
    const targetElement = e.target as HTMLElement;
    if (
      targetElement.closest(
        '[data-interactive-match-area="true"], video[controls], button, a, [data-no-drag="true"], .no-swipe-area, [role="dialog"], input, textarea, [role="listbox"], [role="option"], [data-radix-scroll-area-viewport]'
      )
    ) {
      if (targetElement.tagName === 'VIDEO' && targetElement.hasAttribute('controls')) {
        const video = targetElement as HTMLVideoElement;
        const rect = video.getBoundingClientRect();
        if (e.clientY > rect.bottom - 40) {
          return;
        }
      } else if (
        targetElement.closest('[data-interactive-match-area="true"]') &&
        !isLoadingAiAnalysis &&
        !isGuestMode
      ) {
        return;
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
    if (!isDragging || !cardRootRef.current || isGuestMode) return;
    setCurrentX(e.clientX);
  };
  const handleMouseUpOrLeave = (_e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !cardRootRef.current || isGuestMode) return;
    const deltaX = currentX - startX;
    cardRootRef.current.style.transition = 'transform 0.3s ease-out';
    cardRootRef.current.style.transform = 'translateX(0px) rotateZ(0deg)';
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) handleLocalSwipeAction('pass');
      else handleLocalSwipeAction('like');
    }
    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
    if (cardRootRef.current) cardRootRef.current.style.cursor = 'grab';
    document.body.style.userSelect = '';
  };
  const getCardTransform = () => {
    if (!isDragging || isGuestMode) return 'translateX(0px) rotateZ(0deg)';
    const deltaX = currentX - startX;
    const rotationFactor = Math.min(Math.abs(deltaX) / (SWIPE_THRESHOLD * 2), 1);
    const rotation = MAX_ROTATION * (deltaX > 0 ? 1 : -1) * rotationFactor;
    return `translateX(${deltaX}px) rotateZ(${rotation}deg)`;
  };

  const handleAskQuestion = async () => {
    if (isGuestMode || !userQuestion.trim()) return;
    setIsAskingQuestion(true);
    setAiAnswer(null);
    try {
      const companyInput: CompanyQAInput = {
        companyName: company.name,
        companyDescription: company.description,
        companyIndustry: company.industry,
        companyCultureHighlights: company.cultureHighlights,
        jobOpeningsSummary: jobOpening
          ? `${jobOpening.title}: ${jobOpening.description.substring(0, 100)}...`
          : 'General opportunities available.',
        userQuestion: userQuestion,
      };
      const result = await answerCompanyQuestion(companyInput);
      setAiAnswer(result.aiAnswer);
    } catch (error) {
      console.error('Error asking AI about company:', error);
      toast({
        title: 'AI Question Error',
        description: 'Could not get an answer from AI.',
        variant: 'destructive',
      });
      setAiAnswer("Sorry, I couldn't process that question right now.");
    } finally {
      setIsAskingQuestion(false);
    }
  };
  const handleShareAction = (action: 'copy' | 'email' | 'linkedin' | 'twitter') => {
    if (isGuestMode) {
      toast({ title: 'Feature Locked', description: 'Sign in to share.', variant: 'default' });
      return;
    }
    const profileUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/company/${company.id}/job/${jobOpening?.title.replace(/\s+/g, '-') || 'general'}`
        : 'https://swipehire-app.com';
    const shareText = `Check out this job opportunity at ${company.name}: ${jobOpening?.title || 'Exciting Role!'}. Visit ${profileUrl}`;
    const emailSubject = `Job Opportunity at ${company.name}: ${jobOpening?.title || 'Exciting Role!'}`;
    const emailBody = `I found this job opportunity on SwipeHire and thought you might be interested:\n\nCompany: ${company.name}\nRole: ${jobOpening?.title || 'Exciting Role!'}\n\nView more at: ${profileUrl}\n\nShared from SwipeHire.`;
    switch (action) {
      case 'copy':
        navigator.clipboard
          .writeText(profileUrl)
          .then(() =>
            toast({ title: 'Link Copied!', description: 'Job link copied to clipboard.' })
          )
          .catch(() =>
            toast({
              title: 'Copy Failed',
              description: 'Could not copy link.',
              variant: 'destructive',
            })
          );
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&title=${encodeURIComponent(shareText)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
    }
  };

  const companyDescriptionForModal = company.description;
  const displayedCompanyDescriptionInModal =
    showFullCompanyDescriptionInModal ||
    companyDescriptionForModal.length <= MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL
      ? companyDescriptionForModal
      : companyDescriptionForModal.substring(0, MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL) +
        '...';
  const jobDescriptionForModal = jobOpening?.description || 'No job description available.';
  const displayedJobDescriptionInModal =
    showFullJobDescriptionInModal ||
    jobDescriptionForModal.length <= MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL
      ? jobDescriptionForModal
      : `${jobDescriptionForModal.substring(0, MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL)}...`;

  const showQuestionMark = !isLoadingAiAnalysis && !aiJobFitAnalysis && !analysisTriggered;
  const displayPercentage = Math.round(
    aiJobFitAnalysis?.matchScoreForCandidate ?? company.jobMatchPercentage ?? 0
  );

  // Determine which image URL and hint to use -- REVERTED LOGIC
  const imageUrlToDisplay = company.logoUrl;
  const dataAiHintToDisplay = company.dataAiHint || 'company logo';

  let useRawImgTag = false;
  let isUnoptimizedForNextImage = false;
  let finalEffectiveImageUrl = imageUrlToDisplay; // This will now be based directly on company.logoUrl after processing

  const KNOWN_NEXT_IMAGE_HOSTNAMES = [
    'placehold.co',
    'lh3.googleusercontent.com',
    'storage.googleapis.com',
    'upload.wikimedia.org',
    '5000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
  ];

  if (
    finalEffectiveImageUrl &&
    !['https://placehold.co/500x350.png', 'https://placehold.co/100x100.png'].includes(
      finalEffectiveImageUrl
    )
  ) {
    console.log(
      `[CompanyCardContent REVERTED: ${company.name}] Processing logoUrl:`,
      finalEffectiveImageUrl
    );
    if (finalEffectiveImageUrl.startsWith('/uploads/')) {
      finalEffectiveImageUrl = `${CUSTOM_BACKEND_URL}${finalEffectiveImageUrl}`;
      console.log(
        `[CompanyCardContent REVERTED: ${company.name}] Path is internal /uploads/. Final URL: ${finalEffectiveImageUrl}`
      );
      if (
        CUSTOM_BACKEND_URL.includes('localhost') ||
        CUSTOM_BACKEND_URL.includes('cloudworkstations.dev')
      ) {
        isUnoptimizedForNextImage = true;
        console.log(
          `[CompanyCardContent REVERTED: ${company.name}] Marking as unoptimized for Next/Image (backend is localhost or cloud workstation).`
        );
      }
    } else if (
      finalEffectiveImageUrl.startsWith('http://') ||
      finalEffectiveImageUrl.startsWith('https://')
    ) {
      console.log(`[CompanyCardContent REVERTED: ${company.name}] Path is absolute URL.`);
      try {
        const url = new URL(finalEffectiveImageUrl);
        if (url.hostname === 'localhost') {
          isUnoptimizedForNextImage = true;
          console.log(
            `[CompanyCardContent REVERTED: ${company.name}] Hostname is localhost. Marking as unoptimized for Next/Image.`
          );
        } else if (
          KNOWN_NEXT_IMAGE_HOSTNAMES.some((knownHost) => url.hostname.endsWith(knownHost))
        ) {
          console.log(
            `[CompanyCardContent REVERTED: ${company.name}] Hostname ${url.hostname} is in known Next/Image list. Using Next/Image.`
          );
        } else {
          useRawImgTag = true;
          console.warn(
            `[CompanyCardContent REVERTED: ${company.name}] Hostname ${url.hostname} not in known Next/Image list. Falling back to raw <img> tag for company logo. Ensure domain allows hotlinking or add to next.config.js.`
          );
        }
      } catch (e) {
        useRawImgTag = true;
        console.warn(
          `[CompanyCardContent REVERTED: ${company.name}] Invalid URL "${finalEffectiveImageUrl}", falling back to raw <img>. Error:`,
          e
        );
      }
    } else {
      finalEffectiveImageUrl = undefined;
      console.warn(
        `[CompanyCardContent REVERTED: ${company.name}] Logo URL "${finalEffectiveImageUrl}" is neither /uploads/ nor absolute. Treating as no image.`
      );
    }
  } else {
    finalEffectiveImageUrl = undefined; // No valid image, will fall back to icon
    console.log(
      `[CompanyCardContent REVERTED: ${company.name}] No valid company logo URL or only placeholder detected. Will use fallback icon.`
    );
  }

  const reputationGuaranteePromises = [
    '72小時內必定回復您的申請 (Will definitely reply to your application within 72 hours)',
    '提供具體且有建設性的回覆 (Provide specific and constructive replies)',
    '透明的招聘流程和時程 (Transparent recruitment process and timeline)',
    "尊重應聘者的時間和努力 (Respect applicants' time and effort)",
  ];

  return (
    <>
      <div
        ref={cardRootRef}
        className="relative flex h-full flex-col overflow-hidden bg-gradient-to-br from-purple-500 via-indigo-500 to-sky-500 text-white"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{
          cursor: isGuestMode ? 'default' : isDragging ? 'grabbing' : 'grab',
          transform: getCardTransform(),
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        <div className="relative p-4 pt-5 text-center">
          <Badge className="absolute top-3 left-3 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-medium text-white text-xs shadow-md backdrop-blur-sm">
            {categoryText}
          </Badge>
          <div className="mx-auto mt-8 flex h-[64px] w-[64px] items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg backdrop-blur-md">
            {finalEffectiveImageUrl ? (
              useRawImgTag ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={finalEffectiveImageUrl}
                  alt={`${company.name} logo`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  data-ai-hint={dataAiHintToDisplay}
                  onError={(_e) => {
                    console.error(
                      `[CompanyCardContent REVERTED: ${company.name}] Raw <img> tag failed to load src: ${finalEffectiveImageUrl}. Potential CORS or network issue. See browser console (Network tab).`
                    );
                  }}
                />
              ) : (
                <Image
                  src={finalEffectiveImageUrl}
                  alt={`${company.name} logo`}
                  width={36}
                  height={36}
                  className="object-contain"
                  data-ai-hint={dataAiHintToDisplay}
                  unoptimized={isUnoptimizedForNextImage}
                  onError={(e) => {
                    console.error(
                      `[CompanyCardContent REVERTED: ${company.name}] Next/Image failed to load src: ${finalEffectiveImageUrl}. If external, ensure hostname is in next.config.js remotePatterns. If internal, check path and backend serving. Error:`,
                      e
                    );
                  }}
                />
              )
            ) : (
              <Code2 className="h-7 w-7 text-white" />
            )}
          </div>
        </div>

        <div className="flex flex-grow flex-col p-4 pt-2 text-center">
          <p className="mt-4 font-semibold text-custom-light-purple-text text-lg uppercase tracking-wider">
            {company.name}
          </p>
          <h1 className="mt-1 break-words font-bold text-3xl text-white leading-tight sm:text-4xl">
            {jobOpening?.title.split('(')[0].trim()}
            {jobOpening?.title.includes('(') && (
              <span className="block font-bold text-2xl">{`(${jobOpening?.title.split('(')[1]}`}</span>
            )}
          </h1>
          <div className="mt-3 flex items-center justify-center gap-x-1.5 text-base text-white/90">
            {jobOpening?.location && (
              <span className="flex items-center">
                <MapPin className="mr-1 h-4 w-4 text-white/70" /> {jobOpening.location}
              </span>
            )}
            {jobOpening?.location && jobOpening?.jobType && (
              <span className="mx-0.5 text-white/50">•</span>
            )}
            {jobOpening?.jobType && (
              <span className="flex items-center">
                <BriefcaseIcon className="mr-1 h-4 w-4 text-white/70" />{' '}
                {jobOpening.jobType.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <div
            data-interactive-match-area="true"
            className={cn(
              'group relative mx-auto my-4 flex min-h-[110px] w-[110px] flex-col items-center justify-center transition-all duration-300 ease-in-out',
              isGuestMode && 'cursor-not-allowed opacity-70',
              !isGuestMode && 'cursor-pointer'
            )}
            onMouseEnter={() => {
              if (
                !isGuestMode &&
                !isLoadingAiAnalysis &&
                !aiJobFitAnalysis?.matchScoreForCandidate
              ) {
                setIsHoveringMatchArea(true);
              }
            }}
            onMouseLeave={() => setIsHoveringMatchArea(false)}
            onClick={() => {
              if (!isGuestMode && !isLoadingAiAnalysis) {
                fetchAiAnalysis(false, true);
                setIsHoveringMatchArea(false);
              }
            }}
          >
            {isGuestMode ? (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-red-400/50 bg-red-500/20 p-2 text-center">
                <Lock className="mx-auto mb-1 h-8 w-8 text-red-300" />
                <p className="text-red-200 text-xs">Sign in for AI Fit</p>
              </div>
            ) : isLoadingAiAnalysis ? (
              <div className="w-full max-w-[150px] space-y-2 p-2 text-center">
                <Progress
                  value={simulatedProgress}
                  className="h-2 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-pink-400 [&>div]:to-purple-400"
                />
                <p className="mt-1 text-white/70 text-xs">Analyzing fit...</p>
              </div>
            ) : (
              <>
                <CircularProgressBar
                  percentage={
                    showQuestionMark && !isHoveringMatchArea && !analysisTriggered
                      ? 0
                      : displayPercentage
                  }
                  size={110}
                  displayText={
                    showQuestionMark && !isHoveringMatchArea && !analysisTriggered ? '?' : undefined
                  }
                  isRingHovered={isHoveringMatchArea && !analysisTriggered && !isLoadingAiAnalysis}
                />
                {isHoveringMatchArea && !analysisTriggered && !isLoadingAiAnalysis && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 p-2 backdrop-blur-sm">
                    <Sparkles className="mb-1.5 h-10 w-10 text-yellow-300" />
                    <p className="text-center font-semibold text-sm text-white leading-tight">
                      Analyze My Job Fit
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {jobOpening?.requiredExperienceLevel &&
            jobOpening.requiredExperienceLevel !== WorkExperienceLevel.UNSPECIFIED && (
              <p className="mt-2 text-white/70 text-xs italic">
                {jobOpening.requiredExperienceLevel.replace(/_/g, ' ')} experience preferred
              </p>
            )}

          <div className="mt-auto pt-4">
            <p className="mt-6 font-semibold text-custom-light-purple-text text-sm uppercase tracking-wider">
              TOP SKILLS
            </p>
            <div className="mt-2.5 flex flex-wrap justify-center gap-2.5">
              {jobOpening?.tags?.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  className="rounded-full bg-custom-light-purple-skill-bg px-5 py-2.5 font-semibold text-base text-custom-primary-purple shadow-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <CardFooter className="mt-auto grid grid-cols-4 justify-items-center gap-4 border-white/10 border-t bg-transparent p-4">
          <TooltipProvider>
            {' '}
            <Tooltip>
              {' '}
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isGuestMode) handleLocalSwipeAction('pass');
                    else toast({ title: 'Guest Mode', description: 'Interactions disabled.' });
                  }}
                  disabled={isGuestMode}
                  className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 font-medium text-sm text-white/80 shadow-md backdrop-blur-sm transition-colors hover:border-red-400/50 hover:bg-red-500/20 hover:text-red-300 hover:shadow-lg"
                  aria-label={`Pass on ${company.name}`}
                  data-no-drag="true"
                >
                  {' '}
                  {isGuestMode ? (
                    <Lock className="mb-1 h-6 w-6" />
                  ) : (
                    <X className="mb-1 h-6 w-6 text-white/90" />
                  )}{' '}
                  <span className="text-sm">Pass</span>{' '}
                </Button>
              </TooltipTrigger>{' '}
              <TooltipContent className="border-slate-700 bg-slate-800 text-white">
                <p>Not Interested</p>
              </TooltipContent>{' '}
            </Tooltip>{' '}
          </TooltipProvider>

          <TooltipProvider>
            {' '}
            <Tooltip>
              {' '}
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleDetailsButtonClick}
                  className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 font-medium text-sm text-white/80 shadow-md backdrop-blur-sm transition-colors hover:border-blue-400/50 hover:bg-blue-500/20 hover:text-blue-300 hover:shadow-lg"
                  aria-label={`View details for ${company.name}`}
                  data-no-drag="true"
                  data-modal-trigger="true"
                >
                  {' '}
                  <Eye className="mb-1 h-6 w-6 text-white/90" />{' '}
                  <span className="text-sm">Profile</span>{' '}
                </Button>
              </TooltipTrigger>{' '}
              <TooltipContent className="border-slate-700 bg-slate-800 text-white">
                <p>View Full Details</p>
              </TooltipContent>{' '}
            </Tooltip>{' '}
          </TooltipProvider>

          <TooltipProvider>
            {' '}
            <Tooltip>
              {' '}
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isGuestMode) handleLocalSwipeAction('like');
                    else toast({ title: 'Guest Mode', description: 'Interactions disabled.' });
                  }}
                  disabled={isGuestMode}
                  className={cn(
                    'flex h-[72px] w-[72px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 font-medium text-sm text-white/80 shadow-md backdrop-blur-sm transition-colors hover:shadow-lg',
                    isLiked && !isGuestMode
                      ? 'bg-pink-500/20 text-pink-300 ring-2 ring-pink-400 hover:border-pink-400/70 hover:bg-pink-500/30 hover:text-pink-200'
                      : 'hover:border-green-400/50 hover:bg-green-500/20 hover:text-green-300'
                  )}
                  aria-label={`Like ${company.name}`}
                  data-no-drag="true"
                >
                  {' '}
                  {isGuestMode ? (
                    <Lock className="mb-1 h-6 w-6" />
                  ) : (
                    <Heart
                      className={cn(
                        'mb-1 h-6 w-6 text-white/90',
                        isLiked && !isGuestMode && 'fill-pink-400 text-pink-400'
                      )}
                    />
                  )}{' '}
                  <span className="text-sm">Like</span>{' '}
                </Button>
              </TooltipTrigger>{' '}
              <TooltipContent className="border-slate-700 bg-slate-800 text-white">
                <p>I'm Interested!</p>
              </TooltipContent>{' '}
            </Tooltip>{' '}
          </TooltipProvider>

          <DropdownMenu>
            {' '}
            <TooltipProvider>
              {' '}
              <Tooltip>
                {' '}
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    disabled={isGuestMode}
                    className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 font-medium text-sm text-white/80 shadow-md backdrop-blur-sm transition-colors hover:border-purple-400/50 hover:bg-purple-500/20 hover:text-purple-300 hover:shadow-lg"
                    aria-label={`Share ${company.name}`}
                    data-no-drag="true"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {' '}
                    {isGuestMode ? (
                      <Lock className="mb-1 h-6 w-6" />
                    ) : (
                      <Share2 className="mb-1 h-6 w-6 text-white/90" />
                    )}{' '}
                    <span className="text-sm">Share</span>{' '}
                  </Button>
                </TooltipTrigger>{' '}
                <TooltipContent
                  className={cn(
                    isGuestMode && 'border-red-600 bg-red-500 text-white',
                    !isGuestMode && 'border-slate-700 bg-slate-800 text-white'
                  )}
                >
                  <p>{isGuestMode ? 'Sign in to share' : 'Share this opportunity'}</p>
                </TooltipContent>{' '}
              </Tooltip>{' '}
            </TooltipProvider>
            <DropdownMenuContent
              align="end"
              className="w-40 border-slate-600 bg-slate-700 text-white"
              data-no-drag="true"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareAction('copy');
                }}
                className="hover:!bg-slate-600 focus:!bg-slate-600"
                data-no-drag="true"
              >
                <LinkIcon className="mr-2 h-4 w-4" /> Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareAction('email');
                }}
                className="hover:!bg-slate-600 focus:!bg-slate-600"
                data-no-drag="true"
              >
                <Mail className="mr-2 h-4 w-4" /> Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareAction('linkedin');
                }}
                className="hover:!bg-slate-600 focus:!bg-slate-600"
                data-no-drag="true"
              >
                <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareAction('twitter');
                }}
                className="hover:!bg-slate-600 focus:!bg-slate-600"
                data-no-drag="true"
              >
                <Twitter className="mr-2 h-4 w-4" /> X / Twitter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </div>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col border-slate-700 bg-slate-800 p-0 text-white sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
          <DialogHeader className="sticky top-0 z-10 border-slate-700 border-b bg-slate-800 p-4 pb-3 sm:p-6">
            <ShadDialogTitle className="font-bold text-custom-primary-purple text-xl sm:text-2xl">
              {jobOpening?.title || 'Opportunity Details'} at {company.name}
            </ShadDialogTitle>
            <ShadDialogDescription className="text-slate-400 text-sm">
              {company.industry}
            </ShadDialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-3 p-4 pt-3 sm:p-6">
              <section>
                <h3 className="mb-1.5 flex items-center font-semibold text-custom-light-purple-text text-lg">
                  <Building className="mr-2 h-5 w-5" /> About {company.name}
                </h3>
                <p className="whitespace-pre-line text-slate-300 text-sm leading-relaxed">
                  {displayedCompanyDescriptionInModal}
                  {companyDescriptionForModal.length >
                    MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFullCompanyDescriptionInModal(!showFullCompanyDescriptionInModal);
                      }}
                      className="ml-1 h-auto p-0 font-semibold text-custom-primary-purple text-xs hover:underline"
                      data-no-drag="true"
                    >
                      {showFullCompanyDescriptionInModal ? 'Read less' : 'Read more'}
                    </Button>
                  )}
                </p>
              </section>
              <Separator className="my-3 bg-slate-700" />
              {jobOpening && (
                <>
                  <section>
                    <h3 className="mb-1.5 flex items-center font-semibold text-custom-light-purple-text text-lg">
                      <BriefcaseIcon className="mr-2 h-5 w-5" /> Job Description: {jobOpening.title}
                    </h3>
                    <p className="whitespace-pre-line text-slate-300 text-sm leading-relaxed">
                      {displayedJobDescriptionInModal}
                      {jobDescriptionForModal.length > MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFullJobDescriptionInModal(!showFullJobDescriptionInModal);
                          }}
                          className="ml-1 h-auto p-0 font-semibold text-custom-primary-purple text-xs hover:underline"
                          data-no-drag="true"
                        >
                          {showFullJobDescriptionInModal ? 'Read less' : 'Read more'}
                        </Button>
                      )}
                    </p>
                  </section>
                  <Separator className="my-3 bg-slate-700" />
                  <section>
                    <h3 className="mb-2 flex items-center font-semibold text-custom-light-purple-text text-lg">
                      <ListChecks className="mr-2 h-5 w-5" /> Key Job Details
                    </h3>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-2 rounded-lg border border-slate-700 bg-slate-700/30 p-3 text-sm shadow-sm sm:grid-cols-2">
                      {jobOpening.location && (
                        <div className="flex items-start">
                          <MapPin className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-slate-400" />
                          <span className="mr-1 font-medium text-white">Location:</span>{' '}
                          <span className="text-slate-300">{jobOpening.location}</span>
                        </div>
                      )}
                      {jobOpening.salaryRange && (
                        <div className="flex items-start">
                          <DollarSign className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-slate-400" />
                          <span className="mr-1 font-medium text-white">Salary:</span>{' '}
                          <span className="text-slate-300">{jobOpening.salaryRange}</span>
                        </div>
                      )}
                      {jobOpening.jobType && (
                        <div className="flex items-start">
                          <BriefcaseIcon className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-slate-400" />
                          <span className="mr-1 font-medium text-white">Type:</span>{' '}
                          <span className="text-slate-300">
                            {jobOpening.jobType.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )}
                      {jobOpening.requiredExperienceLevel &&
                        jobOpening.requiredExperienceLevel !== WorkExperienceLevel.UNSPECIFIED && (
                          <div className="flex items-start">
                            <CalendarDays className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-slate-400" />
                            <span className="mr-1 font-medium text-white">Experience:</span>{' '}
                            <span className="text-slate-300">
                              {jobOpening.requiredExperienceLevel.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                      {jobOpening.tags && jobOpening.tags.length > 0 && (
                        <div className="flex items-start sm:col-span-2">
                          <Tag className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-slate-400" />
                          <span className="mr-1 self-start font-medium text-white">
                            Skills/Tags:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {jobOpening.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-custom-light-purple-skill-bg text-custom-primary-purple text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                  <Separator className="my-3 bg-slate-700" />
                </>
              )}
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={activeAccordionItem}
                onOpenChange={setActiveAccordionItem}
              >
                <AccordionItem value="reputation-guarantee" className="border-b-0">
                  <AccordionTrigger className="font-semibold text-custom-light-purple-text text-lg hover:no-underline data-[state=open]:text-custom-primary-purple">
                    <div className="flex items-center">
                      <CheckCircleIcon className="mr-2 h-5 w-5 text-green-400" /> 信譽保障
                      (Reputation Guarantee){' '}
                      <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-400/70" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3">
                    <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-700/30 p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center font-semibold text-lg text-white">
                            <TrendingUp className="mr-1.5 h-5 w-5 text-green-400" />
                            {company.reputationScore || 80} 分
                          </div>
                          <p className="text-slate-400 text-xs">
                            企業信譽等級: {company.reputationGrade || '良好'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-medium text-slate-300 text-sm">
                            及時回復率 (Timely Reply Rate)
                          </span>
                          <span className="font-semibold text-green-400 text-sm">
                            {company.timelyReplyRate || 80}%
                          </span>
                        </div>
                        <Progress
                          value={company.timelyReplyRate || 80}
                          className="h-2 [&>div]:bg-green-500"
                        />
                        <p className="mt-0.5 text-slate-400 text-xs">
                          該企業在72小時內回復應聘者的比例
                        </p>
                      </div>
                      {company.commonRejectionReasons &&
                        company.commonRejectionReasons.length > 0 && (
                          <div>
                            <h4 className="mb-1 flex items-center font-medium text-slate-300 text-sm">
                              <AlertTriangle className="mr-1.5 h-4 w-4 text-yellow-400" />{' '}
                              常見被拒原因 (Common Rejection Reasons)
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {company.commonRejectionReasons.map((reason) => (
                                <Badge
                                  key={reason}
                                  variant="outline"
                                  className="border-yellow-400/50 bg-yellow-400/10 text-xs text-yellow-300"
                                >
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                            <p className="mt-0.5 text-slate-400 text-xs">
                              了解常見被拒原因, 提升申請成功率
                            </p>
                          </div>
                        )}
                      <div>
                        <h4 className="mb-1.5 flex items-center font-medium text-slate-300 text-sm">
                          <Clock className="mr-1.5 h-4 w-4 text-slate-400" /> 信譽保障承諾
                          (Reputation Guarantee Promise)
                        </h4>
                        <ul className="list-inside list-disc space-y-1 pl-1 text-slate-300 text-xs">
                          {reputationGuaranteePromises.map((promise, index) => (
                            <li key={index}>{promise}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <Separator className="my-3 bg-slate-700" />
                <AccordionItem value="ai-fit-analysis" className="border-b-0">
                  <AccordionTrigger className="font-semibold text-custom-light-purple-text text-lg hover:no-underline data-[state=open]:text-custom-primary-purple">
                    <div className="flex items-center">
                      <Brain className="mr-2 h-5 w-5" /> AI: How This Job Fits You{' '}
                      <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-400/70" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3">
                    <p className="mb-2 text-slate-400 text-xs italic">
                      Our AI considers how this job aligns with your profile... (Customize weights
                      in Settings).
                    </p>
                    {isGuestMode ? (
                      <div className="flex items-center rounded-md border border-red-600 bg-red-900/30 p-3 text-red-400 text-sm italic shadow-sm">
                        <Lock className="mr-2 h-4 w-4" />
                        Sign in to get your personalized AI Fit Analysis.
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() => fetchAiAnalysis(true, false)}
                          disabled={isLoadingAiAnalysis || !!aiJobFitAnalysis}
                          className="mb-2.5 w-full bg-custom-primary-purple text-white hover:bg-custom-primary-purple/80 sm:w-auto"
                        >
                          {isLoadingAiAnalysis ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          {aiJobFitAnalysis ? 'Analysis Complete' : 'Analyze My Fit for this Job'}
                        </Button>
                        {isLoadingAiAnalysis && !aiJobFitAnalysis && (
                          <div className="flex items-center py-1.5 text-slate-400 text-sm">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Assessing fit...</span>
                          </div>
                        )}
                        {aiJobFitAnalysis && !isLoadingAiAnalysis && (
                          <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-700/30 p-3 shadow-sm">
                            <div className="flex items-baseline">
                              <span className="font-semibold text-md text-white">
                                Your Fit Score:
                              </span>
                              <span
                                className={cn(
                                  'ml-1.5 font-bold text-xl',
                                  aiJobFitAnalysis.matchScoreForCandidate >= 75
                                    ? 'text-green-400'
                                    : aiJobFitAnalysis.matchScoreForCandidate >= 50
                                      ? 'text-yellow-400'
                                      : 'text-red-400'
                                )}
                              >
                                {aiJobFitAnalysis.matchScoreForCandidate}%
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm italic leading-relaxed">
                              {aiJobFitAnalysis.reasoningForCandidate}
                            </p>
                            {aiJobFitAnalysis.weightedScoresForCandidate && (
                              <div className="mt-2 border-slate-700/70 border-t pt-2">
                                <p className="mb-1 font-medium text-sm text-white">
                                  Score Breakdown:
                                </p>
                                <ul className="list-none space-y-0.5 text-slate-300 text-xs">
                                  <li>
                                    Culture Fit:{' '}
                                    <span className="font-semibold text-white">
                                      {aiJobFitAnalysis.weightedScoresForCandidate.cultureFitScore}%
                                    </span>
                                  </li>
                                  <li>
                                    Job Relevance:{' '}
                                    <span className="font-semibold text-white">
                                      {
                                        aiJobFitAnalysis.weightedScoresForCandidate
                                          .jobRelevanceScore
                                      }
                                      %
                                    </span>
                                  </li>
                                  <li>
                                    Growth Opportunity:{' '}
                                    <span className="font-semibold text-white">
                                      {
                                        aiJobFitAnalysis.weightedScoresForCandidate
                                          .growthOpportunityScore
                                      }
                                      %
                                    </span>
                                  </li>
                                  <li>
                                    Job Conditions:{' '}
                                    <span className="font-semibold text-white">
                                      {
                                        aiJobFitAnalysis.weightedScoresForCandidate
                                          .jobConditionFitScore
                                      }
                                      %
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <Separator className="my-3 bg-slate-700" />
                <AccordionItem value="company-qa" className="border-b-0">
                  <AccordionTrigger className="font-semibold text-custom-light-purple-text text-lg hover:no-underline data-[state=open]:text-custom-primary-purple">
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5" /> Ask AI About {company.name}{' '}
                      <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-400/70" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3">
                    {isGuestMode ? (
                      <div className="flex items-center rounded-md border border-red-600 bg-red-900/30 p-3 text-red-400 text-sm italic shadow-sm">
                        <Lock className="mr-2 h-4 w-4" />
                        Sign in to ask the AI questions.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <Textarea
                          id="userCompanyQuestion"
                          placeholder="e.g., What are the main products? What is the team size for this role?"
                          value={userQuestion}
                          onChange={(e) => setUserQuestion(e.target.value)}
                          disabled={isAskingQuestion}
                          className="min-h-[80px] border-slate-600 bg-slate-700 text-sm text-white placeholder-slate-400"
                        />
                        <Button
                          onClick={handleAskQuestion}
                          disabled={isAskingQuestion || !userQuestion.trim()}
                          className="w-full bg-custom-primary-purple text-white hover:bg-custom-primary-purple/80 sm:w-auto"
                        >
                          {isAskingQuestion ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <HelpCircle className="mr-2 h-4 w-4" />
                          )}
                          Ask AI
                        </Button>
                        {isAskingQuestion && !aiAnswer && (
                          <div className="flex items-center py-1.5 text-slate-400 text-sm">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        )}
                        {aiAnswer && (
                          <div className="pt-1.5">
                            <h4 className="mb-1 font-semibold text-md text-white">AI's Answer:</h4>
                            <div className="whitespace-pre-line rounded-md border border-slate-700 bg-slate-700/30 p-3 text-slate-300 text-sm leading-relaxed shadow-sm">
                              {aiAnswer}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Separator className="my-3 bg-slate-700" />
              {company.cultureHighlights && company.cultureHighlights.length > 0 && (
                <section>
                  <h3 className="mb-2 flex items-center font-semibold text-custom-light-purple-text text-lg">
                    <Users2 className="mr-2 h-5 w-5" /> Culture Highlights
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {company.cultureHighlights.map((highlight) => (
                      <Badge
                        key={highlight}
                        variant="outline"
                        className="border-custom-primary-purple/70 bg-custom-primary-purple/10 text-custom-primary-purple text-sm"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
