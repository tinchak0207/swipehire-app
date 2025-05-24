
"use client";

import React, { useState, useEffect } from 'react';
import type { Company } from '@/lib/types';
import { mockCompanies } from '@/lib/mockData';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { CompanyCardContent } from '@/components/swipe/CompanyCardContent';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Eye, Star, ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function JobDiscoveryPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  const [superLikedCompanies, setSuperLikedCompanies] = useState<Set<string>>(new Set());
  const [passedCompanies, setPassedCompanies] = useState<Set<string>>(new Set());

  const { toast } = useToast();

  useEffect(() => {
    setCompanies(mockCompanies);
  }, []);

  const handleAction = (companyId: string, action: 'like' | 'pass' | 'superlike' | 'details') => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;

    let message = "";
    let toastVariant: "default" | "destructive" = "default";


    if (action === 'like') {
      setLikedCompanies(prev => new Set(prev).add(companyId));
      setPassedCompanies(prev => { const newSet = new Set(prev); newSet.delete(companyId); return newSet; });
      message = `Interested in ${company.name}`;
      if (Math.random() > 0.7) { // Simulate mutual match
        toast({
          title: "🎉 Company Interested!",
          description: `${company.name} is also interested in profiles like yours!`,
        });
      }
    } else if (action === 'pass') {
      setPassedCompanies(prev => new Set(prev).add(companyId));
      setLikedCompanies(prev => { const newSet = new Set(prev); newSet.delete(companyId); return newSet; });
      setSuperLikedCompanies(prev => { const newSet = new Set(prev); newSet.delete(companyId); return newSet; });
      message = `Passed on ${company.name}`;
      toastVariant = "destructive";
    } else if (action === 'superlike') {
      setSuperLikedCompanies(prev => new Set(prev).add(companyId));
      setLikedCompanies(prev => new Set(prev).add(companyId)); 
      setPassedCompanies(prev => { const newSet = new Set(prev); newSet.delete(companyId); return newSet; });
      message = `Super liked ${company.name}! Your profile will be prioritized.`;
    } else if (action === 'details') {
      message = `Viewing details for ${company.name}`;
      toast({ title: message, description: "Detailed view functionality to be implemented." });
      return;
    }

    toast({ title: message, variant: toastVariant });
  };
  
  const visibleCompanies = companies.filter(c => !passedCompanies.has(c.id));

  if (companies.length === 0) {
    return <div className="flex justify-center items-center h-64"><p>Loading companies...</p></div>;
  }

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 w-full">
      <div className="w-full max-w-md space-y-6 scrollable-feed">
        {visibleCompanies.length > 0 ? visibleCompanies.map(company => (
          <SwipeCard key={company.id} className={`transition-opacity duration-300 ${superLikedCompanies.has(company.id) ? 'ring-2 ring-accent' : likedCompanies.has(company.id) ? 'ring-2 ring-green-500' : ''}`}>
            <CompanyCardContent company={company} />
            <CardFooter className="p-3 grid grid-cols-4 gap-2 border-t bg-card">
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
                aria-label={`Like ${company.name}`}
              >
                <ThumbsUp className={`h-5 w-5 mb-1 ${likedCompanies.has(company.id) && !superLikedCompanies.has(company.id) ? 'fill-green-500' : ''}`} />
                <span className="text-xs">Apply</span>
              </Button>
            </CardFooter>
          </SwipeCard>
        )) : (
           <div className="text-center py-10 col-span-full">
            <h2 className="text-2xl font-semibold mb-4">No More Companies</h2>
            <p className="text-muted-foreground">You've seen all opportunities for now, or try adjusting your preferences!</p>
          </div>
        )}
      </div>
      {/* Add a "Load More" button or infinite scroll mechanism here in a real app */}
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
