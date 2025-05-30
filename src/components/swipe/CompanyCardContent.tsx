
import type { Company, ProfileRecommenderOutput, CandidateProfileForAI, JobCriteriaForAI, CompanyQAInput, UserAIWeights, JobSeekerPerspectiveWeights } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Briefcase as JobTypeIcon, DollarSign, HelpCircle, Sparkles, Percent, Loader2, Share2, MessageSquare, Info, Brain, ThumbsUp, ThumbsDown, Lock, Video, ListChecks, ChevronsUpDown, Users2, CalendarDays, X as CloseIcon, Link as LinkIcon, Mail, Twitter, Linkedin } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { recommendProfile } from '@/ai/flows/profile-recommender';
import { answerCompanyQuestion } from '@/ai/flows/company-qa-flow';
import { useToast } from '@/hooks/use-toast';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as ShadDialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


interface CompanyCardContentProps {
  company: Company;
  onSwipeAction: (companyId: string, action: 'like' | 'pass' | 'details') => void;
  isLiked: boolean;
  isGuestMode?: boolean;
}

const MAX_JOB_DESCRIPTION_LENGTH_CARD = 60;
const MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL = 200;
const MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL = 200;
const SWIPE_THRESHOLD = 75;
const MAX_ROTATION = 10;

type CandidateJobFitAnalysis = ProfileRecommenderOutput['candidateJobFitAnalysis'];

// Conceptual analytics helper
const incrementAnalytic = (key: string) => {
  if (typeof window !== 'undefined') {
    const currentCount = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (currentCount + 1).toString());
  }
};


export function CompanyCardContent({ company, onSwipeAction, isLiked, isGuestMode }: CompanyCardContentProps) {
  const cardContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [aiJobFitAnalysis, setAiJobFitAnalysis] = useState<CandidateJobFitAnalysis | null>(null);
  const [isLoadingAiAnalysis, setIsLoadingAiAnalysis] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [showFullJobDescriptionInModal, setShowFullJobDescriptionInModal] = useState(false);
  const [showFullCompanyDescriptionInModal, setShowFullCompanyDescriptionInModal] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); 


  const jobOpening = company.jobOpenings && company.jobOpenings.length > 0 ? company.jobOpenings[0] : null;

  const handleDetailsButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAiJobFitAnalysis(null);
    setIsLoadingAiAnalysis(false);
    setUserQuestion("");
    setAiAnswer(null);
    setIsAskingQuestion(false);
    setShowFullJobDescriptionInModal(false);
    setShowFullCompanyDescriptionInModal(false);
    setIsDetailsModalOpen(true);
  };

  const fetchAiAnalysis = useCallback(async () => {
    if (!company || !jobOpening || isGuestMode || !isDetailsModalOpen) {
      if (isGuestMode) {
        setAiJobFitAnalysis({matchScoreForCandidate: 0, reasoningForCandidate: "AI Analysis disabled in Guest Mode.", weightedScoresForCandidate: {cultureFitScore:0, jobRelevanceScore:0, growthOpportunityScore:0, jobConditionFitScore:0}});
      }
      return;
    }
    setIsLoadingAiAnalysis(true);
    setAiJobFitAnalysis(null);

    try {
      const candidateRole = localStorage.getItem('jobSeekerProfileHeadline') || 'Software Developer';
      const candidateExpSummary = localStorage.getItem('jobSeekerExperienceSummary') || 'Experienced in web technologies.';
      const candidateSkillsString = localStorage.getItem('jobSeekerSkills') || 'React,Node.js';
      const candidateSkills = candidateSkillsString ? candidateSkillsString.split(',').map(s => s.trim()).filter(s => s) : ['React', 'Node.js'];
      const candidateDesiredWorkStyle = localStorage.getItem('jobSeekerDesiredWorkStyle') || 'Remote, Collaborative';


      const candidateForAI: CandidateProfileForAI = {
        id: 'currentUserProfile',
        role: candidateRole,
        experienceSummary: candidateExpSummary,
        skills: candidateSkills,
        desiredWorkStyle: candidateDesiredWorkStyle,
        workExperienceLevel: WorkExperienceLevel.MID_LEVEL,
        educationLevel: EducationLevel.UNIVERSITY,
        locationPreference: LocationPreference.REMOTE,
      };

      const jobCriteria: JobCriteriaForAI = {
        title: jobOpening.title,
        description: jobOpening.description,
        requiredSkills: jobOpening.tags || [],
        requiredExperienceLevel: jobOpening.requiredExperienceLevel || WorkExperienceLevel.UNSPECIFIED,
        requiredEducationLevel: jobOpening.requiredEducationLevel || EducationLevel.UNSPECIFIED,
        workLocationType: jobOpening.workLocationType || LocationPreference.UNSPECIFIED,
        jobLocation: jobOpening.location || undefined,
        requiredLanguages: jobOpening.requiredLanguages || [],
        salaryMin: jobOpening.salaryMin,
        salaryMax: jobOpening.salaryMax,
        jobType: jobOpening.jobType || JobType.UNSPECIFIED,
        companyCultureKeywords: jobOpening.companyCultureKeywords || company.cultureHighlights || [],
        companyIndustry: company.industry || undefined,
      };
      
      let userAIWeights: UserAIWeights | undefined = undefined;
      const storedWeights = localStorage.getItem('userJobSeekerAIWeights');
      if (storedWeights) {
        try {
          const parsedJobSeekerWeights: JobSeekerPerspectiveWeights = JSON.parse(storedWeights);
          if (Object.values(parsedJobSeekerWeights).reduce((sum, val) => sum + val, 0) === 100) {
            userAIWeights = { jobSeekerPerspective: parsedJobSeekerWeights };
          }
        } catch (e) { console.warn("Could not parse userJobSeekerAIWeights from localStorage", e); }
      }


      const result = await recommendProfile({ 
          candidateProfile: candidateForAI, 
          jobCriteria: jobCriteria,
          userAIWeights: userAIWeights 
      });
      if (result.candidateJobFitAnalysis) {
        setAiJobFitAnalysis(result.candidateJobFitAnalysis);
      } else {
        setAiJobFitAnalysis({
            matchScoreForCandidate: 0,
            reasoningForCandidate: "AI analysis did not provide specific job-to-candidate fit details.",
            weightedScoresForCandidate: {
                cultureFitScore: 0,
                jobRelevanceScore: 0,
                growthOpportunityScore: 0,
                jobConditionFitScore: 0,
            }
        });
      }
    } catch (error: any) {
      console.error("Error fetching AI job fit analysis for company " + company.name + ":", error);
      toast({ title: "AI Analysis Error", description: `Failed to get AI insights. ${error.message || 'Ensure your profile is up to date.'}`, variant: "destructive" });
       setAiJobFitAnalysis({
            matchScoreForCandidate: 0,
            reasoningForCandidate: "Error during AI analysis.",
            weightedScoresForCandidate: {
                cultureFitScore: 0,
                jobRelevanceScore: 0,
                growthOpportunityScore: 0,
                jobConditionFitScore: 0,
            }
        });
    } finally {
      setIsLoadingAiAnalysis(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company.id, company.name, company.industry, company.description, company.cultureHighlights, jobOpening?.title, jobOpening?.description, jobOpening?.tags, jobOpening?.requiredExperienceLevel, jobOpening?.requiredEducationLevel, jobOpening?.workLocationType, jobOpening?.location, jobOpening?.requiredLanguages, jobOpening?.salaryMin, jobOpening?.salaryMax, jobOpening?.jobType, isDetailsModalOpen, isGuestMode, toast]);

  useEffect(() => {
      if(isDetailsModalOpen && !isGuestMode && !aiJobFitAnalysis && !isLoadingAiAnalysis) {
          fetchAiAnalysis();
      } else if (isGuestMode && isDetailsModalOpen) {
        setAiJobFitAnalysis({matchScoreForCandidate: 0, reasoningForCandidate: "AI Analysis disabled in Guest Mode.", weightedScoresForCandidate: {cultureFitScore:0, jobRelevanceScore:0, growthOpportunityScore:0, jobConditionFitScore:0}});
        setIsLoadingAiAnalysis(false);
      }
  }, [isDetailsModalOpen, isGuestMode, aiJobFitAnalysis, isLoadingAiAnalysis, fetchAiAnalysis]);

  const handleLocalSwipeAction = (actionType: 'like' | 'pass' | 'details') => {
    if (actionType === 'like') {
      incrementAnalytic('analytics_company_likes');
    } else if (actionType === 'pass') {
      incrementAnalytic('analytics_company_passes');
    }
    onSwipeAction(company.id, actionType);
  };


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGuestMode) return;
    const targetElement = e.target as HTMLElement;
    if (targetElement.closest('video[controls], button, a, [data-no-drag="true"], .no-swipe-area, [role="dialog"], input, textarea, [role="listbox"], [role="option"]')) {
      if (targetElement.tagName === 'VIDEO' && targetElement.hasAttribute('controls')) {
        const video = targetElement as HTMLVideoElement;
        const rect = video.getBoundingClientRect();
        if (e.clientY > rect.bottom - 40) {
            return;
        }
      } else if (targetElement.closest('button, a, [data-no-drag="true"], [role="dialog"], input, textarea, [role="listbox"], [role="option"]')) {
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
        handleLocalSwipeAction('pass');
      } else {
        handleLocalSwipeAction('like');
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

  const handleAskQuestion = async () => {
    if (!userQuestion.trim() || isGuestMode) {
      if (isGuestMode) toast({title: "Feature Locked", description: "Sign in to ask AI questions.", variant: "default"});
      else toast({ title: "Please enter a question", variant: "destructive" });
      return;
    }
    setIsAskingQuestion(true);
    setAiAnswer(null);
    try {
      const companyContext: CompanyQAInput = {
        companyName: company.name,
        companyDescription: company.description,
        companyIndustry: company.industry,
        companyCultureHighlights: company.cultureHighlights,
        jobOpeningsSummary: company.jobOpenings?.map(j => `${j.title} (${j.jobType || 'N/A'})`).join('; ') || "No specific job openings listed.",
        userQuestion: userQuestion,
      };
      const result = await answerCompanyQuestion(companyContext);
      setAiAnswer(result.aiAnswer);
    } catch (error) {
      console.error("Error asking company question:", error);
      setAiAnswer("Sorry, I encountered an error trying to answer your question. Please try again.");
      toast({ title: "Q&A Error", description: "Could not get an answer from the AI.", variant: "destructive" });
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuestMode) {
      toast({ title: "Feature Locked", description: "Sign in to share job postings.", variant: "default" });
      return;
    }
    // DropdownMenuTrigger handles opening
  };
  
  const handleShareAction = (action: 'copy' | 'email' | 'linkedin' | 'twitter') => {
    if (isGuestMode) {
      toast({ title: "Feature Locked", description: "Sign in to share job postings.", variant: "default" });
      return;
    }
    const jobUrl = typeof window !== 'undefined' ? window.location.origin : 'https://swipehire-app.com'; 
    const jobTitle = jobOpening?.title || 'Opportunity';
    const shareText = `Check out this job opening at ${company.name}: ${jobTitle}. Visit ${jobUrl}`;
    const emailSubject = `Job Opportunity at ${company.name}: ${jobTitle}`;
    const emailBody = `I found this job opportunity on SwipeHire and thought you might be interested:\n\nCompany: ${company.name}\nJob: ${jobTitle}\n\nLearn more at: ${jobUrl}\n\nShared from SwipeHire.`;

    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(jobUrl)
          .then(() => toast({ title: "Link Copied!", description: "Job link copied to clipboard." }))
          .catch(() => toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" }));
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}&title=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`, '_blank', 'noopener,noreferrer');
        break;
    }
    // DropdownMenu handles closing
  };


  const jobDescriptionForCard = jobOpening?.description || "";
  const truncatedJobDescriptionForCard = jobDescriptionForCard.length > MAX_JOB_DESCRIPTION_LENGTH_CARD
    ? jobDescriptionForCard.substring(0, MAX_JOB_DESCRIPTION_LENGTH_CARD) + "..."
    : jobDescriptionForCard;

  const companyDescriptionForModal = company.description;
  const displayedCompanyDescriptionInModal = showFullCompanyDescriptionInModal || companyDescriptionForModal.length <= MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL
    ? companyDescriptionForModal
    : companyDescriptionForModal.substring(0, MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL) + "...";

  const jobDescriptionForModal = jobOpening?.description || "No job description available.";
  const displayedJobDescriptionInModal = showFullJobDescriptionInModal || jobDescriptionForModal.length <= MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL
    ? jobDescriptionForModal
    : jobDescriptionForModal.substring(0, MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL) + "...";


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
    const baseClasses = "flex-col h-auto py-1 text-xs sm:text-sm";
    const guestClasses = "bg-red-400 text-white cursor-not-allowed hover:bg-red-500";
    
    const effectiveOnClick = action === 'details' 
        ? handleDetailsButtonClick 
        : (e: React.MouseEvent) => { 
            e.stopPropagation(); 
            if (!isGuestMode) {
                if (action !== 'share_trigger') {
                    handleLocalSwipeAction(action as 'like' | 'pass' | 'details');
                }
            } else if (isGuestMode && (action === 'like' || action === 'pass' || action === 'share_trigger')) {
                toast({ title: "Feature Locked", description: "Sign in to interact.", variant: "default" });
            } else if (isGuestMode && action === 'details') {
                 handleDetailsButtonClick(e); 
            }
        };

    const buttonElement = (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            baseClasses, 
            isGuestMode && (action === 'like' || action === 'pass' || action === 'share_trigger') ? guestClasses : extraClassName
            )}
          onClick={action !== 'share_trigger' ? effectiveOnClick : undefined}
          disabled={isGuestMode && (action === 'like' || action === 'pass' || action === 'share_trigger')}
          aria-label={`${label} ${company.name}`}
          data-no-drag="true"
          data-modal-trigger={action === 'details' ? "true" : undefined}
        >
          {isGuestMode && (action === 'like' || action === 'pass' || action === 'share_trigger') ? <Lock className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5" /> : <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 mb-0.5", isSpecificActionLiked && action === 'like' ? 'fill-green-500 text-green-500' : '')} />}
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
                         {isGuestMode && (
                            <TooltipContent side="bottom" className="bg-red-500 text-white border-red-600">
                                <p>Sign in to share</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
                <DropdownMenuContent align="end" className="w-40" data-no-drag="true">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('copy'); }} data-no-drag="true">
                        <LinkIcon className="mr-2 h-4 w-4" /> Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('email'); }} data-no-drag="true">
                        <Mail className="mr-2 h-4 w-4" /> Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('linkedin'); }} data-no-drag="true">
                        <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('twitter'); }} data-no-drag="true">
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
          {isGuestMode && (action === 'like' || action === 'pass') && (
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
        <div className="relative w-full bg-muted shrink-0 h-[60%]">
          {company.logoUrl ? (
            <Image
              src={company.logoUrl}
              alt={company.name + " logo"}
              fill
              className="object-contain p-4" // Ensure logo is contained
              data-ai-hint={company.dataAiHint || "company logo"}
              priority
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center" data-ai-hint="company building">
              <Building className="w-20 h-20 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 p-3 sm:p-4 flex flex-col">
            <div className="flex-1 min-h-0 space-y-1 text-xs sm:text-sm">
                <CardHeader className="p-0 mb-1">
                    <div className="flex items-start justify-between">
                        <div className="flex-grow min-w-0">
                            <CardTitle className="text-lg sm:text-xl font-bold text-primary truncate">{company.name}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm text-muted-foreground truncate">{company.industry}</CardDescription>
                        </div>
                    </div>
                    {jobOpening && (
                        <p className="text-md sm:text-lg font-semibold text-foreground mt-0.5 sm:mt-1 line-clamp-1">{jobOpening.title}</p>
                    )}
                </CardHeader>

                <div className="space-y-0.5">
                    {jobOpening?.location && (
                    <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                        <span className="truncate">{jobOpening.location}</span>
                    </div>
                    )}
                    {(jobOpening?.salaryRange) && (
                    <div className="flex items-center text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                        <span className="truncate">{jobOpening?.salaryRange}</span>
                    </div>
                    )}
                    {(jobOpening?.jobType) && (
                    <div className="flex items-center text-muted-foreground">
                        <JobTypeIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                        <span className="truncate">{jobOpening?.jobType.replace(/_/g, ' ')}</span>
                    </div>
                    )}
                    {jobOpening?.description && (
                        <p className="text-muted-foreground text-xs pt-0.5 line-clamp-2">
                            {truncatedJobDescriptionForCard}
                        </p>
                    )}
                </div>
            </div>

            <CardFooter className="p-0 pt-2 sm:pt-3 grid grid-cols-4 gap-1 sm:gap-2 border-t bg-card shrink-0 no-swipe-area mt-auto">
                <ActionButton action="pass" Icon={ThumbsDown} label="Pass" className="hover:bg-destructive/10 text-destructive hover:text-destructive" />
                <ActionButton action="details" Icon={Info} label="Details" className="hover:bg-blue-500/10 text-blue-500 hover:text-blue-600" />
                <ActionButton action="like" Icon={ThumbsUp} label="Apply" className={isLiked ? 'text-green-600 fill-green-500 hover:bg-green-500/10' : 'text-muted-foreground hover:text-green-600 hover:bg-green-500/10'} isSpecificActionLiked={isLiked} />
                <ActionButton action="share_trigger" Icon={Share2} label="Share" className="hover:bg-gray-500/10 text-muted-foreground hover:text-gray-600" />
            </CardFooter>
        </div>
      </div>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col p-0 bg-background">
           <DialogHeader className="p-4 sm:p-6 border-b sticky top-0 bg-background z-10 pb-3">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-primary">
              {jobOpening?.title || "Opportunity Details"} at {company.name}
            </DialogTitle>
            <ShadDialogDescription className="text-sm text-muted-foreground">
               {company.industry}
            </ShadDialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0 bg-background">
            <div className="p-4 sm:p-6 space-y-4 pt-3">
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-1.5 flex items-center">
                    <Building className="mr-2 h-5 w-5 text-primary" /> About {company.name}
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {displayedCompanyDescriptionInModal}
                  {companyDescriptionForModal.length > MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL && (
                      <Button
                          variant="link"
                          size="sm"
                          onClick={(e) => {e.stopPropagation(); setShowFullCompanyDescriptionInModal(!showFullCompanyDescriptionInModal);}}
                          className="text-primary hover:underline p-0 h-auto ml-1 text-xs font-semibold"
                          data-no-drag="true"
                      >
                          {showFullCompanyDescriptionInModal ? "Read less" : "Read more"}
                      </Button>
                  )}
                </p>
              </section>
              <Separator className="my-3" />

              {jobOpening && (
                <>
                  <section>
                    <h3 className="text-lg font-semibold text-foreground mb-1.5 flex items-center">
                        <JobTypeIcon className="mr-2 h-5 w-5 text-primary" /> Job Description: {jobOpening.title}
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {displayedJobDescriptionInModal}
                      {jobDescriptionForModal.length > MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL && (
                          <Button
                              variant="link"
                              size="sm"
                              onClick={(e) => {e.stopPropagation(); setShowFullJobDescriptionInModal(!showFullJobDescriptionInModal);}}
                              className="text-primary hover:underline p-0 h-auto ml-1 text-xs font-semibold"
                              data-no-drag="true"
                          >
                              {showFullJobDescriptionInModal ? "Read less" : "Read more"}
                          </Button>
                      )}
                    </p>
                  </section>
                  <Separator className="my-3" />

                  <section>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                        <ListChecks className="mr-2 h-5 w-5 text-primary" /> Key Job Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm p-3 border rounded-lg bg-muted/30 shadow-sm">
                        {jobOpening.location && <div className="flex items-start"><MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0" /><span className="font-medium text-foreground mr-1">Location:</span> <span className="text-muted-foreground">{jobOpening.location}</span></div>}
                        {jobOpening.salaryRange && <div className="flex items-start"><DollarSign className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0" /><span className="font-medium text-foreground mr-1">Salary:</span> <span className="text-muted-foreground">{jobOpening.salaryRange}</span></div>}
                        {jobOpening.jobType && <div className="flex items-start"><JobTypeIcon className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0" /><span className="font-medium text-foreground mr-1">Type:</span> <span className="text-muted-foreground">{jobOpening.jobType.replace(/_/g, ' ')}</span></div>}
                        {jobOpening.requiredExperienceLevel && jobOpening.requiredExperienceLevel !== WorkExperienceLevel.UNSPECIFIED && <div className="flex items-start"><CalendarDays className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0" /><span className="font-medium text-foreground mr-1">Experience:</span> <span className="text-muted-foreground">{jobOpening.requiredExperienceLevel.replace(/_/g, ' ')}</span></div>}
                        {jobOpening.tags && jobOpening.tags.length > 0 && (
                        <div className="flex items-start sm:col-span-2">
                            <Sparkles className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0" />
                            <span className="font-medium text-foreground mr-1 self-start">Skills/Tags:</span>
                            <div className="flex flex-wrap gap-1">
                                {jobOpening.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                      )}
                    </div>
                  </section>
                   <Separator className="my-3" />
                </>
              )}


              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-primary" /> AI: How This Job Fits You
                </h3>
                 <p className="text-xs text-muted-foreground italic mb-2">
                  Our AI considers how this job aligns with your profile by looking at factors like: skill and experience match, desired work style vs. company culture, growth opportunities, and job condition alignment (salary, location). The final score reflects weights you can customize in Settings.
                </p>
                {isGuestMode ? (
                  <div className="text-sm text-red-500 italic flex items-center p-3 border border-red-300 bg-red-50 rounded-md shadow-sm">
                      <Lock className="h-4 w-4 mr-2"/>Sign in to get your personalized AI Fit Analysis.
                  </div>
                ) : (
                  <>
                    <Button onClick={fetchAiAnalysis} disabled={isLoadingAiAnalysis || !!aiJobFitAnalysis} className="mb-2.5 w-full sm:w-auto">
                      {isLoadingAiAnalysis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      {aiJobFitAnalysis ? "Analysis Complete" : "Analyze My Fit for this Job"}
                    </Button>
                    {isLoadingAiAnalysis && !aiJobFitAnalysis &&(
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Assessing fit...</span>
                      </div>
                    )}
                    {aiJobFitAnalysis && !isLoadingAiAnalysis && (
                      <div className="space-y-2 p-3 border rounded-lg bg-muted/50 shadow-sm">
                        <div className="flex items-baseline">
                          <span className="text-md font-semibold text-foreground">Your Fit Score:</span>
                          <span className={cn(
                            "ml-1.5 font-bold text-xl",
                            aiJobFitAnalysis.matchScoreForCandidate >= 75 ? 'text-green-600' :
                            aiJobFitAnalysis.matchScoreForCandidate >= 50 ? 'text-yellow-600' : 'text-red-600'
                            )}>
                            {aiJobFitAnalysis.matchScoreForCandidate}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground italic leading-relaxed">{aiJobFitAnalysis.reasoningForCandidate}</p>
                        {aiJobFitAnalysis.weightedScoresForCandidate && (
                            <div className="pt-2 mt-2 border-t border-border/70">
                                <p className="font-medium text-foreground text-sm mb-1">Score Breakdown (Individual Assessments):</p>
                                <ul className="list-none space-y-0.5 text-xs text-muted-foreground">
                                    <li>Culture Fit: <span className="font-semibold text-foreground">{aiJobFitAnalysis.weightedScoresForCandidate.cultureFitScore}%</span></li>
                                    <li>Job Relevance: <span className="font-semibold text-foreground">{aiJobFitAnalysis.weightedScoresForCandidate.jobRelevanceScore}%</span></li>
                                    <li>Growth Opportunity: <span className="font-semibold text-foreground">{aiJobFitAnalysis.weightedScoresForCandidate.growthOpportunityScore}%</span></li>
                                    <li>Job Conditions: <span className="font-semibold text-foreground">{aiJobFitAnalysis.weightedScoresForCandidate.jobConditionFitScore}%</span></li>
                                </ul>
                            </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </section>
              <Separator className="my-3" />

              {company.cultureHighlights && company.cultureHighlights.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                    <Users2 className="mr-2 h-5 w-5 text-primary" /> Culture Highlights
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {company.cultureHighlights.map((highlight) => (
                      <Badge key={highlight} variant="outline" className="text-sm border-primary/50 text-primary bg-primary/5">{highlight}</Badge>
                    ))}
                  </div>
                </section>
              )}
              <Separator className="my-3" />

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" /> Ask AI About {company.name}
                </h3>
                {isGuestMode ? (
                    <div className="text-sm text-red-500 italic flex items-center p-3 border border-red-300 bg-red-50 rounded-md shadow-sm">
                        <Lock className="h-4 w-4 mr-2"/>Sign in to ask the AI questions about this company.
                    </div>
                ) : (
                  <div className="space-y-2.5">
                    <Textarea
                      id="userCompanyQuestion"
                      placeholder="e.g., What are the main products? What is the team size for this role?"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      disabled={isAskingQuestion}
                      className="min-h-[80px] text-sm"
                    />
                    <Button onClick={handleAskQuestion} disabled={isAskingQuestion || !userQuestion.trim()} className="w-full sm:w-auto">
                      {isAskingQuestion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HelpCircle className="mr-2 h-4 w-4" />}
                      Ask AI
                    </Button>
                    {isAskingQuestion && !aiAnswer && (
                      <div className="flex items-center text-sm text-muted-foreground py-1.5">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    )}
                    {aiAnswer && (
                      <div className="pt-1.5">
                        <h4 className="font-semibold text-md text-foreground mb-1">AI's Answer:</h4>
                        <div className="p-3 border rounded-md bg-muted/50 text-sm text-foreground whitespace-pre-line leading-relaxed shadow-sm">
                          {aiAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
