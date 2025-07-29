'use client';

import {
  Briefcase,
  HeartHandshake,
  Loader2,
  Lock,
  MessageSquare,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AiHumanResourcesTab } from '@/components/ai/AiHumanResourcesTab';
import { FocusedChatPanel } from '@/components/match/FocusedChatPanel';
import { IcebreakerCard } from '@/components/match/IcebreakerCard';
import { TikTokApplicantScroller } from '@/components/match/TikTokApplicantScroller';
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

  
  // Remove the previous scroll handling useEffect as we'll handle it in the TikTokApplicantScroller

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
      <div className="flex flex-grow flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 p-2 md:p-4 lg:p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 flex-grow flex-col"
        >
          <div className="mb-2 flex flex-col gap-2 md:mb-2 md:gap-4 md:flex-row md:items-start md:justify-between">
            <TabsList className="grid w-full max-w-md shrink-0 grid-cols-2 rounded-xl border bg-white p-1 shadow-sm">
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
          </div>
          <TabsContent
            value="applicants"
            className="mt-0 flex min-h-0 flex-grow flex-col overflow-hidden"
          >
            <div className="flex min-h-0 flex-grow flex-col gap-2 overflow-hidden rounded-xl md:gap-4 md:flex-row">
              <div className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm flex-1 min-h-0 md:h-[70vh] md:w-1/3 lg:w-2/5 xl:w-1/3">
                <div className="relative mb-2 w-full shrink-0 px-3 pt-3 md:mb-3 md:px-4 md:pt-4">
                  <Input
                    type="text"
                    placeholder="Search applicants by name or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 rounded-lg border-slate-300 bg-slate-50 pl-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Search className="absolute top-1/2 left-6 h-4 w-4 text-slate-400 md:left-7" />
                </div>
                <div className="flex-grow overflow-hidden">
                  <TikTokApplicantScroller
                    applicants={pendingApplicants}
                    onInviteToInterview={handleInviteToInterview}
                    onRejectApplicant={handleRejectApplicant}
                    onArchiveMatch={handleArchiveMatch}
                    onFocusedMatchChange={setFocusedMatch}
                  />
                </div>
              </div>
              <div
                className="flex flex-1 items-center justify-center overflow-hidden rounded-lg border bg-white shadow-sm md:h-full"
                style={{ aspectRatio: '16/9' }}
              >
                {focusedMatch && mongoDbUserId ? (
                  <div className="h-full w-full">
                    <FocusedChatPanel
                      key={focusedMatch._id}
                      match={focusedMatch}
                      mongoDbUserId={mongoDbUserId}
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-700 text-xl">
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
