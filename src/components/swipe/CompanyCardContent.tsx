
import type { Company, ProfileRecommenderOutput, CandidateProfileForAI, JobCriteriaForAI, CompanyQAInput, UserAIWeights, JobSeekerPerspectiveWeights, Candidate } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Briefcase as BriefcaseIcon, DollarSign, HelpCircle, Sparkles, Percent, Loader2, Share2, MessageSquare, Info, Brain, ThumbsUp, ThumbsDown, Lock, Video, ListChecks, ChevronsUpDown, Users2, CalendarDays, X, Link as LinkIcon, Mail, Twitter, Linkedin, Eye, Clock, Tag, Heart } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { recommendProfile } from '@/ai/flows/profile-recommender';
import { answerCompanyQuestion } from '@/ai/flows/company-qa-flow';
import { useToast } from '@/hooks/use-toast';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle as ShadDialogTitle, DialogDescription as ShadDialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from '@/components/ui/progress';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';


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
    const currentCount = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (currentCount + 1).toString());
  }
};

export function CompanyCardContent({ company, onSwipeAction, isLiked, isGuestMode }: CompanyCardContentProps) {
  const cardRootRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { mongoDbUserId } = useUserPreferences(); 

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
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);
  const [currentUserProfileForAI, setCurrentUserProfileForAI] = useState<CandidateProfileForAI | null>(null);

  const jobOpening = company.jobOpenings && company.jobOpenings.length > 0 ? company.jobOpenings[0] : null;
  const jobMatchPercentage = company.jobMatchPercentage || 85; // Placeholder to match image
  const experienceRequiredText = jobOpening?.requiredExperienceLevel ? jobOpening.requiredExperienceLevel.replace(/_/g, ' ') + ' experience required' : '2-3 years experience required'; // Placeholder to match image

  const handleDetailsButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAiJobFitAnalysis(null);
    setIsLoadingAiAnalysis(false);
    setUserQuestion("");
    setAiAnswer(null);
    setIsAskingQuestion(false);
    setShowFullJobDescriptionInModal(false);
    setShowFullCompanyDescriptionInModal(false);
    setActiveAccordionItem(undefined); 
    setIsDetailsModalOpen(true);
  };

  const fetchCurrentUserProfileForAI = useCallback(async () => {
    if (!mongoDbUserId || isGuestMode) return null;
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch current user's profile for AI analysis.");
      }
      const userData = await response.json();
      const profile: CandidateProfileForAI = {
        id: userData._id,
        role: userData.profileHeadline || 'Software Developer',
        experienceSummary: userData.profileExperienceSummary || 'Experienced in various technologies.',
        skills: userData.profileSkills ? userData.profileSkills.split(',').map((s:string) => s.trim()).filter((s:string) => s) : ['React', 'Node.js'],
        desiredWorkStyle: userData.profileDesiredWorkStyle || 'Remote, Collaborative',
        pastProjects: userData.profilePastProjects || undefined,
        workExperienceLevel: userData.profileWorkExperienceLevel || WorkExperienceLevel.MID_LEVEL,
        educationLevel: userData.profileEducationLevel || EducationLevel.UNIVERSITY,
        locationPreference: userData.profileLocationPreference || LocationPreference.REMOTE,
        languages: userData.profileLanguages ? userData.profileLanguages.split(',').map((s:string) => s.trim()).filter((s:string) => s) : ['English'],
        salaryExpectationMin: userData.profileSalaryExpectationMin,
        salaryExpectationMax: userData.profileSalaryExpectationMax,
        availability: userData.profileAvailability || Availability.UNSPECIFIED,
        jobTypePreference: userData.profileJobTypePreference ? userData.profileJobTypePreference.split(',').map((s:string) => s.trim() as JobType).filter((s:JobType) => s && Object.values(JobType).includes(s)) : [],
      };
      setCurrentUserProfileForAI(profile);
      return profile;
    } catch (error) {
      console.error("Error fetching current user profile:", error);
      toast({ title: "Profile Error", description: "Could not load your profile for AI analysis.", variant: "destructive" });
      return null;
    }
  }, [mongoDbUserId, isGuestMode, toast]);


  const fetchAiAnalysis = useCallback(async () => {
    if (!company || !jobOpening || isGuestMode || !isDetailsModalOpen) {
      if (isGuestMode) {
        setAiJobFitAnalysis({matchScoreForCandidate: 0, reasoningForCandidate: "AI Analysis disabled in Guest Mode.", weightedScoresForCandidate: {cultureFitScore:0, jobRelevanceScore:0, growthOpportunityScore:0, jobConditionFitScore:0}});
      }
      return;
    }
    
    let candidateForAI = currentUserProfileForAI;
    if (!candidateForAI) {
      setIsLoadingAiAnalysis(true); 
      candidateForAI = await fetchCurrentUserProfileForAI();
    }

    if (!candidateForAI) {
      setIsLoadingAiAnalysis(false);
      toast({ title: "AI Analysis Error", description: "Your profile could not be loaded for analysis.", variant: "destructive" });
      return;
    }
    
    setIsLoadingAiAnalysis(true);
    setAiJobFitAnalysis(null);

    try {
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
      if (typeof window !== 'undefined') {
          const storedWeights = localStorage.getItem('userJobSeekerAIWeights');
          if (storedWeights) {
            try {
              const parsedJobSeekerWeights: JobSeekerPerspectiveWeights = JSON.parse(storedWeights);
              const sumOfWeights = Object.values(parsedJobSeekerWeights).reduce((sum, val) => sum + (Number(val) || 0), 0);
              if (Math.abs(sumOfWeights - 100) < 0.01) {
                userAIWeights = { jobSeekerPerspective: parsedJobSeekerWeights };
              } else {
                 console.warn("Stored JobSeekerAIWeights do not sum to 100. Using defaults.");
              }
            } catch (e) { console.warn("Could not parse userJobSeekerAIWeights from localStorage", e); }
          }
      }

      const result = await recommendProfile({ 
          candidateProfile: candidateForAI, 
          jobCriteria: jobCriteria,
          userAIWeights: userAIWeights 
      });
      if (result.candidateJobFitAnalysis) {
        setAiJobFitAnalysis(result.candidateJobFitAnalysis);
        setActiveAccordionItem("ai-fit-analysis"); 
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
  }, [company, jobOpening, isDetailsModalOpen, isGuestMode, toast, currentUserProfileForAI, fetchCurrentUserProfileForAI]);

  useEffect(() => {
      if(isDetailsModalOpen && !isGuestMode && !aiJobFitAnalysis && !isLoadingAiAnalysis) {
          fetchAiAnalysis();
      } else if (isGuestMode && isDetailsModalOpen) {
        setAiJobFitAnalysis({matchScoreForCandidate: 0, reasoningForCandidate: "AI Analysis disabled in Guest Mode.", weightedScoresForCandidate: {cultureFitScore:0, jobRelevanceScore:0, growthOpportunityScore:0, jobConditionFitScore:0}});
        setIsLoadingAiAnalysis(false);
        setActiveAccordionItem(undefined); 
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
  };

  const companyDescriptionForModal = company.description;
  const displayedCompanyDescriptionInModal = showFullCompanyDescriptionInModal || companyDescriptionForModal.length <= MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL
    ? companyDescriptionForModal
    : companyDescriptionForModal.substring(0, MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL) + "...";

  const jobDescriptionForModal = jobOpening?.description || "No job description available.";
  const displayedJobDescriptionInModal = showFullJobDescriptionInModal || jobDescriptionForModal.length <= MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL
    ? jobDescriptionForModal
    : jobDescriptionForModal.substring(0, MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL) + "...";

  const categoryText = company.industry || "Technology";


  return (
    <>
      <div
        ref={cardRootRef}
        className="flex flex-col overflow-hidden h-full relative bg-card"
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
        {/* Header Section */}
        <div className="relative h-24 bg-gradient-to-r from-purple-500 to-blue-500 shrink-0 p-4 flex items-start">
          <Badge variant="secondary" className="absolute top-3 left-3 bg-white/20 text-white backdrop-blur-sm text-xs px-2.5 py-1 rounded-full shadow-sm">
            {categoryText.length > 15 ? categoryText.substring(0, 12) + "..." : categoryText}
          </Badge>
          {/* Circular Logo Icon Holder */}
          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-200 z-10">
            {company.logoUrl ? (
              <Image
                src={company.logoUrl}
                alt={company.name + " logo"}
                width={48} 
                height={48}
                className="object-contain rounded-md p-1"
                data-ai-hint={company.dataAiHint || "company logo"}
              />
            ) : (
              <BriefcaseIcon className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 p-4 pt-14 space-y-2.5 text-center overflow-y-auto relative">
          <h2 className="text-xl font-bold text-foreground mt-1">{company.name}</h2>
          {jobOpening && <p className="text-md text-purple-600 font-medium">{jobOpening.title}</p>}
          
          <div className="flex justify-center items-center gap-3 text-sm text-muted-foreground mt-2">
            {jobOpening?.location && (
              <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {jobOpening.location}</span>
            )}
            {jobOpening?.jobType && (
              <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {jobOpening.jobType.replace(/_/g, ' ')}</span>
            )}
          </div>

          {/* Job Match Section */}
          <div className="pt-3 space-y-1">
            <div className="flex justify-between items-center text-sm px-1">
              <span className="text-muted-foreground">Job Match</span>
              <span className="font-semibold text-purple-600">{jobMatchPercentage}%</span>
            </div>
            <Progress value={jobMatchPercentage} className="h-2 [&>div]:progress-gradient-purple-blue flex-grow mx-2" />
            <p className="text-xs italic text-muted-foreground text-center pt-1">{experienceRequiredText}</p>
          </div>

          {/* Top Skills Section */}
          {jobOpening?.tags && jobOpening.tags.length > 0 && (
            <div className="pt-3 space-y-1.5">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider text-center">Top Skills</h3>
              <div className="flex flex-wrap justify-center gap-1.5">
                {jobOpening.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-xs px-2 py-0.5 rounded-md">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
            
        {/* Action Buttons Footer */}
        <CardFooter className="p-2 grid grid-cols-4 gap-2 border-t bg-card shrink-0 no-swipe-area">
            <Button
                variant="outline"
                onClick={(e) => { e.stopPropagation(); if(!isGuestMode) handleLocalSwipeAction('pass'); else toast({title: "Guest Mode", description: "Interactions disabled."}) }}
                disabled={isGuestMode}
                className="flex flex-col items-center justify-center w-16 h-16 rounded-xl text-xs font-medium transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 shadow-sm border-red-300 text-red-500 hover:bg-red-50"
                aria-label={`Pass on ${company.name}`}
                data-no-drag="true"
            >
                {isGuestMode ? <Lock className="h-5 w-5 mb-1"/> : <X className="h-5 w-5 mb-1" />}
                Pass
            </Button>
            <Button
                variant="outline"
                onClick={handleDetailsButtonClick}
                className="flex flex-col items-center justify-center w-16 h-16 rounded-xl text-xs font-medium transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 shadow-sm border-blue-300 text-blue-500 hover:bg-blue-50"
                aria-label={`View details for ${company.name}`}
                data-no-drag="true"
                data-modal-trigger="true"
            >
                <Eye className="h-5 w-5 mb-1" />
                Profile
            </Button>
            <Button
                variant="outline"
                onClick={(e) => { e.stopPropagation(); if(!isGuestMode) handleLocalSwipeAction('like'); else toast({title: "Guest Mode", description: "Interactions disabled."}) }}
                disabled={isGuestMode}
                className={cn(
                    "flex flex-col items-center justify-center w-16 h-16 rounded-xl text-xs font-medium transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 shadow-sm border-green-300 text-green-500 hover:bg-green-50",
                    isLiked && "bg-green-100 ring-2 ring-green-500"
                )}
                aria-label={`Like ${company.name}`}
                data-no-drag="true"
            >
                {isGuestMode ? <Lock className="h-5 w-5 mb-1"/> : (isLiked ? <Heart className="h-5 w-5 mb-1 fill-green-500 text-green-500" /> : <Heart className="h-5 w-5 mb-1" />)}
                Like
            </Button>
            <DropdownMenu onOpenChange={setIsShareModalOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={isGuestMode}
                        className="flex flex-col items-center justify-center w-16 h-16 rounded-xl text-xs font-medium transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 shadow-sm border-purple-300 text-purple-500 hover:bg-purple-50"
                        aria-label={`Share ${company.name}`}
                        data-no-drag="true"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isGuestMode ? <Lock className="h-5 w-5 mb-1"/> : <Share2 className="h-5 w-5 mb-1" />}
                        Share
                    </Button>
                </DropdownMenuTrigger>
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
        </CardFooter>
      </div>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col p-0 bg-background">
           <DialogHeader className="p-4 sm:p-6 border-b sticky top-0 bg-background z-10 pb-3">
            <ShadDialogTitle className="text-xl sm:text-2xl font-bold text-primary">
              {jobOpening?.title || "Opportunity Details"} at {company.name}
            </ShadDialogTitle>
            <ShadDialogDescription className="text-sm text-muted-foreground">
               {company.industry}
            </ShadDialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto bg-background">
            <div className="p-4 sm:p-6 space-y-3 pt-3">
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
                        <BriefcaseIcon className="mr-2 h-5 w-5 text-primary" /> Job Description: {jobOpening.title}
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
                        {jobOpening.jobType && <div className="flex items-start"><BriefcaseIcon className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0" /><span className="font-medium text-foreground mr-1">Type:</span> <span className="text-muted-foreground">{jobOpening.jobType.replace(/_/g, ' ')}</span></div>}
                        {jobOpening.requiredExperienceLevel && jobOpening.requiredExperienceLevel !== WorkExperienceLevel.UNSPECIFIED && <div className="flex items-start"><CalendarDays className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0" /><span className="font-medium text-foreground mr-1">Experience:</span> <span className="text-muted-foreground">{jobOpening.requiredExperienceLevel.replace(/_/g, ' ')}</span></div>}
                        {jobOpening.tags && jobOpening.tags.length > 0 && (
                        <div className="flex items-start sm:col-span-2">
                            <Tag className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0" />
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
              
              <Accordion type="single" collapsible className="w-full" value={activeAccordionItem} onValueChange={setActiveAccordionItem}>
                <AccordionItem value="ai-fit-analysis">
                  <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline data-[state=open]:text-primary">
                    <div className="flex items-center">
                      <Brain className="mr-2 h-5 w-5" /> AI: How This Job Fits You <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/70" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3">
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
                  </AccordionContent>
                </AccordionItem>
                <Separator className="my-3" />
                <AccordionItem value="company-qa">
                  <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline data-[state=open]:text-primary">
                    <div className="flex items-center">
                       <MessageSquare className="mr-2 h-5 w-5" /> Ask AI About {company.name} <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/70" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3">
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
