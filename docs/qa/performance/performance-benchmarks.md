# Performance Benchmarks

---
title: Performance Benchmarks
summary: Базовые показатели производительности системы AquaStream для отслеживания регрессий
tags: [qa, testing, performance, benchmarks]
---

## Обзор

Базовые показатели производительности системы AquaStream для отслеживания регрессий.

## Backend Performance

### API Endpoints

| Endpoint | Method | p50 | p95 | p99 | Target |
|----------|--------|-----|-----|-----|--------|
| `/api/events` | GET | 150ms | 300ms | 450ms | < 500ms |
| `/api/events/{id}` | GET | 100ms | 200ms | 300ms | < 400ms |
| `/api/auth/login` | POST | 250ms | 500ms | 750ms | < 1000ms |
| `/api/users/me` | GET | 80ms | 150ms | 200ms | < 300ms |
| `/api/bookings` | POST | 400ms | 800ms | 1200ms | < 1500ms |
| `/api/bookings/{id}` | GET | 120ms | 250ms | 400ms | < 500ms |
| `/api/payments` | POST | 800ms | 1500ms | 2000ms | < 3000ms |

### Database Queries

| Query Type | p50 | p95 | p99 | Target |
|------------|-----|-----|-----|--------|
| Simple SELECT | 5ms | 15ms | 25ms | < 50ms |
| JOIN (2 tables) | 10ms | 30ms | 50ms | < 100ms |
| Complex JOIN (3+ tables) | 25ms | 75ms | 150ms | < 200ms |
| INSERT | 8ms | 20ms | 35ms | < 50ms |
| UPDATE | 10ms | 25ms | 40ms | < 60ms |

### System Resources (под нагрузкой 500 RPS)

| Metric | Current | Warning | Critical |
|--------|---------|---------|----------|
| CPU Usage | 45% | 70% | 85% |
| Memory Usage | 60% | 80% | 90% |
| DB Connections | 25/100 | 70/100 | 90/100 |
| Redis Memory | 500MB | 2GB | 4GB |
| Network I/O | 50 Mbps | 200 Mbps | 500 Mbps |

## Frontend Performance

### Lighthouse Scores (Desktop)

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| Homepage | 94 | 98 | 100 | 100 |
| Event List | 92 | 97 | 100 | 95 |
| Event Details | 90 | 98 | 100 | 98 |
| Booking | 88 | 96 | 100 | 90 |
| Profile | 93 | 99 | 100 | 85 |

**Target**: All scores ≥ 90

### Core Web Vitals

| Metric | Current | Good | Needs Improvement | Poor |
|--------|---------|------|-------------------|------|
| LCP (Largest Contentful Paint) | 1.2s | ≤2.5s | 2.5-4.0s | >4.0s |
| FID (First Input Delay) | 45ms | ≤100ms | 100-300ms | >300ms |
| CLS (Cumulative Layout Shift) | 0.05 | ≤0.1 | 0.1-0.25 | >0.25 |
| FCP (First Contentful Paint) | 0.8s | ≤1.8s | 1.8-3.0s | >3.0s |
| TTI (Time to Interactive) | 2.1s | ≤3.8s | 3.8-7.3s | >7.3s |

### Bundle Sizes

| Bundle | Size | Gzipped | Target |
|--------|------|---------|--------|
| Main JS | 245 KB | 78 KB | < 300 KB |
| Main CSS | 45 KB | 12 KB | < 100 KB |
| Vendor JS | 180 KB | 62 KB | < 250 KB |
| Total Initial Load | 470 KB | 152 KB | < 500 KB |

### Page Load Times (3G Connection)

| Page | Load Time | Target |
|------|-----------|--------|
| Homepage | 2.8s | < 3s |
| Event List | 3.2s | < 4s |
| Event Details | 2.5s | < 3s |
| Booking Flow | 3.5s | < 4s |

## Database Performance

### Query Performance Baseline

```sql
-- Events listing (with pagination)
-- Execution time: ~15ms
SELECT * FROM events 
WHERE status = 'PUBLISHED' 
ORDER BY start_date DESC 
LIMIT 20 OFFSET 0;

-- Event details with venue
-- Execution time: ~8ms
SELECT e.*, v.* FROM events e
JOIN venues v ON e.venue_id = v.id
WHERE e.id = ?;

-- User bookings
-- Execution time: ~12ms
SELECT b.*, e.name FROM bookings b
JOIN events e ON b.event_id = e.id
WHERE b.user_id = ?
ORDER BY b.created_at DESC;
```

### Connection Pool

| Setting | Value | Notes |
|---------|-------|-------|
| Min Connections | 10 | Idle minimum |
| Max Connections | 100 | Peak capacity |
| Connection Timeout | 30s | Before giving up |
| Idle Timeout | 10m | Close idle connections |

## Cache Performance

### Redis Hit Rates

| Cache Type | Hit Rate | Target |
|------------|----------|--------|
| User Sessions | 98% | > 95% |
| Event Data | 85% | > 80% |
| Venue Data | 92% | > 90% |
| API Responses | 75% | > 70% |

### TTL Settings

| Cache Key | TTL | Rationale |
|-----------|-----|-----------|
| `user:session:{id}` | 24h | Session duration |
| `event:{id}` | 5m | Frequently updated |
| `venue:{id}` | 1h | Rarely changes |
| `events:list:*` | 2m | List queries |

## Throughput Benchmarks

### Peak Load Capacity

| Scenario | RPS | Users | Error Rate |
|----------|-----|-------|------------|
| Read-heavy (90% reads) | 2500 | 5000 | 0.2% |
| Balanced (50/50) | 1200 | 2500 | 0.5% |
| Write-heavy (30% writes) | 600 | 1200 | 0.8% |

### Service Capacity

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
