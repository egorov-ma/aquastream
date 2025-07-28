import { createAsyncThunk } from '@reduxjs/toolkit';

import { eventsApi } from '../api/eventsApi';
import { EventFilters, CreateEventData, UpdateEventData } from '../types';

// Получение списка событий
export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (filters: EventFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getEvents(filters);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Получение рекомендуемых событий для главной страницы
export const fetchFeaturedEvents = createAsyncThunk(
  'events/fetchFeatured',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getFeaturedEvents(limit);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Получение события по ID
export const fetchEventById = createAsyncThunk(
  'events/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getEventById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Создание нового события
export const createEvent = createAsyncThunk(
  'events/create',
  async (eventData: CreateEventData, { rejectWithValue }) => {
    try {
      const response = await eventsApi.createEvent(eventData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Обновление события
export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, data }: { id: string; data: UpdateEventData }, { rejectWithValue }) => {
    try {
      const response = await eventsApi.updateEvent(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Удаление события
export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await eventsApi.deleteEvent(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Публикация события
export const publishEvent = createAsyncThunk(
  'events/publish',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await eventsApi.publishEvent(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Отмена события
export const cancelEvent = createAsyncThunk(
  'events/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await eventsApi.cancelEvent(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
