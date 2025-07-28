'use client';

import {
  BarChart3,
  Briefcase,
  Eye,
  Linkedin,
  Link as LinkIcon,
  Lock,
  Mail,
  MapPin,
  Share2,
  Star,
  ThumbsDown,
  ThumbsUp,
  Twitter as TwitterIcon,
  UserCircle as UserCircleIcon,
} from 'lucide-react';
import NextImage from 'next/image';
import type React from 'react';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import type { Candidate } from '@/lib/types';
import { cn } from '@/lib/utils';

const envBackendUrl = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'];
const CUSTOM_BACKEND_URL =
  envBackendUrl && envBackendUrl.trim() !== '' ? envBackendUrl : 'http://localhost:5000';

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
    const currentCount = Number.parseInt(localStorage.getItem(`analytics_${key}`) || '0', 10);
    localStorage.setItem(`analytics_${key}`, (currentCount + 1).toString());
  }
};

const getThemeClass = (themeKey?: string) => {
  if (!themeKey || themeKey === 'default') return '';
  return `card-theme-${themeKey}`;
};

const ProfileCard = ({
  candidate,
  onAction,
  isLiked,
  isGuestMode,
  isPreviewMode,
  className,
}: ProfileCardProps) => {
  const { toast } = useToast();
  const cardRootRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const themeClass = getThemeClass(candidate.cardTheme);
  const isThemedCard = !!(candidate.cardTheme && candidate.cardTheme !== 'default');
  const isDarkThemeActive =
    themeClass &&
    (themeClass.includes('ocean') ||
      themeClass.includes('sunset') ||
      themeClass.includes('forest') ||
      themeClass.includes('professional-dark'));

  const avatarDisplayUrl = candidate.avatarUrl
    ? candidate.avatarUrl.startsWith('/uploads/')
      ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}`
      : candidate.avatarUrl
    : `https://placehold.co/96x96.png?text=${encodeURIComponent(candidate.name?.[0] || 'P')}`;

  const needsUnoptimized =
    avatarDisplayUrl.startsWith(CUSTOM_BACKEND_URL) ||
    avatarDisplayUrl.startsWith('http://localhost');

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
    if (
      targetElement.closest(
        'video[controls], button, a, [data-no-drag="true"], .no-swipe-area, [role="dialog"], [role="menu"], input, textarea, [role="listbox"], [role="option"], [data-radix-scroll-area-viewport]'
      )
    ) {
      if (targetElement.tagName === 'VIDEO' && targetElement.hasAttribute('controls')) {
        const video = targetElement as HTMLVideoElement;
        const rect = video.getBoundingClientRect();
        if (e.clientY > rect.bottom - 40) {
          return;
        }
      } else if (
        targetElement.closest(
          'button, a, [data-no-drag="true"], [role="dialog"], [role="menu"], input, textarea, [role="listbox"], [role="option"], [data-radix-scroll-area-viewport]'
        )
      ) {
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

  const handleMouseUpOrLeave = (_e: React.MouseEvent<HTMLDivElement>) => {
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
      cardRootRef.current.style.cursor = isGuestMode || isPreviewMode ? 'default' : 'grab';
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
      toast({
        title: 'Feature Locked',
        description: 'Sign in to share profiles.',
        variant: 'default',
      });
      return;
    }
    const profileUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/candidate/${candidate.id}`
        : `https://swipehire-app.com/candidate/${candidate.id}`;
    const shareText = `Check out this profile on SwipeHire: ${candidate.name} - ${candidate.role}. Visit ${profileUrl}`;
    const emailSubject = `Interesting Profile on SwipeHire: ${candidate.name}`;
    const emailBody = `I found this profile on SwipeHire and thought you might be interested:\n\nName: ${candidate.name}\nRole: ${candidate.role}\n\nView more at: ${profileUrl}\n\nShared from SwipeHire.`;

    switch (platform) {
      case 'copy':
        navigator.clipboard
          .writeText(profileUrl)
          .then(() =>
            toast({ title: 'Link Copied!', description: 'Profile link copied to clipboard.' })
          )
          .catch(() =>
            toast({
              title: 'Copy Failed',
              description: 'Could not copy link.',
              variant: 'destructive',
            })
          );
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&title=${encodeURIComponent(shareText)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`,
          '_blank',
          'noopener,noreferrer'
        );
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
      if (candidate.cardTheme === 'lavender')
        return 'bg-purple-200/70 text-purple-800 border-purple-300 hover:bg-purple-300/70';
      return 'bg-white/20 text-white border-white/30 hover:bg-white/30';
    }
    return 'bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200';
  };

  const lockedButtonClasses =
    'bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-200 hover:border-rose-300 cursor-not-allowed';

  return (
    <div
      ref={cardRootRef}
      className={cn(
        'mx-auto w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl',
        themeClass || 'bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100',
        className
      )}
      onMouseDown={!isPreviewMode ? handleMouseDown : undefined}
      onMouseMove={!isPreviewMode ? handleMouseMove : undefined}
      onMouseUp={!isPreviewMode ? handleMouseUpOrLeave : undefined}
      onMouseLeave={!isPreviewMode ? handleMouseUpOrLeave : undefined}
      style={{
        cursor: isGuestMode || isPreviewMode ? 'default' : isDragging ? 'grabbing' : 'grab',
        transform: getCardTransform(),
        transition: isDragging
          ? 'none'
          : 'transform 0.3s ease-out, box-shadow 0.3s ease-out, scale 0.3s ease-out',
      }}
    >
      <div
        className={cn(
          'relative pt-8 pb-6',
          isThemedCard
            ? isDarkThemeActive
              ? 'card-header-themed'
              : 'card-header-themed'
            : 'bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500'
        )}
      >
        {!isThemedCard && <div className="absolute inset-0 bg-black/10" />}
        <div className="relative flex justify-center">
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-full shadow-xl ring-4 ring-white/50">
              {avatarDisplayUrl !==
              `https://placehold.co/96x96.png?text=${encodeURIComponent(candidate.name?.[0] || 'P')}` ? (
                <NextImage
                  src={avatarDisplayUrl}
                  alt={candidate.name || 'Candidate Avatar'}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  data-ai-hint={candidate.dataAiHint || 'person portrait'}
                  unoptimized={needsUnoptimized}
                  priority
                />
              ) : (
                <UserCircleIcon className="h-full w-full bg-gray-100 p-1 text-gray-300" />
              )}
            </div>
            {candidate.isUnderestimatedTalent && !isPreviewMode ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="-bottom-1 -right-1 absolute flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 shadow-md ring-2 ring-white">
                      <Star className="h-4 w-4 fill-yellow-700 text-yellow-800" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="rounded-md bg-black p-2 text-white text-xs shadow-lg"
                  >
                    <p>{candidate.underestimatedReasoning || 'Hidden Gem!'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div
                className={cn(
                  '-bottom-1 -right-1 absolute h-6 w-6 rounded-full shadow-md ring-2 ring-white',
                  isPreviewMode ? 'bg-gray-300' : 'bg-green-400'
                )}
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 py-6">
        <div className="space-y-2 text-center">
          <h2
            className={cn(
              'font-bold text-2xl tracking-tight',
              isPreviewMode && !candidate.name
                ? 'text-gray-300'
                : isDarkThemeActive
                  ? 'text-white'
                  : 'text-gray-800'
            )}
          >
            {isPreviewMode && !candidate.name ? 'Your Name (Preview)' : candidate.name || 'N/A'}
          </h2>
          <p
            className={cn(
              'font-medium text-sm uppercase tracking-wide',
              isPreviewMode && !candidate.role
                ? 'text-gray-300'
                : isDarkThemeActive
                  ? candidate.cardTheme === 'professional-dark'
                    ? 'text-sky-400'
                    : 'text-indigo-300'
                  : 'text-indigo-600'
            )}
          >
            {isPreviewMode && !candidate.role
              ? 'Your Role (Preview)'
              : candidate.role || 'Role not specified'}
          </p>
        </div>

        <div className="space-y-3">
          {(candidate.location || isPreviewMode) && (
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 shadow-sm',
                isDarkThemeActive
                  ? 'border-white/20 bg-white/10 backdrop-blur-sm'
                  : 'border-white/20 bg-white/60 backdrop-blur-sm'
              )}
            >
              <MapPin
                className={cn(
                  'h-4 w-4 shrink-0',
                  isDarkThemeActive ? 'text-indigo-300' : 'text-indigo-500'
                )}
              />
              <span
                className={cn(
                  'truncate font-medium text-sm',
                  isPreviewMode && !candidate.location
                    ? 'text-gray-400 italic'
                    : isDarkThemeActive
                      ? 'text-gray-200'
                      : 'text-gray-700'
                )}
              >
                {candidate.location ||
                  (isPreviewMode ? 'Your Location (Preview)' : 'Not specified')}
              </span>
            </div>
          )}

          {((candidate.workExperienceLevel && candidate.workExperienceLevel !== 'unspecified') ||
            isPreviewMode) && (
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 shadow-sm',
                isDarkThemeActive
                  ? 'border-white/20 bg-white/10 backdrop-blur-sm'
                  : 'border-white/20 bg-white/60 backdrop-blur-sm'
              )}
            >
              <Briefcase
                className={cn(
                  'h-4 w-4 shrink-0',
                  isDarkThemeActive ? 'text-indigo-300' : 'text-indigo-500'
                )}
              />
              <span
                className={cn(
                  'truncate font-medium text-sm',
                  isPreviewMode &&
                    (!candidate.workExperienceLevel ||
                      candidate.workExperienceLevel === 'unspecified')
                    ? 'text-gray-400 italic'
                    : isDarkThemeActive
                      ? 'text-gray-200'
                      : 'text-gray-700'
                )}
              >
                {candidate.workExperienceLevel && candidate.workExperienceLevel !== 'unspecified'
                  ? candidate.workExperienceLevel
                  : isPreviewMode
                    ? 'Experience Level (Preview)'
                    : 'Not specified'}
              </span>
            </div>
          )}

          {(candidate.profileStrength !== undefined || isPreviewMode) && (
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 shadow-sm',
                isDarkThemeActive
                  ? 'border-white/20 bg-white/10 backdrop-blur-sm'
                  : 'border-white/20 bg-white/60 backdrop-blur-sm'
              )}
            >
              <BarChart3
                className={cn(
                  'h-4 w-4 shrink-0',
                  isDarkThemeActive ? 'text-indigo-300' : 'text-indigo-500'
                )}
              />
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      'font-medium text-sm',
                      isPreviewMode && candidate.profileStrength === undefined
                        ? 'text-gray-400 italic'
                        : isDarkThemeActive
                          ? 'text-gray-200'
                          : 'text-gray-700'
                    )}
                  >
                    Profile Strength
                  </span>
                  <span
                    className={cn(
                      'font-bold text-sm',
                      isDarkThemeActive ? 'text-indigo-300' : 'text-indigo-600'
                    )}
                  >
                    {candidate.profileStrength ?? (isPreviewMode ? 80 : 0)}%
                  </span>
                </div>
                <div
                  className={cn(
                    'h-2 w-full rounded-full',
                    isDarkThemeActive ? 'bg-gray-600' : 'bg-gray-200'
                  )}
                >
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-500',
                      isDarkThemeActive
                        ? 'progress-bar-themed'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    )}
                    style={{ width: `${candidate.profileStrength ?? (isPreviewMode ? 80 : 0)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {(candidate.experienceSummary || isPreviewMode) && (
          <div
            className={cn(
              'rounded-xl border p-4 shadow-sm',
              isDarkThemeActive
                ? 'border-white/10 bg-white/5 backdrop-blur-sm'
                : 'border-white/20 bg-white/40 backdrop-blur-sm'
            )}
          >
            <p
              className={cn(
                'line-clamp-3 text-sm leading-relaxed',
                isPreviewMode && !candidate.experienceSummary
                  ? 'text-gray-400 italic'
                  : isDarkThemeActive
                    ? 'text-gray-300'
                    : 'text-gray-600'
              )}
            >
              {candidate.experienceSummary ||
                (isPreviewMode
                  ? 'Your experience summary goes here...'
                  : 'No experience summary provided.')}
            </p>
          </div>
        )}

        {((candidate.skills && candidate.skills.length > 0) || isPreviewMode) && (
          <div className="space-y-3">
            <h3
              className={cn(
                'font-semibold text-sm uppercase tracking-wide',
                isDarkThemeActive ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Top Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {(candidate.skills && candidate.skills.length > 0
                ? candidate.skills.slice(0, 5)
                : isPreviewMode
                  ? ['Example Skill 1', 'Example Skill 2']
                  : []
              ).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className={cn(
                    'shadow-sm transition-all duration-200',
                    isThemedCard ? 'badge-themed-skill' : getSkillBadgeClass(skill)
                  )}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div
          className={cn(
            'no-swipe-area grid gap-2 pt-4',
            isPreviewMode ? 'grid-cols-3' : 'grid-cols-4'
          )}
          data-no-drag="true"
        >
          <Button
            data-no-drag="true"
            variant={isPreviewMode ? 'default' : isThemedCard ? 'outline' : 'outline'}
            size="sm"
            className={cn(
              'flex h-auto flex-col items-center gap-1 p-3 shadow-md transition-all duration-200 hover:scale-105 active:scale-95',
              isPreviewMode
                ? lockedButtonClasses
                : isThemedCard
                  ? 'action-button-pass-themed'
                  : 'border-red-200 bg-white/60 text-red-600 backdrop-blur-sm hover:border-red-300 hover:bg-red-50'
            )}
            onClick={(e) => {
              if (!isPreviewMode) {
                e.stopPropagation();
                onAction(candidate.id, 'pass');
              }
            }}
            disabled={isGuestMode || isPreviewMode}
          >
            {isGuestMode || isPreviewMode ? (
              <Lock className="h-5 w-5" />
            ) : (
              <ThumbsDown className="h-5 w-5" />
            )}
            <span className="text-xs">Pass</span>
          </Button>

          {!isPreviewMode && (
            <Button
              data-no-drag="true"
              variant={isThemedCard ? 'outline' : 'outline'}
              size="sm"
              className={cn(
                'flex h-auto flex-col items-center gap-1 p-3 shadow-md transition-all duration-200 hover:scale-105 active:scale-95',
                isThemedCard
                  ? 'action-button-themed'
                  : 'border-blue-200 bg-white/60 text-blue-600 backdrop-blur-sm hover:border-blue-300 hover:bg-blue-50'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onAction(candidate.id, 'viewProfile');
              }}
            >
              <Eye className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Button>
          )}

          <Button
            data-no-drag="true"
            variant={isPreviewMode ? 'default' : isThemedCard ? 'outline' : 'outline'}
            size="sm"
            className={cn(
              'flex h-auto flex-col items-center gap-1 p-3 shadow-md transition-all duration-200 hover:scale-105 active:scale-95',
              isPreviewMode
                ? lockedButtonClasses
                : cn(
                    isThemedCard
                      ? isLiked
                        ? 'action-button-like-themed liked'
                        : 'action-button-like-themed'
                      : 'border-green-200 bg-white/60 text-green-600 backdrop-blur-sm hover:border-green-300 hover:bg-green-50',
                    isLiked &&
                      !isThemedCard &&
                      'border-green-400 bg-green-100 ring-2 ring-green-500'
                  )
            )}
            onClick={(e) => {
              if (!isPreviewMode) {
                e.stopPropagation();
                onAction(candidate.id, 'like');
              }
            }}
            disabled={isGuestMode || isPreviewMode}
          >
            {isGuestMode || isPreviewMode ? (
              <Lock className="h-5 w-5" />
            ) : (
              <ThumbsUp
                className={cn('h-5 w-5', isLiked && (isThemedCard ? '' : 'fill-green-500'))}
              />
            )}
            <span className="text-xs">Like</span>
          </Button>

          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      data-no-drag="true"
                      variant={isPreviewMode ? 'default' : isThemedCard ? 'outline' : 'outline'}
                      size="sm"
                      className={cn(
                        'flex h-auto flex-col items-center gap-1 p-3 shadow-md transition-all duration-200 hover:scale-105 active:scale-95',
                        isPreviewMode
                          ? lockedButtonClasses
                          : isThemedCard
                            ? 'action-button-themed'
                            : 'border-purple-200 bg-white/60 text-purple-600 backdrop-blur-sm hover:border-purple-300 hover:bg-purple-50'
                      )}
                      disabled={isGuestMode || isPreviewMode}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isGuestMode || isPreviewMode ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        <Share2 className="h-5 w-5" />
                      )}
                      <span className="text-xs">Share</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                {(isGuestMode || isPreviewMode) && (
                  <TooltipContent
                    side="top"
                    className="rounded-md border-red-600 bg-red-500 p-2 text-white shadow-lg"
                  >
                    <p>{isPreviewMode ? 'Share disabled in preview' : 'Sign in to share'}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            {!isPreviewMode && (
              <DropdownMenuContent
                align="end"
                className={cn(
                  'w-48 rounded-md shadow-lg',
                  isDarkThemeActive
                    ? 'border-slate-600 bg-slate-700 text-slate-200'
                    : 'border bg-background'
                )}
                data-no-drag="true"
              >
                <DropdownMenuItem
                  onClick={() => handleShareOptionClick('copy')}
                  className={cn(
                    'cursor-pointer',
                    isDarkThemeActive ? 'hover:bg-slate-600' : 'hover:bg-muted'
                  )}
                  data-no-drag="true"
                >
                  <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleShareOptionClick('email')}
                  className={cn(
                    'cursor-pointer',
                    isDarkThemeActive ? 'hover:bg-slate-600' : 'hover:bg-muted'
                  )}
                  data-no-drag="true"
                >
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Share via Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleShareOptionClick('linkedin')}
                  className={cn(
                    'cursor-pointer',
                    isDarkThemeActive ? 'hover:bg-slate-600' : 'hover:bg-muted'
                  )}
                  data-no-drag="true"
                >
                  <Linkedin className="mr-2 h-4 w-4 text-muted-foreground" /> Share on LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleShareOptionClick('twitter')}
                  className={cn(
                    'cursor-pointer',
                    isDarkThemeActive ? 'hover:bg-slate-600' : 'hover:bg-muted'
                  )}
                  data-no-drag="true"
                >
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
