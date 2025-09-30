# Безопасность

## Обзор

Многоуровневая система безопасности включает аутентификацию JWT, RBAC авторизацию, rate limiting, security headers и мониторинг уязвимостей.

## JWT Аутентификация

### Алгоритм подписи

- **Алгоритм**: HS512 (HMAC with SHA-512)
- **Secret**: Настраивается через `JWT_SECRET` env variable
- **Ротация ключей**: Рекомендуется каждые 90 дней

### Token Structure

**Access Token**:
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "username": "user@example.com",
  "role": "USER",
  "iat": 1704067200,
  "exp": 1704070800,
  "jti": "at-unique-token-id"
}
```

**Параметры**:
- `sub`: User ID
- `role`: USER | ORGANIZER | ADMIN
- `exp`: Expiration (1 час)
- `jti`: Для revoke механизма

### Token Storage

**Frontend**:
- Access token: `localStorage` (для удобства)
- Refresh token: `httpOnly cookie` (рекомендуется для production)

**Backend**:
- Refresh sessions в PostgreSQL (`user.refresh_sessions`)
- Revoked tokens в Redis (blacklist)

## RBAC (Role-Based Access Control)

### Роли

| Роль | Уровень | Типичные действия |
|------|---------|-------------------|
| **Guest** | 0 | Просмотр публичного контента |
| **User** | 1 | Бронирование, оплата |
| **Organizer** | 2 | Управление событиями |
| **Admin** | 3 | Системное управление |

См. [Authentication Guide](authentication.md) для детальных прав.

### Проверка прав

```java
// В Gateway
if (isProtectedRoute(path) && !hasValidJWT(request)) {
    return unauthorized();
}

// В Service
@PreAuthorize("hasRole('ORGANIZER')")
public Event createEvent(CreateEventRequest request) {
    // ...
}

// Или вручную
if (!"ORGANIZER".equals(role) && !"ADMIN".equals(role)) {
    throw new ForbiddenException();
}
```

## Rate Limiting

### Bucket4j (Soft Limits)

**Настройка в Gateway**:

```java
// Лимиты по endpoint'ам
@RateLimiter(limit = 10, interval = 60)  // 10 req/min
POST /api/auth/login

@RateLimiter(limit = 30, interval = 60)  // 30 req/min  
POST /api/payments/*

@RateLimiter(limit = 100, interval = 60) // 100 req/min
GET /api/events
```

### Конфигурация

```yaml
# application.yml (Gateway)
rate-limit:
  enabled: true
  default-capacity: 100
  default-refill-tokens: 100
  default-refill-duration: 60s
  
  rules:
    - path: /api/auth/**
      capacity: 10
      refill-tokens: 10
      refill-duration: 60s
      
    - path: /api/payments/**
      capacity: 30
      refill-tokens: 30
      refill-duration: 60s
```

### Storage

- **Redis**: хранение bucket состояний
- **Per IP**: для неавторизованных
- **Per User**: для авторизованных

### Response при превышении

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067260
Retry-After: 60

{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again in 60 seconds."
}
```

## Security Headers

### Production Headers

```yaml
# Настроено в Gateway
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### CORS

```yaml
# Gateway CORS configuration
cors:
  allowed-origins:
    - https://aquastream.com
    - https://app.aquastream.com
  allowed-methods:
    - GET
    - POST
    - PUT
    - DELETE
    - PATCH
  allowed-headers:
    - Authorization
    - Content-Type
    - X-Request-ID
  exposed-headers:
    - X-Total-Count
    - X-Page-Number
  max-age: 3600
  allow-credentials: true
```

## Password Security

### Hashing

```java
// BCrypt с strength 12
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
String hashedPassword = encoder.encode(rawPassword);
```

### Требования к паролям

```java
// Валидация
@Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{12,}$",
    message = "Password must be at least 12 characters with uppercase, lowercase, digit and special char"
)
private String password;
```

**Правила**:
- Минимум 12 символов
- Хотя бы одна заглавная буква
- Хотя бы одна строчная буква
- Хотя бы одна цифра
- Хотя бы один спецсимвол

## Input Validation

### Bean Validation

```java
public class CreateEventRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200)
    private String title;
    
    @NotNull
    @Future(message = "Event must be in the future")
    private LocalDateTime dateStart;
    
    @Positive
    @Max(10000)
    private Integer capacity;
    
    @Email
    private String contactEmail;
}
```

### SQL Injection Protection

- ✅ JPA/Hibernate параметризованные запросы
- ✅ PreparedStatement для нативных SQL
- ❌ String concatenation в queries

```java
// ✅ Безопасно
@Query("SELECT e FROM Event e WHERE e.title LIKE %:search%")
List<Event> findByTitleContaining(@Param("search") String search);

// ❌ Опасно
String sql = "SELECT * FROM events WHERE title = '" + userInput + "'";
```

## Secrets Management

### Environment Variables

```bash
# Критичные секреты через env
JWT_SECRET=<strong-secret-key>
POSTGRES_PASSWORD=<db-password>
REDIS_PASSWORD=<redis-password>
TELEGRAM_BOT_TOKEN=<bot-token>
YOOKASSA_SECRET_KEY=<payment-secret>
```

### Best Practices

- ✅ Никогда не коммитьте секреты в Git
- ✅ Используйте `.env.example` с placeholder значениями
- ✅ Используйте GitHub Secrets для CI/CD
- ✅ Ротация секретов каждые 90 дней (JWT, DB passwords)
- ✅ Разные секреты для dev/stage/prod

### Секреты в Docker

```yaml
# docker-compose.yml
services:
  backend-user:
    secrets:
      - jwt_secret
      - db_password
      
secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  db_password:
    file: ./secrets/db_password.txt
```

## Security Scanning

### OWASP Dependency Check

```bash
# Сканирование зависимостей
./gradlew dependencyCheckAnalyze

# Отчеты: build/reports/dependency-check-report.html
# SARIF: build/reports/dependency-check-report.sarif

# Suppression file: owasp-suppression.xml
```

### Trivy (Docker Images)

```bash
# Локальный scan
make scan

# Результаты: backend-infra/reports/scan/

# В CI автоматически на PR/push
```

### CodeQL

- Автоматически в GitHub Actions
- Сканирует: Java, JavaScript/TypeScript, Python
- Schedule: еженедельно
- Результаты: GitHub Security tab

## Container Security

### Политики безопасности

```yaml
# docker-compose.yml
services:
  backend-user:
    user: "1000:1000"              # Non-root user
    read_only: true                # Read-only filesystem
    tmpfs:
      - /tmp                       # Writable tmp только
    cap_drop:
      - ALL                        # Drop all capabilities
    security_opt:
      - no-new-privileges:true     # No privilege escalation
```

### Dockerfile Best Practices

```dockerfile
# Multi-stage build
FROM eclipse-temurin:21-jdk AS builder
# ... build ...

FROM eclipse-temurin:21-jre
# Не используем root
RUN groupadd -r aquastream && useradd -r -g aquastream aquastream
USER aquastream

# Read-only rootfs
VOLUME /tmp
COPY --from=builder --chown=aquastream:aquastream /app/app.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Audit Logging

### Audit Log (БД)

```sql
CREATE TABLE user.audit_log (
    id UUID PRIMARY KEY,
    actor_user_id UUID,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    payload JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Логируемые действия

- Login/Logout
- Password change
- Role change (admin)
- Создание/удаление событий (organizer)
- Подтверждение оплат
- Критичные операции с данными

## Best Practices

### Чек-лист безопасности

- [x] JWT с сильным секретом и коротким TTL
- [x] Password hashing (BCrypt strength 12)
- [x] HTTPS в production
- [x] Security headers настроены
- [x] Rate limiting включен
- [x] Input validation везде
- [x] SQL injection защита (JPA)
- [x] Dependency scanning (OWASP)
- [x] Container security (non-root, read-only)
- [x] Audit logging критичных операций
- [x] Secrets не в Git

### Регулярные проверки

- **Еженедельно**: CodeQL scan
- **При каждом PR**: Trivy scan
- **Ежемесячно**: OWASP dependency check
- **Ежеквартально**: Penetration testing
- **Постоянно**: Dependabot alerts

## Incident Response

При обнаружении уязвимости:

1. Оценить severity (Critical/High/Medium/Low)
2. Создать private security advisory в GitHub
3. Разработать fix
4. Протестировать
5. Деплой hotfix
6. Публикация advisory

См. [Incident Response Runbook](../../operations/runbooks/incident-response.md)

## См. также

- [Authentication Guide](authentication.md) - JWT и RBAC
- [Security Policy](../../operations/policies/security.md) - политика безопасности
- [CI/CD](../../operations/ci-cd.md) - security scanning в CI
