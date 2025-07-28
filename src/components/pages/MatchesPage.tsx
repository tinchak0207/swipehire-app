'use client';

import {
  AlertTriangle,
  Briefcase,
  HeartHandshake,
  Loader2,
  Lock,
  MessageSquare,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AiHumanResourcesTab } from '@/components/ai/AiHumanResourcesTab';
import { ApplicantCard } from '@/components/match/ApplicantCard';
import { FocusedChatPanel } from '@/components/match/FocusedChatPanel';
import { IcebreakerCard } from '@/components/match/IcebreakerCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import { mockMatches as fallbackMockMatches, mockCandidates, mockCompanies } from '@/lib/mockData';
import type { Candidate, Company, Match } from '@/lib/types';
import { archiveMatch, fetchMatches } from '@/services/matchService';

interface MatchesPageProps {
  isGuestMode?: boolean;
}

export function MatchesPage({ isGuestMode }: MatchesPageProps) {
  const [matches, setMatches] = useState<(Match & { candidate: Candidate; company: Company })[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const { mongoDbUserId, fullBackendUser } = useUserPreferences();
  const { toast } = useToast();

  const [focusedMatch, setFocusedMatch] = useState<
    (Match & { candidate: Candidate; company: Company }) | null
  >(null);
  const applicantListRef = useRef<HTMLDivElement>(null);
  const applicantCardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [activeTab, setActiveTab] = useState('applicants');
  const [searchTerm, setSearchTerm] = useState('');

  const loadMatchesAndApplicants = useCallback(async () => {
    if (isGuestMode || !mongoDbUserId) {
      setMatches([]);
      setIsLoading(false);
      setFocusedMatch(null);
      return;
    }
    setIsLoading(true);
    try {
      const result = await fetchMatches(mongoDbUserId);

      if (result.error) {
        throw new Error(result.error);
      }

      const backendMatches = result.data || [];
      console.log(`[MatchesPage] Fetched ${backendMatches.length} matches from backend.`);

      // Populate matches. If mock lookup fails, create placeholder.
      let populatedMatches = backendMatches
        .filter((match) => match.status === 'active')
        .map((match) => {
          let candidateDetails = mockCandidates.find(
            (c) => c.id === match.candidateProfileIdForDisplay
          );
          let companyDetails = mockCompanies.find((c) => c.id === match.companyProfileIdForDisplay);

          if (!candidateDetails) {
            console.warn(
              `[MatchesPage] Candidate details not found in mockData for ID: ${match.candidateProfileIdForDisplay}. Creating placeholder.`
            );
            candidateDetails = {
              id: match.candidateProfileIdForDisplay || `unknown-cand-${match._id}`,
              name: `Candidate ${match.candidateProfileIdForDisplay?.slice(-4) || 'Unknown'}`,
              role: 'Role Undefined',
              experienceSummary: 'Details not available.',
              skills: [],
              avatarUrl: 'https://placehold.co/100x100.png?text=?',
            };
          }
          if (!companyDetails) {
            console.warn(
              `[MatchesPage] Company details not found in mockData for ID: ${match.companyProfileIdForDisplay}. Creating placeholder.`
            );
            companyDetails = {
              id: match.companyProfileIdForDisplay || `unknown-comp-${match._id}`,
              name: `Company ${match.companyProfileIdForDisplay?.slice(-4) || 'Unknown'}`,
              industry: 'Industry Undefined',
              description: 'Details not available.',
              cultureHighlights: [],
              logoUrl: 'https://placehold.co/100x100.png?text=?',
            };
          }
          return { ...match, candidate: candidateDetails, company: companyDetails };
        }) as (Match & { candidate: Candidate; company: Company })[];

      console.log(
        `[MatchesPage] After attempting to populate with mock data, ${populatedMatches.length} matches remain.`
      );

      if (backendMatches.length === 0 && fullBackendUser?.selectedRole === 'recruiter') {
        toast({
          title: 'No Real Applicants/Matches',
          description: 'Showing sample data for demonstration purposes as a recruiter.',
          duration: 5000,
        });
        // Fallback to fully mock matches only if backend returned zero active matches
        populatedMatches = fallbackMockMatches
          .filter((match) => match.status === 'active')
          .map((match) => {
            const candidateDetails = mockCandidates.find(
              (c) => c.id === match.candidateProfileIdForDisplay
            )!; // Assume mock data is consistent
            const companyDetails = mockCompanies.find(
              (c) => c.id === match.companyProfileIdForDisplay
            )!;
            return { ...match, candidate: candidateDetails, company: companyDetails };
          }) as (Match & { candidate: Candidate; company: Company })[];
        console.log(
          `[MatchesPage] Recruiter, no backend matches. Using ${populatedMatches.length} fallback mock matches.`
        );
      } else if (
        populatedMatches.length === 0 &&
        backendMatches.length > 0 &&
        fullBackendUser?.selectedRole === 'recruiter'
      ) {
        toast({
          title: 'Real Matches Found (Details Issue)',
          description:
            "Found real matches but couldn't load all display details from mock data. Showing placeholders.",
          duration: 6000,
          variant: 'default',
        });
        console.log(
          `[MatchesPage] Recruiter, ${backendMatches.length} backend matches found, but ${populatedMatches.length} after mock lookup. Showing placeholders for these real matches.`
        );
      }

      setMatches(populatedMatches);
      if (fullBackendUser?.selectedRole === 'recruiter' && populatedMatches.length > 0) {
        const firstPending = populatedMatches.find(
          (m) => m.applicationTimestamp && m.status === 'active'
        );
        setFocusedMatch(firstPending || populatedMatches[0] || null);
      } else {
        setFocusedMatch(null);
      }
    } catch (error: any) {
      console.error('[MatchesPage] Error fetching matches/applicants:', error);
      toast({
        title: 'Error Loading Data',
        description: error.message || 'Could not fetch your matches and applicant data.',
        variant: 'destructive',
      });
      setMatches([]);
      setFocusedMatch(null);
    } finally {
      setIsLoading(false);
    }
  }, [isGuestMode, mongoDbUserId, toast, fullBackendUser]);

  useEffect(() => {
    loadMatchesAndApplicants();
  }, [loadMatchesAndApplicants]);

  const handleArchiveMatch = async (matchIdToArchive: string) => {
    if (!mongoDbUserId) {
      toast({ title: 'Login Required', variant: 'destructive' });
      return;
    }
    try {
      await archiveMatch(matchIdToArchive, mongoDbUserId);
      toast({ title: 'Match Archived', description: 'The match has been moved to archives.' });
      setMatches((prev) => prev.filter((m) => m._id !== matchIdToArchive));
      if (focusedMatch?._id === matchIdToArchive) {
        const remainingMatches = matches.filter((m) => m._id !== matchIdToArchive);
        setFocusedMatch(remainingMatches.length > 0 ? remainingMatches[0] || null : null);
      }
    } catch (error: any) {
      toast({
        title: 'Archiving Error',
        description: error.message || 'Could not archive the match.',
        variant: 'destructive',
      });
    }
  };

  const pendingApplicants = useMemo(() => {
    if (fullBackendUser?.selectedRole !== 'recruiter') return [];
    let applicants = matches // Use 'matches' state which now contains potentially placeholder-populated items
      .filter(
        (match) =>
          match.applicationTimestamp &&
          match.candidate &&
          match.company &&
          match.status === 'active'
      )
      .sort(
        (a, b) =>
          new Date(a.applicationTimestamp!).getTime() - new Date(b.applicationTimestamp!).getTime()
      );
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      applicants = applicants.filter(
        (match) =>
          match.candidate?.name.toLowerCase().includes(lowerSearchTerm) ||
          match.candidate?.role?.toLowerCase().includes(lowerSearchTerm) ||
          match.jobOpeningTitle?.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return applicants;
  }, [matches, fullBackendUser?.selectedRole, searchTerm]);

  const generalMatchesForJobseeker = useMemo(() => {
    if (fullBackendUser?.selectedRole !== 'jobseeker') return [];
    return matches.filter((match) => match.candidate && match.company && match.status === 'active');
  }, [matches, fullBackendUser?.selectedRole]);

  const handleApplicantCardClick = (match: Match & { candidate: Candidate; company: Company }) => {
    setFocusedMatch(match);
  };
  const handleInviteToInterview = (match: Match) => {
    toast({
      title: 'Action: Invite to Interview',
      description: `Sending interview invitation to ${match.candidate.name}.`,
    });
  };
  const handleRejectApplicant = (match: Match) => {
    toast({
      title: 'Action: Reject Applicant',
      description: `Marking ${match.candidate.name} as rejected.`,
    });
  };

  useEffect(() => {
    if (
      fullBackendUser?.selectedRole !== 'recruiter' ||
      !applicantListRef.current ||
      pendingApplicants.length === 0
    )
      return;
    const observerOptions = {
      root: applicantListRef.current,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0.5,
    };
    const callback = (entries: IntersectionObserverEntry[]) => {
      const intersectingEntry = entries.find((entry) => entry.isIntersecting);
      if (intersectingEntry) {
        const matchId = intersectingEntry.target.getAttribute('data-match-id');
        if (matchId) {
          const newFocusedMatch = pendingApplicants.find((m) => m._id === matchId);
          if (newFocusedMatch && focusedMatch?._id !== newFocusedMatch._id)
            setFocusedMatch(newFocusedMatch);
        }
      }
    };
    const observer = new IntersectionObserver(callback, observerOptions);
    const currentCardRefs = applicantCardRefs.current;
    currentCardRefs.forEach((cardEl) => {
      if (cardEl) observer.observe(cardEl);
    });
    return () => {
      currentCardRefs.forEach((cardEl) => {
        if (cardEl) observer.unobserve(cardEl);
      });
      observer.disconnect();
    };
  }, [pendingApplicants, focusedMatch?._id, fullBackendUser?.selectedRole]);

  if (isGuestMode) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6 text-center">
        <Lock className="mb-6 h-16 w-16 text-red-400" />
        <h2 className="mb-3 font-semibold text-2xl text-red-500">Access Restricted</h2>
        <p className="max-w-md text-muted-foreground">
          Viewing matches, applicants, and initiating conversations are features for registered
          users. Please sign in.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-grow items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (fullBackendUser?.selectedRole === 'recruiter') {
    return (
      <div className="flex flex-grow flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
        <div className="mb-6 shrink-0">
          <h1 className="font-bold text-2xl text-slate-900 tracking-tight md:text-3xl">
            Recruiter Dashboard
          </h1>
          <p className="text-slate-600 text-sm">Manage your applicants and AI HR tools.</p>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 flex-grow flex-col"
        >
          <TabsList className="mb-6 grid w-full max-w-md shrink-0 grid-cols-2 rounded-xl border bg-white p-1 shadow-sm">
            <TabsTrigger
              value="applicants"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <Users className="mr-2 h-4 w-4" />
              All Incoming
            </TabsTrigger>
            <TabsTrigger
              value="ai_hr_tool"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI HR Tool
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="applicants"
            className="mt-0 flex min-h-0 flex-grow flex-col overflow-hidden"
          >
            <div className="flex min-h-0 flex-grow flex-col gap-6 overflow-hidden rounded-xl md:flex-row">
              <div className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm md:h-full md:w-1/3 lg:w-2/5 xl:w-1/3">
                <div className="mb-4 flex shrink-0 items-center justify-between border-b p-4">
                  <div>
                    <h2 className="font-semibold text-lg text-slate-800">
                      Applicants Awaiting Response
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Total {pendingApplicants.length} Applicants
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="relative mb-3 w-full shrink-0 px-4">
                  <Input
                    type="text"
                    placeholder="Search applicants by name or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 border-slate-300 bg-slate-50 pl-10 text-sm focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                  <Search className="absolute top-1/2 left-7 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                <ScrollArea ref={applicantListRef} className="-mr-2 mt-0 flex-grow p-0.5 pr-2 pb-4">
                  <div className="space-y-3 px-4">
                    {pendingApplicants.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          <Users className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="font-medium text-slate-700 text-lg">No applicants found</h3>
                        <p className="text-slate-500 text-sm">
                          {searchTerm
                            ? 'No applicants match your search.'
                            : 'No pending applicants.'}
                        </p>
                      </div>
                    ) : (
                      pendingApplicants.map((match) => (
                        <div
                          key={match._id}
                          ref={(el) => {
                            if (match._id) applicantCardRefs.current.set(match._id, el);
                          }}
                          data-match-id={match._id}
                          onClick={() => handleApplicantCardClick(match)}
                          className="cursor-pointer"
                        >
                          <ApplicantCard
                            match={match}
                            onInviteToInterview={handleInviteToInterview}
                            onRejectApplicant={handleRejectApplicant}
                            onArchiveMatch={handleArchiveMatch}
                            isFocused={focusedMatch?._id === match._id}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
              <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-white shadow-sm md:h-full">
                {focusedMatch && mongoDbUserId ? (
                  <FocusedChatPanel
                    key={focusedMatch._id}
                    match={focusedMatch}
                    mongoDbUserId={mongoDbUserId}
                  />
                ) : (
                  <div className="flex flex-grow flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-xl text-slate-700">
                      {pendingApplicants.length > 0
                        ? 'Select an applicant to view chat'
                        : 'No applicants to chat with'}
                    </h3>
                    {pendingApplicants.length > 0 && (
                      <p className="mt-2 text-slate-500 text-sm">
                        Click on an applicant card on the left to start.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="ai_hr_tool" className="mt-0 min-h-0 flex-grow overflow-y-auto p-1">
            <AiHumanResourcesTab />
          </TabsContent>
        </Tabs>
        <Alert
          variant="destructive"
          className="mx-0 mt-6 shrink-0 rounded-lg border-red-200 bg-red-50 text-red-700 text-sm"
        >
          <AlertTriangle className="!text-red-600 h-5 w-5" />
          <AlertTitle className="font-semibold text-red-800">Important Reminder</AlertTitle>
          <AlertDescription className="text-red-700/90">
            Failure to reply within 72 hours will deduct from your company's reputation score. It is
            recommended to use the AI Human Resources function to ensure timely replies.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-grow flex-col bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="mb-8 shrink-0 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <HeartHandshake className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="font-bold text-3xl text-slate-900 tracking-tight md:text-4xl">
          Your Mutual Matches
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Connections made! Generate AI icebreakers or start chatting.
        </p>
      </div>
      {generalMatchesForJobseeker.length === 0 ? (
        <div className="flex flex-grow flex-col items-center justify-center rounded-xl bg-white py-16 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Briefcase className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="font-semibold text-2xl text-slate-700">No Mutual Matches Yet</h2>
          <p className="mt-2 text-slate-500">Keep exploring to find your perfect connection!</p>
          <Button className="mt-6 rounded-lg bg-blue-600 px-6 text-white hover:bg-blue-700">
            Discover Opportunities
          </Button>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-grow rounded-xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {generalMatchesForJobseeker.map((match) => (
              <IcebreakerCard key={match._id} match={match} onMatchArchived={handleArchiveMatch} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
