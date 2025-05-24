
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Company } from '@/lib/types';
import { mockCompanies } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Info, Star, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 3; // Number of items to load per "page"

export function JobDiscoveryPage() {
  const [allCompanies] = useState<Company[]>(mockCompanies);
  const [displayedCompanies, setDisplayedCompanies] = useState<Company[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  const [superLikedCompanies, setSuperLikedCompanies] = useState<Set<string>>(new Set());
  const [passedCompanies, setPassedCompanies] = useState<Set<string>>(new Set());
  const [savedCompanies, setSavedCompanies] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMoreCompanies = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const newCompanies = allCompanies.slice(0, nextPage * ITEMS_PER_PAGE);
      
      if (newCompanies.length >= allCompanies.length) {
        setHasMore(false);
      }
      setDisplayedCompanies(newCompanies);
      setCurrentPage(nextPage);
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, currentPage, allCompanies]);

  useEffect(() => {
    // Initial load
    setDisplayedCompanies(allCompanies.slice(0, ITEMS_PER_PAGE * currentPage));
     if (ITEMS_PER_PAGE * currentPage >= allCompanies.length) {
      setHasMore(false);
    }

    // Load interaction states from localStorage
    const storedLiked = localStorage.getItem('likedCompaniesDemo');
    if (storedLiked) setLikedCompanies(new Set(JSON.parse(storedLiked)));
    const storedSuperLiked = localStorage.getItem('superLikedCompaniesDemo');
    if (storedSuperLiked) setSuperLikedCompanies(new Set(JSON.parse(storedSuperLiked)));
    const storedPassed = localStorage.getItem('passedCompaniesDemo');
    if (storedPassed) setPassedCompanies(new Set(JSON.parse(storedPassed)));
    const storedSaved = localStorage.getItem('savedCompaniesDemo');
    if (storedSaved) setSavedCompanies(new Set(JSON.parse(storedSaved)));
  }, [allCompanies]); // Removed currentPage from deps to avoid re-slicing on every loadMore

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMoreCompanies();
      }
    });

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMoreCompanies]);

  const updateLocalStorageSet = (key: string, set: Set<string>) => {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  };

  const handleAction = (companyId: string, action: 'like' | 'pass' | 'superlike' | 'details' | 'save') => {
    const company = allCompanies.find(c => c.id === companyId);
    if (!company) return;

    let message = "";
    let toastVariant: "default" | "destructive" = "default";
    
    const newLiked = new Set(likedCompanies);
    const newSuperLiked = new Set(superLikedCompanies);
    const newPassed = new Set(passedCompanies);
    const newSaved = new Set(savedCompanies);

    if (action === 'like') {
      newLiked.add(companyId);
      newPassed.delete(companyId);
      message = `Interested in ${company.name}`;
      if (Math.random() > 0.7) {
        toast({
          title: "🎉 Company Interested!",
          description: `${company.name} is also interested in profiles like yours!`,
        });
      }
      setLikedCompanies(newLiked);
      updateLocalStorageSet('likedCompaniesDemo', newLiked);
    } else if (action === 'pass') {
      newPassed.add(companyId);
      newLiked.delete(companyId);
      newSuperLiked.delete(companyId);
      message = `Passed on ${company.name}`;
      toastVariant = "destructive";
      setPassedCompanies(newPassed);
      updateLocalStorageSet('passedCompaniesDemo', newPassed);
    } else if (action === 'superlike') {
      newSuperLiked.add(companyId);
      newLiked.add(companyId); 
      newPassed.delete(companyId);
      message = `Super liked ${company.name}! Your profile will be prioritized.`;
      setSuperLikedCompanies(newSuperLiked);
      updateLocalStorageSet('superLikedCompaniesDemo', newSuperLiked);
      setLikedCompanies(newLiked);
      updateLocalStorageSet('likedCompaniesDemo', newLiked);
    } else if (action === 'details') {
      message = `Viewing details for ${company.name}`;
      toast({ title: message, description: "Detailed view functionality to be implemented." });
      return;
    } else if (action === 'save') {
      if (newSaved.has(companyId)) {
        newSaved.delete(companyId);
        message = `Unsaved ${company.name}.`;
      } else {
        newSaved.add(companyId);
        message = `Saved ${company.name}!`;
      }
      setSavedCompanies(newSaved);
      updateLocalStorageSet('savedCompaniesDemo', newSaved);
    }
    
    if (action !== 'details') {
        toast({ title: message, variant: toastVariant });
    }
  };
  
  const visibleCompanies = displayedCompanies.filter(c => !passedCompanies.has(c.id));

  if (allCompanies.length === 0 && !isLoading) { // Check allCompanies before initial load
    return <div className="flex justify-center items-center h-64"><p>No companies available.</p></div>;
  }


  return (
    <div className="flex flex-col items-center p-2 sm:p-4 w-full">
      <div className="w-full max-w-xl space-y-6 scrollable-feed">
        {visibleCompanies.map(company => (
          <SwipeCard 
            key={company.id} 
            className={`transition-all duration-300 ease-out 
                        ${superLikedCompanies.has(company.id) ? 'ring-4 ring-accent shadow-accent/30' : likedCompanies.has(company.id) ? 'ring-4 ring-green-500 shadow-green-500/30' : 'shadow-lg hover:shadow-xl'} 
                        min-h-[600px] md:min-h-[700px]`}
          >
            <CompanyCardContent 
                company={company} 
                onAction={handleAction} // This prop might not be used if actions are directly on card, review
                isLiked={likedCompanies.has(company.id)}
                isSuperLiked={superLikedCompanies.has(company.id)}
            />
            <CardFooter className="p-3 grid grid-cols-5 gap-2 border-t bg-card">
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
            </CardFooter>
          </SwipeCard>
        ))}
         {isLoading && (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {!isLoading && !hasMore && visibleCompanies.length === 0 && (
           <div className="text-center py-10 col-span-full">
             <h2 className="text-2xl font-semibold mb-4">No More Companies</h2>
             <p className="text-muted-foreground">You've seen all opportunities for now, or try adjusting your preferences!</p>
           </div>
        )}
        <div ref={loadMoreRef} style={{ height: '1px' }} /> {/* Invisible element to trigger loading more */}
      </div>
       <style jsx>{`
        .scrollable-feed {
          max-height: calc(100vh - 200px); /* Adjust based on header/footer/search bar height */
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding-right: 4px; 
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
