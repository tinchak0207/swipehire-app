
import type { Company, ProfileRecommenderOutput, CandidateProfileForAI, JobCriteriaForAI, CompanyQAInput } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Briefcase as JobTypeIcon, DollarSign, HelpCircle, Sparkles, Percent, Loader2, Share2, MessageSquare, Info, Brain, ThumbsUp, ThumbsDown, Lock, Video, ListChecks } from 'lucide-react';
import { CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { recommendProfile } from '@/ai/flows/profile-recommender';
import { answerCompanyQuestion } from '@/ai/flows/company-qa-flow';
import { useToast } from '@/hooks/use-toast';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';


interface CompanyCardContentProps {
  company: Company;
  onSwipeAction: (companyId: string, action: 'like' | 'pass' | 'details' | 'share') => void;
  isLiked: boolean;
  isGuestMode?: boolean;
}

const MAX_JOB_DESCRIPTION_LENGTH_CARD = 60;
const MAX_COMPANY_DESCRIPTION_LENGTH_MODAL = 250;
const SWIPE_THRESHOLD = 75;
const MAX_ROTATION = 10; // degrees

export function CompanyCardContent({ company, onSwipeAction, isLiked, isGuestMode }: CompanyCardContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [aiJobFitAnalysis, setAiJobFitAnalysis] = useState<ProfileRecommenderOutput['candidateJobFitAnalysis'] | null>(null);
  const [isLoadingAiAnalysis, setIsLoadingAiAnalysis] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [showFullJobDescriptionInModal, setShowFullJobDescriptionInModal] = useState(false);

  const jobOpening = company.jobOpenings && company.jobOpenings.length > 0 ? company.jobOpenings[0] : null;

  const handleDetailsButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuestMode) {
        toast({ title: "Feature Locked", description: "Sign in to view company details and AI insights.", variant: "default"});
        return;
    }
    setAiJobFitAnalysis(null);
    setIsLoadingAiAnalysis(false);
    setUserQuestion("");
    setAiAnswer(null);
    setIsAskingQuestion(false);
    setShowFullJobDescriptionInModal(false);
    setIsDetailsModalOpen(true);
  };

  const fetchAiAnalysis = useCallback(async () => {
    if (!company || !jobOpening || isGuestMode) {
      if (isGuestMode) setAiJobFitAnalysis({matchScoreForCandidate: 0, reasoningForCandidate: "AI Analysis disabled in Guest Mode.", weightedScoresForCandidate: {cultureFitScore:0, jobRelevanceScore:0, growthOpportunityScore:0, jobConditionFitScore:0}});
      return;
    }
    setIsLoadingAiAnalysis(true);
    setAiJobFitAnalysis(null);

    try {
      const candidateForAI: CandidateProfileForAI = {
        id: 'currentUserProfile',
        role: localStorage.getItem('jobSeekerProfileHeadline') || undefined,
        experienceSummary: localStorage.getItem('jobSeekerExperienceSummary') || undefined,
        skills: (localStorage.getItem('jobSeekerSkills')?.split(',').map(s => s.trim()).filter(s => s)) || [],
        location: localStorage.getItem('userAddressSettings') || localStorage.getItem('userCountrySettings') || undefined,
        desiredWorkStyle: localStorage.getItem('jobSeekerDesiredWorkStyle') || undefined,
        pastProjects: localStorage.getItem('jobSeekerPastProjects') || undefined,
        workExperienceLevel: (localStorage.getItem('jobSeekerExperienceLevel') as WorkExperienceLevel) || WorkExperienceLevel.UNSPECIFIED,
        educationLevel: (localStorage.getItem('jobSeekerEducationLevel') as EducationLevel) || EducationLevel.UNSPECIFIED,
        locationPreference: (localStorage.getItem('jobSeekerLocationPreference') as LocationPreference) || LocationPreference.UNSPECIFIED,
        languages: localStorage.getItem('jobSeekerLanguages')?.split(',').map(s => s.trim()).filter(s => s) || [],
        salaryExpectationMin: parseInt(localStorage.getItem('jobSeekerSalaryMin') || '0') || undefined,
        salaryExpectationMax: parseInt(localStorage.getItem('jobSeekerSalaryMax') || '0') || undefined,
        availability: (localStorage.getItem('jobSeekerAvailability') as Availability) || Availability.UNSPECIFIED,
        jobTypePreference: (localStorage.getItem('jobSeekerJobTypePreference')?.split(',') as JobType[]) || [],
        personalityAssessment: JSON.parse(localStorage.getItem('jobSeekerPersonalityAssessment') || 'null') || [],
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

      const result = await recommendProfile({ candidateProfile: candidateForAI, jobCriteria: jobCriteria });
      if (result.candidateJobFitAnalysis) {
        setAiJobFitAnalysis(result.candidateJobFitAnalysis);
        toast({ title: "AI Fit Analysis Complete!", description: "Your personalized fit score is ready." });
      } else {
        toast({ title: "AI Analysis Note", description: "Could not generate a detailed job fit analysis for this job.", variant: "default" });
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
  }, [company, jobOpening, toast, isDetailsModalOpen, isGuestMode]); 

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    if (!currentVideoRef || !isDetailsModalOpen) return; 

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentVideoRef.play().catch(error => console.log("Autoplay prevented for company video:", error.name, error.message));
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
  }, [isDetailsModalOpen, company.introVideoUrl]);

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
        onSwipeAction(company.id, 'pass');
      } else { 
        onSwipeAction(company.id, 'like');
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
  
  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isGuestMode) {
      toast({ title: "Feature Locked", description: "Sign in to share profiles.", variant: "default"});
      return;
    }
    const shareText = `Check out this job opportunity at ${company.name}: ${jobOpening?.title || 'Exciting Role'} on SwipeHire!`;
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://swipehire.example.com'; 

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SwipeHire: ${company.name} - ${jobOpening?.title || 'Job'}`,
          text: shareText,
          url: shareUrl,
        });
        toast({ title: "Shared!", description: "Job opportunity shared successfully." });
      } catch (error) {
        console.error('Error sharing:', error);
        // toast({ title: "Share Failed", description: "Could not share this job.", variant: "destructive" });
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} See more at: ${shareUrl}`);
        toast({ title: "Copied to Clipboard!", description: "Job link copied." });
      } catch (err)
      {
        console.error('Failed to copy to clipboard: ', err);
        toast({ title: "Copy Failed", description: "Could not copy link to clipboard.", variant: "destructive" });
      }
    }
  };

  const jobDescriptionForCard = jobOpening?.description || "";
  const truncatedJobDescriptionForCard = jobDescriptionForCard.length > MAX_JOB_DESCRIPTION_LENGTH_CARD 
    ? jobDescriptionForCard.substring(0, MAX_JOB_DESCRIPTION_LENGTH_CARD) + "..."
    : jobDescriptionForCard;

  const jobDescriptionForModal = jobOpening?.description || "No job description available.";
  const displayedJobDescriptionInModal = showFullJobDescriptionInModal 
    ? jobDescriptionForModal
    : jobDescriptionForModal.substring(0, MAX_COMPANY_DESCRIPTION_LENGTH_MODAL) + (jobDescriptionForModal.length > MAX_COMPANY_DESCRIPTION_LENGTH_MODAL ? "..." : "");

  const ActionButton = ({
    action,
    Icon,
    label,
    className: extraClassName,
    activeClassName,
    isSpecificActionLiked
  }: {
    action: 'like' | 'pass' | 'details' | 'share';
    Icon: React.ElementType;
    label: string;
    className?: string;
    activeClassName?: string;
    isSpecificActionLiked?: boolean;
  }) => {
    const baseClasses = "flex-col h-auto py-1";
    const guestClasses = "bg-red-400 text-white cursor-not-allowed hover:bg-red-500";
    const regularClasses = isSpecificActionLiked && action === 'like' ? cn(activeClassName, 'fill-green-500 text-green-500') : extraClassName;
    const effectiveOnClick = action === 'details' ? handleDetailsButtonClick : (e: React.MouseEvent) => { e.stopPropagation(); if (!isGuestMode) onSwipeAction(company.id, action); };


    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(baseClasses, isGuestMode ? guestClasses : regularClasses)}
              onClick={action === 'share' && !isGuestMode ? handleShareClick : effectiveOnClick}
              disabled={isGuestMode && action !== 'details'}
              aria-label={`${label} ${company.name}`}
              data-no-drag="true"
            >
              {isGuestMode ? <Lock className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5" /> : <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 mb-0.5", isSpecificActionLiked && action === 'like' ? 'fill-green-500 text-green-500' : '')} />}
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
        <div className="relative w-full bg-muted shrink-0 h-[60%] max-h-[calc(100%-200px)]">
          {company.introVideoUrl ? (
            <video
              src={company.introVideoUrl}
              muted
              autoPlay
              loop
              playsInline
              className="w-full h-full object-cover bg-black pointer-events-none"
              poster={company.logoUrl || `https://placehold.co/600x360.png?text=${encodeURIComponent(company.name)}`}
              data-ai-hint="company video"
              data-no-drag="true"
            />
          ) : company.logoUrl ? (
            <Image
              src={company.logoUrl}
              alt={company.name + " logo"}
              fill
              className="object-contain p-4" 
              data-ai-hint={company.dataAiHint || "company logo"}
              priority
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center" data-ai-hint="company building">
              <Building className="w-20 h-20 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 flex-grow flex flex-col h-[40%] overflow-hidden"> 
          <CardHeader className="p-0 mb-1.5 sm:mb-2">
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

          <CardContent className="p-0 space-y-1 text-xs sm:text-sm flex-grow min-h-0 overflow-hidden">
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
                <span className="truncate">{jobOpening?.jobType}</span>
              </div>
            )}
             {jobOpening?.description && (
                <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                    {truncatedJobDescriptionForCard}
                </p>
            )}
          </CardContent>
            
          <CardFooter className="p-2 grid grid-cols-4 gap-1 sm:gap-2 border-t bg-card shrink-0 no-swipe-area mt-auto">
            <ActionButton action="pass" Icon={ThumbsDown} label="Pass" className="hover:bg-destructive/10 text-destructive hover:text-destructive" />
            <ActionButton action="details" Icon={Info} label="Details" className="hover:bg-blue-500/10 text-blue-500 hover:text-blue-600" />
            <ActionButton action="like" Icon={ThumbsUp} label="Apply" className={isLiked ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'} activeClassName="text-green-600 hover:bg-green-500/10" isSpecificActionLiked={isLiked} />
            <ActionButton action="share" Icon={Share2} label="Share" className="hover:bg-gray-500/10 text-muted-foreground hover:text-gray-600" />
          </CardFooter>
        </div>
      </div>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 sm:p-6 border-b">
            <DialogTitle className="text-2xl text-primary">
              {jobOpening?.title || "Company Details"} at {company.name}
            </DialogTitle>
            <CardDescription className="truncate">{company.industry}</CardDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0 p-4 sm:p-6 overscroll-y-contain no-scrollbar">
            <div className="space-y-6">
              {company.introVideoUrl && (
                <div className="relative w-full bg-muted aspect-video rounded-lg overflow-hidden shadow-md">
                  <video
                    ref={videoRef}
                    src={company.introVideoUrl}
                    controls={!isGuestMode}
                    muted={false}
                    autoPlay={false} 
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    poster={company.logoUrl || `https://placehold.co/600x360.png?text=${encodeURIComponent(company.name)}`}
                    data-ai-hint="company introduction video"
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center">
                    <Building className="mr-2 h-5 w-5 text-primary" /> About {company.name}
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{company.description}</p>
              </div>

              {jobOpening && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center">
                        <JobTypeIcon className="mr-2 h-5 w-5 text-primary" /> Job Description: {jobOpening.title}
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {displayedJobDescriptionInModal}
                      {jobDescriptionForModal.length > MAX_COMPANY_DESCRIPTION_LENGTH_MODAL && (
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
                  </div>
                  
                  <div className="pt-3">
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                        <ListChecks className="mr-2 h-5 w-5 text-primary" /> Key Job Details
                    </h3>
                    <div className="space-y-1 text-sm p-3 bg-muted/30 rounded-md">
                      {jobOpening.location && <p><MapPin className="inline h-4 w-4 mr-2 text-muted-foreground" /><strong>Location:</strong> {jobOpening.location}</p>}
                      {jobOpening.salaryRange && <p><DollarSign className="inline h-4 w-4 mr-2 text-muted-foreground" /><strong>Salary:</strong> {jobOpening.salaryRange}</p>}
                      {jobOpening.jobType && <p><JobTypeIcon className="inline h-4 w-4 mr-2 text-muted-foreground" /><strong>Type:</strong> {jobOpening.jobType}</p>}
                      {jobOpening.tags && jobOpening.tags.length > 0 && (
                        <div className="flex items-start pt-1">
                            <Badge variant="outline" className="border-none p-0 mr-1 mt-0.5"><Sparkles className="inline h-4 w-4 mr-1 text-muted-foreground" /></Badge>
                            <strong className="mr-1 self-start">Tags:</strong>
                            <div className="flex flex-wrap gap-1">
                                {jobOpening.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Separator className="my-4" />

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-primary" /> AI: How This Job Fits You
                </h3>
                {isGuestMode ? (
                   <div className="text-sm text-red-500 italic flex items-center p-3 border border-red-300 bg-red-50 rounded-md">
                       <Lock className="h-4 w-4 mr-2"/>Sign in to get your personalized AI Fit Analysis.
                   </div>
                ) : (
                  <>
                    <Button onClick={fetchAiAnalysis} disabled={isLoadingAiAnalysis || !!aiJobFitAnalysis} className="mb-3 w-full sm:w-auto">
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
                      <div className="space-y-1 p-3 bg-muted/50 rounded-md">
                        <div className="text-md text-foreground">
                          <span className="font-semibold">Your Fit Score:</span>
                          <span className={cn(
                            "ml-1.5 font-bold text-lg",
                            aiJobFitAnalysis.matchScoreForCandidate >= 75 ? 'text-green-600' :
                            aiJobFitAnalysis.matchScoreForCandidate >= 50 ? 'text-yellow-600' : 'text-red-600'
                            )}>
                            {aiJobFitAnalysis.matchScoreForCandidate}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground italic">{aiJobFitAnalysis.reasoningForCandidate}</p>
                        {aiJobFitAnalysis.weightedScoresForCandidate && (
                            <div className="text-xs pt-2">
                                <p><strong>Breakdown:</strong></p>
                                <ul className="list-disc list-inside pl-1 text-muted-foreground">
                                    <li>Culture: {aiJobFitAnalysis.weightedScoresForCandidate.cultureFitScore}%</li>
                                    <li>Relevance: {aiJobFitAnalysis.weightedScoresForCandidate.jobRelevanceScore}%</li>
                                    <li>Growth: {aiJobFitAnalysis.weightedScoresForCandidate.growthOpportunityScore}%</li>
                                    <li>Conditions: {aiJobFitAnalysis.weightedScoresForCandidate.jobConditionFitScore}%</li>
                                </ul>
                            </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {company.cultureHighlights && company.cultureHighlights.length > 0 && (
                <>
                <Separator className="my-4" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-primary" /> Culture Highlights
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {company.cultureHighlights.map((highlight) => (
                      <Badge key={highlight} variant="secondary" className="text-sm">{highlight}</Badge>
                    ))}
                  </div>
                </div>
                </>
              )}

              <Separator className="my-4" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" /> Ask AI About {company.name}
                </h3>
                {isGuestMode ? (
                    <div className="text-sm text-red-500 italic flex items-center p-3 border border-red-300 bg-red-50 rounded-md">
                        <Lock className="h-4 w-4 mr-2"/>Sign in to ask the AI questions about this company.
                    </div>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      id="userCompanyQuestion"
                      placeholder="e.g., What are the main products? What is the team size?"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      disabled={isAskingQuestion}
                      className="min-h-[80px]"
                    />
                    <Button onClick={handleAskQuestion} disabled={isAskingQuestion || !userQuestion.trim()} className="w-full sm:w-auto">
                      {isAskingQuestion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HelpCircle className="mr-2 h-4 w-4" />}
                      Ask AI
                    </Button>
                    {isAskingQuestion && (
                      <div className="flex items-center text-sm text-muted-foreground py-2">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    )}
                    {aiAnswer && (
                      <div className="pt-2">
                        <h4 className="font-semibold text-sm mb-1">AI's Answer:</h4>
                        <div className="p-3 border rounded-md bg-muted/50 text-sm text-foreground whitespace-pre-line">
                          {aiAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 sm:p-6 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
