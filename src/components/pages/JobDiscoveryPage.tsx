
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Company, JobFilters, UserRole, CompanyJobOpening } from '@/lib/types';
import { mockCompanies } from '@/lib/mockData'; // Ensure mockCompanies is imported
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX, Filter, RotateCcw, Trash2 as TrashIcon } from 'lucide-react';
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
import { mockCandidates } from '@/lib/mockData';
import { passCompany, retrieveCompany } from '@/services/interactionService';


const ITEMS_PER_BATCH = 3;

interface CompanyWithRecruiterId extends Company {
  recruiterUserId?: string; // Ensure this is part of the type if backend sends it
}

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
  const [masterJobFeed, setMasterJobFeed] = useState<CompanyWithRecruiterId[]>([]);
  const [displayedCompanies, setDisplayedCompanies] = useState<CompanyWithRecruiterId[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isTrashBinOpen, setIsTrashBinOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState<JobFilters>(initialJobFilters);

  const [likedCompanyProfileIds, setLikedCompanyProfileIds] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const { mongoDbUserId, passedCompanyIds: passedCompanyProfileIdsFromContext, updatePassedCompanyIds, fullBackendUser } = useUserPreferences();
  const [jobSeekerRepresentedCandidateId, setJobSeekerRepresentedCandidateId] = useState<string | null>(null);


  useEffect(() => {
     if (mongoDbUserId) {
        const storedCandidateId = fullBackendUser?.representedCandidateProfileId ||
                                  (typeof window !== 'undefined' && localStorage.getItem('currentUserJobSeekerProfile')
                                    ? JSON.parse(localStorage.getItem('currentUserJobSeekerProfile')!).id
                                    : null);
        setJobSeekerRepresentedCandidateId(storedCandidateId || (mockCandidates.length > 0 ? mockCandidates[0].id : `cand-user-${mongoDbUserId.slice(0,5)}`));
    }
  }, [mongoDbUserId, fullBackendUser]);

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const loadAndSetInitialJobs = useCallback(async () => {
    setIsInitialLoading(true);
    setIsLoading(true);
    let errorOccurred = false;
    let fetchedJobs: CompanyWithRecruiterId[] = [];

    try {
      const backendResponse = await fetchJobsFromBackend();
      // The backend already structures the job data within a Company-like object.
      // Ensure the type matches what `fetchJobsFromBackend` is declared to return.
      fetchedJobs = backendResponse.jobs as CompanyWithRecruiterId[]; 
    } catch (error) {
      console.error("Failed to load initial jobs from backend:", error);
      toast({ title: "Error Loading Jobs", description: "Could not load job listings from the backend. Using mock data as fallback.", variant: "destructive" });
      errorOccurred = true;
    }

    const jobsToSet = (fetchedJobs.length === 0 || errorOccurred)
      ? mockCompanies.map(mc => ({
          ...mc,
          // Ensure recruiterUserId is present for mock data if needed by other logic
          recruiterUserId: mc.recruiterUserId || `mock-recruiter-${mc.id}` 
        })) as CompanyWithRecruiterId[]
      : fetchedJobs;

    setMasterJobFeed(jobsToSet);
    setIsInitialLoading(false);
    setIsLoading(false);
  }, [toast]);


  useEffect(() => {
    loadAndSetInitialJobs();
  }, [loadAndSetInitialJobs]);

  const trashBinCompanies = useMemo(() => {
    if (isInitialLoading || masterJobFeed.length === 0 || !passedCompanyProfileIdsFromContext) return [];
    return masterJobFeed.filter(c => passedCompanyProfileIdsFromContext.has(c.id));
  }, [masterJobFeed, passedCompanyProfileIdsFromContext, isInitialLoading]);


  const filteredJobFeed = useMemo(() => {
    if (isInitialLoading || !passedCompanyProfileIdsFromContext) return [];
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
        return (
          company.name.toLowerCase().includes(lowerSearchTerm) ||
          (company.industry && company.industry.toLowerCase().includes(lowerSearchTerm)) ||
          (company.jobOpenings && company.jobOpenings.some(job => 
            job.title.toLowerCase().includes(lowerSearchTerm) ||
            job.description.toLowerCase().includes(lowerSearchTerm) ||
            (job.tags && job.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))) ||
            (job.location && job.location.toLowerCase().includes(lowerSearchTerm))
          ))
        );
      });
    }
    return companies.filter(c => !passedCompanyProfileIdsFromContext.has(c.id));
  }, [masterJobFeed, activeFilters, searchTerm, isInitialLoading, passedCompanyProfileIdsFromContext]);

  const loadMoreCompaniesFromLocal = useCallback(() => {
    if (isLoading || !hasMore || currentIndex >= filteredJobFeed.length) {
      if (currentIndex >= filteredJobFeed.length) setHasMore(false);
      return;
    }
    setIsLoading(true);
    setTimeout(() => { // Simulate network delay for loading more
      const newLoadIndex = currentIndex + ITEMS_PER_BATCH;
      const newBatch = filteredJobFeed.slice(currentIndex, newLoadIndex);
      setDisplayedCompanies(prev => [...prev, ...newBatch.filter(item => !prev.find(p => p.id === item.id))]);
      setCurrentIndex(newLoadIndex);
      setHasMore(newLoadIndex < filteredJobFeed.length);
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, currentIndex, filteredJobFeed]);

  useEffect(() => {
    if (isInitialLoading) return; // Don't run if initial data isn't even loaded
    setDisplayedCompanies([]); // Reset displayed when filters or search term change
    setCurrentIndex(0); // Reset index
    const hasFilteredItems = filteredJobFeed.length > 0;
    setHasMore(hasFilteredItems); // Update hasMore based on the new filtered list
    if (hasFilteredItems) {
        // Load the first batch from the new filtered list
        loadMoreCompaniesFromLocal();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJobFeed, isInitialLoading]); // Depend on filteredJobFeed and isInitialLoading

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading && !isInitialLoading) {
        loadMoreCompaniesFromLocal();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 300px 0px' }); // Trigger when nearing the end
    if (loadMoreTriggerRef.current) observer.current.observe(loadMoreTriggerRef.current);
    return () => { if (observer.current) observer.current.disconnect(); };
  }, [hasMore, isLoading, isInitialLoading, loadMoreCompaniesFromLocal]);

  const handleAction = async (compositeCompanyJobId: string, action: 'like' | 'pass' | 'details' | 'share') => {
    if (!mongoDbUserId) {
      toast({ title: "Login Required", description: "Please login to interact.", variant: "destructive" });
      return;
    }
    // The compositeCompanyJobId is the company.id (e.g., `comp-user-${user._id.toString()}-job-${jobIdString}`)
    const company = masterJobFeed.find(c => c.id === compositeCompanyJobId);
    if (!company) {
      toast({ title: "Error", description: "Company details not found for action.", variant: "destructive" });
      return;
    }

    if (action === 'share' || action === 'details') {
        console.log(`${action} action for company-job ${compositeCompanyJobId}`);
        // Details action is handled by SwipeCard's internal modal logic (CompanyCardContent)
        return;
    }

    const recruiterOwnerId = company.recruiterUserId; // This should be the actual MongoDB _id of the recruiter User
    if (!recruiterOwnerId) {
      toast({ title: "Error", description: "Recruiter for this company not identified.", variant: "destructive" });
      return;
    }

    const jobOpening = company.jobOpenings && company.jobOpenings.length > 0 ? company.jobOpenings[0] : null;


    if (action === 'like') {
      if (!jobSeekerRepresentedCandidateId) {
        toast({ title: "Profile Incomplete", description: "Your job seeker profile needs to be set up to make matches. Please complete it in 'My Profile'.", variant: "destructive" });
        return;
      }
      setLikedCompanyProfileIds(prev => new Set(prev).add(recruiterOwnerId)); // Track like by recruiter's User ID
      try {
        const response = await recordLike({
          likingUserId: mongoDbUserId,
          likedProfileId: recruiterOwnerId, 
          likedProfileType: 'company', // Liked profile is the recruiter representing the company/job
          likingUserRole: 'jobseeker',
          likingUserRepresentsCandidateId: jobSeekerRepresentedCandidateId,
          jobOpeningTitle: jobOpening?.title, 
        });
        if (response.success) {
          toast({ title: `Interested in job at ${company.name}` });
          if (response.matchMade) {
            toast({
              title: "🎉 It's a Mutual Match!",
              description: `You and ${company.name} are both interested! Check 'My Matches'.`,
              duration: 7000,
            });
          }
        } else {
          toast({ title: "Like Failed", description: response.message, variant: "destructive" });
          setLikedCompanyProfileIds(prev => { const newSet = new Set(prev); newSet.delete(recruiterOwnerId); return newSet; });
        }
      } catch (error: any) {
        toast({ title: "Error Liking", description: error.message || "Could not record like.", variant: "destructive" });
        setLikedCompanyProfileIds(prev => { const newSet = new Set(prev); newSet.delete(recruiterOwnerId); return newSet; });
      }
    } else if (action === 'pass') {
      try {
        const response = await passCompany(mongoDbUserId, compositeCompanyJobId);
        updatePassedCompanyIds(response.passedCompanyProfileIds || []);
        setDisplayedCompanies(prev => prev.filter(c => c.id !== compositeCompanyJobId));
        toast({ title: `Moved job at ${company.name} to Trash Bin`, variant: "default" });
      } catch (error: any) {
        toast({ title: "Error Passing Company", description: error.message || "Could not pass company.", variant: "destructive" });
      }
    }
  };

  const handleRetrieveCompany = async (compositeCompanyJobId: string) => {
    if (!mongoDbUserId) {
      toast({ title: "Login Required", variant: "destructive" });
      return;
    }
    try {
      const response = await retrieveCompany(mongoDbUserId, compositeCompanyJobId);
      updatePassedCompanyIds(response.passedCompanyProfileIds || []);
      toast({ title: "Job Retrieved", description: `${masterJobFeed.find(c=>c.id === compositeCompanyJobId)?.name || 'Job'} is back in the discovery feed.` });
      setIsTrashBinOpen(false); // Close trash bin after retrieving
    } catch (error: any) {
      toast({ title: "Error Retrieving Job", description: error.message || "Could not retrieve job.", variant: "destructive" });
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

  const handleClearFilters = () => {
      setActiveFilters(initialJobFilters);
      setIsSheetOpen(false); // Close sheet after clearing
  };
  const handleApplyFilters = () => setIsSheetOpen(false); // Close sheet after applying
  const numActiveFilters = Object.values(activeFilters).reduce((acc, set) => acc + set.size, 0);
  const fixedElementsHeight = '120px'; // Approximate height of header + tabs

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

      <div className="w-full snap-y snap-mandatory overflow-y-auto scroll-smooth no-scrollbar flex-grow pb-40" style={{ height: `calc(100vh - ${fixedElementsHeight})` }} tabIndex={0}>
        {displayedCompanies.map(company => (
          <div key={company.id} className="min-h-full snap-start snap-always flex flex-col items-center justify-center p-1 sm:p-2 bg-background">
            <SwipeCard className={`w-full max-w-md sm:max-w-lg md:max-w-xl aspect-[10/13] flex flex-col shadow-xl rounded-2xl bg-card overflow-hidden ${likedCompanyProfileIds.has(company.recruiterUserId!) ? 'ring-2 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'}`}>
              {/* Pass the company object which contains jobOpenings to CompanyCardContent */}
              <CompanyCardContent company={company} onSwipeAction={handleAction} isLiked={likedCompanyProfileIds.has(company.recruiterUserId!)} isGuestMode={mongoDbUserId === null}/>
            </SwipeCard>
          </div>
        ))}
        {isLoading && !isInitialLoading && <div className="h-full snap-start snap-always flex items-center justify-center p-4"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
        {/* Ensure loadMoreTriggerRef is present to trigger loading more items */}
        {hasMore && !isLoading && !isInitialLoading && filteredJobFeed.length > 0 && displayedCompanies.length < filteredJobFeed.length && <div ref={loadMoreTriggerRef} className="h-1 opacity-0">Load More</div>}
        
        {!isLoading && !isInitialLoading && displayedCompanies.length === 0 && (
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
