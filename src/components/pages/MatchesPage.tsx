"use client";

import React, { useState, useEffect } from 'react';
import type { Match, Candidate, Company } from '@/lib/types';
import { mockCandidates, mockCompanies } from '@/lib/mockData';
import { IcebreakerCard } from '@/components/match/IcebreakerCard';
import { HeartHandshake, Users, Briefcase } from 'lucide-react';

// Simulate liked state persistence (in a real app, this would be from user context or backend)
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


export function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'recruiter' | 'jobseeker'>('recruiter'); // Simulate user role

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching matches based on liked states
    const { likedCandidates, likedCompanies } = getInitialLikedState();
    const foundMatches: Match[] = [];

    // For simplicity, this simulation assumes any "liked" candidate by a "recruiter" user
    // has also "liked" one of the mock companies, and vice-versa for a "jobseeker" user.
    // A real app would have a more robust matching logic from a backend.

    if (userRole === 'recruiter') {
      mockCandidates.forEach(candidate => {
        // Simulate candidate liked a company if recruiter liked candidate
        if (likedCandidates.has(candidate.id) && mockCompanies.length > 0) {
          // Pick a random company the candidate "liked" for demo
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
    } else { // jobseeker
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
    
    // Filter out duplicates just in case (though unlikely with this simple logic)
    const uniqueMatches = Array.from(new Set(foundMatches.map(m => m.id)))
      .map(id => foundMatches.find(m => m.id === id)!);

    setMatches(uniqueMatches);
    setIsLoading(false);
  }, [userRole]);
  
  // Dummy functions to simulate storing likes (would be part of swiping components)
  // These are here to make the demo work if localStorage is empty initially
  const simulateLikes = () => {
    if (typeof window !== 'undefined') {
       if (!localStorage.getItem('likedCandidatesDemo') && mockCandidates.length > 0) {
         localStorage.setItem('likedCandidatesDemo', JSON.stringify([mockCandidates[0].id]));
       }
       if (!localStorage.getItem('likedCompaniesDemo') && mockCompanies.length > 0) {
         localStorage.setItem('likedCompaniesDemo', JSON.stringify([mockCompanies[0].id]));
       }
       // Trigger re-fetch of matches
       setUserRole(prev => prev === 'recruiter' ? 'jobseeker' : 'recruiter'); // Toggle to force re-render
       setTimeout(() => setUserRole(prev => prev === 'recruiter' ? 'jobseeker' : 'recruiter'),0); // Toggle back
    }
  }

  useEffect(() => {
    simulateLikes(); // Simulate some likes on initial load if none exist
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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
      
      {/* Simulate role switch for demo */}
      {/* <div className="mb-6 flex justify-center">
        <Button onClick={() => setUserRole(userRole === 'recruiter' ? 'jobseeker' : 'recruiter')}>
          Switch to {userRole === 'recruiter' ? 'Job Seeker View' : 'Recruiter View'}
        </Button>
      </div> */}


      {matches.length === 0 ? (
        <div className="text-center py-10 bg-card shadow-md rounded-lg">
          {userRole === 'recruiter' ? <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" /> : <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />}
          <h2 className="text-2xl font-semibold">No Matches Yet</h2>
          <p className="text-muted-foreground mt-2">
            Keep swiping to find your perfect {userRole === 'recruiter' ? 'candidate' : 'opportunity'}!
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
