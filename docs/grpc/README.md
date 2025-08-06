# AquaStream gRPC API Documentation

## Обзор

AquaStream использует gRPC для высокопроизводительного межсервисного взаимодействия, дополняя REST API для внутренних операций.

## Архитектура

```
┌─────────────────┐    REST     ┌─────────────────┐    gRPC    ┌─────────────────┐
│   Frontend      │────────────▶│   API Gateway   │────────────▶│   Microservices │
│   (React)       │             │   (Port 8080)   │             │   (gRPC + HTTP) │
└─────────────────┘             └─────────────────┘             └─────────────────┘
                                                                          │
                                ┌─────────────────┐                      │
                                │   Load Balancer │◀─────────────────────┘
                                │   (Nginx)       │
                                └─────────────────┘
```

## Сервисы с gRPC поддержкой

| Сервис | HTTP Port | gRPC Port | Status | Documentation |
|--------|-----------|-----------|--------|---------------|
| **Event Service** | 8082 | 9090 | ✅ Active | [EVENT_SERVICE_API.md](./EVENT_SERVICE_API.md) |
| **User Service** | 8081 | 9091 | 🚧 Planned | Coming soon |
| **Crew Service** | 8083 | 9092 | 🚧 Planned | Coming soon |
| **Notification Service** | 8084 | 9093 | 🚧 Planned | Coming soon |

## Quick Start

### 1. Development Setup

```bash
# Запустить все сервисы
./gradlew bootRun

# Запустить только Event Service
./gradlew :backend-event:backend-event-service:bootRun
```

### 2. Docker Setup

```bash
# Билд и запуск всех сервисов
docker-compose -f infra/docker/compose/docker-compose.yml up --build

# Проверить gRPC endpoints
grpcurl -plaintext localhost:9090 list
```

### 3. Testing gRPC APIs

#### Using gRPC UI
```
http://localhost:8082/grpcui/
```

#### Using grpcurl
```bash
# Список доступных сервисов
grpcurl -plaintext localhost:9090 list

# Вызов метода
grpcurl -plaintext -d '{\"name\":\"Test Event\", \"description\":\"Test Description\"}' \\
  localhost:9090 org.aquastream.event.EventService/CreateEvent
```

#### Using REST Gateway
```bash
curl -X POST http://localhost:8082/api/v1/events \\
  -H \"Content-Type: application/json\" \\
  -d '{\"name\":\"Test Event\",\"description\":\"Test Description\"}'
```

## Development Guidelines

### 1. Proto Files

```protobuf
syntax = \"proto3\";

package org.aquastream.service;

import \"google/api/annotations.proto\";

service YourService {
    // Добавляйте подробные комментарии
    rpc YourMethod (YourRequest) returns (YourResponse) {
        option (google.api.http) = {
            post: \"/api/v1/your-endpoint\"
            body: \"*\"
        };
    }
}
```

### 2. Validation

```java
@GrpcService
public class YourServiceImpl extends YourServiceGrpc.YourServiceImplBase {
    
    @Override
    public void yourMethod(YourRequest request, StreamObserver<YourResponse> responseObserver) {
        try {
            // Валидация входных данных
            validateRequest(request);
            
            // Бизнес-логика
            YourResponse response = processRequest(request);
            
            // Ответ
            responseObserver.onNext(response);
            responseObserver.onCompleted();
            
        } catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                .withDescription(e.getMessage())
                .asRuntimeException());
        }
    }
}
```

### 3. Error Handling

```java
// Interceptor для глобальной обработки ошибок
@GrpcGlobalServerInterceptor
public class GlobalExceptionHandler implements ServerInterceptor {
    // Обработка всех исключений
}
```

## Configuration

### application.yml
```yaml
grpc:
  server:
    port: 9090
  reflection:
    enabled: true
    
grpcui:
  enabled: true
  path: /grpcui/
```

### Docker
```yaml
services:
  your-service:
    expose: ['8080', '9090']  # HTTP + gRPC
    environment:
      GRPC_SERVER_PORT: 9090
```

## Monitoring & Observability

### Health Checks
- HTTP: `/actuator/health`
- gRPC: `grpc.health.v1.Health/Check`

### Metrics
- Prometheus: `/actuator/prometheus`
- Custom gRPC metrics через interceptors
- Request/response tracing

### Logging
```yaml
logging:
  level:
    net.devh.boot.grpc: INFO
    org.aquastream: INFO
```

## Security

### Development
- Plaintext connections
- No authentication (internal services)

### Production (Recommended)
- TLS encryption
- JWT authentication
- Rate limiting
- Input validation

## Testing Strategy

### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class YourServiceImplTest {
    // Mock dependencies
    // Test business logic
}
```

### Integration Tests
```java
@SpringBootTest
@Testcontainers
class YourServiceIntegrationTest {
    // Test full gRPC flow
    // Use TestContainers for dependencies
}
```

### Contract Tests
- Proto file validation
- Backward compatibility testing

## Performance

### Benchmarks
- gRPC vs REST comparison
- Load testing with `ghz`
- Memory usage profiling

### Optimization
- Connection pooling
- Message compression
- Async/streaming operations

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check port usage
   lsof -i :9090
   ```

2. **Connection refused**
   ```bash
   # Verify service is running
   grpcurl -plaintext localhost:9090 grpc.health.v1.Health/Check
   ```

3. **Proto compilation errors**
   ```bash
   # Clean and rebuild
   ./gradlew clean generateProto
   ```

### Debug Mode
```yaml
logging:
  level:
    net.devh.boot.grpc: DEBUG
    io.grpc: DEBUG
```

## Roadmap

- [ ] **Q1 2024**: User Service gRPC API
- [ ] **Q2 2024**: Crew Service gRPC API  
- [ ] **Q3 2024**: Notification Service gRPC API
- [ ] **Q4 2024**: Stream processing with gRPC streaming

## Contributing

1. Создайте `.proto` файлы с подробной документацией
2. Реализуйте service implementation с валидацией
3. Добавьте REST Gateway для HTTP доступа
4. Напишите тесты (unit + integration)
5. Обновите документацию

## Support

- **Documentation**: `/docs/grpc/`
- **Issues**: GitHub Issues
- **Discussion**: Team Slack #grpc-api"