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

## Правила консистентности
- ESLint запрещает hex-значения в `className` (см. `.eslintrc.js`). Вместо `bg-[#123456]` используйте дизайн-токены (`bg-primary`, `bg-[color:var(--accent)]` и т.п.).
- Для исключений оформляйте `eslint-disable-next-line` с пояснением и ссылкой на задачу.

## Model Context Protocol — shadcn/ui

### Настройка для Claude Code

1. **Автоматическая настройка** (рекомендуется):
   ```bash
   # Из корня проекта
   npx shadcn@latest mcp init --client claude
   ```

2. **Ручная настройка**:
   Создайте файл `.mcp.json` в корне проекта:
   ```json
   {
     "mcpServers": {
       "shadcn": {
         "command": "npx",
         "args": ["shadcn@latest", "mcp"],
         "cwd": "frontend"
       }
     }
   }
   ```

3. **Проверка работы**:
   - Перезапустите Claude Code
   - Выполните команду `/mcp`
   - Убедитесь что статус `shadcn` → `Connected`

### Настройка для Codex CLI

1. **Добавление MCP сервера**:
   ```bash
   # Глобальная настройка
   codex mcp add shadcn -- npx shadcn@latest mcp
   ```

2. **Проверка настройки**:
   ```bash
   # Просмотр настроенных серверов
   codex mcp list
   ```

3. **Локальная конфигурация** (опционально):
   Создайте файл `.codex/mcp.json`:
   ```json
   {
     "mcpServers": {
       "shadcn": {
         "command": "npx",
         "args": ["shadcn@latest", "mcp"],
         "cwd": "frontend",
         "transport": "stdio"
       }
     }
   }
   ```

### Использование MCP

**Claude Code примеры**:
- `найди компонент button`
- `покажи все доступные компоненты`
- `добавь dialog компонент в проект`
- `покажи примеры использования card`

**Codex CLI примеры**:
- `codex "Install shadcn button component"`
- `codex "Show me available shadcn components"`
- `codex "Add a dialog component to my project"`

### Проверка работы MCP

```bash
# Локальная проверка сервера (из папки frontend)
npx shadcn@latest mcp

# Инспектор для отладки (Codex)
npx @modelcontextprotocol/inspector@latest \
  --cli --config .codex/mcp.json --server shadcn
```

### Расширение реестров

Для добавления других реестров компонентов редактируйте `components.json`:
```json
{
  "registries": {
    "@shadcn": "https://ui.shadcn.com/registry",
    "@custom": "https://your-registry.com/registry"
  }
}
```

См. также [официальную документацию](https://ui.shadcn.com/docs/mcp#configuring-registries).
