
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Match, Candidate, Company } from '@/lib/types'; // Make sure Candidate and Company are imported
import { mockCandidates, mockCompanies } from '@/lib/mockData'; // Keep for populating match details
import { IcebreakerCard } from '@/components/match/IcebreakerCard';
import { HeartHandshake, Users, Briefcase, Lock, Loader2 } from 'lucide-react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { fetchMatches } from '@/services/matchService';
import { useToast } from '@/hooks/use-toast';

interface MatchesPageProps {
  isGuestMode?: boolean;
}

export function MatchesPage({ isGuestMode }: MatchesPageProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { mongoDbUserId } = useUserPreferences(); // mongoDbUserId is the current user's ID
  const { toast } = useToast();

  const loadMatches = useCallback(async () => {
    if (isGuestMode || !mongoDbUserId) {
      setMatches([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const backendMatches = await fetchMatches(mongoDbUserId);
      
      // Populate candidate and company details from mockData based on IDs
      // This is necessary because the Match documents from backend only store IDs for display profiles
      const populatedMatches = backendMatches.map(match => {
        const candidateDetails = mockCandidates.find(c => c.id === match.candidateProfileIdForDisplay);
        const companyDetails = mockCompanies.find(c => c.id === match.companyProfileIdForDisplay);
        
        // Only include the match if both candidate and company details are found in mockData
        if (candidateDetails && companyDetails) {
          return { ...match, candidate: candidateDetails, company: companyDetails };
        }
        console.warn(`Could not find mock data for candidate ${match.candidateProfileIdForDisplay} or company ${match.companyProfileIdForDisplay} for match ${match._id}`);
        return null; 
      }).filter(Boolean) as (Match & { candidate: Candidate; company: Company })[]; // Filter out nulls and assert type
      
      setMatches(populatedMatches);
    } catch (error: any) {
      console.error("Error fetching matches:", error);
      toast({ title: "Error Loading Matches", description: error.message || "Could not fetch your matches.", variant: "destructive" });
      setMatches([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [isGuestMode, mongoDbUserId, toast]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  if (isGuestMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6 bg-background">
        <Lock className="h-16 w-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-semibold text-red-500 mb-3">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md">
          Viewing matches and initiating conversations are features for registered users. Please sign in to see your matches.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="text-center mb-8">
        <HeartHandshake className="mx-auto h-12 w-12 text-primary mb-3" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Mutual Matches</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Connections made! Generate AI icebreakers to start conversations.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-10 bg-card shadow-md rounded-lg">
          {localStorage.getItem('userRole') === 'recruiter' ? <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" /> : <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />}
          <h2 className="text-2xl font-semibold">No Mutual Matches Yet</h2>
          <p className="text-muted-foreground mt-2">
            Keep swiping to find your perfect {localStorage.getItem('userRole') === 'recruiter' ? 'candidate' : 'opportunity'}! A match occurs when both parties express interest.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            // Ensure that match.candidate and match.company are passed if they exist
            match.candidate && match.company ? (
              <IcebreakerCard key={match._id} match={match as Match & { candidate: Candidate; company: Company }} />
            ) : null
          ))}
        </div>
      )}
    </div>
  );
}

