# Бэкапы PostgreSQL (per-schema)

Этот раздел описывает стратегию и команды для резервного копирования и восстановления PostgreSQL в AquaStream.

## Что делает `backup.sh`
- Делает отдельные дампы в формате `custom` (`pg_dump -Fc`) по схемам: `user`, `event`, `crew`, `payment`, `notification`, `media`.
- Создаёт daily-файлы: `<schema>_YYYYMMDD.dump`.
- По воскресеньям — дополнительно `weekly_<schema>_YYYY-WW.dump`.
- Каждый 1-й день месяца — `monthly_<schema>_YYYY-MM.dump`.
- Ротация: хранит 7 daily, 4 weekly, 3 monthly.

Файлы складываются в `infra/backup/artifacts/`.

## Что делает `restore.sh`
- Восстанавливает:
  - либо весь дамп (`all`) — для общего файла,
  - либо конкретную схему из файла (`pg_restore -n <schema>`).
- Перед восстановлением гарантирует наличие схемы.

## Подготовка
1. Скопируйте `.env.example` → `.env` и задайте пароли (`POSTGRES_PASSWORD`, и т. д.).
2. Поднимите инфраструктуру (хватает `postgres`):
   ```bash
   make up-stage  # использует infra/docker/compose/docker-compose.yml
   ```

## Резервное копирование
```bash
bash infra/backup/backup.sh
```
Результат: дампы в `infra/backup/artifacts`.

## Восстановление
- Конкретная схема:
  ```bash
  bash infra/backup/restore.sh event infra/backup/artifacts/event_20250101.dump
  ```
- Восстановить всё из общего файла:
  ```bash
  bash infra/backup/restore.sh all infra/backup/artifacts/all_20250101.dump
  ```
  (Если делаете общий файл самостоятельно.)

## Чеклист восстановления
1. Pre-check: убедитесь, что целевая БД НЕ prod; сделайте снапшот/бэкап перед восстановлением.
2. Остановите пишущие сервисы для целевой схемы.
3. Выполните `restore.sh` (см. примеры выше).
4. Проверьте `
   ```sql
   SELECT count(*) FROM information_schema.tables WHERE table_schema = '<schema>';
   ```
5. Прогоните smoke проверку сервиса (health, базовые CRUD).
6. Включите трафик.

## Заметки
- Скрипты используют docker network `aquastream-net` для доступа к контейнеру `postgres`.
- Для выборочного восстановления отдельных таблиц используйте `pg_restore -t <table>`.
- Выполняйте восстановление на тестовой БД перед продом.
