
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Company } from '@/lib/types';
import { mockCompanies } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Info, Star, Save, Loader2, SearchX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_BATCH = 3; // Number of items to load per "batch"

export function JobDiscoveryPage() {
  const [allCompanies] = useState<Company[]>(mockCompanies);
  const [displayedCompanies, setDisplayedCompanies] = useState<Company[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks how many items are "loaded" from allCompanies
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  const [superLikedCompanies, setSuperLikedCompanies] = useState<Set<string>>(new Set());
  const [passedCompanies, setPassedCompanies] = useState<Set<string>>(new Set());
  const [savedCompanies, setSavedCompanies] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const feedContainerRef = useRef<HTMLDivElement | null>(null);


  const loadMoreCompanies = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    
    setTimeout(() => {
      const newLoadIndex = currentIndex + ITEMS_PER_BATCH;
      const newBatch = allCompanies.slice(currentIndex, newLoadIndex);
      
      setDisplayedCompanies(prev => [...prev, ...newBatch]);
      setCurrentIndex(newLoadIndex);

      if (newLoadIndex >= allCompanies.length) {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 700);
  }, [isLoading, hasMore, currentIndex, allCompanies]);

  useEffect(() => {
    // Initial load
    setIsLoading(true);
    setTimeout(() => {
        const initialBatch = allCompanies.slice(0, ITEMS_PER_BATCH);
        setDisplayedCompanies(initialBatch);
        setCurrentIndex(ITEMS_PER_BATCH);
        if (ITEMS_PER_BATCH >= allCompanies.length) {
            setHasMore(false);
        }
        setIsLoading(false);
    }, 100);


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

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMoreCompanies();
      }
    }, { 
        threshold: 0.1, 
        root: feedContainerRef.current, // observe within the scrollable container
        rootMargin: '0px 0px 300px 0px' // Load when trigger is 300px from bottom of root
    });

    if (loadMoreTriggerRef.current) {
      observer.current.observe(loadMoreTriggerRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMoreCompanies]);

  const updateLocalStorageSet = (key: string, set: Set<string>) => {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  };

  const handleAction = (companyId: string, action: 'like' | 'pass' | 'superlike' | 'details' | 'save') => {
    const company = allCompanies.find(c => c.id === companyId);
    if (!company) return;

    let message = "";
    let toastVariant: "default" | "destructive" = "default";
    
    const newLiked = new Set(likedCompanies);
    const newSuperLiked = new Set(superLikedCompanies);
    const newPassed = new Set(passedCompanies);
    const newSaved = new Set(savedCompanies);

    if (action !== 'pass') { // Allow un-passing by other actions
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
      newLiked.delete(companyId); // Passing also unlikes/unsuperlikes
      newSuperLiked.delete(companyId);
      message = `Passed on ${company.name}`;
      toastVariant = "destructive";
    } else if (action === 'superlike') {
      newSuperLiked.add(companyId);
      newLiked.add(companyId); // Superlike also counts as a like
      message = `Super liked ${company.name}! Your profile will be prioritized.`;
    } else if (action === 'details') {
      message = `Viewing details for ${company.name}`;
      toast({ title: message, description: "Detailed view functionality to be implemented." });
      return; // Don't update sets for 'details'
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

  return (
    <div 
      ref={feedContainerRef}
      className="w-full max-w-xl mx-auto snap-y snap-mandatory overflow-y-auto scroll-smooth no-scrollbar"
      style={{ height: 'calc(100vh - 160px)' }} 
      tabIndex={0} // Make it focusable
    >
      {visibleCompanies.map(company => (
        <div 
          key={company.id}
          className="h-full snap-start snap-always flex items-center justify-center p-1"
        >
          <SwipeCard 
            className={`transition-all duration-300 ease-out w-full h-full
                        ${superLikedCompanies.has(company.id) ? 'ring-4 ring-accent shadow-accent/30' : likedCompanies.has(company.id) ? 'ring-4 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'}`}
          >
            <CompanyCardContent 
                company={company} 
                // Removed direct action props, handleAction is local now
            />
            <CardFooter className="p-3 grid grid-cols-5 gap-2 border-t bg-card">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-col h-auto py-2 hover:bg-destructive/10 text-destructive hover:text-destructive"
                onClick={() => handleAction(company.id, 'pass')}
                aria-label={`Pass on ${company.name}`}
              >
                <ThumbsDown className="h-5 w-5 mb-1" />
                <span className="text-xs">Pass</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-col h-auto py-2 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600"
                onClick={() => handleAction(company.id, 'details')}
                aria-label={`View details for ${company.name}`}
              >
                <Info className="h-5 w-5 mb-1" />
                <span className="text-xs">Details</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-2 hover:bg-accent/10 ${superLikedCompanies.has(company.id) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                onClick={() => handleAction(company.id, 'superlike')}
                aria-label={`Superlike ${company.name}`}
              >
                <Star className={`h-5 w-5 mb-1 ${superLikedCompanies.has(company.id) ? 'fill-accent' : ''}`} />
                <span className="text-xs">Superlike</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-2 hover:bg-green-500/10 ${likedCompanies.has(company.id) && !superLikedCompanies.has(company.id) ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`}
                onClick={() => handleAction(company.id, 'like')}
                aria-label={`Apply to ${company.name}`}
              >
                <ThumbsUp className={`h-5 w-5 mb-1 ${likedCompanies.has(company.id) && !superLikedCompanies.has(company.id) ? 'fill-green-500' : ''}`} />
                <span className="text-xs">Apply</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-2 hover:bg-primary/10 ${savedCompanies.has(company.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                onClick={() => handleAction(company.id, 'save')}
                aria-label={`Save ${company.name}`}
              >
                <Save className={`h-5 w-5 mb-1 ${savedCompanies.has(company.id) ? 'fill-primary' : ''}`} />
                <span className="text-xs">Save</span>
              </Button>
            </CardFooter>
          </SwipeCard>
        </div>
      ))}
      
      {/* Trigger for loading more items - must be inside the scrollable container */}
      {hasMore && !isLoading && (
         <div ref={loadMoreTriggerRef} className="h-10 snap-start flex items-center justify-center text-transparent">.</div>
      )}

      {isLoading && (
        <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-4 text-muted-foreground bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Loading more companies...</p>
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
