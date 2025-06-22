'use client';

import { AlertCircle, Briefcase, CheckCircle, Gift, Info, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NotificationItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TopNotificationBannerProps {
  notification: NotificationItem | null;
  onDismiss: (notificationId: string) => void;
}

const getBannerIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'offer_extended':
      return <Gift className="h-5 w-5" />;
    case 'new_message':
      return <MessageCircle className="h-5 w-5" />;
    case 'interview_scheduled':
      return <Briefcase className="h-5 w-5" />;
    case 'application_viewed':
      return <Info className="h-5 w-5" />;
    case 'general_alert':
      return <AlertCircle className="h-5 w-5" />;
    case 'system_update':
      return <Info className="h-5 w-5" />;
    case 'feedback_request':
      return <CheckCircle className="h-5 w-5" />; // Or a different icon
    default:
      return <Info className="h-5 w-5" />;
  }
};

const getBannerStyles = (type: NotificationItem['type'], isUrgent?: boolean) => {
  if (isUrgent) {
    return 'bg-destructive text-destructive-foreground border-destructive/50';
  }
  switch (type) {
    case 'offer_extended':
      return 'bg-green-600 text-white border-green-700';
    case 'new_message':
      return 'bg-blue-600 text-white border-blue-700';
    case 'system_update':
      return 'bg-indigo-600 text-white border-indigo-700';
    case 'general_alert':
      return 'bg-yellow-500 text-black border-yellow-600';
    default:
      return 'bg-secondary text-secondary-foreground border-border';
  }
};

export function TopNotificationBanner({ notification, onDismiss }: TopNotificationBannerProps) {
  if (!notification) {
    return null;
  }

  const Icon = getBannerIcon(notification.type);
  const bannerStyles = getBannerStyles(notification.type, notification.isUrgent);

  return (
    <div
      className={cn(
        'slide-in-from-top-full fixed top-0 right-0 left-0 z-[90] animate-in p-3 shadow-md duration-500',
        bannerStyles
      )}
      role="alert"
    >
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="shrink-0">{Icon}</div>
          <div className="min-w-0 flex-grow">
            <p className="truncate font-semibold text-sm">{notification.title}</p>
            <p className="truncate text-xs opacity-90">{notification.message}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 shrink-0',
            notification.isUrgent
              ? 'hover:bg-destructive/80'
              : notification.type === 'offer_extended' ||
                  notification.type === 'new_message' ||
                  notification.type === 'system_update'
                ? 'hover:bg-white/20'
                : 'hover:bg-muted/50'
          )}
          onClick={() => onDismiss(notification.id)}
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
