"use client";

import { useState } from 'react';
import type { Match, IcebreakerRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateIcebreakerQuestion } from '@/ai/flows/icebreaker-generator';
import { Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface IcebreakerCardProps {
  match: Match;
}

export function IcebreakerCard({ match }: IcebreakerCardProps) {
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateIcebreaker = async () => {
    setIsLoading(true);
    setIcebreaker(null);
    try {
      const candidate = match.candidate;
      const company = match.company;
      
      // Simplistic job description from company, or first opening if available
      const jobDescription = company.jobOpenings && company.jobOpenings.length > 0 
        ? `${company.jobOpenings[0].title}: ${company.jobOpenings[0].description}`
        : `a role at ${company.name}`;

      const requestData: IcebreakerRequest = {
        candidateName: candidate.name,
        jobDescription: jobDescription,
        candidateSkills: candidate.skills.join(', '),
        companyNeeds: company.companyNeeds || "general company needs for talent",
        pastProjects: candidate.pastProjects || "various interesting projects"
      };

      const result = await generateIcebreakerQuestion(requestData);
      setIcebreaker(result.icebreakerQuestion);
      toast({
        title: "Icebreaker Generated!",
        description: "Ready to start the conversation.",
      });
    } catch (error) {
      console.error("Error generating icebreaker:", error);
      toast({
        title: "Error",
        description: "Failed to generate icebreaker. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardHeader className="bg-primary/10 p-4">
        <div className="flex items-center space-x-3">
          {match.candidate.avatarUrl && (
            <Image 
              src={match.candidate.avatarUrl} 
              alt={match.candidate.name} 
              width={60} 
              height={60} 
              className="rounded-full border-2 border-primary"
              data-ai-hint={match.candidate.dataAiHint || "person"}
            />
          )}
          <div>
            <CardTitle className="text-xl text-primary">Match: {match.candidate.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">With {match.company.name}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {!icebreaker && !isLoading && (
           <div className="text-center py-4">
            <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Ready to break the ice?</p>
          </div>
        )}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating icebreaker...</p>
          </div>
        )}
        {icebreaker && (
          <div>
            <h4 className="font-semibold text-primary mb-2 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-accent" />
              AI Suggested Icebreaker:
            </h4>
            <Textarea
              readOnly
              value={icebreaker}
              className="min-h-[100px] bg-background text-foreground border-primary/50"
              rows={3}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 bg-muted/30">
        <Button onClick={handleGenerateIcebreaker} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {icebreaker ? 'Regenerate Icebreaker' : 'Generate Icebreaker'}
        </Button>
      </CardFooter>
    </Card>
  );
}
