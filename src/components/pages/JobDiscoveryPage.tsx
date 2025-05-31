
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Company, JobFilters, UserRole } from '@/lib/types';
import { mockCompanies as staticMockCompanies, mockCandidates } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX, Filter, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { JobFilterPanel } from "@/components/filters/JobFilterPanel";
import { Badge } from '@/components/ui/badge';
import { fetchJobsFromBackend } from '@/services/jobService';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { recordLike } from '@/services/matchService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';


const ITEMS_PER_BATCH = 3;
const LOCAL_STORAGE_PASSED_COMPANIES_KEY_PREFIX = 'passedCompanies_';
const LOCAL_STORAGE_TRASH_BIN_COMPANIES_KEY_PREFIX = 'trashBinCompanies_';

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
  const [isTrashBinOpen, setIsTrashBinOpen] = useState(false);
  const [trashBinCompanies, setTrashBinCompanies] = useState<Company[]>([]);

  const [activeFilters, setActiveFilters] = useState<JobFilters>(initialJobFilters);

  const [likedCompanyProfileIds, setLikedCompanyProfileIds] = useState<Set<string>>(new Set());
  const [passedCompanyProfileIds, setPassedCompanyProfileIds] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const { mongoDbUserId, preferences } = useUserPreferences();
  const [jobSeekerRepresentedCandidateId, setJobSeekerRepresentedCandidateId] = useState<string | null>(null);

  const getPassedKey = useCallback(() => `${LOCAL_STORAGE_PASSED_COMPANIES_KEY_PREFIX}${mongoDbUserId || 'guest'}`, [mongoDbUserId]);
  const getTrashBinKey = useCallback(() => `${LOCAL_STORAGE_TRASH_BIN_COMPANIES_KEY_PREFIX}${mongoDbUserId || 'guest'}`, [mongoDbUserId]);

  useEffect(() => {
     if (mongoDbUserId) {
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

      // Load passed and trash bin after masterJobFeed is set
      const storedPassed = localStorage.getItem(getPassedKey());
      if (storedPassed) setPassedCompanyProfileIds(new Set(JSON.parse(storedPassed)));

      const storedTrash = localStorage.getItem(getTrashBinKey());
      if (storedTrash && combinedJobs.length > 0) {
          const trashIds: string[] = JSON.parse(storedTrash);
          setTrashBinCompanies(combinedJobs.filter(c => trashIds.includes(c.id)));
      }

    } catch (error) {
      console.error("Failed to load initial jobs:", error);
      setMasterJobFeed(staticMockCompanies); // Fallback to static mocks on error
      toast({ title: "Error", description: "Could not load initial job listings.", variant: "destructive" });
    } finally {
      setIsInitialLoading(false);
      setIsLoading(false);
    }
  }, [toast, getPassedKey, getTrashBinKey]);

  useEffect(() => {
    loadAndSetInitialJobs();
  }, [loadAndSetInitialJobs]);


  const filteredJobFeed = useMemo(() => {
    if (isInitialLoading) return [];
    let companies = [...masterJobFeed];
    
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
        loadMoreCompaniesFromLocal(); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJobFeed, isInitialLoading]); 

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
          likingUserRepresentsCandidateId: jobSeekerRepresentedCandidateId,
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
        localStorage.setItem(getPassedKey(), JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      setTrashBinCompanies(prevTrash => {
        const updatedTrash = [company, ...prevTrash.filter(tc => tc.id !== company.id)];
        localStorage.setItem(getTrashBinKey(), JSON.stringify(updatedTrash.map(c => c.id)));
        return updatedTrash;
      });
      setDisplayedCompanies(prev => prev.filter(c => c.id !== companyId));
      toast({ title: `Moved ${company.name} to Trash Bin`, variant: "default" });
    }
  };

  const handleRetrieveCompany = (companyId: string) => {
    setTrashBinCompanies(prevTrash => {
        const updatedTrash = prevTrash.filter(c => c.id !== companyId);
        localStorage.setItem(getTrashBinKey(), JSON.stringify(updatedTrash.map(c => c.id)));
        return updatedTrash;
    });
    setPassedCompanyProfileIds(prevPassed => {
        const newPassed = new Set(prevPassed);
        newPassed.delete(companyId);
        localStorage.setItem(getPassedKey(), JSON.stringify(Array.from(newPassed)));
        return newPassed;
    });
    
    setCurrentIndex(0); 
    setDisplayedCompanies([]); 
    setHasMore(true); // Reset hasMore flag to allow loading
    toast({ title: "Company Retrieved", description: `${masterJobFeed.find(c=>c.id === companyId)?.name || 'Company'} is back in the discovery feed.` });
    setIsTrashBinOpen(false);
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

  const handleClearFilters = () => {
      setActiveFilters(initialJobFilters);
      setIsSheetOpen(false);
  };
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

      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-36 right-4 z-20 rounded-full w-14 h-14 shadow-lg sm:bottom-24 sm:right-6 border-muted-foreground/50"
        onClick={() => setIsTrashBinOpen(true)}
        aria-label="Open Trash Bin"
      >
        <TrashIcon className="h-6 w-6 text-muted-foreground" />
        {trashBinCompanies.length > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">{trashBinCompanies.length}</Badge>}
      </Button>

      <Dialog open={isTrashBinOpen} onOpenChange={setIsTrashBinOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 sm:p-6 border-b">
            <DialogTitle className="text-xl text-primary flex items-center">
              <TrashIcon className="mr-2 h-5 w-5" /> Trash Bin - Passed Jobs/Companies
            </DialogTitle>
            <DialogDescription>
              Opportunities you've passed on. You can retrieve them here.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 sm:p-6 space-y-3">
              {trashBinCompanies.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Your trash bin is empty.</p>
              ) : (
                trashBinCompanies.map(company => (
                  <Card key={company.id} className="flex items-center p-3 space-x-3 shadow-sm">
                    {company.logoUrl && (
                        <Image
                            src={company.logoUrl}
                            alt={company.name}
                            width={48}
                            height={48}
                            className="rounded-md object-contain"
                            data-ai-hint={company.dataAiHint || "company logo"}
                        />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-sm text-foreground">{company.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{company.jobOpenings && company.jobOpenings.length > 0 ? company.jobOpenings[0].title : company.industry}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRetrieveCompany(company.id)} className="text-primary hover:bg-primary/10 border-primary/50">
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Retrieve
                    </Button>
                  </Card>
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
        {displayedCompanies.map(company => (
          <div key={company.id} className="h-full snap-start snap-always flex flex-col items-center justify-center p-1 sm:p-2 bg-background">
            <SwipeCard className={`w-full max-w-md sm:max-w-lg md:max-w-xl flex flex-col shadow-xl rounded-2xl bg-card overflow-hidden max-h-[calc(100vh-150px)] sm:max-h-[calc(100vh-160px)] ${likedCompanyProfileIds.has(company.id) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'} -mt-[30px]`}>
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
                <p className="text-muted-foreground">{searchTerm || numActiveFilters > 0 ? "Try adjusting your search or filters." : "You've seen all opportunities for now, or check your Trash Bin."}</p>
            </div>
        )}
      </div>
    </div>
  );
}

    
