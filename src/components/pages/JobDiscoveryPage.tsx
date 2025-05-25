
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Company, JobFilters } from '@/lib/types'; 
import { WorkExperienceLevel, EducationLevel, LocationPreference, JobType } from '@/lib/types'; 
import { mockCompanies as staticMockCompanies } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Info, Star, Save, Loader2, SearchX, Filter, X, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; 
import { JobFilterPanel } from "@/components/filters/JobFilterPanel"; 
import { Badge } from '@/components/ui/badge'; 
import { fetchJobsFromBackend } from '@/services/jobService';


const ITEMS_PER_BATCH = 3;

interface JobDiscoveryPageProps {
  searchTerm?: string;
}

const initialJobFilters: JobFilters = {
  experienceLevels: new Set(),
  educationLevels: new Set(),
  workLocationTypes: new Set(),
  jobTypes: new Set(),
};

export function JobDiscoveryPage({ searchTerm = "" }: JobDiscoveryPageProps) {
  const [masterJobFeed, setMasterJobFeed] = useState<Company[]>([]);
  const [displayedCompanies, setDisplayedCompanies] = useState<Company[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks index within filteredJobFeed
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false); 

  const [activeFilters, setActiveFilters] = useState<JobFilters>(initialJobFilters);

  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  const [superLikedCompanies, setSuperLikedCompanies] = useState<Set<string>>(new Set());
  const [passedCompanies, setPassedCompanies] = useState<Set<string>>(new Set());
  const [savedCompanies, setSavedCompanies] = useState<Set<string>>(new Set());

  const [nextPageCursor, setNextPageCursor] = useState<string | undefined>(undefined);


  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  // Refs for CompanyCardContent instances to trigger their detail modals
  const companyCardRefs = useRef<Record<string, { openDetailsModal: () => void }>>({});


  const loadAndSetInitialJobs = useCallback(async () => {
    setIsInitialLoading(true);
    setIsLoading(true); 
    try {
      const { jobs: initialJobs, hasMore: initialHasMore, nextCursor: initialNextCursor } = await fetchJobsFromBackend();
      const combinedJobs = [
        ...initialJobs,
        ...staticMockCompanies.filter(mc => !initialJobs.find(upj => upj.id === mc.id))
      ];
      
      setMasterJobFeed(combinedJobs);
      setNextPageCursor(initialNextCursor);
    } catch (error) {
      console.error("Failed to load initial jobs:", error);
      setMasterJobFeed(staticMockCompanies); 
      toast({ title: "Error", description: "Could not load initial job listings.", variant: "destructive" });
    } finally {
      setIsInitialLoading(false);
      setIsLoading(false); 
    }
  }, [toast]);

  useEffect(() => {
    loadAndSetInitialJobs();
    const storedLiked = localStorage.getItem('likedCompaniesDemo');
    if (storedLiked) setLikedCompanies(new Set(JSON.parse(storedLiked)));
    const storedSuperLiked = localStorage.getItem('superLikedCompaniesDemo');
    if (storedSuperLiked) setSuperLikedCompanies(new Set(JSON.parse(storedSuperLiked)));
    const storedPassed = localStorage.getItem('passedCompaniesDemo');
    if (storedPassed) setPassedCompanies(new Set(JSON.parse(storedPassed)));
    const storedSaved = localStorage.getItem('savedCompaniesDemo');
    if (storedSaved) setSavedCompanies(new Set(JSON.parse(storedSaved)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredJobFeed = useMemo(() => {
    if (isInitialLoading) return []; 

    let companies = [...masterJobFeed];
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (activeFilters.experienceLevels.size > 0) {
      companies = companies.filter(c => c.jobOpenings?.some(job => job.requiredExperienceLevel && activeFilters.experienceLevels.has(job.requiredExperienceLevel)));
    }
    if (activeFilters.educationLevels.size > 0) {
      companies = companies.filter(c => c.jobOpenings?.some(job => job.requiredEducationLevel && activeFilters.educationLevels.has(job.requiredEducationLevel)));
    }
    if (activeFilters.workLocationTypes.size > 0) {
      companies = companies.filter(c => c.jobOpenings?.some(job => job.workLocationType && activeFilters.workLocationTypes.has(job.workLocationType)));
    }
    if (activeFilters.jobTypes.size > 0) {
      companies = companies.filter(c => c.jobOpenings?.some(job => job.jobType && activeFilters.jobTypes.has(job.jobType)));
    }

    if (searchTerm.trim()) {
      companies = companies.filter(company => {
        const jobOpening = company.jobOpenings && company.jobOpenings[0];
        return (
          company.name.toLowerCase().includes(lowerSearchTerm) ||
          (company.industry && company.industry.toLowerCase().includes(lowerSearchTerm)) ||
          (jobOpening && jobOpening.title.toLowerCase().includes(lowerSearchTerm)) ||
          (jobOpening && jobOpening.description.toLowerCase().includes(lowerSearchTerm)) ||
          (jobOpening && jobOpening.tags && jobOpening.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))) ||
          (jobOpening && jobOpening.location && jobOpening.location.toLowerCase().includes(lowerSearchTerm))
        );
      });
    }
    return companies;
  }, [masterJobFeed, activeFilters, searchTerm, isInitialLoading]);

  const loadMoreCompaniesFromLocal = useCallback(() => {
    if (isLoading || !hasMore || currentIndex >= filteredJobFeed.length) {
      if (currentIndex >= filteredJobFeed.length) setHasMore(false);
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      const newLoadIndex = currentIndex + ITEMS_PER_BATCH;
      const newBatch = filteredJobFeed.slice(currentIndex, newLoadIndex);

      setDisplayedCompanies(prevDisplayed => {
        const prevIds = new Set(prevDisplayed.map(c => c.id));
        const uniqueNewItems = newBatch.filter(item => !prevIds.has(item.id));
        return [...prevDisplayed, ...uniqueNewItems];
      });

      setCurrentIndex(newLoadIndex);
      setHasMore(newLoadIndex < filteredJobFeed.length);
      setIsLoading(false);
    }, 700);
  }, [isLoading, hasMore, currentIndex, filteredJobFeed]);
  
  useEffect(() => {
    if (isInitialLoading) return; 

    setDisplayedCompanies([]);
    setCurrentIndex(0); 
    
    const hasFilteredItems = filteredJobFeed.length > 0;
    setHasMore(hasFilteredItems); 

    if (hasFilteredItems) {
      setIsLoading(false); 
      
      const newLoadIndex = 0 + ITEMS_PER_BATCH;
      const newBatch = filteredJobFeed.slice(0, newLoadIndex);
      setDisplayedCompanies(newBatch);
      setCurrentIndex(newLoadIndex);
      setHasMore(newLoadIndex < filteredJobFeed.length);
    } else {
      setDisplayedCompanies([]);
      setCurrentIndex(0);
      setHasMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJobFeed, isInitialLoading]); 

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading && !isInitialLoading) {
        loadMoreCompaniesFromLocal(); 
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 300px 0px' });
    if (loadMoreTriggerRef.current) {
      observer.current.observe(loadMoreTriggerRef.current);
    }
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, isLoading, isInitialLoading, loadMoreCompaniesFromLocal]);

  const updateLocalStorageSet = (key: string, set: Set<string>) => {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  };

  const handleAction = (companyId: string, action: 'like' | 'pass' | 'details' | 'save' | 'superlike' | 'share') => {
    const company = masterJobFeed.find(c => c.id === companyId);
    if (!company) return;
    
    if (action === 'details') {
      const cardRef = companyCardRefs.current[companyId];
      // @ts-ignore // Assuming CompanyCardContent exposes openDetailsModal via ref
      if (cardRef && typeof cardRef.openDetailsModal === 'function') { 
        // @ts-ignore
        cardRef.openDetailsModal();
      } else {
         // Fallback or direct state manipulation if CompanyCardContent handles modal itself
         // This relies on CompanyCardContent's internal logic to open its modal
         // when its onSwipeAction prop is called with 'details'.
         // We find the CompanyCardContent for this company and trigger its detail opening logic.
         // This is a bit indirect, ideally a more direct prop or method call would be used.
         // For now, we assume CompanyCardContent listens for the 'details' action.
         const companyCardContentComponent = displayedCompanies.find(c => c.id === companyId);
         if (companyCardContentComponent) {
            // No direct method call here. The CompanyCardContent's own effect handling `onSwipeAction`
            // will manage opening its modal if it receives the 'details' action.
            // This part of the logic is now primarily inside CompanyCardContent.
         }
      }
      return; // Details action is handled, no further state changes here for like/pass etc.
    }


    let message = "";
    let toastVariant: "default" | "destructive" = "default";
    const newLiked = new Set(likedCompanies);
    const newSuperLiked = new Set(superLikedCompanies);
    const newPassed = new Set(passedCompanies);
    const newSaved = new Set(savedCompanies);

    if (action !== 'pass') newPassed.delete(companyId);
    if (action !== 'like' && action !== 'superlike') newLiked.delete(companyId);
    if (action !== 'superlike') newSuperLiked.delete(companyId);

    if (action === 'like') {
      newLiked.add(companyId);
      message = `Interested in ${company.name}`;
      if (Math.random() > 0.7) {
        toast({
          title: "🎉 Company Interested!",
          description: `${company.name} shows interest! Check 'My Matches' to start a conversation.`,
          duration: 7000,
        });
      } else {
        toast({ title: message, variant: toastVariant });
      }
    } else if (action === 'pass') {
      newPassed.add(companyId);
      newLiked.delete(companyId);
      newSuperLiked.delete(companyId);
      message = `Passed on ${company.name}`;
      toastVariant = "destructive";
      toast({ title: message, variant: toastVariant });
    } else if (action === 'superlike') {
      newSuperLiked.add(companyId);
      newLiked.add(companyId);
      message = `Super liked ${company.name}!`;
      if (Math.random() > 0.5) {
        toast({
          title: "🎉 Company Super Interested!",
          description: `${company.name} is very interested! Check 'My Matches' to start a conversation.`,
          duration: 7000,
        });
      } else {
        toast({ title: message });
      }
    } else if (action === 'save') {
      if (newSaved.has(companyId)) {
        newSaved.delete(companyId);
        message = `Unsaved ${company.name}.`;
      } else {
        newSaved.add(companyId);
        message = `Saved ${company.name}!`;
      }
      toast({ title: message });
    } else if (action === 'share') {
      // Share logic is inside CompanyCardContent
      return; 
    }
    setLikedCompanies(newLiked); updateLocalStorageSet('likedCompaniesDemo', newLiked);
    setSuperLikedCompanies(newSuperLiked); updateLocalStorageSet('superLikedCompaniesDemo', newSuperLiked);
    setPassedCompanies(newPassed); updateLocalStorageSet('passedCompaniesDemo', newPassed);
    setSavedCompanies(newSaved); updateLocalStorageSet('savedCompaniesDemo', newSaved);
  };

  const handleFilterChange = <K extends keyof JobFilters>(
    filterType: K,
    value: JobFilters[K] extends Set<infer T> ? T : never,
    isChecked: boolean
  ) => {
    setActiveFilters(prevFilters => {
      const newSet = new Set(prevFilters[filterType] as Set<any>);
      if (isChecked) {
        newSet.add(value);
      } else {
        newSet.delete(value);
      }
      return { ...prevFilters, [filterType]: newSet };
    });
  };

  const handleClearFilters = () => {
    setActiveFilters(initialJobFilters);
  };

  const handleApplyFilters = () => {
    setIsSheetOpen(false);
  };

  const countActiveFilters = () => {
    let count = 0;
    Object.values(activeFilters).forEach(filterSet => count += filterSet.size);
    return count;
  };
  const numActiveFilters = countActiveFilters();

  const fixedElementsHeight = '160px'; // Adjust as needed
  const visibleCompanies = displayedCompanies.filter(c => !passedCompanies.has(c.id));

  if (isInitialLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-2 sm:p-3 sticky top-0 bg-background z-10 border-b">
         <div className="max-w-xl mx-auto flex justify-between items-center">
           <h2 className="text-lg font-semibold text-primary">Discover Jobs</h2>
            <Button variant="outline" size="sm" disabled><Filter className="mr-2 h-4 w-4" /> Filters</Button>
          </div>
        </div>
        <div className="flex flex-grow items-center justify-center bg-background" style={{ height: `calc(100vh - ${fixedElementsHeight})` }}>
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 sm:p-3 sticky top-0 bg-background z-10 border-b">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-primary">Discover Jobs</h2>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {numActiveFilters > 0 && (
                  <Badge variant="secondary" className="ml-2">{numActiveFilters}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm p-0">
              <JobFilterPanel 
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                onApplyFilters={handleApplyFilters}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div
        className="w-full snap-y snap-mandatory overflow-y-auto scroll-smooth no-scrollbar flex-grow"
        style={{ height: `calc(100vh - ${fixedElementsHeight})` }} 
        tabIndex={0}
      >
        {visibleCompanies.map(company => (
          <div
            key={company.id}
            className="h-full snap-start snap-always flex flex-col items-center justify-center p-1 bg-background"
          >
            <SwipeCard
              className={`w-full max-w-xl h-full flex flex-col
                          ${superLikedCompanies.has(company.id) ? 'ring-2 ring-accent shadow-accent/30' : likedCompanies.has(company.id) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'}`}
            >
              {/* 
                To explicitly control the modal from here, CompanyCardContent would need to expose a method via useImperativeHandle.
                For now, CompanyCardContent itself listens to the 'details' action via its onSwipeAction prop.
              */}
              <CompanyCardContent 
                company={company} 
                onSwipeAction={(id, action) => handleAction(id, action)} 
                // ref={el => companyCardRefs.current[company.id] = el} // Example if using ref
              />
              <CardFooter className="p-2 sm:p-3 grid grid-cols-6 gap-1 sm:gap-2 border-t bg-card shrink-0">
                <Button variant="ghost" size="sm" className="flex-col h-auto py-1.5 sm:py-2 hover:bg-destructive/10 text-destructive hover:text-destructive" onClick={() => handleAction(company.id, 'pass')} aria-label={`Pass on ${company.name}`}>
                  <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" /> <span className="text-xs">Pass</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex-col h-auto py-1.5 sm:py-2 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600" onClick={() => handleAction(company.id, 'details')} aria-label={`View details for ${company.name}`}>
                  <Info className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" /> <span className="text-xs">Details</span>
                </Button>
                <Button variant="ghost" size="sm" className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-accent/10 ${superLikedCompanies.has(company.id) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`} onClick={() => handleAction(company.id, 'superlike')} aria-label={`Superlike ${company.name}`}>
                  <Star className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${superLikedCompanies.has(company.id) ? 'fill-accent' : ''}`} /> <span className="text-xs">Superlike</span>
                </Button>
                <Button variant="ghost" size="sm" className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-green-500/10 ${likedCompanies.has(company.id) && !superLikedCompanies.has(company.id) ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`} onClick={() => handleAction(company.id, 'like')} aria-label={`Apply to ${company.name}`}>
                  <ThumbsUp className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${likedCompanies.has(company.id) && !superLikedCompanies.has(company.id) ? 'fill-green-500' : ''}`} /> <span className="text-xs">Apply</span>
                </Button>
                <Button variant="ghost" size="sm" className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-primary/10 ${savedCompanies.has(company.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} onClick={() => handleAction(company.id, 'save')} aria-label={`Save ${company.name}`}>
                  <Save className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${savedCompanies.has(company.id) ? 'fill-primary' : ''}`} /> <span className="text-xs">Save</span>
                </Button>
                 <Button variant="ghost" size="sm" className="flex-col h-auto py-1.5 sm:py-2 hover:bg-gray-500/10 text-muted-foreground hover:text-gray-600" onClick={() => onSwipeAction(company.id, 'share')} aria-label={`Share ${company.name}`}>
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" /> <span className="text-xs">Share</span>
                </Button>
              </CardFooter>
            </SwipeCard>
          </div>
        ))}

        {isLoading && !isInitialLoading && (
          <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-4 text-muted-foreground bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p>Loading more jobs...</p>
          </div>
        )}

        {hasMore && !isLoading && !isInitialLoading && filteredJobFeed.length > 0 && (
           <div
             ref={loadMoreTriggerRef}
             className="h-full snap-start snap-always flex items-center justify-center text-muted-foreground"
           >
             {/* Invisible trigger for infinite scroll */}
           </div>
        )}

        {!isLoading && !hasMore && visibleCompanies.length === 0 && (searchTerm || numActiveFilters > 0) && (
           <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-background">
              <SearchX className="h-20 w-20 text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-3 text-foreground">No Jobs Found</h2>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
        )}

        {!isLoading && !hasMore && visibleCompanies.length === 0 && !searchTerm && numActiveFilters === 0 && (
           <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-background">
              <SearchX className="h-20 w-20 text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-3 text-foreground">No More Jobs</h2>
              <p className="text-muted-foreground">You've seen all opportunities for now. Try again later!</p>
            </div>
        )}
      </div>
    </div>
  );
}

    