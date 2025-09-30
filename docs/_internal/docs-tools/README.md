# Documentation Tools

Инструменты для автоматизации работы с документацией AquaStream.

## Структура

```
docs-tools/
├── mkdocs.yml          # Конфигурация MkDocs
├── tools/              # Python скрипты автоматизации
│   ├── generate_api_docs.py     # Генерация API документации
│   ├── check_docs_quality.py    # Проверка качества документов
│   ├── inventory_md.py          # Инвентаризация .md файлов
│   ├── map_docs.py             # Создание карты документации
│   ├── consolidate_docs.py     # Консолидация документов
│   ├── sync_module_docs.py     # Синхронизация модульной документации
│   ├── scaffold_docs_structure.py # Создание структуры документации
│   ├── normalize_md.py         # Нормализация Markdown файлов
│   ├── check_links.py          # Проверка ссылок
│   ├── generate_diagrams.py    # Генерация диаграмм
│   ├── centralize_md.py        # Централизация документов
│   ├── quote_front_matter.py   # Обработка front matter
│   └── apply_move_plan.py      # Применение плана перемещения
├── _inventory/         # Инвентаризация файлов
└── _reports/           # Отчеты по документации
```

## Основные команды

### Сборка документации
```bash
python3 -m mkdocs build --clean --config-file docs/_internal/mkdocs.yml
```

### Локальный сервер
```bash
python3 -m mkdocs serve --config-file docs/_internal/mkdocs.yml
```

### Генерация API документации
```bash
python3 tools/generate_api_docs.py
```

### Проверка качества
```bash
python3 tools/check_docs_quality.py
```

### Проверка ссылок
```bash
python3 tools/check_links.py
```

## Зависимости

Установка через pip:
```bash
pip3 install mkdocs mkdocs-material mkdocs-mermaid2-plugin mkdocs-redirects
```

## Автоматизация

Все инструменты настроены для работы с новой модульной структурой документации и поддерживают:

- Автогенерацию API документации из OpenAPI спецификаций
- Проверку качества и консистентности документов
- Валидацию ссылок и структуры
- Генерацию отчетов о состоянии документации