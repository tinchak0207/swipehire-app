
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Company, JobFilters } from '@/lib/types'; // Added JobFilters
import { WorkExperienceLevel, EducationLevel, LocationPreference, JobType } from '@/lib/types'; // Import enums
import { mockCompanies as staticMockCompanies } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Info, Star, Save, Loader2, SearchX, Filter, X } from 'lucide-react'; // Added Filter, X
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Added Sheet components
import { JobFilterPanel } from "@/components/filters/JobFilterPanel"; // New filter panel
import { Badge } from '@/components/ui/badge'; // For filter count

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // For filter sheet

  const [activeFilters, setActiveFilters] = useState<JobFilters>(initialJobFilters);

  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  const [superLikedCompanies, setSuperLikedCompanies] = useState<Set<string>>(new Set());
  const [passedCompanies, setPassedCompanies] = useState<Set<string>>(new Set());
  const [savedCompanies, setSavedCompanies] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsInitialLoading(true);
    setIsLoading(true);
    const storedUserPostedCompanies = localStorage.getItem('userPostedCompanies');
    const userPostedJobs: Company[] = storedUserPostedCompanies ? JSON.parse(storedUserPostedCompanies) : [];
    const combinedJobs = [
      ...userPostedJobs,
      ...staticMockCompanies.filter(mc => !userPostedJobs.find(upj => upj.id === mc.id))
    ];
    setMasterJobFeed(combinedJobs);
    setIsInitialLoading(false);
    setIsLoading(false); // isLoading should be false after masterJobFeed is set, so filtering can proceed
  }, []);

  useEffect(() => {
    loadInitialData();
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
    if (isInitialLoading) return []; // Don't filter until initial data is loaded

    let companies = [...masterJobFeed];
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Apply active job filters
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

    // Apply search term
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


  const loadMoreCompanies = useCallback(() => {
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
    // Reset and load initial batch whenever filteredJobFeed array changes (due to search or filters)
    setDisplayedCompanies([]);
    setCurrentIndex(0);
    setHasMore(filteredJobFeed.length > 0);
    if (filteredJobFeed.length > 0) {
      setIsLoading(false); // Ensure loading is false before calling
      
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
  }, [filteredJobFeed]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading && !isInitialLoading) {
        loadMoreCompanies();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 300px 0px' });
    if (loadMoreTriggerRef.current) {
      observer.current.observe(loadMoreTriggerRef.current);
    }
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, isLoading, loadMoreCompanies, isInitialLoading]);

  const updateLocalStorageSet = (key: string, set: Set<string>) => {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  };

  const handleAction = (companyId: string, action: 'like' | 'pass' | 'details' | 'save' | 'superlike') => {
    const company = masterJobFeed.find(c => c.id === companyId);
    if (!company) return;
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
          description: `${company.name} shows interest! Check 'My Matches' to generate an icebreaker and connect.`,
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
          description: `${company.name} is very interested! Check 'My Matches' to generate an icebreaker and connect.`,
          duration: 7000,
        });
      } else {
        toast({ title: message });
      }
    } else if (action === 'details') {
      message = `Viewing details for ${company.name}`;
      toast({ title: message, description: "Detailed view/expansion to be implemented." });
      return;
    } else if (action === 'save') {
      if (newSaved.has(companyId)) {
        newSaved.delete(companyId);
        message = `Unsaved ${company.name}.`;
      } else {
        newSaved.add(companyId);
        message = `Saved ${company.name}!`;
      }
      toast({ title: message });
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

  const fixedElementsHeight = '200px';
  const visibleCompanies = displayedCompanies.filter(c => !passedCompanies.has(c.id));

  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" style={{ height: `calc(100vh - ${fixedElementsHeight})` }}>
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
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
              <CompanyCardContent company={company} onSwipeAction={handleAction} />
              <CardFooter className="p-2 sm:p-3 grid grid-cols-5 gap-1 sm:gap-2 border-t bg-card shrink-0">
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

        {hasMore && !isLoading && !isInitialLoading && filteredJobFeed.length > 0 && currentIndex < filteredJobFeed.length && (
           <div
             ref={loadMoreTriggerRef}
             className="h-full snap-start snap-always flex items-center justify-center text-muted-foreground"
           >
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
