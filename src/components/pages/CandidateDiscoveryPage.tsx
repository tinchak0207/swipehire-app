
"use client";

import React, { useState, useEffect } from 'react';
import type { Candidate } from '@/lib/types';
import { mockCandidates } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CandidateCardContent } from '@/components/swipe/CandidateCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Eye, Star, ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CandidateDiscoveryPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [likedCandidates, setLikedCandidates] = useState<Set<string>>(new Set());
  const [superLikedCandidates, setSuperLikedCandidates] = useState<Set<string>>(new Set());
  // Store passed candidates to potentially hide them or visually differentiate
  const [passedCandidates, setPassedCandidates] = useState<Set<string>>(new Set());

  const { toast } = useToast();

  useEffect(() => {
    setCandidates(mockCandidates);
     // Load liked/superliked/passed from localStorage if needed in a real app
  }, []);

  const handleAction = (candidateId: string, action: 'like' | 'pass' | 'superlike' | 'details') => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    let message = "";
    let toastVariant: "default" | "destructive" = "default";

    if (action === 'like') {
      setLikedCandidates(prev => new Set(prev).add(candidateId));
      setPassedCandidates(prev => { const newSet = new Set(prev); newSet.delete(candidateId); return newSet; });
      message = `Liked ${candidate.name}`;
      if (Math.random() > 0.7) { // Simulate mutual match
        toast({
          title: "🎉 It's a Match!",
          description: `You and ${candidate.name} are both interested!`,
        });
      }
    } else if (action === 'pass') {
      setPassedCandidates(prev => new Set(prev).add(candidateId));
      setLikedCandidates(prev => { const newSet = new Set(prev); newSet.delete(candidateId); return newSet; });
      setSuperLikedCandidates(prev => { const newSet = new Set(prev); newSet.delete(candidateId); return newSet; });
      message = `Passed on ${candidate.name}`;
      toastVariant = "destructive";
    } else if (action === 'superlike') {
      setSuperLikedCandidates(prev => new Set(prev).add(candidateId));
      setLikedCandidates(prev => new Set(prev).add(candidateId)); // Superlike implies like
      setPassedCandidates(prev => { const newSet = new Set(prev); newSet.delete(candidateId); return newSet; });
      message = `Super liked ${candidate.name}! They'll be notified.`;
    } else if (action === 'details') {
      message = `Viewing details for ${candidate.name}`;
      // In a real app, this might open a modal or navigate to a detailed profile page
      toast({ title: message, description: "Detailed view functionality to be implemented." });
      return; // No further state change for details in this version
    }
    
    toast({ title: message, variant: toastVariant });
  };

  const visibleCandidates = candidates.filter(c => !passedCandidates.has(c.id));

  if (candidates.length === 0) {
    return <div className="flex justify-center items-center h-64"><p>Loading candidates...</p></div>;
  }

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 w-full">
      <div className="w-full max-w-md space-y-6 scrollable-feed">
        {visibleCandidates.length > 0 ? visibleCandidates.map(candidate => (
          <SwipeCard key={candidate.id} className={`transition-opacity duration-300 ${superLikedCandidates.has(candidate.id) ? 'ring-2 ring-accent' : likedCandidates.has(candidate.id) ? 'ring-2 ring-green-500' : ''}`}>
            <CandidateCardContent candidate={candidate} />
            <CardFooter className="p-3 grid grid-cols-4 gap-2 border-t bg-card">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-col h-auto py-2 hover:bg-destructive/10 text-destructive hover:text-destructive"
                onClick={() => handleAction(candidate.id, 'pass')}
                aria-label={`Pass on ${candidate.name}`}
              >
                <ThumbsDown className="h-5 w-5 mb-1" />
                <span className="text-xs">Pass</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-col h-auto py-2 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600"
                onClick={() => handleAction(candidate.id, 'details')}
                aria-label={`View details for ${candidate.name}`}
              >
                <Info className="h-5 w-5 mb-1" />
                <span className="text-xs">Details</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-2 hover:bg-accent/10 ${superLikedCandidates.has(candidate.id) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                onClick={() => handleAction(candidate.id, 'superlike')}
                aria-label={`Superlike ${candidate.name}`}
              >
                <Star className={`h-5 w-5 mb-1 ${superLikedCandidates.has(candidate.id) ? 'fill-accent' : ''}`} />
                <span className="text-xs">Superlike</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-2 hover:bg-green-500/10 ${likedCandidates.has(candidate.id) && !superLikedCandidates.has(candidate.id) ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`}
                onClick={() => handleAction(candidate.id, 'like')}
                aria-label={`Like ${candidate.name}`}
              >
                <ThumbsUp className={`h-5 w-5 mb-1 ${likedCandidates.has(candidate.id) && !superLikedCandidates.has(candidate.id) ? 'fill-green-500' : ''}`} />
                <span className="text-xs">Like</span>
              </Button>
            </CardFooter>
          </SwipeCard>
        )) : (
          <div className="text-center py-10 col-span-full">
            <h2 className="text-2xl font-semibold mb-4">No More Candidates</h2>
            <p className="text-muted-foreground">You've seen everyone for now, or try adjusting your filters!</p>
          </div>
        )}
      </div>
      {/* Add a "Load More" button or infinite scroll mechanism here in a real app */}
      {/* For now, all mock candidates are loaded */}
       <style jsx>{`
        .scrollable-feed {
          max-height: calc(100vh - 200px); /* Adjust based on header/footer height */
          overflow-y: auto;
          -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
        }
        /* Custom scrollbar (optional) */
        .scrollable-feed::-webkit-scrollbar {
          width: 8px;
        }
        .scrollable-feed::-webkit-scrollbar-thumb {
          background-color: hsl(var(--primary) / 0.5);
          border-radius: 4px;
        }
        .scrollable-feed::-webkit-scrollbar-track {
          background-color: hsl(var(--muted));
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
