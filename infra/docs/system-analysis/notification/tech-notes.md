# Notification Service – Tech Notes

## application.yml (excerpt)
```yaml
server:
  port: 8084
spring:
  kafka:
    bootstrap-servers: localhost:9092
```

## Telegram Bot
- Библиотека: `org.telegram:telegrambots-spring-boot-starter`
- webhook URL: `/telegram/webhook`

## REST On-Demand
- `POST /api/v1/notifications/telegram`

## DB Tables
`notification`, `notification_template` 