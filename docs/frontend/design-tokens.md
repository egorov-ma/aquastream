# Frontend Design Tokens

## Типографика
- `--font-sans`: Inter, sans-serif (подключена через `next/font`).
- `--font-serif`: Source Serif 4, serif.
- `--font-mono`: JetBrains Mono, monospace.

Используйте через классы Tailwind (`font-sans`, `font-serif`, `font-mono`) либо через переменные в CSS.

## Палитра
См. `app/globals.css` (`--background`, `--primary`, chart, sidebar и др.).

## Радиусы и тени
- Радиусы: `--radius`, `--radius-sm` ... (`tailwind.config.ts` отражает `rounded-sm`, `rounded-lg` и т.д.).
- Тени: `--shadow`, `--shadow-sm` и пр., маппинг в `tailwind.config.ts`.

Документ обновлять при изменении токенов.
