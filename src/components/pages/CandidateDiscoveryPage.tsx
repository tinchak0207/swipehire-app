"use client";

import React, { useState, useEffect } from 'react';
import type { Candidate } from '@/lib/types';
import { mockCandidates } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CandidateCardContent } from '@/components/swipe/CandidateCardContent';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Eye, Star, Undo2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CandidateDiscoveryPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCandidates, setLikedCandidates] = useState<Set<string>>(new Set());
  const [superLikedCandidates, setSuperLikedCandidates] = useState<Set<string>>(new Set()); // For "favorite"
  const [history, setHistory] = useState<{ candidate: Candidate; action: string }[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch candidates from an API
    setCandidates(mockCandidates);
  }, []);

  const currentCandidate = candidates[currentIndex];

  const handleSwipe = (action: 'like' | 'pass' | 'superlike' | 'details') => {
    if (!currentCandidate) return;

    const newHistory = [...history, { candidate: currentCandidate, action }];
    setHistory(newHistory);

    let message = "";
    if (action === 'like') {
      setLikedCandidates(prev => new Set(prev).add(currentCandidate.id));
      message = `Liked ${currentCandidate.name}`;
      // Here you would check for a mutual match
      if (Math.random() > 0.7) { // Simulate mutual match
        toast({
          title: "🎉 It's a Match!",
          description: `You and ${currentCandidate.name} are both interested!`,
          variant: "default",
        });
      }
    } else if (action === 'pass') {
      message = `Passed on ${currentCandidate.name}`;
    } else if (action === 'superlike') {
      setSuperLikedCandidates(prev => new Set(prev).add(currentCandidate.id));
      message = `Super liked ${currentCandidate.name}! They'll be notified.`;
    } else if (action === 'details') {
      // In a real app, this would navigate to a detailed profile page
      message = `Viewing details for ${currentCandidate.name}`;
      toast({ title: message, description: "Detailed view functionality to be implemented."});
      // We don't advance to next candidate for details view in this simplified version
      return;
    }
    
    toast({ title: message });
    
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast({ title: "No more candidates", description: "You've seen everyone for now!"});
    }
  };

  const handleUndo = () => {
    if (history.length === 0) {
      toast({ title: "Nothing to undo", variant: "destructive" });
      return;
    }

    const lastAction = history[history.length - 1];
    
    // Revert state based on last action
    if (lastAction.action === 'like') {
      setLikedCandidates(prev => {
        const newSet = new Set(prev);
        newSet.delete(lastAction.candidate.id);
        return newSet;
      });
    } else if (lastAction.action === 'superlike') {
      setSuperLikedCandidates(prev => {
        const newSet = new Set(prev);
        newSet.delete(lastAction.candidate.id);
        return newSet;
      });
    }

    setCurrentIndex(candidates.findIndex(c => c.id === lastAction.candidate.id));
    setHistory(history.slice(0, -1));
    toast({ title: `Undid action for ${lastAction.candidate.name}` });
  };


  if (candidates.length === 0) {
    return <div className="flex justify-center items-center h-64"><p>Loading candidates...</p></div>;
  }

  if (!currentCandidate && candidates.length > 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-4">You've Swiped Through All Candidates!</h2>
        <p className="text-muted-foreground mb-6">Check back later for new profiles or adjust your filters.</p>
        <Button onClick={handleUndo} disabled={history.length === 0}>
          <Undo2 className="mr-2 h-4 w-4" /> Undo Last Swipe
        </Button>
      </div>
    );
  }
  

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      {currentCandidate ? (
        <SwipeCard key={currentCandidate.id}>
          <CandidateCardContent candidate={currentCandidate} />
        </SwipeCard>
      ) : (
         <div className="text-center py-10">
            <h2 className="text-2xl font-semibold mb-4">No More Candidates</h2>
            <p className="text-muted-foreground">You've seen everyone for now!</p>
         </div>
      )}
      
      <div className="flex space-x-3 sm:space-x-4">
        <Button variant="outline" size="lg" className="bg-card hover:bg-muted rounded-full p-3 sm:p-4 shadow-lg" onClick={() => handleSwipe('pass')} disabled={!currentCandidate}>
          <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" />
          <span className="sr-only">Pass</span>
        </Button>
        <Button variant="outline" size="lg" className="bg-card hover:bg-muted rounded-full p-3 sm:p-4 shadow-lg" onClick={() => handleSwipe('details')} disabled={!currentCandidate}>
          <Eye className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
          <span className="sr-only">View Details</span>
        </Button>
        <Button variant="outline" size="lg" className="bg-card hover:bg-muted rounded-full p-3 sm:p-4 shadow-lg" onClick={() => handleSwipe('superlike')} disabled={!currentCandidate}>
          <Star className="h-6 w-6 sm:h-7 sm:w-7 text-accent" />
          <span className="sr-only">Favorite</span>
        </Button>
        <Button variant="outline" size="lg" className="bg-card hover:bg-muted rounded-full p-3 sm:p-4 shadow-lg" onClick={() => handleSwipe('like')} disabled={!currentCandidate}>
          <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7 text-green-500" />
          <span className="sr-only">Like</span>
        </Button>
      </div>
       <Button onClick={handleUndo} variant="ghost" disabled={history.length === 0} className="mt-4">
          <Undo2 className="mr-2 h-4 w-4" /> Undo Last Swipe
        </Button>
    </div>
  );
}
