# Frontend Process & Governance

## PR-гигиена
- Перед ревью автор подтверждает чек-лист из `.github/pull_request_template.md` (shadcn-примитивы, обновление документации, запуск `pnpm lint`, `pnpm test:unit`, `pnpm test:e2e`).
- Если не хватает гайдлайнов, обязательно дополняем `docs/frontend/design-playbook.md` и `docs/frontend/shadcn-components.md` в рамках того же PR.

## Регулярный UI-аудит
- **Периодичность:** первый понедельник каждого квартала (январь, апрель, июль, октябрь).
- **Ответственный:** frontend lead или дежурный по UI.
- **Шаги:**
  1. Пройтись по основным маршрутам (auth, dashboard, org, marketing) и сравнить с плейбуком.
  2. Проверить новые компоненты на соответствие shadcn-примитивам и токенам.
  3. Выполнить `pnpm lint`, `pnpm test:unit`, `pnpm test:e2e` — убедиться, что правила консистентности соблюдаются.
  4. Задокументировать найденные расхождения issue в backlog; критичные — сразу ввести в TODO.
- **Отчётность:** фиксируется в таске `UI audit YYYY-QN` (notion/jira) + короткий апдейт в Slack.

## Работа с визуальными/смоук тестами
- Смоук-сценарий Playwright (`tests/e2e/auth-login.smoke.spec.ts`) выполняется в CI на каждый PR. При падении PR не мержим до выяснения.
- Для новых визуально значимых фич добавляйте сценарии в `tests/e2e/` и описывайте в `docs/frontend/testing.md`.

## Расширение правил
- При добавлении кастомных компонентов/инструментов сразу вносим изменения в:
  - `docs/frontend/shadcn-components.md`
  - `docs/frontend/design-playbook.md`
  - `docs/frontend/testing.md` (если нужны новые проверки)
- Любые исключения из lint-правил оформляются через `eslint-disable` с пояснением и ссылкой на задачу.

