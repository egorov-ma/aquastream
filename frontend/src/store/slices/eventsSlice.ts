import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../index';
import { fetchUpcomingEvents } from '../thunks/eventsThunks';

// Типы для состояния событий
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  coverImage?: string;
  shortDescription?: string;
}

interface EventsState {
  upcoming: Event[];
  all: Event[];
  isLoading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: EventsState = {
  upcoming: [],
  all: [],
  isLoading: false,
  error: null,
};

// Создание среза состояния
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Обработка получения предстоящих событий
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.isLoading = false;
        state.upcoming = action.payload;
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Экспорт действий и редьюсера
export default eventsSlice.reducer;

// Селекторы для получения данных из состояния
export const selectEventsUpcoming = (state: RootState) => state.events.upcoming;
export const selectEventsAll = (state: RootState) => state.events.all;
export const selectEventsLoading = (state: RootState) => state.events.isLoading;
export const selectEventsError = (state: RootState) => state.events.error;
