## Docs

Команды (Make):

- Установка: `make docs-setup`
- Предпросмотр: `make docs-serve`
- Сборка: `make docs-build`
- Линтеры: `make docs-lint`

Команды (Gradle):

- Предпросмотр: `./gradlew docsServe`
- Сборка: `./gradlew docsBuild`
- Линтеры: `./gradlew docsLint`

Установка deps: `make docs-setup`
# Руководство по сборке

Этот документ описывает архитектуру системы сборки, правила управления зависимостями и типовые команды для разработки и CI.

## Обзор проекта
- Язык/платформа: Java 21, Spring Boot 3.3.5, Gradle 8.5
- Структура: многомодульный Gradle-проект
- Модули:
  - Общие: `backend-common`, `backend-gateway`
  - Домены: `backend-user`, `backend-event`, `backend-crew`, `backend-media`, `backend-payment`, `backend-notification`
  - Внутри доменов: `*-api` (исполняемые), `*-service` и `*-db` (библиотеки)

## Правила артефактов и плагинов
- Плагины применяются через convention‑плагины из `build-logic`:
  - Базово для всех модулей: `com.aquastream.java-library-conventions`
  - Только для `*-api` и `backend-gateway`: `com.aquastream.spring-boot-api-conventions`
- Артефакты:
  - Библиотеки (`*-db`, `*-service`): `jar` включён (обычные JAR), `bootJar` отсутствует
  - Исполняемые (`*-api`): `bootJar` включён, `jar` отключён
- Политика `jar/bootJar` настраивается внутри convention‑плагинов (build-logic)

## Управление зависимостями
- Централизация версий в `build.gradle` (раздел `ext`):
  - Ключевые версии: Spring Boot/Cloud, jjwt, bucket4j, hypersistence, hibernate-types, springdoc, jackson и др.
- BOM'ы (в `dependencyManagement` корня):
  - `org.springframework.boot:spring-boot-dependencies`
  - `org.springframework.cloud:spring-cloud-dependencies`
  - `org.testcontainers:testcontainers-bom`
  - `com.fasterxml.jackson:jackson-bom`
- Dependency locking: включён для всех сабпроектов (`lockAllConfigurations`, `STRICT`).
- Правила `api` vs `implementation`:
  - `backend-common`: экспортирует только то, что требуется всем модулям (например, web/validation, bucket4j-redis), прочее — `implementation`.
  - При добавлении зависимостей избегайте дублирования Jackson: он уже приходит из Spring Boot starters.

## Производительность сборки
- `gradle.properties` настраивает: параллельность, кэширование, daemon, configuration cache, JVM параметры.
- Configuration cache: включён, с предупреждением о совместимости gradle-git-properties plugin
- Dependency locking: все модули используют strict lock-файлы для воспроизводимых сборок
- Форс совместимости: `commons-compress:1.28.0` (из-за Gradle 8.5 + Spring Boot 3.3.5)

## Команды сборки и тестов
- Полная сборка всех модулей:
  - `./gradlew clean build`
- Сборка исполняемых артефактов (примеры):
  - `./gradlew :backend-user:backend-user-api:bootJar`
  - `./gradlew :backend-event:backend-event-api:bootJar`
  - `./gradlew :backend-gateway:bootJar`
- Тесты (JUnit 5, отчёты включены):
  - `./gradlew test`
  - Отчёты: `build/reports/tests/test/index.html` и JUnit XML
- Dependency locking:
  - Рекомендуется: `make deps-lock` (генерирует lock-файлы для всех модулей без сборки)
  - Альтернатива: `./gradlew dependencies --write-locks` (для корня и/или отдельных модулей)
  - Commit'ить изменения lock-файлов в VCS
- Configuration cache:
  - Проверка совместимости: `./gradlew build --configuration-cache`
  - Включён в gradle.properties, но gradle-git-properties plugin не полностью совместим
- OWASP Dependency-Check:
  - Запуск: `./gradlew dependencyCheckAnalyze`
  - Отчёты: `build/reports/dependency-check-report.html` и `*.sarif`
  - Suppress-файл: `owasp-suppression.xml`

## Архитектура слоёв (Variant B)
- Слои: `api → service → db`.
- Правила доступа:
  - `api` слой может импортировать только из `service` слоя
  - `service` слой может импортировать только из `db` слоя и `backend-common`
  - ЗАПРЕЩЕНО: `api` импортирует `..db..`; `service` импортирует `..api..`
- DTO модели:
  - **Transport DTO** (в `api`): используются в REST endpoints, содержат validation аннотации
  - **Service DTO** (в `service`): доменные модели, бизнес-логика
  - **Entity** (в `db`): JPA сущности для работы с БД
- Маппинг:
  - Controllers в `api` выполняют маппинг между Transport DTO ↔ Service DTO
  - Services в `service` выполняют маппинг между Service DTO ↔ Entity
  - ЗАПРЕЩЕНО: возвращать Entity напрямую из REST endpoints
- Проверка (ArchUnit):
  - Тесты архитектуры: `./gradlew test --tests "*LayerRulesTest"`
  - Правила автоматически исключают test классы через `.haveNameNotMatching(".*Test.*")`
  - Покрытие: user, event, crew, media, notification, payment доменов

## Convention Plugins (build-logic)
- `com.aquastream.java-library-conventions`:
  - Применяет `java-library`, `io.spring.dependency-management`, `org.owasp.dependencycheck`.
  - Java 21, `-parameters`, `-Xlint`, UTF‑8; JUnit 5 с отчётами и параллелизмом.
  - Источники интеграционных тестов (`src/integrationTest/...`) и задача `integrationTest` подключены по умолчанию.
  - Импортирует BOM: Spring Boot/Cloud, Testcontainers, Jackson (версии берутся из root `ext`).
  - Lombok (compileOnly/annotationProcessor), OWASP Dependency‑Check (SARIF/HTML, suppress‑file, `NVD_API_KEY`).
  - Подавляет donation‑сообщение OpenAPI Generator.
- `com.aquastream.spring-boot-api-conventions`:
  - Применяет Spring Boot к исполняемым модулям; включает `bootJar`, отключает `jar`.

## CI
- Важное: в `Backend CI` есть job `Lock Check`, который проверяет, что lock-файлы синхронизированы.
  - Если lock-файлы устарели, job упадёт с подсказкой запустить `make deps-lock` и закоммитить изменения.

## Testcontainers (интеграционные тесты)
- BOM уже подключён на уровне корня; в `subprojects` добавлен `testImplementation 'org.testcontainers:junit-jupiter'`.
- Модульные специфичные контейнеры (например, `org.testcontainers:postgresql`) добавляйте только в модулях, где они реально используются.
- Рекомендуемые пути исходников интеграционных тестов: `src/integrationTest/java` и `src/integrationTest/resources`.

## Проверка актуальности зависимостей
- Плагин: Gradle Versions Plugin (`com.github.ben-manes.versions`)
- Запуск отчёта:
  - `./gradlew dependencyUpdates -Drevision=release`
  - или `./gradlew dependencyUpdatesAll -Drevision=release`
- Отчёты: `build/dependencyUpdates/` (plain, json, html)

## Гайд по добавлению модулей
- Шаблоны имён: `your-domain-api`, `your-domain-service`, `your-domain-db`
- Для `*-api`:
  - Не добавляйте `id 'org.springframework.boot'` вручную — он применяется из корня по маске `*-api`
  - Используйте стартеры Spring, версии управляются через BOM
  - Создавайте Transport DTO в `src/main/java/.../api/dto/` с validation аннотациями
  - Добавляйте ArchUnit тест в `src/test/java/.../architecture/LayerRulesTest.java`
- Для `*-service`/`*-db`:
  - Это библиотеки: не подключайте Boot, следите чтобы `bootJar` не включался
  - Проверяйте `api`/`implementation` и избегайте утечек транзитивных зависимостей
  - Service DTO в `*-service`, Entity в `*-db`

## Принципы обновления зависимостей
1. Добавьте/обновите версии в корневом `ext` при необходимости
2. По возможности полагайтесь на импортированные BOM (без явных версий в модулях)
3. Обновите модули, убрав хардкод версий
4. Перегенерируйте lock-файлы: `./gradlew dependencies --write-locks`
5. Прогоните тесты и OWASP проверку

## Частые проблемы и советы
- Конфликты Jackson/Testcontainers: проверьте, что версия берётся из BOM и нет явных версий в модулях
- Ошибки bootJar у библиотек: убедитесь, что модуль не `*-api` и Boot к нему не применяется
- OWASP ложные срабатывания: добавляйте подавления в `owasp-suppression.xml` точечно с комментариями
- ArchUnit тесты падают: убедитесь что в правилах есть исключение test классов `.haveNameNotMatching(".*Test.*")`
- Configuration cache warnings: gradle-git-properties plugin помечен как `notCompatibleWithConfigurationCache`
- Transport DTO нарушения: controllers должны возвращать Transport DTO, а не Entity напрямую

## Полезные пути и файлы
- Корень: `build.gradle`, `settings.gradle`, `gradle.properties`, `owasp-suppression.xml`, `version.properties`
- Управление версиями: см. [Version Management](../devops/version-management.md)
- Общее ядро: `backend-common`
- Гейтвей: `backend-gateway`
- Доменные модули: `backend-*/**`

---

Поддерживайте единообразие: версии в одном месте, плагины — централизованно, минимизируйте дубли и транзитивные утечки. Это ускоряет сборку и упрощает сопровождение.
