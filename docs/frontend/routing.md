# Маршрутизация

Статус: as-is

Основные маршруты (MVP):
- `/` — главная (каталог организаторов)
- `/org/[orgSlug]` — страница организатора
- `/org/[orgSlug]/events` — список событий
- `/org/[orgSlug]/team` — команда
- `/org/[orgSlug]/for-participants` — FAQ
- `/events/[eventId]` — карточка события
- `/auth/login`, `/auth/register`, `/auth/recovery` — аутентификация
- `/dashboard` — кабинет по роли
- `/checkout/[bookingId]` — подтверждение оплаты

SSR/SSG/ISR: публичные страницы — SSG+ISR (60с), карточка события и кабинеты — SSR.
