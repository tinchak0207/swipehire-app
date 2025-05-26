
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Candidate, CandidateFilters } from '@/lib/types';
import { WorkExperienceLevel, EducationLevel, LocationPreference, JobType } from '@/lib/types';
import { mockCandidates } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CandidateCardContent } from '@/components/swipe/CandidateCardContent';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX, Filter, X } from 'lucide-react';
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
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [displayedCandidates, setDisplayedCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState<CandidateFilters>(initialFilters);

  const [likedCandidates, setLikedCandidates] = useState<Set<string>>(new Set());
  const [passedCandidates, setPassedCandidates] = useState<Set<string>>(new Set());


  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAllCandidates(mockCandidates);
    // Initial filtering based on searchTerm and activeFilters happens in useMemo
  }, []);


  const localFilteredCandidates = useMemo(() => {
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
        (candidate.role && candidate.role.toLowerCase().includes(lowerSearchTerm)) ||
        (candidate.experienceSummary && candidate.experienceSummary.toLowerCase().includes(lowerSearchTerm)) ||
        (candidate.skills && candidate.skills.some(skill => skill.toLowerCase().includes(lowerSearchTerm))) ||
        (candidate.location && candidate.location.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return candidates;
  }, [allCandidates, activeFilters, searchTerm]);

  useEffect(() => {
    setFilteredCandidates(localFilteredCandidates);
  }, [localFilteredCandidates]);


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
    
    const hasFilteredItems = filteredCandidates.length > 0;
    setHasMore(hasFilteredItems); 
  
    if (hasFilteredItems) {
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
    const storedPassed = localStorage.getItem('passedCandidatesDemo');
    if (storedPassed) setPassedCandidates(new Set(JSON.parse(storedPassed)));
  }, []);

  const updateLocalStorageSet = (key: string, set: Set<string>) => {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  };

  const handleAction = (candidateId: string, action: 'like' | 'pass' | 'details' | 'share') => {
    const candidate = allCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    let message = "";
    let toastVariant: "default" | "destructive" = "default";

    const newLiked = new Set(likedCandidates);
    const newPassed = new Set(passedCandidates);

    if (action !== 'pass') newPassed.delete(candidateId);
    if (action !== 'like') newLiked.delete(candidateId);


    if (action === 'like') {
      newLiked.add(candidateId);
      message = `Liked ${candidate.name}`;
      if (Math.random() > 0.7) { 
        toast({
          title: "🎉 It's a Match!",
          description: `You and ${candidate.name} are both interested! Check 'My Matches' to start a conversation and generate an AI icebreaker.`,
          duration: 7000,
        });
      } else {
        toast({ title: message, variant: toastVariant });
      }
    } else if (action === 'pass') {
      newPassed.add(candidateId);
      newLiked.delete(candidateId); 
      message = `Passed on ${candidate.name}`;
      toastVariant = "destructive";
      toast({ title: message, variant: toastVariant });
    } else if (action === 'details') {
      // Details are now typically handled within the CandidateCardContent itself if it has a modal
      // For now, this action might be used for analytics or if a separate details view is implemented
      console.log(`Viewing details for ${candidate.name} - this action might trigger a modal in CandidateCardContent`);
      toast({ title: `Viewing details for ${candidate.name}` });
      return; 
    } else if (action === 'share') {
      // Share logic is handled within CandidateCardContent
      return;
    }

    setLikedCandidates(newLiked); updateLocalStorageSet('likedCandidatesDemo', newLiked);
    setPassedCandidates(newPassed); updateLocalStorageSet('passedCandidatesDemo', newPassed);
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

  // Approximate height of elements above the scrollable content (AppHeader, Tabs)
  // Adjust this value based on your actual layout.
  const fixedElementsHeight = '120px'; 
  const visibleCandidates = displayedCandidates.filter(c => !passedCandidates.has(c.id));

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
          <CandidateFilterPanel 
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
        {visibleCandidates.map((candidate) => (
          <div
            key={candidate.id} 
            className="h-full snap-start snap-always flex flex-col items-center justify-center p-1 bg-background"
          >
            <SwipeCard
              className={`w-full max-w-xl h-full flex flex-col
                          ${likedCandidates.has(candidate.id) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'}
                          ${candidate.isUnderestimatedTalent ? 'border-2 border-yellow-500 shadow-yellow-500/20' : ''}`}
            >
              <CandidateCardContent 
                candidate={candidate} 
                onSwipeAction={handleAction} 
                isLiked={likedCandidates.has(candidate.id)}
              />
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
             className="h-1 opacity-0" // Small, invisible trigger for IntersectionObserver
           >
             Load More
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
