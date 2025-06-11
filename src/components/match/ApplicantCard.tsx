
"use client";

import React from 'react';
import type { Match, Candidate, Company } from '@/lib/types'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Briefcase, Clock, UserCircle, ExternalLink, MapPin, BarChart3, ThumbsDown, Users, UserX, CheckCircle, ThumbsUp, Sparkles, Archive } from 'lucide-react'; 
import { format, formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast'; 
import Image from 'next/image';

interface ApplicantCardProps {
  match: Match & { candidate: Candidate; company: Company }; 
  onInviteToInterview: (match: Match) => void;
  onRejectApplicant: (match: Match) => void;
  onArchiveMatch: (matchId: string) => void; // New prop for archiving
  isFocused?: boolean;
}

export function ApplicantCard({ match, onInviteToInterview, onRejectApplicant, onArchiveMatch, isFocused }: ApplicantCardProps) {
  const { candidate, applicationTimestamp, jobOpeningTitle } = match;
  const { toast } = useToast();

  const calculateTimeRemaining = () => {
    if (!applicationTimestamp) return { text: "N/A", colorClasses: "bg-gray-100 text-gray-600", iconColor: "text-gray-400" };
    const appliedDate = new Date(applicationTimestamp);
    const dueDate = new Date(appliedDate.getTime() + 72 * 60 * 60 * 1000); // 72 hours SLA
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { text: "Overdue", colorClasses: "bg-red-100 text-red-700 border-red-300", iconColor: "text-red-600" };
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return { text: `~${Math.floor(diffMs / (1000 * 60))}m left`, colorClasses: "bg-red-100 text-red-700 border-red-300", iconColor: "text-red-600" }; 
    if (diffHours < 6) return { text: `~${diffHours}h left`, colorClasses: "bg-orange-100 text-orange-700 border-orange-300", iconColor: "text-orange-600" }; 
    if (diffHours < 24) return { text: `~${diffHours}h left`, colorClasses: "bg-yellow-100 text-yellow-700 border-yellow-300", iconColor: "text-yellow-600" }; 
    return { text: `~${Math.floor(diffHours/24)}d ${diffHours % 24}h left`, colorClasses: "bg-green-100 text-green-700 border-green-300", iconColor: "text-green-600" }; 
  };

  const timeRemainingDetails = calculateTimeRemaining();
  const formattedApplicationTime = applicationTimestamp 
    ? format(new Date(applicationTimestamp), "yyyy/M/d HH:mm") 
    : "N/A";

  const handleViewProfile = () => {
    toast({title: "View Resume", description: `Conceptual: Navigating to ${candidate.name}'s full profile.`, duration: 3000});
  };
  
  const locationAndExperience = [];
  if (candidate.location) locationAndExperience.push(candidate.location);
  if (candidate.workExperienceLevel && candidate.workExperienceLevel !== 'unspecified') {
    const expLabel = candidate.workExperienceLevel.replace(/_/g, ' ');
    locationAndExperience.push(expLabel.charAt(0).toUpperCase() + expLabel.slice(1));
  }

  const avatarUrl = candidate.avatarUrl || `https://placehold.co/40x40.png?text=${candidate.name.charAt(0)}`;


  return (
    <Card className={cn(
        "w-full bg-card shadow-md hover:shadow-lg transition-all duration-200 ease-in-out rounded-lg border",
        isFocused ? "ring-2 ring-blue-500 border-blue-500 shadow-xl" : "border-slate-200 hover:border-slate-300"
    )}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start space-x-3">
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 rounded-md"> 
              <AvatarImage src={avatarUrl} alt={candidate.name} data-ai-hint={candidate.dataAiHint || "person"} />
              <AvatarFallback className="rounded-md bg-slate-200 text-slate-600">{candidate.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-base font-semibold text-slate-800 truncate leading-tight" title={candidate.name}>{candidate.name}</CardTitle>
                    <CardDescription className="text-xs text-blue-600 truncate leading-tight" title={candidate.role}>
                        {candidate.role}
                    </CardDescription>
                </div>
                <Badge variant="outline" className={cn("text-xs px-2 py-0.5 font-medium h-6 flex items-center shrink-0", timeRemainingDetails.colorClasses)}>
                    <Clock className={cn("mr-1 h-3 w-3", timeRemainingDetails.iconColor)} />
                    {timeRemainingDetails.text}
                </Badge>
            </div>
             {locationAndExperience.length > 0 && (
                <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center">
                   <MapPin className="h-3 w-3 mr-1 text-slate-400 shrink-0" /> {locationAndExperience.join(' • ')}
                </p>
            )}
          </div>
        </div>

        <div>
            <div className="flex justify-between text-xs text-slate-500 mb-0.5 items-center">
                <span className="font-medium flex items-center"><BarChart3 className="h-3.5 w-3.5 mr-1 text-slate-400"/>Profile Strength</span>
                <span className="font-semibold text-sm text-blue-600">{candidate.profileStrength || 0}%</span>
            </div>
            <Progress value={candidate.profileStrength || 0} className="h-1.5 bg-slate-200 [&>div]:bg-gradient-to-r from-purple-400 to-blue-500" />
        </div>
        
        {candidate.skills && candidate.skills.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Top Skills</p>
            <div className="flex flex-wrap gap-1.5">
                {candidate.skills.slice(0, 3).map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-700 font-normal">{skill}</Badge>
                ))}
                {candidate.skills.length > 3 && <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-slate-300 text-slate-500 font-normal">+{candidate.skills.length - 3}</Badge>}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 pt-1">
          Applied: {formattedApplicationTime} for {jobOpeningTitle || "general interest"}
        </p>
      </CardContent>
      <CardFooter className="p-3 bg-slate-50 border-t grid grid-cols-4 gap-2">
        <Button variant="outline" size="sm" onClick={() => onRejectApplicant(match)} className="border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400 text-xs font-medium py-2 h-9">
            <UserX className="mr-1.5 h-3.5 w-3.5" /> Reject
        </Button>
        <Button variant="outline" size="sm" onClick={handleViewProfile} className="text-xs font-medium border-slate-300 hover:bg-slate-100 py-2 h-9">
          <Eye className="mr-1.5 h-3.5 w-3.5" /> View
        </Button>
        <Button onClick={() => onInviteToInterview(match)} size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 h-9">
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Invite
        </Button>
        <Button variant="outline" size="sm" onClick={() => onArchiveMatch(match._id)} className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400 text-xs font-medium py-2 h-9">
            <Archive className="mr-1.5 h-3.5 w-3.5" /> Archive
        </Button>
      </CardFooter>
    </Card>
  );
}
    
