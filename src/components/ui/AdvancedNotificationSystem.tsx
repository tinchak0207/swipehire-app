'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  Archive,
  Bell,
  Check,
  CheckCircle,
  Clock,
  Filter,
  Info,
  MoreHorizontal,
  Settings,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

/**
 * TypeScript interfaces for notification system
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'system'
  | 'message'
  | 'reminder';
export type NotificationStatus = 'unread' | 'read' | 'archived' | 'dismissed';

export interface NotificationAction {
  readonly id: string;
  readonly label: string;
  readonly variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  readonly onClick: () => void;
  readonly disabled?: boolean;
}

export interface Notification {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type: NotificationType;
  readonly priority: NotificationPriority;
  readonly status: NotificationStatus;
  readonly timestamp: Date;
  readonly expiresAt?: Date;
  readonly actions?: readonly NotificationAction[];
  readonly metadata?: Record<string, unknown>;
  readonly avatar?: string;
  readonly groupId?: string;
  readonly persistent?: boolean;
  readonly soundEnabled?: boolean;
}

export interface NotificationSettings {
  readonly soundEnabled: boolean;
  readonly desktopEnabled: boolean;
  readonly emailEnabled: boolean;
  readonly pushEnabled: boolean;
  readonly quietHours: {
    readonly enabled: boolean;
    readonly start: string;
    readonly end: string;
  };
  readonly typeSettings: Record<
    NotificationType,
    {
      readonly enabled: boolean;
      readonly sound: boolean;
      readonly desktop: boolean;
    }
  >;
}

export interface AdvancedNotificationSystemProps {
  readonly notifications: readonly Notification[];
  readonly settings: NotificationSettings;
  readonly onNotificationAction: (notificationId: string, actionId: string) => void;
  readonly onNotificationStatusChange: (notificationId: string, status: NotificationStatus) => void;
  readonly onSettingsChange: (settings: NotificationSettings) => void;
  readonly onMarkAllRead?: () => void;
  readonly onClearAll?: () => void;
  readonly maxDisplayCount?: number;
  readonly groupByType?: boolean;
  readonly showSettings?: boolean;
  readonly className?: string;
  readonly position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Notification icon mapping
 */
const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  system: Settings,
  message: Bell,
  reminder: Clock,
};

/**
 * Priority color mapping
 */
const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: 'text-muted-foreground',
  medium: 'text-blue-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

/**
 * Individual notification component
 */
const NotificationItem: React.FC<{
  notification: Notification;
  onAction: (actionId: string) => void;
  onStatusChange: (status: NotificationStatus) => void;
  compact?: boolean;
}> = ({ notification, onAction, onStatusChange, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const Icon = NOTIFICATION_ICONS[notification.type];
  const isUnread = notification.status === 'unread';
  const isExpired = notification.expiresAt && new Date() > notification.expiresAt;

  const handleMarkAsRead = useCallback(() => {
    if (isUnread) {
      onStatusChange('read');
    }
  }, [isUnread, onStatusChange, notification.title]);

  const handleArchive = useCallback(() => {
    onStatusChange('archived');
  }, [onStatusChange, notification.title]);

  const handleDismiss = useCallback(() => {
    onStatusChange('dismissed');
  }, [onStatusChange, notification.title]);

  const handleAction = useCallback(
    (actionId: string) => {
      onAction(actionId);
    },
    [onAction, notification.title]
  );

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        isUnread && 'border-l-4 border-l-primary bg-primary/5',
        isExpired && 'opacity-60',
        compact && 'p-2'
      )}
    >
      <CardContent className={cn('p-4', compact && 'p-2')}>
        <div className="flex items-start gap-3">
          {/* Icon and Priority Indicator */}
          <div className="relative flex-shrink-0">
            <Icon className={cn('h-5 w-5', PRIORITY_COLORS[notification.priority])} />
            {notification.priority === 'urgent' && (
              <div className="-top-1 -right-1 absolute h-2 w-2 animate-pulse rounded-full bg-red-500" />
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className={cn('truncate font-medium text-sm', isUnread && 'font-semibold')}>
                  {notification.title}
                </h4>
                <p
                  className={cn(
                    'mt-1 text-muted-foreground text-sm',
                    compact ? 'line-clamp-1' : 'line-clamp-2',
                    isExpanded && 'line-clamp-none'
                  )}
                >
                  {notification.message}
                </p>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isUnread && (
                    <DropdownMenuItem onClick={handleMarkAsRead}>
                      <Check className="mr-2 h-4 w-4" />
                      Mark as read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDismiss} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Dismiss
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Metadata */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {notification.type}
                </Badge>
                {notification.priority !== 'medium' && (
                  <Badge
                    variant={notification.priority === 'urgent' ? 'destructive' : 'outline'}
                    className="text-xs"
                  >
                    {notification.priority}
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
              </span>
            </div>

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex gap-2">
                {notification.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => handleAction(action.id)}
                    disabled={action.disabled}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Expand/Collapse for long messages */}
            {!compact && notification.message.length > 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 h-auto p-0 text-xs"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Main Advanced Notification System Component
 */
export const AdvancedNotificationSystem: React.FC<AdvancedNotificationSystemProps> = ({
  notifications,
  onNotificationAction,
  onNotificationStatusChange,
  onMarkAllRead,
  maxDisplayCount = 50,
  className,
  position = 'top-right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority'>('timestamp');

  const panelRef = React.useRef<HTMLDivElement>(null);

  // Filter and sort notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter((n) => n.status === 'unread');
    } else if (activeTab === 'archived') {
      filtered = filtered.filter((n) => n.status === 'archived');
    } else if (activeTab === 'all') {
      filtered = filtered.filter((n) => n.status !== 'dismissed');
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((n) => n.type === filterType);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    return filtered.slice(0, maxDisplayCount);
  }, [notifications, activeTab, filterType, sortBy, maxDisplayCount]);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.status === 'unread').length;
  }, [notifications]);

  const handleNotificationAction = useCallback(
    (notificationId: string, actionId: string) => {
      onNotificationAction(notificationId, actionId);
    },
    [onNotificationAction]
  );

  const handleNotificationStatusChange = useCallback(
    (notificationId: string, status: NotificationStatus) => {
      onNotificationStatusChange(notificationId, status);
    },
    [onNotificationStatusChange]
  );

  const handleMarkAllRead = useCallback(() => {
    onMarkAllRead?.();
  }, [onMarkAllRead]);

  const togglePanel = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <div className={cn('relative', className)}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePanel}
        className="relative"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="-top-2 -right-2 absolute flex h-5 w-5 items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card
          ref={panelRef}
          className={cn(
            'absolute z-50 max-h-[600px] w-96 border shadow-lg',
            position === 'top-right' && 'top-full right-0 mt-2',
            position === 'top-left' && 'top-full left-0 mt-2',
            position === 'bottom-right' && 'right-0 bottom-full mb-2',
            position === 'bottom-left' && 'bottom-full left-0 mb-2'
          )}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {onMarkAllRead && unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                    <Check className="mr-1 h-4 w-4" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={togglePanel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-2 flex items-center gap-2">
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as NotificationType | 'all')}
              >
                <SelectTrigger className="w-32">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Object.keys(NOTIFICATION_ICONS).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'timestamp' | 'priority')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timestamp">By time</SelectItem>
                  <SelectItem value="priority">By priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All ({notifications.filter((n) => n.status !== 'dismissed').length})
                </TabsTrigger>
                <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                <TabsTrigger value="archived">
                  Archived ({notifications.filter((n) => n.status === 'archived').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <ScrollArea className="h-96">
                  <div className="space-y-3 p-4">
                    {filteredNotifications.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      filteredNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onAction={(actionId) =>
                            handleNotificationAction(notification.id, actionId)
                          }
                          onStatusChange={(status) =>
                            handleNotificationStatusChange(notification.id, status)
                          }
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedNotificationSystem;
