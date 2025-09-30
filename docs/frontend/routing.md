# Маршрутизация

## Обзор

Next.js App Router с типизированными маршрутами. Разделение на публичные и приватные routes с middleware проверкой JWT.

## Публичные маршруты

### Главная и каталог

| Route | Страница | Rendering | Описание |
|-------|----------|-----------|----------|
| `/` | Главная | SSG + ISR (60s) | Каталог организаторов, поиск |
| `/search` | Поиск | SSR | Поиск по организаторам и событиям |

### Организатор

| Route | Страница | Rendering | Описание |
|-------|----------|-----------|----------|
| `/org/[orgSlug]` | Главная организатора | SSG + ISR (60s) | Бренд, описание, ближайшие события |
| `/org/[orgSlug]/events` | События | SSR | Список всех событий с фильтрами |
| `/org/[orgSlug]/team` | Команда | SSG + ISR (60s) | Команда организатора |
| `/org/[orgSlug]/for-participants` | FAQ | SSG + ISR (60s) | Часто задаваемые вопросы |

### События

| Route | Страница | Rendering | Описание |
|-------|----------|-----------|----------|
| `/events/[eventId]` | Детали события | SSR | Полная информация, бронирование |

## Приватные маршруты (требуется JWT)

### Аутентификация

| Route | Страница | Rendering | Описание |
|-------|----------|-----------|----------|
| `/auth/login` | Вход | SSR | Форма входа |
| `/auth/register` | Регистрация | SSR | Форма регистрации |
| `/auth/recovery` | Восстановление | SSR | Восстановление пароля |

**Middleware**: Redirect авторизованных с `/auth/*` на `/dashboard`

### Личный кабинет (User)

| Route | Страница | Требуется роль | Описание |
|-------|----------|----------------|----------|
| `/dashboard` | Дашборд | USER+ | Роль-зависимый кабинет |
| `/dashboard/profile` | Профиль | USER+ | Управление профилем |
| `/dashboard/bookings` | Мои брони | USER+ | Список бронирований |
| `/dashboard/bookings/[id]` | Детали брони | USER+ | Детали конкретной брони |
| `/dashboard/waitlist` | Очередь | USER+ | Waitlist статус |
| `/dashboard/favorites` | Избранное | USER+ | Избранные события |

### Оплата

| Route | Страница | Требуется роль | Описание |
|-------|----------|----------------|----------|
| `/checkout/[bookingId]` | Оплата | USER+ | Выбор метода оплаты (виджет/QR) |

### Организатор ЛК

| Route | Страница | Требуется роль | Описание |
|-------|----------|----------------|----------|
| `/dashboard/organizer` | Обзор | ORGANIZER+ | Статистика организатора |
| `/dashboard/organizer/create` | Создать организатора | ORGANIZER+ | Форма создания бренда |
| `/dashboard/organizer/edit` | Редактировать | ORGANIZER+ | Редактирование бренда |
| `/dashboard/organizer/team` | Команда | ORGANIZER+ | Управление командой |
| `/dashboard/organizer/faq` | FAQ | ORGANIZER+ | Управление FAQ |
| `/dashboard/events` | Мои события | ORGANIZER+ | Список событий организатора |
| `/dashboard/events/new` | Новое событие | ORGANIZER+ | Создание события |
| `/dashboard/events/[id]/edit` | Редактировать | ORGANIZER+ | Редактирование события |
| `/dashboard/events/[id]/crews` | Экипажи | ORGANIZER+ | Управление группами |
| `/dashboard/organizer/moderation` | Модерация | ORGANIZER+ | Очередь QR-оплат |

### Администратор

| Route | Страница | Требуется роль | Описание |
|-------|----------|----------------|----------|
| `/admin` | Админ-панель | ADMIN | Обзор системы |
| `/admin/users` | Пользователи | ADMIN | Управление ролями |
| `/admin/users/[id]` | Детали | ADMIN | Профиль пользователя |

## Middleware

### Auth Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  const path = request.nextUrl.pathname;
  
  // Защищенные маршруты
  if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // Проверка роли для /admin
    if (path.startsWith('/admin')) {
      const role = parseJWT(token).role;
      if (role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }
  
  // Redirect авторизованных с /auth на /dashboard
  if (path.startsWith('/auth') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}
```

## Rendering Strategy

### SSG (Static Site Generation)
- Организаторы: `/org/[slug]`
- Команда: `/org/[slug]/team`
- FAQ: `/org/[slug]/for-participants`

**Revalidate**: 60 секунд (ISR)

### SSR (Server-Side Rendering)
- События: `/events/[eventId]`
- Личный кабинет: `/dashboard/**`
- Аутентификация: `/auth/**`
- Checkout: `/checkout/**`

### Client-Side
- Интерактивные фильтры
- Real-time updates (booking countdown)
- Payment widget

## URL Parameters

### Dynamic segments

```typescript
// /org/[orgSlug]
params: { orgSlug: string }

// /events/[eventId]
params: { eventId: string }

// /checkout/[bookingId]
params: { bookingId: string }

// /dashboard/events/[id]/edit
params: { id: string }
```

### Search params

```typescript
// /org/[orgSlug]/events?status=upcoming&price=0-5000
searchParams: {
  status?: 'past' | 'upcoming' | 'planned'
  price?: string  // "min-max"
  date?: string   // ISO date range
  search?: string // текстовый поиск
}
```

## См. также

- [Frontend Setup](setup.md) - настройка Next.js
- [Components](components.md) - UI компоненты
- [State Management](state-management.md) - управление состоянием
