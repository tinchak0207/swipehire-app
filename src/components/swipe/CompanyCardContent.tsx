
import type { Company, ProfileRecommenderOutput, CandidateProfileForAI, JobCriteriaForAI, CompanyQAInput } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Briefcase as JobTypeIcon, DollarSign, HelpCircle, Sparkles, Percent, Loader2, Share2, MessageSquare, Info, Brain, ThumbsUp, ThumbsDown, Star, Save } from 'lucide-react';
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

interface CompanyCardContentProps {
  company: Company;
  onSwipeAction: (companyId: string, action: 'like' | 'pass' | 'details' | 'save' | 'superlike' | 'share') => void;
  isLiked: boolean;
  isSuperLiked: boolean;
  isSaved: boolean;
}

const MAX_DESCRIPTION_LENGTH = 100;

export function CompanyCardContent({ company, onSwipeAction, isLiked, isSuperLiked, isSaved }: CompanyCardContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const SWIPE_THRESHOLD = 75;
  const MAX_ROTATION = 10;

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [aiJobFitAnalysis, setAiJobFitAnalysis] = useState<ProfileRecommenderOutput['candidateJobFitAnalysis'] | null>(null);
  const [isLoadingAiAnalysis, setIsLoadingAiAnalysis] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);


  const jobOpening = company.jobOpenings && company.jobOpenings.length > 0 ? company.jobOpenings[0] : null;

  const handleDetailsButtonClick = () => {
    setAiJobFitAnalysis(null);
    setIsLoadingAiAnalysis(false);
    setUserQuestion("");
    setAiAnswer(null);
    setIsAskingQuestion(false);
    setShowFullDescription(false); // Reset description view when opening modal
    setIsDetailsModalOpen(true);
  };

  const fetchAiAnalysis = useCallback(async () => {
    if (!company || !jobOpening) {
      toast({ title: "Job details missing", description: "Cannot analyze fit without job details.", variant: "destructive" });
      return;
    }
    setIsLoadingAiAnalysis(true);
    setAiJobFitAnalysis(null);

    try {
      const candidateForAI: CandidateProfileForAI = {
        id: 'currentUserProfile', // Placeholder ID
        role: localStorage.getItem('jobSeekerProfileHeadline') || undefined,
        experienceSummary: localStorage.getItem('jobSeekerExperienceSummary') || undefined,
        skills: localStorage.getItem('jobSeekerSkills')?.split(',').map(s => s.trim()).filter(s => s) || [],
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
      }
    } catch (error: any) {
      console.error("Error fetching AI job fit analysis for company " + company.name + ":", error);
      toast({ title: "AI Analysis Error", description: `Failed to get AI insights. ${error.message || 'Ensure your profile is up to date.'}`, variant: "destructive" });
    } finally {
      setIsLoadingAiAnalysis(false);
    }
  }, [company, jobOpening, toast]);

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
    const targetElement = e.target as HTMLElement;
    if (targetElement.closest('video[controls], button, a, [data-no-drag="true"], .no-swipe-area, [role="dialog"], input, textarea, [role="listbox"], [role="option"]')) {
      if (targetElement.tagName === 'VIDEO' && targetElement.hasAttribute('controls')) {
        const video = targetElement as HTMLVideoElement;
        const rect = video.getBoundingClientRect();
        if (e.clientY > rect.bottom - 40) { // Check if click is on controls area
            return;
        }
      } else if (targetElement.closest('button, a, [data-no-drag="true"], [role="dialog"], input, textarea, [role="listbox"], [role="option"]')) {
        return; // Do not initiate drag if clicking interactive elements
      }
    }
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX); // Initialize currentX
    if (cardContentRef.current) {
      cardContentRef.current.style.cursor = 'grabbing';
      cardContentRef.current.style.transition = 'none'; // No transition during drag
    }
    document.body.style.userSelect = 'none'; // Prevent text selection during drag
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !cardContentRef.current) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !cardContentRef.current) return;
    
    const finalDeltaX = e.clientX - startX; // Use clientX from the event
    if (cardContentRef.current) {
      cardContentRef.current.style.transition = 'transform 0.3s ease-out'; // Re-enable transition for snap back
    }
    setCurrentX(startX); // Reset for snap back effect

    if (Math.abs(finalDeltaX) > SWIPE_THRESHOLD) {
      if (finalDeltaX < 0) { 
        onSwipeAction(company.id, 'pass');
      } else { 
        onSwipeAction(company.id, 'like');
      }
    } else {
      if (cardContentRef.current) {
         cardContentRef.current.style.transform = 'translateX(0px) rotateZ(0deg)';
      }
    }
    
    setIsDragging(false);
    if (cardContentRef.current) {
      cardContentRef.current.style.cursor = 'grab';
    }
    document.body.style.userSelect = ''; // Re-enable text selection
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && cardContentRef.current) {
      cardContentRef.current.style.transition = 'transform 0.3s ease-out';
      setCurrentX(startX); // Reset for snap back
      if (cardContentRef.current) {
        cardContentRef.current.style.transform = 'translateX(0px) rotateZ(0deg)';
      }
      setIsDragging(false);
      cardContentRef.current.style.cursor = 'grab';
      document.body.style.userSelect = '';
    }
  };
  
  const getCardTransform = () => {
    if (!isDragging) return 'translateX(0px) rotateZ(0deg)';
    const deltaX = currentX - startX;
    const rotationFactor = Math.min(Math.abs(deltaX) / (SWIPE_THRESHOLD * 2), 1); 
    const rotation = MAX_ROTATION * (deltaX > 0 ? 1 : -1) * rotationFactor;
    return `translateX(${deltaX}px) rotateZ(${rotation}deg)`;
  };

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) {
      toast({ title: "Please enter a question", variant: "destructive" });
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

  const handleShare = async () => {
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
         toast({ title: "Share Failed", description: "Could not share at this moment.", variant: "destructive" });
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} See more at: ${shareUrl}`);
        toast({ title: "Copied to Clipboard!", description: "Job link copied." });
      } catch (err) {
        console.error('Failed to copy: ', err);
        toast({ title: "Copy Failed", description: "Could not copy link to clipboard.", variant: "destructive" });
      }
    }
  };

  const toggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFullDescription(!showFullDescription);
  };

  const jobDescriptionText = jobOpening?.description || "No job description available.";
  const displayedDescription = showFullDescription
    ? jobDescriptionText
    : jobDescriptionText.slice(0, MAX_DESCRIPTION_LENGTH) + (jobDescriptionText.length > MAX_DESCRIPTION_LENGTH ? "..." : "");


  return (
    <>
      <div
        ref={cardContentRef}
        className="flex flex-col h-full overflow-hidden relative bg-card cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: getCardTransform(),
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Main Collapsed Card View */}
        <div className="relative w-full bg-muted shrink-0 h-[50%] md:h-[55%] max-h-[calc(100vh_-_400px)] sm:max-h-[calc(100vh_-_350px)]">
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

        <div className="p-3 sm:p-4 flex-grow flex flex-col h-[50%] md:h-[45%] overflow-y-auto no-scrollbar overscroll-y-contain">
          <CardHeader className="p-0 mb-1.5 sm:mb-2">
            <CardTitle className="text-lg sm:text-xl font-bold text-primary truncate">{company.name}</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">{company.industry}</CardDescription>
            {jobOpening && (
              <p className="text-md sm:text-lg font-semibold text-foreground mt-0.5 sm:mt-1 line-clamp-1">{jobOpening.title}</p>
            )}
          </CardHeader>

          <CardContent className="p-0 space-y-1 text-xs sm:text-sm flex-grow overflow-hidden">
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
             {/* Truncated Job Description for collapsed view - now removed as per user request */}
          </CardContent>
            
          {/* Action Buttons moved inside CompanyCardContent */}
          <CardFooter className="p-0 pt-2 mt-auto grid grid-cols-6 gap-1 sm:gap-2 shrink-0">
            <Button variant="ghost" size="sm" className="flex-col h-auto py-1.5 sm:py-2 hover:bg-destructive/10 text-destructive hover:text-destructive" onClick={() => onSwipeAction(company.id, 'pass')} aria-label={`Pass on ${company.name}`}>
              <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" /> <span className="text-xs">Pass</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-col h-auto py-1.5 sm:py-2 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600" onClick={handleDetailsButtonClick} aria-label={`View details for ${company.name}`}>
              <Info className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" /> <span className="text-xs">Details</span>
            </Button>
            <Button variant="ghost" size="sm" className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-accent/10 ${isSuperLiked ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`} onClick={() => onSwipeAction(company.id, 'superlike')} aria-label={`Superlike ${company.name}`}>
              <Star className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${isSuperLiked ? 'fill-accent' : ''}`} /> <span className="text-xs">Superlike</span>
            </Button>
            <Button variant="ghost" size="sm" className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-green-500/10 ${isLiked && !isSuperLiked ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`} onClick={() => onSwipeAction(company.id, 'like')} aria-label={`Apply to ${company.name}`}>
              <ThumbsUp className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${isLiked && !isSuperLiked ? 'fill-green-500' : ''}`} /> <span className="text-xs">Apply</span>
            </Button>
            <Button variant="ghost" size="sm" className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-primary/10 ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} onClick={() => onSwipeAction(company.id, 'save')} aria-label={`Save ${company.name}`}>
              <Save className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${isSaved ? 'fill-primary' : ''}`} /> <span className="text-xs">Save</span>
            </Button>
             <Button variant="ghost" size="sm" className="flex-col h-auto py-1.5 sm:py-2 hover:bg-gray-500/10 text-muted-foreground hover:text-gray-600" onClick={handleShare} aria-label={`Share ${company.name}`}>
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" /> <span className="text-xs">Share</span>
            </Button>
          </CardFooter>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 sm:p-6 border-b">
            <DialogTitle className="text-2xl text-primary">
              {jobOpening?.title || "Company Details"} at {company.name}
            </DialogTitle>
            <CardDescription>{company.industry}</CardDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-6">
              {company.introVideoUrl && (
                <div className="relative w-full bg-muted aspect-video rounded-lg overflow-hidden shadow-md">
                  <video
                    ref={videoRef}
                    src={company.introVideoUrl}
                    controls
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    poster={company.logoUrl || `https://placehold.co/600x360.png?text=${encodeURIComponent(company.name)}`}
                    data-ai-hint="company introduction video"
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">About {company.name}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{company.description}</p>
              </div>

              {jobOpening && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Job Description: {jobOpening.title}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {displayedDescription}
                    {jobDescriptionText.length > MAX_DESCRIPTION_LENGTH && (
                        <Button 
                            variant="link" 
                            size="sm" 
                            onClick={toggleDescription} 
                            className="text-primary hover:underline p-0 h-auto ml-1 text-xs font-semibold"
                            data-no-drag="true"
                        >
                            {showFullDescription ? "Read less" : "Read more"}
                        </Button>
                    )}
                  </p>
                  <div className="mt-3 space-y-1 text-sm">
                    {jobOpening.location && <p><MapPin className="inline h-4 w-4 mr-2 text-muted-foreground" />Location: {jobOpening.location}</p>}
                    {jobOpening.salaryRange && <p><DollarSign className="inline h-4 w-4 mr-2 text-muted-foreground" />Salary: {jobOpening.salaryRange}</p>}
                    {jobOpening.jobType && <p><JobTypeIcon className="inline h-4 w-4 mr-2 text-muted-foreground" />Type: {jobOpening.jobType}</p>}
                  </div>
                </div>
              )}

              {company.cultureHighlights && company.cultureHighlights.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Culture Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {company.cultureHighlights.map((highlight) => (
                      <Badge key={highlight} variant="secondary">{highlight}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {jobOpening?.tags && jobOpening.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Job Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {jobOpening.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Fit Analysis Section */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-primary" /> AI: How This Job Fits You
                </h3>
                <Button onClick={fetchAiAnalysis} disabled={isLoadingAiAnalysis} className="mb-3 w-full sm:w-auto">
                  {isLoadingAiAnalysis ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Analyze My Fit for this Job
                </Button>
                {isLoadingAiAnalysis && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Assessing fit...</span>
                  </div>
                )}
                {aiJobFitAnalysis && !isLoadingAiAnalysis && (
                  <div className="space-y-1 p-3 bg-muted/50 rounded-md">
                    <div className="text-md text-foreground">
                      <span className="font-semibold">Your Fit Score:</span>
                      <span className={`ml-1.5 font-bold text-lg ${aiJobFitAnalysis.matchScoreForCandidate >= 75 ? 'text-green-600' : aiJobFitAnalysis.matchScoreForCandidate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
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
              </div>

              {/* Instant Q&A Section */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" /> Ask AI About {company.name}
                </h3>
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
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    