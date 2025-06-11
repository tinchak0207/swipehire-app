
"use client";

import React, { useRef, useState, useEffect } from 'react';
import NextImage from 'next/image';
import { MapPin, Briefcase, BarChart3, ThumbsDown, Eye, ThumbsUp, Share2, Link as LinkIcon, Mail, Linkedin, Twitter as TwitterIcon, Star, Lock, Video, UserCircle as UserCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Candidate, PersonalityTraitAssessment } from '@/lib/types';
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
  isPreviewMode?: boolean;
  className?: string;
}

const SWIPE_THRESHOLD = 75;
const MAX_ROTATION = 10;

const incrementAnalytic = (key: string) => {
  if (typeof window !== 'undefined') {
    const currentCount = parseInt(localStorage.getItem(`analytics_${key}`) || '0', 10);
    localStorage.setItem(`analytics_${key}`, (currentCount + 1).toString());
  }
};

const getThemeClass = (themeKey?: string) => {
  if (!themeKey || themeKey === 'default') return '';
  return `card-theme-${themeKey}`;
};


const ProfileCard = ({ candidate, onAction, isLiked, isGuestMode, isPreviewMode, className }: ProfileCardProps) => {
  const { toast } = useToast();
  const cardRootRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const themeClass = getThemeClass(candidate.cardTheme);
  const isThemedCard = !!(candidate.cardTheme && candidate.cardTheme !== 'default');
  const isDarkThemeActive = themeClass && (themeClass.includes('ocean') || themeClass.includes('sunset') || themeClass.includes('forest') || themeClass.includes('professional-dark'));


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
    if (isThemedCard) {
        if (candidate.cardTheme === 'lavender') return 'bg-purple-200/70 text-purple-800 border-purple-300 hover:bg-purple-300/70';
        return 'bg-white/20 text-white border-white/30 hover:bg-white/30'; 
    }
    return 'bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200';
  };
  
  const lockedButtonClasses = "bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-200 hover:border-rose-300 cursor-not-allowed";


  return (
    <div 
      ref={cardRootRef}
      className={cn(
        "max-w-sm w-full mx-auto rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-3xl",
        themeClass || "bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100",
        className
      )}
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
      <div className={cn(
        "relative pt-8 pb-6",
        isThemedCard ? (isDarkThemeActive ? "card-header-themed" : "card-header-themed") : "bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500"
      )}>
        {!isThemedCard && <div className="absolute inset-0 bg-black/10"></div>}
        <div className="relative flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full ring-4 ring-white/50 overflow-hidden shadow-xl">
               {avatarDisplayUrl !== `https://placehold.co/96x96.png?text=${encodeURIComponent(candidate.name?.[0] || 'P')}` ? (
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
                ) : (
                    <UserCircleIcon className="w-full h-full text-gray-300 bg-gray-100 p-1" />
                )}
            </div>
            {candidate.isUnderestimatedTalent && !isPreviewMode ? ( 
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

      <div className="px-6 py-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className={cn(
            "text-2xl font-bold tracking-tight", 
            isPreviewMode && !candidate.name ? "text-gray-300" : (isDarkThemeActive ? "text-white" : "text-gray-800")
          )}>
            {isPreviewMode && !candidate.name ? "Your Name (Preview)" : candidate.name || "N/A"}
          </h2>
          <p className={cn(
            "font-medium text-sm uppercase tracking-wide", 
            isPreviewMode && !candidate.role ? "text-gray-300" : (isDarkThemeActive ? (candidate.cardTheme === 'professional-dark' ? "text-sky-400" : "text-indigo-300") : "text-indigo-600")
          )}>
             {isPreviewMode && !candidate.role ? "Your Role (Preview)" : candidate.role || "Role not specified"}
          </p>
        </div>

        <div className="space-y-3">
          {(candidate.location || isPreviewMode) && (
            <div className={cn("flex items-center gap-3 p-3 rounded-xl border shadow-sm", isDarkThemeActive ? "bg-white/10 border-white/20 backdrop-blur-sm" : "bg-white/60 border-white/20 backdrop-blur-sm")}>
              <MapPin className={cn("w-4 h-4 shrink-0", isDarkThemeActive ? "text-indigo-300" : "text-indigo-500")} />
              <span className={cn("text-sm font-medium truncate", isPreviewMode && !candidate.location ? "text-gray-400 italic" : (isDarkThemeActive ? "text-gray-200" : "text-gray-700"))}>
                {candidate.location || (isPreviewMode ? "Your Location (Preview)" : "Not specified")}
              </span>
            </div>
          )}
          
          {(candidate.workExperienceLevel && candidate.workExperienceLevel !== "unspecified" || isPreviewMode) && (
            <div className={cn("flex items-center gap-3 p-3 rounded-xl border shadow-sm", isDarkThemeActive ? "bg-white/10 border-white/20 backdrop-blur-sm" : "bg-white/60 border-white/20 backdrop-blur-sm")}>
              <Briefcase className={cn("w-4 h-4 shrink-0", isDarkThemeActive ? "text-indigo-300" : "text-indigo-500")} />
              <span className={cn("text-sm font-medium truncate", isPreviewMode && (!candidate.workExperienceLevel || candidate.workExperienceLevel === "unspecified") ? "text-gray-400 italic" : (isDarkThemeActive ? "text-gray-200" : "text-gray-700"))}>
                 {candidate.workExperienceLevel && candidate.workExperienceLevel !== "unspecified" ? candidate.workExperienceLevel : (isPreviewMode ? "Experience Level (Preview)" : "Not specified")}
              </span>
            </div>
          )}
          
          {(candidate.profileStrength !== undefined || isPreviewMode) && (
            <div className={cn("flex items-center gap-3 p-3 rounded-xl border shadow-sm", isDarkThemeActive ? "bg-white/10 border-white/20 backdrop-blur-sm" : "bg-white/60 border-white/20 backdrop-blur-sm")}>
              <BarChart3 className={cn("w-4 h-4 shrink-0", isDarkThemeActive ? "text-indigo-300" : "text-indigo-500")} />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className={cn("text-sm font-medium", isPreviewMode && candidate.profileStrength === undefined ? "text-gray-400 italic" : (isDarkThemeActive ? "text-gray-200" : "text-gray-700"))}>Profile Strength</span>
                  <span className={cn("text-sm font-bold", isDarkThemeActive ? "text-indigo-300" : "text-indigo-600")}>{candidate.profileStrength ?? (isPreviewMode ? 80 : 0)}%</span>
                </div>
                <div className={cn("w-full rounded-full h-2", isDarkThemeActive ? "bg-gray-600" : "bg-gray-200")}>
                  <div
                    className={cn("h-2 rounded-full transition-all duration-500", isDarkThemeActive ? "progress-bar-themed" : "bg-gradient-to-r from-indigo-500 to-purple-500")}
                    style={{ width: `${candidate.profileStrength ?? (isPreviewMode ? 80 : 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {(candidate.experienceSummary || isPreviewMode) && (
          <div className={cn("p-4 rounded-xl border shadow-sm", isDarkThemeActive ? "bg-white/5 border-white/10 backdrop-blur-sm" : "bg-white/40 border-white/20 backdrop-blur-sm")}>
            <p className={cn("text-sm leading-relaxed line-clamp-3", isPreviewMode && !candidate.experienceSummary ? "text-gray-400 italic" : (isDarkThemeActive ? "text-gray-300" : "text-gray-600"))}>
              {candidate.experienceSummary || (isPreviewMode ? "Your experience summary goes here..." : "No experience summary provided.")}
            </p>
          </div>
        )}

        {((candidate.skills && candidate.skills.length > 0) || isPreviewMode) && (
          <div className="space-y-3">
            <h3 className={cn("text-sm font-semibold uppercase tracking-wide", isDarkThemeActive ? "text-gray-300" : "text-gray-700")}>Top Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(candidate.skills && candidate.skills.length > 0 ? candidate.skills.slice(0, 5) : (isPreviewMode ? ["Example Skill 1", "Example Skill 2"] : [])).map(skill => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className={cn("transition-all duration-200 shadow-sm", 
                    isThemedCard ? 'badge-themed-skill' : getSkillBadgeClass(skill)
                  )}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className={cn("grid gap-2 pt-4 no-swipe-area", isPreviewMode ? "grid-cols-3" : "grid-cols-4")} data-no-drag="true">
          <Button
            data-no-drag="true"
            variant={isPreviewMode ? "default" : (isThemedCard ? "outline" : "outline")}
            size="sm"
            className={cn(
                "flex flex-col items-center gap-1 p-3 h-auto transition-all duration-200 hover:scale-105 active:scale-95 shadow-md",
                isPreviewMode ? lockedButtonClasses : 
                isThemedCard ? "action-button-pass-themed" : 
                "bg-white/60 backdrop-blur-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
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
              variant={isThemedCard ? "outline" : "outline"}
              size="sm"
              className={cn("flex flex-col items-center gap-1 p-3 h-auto transition-all duration-200 hover:scale-105 active:scale-95 shadow-md", 
                isThemedCard ? "action-button-themed" : 
                "bg-white/60 backdrop-blur-sm border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
              )}
              onClick={(e) => { e.stopPropagation(); onAction(candidate.id, 'viewProfile'); }}
            >
              <Eye className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Button>
          )}
          
          <Button
            data-no-drag="true"
            variant={isPreviewMode ? "default" : (isThemedCard ? "outline" : "outline")}
            size="sm"
            className={cn(
                "flex flex-col items-center gap-1 p-3 h-auto transition-all duration-200 hover:scale-105 active:scale-95 shadow-md",
                isPreviewMode ? lockedButtonClasses : cn(
                  isThemedCard ? (isLiked ? "action-button-like-themed liked" : "action-button-like-themed") : 
                  "bg-white/60 backdrop-blur-sm border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300",
                  isLiked && !isThemedCard && "bg-green-100 border-green-400 ring-2 ring-green-500"
                )
            )}
            onClick={(e) => { if (!isPreviewMode) { e.stopPropagation(); onAction(candidate.id, 'like'); } }}
            disabled={isGuestMode || isPreviewMode}
          >
            {(isGuestMode || isPreviewMode) ? <Lock className="w-5 h-5" /> : <ThumbsUp className={cn("w-5 h-5", isLiked && (isThemedCard ? "" : "fill-green-500"))} />}
            <span className="text-xs">Like</span>
          </Button>
          
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      data-no-drag="true"
                      variant={isPreviewMode ? "default" : (isThemedCard ? "outline" : "outline")}
                      size="sm"
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 h-auto transition-all duration-200 hover:scale-105 active:scale-95 shadow-md",
                        isPreviewMode ? lockedButtonClasses : 
                        isThemedCard ? "action-button-themed" :
                        "bg-white/60 backdrop-blur-sm border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
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
            <DropdownMenuContent align="end" className={cn("w-48 shadow-lg rounded-md", isDarkThemeActive ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-background border") } data-no-drag="true">
              <DropdownMenuItem onClick={() => handleShareOptionClick('copy')} className={cn("cursor-pointer", isDarkThemeActive ? "hover:bg-slate-600" : "hover:bg-muted")} data-no-drag="true">
                <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareOptionClick('email')} className={cn("cursor-pointer", isDarkThemeActive ? "hover:bg-slate-600" : "hover:bg-muted")} data-no-drag="true">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Share via Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareOptionClick('linkedin')} className={cn("cursor-pointer", isDarkThemeActive ? "hover:bg-slate-600" : "hover:bg-muted")} data-no-drag="true">
                <Linkedin className="mr-2 h-4 w-4 text-muted-foreground" /> Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareOptionClick('twitter')} className={cn("cursor-pointer", isDarkThemeActive ? "hover:bg-slate-600" : "hover:bg-muted")} data-no-drag="true">
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
