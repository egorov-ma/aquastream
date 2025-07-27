# Crew Service – Tech Notes

## 1. application.yml (default)
```yaml
server:
  port: 8083
spring:
  application:
    name: crew-service
  datasource:
    url: jdbc:postgresql://localhost:5432/aquastream
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: validate
```

## 2. Kafka Topics
| Topic | Key | Value schema |
|-------|-----|--------------|
| `crew.events` | crewId (UUID) | CrewCreated, CrewMemberAdded, CrewMemberRemoved |

## 3. Avro Schemas (roadmap)
Файлы Avro будут храниться в `backend-crew-api/src/main/avro`.

## 4. Database migrations
Liquibase changelog – `backend-crew-db/src/main/resources/db/changelog/`. 