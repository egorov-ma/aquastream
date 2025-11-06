# Technical Architecture - AqStream

## Обзор архитектуры

### Архитектурный стиль
- **Microservices-ready монолит** - начинаем с модульного монолита с возможностью выделения сервисов
- **Layered Architecture** - четкое разделение на слои
- **Domain-Driven Design** - бизнес-логика в центре
- **API-First** - фронтенд и бэкенд разрабатываются независимо

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Clients                              │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Web Browser │  Mobile Web  │ Telegram Bot │  External API  │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       ▼              ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer (Nginx)                   │
└─────────────────────────────┬───────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │     │  Spring Boot  │     │ Telegram Bot │
│   Frontend   │────▶│   Backend     │◀────│   Service    │
└──────────────┘     └───────┬───────┘     └──────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  PostgreSQL  │     │    Redis     │     │    MinIO     │
│   Database   │     │    Cache     │     │ Object Store │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Backend Architecture

### Слоевая архитектура

```
├── Presentation Layer (Controllers)
│   ├── REST Controllers
│   ├── Exception Handlers
│   └── Request/Response DTOs
│
├── Application Layer (Services)
│   ├── Application Services
│   ├── Integration Services
│   └── Orchestration
│
├── Domain Layer (Core Business)
│   ├── Entities
│   ├── Value Objects
│   ├── Domain Services
│   └── Domain Events
│
├── Infrastructure Layer
│   ├── Persistence (JPA/Hibernate)
│   ├── External Services
│   ├── Message Queue
│   └── File Storage
│
└── Cross-Cutting Concerns
    ├── Security
    ├── Logging
    ├── Caching
    └── Validation
```

### Структура пакетов

```
com.aqstream
├── api
│   ├── controller
│   │   ├── AuthController.java
│   │   ├── EventController.java
│   │   ├── RegistrationController.java
│   │   └── ...
│   ├── dto
│   │   ├── request
│   │   ├── response
│   │   └── mapper
│   └── exception
│       ├── GlobalExceptionHandler.java
│       └── ApiException.java
│
├── application
│   ├── service
│   │   ├── EventService.java
│   │   ├── RegistrationService.java
│   │   └── NotificationService.java
│   ├── integration
│   │   ├── TelegramService.java
│   │   └── StorageService.java
│   └── scheduler
│       └── EventScheduler.java
│
├── domain
│   ├── model
│   │   ├── Event.java
│   │   ├── User.java
│   │   ├── Registration.java
│   │   └── ...
│   ├── repository
│   │   ├── EventRepository.java
│   │   └── UserRepository.java
│   ├── service
│   │   └── DomainEventService.java
│   └── event
│       ├── EventCreatedEvent.java
│       └── RegistrationConfirmedEvent.java
│
├── infrastructure
│   ├── config
│   │   ├── SecurityConfig.java
│   │   ├── WebConfig.java
│   │   ├── CacheConfig.java
│   │   └── AsyncConfig.java
│   ├── persistence
│   │   ├── entity
│   │   └── repository
│   ├── security
│   │   ├── JwtTokenProvider.java
│   │   └── CustomUserDetailsService.java
│   └── storage
│       └── MinioService.java
│
└── common
    ├── annotation
    ├── util
    └── constant
```

## Frontend Architecture

### Component Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected routes
│   │   ├── events/
│   │   ├── profile/
│   │   └── analytics/
│   ├── api/                 # API routes
│   └── layout.tsx
│
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── features/            # Feature-specific components
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventList.tsx
│   │   │   └── EventForm.tsx
│   │   └── auth/
│   └── shared/              # Shared components
│
├── lib/
│   ├── api/                 # API client
│   │   ├── client.ts
│   │   └── endpoints/
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   └── validations/         # Zod schemas
│
├── contexts/                # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
└── types/                   # TypeScript types
    ├── api.ts
    └── models.ts
```

### State Management

```typescript
// Используем React Context + Hooks для глобального состояния
interface AppState {
  user: User | null;
  events: Event[];
  notifications: Notification[];
}

// Context для аутентификации
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hooks для работы с API
const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Логика загрузки и управления событиями
};
```

## Database Design

### Схема партиционирования

```sql
-- Партиционирование таблицы событий по месяцам
CREATE TABLE events (
    id UUID PRIMARY KEY,
    start_date TIMESTAMP NOT NULL,
    -- другие поля
) PARTITION BY RANGE (start_date);

CREATE TABLE events_2024_01 PARTITION OF events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Автоматическое создание партиций
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
    start_date date;
    end_date date;
    partition_name text;
BEGIN
    -- Логика создания партиций
END;
$$ LANGUAGE plpgsql;
```

### Индексная стратегия

```sql
-- Композитные индексы для частых запросов
CREATE INDEX idx_events_location_date 
    ON events(location_lat, location_lng, start_date);

-- Partial индексы для оптимизации
CREATE INDEX idx_active_events 
    ON events(start_date) 
    WHERE status = 'PUBLISHED';

-- GIN индексы для полнотекстового поиска
CREATE INDEX idx_events_search 
    ON events USING gin(
        to_tsvector('russian', title || ' ' || description)
    );
```

## Security Architecture

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   API    │────▶│   Auth   │
│          │◀────│  Gateway │◀────│  Service │
└──────────┘     └──────────┘     └──────────┘
     │                 │                 │
     │   1. Login      │                 │
     │─────────────────▶                 │
     │                 │  2. Validate    │
     │                 │─────────────────▶
     │                 │                 │
     │                 │  3. Generate    │
     │                 │     JWT         │
     │                 │◀─────────────────
     │  4. Return      │                 │
     │     tokens      │                 │
     │◀─────────────────                 │
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "role": "ORGANIZER",
    "permissions": ["event.create", "event.edit"],
    "exp": 1234567890,
    "iat": 1234567890,
    "jti": "token-uuid"
  }
}
```

### Security Headers

```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        return http
            .headers(headers -> headers
                .frameOptions().deny()
                .xssProtection().and()
                .contentSecurityPolicy("default-src 'self'")
            )
            .cors(cors -> cors.configurationSource(corsConfig()))
            .csrf().disable()
            .build();
    }
}
```

## Caching Strategy

### Multi-Level Cache

```
┌─────────────┐
│   Browser   │ ← L1: Browser Cache (Static Assets)
│    Cache    │     - Cache-Control headers
└──────┬──────┘     - 1 year for versioned assets
       │
┌──────▼──────┐
│     CDN     │ ← L2: CDN Cache (Images, CSS, JS)
│    Cache    │     - CloudFlare/Nginx
└──────┬──────┘     - Geographic distribution
       │
┌──────▼──────┐
│Application  │ ← L3: Application Cache
│    Cache    │     - Redis for session data
└──────┬──────┘     - API responses (5-60 min)
       │
┌──────▼──────┐
│  Database   │ ← L4: Database Cache
│    Cache    │     - Query result cache
└─────────────┘     - Prepared statements
```

### Redis Cache Implementation

```java
@Service
public class EventCacheService {
    @Autowired
    private RedisTemplate<String, Event> redisTemplate;
    
    @Cacheable(value = "events", key = "#id")
    public Event getEvent(String id) {
        // Загрузка из БД если нет в кэше
    }
    
    @CacheEvict(value = "events", key = "#event.id")
    public void updateEvent(Event event) {
        // Обновление и очистка кэша
    }
    
    @Scheduled(fixedDelay = 3600000)
    @CacheEvict(value = "events", allEntries = true)
    public void evictAllEvents() {
        // Периодическая очистка
    }
}
```

## Monitoring & Observability

### Metrics Collection

```yaml
# Prometheus metrics
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: aqstream
      environment: ${ENVIRONMENT}
```

### Logging Strategy

```java
@Aspect
@Component
public class LoggingAspect {
    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);
    
    @Around("@annotation(Loggable)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        
        Object proceed = joinPoint.proceed();
        
        long executionTime = System.currentTimeMillis() - start;
        
        logger.info("{} executed in {} ms", 
            joinPoint.getSignature(), executionTime);
        
        return proceed;
    }
}
```

### Health Checks

```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    @Autowired
    private DataSource dataSource;
    
    @Override
    public Health health() {
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(1)) {
                return Health.up()
                    .withDetail("database", "PostgreSQL")
                    .build();
            }
        } catch (Exception e) {
            return Health.down(e).build();
        }
        return Health.down().build();
    }
}
```

## Deployment Architecture

### Container Structure

```dockerfile
# Backend Dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./gradlew bootJar

FROM eclipse-temurin:21-jre-alpine
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
      - frontend

  backend:
    build: ./backend
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8080

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=aqstream
      - POSTGRES_USER=aqstream
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Kubernetes Ready

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aqstream-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aqstream-backend
  template:
    metadata:
      labels:
        app: aqstream-backend
    spec:
      containers:
      - name: backend
        image: aqstream/backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "kubernetes"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
```

## Performance Optimization

### Backend Optimizations

```java
// Connection Pool Configuration
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000

// Async Processing
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        return executor;
    }
}

// Batch Processing
@Service
public class BatchService {
    @Transactional
    public void processBatch(List<Registration> registrations) {
        jdbcTemplate.batchUpdate(
            "UPDATE registrations SET status = ? WHERE id = ?",
            new BatchPreparedStatementSetter() {
                // Implementation
            }
        );
    }
}
```

### Frontend Optimizations

```typescript
// Code Splitting
const EventForm = lazy(() => import('./components/EventForm'));

// Image Optimization
import Image from 'next/image';

<Image
  src="/event-cover.jpg"
  alt="Event"
  width={800}
  height={400}
  loading="lazy"
  placeholder="blur"
/>

// API Call Optimization
const { data, error } = useSWR(
  '/api/events',
  fetcher,
  {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  }
);
```

## Disaster Recovery

### Backup Strategy

```bash
#!/bin/bash
# Automated backup script

# Database backup
pg_dump -h localhost -U aqstream -d aqstream \
  -f /backup/db/aqstream_$(date +%Y%m%d_%H%M%S).sql

# MinIO backup
mc mirror --overwrite minio/aqstream /backup/files/

# Redis backup
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb /backup/redis/

# Upload to cloud storage
aws s3 sync /backup/ s3://aqstream-backups/
```

### Recovery Procedures

1. **Database Recovery**
   ```sql
   -- Point-in-time recovery
   RESTORE DATABASE aqstream 
   FROM '/backup/db/aqstream_20240101.sql'
   WITH RECOVERY UNTIL TIME '2024-01-01 12:00:00';
   ```

2. **Application Recovery**
   - Blue-Green deployment для zero-downtime
   - Rollback procedures через Git tags
   - Feature flags для быстрого отключения функций

## Technology Stack Summary

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3.2
- **Build Tool**: Gradle
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Storage**: MinIO
- **Migration**: Liquibase
- **Testing**: JUnit 5, Testcontainers

### Frontend
- **Language**: TypeScript 5
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Context + Hooks
- **Forms**: React Hook Form + Zod
- **Testing**: Jest, React Testing Library

### Infrastructure
- **Container**: Docker
- **Orchestration**: Kubernetes (готовность)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (optional)
- **API Gateway**: Nginx
