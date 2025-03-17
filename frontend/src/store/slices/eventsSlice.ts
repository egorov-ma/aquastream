import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { eventsService, EventRequest, EventsFilter } from '@/services/eventsService';
import { Event } from '@/types/models';
import { EventsState } from '@/types/store';

// Начальное состояние
const initialState: EventsState = {
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
};

// Асинхронные действия
export const fetchEvents = createAsyncThunk<
  Event[],
  EventsFilter | undefined,
  { rejectValue: string }
>('events/fetchEvents', async (filters, { rejectWithValue }) => {
  try {
    return await eventsService.getEvents(filters);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Не удалось загрузить события. Попробуйте позже.'
    );
  }
});

export const fetchEventById = createAsyncThunk<
  Event,
  string,
  { rejectValue: string }
>('events/fetchEventById', async (id, { rejectWithValue }) => {
  try {
    return await eventsService.getEventById(id);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Не удалось загрузить данные события. Попробуйте позже.'
    );
  }
});

export const createEvent = createAsyncThunk<
  Event,
  EventRequest,
  { rejectValue: string }
>('events/createEvent', async (eventData, { rejectWithValue }) => {
  try {
    return await eventsService.createEvent(eventData);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Не удалось создать событие. Попробуйте позже.'
    );
  }
});

export const updateEvent = createAsyncThunk<
  Event,
  { id: string; data: Partial<EventRequest> },
  { rejectValue: string }
>('events/updateEvent', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await eventsService.updateEvent(id, data);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Не удалось обновить событие. Попробуйте позже.'
    );
  }
});

export const deleteEvent = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('events/deleteEvent', async (id, { rejectWithValue }) => {
  try {
    await eventsService.deleteEvent(id);
    return id; // Возвращаем ID удаленного события для обновления состояния
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Не удалось удалить событие. Попробуйте позже.'
    );
  }
});

// Создание слайса
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
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
        state.error = action.payload || 'Не удалось загрузить события';
      })
      
      // Обработка fetchEventById
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action: PayloadAction<Event>) => {
        state.isLoading = false;
        state.selectedEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Не удалось загрузить данные события';
      })
      
      // Обработка createEvent
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.isLoading = false;
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Не удалось создать событие';
      })
      
      // Обработка updateEvent
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.isLoading = false;
        // Обновляем событие в списке
        const index = state.events.findIndex((event) => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        // Если обновлено выбранное событие, обновляем и его
        if (state.selectedEvent?.id === action.payload.id) {
          state.selectedEvent = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Не удалось обновить событие';
      })
      
      // Обработка deleteEvent
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        // Удаляем событие из списка
        state.events = state.events.filter((event) => event.id !== action.payload);
        // Если удалено выбранное событие, очищаем его
        if (state.selectedEvent?.id === action.payload) {
          state.selectedEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Не удалось удалить событие';
      });
  },
});

// Экспорт действий и редьюсера
export const { clearSelectedEvent, clearEventsError } = eventsSlice.actions;
export default eventsSlice.reducer; 