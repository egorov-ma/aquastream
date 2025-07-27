# Event Service – Tech Notes

## application.yml (excerpt)
```yaml
server:
  port: 8082
grpc:
  server:
    port: 9090
  reflection:
    enabled: true
```

## gRPC Endpoints
- `CreateEvent` – создаёт событие
- `ListEvents` – пагинация
- `UpdateStatus` – смена статуса

## Kafka Topics
| Topic | Event |
|-------|-------|
| `event.events` | EventCreated, EventStatusChanged |

## DB Migrations path
`backend-event-db/src/main/resources/db/changelog/` 