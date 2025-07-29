'use client';

import { format } from 'date-fns';
import { Archive, BarChart3, CheckCircle, Clock, Eye, MapPin, UserX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { Candidate, Company, Match } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ApplicantCardProps {
  match: Match & { candidate: Candidate; company: Company };
  onInviteToInterview: (match: Match) => void;
  onRejectApplicant: (match: Match) => void;
  onArchiveMatch: (matchId: string) => void; // New prop for archiving
  isFocused?: boolean;
}

export function ApplicantCard({
  match,
  onInviteToInterview,
  onRejectApplicant,
  onArchiveMatch,
  isFocused,
}: ApplicantCardProps) {
  const { candidate, applicationTimestamp, jobOpeningTitle } = match;
  const { toast } = useToast();

  const calculateTimeRemaining = () => {
    if (!applicationTimestamp)
      return { text: 'N/A', colorClasses: 'bg-gray-100 text-gray-600', iconColor: 'text-gray-400' };
    const appliedDate = new Date(applicationTimestamp);
    const dueDate = new Date(appliedDate.getTime() + 72 * 60 * 60 * 1000); // 72 hours SLA
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return {
        text: 'Overdue',
        colorClasses: 'bg-red-100 text-red-700 border-red-300',
        iconColor: 'text-red-600',
      };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1)
      return {
        text: `~${Math.floor(diffMs / (1000 * 60))}m left`,
        colorClasses: 'bg-red-100 text-red-700 border-red-300',
        iconColor: 'text-red-600',
      };
    if (diffHours < 6)
      return {
        text: `~${diffHours}h left`,
        colorClasses: 'bg-orange-100 text-orange-700 border-orange-300',
        iconColor: 'text-orange-600',
      };
    if (diffHours < 24)
      return {
        text: `~${diffHours}h left`,
        colorClasses: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        iconColor: 'text-yellow-600',
      };
    return {
      text: `~${Math.floor(diffHours / 24)}d ${diffHours % 24}h left`,
      colorClasses: 'bg-green-100 text-green-700 border-green-300',
      iconColor: 'text-green-600',
    };
  };

  const timeRemainingDetails = calculateTimeRemaining();
  const formattedApplicationTime = applicationTimestamp
    ? format(new Date(applicationTimestamp), 'yyyy/M/d HH:mm')
    : 'N/A';

  const handleViewProfile = () => {
    toast({
      title: 'View Resume',
      description: `Conceptual: Navigating to ${candidate.name}'s full profile.`,
      duration: 3000,
    });
  };

  const locationAndExperience = [];
  if (candidate.location) locationAndExperience.push(candidate.location);
  if (candidate.workExperienceLevel && candidate.workExperienceLevel !== 'unspecified') {
    const expLabel = candidate.workExperienceLevel.replace(/_/g, ' ');
    locationAndExperience.push(expLabel.charAt(0).toUpperCase() + expLabel.slice(1));
  }

  const avatarUrl =
    candidate.avatarUrl || `https://placehold.co/40x40.png?text=${candidate.name.charAt(0)}`;

  return (
    <Card
      className={cn(
        'flex h-full w-full flex-col rounded-xl border bg-white shadow-sm transition-all duration-200 ease-in-out hover:shadow-md',
        isFocused
          ? 'border-blue-500 ring-2 ring-blue-100'
          : 'border-slate-200 hover:border-slate-300'
      )}
    >
      <CardContent className="flex flex-col justify-between flex-grow p-4 space-y-4">
        {/* Header Section - Avatar, Name, and Time Badge */}
        <div className="flex items-center space-x-3">
          <div className="relative shrink-0">
            <Avatar className="h-12 w-12 rounded-xl border-2 border-slate-100">
              <AvatarImage
                src={avatarUrl}
                alt={candidate.name}
                data-ai-hint={candidate.dataAiHint || 'person'}
                className="object-cover"
              />
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold text-lg">
                {candidate.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="-bottom-1 -right-1 absolute h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle
                  className="truncate font-bold text-lg text-slate-800 leading-tight"
                  title={candidate.name}
                >
                  {candidate.name}
                </CardTitle>
                <CardDescription
                  className="mt-1 truncate text-blue-600 text-sm font-medium leading-tight"
                  title={candidate.role}
                >
                  {candidate.role}
                </CardDescription>
                {locationAndExperience.length > 0 && (
                  <p className="mt-2 flex items-center truncate text-slate-500 text-sm">
                    <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {locationAndExperience.join(' • ')}
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'flex h-7 shrink-0 items-center rounded-full px-3 py-1 font-semibold text-xs whitespace-nowrap',
                  timeRemainingDetails.colorClasses
                )}
              >
                <Clock className={cn('mr-1.5 h-3.5 w-3.5', timeRemainingDetails.iconColor)} />
                {timeRemainingDetails.text}
              </Badge>
            </div>
          </div>
        </div>

        {/* Profile Strength Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center font-semibold text-slate-700 text-sm">
              <BarChart3 className="mr-2 h-4 w-4 text-slate-500" />
              Profile Strength
            </span>
            <span className="font-bold text-blue-600 text-base">
              {candidate.profileStrength || 0}%
            </span>
          </div>
          <Progress
            value={candidate.profileStrength || 0}
            className="h-2.5 bg-slate-200 from-blue-400 to-blue-600 [&>div]:bg-gradient-to-r [&>div]:rounded-full"
          />
        </div>

        {/* Skills Section */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-slate-700 text-sm">Top Skills</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.slice(0, 4).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700 text-sm hover:bg-slate-200 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 4 && (
                <Badge
                  variant="outline"
                  className="rounded-lg border-slate-300 px-2.5 py-1 font-medium text-slate-500 text-sm"
                >
                  +{candidate.skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Application Info Section */}
        <div className="pt-1 border-t border-slate-100">
          <p className="text-slate-600 text-sm leading-relaxed">
            <span className="font-medium">Applied:</span> {formattedApplicationTime}
            <br />
            <span className="font-medium">Position:</span> {jobOpeningTitle || 'General Interest'}
          </p>
        </div>
      </CardContent>

      {/* Action Buttons Footer */}
      <CardFooter className="grid grid-cols-2 gap-3 rounded-b-xl border-t bg-gradient-to-r from-slate-50 to-slate-100 p-3 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRejectApplicant(match)}
            className="h-8 rounded-lg border-red-200 font-medium text-red-600 text-sm hover:border-red-300 hover:bg-red-50 transition-all"
          >
            <UserX className="mr-1.5 h-4 w-4" />
            Reject
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewProfile}
            className="h-8 rounded-lg border-slate-300 font-medium text-slate-600 text-sm hover:border-slate-400 hover:bg-slate-100 transition-all"
          >
            <Eye className="mr-1.5 h-4 w-4" />
            View
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onInviteToInterview(match)}
            size="sm"
            className="h-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 font-semibold text-white text-sm hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all"
          >
            <CheckCircle className="mr-1.5 h-4 w-4" />
            Invite
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onArchiveMatch(match._id)}
            className="h-8 rounded-lg border-slate-300 font-medium text-slate-600 text-sm hover:border-slate-400 hover:bg-slate-100 transition-all"
          >
            <Archive className="mr-1.5 h-4 w-4" />
            Archive
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
