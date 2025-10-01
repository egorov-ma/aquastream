# API Tests

---
title: API Tests
summary: API-тесты для проверки REST endpoints и интеграции между слоями
tags: [qa, testing, api-tests, testcontainers, spring-boot-test]
---

## Обзор

API-тесты проверяют REST endpoints и интеграцию между слоями.

## Технологии

- **Spring Boot Test**: для интеграционного тестирования
- **Testcontainers**: для тестовых баз данных
- **MockMvc**: для тестирования REST endpoints

## Структура тестов

```
src/integrationTest/java/
  ├── api/              # Тесты REST endpoints
  ├── integration/      # Интеграционные тесты
  └── testcontainers/   # Конфигурация Testcontainers
```

## Запуск

```bash
# Все интеграционные тесты
./gradlew integrationTest

# Конкретный модуль
./gradlew :backend-user:backend-user-api:integrationTest
```

## Пример теста

```java
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class UserApiTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = 
        new PostgreSQLContainer<>("postgres:15");
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldCreateUser() throws Exception {
        mockMvc.perform(post("/api/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"Test\"}"))
            .andExpect(status().isCreated());
    }
}
```

## Best Practices

- Используйте Testcontainers для реальной БД
- Проверяйте все HTTP статус-коды
- Тестируйте валидацию входных данных
- Проверяйте структуру ответов
