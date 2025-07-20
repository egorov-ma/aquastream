# План реализации

1. **Setup репозитория** – Spring Boot каркас, Gradle, Flyway, Dockerfile.  
2. **Схема БД** – Flyway V1, индексы, локальный Docker Postgres.  
3. **Proto‑контракты** – `event_service.proto`, генерация stubs.  
4. **Бизнес‑логика** – EventServiceImpl, BookingService, PaymentService, ReviewService.  
5. **Интеграции**  
   * Keycloak (JWT Resource‑server)  
   * Kafka producer (Spring Kafka)  
   * gRPC‑клиент crew‑service  
6. **REST‑адаптер** – контроллеры или Gateway mapping.  
7. **Scheduler** – авто‑отмена просроченных броней.  
8. **Unit + Integration tests** – Testcontainers (Postgres, Kafka).  
9. **CI/CD** – GitHub Actions: build → test → docker push → helm upgrade.  
10. **Monitoring** – Micrometer, Prometheus, Grafana; JSON‑логи в Loki/ELK.  
11. **Security audit & UAT** – проверка ролей, перф‑тест, пентест.  
12. **Release MVP** (2 месяца) → сбор обратной связи → план фич v2 (лоЯльность, динамическое ценообразование).  


План реализации сервиса backend-event

Ниже представлен пошаговый детальный план разработки и внедрения сервиса Aquastream backend-event, охватывающий стадии анализа, проектирования, интеграции, тестирования и деплоя. План учитывает требования и обеспечивает последовательное выполнение всех необходимых задач.

1. Анализ требований и проектирование архитектуры
   •	Изучение требований: На первом этапе команда внимательно анализирует бизнес-требования и сценарии использования (описанные ранее) для полного понимания ожидаемого функционала. Выявляются основные сущности домена: события (Event), бронирования (Booking), платежи (Payment), отзывы (Review), избранное (Favorite), промокоды (PromoCode) и т.п. Уточняется жизненный цикл каждой сущности и взаимодействие между ними.
   •	Проектирование общей архитектуры: Решается, что сервис будет построен по микросервисным принципам: свой REST/gRPC API, собственная база данных (PostgreSQL), взаимодействие с другими сервисами через четкие интерфейсы (gRPC для синхронных запросов, Kafka для асинхронных событий). Выбирается стек: например, Java + Spring Boot для реализации, Protobuf/gRPC для контрактов, Kafka для Event-driven коммуникации.
   •	ER-диаграмма данных: На основе выделенных сущностей разрабатывается схема базы данных. (См. раздел “Модель базы данных” выше). Определяются таблицы, поля, типы данных, ключи и связи, с учетом ожидаемых запросов. Особое внимание – ограничения целостности (уникальность, обязательность полей, ограничения статусов). ER-диаграмма согласуется с командой – убеждаемся, что она покрывает все требования (например, хранение нескольких ценовых категорий, учёт промокодов, связь отзывов с пользователями и т.д.).
   •	Интерфейсы взаимодействия с другими сервисами: Описывается, как backend-event будет интегрироваться:
   •	API Gateway: Сервис будет за Gateway, значит, нужно определить REST endpoints (уже сделано) и как они маппятся на gRPC. Gateway будет доверять JWT токенам от Keycloak и передавать их внутрь. Также планируется, что Gateway может выполнять трансформацию (например, агрегировать ответы нескольких сервисов, если нужно – но в нашем случае, основной поток прямо к event сервису).
   •	Auth (Keycloak): event-сервис сам не хранит пользователей, но он должен получать информацию о них из JWT. Продумываются роли и, возможно, scope. Решено: role “organizer” будет в токене у организаторов, “admin” у админов. Для получения профиля пользователя (имя, аватар) при необходимости сервис может вызывать backend-user по gRPC (например, у нас есть UserProfileResponse, значит, где-то надо брать эти данные – либо кешировать по user_id, либо запрашивать при необходимости). В рамках MVP, можно упростить: не возвращать подробный профиль, только ID.
   •	Crew service: интеграция через gRPC. Необходимо получить спецификацию методов у команды, отвечающей за сервис персонала. Предположим, есть методы AssignCrew(eventId) и ReleaseCrew(eventId) или нечто подобное. План: при создании/публикации события, если требуется, вызывать AssignCrew (async или sync?), получать crew_id, сохранить в событии. При отмене события – звать ReleaseCrew. Для этого в event-сервисе пишется gRPC-клиент (Spring Boot + Stub от proto crew). Нужно продумать обработку ошибок: если AssignCrew не ответил, мы, возможно, сохраняем событие без crew_id, а потом повторяем попытку (как указано в требованиях по отказоустойчивости).
   •	Notification service: Решено использовать Kafka для связи. Определяем набор топиков/сообщений, которые event-сервис будет публиковать (EventCreated, BookingCreated, PaymentConfirmed, etc.). Формат сообщений – например, простой JSON с ключевыми полями (ID, тип, timestamp). В будущем можно сделать schema registry, но на первых порах хватит JSON. Продумываем, в каких местах кода будем отправлять эти сообщения (после сохранения события, после брони, после оплаты и т.д.). Также подписка на Kafka не требуется – notifications сам подписывается. Event-сервис выступает только как producer на Kafka, не consumer (по текущим требованиям).
   •	Нефункциональные аспекты: В архитектурном проектировании учитываются требования по масштабируемости (сервис без сохранения сессий, stateless, готов работать в нескольких экземплярах), по безопасности (JWT, TLS – значит, настроим Spring Security JWT фильтр), по мониторингу (решаем сразу встроить Actuator/Micrometer).

Выход этого этапа: согласованная архитектура сервиса, диаграммы (ER, компонентные, последовательности основных случаев), список интеграций и контрактов с внешними сервисами. Документируется архитектурное решение, чтобы приступить к реализации.

2. Подготовка инфраструктуры
   •	Репозиторий и каркас проекта: Создается новый репозиторий (или модуль) для сервиса events. Инициализируется Spring Boot приложение (Gradle или Maven) с нужными зависимостями: Spring Web (для REST Gateway controllers, опционально), Spring Boot gRPC (или Netty + Proto stubs), Spring Data JPA (для работы с PostgreSQL), Kafka client, Spring Security (JWT), etc. Организуется пакетная структура (например: org.aquastream.event корень, внутри controller, service, repository, model, grpc и т.п.).
   •	Docker-compose (локально): Для локальной разработки настраивается Docker Compose, включающий:
   •	postgres (контейнер Postgres БД для events, возможно, с запуском init скриптов или подключением Volume с данными),
   •	kafka (Kafka + Zookeeper для отладки эвентов),
   •	keycloak (для локальной проверки аутентификации, или stub),
   •	сам backend-event (собираемый из локального Dockerfile).
   •	Опционально, контейнеры backend-crew и backend-notification можно поставить заглушками (например, mock servers) или использовать if available.
   Цель: разработчики могут запустить docker-compose up и получить все необходимое окружение, чтобы тестировать сервис локально.
   •	Dockerfile: Пишется Dockerfile для сервисного приложения (на базе openjdk 17 slim, например). Учесть, чтобы в контейнере были переменные окружения для доступов (DB URL, creds, etc.). Проверяется, что приложение корректно собирается и запускается внутри контейнера.
   •	CI/CD pipeline: Настраивается непрерывная интеграция: например, GitLab CI or GitHub Actions. Шаги: сборка артефакта (Gradle build), прогон юнит-тестов, сборка Docker-образа, возможно пуш образа в registry. Также настроить steps для деплоя (например, в dev-окружение автоматически на Kubernetes).
   •	Kubernetes манифесты: Готовятся YAML-манифесты для деплоя сервиса в кластер: Deployment (с нужным числом реплик, readiness/liveness probes на /actuator/health или gRPC health), Service (ClusterIP, и если нужен Ingress/Gateway route). Настраиваются ConfigMap/Secret для конфигов – например, URL базы, креды, Kafka brokers, Keycloak realm info. Ingress/Gateway: если API Gateway уже существует отдельно – возможно, event-сервис регистрируется в Gateway, и ingress напрямую к нему не нужен. Но как микросервис, он все равно может иметь internal Service.
   •	Secrets: Определяется, какие секреты необходимы: например, Keycloak public key (для JWT верификации) или client credentials (если сервис сам обращается к Keycloak), учетные данные БД (username/password), SSL сертификаты если нужны. В K8s манифестах это представлено Secret-ами, а в приложении – доступ через env vars или mounted volumes.
   •	Configuration management: Проверяется, что все настраиваемые параметры вынесены: application.yaml с placeholder-ами или использование Spring Cloud Config (если есть). На первом этапе, можно через обычный application.properties + override через env.
   •	Logging/Monitoring setup: В образе/конфигурации подключаем базовые вещи: JSON logging (Spring Boot можно настроить через logback). Также, если используем Prometheus, то либо Spring Boot Actuator /prometheus, либо micrometer-prometheus dependency, чтобы метрики были доступны (к ним добавим endpoint).
   •	Review: На этом этапе желательно провести ревью инфраструктуры с DevOps инженерами: убедиться, что выбранные образы, конфиги соответствуют корпоративным стандартам (правильные версии, минимальные привилегии у контейнера, readiness probe не забыт и т.д.).

Выход: Базовая инфраструктура готова: можно запускать сервис локально и на dev-стенде, сборка и деплой автоматизированы, окружение (БД, Kafka, Keycloak) настроено.

3. Реализация базы данных и миграций
   •	Описание схемы (DDL): На основании спроектированной ER-модели пишется SQL скрипт создания таблиц и индексов. Например, V1__Create_event_tables.sql для Flyway/Liquibase. В нем: CREATE TABLE для event, booking, payment, etc., со всеми колонками, PK, FK, UNIQUE, CHECK (ограничения на статус через CHECK IN (…)). Включаются индексы (CREATE INDEX) на поля поиска. Особое внимание типам: используем UUID для user_id (в Postgres есть тип UUID), POINT для координат (PostGIS или встроенный point), ENUMы в Postgres можно реализовать как тип или просто CHECK constraint.
   •	Миграции: Подключается Flyway или Liquibase в проект. Flyway проще – просто положить SQL в папку db/migration. Решаем использовать Flyway. Скрипты версионируются (V1__init.sql, V2__… etc.). Flyway настроен на запуск при старте приложения (в dev/prod можно авто-migrate, либо в prod – миграции запускает DevOps отдельно).
   •	Репозитории (DAO) и сущности: В коде создаются JPA Entity классы, соответствующие таблицам (EventEntity, BookingEntity, PaymentEntity, etc.), с нужными аннотациями. Определяются отношения: OneToMany, ManyToOne (например, BookingEntity имеет поле event (ManyToOne Event); EventEntity может иметь list но можно опустить, т.к. не всегда нужно тянуть). Если проект следует DDD, можно не делать bidirectional.
   •	Альтернатива – использовать MyBatis или прямые JDBC, но Spring Data JPA ускоряет старт, плюс поддерживает JPQL/Criteria. Выбираем JPA для быстроты.
   •	Инициализация данных (dev): Для удобства тестирования можно подготовить test data – например, data.sql для профиля dev, создающий пару событий, пользователей, бронирований. Либо написать CommandLineRunner, который при запуске в dev-среде заполнит базу примерами (с условием if (env == dev) ). Это поможет быстро проверить API ручками.
   •	Валидация схемы: Запускаем приложение, Flyway применяет миграции, проверяем в БД структуру. Затем выполняем несколько пробных операций (через тесты или через приложение) чтобы убедиться, что ограничения работают: например, пробуем добавить две брони одного пользователя на одно событие – должна ошибка уникальности, добавить отзыв с рейтингом 6 – должна ошибка CHECK, и т.д. Если что-то не так, правим миграцию.
   •	Обеспечение расширяемости схемы: Проверяем, что схема позволяет дальнейшее развитие: например, поле category в Event сейчас VARCHAR – возможно, позже заменим на category_id. Мы можем уже сейчас создать внешний ключ event.category_id -> event_category.id и со временем отказаться от текстового. Но пока решили оставить текст для простоты (меньше join). Однако, заложим возможность: возможно, добавим nullable category_id в будущем версии. Flyway миграции это покроют.
   •	Связь Event-Category: Если требуется изначально – можно сразу сделать. Но чтобы не блокировать, документируем: “можно улучшить нормализацию по категориям впоследствии”.
   •	Нагрузочное тестирование схемы (опционально): На этом этапе, если доступны инструменты, можно сгенерировать скажем 100k событий, 1M бронирований и проверить, что индексы работают (планы запросов). Но это больше на этапе тестирования.

Выход: Схема данных реализована в коде и базе, миграции протестированы. Можно уверенно сохранять и читать объекты через базовый слой.

4. Реализация gRPC API
   •	Protobuf определение: Создается файл event_service.proto (или несколько, можно разделить по тематике, но один сервис – один proto хватит). В нем описывается пакет org.aquastream.event, service EventService { … } со всеми rpc методами, как указано в спецификации API. Определяются message для запросов и ответов: например, CreateEventRequest с нужными полями (типы Protobuf: string, int32, google.protobuf.Timestamp, etc.), EventResponse и другие. Мы уже спроектировали эти сообщения ранее; теперь важно их аккуратно записать. Используются well-known types (StringValue, etc.) для optional в update-запросах. Включаются комментарии documentation для каждого RPC и message (чтобы сгенерировалась документация, если нужно).
   •	Генерация кода: Настраиваем плагин protoc в Gradle, чтобы по сборке генерировались Java-классы из proto (в нашем случае мы на Java, можно также генерить Go/Python clients, но пока не нужно). Проверяем, что сгенерировались stubs: EventServiceGrpc, и все message classes. Эти классы будут использоваться в реализации.
   •	Имплементация сервисных методов: В Spring Boot интеграции gRPC обычно делается либо через annotation (@GrpcService) либо via manually extending BindableService. Мы создаём класс EventServiceImpl extends EventServiceGrpc.EventServiceImplBase. В нем реализуем override методов: createEvent, updateEvent, … и т.д. Каждый метод:
   •	Валидация входных данных: Проверяем, что обязательные поля заполнены, форматы корректны. Например, в CreateEventRequest – name не пустой, start_date > текущего времени (если событие в прошлом – логически странно, но можно не запрещать), booking_deadline_hours >= 0, и т.д. Если что-то неверно – кидаем Status.INVALID_ARGUMENT с описанием.
   •	Бизнес-логика: Преобразуем запрос в сущности и вызываем соответствующие методы сервисного слоя (например, EventService - уже наш класс, не grpc - с методом createEvent). В простом случае можно имплементировать логику прямо внутри (с обращением к JPA Repository для сохранения). Но лучше отделить: сделать @Service бины EventManager, BookingManager, etc., чтобы grpc класс был thin.
   •	Доступ по ролям: Хоть Gateway и проверяет, например, роль, внутри сервиса тоже желательно проверить (Defense in Depth). Например, метод CancelEvent: нужно убедиться, что вызывающий пользователь имеет права. Откуда узнать пользователя? Можно пробросить в контекст gRPC metadata JWT или user-id. Spring gRPC поддерживает интерцептор, который достает из Metadata Authorization header и валидирует JWT (Spring Security integration). Предположим, мы настроили, что в SecurityContextHolder доступен Principal. Тогда внутри метода можно получить userId и роли. Реализуем: SecurityContext и получаем Authentication. На основании этого решаем – если пользователь не админ и не организатор события, то запрет. Такие проверки добавляем в методы, где важно (создание события – должен быть organizer, но это можно просто проверить по роли; отмена брони – сложнее: если не админ и не организатор, а user, то еще проверить, что бронь принадлежит ему).
   •	Обработка взаимодействий: Например, CreateBooking: тут нужно внутри метода не только сохранить бронь, но и установить дедлайн, возможно, запланировать задачу отмены (через scheduler или отправив отложенное сообщение). Может, на этапе MVP, достаточно сохранить, а фоновый поток будет проверять дедлайны. Решаем: используем простой подход – при старте сервиса запускать scheduled job, который каждую минуту отменяет просроченные брони. (Добавим в план).
   •	Возврат ответа: После выполнения логики формируем ответные объекты (например, конвертируем сущность EventEntity в EventResponse message). Здесь пригодится заполнение computed полей: available_seats = max_participants - count(confirmed bookings). Такой подсчет можно сделать запросом или хранить в поле. Для простоты – делаем on-the-fly при каждом GetEvent. (Если нагрузка высокая, можно оптимизировать с кэшом). Для ReviewResponse, если нужен UserProfile, можно вызвать user-сервис (это sync call, может замедлять выдачу списка отзывов. Допустим, мы на этапе MVP возвращаем только user_id, а фронт потом сам дернет user API – так проще и разгружает сервис).
   •	Внутренние вспомогательные методы: Возможно, пишем converter utils (Entity -> Proto message, and back). Или используем MapStruct. Но вручную несложно – продолжим без дополнительных зависимостей.
   •	Проверка цепочек: Реализовав пару методов, запускаем сервис и пробуем gRPC-клиентом (можно сгенерировать temporary client in Java or use BloomRPC tool) – проверяем, что CreateEvent создаёт запись в БД, возвращает ожидаемые поля. И так для нескольких ключевых методов.
   •	Валидация сценариев: После имплементации всех методов, желательно пройти основные бизнес-потоки (как в сценариях):
   •	Создать событие -> публиковать -> бронировать -> оплатить -> отменить -> оставить отзыв, и проверить, что все шаги выполняются, статусы меняются как нужно, связанные действия (Kafka publish, etc.) происходят. Это может быть сделано как интеграционный тест или manual via gRPC UI.
   •	Error handling: Убеждаемся, что при ошибках (например, бронирование последнего места параллельно) сервис возвращает понятную ошибку. Реализуем, например, optimistic lock: при подтверждении брони обновляем Event.availableSeats (если храним) или делаем проверку в SQL. Если нет – возвращаем ошибку.
   •	Документация API: Поскольку gRPC, можно сгенерировать .proto.html docs, но важнее REST. Тем не менее, прототип .proto – часть репозитория, он версионируется и считается контрактом. Сохраняем его в документации.

Выход: gRPC API сервиса полностью реализован и покрывает все требуемые действия. Сервис на этом этапе способен выполнять основную бизнес-логику при вызове методов (пока напрямую по gRPC).

5. Интеграция с API Gateway
   •	Маршрутизация REST: Конфигурируем API Gateway (например, use Spring Cloud Gateway или Kong/Nginx). Предположим, используется Spring Cloud Gateway с discovery. Тогда нужно добавить маршруты: все запросы, начинающиеся с /api/events, /api/bookings, /api/payments, etc., направлять на сервис events (можно по Eureka service-id или statically). Если Gateway -> gRPC conversion, возможно, использовать gRPC-JSON transcoding (Envoy) или собственный controller. В нашем случае, проще может быть: внутри проекта event поднять REST controllers (Spring MVC) и вызывать gRPC self or directly service. Но по условию – Gateway выполняет преобразование. Можно реализовать отдельный API Gateway Adapter – например, a thin layer that uses event-service’s gRPC stub. Но, скорее, API Gateway – отдельный service in Aquastream. План:
   •	Настроить в Gateway YAML маршруты.
   •	Если Gateway поддерживает gRPC proxy, возможно мыExpose event-service via gRPC and Gateway just pass-through with HTTP2. Но обычно Gateway endpoints are REST.
   •	Можно использовать gRPC transcoding (like gRPC-Gateway in Go) or maintain parallel REST controllers. Simpler: implement REST controllers in event-service that call the same service methods. However, to stick with microservice separation, assume Gateway does it.
   •	Преобразование протоколов: API Gateway принимает JSON и должен вызывать gRPC. Можно использовать something like gRPC JSON Transcoding (available in Google API Gateway, Envoy proxies). Alternatively, if Gateway is built on Spring, it could call eventService via a gRPC stub (like a client inside gateway). This needs a client stub of event-service in gateway. Possibly too complex. Maybe the architecture intended a simpler route: The event-service might actually also offer REST (with controllers calling the same service logic) behind gateway. This double API approach is acceptable if done carefully.
   •	Decision: We’ll assume gateway uses gRPC-web or similar. But to not complicate, let’s say we implement minimal REST endpoints in event-service as well using Spring MVC, which internally call the same service logic. That way, Gateway can just forward HTTP requests to event-service (like a reverse proxy). This deviates from strictly only gRPC internal, but ensures we have a working REST API quickly.
   •	JWT propagation: Gateway should forward the Authorization header (the JWT) to the event-service. If using direct HTTP proxy, header passes through. In event-service, Spring Security will validate it (with Keycloak’s public key). Alternatively, if Gateway terminates JWT and passes user info via microservice calls, it could embed user-id/roles in gRPC metadata. Either approach, ensure that in event-service, the context has the user identity. We likely implemented JWT parsing in event-service itself (e.g., using spring-security-oauth2-resource-server). If so, Gateway can just forward the token.
   •	Access control double-check: On Gateway, define route rules: e.g. require role ORGANIZER for POST /api/events, etc. If using Spring Cloud Gateway, can integrate with Keycloak for route-based auth. Even if not, event-service will enforce again.
   •	Testing via Gateway: After setup, attempt a full flow through the Gateway (call REST endpoint as a client would). Check that the request hits event-service (we see logs or result in DB). Eg: send POST /api/events with JWT of organizer – event created in DB. Try unauthorized access – Gateway might block if configured, or event-service returns 401 if token missing. Ensure all endpoints working as expected.
   •	Logging and tracing: Ensure Gateway adds a trace-ID header or similar correlation ID to pass to event-service (for distributed tracing). Also maybe user-id in logs (though JWT will be parsed anyway).
   •	CORS configuration: If front-end (browser) calls API Gateway from a different origin, we need CORS. Typically, configure Gateway to allow certain origins, or in response headers. We’ll allow the domain of front-end. It’s set in Gateway config (allowedOrigins, allowedMethods, allowedHeaders including Authorization). This ensures browser JS can call our API.
   •	Failover: If event-service down, Gateway returns error (502 or custom). Ensure Gateway has a timeout and maybe fallback message for user (though likely just propagate error).
   •	Rate limiting/public API protection: Potentially use API Gateway’s built-in rate-limit filters for public endpoints (like GET /events) to prevent abuse. Set e.g. 100 req/sec per IP. Also, maybe some caching at gateway for GET /events (short TTL) if needed, though we also have caching in service. Could be double but fine. Possibly skip for now.

Выход: Gateway is configured; external clients can access the event-service functionality through documented REST endpoints. JWT and role-based access are enforced at entry and within service. Verified flows through Gateway.

6. Интеграция с Keycloak (RBAC)
   •	Настройка Keycloak: В Keycloak (or whichever auth server) define a realm for Aquastream, with client for the Gateway or event-service resource. Define roles: user, organizer, admin. Organizers are basically users with an extra role. Admin – separate. Assign roles to test users for development. Possibly set up realm mappings such that Keycloak’s Access Token has roles in realm_access.roles.
   •	Resource server config: In the event-service Spring configuration, enable JWT validation: provide the JWKS URI or public key of Keycloak. Spring Security is set to require authentication for all endpoints by default except those marked as permitAll (like GET /events possibly permitAll). We annotate or configure WebSecurity to allow certain endpoints without auth (like GET /events, GET /reviews), and require roles for others. For example: .antMatchers(HttpMethod.POST, "/api/events").hasRole("organizer") etc. (Keycloak roles might come as “organizer” or “ROLE_ORGANIZER” depending on adapter). We might also rely on method-level security (like @PreAuthorize).
   •	Propagation of identity in gRPC: If event-service calls out to crew-service gRPC, likely it should forward an identity context (so crew-service knows who requested, e.g., for audit or to restrict if needed). We plan to include the JWT in gRPC Metadata. Possibly use an interceptor on client stub to attach Authorization header. The crew-service can similarly validate it. If crew-service needs user roles context (likely crew will trust event-service for authorized calls, but we can still pass user info if needed).
   •	Refresh token / session: Not directly handled by event-service, it’s stateless. If user token expired, Gateway/Keycloak should handle refresh flow.
   •	Testing security: Simulate requests with various roles tokens: ensure e.g. a normal user cannot create event (gets 403), organizer can, etc. Test an endpoint like cancelBooking: if user tries to cancel someone else’s booking – event-service should detect userId mismatch and respond 403. These checks implemented via security context in service.
   •	Role updates: If a user is promoted to organizer in Keycloak, their new tokens will reflect that. No change needed in service except that it will accept them as organizer. If roles are updated mid-session, refresh token usage will get new roles. We should consider token expiration – perhaps 1 hour tokens, refresh must be done via Keycloak by client. It’s fine.
   •	Edge: admin acting as others: Admin tokens allow all ops. Perhaps admin might impersonate or specify userId in some calls (like ListBookings? Already can filter by user). It’s okay.
   •	Penetration testing: Once security integrated, one should test that, for example, you cannot bypass checks by altering your token (should be signed, so no), and that no critical endpoint is left unprotected inadvertently. Also test injection attacks on inputs (the data validation we have covers that mostly, plus param binding).

Выход: Security integration is complete – service reliably authenticates JWTs, respects role-based auth on all endpoints, and forwards identity to downstream services where needed. The system ensures that only authorized users can perform each action.

7. Интеграция с backend-crew (сервис управления персоналом)
   •	gRPC клиент настройка: На основе контракта crew-сервиса (proto definitions), генерируется stub for its gRPC. (Если crew-service also uses proto and has published .proto – we include it). Suppose there’s CrewService.AssignCrew(EventInfo) and CrewService.ReleaseCrew(EventId) methods. We add crew-service address in config (e.g., CREW_SERVICE_HOST env). Using Spring’s gRPC or plain stub, configure a bean CrewServiceClient that wraps stub calls with proper deadlines and error handling.
   •	Вызов при назначении экипажа: В нашем event-service, при создании/публикации события, если organizer requested auto-crew (maybe indicated by a field auto_assign_crew or simply by calling AssignCrew endpoint), we call crew client: e.g., crewClient.assignCrew(eventId, eventDetails). This returns crew_id or details. On success, we update the event record: set event.crew_id and status (maybe crew_assigned flag). If crew service fails (timeout or no crew available), our service should handle gracefully: maybe log an error and continue event creation with crew_id = null. Or mark event with a flag “crewPending”. Possibly also schedule a retry. We’ll implement simple: if crew not available, event still created, and we might add a notification to admin to handle manually. We also could implement a retry mechanism using Kafka events: e.g., event-service publishes an EventCreated event anyway, and some background consumer (or external orchestrator) tries to assign crew later. For MVP, synchronous attempt is fine.
   •	Вызов при отмене/изменении: If an event is canceled (organizer or admin calls CancelEvent), event-service should notify crew-service to release the crew team (so they become available for other tasks). So in CancelEvent logic, after marking event canceled, call crewClient.releaseCrew(event.crew_id). If event date/time changed (UpdateEvent), maybe we should call something like crewClient.updateAssignment(eventId, newDate) to let crew rearrange schedule. If not available, might have to assign new crew. Possibly simpler: if date changed, we release current crew and assign new crew via two calls. This needs coordination with crew team. We’ll assume out-of-scope for now or implement as: on event update, if critical fields changed, try reassign (release then assign).
   •	Auth context: When calling crew-service, include context of who triggered (so crew-service knows if it’s authorized). Could pass JWT as metadata. We’ll implement an interceptor that attaches current request’s JWT to outgoing gRPC calls.
   •	Timeouts and retries: Because crew assignment is not user-facing immediate necessity, we can set a generous timeout (e.g., 5 seconds). If fails, log and optionally schedule retry. For scheduling, possibly integrate with a message queue or Spring @Scheduled to reattempt assignment for events missing crew. Or place it in a local in-memory queue. For reliability, maybe produce an event “CrewAssignmentFailed” that triggers something. This might be advanced, for MVP logging and admin manual fix is okay. But since in requirements we highlighted resilience: we can implement a simple retry: try assign crew 3 times with backoff. If still fail, set a flag in event. Possibly send notification to admin (via Kafka event “CrewAssignFailed”). That would complete the loop with notifications.
   •	Testing integration: Use a stub or mock crew-service in dev (like a simple gRPC server that returns a dummy crew id). Test that event creation triggers that call and crew_id is set. Also test cancellation triggers release call. If no crew assigned (crew_id null), skip calling release.
   •	Error scenarios: Confirm that if crew-service is down, our event creation still succeeds (with no crew). This means crewClient call should be in try-catch, not crashing the whole flow.
   •	Documentation: Document in internal docs that event-service depends on crew-service for these functionalities and how failures are handled.

Выход: Integration with crew management is implemented. The event-service can assign crew to events and handle crew release. Failures in this process do not interrupt core event operations, meeting the resilience requirement.

8. Интеграция с Kafka и сервисом уведомлений
   •	Kafka producer setup: Add Kafka client config (brokers, topics). Possibly use Spring Kafka or the plain KafkaProducer. Spring Kafka can allow use of templates easily. Define topic names as constants or config: e.g., topic.events, topic.bookings, topic.payments. Possibly use separate topics or a unified topic with event type key. Simpler: one topic “aquastream.events” and message has field “eventType”. But for clarity, we might do: events.public (for event lifecycle), events.booking, events.payment.
   •	Message format: We decide on JSON for now. We can define a small Java class for each event type or use a map. Alternatively, since we already have Protobuf messages, we could reuse them or define smaller event schemas. Simpler: create a method to build a JSON string containing event id, type, and maybe user or related id. E.g., on booking created: send {“type”:“BookingCreated”,“bookingId”:123,“eventId”:45,“userId”:”…”,“quantity”:2,“status”:“PENDING_PAYMENT”,“timestamp”:…}. For PaymentConfirmed: {“type”:“PaymentConfirmed”,“bookingId”:123,“paymentId”:77,“amount”:100.0,“method”:“CARD”,“timestamp”:…}.
   •	Triggering events: Identify places in code to publish:
   •	After successful CreateEvent (especially if published immediately) – event created event. If event is a draft, maybe not necessary to notify.
   •	After PublishEvent – maybe “EventPublished”.
   •	After CancelEvent – “EventCanceled” (with reason).
   •	After CreateBooking – “BookingCreated” (including payment deadline, maybe).
   •	After CancelBooking – “BookingCanceled” (with who canceled and reason).
   •	After ConfirmPayment – “PaymentConfirmed” (with details).
   •	After RefundPayment – “PaymentRefunded”.
   •	After AssignCrew – possibly “CrewAssigned”.
   The plan scenarios specifically mention notifications on creation, booking, payment, cancellation, crew assignment – so we cover those.
   •	Implement publishing: In code, after the database transaction is committed for each action (if using JPA, maybe in service method after save), call KafkaTemplate.send(topic, message). Ensure to include a key if needed (maybe eventId or bookingId as key to partition logically). Possibly ensure to flush or handle send result (we can do async send and log on success/failure).
   •	Kafka error handling: If send fails (e.g. broker down), Spring Kafka by default will retry or drop? Actually send returns a ListenableFuture. If not awaited, failure might not stop flow (which we want). But we do want to eventually deliver. We could use Kafka’s internal retries or rely on the resilience measures (circuit breaker, local queue). Considering time, we can allow Kafka producer to retry a few times (set retries in config). If it fails permanently, it logs error – maybe set up a Dead Letter Queue or just trust ops to catch the outage. Requirements say buffer locally. Could implement a fallback: if send exception, write the message to a local file or DB table for later processing. This adds complexity. Perhaps mark this as a to-do for later. For now, rely on Kafka’s own reliability: if it’s down, messages will throw, we log error; when Kafka back, either action will be re-tried if user tries again (like PaymentConfirmed might be retried by gateway or by our confirm Payment if they recall it). It’s not perfect. But given the requirement, maybe implement a minimal persistent buffer: a table pending_events with JSON and type, and a background job that tries to flush them to Kafka. This ensures no loss. It’s a bit heavy to do fully now, might postpone. Possibly write to DB only if Kafka send fails, and separate thread reads and tries to send them. Document that as approach.
   •	Notification Service consumption: The service notifications is presumably subscribed to these topics and sends out actual emails/SMS. We coordinate with that team to ensure our message format is acceptable to them. Perhaps they want specific fields. If needed, adjust message structure or use a proper schema.
   •	Testing Kafka integration: Use a local Kafka consumer (e.g., Kafka CLI or a small test consumer) to listen on our topics while performing actions in event-service. Confirm that messages appear with correct content.
   •	Analytic consumers: Possibly also an analytics service will subscribe. We ensure consistency of events for them. Document events in README for others to use.
   •	Extensibility: We foresee maybe adding more event types in future (like review created events for analytic sentiment, etc.). The system can easily add those.
   •	Kafka security: If cluster requires auth (SASL), configure it. For dev, plaintext is fine.
   •	Event versioning: If message format changes, consider backward compatibility. Right now initial version, so fine.

Выход: Event-service now emits domain events to Kafka for important state changes. This decouples the notification sending and other side effects from the main logic, improving scalability and allowing other services to react to these events. The event pipeline is tested and documented.

9. Реализация бизнес-логики бронирования и оплаты

(Этап, посвященный тонкой доводке и проверке правил бронирования/оплаты, часть логики уже затронута, но здесь структурируем и завершаем.)
•	Жизненный цикл брони: Убедиться, что состояние бронирования правильно переходит через этапы:
•	Создание брони -> статус PENDING_PAYMENT, назначается payment_deadline (текущее время + X часов или конкретный срок, храним в поле).
•	Оплата (ConfirmPayment) -> статус меняется на CONFIRMED, фиксируем время оплаты (в updated_at).
•	Авто-отмена -> при истечении дедлайна без оплаты статус меняется на EXPIRED (или CANCELED? Мы различаем: EXPIRED означает автотаймаут).
•	Ручная отмена -> если Pending, можно сразу Cancel (status CANCELED). Если Confirmed (оплачена) – возможно, при отмене события, тогда Booking тоже пометить CANCELED (или separate reason field).
•	Добавить, куда нужно, поле reason отмены, если хотим хранить (в CancelBookingRequest приходит reason; можно сохранить в Payment or Booking notes). Пока неявно, можно в лог только.
•	Фоновый процесс дедлайнов: Реализуем механизм автоматической отмены. Способы:
•	Database-driven: periodically run SQL: UPDATE booking SET status='EXPIRED' WHERE status='PENDING_PAYMENT' AND payment_deadline < now() RETURNING * – to get those that expired. Then for each returned, free up seat count (or just trust that queries count them anyway). Or
•	Application-driven: use Spring @Scheduled every, say, 5 minutes to find expired bookings (JPA query findByStatusAndPaymentDeadlineBefore(PENDING, now)) and cancel them. Then maybe produce an event BookingCanceled.
•	If we want fine granularity (to cancel exactly at deadline minute), could schedule a single-shot task for each booking (e.g., using Java Timer or Quartz). That could be heavy for many bookings. Simpler periodic check is fine. 5-minute resolution is acceptable. We choose scheduled polling.
•	Implementation: Create a Spring @Scheduled(cron=”*/5 * * * *”) in event-service that calls a BookingService.cancelExpiredBookings(). That method finds all overdue bookings, updates status, and possibly sends out notifications (via Kafka events already handled).
•	Ensure to guard concurrency (if multiple service instances, either only one should do it, or each will do different shards). Possibly easiest: elect one instance as scheduler via a distributed lock (e.g., using Redis or DB row lock). Alternatively, each instance could attempt to cancel, but they’d conflict updating same records. We can mitigate by using DB query with some condition like only instance with some ID does it – complicated. Alternatively, run scheduled tasks only on one replica by configuration (some platforms allow designate one pod for cronjobs, or just disable schedule on others via config map). If not, implement a leader election. For MVP, if single instance is expected, skip. If multiple, simplest solution: do scheduling outside microservice – e.g., Kubernetes CronJob that calls a specific admin API to trigger cancellations. But that’s overhead. Possibly run on all, but have them do atomic updates where only one will actually update a given booking due to DB constraints – it’s somewhat safe since each booking update will either succeed for one thread and others find none. Acceptable risk of duplicate effort minimal. We’ll proceed with in-app scheduler, noting to refine if multi-instance issues arise.
•	Подтверждение оплаты: Оплата может быть эмулирована: e.g., for development, have a stub where ConfirmPayment just called by front after a delay. In production, integrated with real gateway – likely via webhook. Possibly our ConfirmPayment endpoint will be invoked by gateway after receiving a webhook from payment provider (the gateway can be configured as callback URL). Ensure ConfirmPayment can be idempotent (if provider calls twice or user triggers manual confirm after auto confirm). Implement idempotence: Payment has unique gateway_reference; ensure if a Payment with that reference is already completed, ignore subsequent confirms or just return current status. Also mark Payment as completed so we don’t double confirm.
•	Уникальность бронирования: Already enforced by DB and logic.
•	Additional rule: A user should not be able to book their own event if they are organizer (makes little sense to “book” your event). But maybe an organizer might add himself as participant. If it’s not desired, we can block booking where event.creator_id == user_id (unless maybe admin or test). We’ll enforce that: in CreateBooking logic, if booking user == event.creator -> throw error “Organizers cannot book their own event”. Admin might override though, but likely unnecessary scenario.
•	Another rule: cannot book after certain time (booking_deadline_hours before start). We already store booking_deadline_hours in event and check in CreateBooking: if now > event.start_date - booking_deadline_hours, reject.
•	Вместимость (capacity) контроль:
•	Before creating booking, count confirmed bookings for event + pending ones (since pending hold seats until expire) and ensure adding this new booking.quantity <= available seats. Because we allow multiple tickets in one booking (quantity field), must consider that too.
•	Implementation: We can maintain a field event.bookedCount or we do a SELECT SUM(quantity) FROM booking WHERE event_id = X AND status IN (PENDING_PAYMENT, CONFIRMED). Compare with max_participants. If would exceed, throw exception “Not enough seats”.
•	This check needs to be atomic to avoid race: multiple threads reading count simultaneously. Solutions:
•	Lock row in event (SELECT for update and then compare and update something). If we don’t store a count, we can simply attempt to insert booking and rely on unique user constraint + afterwards adjust count. But oversell possible if concurrent.
•	Alternatively, use optimistic locking by version field on Event: approach: read event.version and available seats from DB, if seats >= requested, attempt to insert booking and concurrently update event.version (which triggers optimistic lock if someone else updated event in between). That may be too complex.
•	Or simpler: do UPDATE event SET something = something WHERE id=X AND (SELECT (max_participants - (SELECT SUM(quantity) from bookings where event_id=X and status in (Pending,Confirmed))) >= requestedSeats). But using subquery in update is advanced.
•	Could try: ensure DB constraint never oversells: e.g., use check constraint that sum of confirmed <= max, but since sum isn’t a simple field, not straightforward.
•	We can assume low concurrency scenario to not oversell by much. However, microservice environment might indeed have many concurrency.
•	Another approach: use a distributed lock (like Redis lock) around booking creation per event. The Medium article suggested Redis Lock to prevent race conditions. We might incorporate that since we have Redis for caching.
•	Considering timeline, perhaps good to include: Use Redis or an in-memory lock by eventId. For now, an in-memory synchronized per instance won’t solve multi-instance. If multi-instance, a distributed lock (like Redisson library) could be used. We have Redis so could implement a simple “SETNX lock:event:{id}” approach for a short time while processing booking.
•	For MVP, note that we should handle concurrency carefully; given complexity, we might proceed with simplest approach (select + if fails throw), acknowledging slight risk if two bookings at exact same ms might oversell by a small number above capacity which could be corrected manually. Possibly okay if rare. But since we aim robust solution, let’s incorporate a lock:
•	Acquire lock in Redis for key “event:{id}” with short expiry (like 5 seconds) before counting and inserting. If lock not acquired (already locked by another booking in progress), either wait or return busy. We can try a few times quickly. This ensures one booking creation at a time per event.
•	Once acquired, re-check seats, create booking, release lock.
•	We’ll mention that approach in documentation and possibly implement if time.
•	Отмена события (массовая отмена бронирований): When an organizer or admin cancels an entire Event (CancelEvent), all existing bookings for that event (Pending or Confirmed) should be marked canceled (with reason “Event canceled”). If some were paid, initiate refunds. Implementation:
•	In CancelEvent handler, after setting event.status = CANCELED, fetch all bookings of that event with status not CANCELED/EXPIRED yet. For each:
•	If status CONFIRMED (paid): mark it CANCELED and possibly call RefundPayment for the associated Payment (which triggers refund process).
•	If status PENDING_PAYMENT: mark CANCELED (no payment to refund).
•	If EXPIRED: those are already not active, can leave as is.
•	Optionally, group notify participants via notifications event. But sending one Kafka message per booking or one aggregated? Possibly simpler to send per booking BookingCanceled. Notification service might handle them individually (send email “Event canceled, your booking refunded” to each user). Or a combined message “Event X canceled” could be enough. But since we want to handle refunds specifically, per booking message is fine.
•	This could be heavy if thousands of bookings, but manageable by batch.
•	Ensure idempotent: if CancelEvent called again or repeated (shouldn’t normally), or partial failure in the middle (if crash, some bookings canceled, some not), but on recovery, event is already CANCELED, maybe they won’t call again. If they do, just skip because already canceled.
•	Partial payments (if any): We mentioned earlier maybe deposit feature. Not implementing now. Partial refund we did in Payment model. Possibly not fully handling partial refund logic (like multiple refund transactions).
•	Testing booking logic thoroughly: simulate scenarios:
•	Try booking more seats than available (should fail).
•	Try concurrent bookings (simulate with threads or quickly via postman) for last seat to see if oversell occurs or lock works.
•	Payment confirm path: simulate by first initiating (maybe returns a dummy paymentUrl), then calling confirm. Check booking status updated, events published, etc.
•	Auto-cancel: artificially set a booking’s deadline in past, run scheduler, see it gets expired and event posted.
•	Edge cases: Booking close to event start: if booking_deadline_hours=2 and user tries 1 hour before event, system should reject (tested). If user tries to pay after deadline (shouldn’t happen normally because booking would auto-cancel around that time, but if time windows overlap, confirmPayment should possibly check that booking still active. But if user pays exactly at deadline, ideally accept if booking still PENDING).
•	We ensure confirmPayment does nothing if booking status is not PENDING (like if auto-canceled just happened, then confirm arrives late – we might then reverse cancellation? That gets complicated. Simpler: define that if booking expired, any late payment will be automatically refunded by payment gateway or not executed. We’ll not handle confirm for expired).
•	Prevent booking after event started/passed: If now > event.start_date, disallow new bookings. That is a subset of booking_deadline logic anyway.

Выход: All booking and payment flows are correctly implemented and tested: the system enforces capacity and deadlines, transitions booking states automatically, and handles cancellation/refund policies. This ensures a robust ticketing process with minimal manual intervention needed.

10. Реализация избранного и отзывов
    •	Favorite (CRUD): Implement simple endpoints:
    •	AddFavorite: just create and save Favorite (with userId from context and eventId from request). If already exists, return silently or error? Could return success anyway (idempotent). We enforce unique constraint, so second insert fails – handle that by catching exception and ignore (so effectively idempotent).
    •	RemoveFavorite: find by user and event, delete. If not found, just consider it done.
    •	ListFavorites: query by userId, return list of events or eventIds. Perhaps join with Event to include event details (which could be handy so client doesn’t have to fetch each separately). We can achieve by for each favorite, retrieving associated event info and mapping to response. This is fine for moderate lists. If performance needed, a single JPQL join can get needed fields.
    •	Review (CRUD, moderate, helpful):
    •	CreateReview: ensure user hasn’t reviewed this event before and event is eligible (past or user participated). We can require that event.start_date < now or that user had a confirmed booking for event. (If it’s possible to allow reviews without booking – maybe not to avoid fake reviews). We’ll enforce presence of confirmed booking or admin override.
    •	Save review with status PENDING or ACTIVE depending on if moderation required. Possibly a config “reviews.requireModeration” – for now, allow all and admin will remove if needed. Or all reviews by new users flagged PENDING - complex. Simpler: set ACTIVE by default, admin can mark REJECTED later.
    •	UpdateReview: verify that the author (from context) matches review.user_id or user is admin. If admin and content changed, that’s weird (admin wouldn’t edit user text, only status). So if admin, allow changing status field (approve or reject). If user, allow updating rating/content if review still not moderated or within some timeframe (could allow anytime though often editing is restricted). We’ll allow editing anytime for simplicity.
    •	Moderation (if separate endpoint moderate provided): we can implement as part of UpdateReview or separate logic. The REST spec had POST /reviews/{id}/moderate expecting an admin action. We can implement that in service as an admin calling UpdateReview with new status. So a separate gateway route could map to same gRPC call or a specific moderate method. But since we didn’t define a distinct gRPC, either add one or reuse UpdateReview. We’ll reuse UpdateReview: if admin, and request has status field (maybe we add status to UpdateReviewRequest?), but in proto we didn’t include status, oversight. Could quickly extend UpdateReviewRequest with optional status. If our system at runtime easily adjustable, do it. If not, accept moderate as separate flow not in gRPC spec (maybe directly in DB or via admin panel). But let’s incorporate: add google.protobuf.StringValue status = 4 in UpdateReviewRequest (though not in original plan text, but likely needed). We’ll consider it added. Then admin can call updateReview with status=REJECTED for moderation.
    •	Mark helpful: the REST has /reviews/{id}/helpful for user to mark. In gRPC spec, we didn’t define MarkReviewHelpful. We could implement either as part of ListReviews (client sends mark via separate call though). Possibly implement behind scenes: define an internal endpoint or use same ReviewService. Simpler: implement this in REST controller at gateway – i.e., gateway catches /helpful and calls event-service’s repository via some admin credentials. But better to incorporate:
    •	We can choose to handle mark helpful via a direct DB update (increment counter) without formal gRPC method, or add a method in future.
    •	For now, we might cheat: When user calls /helpful, gateway could call eventService.UpdateReview with maybe helpful_count increment in content? But that doesn’t fit UpdateReview design. Alternatively, treat mark helpful as user triggering an event which event-service can capture via separate function. Possibly simplest: treat it as a separate service in event-service: e.g., create a small method markReviewHelpful(reviewId, userId). This should ensure a user only votes once - might need storing who voted (which we didn’t model). Alternatively, not store who, just allow increment but could be abused by repeated calls. Ideally store separate table for votes but we omitted it. We can enforce one vote per user by in-memory tracking for now or skip enforcement. Possibly out-of-scope detail. Given time, we’ll implement basic: increment counter if user not author (since author can’t mark own review maybe). And maybe keep a Set in memory for user->review votes to prevent immediate revote in session, but that resets on restart. For serious, should have table for votes. Mark as future improvement.
    •	We’ll include in doc: review helpful can be extended to record individual votes if needed.
    •	Implement listing reviews:
    •	For event detail: typically retrieve all ACTIVE reviews for event sorted by helpful_count or date. We implement ListReviews with filters: if event_id provided (and no status filter), return only ACTIVE by default for public calls. If admin calls with status filter (PENDING to moderate), allow that.
    •	Possibly provide average rating and count easily (we included in ListReviewsResponse). We can compute avg and count by SQL or compute from list. If many reviews, better to compute by DB (AVG, COUNT). We’ll do that in query or service logic.
    •	Testing reviews:
    •	Try leaving review without booking -> should fail (we enforce if needed).
    •	Leave review with booking -> succeed.
    •	Try leaving second review -> should fail (unique event_id,user enforced).
    •	Edit review -> see changes.
    •	Admin moderate -> change status to REJECTED -> review no longer appears in public list.
    •	Helpful mark -> increments count, subsequent marks by same user do nothing (if we attempted to track or not allowed multiple calls from UI anyway).
    •	Potential improvements: For large number of reviews, could add pagination and maybe caching top reviews. But at our scale now, fine.

Выход: Favorite and Review functionalities are implemented in full. Users can maintain their favorites and provide feedback for events, and organizers/admins can manage that feedback. The system enforces one review per user per event and allows moderation and user engagement (helpful votes) on reviews. This increases user interaction and trust in the platform.

11. Безопасность и защита данных

(Многие аспекты безопасности уже рассмотрены, но на этом этапе проводятся дополнительные мероприятия и проверки.)
•	TLS configuration: Ensure that in all environments, communications are using TLS. In Kubernetes, if using Istio or some service mesh, might already be mTLS internally. Externally, API Gateway should have TLS certificate (e.g., Let’s Encrypt) so that clients access https://api.aquastream… We check that our Gateway and ingress are properly configured with certificates. For Kafka, if required, set up SSL encryption on topics (or at least within cloud network).
•	Secrets management: Audit that no sensitive info is in code or logs. DB passwords, JWT signing keys, etc., are in Kubernetes Secrets and not printed. Use Spring Cloud Vault or Kubernetes secrets injection for production. For now, ensure application reads secrets from env and not hardcoded.
•	Input validation & Sanitization: We double-check all input fields:
•	Strings like event name, description, review content – these could contain HTML or scripts. If these are later displayed in a web page, need sanitization to prevent XSS. Often, the front-end will escape content. But to be safe, we might strip dangerous tags server-side or store as is but mark as safe. At least, we should disallow very long inputs beyond limits to prevent payload attacks. Already limited length in DB (255 or text with reason).
•	In our API, ensure numeric values are within expected ranges (like rating 1-5 enforced via DB check, but also double-check in code).
•	Use a library for HTML sanitize if needed (like Jsoup to remove script tags from reviews maybe). If reviews can contain formatting, one could allow a subset (like markdown), else plain text is fine.
•	CORS on Gateway: Confirm configured properly (domain restricted if needed, not open to all).
•	Rate limiting critical endpoints: Perhaps implement a simple throttle for booking and payment endpoints to prevent abuse (someone trying thousands of bookings to hold seats). Could use Gateway filters (like token bucket per user). If not done at Gateway, could do in code (less ideal). We’ll rely on Gateway or external WAF to do this as per requirement mention.
•	Brute force protection: It’s more relevant to login, but maybe also for confirmPayment or others if someone tries random references. That seems unlikely.
•	Penetration testing: If possible, engage security team or use tools (OWASP ZAP, etc.) against our API (maybe staging env). They might find things like missing HTTP security headers (should ensure Gateway sets X-Frame-Options, etc.), or potential SQL injection (not likely with JPA prepared statements).
•	Sensitive data in logs: Ensure we do not log sensitive PII or secrets. For instance, do not log full JWTs or credit card numbers (we never handle actual CC, just tokens). We might log user IDs and event IDs which is fine. Payment gateway reference could be somewhat sensitive but not too much. Keep logs secure anyway (ELK is internal).
•	Encrypt data at rest: If required, ensure DB encryption or at least backups encrypted. Possibly out of scope for development tasks, but mention if needed by compliance.
•	Key rotation: Consider that JWT signing keys (in Keycloak) might rotate; ensure our service fetches fresh key if needed (Spring security does that via JWKS if configured). Also DB credentials or other secrets might rotate – prepare procedure (maybe we just update secret and pods restart).
•	Third-party library vulnerabilities: Run a tool (like OWASP dependency check) to catch if any dependency (e.g., Spring) has known security issues. Upgrade as needed (particularly keep an eye on Log4Shell-like issues or library CVEs).
•	Edge: file uploads? Not in this service. If images needed for events, probably handled by separate storage service.
•	GDPR considerations: We store user IDs, not much personal info; reviews could have content. If user requests deletion, possibly remove their reviews (maybe mark as deleted). Not in requirements, but something to be aware of.
•	Audit log detail: Ensure that audit logging (if implemented, perhaps via AOP or manually logging certain events with user and action) captures necessary info to trace incidents. E.g., log admin actions like “Admin X canceled event Y”. We might implement these as simple log statements or structured audit events to a separate Kafka topic if needed. At least ensure normal logs have enough info.

At end of this phase, possibly do a security review meeting to confirm nothing critical is missing.

Выход: The service passes security tests: communications are secure, inputs are validated, roles are enforced strictly, and the system is hardened against common attacks. A security audit or pen-test should report no major vulnerabilities. The data privacy and integrity are maintained to high standards.

12. Тестирование
    •	Unit Testing: Write JUnit tests for core components:
    •	Service layer methods (EventService logic, BookingService logic). Use mocks for repository or DB calls to test pure business rules. For example, test that trying to create booking with no seats throws correct exception, test that cancelBooking by unauthorized user is handled, etc.
    •	Utility methods (like conversion functions, if any).
    •	For any complex logic (like schedule expiry), simulate scenarios.
    •	Use Mockito for dependencies. Achieve decent coverage especially on tricky parts (booking concurrency, refund logic).
    •	Integration Testing: Use Spring Boot test with an in-memory DB (H2 or HSQL) to test repository and persistence logic. Alternatively, use Testcontainers to spin up a real PostgreSQL and Kafka:
    •	Test that migrations apply on a fresh DB (Flyway works).
    •	Test repository queries (like custom JPQL if any).
    •	Test through the whole stack: start event-service with in-mem or container DB and embedded Kafka (Testcontainers has Kafka too). Then use a gRPC client stub or REST template to call an endpoint and verify DB side effects and Kafka messages. For example, an integration test could create an event via REST, then book a ticket, confirm payment (simulate), then check that booking status in DB is confirmed and a PaymentConfirmed message was sent to Kafka (perhaps consume it).
    •	For Kafka, might not easily verify in unit test, but can configure Kafka consumer and poll. Or simpler, verify our KafkaTemplate was called via a Mock (but better do an actual integration).
    •	Also test security: e.g., call protected endpoint without token and expect 401 (with MockMvc and Security config loaded).
    •	Possibly use Testcontainers Keycloak to obtain a real token for tests. Or mock JWT by manually creating one with known secret (in test, turn off real validation and use a dummy signer).
    •	Use Testcontainers for everything yields high confidence but more complex tests.
    •	At least test normal flows and some error flows end-to-end.
    •	Performance Testing: If possible, simulate load with JMeter or Gatling. Focus on critical scenario: high volume of GET /events (maybe thousands concurrent), and a burst of bookings to see if any deadlocks or slowdowns. Monitor if response times meet our requirements. Optimize queries or add indexes if something slow (like maybe listing events filtering by search might require fulltext index or external search like Elastic in future, but for now probably fine).
    •	Also test memory and CPU under load (profile for leaks).
    •	Stress test Kafka pipeline: e.g., simulate 1000 bookings in short time, see that Kafka producer handles it (maybe backlog in sending but eventually done).
    •	Failover testing: Simulate external service failures:
    •	Turn off Kafka container and perform an action that would send event – see that our service doesn’t crash and handles gracefully (maybe logs errors). Turn Kafka on, maybe re-trigger or check backlog.
    •	Stop crew-service (if test double) and try assign crew – see it times out and continues.
    •	Stop DB (or make it read-only) to see how application responds (should throw errors).
    •	Expire JWT token to see if properly rejected.
    •	Security tests: As mentioned, run automated scanning if tools available. Also test authorization by attempting actions with insufficient role (like user tries admin endpoints).
    •	User acceptance testing: Provide a staging environment for product owners to simulate flows from front-end perspective to ensure it meets business expectations. They might come up with corner cases we missed (like wanting to edit event after publishing, etc., which we allowed via update).
    •	Bug fixing: Any issues found in testing are fixed. This stage often uncovers integration mismatches (maybe fields missing in API responses or errors not handled nicely). We iterate to polish.

Выход: A comprehensive test suite is in place. The service is verified to work correctly under normal and adverse conditions. Automated tests will guard against regressions in the future. Performance is within acceptable bounds, and confidence in quality is high for deployment.

13. Метрики, мониторинг и логирование
    •	Business metrics collection: Implement counters and gauges for key domain events:
    •	Count of events created (could be simply number of EventCreated events published, or increment a meter on creation).
    •	Count of bookings created, confirmed, canceled. Perhaps differentiate by status: maintain a meter for each outcome.
    •	Conversion funnel metric: ratio of confirmed bookings to created bookings – we can compute offline in Grafana from those two counters.
    •	Revenue: maintain a cumulative counter for total revenue (sum of payment amounts confirmed). Or push each payment amount as an event and use PromQL sum.
    •	These can be done via Micrometer: e.g., Counter.builder("aquastream_events_created").register(meterRegistry).increment() in createEvent method. Similarly for bookings and payments.
    •	For real-time, perhaps keep track daily as well but can aggregate by timestamps in PromQL.
    •	Performance metrics: Out-of-box, Spring Boot Micrometer provides:
    •	HTTP request metrics (if using rest controllers) or gRPC metrics (we might need to integrate gRPC metrics manually, e.g., interceptors that record latency for each RPC method).
    •	DB metrics: HikariCP can provide stats on connections. We should ensure those on.
    •	Custom: we can add Timer around certain heavy operations (like assignCrew or external calls) to measure their latency distribution.
    •	Kafka metrics: the Kafka client exports metrics (like queue sizes, etc.), integrate with JMX or micrometer binder if available.
    •	Error stats: We can count exceptions or failures:
    •	e.g., a Counter for booking attempts that failed due to capacity, for monitoring how often users hit capacity issues (could indicate events selling out).
    •	Count of 4xx and 5xx responses (though HTTP metrics from actuator might have that).
    •	Perhaps metrics for number of messages failed to send to Kafka (if we track such events).
    •	Prometheus integration: Ensure management.endpoints.web.exposure.include=prometheus so that /actuator/prometheus exports all metrics. Deploy Prometheus in cluster to scrape this endpoint periodically. Label metrics properly (Micrometer does some, we can add tags like eventId on certain metrics but careful not to cardinality blow up – better not tag by eventId since too many possible values).
    •	JVM metrics: Actuator auto provides memory, GC, threads metrics. We may also incorporate openTracing for GC if needed. But basic memory CPU usage can be scraped.
    •	Logging format: Set logback to JSON output with fields: timestamp, level, logger, message, trace-id, span-id (if using Sleuth/Zipkin).
    •	Include MDC context for user or request id if possible (for example, add userId to MDC for each request to appear in logs).
    •	Log at INFO important events (like “Booking 123 confirmed for user U45, event 67”).
    •	Use DEBUG for internal details.
    •	Trace: Integrate Spring Cloud Sleuth or OpenTelemetry. Possibly add dependency to export traces to Zipkin or Jaeger. If not, at least logs carry trace id.
    •	When sending Kafka or calling crew-service, propagate trace context via headers (there are libraries for this).
    •	This helps later debugging across microservices.
    •	Dashboards: Prepare Grafana dashboards:
    •	Service health dashboard: CPU, memory of pods, GC times, thread count, also error rate and request rate. Possibly using data from Prometheus and Kubernetes metrics.
    •	Business metrics dashboard: Graph showing number of bookings created vs confirmed over time (to monitor conversion). Graph for average rating per event or latest events, etc. A table of top events by number of bookings could be derived from metrics if we tag event category (we avoided high-card tags; better use logs for detailed).
    •	Performance dashboard: p95 latency of key endpoints, throughput per endpoint, number of active DB connections, etc.
    •	Integration dashboard: maybe showing Kafka producer latency (if measured) or size of local buffer if we implemented one. Also success/failure counts of crew assignment calls.
    •	Alerting: Set up Prometheus Alertmanager rules: e.g., if event-service down (no scrape), if error rate > certain threshold for 5 minutes, if memory usage > 90%, if booking conversion drops drastically (could indicate payment issues).
    •	Log aggregation: Ensure all pods send logs to centralized system (ELK). Create Kibana index pattern for event-service logs. Prepare some saved searches or filters for common issues (like filter logs by eventId or userId).
    •	Possibly set up alerts from logs too (like if an ERROR log appears with “KafkaException”, alert).
    •	Audit logs: If decided to separate audit logs (e.g., security events) to a separate channel, ensure those are easily queryable. Might not have separate, then rely on normal logs with identifiable markers.
    •	Simulate alerts: For testing, maybe simulate an error to see if alert triggers.
    •	Tune and refine: After system run for a while in test, see if metrics are stable, adjust thresholds if needed.

Выход: Monitoring and logging are thoroughly implemented. Operations can now observe the service’s behavior and health in real-time, and the business owners can glean insights (like popular events, conversion rates) from the metrics. Any anomaly (like an outage of a dependency or unusual surge in errors) will trigger timely alerts, enabling quick response.

14. Документация
    •	API Documentation: Prepare a human-readable API reference for both gRPC and REST endpoints:
    •	For internal developers (or external if exposing): write up details of each gRPC method, request/response message formats, error codes. Since gRPC is internal, focus on REST for external. Possibly use OpenAPI (Swagger) for REST. We can either manually write an OpenAPI spec or use Spring annotations to generate it. If we had done Spring controllers, we could add @Operation annotations and springdoc to serve JSON doc. Alternatively, produce a Markdown or Confluence page with all endpoints and example requests/responses.
    •	Include example flows: e.g., example JSON for creating event, example booking process with showing the JSON at each step and the resulting outputs.
    •	Ensure to highlight security: which endpoints require which roles, how to get a token (point to Keycloak login flow).
    •	If there’s a front-end dev team, get their input on doc clarity.
    •	Architecture README: Write a README.md for the repository that provides an overview of the service’s purpose, architecture diagram (maybe embed*(продолжение документации)*
    •	Архитектурные схемы: В README или отдельной документации размещаются схемы: общая схема микросервисов Aquastream (где показано, как backend-event взаимодействует с Gateway, Keycloak, Kafka, crew, notification). Также включаются диаграммы последовательности для ключевых процессов (например, бронирование и оплата – как ранее описано). ER-диаграмма базы данных и, возможно, диаграмма классов (для основных компонентов сервиса) добавляются для наглядности.
    •	Инструкции для разработчиков: Описывается, как запустить сервис локально (требования: JDK, Docker; команды: docker-compose up для зависимостей, ./gradlew bootRun для старта). Приводятся примеры конфигурационных параметров (URLы БД, Kafka, Keycloak realm), которые нужно установить через переменные окружения. Также упомянуть, как запустить тесты (./gradlew test) и где искать отчеты.
    •	Примеры бизнес-процессов: Документация содержит описательные сценарии (можно на основе раздела “Бизнес-сценарии”) с указанием, какие API вызовы происходят на каждом шаге. Например: “Создание события: Организатор отправляет POST /api/events с телом …, получает ответ …; затем вызывает POST /api/events/{id}/publish, и т.д.” Такие примеры помогут понимать динамику использования API.
    •	Настройка и развертывание: Подробно описать, как развернуть сервис на новых окружениях:
    •	Подготовка БД (применение миграций Flyway, начальные справочные данные – например, предзаполнить таблицу категорий какими-то значениями).
    •	Настройка Keycloak (добавление клиентского приложения, создание ролей).
    •	Настройка переменных в Kubernetes (файлы с secret для паролей).
    •	Команда для деплоя (если CI/CD — описать, что мерж в main автоматически деплоит на staging, или инструкции kubectl apply для yaml).
    •	Руководство по масштабированию: Документируются рекомендации по увеличению количества реплик сервиса при росте нагрузки, как сервис масштабируется без сессий (статус бронирований хранится в БД, так что можно свободно масштабировать). Указать, что нужно следить за состоянием планировщика задач авто-отмен (в случае нескольких реплик – возможно, стоит запускать отдельный CronJob).
    •	Обновление и откат: Предоставить последовательность действий для обновления версии сервиса без даунтайма (rolling update Deployment в Kubernetes, использование readinessProbe чтобы трафик шел только на поднятые новые инстансы). Описать процедуру отката на предыдущий образ в случае выявления критической ошибки (kubectl rollout undo). Если изменений схемы БД breaking changes – описать стратегию миграции (в идеале, backward-compatible DB changes, либо короткий режим maintenance).
    •	Сценарии отказов: В документации по эксплуатации указать, что делать при сбоях внешних систем: например, если Kafka недоступна – можно временно отключить отправку уведомлений (флаг), либо увеличить retention локального буфера. Если упал сервис персонала – как вручную назначить экипаж (через админку) до восстановления.
    •	Безопасность и права: В операционной документации указать, какие службы/пользователи имеют доступ к каким данным. Например, администраторы системы через админ-панель могут делать то-то; разработчики не должны иметь прямого доступа к прод-БД с личными данными и т.д. Описать процедуру предоставления организатору прав (через Keycloak – инструкция для админа как присвоить роль).

После подготовки всей документации, она проходит проверку: бизнес-аналитики сверят соответствие бизнес-требованиям, инженеры – техническую точность. Документация публикуется (в репозитории, Confluence или иной портал) и становится основой для сопровождения и дальнейшего развития сервиса.

15. Развертывание и эксплуатация
    •	Деплой в Kubernetes: Готовый Docker-образ сервиса разворачивается в целевом окружении (продакшн кластер). Применяются подготовленные манифесты:
    •	Deployment с initial репликами (например, 2), подключенный ConfigMap (для общих настроек, например, URL внешних сервисов) и Secret (пароли, ключи).
    •	Service для меж-сервисного общения (ClusterIP, имя backend-event для обращения из Gateway или других pod’ов).
    •	Ingress или API Gateway route: настроен внешний маршрут, например, /api/events -> Service backend-event (через Gateway).
    •	Проверяем, что livenessProbe (например, GET /actuator/health или gRPC health check) и readinessProbe настроены: Kubernetes будет перезапускать контейнер если он завис, и не слать трафик на неготовые.
    •	Пост-развертывание проверки: После деплоя новой версии следим в мониторинге: все pod поднялись, ошибок нет, метрики в норме. Проверяем вручную основные функции через API (smoke test: получить список событий, создать тестовое событие, сделать бронирование с тестовым пользователем в sandbox, и отменить).
    •	Обновление без простоя: Используется RollingUpdate strategy, так что новые pods запускаются, проходят readiness, потом старые выключаются. Благодаря этому и тому, что сервис stateless, обновление происходит бесшовно. Если требуется миграция БД, она применяется в момент деплоя (Flyway). Желательно, чтобы новые версия кода была совместима с прежней схемой до миграции, или миграция добавляет non-breaking changes. Если изменение несовместимо, возможно, нужно краткое окно простоя или двуфазный деплой (схему обновить, потом код). Документация должна описывать эти нюансы.
    •	Масштабирование: При повышении нагрузки можно увеличить реплики Deployment (вручную или настроить Horizontal Pod Autoscaler по метрикам CPU/RPS). Также, если объем данных растет, возможно масштабирование БД (настройка реплики и переключение) – но это на уровне СУБД. Kafka кластер тоже должен масштабироваться при росте событий. Указано, что сервис поддерживает горизонтальное масштабирование – тесты должны подтвердить линейность производительности при добавлении реплик.
    •	Логирование и мониторинг в эксплуатации: Убедиться, что Fluentd/Logstash собирает логи сервиса, и они доступны в Kibana. Настроить фильтры (например, быстро отфильтровать ERROR за последний час). В Grafana – импортировать созданные дашборды для сервисных метрик. Настроить оповещения: Alertmanager шлет уведомления (в Slack/email) DevOps-команде при срабатывании триггеров (например, память > 90%, сервис недоступен, высокое время ответа). Команда эксплуатации должна регулярно просматривать дашборды, особенно при запусках больших событий (пиковые нагрузки).
    •	Резервное копирование и восстановление: Настраиваются job’ы для бэкапа базы (например, ежедневный dump Postgres, отправка в облачное хранилище). Проверяется процедура восстановления: развернуть новый экземпляр БД из бэкапа, запустить сервис на ней – должно работать. Это документируется и периодически тестируется (disaster recovery drills).
    •	Операционные процедуры: Описаны шаги на случай различных инцидентов:
    •	Если сервис вышел из строя (все реплики упали) – операторы перезапускают Deployment, анализируют логи (смотреть последнюю ошибку). Если причина – баг в новой версии, откатываются на предыдущий образ (rollout undo).
    •	Если наблюдается утечка памяти (метрики RAM растут постоянно) – перезагружают pods (temporary relief) и создают задачу разработчикам исправить.
    •	Если уведомления не отсылаются (можно заметить по росту локальной очереди или жалобам) – проверить статус Kafka и notification-сервиса. Следовать инструкциям: перезапустить Kafka consumer, либо вручную выгрузить зависшие уведомления из БД и отправить.
    •	Обновление конфигураций: Если нужно поменять параметр (например, увеличить время жизни токена или включить/отключить модерацию отзывов) – меняют ConfigMap/Env и рестартуют pods.
    •	Версионность API: Если в будущем выпускается v2 API (несовместимое), планируется либо параллельное существование двух версий endpoint (v1, v2) до миграции клиентов.
    •	Контроль SLA: С помощью мониторинга собирается статистика uptime и производительности. Если цели SLA (99.9% uptime, latency < 300ms) не выполняются, инициируются меры: масштабирование, оптимизация или incident investigation.

После развертывания сервис переходит в фазу сопровождения. Команда DevOps и поддержки располагает всей необходимой документацией и инструментами для обеспечения стабильной работы сервиса. Результатом является полнофункциональный, масштабируемый и надежный сервис Aquastream backend-event, удовлетворяющий бизнес-потребностям системы Aquastream.




---

# Детальный план реализации сервиса backend-event

## 1. Анализ требований и проектирование архитектуры
- Изучить бизнес-требования к сервису событий (мероприятий).
- Определить основные сущности: Event, Booking, Payment, Favorite, Review и их атрибуты.
- Спроектировать ER-диаграмму базы данных (PostgreSQL).
- Описать взаимодействие с другими сервисами:
  - API Gateway (REST/gRPC, проксирование JWT, преобразование REST<->gRPC)
  - backend-user/Keycloak (аутентификация, роли, RBAC)
  - backend-crew (назначение экипажа, gRPC-интеграция, сценарии назначения/освобождения)
  - backend-notification (Kafka события, email/SMS/push-уведомления)
- Учесть требования к масштабируемости, изоляции данных (DB-per-service), безопасности каналов.

## 2. Подготовка инфраструктуры
- Создать структуру проекта (Spring Boot, Gradle, модули для API, DB, Service).
- Настроить Dockerfile и docker-compose для локального запуска (PostgreSQL, Kafka, Keycloak, backend-event).
- Настроить CI/CD (сборка, тесты, деплой).
- Подготовить Kubernetes-манифесты для деплоя (deployment, service, ingress, secrets).

## 3. Реализация базы данных и миграций
- Описать DDL для всех таблиц (Event, Booking, Payment, Favorite, Review), учесть внешние ключи и ограничения целостности.
- Настроить миграции (Flyway или Liquibase).
- Реализовать тестовые данные для локальной разработки.
- Учесть возможность расширения (категории событий, дополнительные поля, связь Event-Category).

## 4. Реализация gRPC API
- Описать .proto-файл для EventService (CRUD событий, бронирования, оплаты, избранное, отзывы).
- Сгенерировать gRPC серверные и клиентские stubs.
- Реализовать сервисы и методы в Spring Boot (EventServiceImpl и др.).
- Реализовать валидацию входных данных (корректность дат, длина строк, форматы).

## 5. Интеграция с API Gateway
- Настроить маршрутизацию REST-запросов через Gateway к gRPC backend-event.
- Реализовать преобразование REST <-> gRPC (контроллеры, мапперы).
- Обеспечить проксирование JWT токенов и проверку ролей на Gateway и в сервисе.
- Описать сценарии ограничения доступа по ролям на уровне Gateway и backend-event (defense-in-depth).

## 6. Интеграция с Keycloak (RBAC)
- Настроить Spring Security для проверки JWT от Keycloak.
- Реализовать аннотации/интерцепторы для проверки ролей (user, organizer, admin).
- Обеспечить разграничение доступа к методам API (permitAll, hasRole, etc).
- Учесть особенности обновления ролей, сроков жизни токенов, refresh.

## 7. Интеграция с backend-crew
- Реализовать gRPC-клиент для вызова методов backend-crew (назначение/освобождение экипажа).
- Описать сценарии взаимодействия (назначение при создании события, обновление, отмена, обработка ошибок и ретраев).
- Прокидывать JWT/контекст пользователя при вызовах crew-сервиса.
- Учесть возможность асинхронной интеграции через Kafka в будущем.

## 8. Интеграция с Kafka и backend-notification
- Настроить Kafka producer для публикации событий (EventCreated, BookingCreated, PaymentConfirmed, BookingCanceled, CrewAssigned и др.).
- Описать формат сообщений (JSON/Avro/Proto, минимальный набор данных).
- Реализовать публикацию событий при изменениях состояния.
- Учесть возможность расширения топиков и подписчиков (аудит, аналитика, рекомендации).

## 9. Реализация бизнес-логики бронирования и оплаты
- Реализовать жизненный цикл бронирования: создание (Pending Payment), ожидание оплаты, подтверждение (Confirmed), отмена (Canceled/Expired).
- Обеспечить дедлайны и автоматическую отмену просроченных броней (фоновый процесс/cron).
- Реализовать подтверждение оплаты (ручное, через callback, эмуляция для MVP).
- Проверять ограничения: уникальность бронирования на пользователя, вместимость события, невозможность бронировать своё событие.
- Реализовать отмену бронирования пользователем и администратором.
- Учесть сценарии отмены события и массовой отмены броней.

## 10. Реализация избранного и отзывов
- CRUD для Favorite и Review (добавление, удаление, получение списка, ограничения по ролям).
- Реализовать модерацию отзывов (опционально, для будущего).
- Учесть возможность расширения (например, ответы организатора, рейтинг событий).

## 11. Безопасность и защита данных
- Обеспечить шифрование каналов (TLS для REST/gRPC, Kafka SSL).
- Настроить хранение секретов (Kubernetes Secrets/Env).
- Реализовать валидацию и санитацию входных данных.
- Настроить CORS на Gateway.
- Учесть аудит доступа, логирование ошибок доступа, мониторинг подозрительной активности.
- Провести пенетрейшн-тестирование (ручное/автоматизированное).
- Подготовить рекомендации по ротации ключей, настройке ролей в Keycloak.

## 12. Тестирование
- Покрыть бизнес-логику unit-тестами (JUnit, Mockito).
- Реализовать интеграционные тесты (Testcontainers для БД, Kafka, Keycloak).
- Провести нагрузочное тестирование (имитация массовых бронирований, стресс-тесты Kafka и БД).
- Проверить сценарии безопасности (доступ без токена, попытки доступа к чужим данным, истечение токена).

## 13. Метрики, мониторинг и логирование
- **Метрики бизнес-логики:**
  - Реализовать сбор бизнес-метрик (количество созданных событий, бронирований, отмен, конверсия бронь->оплата).
  - Настроить метрики производительности (время отклика API, latency гРПЦ вызовов, время обработки запросов к БД).
  - Вести статистику ошибок (количество неудачных броней, отмен, 4xx/5xx ответы).

- **Техническое наблюдение:**
  - Настроить экспорт метрик JVM (память, GC, потоки) через Micrometer в Prometheus.
  - Собирать метрики gRPC (rps, время ответа, ошибки) через интерцепторы.
  - Отслеживать состояние и производительность БД, Kafka (через интеграцию с системным мониторингом).
  - Настроить алерты в Grafana (критические ошибки, задержки, исчерпание ресурсов).

- **Логирование:**
  - Настроить структурированное логирование в JSON формате (в stdout для Kubernetes и ELK).
  - Включить трассировку через Zipkin/Jaeger для межсервисных вызовов (trace ID, span ID).
  - Логировать все бизнес-события с уникальными идентификаторами для отслеживания цепочек событий.
  - Обеспечить логирование с разными уровнями детализации (DEBUG для разработки, INFO для прода).
  - Реализовать аудит безопасности (все изменения статусов, доступы, модификации данных).

- **Дашборды и визуализация:**
  - Создать дашборды в Grafana для мониторинга:
    - Общего состояния сервиса (CPU, память, uptime, ошибки)
    - Бизнес-метрик (конверсия, количество событий/броней/оплат, топ популярных событий)
    - Производительности (latency p95/p99, throughput, ошибки)
    - Интеграций (состояние Kafka, вызовы к внешним сервисам)
  - Настроить визуализацию логов в Kibana с преднастроенными фильтрами для разных сценариев.

## 14. Документация
- Описать структуру API (gRPC, REST через Gateway), примеры запросов/ответов.
- Подготовить README с архитектурой, схемами, диаграммами, примерами бизнес-процессов.
- Описать сценарии развертывания и настройки (Docker, Kubernetes, переменные окружения, секреты).
- Подготовить инструкции по масштабированию, обновлению, откату.

## 15. Развертывание и эксплуатация
- Настроить деплой в Kubernetes (deployment, service, ingress, secrets).
- Настроить мониторинг (Prometheus, Grafana), логирование (ELK, аудит событий).
- Описать процедуры обновления и отката.
- Учесть сценарии отказоустойчивости (повторные попытки при недоступности crew, Kafka, БД).
- Подготовить рекомендации по масштабированию (горизонтальное, вертикальное, разделение топиков Kafka).