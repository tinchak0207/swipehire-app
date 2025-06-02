
"use client";

import React, { useRef, useState, useEffect } from 'react';
import NextImage from 'next/image';
import { MapPin, Briefcase, BarChart3, ThumbsDown, Eye, ThumbsUp, Share2, Link as LinkIcon, Mail, Linkedin, Twitter as TwitterIcon, Star, Lock, Video } from 'lucide-react';
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
  isPreviewMode?: boolean; // New prop
}

const SWIPE_THRESHOLD = 75;
const MAX_ROTATION = 10;

const incrementAnalytic = (key: string) => {
  if (typeof window !== 'undefined') {
    const currentCount = parseInt(localStorage.getItem(`analytics_${key}`) || '0', 10);
    localStorage.setItem(`analytics_${key}`, (currentCount + 1).toString());
  }
};

const ProfileCard = ({ candidate, onAction, isLiked, isGuestMode, isPreviewMode }: ProfileCardProps) => {
  const { toast } = useToast();
  const cardRootRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const avatarDisplayUrl = candidate.avatarUrl
    ? candidate.avatarUrl.startsWith('/uploads/')
      ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}`
      : candidate.avatarUrl
    : `https://placehold.co/96x96.png?text=${encodeURIComponent(candidate.name?.[0] || 'P')}`;

  const needsUnoptimized = avatarDisplayUrl.startsWith(CUSTOM_BACKEND_URL) || avatarDisplayUrl.startsWith('http://localhost');

  const handleLocalSwipeAction = (actionType: 'like' | 'pass') => {
    if (isGuestMode || isPreviewMode) return;
    if (actionType === 'like') {
      incrementAnalytic('analytics_candidate_likes');
    } else if (actionType === 'pass') {
      incrementAnalytic('analytics_candidate_passes');
    }
    onAction(candidate.id, actionType);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGuestMode || isPreviewMode) return;
    const targetElement = e.target as HTMLElement;
    if (targetElement.closest('video[controls], button, a, [data-no-drag="true"], .no-swipe-area, [role="dialog"], [role="menu"], input, textarea, [role="listbox"], [role="option"], [data-radix-scroll-area-viewport]')) {
      if (targetElement.tagName === 'VIDEO' && targetElement.hasAttribute('controls')) {
        const video = targetElement as HTMLVideoElement;
        const rect = video.getBoundingClientRect();
        if (e.clientY > rect.bottom - 40) {
            return; 
        }
      } else if (targetElement.closest('button, a, [data-no-drag="true"], [role="dialog"], [role="menu"], input, textarea, [role="listbox"], [role="option"], [data-radix-scroll-area-viewport]')) {
       return; 
      }
    }
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    if (cardRootRef.current) {
      cardRootRef.current.style.cursor = 'grabbing';
      cardRootRef.current.style.transition = 'none';
    }
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !cardRootRef.current || isGuestMode || isPreviewMode) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !cardRootRef.current || isGuestMode || isPreviewMode) return;

    const deltaX = currentX - startX;
    cardRootRef.current.style.transition = 'transform 0.3s ease-out';
    cardRootRef.current.style.transform = 'translateX(0px) rotateZ(0deg)';

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        handleLocalSwipeAction('pass');
      } else {
        handleLocalSwipeAction('like');
      }
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
    if (cardRootRef.current) {
      cardRootRef.current.style.cursor = (isGuestMode || isPreviewMode) ? 'default' : 'grab';
    }
    document.body.style.userSelect = '';
  };

  const getCardTransform = () => {
    if (!isDragging || isGuestMode || isPreviewMode) return 'translateX(0px) rotateZ(0deg)';
    const deltaX = currentX - startX;
    const rotationFactor = Math.min(Math.abs(deltaX) / (SWIPE_THRESHOLD * 2), 1);
    const rotation = MAX_ROTATION * (deltaX > 0 ? 1 : -1) * rotationFactor;
    return `translateX(${deltaX}px) rotateZ(${rotation}deg)`;
  };

  const handleShareOptionClick = (platform: 'copy' | 'email' | 'linkedin' | 'twitter') => {
    if (isGuestMode || isPreviewMode) {
      toast({ title: "Feature Locked", description: "Sign in to share profiles.", variant: "default" });
      return;
    }
    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/candidate/${candidate.id}` : `https://swipehire-app.com/candidate/${candidate.id}`;
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
    return 'bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200';
  };
  
  const lockedButtonClasses = "bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-200 hover:border-rose-300 cursor-not-allowed";

  return (
    <div 
      ref={cardRootRef}
      className="max-w-sm w-full mx-auto bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-3xl"
      onMouseDown={!isPreviewMode ? handleMouseDown : undefined}
      onMouseMove={!isPreviewMode ? handleMouseMove : undefined}
      onMouseUp={!isPreviewMode ? handleMouseUpOrLeave : undefined}
      onMouseLeave={!isPreviewMode ? handleMouseUpOrLeave : undefined}
      style={{
        cursor: (isGuestMode || isPreviewMode) ? 'default' : (isDragging ? 'grabbing' : 'grab'),
        transform: getCardTransform(),
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, box-shadow 0.3s ease-out, scale 0.3s ease-out',
      }}
    >
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
            {candidate.isUnderestimatedTalent && !isPreviewMode ? ( // Hide gem in preview to match screenshot
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
              <div className={cn("absolute -bottom-1 -right-1 w-6 h-6 rounded-full ring-2 ring-white shadow-md", isPreviewMode ? "bg-gray-300" : "bg-green-400")}></div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="px-6 py-6 space-y-4">
        {/* Name and Title */}
        <div className="text-center space-y-2">
          <h2 className={cn("text-2xl font-bold tracking-tight", isPreviewMode && !candidate.name ? "text-gray-300" : "text-gray-800")}>
            {isPreviewMode && !candidate.name ? "Your Name (Preview)" : candidate.name || "N/A"}
          </h2>
          <p className={cn("font-medium text-sm uppercase tracking-wide", isPreviewMode && !candidate.role ? "text-gray-300" : "text-indigo-600")}>
             {isPreviewMode && !candidate.role ? "Your Role (Preview)" : candidate.role || "Role not specified"}
          </p>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          {(candidate.location || isPreviewMode) && (
            <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className={cn("text-sm font-medium truncate", isPreviewMode && !candidate.location ? "text-gray-400 italic" : "text-gray-700")}>
                {candidate.location || (isPreviewMode ? "Your Location (Preview)" : "Not specified")}
              </span>
            </div>
          )}
          
          {(candidate.workExperienceLevel && candidate.workExperienceLevel !== "unspecified" || isPreviewMode) && (
            <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className={cn("text-sm font-medium truncate", isPreviewMode && (!candidate.workExperienceLevel || candidate.workExperienceLevel === "unspecified") ? "text-gray-400 italic" : "text-gray-700")}>
                 {candidate.workExperienceLevel && candidate.workExperienceLevel !== "unspecified" ? candidate.workExperienceLevel : (isPreviewMode ? "Experience Level (Preview)" : "Not specified")}
              </span>
            </div>
          )}
          
          {(candidate.profileStrength !== undefined || isPreviewMode) && (
            <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <BarChart3 className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className={cn("text-sm font-medium",isPreviewMode && candidate.profileStrength === undefined ? "text-gray-400 italic": "text-gray-700")}>Profile Strength</span>
                  <span className="text-indigo-600 text-sm font-bold">{candidate.profileStrength ?? (isPreviewMode ? 80 : 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${candidate.profileStrength ?? (isPreviewMode ? 80 : 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Experience */}
        {(candidate.experienceSummary || isPreviewMode) && (
          <div className="p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
            <p className={cn("text-sm leading-relaxed line-clamp-3", isPreviewMode && !candidate.experienceSummary ? "text-gray-400 italic" : "text-gray-600")}>
              {candidate.experienceSummary || (isPreviewMode ? "Your experience summary goes here..." : "No experience summary provided.")}
            </p>
          </div>
        )}

        {/* Skills */}
        {((candidate.skills && candidate.skills.length > 0) || isPreviewMode) && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Top Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(candidate.skills && candidate.skills.length > 0 ? candidate.skills.slice(0, 5) : (isPreviewMode ? ["Example Skill 1", "Example Skill 2"] : [])).map(skill => (
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
        <div className={cn("grid gap-2 pt-4 no-swipe-area", isPreviewMode ? "grid-cols-3" : "grid-cols-4")} data-no-drag="true">
          <Button
            data-no-drag="true"
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            className={cn(
                "flex flex-col items-center gap-1 p-3 h-auto transition-all duration-200 hover:scale-105 active:scale-95 shadow-md",
                isPreviewMode ? lockedButtonClasses : "bg-white/60 backdrop-blur-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            )}
            onClick={(e) => { if (!isPreviewMode) { e.stopPropagation(); onAction(candidate.id, 'pass'); } }}
            disabled={isGuestMode || isPreviewMode}
          >
            {(isGuestMode || isPreviewMode) ? <Lock className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
            <span className="text-xs">Pass</span>
          </Button>
          
          {!isPreviewMode && (
            <Button
              data-no-drag="true"
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 p-3 h-auto bg-white/60 backdrop-blur-sm border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
              onClick={(e) => { e.stopPropagation(); onAction(candidate.id, 'viewProfile'); }}
            >
              <Eye className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Button>
          )}
          
          <Button
            data-no-drag="true"
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            className={cn(
                "flex flex-col items-center gap-1 p-3 h-auto transition-all duration-200 hover:scale-105 active:scale-95 shadow-md",
                isPreviewMode ? lockedButtonClasses : cn(
                    "bg-white/60 backdrop-blur-sm border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300",
                    isLiked && "bg-green-100 border-green-400 ring-2 ring-green-500"
                )
            )}
            onClick={(e) => { if (!isPreviewMode) { e.stopPropagation(); onAction(candidate.id, 'like'); } }}
            disabled={isGuestMode || isPreviewMode}
          >
            {(isGuestMode || isPreviewMode) ? <Lock className="w-5 h-5" /> : <ThumbsUp className={cn("w-5 h-5", isLiked && "fill-green-500")} />}
            <span className="text-xs">Like</span>
          </Button>
          
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      data-no-drag="true"
                      variant={isPreviewMode ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 h-auto transition-all duration-200 hover:scale-105 active:scale-95 shadow-md",
                        isPreviewMode ? lockedButtonClasses : "bg-white/60 backdrop-blur-sm border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                      )}
                      disabled={isGuestMode || isPreviewMode}
                      onClick={(e) => e.stopPropagation()} 
                    >
                      {(isGuestMode || isPreviewMode) ? <Lock className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                      <span className="text-xs">Share</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                {(isGuestMode || isPreviewMode) && (
                  <TooltipContent side="top" className="bg-red-500 text-white border-red-600 p-2 rounded-md shadow-lg">
                    <p>{isPreviewMode ? "Share disabled in preview" : "Sign in to share"}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
           {!isPreviewMode && (
            <DropdownMenuContent align="end" className="w-48 bg-background border shadow-lg rounded-md" data-no-drag="true">
              <DropdownMenuItem onClick={() => handleShareOptionClick('copy')} className="cursor-pointer hover:bg-muted" data-no-drag="true">
                <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareOptionClick('email')} className="cursor-pointer hover:bg-muted" data-no-drag="true">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Share via Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareOptionClick('linkedin')} className="cursor-pointer hover:bg-muted" data-no-drag="true">
                <Linkedin className="mr-2 h-4 w-4 text-muted-foreground" /> Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareOptionClick('twitter')} className="cursor-pointer hover:bg-muted" data-no-drag="true">
                <TwitterIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Share on X
              </DropdownMenuItem>
            </DropdownMenuContent>
           )}
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
