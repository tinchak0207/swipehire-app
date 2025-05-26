
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Company, JobFilters } from '@/lib/types'; 
import { mockCompanies as staticMockCompanies } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX, Filter } from 'lucide-react';
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
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false); 

  const [activeFilters, setActiveFilters] = useState<JobFilters>(initialJobFilters);

  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  const [passedCompanies, setPassedCompanies] = useState<Set<string>>(new Set());


  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const loadAndSetInitialJobs = useCallback(async () => {
    setIsInitialLoading(true);
    setIsLoading(true); 
    try {
      const { jobs: initialJobs } = await fetchJobsFromBackend(); 
      const combinedJobs = [
        ...initialJobs,
        ...staticMockCompanies.filter(mc => !initialJobs.find(upj => upj.id === mc.id))
      ];
      
      setMasterJobFeed(combinedJobs);
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
    const storedPassed = localStorage.getItem('passedCompaniesDemo');
    if (storedPassed) setPassedCompanies(new Set(JSON.parse(storedPassed)));
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

  const handleAction = (companyId: string, action: 'like' | 'pass' | 'details' | 'share') => {
    const company = masterJobFeed.find(c => c.id === companyId);
    if (!company) return;
    
    if (action === 'details') {
        // Details are now typically handled within the CompanyCardContent itself via its modal
        console.log("Details action triggered for company:", companyId, " - Modal should be handled by CompanyCardContent.");
        return; 
    }

    let message = "";
    let toastVariant: "default" | "destructive" = "default";
    const newLiked = new Set(likedCompanies);
    const newPassed = new Set(passedCompanies);

    if (action !== 'pass') newPassed.delete(companyId);
    if (action !== 'like') newLiked.delete(companyId);

    if (action === 'like') {
      newLiked.add(companyId);
      message = `Interested in ${company.name}`;
      if (Math.random() > 0.7) {
        toast({
          title: "🎉 Company Interested!",
          description: `${company.name} shows interest! Check 'My Matches' to start a conversation and generate an AI icebreaker.`,
          duration: 7000,
        });
      } else {
        toast({ title: message, variant: toastVariant });
      }
    } else if (action === 'pass') {
      newPassed.add(companyId);
      newLiked.delete(companyId);
      message = `Passed on ${company.name}`;
      toastVariant = "destructive";
      toast({ title: message, variant: toastVariant });
    } else if (action === 'share') {
      // Share logic is handled within CompanyCardContent
      return; 
    }
    setLikedCompanies(newLiked); updateLocalStorageSet('likedCompaniesDemo', newLiked);
    setPassedCompanies(newPassed); updateLocalStorageSet('passedCompaniesDemo', newPassed);
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

  // Approximate height of elements above the scrollable content (AppHeader, Tabs)
  // Adjust this value based on your actual layout.
  const fixedElementsHeight = '120px'; 
  const visibleCompanies = displayedCompanies.filter(c => !passedCompanies.has(c.id));

  if (isInitialLoading) {
    return (
      <div className="flex flex-col h-full relative">
        <div className="flex flex-grow items-center justify-center bg-background" style={{ height: `calc(100vh - ${fixedElementsHeight})` }}>
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="default" 
            size="icon" 
            className="fixed bottom-20 right-4 z-20 rounded-full w-14 h-14 shadow-lg sm:bottom-6 sm:right-6"
            aria-label="Open filters"
          >
            <Filter className="h-6 w-6" />
            {numActiveFilters > 0 && (
              <Badge variant="secondary" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">
                {numActiveFilters}
              </Badge>
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
                          ${likedCompanies.has(company.id) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'}`}
            >
              <CompanyCardContent 
                company={company} 
                onSwipeAction={handleAction}
                isLiked={likedCompanies.has(company.id)}
              />
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
             className="h-1 opacity-0" // Small, invisible trigger
           >
             Load More
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
