
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Candidate, CandidateFilters, UserRole } from '@/lib/types';
import { WorkExperienceLevel, EducationLevel, LocationPreference, JobType } from '@/lib/types';
import { mockCandidates, mockCompanies } from '@/lib/mockData'; // Keep mockCompanies for recruiter's company context
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CandidateCardContent } from '@/components/swipe/CandidateCardContent';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX, Filter, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { CandidateFilterPanel } from "@/components/filters/CandidateFilterPanel";
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { recordLike } from '@/services/matchService';

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
  const [allCandidates, setAllCandidates] = useState<Candidate[]>(mockCandidates); // Start with mock data
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [displayedCandidates, setDisplayedCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState<CandidateFilters>(initialFilters);

  const [likedCandidateProfileIds, setLikedCandidateProfileIds] = useState<Set<string>>(new Set());
  const [passedCandidateProfileIds, setPassedCandidateProfileIds] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const { mongoDbUserId, preferences } = useUserPreferences();
  // Get the recruiter's represented company profile ID from UserPreferences or localStorage as a fallback
  const [recruiterRepresentedCompanyId, setRecruiterRepresentedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (mongoDbUserId) {
        // This would ideally come from the fetched User object via context
        // For now, using localStorage as a placeholder if user sets it.
        const storedCompanyId = localStorage.getItem(`user_${mongoDbUserId}_representedCompanyId`);
        setRecruiterRepresentedCompanyId(storedCompanyId || (mockCompanies.length > 0 ? mockCompanies[0].id : 'comp-placeholder-recruiter'));
    }
  }, [mongoDbUserId]);


  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initialize passed candidates from localStorage
    const storedPassed = localStorage.getItem(`passedCandidates_${mongoDbUserId || 'guest'}`);
    if (storedPassed) setPassedCandidateProfileIds(new Set(JSON.parse(storedPassed)));

    // TODO: Fetch actual likedCandidateIds from backend if needed for initial UI state
    // For now, `likedCandidateProfileIds` is updated optimistically on like action.
  }, [mongoDbUserId]);


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
    // ... other filters

    const lowerSearchTerm = searchTerm.toLowerCase();
    if (searchTerm.trim()) {
      candidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(lowerSearchTerm) ||
        (candidate.role && candidate.role.toLowerCase().includes(lowerSearchTerm))
        // ... other search criteria
      );
    }
    return candidates.filter(c => !passedCandidateProfileIds.has(c.id));
  }, [allCandidates, activeFilters, searchTerm, passedCandidateProfileIds]);

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
      setDisplayedCandidates(prev => [...prev, ...newBatch.filter(item => !prev.find(p => p.id === item.id))]);
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
      loadMoreCandidates(); // Load initial batch
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCandidates]); // Rerun when filteredCandidates change, loadMoreCandidates is stable

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMoreCandidates();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 300px 0px' });
    if (loadMoreTriggerRef.current) observer.current.observe(loadMoreTriggerRef.current);
    return () => { if (observer.current) observer.current.disconnect(); };
  }, [hasMore, isLoading, loadMoreCandidates]);


  const handleAction = async (candidateId: string, action: 'like' | 'pass' | 'details' | 'share') => {
    if (!mongoDbUserId) {
      toast({ title: "Login Required", description: "Please login to interact.", variant: "destructive" });
      return;
    }
    if (action === 'share' || action === 'details') {
        console.log(`${action} action for candidate ${candidateId}`);
        return;
    }

    const candidate = allCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    if (action === 'like') {
      if (!recruiterRepresentedCompanyId) {
        toast({ title: "Profile Incomplete", description: "Your recruiter profile needs to be associated with a company to make matches.", variant: "destructive" });
        return;
      }
      setLikedCandidateProfileIds(prev => new Set(prev).add(candidateId));
      try {
        const response = await recordLike({
          likingUserId: mongoDbUserId,
          likedProfileId: candidateId,
          likedProfileType: 'candidate',
          likingUserRole: 'recruiter',
          likingUserRepresentsCompanyId: recruiterRepresentedCompanyId, // Recruiter provides their company ID
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
        localStorage.setItem(`passedCandidates_${mongoDbUserId || 'guest'}`, JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      // Optimistically remove from displayed candidates
      setDisplayedCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast({ title: `Passed on ${candidate.name}`, variant: "default" });
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

  const handleClearFilters = () => setActiveFilters(initialFilters);
  const handleApplyFilters = () => setIsSheetOpen(false);
  const numActiveFilters = Object.values(activeFilters).reduce((acc, set) => acc + set.size, 0);
  const fixedElementsHeight = '120px';

  return (
    <div className="flex flex-col h-full relative">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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

      <div className="w-full snap-y snap-mandatory overflow-y-auto scroll-smooth no-scrollbar flex-grow" style={{ height: `calc(100vh - ${fixedElementsHeight})` }} tabIndex={0}>
        {displayedCandidates.map((candidate) => (
          <div key={candidate.id} className="h-full snap-start snap-always flex flex-col items-center justify-center p-1 bg-background">
            <SwipeCard className={`w-full max-w-xl h-full flex flex-col ${likedCandidateProfileIds.has(candidate.id) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'} ${candidate.isUnderestimatedTalent ? 'border-2 border-yellow-500 shadow-yellow-500/20' : ''}`}>
              <CandidateCardContent candidate={candidate} onSwipeAction={handleAction} isLiked={likedCandidateProfileIds.has(candidate.id)} />
            </SwipeCard>
          </div>
        ))}
        {isLoading && <div className="h-full snap-start snap-always flex items-center justify-center p-4"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
        {hasMore && !isLoading && filteredCandidates.length > 0 && <div ref={loadMoreTriggerRef} className="h-1 opacity-0">Load More</div>}
        {!isLoading && displayedCandidates.length === 0 && (
          <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-background">
            <SearchX className="h-20 w-20 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-foreground">{searchTerm || numActiveFilters > 0 ? "No Candidates Found" : "No More Candidates"}</h2>
            <p className="text-muted-foreground">{searchTerm || numActiveFilters > 0 ? "Try adjusting your search or filters." : "You've seen everyone for now."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
