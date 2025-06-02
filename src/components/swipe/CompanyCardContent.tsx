
"use client";

import type { Company, ProfileRecommenderOutput, CandidateProfileForAI, JobCriteriaForAI, CompanyQAInput, UserAIWeights, JobSeekerPerspectiveWeights, Candidate } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Briefcase as BriefcaseIcon, DollarSign, HelpCircle, Sparkles, Percent, Loader2, Share2, MessageSquare, Info, Brain, ThumbsUp, ThumbsDown, Lock, Video, ListChecks, ChevronsUpDown, Users2, CalendarDays, X, Link as LinkIcon, Mail, Twitter, Linkedin, Eye, Clock, Tag, Heart, Code2 } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { recommendProfile } from '@/ai/flows/profile-recommender';
import { answerCompanyQuestion } from '@/ai/flows/company-qa-flow';
import { useToast } from '@/hooks/use-toast';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle as ShadDialogTitle, DialogDescription as ShadDialogDescription } from "@/components/ui/dialog";
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
    const currentCount = parseInt(localStorage.getItem(`analytics_${key}`) || '0', 10);
    localStorage.setItem(`analytics_${key}`, (currentCount + 1).toString());
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
  // Use AI score for match percentage if available, otherwise use prop or default
  const displayMatchPercentage = aiJobFitAnalysis?.matchScoreForCandidate ?? company.jobMatchPercentage ?? 75;

  const experienceRequiredText = jobOpening?.requiredExperienceLevel && jobOpening.requiredExperienceLevel !== WorkExperienceLevel.UNSPECIFIED ? jobOpening.requiredExperienceLevel.replace(/_/g, ' ') : 'Experience not specified';
  const categoryText = company.industry || "General";


  const handleDetailsButtonClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAiJobFitAnalysis(null); // Reset so it can be re-fetched or shown fresh in modal
    setIsLoadingAiAnalysis(false); // Reset loading state for modal
    setUserQuestion("");
    setAiAnswer(null);
    setIsAskingQuestion(false);
    setShowFullJobDescriptionInModal(false);
    setShowFullCompanyDescriptionInModal(false);
    setIsDetailsModalOpen(true);
    // Active accordion item will be set by fetchAiAnalysis or user interaction in modal
  };

  const handleDetailsButtonClickAndFocusAI = (e?: React.MouseEvent) => {
    handleDetailsButtonClick(e);
    // Setting timeout to allow modal to open before trying to set accordion
    setTimeout(() => setActiveAccordionItem("ai-fit-analysis"), 100);
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


  const fetchAiAnalysis = useCallback(async (isModalFetch = false) => {
    if (!company || !jobOpening || isGuestMode) {
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
    if (!isModalFetch) setAiJobFitAnalysis(null); // Only clear for card face analysis, modal might re-trigger

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
        if (isModalFetch || isDetailsModalOpen) setActiveAccordionItem("ai-fit-analysis"); 
      } else {
        setAiJobFitAnalysis({
            matchScoreForCandidate: 0,
            reasoningForCandidate: "AI analysis did not provide specific job-to-candidate fit details.",
            weightedScoresForCandidate: { cultureFitScore: 0, jobRelevanceScore: 0, growthOpportunityScore: 0, jobConditionFitScore: 0 }
        });
      }
    } catch (error: any) {
      console.error("Error fetching AI job fit analysis for company " + company.name + ":", error);
      toast({ title: "AI Analysis Error", description: `Failed to get AI insights. ${error.message || 'Ensure your profile is up to date.'}`, variant: "destructive" });
       setAiJobFitAnalysis({
            matchScoreForCandidate: 0,
            reasoningForCandidate: "Error during AI analysis.",
            weightedScoresForCandidate: { cultureFitScore: 0, jobRelevanceScore: 0, growthOpportunityScore: 0, jobConditionFitScore: 0 }
        });
    } finally {
      setIsLoadingAiAnalysis(false);
    }
  }, [company, jobOpening, isGuestMode, toast, currentUserProfileForAI, fetchCurrentUserProfileForAI, isDetailsModalOpen]);

  // Fetch AI Analysis when modal opens (if not already fetched by card button)
  useEffect(() => {
      if(isDetailsModalOpen && !isGuestMode && !aiJobFitAnalysis && !isLoadingAiAnalysis) {
          fetchAiAnalysis(true); // Pass true to indicate it's a modal fetch
      } else if (isGuestMode && isDetailsModalOpen) {
        setAiJobFitAnalysis({matchScoreForCandidate: 0, reasoningForCandidate: "AI Analysis disabled in Guest Mode.", weightedScoresForCandidate: {cultureFitScore:0, jobRelevanceScore:0, growthOpportunityScore:0, jobConditionFitScore:0}});
        setIsLoadingAiAnalysis(false);
        setActiveAccordionItem(undefined); 
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetailsModalOpen]); // Removed fetchAiAnalysis from deps to avoid loop if it's passed as prop

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
        if (e.clientY > rect.bottom - 40) return;
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

  const logoToDisplay = company.logoUrl || 'https://placehold.co/80x80/FFFFFF/CCCCCC.png&text=LOGO';
  const dataAiHintForLogo = company.dataAiHint || 'company logo';

  return (
    <>
      <div
        ref={cardRootRef}
        className="flex flex-col h-full overflow-hidden relative bg-gradient-to-br from-custom-primary-purple via-indigo-600 to-custom-dark-purple-blue text-white"
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
        <div className="h-24 bg-gradient-to-r from-custom-primary-purple to-custom-dark-purple-blue p-4 flex flex-col items-center justify-start relative">
          <Badge className="absolute top-3 left-3 bg-white/10 text-white border border-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs shadow-md font-medium">
            {categoryText}
          </Badge>
          <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mt-4">
             <Code2 className="h-7 w-7 text-white" />
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 p-4 pt-6 text-center overflow-y-auto space-y-3">
          <p className="text-custom-light-purple-text text-lg font-bold uppercase mt-1">{company.name}</p>
          <h1 className="text-4xl font-bold text-white mt-1 line-clamp-2">{jobOpening?.title || 'Exciting Opportunity'}</h1>
          
          <div className="text-base text-white/80 mt-3 flex justify-center items-center gap-x-1.5">
            {jobOpening?.location && (
              <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-white/70" /> {jobOpening.location}</span>
            )}
            {jobOpening?.location && jobOpening?.jobType && <span className="text-white/50 mx-1">•</span>}
            {jobOpening?.jobType && (
              <span className="flex items-center"><BriefcaseIcon className="h-4 w-4 mr-1 text-white/70" /> {jobOpening.jobType.replace(/_/g, ' ')}</span>
            )}
          </div>
          
          {/* "Analyze My Job Fit" Section */}
          <div className="my-4 space-y-2 px-2">
            {isGuestMode ? (
              <div className="text-sm text-red-400 italic p-3 border border-red-600 bg-red-900/30 rounded-md shadow-sm">
                <Lock className="inline h-4 w-4 mr-1.5"/>Sign in for AI Job Fit Analysis.
              </div>
            ) : isLoadingAiAnalysis ? (
              <div className="flex items-center justify-center text-white/80 py-3">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Analyzing your fit...
              </div>
            ) : aiJobFitAnalysis ? (
              <div className="p-3 border border-white/20 rounded-lg bg-white/5 text-left text-sm">
                <p className="font-semibold text-custom-light-purple-text">Your Fit Score: <span className={cn("text-lg font-bold", aiJobFitAnalysis.matchScoreForCandidate >=75 ? 'text-green-400' : aiJobFitAnalysis.matchScoreForCandidate >= 50 ? 'text-yellow-400' : 'text-red-400')}>{aiJobFitAnalysis.matchScoreForCandidate}%</span></p>
                <p className="text-white/80 line-clamp-2 text-xs mt-1">{aiJobFitAnalysis.reasoningForCandidate}</p>
                <Button variant="link" onClick={handleDetailsButtonClickAndFocusAI} className="text-custom-primary-purple hover:text-custom-primary-purple/80 p-0 h-auto text-xs mt-1.5">View Full Analysis</Button>
              </div>
            ) : (
              <Button onClick={() => fetchAiAnalysis()} variant="outline" className="w-full bg-white/10 hover:bg-white/20 border-white/30 text-white py-2.5">
                <Brain className="mr-2 h-5 w-5" /> Analyze My Job Fit
              </Button>
            )}
          </div>

          <p className="text-xs italic text-white/70 mt-1">{experienceRequiredText}</p>
          <Separator className="border-b border-white/20 my-3 mx-auto w-3/4" />
          
          {jobOpening?.tags && jobOpening.tags.length > 0 && (
            <div className="mt-3">
              <h3 className="text-xs uppercase font-semibold text-custom-light-purple-text tracking-wider">TOP SKILLS</h3>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {jobOpening.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} className="bg-custom-light-purple-skill-bg text-custom-primary-purple text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Moved Job Match Indicator */}
           <div className="mt-4 mb-2 flex flex-col items-center justify-center">
             <div className="relative w-[70px] h-[70px] mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                <div 
                    className="absolute inset-0 rounded-full border-4 border-transparent"
                    style={{
                        borderTopColor: displayMatchPercentage >= 25 ? 'var(--color-custom-primary-purple)' : 'transparent',
                        borderRightColor: displayMatchPercentage >= 50 ? 'var(--color-custom-primary-purple)' : 'transparent',
                        borderBottomColor: displayMatchPercentage >= 75 ? 'var(--color-custom-primary-purple)' : 'transparent',
                        borderLeftColor: displayMatchPercentage >= 100 ? 'var(--color-custom-primary-purple)' : 'transparent', // Full circle at 100
                        transform: 'rotate(-45deg)', 
                    }}
                ></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-white text-sm font-semibold leading-none">{displayMatchPercentage}%</span>
                    <span className="text-white/80 text-[10px] leading-tight">Match</span>
                </div>
            </div>
          </div>
        </div>
            
        {/* Action Buttons Footer */}
        <CardFooter className="p-3 grid grid-cols-4 gap-3 border-t border-white/10 bg-transparent mt-auto shrink-0 no-swipe-area">
            <Button
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); if(!isGuestMode) handleLocalSwipeAction('pass'); else toast({title: "Guest Mode", description: "Interactions disabled."}) }}
                disabled={isGuestMode}
                className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 border border-white/20 shadow-md hover:shadow-lg"
                aria-label={`Pass on ${company.name}`}
                data-no-drag="true"
            >
                {isGuestMode ? <Lock className="h-5 w-5 mb-1"/> : <X className="h-5 w-5 mb-1" />}
                Pass
            </Button>
            <Button
                variant="ghost"
                onClick={handleDetailsButtonClick}
                className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 border border-white/20 shadow-md hover:shadow-lg"
                aria-label={`View details for ${company.name}`}
                data-no-drag="true"
                data-modal-trigger="true"
            >
                <Eye className="h-5 w-5 mb-1" />
                Profile
            </Button>
            <Button
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); if(!isGuestMode) handleLocalSwipeAction('like'); else toast({title: "Guest Mode", description: "Interactions disabled."}) }}
                disabled={isGuestMode}
                className={cn(
                    "flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 border border-white/20 shadow-md hover:shadow-lg",
                    isLiked && !isGuestMode && "bg-white/15 text-custom-primary-purple ring-1 ring-custom-primary-purple"
                )}
                aria-label={`Like ${company.name}`}
                data-no-drag="true"
            >
                {isGuestMode ? <Lock className="h-5 w-5 mb-1"/> : <Heart className={cn("h-5 w-5 mb-1", isLiked && "fill-custom-primary-purple text-custom-primary-purple")} />}
                Like
            </Button>
            <DropdownMenu onOpenChange={setIsShareModalOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        disabled={isGuestMode}
                        className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 border border-white/20 shadow-md hover:shadow-lg"
                        aria-label={`Share ${company.name}`}
                        data-no-drag="true"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isGuestMode ? <Lock className="h-5 w-5 mb-1"/> : <Share2 className="h-5 w-5 mb-1" />}
                        Share
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-slate-700 border-slate-600 text-white" data-no-drag="true">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('copy'); }} className="hover:!bg-slate-600 focus:!bg-slate-600" data-no-drag="true">
                        <LinkIcon className="mr-2 h-4 w-4" /> Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('email'); }} className="hover:!bg-slate-600 focus:!bg-slate-600" data-no-drag="true">
                        <Mail className="mr-2 h-4 w-4" /> Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('linkedin'); }} className="hover:!bg-slate-600 focus:!bg-slate-600" data-no-drag="true">
                        <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('twitter'); }} className="hover:!bg-slate-600 focus:!bg-slate-600" data-no-drag="true">
                        <Twitter className="mr-2 h-4 w-4" /> X / Twitter
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardFooter>
      </div>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col p-0 bg-slate-800 text-white border-slate-700">
           <DialogHeader className="p-4 sm:p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10 pb-3">
            <ShadDialogTitle className="text-xl sm:text-2xl font-bold text-custom-primary-purple">
              {jobOpening?.title || "Opportunity Details"} at {company.name}
            </ShadDialogTitle>
            <ShadDialogDescription className="text-sm text-slate-400">
               {company.industry}
            </ShadDialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-3 pt-3">
              <section>
                <h3 className="text-lg font-semibold text-custom-light-purple-text mb-1.5 flex items-center">
                    <Building className="mr-2 h-5 w-5" /> About {company.name}
                </h3>
                <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                  {displayedCompanyDescriptionInModal}
                  {companyDescriptionForModal.length > MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL && (
                      <Button
                          variant="link"
                          size="sm"
                          onClick={(e) => {e.stopPropagation(); setShowFullCompanyDescriptionInModal(!showFullCompanyDescriptionInModal);}}
                          className="text-custom-primary-purple hover:underline p-0 h-auto ml-1 text-xs font-semibold"
                          data-no-drag="true"
                      >
                          {showFullCompanyDescriptionInModal ? "Read less" : "Read more"}
                      </Button>
                  )}
                </p>
              </section>
              <Separator className="my-3 bg-slate-700" />

              {jobOpening && (
                <>
                  <section>
                    <h3 className="text-lg font-semibold text-custom-light-purple-text mb-1.5 flex items-center">
                        <BriefcaseIcon className="mr-2 h-5 w-5" /> Job Description: {jobOpening.title}
                    </h3>
                    <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                      {displayedJobDescriptionInModal}
                      {jobDescriptionForModal.length > MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL && (
                          <Button
                              variant="link"
                              size="sm"
                              onClick={(e) => {e.stopPropagation(); setShowFullJobDescriptionInModal(!showFullJobDescriptionInModal);}}
                              className="text-custom-primary-purple hover:underline p-0 h-auto ml-1 text-xs font-semibold"
                              data-no-drag="true"
                          >
                              {showFullJobDescriptionInModal ? "Read less" : "Read more"}
                          </Button>
                      )}
                    </p>
                  </section>
                  <Separator className="my-3 bg-slate-700" />

                  <section>
                    <h3 className="text-lg font-semibold text-custom-light-purple-text mb-2 flex items-center">
                        <ListChecks className="mr-2 h-5 w-5" /> Key Job Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm p-3 border border-slate-700 rounded-lg bg-slate-700/30 shadow-sm">
                        {jobOpening.location && <div className="flex items-start"><MapPin className="h-4 w-4 mr-2 mt-0.5 text-slate-400 shrink-0" /><span className="font-medium text-white mr-1">Location:</span> <span className="text-slate-300">{jobOpening.location}</span></div>}
                        {jobOpening.salaryRange && <div className="flex items-start"><DollarSign className="h-4 w-4 mr-2 mt-0.5 text-slate-400 shrink-0" /><span className="font-medium text-white mr-1">Salary:</span> <span className="text-slate-300">{jobOpening.salaryRange}</span></div>}
                        {jobOpening.jobType && <div className="flex items-start"><BriefcaseIcon className="h-4 w-4 mr-2 mt-0.5 text-slate-400 shrink-0" /><span className="font-medium text-white mr-1">Type:</span> <span className="text-slate-300">{jobOpening.jobType.replace(/_/g, ' ')}</span></div>}
                        {jobOpening.requiredExperienceLevel && jobOpening.requiredExperienceLevel !== WorkExperienceLevel.UNSPECIFIED && <div className="flex items-start"><CalendarDays className="h-4 w-4 mr-2 mt-0.5 text-slate-400 shrink-0" /><span className="font-medium text-white mr-1">Experience:</span> <span className="text-slate-300">{jobOpening.requiredExperienceLevel.replace(/_/g, ' ')}</span></div>}
                        {jobOpening.tags && jobOpening.tags.length > 0 && (
                        <div className="flex items-start sm:col-span-2">
                            <Tag className="h-4 w-4 mr-2 mt-0.5 text-slate-400 shrink-0" />
                            <span className="font-medium text-white mr-1 self-start">Skills/Tags:</span>
                            <div className="flex flex-wrap gap-1">
                                {jobOpening.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs bg-custom-light-purple-skill-bg text-custom-primary-purple">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                      )}
                    </div>
                  </section>
                   <Separator className="my-3 bg-slate-700" />
                </>
              )}
              
              <Accordion type="single" collapsible className="w-full" value={activeAccordionItem} onValueChange={setActiveAccordionItem}>
                <AccordionItem value="ai-fit-analysis" className="border-b-0">
                  <AccordionTrigger className="text-lg font-semibold text-custom-light-purple-text hover:no-underline data-[state=open]:text-custom-primary-purple">
                    <div className="flex items-center">
                      <Brain className="mr-2 h-5 w-5" /> AI: How This Job Fits You <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-400/70" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3">
                    <p className="text-xs text-slate-400 italic mb-2">
                      Our AI considers how this job aligns with your profile... (Customize weights in Settings).
                    </p>
                    {isGuestMode ? (
                      <div className="text-sm text-red-400 italic flex items-center p-3 border border-red-600 bg-red-900/30 rounded-md shadow-sm">
                          <Lock className="h-4 w-4 mr-2"/>Sign in to get your personalized AI Fit Analysis.
                      </div>
                    ) : (
                      <>
                        <Button onClick={() => fetchAiAnalysis(true)} disabled={isLoadingAiAnalysis || !!aiJobFitAnalysis} className="mb-2.5 w-full sm:w-auto bg-custom-primary-purple hover:bg-custom-primary-purple/80 text-white">
                          {isLoadingAiAnalysis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                          {aiJobFitAnalysis ? "Analysis Complete" : "Analyze My Fit for this Job"}
                        </Button>
                        {isLoadingAiAnalysis && !aiJobFitAnalysis &&(
                          <div className="flex items-center text-sm text-slate-400 py-1.5">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Assessing fit...</span>
                          </div>
                        )}
                        {aiJobFitAnalysis && !isLoadingAiAnalysis && (
                          <div className="space-y-2 p-3 border border-slate-700 rounded-lg bg-slate-700/30 shadow-sm">
                            <div className="flex items-baseline">
                              <span className="text-md font-semibold text-white">Your Fit Score:</span>
                              <span className={cn(
                                "ml-1.5 font-bold text-xl",
                                aiJobFitAnalysis.matchScoreForCandidate >= 75 ? 'text-green-400' :
                                aiJobFitAnalysis.matchScoreForCandidate >= 50 ? 'text-yellow-400' : 'text-red-400'
                                )}>
                                {aiJobFitAnalysis.matchScoreForCandidate}%
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 italic leading-relaxed">{aiJobFitAnalysis.reasoningForCandidate}</p>
                            {aiJobFitAnalysis.weightedScoresForCandidate && (
                                <div className="pt-2 mt-2 border-t border-slate-700/70">
                                    <p className="font-medium text-white text-sm mb-1">Score Breakdown:</p>
                                    <ul className="list-none space-y-0.5 text-xs text-slate-300">
                                        <li>Culture Fit: <span className="font-semibold text-white">{aiJobFitAnalysis.weightedScoresForCandidate.cultureFitScore}%</span></li>
                                        <li>Job Relevance: <span className="font-semibold text-white">{aiJobFitAnalysis.weightedScoresForCandidate.jobRelevanceScore}%</span></li>
                                        <li>Growth Opportunity: <span className="font-semibold text-white">{aiJobFitAnalysis.weightedScoresForCandidate.growthOpportunityScore}%</span></li>
                                        <li>Job Conditions: <span className="font-semibold text-white">{aiJobFitAnalysis.weightedScoresForCandidate.jobConditionFitScore}%</span></li>
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
                  <AccordionTrigger className="text-lg font-semibold text-custom-light-purple-text hover:no-underline data-[state=open]:text-custom-primary-purple">
                    <div className="flex items-center">
                       <MessageSquare className="mr-2 h-5 w-5" /> Ask AI About {company.name} <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-400/70" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3">
                    {isGuestMode ? (
                        <div className="text-sm text-red-400 italic flex items-center p-3 border border-red-600 bg-red-900/30 rounded-md shadow-sm">
                            <Lock className="h-4 w-4 mr-2"/>Sign in to ask the AI questions.
                        </div>
                    ) : (
                      <div className="space-y-2.5">
                        <Textarea
                          id="userCompanyQuestion"
                          placeholder="e.g., What are the main products? What is the team size for this role?"
                          value={userQuestion}
                          onChange={(e) => setUserQuestion(e.target.value)}
                          disabled={isAskingQuestion}
                          className="min-h-[80px] text-sm bg-slate-700 border-slate-600 placeholder-slate-400 text-white"
                        />
                        <Button onClick={handleAskQuestion} disabled={isAskingQuestion || !userQuestion.trim()} className="w-full sm:w-auto bg-custom-primary-purple hover:bg-custom-primary-purple/80 text-white">
                          {isAskingQuestion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HelpCircle className="mr-2 h-4 w-4" />}
                          Ask AI
                        </Button>
                        {isAskingQuestion && !aiAnswer && (
                          <div className="flex items-center text-sm text-slate-400 py-1.5">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        )}
                        {aiAnswer && (
                          <div className="pt-1.5">
                            <h4 className="font-semibold text-md text-white mb-1">AI's Answer:</h4>
                            <div className="p-3 border border-slate-700 rounded-md bg-slate-700/30 text-sm text-slate-300 whitespace-pre-line leading-relaxed shadow-sm">
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
                  <h3 className="text-lg font-semibold text-custom-light-purple-text mb-2 flex items-center">
                    <Users2 className="mr-2 h-5 w-5" /> Culture Highlights
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {company.cultureHighlights.map((highlight) => (
                      <Badge key={highlight} variant="outline" className="text-sm border-custom-primary-purple/70 text-custom-primary-purple bg-custom-primary-purple/10">{highlight}</Badge>
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

