
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Candidate } from '@/lib/types';
import { mockCandidates } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CandidateCardContent } from '@/components/swipe/CandidateCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Info, Star, Save, Loader2, SearchX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_BATCH = 3; // Number of items to load per batch for infinite scroll

export function CandidateDiscoveryPage() {
  const [allCandidates] = useState<Candidate[]>(mockCandidates);
  const [displayedCandidates, setDisplayedCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [likedCandidates, setLikedCandidates] = useState<Set<string>>(new Set());
  const [superLikedCandidates, setSuperLikedCandidates] = useState<Set<string>>(new Set());
  const [passedCandidates, setPassedCandidates] = useState<Set<string>>(new Set());
  const [savedCandidates, setSavedCandidates] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const loadMoreCandidates = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newLoadIndex = currentIndex + ITEMS_PER_BATCH;
      const newBatch = allCandidates.slice(currentIndex, newLoadIndex);
      
      setDisplayedCandidates(prevDisplayed => {
        const prevIds = new Set(prevDisplayed.map(c => c.id));
        const uniqueNewItems = newBatch.filter(item => !prevIds.has(item.id));
        return [...prevDisplayed, ...uniqueNewItems];
      });
      
      setCurrentIndex(newLoadIndex);

      if (newLoadIndex >= allCandidates.length) {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 700);
  }, [isLoading, hasMore, currentIndex, allCandidates]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const initialBatch = allCandidates.slice(0, ITEMS_PER_BATCH);
      setDisplayedCandidates(initialBatch);
      setCurrentIndex(ITEMS_PER_BATCH);
      if (ITEMS_PER_BATCH >= allCandidates.length) {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 100); 

    // Load interaction states from localStorage
    const storedLiked = localStorage.getItem('likedCandidatesDemo');
    if (storedLiked) setLikedCandidates(new Set(JSON.parse(storedLiked)));
    const storedSuperLiked = localStorage.getItem('superLikedCandidatesDemo');
    if (storedSuperLiked) setSuperLikedCandidates(new Set(JSON.parse(storedSuperLiked)));
    const storedPassed = localStorage.getItem('passedCandidatesDemo');
    if (storedPassed) setPassedCandidates(new Set(JSON.parse(storedPassed)));
    const storedSaved = localStorage.getItem('savedCandidatesDemo');
    if (storedSaved) setSavedCandidates(new Set(JSON.parse(storedSaved)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // IntersectionObserver setup for infinite scroll
   useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMoreCandidates();
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
  }, [hasMore, isLoading, loadMoreCandidates]);


  const updateLocalStorageSet = (key: string, set: Set<string>) => {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  };

  const handleAction = (candidateId: string, action: 'like' | 'pass' | 'superlike' | 'details' | 'save') => {
    const candidate = allCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    let message = "";
    let toastVariant: "default" | "destructive" = "default";
    
    const newLiked = new Set(likedCandidates);
    const newSuperLiked = new Set(superLikedCandidates);
    const newPassed = new Set(passedCandidates);
    const newSaved = new Set(savedCandidates);

    // Logic to handle interactions
    if (action !== 'pass') {
      newPassed.delete(candidateId);
    }
     if (action !== 'like' && action !== 'superlike') {
      newLiked.delete(candidateId);
    }
    if (action !== 'superlike') {
      newSuperLiked.delete(candidateId);
    }

    if (action === 'like') {
      newLiked.add(candidateId);
      message = `Liked ${candidate.name}`;
      if (Math.random() > 0.7) { 
        toast({
          title: "🎉 It's a Match!",
          description: `You and ${candidate.name} are both interested!`,
        });
      }
    } else if (action === 'pass') {
      newPassed.add(candidateId);
      newLiked.delete(candidateId);
      newSuperLiked.delete(candidateId);
      message = `Passed on ${candidate.name}`;
      toastVariant = "destructive";
    } else if (action === 'superlike') {
      newSuperLiked.add(candidateId);
      newLiked.add(candidateId);
      message = `Super liked ${candidate.name}! They'll be notified.`;
    } else if (action === 'details') {
      message = `Viewing details for ${candidate.name}`;
      // For a full-page card, "Details" might mean expanding content within the card
      // or navigating to a separate detail view. For now, just a toast.
      toast({ title: message, description: "Detailed view/expansion to be implemented." });
      return; 
    } else if (action === 'save') {
      if (newSaved.has(candidateId)) {
        newSaved.delete(candidateId);
        message = `Unsaved ${candidate.name}.`;
      } else {
        newSaved.add(candidateId);
        message = `Saved ${candidate.name}!`;
      }
    }
    
    setLikedCandidates(newLiked);
    updateLocalStorageSet('likedCandidatesDemo', newLiked);
    setSuperLikedCandidates(newSuperLiked);
    updateLocalStorageSet('superLikedCandidatesDemo', newSuperLiked);
    setPassedCandidates(newPassed);
    updateLocalStorageSet('passedCandidatesDemo', newPassed);
    setSavedCandidates(newSaved);
    updateLocalStorageSet('savedCandidatesDemo', newSaved);
    
    if (action !== 'details') {
        toast({ title: message, variant: toastVariant });
    }
  };

  const visibleCandidates = displayedCandidates.filter(c => !passedCandidates.has(c.id));

  // Approximate height of header + tabs. Adjust if necessary.
  const fixedElementsHeight = '160px'; 

  return (
    <div 
      className="w-full snap-y snap-mandatory overflow-y-auto scroll-smooth no-scrollbar"
      style={{ height: `calc(100vh - ${fixedElementsHeight})` }} 
      tabIndex={0} 
    >
      {visibleCandidates.map((candidate) => (
        <div 
          key={candidate.id}
          className="h-full snap-start snap-always flex flex-col items-center justify-center p-1 bg-background" // Added bg-background for visual separation
        >
          <SwipeCard 
            className={`w-full max-w-xl h-full flex flex-col
                        ${superLikedCandidates.has(candidate.id) ? 'ring-2 ring-accent shadow-accent/30' : likedCandidates.has(candidate.id) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'}`}
          >
            <CandidateCardContent candidate={candidate} />
            <CardFooter className="p-2 sm:p-3 grid grid-cols-5 gap-1 sm:gap-2 border-t bg-card shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-col h-auto py-1.5 sm:py-2 hover:bg-destructive/10 text-destructive hover:text-destructive"
                onClick={() => handleAction(candidate.id, 'pass')}
                aria-label={`Pass on ${candidate.name}`}
              >
                <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                <span className="text-xs">Pass</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-col h-auto py-1.5 sm:py-2 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600"
                onClick={() => handleAction(candidate.id, 'details')}
                aria-label={`View details for ${candidate.name}`}
              >
                <Info className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                <span className="text-xs">Details</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-accent/10 ${superLikedCandidates.has(candidate.id) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                onClick={() => handleAction(candidate.id, 'superlike')}
                aria-label={`Superlike ${candidate.name}`}
              >
                <Star className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${superLikedCandidates.has(candidate.id) ? 'fill-accent' : ''}`} />
                <span className="text-xs">Superlike</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-green-500/10 ${likedCandidates.has(candidate.id) && !superLikedCandidates.has(candidate.id) ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`}
                onClick={() => handleAction(candidate.id, 'like')}
                aria-label={`Like ${candidate.name}`}
              >
                <ThumbsUp className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${likedCandidates.has(candidate.id) && !superLikedCandidates.has(candidate.id) ? 'fill-green-500' : ''}`} />
                <span className="text-xs">Like</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-primary/10 ${savedCandidates.has(candidate.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                onClick={() => handleAction(candidate.id, 'save')}
                aria-label={`Save ${candidate.name}`}
              >
                <Save className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${savedCandidates.has(candidate.id) ? 'fill-primary' : ''}`} />
                <span className="text-xs">Save</span>
              </Button>
            </CardFooter>
          </SwipeCard>
        </div>
      ))}

      {isLoading && (
        <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-4 text-muted-foreground bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Loading more candidates...</p>
        </div>
      )}
      
      {hasMore && !isLoading && (
         <div 
           ref={loadMoreTriggerRef} 
           className="h-full snap-start snap-always flex items-center justify-center text-transparent" // Full height snap point
         >
           . {/* This ensures the div has some content for the observer to latch onto if needed, though visibility should be enough */}
         </div>
      )}

      {!isLoading && !hasMore && visibleCandidates.length === 0 && (
         <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-background">
            <SearchX className="h-20 w-20 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-foreground">No More Candidates</h2>
            <p className="text-muted-foreground">You've seen everyone for now. Try again later!</p>
          </div>
      )}
    </div>
  );
}
