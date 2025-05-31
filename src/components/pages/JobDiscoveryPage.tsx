
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Company, JobFilters, UserRole } from '@/lib/types';
import { mockCompanies as staticMockCompanies, mockCandidates } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { JobFilterPanel } from "@/components/filters/JobFilterPanel";
import { Badge } from '@/components/ui/badge';
import { fetchJobsFromBackend } from '@/services/jobService';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { recordLike } from '@/services/matchService';


const ITEMS_PER_BATCH = 3;

interface JobDiscoveryPageProps {
  searchTerm?: string;
}

const initialJobFilters: JobFilters = {
  experienceLevels: new Set(),
  educationLevels: new Set(),
  workLocationTypes: new Set(),
  jobTypes: new Set(),
};

export function JobDiscoveryPage({ searchTerm = "" }: JobDiscoveryPageProps) {
  const [masterJobFeed, setMasterJobFeed] = useState<Company[]>([]);
  const [displayedCompanies, setDisplayedCompanies] = useState<Company[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState<JobFilters>(initialJobFilters);

  const [likedCompanyProfileIds, setLikedCompanyProfileIds] = useState<Set<string>>(new Set());
  const [passedCompanyProfileIds, setPassedCompanyProfileIds] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const { mongoDbUserId, preferences } = useUserPreferences();
  const [jobSeekerRepresentedCandidateId, setJobSeekerRepresentedCandidateId] = useState<string | null>(null);

  useEffect(() => {
     if (mongoDbUserId) {
        // This would ideally come from the fetched User object via context
        const storedCandidateId = localStorage.getItem(`user_${mongoDbUserId}_representedCandidateId`);
        setJobSeekerRepresentedCandidateId(storedCandidateId || (mockCandidates.length > 0 ? mockCandidates[0].id : 'cand-placeholder-jobseeker'));
    }
  }, [mongoDbUserId]);

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const loadAndSetInitialJobs = useCallback(async () => {
    setIsInitialLoading(true);
    setIsLoading(true);
    try {
      const { jobs: initialJobs } = await fetchJobsFromBackend();
      const combinedJobs = [
        ...initialJobs,
        ...staticMockCompanies.filter(mc => !initialJobs.find(upj => upj.id === mc.id))
      ];
      setMasterJobFeed(combinedJobs);
    } catch (error) {
      console.error("Failed to load initial jobs:", error);
      setMasterJobFeed(staticMockCompanies);
      toast({ title: "Error", description: "Could not load initial job listings.", variant: "destructive" });
    } finally {
      setIsInitialLoading(false);
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAndSetInitialJobs();
    const storedPassed = localStorage.getItem(`passedCompanies_${mongoDbUserId || 'guest'}`);
    if (storedPassed) setPassedCompanyProfileIds(new Set(JSON.parse(storedPassed)));
  }, [loadAndSetInitialJobs, mongoDbUserId]);

  const filteredJobFeed = useMemo(() => {
    if (isInitialLoading) return [];
    let companies = [...masterJobFeed];
    // ... (filtering logic remains the same)
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (activeFilters.experienceLevels.size > 0) {
      companies = companies.filter(c => c.jobOpenings?.some(job => job.requiredExperienceLevel && activeFilters.experienceLevels.has(job.requiredExperienceLevel)));
    }
    if (activeFilters.educationLevels.size > 0) {
      companies = companies.filter(c => c.jobOpenings?.some(job => job.requiredEducationLevel && activeFilters.educationLevels.has(job.requiredEducationLevel)));
    }
    if (activeFilters.workLocationTypes.size > 0) {
      companies = companies.filter(c => c.jobOpenings?.some(job => job.workLocationType && activeFilters.workLocationTypes.has(job.workLocationType)));
    }
    if (activeFilters.jobTypes.size > 0) {
      companies = companies.filter(c => c.jobOpenings?.some(job => job.jobType && activeFilters.jobTypes.has(job.jobType)));
    }
    if (searchTerm.trim()) {
      companies = companies.filter(company => {
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
    }
    return companies.filter(c => !passedCompanyProfileIds.has(c.id));
  }, [masterJobFeed, activeFilters, searchTerm, isInitialLoading, passedCompanyProfileIds]);

  const loadMoreCompaniesFromLocal = useCallback(() => {
    if (isLoading || !hasMore || currentIndex >= filteredJobFeed.length) {
      if (currentIndex >= filteredJobFeed.length) setHasMore(false);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const newLoadIndex = currentIndex + ITEMS_PER_BATCH;
      const newBatch = filteredJobFeed.slice(currentIndex, newLoadIndex);
      setDisplayedCompanies(prev => [...prev, ...newBatch.filter(item => !prev.find(p => p.id === item.id))]);
      setCurrentIndex(newLoadIndex);
      setHasMore(newLoadIndex < filteredJobFeed.length);
      setIsLoading(false);
    }, 700);
  }, [isLoading, hasMore, currentIndex, filteredJobFeed]);

  useEffect(() => {
    if (isInitialLoading) return;
    setDisplayedCompanies([]);
    setCurrentIndex(0);
    const hasFilteredItems = filteredJobFeed.length > 0;
    setHasMore(hasFilteredItems);
    if (hasFilteredItems) {
        loadMoreCompaniesFromLocal(); // Load initial batch
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJobFeed, isInitialLoading]); // Rerun when filteredJobFeed change

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading && !isInitialLoading) {
        loadMoreCompaniesFromLocal();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 300px 0px' });
    if (loadMoreTriggerRef.current) observer.current.observe(loadMoreTriggerRef.current);
    return () => { if (observer.current) observer.current.disconnect(); };
  }, [hasMore, isLoading, isInitialLoading, loadMoreCompaniesFromLocal]);

  const handleAction = async (companyId: string, action: 'like' | 'pass' | 'details' | 'share') => {
    if (!mongoDbUserId) {
      toast({ title: "Login Required", description: "Please login to interact.", variant: "destructive" });
      return;
    }
    if (action === 'share' || action === 'details') {
        console.log(`${action} action for company ${companyId}`);
        return;
    }

    const company = masterJobFeed.find(c => c.id === companyId);
    if (!company) return;

    if (action === 'like') {
      if (!jobSeekerRepresentedCandidateId) {
        toast({ title: "Profile Incomplete", description: "Your job seeker profile needs to be set up to make matches.", variant: "destructive" });
        return;
      }
      setLikedCompanyProfileIds(prev => new Set(prev).add(companyId));
      try {
        const response = await recordLike({
          likingUserId: mongoDbUserId,
          likedProfileId: companyId,
          likedProfileType: 'company',
          likingUserRole: 'jobseeker',
          likingUserRepresentsCandidateId: jobSeekerRepresentedCandidateId, // Job seeker provides their candidate ID
        });
        if (response.success) {
          toast({ title: `Interested in ${company.name}` });
          if (response.matchMade) {
            toast({
              title: "🎉 It's a Mutual Match!",
              description: `You and ${company.name} are both interested! Check 'My Matches'.`,
              duration: 7000,
            });
          }
        } else {
          toast({ title: "Like Failed", description: response.message, variant: "destructive" });
          setLikedCompanyProfileIds(prev => { const newSet = new Set(prev); newSet.delete(companyId); return newSet; });
        }
      } catch (error: any) {
        toast({ title: "Error Liking", description: error.message || "Could not record like.", variant: "destructive" });
        setLikedCompanyProfileIds(prev => { const newSet = new Set(prev); newSet.delete(companyId); return newSet; });
      }
    } else if (action === 'pass') {
      setPassedCompanyProfileIds(prev => {
        const newSet = new Set(prev).add(companyId);
        localStorage.setItem(`passedCompanies_${mongoDbUserId || 'guest'}`, JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      setDisplayedCompanies(prev => prev.filter(c => c.id !== companyId));
      toast({ title: `Passed on ${company.name}`, variant: "default" });
    }
  };

  const handleFilterChange = <K extends keyof JobFilters>(
    filterType: K,
    value: JobFilters[K] extends Set<infer T> ? T : never,
    isChecked: boolean
  ) => {
    setActiveFilters(prevFilters => {
      const newSet = new Set(prevFilters[filterType] as Set<any>);
      if (isChecked) newSet.add(value);
      else newSet.delete(value);
      return { ...prevFilters, [filterType]: newSet };
    });
  };

  const handleClearFilters = () => setActiveFilters(initialJobFilters);
  const handleApplyFilters = () => setIsSheetOpen(false);
  const numActiveFilters = Object.values(activeFilters).reduce((acc, set) => acc + set.size, 0);
  const fixedElementsHeight = '120px';

  if (isInitialLoading) {
    return <div className="flex flex-grow items-center justify-center bg-background" style={{ height: `calc(100vh - ${fixedElementsHeight})` }}><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

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
          <JobFilterPanel activeFilters={activeFilters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} onApplyFilters={handleApplyFilters} />
        </SheetContent>
      </Sheet>

      <div className="w-full snap-y snap-mandatory overflow-y-auto scroll-smooth no-scrollbar flex-grow" style={{ height: `calc(100vh - ${fixedElementsHeight})` }} tabIndex={0}>
        {displayedCompanies.map(company => (
          <div key={company.id} className="h-full snap-start snap-always flex flex-col items-center justify-center p-1 bg-background">
            <SwipeCard className={`w-full max-w-xl h-full flex flex-col ${likedCompanyProfileIds.has(company.id) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'}`}>
              <CompanyCardContent company={company} onSwipeAction={handleAction} isLiked={likedCompanyProfileIds.has(company.id)} />
            </SwipeCard>
          </div>
        ))}
        {isLoading && !isInitialLoading && <div className="h-full snap-start snap-always flex items-center justify-center p-4"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
        {hasMore && !isLoading && !isInitialLoading && filteredJobFeed.length > 0 && <div ref={loadMoreTriggerRef} className="h-1 opacity-0">Load More</div>}
        {!isLoading && displayedCompanies.length === 0 && (
            <div className="h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-background">
                <SearchX className="h-20 w-20 text-muted-foreground mb-6" />
                <h2 className="text-2xl font-semibold mb-3 text-foreground">{searchTerm || numActiveFilters > 0 ? "No Jobs Found" : "No More Jobs"}</h2>
                <p className="text-muted-foreground">{searchTerm || numActiveFilters > 0 ? "Try adjusting your search or filters." : "You've seen all opportunities for now."}</p>
            </div>
        )}
      </div>
    </div>
  );
}
