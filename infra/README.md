# AquaStream Infrastructure

Contains Docker configurations, CI/CD pipelines and deployment configs. 



## Управление логами

AquaStream включает систему автоматического управления логами, которая решает следующие задачи:

### Очистка и ротация логов

Для автоматического управления логами используется скрипт `cleanup-logs.sh`, который:

- Удаляет устаревшие файлы логов
- Выполняет ротацию больших файлов
- Сжимает архивные логи
- Ограничивает количество хранимых архивных файлов

#### Использование скрипта очистки логов

```bash
# Базовое использование (удаляет логи старше 30 дней)
./infra/docker/scripts/cleanup-logs.sh

# Удалить логи старше 7 дней
./infra/docker/scripts/cleanup-logs.sh -d 7

# Ротировать файлы больше 50MB и сжать их
./infra/docker/scripts/cleanup-logs.sh -s 50 -c

# Очистить все логи (полное удаление)
./infra/docker/scripts/cleanup-logs.sh -a

# Тестовый режим без реального удаления
./infra/docker/scripts/cleanup-logs.sh --dry-run -v
```

#### Автоматизация очистки логов

Для настройки автоматической очистки логов используйте cron:

1. Отредактируйте файл crontab:
   ```bash
   crontab -e
   ```

2. Добавьте задания из примера в файле `infra/docker/scripts/cron/log-cleanup.cron`:
   ```
   # Ежедневная очистка старых логов
   30 3 * * * /path/to/aquastream/infra/docker/scripts/cleanup-logs.sh -d 30 -c
   ```

3. Сохраните и закройте редактор

#### Структура хранения логов

- `infra/docker/logs/` - основные логи скриптов
- `infra/docker/logs/archived/` - архивные ротированные логи
- `infra/docker/compose/logs/` - логи контейнеров

Все эти директории включены в `.gitignore` и не отслеживаются в репозитории. 