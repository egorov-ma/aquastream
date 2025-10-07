# Gateway — Operations

## Обзор

**Порт**: 8080
**Upstream**: Nginx (`:80/443` → `:8080`)
**Env**: `JWT_SECRET`, `REDIS_HOST`, `REDIS_PORT`

## Запуск

```bash
make up-dev
curl http://localhost:8080/actuator/health

# Через Nginx
curl http://localhost/actuator/health
```

## Конфигурация

| Компонент | Настройка | Файл |
|-----------|-----------|------|
| **Nginx upstream** | `backend-gateway:8080` | `backend-infra/docker/compose/nginx.conf` |
| **Rate limiting** | `60/min` default, `10/min` для `/api/auth/*` | `application.yml` |
| **CORS** | `allowed-origins: [https://aquastream.com]` | `application.yml` |
| **JWT** | `JWT_SECRET`, access TTL 15 минут | Environment |

## Health Aggregation

**Endpoint**: `GET /api/admin/health`

**Проверка при деградации**:
```bash
# Проверить каждый сервис
curl http://localhost:8101/actuator/health  # User
curl http://localhost:8102/actuator/health  # Event
curl http://localhost:8103/actuator/health  # Crew
curl http://localhost:8104/actuator/health  # Payment
curl http://localhost:8105/actuator/health  # Notification
curl http://localhost:8106/actuator/health  # Media
```

## Мониторинг

| Метрика | Описание |
|---------|----------|
| `gateway.requests.total` | Общее количество запросов |
| `gateway.jwt.validation.failures` | Ошибки JWT валидации |
| `gateway.rate_limit.exceeded` | Превышения rate limits |

**Логи**: `docker logs backend-gateway | grep ERROR`

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| **502 Bad Gateway** | Проверить `docker ps \| grep backend-gateway`, перезапустить: `docker compose restart backend-gateway` |
| **JWT validation fails** | Проверить `JWT_SECRET` синхронизирован с User service |
| **CORS errors** | Проверить `allowed-origins` в `application.yml` |
| **Rate limit errors** | Проверить Redis подключение, увеличить лимиты если легитимный трафик |

## Перезапуск

```bash
# Gateway только
docker compose restart backend-gateway

# С Nginx
docker compose restart nginx backend-gateway
```

---

См. [README](README.md), [Business Logic](business-logic.md), [API](api.md).