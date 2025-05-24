
"use client";

import React, { useState, useEffect } from 'react';
import type { Company } from '@/lib/types';
import { mockCompanies } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Info, Star, Save, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function JobDiscoveryPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  const [superLikedCompanies, setSuperLikedCompanies] = useState<Set<string>>(new Set());
  const [passedCompanies, setPassedCompanies] = useState<Set<string>>(new Set());
  const [savedCompanies, setSavedCompanies] = useState<Set<string>>(new Set());


  const { toast } = useToast();

  useEffect(() => {
    setCompanies(mockCompanies);
     // Load from localStorage if needed
    const storedLiked = localStorage.getItem('likedCompaniesDemo');
    if (storedLiked) setLikedCompanies(new Set(JSON.parse(storedLiked)));
    const storedSuperLiked = localStorage.getItem('superLikedCompaniesDemo');
    if (storedSuperLiked) setSuperLikedCompanies(new Set(JSON.parse(storedSuperLiked)));
    const storedPassed = localStorage.getItem('passedCompaniesDemo');
    if (storedPassed) setPassedCompanies(new Set(JSON.parse(storedPassed)));
    const storedSaved = localStorage.getItem('savedCompaniesDemo');
    if (storedSaved) setSavedCompanies(new Set(JSON.parse(storedSaved)));
  }, []);

  const updateLocalStorageSet = (key: string, set: Set<string>) => {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  };

  const handleAction = (companyId: string, action: 'like' | 'pass' | 'superlike' | 'details' | 'save' | 'share') => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;

    let message = "";
    let toastVariant: "default" | "destructive" = "default";
    let tempLiked = new Set(likedCompanies);
    let tempSuperLiked = new Set(superLikedCompanies);
    let tempPassed = new Set(passedCompanies);
    let tempSaved = new Set(savedCompanies);

    if (action === 'like') {
      tempLiked.add(companyId);
      tempPassed.delete(companyId);
      message = `Interested in ${company.name}`;
      if (Math.random() > 0.7) {
        toast({
          title: "🎉 Company Interested!",
          description: `${company.name} is also interested in profiles like yours!`,
        });
      }
    } else if (action === 'pass') {
      tempPassed.add(companyId);
      tempLiked.delete(companyId);
      tempSuperLiked.delete(companyId);
      message = `Passed on ${company.name}`;
      toastVariant = "destructive";
    } else if (action === 'superlike') {
      tempSuperLiked.add(companyId);
      tempLiked.add(companyId); 
      tempPassed.delete(companyId);
      message = `Super liked ${company.name}! Your profile will be prioritized.`;
    } else if (action === 'details') {
      message = `Viewing details for ${company.name}`;
      toast({ title: message, description: "Detailed view functionality to be implemented." });
      return;
    } else if (action === 'save') {
      if (tempSaved.has(companyId)) {
        tempSaved.delete(companyId);
        message = `Unsaved ${company.name}.`;
      } else {
        tempSaved.add(companyId);
        message = `Saved ${company.name}!`;
      }
    } else if (action === 'share') {
      message = `Sharing ${company.name}... (feature coming soon)`;
      navigator.clipboard.writeText(`Check out this company: ${company.name} on SwipeHire!`);
      toast({ title: message, description: "Link copied to clipboard (simulated)." });
      return;
    }

    setLikedCompanies(tempLiked);
    updateLocalStorageSet('likedCompaniesDemo', tempLiked);
    setSuperLikedCompanies(tempSuperLiked);
    updateLocalStorageSet('superLikedCompaniesDemo', tempSuperLiked);
    setPassedCompanies(tempPassed);
    updateLocalStorageSet('passedCompaniesDemo', tempPassed);
    setSavedCompanies(tempSaved);
    updateLocalStorageSet('savedCompaniesDemo', tempSaved);
    
    if (action !== 'save' && action !== 'share') { // Avoid double toast for save/share
        toast({ title: message, variant: toastVariant });
    } else if (action === 'save') {
        toast({ title: message });
    }
  };
  
  const visibleCompanies = companies.filter(c => !passedCompanies.has(c.id));

  if (companies.length === 0) {
    return <div className="flex justify-center items-center h-64"><p>Loading companies...</p></div>;
  }

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 w-full">
      <div className="w-full max-w-xl space-y-6 scrollable-feed"> {/* Increased max-w for wider cards */}
        {visibleCompanies.length > 0 ? visibleCompanies.map(company => (
          <SwipeCard 
            key={company.id} 
            className={`transition-all duration-300 ease-out 
                        ${superLikedCompanies.has(company.id) ? 'ring-4 ring-accent shadow-accent/30' : likedCompanies.has(company.id) ? 'ring-4 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'} 
                        min-h-[600px] md:min-h-[700px]`} // Adjust min-height for new content
          >
            <CompanyCardContent 
                company={company} 
                onAction={handleAction}
                isLiked={likedCompanies.has(company.id)}
                isSuperLiked={superLikedCompanies.has(company.id)}
            />
            <CardFooter className="p-3 grid grid-cols-5 gap-2 border-t bg-card"> {/* 5 columns for new buttons */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-col h-auto py-2 hover:bg-destructive/10 text-destructive hover:text-destructive"
                onClick={() => handleAction(company.id, 'pass')}
                aria-label={`Pass on ${company.name}`}
              >
                <ThumbsDown className="h-5 w-5 mb-1" />
                <span className="text-xs">Pass</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-col h-auto py-2 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600"
                onClick={() => handleAction(company.id, 'details')}
                aria-label={`View details for ${company.name}`}
              >
                <Info className="h-5 w-5 mb-1" />
                <span className="text-xs">Details</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-2 hover:bg-accent/10 ${superLikedCompanies.has(company.id) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                onClick={() => handleAction(company.id, 'superlike')}
                aria-label={`Superlike ${company.name}`}
              >
                <Star className={`h-5 w-5 mb-1 ${superLikedCompanies.has(company.id) ? 'fill-accent' : ''}`} />
                <span className="text-xs">Superlike</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-2 hover:bg-green-500/10 ${likedCompanies.has(company.id) && !superLikedCompanies.has(company.id) ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`}
                onClick={() => handleAction(company.id, 'like')}
                aria-label={`Apply to ${company.name}`}
              >
                <ThumbsUp className={`h-5 w-5 mb-1 ${likedCompanies.has(company.id) && !superLikedCompanies.has(company.id) ? 'fill-green-500' : ''}`} />
                <span className="text-xs">Apply</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-col h-auto py-2 hover:bg-primary/10 ${savedCompanies.has(company.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                onClick={() => handleAction(company.id, 'save')}
                aria-label={`Save ${company.name}`}
              >
                <Save className={`h-5 w-5 mb-1 ${savedCompanies.has(company.id) ? 'fill-primary' : ''}`} />
                <span className="text-xs">Save</span>
              </Button>
              {/* Share button could be added if 5 columns are too cramped, or replace another one. For now, keeping 5. */}
              {/* <Button 
                variant="ghost" 
                size="sm" 
                className="flex-col h-auto py-2 text-muted-foreground hover:text-primary"
                onClick={() => handleAction(company.id, 'share')}
                aria-label={`Share ${company.name}`}
              >
                <Share2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Share</span>
              </Button> */}
            </CardFooter>
          </SwipeCard>
        )) : (
           <div className="text-center py-10 col-span-full">
            <h2 className="text-2xl font-semibold mb-4">No More Companies</h2>
            <p className="text-muted-foreground">You've seen all opportunities for now, or try adjusting your preferences!</p>
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
