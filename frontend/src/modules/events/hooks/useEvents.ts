import { useCallback } from 'react';

import {
  fetchEvents,
  fetchFeaturedEvents,
  fetchEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  clearCurrentEvent,
  clearEventsError,
} from '../store/eventsSlice';
import { EventFilters, CreateEventData, UpdateEventData } from '../types';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';

/**
 * Хук для работы с событиями
 * Предоставляет доступ к состоянию событий и методам для работы с ними
 */
export const useEvents = () => {
  const dispatch = useAppDispatch();
  const { events, featuredEvents, currentEvent, isLoading, error } = useAppSelector(
    (state) => state.events
  );

  /**
   * Получение списка всех событий
   * @param filters Фильтры для событий (опционально)
   */
  const getEvents = useCallback(
    async (filters?: EventFilters) => {
      await dispatch(fetchEvents(filters));
    },
    [dispatch]
  );

  /**
   * Получение избранных событий
   * @param limit Количество событий для получения (опционально)
   */
  const getFeaturedEvents = useCallback(
    async (limit?: number) => {
      await dispatch(fetchFeaturedEvents(limit));
    },
    [dispatch]
  );

  /**
   * Получение события по ID
   * @param id ID события
   */
  const getEventById = useCallback(
    async (id: string) => {
      await dispatch(fetchEventById(id));
    },
    [dispatch]
  );

  /**
   * Создание нового события
   * @param eventData Данные для создания события
   */
  const addEvent = useCallback(
    async (eventData: CreateEventData) => {
      await dispatch(createEvent(eventData));
    },
    [dispatch]
  );

  /**
   * Обновление существующего события
   * @param id ID события
   * @param eventData Данные для обновления события
   */
  const editEvent = useCallback(
    async (id: string, eventData: UpdateEventData) => {
      await dispatch(updateEvent({ id, eventData }));
    },
    [dispatch]
  );

  /**
   * Удаление события
   * @param id ID события
   */
  const removeEvent = useCallback(
    async (id: string) => {
      await dispatch(deleteEvent(id));
    },
    [dispatch]
  );

  /**
   * Регистрация на событие
   * @param eventId ID события
   */
  const registerEvent = useCallback(
    async (eventId: string) => {
      await dispatch(registerForEvent(eventId));
    },
    [dispatch]
  );

  /**
   * Отмена регистрации на событие
   * @param eventId ID события
   */
  const cancelEventRegistration = useCallback(
    async (eventId: string) => {
      await dispatch(cancelRegistration(eventId));
    },
    [dispatch]
  );

  /**
   * Очистка текущего события
   */
  const clearEvent = useCallback(() => {
    dispatch(clearCurrentEvent());
  }, [dispatch]);

  /**
   * Очистка ошибок
   */
  const clearError = useCallback(() => {
    dispatch(clearEventsError());
  }, [dispatch]);

  return {
    all: events,
    upcoming: events?.filter((event) => new Date(event.startDate) > new Date()),
    featured: featuredEvents,
    current: currentEvent,
    isLoading,
    error,
    getEvents,
    getFeaturedEvents,
    getEventById,
    addEvent,
    editEvent,
    removeEvent,
    registerEvent,
    cancelEventRegistration,
    clearEvent,
    clearError,
  };
};
