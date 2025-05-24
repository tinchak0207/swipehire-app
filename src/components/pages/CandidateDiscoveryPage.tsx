
"use client";

import React, { useState, useEffect } from 'react';
import type { Candidate } from '@/lib/types';
import { mockCandidates } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CandidateCardContent } from '@/components/swipe/CandidateCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Info, Star, Save, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CandidateDiscoveryPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [likedCandidates, setLikedCandidates] = useState<Set<string>>(new Set());
  const [superLikedCandidates, setSuperLikedCandidates] = useState<Set<string>>(new Set());
  const [passedCandidates, setPassedCandidates] = useState<Set<string>>(new Set());
  const [savedCandidates, setSavedCandidates] = useState<Set<string>>(new Set());


  const { toast } = useToast();

  useEffect(() => {
    setCandidates(mockCandidates);
    // Load from localStorage if needed
    const storedLiked = localStorage.getItem('likedCandidatesDemo');
    if (storedLiked) setLikedCandidates(new Set(JSON.parse(storedLiked)));
    const storedSuperLiked = localStorage.getItem('superLikedCandidatesDemo');
    if (storedSuperLiked) setSuperLikedCandidates(new Set(JSON.parse(storedSuperLiked)));
    const storedPassed = localStorage.getItem('passedCandidatesDemo');
    if (storedPassed) setPassedCandidates(new Set(JSON.parse(storedPassed)));
    const storedSaved = localStorage.getItem('savedCandidatesDemo');
    if (storedSaved) setSavedCandidates(new Set(JSON.parse(storedSaved)));
  }, []);

  const updateLocalStorageSet = (key: string, set: Set<string>) => {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  };


  const handleAction = (candidateId: string, action: 'like' | 'pass' | 'superlike' | 'details' | 'save' | 'share') => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    let message = "";
    let toastVariant: "default" | "destructive" = "default";
    let tempLiked = new Set(likedCandidates);
    let tempSuperLiked = new Set(superLikedCandidates);
    let tempPassed = new Set(passedCandidates);
    let tempSaved = new Set(savedCandidates);


    if (action === 'like') {
      tempLiked.add(candidateId);
      tempPassed.delete(candidateId);
      message = `Liked ${candidate.name}`;
      if (Math.random() > 0.7) { 
        toast({
          title: "🎉 It's a Match!",
          description: `You and ${candidate.name} are both interested!`,
        });
      }
    } else if (action === 'pass') {
      tempPassed.add(candidateId);
      tempLiked.delete(candidateId);
      tempSuperLiked.delete(candidateId);
      message = `Passed on ${candidate.name}`;
      toastVariant = "destructive";
    } else if (action === 'superlike') {
      tempSuperLiked.add(candidateId);
      tempLiked.add(candidateId); 
      tempPassed.delete(candidateId);
      message = `Super liked ${candidate.name}! They'll be notified.`;
    } else if (action === 'details') {
      message = `Viewing details for ${candidate.name}`;
      toast({ title: message, description: "Detailed view functionality to be implemented." });
      return; 
    } else if (action === 'save') {
      if (tempSaved.has(candidateId)) {
        tempSaved.delete(candidateId);
        message = `Unsaved ${candidate.name}.`;
      } else {
        tempSaved.add(candidateId);
        message = `Saved ${candidate.name}!`;
      }
    } else if (action === 'share') {
      message = `Sharing ${candidate.name}'s profile... (feature coming soon)`;
      navigator.clipboard.writeText(`Check out this candidate: ${candidate.name} on SwipeHire!`);
      toast({ title: message, description: "Link copied to clipboard (simulated)." });
      return;
    }
    
    setLikedCandidates(tempLiked);
    updateLocalStorageSet('likedCandidatesDemo', tempLiked);
    setSuperLikedCandidates(tempSuperLiked);
    updateLocalStorageSet('superLikedCandidatesDemo', tempSuperLiked);
    setPassedCandidates(tempPassed);
    updateLocalStorageSet('passedCandidatesDemo', tempPassed);
    setSavedCandidates(tempSaved);
    updateLocalStorageSet('savedCandidatesDemo', tempSaved);

    if (action !== 'save' && action !== 'share') {
        toast({ title: message, variant: toastVariant });
    } else if (action === 'save') {
        toast({ title: message });
    }
  };

  const visibleCandidates = candidates.filter(c => !passedCandidates.has(c.id));

  if (candidates.length === 0) {
    return <div className="flex justify-center items-center h-64"><p>Loading candidates...</p></div>;
  }

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 w-full">
      <div className="w-full max-w-xl space-y-6 scrollable-feed"> {/* Increased max-w for wider cards */}
        {visibleCandidates.length > 0 ? visibleCandidates.map(candidate => (
          <SwipeCard 
            key={candidate.id} 
            className={`transition-all duration-300 ease-out 
                        ${superLikedCandidates.has(candidate.id) ? 'ring-4 ring-accent shadow-accent/30' : likedCandidates.has(candidate.id) ? 'ring-4 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'}
                        min-h-[600px] md:min-h-[700px]`} // Adjust min-height for new content
          >
            <CandidateCardContent candidate={candidate} />
            <CardFooter className="p-3 grid grid-cols-5 gap-2 border-t bg-card"> {/* 5 columns for new buttons */}
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
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-2 hover:bg-primary/10 ${savedCandidates.has(candidate.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                onClick={() => handleAction(candidate.id, 'save')}
                aria-label={`Save ${candidate.name}`}
              >
                <Save className={`h-5 w-5 mb-1 ${savedCandidates.has(candidate.id) ? 'fill-primary' : ''}`} />
                <span className="text-xs">Save</span>
              </Button>
               {/* <Button 
                variant="ghost" 
                size="sm" 
                className="flex-col h-auto py-2 text-muted-foreground hover:text-primary"
                onClick={() => handleAction(candidate.id, 'share')}
                aria-label={`Share ${candidate.name}`}
              >
                <Share2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Share</span>
              </Button> */}
            </CardFooter>
          </SwipeCard>
        )) : (
          <div className="text-center py-10 col-span-full">
            <h2 className="text-2xl font-semibold mb-4">No More Candidates</h2>
            <p className="text-muted-foreground">You've seen everyone for now, or try adjusting your filters!</p>
          </div>
        )}
      </div>
       <style jsx>{`
        .scrollable-feed {
          max-height: calc(100vh - 150px); /* Adjust based on header/footer height and search bar */
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding-right: 4px; /* Space for scrollbar */
        }
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
