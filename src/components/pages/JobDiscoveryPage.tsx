"use client";

import React, { useState, useEffect } from 'react';
import type { Company } from '@/lib/types';
import { mockCompanies } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Eye, Star, Undo2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function JobDiscoveryPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  const [superLikedCompanies, setSuperLikedCompanies] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<{ company: Company; action: string }[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    setCompanies(mockCompanies);
  }, []);

  const currentCompany = companies[currentIndex];

  const handleSwipe = (action: 'like' | 'pass' | 'superlike' | 'details') => {
    if (!currentCompany) return;

    const newHistory = [...history, { company: currentCompany, action }];
    setHistory(newHistory);

    let message = "";
    if (action === 'like') {
      setLikedCompanies(prev => new Set(prev).add(currentCompany.id));
      message = `Interested in ${currentCompany.name}`;
       if (Math.random() > 0.7) { // Simulate mutual match
        toast({
          title: "🎉 Company Interested!",
          description: `${currentCompany.name} is also interested in profiles like yours!`,
        });
      }
    } else if (action === 'pass') {
      message = `Passed on ${currentCompany.name}`;
    } else if (action === 'superlike') {
      setSuperLikedCompanies(prev => new Set(prev).add(currentCompany.id));
      message = `Super liked ${currentCompany.name}! Your profile will be prioritized.`;
    } else if (action === 'details') {
      message = `Viewing details for ${currentCompany.name}`;
      toast({ title: message, description: "Detailed view functionality to be implemented."});
      return;
    }

    toast({ title: message });

    if (currentIndex < companies.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
       toast({ title: "No more companies", description: "You've seen all available opportunities for now!"});
    }
  };

  const handleUndo = () => {
    if (history.length === 0) {
      toast({ title: "Nothing to undo", variant: "destructive" });
      return;
    }

    const lastAction = history[history.length - 1];
    
    if (lastAction.action === 'like') {
      setLikedCompanies(prev => {
        const newSet = new Set(prev);
        newSet.delete(lastAction.company.id);
        return newSet;
      });
    } else if (lastAction.action === 'superlike') {
      setSuperLikedCompanies(prev => {
        const newSet = new Set(prev);
        newSet.delete(lastAction.company.id);
        return newSet;
      });
    }

    setCurrentIndex(companies.findIndex(c => c.id === lastAction.company.id));
    setHistory(history.slice(0, -1));
    toast({ title: `Undid action for ${lastAction.company.name}` });
  };

  if (companies.length === 0) {
    return <div className="flex justify-center items-center h-64"><p>Loading companies...</p></div>;
  }
  
  if (!currentCompany && companies.length > 0) {
     return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-4">You've Swiped Through All Companies!</h2>
        <p className="text-muted-foreground mb-6">Check back later for new job postings or adjust your preferences.</p>
        <Button onClick={handleUndo} disabled={history.length === 0}>
          <Undo2 className="mr-2 h-4 w-4" /> Undo Last Swipe
        </Button>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      {currentCompany ? (
        <SwipeCard key={currentCompany.id}>
          <CompanyCardContent company={currentCompany} />
        </SwipeCard>
      ) : (
         <div className="text-center py-10">
            <h2 className="text-2xl font-semibold mb-4">No More Companies</h2>
            <p className="text-muted-foreground">You've seen all available opportunities for now!</p>
         </div>
      )}
      <div className="flex space-x-3 sm:space-x-4">
        <Button variant="outline" size="lg" className="bg-card hover:bg-muted rounded-full p-3 sm:p-4 shadow-lg" onClick={() => handleSwipe('pass')} disabled={!currentCompany}>
          <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" />
           <span className="sr-only">Pass</span>
        </Button>
        <Button variant="outline" size="lg" className="bg-card hover:bg-muted rounded-full p-3 sm:p-4 shadow-lg" onClick={() => handleSwipe('details')} disabled={!currentCompany}>
          <Eye className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
           <span className="sr-only">View Details</span>
        </Button>
        <Button variant="outline" size="lg" className="bg-card hover:bg-muted rounded-full p-3 sm:p-4 shadow-lg" onClick={() => handleSwipe('superlike')} disabled={!currentCompany}>
          <Star className="h-6 w-6 sm:h-7 sm:w-7 text-accent" />
           <span className="sr-only">Favorite</span>
        </Button>
        <Button variant="outline" size="lg" className="bg-card hover:bg-muted rounded-full p-3 sm:p-4 shadow-lg" onClick={() => handleSwipe('like')} disabled={!currentCompany}>
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
