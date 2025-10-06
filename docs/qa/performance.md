---
title: Performance Testing
summary: Нагрузочное тестирование и performance benchmarks для AquaStream
tags: [qa, performance, load-testing, benchmarks, k6]
---

# Performance Testing

## Обзор

Нагрузочное тестирование и базовые показатели производительности системы AquaStream.

## Load Testing

### Цели

- Определить максимальную пропускную способность
- Найти узкие места в производительности
- Проверить стабильность под нагрузкой
- Валидировать требования по производительности

### Инструменты

- **K6**: основной инструмент нагрузочного тестирования
- **Grafana**: визуализация метрик
- **Prometheus**: сбор метрик
- **JMeter**: альтернативный инструмент (опционально)

### Типы нагрузочных тестов

**1. Smoke Test**
- Цель: базовая проверка работоспособности
- Нагрузка: 1-5 users, 1 минута
- Запуск: `k6 run k6-smoke.js`

**2. Load Test**
- Цель: проверка при обычной нагрузке
- Нагрузка: 100-500 users, 10 минут, ramp-up 2 мин
- Stages: 2m→100, 5m→500, 2m→100, 1m→0

**3. Stress Test**
- Цель: найти предел системы
- Нагрузка: постепенно до 2000+ users, 20 минут
- Stages: 5m→500, 5m→1000, 5m→2000, 5m→0

**4. Spike Test**
- Цель: проверка при резком скачке
- Нагрузка: резкий рост от 10 до 1000 users, 5 минут
- Stages: 10s→10, 1m→1000, 3m→1000, 10s→10

**5. Soak Test**
- Цель: стабильность длительной работы
- Нагрузка: 300 users (константа), 4 часа

### Тестовые сценарии

**Сценарий 1: Просмотр событий**
```javascript
export default function () {
  const res = http.get('https://api.aquastream.com/api/events');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

**Сценарий 2: Аутентификация**
```javascript
const payload = JSON.stringify({
  email: 'test@example.com',
  password: 'password123',
});
const res = http.post(url, payload, { headers: { 'Content-Type': 'application/json' }});
check(res, {
  'login successful': (r) => r.status === 200,
  'has auth token': (r) => r.json('token') !== '',
});
```

**Сценарий 3: Создание бронирования**
```javascript
// 1. Login → 2. Get event → 3. Create booking
const bookingRes = http.post(
  'https://api.aquastream.com/api/bookings',
  JSON.stringify({ eventId: 1, seats: 2 }),
  { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }}
);
check(bookingRes, {
  'booking created': (r) => r.status === 201,
});
```

### Метрики для мониторинга

**Application Metrics**:
- Response Time: p95 < 500ms, p99 < 1000ms
- Throughput: > 1000 RPS
- Error Rate: < 1%
- Success Rate: > 99%

**System Metrics**:
- CPU Usage: < 70%
- Memory Usage: < 80%
- Database Connections: < 80% от pool
- Network I/O: bandwidth utilization

**K6 Thresholds**:
```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>100'],
  },
};
```

### Критерии успеха

| Endpoint | p95 Response Time | Throughput |
|----------|-------------------|------------|
| GET /api/events | < 300ms | > 500 RPS |
| POST /api/auth/login | < 500ms | > 200 RPS |
| POST /api/bookings | < 800ms | > 100 RPS |
| GET /api/users/me | < 200ms | > 1000 RPS |

**Стабильность**:
- Zero downtime
- Error rate < 1%
- Memory leaks: отсутствуют
- Connection pool exhaustion: отсутствует

### Запуск

```bash
k6 run k6-smoke.js     # Smoke test
k6 run k6-load.js      # Load test
k6 run k6-stress.js    # Stress test

# С выводом в Grafana
k6 run --out influxdb=http://localhost:8086 k6-load.js

# Cloud execution
k6 cloud k6-load.js
```

### Оптимизация

**Backend**:
- Database query optimization
- Connection pool tuning
- Caching (Redis)
- Load balancing

**Database**:
- Index optimization
- Query plan analysis
- Connection pooling
- Read replicas

**Infrastructure**:
- Horizontal scaling
- Resource allocation
- Network optimization

### График

- **Smoke test**: при каждом deploy
- **Load test**: еженедельно
- **Stress test**: перед мажорными релизами
- **Soak test**: ежемесячно

## Performance Benchmarks

### Backend Performance

#### API Endpoints

| Endpoint | Method | p50 | p95 | p99 | Target |
|----------|--------|-----|-----|-----|--------|
| `/api/events` | GET | 150ms | 300ms | 450ms | < 500ms |
| `/api/events/{id}` | GET | 100ms | 200ms | 300ms | < 400ms |
| `/api/auth/login` | POST | 250ms | 500ms | 750ms | < 1000ms |
| `/api/users/me` | GET | 80ms | 150ms | 200ms | < 300ms |
| `/api/bookings` | POST | 400ms | 800ms | 1200ms | < 1500ms |
| `/api/payments` | POST | 800ms | 1500ms | 2000ms | < 3000ms |

#### Database Queries

| Query Type | p50 | p95 | p99 | Target |
|------------|-----|-----|-----|--------|
| Simple SELECT | 5ms | 15ms | 25ms | < 50ms |
| JOIN (2 tables) | 10ms | 30ms | 50ms | < 100ms |
| Complex JOIN (3+ tables) | 25ms | 75ms | 150ms | < 200ms |
| INSERT | 8ms | 20ms | 35ms | < 50ms |
| UPDATE | 10ms | 25ms | 40ms | < 60ms |

#### System Resources (под нагрузкой 500 RPS)

| Metric | Current | Warning | Critical |
|--------|---------|---------|----------|
| CPU Usage | 45% | 70% | 85% |
| Memory Usage | 60% | 80% | 90% |
| DB Connections | 25/100 | 70/100 | 90/100 |
| Redis Memory | 500MB | 2GB | 4GB |
| Network I/O | 50 Mbps | 200 Mbps | 500 Mbps |

### Frontend Performance

#### Lighthouse Scores (Desktop)

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| Homepage | 94 | 98 | 100 | 100 |
| Event List | 92 | 97 | 100 | 95 |
| Event Details | 90 | 98 | 100 | 98 |
| Booking | 88 | 96 | 100 | 90 |
| Profile | 93 | 99 | 100 | 85 |

**Target**: All scores ≥ 90

#### Core Web Vitals

| Metric | Current | Good | Needs Improvement | Poor |
|--------|---------|------|-------------------|------|
| LCP (Largest Contentful Paint) | 1.2s | ≤2.5s | 2.5-4.0s | >4.0s |
| FID (First Input Delay) | 45ms | ≤100ms | 100-300ms | >300ms |
| CLS (Cumulative Layout Shift) | 0.05 | ≤0.1 | 0.1-0.25 | >0.25 |
| FCP (First Contentful Paint) | 0.8s | ≤1.8s | 1.8-3.0s | >3.0s |
| TTI (Time to Interactive) | 2.1s | ≤3.8s | 3.8-7.3s | >7.3s |

#### Bundle Sizes

| Bundle | Size | Gzipped | Target |
|--------|------|---------|--------|
| Main JS | 245 KB | 78 KB | < 300 KB |
| Main CSS | 45 KB | 12 KB | < 100 KB |
| Vendor JS | 180 KB | 62 KB | < 250 KB |
| Total Initial Load | 470 KB | 152 KB | < 500 KB |

#### Page Load Times (3G Connection)

| Page | Load Time | Target |
|------|-----------|--------|
| Homepage | 2.8s | < 3s |
| Event List | 3.2s | < 4s |
| Event Details | 2.5s | < 3s |
| Booking Flow | 3.5s | < 4s |

### Database Performance

**Connection Pool**:
- Min Connections: 10 (Idle minimum)
- Max Connections: 100 (Peak capacity)
- Connection Timeout: 30s
- Idle Timeout: 10m

**Query Baseline**:
```sql
-- Events listing (with pagination) ~15ms
SELECT * FROM events WHERE status = 'PUBLISHED' ORDER BY start_date DESC LIMIT 20 OFFSET 0;

-- Event details with venue ~8ms
SELECT e.*, v.* FROM events e JOIN venues v ON e.venue_id = v.id WHERE e.id = ?;

-- User bookings ~12ms
SELECT b.*, e.name FROM bookings b JOIN events e ON b.event_id = e.id WHERE b.user_id = ? ORDER BY b.created_at DESC;
```

### Cache Performance

**Redis Hit Rates**:
| Cache Type | Hit Rate | Target |
|------------|----------|--------|
| User Sessions | 98% | > 95% |
| Event Data | 85% | > 80% |
| Venue Data | 92% | > 90% |
| API Responses | 75% | > 70% |

**TTL Settings**:
- `user:session:{id}`: 24h (session duration)
- `event:{id}`: 5m (frequently updated)
- `venue:{id}`: 1h (rarely changes)
- `events:list:*`: 2m (list queries)

### Throughput Benchmarks

**Peak Load Capacity**:
| Scenario | RPS | Users | Error Rate |
|----------|-----|-------|------------|
| Read-heavy (90% reads) | 2500 | 5000 | 0.2% |
| Balanced (50/50) | 1200 | 2500 | 0.5% |
| Write-heavy (30% writes) | 600 | 1200 | 0.8% |

**Service Capacity**:
| Service | Max RPS | Bottleneck |
|---------|---------|------------|
| User Service | 1500 | Database |
| Event Service | 2000 | Cache |
| Payment Service | 300 | External API |
| Notification Service | 500 | Message Queue |

## Baseline Collection

### Сбор метрик

```bash
# Backend API performance
k6 run --out json=baseline.json k6-baseline.js

# Frontend performance
pnpm lighthouse:baseline

# Database queries
./scripts/db-benchmark.sh
```

### Анализ регрессий

```bash
# Compare with baseline
k6-compare baseline.json current.json

# Lighthouse CI
lhci compare --baseline=baseline.json
```

## Monitoring Alerts

### Critical Alerts

- Response time p95 > 2x baseline
- Error rate > 5%
- CPU > 85%
- Memory > 90%
- DB connections > 90%

### Warning Alerts

- Response time p95 > 1.5x baseline
- Error rate > 1%
- CPU > 70%
- Memory > 80%
- Cache hit rate < 70%

## Regression Testing

### Автоматизация

```yaml
# performance-check.yml
- name: Performance Regression Check
  run: |
    k6 run k6-baseline.js
    k6-compare baseline.json current.json
    exit $?
```

### Критерии для блокировки деплоя

- Response time увеличилось > 20%
- Throughput упал > 15%
- Error rate вырос > 2%
- Lighthouse score упал > 5 points

## История улучшений

| Date | Change | Impact |
|------|--------|--------|
| 2025-01-15 | Added Redis caching | -40% response time |
| 2025-02-01 | Database index optimization | -25% query time |
| 2025-02-20 | Image optimization | -30% LCP |
| 2025-03-10 | Code splitting | -20% initial bundle |

## Next Steps

- [ ] Установить continuous performance monitoring
- [ ] Добавить visual regression tests
- [ ] Настроить automated performance budgets
- [ ] Создать performance dashboard

## См. также

- [Test Strategy](test-strategy.md) - общая стратегия тестирования
- [Testing](testing.md) - планы тестирования
- [Bug Management](bug-management.md) - управление дефектами
- [Architecture](../architecture.md) - архитектура системы (производительность и масштабирование)
- [Operations](../operations/README.md) - мониторинг и observability
