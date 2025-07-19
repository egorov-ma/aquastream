# Тестирование Backend-Event

Данный документ описывает подходы к тестированию, типы тестов, примеры тестовых данных и инструкции по тестированию микросервиса `backend-event`.

## 📑 Оглавление

1. [🧪 Типы тестов и подходы](#-типы-тестов-и-подходы)
   - [Модульные тесты](#модульные-тесты)
   - [Интеграционные тесты](#интеграционные-тесты)
   - [E2E тесты](#e2e-тесты)
   - [Производительностные тесты](#производительностные-тесты)
2. [🛠️ Тестовые данные и моки](#️-тестовые-данные-и-моки)
   - [Тестовые базы данных](#тестовые-базы-данных)
   - [Моки внешних сервисов](#моки-внешних-сервисов)
   - [Тестовые пользователи](#тестовые-пользователи)
3. [📊 Примеры JSON для тестирования](#-примеры-json-для-тестирования)
   - [Создание события](#создание-события)
   - [Бронирование](#бронирование)
   - [Платежи](#платежи)
   - [Отзывы](#отзывы)
4. [📋 Инструкции по тестированию](#-инструкции-по-тестированию)
   - [Запуск тестов](#запуск-тестов)
   - [Отладка тестов](#отладка-тестов)
   - [CI/CD интеграция](#cicd-интеграция)
   - [Анализ покрытия](#анализ-покрытия)

## 🧪 Типы тестов и подходы

### Модульные тесты

Модульные (unit) тесты фокусируются на тестировании отдельных компонентов в изоляции. Для микросервиса `backend-event` модульному тестированию подлежат:

1. **Сервисы** — бизнес-логика, обработчики команд и запросов CQRS
2. **Утилитные классы** — вспомогательные функции и компоненты
3. **Маппинг** — преобразование между различными моделями данных

#### Пример модульного теста для сервиса

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
        event.setTitle("Test Event");
        event.setStatus(EventStatus.PUBLISHED);
        event.setStartDate(LocalDateTime.now().plusDays(1));
        
        given(eventRepository.findById(eventId)).willReturn(Optional.of(event));
        
        // When
        eventService.cancelEvent(eventId, "Test reason");
        
        // Then
        verify(eventRepository).save(argThat(e -> e.getStatus() == EventStatus.CANCELED));
        verify(notificationService).notifyEventCancellation(eq(event), eq("Test reason"));
    }
    
    @Test
    void shouldThrowExceptionWhenCancelingNonExistentEvent() {
        // Given
        UUID eventId = UUID.randomUUID();
        given(eventRepository.findById(eventId)).willReturn(Optional.empty());
        
        // When, Then
        assertThrows(EntityNotFoundException.class, 
                     () -> eventService.cancelEvent(eventId, "Test reason"));
    }
}
```

### Интеграционные тесты

Интеграционные тесты проверяют взаимодействие нескольких компонентов системы, включая взаимодействие с базой данных и внешними сервисами. В проекте используются:

1. **Репозиторные тесты** — проверка взаимодействия с базой данных
2. **API тесты** — тестирование REST и gRPC интерфейсов
3. **Интеграции с внешними сервисами** — проверка взаимодействия с другими микросервисами

#### Пример интеграционного теста для репозитория с TestContainers

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class EventRepositoryIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("test_db")
        .withUsername("test_user")
        .withPassword("test_password");

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Autowired
    private EventRepository eventRepository;
    
    @Test
    void shouldFindUpcomingEvents() {
        // Given
        EventEntity pastEvent = createTestEvent("Past Event", LocalDateTime.now().minusDays(2));
        EventEntity todayEvent = createTestEvent("Today Event", LocalDateTime.now());
        EventEntity futureEvent = createTestEvent("Future Event", LocalDateTime.now().plusDays(2));
        
        eventRepository.saveAll(List.of(pastEvent, todayEvent, futureEvent));
        
        // When
        List<EventEntity> upcomingEvents = eventRepository.findUpcomingEvents(
            LocalDateTime.now(), PageRequest.of(0, 10));
        
        // Then
        assertThat(upcomingEvents).hasSize(2);
        assertThat(upcomingEvents.stream().map(EventEntity::getTitle))
            .containsExactlyInAnyOrder("Today Event", "Future Event");
    }
    
    private EventEntity createTestEvent(String title, LocalDateTime startDate) {
        EventEntity event = new EventEntity();
        event.setId(UUID.randomUUID());
        event.setTitle(title);
        event.setDescription("Test Description");
        event.setStartDate(startDate);
        event.setEndDate(startDate.plusHours(2));
        event.setStatus(EventStatus.PUBLISHED.name());
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        return event;
    }
}
```

#### Пример интеграционного теста для REST API

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class EventControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private EventService eventService;
    
    @Test
    void shouldReturnEventWhenGetById() throws Exception {
        // Given
        UUID eventId = UUID.randomUUID();
        EventDto eventDto = new EventDto();
        eventDto.setId(eventId);
        eventDto.setTitle("Test Event");
        eventDto.setDescription("Test Description");
        eventDto.setStartDate(LocalDateTime.now().plusDays(1));
        
        given(eventService.getEvent(eq(eventId), anyBoolean())).willReturn(eventDto);
        
        // When, Then
        mockMvc.perform(get("/api/events/{id}", eventId)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.title").value("Test Event"));
    }
    
    @Test
    void shouldCreateEventSuccessfully() throws Exception {
        // Given
        UUID eventId = UUID.randomUUID();
        CreateEventRequest request = new CreateEventRequest();
        request.setTitle("New Event");
        request.setDescription("New Description");
        request.setStartDate(LocalDateTime.now().plusDays(1).toString());
        
        given(eventService.createEvent(any(CreateEventRequest.class)))
            .willReturn(eventId);
        
        // When, Then
        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/events/" + eventId)));
    }
}
```

### E2E тесты

End-to-end (E2E) тесты проверяют полный путь пользовательского сценария через все компоненты системы. Для `backend-event` основные E2E сценарии включают:

1. **Создание события -> Публикация -> Бронирование -> Оплата -> Подтверждение**
2. **Создание события -> Отмена -> Возврат средств**
3. **Бронирование без оплаты -> Истечение срока резервирования**

#### Пример E2E теста с WireMock для внешних сервисов

```java
@SpringBootTest
@Testcontainers
@AutoConfigureWireMock(port = 0)
class EventBookingE2ETest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("test_db")
        .withUsername("test_user")
        .withPassword("test_password");
        
    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
        .withExposedPorts(6379);
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.redis.host", redis::getHost);
        registry.add("spring.redis.port", redis::getFirstMappedPort);
        registry.add("payment-service.url", () -> "http://localhost:" + wireMockServer.port());
        registry.add("notification-service.url", () -> "http://localhost:" + wireMockServer.port());
    }
    
    @Autowired
    private EventService eventService;
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private PaymentService paymentService;
    
    @Test
    void fullBookingFlow() {
        // Настройка мока для платежного сервиса
        stubFor(post(urlEqualTo("/api/payments"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("{\"paymentId\":\"pay123\",\"status\":\"COMPLETED\"}")));
        
        // Настройка мока для сервиса уведомлений
        stubFor(post(urlEqualTo("/api/notifications"))
            .willReturn(aResponse()
                .withStatus(200)));
        
        // 1. Создание события
        CreateEventRequest eventRequest = prepareEventRequest();
        UUID eventId = eventService.createEvent(eventRequest);
        
        // 2. Публикация события
        eventService.publishEvent(eventId);
        
        // 3. Бронирование
        BookingRequest bookingRequest = prepareBookingRequest(eventId);
        UUID bookingId = bookingService.createBooking(bookingRequest);
        
        // 4. Оплата
        PaymentRequest paymentRequest = preparePaymentRequest(bookingId);
        PaymentResult paymentResult = paymentService.processPayment(paymentRequest);
        
        // Проверки
        assertThat(paymentResult.isSuccessful()).isTrue();
        
        Booking booking = bookingService.getBooking(bookingId);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        
        // Проверка вызова внешних сервисов
        verify(postRequestedFor(urlEqualTo("/api/payments")));
        verify(postRequestedFor(urlEqualTo("/api/notifications")));
    }
    
    private CreateEventRequest prepareEventRequest() {
        // Код создания тестового запроса на создание события
    }
    
    private BookingRequest prepareBookingRequest(UUID eventId) {
        // Код создания тестового запроса на бронирование
    }
    
    private PaymentRequest preparePaymentRequest(UUID bookingId) {
        // Код создания тестового запроса на оплату
    }
}
```

### Производительностные тесты

Производительностные тесты проверяют способность системы работать под нагрузкой. Для `backend-event` используются:

1. **Тесты нагрузки** — проверка работы системы при постепенном увеличении нагрузки
2. **Стресс-тесты** — проверка работы системы при экстремальной нагрузке
3. **Выносливость** — проверка работы системы при стабильной нагрузке в течение длительного времени

#### Пример конфигурации JMeter для тестирования API

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Event Service Load Test">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="List Events">
        <intProp name="ThreadGroup.num_threads">100</intProp>
        <intProp name="ThreadGroup.ramp_time">30</intProp>
        <boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp>
        <stringProp name="ThreadGroup.duration">300</stringProp>
        <stringProp name="ThreadGroup.delay"></stringProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy">
          <stringProp name="HTTPSampler.domain">api.test.aquastream.com</stringProp>
          <stringProp name="HTTPSampler.port">443</stringProp>
          <stringProp name="HTTPSampler.protocol">https</stringProp>
          <stringProp name="HTTPSampler.path">/api/events</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
        </HTTPSamplerProxy>
        <hashTree>
          <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Headers">
            <collectionProp name="HeaderManager.headers">
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">Content-Type</stringProp>
                <stringProp name="Header.value">application/json</stringProp>
              </elementProp>
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">Authorization</stringProp>
                <stringProp name="Header.value">Bearer ${__P(auth_token)}</stringProp>
              </elementProp>
            </collectionProp>
          </HeaderManager>
          <hashTree/>
          <ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion">
            <collectionProp name="Asserion.test_strings">
              <stringProp name="49586">200</stringProp>
            </collectionProp>
            <stringProp name="Assertion.test_field">Assertion.response_code</stringProp>
            <stringProp name="Assertion.custom_message"></stringProp>
          </ResponseAssertion>
          <hashTree/>
        </hashTree>
      </hashTree>
      <!-- Другие тестовые сценарии -->
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

## 🛠️ Тестовые данные и моки

### Тестовые базы данных

Для тестирования микросервиса используются следующие подходы к работе с базами данных:

1. **Встроенные БД** (H2) — для быстрого запуска простых тестов
2. **TestContainers** — для полноценного тестирования с PostgreSQL и Redis
3. **Тестовые схемы** — отдельные схемы в боевой БД для интеграционных тестов

#### Настройка TestContainers для PostgreSQL и Redis

```java
@TestConfiguration
public class TestDatabaseConfig {
    @Bean
    @Primary
    public DataSource dataSource() {
        PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("test_db")
            .withUsername("test_user")
            .withPassword("test_password")
            .withInitScript("schema.sql");
        
        postgres.start();
        
        return DataSourceBuilder.create()
            .url(postgres.getJdbcUrl())
            .username(postgres.getUsername())
            .password(postgres.getPassword())
            .build();
    }
    
    @Bean
    @Primary
    public RedisConnectionFactory redisConnectionFactory() {
        GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);
        
        redis.start();
        
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redis.getHost());
        config.setPort(redis.getFirstMappedPort());
        
        return new LettuceConnectionFactory(config);
    }
}
```

### Моки внешних сервисов

Для изоляции тестов от внешних зависимостей используются подходы:

1. **Mockito** — для простого моделирования поведения зависимостей в модульных тестах
2. **WireMock** — для моделирования внешних HTTP-сервисов в интеграционных тестах
3. **Testcontainers** — для запуска реальных контейнеров микросервисов

#### Пример использования WireMock для имитации внешнего сервиса

```java
@SpringBootTest
@AutoConfigureWireMock(port = 0)
class ExternalServiceTest {
    @Value("${wiremock.server.port}")
    private int wireMockPort;
    
    @BeforeEach
    void setUp() {
        // Настройка URL сервиса для использования WireMock
        System.setProperty("payment.service.url", "http://localhost:" + wireMockPort);
        
        // Настройка заглушки для внешнего API
        stubFor(post(urlEqualTo("/api/payments"))
            .withHeader("Content-Type", containing("application/json"))
            .withRequestBody(matchingJsonPath("$.amount"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("{"
                    + "\"paymentId\": \"p12345\","
                    + "\"status\": \"COMPLETED\","
                    + "\"transactionId\": \"t67890\""
                    + "}")));
    }
    
    @Test
    void shouldProcessPaymentSuccessfully() {
        // Given
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("100.00"));
        request.setBookingId(UUID.randomUUID());
        
        // When
        PaymentResponse response = paymentService.processPayment(request);
        
        // Then
        assertThat(response.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(response.getPaymentId()).isEqualTo("p12345");
        
        // Проверка того, что запрос был отправлен
        verify(postRequestedFor(urlEqualTo("/api/payments"))
            .withRequestBody(matchingJsonPath("$.amount", equalTo("100.00"))));
    }
}
```

### Тестовые пользователи

Для тестирования функциональности с различными правами доступа используются следующие тестовые пользователи:

| Роль | Логин | Пароль | Описание |
|------|-------|--------|----------|
| Гость | - | - | Неаутентифицированный пользователь |
| Пользователь | `user@test.com` | `test123` | Обычный пользователь с базовыми правами |
| Организатор | `organizer@test.com` | `test123` | Пользователь с правами создания и управления событиями |
| Администратор | `admin@test.com` | `test123` | Пользователь с полными правами администратора |

#### Пример настройки тестового Spring Security 

```java
@TestConfiguration
@EnableWebSecurity
public class TestSecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
                .antMatchers("/api/events").permitAll()
                .antMatchers("/api/bookings/**").hasRole("USER")
                .antMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            .and()
            .httpBasic();
        
        return http.build();
    }
    
    @Bean
    public InMemoryUserDetailsManager userDetailsService() {
        UserDetails user = User.builder()
            .username("user@test.com")
            .password("{noop}test123")
            .roles("USER")
            .build();
            
        UserDetails organizer = User.builder()
            .username("organizer@test.com")
            .password("{noop}test123")
            .roles("USER", "ORGANIZER")
            .build();
            
        UserDetails admin = User.builder()
            .username("admin@test.com")
            .password("{noop}test123")
            .roles("USER", "ORGANIZER", "ADMIN")
            .build();
            
        return new InMemoryUserDetailsManager(user, organizer, admin);
    }
}
```

## 📊 Примеры JSON для тестирования

### Создание события

#### Запрос создания нового события

```json
{
  "title": "Тестовое событие",
  "description": "Описание тестового события для демонстрации API",
  "start_date": "2023-12-15T10:00:00Z",
  "end_date": "2023-12-15T15:00:00Z",
  "location": "Москва, ул. Тестовая, 123",
  "capacity": 50,
  "category_id": "9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
  "price_options": [
    {
      "name": "Стандарт",
      "price": 1500,
      "available_quantity": 40
    },
    {
      "name": "VIP",
      "price": 3000,
      "available_quantity": 10
    }
  ],
  "organizer_id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b"
}
```

#### Успешный ответ на создание события

```json
{
  "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "title": "Тестовое событие",
  "status": "DRAFT",
  "created_at": "2023-10-05T14:23:11Z"
}
```

### Бронирование

#### Запрос создания бронирования

```json
{
  "event_id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "price_option_id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  "quantity": 2,
  "user_id": "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
  "promo_code": "WELCOME2023"
}
```

#### Успешный ответ на создание бронирования

```json
{
  "id": "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
  "event": {
    "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "title": "Тестовое событие"
  },
  "status": "PENDING_PAYMENT",
  "total_amount": 2700.00,
  "deadline": "2023-10-05T16:23:11Z",
  "booking_code": "BKG12345678"
}
```

### Платежи

#### Запрос инициации платежа

```json
{
  "booking_id": "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
  "payment_method": "CARD",
  "amount": 2700.00,
  "currency": "RUB",
  "return_url": "https://aquastream.com/payment/success",
  "cancel_url": "https://aquastream.com/payment/cancel"
}
```

#### Успешный ответ на инициацию платежа

```json
{
  "payment_id": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
  "status": "INITIATED",
  "redirect_url": "https://payment-provider.com/pay/12345",
  "amount": 2700.00,
  "currency": "RUB",
  "expires_at": "2023-10-05T16:23:11Z"
}
```

#### Callback от платежной системы

```json
{
  "payment_id": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
  "status": "COMPLETED",
  "transaction_id": "tx_123456789",
  "amount": 2700.00,
  "currency": "RUB",
  "timestamp": "2023-10-05T14:30:45Z"
}
```

### Отзывы

#### Запрос создания отзыва

```json
{
  "event_id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "user_id": "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
  "rating": 5,
  "content": "Отличное мероприятие! Все было организовано на высшем уровне."
}
```

#### Успешный ответ на создание отзыва

```json
{
  "id": "5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d",
  "event_id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "user_id": "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
  "rating": 5,
  "content": "Отличное мероприятие! Все было организовано на высшем уровне.",
  "status": "PENDING",
  "created_at": "2023-10-10T12:34:56Z"
}
```

## 📋 Инструкции по тестированию

### Запуск тестов

#### Запуск всех тестов

```bash
# Запуск всех тестов
./gradlew test

# Запуск с пропуском тестов, помеченных как slow
./gradlew test -PexcludeTags="slow"

# Запуск только интеграционных тестов
./gradlew test -PincludeTags="integration"
```

#### Запуск конкретных тестов

```bash
# Запуск тестов конкретного модуля
./gradlew :backend-event-service:test

# Запуск конкретного класса тестов
./gradlew :backend-event-service:test --tests "org.aquastream.event.service.EventServiceTest"

# Запуск конкретного тестового метода
./gradlew :backend-event-service:test --tests "org.aquastream.event.service.EventServiceTest.shouldCancelEvent"
```

### Отладка тестов

#### Включение детального логирования

```bash
# Запуск тестов с детальным логированием
./gradlew test -Dorg.gradle.logging.level=info -Dlogging.level.org.aquastream=DEBUG
```

#### Отладка в IDE

1. В IntelliJ IDEA откройте класс с тестами
2. Установите точки останова в нужных местах
3. Нажмите правой кнопкой на тест и выберите "Debug"

#### Отладка интеграционных тестов

1. Добавьте в тест метод для просмотра логов контейнеров:

```java
@Container
static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
    .withLogConsumer(new Slf4jLogConsumer(LoggerFactory.getLogger("postgres")));

// В тесте или @AfterAll методе для проверки логов
@Test
void checkLogs() {
    System.out.println("Postgres logs: " + postgres.getLogs());
}
```

### CI/CD интеграция

Тесты интегрированы в CI/CD пайплайн и выполняются автоматически при создании PR и перед деплоем.

#### GitHub Actions конфигурация для тестов

```yaml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 21
      uses: actions/setup-java@v2
      with:
        distribution: 'temurin'
        java-version: '21'
        
    - name: Run tests
      run: ./gradlew test
      
    - name: Generate test report
      if: always()
      run: ./gradlew jacocoTestReport
      
    - name: Upload test report
      if: always()
      uses: actions/upload-artifact@v2
      with:
        name: test-report
        path: build/reports/tests/
        
    - name: Upload coverage report
      if: always()
      uses: actions/upload-artifact@v2
      with:
        name: coverage-report
        path: build/reports/jacoco/test/html/
```

### Анализ покрытия

Для анализа покрытия тестами используется Jacoco. Минимальное требуемое покрытие:

- Строки кода: 80%
- Ветви: 70%
- Циклы: 60%

#### Запуск отчета о покрытии

```bash
# Генерация отчета о покрытии
./gradlew jacocoTestReport

# Проверка соответствия минимальным требованиям
./gradlew jacocoTestCoverageVerification
```

#### Конфигурация Jacoco

```kotlin
// Пример конфигурации в build.gradle.kts
jacoco {
    toolVersion = "0.8.10"
}

tasks.jacocoTestReport {
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}

tasks.jacocoTestCoverageVerification {
    violationRules {
        rule {
            limit {
                minimum = "0.8".toBigDecimal()
            }
        }
        
        rule {
            element = "CLASS"
            includes = listOf("org.aquastream.event.service.*Service")
            
            limit {
                counter = "LINE"
                value = "COVEREDRATIO"
                minimum = "0.9".toBigDecimal()
            }
            
            limit {
                counter = "BRANCH"
                value = "COVEREDRATIO"
                minimum = "0.8".toBigDecimal()
            }
        }
    }
} 