
"use client";

import React from 'react';
import NextImage from 'next/image';
import { MapPin, Briefcase, BarChart3, ThumbsDown, Eye, ThumbsUp, Share2, Link as LinkIcon, Mail, Linkedin, Twitter as TwitterIcon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Candidate } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const envBackendUrl = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL;
const CUSTOM_BACKEND_URL = (envBackendUrl && envBackendUrl.trim() !== "") ? envBackendUrl : 'http://localhost:5000';

interface ProfileCardProps {
  candidate: Candidate;
  onAction: (candidateId: string, action: 'like' | 'pass' | 'viewProfile') => void;
  isLiked?: boolean;
  isGuestMode?: boolean;
}

const ProfileCard = ({ candidate, onAction, isLiked, isGuestMode }: ProfileCardProps) => {
  const { toast } = useToast();

  const avatarDisplayUrl = candidate.avatarUrl
    ? candidate.avatarUrl.startsWith('/uploads/')
      ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}`
      : candidate.avatarUrl
    : `https://placehold.co/96x96.png?text=${encodeURIComponent(candidate.name?.[0] || 'P')}`;

  const needsUnoptimized = avatarDisplayUrl.startsWith(CUSTOM_BACKEND_URL) || avatarDisplayUrl.startsWith('http://localhost');

  const handleShareOptionClick = (platform: 'copy' | 'email' | 'linkedin' | 'twitter') => {
    if (isGuestMode) {
      toast({ title: "Feature Locked", description: "Sign in to share profiles.", variant: "default" });
      return;
    }
    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/candidate/${candidate.id}` : `https://swipehire-app.com/candidate/${candidate.id}`; // Conceptual URL
    const shareText = `Check out this profile on SwipeHire: ${candidate.name} - ${candidate.role}. Visit ${profileUrl}`;
    const emailSubject = `Interesting Profile on SwipeHire: ${candidate.name}`;
    const emailBody = `I found this profile on SwipeHire and thought you might be interested:\n\nName: ${candidate.name}\nRole: ${candidate.role}\n\nView more at: ${profileUrl}\n\nShared from SwipeHire.`;

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(profileUrl)
          .then(() => toast({ title: "Link Copied!", description: "Profile link copied to clipboard." }))
          .catch(() => toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" }));
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&title=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`, '_blank', 'noopener,noreferrer');
        break;
    }
  };

  const getSkillBadgeClass = (skill: string) => {
    if (skill.toLowerCase() === 'firebase') {
      return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border-orange-300 hover:from-orange-200 hover:to-orange-300';
    }
    if (skill.toLowerCase() === 'c++') {
      return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300 hover:from-blue-200 hover:to-blue-300';
    }
    return 'bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200'; // Default skill badge
  };

  return (
    <div className="max-w-sm w-full mx-auto bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
      {/* Header Section with Profile Image */}
      <div className="relative pt-8 pb-6 bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full ring-4 ring-white/50 overflow-hidden shadow-xl">
              <NextImage
                src={avatarDisplayUrl}
                alt={candidate.name || "Candidate Avatar"}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                data-ai-hint={candidate.dataAiHint || "person portrait"}
                unoptimized={needsUnoptimized}
                priority
              />
            </div>
            {candidate.isUnderestimatedTalent ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full ring-2 ring-white flex items-center justify-center shadow-md">
                       <Star className="w-4 h-4 text-yellow-800 fill-yellow-700" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-black text-white text-xs p-2 rounded-md shadow-lg">
                    <p>{candidate.underestimatedReasoning || "Hidden Gem!"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full ring-2 ring-white shadow-md"></div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="px-6 py-6 space-y-4">
        {/* Name and Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{candidate.name || "N/A"}</h2>
          <p className="text-indigo-600 font-medium text-sm uppercase tracking-wide">{candidate.role || "Role not specified"}</p>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          {candidate.location && (
            <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-gray-700 text-sm font-medium truncate">{candidate.location}</span>
            </div>
          )}
          
          {candidate.workExperienceLevel && candidate.workExperienceLevel !== "unspecified" && (
            <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-gray-700 text-sm font-medium truncate">{candidate.workExperienceLevel}</span>
            </div>
          )}
          
          {candidate.profileStrength !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <BarChart3 className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700 text-sm font-medium">Profile Strength</span>
                  <span className="text-indigo-600 text-sm font-bold">{candidate.profileStrength}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${candidate.profileStrength}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Experience */}
        {candidate.experienceSummary && (
          <div className="p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
            <p className="text-gray-600 text-sm leading-relaxed italic line-clamp-3">
              {candidate.experienceSummary}
            </p>
          </div>
        )}

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Top Skills</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.slice(0, 5).map(skill => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className={cn("transition-all duration-200 shadow-sm", getSkillBadgeClass(skill))}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-1 p-3 h-auto bg-white/60 backdrop-blur-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
            onClick={() => onAction(candidate.id, 'pass')}
            disabled={isGuestMode}
          >
            <ThumbsDown className="w-5 h-5" />
            <span className="text-xs">Pass</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-1 p-3 h-auto bg-white/60 backdrop-blur-sm border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
            onClick={() => onAction(candidate.id, 'viewProfile')}
          >
            <Eye className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className={cn(
                "flex flex-col items-center gap-1 p-3 h-auto bg-white/60 backdrop-blur-sm border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md",
                isLiked && "bg-green-100 border-green-400 ring-2 ring-green-500"
            )}
            onClick={() => onAction(candidate.id, 'like')}
            disabled={isGuestMode}
          >
            <ThumbsUp className={cn("w-5 h-5", isLiked && "fill-green-500")} />
            <span className="text-xs">Like</span>
          </Button>
          
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex flex-col items-center gap-1 p-3 h-auto bg-white/60 backdrop-blur-sm border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                      disabled={isGuestMode}
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-xs">Share</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                {isGuestMode && (
                  <TooltipContent side="top" className="bg-red-500 text-white border-red-600 p-2 rounded-md shadow-lg">
                    <p>Sign in to share</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-48 bg-background border shadow-lg rounded-md">
              <DropdownMenuItem onClick={() => handleShareOptionClick('copy')} className="cursor-pointer hover:bg-muted">
                <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareOptionClick('email')} className="cursor-pointer hover:bg-muted">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Share via Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareOptionClick('linkedin')} className="cursor-pointer hover:bg-muted">
                <Linkedin className="mr-2 h-4 w-4 text-muted-foreground" /> Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareOptionClick('twitter')} className="cursor-pointer hover:bg-muted">
                <TwitterIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Share on X
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
    

    