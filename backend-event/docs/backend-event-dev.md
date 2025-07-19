# Руководство для разработчиков Backend-Event

В данном документе описаны стандарты разработки, паттерны, соглашения и ответы на частые вопросы для разработчиков микросервиса `backend-event`.

## 📑 Оглавление

1. [🚀 Правила кодирования и соглашения](#-правила-кодирования-и-соглашения)
   - [Общие принципы](#общие-принципы)
   - [Стиль кода](#стиль-кода)
   - [Организация проекта](#организация-проекта)
   - [Работа с зависимостями](#работа-с-зависимостями)
2. [🧩 Реализация паттернов](#-реализация-паттернов)
   - [Чистая архитектура](#чистая-архитектура)
   - [CQRS](#cqrs)
   - [Circuit Breaker](#circuit-breaker)
   - [Idempotency](#idempotency)
   - [Optimistic Locking](#optimistic-locking)
3. [❓ FAQ для разработчиков](#-faq-для-разработчиков)
   - [Общие вопросы](#общие-вопросы)
   - [Разработка](#разработка)
   - [Тестирование](#тестирование)
   - [Интеграции](#интеграции)
4. [🔄 Генерация gRPC клиентов](#-генерация-grpc-клиентов)
   - [Protobuf определения](#protobuf-определения)
   - [Генерация клиентов](#генерация-клиентов)
   - [Использование в других сервисах](#использование-в-других-сервисах)

## 🚀 Правила кодирования и соглашения

### Общие принципы

1. **SOLID принципы** – следуйте принципам SOLID при проектировании классов
2. **Чистый код** – пишите понятный, самодокументируемый код
3. **Тестируемость** – код должен быть легко тестируемым, с минимумом зависимостей
4. **Безопасность** – всегда учитывайте аспекты безопасности при разработке
5. **Производительность** – оптимизируйте критичные участки кода

### Стиль кода

Проект следует [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html) с некоторыми модификациями:

- Используйте 4 пробела для отступов
- Максимальная длина строки – 120 символов
- Предпочитайте Lombok для сокращения бойлерплейт-кода
- Используйте статические импорты для методов утилитных классов

```java
// Хорошо
import static org.assertj.core.api.Assertions.assertThat;
import static java.util.stream.Collectors.toList;

// Плохо
import org.assertj.core.api.Assertions;
import java.util.stream.Collectors;
// ...далее в коде
Assertions.assertThat(result).isEqualTo(expected);
list.stream().map(String::trim).collect(Collectors.toList());
```

- Располагайте переменные класса в следующем порядке:
  1. Статические поля (сначала public, затем protected, затем package-private, затем private)
  2. Нестатические поля (в том же порядке по модификаторам доступа)
  3. Конструкторы
  4. Методы

### Организация проекта

Сервис `backend-event` следует модульной структуре с разделением на компоненты:

```
backend-event/
├── backend-event-api/        # API определения (DTO, Proto)
├── backend-event-db/         # Модуль доступа к данным
└── backend-event-service/    # Основной модуль бизнес-логики
```

Внутри модулей используется пакетная структура по функциональным доменам:

```
org.aquastream.event/
├── api/                  # Внешние API (REST, gRPC)
├── config/               # Конфигурации Spring
├── domain/               # Доменные модели
├── repository/           # Репозитории и доступ к данным
├── service/              # Сервисный слой с бизнес-логикой
│   ├── command/          # Команды (CQRS)
│   └── query/            # Запросы (CQRS)
├── mapper/               # Маппинг между сущностями
├── exception/            # Пользовательские исключения
└── util/                 # Утилитные классы
```

### Работа с зависимостями

1. **Инверсия зависимостей** – используйте внедрение зависимостей через конструкторы
2. **Минимизация зависимостей** – класс должен зависеть только от необходимых компонентов
3. **Spring Beans** – используйте аннотации `@Service`, `@Repository`, `@Component` правильно:
   - `@Service` для бизнес-логики
   - `@Repository` для доступа к данным
   - `@Component` для остальных компонентов

```java
// Правильное внедрение зависимостей через конструктор
@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final EventMapper eventMapper;
    
    // Внедрение зависимостей через конструктор происходит автоматически с Lombok
}
```

4. **Версии зависимостей** – определяйте версии в родительском pom.xml, используйте BOM когда возможно

## 🧩 Реализация паттернов

### Чистая архитектура

Сервис построен на принципах Чистой архитектуры с разделением на слои:

1. **Доменный слой** – бизнес-модели и логика
2. **Сервисный слой** – использование случаев и бизнес-операции
3. **Инфраструктурный слой** – внешние реализации (БД, внешние сервисы)
4. **Слой представления** – API контроллеры и преобразование данных

```java
// Доменная модель (чистая, без внешних зависимостей)
public class Event {
    private final UUID id;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String location;
    private int capacity;
    private EventStatus status;
    
    // Методы бизнес-логики, связанные с Event
    public boolean canBeCanceled() {
        return status == EventStatus.PUBLISHED && startDate.isAfter(LocalDateTime.now());
    }
    
    public void cancel() {
        if (!canBeCanceled()) {
            throw new BusinessException("Event cannot be canceled");
        }
        this.status = EventStatus.CANCELED;
    }
}

// Сервисный слой, реализующий бизнес-операции
@Service
@Transactional
public class CancelEventService {
    private final EventRepository eventRepository;
    private final NotificationService notificationService;
    
    public void cancelEvent(UUID eventId, String reason) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EntityNotFoundException("Event not found"));
            
        event.cancel();
        eventRepository.save(event);
        
        notificationService.notifyEventCancellation(event, reason);
    }
}
```

### CQRS

Для сложных операций используется паттерн CQRS (Command Query Responsibility Segregation):

```java
// Команда (изменяет состояние)
@Data
@Builder
public class CreateEventCommand {
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String location;
    private int capacity;
    private UUID organizerId;
    private List<PriceOptionDto> priceOptions;
}

// Обработчик команды
@Service
@RequiredArgsConstructor
public class CreateEventCommandHandler {
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final PriceOptionRepository priceOptionRepository;
    
    @Transactional
    public UUID handle(CreateEventCommand command) {
        User organizer = userRepository.findById(command.getOrganizerId())
            .orElseThrow(() -> new EntityNotFoundException("Organizer not found"));
            
        Event event = Event.builder()
            .id(UUID.randomUUID())
            .title(command.getTitle())
            .description(command.getDescription())
            .startDate(command.getStartDate())
            .endDate(command.getEndDate())
            .location(command.getLocation())
            .capacity(command.getCapacity())
            .status(EventStatus.DRAFT)
            .organizer(organizer)
            .build();
            
        Event savedEvent = eventRepository.save(event);
        
        // Сохранение ценовых опций
        List<PriceOption> priceOptions = command.getPriceOptions().stream()
            .map(optionDto -> PriceOption.builder()
                .event(savedEvent)
                .name(optionDto.getName())
                .price(optionDto.getPrice())
                .availableQuantity(optionDto.getAvailableQuantity())
                .build())
            .collect(Collectors.toList());
            
        priceOptionRepository.saveAll(priceOptions);
        
        return savedEvent.getId();
    }
}

// Запрос (не изменяет состояние)
@Data
@Builder
public class GetEventByIdQuery {
    private UUID eventId;
    private boolean includeDetails;
}

// Обработчик запроса
@Service
@RequiredArgsConstructor
public class GetEventByIdQueryHandler {
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    
    @Transactional(readOnly = true)
    public EventDto handle(GetEventByIdQuery query) {
        Event event = eventRepository.findById(query.getEventId())
            .orElseThrow(() -> new EntityNotFoundException("Event not found"));
            
        if (query.isIncludeDetails()) {
            return eventMapper.toDetailedDto(event);
        }
        
        return eventMapper.toDto(event);
    }
}
```

### Circuit Breaker

Для обработки сбоев внешних сервисов используется паттерн Circuit Breaker:

```java
@Configuration
public class CircuitBreakerConfig {
    @Bean
    public CircuitBreaker paymentServiceCircuitBreaker(CircuitBreakerRegistry registry) {
        return registry.circuitBreaker("paymentService");
    }
}

@Service
@RequiredArgsConstructor
public class PaymentServiceClient {
    private final WebClient webClient;
    private final CircuitBreaker circuitBreaker;
    
    public PaymentResponse processPayment(PaymentRequest request) {
        return circuitBreaker.executeSupplier(() -> callPaymentService(request));
    }
    
    private PaymentResponse callPaymentService(PaymentRequest request) {
        return webClient.post()
            .uri("/api/payments")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(PaymentResponse.class)
            .block();
    }
}
```

### Idempotency

Для обеспечения идемпотентности операций:

```java
@Service
@RequiredArgsConstructor
public class IdempotentPaymentService {
    private final PaymentRepository paymentRepository;
    private final PaymentGateway paymentGateway;
    private final RedisTemplate<String, String> redisTemplate;
    
    @Transactional
    public PaymentResult processPayment(String idempotencyKey, PaymentRequest request) {
        // Проверка существующей операции с тем же ключом идемпотентности
        String lockKey = "payment:idempotency:" + idempotencyKey;
        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(lockKey, "locked", 1, TimeUnit.HOURS);
        
        if (Boolean.FALSE.equals(isNew)) {
            // Возвращаем результат предыдущей операции
            Payment existingPayment = paymentRepository.findByIdempotencyKey(idempotencyKey)
                .orElseThrow(() -> new ConcurrentOperationException(
                    "Payment operation in progress, try again later"));
            
            return PaymentResult.fromPayment(existingPayment);
        }
        
        try {
            // Выполняем новую операцию
            PaymentGatewayResponse gatewayResponse = paymentGateway.processPayment(request);
            
            Payment payment = Payment.builder()
                .id(UUID.randomUUID())
                .idempotencyKey(idempotencyKey)
                .amount(request.getAmount())
                .status(gatewayResponse.isSuccessful() ? PaymentStatus.COMPLETED : PaymentStatus.FAILED)
                .gatewayReference(gatewayResponse.getTransactionId())
                .build();
            
            paymentRepository.save(payment);
            
            return PaymentResult.fromPayment(payment);
        } finally {
            // В реальном приложении этот ключ не удаляется, а сохраняется с результатом
            // Здесь удаляем только для демонстрации в случае ошибки
            // redisTemplate.delete(lockKey);
        }
    }
}
```

### Optimistic Locking

Для предотвращения конфликтов при одновременном редактировании:

```java
@Entity
@Table(name = "events")
@Data
public class EventEntity {
    @Id
    private UUID id;
    
    private String title;
    private String description;
    
    // Другие поля...
    
    @Version
    private Long version;
}

@Service
@RequiredArgsConstructor
public class EventUpdateService {
    private final EventRepository eventRepository;
    
    @Transactional
    public void updateEvent(UUID eventId, EventUpdateRequest request, long expectedVersion) {
        EventEntity event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EntityNotFoundException("Event not found"));
            
        if (event.getVersion() != expectedVersion) {
            throw new OptimisticLockException(
                "Event was modified by another user. Please refresh and try again.");
        }
        
        // Обновление полей события
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        // Остальные поля...
        
        eventRepository.save(event);
    }
}
```

## ❓ FAQ для разработчиков

### Общие вопросы

#### Q: Как организована структура проекта?
A: Проект разделен на модули: API (модель и контракты), DB (доступ к данным), Service (бизнес-логика). Внутри каждого модуля используется структура пакетов по доменам и функциональности.

#### Q: Какие технологии использует проект?
A: Java 21, Spring Boot 3.2+, PostgreSQL, Redis, Kafka, gRPC, Liquibase, Gradle, Docker, Kubernetes.

#### Q: Как настроить окружение для разработки?
A: См. раздел [🚀 Руководство по локальной разработке](https://github.com/aquastream/backend-event/blob/main/README.md#-руководство-по-локальной-разработке) в README.md проекта.

### Разработка

#### Q: Как добавить новый API-метод?
A: 
1. Для REST: добавьте метод в соответствующий контроллер в пакете `api.controller`
2. Для gRPC: добавьте метод в .proto файл, сгенерируйте код и реализуйте в соответствующем сервисе

#### Q: Как реализовать новую бизнес-логику?
A: Следуйте подходу CQRS: создайте Command/Query и соответствующий Handler в пакете `service.command` или `service.query`.

#### Q: Как работать с асинхронными событиями?
A: Для публикации событий используйте `KafkaTemplate` и создайте соответствующий слушатель с аннотацией `@KafkaListener`.

```java
// Публикация события
@Service
@RequiredArgsConstructor
public class EventPublisher {
    private final KafkaTemplate<String, EventMessage> kafkaTemplate;
    
    public void publishEventCreation(Event event) {
        EventMessage message = new EventMessage(
            UUID.randomUUID().toString(),
            EventType.CREATED,
            event.getId(),
            LocalDateTime.now()
        );
        
        kafkaTemplate.send("event-events", message);
    }
}

// Обработка события
@Service
@RequiredArgsConstructor
public class EventListener {
    private final EventProcessingService processingService;
    
    @KafkaListener(topics = "event-events", groupId = "event-service")
    public void handleEventMessage(EventMessage message) {
        if (message.getType() == EventType.CREATED) {
            processingService.processNewEvent(message.getEventId());
        }
    }
}
```

#### Q: Как правильно логировать?
A: Используйте SLF4J с корректными уровнями логирования:
- ERROR: Для ошибок, требующих вмешательства
- WARN: Для потенциальных проблем, не являющихся ошибками
- INFO: Для важных бизнес-событий
- DEBUG: Для подробной отладочной информации (не в production)
- TRACE: Для детальной диагностики (только для локальной разработки)

```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EventService {
    public void createEvent(CreateEventRequest request) {
        log.info("Creating new event with title: {}", request.getTitle());
        
        try {
            // Логика создания события
            log.debug("Event details: {}", request);
        } catch (Exception e) {
            log.error("Failed to create event: {}", e.getMessage(), e);
            throw e;
        }
    }
}
```

### Тестирование

#### Q: Какие виды тестов нужно писать?
A: Необходимо покрывать код следующими видами тестов:
1. Unit-тесты для сервисов и компонентов (с моками)
2. Интеграционные тесты для репозиториев и внешних интеграций
3. End-to-end тесты для основных бизнес-сценариев

#### Q: Как тестировать репозитории?
A: Используйте `@DataJpaTest` и тестовую БД (H2 или TestContainers):

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class EventRepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Autowired
    private EventRepository eventRepository;
    
    @Test
    void shouldFindEventsByStatus() {
        // Given
        EventEntity event1 = new EventEntity();
        event1.setId(UUID.randomUUID());
        event1.setTitle("Test Event 1");
        event1.setStatus(EventStatus.PUBLISHED);
        
        EventEntity event2 = new EventEntity();
        event2.setId(UUID.randomUUID());
        event2.setTitle("Test Event 2");
        event2.setStatus(EventStatus.DRAFT);
        
        eventRepository.saveAll(List.of(event1, event2));
        
        // When
        List<EventEntity> publishedEvents = eventRepository.findByStatus(EventStatus.PUBLISHED);
        
        // Then
        assertThat(publishedEvents).hasSize(1);
        assertThat(publishedEvents.get(0).getTitle()).isEqualTo("Test Event 1");
    }
}
```

#### Q: Как мокать внешние зависимости?
A: Используйте Mockito или WireMock для HTTP-зависимостей:

```java
@ExtendWith(MockitoExtension.class)
class EventServiceTest {
    @Mock
    private EventRepository eventRepository;
    
    @Mock
    private NotificationService notificationService;
    
    @InjectMocks
    private EventServiceImpl eventService;
    
    @Test
    void shouldCancelEvent() {
        // Given
        UUID eventId = UUID.randomUUID();
        Event event = new Event();
        event.setId(eventId);
        event.setStatus(EventStatus.PUBLISHED);
        event.setStartDate(LocalDateTime.now().plusDays(1));
        
        given(eventRepository.findById(eventId)).willReturn(Optional.of(event));
        
        // When
        eventService.cancelEvent(eventId, "Test reason");
        
        // Then
        verify(eventRepository).save(argThat(e -> e.getStatus() == EventStatus.CANCELED));
        verify(notificationService).notifyEventCancellation(eq(event), eq("Test reason"));
    }
}
```

### Интеграции

#### Q: Как интегрироваться с другими микросервисами?
A: Для синхронных интеграций используйте gRPC, для асинхронных - Kafka. При необходимости можно использовать REST через Spring WebClient.

#### Q: Как защититься от недоступности зависимостей?
A: Используйте Circuit Breaker (Resilience4j), Retry с Exponential Backoff и Fallback-стратегии.

#### Q: Как дебажить проблемы интеграции?
A: Используйте:
1. Распределенную трассировку с Jaeger
2. Логирование запросов и ответов (уровень DEBUG)
3. Мониторинг Kafka через UI и консольные утилиты
4. Тестирование изолированных компонентов с Wiremock

## 🔄 Генерация gRPC клиентов

### Protobuf определения

Протобаф-файлы размещаются в модуле `backend-event-api/src/main/proto`:

```protobuf
// Пример event.proto
syntax = "proto3";

package org.aquastream.event.api;

option java_multiple_files = true;
option java_outer_classname = "EventProto";

service EventService {
  rpc CreateEvent(CreateEventRequest) returns (CreateEventResponse);
  rpc GetEvent(GetEventRequest) returns (GetEventResponse);
  rpc ListEvents(ListEventsRequest) returns (ListEventsResponse);
  rpc UpdateEvent(UpdateEventRequest) returns (UpdateEventResponse);
  rpc CancelEvent(CancelEventRequest) returns (CancelEventResponse);
}

message CreateEventRequest {
  string title = 1;
  string description = 2;
  string start_date = 3;
  string end_date = 4;
  string location = 5;
  int32 capacity = 6;
  string organizer_id = 7;
  repeated PriceOption price_options = 8;
}

message CreateEventResponse {
  string event_id = 1;
}

// Другие сообщения...
```

### Генерация клиентов

Для генерации клиентов из proto файлов используется плагин protobuf-gradle-plugin:

```kotlin
// Конфигурация в build.gradle.kts
plugins {
    id("com.google.protobuf") version "0.9.4"
}

dependencies {
    // Protobuf 
    implementation("com.google.protobuf:protobuf-java:3.25.1")
    implementation("io.grpc:grpc-protobuf:1.60.0")
    implementation("io.grpc:grpc-stub:1.60.0")
    implementation("io.grpc:grpc-netty-shaded:1.60.0")
}

protobuf {
    protoc {
        artifact = "com.google.protobuf:protoc:3.25.1"
    }
    plugins {
        id("grpc") {
            artifact = "io.grpc:protoc-gen-grpc-java:1.60.0"
        }
    }
    generateProtoTasks {
        all().forEach {
            it.plugins {
                id("grpc")
            }
            it.builtins {
                java {}
            }
        }
    }
}
```

Для генерации выполните:

```bash
./gradlew :backend-event-api:generateProto
```

### Использование в других сервисах

Для использования gRPC клиентов в других сервисах:

1. Добавьте зависимость на API-модуль:

```kotlin
dependencies {
    implementation("org.aquastream:backend-event-api:latest.release")
}
```

2. Настройте gRPC клиент:

```java
@Configuration
public class GrpcClientConfig {
    @Bean
    public EventServiceGrpc.EventServiceBlockingStub eventServiceBlockingStub(
            @Value("${grpc.client.event-service.address}") String address,
            @Value("${grpc.client.event-service.port}") int port) {
        
        ManagedChannel channel = ManagedChannelBuilder
            .forAddress(address, port)
            .usePlaintext() // Только для dev/staging! Используйте TLS в production
            .build();
            
        return EventServiceGrpc.newBlockingStub(channel);
    }
}
```

3. Используйте сгенерированный клиент:

```java
@Service
@RequiredArgsConstructor
public class EventClient {
    private final EventServiceGrpc.EventServiceBlockingStub eventServiceStub;
    
    public Event getEvent(UUID eventId) {
        GetEventRequest request = GetEventRequest.newBuilder()
            .setEventId(eventId.toString())
            .build();
            
        GetEventResponse response = eventServiceStub.getEvent(request);
        
        return Event.builder()
            .id(UUID.fromString(response.getEventId()))
            .title(response.getTitle())
            .description(response.getDescription())
            // Маппинг остальных полей
            .build();
    }
}
```

4. Для асинхронных вызовов используйте неблокирующий клиент:

```java
@Bean
public EventServiceGrpc.EventServiceStub eventServiceAsyncStub(
        @Value("${grpc.client.event-service.address}") String address,
        @Value("${grpc.client.event-service.port}") int port) {
    
    ManagedChannel channel = ManagedChannelBuilder
        .forAddress(address, port)
        .usePlaintext()
        .build();
        
    return EventServiceGrpc.newStub(channel);
}

// Использование
public CompletableFuture<Event> getEventAsync(UUID eventId) {
    CompletableFuture<Event> future = new CompletableFuture<>();
    
    GetEventRequest request = GetEventRequest.newBuilder()
        .setEventId(eventId.toString())
        .build();
        
    eventServiceAsyncStub.getEvent(request, new StreamObserver<GetEventResponse>() {
        @Override
        public void onNext(GetEventResponse response) {
            Event event = Event.builder()
                .id(UUID.fromString(response.getEventId()))
                .title(response.getTitle())
                // Маппинг остальных полей
                .build();
                
            future.complete(event);
        }
        
        @Override
        public void onError(Throwable t) {
            future.completeExceptionally(t);
        }
        
        @Override
        public void onCompleted() {
            // Ничего не делаем, future уже завершен в onNext
        }
    });
    
    return future;
}
``` 