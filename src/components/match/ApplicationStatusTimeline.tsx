
"use client";

import React from 'react';
import type { ApplicationStatusUpdate, ApplicationStage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, differenceInHours, format } from 'date-fns';
import { CheckCircle, Circle, Info, ChevronRight, Send, Briefcase, Eye, ListChecks, MessageCircle, CalendarCheck2, Hourglass, Award, XCircle } from 'lucide-react';

interface ApplicationStatusTimelineProps {
  statusHistory: ApplicationStatusUpdate[];
}

const stageIcons: Record<ApplicationStage, React.ElementType> = {
  [ApplicationStage.SUBMITTED]: Send,
  [ApplicationStage.COMPANY_VIEWED]: Eye,
  [ApplicationStage.SHORTLISTED]: ListChecks,
  [ApplicationStage.INTERVIEW_SCHEDULED]: CalendarCheck2,
  [ApplicationStage.INTERVIEW_COMPLETED]: MessageCircle,
  [ApplicationStage.AWAITING_DECISION]: Hourglass,
  [ApplicationStage.OFFER_EXTENDED]: Award,
  [ApplicationStage.REJECTED]: XCircle,
};

const stageColors: Record<ApplicationStage, string> = {
  [ApplicationStage.SUBMITTED]: 'text-blue-500 border-blue-500',
  [ApplicationStage.COMPANY_VIEWED]: 'text-sky-500 border-sky-500',
  [ApplicationStage.SHORTLISTED]: 'text-teal-500 border-teal-500',
  [ApplicationStage.INTERVIEW_SCHEDULED]: 'text-indigo-500 border-indigo-500',
  [ApplicationStage.INTERVIEW_COMPLETED]: 'text-purple-500 border-purple-500',
  [ApplicationStage.AWAITING_DECISION]: 'text-amber-500 border-amber-500',
  [ApplicationStage.OFFER_EXTENDED]: 'text-green-500 border-green-500',
  [ApplicationStage.REJECTED]: 'text-red-500 border-red-500',
};


export function ApplicationStatusTimeline({ statusHistory }: ApplicationStatusTimelineProps) {
  if (!statusHistory || statusHistory.length === 0) {
    return <p className="text-sm text-muted-foreground">No application status updates yet.</p>;
  }

  const sortedHistory = [...statusHistory].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const currentStageIndex = sortedHistory.length - 1;
  const currentStatusUpdate = sortedHistory[currentStageIndex];

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };
  
  const getFormattedTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  }

  const getSmartNextStepSuggestion = (statusUpdate: ApplicationStatusUpdate, isLatest: boolean): string | undefined => {
    if (!isLatest) return statusUpdate.nextStepSuggestion; // Only apply smart logic to the latest step

    const hoursSinceUpdate = differenceInHours(new Date(), new Date(statusUpdate.timestamp));
    const pendingStages: ApplicationStage[] = [
      ApplicationStage.SUBMITTED,
      ApplicationStage.COMPANY_VIEWED,
      ApplicationStage.INTERVIEW_COMPLETED,
      ApplicationStage.AWAITING_DECISION,
    ];

    if (pendingStages.includes(statusUpdate.stage) && hoursSinceUpdate > 72) {
      return "It's been over 72 hours. Consider sending a polite follow-up.";
    }
    return statusUpdate.nextStepSuggestion || "Await further updates.";
  };

  return (
    <div className="space-y-3 -ml-2 mt-1">
      {sortedHistory.map((update, index) => {
        const Icon = stageIcons[update.stage] || Circle;
        const colorClass = stageColors[update.stage] || 'text-gray-500 border-gray-500';
        const isLastItem = index === sortedHistory.length - 1;
        const isCompleted = index < currentStageIndex;
        const isActive = index === currentStageIndex;
        const smartSuggestion = getSmartNextStepSuggestion(update, isActive);

        return (
          <div key={index} className="flex items-start group">
            <div className="flex flex-col items-center mr-3">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isActive ? `${colorClass} bg-primary/10 scale-110 shadow-md` : isCompleted ? 'bg-green-500 border-green-600 text-white' : 'bg-muted border-border text-muted-foreground',
                  isCompleted && 'group-hover:bg-green-600',
                  isActive && 'group-hover:scale-125'
                )}
              >
                {isCompleted ? <CheckCircle size={18} /> : <Icon size={16} />}
              </div>
              {!isLastItem && (
                <div className={cn(
                    'w-0.5 flex-grow transition-colors duration-300', 
                    isCompleted || isActive ? 'bg-primary/50' : 'bg-border'
                )} style={{ minHeight: '2rem' }}></div>
              )}
            </div>
            <div className={cn("pt-1 pb-3 flex-1 transition-opacity duration-300", isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100')}>
              <p className={cn("font-semibold text-sm", isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground')}>
                {update.stage}
              </p>
              <p className="text-xs text-muted-foreground mb-0.5" title={getFormattedTimestamp(update.timestamp)}>{getTimeAgo(update.timestamp)}</p>
              {update.description && (
                <p className="text-xs text-foreground/80 mb-0.5">{update.description}</p>
              )}
              {isActive && smartSuggestion && (
                 <div className="mt-1 p-1.5 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700 flex items-start">
                   <ChevronRight className="h-3 w-3 mr-1 mt-0.5 shrink-0 text-blue-500" />
                   <span>{smartSuggestion}</span>
                 </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

