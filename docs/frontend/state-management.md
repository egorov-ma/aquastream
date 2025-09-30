# Управление состоянием

Статус: as-is/to-be

## Принципы
- Серверные данные: SSR/SSG/ISR + клиентский refetch
- Клиентские формы: React Hook Form + Zod (схемы валидации)
- Единый слой запросов: обработка ошибок (RFC 7807), ретраи, корелляция

## Слои
- serverFetch/clientRequest: обёртки над fetch
- Кэш: встроенные механизмы Next (revalidate‑теги) + локальный кэш

## Формы
- RHF Controller + zodResolver
- Единые состояния: loading/empty/error/success

## TODO (to-be)
- Вынести слой данных в `shared/api/*` и унифицировать хэндлинг ошибок
