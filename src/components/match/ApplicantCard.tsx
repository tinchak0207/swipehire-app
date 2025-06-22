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
        'w-full rounded-lg border bg-card shadow-md transition-all duration-200 ease-in-out hover:shadow-lg',
        isFocused
          ? 'border-blue-500 shadow-xl ring-2 ring-blue-500'
          : 'border-slate-200 hover:border-slate-300'
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start space-x-3">
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 rounded-md">
              <AvatarImage
                src={avatarUrl}
                alt={candidate.name}
                data-ai-hint={candidate.dataAiHint || 'person'}
              />
              <AvatarFallback className="rounded-md bg-slate-200 text-slate-600">
                {candidate.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="-bottom-0.5 -right-0.5 absolute h-3 w-3 rounded-full border-2 border-card bg-green-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle
                  className="truncate font-semibold text-base text-slate-800 leading-tight"
                  title={candidate.name}
                >
                  {candidate.name}
                </CardTitle>
                <CardDescription
                  className="truncate text-blue-600 text-xs leading-tight"
                  title={candidate.role}
                >
                  {candidate.role}
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'flex h-6 shrink-0 items-center px-2 py-0.5 font-medium text-xs',
                  timeRemainingDetails.colorClasses
                )}
              >
                <Clock className={cn('mr-1 h-3 w-3', timeRemainingDetails.iconColor)} />
                {timeRemainingDetails.text}
              </Badge>
            </div>
            {locationAndExperience.length > 0 && (
              <p className="mt-0.5 flex items-center truncate text-slate-500 text-xs">
                <MapPin className="mr-1 h-3 w-3 shrink-0 text-slate-400" />{' '}
                {locationAndExperience.join(' • ')}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="mb-0.5 flex items-center justify-between text-slate-500 text-xs">
            <span className="flex items-center font-medium">
              <BarChart3 className="mr-1 h-3.5 w-3.5 text-slate-400" />
              Profile Strength
            </span>
            <span className="font-semibold text-blue-600 text-sm">
              {candidate.profileStrength || 0}%
            </span>
          </div>
          <Progress
            value={candidate.profileStrength || 0}
            className="h-1.5 bg-slate-200 from-purple-400 to-blue-500 [&>div]:bg-gradient-to-r"
          />
        </div>

        {candidate.skills && candidate.skills.length > 0 && (
          <div>
            <p className="mb-1 font-medium text-slate-500 text-xs">Top Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.slice(0, 3).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-slate-100 px-1.5 py-0.5 font-normal text-slate-700 text-xs"
                >
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 3 && (
                <Badge
                  variant="outline"
                  className="border-slate-300 px-1.5 py-0.5 font-normal text-slate-500 text-xs"
                >
                  +{candidate.skills.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        <p className="pt-1 text-slate-500 text-xs">
          Applied: {formattedApplicationTime} for {jobOpeningTitle || 'general interest'}
        </p>
      </CardContent>
      <CardFooter className="grid grid-cols-4 gap-2 border-t bg-slate-50 p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRejectApplicant(match)}
          className="h-9 border-red-300 py-2 font-medium text-red-600 text-xs hover:border-red-400 hover:bg-red-100"
        >
          <UserX className="mr-1.5 h-3.5 w-3.5" /> Reject
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewProfile}
          className="h-9 border-slate-300 py-2 font-medium text-xs hover:bg-slate-100"
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" /> View
        </Button>
        <Button
          onClick={() => onInviteToInterview(match)}
          size="sm"
          className="h-9 bg-green-600 py-2 font-medium text-white text-xs hover:bg-green-700"
        >
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Invite
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onArchiveMatch(match._id)}
          className="h-9 border-slate-300 py-2 font-medium text-slate-600 text-xs hover:border-slate-400 hover:bg-slate-100"
        >
          <Archive className="mr-1.5 h-3.5 w-3.5" /> Archive
        </Button>
      </CardFooter>
    </Card>
  );
}
