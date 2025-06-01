
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Candidate, CandidateFilters, UserRole } from '@/lib/types';
import { WorkExperienceLevel, EducationLevel, LocationPreference, JobType, Availability } from '@/lib/types'; // Added Availability
import { mockCandidates } from '@/lib/mockData'; // Keep for fallback
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CandidateCardContent } from '@/components/swipe/CandidateCardContent';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX, Filter, X, RotateCcw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CandidateFilterPanel } from "@/components/filters/CandidateFilterPanel";
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { recordLike } from '@/services/matchService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const ITEMS_PER_BATCH = 3;
const LOCAL_STORAGE_PASSED_CANDIDATES_KEY_PREFIX = 'passedCandidates_';
const LOCAL_STORAGE_TRASH_BIN_CANDIDATES_KEY_PREFIX = 'trashBinCandidates_';
// LOCAL_STORAGE_JOBSEEKER_PROFILE_KEY is no longer used for overriding cand1

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

// Simple Trash icon as Lucide might not have a perfect one
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);


interface CandidateDiscoveryPageProps {
  searchTerm?: string;
}

const initialFilters: CandidateFilters = {
  experienceLevels: new Set(),
  educationLevels: new Set(),
  locationPreferences: new Set(),
  jobTypes: new Set(),
};

const getThemeClass = (themeKey?: string) => {
  if (!themeKey || themeKey === 'default') return 'card-theme-default';
  return `card-theme-${themeKey}`;
};

export function CandidateDiscoveryPage({ searchTerm = "" }: CandidateDiscoveryPageProps) {
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [displayedCandidates, setDisplayedCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // For subsequent pagination loading
  const [hasMore, setHasMore] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isTrashBinOpen, setIsTrashBinOpen] = useState(false);
  const [trashBinCandidates, setTrashBinCandidates] = useState<Candidate[]>([]);

  const [activeFilters, setActiveFilters] = useState<CandidateFilters>(initialFilters);

  const [likedCandidateProfileIds, setLikedCandidateProfileIds] = useState<Set<string>>(new Set());
  const [passedCandidateProfileIds, setPassedCandidateProfileIds] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const { mongoDbUserId, preferences } = useUserPreferences();
  const [recruiterRepresentedCompanyId, setRecruiterRepresentedCompanyId] = useState<string | null>(null);

  const getPassedKey = useCallback(() => `${LOCAL_STORAGE_PASSED_CANDIDATES_KEY_PREFIX}${mongoDbUserId || 'guest'}`, [mongoDbUserId]);
  const getTrashBinKey = useCallback(() => `${LOCAL_STORAGE_TRASH_BIN_CANDIDATES_KEY_PREFIX}${mongoDbUserId || 'guest'}`, [mongoDbUserId]);

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);


  const fetchBackendCandidates = useCallback(async () => {
    console.log("[CandidateDiscovery] Fetching candidates from backend...");
    setIsInitialLoading(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/profiles/jobseekers`);
      if (!response.ok) {
        throw new Error(`Failed to fetch candidate profiles: ${response.status}`);
      }
      const data: Candidate[] = await response.json();
      setAllCandidates(data);
      console.log("[CandidateDiscovery] Fetched candidates from backend:", data.length);
    } catch (error) {
      console.error("Error fetching candidates from backend:", error);
      toast({ title: "Error Loading Candidates", description: "Could not load candidate profiles from the backend. Displaying mock data as fallback.", variant: "destructive" });
      setAllCandidates([...mockCandidates]); // Fallback to mockCandidates
    } finally {
      setIsInitialLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBackendCandidates();
  }, [fetchBackendCandidates]);


  useEffect(() => {
    if (mongoDbUserId) {
        // This would ideally come from the user's backend profile
        const storedCompanyId = localStorage.getItem(`user_${mongoDbUserId}_representedCompanyId`); 
        setRecruiterRepresentedCompanyId(storedCompanyId || 'comp-placeholder-recruiter'); // Placeholder if not set
    }
  }, [mongoDbUserId]);

  useEffect(() => {
    if (isInitialLoading || allCandidates.length === 0) return; // Don't process if still loading or no base data

    const storedPassed = localStorage.getItem(getPassedKey());
    if (storedPassed) setPassedCandidateProfileIds(new Set(JSON.parse(storedPassed)));

    const storedTrash = localStorage.getItem(getTrashBinKey());
    if (storedTrash) {
        const trashIds: string[] = JSON.parse(storedTrash);
        // Filter from `allCandidates` (which now comes from backend)
        setTrashBinCandidates(allCandidates.filter(c => trashIds.includes(c.id)));
    }
  }, [mongoDbUserId, allCandidates, getPassedKey, getTrashBinKey, isInitialLoading]);


  const filteredCandidatesMemo = useMemo(() => {
    if (isInitialLoading) return [];
    console.log("[CandidateDiscovery] Recalculating filteredCandidatesMemo...");
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

    const lowerSearchTerm = searchTerm.toLowerCase();
    if (searchTerm.trim()) {
      candidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(lowerSearchTerm) ||
        (candidate.role && candidate.role.toLowerCase().includes(lowerSearchTerm)) ||
        (candidate.skills && candidate.skills.some(skill => skill.toLowerCase().includes(lowerSearchTerm)))
      );
    }
    console.log(`[CandidateDiscovery] Candidates after main filters: ${candidates.length}, Passed IDs count: ${passedCandidateProfileIds.size}`);
    const finalFiltered = candidates.filter(c => !passedCandidateProfileIds.has(c.id));
    console.log(`[CandidateDiscovery] Final filtered count: ${finalFiltered.length}`);
    return finalFiltered;
  }, [allCandidates, activeFilters, searchTerm, passedCandidateProfileIds, isInitialLoading]);


  const loadMoreCandidates = useCallback(() => {
    if (isInitialLoading || isLoading || !hasMore || currentIndex >= filteredCandidatesMemo.length) {
      if (currentIndex >= filteredCandidatesMemo.length && filteredCandidatesMemo.length > 0) {
        setHasMore(false);
      } else if (filteredCandidatesMemo.length === 0) {
        setHasMore(false);
      }
      return;
    }
    setIsLoading(true); // For subsequent pagination loading
    console.log(`[CandidateDiscovery] Loading more candidates. Current index: ${currentIndex}, Batch size: ${ITEMS_PER_BATCH}, Filtered total: ${filteredCandidatesMemo.length}`);
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
    if (isInitialLoading) return; // Don't run if initial data isn't loaded yet
    console.log(`[CandidateDiscovery] Effect for filteredCandidatesMemo triggered. Length: ${filteredCandidatesMemo.length}`);
    setDisplayedCandidates([]);
    setCurrentIndex(0);
    const hasFilteredItems = filteredCandidatesMemo.length > 0;
    setHasMore(hasFilteredItems);
    if (hasFilteredItems) {
        console.log("[CandidateDiscovery] Reset: Has filtered items, calling loadMoreCandidates.");
        loadMoreCandidates();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCandidatesMemo, isInitialLoading]); // Removed loadMoreCandidates from deps


  useEffect(() => {
    if (isInitialLoading) return;
    console.log(`[CandidateDiscovery] IntersectionObserver: Attaching. hasMore: ${hasMore} isLoading: ${isLoading}`);
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        console.log("[CandidateDiscovery] IntersectionObserver: Triggered loadMoreCandidates.");
        loadMoreCandidates();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 300px 0px' });
    if (loadMoreTriggerRef.current) {
        observer.current.observe(loadMoreTriggerRef.current);
    }
    return () => { if (observer.current) observer.current.disconnect(); };
  }, [hasMore, isLoading, loadMoreCandidates, isInitialLoading]);

  const handleAction = async (candidateId: string, action: 'like' | 'pass' | 'details' | 'share') => {
    if (action === 'share' || action === 'details') {
        console.log(`${action} action for candidate ${candidateId}`);
        return;
    }

    const candidate = allCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    if (action === 'like') {
      if (!mongoDbUserId) {
        toast({ title: "Login Required", description: "Please login to interact.", variant: "destructive" });
        return;
      }
      if (!recruiterRepresentedCompanyId) {
        toast({ title: "Profile Incomplete", description: "Your recruiter profile needs to be associated with a company to make matches.", variant: "destructive" });
        return;
      }
      setLikedCandidateProfileIds(prev => new Set(prev).add(candidateId));
      try {
        const response = await recordLike({
          likingUserId: mongoDbUserId,
          likedProfileId: candidateId, // candidateId is now the backend User._id
          likedProfileType: 'candidate',
          likingUserRole: 'recruiter',
          likingUserRepresentsCompanyId: recruiterRepresentedCompanyId,
        });
        if (response.success) {
          toast({ title: `Liked ${candidate.name}` });
          if (response.matchMade) {
            toast({
              title: "🎉 It's a Mutual Match!",
              description: `You and ${candidate.name} are both interested! Check 'My Matches'.`,
              duration: 7000,
            });
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
      setPassedCandidateProfileIds(prev => {
        const newSet = new Set(prev).add(candidateId);
        localStorage.setItem(getPassedKey(), JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      setTrashBinCandidates(prevTrash => {
        const updatedTrash = [candidate, ...prevTrash.filter(tc => tc.id !== candidate.id)];
        localStorage.setItem(getTrashBinKey(), JSON.stringify(updatedTrash.map(c => c.id)));
        return updatedTrash;
      });
      setDisplayedCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast({ title: `Moved ${candidate.name} to Trash Bin`, variant: "default" });
    }
  };

  const handleRetrieveCandidate = (candidateId: string) => {
    setTrashBinCandidates(prevTrash => {
        const updatedTrash = prevTrash.filter(c => c.id !== candidateId);
        localStorage.setItem(getTrashBinKey(), JSON.stringify(updatedTrash.map(c => c.id)));
        return updatedTrash;
    });
    setPassedCandidateProfileIds(prevPassed => {
        const newPassed = new Set(prevPassed);
        newPassed.delete(candidateId);
        localStorage.setItem(getPassedKey(), JSON.stringify(Array.from(newPassed)));
        return newPassed;
    });
    toast({ title: "Candidate Retrieved", description: `${allCandidates.find(c=>c.id === candidateId)?.name || 'Candidate'} is back in the discovery feed.` });
    setIsTrashBinOpen(false);
    // Force re-evaluation of filteredCandidatesMemo by briefly changing a dependency it might indirectly use
    // or simply re-trigger the load. The simplest is to reset and reload.
    setDisplayedCandidates([]);
    setCurrentIndex(0);
    setHasMore(true);
    // loadMoreCandidates will be called by the useEffect watching filteredCandidatesMemo
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
                        <Image
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
          <div key={candidate.id} className="h-full snap-start snap-always flex flex-col items-center justify-center p-1 sm:p-2 bg-background">
             <SwipeCard className={cn(
                `w-full max-w-md sm:max-w-lg md:max-w-xl flex flex-col shadow-xl rounded-3xl overflow-hidden min-h-[calc(100vh-200px)] max-h-[calc(100vh-120px)]`,
                getThemeClass(candidate.cardTheme),
                likedCandidateProfileIds.has(candidate.id) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl',
                candidate.isUnderestimatedTalent ? 'border-2 border-yellow-500 shadow-yellow-500/20' : ''
              )}>
              <CandidateCardContent candidate={candidate} onSwipeAction={handleAction} isLiked={likedCandidateProfileIds.has(candidate.id)} isGuestMode={mongoDbUserId === null} />
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
