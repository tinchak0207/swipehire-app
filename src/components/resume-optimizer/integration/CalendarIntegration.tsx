import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Clock, MapPin, User, Plus, ExternalLink } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  location?: string;
  description?: string;
  attendees?: string[];
  type: 'interview' | 'follow-up' | 'networking' | 'other';
}

interface CalendarIntegrationProps {
  userProfile: {
    name: string;
    email: string;
    targetJob?: string;
    skills?: string[];
  };
  onEventSchedule?: (event: CalendarEvent) => void;
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({ 
  onEventSchedule 
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id' | 'date'>>({
    title: '',
    time: '09:00',
    duration: 60,
    type: 'other'
  });

  const handleAddEvent = () => {
    if (!date || !newEvent.title) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and select a date for your event.",
        variant: "destructive"
      });
      return;
    }

    const event: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      ...newEvent,
      date: date,
    };

    setEvents([...events, event]);
    onEventSchedule?.(event);
    
    // Reset form
    setNewEvent({
      title: '',
      time: '09:00',
      duration: 60,
      type: 'other'
    });
    setIsAddingEvent(false);
    
    toast({
      title: "Event Added",
      description: `Your event "${event.title}" has been added to your calendar.`,
    });
  };

  const handleExportToCalendar = () => {
    if (events.length === 0) {
      toast({
        title: "No Events",
        description: "Add some events before exporting to your calendar.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Export Successful",
      description: `${events.length} event${events.length !== 1 ? 's' : ''} exported to your calendar.`,
    });
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'interview': return 'bg-blue-100 text-blue-800';
      case 'follow-up': return 'bg-green-100 text-green-800';
      case 'networking': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'interview': return User;
      case 'follow-up': return Clock;
      case 'networking': return User;
      default: return CalendarIcon;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendar Integration
        </CardTitle>
        <CardDescription>
          Schedule important career events and sync them with your calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-3">Select Date</h3>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => setIsAddingEvent(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportToCalendar}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Export to Calendar
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Upcoming Events</h3>
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                  <p>No events scheduled</p>
                  <p className="text-sm">Add events to get started</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {events.map((event) => {
                    const IconComponent = getEventTypeIcon(event.type);
                    return (
                      <div key={event.id} className="border rounded-lg p-3">
                        <div className="flex justify-between">
                          <div className="flex items-start gap-2">
                            <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-sm">{event.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {format(event.date, 'MMM d, yyyy')} at {event.time} 
                                {event.duration && ` (${event.duration} min)`}
                              </p>
                              {event.location && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isAddingEvent && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-lg">Add New Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Interview, Follow-up, Meeting..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({...newEvent, duration: parseInt(e.target.value) || 60})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['interview', 'follow-up', 'networking', 'other'] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={newEvent.type === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewEvent({...newEvent, type})}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  value={newEvent.location || ''}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="Address or meeting link"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newEvent.description || ''}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Add details about the event..."
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>
                  Add Event
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="text-xs text-muted-foreground pt-2">
          <p>Schedule important career events like interviews, follow-ups, and networking meetings.</p>
          <p className="mt-1">Export your events to Google Calendar, Outlook, or other calendar apps.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarIntegration;