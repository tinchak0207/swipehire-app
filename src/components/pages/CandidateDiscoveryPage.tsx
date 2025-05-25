
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Candidate, CandidateFilters } from '@/lib/types';
import { WorkExperienceLevel, EducationLevel, LocationPreference, JobType } from '@/lib/types';
import { mockCandidates } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CandidateCardContent } from '@/components/swipe/CandidateCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Info, Star, Save, Loader2, SearchX, Filter, X, Share2 } from 'lucide-react'; // Added Share2
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { CandidateFilterPanel } from "@/components/filters/CandidateFilterPanel";
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_BATCH = 3;

interface CandidateDiscoveryPageProps {
  searchTerm?: string;
}

const initialFilters: CandidateFilters = {
  experienceLevels: new Set(),
  educationLevels: new Set(),
  locationPreferences: new Set(),
  jobTypes: new Set(),
};

export function CandidateDiscoveryPage({ searchTerm = "" }: CandidateDiscoveryPageProps) {
  const [allCandidates, setAllCandidates] = useState<Candidate[]>(mockCandidates);
  const [displayedCandidates, setDisplayedCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState<CandidateFilters>(initialFilters);

  const [likedCandidates, setLikedCandidates] = useState<Set<string>>(new Set());
  const [superLikedCandidates, setSuperLikedCandidates] = useState<Set<string>>(new Set());
  const [passedCandidates, setPassedCandidates] = useState<Set<string>>(new Set());
  const [savedCandidates, setSavedCandidates] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const filteredCandidates = useMemo(() => {
    let candidates = [...allCandidates]; 

    if (activeFilters.experienceLevels.size > 0) {
      candidates = candidates.filter(c => c.workExperienceLevel && activeFilters.experienceLevels.has(c.workExperienceLevel));
    }
    if (activeFilters.educationLevels.size > 0) {
      candidates = candidates.filter(c => c.educationLevel && activeFilters.educationLevels.has(c.educationLevel));
    }
    if (activeFilters.locationPreferences.size > 0) {
      candidates = candidates.filter(c => c.locationPreference && activeFilters.locationPreferences.has(c.locationPreference));
    }
    if (activeFilters.jobTypes.size > 0) {
      candidates = candidates.filter(c => 
        c.jobTypePreference && c.jobTypePreference.some(jt => activeFilters.jobTypes.has(jt))
      );
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    if (searchTerm.trim()) {
      candidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(lowerSearchTerm) ||
        candidate.role.toLowerCase().includes(lowerSearchTerm) ||
        candidate.experienceSummary.toLowerCase().includes(lowerSearchTerm) ||
        (candidate.skills && candidate.skills.some(skill => skill.toLowerCase().includes(lowerSearchTerm))) ||
        (candidate.location && candidate.location.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return candidates;
  }, [allCandidates, activeFilters, searchTerm]);

  const loadMoreCandidates = useCallback(() => {
    if (isLoading || !hasMore || currentIndex >= filteredCandidates.length) {
      if (currentIndex >= filteredCandidates.length) setHasMore(false);
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      const newLoadIndex = currentIndex + ITEMS_PER_BATCH;
      const newBatch = filteredCandidates.slice(currentIndex, newLoadIndex);

      setDisplayedCandidates(prevDisplayed => {
        const prevIds = new Set(prevDisplayed.map(c => c.id));
        const uniqueNewItems = newBatch.filter(item => !prevIds.has(item.id));
        return [...prevDisplayed, ...uniqueNewItems];
      });

      setCurrentIndex(newLoadIndex);
      setHasMore(newLoadIndex < filteredCandidates.length);
      setIsLoading(false);
    }, 700);
  }, [isLoading, hasMore, currentIndex, filteredCandidates]);


  useEffect(() => {
    setDisplayedCandidates([]);
    setCurrentIndex(0);
    setHasMore(filteredCandidates.length > 0); 
    if (filteredCandidates.length > 0) {
      setIsLoading(false); 
      
      const newLoadIndex = 0 + ITEMS_PER_BATCH;
      const newBatch = filteredCandidates.slice(0, newLoadIndex);
      setDisplayedCandidates(newBatch);
      setCurrentIndex(newLoadIndex);
      setHasMore(newLoadIndex < filteredCandidates.length);
    } else {
      setDisplayedCandidates([]);
      setCurrentIndex(0);
      setHasMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCandidates]); 

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMoreCandidates();
      }
    }, {
        threshold: 0.1, 
        rootMargin: '0px 0px 300px 0px' 
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


  useEffect(() => {
    const storedLiked = localStorage.getItem('likedCandidatesDemo');
    if (storedLiked) setLikedCandidates(new Set(JSON.parse(storedLiked)));
    const storedSuperLiked = localStorage.getItem('superLikedCandidatesDemo');
    if (storedSuperLiked) setSuperLikedCandidates(new Set(JSON.parse(storedSuperLiked)));
    const storedPassed = localStorage.getItem('passedCandidatesDemo');
    if (storedPassed) setPassedCandidates(new Set(JSON.parse(storedPassed)));
    const storedSaved = localStorage.getItem('savedCandidatesDemo');
    if (storedSaved) setSavedCandidates(new Set(JSON.parse(storedSaved)));
  }, []);

  const updateLocalStorageSet = (key: string, set: Set<string>) => {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  };

  const handleAction = (candidateId: string, action: 'like' | 'pass' | 'details' | 'save' | 'superlike' | 'share') => {
    const candidate = allCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    let message = "";
    let toastVariant: "default" | "destructive" = "default";

    const newLiked = new Set(likedCandidates);
    const newSuperLiked = new Set(superLikedCandidates);
    const newPassed = new Set(passedCandidates);
    const newSaved = new Set(savedCandidates);

    if (action !== 'pass') newPassed.delete(candidateId);
    if (action !== 'like' && action !== 'superlike') newLiked.delete(candidateId);
    if (action !== 'superlike') newSuperLiked.delete(candidateId);

    if (action === 'like') {
      newLiked.add(candidateId);
      message = `Liked ${candidate.name}`;
      if (Math.random() > 0.7) { 
        toast({
          title: "🎉 It's a Match!",
          description: `You and ${candidate.name} are both interested! Check 'My Matches' to start a conversation.`,
          duration: 7000,
        });
      } else {
        toast({ title: message, variant: toastVariant });
      }
    } else if (action === 'pass') {
      newPassed.add(candidateId);
      newLiked.delete(candidateId); 
      newSuperLiked.delete(candidateId); 
      message = `Passed on ${candidate.name}`;
      toastVariant = "destructive";
      toast({ title: message, variant: toastVariant });
    } else if (action === 'superlike') {
      newSuperLiked.add(candidateId);
      newLiked.add(candidateId); 
      message = `Super liked ${candidate.name}!`;
       if (Math.random() > 0.5) { 
         toast({
          title: "🎉 It's a Super Match!",
          description: `You and ${candidate.name} are very interested! Check 'My Matches' to start a conversation.`,
          duration: 7000,
        });
      } else {
        toast({ title: message });
      }
    } else if (action === 'details') {
      message = `Viewing details for ${candidate.name}`;
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
      toast({ title: message });
    } else if (action === 'share') {
      const shareText = `Check out this candidate profile on SwipeHire: ${candidate.name} - ${candidate.role}. (URL: ${window.location.origin})`;
      navigator.clipboard.writeText(shareText)
        .then(() => {
          toast({ title: "Copied to Clipboard!", description: "Candidate profile link copied." });
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          toast({ title: "Copy Failed", description: "Could not copy link to clipboard.", variant: "destructive" });
        });
      return; // Share action doesn't change other states
    }

    setLikedCandidates(newLiked); updateLocalStorageSet('likedCandidatesDemo', newLiked);
    setSuperLikedCandidates(newSuperLiked); updateLocalStorageSet('superLikedCandidatesDemo', newSuperLiked);
    setPassedCandidates(newPassed); updateLocalStorageSet('passedCandidatesDemo', newPassed);
    setSavedCandidates(newSaved); updateLocalStorageSet('savedCandidatesDemo', newSaved);
  };

  const handleFilterChange = <K extends keyof CandidateFilters>(
    filterType: K,
    value: CandidateFilters[K] extends Set<infer T> ? T : never,
    isChecked: boolean
  ) => {
    setActiveFilters(prevFilters => {
      const newSet = new Set(prevFilters[filterType] as Set<any>); 
      if (isChecked) {
        newSet.add(value);
      } else {
        newSet.delete(value);
      }
      return {
        ...prevFilters,
        [filterType]: newSet,
      };
    });
  };

  const handleClearFilters = () => {
    setActiveFilters(initialFilters);
  };

  const handleApplyFilters = () => {
    setIsSheetOpen(false); 
  };

  const countActiveFilters = () => {
    let count = 0;
    Object.values(activeFilters).forEach(filterSet => {
      count += filterSet.size;
    });
    return count;
  };
  const numActiveFilters = countActiveFilters();

  const fixedElementsHeight = '160px'; // Approximate height for header and filter bar
  const visibleCandidates = displayedCandidates.filter(c => !passedCandidates.has(c.id));

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 sm:p-3 sticky top-0 bg-background z-10 border-b">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-primary">Discover Talent</h2>
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
              <CandidateFilterPanel 
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
        {visibleCandidates.map((candidate) => (
          <div
            key={candidate.id} 
            className="h-full snap-start snap-always flex flex-col items-center justify-center p-1 bg-background"
          >
            <SwipeCard
              className={`w-full max-w-xl h-full flex flex-col
                          ${superLikedCandidates.has(candidate.id) ? 'ring-2 ring-accent shadow-accent/30' : likedCandidates.has(candidate.id) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'}`}
            >
              <CandidateCardContent candidate={candidate} onSwipeAction={handleAction} />
              <CardFooter className="p-2 sm:p-3 grid grid-cols-6 gap-1 sm:gap-2 border-t bg-card shrink-0">
                <Button variant="ghost" size="sm" className="flex-col h-auto py-1.5 sm:py-2 hover:bg-destructive/10 text-destructive hover:text-destructive" onClick={() => handleAction(candidate.id, 'pass')} aria-label={`Pass on ${candidate.name}`}>
                  <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" /> <span className="text-xs">Pass</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex-col h-auto py-1.5 sm:py-2 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600" onClick={() => handleAction(candidate.id, 'details')} aria-label={`View details for ${candidate.name}`}>
                  <Info className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" /> <span className="text-xs">Details</span>
                </Button>
                <Button variant="ghost" size="sm" className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-accent/10 ${superLikedCandidates.has(candidate.id) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`} onClick={() => handleAction(candidate.id, 'superlike')} aria-label={`Superlike ${candidate.name}`}>
                  <Star className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${superLikedCandidates.has(candidate.id) ? 'fill-accent' : ''}`} /> <span className="text-xs">Superlike</span>
                </Button>
                <Button variant="ghost" size="sm" className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-green-500/10 ${likedCandidates.has(candidate.id) && !superLikedCandidates.has(candidate.id) ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`} onClick={() => handleAction(candidate.id, 'like')} aria-label={`Like ${candidate.name}`}>
                  <ThumbsUp className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${likedCandidates.has(candidate.id) && !superLikedCandidates.has(candidate.id) ? 'fill-green-500' : ''}`} /> <span className="text-xs">Like</span>
                </Button>
                <Button variant="ghost" size="sm" className={`flex-col h-auto py-1.5 sm:py-2 hover:bg-primary/10 ${savedCandidates.has(candidate.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} onClick={() => handleAction(candidate.id, 'save')} aria-label={`Save ${candidate.name}`}>
                  <Save className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 ${savedCandidates.has(candidate.id) ? 'fill-primary' : ''}`} /> <span className="text-xs">Save</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex-col h-auto py-1.5 sm:py-2 hover:bg-gray-500/10 text-muted-foreground hover:text-gray-600" onClick={() => handleAction(candidate.id, 'share')} aria-label={`Share ${candidate.name}`}>
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" /> <span className="text-xs">Share</span>
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
        
        {hasMore && !isLoading && filteredCandidates.length > 0 && (
           <div
             ref={loadMoreTriggerRef}
             className="h-full snap-start snap-always flex items-center justify-center text-muted-foreground"
           >
            {/* This element is now a full snap item to ensure it's observed correctly */}
           </div>
        )}

        {!isLoading && !hasMore && visibleCandidates.length === 0 && (searchTerm || numActiveFilters > 0) && (
           <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-background">
              <SearchX className="h-20 w-20 text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-3 text-foreground">No Candidates Found</h2>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
        )}

        {!isLoading && !hasMore && visibleCandidates.length === 0 && !searchTerm && numActiveFilters === 0 &&(
           <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-background">
              <SearchX className="h-20 w-20 text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-3 text-foreground">No More Candidates</h2>
              <p className="text-muted-foreground">You've seen everyone for now. Try again later!</p>
            </div>
        )}
      </div>
    </div>
  );
}
