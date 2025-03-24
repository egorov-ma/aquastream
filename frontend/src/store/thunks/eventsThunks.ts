import { createAsyncThunk } from '@reduxjs/toolkit';

// Создаем типы для событий
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

// Заглушка для API, которая будет возвращать список предстоящих событий
// В реальном приложении здесь будет запрос к API
const mockFetchUpcomingEvents = async (): Promise<Event[]> => {
  // Симулируем задержку сети
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Возвращаем моковые данные
  return [
    {
      id: '1',
      title: 'Сплав по реке Чусовая',
      description: 'Трехдневный сплав по живописной реке Чусовая с остановками на ночевку.',
      shortDescription: 'Трехдневный сплав с палатками',
      startDate: '2023-07-15T10:00:00',
      endDate: '2023-07-17T18:00:00',
      location: 'Свердловская область, река Чусовая',
      coverImage: 'https://via.placeholder.com/400x225',
    },
    {
      id: '2',
      title: 'Поход на Конжаковский камень',
      description: 'Восхождение на одну из высочайших вершин Уральских гор.',
      shortDescription: 'Восхождение на гору',
      startDate: '2023-08-05T08:00:00',
      endDate: '2023-08-06T20:00:00',
      location: 'Свердловская область, Конжаковский камень',
      coverImage: 'https://via.placeholder.com/400x225',
    },
    {
      id: '3',
      title: 'Сплав по реке Серга',
      description: 'Однодневный сплав по реке Серга с посещением природного парка.',
      shortDescription: 'Однодневный сплав',
      startDate: '2023-06-25T09:00:00',
      endDate: '2023-06-25T19:00:00',
      location: 'Свердловская область, река Серга',
      coverImage: 'https://via.placeholder.com/400x225',
    },
  ];
};

// Создаем асинхронное действие для получения предстоящих событий
export const fetchUpcomingEvents = createAsyncThunk(
  'events/fetchUpcoming',
  async (_, { rejectWithValue }) => {
    try {
      return await mockFetchUpcomingEvents();
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке предстоящих событий');
    }
  }
);
