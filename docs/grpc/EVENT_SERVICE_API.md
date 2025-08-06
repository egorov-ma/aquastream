# Event Service gRPC API Documentation

## Обзор

Event Service предоставляет gRPC API для управления событиями в системе AquaStream. Сервис поддерживает создание событий с валидацией входных данных и обработкой ошибок.

## Endpoints

### gRPC Server
- **Host**: `localhost` (development), `event-service` (Docker)
- **Port**: `9090`
- **Protocol**: gRPC

### REST Gateway  
- **Base URL**: `http://localhost:8082/api/v1/events`
- **Protocol**: HTTP/REST
- **Content-Type**: `application/json`

## API Methods

### CreateEvent

Создает новое событие с указанными параметрами.

#### gRPC Signature
```protobuf
rpc CreateEvent (EventRequest) returns (EventResponse);
```

#### REST Endpoint
```http
POST /api/v1/events
```

#### Request Schema

**gRPC Message: EventRequest**
```protobuf
message EventRequest {
    string name = 1;        // Название события
    string description = 2; // Описание события (опционально)
}
```

**REST JSON:**
```json
{
    \"name\": \"string\",        // Обязательное поле
    \"description\": \"string\"  // Опциональное поле
}
```

#### Response Schema

**gRPC Message: EventResponse**
```protobuf
message EventResponse {
    int64 id = 1;      // Уникальный ID события
    string status = 2; // Статус события
}
```

**REST JSON:**
```json
{
    \"id\": 12345,
    \"status\": \"CREATED\"
}
```

## Validation Rules

### Event Name
- **Required**: Да
- **Min Length**: 1 символ
- **Max Length**: 255 символов
- **Pattern**: Алфавитно-цифровые символы, знаки пунктуации и пробелы
- **Error**: `INVALID_ARGUMENT` при нарушении правил

### Event Description  
- **Required**: Нет
- **Max Length**: 1000 символов
- **Error**: `INVALID_ARGUMENT` при превышении лимита

## Error Handling

### gRPC Status Codes

| Status Code | Description | Причина |
|-------------|-------------|---------|
| `OK` | Успешное выполнение | Событие создано |
| `INVALID_ARGUMENT` | Некорректные данные | Ошибка валидации |
| `INTERNAL` | Внутренняя ошибка | Ошибка сервера |

### REST HTTP Status Codes

| HTTP Code | Description | Причина |
|-----------|-------------|---------|
| `200` | OK | Событие создано |
| `400` | Bad Request | Ошибка валидации |
| `500` | Internal Server Error | Ошибка сервера |

## Examples

### Успешный запрос

**gRPC (Java):**
```java
EventRequest request = EventRequest.newBuilder()
    .setName(\"Конференция разработчиков\")
    .setDescription(\"Ежегодное мероприятие для IT-специалистов\")
    .build();

EventResponse response = eventServiceStub.createEvent(request);
System.out.println(\"Event ID: \" + response.getId());
```

**REST (cURL):**
```bash
curl -X POST http://localhost:8082/api/v1/events \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"name\": \"Конференция разработчиков\",
    \"description\": \"Ежегодное мероприятие для IT-специалистов\"
  }'
```

**Response:**
```json
{
    \"id\": 1704067200000,
    \"status\": \"CREATED\"
}
```

### Ошибка валидации

**Request:**
```json
{
    \"name\": \"\",
    \"description\": \"Описание события\"
}
```

**gRPC Error:**
```
Status: INVALID_ARGUMENT
Description: \"Event name is required and cannot be empty\"
```

**REST Error:**
```json
{
    \"error\": \"Bad Request\",
    \"message\": \"Event name is required and cannot be empty\",
    \"status\": 400
}
```

## Configuration

### Application Properties

```yaml
# gRPC Server Configuration
grpc:
  server:
    port: 9090
  reflection:
    enabled: true

# gRPC UI (для тестирования)
grpcui:
  enabled: true
  path: /grpcui/
```

### Docker Configuration

```yaml
event-service:
  expose: ['8082', '9090']  # HTTP + gRPC ports
  environment:
    GRPC_SERVER_PORT: 9090
```

## Testing

### gRPC Testing Tools

1. **grpcurl** - command-line tool
```bash
grpcurl -plaintext localhost:9090 list
grpcurl -plaintext localhost:9090 org.aquastream.event.EventService/CreateEvent
```

2. **gRPC UI** - web interface
```
http://localhost:8082/grpcui/
```

3. **Postman** - с поддержкой gRPC
4. **BloomRPC** - GUI клиент для gRPC

### Integration Tests

Тесты находятся в:
- `src/test/java/org/aquastream/event/grpc/EventServiceImplTest.java`
- Используют `@GrpcTest` и `Testcontainers`

## Мониторинг

### Health Check
- **HTTP**: `GET /actuator/health`
- **gRPC**: Используйте `grpc.health.v1.Health/Check`

### Metrics
- **Prometheus**: `/actuator/prometheus`
- **Custom gRPC metrics**: Встроены в interceptors

## Security

- gRPC server использует **plaintext** в development
- В production рекомендуется TLS
- Валидация всех входных данных
- Rate limiting через Spring Boot Actuator

## Versioning

- **Current Version**: v1.0.0
- **API Version**: v1
- **Protobuf**: proto3 syntax
- **Backward Compatibility**: Поддерживается через protobuf field numbers"