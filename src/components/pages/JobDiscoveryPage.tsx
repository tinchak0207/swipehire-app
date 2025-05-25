
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Company } from '@/lib/types';
import { mockCompanies as staticMockCompanies } from '@/lib/mockData'; // Renamed to avoid conflict
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Info, Star, Save, Loader2, SearchX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_BATCH = 3; // For infinite scroll

interface JobDiscoveryPageProps {
  searchTerm?: string;
}

export function JobDiscoveryPage({ searchTerm = "" }: JobDiscoveryPageProps) {
  const [masterJobFeed, setMasterJobFeed] = useState<Company[]>([]); // Holds all jobs (mock + user-posted)
  const [filteredJobFeed, setFilteredJobFeed] = useState<Company[]>([]);
  const [displayedCompanies, setDisplayedCompanies] = useState<Company[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  const [superLikedCompanies, setSuperLikedCompanies] = useState<Set<string>>(new Set());
  const [passedCompanies, setPassedCompanies] = useState<Set<string>>(new Set());
  const [savedCompanies, setSavedCompanies] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  // Function to load initial master list of jobs
  const loadInitialData = useCallback(async () => {
    setIsInitialLoading(true);
    setIsLoading(true); // Also set general loading true
    // Simulate fetching user-posted jobs from localStorage
    const storedUserPostedCompanies = localStorage.getItem('userPostedCompanies');
    const userPostedJobs: Company[] = storedUserPostedCompanies ? JSON.parse(storedUserPostedCompanies) : [];

    // Combine user-posted jobs with static mock data
    // Ensure no duplicates if mock data could somehow include IDs from userPostedJobs
    const combinedJobs = [
      ...userPostedJobs,
      ...staticMockCompanies.filter(mc => !userPostedJobs.find(upj => upj.id === mc.id))
    ];

    setMasterJobFeed(combinedJobs);
    setFilteredJobFeed(combinedJobs); // Initially, filtered is same as master
    
    setDisplayedCompanies([]);
    setCurrentIndex(0);
    setHasMore(combinedJobs.length > 0);
    
    setIsInitialLoading(false);
    setIsLoading(false);
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

  // Effect for handling search term changes
  useEffect(() => {
    if (isInitialLoading) return; // Don't filter until initial data is loaded

    const lowerSearchTerm = searchTerm.toLowerCase();
    const newFilteredCompanies = masterJobFeed.filter(company => {
      if (!searchTerm.trim()) return true;
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

    setFilteredJobFeed(newFilteredCompanies);
    setDisplayedCompanies([]);
    setCurrentIndex(0);
    setHasMore(newFilteredCompanies.length > 0);
    setIsLoading(false); // Reset loading state before potentially loading new batch
  }, [searchTerm, masterJobFeed, isInitialLoading]);


  const loadMoreCompanies = useCallback(() => {
    if (isLoading || !hasMore || filteredJobFeed.length === 0) return;
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

      if (newLoadIndex >= filteredJobFeed.length) {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 700); // Simulate network delay
  }, [isLoading, hasMore, currentIndex, filteredJobFeed]);

  // Effect to load first batch when filteredJobFeed changes (after search or initial load)
  useEffect(() => {
    if (!isInitialLoading && filteredJobFeed.length > 0) {
      setHasMore(true);
      loadMoreCompanies();
    } else if (!isInitialLoading && filteredJobFeed.length === 0) {
      setHasMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJobFeed, isInitialLoading]); // Not including loadMoreCompanies to avoid re-trigger loop here

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading && !isInitialLoading) {
        loadMoreCompanies();
      }
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px 300px 0px' // Start loading when trigger is 300px from bottom
    });

    if (loadMoreTriggerRef.current) {
      observer.current.observe(loadMoreTriggerRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMoreCompanies, isInitialLoading]);


  const updateLocalStorageSet = (key: string, set: Set<string>) => {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  };

  const handleAction = (companyId: string, action: 'like' | 'pass' | 'details' | 'save' | 'superlike') => {
    const company = masterJobFeed.find(c => c.id === companyId); // Check against master list
    if (!company) return;

    let message = "";
    let toastVariant: "default" | "destructive" = "default";

    const newLiked = new Set(likedCompanies);
    const newSuperLiked = new Set(superLikedCompanies);
    const newPassed = new Set(passedCompanies);
    const newSaved = new Set(savedCompanies);

    if (action !== 'pass') {
      newPassed.delete(companyId);
    }
    if (action !== 'like' && action !== 'superlike') {
        newLiked.delete(companyId);
    }
    if (action !== 'superlike') {
        newSuperLiked.delete(companyId);
    }

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

    setLikedCompanies(newLiked);
    updateLocalStorageSet('likedCompaniesDemo', newLiked);
    setSuperLikedCompanies(newSuperLiked);
    updateLocalStorageSet('superLikedCompaniesDemo', newSuperLiked);
    setPassedCompanies(newPassed);
    updateLocalStorageSet('passedCompaniesDemo', newPassed);
    setSavedCompanies(newSaved);
    updateLocalStorageSet('savedCompaniesDemo', newSaved);
  };

  const visibleCompanies = displayedCompanies.filter(c => !passedCompanies.has(c.id));
  const fixedElementsHeight = '160px';

  if (isInitialLoading && masterJobFeed.length === 0) {
     return (
      <div
        className="flex items-center justify-center bg-background"
        style={{ height: `calc(100vh - ${fixedElementsHeight})` }}
      >
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="w-full snap-y snap-mandatory overflow-y-auto scroll-smooth no-scrollbar"
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
              <Button
                variant="ghost"
                size="sm"
                className="flex-col h-auto py-1.5 sm:py-2 hover:bg-destructive/10 text-destructive hover:text-destructive"
                onClick={() => handleAction(company.id, 'pass')}
                aria-label={`Pass on ${company.name}`}
              >
                <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                <span className="text-xs">Pass</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-col h-auto py-1.5 sm:py-2 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600"
                onClick={() => handleAction(company.id, 'details')}
                aria-label={`View details for ${company.name}`}
              >
                <Info className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                <span className="text-xs">Details</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-accent/10 ${superLikedCompanies.has(company.id) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                onClick={() => handleAction(company.id, 'superlike')}
                aria-label={`Superlike ${company.name}`}
              >
                <Star className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${superLikedCompanies.has(company.id) ? 'fill-accent' : ''}`} />
                <span className="text-xs">Superlike</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-green-500/10 ${likedCompanies.has(company.id) && !superLikedCompanies.has(company.id) ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`}
                onClick={() => handleAction(company.id, 'like')}
                aria-label={`Apply to ${company.name}`}
              >
                <ThumbsUp className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${likedCompanies.has(company.id) && !superLikedCompanies.has(company.id) ? 'fill-green-500' : ''}`} />
                <span className="text-xs">Apply</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-primary/10 ${savedCompanies.has(company.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                onClick={() => handleAction(company.id, 'save')}
                aria-label={`Save ${company.name}`}
              >
                <Save className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${savedCompanies.has(company.id) ? 'fill-primary' : ''}`} />
                <span className="text-xs">Save</span>
              </Button>
            </CardFooter>
          </SwipeCard>
        </div>
      ))}

      {isLoading && !isInitialLoading && (
        <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-4 text-muted-foreground bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Loading more companies...</p>
        </div>
      )}

      {hasMore && !isLoading && !isInitialLoading && filteredJobFeed.length > 0 && (
         <div
            ref={loadMoreTriggerRef}
            className="h-1" /* Small trigger for observer */
         >
         </div>
      )}

      {!isLoading && !hasMore && visibleCompanies.length === 0 && filteredJobFeed.length === 0 && searchTerm && (
         <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-background">
            <SearchX className="h-20 w-20 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-foreground">No Jobs Found</h2>
            <p className="text-muted-foreground">Try adjusting your search term.</p>
          </div>
      )}

      {!isLoading && !hasMore && visibleCompanies.length === 0 && filteredJobFeed.length === 0 && !searchTerm && (
         <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-background">
            <SearchX className="h-20 w-20 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-foreground">No More Companies</h2>
            <p className="text-muted-foreground">You've seen all opportunities for now. Check back later or clear your search!</p>
          </div>
      )}
    </div>
  );
}
