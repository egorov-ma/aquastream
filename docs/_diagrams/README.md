# Диаграммы — структура и правила

Исходники:
- PlantUML: `docs/_diagrams/**/*.puml`
- Mermaid: `docs/_diagrams/**/*.{mmd,mermaid}`

Сборка:
- PlantUML → PNG генерируются в `docs/_media/diagrams/` командой `make docs-diagrams` (или автоматически в `docs-build/docs-serve`).
- Mermaid рендерится на лету плагином `mkdocs-mermaid2-plugin` (вставляйте кодовые блоки с языком `mermaid`).

Правила:
- Давайте файлам понятные имена (`context-overview.puml` и т.п.).
- Ссылки в Markdown указывайте на `docs/_media/diagrams/*.png` для PlantUML или используйте встроенные блоки для Mermaid.
