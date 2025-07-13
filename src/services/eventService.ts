import type { EventSearchParams, EventsResponse, IndustryEvent } from '@/lib/types';

// For now, use frontend API routes. Later, this will point to the backend
const API_BASE = '/api';

export class EventService {
  static async getEvents(params: EventSearchParams = {}): Promise<EventsResponse> {
    const searchParams = new URLSearchParams();

    // Add search parameters
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    // Add filter parameters
    if (params.filters) {
      const { filters } = params;

      if (filters.eventTypes && filters.eventTypes.size > 0) {
        searchParams.set('eventTypes', Array.from(filters.eventTypes).join(','));
      }

      if (filters.formats && filters.formats.size > 0) {
        searchParams.set('formats', Array.from(filters.formats).join(','));
      }

      if (filters.industries && filters.industries.size > 0) {
        searchParams.set('industries', Array.from(filters.industries).join(','));
      }

      if (filters.cities && filters.cities.size > 0) {
        searchParams.set('cities', Array.from(filters.cities).join(','));
      }

      if (filters.isFree !== undefined) {
        searchParams.set('isFree', filters.isFree.toString());
      }

      if (filters.searchQuery) {
        searchParams.set('searchQuery', filters.searchQuery);
      }

      if (filters.dateRange?.start) {
        searchParams.set('startDate', filters.dateRange.start);
      }

      if (filters.dateRange?.end) {
        searchParams.set('endDate', filters.dateRange.end);
      }

      if (filters.priceRange?.min !== undefined) {
        searchParams.set('minPrice', filters.priceRange.min.toString());
      }

      if (filters.priceRange?.max !== undefined) {
        searchParams.set('maxPrice', filters.priceRange.max.toString());
      }
    }

    const url = `${API_BASE}/events?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch events. Status: ${response.status}`);
    }

    return response.json();
  }

  static async getEvent(id: string): Promise<IndustryEvent> {
    if (!id) {
      throw new Error('Event ID is required');
    }

    const response = await fetch(`${API_BASE}/events/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Event not found');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch event. Status: ${response.status}`);
    }

    return response.json();
  }

  static async saveEvent(eventId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/events/${eventId}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to save event');
    }
  }

  static async unsaveEvent(eventId: string, userId: string): Promise<void> {
    // Use the same endpoint - it toggles save/unsave
    const response = await fetch(`${API_BASE}/events/${eventId}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to unsave event');
    }
  }

  static async registerForEvent(eventId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to register for event');
    }
  }

  static async getSavedEvents(userId: string): Promise<EventsResponse> {
    const response = await fetch(`${API_BASE}/users/${userId}/saved-events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch saved events');
    }

    return response.json();
  }

  static async getRecommendedEvents(
    userId: string,
    limit = 12
  ): Promise<{ events: IndustryEvent[] }> {
    const response = await fetch(`${API_BASE}/events/recommended?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch recommended events');
    }

    return response.json();
  }
}
