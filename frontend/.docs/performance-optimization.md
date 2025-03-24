# Оптимизация производительности

## Обзор

Этот документ содержит рекомендации и лучшие практики для оптимизации производительности фронтенд-приложения AquaStream. Производительность - критический фактор пользовательского опыта, поэтому мы уделяем особое внимание оптимизации на всех уровнях.

## Ключевые метрики

При оптимизации производительности, мы отслеживаем следующие метрики:

1. **Время до интерактивности (TTI)** - время, через которое пользователь может взаимодействовать с приложением
2. **First Contentful Paint (FCP)** - время первого отображения контента
3. **Largest Contentful Paint (LCP)** - время отображения самого крупного элемента страницы
4. **Cumulative Layout Shift (CLS)** - кумулятивное смещение макета
5. **First Input Delay (FID)** - задержка первого взаимодействия

## Стратегии оптимизации

### 1. Оптимизация бандла

#### Разделение кода (Code Splitting)

```tsx
// Использование динамического импорта для разделения кода
import React, { lazy, Suspense } from 'react';

// Ленивая загрузка компонента
const TripsPage = lazy(() => import('./features/trips/TripsPage'));

// Использование в роутере
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/trips" 
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <TripsPage />
          </Suspense>
        } 
      />
    </Routes>
  );
}
```

#### Анализ бандла

Регулярно анализируйте размер бандла с помощью инструментов:

```bash
# Анализ бандла
npm run build
npx vite-bundle-analyzer
```

### 2. Оптимизация рендеринга React

#### Мемоизация компонентов

```tsx
import React, { memo, useMemo, useCallback } from 'react';

// Мемоизация компонента
const TripCard = memo(({ trip, onSelect }) => {
  // Компонент будет перерендерен только если trip или onSelect изменятся
  return (
    <div className="card" onClick={() => onSelect(trip.id)}>
      <h3>{trip.title}</h3>
      <p>{trip.description}</p>
    </div>
  );
});

// Использование мемоизации в родительском компоненте
function TripsList({ trips }) {
  // Мемоизация вычисляемых значений
  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => a.date - b.date);
  }, [trips]);
  
  // Мемоизация функций обратного вызова
  const handleSelect = useCallback((id) => {
    console.log(`Selected trip: ${id}`);
  }, []);
  
  return (
    <div>
      {sortedTrips.map(trip => (
        <TripCard 
          key={trip.id} 
          trip={trip} 
          onSelect={handleSelect} 
        />
      ))}
    </div>
  );
}
```

#### Правильное использование хуков

```tsx
// Оптимизация хуков
function ProfilePage({ userId }) {
  // Плохо: зависимость будет меняться каждый раз
  const profile = useProfile({ id: userId });
  
  // Хорошо: зависимость будет стабильной
  const profile = useProfile(userId);
  
  // Плохо: функция создается при каждом рендере
  const handleClick = () => {
    console.log('Clicked');
  };
  
  // Хорошо: функция мемоизируется
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
}
```

### 3. Оптимизация загрузки изображений

```tsx
// Использование компонента LazyImage для отложенной загрузки
function LazyImage({ src, alt, className }) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className={`image-container ${isLoaded ? 'loaded' : ''}`}>
      {!isLoaded && <div className="skeleton" />}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}

// Использование в компоненте
<LazyImage 
  src="/images/trip-photo.jpg" 
  alt="Фото сплава" 
  className="trip-image"
/>
```

### 4. Оптимизация API-запросов

#### Кэширование данных

```tsx
// Использование RTK Query для кэширования данных
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getTrips: builder.query({
      query: () => 'trips',
      // Данные будут кэшироваться на 5 минут
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetTripsQuery } = api;

// Использование в компоненте
function TripsPage() {
  const { data, isLoading, error } = useGetTripsQuery();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {data.trips.map(trip => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
```

#### Оптимизация запросов

```tsx
// Паггинация и фильтрация на стороне сервера
function TripsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ difficulty: null });
  
  const { data, isLoading } = useGetTripsQuery({ page, filters });
  
  return (
    <div>
      <FilterControls filters={filters} onFilterChange={setFilters} />
      <TripsList trips={data?.trips || []} />
      <Pagination 
        currentPage={page} 
        totalPages={data?.totalPages || 1} 
        onPageChange={setPage} 
      />
    </div>
  );
}
```

### 5. Виртуализация длинных списков

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedList({ items }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div 
        style={{ 
          height: `${virtualizer.getTotalSize()}px`, 
          position: 'relative' 
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <TripItem trip={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. Оптимизация CSS и Tailwind

#### Удаление неиспользуемых стилей

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' && require('@fullhuman/postcss-purgecss')({
      content: [
        './src/**/*.{js,jsx,ts,tsx}',
        './public/index.html',
      ],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
    }),
  ].filter(Boolean),
};
```

#### Сокращение повторяемого CSS с помощью Tailwind

```tsx
// Создание компонентных классов через @apply
// styles/components.css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors;
  }
  
  .card {
    @apply p-4 bg-white rounded-lg shadow-md border border-gray-200;
  }
}

// Использование в компонентах
function Button({ children, ...props }) {
  return (
    <button className="btn-primary" {...props}>
      {children}
    </button>
  );
}
```

### 7. Предварительная загрузка (Preloading)

```tsx
// Предварительная загрузка данных для маршрутов
function TripsPage() {
  // Предзагрузка данных для детальной страницы при наведении
  const prefetchTrip = api.usePrefetch('getTripById');
  
  return (
    <div>
      {trips.map(trip => (
        <div 
          key={trip.id} 
          onMouseEnter={() => prefetchTrip(trip.id)}
        >
          <Link to={`/trips/${trip.id}`}>
            {trip.title}
          </Link>
        </div>
      ))}
    </div>
  );
}
```

### 8. Отложенная загрузка (Lazy Loading)

```tsx
// Отложенная загрузка модуля карты
import { Suspense, lazy } from 'react';

const Map = lazy(() => import('./Map'));

function TripDetail({ trip }) {
  const [showMap, setShowMap] = useState(false);
  
  return (
    <div>
      <h1>{trip.title}</h1>
      <button onClick={() => setShowMap(true)}>
        Показать карту маршрута
      </button>
      
      {showMap && (
        <Suspense fallback={<div>Загрузка карты...</div>}>
          <Map route={trip.route} />
        </Suspense>
      )}
    </div>
  );
}
```

## Инструменты оптимизации

### 1. Lighthouse

Регулярно проводите аудит с помощью Lighthouse:
- Производительность
- Доступность
- Лучшие практики
- SEO

### 2. React Developer Tools

Используйте React DevTools для:
- Анализа перерендеров
- Профилирования времени рендеринга
- Поиска узких мест

### 3. Web Vitals

```tsx
// Настройка отслеживания Web Vitals
import { getCLS, getFID, getLCP } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  // Отправка метрик в аналитику
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
```

## Контрольный список оптимизаций

- [ ] Сокращение размера бандла
- [ ] Разделение кода по маршрутам
- [ ] Мемоизация компонентов и вычислений
- [ ] Оптимизация изображений
- [ ] Кэширование API-запросов
- [ ] Виртуализация длинных списков
- [ ] Оптимизация CSS
- [ ] Отложенная и предварительная загрузка
- [ ] Измерение ключевых метрик

## Распространенные проблемы и решения

### 1. Избыточный рендеринг

**Проблема**: Компоненты рендерятся чаще, чем необходимо.

**Решение**:
- Используйте `React.memo()` для чистых функциональных компонентов
- Используйте `useMemo()` для тяжелых вычислений
- Используйте `useCallback()` для стабилизации функций

### 2. Утечки памяти

**Проблема**: Компоненты не освобождают ресурсы при размонтировании.

**Решение**:
```tsx
function SubscriptionComponent() {
  useEffect(() => {
    const subscription = subscribe();
    
    // Очистка при размонтировании
    return () => {
      subscription.unsubscribe();
    };
  }, []);
}
```

### 3. Медленная первая загрузка

**Проблема**: Приложение слишком долго загружается при первом посещении.

**Решение**:
- Разделение кода
- Предварительный рендеринг (SSR/SSG)
- Оптимизация критического CSS
- Ленивая загрузка изображений

## Заключение

Оптимизация производительности - непрерывный процесс. Регулярно проводите аудит, измеряйте метрики и вносите улучшения. Даже небольшие оптимизации в совокупности могут дать значительное улучшение пользовательского опыта. 