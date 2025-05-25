
import type { Company, ProfileRecommenderOutput, CandidateProfileForAI, JobCriteriaForAI } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Briefcase as JobTypeIcon, DollarSign, HelpCircle, Sparkles, Percent, Loader2 } from 'lucide-react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { recommendProfile } from '@/ai/flows/profile-recommender';
import { useToast } from '@/hooks/use-toast';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types'; // Import enums

interface CompanyCardContentProps {
  company: Company;
  onSwipeAction: (companyId: string, action: 'like' | 'pass' | 'details' | 'save' | 'superlike') => void;
}

const MAX_DESCRIPTION_LENGTH = 100;

export function CompanyCardContent({ company, onSwipeAction }: CompanyCardContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const SWIPE_THRESHOLD = 75;
  const MAX_ROTATION = 10;

  const [aiJobFitAnalysis, setAiJobFitAnalysis] = useState<ProfileRecommenderOutput['candidateJobFitAnalysis'] | null>(null);
  const [isLoadingAiAnalysis, setIsLoadingAiAnalysis] = useState(false);
  const { toast } = useToast();

  const fetchAiAnalysis = useCallback(async () => {
    if (!company || !company.jobOpenings || company.jobOpenings.length === 0) {
      return;
    }
    setIsLoadingAiAnalysis(true);
    setAiJobFitAnalysis(null);

    try {
      const jobSeekerProfile: CandidateProfileForAI = {
        id: 'currentUserProfile', // Placeholder ID for the current user
        role: localStorage.getItem('jobSeekerProfileHeadline') || undefined,
        experienceSummary: localStorage.getItem('jobSeekerExperienceSummary') || undefined,
        skills: localStorage.getItem('jobSeekerSkills')?.split(',').map(s => s.trim()).filter(s => s) || [],
        location: localStorage.getItem('userAddressSettings') || localStorage.getItem('userCountrySettings') || undefined,
        desiredWorkStyle: localStorage.getItem('jobSeekerDesiredWorkStyle') || undefined,
        pastProjects: localStorage.getItem('jobSeekerPastProjects') || undefined,
        // The following fields are not yet in MyProfilePage.tsx, so pass undefined or defaults
        // If these were enums, ensure they are correctly typed or mapped
        workExperienceLevel: WorkExperienceLevel.UNSPECIFIED, // Placeholder
        educationLevel: EducationLevel.UNSPECIFIED, // Placeholder
        locationPreference: LocationPreference.UNSPECIFIED, // Placeholder
        // salaryExpectationMin, salaryExpectationMax, availability, jobTypePreference would also be fetched if available
      };
      
      const currentJobOpening = company.jobOpenings[0];
      const jobCriteria: JobCriteriaForAI = {
        title: currentJobOpening.title,
        description: currentJobOpening.description,
        requiredSkills: currentJobOpening.tags || [],
        requiredExperienceLevel: currentJobOpening.requiredExperienceLevel || WorkExperienceLevel.UNSPECIFIED,
        requiredEducationLevel: currentJobOpening.requiredEducationLevel || EducationLevel.UNSPECIFIED,
        workLocationType: currentJobOpening.workLocationType || LocationPreference.UNSPECIFIED,
        jobLocation: currentJobOpening.location || undefined,
        requiredLanguages: currentJobOpening.requiredLanguages || [],
        salaryMin: currentJobOpening.salaryMin,
        salaryMax: currentJobOpening.salaryMax,
        jobType: currentJobOpening.jobType || JobType.UNSPECIFIED,
        companyCultureKeywords: currentJobOpening.companyCultureKeywords || [],
        companyIndustry: currentJobOpening.companyIndustry || undefined,
      };

      const result = await recommendProfile({ candidateProfile: jobSeekerProfile, jobCriteria });
      if (result.candidateJobFitAnalysis) {
        setAiJobFitAnalysis(result.candidateJobFitAnalysis);
      } else {
        toast({ title: "AI Analysis Note", description: "Could not generate a detailed job fit analysis at this time.", variant: "default" });
      }
    } catch (error) {
      console.error("Error fetching AI job fit analysis:", error);
      toast({ title: "AI Analysis Error", description: "Failed to get AI insights for this job.", variant: "destructive" });
    } finally {
      setIsLoadingAiAnalysis(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, toast]);


  useEffect(() => {
    fetchAiAnalysis();
  }, [fetchAiAnalysis]);


  useEffect(() => {
    const currentVideoRef = videoRef.current;
    if (!currentVideoRef) return;

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

    if (currentVideoRef) {
        observer.observe(currentVideoRef);
    }

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
      observer.disconnect();
    };
  }, [company.introVideoUrl]);

  const jobOpening = company.jobOpenings && company.jobOpenings.length > 0 ? company.jobOpenings[0] : null;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = e.target as HTMLElement;
     if (targetElement.closest('video[controls]') || targetElement.closest('button') || targetElement.closest('a') || targetElement.closest('[data-no-drag="true"]') || targetElement.closest('.no-swipe-area')) {
      // Check if click is on video controls bar
      if (targetElement.tagName === 'VIDEO') {
        const video = targetElement as HTMLVideoElement;
        const rect = video.getBoundingClientRect();
        if (e.clientY > rect.bottom - 40) { // Approximate height of controls bar
          return;
        }
      } else if (targetElement.closest('video[controls]') && !targetElement.classList.contains('no-swipe-area')) {
         // If it's part of the video but not explicitly no-swipe (like the video element itself), allow swipe
      } else {
        return; // Don't start drag if on button, link, or specifically marked no-drag area
      }
    }

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
    if (!isDragging || !cardContentRef.current) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !cardContentRef.current) return;

    const finalDeltaX = e.clientX - startX;
    
    cardContentRef.current.style.transition = 'transform 0.3s ease-out'; 
    setCurrentX(startX); 

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
    document.body.style.userSelect = ''; 
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && cardContentRef.current) {
      cardContentRef.current.style.transition = 'transform 0.3s ease-out';
      setCurrentX(startX); 
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

  const toggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setShowFullDescription(!showFullDescription);
  };
  
  const descriptionText = jobOpening ? jobOpening.description : company.description;
  const displayedDescription = showFullDescription
    ? descriptionText
    : descriptionText.slice(0, MAX_DESCRIPTION_LENGTH) + (descriptionText.length > MAX_DESCRIPTION_LENGTH ? "..." : "");

  return (
    <div
      ref={cardContentRef}
      className="flex flex-col h-full overflow-hidden relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ 
        cursor: 'grab',
        transform: getCardTransform(),
      }}
    >
      <div className="relative w-full bg-muted shrink-0 h-[60%] max-h-[60vh]"> {/* Ensure video doesn't take too much screen */}
        {company.introVideoUrl ? (
          <video
            ref={videoRef}
            src={company.introVideoUrl}
            controls
            muted
            loop
            playsInline
            className="w-full h-full object-cover bg-black"
            data-ai-hint="company video"
            poster={company.logoUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(company.name)}`}
            data-no-drag="true"
          >
            Your browser does not support the video tag.
          </video>
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
            <Building className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex-grow flex flex-col overflow-y-auto overscroll-y-contain no-scrollbar h-[40%]">
        <CardHeader className="p-0 mb-1.5 sm:mb-2">
          <CardTitle className="text-lg sm:text-xl font-bold text-primary truncate">{company.name}</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">{company.industry}</CardDescription>
          {jobOpening && (
            <p className="text-base sm:text-lg font-semibold text-foreground mt-0.5 sm:mt-1 line-clamp-2">{jobOpening.title}</p>
          )}
        </CardHeader>

        <CardContent className="p-0 mb-2 sm:mb-3 space-y-1 sm:space-y-1.5 text-xs sm:text-sm">
          {jobOpening?.location && (
             <div className="flex items-center text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span>{jobOpening.location}</span>
            </div>
          )}
           {(jobOpening?.salaryRange || company.salaryRange) && (
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span>{jobOpening?.salaryRange || company.salaryRange}</span>
            </div>
          )}
          {(jobOpening?.jobType || company.jobType) && (
            <div className="flex items-center text-muted-foreground">
              <JobTypeIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span>{jobOpening?.jobType || company.jobType}</span>
            </div>
          )}

          <p className="text-muted-foreground pt-1">
            {displayedDescription}
            {descriptionText.length > MAX_DESCRIPTION_LENGTH && (
              <button onClick={toggleDescription} className="text-primary hover:underline ml-1 text-xs font-semibold" data-no-drag="true">
                {showFullDescription ? "Read less" : "Read more"}
              </button>
            )}
          </p>

          {company.cultureHighlights && company.cultureHighlights.length > 0 && (
            <div className="mt-1.5 sm:mt-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Culture:</h4>
              <div className="flex flex-wrap gap-1">
                {company.cultureHighlights.slice(0, 3).map((highlight) => (
                  <Badge key={highlight} variant="secondary" className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5">{highlight}</Badge>
                ))}
                 {company.cultureHighlights.length > 3 && <Badge variant="outline" className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5">+{company.cultureHighlights.length-3} more</Badge>}
              </div>
            </div>
          )}
        </CardContent>

        {/* AI Job Fit Analysis Section */}
        <div className="mt-auto pt-2 border-t border-border/50 space-y-2">
          {isLoadingAiAnalysis && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing job fit...
            </div>
          )}
          {aiJobFitAnalysis && !isLoadingAiAnalysis && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-accent" />
                AI Job Fit For You
              </h4>
              <div className="text-sm text-foreground mb-1">
                <span className="font-semibold">Your Fit Score:</span> 
                <span className={`ml-1 font-bold ${aiJobFitAnalysis.matchScoreForCandidate >= 75 ? 'text-green-600' : aiJobFitAnalysis.matchScoreForCandidate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                   {aiJobFitAnalysis.matchScoreForCandidate}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground italic line-clamp-2">
                {aiJobFitAnalysis.reasoningForCandidate}
              </p>
              {/* Optional: Display weightedScoresForCandidate if needed */}
            </div>
          )}
          <Button variant="outline" size="sm" className="w-full text-muted-foreground" disabled>
            <HelpCircle className="mr-2 h-4 w-4" />
            Instant Q&A (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
}
