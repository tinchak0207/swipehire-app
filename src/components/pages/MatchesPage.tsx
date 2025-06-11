
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Match, Candidate, Company, ChatMessage } from '@/lib/types';
import { mockCandidates, mockCompanies, mockMatches as fallbackMockMatches } from '@/lib/mockData'; 
import { ApplicantCard } from '@/components/match/ApplicantCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeartHandshake, Users, Briefcase, Lock, Loader2, AlertTriangle, MessageSquare, Search, CalendarClock, Building2 } from 'lucide-react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { fetchMatches, archiveMatch } from '@/services/matchService'; 
import { useToast } from '@/hooks/use-toast';
import { FocusedChatPanel } from '@/components/match/FocusedChatPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AiHumanResourcesTab } from '@/components/ai/AiHumanResourcesTab';
import { Input } from '@/components/ui/input';
import { IcebreakerCard } from '@/components/match/IcebreakerCard'; 
import { ReputationScoreCard } from '@/components/recruiter/ReputationScoreCard';


interface MatchesPageProps {
  isGuestMode?: boolean;
}

export function MatchesPage({ isGuestMode }: MatchesPageProps) {
  const [matches, setMatches] = useState<(Match & { candidate: Candidate; company: Company })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { mongoDbUserId, preferences, fullBackendUser } = useUserPreferences();
  const { toast } = useToast();
  
  const [focusedMatch, setFocusedMatch] = useState<(Match & { candidate: Candidate; company: Company }) | null>(null);
  const applicantListRef = useRef<HTMLDivElement>(null);
  const applicantCardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [activeTab, setActiveTab] = useState("applicants"); 
  const [searchTerm, setSearchTerm] = useState("");

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
        .filter(match => match.status === 'active')
        .map(match => {
          let candidateDetails = mockCandidates.find(c => c.id === match.candidateProfileIdForDisplay);
          let companyDetails = mockCompanies.find(c => c.id === match.companyProfileIdForDisplay);

          if (!candidateDetails) {
            console.warn(`[MatchesPage] Candidate details not found in mockData for ID: ${match.candidateProfileIdForDisplay}. Creating placeholder.`);
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
            console.warn(`[MatchesPage] Company details not found in mockData for ID: ${match.companyProfileIdForDisplay}. Creating placeholder.`);
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
      
      console.log(`[MatchesPage] After attempting to populate with mock data, ${populatedMatches.length} matches remain.`);

      if (backendMatches.length === 0 && fullBackendUser?.selectedRole === 'recruiter') {
        toast({ title: "No Real Applicants/Matches", description: "Showing sample data for demonstration purposes as a recruiter.", duration: 5000 });
        // Fallback to fully mock matches only if backend returned zero active matches
        populatedMatches = fallbackMockMatches.filter(match => match.status === 'active').map(match => {
          const candidateDetails = mockCandidates.find(c => c.id === match.candidateProfileIdForDisplay)!; // Assume mock data is consistent
          const companyDetails = mockCompanies.find(c => c.id === match.companyProfileIdForDisplay)!;
          return { ...match, candidate: candidateDetails, company: companyDetails };
        }) as (Match & { candidate: Candidate; company: Company })[];
         console.log(`[MatchesPage] Recruiter, no backend matches. Using ${populatedMatches.length} fallback mock matches.`);
      } else if (populatedMatches.length === 0 && backendMatches.length > 0 && fullBackendUser?.selectedRole === 'recruiter') {
         toast({ title: "Real Matches Found (Details Issue)", description: "Found real matches but couldn't load all display details from mock data. Showing placeholders.", duration: 6000, variant: "default" });
         console.log(`[MatchesPage] Recruiter, ${backendMatches.length} backend matches found, but ${populatedMatches.length} after mock lookup. Showing placeholders for these real matches.`);
      }


      setMatches(populatedMatches);
      if (fullBackendUser?.selectedRole === 'recruiter' && populatedMatches.length > 0) {
        const firstPending = populatedMatches.find(m => m.applicationTimestamp && (m.status === 'active'));
        setFocusedMatch(firstPending || populatedMatches[0]);
      } else { setFocusedMatch(null); }

    } catch (error: any) {
      console.error("[MatchesPage] Error fetching matches/applicants:", error);
      toast({ title: "Error Loading Data", description: error.message || "Could not fetch your matches and applicant data.", variant: "destructive" });
      setMatches([]); setFocusedMatch(null);
    } finally { setIsLoading(false); }
  }, [isGuestMode, mongoDbUserId, toast, fullBackendUser]);

  useEffect(() => { loadMatchesAndApplicants(); }, [loadMatchesAndApplicants]);

  const handleArchiveMatch = async (matchIdToArchive: string) => {
    if (!mongoDbUserId) { toast({ title: "Login Required", variant: "destructive" }); return; }
    try {
      await archiveMatch(matchIdToArchive, mongoDbUserId);
      toast({ title: "Match Archived", description: "The match has been moved to archives." }); 
      setMatches(prev => prev.filter(m => m._id !== matchIdToArchive));
      if (focusedMatch?._id === matchIdToArchive) {
        const remainingMatches = matches.filter(m => m._id !== matchIdToArchive);
        setFocusedMatch(remainingMatches.length > 0 ? remainingMatches[0] : null);
      }
    } catch (error: any) {
      toast({ title: "Archiving Error", description: error.message || "Could not archive the match.", variant: "destructive" });
    }
  };

  const pendingApplicants = useMemo(() => {
    if (fullBackendUser?.selectedRole !== 'recruiter') return [];
    let applicants = matches // Use 'matches' state which now contains potentially placeholder-populated items
      .filter(match => match.applicationTimestamp && match.candidate && match.company && match.status === 'active')
      .sort((a, b) => new Date(a.applicationTimestamp!).getTime() - new Date(b.applicationTimestamp!).getTime());
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      applicants = applicants.filter(match => match.candidate?.name.toLowerCase().includes(lowerSearchTerm) || (match.candidate?.role && match.candidate.role.toLowerCase().includes(lowerSearchTerm)) || match.jobOpeningTitle?.toLowerCase().includes(lowerSearchTerm));
    }
    return applicants;
  }, [matches, fullBackendUser?.selectedRole, searchTerm]);

  const generalMatchesForJobseeker = useMemo(() => {
    if (fullBackendUser?.selectedRole !== 'jobseeker') return [];
    return matches.filter(match => match.candidate && match.company && match.status === 'active');
  }, [matches, fullBackendUser?.selectedRole]);

  const handleApplicantCardClick = (match: Match & { candidate: Candidate; company: Company }) => { setFocusedMatch(match); };
  const handleInviteToInterview = (match: Match) => { toast({ title: "Action: Invite to Interview", description: `Sending interview invitation to ${match.candidate.name}.` }); };
  const handleRejectApplicant = (match: Match) => { toast({ title: "Action: Reject Applicant", description: `Marking ${match.candidate.name} as rejected.` }); };

  useEffect(() => {
    if (fullBackendUser?.selectedRole !== 'recruiter' || !applicantListRef.current || pendingApplicants.length === 0) return;
    const observerOptions = { root: applicantListRef.current, rootMargin: '-40% 0px -40% 0px', threshold: 0.5, };
    const callback = (entries: IntersectionObserverEntry[]) => {
      const intersectingEntry = entries.find(entry => entry.isIntersecting);
      if (intersectingEntry) {
        const matchId = intersectingEntry.target.getAttribute('data-match-id');
        if (matchId) {
          const newFocusedMatch = pendingApplicants.find(m => m._id === matchId);
          if (newFocusedMatch && focusedMatch?._id !== newFocusedMatch._id) setFocusedMatch(newFocusedMatch);
        }
      }
    };
    const observer = new IntersectionObserver(callback, observerOptions);
    const currentCardRefs = applicantCardRefs.current;
    currentCardRefs.forEach(cardEl => { if (cardEl) observer.observe(cardEl); });
    return () => { currentCardRefs.forEach(cardEl => { if (cardEl) observer.unobserve(cardEl); }); observer.disconnect(); };
  }, [pendingApplicants, focusedMatch?._id, fullBackendUser?.selectedRole]);

  if (isGuestMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <Lock className="h-16 w-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-semibold text-red-500 mb-3">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md">Viewing matches, applicants, and initiating conversations are features for registered users. Please sign in.</p>
      </div>
    );
  }

  if (isLoading) {
    return (<div className="flex flex-grow items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>);
  }
  
  if (fullBackendUser?.selectedRole === 'recruiter') {
    return (
      <div className="p-4 md:p-6 flex flex-col flex-grow overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="mb-4 shrink-0 text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Recruiter Dashboard</h1>
          <p className="text-sm text-slate-600">Manage your applicants and AI HR tools.</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow min-h-0">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-4 shrink-0 bg-white shadow-sm border rounded-lg">
            <TabsTrigger value="applicants" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md">All Incoming</TabsTrigger>
            <TabsTrigger value="ai_hr_tool" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md">AI HR Tool</TabsTrigger>
          </TabsList>
          <TabsContent value="applicants" className="flex flex-col flex-grow mt-0 overflow-hidden min-h-0"> 
            <div className="flex-grow flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden min-h-0"> 
              <div className="md:w-1/3 lg:w-2/5 xl:w-1/3 flex flex-col md:h-full bg-white border rounded-lg shadow-sm overflow-hidden p-4">
                <div className="flex justify-between items-center mb-3 shrink-0">
                  <h2 className="text-lg font-semibold text-slate-700">Applicants Awaiting Response</h2>
                  <span className="text-sm text-slate-500">Total {pendingApplicants.length} Applicants</span>
                </div>
                <div className="relative w-full mb-3 shrink-0">
                  <Input type="text" placeholder="Search applicants by name or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 text-sm h-9 bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500"/>
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <ScrollArea ref={applicantListRef} className="flex-grow p-0.5 pr-2 -mr-2 mt-0"> 
                  <div className="space-y-3">
                    {pendingApplicants.length === 0 ? ( <div className="text-center py-10"><Users className="mx-auto h-12 w-12 text-slate-400 mb-3" /><p className="text-slate-500">{searchTerm ? "No applicants match your search." : "No pending applicants."}</p></div>) 
                    : (pendingApplicants.map((match) => (<div key={match._id} ref={el => applicantCardRefs.current.set(match._id!, el)} data-match-id={match._id} onClick={() => handleApplicantCardClick(match)} className="cursor-pointer"><ApplicantCard match={match} onInviteToInterview={handleInviteToInterview} onRejectApplicant={handleRejectApplicant} onArchiveMatch={handleArchiveMatch} isFocused={focusedMatch?._id === match._id}/></div>)))}
                  </div>
                </ScrollArea>
              </div>
              <div className="flex-1 md:h-full flex flex-col rounded-lg border bg-white shadow-sm overflow-hidden"> 
                {focusedMatch && mongoDbUserId ? (<FocusedChatPanel key={focusedMatch._id} match={focusedMatch} mongoDbUserId={mongoDbUserId} />) 
                : (<div className="flex-grow flex flex-col items-center justify-center text-center p-6"><MessageSquare className="h-16 w-16 text-slate-400 mb-4" /><p className="text-lg font-semibold text-slate-500">{pendingApplicants.length > 0 ? "Select an applicant to view chat" : "No applicants to chat with"}</p>{pendingApplicants.length > 0 && <p className="text-sm text-slate-400">Click on an applicant card on the left to start.</p>}</div>)}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="ai_hr_tool" className="flex-grow mt-0 overflow-y-auto p-1 min-h-0"><AiHumanResourcesTab /></TabsContent>
        </Tabs>
        <Alert variant="destructive" className="mx-0 mt-4 text-sm shrink-0 bg-red-50 border-red-200 text-red-700">
          <AlertTriangle className="h-4 w-4 !text-red-600" /><AlertTitle className="font-semibold text-red-800">Important Reminder</AlertTitle>
          <AlertDescription className="text-red-700/90">Failure to reply within 72 hours will deduct from your company's reputation score. It is recommended to use the AI Human Resources function to ensure timely replies.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex-grow flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="text-center mb-8 shrink-0">
        <HeartHandshake className="mx-auto h-12 w-12 text-primary mb-3" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Your Mutual Matches</h1>
        <p className="text-lg text-slate-600 mt-2">Connections made! Generate AI icebreakers or start chatting.</p>
      </div>
      {generalMatchesForJobseeker.length === 0 ? (
        <div className="text-center py-10 bg-white shadow-md rounded-lg flex-grow flex flex-col justify-center items-center">
          <Briefcase className="mx-auto h-16 w-16 text-slate-400 mb-4" /><h2 className="text-2xl font-semibold text-slate-700">No Mutual Matches Yet</h2>
          <p className="text-slate-500 mt-2">Keep exploring to find your perfect connection!</p>
        </div>
      ) : (
        <ScrollArea className="flex-grow min-h-0"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generalMatchesForJobseeker.map((match) => (<IcebreakerCard key={match._id} match={match} onMatchArchived={handleArchiveMatch} />))}
        </div></ScrollArea>
      )}
    </div>
  );
}
