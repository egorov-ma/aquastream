# Common Module – Документация

> Версия: 0.1 (draft)

`common` – это библиотечный модуль, собираемый в JAR и используемый всеми backend-микросервисами AquaStream. Он содержит:

1. **Общие DTO и утилиты** – например, `ErrorResponse`, `PageRequestDto` и вспомогательные классы (`DateUtils`, `JsonUtils`).
2. **Базовые исключения** – `NotFoundException`, `ValidationException`, маппинг на HTTP-коды.
3. **Конфигурация логирования и мониторинга** – Logback XML, MDC-фильтры, настройки отправки логов в ELK.
4. **Общие YAML-файлы** (например, `db-common.yml`) — единые настройки подключения к БД/пул соединений.
5. **Тестовые утилиты** (test-sources JAR) – `TestContainersConfig`, `MockMvcUtils`.

Использование модуля позволяет избегать дублирования кода и поддерживать единый стиль во всех сервисах.

---

## Структура пакета

```
common/
├── src/main/java/org/aquastream/common
│   ├── dto/
│   ├── exception/
│   ├── util/
│   └── logging/
├── src/main/resources/
│   ├── logback-spring.xml
│   ├── db-common.yml
│   └── static/
└── build.gradle
```

---

## Логирование и мониторинг

Модуль предоставляет готовую конфигурацию Logback (`logback-spring.xml`) для JSON-логирования с отправкой в Logstash.

### Основные особенности

* **LogstashEncoder** – форматирует логи в JSON с полями `@timestamp`, `level`, `app_name`, `traceId`.
* **MDC** – автомaтически заполняет `traceId`, `spanId`, `userId`.
* **Асинхронная отправка** – `TcpSocketAppender` в Logstash → Elasticsearch → Kibana.
* **Профили** – `dev`, `prod`, `test` с разными appenders.

Подробнее о настройке смотрите в файле [`logback-spring.xml`](../../common/src/main/resources/logback-spring.xml).

### Быстрый пример

```java
@Slf4j
@Service
public class PaymentService {
    public void pay(UUID userId, BigDecimal amount) {
        log.info("Payment initiated", kv("userId", userId), kv("amount", amount));
    }
}
```

В Kibana запрос будет выглядеть так:

```kql
app_name:"user-service" and userId:"123e4567-e89b-12d3-a456-426614174000"
```

---

## Общие YAML-конфиги

Файл `db-common.yml` содержит дефолтные настройки для Spring Datasource и HikariCP:

```yaml
spring:
  datasource:
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
```

Сервис может импортировать файл через:
```yaml
spring:
  config:
    import: classpath:db-common.yml
```

---

## Подключение модуля

В `settings.gradle` модуль уже включён. Для использования достаточно добавить зависимость в нужном подпроекте:

```groovy
dependencies {
    implementation(project(":common"))
}
```

Для тестов:
```groovy
testImplementation(project(path: ":common", configuration: "testArtifacts"))
```

---

## Публикация в локальный Maven

```bash
./gradlew :common:publishToMavenLocal
```

Это позволит подключать модуль из других проектов.

---

## TODO
- [ ] Вынести в модуль общие ResponseEntityExceptionHandler.
- [ ] Добавить MapStruct-мапперы DTO.

---

## Связь с общей документацией

- CI/CD: [`../ci-cd`](../ci-cd)
- Логирование ELK: см. раздел "Logging" в [PROJECT_DOCUMENTATION.md](../PROJECT_DOCUMENTATION.md)

---

© AquaStream, 2024 