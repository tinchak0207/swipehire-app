
"use client";

import type { Company, ProfileRecommenderOutput, CandidateProfileForAI, JobCriteriaForAI, CompanyQAInput, UserAIWeights, JobSeekerPerspectiveWeights, Candidate } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Briefcase as BriefcaseIcon, DollarSign, HelpCircle, Sparkles, Percent, Loader2, Share2, MessageSquare, Info, Brain, ThumbsUp, ThumbsDown, Lock, Video, ListChecks, ChevronsUpDown, Users2, CalendarDays, X, Link as LinkIcon, Mail, Twitter, Linkedin, Eye, Clock, Tag, Heart, Code2, UserCircle as UserCircleIcon } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { recommendProfile } from '@/ai/flows/profile-recommender';
import { answerCompanyQuestion } from '@/ai/flows/company-qa-flow';


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

const CircularProgressBar = ({ percentage }: { percentage: number }) => {
  const radius = 30;
  const strokeWidth = 5;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      className="transform -rotate-90"
    >
      <circle
        stroke="rgba(255, 255, 255, 0.2)" // Background ring color from theme
        fill="transparent"
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="url(#progressGradient)" // Using gradient for progress
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, strokeLinecap: 'round' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A78BFA" /> {/* Lighter purple */}
          <stop offset="100%" stopColor="#6366F1" /> {/* Indigo */}
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="48%"
        dy=".3em"
        textAnchor="middle"
        className="text-sm font-bold fill-white transform rotate-90 origin-center"
      >
        {`${percentage}%`}
      </text>
      <text
        x="50%"
        y="62%"
        dy=".3em"
        textAnchor="middle"
        className="text-[8px] fill-white/80 transform rotate-90 origin-center"
      >
        match
      </text>
    </svg>
  );
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
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);
  const [currentUserProfileForAI, setCurrentUserProfileForAI] = useState<CandidateProfileForAI | null>(null);

  const jobOpening = company.jobOpenings && company.jobOpenings.length > 0 ? company.jobOpenings[0] : null;
  
  const displayMatchPercentage = aiJobFitAnalysis?.matchScoreForCandidate ?? company.jobMatchPercentage ?? 75;
  const categoryText = company.industry || "General";

  const handleDetailsButtonClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAiJobFitAnalysis(null);
    setIsLoadingAiAnalysis(false);
    setUserQuestion("");
    setAiAnswer(null);
    setIsAskingQuestion(false);
    setShowFullJobDescriptionInModal(false);
    setShowFullCompanyDescriptionInModal(false);
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
      if (isGuestMode) setAiJobFitAnalysis({matchScoreForCandidate: 0, reasoningForCandidate: "AI Analysis disabled in Guest Mode.", weightedScoresForCandidate: {cultureFitScore:0, jobRelevanceScore:0, growthOpportunityScore:0, jobConditionFitScore:0}});
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
    if (!isModalFetch) setAiJobFitAnalysis(null); 
    try {
      const jobCriteria: JobCriteriaForAI = {
        title: jobOpening.title, description: jobOpening.description, requiredSkills: jobOpening.tags || [],
        requiredExperienceLevel: jobOpening.requiredExperienceLevel || WorkExperienceLevel.UNSPECIFIED,
        requiredEducationLevel: jobOpening.requiredEducationLevel || EducationLevel.UNSPECIFIED,
        workLocationType: jobOpening.workLocationType || LocationPreference.UNSPECIFIED,
        jobLocation: jobOpening.location || undefined, requiredLanguages: jobOpening.requiredLanguages || [],
        salaryMin: jobOpening.salaryMin, salaryMax: jobOpening.salaryMax, jobType: jobOpening.jobType || JobType.UNSPECIFIED,
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
              if (Math.abs(sumOfWeights - 100) < 0.01) userAIWeights = { jobSeekerPerspective: parsedJobSeekerWeights };
            } catch (e) { console.warn("Could not parse userJobSeekerAIWeights from localStorage", e); }
          }
      }
      const result = await recommendProfile({ candidateProfile: candidateForAI, jobCriteria: jobCriteria, userAIWeights: userAIWeights });
      if (result.candidateJobFitAnalysis) setAiJobFitAnalysis(result.candidateJobFitAnalysis);
      else setAiJobFitAnalysis({ matchScoreForCandidate: 0, reasoningForCandidate: "AI analysis did not provide specific job-to-candidate fit details.", weightedScoresForCandidate: { cultureFitScore: 0, jobRelevanceScore: 0, growthOpportunityScore: 0, jobConditionFitScore: 0 }});
      if (isModalFetch || isDetailsModalOpen) setActiveAccordionItem("ai-fit-analysis");
    } catch (error: any) {
      console.error("Error fetching AI job fit analysis for company " + company.name + ":", error);
      toast({ title: "AI Analysis Error", description: `Failed to get AI insights. ${error.message || 'Ensure your profile is up to date.'}`, variant: "destructive" });
      setAiJobFitAnalysis({ matchScoreForCandidate: 0, reasoningForCandidate: "Error during AI analysis.", weightedScoresForCandidate: { cultureFitScore: 0, jobRelevanceScore: 0, growthOpportunityScore: 0, jobConditionFitScore: 0 }});
    } finally { setIsLoadingAiAnalysis(false); }
  }, [company, jobOpening, isGuestMode, toast, currentUserProfileForAI, fetchCurrentUserProfileForAI, isDetailsModalOpen]);

  useEffect(() => {
      if(isDetailsModalOpen && !isGuestMode && !aiJobFitAnalysis && !isLoadingAiAnalysis) fetchAiAnalysis(true);
      else if (isGuestMode && isDetailsModalOpen) {
        setAiJobFitAnalysis({matchScoreForCandidate: 0, reasoningForCandidate: "AI Analysis disabled in Guest Mode.", weightedScoresForCandidate: {cultureFitScore:0, jobRelevanceScore:0, growthOpportunityScore:0, jobConditionFitScore:0}});
        setIsLoadingAiAnalysis(false); setActiveAccordionItem(undefined); 
      }
  }, [isDetailsModalOpen, isGuestMode, aiJobFitAnalysis, isLoadingAiAnalysis, fetchAiAnalysis]);

  const handleLocalSwipeAction = (actionType: 'like' | 'pass' | 'details') => {
    if (actionType === 'like') incrementAnalytic('analytics_company_likes');
    else if (actionType === 'pass') incrementAnalytic('analytics_company_passes');
    onSwipeAction(company.id, actionType);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => { /* ... (no changes) */ };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => { /* ... (no changes) */ };
  const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLDivElement>) => { /* ... (no changes) */ };
  const getCardTransform = () => { /* ... (no changes) */ };

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
        jobOpeningsSummary: jobOpening ? `${jobOpening.title}: ${jobOpening.description.substring(0, 100)}...` : "General opportunities available.",
        userQuestion: userQuestion
      };
      const result = await answerCompanyQuestion(companyInput);
      setAiAnswer(result.aiAnswer);
    } catch (error) {
      console.error("Error asking AI about company:", error);
      toast({ title: "AI Question Error", description: "Could not get an answer from AI.", variant: "destructive" });
      setAiAnswer("Sorry, I couldn't process that question right now.");
    } finally {
      setIsAskingQuestion(false);
    }
  };
  const handleShareAction = (action: 'copy' | 'email' | 'linkedin' | 'twitter') => { /* ... (no changes) */ };

  const companyDescriptionForModal = company.description;
  const displayedCompanyDescriptionInModal = showFullCompanyDescriptionInModal || companyDescriptionForModal.length <= MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL
    ? companyDescriptionForModal
    : companyDescriptionForModal.substring(0, MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL) + "...";

  const jobDescriptionForModal = jobOpening?.description || "No job description available.";
  const displayedJobDescriptionInModal = showFullJobDescriptionInModal || jobDescriptionForModal.length <= MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL
    ? jobDescriptionForModal
    : jobDescriptionForModal.substring(0, MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL) + "...";
    

  return (
    <>
      <div
        ref={cardRootRef}
        className="flex flex-col h-full overflow-hidden relative bg-gradient-to-br from-purple-500 via-indigo-500 to-sky-500 text-white"
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
        <div className="p-4 pt-5 text-center flex flex-col flex-grow">
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/10 text-white border border-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs shadow-md font-medium">
              {categoryText}
            </Badge>
          </div>

          <div className="w-[64px] h-[64px] rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20 mx-auto mt-10">
            {company.logoUrl && company.logoUrl !== 'https://placehold.co/500x350.png' ? (
              <Image src={company.logoUrl} alt={`${company.name} logo`} width={36} height={36} className="object-contain" data-ai-hint={company.dataAiHint || "company logo"}/>
            ) : (
              <Code2 className="text-white h-8 w-8" />
            )}
          </div>

          <p className="text-custom-light-purple-text text-lg font-semibold uppercase tracking-wider mt-6">{company.name}</p>
          <h1 className="text-white text-3xl sm:text-4xl font-bold mt-1.5 leading-tight break-words">
            {jobOpening?.title.split('(')[0].trim()}
            {jobOpening?.title.includes('(') && (
              <span className="block text-2xl font-bold">{`(${jobOpening?.title.split('(')[1]}`}</span>
            )}
          </h1>
          
          <div className="text-white/90 text-base mt-4 flex justify-center items-center gap-x-1.5">
            {jobOpening?.location && (
              <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-white/70" /> {jobOpening.location}</span>
            )}
            {jobOpening?.location && jobOpening?.jobType && <span className="text-white/50 mx-0.5">•</span>}
            {jobOpening?.jobType && (
              <span className="flex items-center"><BriefcaseIcon className="h-4 w-4 mr-1 text-white/70" /> {jobOpening.jobType.replace(/_/g, ' ')}</span>
            )}
          </div>
          
          {/* Spacer to push match indicator down if content is short */}
          <div className="flex-grow min-h-[20px]"></div>


          {/* New "Analyze My Job Fit" Section - replaces old match indicator spot */}
          <div className="mt-8 mb-4 text-center">
            {isGuestMode ? (
               <div className="text-sm text-red-300 italic flex items-center justify-center p-2 border border-red-400/50 bg-red-500/20 rounded-md shadow-sm max-w-xs mx-auto">
                 <Lock className="h-4 w-4 mr-2"/>AI Fit Analysis disabled in Guest Mode.
               </div>
            ) : !aiJobFitAnalysis && !isLoadingAiAnalysis ? (
              <Button 
                onClick={() => fetchAiAnalysis()} 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm py-2.5 px-5 text-sm"
              >
                <Sparkles className="mr-2 h-4 w-4" /> Analyze My Job Fit
              </Button>
            ) : isLoadingAiAnalysis ? (
              <div className="flex items-center justify-center text-sm text-white/80">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Fit...
              </div>
            ) : aiJobFitAnalysis && (
              <div className="space-y-1 p-2 bg-black/10 rounded-md max-w-xs mx-auto">
                <p className="text-lg font-semibold text-white">
                  Your Fit: <span className={cn(
                    aiJobFitAnalysis.matchScoreForCandidate >= 75 ? 'text-green-300' : 
                    aiJobFitAnalysis.matchScoreForCandidate >= 50 ? 'text-yellow-300' : 'text-red-300'
                  )}>{aiJobFitAnalysis.matchScoreForCandidate}%</span>
                </p>
                <p className="text-xs text-white/70 italic line-clamp-2">{aiJobFitAnalysis.reasoningForCandidate}</p>
              </div>
            )}
          </div>


          <p className="text-custom-light-purple-text text-sm font-semibold uppercase tracking-wider mt-8">TOP SKILLS</p>
          <div className="flex flex-wrap justify-center gap-2.5 mt-2.5">
            {jobOpening?.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} className="bg-custom-light-purple-skill-bg text-custom-primary-purple text-base px-6 py-2.5 rounded-full font-semibold shadow-sm">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Relocated Job Match Indicator */}
          <div className="mt-8 mb-2 flex justify-center items-center">
             <div className="w-[90px] h-[90px]">
                <CircularProgressBar percentage={displayMatchPercentage} />
             </div>
          </div>
           <p className="text-xs italic text-white/70 mb-4">Job Match Percentage</p>

          <div className="flex-grow"></div> {/* Spacer to push footer down */}
        </div>
            
        <CardFooter className="mt-auto p-3 flex justify-center border-t border-white/10 bg-transparent">
          <div className="grid grid-cols-4 gap-2.5"> {/* Adjusted gap if needed */}
            <Button
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); if(!isGuestMode) handleLocalSwipeAction('pass'); else toast({title: "Guest Mode", description: "Interactions disabled."}) }}
              disabled={isGuestMode}
              className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-xs font-medium text-white/80 hover:text-red-300 hover:bg-red-500/20 hover:border-red-400/50 transition-colors border border-white/20 bg-white/10 shadow-md hover:shadow-lg backdrop-blur-sm"
              aria-label={`Pass on ${company.name}`}
              data-no-drag="true"
            >
              {isGuestMode ? <Lock className="h-5 w-5 mb-1"/> : <X className="h-5 w-5 mb-1 text-white/90" />}
              Pass
            </Button>
            <Button
              variant="ghost"
              onClick={handleDetailsButtonClick}
              className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-xs font-medium text-white/80 hover:text-blue-300 hover:bg-blue-500/20 hover:border-blue-400/50 transition-colors border border-white/20 bg-white/10 shadow-md hover:shadow-lg backdrop-blur-sm"
              aria-label={`View details for ${company.name}`}
              data-no-drag="true"
              data-modal-trigger="true"
            >
              <Eye className="h-5 w-5 mb-1 text-white/90" />
              Profile
            </Button>
            <Button
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); if(!isGuestMode) handleLocalSwipeAction('like'); else toast({title: "Guest Mode", description: "Interactions disabled."}) }}
              disabled={isGuestMode}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-xs font-medium text-white/80 transition-colors border border-white/20 bg-white/10 shadow-md hover:shadow-lg backdrop-blur-sm",
                isLiked && !isGuestMode ? "ring-2 ring-pink-400 bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 hover:text-pink-200 hover:border-pink-400/70" : "hover:text-green-300 hover:bg-green-500/20 hover:border-green-400/50"
              )}
              aria-label={`Like ${company.name}`}
              data-no-drag="true"
            >
              {isGuestMode ? <Lock className="h-5 w-5 mb-1"/> : <Heart className={cn("h-5 w-5 mb-1 text-white/90", isLiked && !isGuestMode && "fill-pink-400 text-pink-400")} />}
              Like
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  disabled={isGuestMode}
                  className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-xs font-medium text-white/80 hover:text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50 transition-colors border border-white/20 bg-white/10 shadow-md hover:shadow-lg backdrop-blur-sm"
                  aria-label={`Share ${company.name}`}
                  data-no-drag="true"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isGuestMode ? <Lock className="h-5 w-5 mb-1"/> : <Share2 className="h-5 w-5 mb-1 text-white/90" />}
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-slate-700 border-slate-600 text-white" data-no-drag="true">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('copy'); }} className="hover:!bg-slate-600 focus:!bg-slate-600" data-no-drag="true"><LinkIcon className="mr-2 h-4 w-4" /> Copy Link</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('email'); }} className="hover:!bg-slate-600 focus:!bg-slate-600" data-no-drag="true"><Mail className="mr-2 h-4 w-4" /> Email</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('linkedin'); }} className="hover:!bg-slate-600 focus:!bg-slate-600" data-no-drag="true"><Linkedin className="mr-2 h-4 w-4" /> LinkedIn</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareAction('twitter'); }} className="hover:!bg-slate-600 focus:!bg-slate-600" data-no-drag="true"><Twitter className="mr-2 h-4 w-4" /> X / Twitter</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                <h3 className="text-lg font-semibold text-custom-light-purple-text mb-1.5 flex items-center"><Building className="mr-2 h-5 w-5" /> About {company.name}</h3>
                <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                  {displayedCompanyDescriptionInModal}
                  {companyDescriptionForModal.length > MAX_COMPANY_DESCRIPTION_LENGTH_MODAL_INITIAL && (
                      <Button variant="link" size="sm" onClick={(e) => {e.stopPropagation(); setShowFullCompanyDescriptionInModal(!showFullCompanyDescriptionInModal);}} className="text-custom-primary-purple hover:underline p-0 h-auto ml-1 text-xs font-semibold" data-no-drag="true">
                          {showFullCompanyDescriptionInModal ? "Read less" : "Read more"}
                      </Button>
                  )}
                </p>
              </section>
              <Separator className="my-3 bg-slate-700" />
              {jobOpening && (
                <>
                  <section>
                    <h3 className="text-lg font-semibold text-custom-light-purple-text mb-1.5 flex items-center"><BriefcaseIcon className="mr-2 h-5 w-5" /> Job Description: {jobOpening.title}</h3>
                    <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                      {displayedJobDescriptionInModal}
                      {jobDescriptionForModal.length > MAX_JOB_DESCRIPTION_LENGTH_MODAL_INITIAL && (
                          <Button variant="link" size="sm" onClick={(e) => {e.stopPropagation(); setShowFullJobDescriptionInModal(!showFullJobDescriptionInModal);}} className="text-custom-primary-purple hover:underline p-0 h-auto ml-1 text-xs font-semibold" data-no-drag="true">
                              {showFullJobDescriptionInModal ? "Read less" : "Read more"}
                          </Button>
                      )}
                    </p>
                  </section>
                  <Separator className="my-3 bg-slate-700" />
                  <section>
                    <h3 className="text-lg font-semibold text-custom-light-purple-text mb-2 flex items-center"><ListChecks className="mr-2 h-5 w-5" /> Key Job Details</h3>
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
                                {jobOpening.tags.map((tag) => (<Badge key={tag} variant="secondary" className="text-xs bg-custom-light-purple-skill-bg text-custom-primary-purple">{tag}</Badge>))}
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
                  <AccordionTrigger className="text-lg font-semibold text-custom-light-purple-text hover:no-underline data-[state=open]:text-custom-primary-purple"><div className="flex items-center"><Brain className="mr-2 h-5 w-5" /> AI: How This Job Fits You <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-400/70" /></div></AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3">
                    <p className="text-xs text-slate-400 italic mb-2">Our AI considers how this job aligns with your profile... (Customize weights in Settings).</p>
                    {isGuestMode ? (<div className="text-sm text-red-400 italic flex items-center p-3 border border-red-600 bg-red-900/30 rounded-md shadow-sm"><Lock className="h-4 w-4 mr-2"/>Sign in to get your personalized AI Fit Analysis.</div>)
                    : (<><Button onClick={() => fetchAiAnalysis(true)} disabled={isLoadingAiAnalysis || !!aiJobFitAnalysis} className="mb-2.5 w-full sm:w-auto bg-custom-primary-purple hover:bg-custom-primary-purple/80 text-white">{isLoadingAiAnalysis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}{aiJobFitAnalysis ? "Analysis Complete" : "Analyze My Fit for this Job"}</Button>
                        {isLoadingAiAnalysis && !aiJobFitAnalysis &&(<div className="flex items-center text-sm text-slate-400 py-1.5"><Loader2 className="mr-2 h-4 w-4 animate-spin" /><span>Assessing fit...</span></div>)}
                        {aiJobFitAnalysis && !isLoadingAiAnalysis && (<div className="space-y-2 p-3 border border-slate-700 rounded-lg bg-slate-700/30 shadow-sm"><div className="flex items-baseline"><span className="text-md font-semibold text-white">Your Fit Score:</span><span className={cn("ml-1.5 font-bold text-xl",aiJobFitAnalysis.matchScoreForCandidate >= 75 ? 'text-green-400' : aiJobFitAnalysis.matchScoreForCandidate >= 50 ? 'text-yellow-400' : 'text-red-400')}>{aiJobFitAnalysis.matchScoreForCandidate}%</span></div><p className="text-sm text-slate-300 italic leading-relaxed">{aiJobFitAnalysis.reasoningForCandidate}</p>
                        {aiJobFitAnalysis.weightedScoresForCandidate && (<div className="pt-2 mt-2 border-t border-slate-700/70"><p className="font-medium text-white text-sm mb-1">Score Breakdown:</p><ul className="list-none space-y-0.5 text-xs text-slate-300"><li>Culture Fit: <span className="font-semibold text-white">{aiJobFitAnalysis.weightedScoresForCandidate.cultureFitScore}%</span></li><li>Job Relevance: <span className="font-semibold text-white">{aiJobFitAnalysis.weightedScoresForCandidate.jobRelevanceScore}%</span></li><li>Growth Opportunity: <span className="font-semibold text-white">{aiJobFitAnalysis.weightedScoresForCandidate.growthOpportunityScore}%</span></li><li>Job Conditions: <span className="font-semibold text-white">{aiJobFitAnalysis.weightedScoresForCandidate.jobConditionFitScore}%</span></li></ul></div>)}</div>)}</>)}
                  </AccordionContent>
                </AccordionItem>
                <Separator className="my-3 bg-slate-700" />
                <AccordionItem value="company-qa" className="border-b-0">
                  <AccordionTrigger className="text-lg font-semibold text-custom-light-purple-text hover:no-underline data-[state=open]:text-custom-primary-purple"><div className="flex items-center"><MessageSquare className="mr-2 h-5 w-5" /> Ask AI About {company.name} <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-400/70" /></div></AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3">
                    {isGuestMode ? (<div className="text-sm text-red-400 italic flex items-center p-3 border border-red-600 bg-red-900/30 rounded-md shadow-sm"><Lock className="h-4 w-4 mr-2"/>Sign in to ask the AI questions.</div>)
                    : (<div className="space-y-2.5"><Textarea id="userCompanyQuestion" placeholder="e.g., What are the main products? What is the team size for this role?" value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)} disabled={isAskingQuestion} className="min-h-[80px] text-sm bg-slate-700 border-slate-600 placeholder-slate-400 text-white" />
                        <Button onClick={handleAskQuestion} disabled={isAskingQuestion || !userQuestion.trim()} className="w-full sm:w-auto bg-custom-primary-purple hover:bg-custom-primary-purple/80 text-white">{isAskingQuestion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HelpCircle className="mr-2 h-4 w-4" />}Ask AI</Button>
                        {isAskingQuestion && !aiAnswer && (<div className="flex items-center text-sm text-slate-400 py-1.5"><Loader2 className="mr-2 h-4 w-4 animate-spin" /><span>Thinking...</span></div>)}
                        {aiAnswer && (<div className="pt-1.5"><h4 className="font-semibold text-md text-white mb-1">AI's Answer:</h4><div className="p-3 border border-slate-700 rounded-md bg-slate-700/30 text-sm text-slate-300 whitespace-pre-line leading-relaxed shadow-sm">{aiAnswer}</div></div>)}
                      </div>)}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Separator className="my-3 bg-slate-700" />
              {company.cultureHighlights && company.cultureHighlights.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-custom-light-purple-text mb-2 flex items-center"><Users2 className="mr-2 h-5 w-5" /> Culture Highlights</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {company.cultureHighlights.map((highlight) => (<Badge key={highlight} variant="outline" className="text-sm border-custom-primary-purple/70 text-custom-primary-purple bg-custom-primary-purple/10">{highlight}</Badge>))}
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

