'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, formatDistance } from 'date-fns';
import { AlarmClock, Bell, BriefcaseIcon, Calendar, CheckCircle, Clock, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Types
interface FollowupReminder {
  id: string;
  matchId: string;
  reminderType: 'thank_you' | 'status_inquiry' | 'follow_up' | 'custom';
  scheduledDate: string;
  status: 'pending' | 'completed' | 'snoozed';
  customMessage?: string;
  match: {
    id: string;
    companyName: string;
    jobTitle: string;
    applicationDate: string;
    status: string;
  };
  createdAt: string;
}

interface ReminderTemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  defaultMessage: string;
}

// Follow-up Reminders Service
class FollowupRemindersService {
  private static baseUrl = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

  static async getUserReminders(userId: string, status?: string): Promise<FollowupReminder[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await fetch(
      `${FollowupRemindersService.baseUrl}/api/users/${userId}/followup-reminders?${params}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch reminders');
    }

    const data = await response.json();
    console.log('API Response:', data); // Debug log
    console.log('Reminders data:', data.data); // Debug log
    return data.data;
  }

  static async createReminder(
    userId: string,
    reminder: {
      matchId: string;
      reminderType: string;
      scheduledDate: string;
      customMessage?: string;
    }
  ): Promise<FollowupReminder> {
    const response = await fetch(
      `${FollowupRemindersService.baseUrl}/api/users/${userId}/followup-reminders`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminder),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create reminder');
    }

    const data = await response.json();
    return data.data;
  }

  static async updateReminderStatus(reminderId: string, status: string): Promise<FollowupReminder> {
    const response = await fetch(
      `${FollowupRemindersService.baseUrl}/api/followup-reminders/${reminderId}/status`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update reminder');
    }

    const data = await response.json();
    return data.data;
  }

  static async snoozeReminder(reminderId: string, newDate: string): Promise<FollowupReminder> {
    const response = await fetch(
      `${FollowupRemindersService.baseUrl}/api/followup-reminders/${reminderId}/snooze`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newDate }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to snooze reminder');
    }

    const data = await response.json();
    return data.data;
  }

  static async getReminderTemplates(): Promise<ReminderTemplate[]> {
    const response = await fetch(
      `${FollowupRemindersService.baseUrl}/api/followup-reminders/templates`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch templates');
    }

    const data = await response.json();
    return data.data;
  }
}

// Reminder Card Component
interface ReminderCardProps {
  reminder: FollowupReminder;
  onComplete: (id: string) => void;
  onSnooze: (id: string, newDate: string) => void;
  isUpdating: boolean;
}

function ReminderCard({ reminder, onComplete, onSnooze, isUpdating }: ReminderCardProps) {
  const [snoozeDialogOpen, setSnoozeDialogOpen] = useState(false);
  const [snoozeDate, setSnoozeDate] = useState('');

  // Debug log
  console.log('ReminderCard received reminder:', reminder);
  console.log('Reminder ID:', reminder.id);

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'thank_you':
        return 'Thank You Note';
      case 'status_inquiry':
        return 'Status Inquiry';
      case 'follow_up':
        return 'Follow Up';
      case 'custom':
        return 'Custom Reminder';
      default:
        return type;
    }
  };

  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'thank_you':
        return 'bg-green-100 text-green-800';
      case 'status_inquiry':
        return 'bg-blue-100 text-blue-800';
      case 'follow_up':
        return 'bg-yellow-100 text-yellow-800';
      case 'custom':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'snoozed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const scheduledDate = new Date(reminder.scheduledDate);
  const now = new Date();
  const isOverdue = scheduledDate < now && reminder.status === 'pending';

  // Validate dates before formatting
  const isValidDate = !isNaN(scheduledDate.getTime()) && !isNaN(now.getTime());
  const timeAgo = isValidDate
    ? formatDistance(scheduledDate, now, { addSuffix: true })
    : 'Invalid date';

  const handleSnooze = () => {
    if (snoozeDate) {
      onSnooze(reminder.id, snoozeDate);
      setSnoozeDialogOpen(false);
      setSnoozeDate('');
    }
  };

  return (
    <Card className={`${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getReminderTypeColor(reminder.reminderType)}>
                {getReminderTypeLabel(reminder.reminderType)}
              </Badge>
              <Badge variant="outline" className={getStatusColor(reminder.status)}>
                {reminder.status}
              </Badge>
              {isOverdue && <Badge variant="destructive">Overdue</Badge>}
            </div>
            <CardTitle className="text-lg font-semibold">
              {reminder.match.jobTitle} at {reminder.match.companyName}
            </CardTitle>
            <CardDescription>
              Applied {format(new Date(reminder.match.applicationDate), 'MMM dd, yyyy')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Scheduled Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {reminder.status === 'pending' ? 'Due' : 'Was due'} {timeAgo}
            </span>
          </div>

          {/* Custom Message */}
          {reminder.customMessage && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{reminder.customMessage}</p>
            </div>
          )}

          {/* Actions */}
          {reminder.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                onClick={() => onComplete(reminder.id)}
                disabled={isUpdating}
                size="sm"
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>

              <Dialog open={snoozeDialogOpen} onOpenChange={setSnoozeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isUpdating}>
                    <AlarmClock className="h-4 w-4 mr-2" />
                    Snooze
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Snooze Reminder</DialogTitle>
                    <DialogDescription>
                      Choose a new date and time for this reminder
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="snooze-date">New Date & Time</Label>
                      <input
                        id="snooze-date"
                        type="datetime-local"
                        value={snoozeDate}
                        onChange={(e) => setSnoozeDate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSnooze} disabled={!snoozeDate || isUpdating}>
                        Snooze
                      </Button>
                      <Button variant="outline" onClick={() => setSnoozeDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Create Reminder Dialog
interface CreateReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (reminder: any) => void;
  isCreating: boolean;
}

function CreateReminderDialog({
  open,
  onOpenChange,
  onCreate,
  isCreating,
}: CreateReminderDialogProps) {
  const [formData, setFormData] = useState({
    matchId: '',
    reminderType: '',
    scheduledDate: '',
    customMessage: '',
  });

  // Mock matches data with valid MongoDB ObjectIds - in real app this would come from API
  const mockMatches = [
    { id: '507f1f77bcf86cd799439011', companyName: 'TechCorp', jobTitle: 'Senior Developer' },
    { id: '507f1f77bcf86cd799439012', companyName: 'StartupXYZ', jobTitle: 'Product Manager' },
    { id: '507f1f77bcf86cd799439013', companyName: 'BigTech Inc', jobTitle: 'UX Designer' },
  ];

  const handleSubmit = () => {
    if (formData.matchId && formData.reminderType && formData.scheduledDate) {
      onCreate(formData);
      setFormData({
        matchId: '',
        reminderType: '',
        scheduledDate: '',
        customMessage: '',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Follow-up Reminder</DialogTitle>
          <DialogDescription>
            Set a reminder to follow up on your job applications
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="match">Job Application</Label>
            <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, matchId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a job application" />
              </SelectTrigger>
              <SelectContent>
                {mockMatches.map((match) => (
                  <SelectItem key={match.id} value={match.id}>
                    {match.jobTitle} at {match.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Reminder Type</Label>
            <Select
              onValueChange={(value) => setFormData((prev) => ({ ...prev, reminderType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reminder type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thank_you">Thank You Note</SelectItem>
                <SelectItem value="status_inquiry">Status Inquiry</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="custom">Custom Reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Scheduled Date & Time</Label>
            <input
              id="date"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div>
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a custom note for this reminder..."
              value={formData.customMessage}
              onChange={(e) => setFormData((prev) => ({ ...prev, customMessage: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.matchId || !formData.reminderType || !formData.scheduledDate || isCreating
              }
              className="flex-1"
            >
              Create Reminder
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Follow-up Reminders Component
export default function FollowupRemindersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('pending');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // For now, using a mock userId with valid ObjectId format - in real app this would come from auth context
  const userId = '507f1f77bcf86cd799439014';

  // Queries
  const { data: reminders, isLoading } = useQuery({
    queryKey: ['followup-reminders', activeTab, userId],
    queryFn: () =>
      FollowupRemindersService.getUserReminders(
        userId,
        activeTab === 'all' ? undefined : activeTab
      ),
    staleTime: 2 * 60 * 1000,
  });

  // Mutations
  const createReminderMutation = useMutation({
    mutationFn: (reminderData: any) =>
      FollowupRemindersService.createReminder(userId, reminderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-reminders'] });
      setCreateDialogOpen(false);
      toast({
        title: 'Reminder Created',
        description: 'Your follow-up reminder has been set successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      FollowupRemindersService.updateReminderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-reminders'] });
      toast({
        title: 'Reminder Updated',
        description: 'Reminder status has been updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ id, newDate }: { id: string; newDate: string }) =>
      FollowupRemindersService.snoozeReminder(id, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-reminders'] });
      toast({
        title: 'Reminder Snoozed',
        description: 'Reminder has been rescheduled',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const handleCreateReminder = useCallback(
    (reminderData: any) => {
      // Validate the data before sending
      if (!reminderData.matchId || !reminderData.reminderType || !reminderData.scheduledDate) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      createReminderMutation.mutate(reminderData);
    },
    [createReminderMutation, toast]
  );

  const handleCompleteReminder = useCallback(
    (id: string) => {
      if (!id || id === 'undefined') {
        toast({
          title: 'Error',
          description: 'Invalid reminder ID',
          variant: 'destructive',
        });
        return;
      }
      updateStatusMutation.mutate({ id, status: 'completed' });
    },
    [updateStatusMutation, toast]
  );

  const handleSnoozeReminder = useCallback(
    (id: string, newDate: string) => {
      if (!id || id === 'undefined') {
        toast({
          title: 'Error',
          description: 'Invalid reminder ID',
          variant: 'destructive',
        });
        return;
      }
      snoozeMutation.mutate({ id, newDate });
    },
    [snoozeMutation, toast]
  );

  const pendingCount = reminders?.filter((r) => r.status === 'pending').length || 0;
  const overdueCount =
    reminders?.filter((r) => r.status === 'pending' && new Date(r.scheduledDate) < new Date())
      .length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Follow-up Reminders</h1>
          <p className="text-muted-foreground">
            Stay on top of your job applications with automated follow-up reminders
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Reminder
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Reminders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueCount}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BriefcaseIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reminders?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Reminders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending {pendingCount > 0 && `(${pendingCount})`}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="snoozed">Snoozed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <Card key={`skeleton-${i}`} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reminders?.length ? (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onComplete={handleCompleteReminder}
                  onSnooze={handleSnoozeReminder}
                  isUpdating={updateStatusMutation.isPending || snoozeMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No reminders found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'pending'
                    ? "You don't have any pending reminders. Create one to stay on top of your applications!"
                    : `No ${activeTab} reminders found.`}
                </p>
                {activeTab === 'pending' && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Reminder
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Reminder Dialog */}
      <CreateReminderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateReminder}
        isCreating={createReminderMutation.isPending}
      />
    </div>
  );
}
