# Common Module – Системный анализ

Модуль **common** не является отдельным сервисом, но играет ключевую роль:

## 1. Область ответственности
- Общие DTO (ErrorResponse, PageRequest)
- Исключения и маппинг на HTTP
- Конфигурация логирования Logback + JSON
- Утилиты (DateUtils, JsonUtils)
- Тестовые абстракции (TestContainersConfig)

## 2. Границы использования
| Компонент | Тип зависимости |
|-----------|----------------|
| Все backend-сервисы | `implementation(project(":common"))` |
| Модули тестов | `testImplementation(project(":common", configuration:"testArtifacts"))` |

## 3. Конфигурация логирования
Файл `logback-spring.xml` задаёт:
- `LogstashTcpSocketAppender` на порт 5000
- MDC поля traceId, spanId
- Async appender buffer 1024

## 4. Нефункциональные требования
| Атрибут | Значение |
|---------|----------|
| Совместимость | Java 21 |
| Размер JAR | < 1 MB |
| Отсутствие сторонних spring-starter зависимостей |

## 5. Метрики
- Логи JSON проходят через Elastic Stack; отдельные метрики модуль не публикует.

## 6. TODO
- Добавить MapStruct мапперы
- Вынести ResponseEntityExceptionHandler 