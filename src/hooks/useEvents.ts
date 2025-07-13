import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { EventFilters, EventSearchParams, IndustryEvent } from '@/lib/types';
import { EventService } from '@/services/eventService';

// Query key factory
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (params: EventSearchParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  saved: (userId: string) => [...eventKeys.all, 'saved', userId] as const,
  recommended: (userId: string) => [...eventKeys.all, 'recommended', userId] as const,
};

// Hook for fetching paginated events
export function useEvents(params: EventSearchParams = {}) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => EventService.getEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for infinite scroll events
export function useInfiniteEvents(baseParams: EventSearchParams = {}) {
  return useInfiniteQuery({
    queryKey: eventKeys.list(baseParams),
    queryFn: ({ pageParam = 1 }) =>
      EventService.getEvents({
        ...baseParams,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Hook for fetching single event details
export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => EventService.getEvent(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Hook for saving/unsaving events
export function useSaveEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      EventService.saveEvent(eventId, userId),
    onSuccess: (_, { eventId, userId }) => {
      // Update cached event data to mark as saved
      queryClient.setQueriesData({ queryKey: eventKeys.lists() }, (oldData: any) => {
        if (!oldData) return oldData;

        if (oldData.pages) {
          // Handle infinite query data
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              events: page.events.map((event: IndustryEvent) =>
                event.id === eventId ? { ...event, isSaved: true } : event
              ),
            })),
          };
        }
        if (oldData.events) {
          // Handle regular query data
          return {
            ...oldData,
            events: oldData.events.map((event: IndustryEvent) =>
              event.id === eventId ? { ...event, isSaved: true } : event
            ),
          };
        }

        return oldData;
      });

      // Update individual event cache
      queryClient.setQueryData(eventKeys.detail(eventId), (oldEvent: IndustryEvent | undefined) =>
        oldEvent ? { ...oldEvent, isSaved: true } : oldEvent
      );

      // Invalidate saved events
      queryClient.invalidateQueries({ queryKey: eventKeys.saved(userId) });

      toast({
        title: 'Event Saved',
        description: 'Event has been added to your saved events.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save event',
        variant: 'destructive',
      });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      EventService.unsaveEvent(eventId, userId),
    onSuccess: (_, { eventId, userId }) => {
      // Update cached event data to mark as not saved
      queryClient.setQueriesData({ queryKey: eventKeys.lists() }, (oldData: any) => {
        if (!oldData) return oldData;

        if (oldData.pages) {
          // Handle infinite query data
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              events: page.events.map((event: IndustryEvent) =>
                event.id === eventId ? { ...event, isSaved: false } : event
              ),
            })),
          };
        }
        if (oldData.events) {
          // Handle regular query data
          return {
            ...oldData,
            events: oldData.events.map((event: IndustryEvent) =>
              event.id === eventId ? { ...event, isSaved: false } : event
            ),
          };
        }

        return oldData;
      });

      // Update individual event cache
      queryClient.setQueryData(eventKeys.detail(eventId), (oldEvent: IndustryEvent | undefined) =>
        oldEvent ? { ...oldEvent, isSaved: false } : oldEvent
      );

      // Invalidate saved events
      queryClient.invalidateQueries({ queryKey: eventKeys.saved(userId) });

      toast({
        title: 'Event Removed',
        description: 'Event has been removed from your saved events.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove saved event',
        variant: 'destructive',
      });
    },
  });

  return {
    saveEvent: saveMutation.mutate,
    unsaveEvent: unsaveMutation.mutate,
    isSaving: saveMutation.isPending,
    isUnsaving: unsaveMutation.isPending,
  };
}

// Hook for event registration
export function useRegisterEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      EventService.registerForEvent(eventId, userId),
    onSuccess: (_, { eventId }) => {
      // Update cached event data to mark as registered
      queryClient.setQueriesData({ queryKey: eventKeys.lists() }, (oldData: any) => {
        if (!oldData) return oldData;

        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              events: page.events.map((event: IndustryEvent) =>
                event.id === eventId
                  ? { ...event, isRegistered: true, registeredCount: event.registeredCount + 1 }
                  : event
              ),
            })),
          };
        }
        if (oldData.events) {
          return {
            ...oldData,
            events: oldData.events.map((event: IndustryEvent) =>
              event.id === eventId
                ? { ...event, isRegistered: true, registeredCount: event.registeredCount + 1 }
                : event
            ),
          };
        }

        return oldData;
      });

      // Update individual event cache
      queryClient.setQueryData(eventKeys.detail(eventId), (oldEvent: IndustryEvent | undefined) =>
        oldEvent
          ? { ...oldEvent, isRegistered: true, registeredCount: oldEvent.registeredCount + 1 }
          : oldEvent
      );

      toast({
        title: 'Registration Successful',
        description: 'You have been registered for this event.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Failed to register for event',
        variant: 'destructive',
      });
    },
  });
}

// Hook for fetching saved events
export function useSavedEvents(userId: string) {
  return useQuery({
    queryKey: eventKeys.saved(userId),
    queryFn: async () => {
      const response = await EventService.getSavedEvents(userId);
      return response.events || [];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for fetching recommended events
export function useRecommendedEvents(userId: string, limit = 12) {
  return useQuery({
    queryKey: eventKeys.recommended(userId),
    queryFn: async () => {
      const response = await EventService.getRecommendedEvents(userId, limit);
      return response.events || [];
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for managing event filters
export function useEventFilters() {
  const queryClient = useQueryClient();

  const clearCache = () => {
    queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
  };

  return {
    clearCache,
  };
}
