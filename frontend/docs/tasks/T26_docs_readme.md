# T26 — Документация: README и /frontend/docs

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §1–2, §12–19, §20.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Написать README и документы: запуск dev/prod, ENV, моки, платежи, вебхуки.

## Область работ
**Входит в объём:**
- README (quick start, команды, таблица ENV, порты, профили compose).
- `/frontend/docs/mocks.md`, `/frontend/docs/payments.md`.

**Не входит:**
- API‑референс (будет из OpenAPI позже).

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t26`.

## Шаги выполнения
1. Написать README и документацию; дать ссылки на таски и спецификацию.
2. Добавить диаграммы Mermaid (роуты и RBAC).
3. Взаимные ссылки между файлами.

## Артефакты
- Новый разработчик запускает проект только по README.

## Бизнес‑приёмка (пользовательская)
- Нет битых ссылок; инструкции понятны.

## Definition of Done (техническая готовность)
- Markdown‑линт без ошибок.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T26): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T26.md`.
