export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string;
  price: number;
  availableSpots: number;
  totalSpots: number;
  occupancyPercentage: number;
  status: 'draft' | 'published' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface EventsState {
  events: Event[];
  featuredEvents: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string;
  price: number;
  totalSpots: number;
  status?: 'draft' | 'published';
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  image?: string;
  price?: number;
  totalSpots?: number;
  status?: 'draft' | 'published' | 'cancelled';
}

export interface EventFilters {
  startDate?: string;
  endDate?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: 'draft' | 'published' | 'cancelled';
  search?: string;
}

export interface BookingData {
  eventId: string;
  userId: string;
  numberOfSpots: number;
  additionalInfo?: string;
} 