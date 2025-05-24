
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Company } from '@/lib/types';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Info, Star, Save, Loader2, SearchX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchJobsFromBackend } from '@/services/jobService'; 

export function JobDiscoveryPage() {
  const [displayedCompanies, setDisplayedCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  
  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  const [superLikedCompanies, setSuperLikedCompanies] = useState<Set<string>>(new Set());
  const [passedCompanies, setPassedCompanies] = useState<Set<string>>(new Set());
  const [savedCompanies, setSavedCompanies] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const loadCompanies = useCallback(async (cursor?: string) => {
    if (isLoading && !isInitialLoading) return; 
    
    if (isInitialLoading) {
      setIsLoading(true); 
    } else if (cursor || (!cursor && hasMore)) { // Also set loading if we are trying to load more even without a cursor (e.g. first "load more" call)
      setIsLoading(true);
    }

    try {
      const { jobs, hasMore: newHasMore, nextCursor: newNextCursor } = await fetchJobsFromBackend(cursor);
      
      setDisplayedCompanies(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const uniqueNewJobs = jobs.filter(job => !existingIds.has(job.id));
        return cursor ? [...prev, ...uniqueNewJobs] : uniqueNewJobs; 
      });
      setHasMore(newHasMore);
      setNextCursor(newNextCursor);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast({ title: "Error fetching jobs", description: "Could not load opportunities. Please try again.", variant: "destructive" });
      setHasMore(false); 
    } finally {
      setIsLoading(false);
      if (isInitialLoading) setIsInitialLoading(false);
    }
  }, [isLoading, isInitialLoading, toast, hasMore]); // Added hasMore to dependencies

  // Initial load
  useEffect(() => {
    setIsInitialLoading(true);
    loadCompanies(); 

    // Load interaction states from localStorage
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


  // IntersectionObserver setup for infinite scroll
  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading && !isInitialLoading) {
        loadCompanies(nextCursor);
      }
    }, { 
        threshold: 0.1, // Trigger when 10% of the sentinel is visible
        rootMargin: '0px 0px 200px 0px' // Start loading when 200px from bottom
    });

    if (loadMoreTriggerRef.current) {
      observer.current.observe(loadMoreTriggerRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, isLoading, nextCursor, loadCompanies, isInitialLoading]);

  const updateLocalStorageSet = (key: string, set: Set<string>) => {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  };

  const handleAction = (companyId: string, action: 'like' | 'pass' | 'superlike' | 'details' | 'save') => {
    const company = displayedCompanies.find(c => c.id === companyId); 
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
          description: `${company.name} is also interested in profiles like yours!`,
        });
      }
    } else if (action === 'pass') {
      newPassed.add(companyId);
      newLiked.delete(companyId); 
      newSuperLiked.delete(companyId);
      message = `Passed on ${company.name}`;
      toastVariant = "destructive";
    } else if (action === 'superlike') {
      newSuperLiked.add(companyId);
      newLiked.add(companyId); 
      message = `Super liked ${company.name}! Your profile will be prioritized.`;
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
    }
    
    setLikedCompanies(newLiked);
    updateLocalStorageSet('likedCompaniesDemo', newLiked);
    setSuperLikedCompanies(newSuperLiked);
    updateLocalStorageSet('superLikedCompaniesDemo', newSuperLiked);
    setPassedCompanies(newPassed);
    updateLocalStorageSet('passedCompaniesDemo', newPassed);
    setSavedCompanies(newSaved);
    updateLocalStorageSet('savedCompaniesDemo', newSaved);
    
    if (action !== 'details') {
        toast({ title: message, variant: toastVariant });
    }
  };
  
  const visibleCompanies = displayedCompanies.filter(c => !passedCompanies.has(c.id));
  const fixedElementsHeight = '160px'; // Approximate height of header + tabs

  if (isInitialLoading && displayedCompanies.length === 0 && isLoading) { // Show loader only if truly initial loading and actively fetching
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
          className="h-full snap-start snap-always flex flex-col items-center justify-center p-1 bg-background" // Added bg-background
        >
          <SwipeCard 
            className={`w-full max-w-xl h-full flex flex-col
                        ${superLikedCompanies.has(company.id) ? 'ring-2 ring-accent shadow-accent/30' : likedCompanies.has(company.id) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'}`}
          >
            <CompanyCardContent company={company} />
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

      {hasMore && !isLoading && !isInitialLoading && ( // Ensure trigger isn't shown during initial load
         <div 
            ref={loadMoreTriggerRef} 
            className="h-full snap-start snap-always flex items-center justify-center text-transparent" // Full height snap point
         >
           . {/* Content for observer */}
         </div>
      )}

      {!isLoading && !hasMore && visibleCompanies.length === 0 && (
         <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-background">
            <SearchX className="h-20 w-20 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-foreground">No More Companies</h2>
            <p className="text-muted-foreground">You've seen all opportunities for now. Try again later!</p>
          </div>
      )}
    </div>
  );
}
