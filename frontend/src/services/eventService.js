// Базовый URL API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Временные данные для демонстрации (пока API не реализован)
const mockEvents = [
  {
    id: 1,
    title: 'Сплав по реке Вишера',
    description: 'Увлекательный сплав по реке Вишера с посещением знаменитых скал. Отличный маршрут для опытных и начинающих туристов.',
    imageUrl: 'https://source.unsplash.com/random/800x600?river,1',
    startDate: '2025-07-10T10:00:00',
    endDate: '2025-07-15T16:00:00',
    city: 'Красновишерск',
    location: 'Река Вишера',
    totalPlaces: 20,
    occupiedPlaces: 12,
    registrationOpen: true,
    pricePerPerson: 15000,
    featured: true,
    difficulty: 'Средняя',
    tags: ['Сплав', 'Природа', 'Активный отдых']
  },
  {
    id: 2,
    title: 'Сплав по реке Чусовая',
    description: 'Сплав по живописной реке Чусовая с осмотром исторических мест и природных достопримечательностей.',
    imageUrl: 'https://source.unsplash.com/random/800x600?river,2',
    startDate: '2025-06-05T09:00:00',
    endDate: '2025-06-09T18:00:00',
    city: 'Пермь',
    location: 'Река Чусовая',
    totalPlaces: 15,
    occupiedPlaces: 15,
    registrationOpen: false,
    pricePerPerson: 12000,
    featured: true,
    difficulty: 'Лёгкая',
    tags: ['Сплав', 'История', 'Семейный отдых']
  },
  {
    id: 3,
    title: 'Рафтинг на Мзымте',
    description: 'Экстремальный рафтинг на горной реке Мзымта в окрестностях Сочи. Подходит для любителей адреналина.',
    imageUrl: 'https://source.unsplash.com/random/800x600?rafting,1',
    startDate: '2025-08-20T11:00:00',
    endDate: '2025-08-20T16:00:00',
    city: 'Сочи',
    location: 'Река Мзымта',
    totalPlaces: 12,
    occupiedPlaces: 5,
    registrationOpen: true,
    pricePerPerson: 8000,
    featured: false,
    difficulty: 'Высокая',
    tags: ['Рафтинг', 'Экстрим', 'Горы']
  },
  {
    id: 4,
    title: 'Каякинг на Байкале',
    description: 'Незабываемое путешествие на каяках по кристально чистым водам озера Байкал с остановками на диких пляжах.',
    imageUrl: 'https://source.unsplash.com/random/800x600?kayak,1',
    startDate: '2025-07-25T08:00:00',
    endDate: '2025-07-30T18:00:00',
    city: 'Иркутск',
    location: 'Озеро Байкал',
    totalPlaces: 10,
    occupiedPlaces: 2,
    registrationOpen: true,
    pricePerPerson: 25000,
    featured: true,
    difficulty: 'Средняя',
    tags: ['Каякинг', 'Природа', 'Походы']
  },
  {
    id: 5,
    title: 'Сплав по Алтаю',
    description: 'Многодневный сплав по рекам Алтайского края с посещением красивейших мест региона и ночевками в палатках.',
    imageUrl: 'https://source.unsplash.com/random/800x600?mountains,1',
    startDate: '2025-08-01T07:00:00',
    endDate: '2025-08-10T19:00:00',
    city: 'Барнаул',
    location: 'Алтайский край',
    totalPlaces: 25,
    occupiedPlaces: 20,
    registrationOpen: true,
    pricePerPerson: 22000,
    featured: false,
    difficulty: 'Высокая',
    tags: ['Сплав', 'Горы', 'Походы']
  },
  {
    id: 6,
    title: 'Сплав для начинающих',
    description: 'Однодневный сплав для тех, кто хочет попробовать себя в водном туризме. Подходит для новичков и семей с детьми.',
    imageUrl: 'https://source.unsplash.com/random/800x600?water,1',
    startDate: '2025-06-15T10:00:00',
    endDate: '2025-06-15T18:00:00',
    city: 'Москва',
    location: 'Река Истра',
    totalPlaces: 30,
    occupiedPlaces: 10,
    registrationOpen: true,
    pricePerPerson: 5000,
    featured: false,
    difficulty: 'Лёгкая',
    tags: ['Сплав', 'Новичкам', 'Семейный отдых']
  }
];

// Имитация пользовательских данных об участии в мероприятиях
const mockUserParticipation = {
  1: 'confirmed', // Пользователь подтвержден на мероприятие #1
  2: 'pending'    // Пользователь ожидает подтверждения на мероприятие #2
};

/**
 * Получение всех мероприятий с возможностью фильтрации
 * @param {Object} filters - Объект с фильтрами
 * @returns {Promise<Array>} - Отфильтрованный список мероприятий
 */
export const getAllEvents = async (filters = {}) => {
  try {
    // В реальном приложении здесь будет запрос к API
    // return await fetch(`${API_URL}/events?...`).then(res => res.json());
    
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Применяем фильтры к моковым данным
    let filteredEvents = [...mockEvents];
    
    // Фильтр по поисковому запросу
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(searchLower) || 
        event.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Фильтр по городу
    if (filters.city) {
      filteredEvents = filteredEvents.filter(event => 
        event.city === filters.city
      );
    }
    
    // Фильтр по дате начала
    if (filters.startDate) {
      const filterDate = new Date(filters.startDate);
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.startDate) >= filterDate
      );
    }
    
    // Фильтр по дате окончания
    if (filters.endDate) {
      const filterDate = new Date(filters.endDate);
      filterDate.setHours(23, 59, 59);
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.startDate) <= filterDate
      );
    }
    
    // Фильтр по доступности регистрации
    if (filters.onlyAvailable) {
      filteredEvents = filteredEvents.filter(event => 
        event.registrationOpen && event.occupiedPlaces < event.totalPlaces
      );
    }
    
    // Сортировка по дате (ближайшие сначала)
    filteredEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    return filteredEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Получение избранных/рекомендуемых мероприятий для слайдера
 * @returns {Promise<Array>} - Список избранных мероприятий
 */
export const getFeaturedEvents = async () => {
  try {
    // В реальном приложении здесь будет запрос к API
    // return await fetch(`${API_URL}/events/featured`).then(res => res.json());
    
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Возвращаем только рекомендованные мероприятия
    return mockEvents.filter(event => event.featured);
  } catch (error) {
    console.error('Error fetching featured events:', error);
    throw error;
  }
};

/**
 * Получение информации об участии пользователя в мероприятиях
 * @returns {Promise<Object>} - Объект с id мероприятий и статусами участия
 */
export const getUserParticipation = async () => {
  try {
    // В реальном приложении здесь будет запрос к API с аутентификацией
    // return await fetch(`${API_URL}/user/participation`, { headers: { 'Authorization': `Bearer ${token}` } })
    //   .then(res => res.json());
    
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockUserParticipation;
  } catch (error) {
    console.error('Error fetching user participation:', error);
    throw error;
  }
};

/**
 * Получение деталей конкретного мероприятия
 * @param {number} id - Идентификатор мероприятия
 * @returns {Promise<Object>} - Объект с деталями мероприятия
 */
export const getEventById = async (id) => {
  try {
    // В реальном приложении здесь будет запрос к API
    // return await fetch(`${API_URL}/events/${id}`).then(res => res.json());
    
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const event = mockEvents.find(event => event.id === parseInt(id));
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    return event;
  } catch (error) {
    console.error(`Error fetching event with id ${id}:`, error);
    throw error;
  }
}; 