import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { eventsApi } from '../api/eventsApi';
import { 
  EventsState, 
  Event, 
  CreateEventData, 
  UpdateEventData, 
  EventFilters 
} from '../types';

// Начальное состояние
const initialState: EventsState = {
  events: [],
  featuredEvents: [],
  currentEvent: null,
  isLoading: false,
  error: null
};

// Асинхронный action для получения всех событий
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (filters?: EventFilters, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getEvents(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка получения событий');
    }
  }
);

// Асинхронный action для получения избранных событий
export const fetchFeaturedEvents = createAsyncThunk(
  'events/fetchFeaturedEvents',
  async (limit = 3, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getFeaturedEvents(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка получения избранных событий');
    }
  }
);

// Асинхронный action для получения события по ID
export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getEvent(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка получения события');
    }
  }
);

// Асинхронный action для создания события
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: CreateEventData, { rejectWithValue }) => {
    try {
      const response = await eventsApi.createEvent(eventData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка создания события');
    }
  }
);

// Асинхронный action для обновления события
export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }: { id: string, eventData: UpdateEventData }, { rejectWithValue }) => {
    try {
      const response = await eventsApi.updateEvent(id, eventData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка обновления события');
    }
  }
);

// Асинхронный action для удаления события
export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      await eventsApi.deleteEvent(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка удаления события');
    }
  }
);

// Слайс для событий
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    clearEventsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Обработка fetchEvents
    builder.addCase(fetchEvents.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
      state.isLoading = false;
      state.events = action.payload;
    });
    builder.addCase(fetchEvents.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Обработка fetchFeaturedEvents
    builder.addCase(fetchFeaturedEvents.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchFeaturedEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
      state.isLoading = false;
      state.featuredEvents = action.payload;
    });
    builder.addCase(fetchFeaturedEvents.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Обработка fetchEventById
    builder.addCase(fetchEventById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchEventById.fulfilled, (state, action: PayloadAction<Event>) => {
      state.isLoading = false;
      state.currentEvent = action.payload;
    });
    builder.addCase(fetchEventById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Обработка createEvent
    builder.addCase(createEvent.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
      state.isLoading = false;
      state.events = [...state.events, action.payload];
    });
    builder.addCase(createEvent.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Обработка updateEvent
    builder.addCase(updateEvent.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
      state.isLoading = false;
      state.events = state.events.map(event => 
        event.id === action.payload.id ? action.payload : event
      );
      if (state.currentEvent?.id === action.payload.id) {
        state.currentEvent = action.payload;
      }
    });
    builder.addCase(updateEvent.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Обработка deleteEvent
    builder.addCase(deleteEvent.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.events = state.events.filter(event => event.id !== action.payload);
      if (state.currentEvent?.id === action.payload) {
        state.currentEvent = null;
      }
    });
    builder.addCase(deleteEvent.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearCurrentEvent, clearEventsError } = eventsSlice.actions;
export default eventsSlice.reducer; 