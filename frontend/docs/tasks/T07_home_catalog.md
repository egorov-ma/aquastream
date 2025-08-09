# T07 — Главная: каталог организаторов

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §6–7, §11–12, §21.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Реализовать сетку карточек организаторов с поиском и пагинацией.

## Область работ
**Входит в объём:**
- `OrganizerCard`, поиск по имени, пагинация.
- Состояния loading/empty/error.

**Не входит:**
- Подключение реального API.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.

## Шаги выполнения
1. Верстка `OrganizerCard` (Card/Avatar/Badge).
2. Сетка `OrganizerGrid` (адаптив).
3. Поиск (Input) + хоткей `/` через Command.
4. Пагинация через query‑параметры.
5. Проставить `data-test-id`.
6. Задокументировать props.

## Артефакты
- Поиск и пагинация работают на мок‑данных.

## Бизнес‑приёмка (пользовательская)
- Пустые и ошибочные состояния отображаются корректно и доступно.

## Definition of Done (техническая готовность)
- Lighthouse a11y/perf ≥ 90 на `/`.
- Нет ошибок в консоли.

## Ссылки
- Бизнес‑документ: `/frontend/docs/AquaStream_Business_Spec_v1.1.md`
- Next.js ISR: https://nextjs.org/docs/app/guides/incremental-static-regeneration
- revalidateTag: https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- Acceptance Criteria: https://www.atlassian.com/ru/agile/project-management/user-stories
- Definition of Done: https://www.scrum.org/resources/what-definition-done
- MSW quick start: https://mswjs.io/docs/quick-start/

## Инструкции для агента (ChatGPT Agent)
Ты — агент, выполняющий работу в монорепозитории AquaStream. Следуй шагам выше **точно**.  
- Держись принципа **MVP**, без оверинженеринга.  
- Используй **pnpm** для всех установок.  
