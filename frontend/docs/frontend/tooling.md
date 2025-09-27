# Frontend Tooling

## Поддержка современных CSS-селекторов
- Используемые версии: Prettier 3.6+, ESLint 8.57+, Next.js 14.2 включают поддержку селекторов `**:data-*`, `group-data-*`, `size-*` и других конструкций Tailwind 4.
- Проверка выполняется командами:
  - `rg '\\*\\*:data'` и `rg 'group-data'` — выявляют нестандартные селекторы.
  - `pnpm lint` — гарантирует, что ESLint корректно парсит классы.
  - `pnpm exec prettier --check "components/ui/navigation-menu.tsx" "components/ui/calendar.tsx"` — убеждаемся, что форматер обрабатывает длинные цепочки классов без ошибок.
- В VS Code необходимо использовать расширение Prettier, привязанное к workspace-версии (`"prettier.prettierPath": "./node_modules/.bin/prettier"`). Это гарантирует синхронизацию версии форматера с проектом.

## Рекомендации по обновлению
- При обновлении Prettier или ESLint сверяйтесь с changelog — поддержка новых синтаксических конструкций часто попадает в мажорные релизы.
- Если появляются новые хвостовые селекторы Tailwind (например, `group-data-[state]`), добавляйте юнит-тест в `tests/unit/cn.test.ts`, чтобы `tailwind-merge` не отбрасывал класс.
- Перед коммитом выполняйте `pnpm lint` и `pnpm exec prettier --check` — это даёт уверенность, что тулчейн остаётся совместимым.
