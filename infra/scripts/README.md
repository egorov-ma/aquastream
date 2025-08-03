# AquaStream Scripts

Минималистичный набор из 3 скриптов для автоматизации проекта AquaStream.

## 🔧 Скрипты

- `validate-infrastructure.sh` - Валидация инфраструктуры
- `run-tests.sh` - Тестирование (unit + integration)  
- `backup-restore.sh` - Backup и restore

**Все скрипты используются через главный `run.sh` в корне проекта.**

## 📖 Документация

**👉 Полная документация: [SCRIPTS_REFERENCE.md](../docs/SCRIPTS_REFERENCE.md)**

- Описание всех функций
- Примеры использования
- Типичные сценарии работы
- Все опции команд

## ⚡ Быстрый старт

```bash
./run.sh help          # Справка по командам
./run.sh start          # Запуск проекта
./run.sh test           # Тестирование
./run.sh backup         # Резервное копирование
```