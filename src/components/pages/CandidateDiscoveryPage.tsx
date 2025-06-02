
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Candidate, CandidateFilters, UserRole } from '@/lib/types';
import { mockCandidates } from '@/lib/mockData'; 
import { SwipeCard } from '@/components/swipe/SwipeCard'; 
import { CandidateCardContent } from '@/components/swipe/CandidateCardContent';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX, Filter, X as CloseIcon, RotateCcw, Trash2 as TrashIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CandidateFilterPanel } from "@/components/filters/CandidateFilterPanel";
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { recordLike } from '@/services/matchService';
import NextImage from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { passCandidate, retrieveCandidate } from '@/services/interactionService';

const ITEMS_PER_BATCH = 3;
const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';


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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [displayedCandidates, setDisplayedCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false); 
  const [hasMore, setHasMore] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isTrashBinOpen, setIsTrashBinOpen] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState<CandidateFilters>(initialFilters);
  const [likedCandidateProfileIds, setLikedCandidateProfileIds] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const { mongoDbUserId, preferences, passedCandidateIds: passedCandidateProfileIdsFromContext, updatePassedCandidateIds, fetchAndSetUserPreferences } = useUserPreferences();
  const [recruiterRepresentedCompanyId, setRecruiterRepresentedCompanyId] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const fetchBackendCandidates = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/profiles/jobseekers`);
      if (!response.ok) {
        throw new Error(`Failed to fetch candidate profiles: ${response.status}`);
      }
      const data: Candidate[] = await response.json();
      if (data.length === 0) {
        console.warn("[CandidateDiscovery] No candidates from backend, using mock data.");
        setAllCandidates([...mockCandidates]);
      } else {
        console.log(`[CandidateDiscovery] Fetched ${data.length} candidates from backend.`);
        setAllCandidates(data.map(c => ({...c, id: (c as any)._id || c.id })));
      }
    } catch (error) {
      console.error("Error fetching candidates from backend:", error);
      toast({ title: "Error Loading Candidates", description: "Could not load candidate profiles from the backend. Displaying mock data as fallback.", variant: "destructive" });
      setAllCandidates([...mockCandidates]);
    } finally {
      setIsInitialLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBackendCandidates();
  }, [fetchBackendCandidates]);

  useEffect(() => {
    if (mongoDbUserId) {
        const storedCompanyId = localStorage.getItem(`user_${mongoDbUserId}_representedCompanyId`); 
        setRecruiterRepresentedCompanyId(storedCompanyId || 'comp-placeholder-recruiter'); 
        fetchAndSetUserPreferences(mongoDbUserId);
    }
  }, [mongoDbUserId, fetchAndSetUserPreferences]);

  const trashBinCandidates = useMemo(() => {
    if (isInitialLoading || allCandidates.length === 0 || !passedCandidateProfileIdsFromContext) return [];
    return allCandidates.filter(c => passedCandidateProfileIdsFromContext.has(c.id));
  }, [allCandidates, passedCandidateProfileIdsFromContext, isInitialLoading]);

  const filteredCandidatesMemo = useMemo(() => {
    console.log("[CandidateDiscovery] Recalculating filteredCandidatesMemo...");
    if (isInitialLoading || !passedCandidateProfileIdsFromContext) return [];
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
        candidates = candidates.filter(c => c.jobTypePreference && c.jobTypePreference.some(jt => activeFilters.jobTypes.has(jt)));
    }
    console.log(`[CandidateDiscovery] Candidates after main filters: ${candidates.length}, Passed IDs count: ${passedCandidateProfileIdsFromContext.size}`);

    const lowerSearchTerm = searchTerm.toLowerCase();
    if (searchTerm.trim()) {
      candidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(lowerSearchTerm) ||
        (candidate.role && candidate.role.toLowerCase().includes(lowerSearchTerm)) ||
        (candidate.skills && candidate.skills.some(skill => skill.toLowerCase().includes(lowerSearchTerm)))
      );
    }
    const finalFiltered = candidates.filter(c => !passedCandidateProfileIdsFromContext.has(c.id));
    console.log(`[CandidateDiscovery] Final filtered count: ${finalFiltered.length}`);
    return finalFiltered;
  }, [allCandidates, activeFilters, searchTerm, passedCandidateProfileIdsFromContext, isInitialLoading]);

  const loadMoreCandidates = useCallback(() => {
    console.log(`[CandidateDiscovery] Loading more candidates. Current index: ${currentIndex}, Batch size: ${ITEMS_PER_BATCH}, Filtered total: ${filteredCandidatesMemo.length}`);
    if (isInitialLoading || isLoading || !hasMore || currentIndex >= filteredCandidatesMemo.length) {
      if (currentIndex >= filteredCandidatesMemo.length && filteredCandidatesMemo.length > 0) {
        setHasMore(false);
      } else if (filteredCandidatesMemo.length === 0) {
        setHasMore(false);
      }
      return;
    }
    setIsLoading(true);
    console.log(`[CandidateDiscovery] IntersectionObserver: Attaching. hasMore: ${hasMore} isLoading: ${isLoading}`);
    setTimeout(() => {
      const newLoadIndex = currentIndex + ITEMS_PER_BATCH;
      const newBatch = filteredCandidatesMemo.slice(currentIndex, newLoadIndex);
      setDisplayedCandidates(prev => {
        const updatedDisplay = [...prev, ...newBatch.filter(item => !prev.find(p => p.id === item.id))];
        console.log(`[CandidateDiscovery] New batch loaded. Displayed count: ${updatedDisplay.length}`);
        return updatedDisplay;
      });
      setCurrentIndex(newLoadIndex);
      setHasMore(newLoadIndex < filteredCandidatesMemo.length);
      setIsLoading(false);
      console.log(`[CandidateDiscovery] Finished loading batch. HasMore: ${newLoadIndex < filteredCandidatesMemo.length}`);
    }, 700);
  }, [isInitialLoading, isLoading, hasMore, currentIndex, filteredCandidatesMemo]);

  useEffect(() => {
    console.log("[CandidateDiscovery] Effect for filteredCandidatesMemo triggered. Length:", filteredCandidatesMemo.length);
    if (isInitialLoading) return; 
    setDisplayedCandidates([]);
    setCurrentIndex(0);
    const hasFilteredItems = filteredCandidatesMemo.length > 0;
    setHasMore(hasFilteredItems);
    if (hasFilteredItems) {
        console.log("[CandidateDiscovery] Reset: Has filtered items, calling loadMoreCandidates.");
        loadMoreCandidates();
    }
  }, [filteredCandidatesMemo, isInitialLoading, loadMoreCandidates]);

  useEffect(() => {
    console.log(`[CandidateDiscovery] IntersectionObserver: Attaching. hasMore: ${hasMore} isLoading: ${isLoading}`);
    if (isInitialLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMoreCandidates();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 300px 0px' });
    if (loadMoreTriggerRef.current) {
        observer.current.observe(loadMoreTriggerRef.current);
    }
    return () => { if (observer.current) observer.current.disconnect(); };
  }, [hasMore, isLoading, loadMoreCandidates, isInitialLoading]);


  const handleAction = async (candidateId: string, action: 'like' | 'pass') => { // 'viewProfile' is handled internally by CandidateCardContent
    const candidate = allCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    if (!mongoDbUserId) {
      toast({ title: "Login Required", description: "Please login to interact.", variant: "destructive" });
      return;
    }

    if (action === 'like') {
      if (!recruiterRepresentedCompanyId) {
        toast({ title: "Profile Incomplete", description: "Your recruiter profile needs to be associated with a company to make matches.", variant: "destructive" });
        return;
      }
      setLikedCandidateProfileIds(prev => new Set(prev).add(candidateId));
      try {
        const response = await recordLike({
          likingUserId: mongoDbUserId, likedProfileId: candidateId, likedProfileType: 'candidate',
          likingUserRole: 'recruiter', likingUserRepresentsCompanyId: recruiterRepresentedCompanyId,
        });
        if (response.success) {
          toast({ title: `Liked ${candidate.name}` });
          if (response.matchMade) {
            toast({ title: "🎉 It's a Mutual Match!", description: `You and ${candidate.name} are both interested! Check 'My Matches'.`, duration: 7000 });
          }
        } else {
          toast({ title: "Like Failed", description: response.message, variant: "destructive" });
          setLikedCandidateProfileIds(prev => { const newSet = new Set(prev); newSet.delete(candidateId); return newSet; });
        }
      } catch (error: any) {
        toast({ title: "Error Liking", description: error.message || "Could not record like.", variant: "destructive" });
        setLikedCandidateProfileIds(prev => { const newSet = new Set(prev); newSet.delete(candidateId); return newSet; });
      }
    } else if (action === 'pass') {
      try {
        const response = await passCandidate(mongoDbUserId, candidateId);
        updatePassedCandidateIds(response.passedCandidateProfileIds || []);
        setDisplayedCandidates(prev => prev.filter(c => c.id !== candidateId));
        toast({ title: `Moved ${candidate.name} to Trash Bin`, variant: "default" });
      } catch (error: any) {
        toast({ title: "Error Passing Candidate", description: error.message || "Could not pass candidate.", variant: "destructive" });
      }
    }
  };

  const handleRetrieveCandidate = async (candidateId: string) => {
    if (!mongoDbUserId) {
      toast({ title: "Login Required", variant: "destructive"});
      return;
    }
    try {
      const response = await retrieveCandidate(mongoDbUserId, candidateId);
      updatePassedCandidateIds(response.passedCandidateProfileIds || []);
      toast({ title: "Candidate Retrieved", description: `${allCandidates.find(c=>c.id === candidateId)?.name || 'Candidate'} is back in the discovery feed.` });
      setIsTrashBinOpen(false);
    } catch (error: any) {
      toast({ title: "Error Retrieving Candidate", description: error.message || "Could not retrieve candidate.", variant: "destructive" });
    }
  };

  const handleFilterChange = <K extends keyof CandidateFilters>(
    filterType: K,
    value: CandidateFilters[K] extends Set<infer T> ? T : never,
    isChecked: boolean
  ) => {
    setActiveFilters(prevFilters => {
      const newSet = new Set(prevFilters[filterType] as Set<any>);
      if (isChecked) newSet.add(value);
      else newSet.delete(value);
      return { ...prevFilters, [filterType]: newSet };
    });
  };

  const handleClearFilters = () => {
      setActiveFilters(initialFilters);
      setIsFilterSheetOpen(false);
  };
  const handleApplyFilters = () => setIsFilterSheetOpen(false);
  const numActiveFilters = Object.values(activeFilters).reduce((acc, set) => acc + set.size, 0);
  const fixedElementsHeight = '120px'; 

  if (isInitialLoading) {
    return <div className="flex flex-grow items-center justify-center bg-background" style={{ height: `calc(100vh - ${fixedElementsHeight})` }}><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col h-full relative">
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="default" size="icon" className="fixed bottom-20 right-4 z-20 rounded-full w-14 h-14 shadow-lg sm:bottom-6 sm:right-6" aria-label="Open filters">
            <Filter className="h-6 w-6" />
            {numActiveFilters > 0 && <Badge variant="secondary" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">{numActiveFilters}</Badge>}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-sm p-0">
          <CandidateFilterPanel activeFilters={activeFilters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} onApplyFilters={handleApplyFilters} />
        </SheetContent>
      </Sheet>

      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-36 right-4 z-20 rounded-full w-14 h-14 shadow-lg sm:bottom-24 sm:right-6 border-muted-foreground/50"
        onClick={() => setIsTrashBinOpen(true)}
        aria-label="Open Trash Bin"
      >
        <TrashIcon className="h-6 w-6 text-muted-foreground" />
        {trashBinCandidates.length > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">{trashBinCandidates.length}</Badge>}
      </Button>

      <Dialog open={isTrashBinOpen} onOpenChange={setIsTrashBinOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 sm:p-6 border-b">
            <DialogTitle className="text-xl text-primary flex items-center">
              <TrashIcon className="mr-2 h-5 w-5" /> Trash Bin - Passed Candidates
            </DialogTitle>
            <DialogDescription>
              Candidates you've passed on. You can retrieve them here.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 sm:p-6 space-y-3">
              {trashBinCandidates.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Your trash bin is empty.</p>
              ) : (
                trashBinCandidates.map(candidate => (
                  <div key={candidate.id} className="flex items-center p-3 space-x-3 shadow-sm border rounded-md">
                    {candidate.avatarUrl && (
                        <NextImage
                            src={candidate.avatarUrl.startsWith('/uploads/') ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}` : candidate.avatarUrl}
                            alt={candidate.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                            data-ai-hint={candidate.dataAiHint || "person"}
                            unoptimized={candidate.avatarUrl?.startsWith(CUSTOM_BACKEND_URL) || candidate.avatarUrl?.startsWith('http://localhost')}
                        />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-sm text-foreground">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{candidate.role}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRetrieveCandidate(candidate.id)} className="text-primary hover:bg-primary/10 border-primary/50">
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Retrieve
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t">
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-full snap-y snap-mandatory overflow-y-auto scroll-smooth no-scrollbar flex-grow" style={{ height: `calc(100vh - ${fixedElementsHeight})` }} tabIndex={0}>
        {displayedCandidates.map((candidate) => (
          <div key={candidate.id} className="h-full snap-start snap-always flex flex-col items-center justify-center p-2 sm:p-4 bg-transparent">
             <SwipeCard className={`w-full max-w-md sm:max-w-lg md:max-w-xl flex flex-col shadow-xl rounded-2xl bg-card overflow-hidden max-h-[calc(100vh-150px)] sm:max-h-[calc(100vh-160px)] ${likedCandidateProfileIds.has(candidate.id) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'}`}>
              <CandidateCardContent 
                candidate={candidate} 
                onSwipeAction={handleAction}
                isLiked={likedCandidateProfileIds.has(candidate.id)}
                isGuestMode={!mongoDbUserId}
              />
            </SwipeCard>
          </div>
        ))}
        {isLoading && !isInitialLoading && <div className="h-full snap-start snap-always flex items-center justify-center p-4"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
        {hasMore && !isLoading && !isInitialLoading && filteredCandidatesMemo.length > 0 && displayedCandidates.length < filteredCandidatesMemo.length && <div ref={loadMoreTriggerRef} className="h-1 opacity-0">Load More</div>}
        {!isLoading && !isInitialLoading && displayedCandidates.length === 0 && (
          <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-background">
            <SearchX className="h-20 w-20 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-foreground">{searchTerm || numActiveFilters > 0 ? "No Candidates Found" : "No More Candidates"}</h2>
            <p className="text-muted-foreground">{searchTerm || numActiveFilters > 0 ? "Try adjusting your search or filters." : "You've seen everyone for now, or check your Trash Bin."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

    