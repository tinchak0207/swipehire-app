'use client';

import { formatDistanceToNowStrict } from 'date-fns';
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CheckCircle,
  Gift,
  Info,
  MessageCircle,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { NotificationItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NotificationHistoryListProps {
  notifications: NotificationItem[];
  onMarkAsRead: (notificationId: string) => void;
  onClearNotification: (notificationId: string) => void;
}

const getNotificationIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'offer_extended':
      return <Gift className="h-5 w-5 text-green-500" />;
    case 'new_message':
      return <MessageCircle className="h-5 w-5 text-blue-500" />;
    case 'interview_scheduled':
      return <Briefcase className="h-5 w-5 text-purple-500" />;
    case 'application_viewed':
      return <Info className="h-5 w-5 text-sky-500" />;
    case 'general_alert':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'system_update':
      return <Bell className="h-5 w-5 text-indigo-500" />;
    case 'feedback_request':
      return <Bell className="h-5 w-5 text-gray-500" />;
    default:
      return <Info className="h-5 w-5 text-gray-500" />;
  }
};

export function NotificationHistoryList({
  notifications,
  onMarkAsRead,
  onClearNotification,
}: NotificationHistoryListProps) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="py-8 text-center">
        <Bell className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">You have no notifications yet.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-1">
      <div className="space-y-2 p-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'flex items-start space-x-3 rounded-md p-3 transition-colors hover:bg-muted/50',
              notification.read ? 'bg-card' : 'bg-primary/5',
              notification.isUrgent && !notification.read && 'border-destructive border-l-4'
            )}
          >
            <div className="mt-1 shrink-0">{getNotificationIcon(notification.type)}</div>
            <div className="min-w-0 flex-grow">
              <div className="flex items-start justify-between">
                <h4
                  className={cn(
                    'font-semibold text-sm',
                    notification.isUrgent && !notification.read && 'text-destructive',
                    !notification.read && 'text-primary'
                  )}
                >
                  {notification.title}
                </h4>
                {!notification.read && (
                  <Badge variant="destructive" className="ml-2 shrink-0 text-xs">
                    New
                  </Badge>
                )}
              </div>
              <p
                className="mt-0.5 truncate text-muted-foreground text-xs"
                title={notification.message}
              >
                {notification.message}
              </p>
              <p className="mt-1 text-muted-foreground/80 text-xs">
                {formatDistanceToNowStrict(new Date(notification.timestamp), { addSuffix: true })}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1 sm:flex-row">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-blue-600 text-xs hover:bg-blue-100 hover:text-blue-700"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <CheckCircle className="mr-1 h-3.5 w-3.5" /> Mark Read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-red-600 text-xs hover:bg-red-100 hover:text-red-700"
                onClick={() => onClearNotification(notification.id)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
