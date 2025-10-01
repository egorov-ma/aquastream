# Load Testing

---
title: Load Testing
summary: План нагрузочного тестирования для проверки производительности системы AquaStream под нагрузкой
tags: [qa, testing, performance, load-testing, k6]
---

## Обзор

План нагрузочного тестирования для проверки производительности системы AquaStream под нагрузкой.

## Цели

- Определить максимальную пропускную способность
- Найти узкие места в производительности
- Проверить стабильность под нагрузкой
- Валидировать требования по производительности

## Инструменты

- **K6**: основной инструмент нагрузочного тестирования
- **Grafana**: визуализация метрик
- **Prometheus**: сбор метрик
- **JMeter**: альтернативный инструмент (опционально)

## Типы нагрузочных тестов

### 1. Smoke Test

**Цель**: базовая проверка работоспособности

**Нагрузка**: 
- Users: 1-5
- Duration: 1 минута

```javascript
// k6-smoke.js
export const options = {
  vus: 5,
  duration: '1m',
};
```

### 2. Load Test

**Цель**: проверка при обычной нагрузке

**Нагрузка**:
- Users: 100-500
- Duration: 10 минут
- Ramp-up: 2 минуты

```javascript
// k6-load.js
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};
```

### 3. Stress Test

**Цель**: найти предел системы

**Нагрузка**:
- Users: постепенно до 2000+
- Duration: 20 минут

```javascript
// k6-stress.js
export const options = {
  stages: [
    { duration: '5m', target: 500 },
    { duration: '5m', target: 1000 },
    { duration: '5m', target: 2000 },
    { duration: '5m', target: 0 },
  ],
};
```

### 4. Spike Test

**Цель**: проверка при резком скачке нагрузки

**Нагрузка**:
- Резкий рост от 10 до 1000 пользователей
- Duration: 5 минут

```javascript
// k6-spike.js
export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '1m', target: 1000 },
    { duration: '3m', target: 1000 },
    { duration: '10s', target: 10 },
  ],
};
```

### 5. Soak Test

**Цель**: проверка стабильности длительной работы

**Нагрузка**:
- Users: 300 (константа)
- Duration: 4 часа

```javascript
// k6-soak.js
export const options = {
  vus: 300,
  duration: '4h',
};
```

## Тестовые сценарии

### Сценарий 1: Просмотр событий

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const res = http.get('https://api.aquastream.com/api/events');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

### Сценарий 2: Аутентификация

```javascript
export default function () {
  const payload = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  });
  
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  const res = http.post(
    'https://api.aquastream.com/api/auth/login',
    payload,
    params
  );
  
  check(res, {
    'login successful': (r) => r.status === 200,
    'has auth token': (r) => r.json('token') !== '',
  });
}
```

### Сценарий 3: Создание бронирования

```javascript
export default function () {
  // 1. Login
  const authRes = login();
  const token = authRes.json('token');
  
  // 2. Get event
  const eventRes = http.get(
    'https://api.aquastream.com/api/events/1',
    { headers: { Authorization: `Bearer ${token}` }}
  );
  
  // 3. Create booking
  const bookingRes = http.post(
    'https://api.aquastream.com/api/bookings',
    JSON.stringify({ eventId: 1, seats: 2 }),
    { headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }}
  );
  
  check(bookingRes, {
    'booking created': (r) => r.status === 201,
  });
}
```

## Метрики для мониторинга

### Application Metrics

- **Response Time**: p95 < 500ms, p99 < 1000ms
- **Throughput**: > 1000 RPS
- **Error Rate**: < 1%
- **Success Rate**: > 99%

### System Metrics

- **CPU Usage**: < 70%
- **Memory Usage**: < 80%
- **Database Connections**: < 80% от pool
- **Network I/O**: bandwidth utilization

### K6 Metrics

```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>100'],
  },
};
```

## Критерии успеха

### Требования по производительности

| Endpoint | p95 Response Time | Throughput |
|----------|-------------------|------------|
| GET /api/events | < 300ms | > 500 RPS |
| POST /api/auth/login | < 500ms | > 200 RPS |
| POST /api/bookings | < 800ms | > 100 RPS |
| GET /api/users/me | < 200ms | > 1000 RPS |

### Стабильность

- Zero downtime
- Error rate < 1%
- Memory leaks: отсутствуют
- Connection pool exhaustion: отсутствует

## Запуск тестов

```bash
# Smoke test
k6 run k6-smoke.js

# Load test
k6 run k6-load.js

# Stress test
k6 run k6-stress.js

# С выводом в Grafana
k6 run --out influxdb=http://localhost:8086 k6-load.js

# Cloud execution
k6 cloud k6-load.js
```

## Анализ результатов

### Метрики K6

```
     ✓ status is 200
     ✓ response time < 500ms

     checks.........................: 100.00% ✓ 15000 ✗ 0
     data_received..................: 45 MB   75 kB/s
     data_sent......................: 1.2 MB  2.0 kB/s
     http_req_duration..............: avg=234ms min=45ms med=198ms max=1.2s p(90)=389ms p(95)=456ms
     http_reqs......................: 15000   250/s
```

### Проблемы для расследования

- Response time > threshold
- Error rate spike
- Throughput degradation
- Memory/CPU spikes

## Оптимизация

### Backend
- Database query optimization
- Connection pool tuning
- Caching (Redis)
- Load balancing

### Database
- Index optimization
- Query plan analysis
- Connection pooling
- Read replicas

### Infrastructure
- Horizontal scaling
- Resource allocation
- Network optimization

## Отчетность

### Формат отчета

```markdown
# Load Test Report: [Date]

## Test Configuration
- Type: Load Test
- Duration: 10 minutes
- Peak Users: 500

## Results
- Avg Response Time: 234ms
- p95: 456ms
- p99: 789ms
- Throughput: 250 RPS
- Error Rate: 0.1%

## Issues Found
1. [Description]

## Recommendations
1. [Recommendation]
```

## График

- **Smoke test**: при каждом deploy
- **Load test**: еженедельно
- **Stress test**: перед мажорными релизами
- **Soak test**: ежемесячно
