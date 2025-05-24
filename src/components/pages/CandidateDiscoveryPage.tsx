
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Candidate } from '@/lib/types';
import { mockCandidates } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CandidateCardContent } from '@/components/swipe/CandidateCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Info, Star, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 3; // Number of items to load per "page"

export function CandidateDiscoveryPage() {
  const [allCandidates] = useState<Candidate[]>(mockCandidates);
  const [displayedCandidates, setDisplayedCandidates] = useState<Candidate[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [likedCandidates, setLikedCandidates] = useState<Set<string>>(new Set());
  const [superLikedCandidates, setSuperLikedCandidates] = useState<Set<string>>(new Set());
  const [passedCandidates, setPassedCandidates] = useState<Set<string>>(new Set());
  const [savedCandidates, setSavedCandidates] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMoreCandidates = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const newCandidates = allCandidates.slice(0, nextPage * ITEMS_PER_PAGE);
      
      if (newCandidates.length >= allCandidates.length) {
        setHasMore(false);
      }
      setDisplayedCandidates(newCandidates);
      setCurrentPage(nextPage);
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, currentPage, allCandidates]);

  useEffect(() => {
    // Initial load
    setDisplayedCandidates(allCandidates.slice(0, ITEMS_PER_PAGE * currentPage));
    if (ITEMS_PER_PAGE * currentPage >= allCandidates.length) {
      setHasMore(false);
    }

    // Load interaction states from localStorage
    const storedLiked = localStorage.getItem('likedCandidatesDemo');
    if (storedLiked) setLikedCandidates(new Set(JSON.parse(storedLiked)));
    const storedSuperLiked = localStorage.getItem('superLikedCandidatesDemo');
    if (storedSuperLiked) setSuperLikedCandidates(new Set(JSON.parse(storedSuperLiked)));
    const storedPassed = localStorage.getItem('passedCandidatesDemo');
    if (storedPassed) setPassedCandidates(new Set(JSON.parse(storedPassed)));
    const storedSaved = localStorage.getItem('savedCandidatesDemo');
    if (storedSaved) setSavedCandidates(new Set(JSON.parse(storedSaved)));
  }, [allCandidates]); // Removed currentPage from deps to avoid re-slicing on every loadMore

   useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMoreCandidates();
      }
    });

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
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

    if (action === 'like') {
      newLiked.add(candidateId);
      newPassed.delete(candidateId); // Allow re-liking if previously passed
      message = `Liked ${candidate.name}`;
      if (Math.random() > 0.7) { 
        toast({
          title: "🎉 It's a Match!",
          description: `You and ${candidate.name} are both interested!`,
        });
      }
      setLikedCandidates(newLiked);
      updateLocalStorageSet('likedCandidatesDemo', newLiked);
    } else if (action === 'pass') {
      newPassed.add(candidateId);
      newLiked.delete(candidateId);
      newSuperLiked.delete(candidateId);
      message = `Passed on ${candidate.name}`;
      toastVariant = "destructive";
      setPassedCandidates(newPassed);
      updateLocalStorageSet('passedCandidatesDemo', newPassed);
    } else if (action === 'superlike') {
      newSuperLiked.add(candidateId);
      newLiked.add(candidateId); 
      newPassed.delete(candidateId);
      message = `Super liked ${candidate.name}! They'll be notified.`;
      setSuperLikedCandidates(newSuperLiked);
      updateLocalStorageSet('superLikedCandidatesDemo', newSuperLiked);
      // also update liked set
      setLikedCandidates(newLiked);
      updateLocalStorageSet('likedCandidatesDemo', newLiked);
    } else if (action === 'details') {
      message = `Viewing details for ${candidate.name}`;
      toast({ title: message, description: "Detailed view functionality to be implemented." });
      return; 
    } else if (action === 'save') {
      if (newSaved.has(candidateId)) {
        newSaved.delete(candidateId);
        message = `Unsaved ${candidate.name}.`;
      } else {
        newSaved.add(candidateId);
        message = `Saved ${candidate.name}!`;
      }
      setSavedCandidates(newSaved);
      updateLocalStorageSet('savedCandidatesDemo', newSaved);
    }
    
    if (action !== 'details') { // Details action already toasts
        toast({ title: message, variant: toastVariant });
    }
  };

  const visibleCandidates = displayedCandidates.filter(c => !passedCandidates.has(c.id));

  if (allCandidates.length === 0 && !isLoading) { // Check allCandidates before initial load
    return <div className="flex justify-center items-center h-64"><p>No candidates available.</p></div>;
  }


  return (
    <div className="flex flex-col items-center p-2 sm:p-4 w-full">
      <div className="w-full max-w-xl space-y-6 scrollable-feed">
        {visibleCandidates.length > 0 ? visibleCandidates.map(candidate => (
          <SwipeCard 
            key={candidate.id} 
            className={`transition-all duration-300 ease-out 
                        ${superLikedCandidates.has(candidate.id) ? 'ring-4 ring-accent shadow-accent/30' : likedCandidates.has(candidate.id) ? 'ring-4 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'}
                        min-h-[600px] md:min-h-[700px]`}
          >
            <CandidateCardContent candidate={candidate} />
            <CardFooter className="p-3 grid grid-cols-5 gap-2 border-t bg-card">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-col h-auto py-2 hover:bg-destructive/10 text-destructive hover:text-destructive"
                onClick={() => handleAction(candidate.id, 'pass')}
                aria-label={`Pass on ${candidate.name}`}
              >
                <ThumbsDown className="h-5 w-5 mb-1" />
                <span className="text-xs">Pass</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-col h-auto py-2 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600"
                onClick={() => handleAction(candidate.id, 'details')}
                aria-label={`View details for ${candidate.name}`}
              >
                <Info className="h-5 w-5 mb-1" />
                <span className="text-xs">Details</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-2 hover:bg-accent/10 ${superLikedCandidates.has(candidate.id) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                onClick={() => handleAction(candidate.id, 'superlike')}
                aria-label={`Superlike ${candidate.name}`}
              >
                <Star className={`h-5 w-5 mb-1 ${superLikedCandidates.has(candidate.id) ? 'fill-accent' : ''}`} />
                <span className="text-xs">Superlike</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-2 hover:bg-green-500/10 ${likedCandidates.has(candidate.id) && !superLikedCandidates.has(candidate.id) ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`}
                onClick={() => handleAction(candidate.id, 'like')}
                aria-label={`Like ${candidate.name}`}
              >
                <ThumbsUp className={`h-5 w-5 mb-1 ${likedCandidates.has(candidate.id) && !superLikedCandidates.has(candidate.id) ? 'fill-green-500' : ''}`} />
                <span className="text-xs">Like</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-2 hover:bg-primary/10 ${savedCandidates.has(candidate.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                onClick={() => handleAction(candidate.id, 'save')}
                aria-label={`Save ${candidate.name}`}
              >
                <Save className={`h-5 w-5 mb-1 ${savedCandidates.has(candidate.id) ? 'fill-primary' : ''}`} />
                <span className="text-xs">Save</span>
              </Button>
            </CardFooter>
          </SwipeCard>
        )) : (
          !isLoading && <div className="text-center py-10 col-span-full">
            <h2 className="text-2xl font-semibold mb-4">No More Candidates</h2>
            <p className="text-muted-foreground">You've seen everyone for now, or try adjusting your filters!</p>
          </div>
        )}
        {isLoading && (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div ref={loadMoreRef} style={{ height: '1px' }} /> {/* Invisible element to trigger loading more */}
      </div>
       <style jsx>{`
        .scrollable-feed {
          max-height: calc(100vh - 200px); /* Adjust based on header/footer/search bar height */
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding-right: 4px; /* Space for scrollbar */
        }
        .scrollable-feed::-webkit-scrollbar {
          width: 8px;
        }
        .scrollable-feed::-webkit-scrollbar-thumb {
          background-color: hsl(var(--primary) / 0.5);
          border-radius: 4px;
        }
        .scrollable-feed::-webkit-scrollbar-track {
          background-color: hsl(var(--muted));
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
