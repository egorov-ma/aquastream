# 🔒 Password Security Guide - AquaStream

Руководство по безопасному управлению паролями в системе AquaStream.

## 🚨 Критические Изменения (2025-08-02)

**Все слабые пароли заменены на криптографически стойкие:**

- ❌ `POSTGRES_PASSWORD=postgres` → ✅ `<STRONG_PASSWORD>`
- ❌ `GRAFANA_ADMIN_PASSWORD=admin` → ✅ `<STRONG_PASSWORD>`
- ❌ `ELASTIC_PASSWORD=changeMe123!` → ✅ `<STRONG_PASSWORD>`
- ❌ `KIBANA_PASSWORD=kibanaUser123!` → ✅ `<STRONG_PASSWORD>`

## 🛠️ Инструменты Управления Паролями

### 1. Генерация Новых Паролей

```bash
# Автоматическая генерация сильных паролей
./infra/scripts/generate-secrets.sh

# Ручная генерация пароля
openssl rand -base64 32
```

### 2. Обновление Существующих Паролей

```bash
# Проверка и обновление слабых паролей
./infra/scripts/update-passwords.sh

# Безопасная остановка и перезапуск сервисов
docker compose down && docker compose up -d
```

### 3. Docker Secrets (Production)

```bash
# Инициализация Docker Swarm
docker swarm init

# Создание secrets
echo "strong_password_here" | docker secret create aquastream_postgres_password -
echo "strong_password_here" | docker secret create aquastream_elastic_password -

# Использование secrets compose файла
docker compose -f docker-compose.secrets.yml up -d
```

## 📋 Требования к Паролям

### Критерии Силы Пароля

- **Минимальная длина**: 12 символов
- **Обязательные типы символов** (минимум 3 из 4):
  - Заглавные буквы (A-Z)
  - Строчные буквы (a-z)
  - Цифры (0-9)
  - Специальные символы (!@#$%^&*)

### Запрещенные Пароли

- ❌ Словарные слова: `password`, `admin`, `user`, `test`, `demo`
- ❌ Имена сервисов: `postgres`, `grafana`, `elastic`, `kibana`
- ❌ Простые комбинации: `123456`, `qwerty`, `changeme`
- ❌ Пустые или короткие пароли (< 12 символов)

## 🔐 Методы Хранения Паролей

### 1. Environment Variables (.env) - Разработка

```bash
# infra/docker/compose/.env
POSTGRES_PASSWORD=<STRONG_PASSWORD>
GRAFANA_ADMIN_PASSWORD=<STRONG_PASSWORD>
```

**Плюсы:**
- Простота настройки
- Подходит для разработки

**Минусы:**
- Пароли видны в процессах
- Могут попасть в логи

### 2. Docker Secrets - Production (Рекомендуется)

```yaml
# docker-compose.secrets.yml
secrets:
  postgres_password:
    external: true
    name: aquastream_postgres_password

services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_password
```

**Плюсы:**
- Пароли зашифрованы
- Не видны в процессах
- Audit trail

**Минусы:**
- Требует Docker Swarm
- Сложнее настройка

### 3. Файлы Секретов

```bash
# Создание защищенного файла
echo "strong_password" > /secrets/postgres_password.txt
chmod 600 /secrets/postgres_password.txt
```

## 🔄 Ротация Паролей

### Автоматическая Ротация

```bash
# Еженедельная ротация (cron)
0 2 * * 0 /path/to/aquastream/infra/scripts/generate-secrets.sh --auto
```

### Ручная Ротация

1. **Генерация новых паролей:**
   ```bash
   ./infra/scripts/generate-secrets.sh
   ```

2. **Применение изменений:**
   ```bash
   docker compose down
   docker compose up -d --force-recreate
   ```

3. **Проверка работоспособности:**
   ```bash
   docker compose ps
   ./run.sh health-check
   ```

## 🛡️ Безопасность в CI/CD

### GitHub Actions Secrets

```yaml
name: Deploy
env:
  POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
  ELASTIC_PASSWORD: ${{ secrets.ELASTIC_PASSWORD }}
```

### Переменные для Development

```bash
# .env.example - без реальных паролей
POSTGRES_PASSWORD=           # REQUIRED: Strong password
GRAFANA_ADMIN_PASSWORD=      # REQUIRED: Strong password
```

## 🔍 Аудит Безопасности

### Проверка Слабых Паролей

```bash
# Автоматическая проверка
./infra/scripts/update-passwords.sh

# Поиск слабых паролей в .env
grep -E "(password|PASSWORD)=(admin|postgres|test|demo|changeme|123)" .env
```

### Мониторинг Доступа

```bash
# Логи неудачных входов
docker logs postgres 2>&1 | grep "authentication failed"
docker logs grafana 2>&1 | grep "invalid credentials"
```

## 📚 Документация

### Связанные Файлы

- `infra/scripts/generate-secrets.sh` - Генерация паролей
- `infra/scripts/update-passwords.sh` - Обновление паролей
- `infra/docker/compose/.env.example` - Шаблон переменных
- `infra/docker/compose/docker-compose.secrets.yml` - Production конфигурация

### Prometheus Alerts

Настроены алерты для:
- Множественные неудачные аутентификации
- Подозрительная активность входов
- Использование слабых паролей (при обнаружении)

## ⚠️ Экстренные Ситуации

### Компрометация Паролей

1. **Немедленные действия:**
   ```bash
   # Остановка всех сервисов
   docker compose down
   
   # Генерация новых паролей
   ./infra/scripts/generate-secrets.sh --emergency
   ```

2. **Очистка логов:**
   ```bash
   docker system prune -a --volumes
   docker builder prune -a
   ```

3. **Аудит системы:**
   ```bash
   # Проверка логов доступа
   ./infra/scripts/security-audit.sh
   ```

### Контакты

В случае инцидентов безопасности:
- **DevOps Team**: ops@company.com
- **Security Team**: security@company.com

---

**📅 Последнее обновление**: 2025-08-02  
**👤 Автор**: AquaStream Security Team  
**🔖 Версия**: 1.0