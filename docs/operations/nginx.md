# Nginx Edge Proxy

---
title: Nginx Edge Proxy
tags: [operations, nginx, proxy]
summary: Управление фронтовым reverse proxy, завершение TLS и проксирование запросов к Spring Gateway.
---

## Обзор

Nginx работает как внешний reverse proxy перед Spring Gateway. Он завершает TLS, применяет CORS и базовые лимиты по IP, а затем проксирует трафик на `backend-gateway:8080`. Конфигурация лежит в `backend-infra/docker/compose/nginx.conf`.

## Структура

```
backend-infra/docker/compose/
├── docker-compose.yml
├── nginx.conf            # основной конфиг
└── nginx/                # дополнительные файлы, TLS сертификаты (опционально)
```

## Основные задачи

- TLS termination (сертификаты можно разместить в `backend-infra/docker/compose/nginx/`)
- CORS и security headers
- Rate limiting по IP/URI (базовые сценарии)
- Проксирование `/api` и статических файлов на gateway

## Типовой конфиг

```nginx
http {
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;

  upstream backend_gateway {
    server backend-gateway:8080;
  }

  server {
    listen 80;
    server_name localhost; # заменить на реальный домен

    add_header Access-Control-Allow-Origin "https://aquastream.app" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Authorization, Content-Type";

    location /api/ {
      limit_req zone=api_limit;
      proxy_pass http://backend_gateway;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $remote_addr;
    }

    location / {
      proxy_pass http://frontend:3000;
    }
  }
}
```

## Команды

```bash
# Проверить конфиг на ошибки (в контейнере)
docker compose exec nginx nginx -t

# Перечитать конфиг без остановки
docker compose exec nginx nginx -s reload

# Перезапуск контейнера
make restart SERVICE=nginx

# Проверить, что прокси отвечает
curl -I http://localhost
```

## TLS заметки

- Сертификаты (`fullchain.pem`, `privkey.pem`) можно разместить в `backend-infra/docker/compose/nginx/tls/` и смонтировать в контейнер.
- Для Let's Encrypt используйте certbot + автоматический `nginx -s reload` после обновления сертификатов.

## Troubleshooting

| Симптом | Проверка | Решение |
|---------|----------|---------|
| 502 Bad Gateway | `docker logs nginx` показывает upstream errors | Проверить `backend-gateway` health, `docker compose ps` |
| 403/401 | Проверить CORS/headers в `nginx.conf` | Убедиться, что `Access-Control-Allow-*` совпадают с реальными origin |
| Nginx не стартует | `docker compose logs nginx` + `nginx -t` | Исправить конфиг, пересобрать контейнер |
| HTTPS не работает | Проверить пути к сертификатам | Убедиться, что `listen 443 ssl` и файлы доступны |

## См. также

- [Infrastructure](infrastructure.md)
- [Deployment](deployment.md)
- [Gateway operations](../backend/gateway/operations.md)
- [Service Restart runbook](runbooks/service-restart.md)
