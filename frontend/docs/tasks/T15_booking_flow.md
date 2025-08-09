# T15 — Бронирование: создание + переход в оплату

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §8, §11–12, §20.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
CTA на карточке события создаёт бронь и переводит на `/checkout/[bookingId]`.

## Область работ
**Входит в объём:**
- Mock `POST /bookings` → id.
- Страница Checkout с краткими деталями.

**Не входит:**
- Логика оплаты (в отдельных задачах).

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t15`.

## Шаги выполнения
1. Кнопка «Записаться» на `/events/[eventId]`.
2. Создание брони (мок) и навигация на checkout.
3. Отрисовать данные по `GET /bookings/:id`.

## Артефакты
- Бронь создаётся и открывается чек-аут.

## Бизнес‑приёмка (пользовательская)
- После перезагрузки состояние сохраняется.

## Definition of Done (техническая готовность)
- Ошибки — через Alert; есть skeleton‑состояния.

## Ссылки
- Бизнес‑документ: `/frontend/docs/AquaStream_Business_Spec_v1.1.md`
- Next.js ISR: https://nextjs.org/docs/app/guides/incremental-static-regeneration
- revalidateTag: https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- Acceptance Criteria: https://www.atlassian.com/ru/agile/project-management/user-stories
- Definition of Done: https://www.scrum.org/resources/what-definition-done
- MSW quick start: https://mswjs.io/docs/quick-start/