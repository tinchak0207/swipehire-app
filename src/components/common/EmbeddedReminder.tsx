'use client';

import { AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmbeddedReminderProps {
  message: string;
  isVisible?: boolean;
  className?: string;
  onActionClick?: () => void;
  actionLabel?: string;
}

export function EmbeddedReminder({
  message,
  isVisible = true,
  className,
  onActionClick,
  actionLabel = 'Use AI HR Assistant',
}: EmbeddedReminderProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        // Base container styles matching DashboardSidebar
        'relative rounded-xl border border-orange-200 p-4 mx-3 my-2',
        // Subtle gradient background similar to DashboardSidebar
        'bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50',
        'shadow-md hover:shadow-lg transition-all duration-300',
        // Clean, professional look
        'backdrop-blur-sm',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Content container */}
      <div className="flex items-start gap-3">
        {/* Icon - clean, no animations */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 border border-orange-200">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              {/* Important label matching DashboardSidebar badge style */}
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className="border-orange-200 bg-orange-100 px-2 py-0.5 font-semibold text-orange-700 text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  IMPORTANT REMINDER
                </Badge>
              </div>

              {/* Message text */}
              <p className="text-gray-800 font-medium leading-relaxed text-sm">{message}</p>
            </div>

            {/* Action button matching DashboardSidebar button style */}
            {onActionClick && (
              <Button
                onClick={onActionClick}
                size="sm"
                className={cn(
                  // Clean gradient styling similar to DashboardSidebar
                  'bg-gradient-to-r from-orange-500 to-amber-500',
                  'hover:from-orange-600 hover:to-amber-600',
                  'text-white font-semibold shadow-md',
                  'border border-orange-300',
                  // Subtle hover effects
                  'transition-all duration-200 hover:shadow-lg',
                  'focus:outline-none focus:ring-2 focus:ring-orange-200'
                )}
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Subtle bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-amber-200 to-yellow-200 rounded-b-xl" />
    </div>
  );
}
