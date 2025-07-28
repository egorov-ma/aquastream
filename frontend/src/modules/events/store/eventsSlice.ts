import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { eventsApi } from '../api/eventsApi';
import { Event, EventsState, EventFilters, CreateEventData, UpdateEventData } from '../types';

import { ApiError } from '@/shared/types/api';
import { RootState } from '@/store';

// Начальное состояние
const initialState: EventsState = {
  events: [],
  featuredEvents: [],
  currentEvent: null,
  isLoading: false,
  error: null,
};

// Асинхронные actions
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (filters: EventFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getEvents(filters);
      return response.data;
    } catch (error: unknown) {
      const eventsError = error as ApiError;
      return rejectWithValue(eventsError.response?.data?.message || 'Ошибка при загрузке событий');
    }
  }
);

export const fetchFeaturedEvents = createAsyncThunk(
  'events/fetchFeaturedEvents',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getFeaturedEvents(limit);
      return response.data;
    } catch (error: unknown) {
      const eventsError = error as ApiError;
      return rejectWithValue(
        eventsError.response?.data?.message || 'Ошибка при загрузке избранных событий'
      );
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getEventById(id);
      return response.data.data;
    } catch (error: unknown) {
      const eventsError = error as ApiError;
      return rejectWithValue(eventsError.response?.data?.message || 'Ошибка при загрузке события');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: CreateEventData, { rejectWithValue }) => {
    try {
      const response = await eventsApi.createEvent(eventData);
      return response.data.data;
    } catch (error: unknown) {
      const eventsError = error as ApiError;
      return rejectWithValue(eventsError.response?.data?.message || 'Ошибка при создании события');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }: { id: string; eventData: UpdateEventData }, { rejectWithValue }) => {
    try {
      const response = await eventsApi.updateEvent(id, eventData);
      return response.data.data;
    } catch (error: unknown) {
      const eventsError = error as ApiError;
      return rejectWithValue(
        eventsError.response?.data?.message || 'Ошибка при обновлении события'
      );
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      await eventsApi.deleteEvent(id);
      return id;
    } catch (error: unknown) {
      const eventsError = error as ApiError;
      return rejectWithValue(eventsError.response?.data?.message || 'Ошибка при удалении события');
    }
  }
);

export const registerForEvent = createAsyncThunk(
  'events/registerForEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await eventsApi.registerForEvent(eventId);
      return response.data.data;
    } catch (error: unknown) {
      const eventsError = error as ApiError;
      return rejectWithValue(
        eventsError.response?.data?.message || 'Ошибка при регистрации на событие'
      );
    }
  }
);

export const cancelRegistration = createAsyncThunk(
  'events/cancelRegistration',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await eventsApi.cancelRegistration(eventId);
      return response.data.data;
    } catch (error: unknown) {
      const eventsError = error as ApiError;
      return rejectWithValue(
        eventsError.response?.data?.message || 'Ошибка при отмене регистрации'
      );
    }
  }
);

// Создание slice
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    clearEventsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchEvents
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка fetchFeaturedEvents
      .addCase(fetchFeaturedEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.isLoading = false;
        state.featuredEvents = action.payload;
      })
      .addCase(fetchFeaturedEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка fetchEventById
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action: PayloadAction<Event>) => {
        state.isLoading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка createEvent
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.isLoading = false;
        state.events = [...state.events, action.payload];
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка updateEvent
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.isLoading = false;
        state.events = state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        );
        if (state.currentEvent && state.currentEvent.id === action.payload.id) {
          state.currentEvent = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка deleteEvent
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.events = state.events.filter((event) => event.id !== action.payload);
        if (state.currentEvent && state.currentEvent.id === action.payload) {
          state.currentEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка registerForEvent
      .addCase(registerForEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerForEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.isLoading = false;
        state.events = state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        );
        if (state.currentEvent && state.currentEvent.id === action.payload.id) {
          state.currentEvent = action.payload;
        }
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка cancelRegistration
      .addCase(cancelRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelRegistration.fulfilled, (state, action: PayloadAction<Event>) => {
        state.isLoading = false;
        state.events = state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        );
        if (state.currentEvent && state.currentEvent.id === action.payload.id) {
          state.currentEvent = action.payload;
        }
      })
      .addCase(cancelRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentEvent, clearEventsError } = eventsSlice.actions;
export default eventsSlice.reducer;

// Селекторы
export const selectEvents = (state: RootState) => state.events.events;
export const selectFeaturedEvents = (state: RootState) => state.events.featuredEvents;
export const selectCurrentEvent = (state: RootState) => state.events.currentEvent;
export const selectEventsLoading = (state: RootState) => state.events.isLoading;
export const selectEventsError = (state: RootState) => state.events.error;
