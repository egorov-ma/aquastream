# Test Plan - AqStream

## Обзор

Данный документ описывает стратегию тестирования платформы AqStream, включая типы тестов, критерии приемки, тестовые сценарии и метрики качества.

## Стратегия тестирования

### Пирамида тестирования

```
         /\
        /  \    E2E Tests (5%)
       /    \   - Critical user flows
      /──────\  
     /        \ Integration Tests (20%)
    /          \- API tests
   /            \- Database tests
  /──────────────\
 /                \ Unit Tests (75%)
/                  \- Business logic
────────────────────- Services, Utils
```

### Типы тестирования

| Тип | Покрытие | Инструменты | Частота |
|-----|----------|-------------|---------|
| Unit Tests | 80% | JUnit 5, Jest | На каждый commit |
| Integration Tests | 60% | Spring Test, Testing Library | На каждый PR |
| E2E Tests | Critical paths | Playwright | Перед release |
| Performance Tests | API endpoints | JMeter, K6 | Weekly |
| Security Tests | OWASP Top 10 | OWASP ZAP | Monthly |
| Accessibility Tests | WCAG 2.1 AA | axe-core | На каждый PR |

## Критерии качества

### Definition of Done

- [ ] Код написан и проходит линтеры
- [ ] Unit тесты написаны и проходят (coverage > 80%)
- [ ] Integration тесты обновлены
- [ ] Code review пройден
- [ ] Документация обновлена
- [ ] Нет критических уязвимостей
- [ ] Performance метрики в норме

### Критерии выхода в продакшн

- Все критические и высокоприоритетные баги исправлены
- Test coverage > 75%
- Performance: p95 < 500ms, p99 < 1s
- Security scan: 0 high/critical vulnerabilities
- E2E тесты: 100% pass rate
- Load test: выдерживает 100 concurrent users

## Test Cases

### TC-AUTH: Аутентификация

#### TC-AUTH-001: Успешная регистрация
**Приоритет**: Critical
**Предусловия**: Пользователь не зарегистрирован

**Шаги**:
1. Открыть страницу регистрации
2. Ввести email: test@example.com
3. Ввести пароль: SecurePass123!
4. Подтвердить пароль: SecurePass123!
5. Нажать "Зарегистрироваться"

**Ожидаемый результат**:
- Пользователь успешно зарегистрирован
- Автоматический вход выполнен
- Redirect на главную страницу

---

#### TC-AUTH-002: Регистрация с существующим email
**Приоритет**: High
**Предусловия**: Email уже зарегистрирован

**Шаги**:
1. Открыть страницу регистрации
2. Ввести существующий email
3. Заполнить остальные поля
4. Нажать "Зарегистрироваться"

**Ожидаемый результат**:
- Ошибка "Email уже используется"
- Форма не отправлена

---

#### TC-AUTH-003: Вход с корректными данными
**Приоритет**: Critical

**Шаги**:
1. Открыть страницу входа
2. Ввести зарегистрированный email
3. Ввести правильный пароль
4. Нажать "Войти"

**Ожидаемый результат**:
- Успешный вход
- JWT токены получены
- Redirect на dashboard

---

#### TC-AUTH-004: Вход с неверным паролем
**Приоритет**: High

**Шаги**:
1. Открыть страницу входа
2. Ввести зарегистрированный email
3. Ввести неверный пароль
4. Нажать "Войти"

**Ожидаемый результат**:
- Ошибка "Неверный email или пароль"
- Форма не отправлена

---

#### TC-AUTH-005: Refresh токена
**Приоритет**: High
**Предусловия**: Пользователь авторизован

**Шаги**:
1. Подождать истечения access token (15 мин)
2. Выполнить любой API запрос

**Ожидаемый результат**:
- Автоматический refresh токена
- Запрос успешно выполнен
- Новый access token получен

### TC-EVENT: Управление событиями

#### TC-EVENT-001: Создание события
**Приоритет**: Critical
**Предусловия**: Пользователь - организатор

**Шаги**:
1. Перейти в "Создать событие"
2. Заполнить обязательные поля:
   - Название: "Тестовое событие"
   - Описание: "Описание события"
   - Дата начала: Завтра, 18:00
   - Дата окончания: Завтра, 21:00
3. Нажать "Создать"

**Ожидаемый результат**:
- Событие создано в статусе "Черновик"
- Redirect на страницу события
- Уведомление об успешном создании

---

#### TC-EVENT-002: Публикация события
**Приоритет**: Critical
**Предусловия**: Событие в статусе "Черновик"

**Шаги**:
1. Открыть черновик события
2. Нажать "Отправить на модерацию"
3. (Как админ) Одобрить событие

**Ожидаемый результат**:
- Статус изменен на "Опубликовано"
- Событие видно в общем списке
- Доступна регистрация

---

#### TC-EVENT-003: Поиск событий
**Приоритет**: High

**Шаги**:
1. Открыть страницу событий
2. Ввести в поиск "велосипед"
3. Применить фильтры:
   - Тип: Спорт
   - Дата: Эта неделя
   - Цена: Бесплатно

**Ожидаемый результат**:
- Отображаются только подходящие события
- Фильтры сохраняются в URL
- Счетчик результатов обновлен

---

#### TC-EVENT-004: Отмена события
**Приоритет**: Medium
**Предусловия**: Опубликованное событие с участниками

**Шаги**:
1. Открыть свое событие
2. Нажать "Отменить событие"
3. Подтвердить отмену

**Ожидаемый результат**:
- Статус "Отменено"
- Уведомления всем участникам
- Список для возврата средств

### TC-REG: Регистрация на события

#### TC-REG-001: Успешная регистрация
**Приоритет**: Critical
**Предусловия**: Пользователь авторизован

**Шаги**:
1. Открыть страницу события
2. Нажать "Записаться"
3. Подтвердить регистрацию

**Ожидаемый результат**:
- Регистрация создана
- Событие в "Моих событиях"
- Уведомление организатору

---

#### TC-REG-002: Регистрация на заполненное событие
**Приоритет**: High
**Предусловия**: Все места заняты

**Шаги**:
1. Открыть заполненное событие
2. Нажать "Встать в лист ожидания"

**Ожидаемый результат**:
- Добавлен в лист ожидания
- Показана позиция в очереди
- Уведомление при освобождении места

---

#### TC-REG-003: Отмена регистрации
**Приоритет**: Medium
**Предусловия**: Зарегистрирован на событие

**Шаги**:
1. Открыть "Мои события"
2. Выбрать событие
3. Нажать "Отменить участие"

**Ожидаемый результат**:
- Регистрация отменена
- Место освобождено
- Уведомление следующему в листе ожидания

### TC-PAY: Оплата

#### TC-PAY-001: Процесс оплаты
**Приоритет**: High
**Предусловия**: Зарегистрирован на платное событие

**Шаги**:
1. После регистрации увидеть QR-код
2. Оплатить по QR
3. Загрузить чек (PDF)
4. Дождаться подтверждения

**Ожидаемый результат**:
- Чек загружен успешно
- Статус "Ожидает подтверждения"
- После подтверждения - "Оплачено"

### TC-GROUP: Группы

#### TC-GROUP-001: Создание групп
**Приоритет**: Medium
**Предусловия**: Организатор события

**Шаги**:
1. Открыть управление событием
2. Перейти в "Группы"
3. Выбрать шаблон "Транспорт"
4. Настроить: 3 машины по 4 места

**Ожидаемый результат**:
- 3 группы созданы
- Лимиты установлены
- Готовы к распределению

---

#### TC-GROUP-002: Распределение участников
**Приоритет**: Medium
**Предусловия**: Есть группы и участники

**Шаги**:
1. Открыть распределение
2. Перетащить участников в группы
3. Учесть предпочтения
4. Сохранить распределение

**Ожидаемый результат**:
- Участники распределены
- Уведомления отправлены
- Группы видны участникам

## Performance Testing

### Сценарии нагрузочного тестирования

#### Scenario 1: Normal Load
```javascript
// k6 script
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 20 },  // Ramp up
    { duration: '5m', target: 20 },  // Stay at 20 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function() {
  let response = http.get('https://api.aqstream.ru/api/v1/events');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

#### Scenario 2: Stress Test
- Start: 1 user
- Ramp to: 100 users over 10 minutes
- Hold: 100 users for 10 minutes
- Success criteria: No errors, p95 < 1s

#### Scenario 3: Spike Test
- Normal: 20 users
- Spike to: 200 users instantly
- Hold: 1 minute
- Return to: 20 users
- Success criteria: System recovers within 2 minutes

## Security Testing

### OWASP Top 10 Checklist

- [ ] **A01:2021 – Broken Access Control**
  - Test: Попытка доступа к чужим событиям
  - Test: Изменение роли через API
  
- [ ] **A02:2021 – Cryptographic Failures**
  - Test: Проверка шифрования паролей
  - Test: HTTPS everywhere
  
- [ ] **A03:2021 – Injection**
  - Test: SQL injection в поиске
  - Test: XSS в описании события
  
- [ ] **A04:2021 – Insecure Design**
  - Test: Rate limiting на регистрацию
  - Test: Защита от массовой регистрации
  
- [ ] **A05:2021 – Security Misconfiguration**
  - Test: Отсутствие debug информации
  - Test: Правильные CORS headers

## Accessibility Testing

### WCAG 2.1 Level AA

#### Keyboard Navigation
- [ ] Все интерактивные элементы доступны с клавиатуры
- [ ] Visible focus indicators
- [ ] Логичный tab order
- [ ] Skip navigation links

#### Screen Readers
- [ ] Правильная семантическая разметка
- [ ] ARIA labels где необходимо
- [ ] Alt текст для изображений
- [ ] Роли и состояния элементов

#### Visual
- [ ] Контраст текста минимум 4.5:1
- [ ] Контраст для крупного текста 3:1
- [ ] Не только цвет для передачи информации
- [ ] Возможность увеличения до 200%

## Test Data Management

### Test Users

```json
{
  "users": [
    {
      "email": "user@test.com",
      "password": "TestUser123!",
      "role": "USER",
      "description": "Обычный пользователь"
    },
    {
      "email": "organizer@test.com",
      "password": "TestOrg123!",
      "role": "ORGANIZER",
      "description": "Организатор событий"
    },
    {
      "email": "admin@test.com",
      "password": "TestAdmin123!",
      "role": "ADMIN",
      "description": "Администратор"
    }
  ]
}
```

### Test Events

```sql
-- Seed test events
INSERT INTO events (title, description, start_date, status) VALUES
('Прошедшее событие', 'Тест', NOW() - INTERVAL '7 days', 'COMPLETED'),
('Текущее событие', 'Тест', NOW() + INTERVAL '1 hour', 'PUBLISHED'),
('Будущее событие', 'Тест', NOW() + INTERVAL '7 days', 'PUBLISHED'),
('Отмененное событие', 'Тест', NOW() + INTERVAL '3 days', 'CANCELLED'),
('Черновик', 'Тест', NOW() + INTERVAL '14 days', 'DRAFT');
```

## Bug Report Template

```markdown
### Описание
Краткое описание бага

### Шаги воспроизведения
1. Перейти на '...'
2. Нажать на '...'
3. Прокрутить до '...'
4. Наблюдать ошибку

### Ожидаемое поведение
Что должно происходить

### Фактическое поведение
Что происходит на самом деле

### Скриншоты
Если применимо

### Окружение
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

### Дополнительный контекст
Любая дополнительная информация
```

## Regression Testing

### Критические пути (всегда тестировать)

1. **Регистрация → Вход → Выход**
2. **Создание события → Публикация → Регистрация участника**
3. **Поиск события → Регистрация → Отмена**
4. **Оплата → Подтверждение → Участие**
5. **Создание группы → Распределение → Уведомление**

### Regression Test Suite

Запускается перед каждым release:
- 50 критических test cases
- Время выполнения: ~2 часа
- Автоматизация: 80%
- Ручное тестирование: 20%

## Test Metrics & Reporting

### Ключевые метрики

| Метрика | Цель | Текущее |
|---------|------|---------|
| Test Coverage | >75% | - |
| Defect Density | <5 bugs/KLOC | - |
| Test Pass Rate | >95% | - |
| Automation Rate | >70% | - |
| Mean Time to Detect | <1 day | - |
| Mean Time to Fix | <2 days | - |

### Weekly Test Report

```markdown
## Test Report - Week XX

### Summary
- Total Test Cases Executed: XXX
- Passed: XXX (XX%)
- Failed: XXX (XX%)
- Blocked: XXX (XX%)

### New Bugs
- Critical: X
- High: X
- Medium: X
- Low: X

### Coverage
- Unit Tests: XX%
- Integration Tests: XX%
- E2E Tests: XX%

### Performance
- API p95: XXXms
- Page Load: X.Xs
- Load Test: Passed/Failed

### Next Steps
- Priority fixes
- Upcoming test activities
```

## Test Automation Framework

### Backend (Java)

```java
@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public abstract class BaseIntegrationTest {
    
    @Autowired
    protected MockMvc mockMvc;
    
    @Autowired
    protected ObjectMapper objectMapper;
    
    protected String getAuthToken(String role) {
        // Generate JWT token for role
    }
    
    protected ResultActions performAuthorized(
        MockHttpServletRequestBuilder request,
        String role
    ) throws Exception {
        return mockMvc.perform(request
            .header("Authorization", "Bearer " + getAuthToken(role))
            .contentType(MediaType.APPLICATION_JSON)
        );
    }
}
```

### Frontend (TypeScript)

```typescript
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## Continuous Testing

### CI Pipeline Tests

```yaml
name: Test Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # Unit Tests - быстрые, запускаются первыми
      - name: Unit Tests
        run: |
          ./gradlew test
          yarn test
      
      # Integration Tests - требуют БД
      - name: Integration Tests
        run: |
          docker-compose up -d postgres redis
          ./gradlew integrationTest
      
      # E2E Tests - полное окружение
      - name: E2E Tests
        run: |
          docker-compose up -d
          yarn test:e2e
      
      # Security Scan
      - name: Security Tests
        run: |
          ./gradlew dependencyCheckAnalyze
          npm audit
      
      # Performance Tests (только на main)
      - name: Performance Tests
        if: github.ref == 'refs/heads/main'
        run: k6 run performance/load-test.js
```

## Заключение

Данный план тестирования обеспечивает комплексный подход к контролю качества платформы AqStream. Регулярное выполнение и обновление тестов гарантирует стабильность и надежность системы.
