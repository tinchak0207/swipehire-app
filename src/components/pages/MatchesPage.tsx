
"use client";

import React, { useState, useEffect } from 'react';
import type { Match } from '@/lib/types'; // Candidate and Company types are implicitly used via Match
import { mockCandidates, mockCompanies } from '@/lib/mockData';
import { IcebreakerCard } from '@/components/match/IcebreakerCard';
import { HeartHandshake, Users, Briefcase, Lock } from 'lucide-react'; // Added Lock
// import { Button } from '@/components/ui/button'; // Button for role switch removed

interface MatchesPageProps {
  isGuestMode?: boolean;
}

const getInitialLikedState = () => {
  if (typeof window !== 'undefined') {
    const likedCand = localStorage.getItem('likedCandidatesDemo');
    const likedComp = localStorage.getItem('likedCompaniesDemo');
    return {
      likedCandidates: likedCand ? new Set(JSON.parse(likedCand)) : new Set<string>(),
      likedCompanies: likedComp ? new Set(JSON.parse(likedComp)) : new Set<string>(),
    };
  }
  return { likedCandidates: new Set<string>(), likedCompanies: new Set<string>() };
};


export function MatchesPage({ isGuestMode }: MatchesPageProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // User role is now managed by HomePage and passed if needed, or inferred from context
  // const [userRole, setUserRole] = useState<'recruiter' | 'jobseeker'>('recruiter'); // Removed simulated role

  useEffect(() => {
    if (isGuestMode) {
      setIsLoading(false);
      setMatches([]);
      return;
    }

    setIsLoading(true);
    const { likedCandidates, likedCompanies } = getInitialLikedState();
    const foundMatches: Match[] = [];
    
    // Determine user role from localStorage (consistent with HomePage logic)
    const currentRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : 'jobseeker';


    if (currentRole === 'recruiter') {
      mockCandidates.forEach(candidate => {
        if (likedCandidates.has(candidate.id) && mockCompanies.length > 0) {
          const randomCompany = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
          foundMatches.push({
            id: `match-${candidate.id}-${randomCompany.id}`,
            candidateId: candidate.id,
            companyId: randomCompany.id,
            candidate,
            company: randomCompany,
            matchedAt: new Date(),
          });
        }
      });
    } else { // jobseeker or default
      mockCompanies.forEach(company => {
        if (likedCompanies.has(company.id) && mockCandidates.length > 0) {
          const randomCandidate = mockCandidates[Math.floor(Math.random() * mockCandidates.length)];
          foundMatches.push({
            id: `match-${randomCandidate.id}-${company.id}`,
            candidateId: randomCandidate.id,
            companyId: company.id,
            candidate: randomCandidate,
            company,
            matchedAt: new Date(),
          });
        }
      });
    }
    
    const uniqueMatches = Array.from(new Set(foundMatches.map(m => m.id)))
      .map(id => foundMatches.find(m => m.id === id)!);

    setMatches(uniqueMatches);
    setIsLoading(false);
  }, [isGuestMode]); // Re-run if guest mode changes or on initial load for authenticated users
  
  const simulateLikes = () => {
    if (typeof window !== 'undefined' && !isGuestMode) {
       if (!localStorage.getItem('likedCandidatesDemo') && mockCandidates.length > 0) {
         localStorage.setItem('likedCandidatesDemo', JSON.stringify([mockCandidates[0].id]));
       }
       if (!localStorage.getItem('likedCompaniesDemo') && mockCompanies.length > 0) {
         localStorage.setItem('likedCompaniesDemo', JSON.stringify([mockCompanies[0].id]));
       }
       // This re-simulation logic might need adjustment or removal if it causes issues with useEffect dependencies.
       // Forcing a re-render to pick up simulated likes if localStorage was empty.
       // A more robust solution would involve state management that triggers re-evaluation.
       // For now, let's assume the useEffect for matches handles it.
    }
  }

  useEffect(() => {
    simulateLikes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount to ensure some likes exist for demo purposes


  if (isGuestMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6 bg-background">
        <Lock className="h-16 w-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-semibold text-red-500 mb-3">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md">
          Viewing matches and initiating conversations are features for registered users. Please sign in using the Login button in the header to see your matches.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center p-10">Loading matches...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="text-center mb-8">
        <HeartHandshake className="mx-auto h-12 w-12 text-primary mb-3" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Matches</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Connections made! Generate AI icebreakers to start conversations.
        </p>
      </div>
      
      {matches.length === 0 ? (
        <div className="text-center py-10 bg-card shadow-md rounded-lg">
          {localStorage.getItem('userRole') === 'recruiter' ? <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" /> : <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />}
          <h2 className="text-2xl font-semibold">No Matches Yet</h2>
          <p className="text-muted-foreground mt-2">
            Keep swiping to find your perfect {localStorage.getItem('userRole') === 'recruiter' ? 'candidate' : 'opportunity'}!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <IcebreakerCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
