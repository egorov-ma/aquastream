# Бизнес-сценарии и бизнес-требования к использованию сервиса backend-event

## Ключевые бизнес-сценарии

1. **Создание и публикация события**
   - Организатор (или администратор) создает новое мероприятие с указанием названия, описания, даты, места, параметров (вместимость, цена, категория и др.).
   - Событие может быть создано как черновик, опубликовано или отменено.
   - При необходимости организатор может запросить автоматическое назначение экипажа (через интеграцию с backend-crew).
   - Также поддерживается отложенная публикация событий по расписанию.

2. **Просмотр каталога и деталей событий**
   - Любой пользователь (гость или авторизованный) может просматривать список доступных мероприятий с фильтрацией и пагинацией.
   - Доступен просмотр подробной информации о событии, включая отзывы, экипаж, статус и т.д.
   - Реализовано кэширование данных каталога для повышения производительности при высоких нагрузках.
   - Поддерживается экспорт информации о событии в форматы iCal/PDF.

3. **Бронирование билета на событие**
   - Авторизованный пользователь может забронировать место на выбранное мероприятие (если есть свободные места и событие открыто для бронирования).
   - Система создает бронь со статусом "ожидает оплаты" и устанавливает дедлайн для оплаты.
   - Пользователь получает уведомление о необходимости оплаты (email/SMS/push).
   - Система предотвращает двойное бронирование с помощью оптимистичных блокировок.
   - Бронирование возможно не позднее чем за X часов до начала события (настраивается для каждого события).

4. **Оплата бронирования**
   - Пользователь оплачивает бронь (эмуляция или интеграция с платежным шлюзом).
   - После подтверждения оплаты бронь становится подтвержденной, пользователю выдается электронный билет/квитанция.
   - Организатор и пользователь получают уведомления о статусе оплаты.
   - Поддерживаются различные платежные системы (определяются интеграцией).
   - Реализована обработка частичных платежей и возвратов при отмене.

5. **Автоматическая и ручная отмена бронирования**
   - Если пользователь не оплатил бронь до дедлайна, система автоматически отменяет бронь и освобождает место.
   - Пользователь или администратор могут отменить бронь вручную до оплаты.
   - При отмене отправляются соответствующие уведомления.
   - Система применяет политику возвратов в зависимости от времени до события.

6. **Управление экипажем мероприятия**
   - При создании или редактировании события организатор может запросить назначение экипажа через backend-crew.
   - Информация о назначенном экипаже отображается в деталях события.
   - В случае отмены или изменения события экипаж освобождается или переназначается.
   - Организатор может запросить конкретных членов экипажа с определенными навыками.

7. **Работа с избранным и отзывами**
   - Авторизованный пользователь может добавлять события в избранное, просматривать и удалять их.
   - После посещения события пользователь может оставить отзыв и оценку.
   - Организатор и администратор могут просматривать отзывы, при необходимости модерировать их.
   - Реализована фильтрация и рейтинг отзывов по полезности.
   - Организаторы могут отвечать на отзывы пользователей.

8. **Уведомления и интеграция с внешними сервисами**
   - Все ключевые события (создание, бронирование, оплата, отмена, назначение экипажа) сопровождаются публикацией событий в Kafka для интеграции с сервисом уведомлений и другими потребителями.
   - Уведомления отправляются пользователям и организаторам по email/SMS/push.
   - Реализованы напоминания о предстоящих событиях (за день, за час).
   - Система обеспечивает отказоустойчивость при недоступности сервиса уведомлений.

9. **Администрирование и аудит**
   - Администратор может управлять всеми событиями, бронированиями, отзывами, просматривать аудит действий.
   - В системе ведется журналирование ключевых операций и событий для анализа и безопасности.
   - Доступны функции массового управления (перенос, отмена нескольких событий).
   - Предоставляется аналитика и отчетность по популярности событий.

10. **Ценообразование и скидки**
    - Организаторы могут устанавливать различные ценовые категории билетов.
    - Поддерживаются динамические цены в зависимости от заполненности события.
    - Возможно применение промокодов и групповых скидок.
    - Реализована система лояльности с бонусами за активность.

---

## Бизнес-требования

- **Ролевое разграничение доступа:**
  - Гости могут только просматривать публичные события.
  - Пользователи могут бронировать, оплачивать, оставлять отзывы, работать с избранным.
  - Организаторы могут создавать и управлять своими событиями, видеть бронирования и отзывы по своим событиям.
  - Администраторы имеют полный доступ ко всем операциям.

- **Безопасность:**
  - Все изменения требуют аутентификации и авторизации (JWT, RBAC через Keycloak).
  - Все каналы защищены (TLS), данные валидируются и санитизируются.
  - Ведется аудит доступа и операций.
  - Реализована защита от перебора и DDoS-атак на критичные эндпоинты.
  - Применяются rate limits для публичных API.

- **Интеграция с внешними сервисами:**
  - Взаимодействие с backend-crew (назначение экипажа), backend-notification (Kafka события), backend-user/Keycloak (аутентификация, роли), API Gateway (REST/gRPC).
  - Поддержка различных платежных шлюзов через абстрактный интерфейс.
  - Интеграция с календарями (экспорт iCal) и соцсетями.

- **Масштабируемость и отказоустойчивость:**
  - Сервис должен поддерживать горизонтальное масштабирование, быть устойчивым к сбоям внешних сервисов (Kafka, crew, БД).
  - Все критичные операции должны быть идемпотентны и корректно обрабатываться при повторных попытках.
  - Система должна выдерживать пиковые нагрузки (например, при запуске продаж на популярные события).
  - SLA: 99.9% доступность, время отклика для основных операций < 300ms (p95).

- **Расширяемость:**
  - Возможность добавления новых типов событий, интеграций, бизнес-правил без кардинальной перестройки архитектуры.
  - Поддержка плагинной архитектуры для расширения функциональности.

- **Мониторинг и аналитика:**
  - Встроенный мониторинг (Prometheus, Grafana), логирование (ELK), публикация событий для аудита и аналитики.
  - Бизнес-метрики по конверсии и популярности событий.
  - Система алертов при отклонении от нормальных показателей.

- **Политика отмены и возврата средств:**
  - Бесплатная отмена бронирования и полный возврат средств за 7+ дней до события.
  - Частичный возврат (80%) за 2-7 дней до события.
  - Минимальный возврат (50%) за 24-48 часов до события.
  - Возврат не предоставляется менее чем за 24 часа до события (кроме форс-мажорных обстоятельств).
  - Полный возврат при отмене события организатором.
  - Возможность гибкой настройки политики возврата для каждого события.

- **Технические требования:**
  - Поддержка кэширования для высоконагруженных запросов (Redis).
  - Хранение исторических данных не менее 1 года для активных событий, архивирование старых данных.
  - RPS: до 1000 запросов в секунду для чтения, до 100 для записи.
  - Время восстановления после сбоя (RTO) < 5 минут.

- **Требования к производительности:**
  - Время отклика API (p95) < 300ms для основных операций.
  - Время выполнения критичных запросов к БД < 100ms.
  - Обработка пиковых нагрузок при 10x от средней активности.



---

# Модель данных и API

## Модель базы данных

```
/*
 * Таблица событий (мероприятий)
 */
CREATE TABLE event (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    location VARCHAR(255),
    location_coordinates POINT,
    max_participants INTEGER,
    price DECIMAL(10, 2),
    status VARCHAR(50) NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'CANCELED')),
    creator_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    category VARCHAR(100),
    image_url VARCHAR(500),
    booking_deadline_hours INTEGER DEFAULT 24,
    published_at TIMESTAMP,
    crew_id BIGINT REFERENCES crew(id),
    is_featured BOOLEAN DEFAULT FALSE
);

/*
 * Таблица бронирований
 */
CREATE TABLE booking (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES event(id),
    user_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELED', 'EXPIRED')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    payment_deadline TIMESTAMP NOT NULL,
    ticket_code VARCHAR(36) UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    UNIQUE (event_id, user_id)
);

/*
 * Таблица платежей
 */
CREATE TABLE payment (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES booking(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('INITIATED', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND')),
    gateway_reference VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    payment_method VARCHAR(50),
    refund_amount DECIMAL(10, 2) DEFAULT 0
);

/*
 * Таблица избранного
 */
CREATE TABLE favorite (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES event(id),
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

/*
 * Таблица отзывов
 */
CREATE TABLE review (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES event(id),
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'REJECTED')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    helpful_count INTEGER DEFAULT 0,
    UNIQUE (event_id, user_id)
);

/*
 * Таблица ответов на отзывы
 */
CREATE TABLE review_reply (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES review(id),
    author_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

/*
 * Таблица категорий событий
 */
CREATE TABLE event_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    parent_id INTEGER REFERENCES event_category(id),
    icon_url VARCHAR(255)
);

/*
 * Таблица ценовых опций для события
 */
CREATE TABLE price_option (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES event(id),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    quantity_available INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

/*
 * Таблица промокодов
 */
CREATE TABLE promo_code (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percentage INTEGER CHECK (discount_percentage BETWEEN 0 AND 100),
    discount_amount DECIMAL(10, 2),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    event_id BIGINT REFERENCES event(id),
    is_active BOOLEAN DEFAULT TRUE
);

/*
 * Индексы
 */
CREATE INDEX idx_event_status ON event(status);
CREATE INDEX idx_event_start_date ON event(start_date);
CREATE INDEX idx_event_category ON event(category);
CREATE INDEX idx_booking_status ON booking(status);
CREATE INDEX idx_booking_user_id ON booking(user_id);
CREATE INDEX idx_booking_event_id ON booking(event_id);
CREATE INDEX idx_payment_booking_id ON payment(booking_id);
CREATE INDEX idx_favorite_user_id ON favorite(user_id);
CREATE INDEX idx_review_event_id ON review(event_id);
```

## API методы

### EventService (gRPC)

```proto
syntax = "proto3";

package org.aquastream.event;

option java_multiple_files = true;
option java_package = "org.aquastream.event.grpc";

import "google/protobuf/timestamp.proto";
import "google/protobuf/empty.proto";
import "google/protobuf/wrappers.proto";

service EventService {
    // Управление событиями
    rpc CreateEvent(CreateEventRequest) returns (EventResponse);
    rpc UpdateEvent(UpdateEventRequest) returns (EventResponse);
    rpc GetEvent(GetEventRequest) returns (EventResponse);
    rpc ListEvents(ListEventsRequest) returns (ListEventsResponse);
    rpc PublishEvent(PublishEventRequest) returns (EventResponse);
    rpc CancelEvent(CancelEventRequest) returns (EventResponse);
    rpc AssignCrew(AssignCrewRequest) returns (EventResponse);
    
    // Управление бронированиями
    rpc CreateBooking(CreateBookingRequest) returns (BookingResponse);
    rpc GetBooking(GetBookingRequest) returns (BookingResponse);
    rpc ListBookings(ListBookingsRequest) returns (ListBookingsResponse);
    rpc CancelBooking(CancelBookingRequest) returns (BookingResponse);
    
    // Управление платежами
    rpc InitiatePayment(InitiatePaymentRequest) returns (PaymentResponse);
    rpc ConfirmPayment(ConfirmPaymentRequest) returns (PaymentResponse);
    rpc RefundPayment(RefundPaymentRequest) returns (PaymentResponse);
    
    // Работа с избранным
    rpc AddFavorite(AddFavoriteRequest) returns (FavoriteResponse);
    rpc RemoveFavorite(RemoveFavoriteRequest) returns (google.protobuf.Empty);
    rpc ListFavorites(ListFavoritesRequest) returns (ListFavoritesResponse);
    
    // Работа с отзывами
    rpc CreateReview(CreateReviewRequest) returns (ReviewResponse);
    rpc UpdateReview(UpdateReviewRequest) returns (ReviewResponse);
    rpc ListReviews(ListReviewsRequest) returns (ListReviewsResponse);
    rpc ReplyToReview(ReplyToReviewRequest) returns (ReviewReplyResponse);
    
    // Аналитика и отчеты
    rpc GetEventStats(GetEventStatsRequest) returns (EventStatsResponse);
}

// Запросы и ответы для событий
message CreateEventRequest {
    string name = 1;
    string description = 2;
    string short_description = 3;
    google.protobuf.Timestamp start_date = 4;
    google.protobuf.Timestamp end_date = 5;
    string location = 6;
    LocationPoint location_coordinates = 7;
    int32 max_participants = 8;
    double price = 9;
    string category = 10;
    string image_url = 11;
    int32 booking_deadline_hours = 12;
    bool auto_publish = 13;
    google.protobuf.Timestamp publish_at = 14;
    repeated PriceOption price_options = 15;
}

message UpdateEventRequest {
    int64 id = 1;
    google.protobuf.StringValue name = 2;
    google.protobuf.StringValue description = 3;
    google.protobuf.StringValue short_description = 4;
    google.protobuf.Timestamp start_date = 5;
    google.protobuf.Timestamp end_date = 6;
    google.protobuf.StringValue location = 7;
    LocationPoint location_coordinates = 8;
    google.protobuf.Int32Value max_participants = 9;
    google.protobuf.DoubleValue price = 10;
    google.protobuf.StringValue category = 11;
    google.protobuf.StringValue image_url = 12;
    google.protobuf.Int32Value booking_deadline_hours = 13;
}

message GetEventRequest {
    int64 id = 1;
}

message ListEventsRequest {
    int32 page = 1;
    int32 size = 2;
    string status = 3;
    string category = 4;
    google.protobuf.Timestamp start_date_from = 5;
    google.protobuf.Timestamp start_date_to = 6;
    string search_query = 7;
    string sort_by = 8;
    bool sort_desc = 9;
    bool only_featured = 10;
}

message PublishEventRequest {
    int64 id = 1;
    google.protobuf.Timestamp publish_at = 2;
}

message CancelEventRequest {
    int64 id = 1;
    string reason = 2;
    bool notify_participants = 3;
}

message AssignCrewRequest {
    int64 event_id = 1;
    int64 crew_id = 2;
}

// Сущности
message EventResponse {
    int64 id = 1;
    string name = 2;
    string description = 3;
    string short_description = 4;
    google.protobuf.Timestamp start_date = 5;
    google.protobuf.Timestamp end_date = 6;
    string location = 7;
    LocationPoint location_coordinates = 8;
    int32 max_participants = 9;
    double price = 10;
    string status = 11;
    string creator_id = 12;
    google.protobuf.Timestamp created_at = 13;
    google.protobuf.Timestamp updated_at = 14;
    string category = 15;
    string image_url = 16;
    int32 booking_deadline_hours = 17;
    google.protobuf.Timestamp published_at = 18;
    int64 crew_id = 19;
    bool is_featured = 20;
    int32 available_seats = 21;
    double avg_rating = 22;
    int32 review_count = 23;
    repeated PriceOption price_options = 24;
}

message ListEventsResponse {
    repeated EventResponse events = 1;
    int32 total_pages = 2;
    int64 total_elements = 3;
    int32 page = 4;
}

// Запросы и ответы для бронирований
message CreateBookingRequest {
    int64 event_id = 1;
    int32 quantity = 2;
    int64 price_option_id = 3;
    string promo_code = 4;
}

message GetBookingRequest {
    int64 id = 1;
}

message ListBookingsRequest {
    int32 page = 1;
    int32 size = 2;
    string user_id = 3;
    int64 event_id = 4;
    string status = 5;
}

message CancelBookingRequest {
    int64 id = 1;
    string reason = 2;
}

message BookingResponse {
    int64 id = 1;
    int64 event_id = 2;
    string user_id = 3;
    string status = 4;
    google.protobuf.Timestamp created_at = 5;
    google.protobuf.Timestamp updated_at = 6;
    google.protobuf.Timestamp payment_deadline = 7;
    string ticket_code = 8;
    int32 quantity = 9;
    double total_price = 10;
    EventResponse event = 11;
}

message ListBookingsResponse {
    repeated BookingResponse bookings = 1;
    int32 total_pages = 2;
    int64 total_elements = 3;
    int32 page = 4;
}

// Платежи
message InitiatePaymentRequest {
    int64 booking_id = 1;
    string payment_method = 2;
    string return_url = 3;
}

message ConfirmPaymentRequest {
    string gateway_reference = 1;
}

message RefundPaymentRequest {
    int64 payment_id = 1;
    double amount = 2;
    string reason = 3;
}

message PaymentResponse {
    int64 id = 1;
    int64 booking_id = 2;
    double amount = 3;
    string status = 4;
    string gateway_reference = 5;
    google.protobuf.Timestamp created_at = 6;
    google.protobuf.Timestamp updated_at = 7;
    string payment_method = 8;
    double refund_amount = 9;
    string payment_url = 10;
}

// Избранное
message AddFavoriteRequest {
    int64 event_id = 1;
}

message RemoveFavoriteRequest {
    int64 event_id = 1;
}

message ListFavoritesRequest {
    int32 page = 1;
    int32 size = 2;
}

message FavoriteResponse {
    int64 id = 1;
    int64 event_id = 2;
    string user_id = 3;
    google.protobuf.Timestamp created_at = 4;
    EventResponse event = 5;
}

message ListFavoritesResponse {
    repeated FavoriteResponse favorites = 1;
    int32 total_pages = 2;
    int64 total_elements = 3;
    int32 page = 4;
}

// Отзывы
message CreateReviewRequest {
    int64 event_id = 1;
    int32 rating = 2;
    string content = 3;
}

message UpdateReviewRequest {
    int64 id = 1;
    int32 rating = 2;
    string content = 3;
}

message ListReviewsRequest {
    int32 page = 1;
    int32 size = 2;
    int64 event_id = 3;
    string user_id = 4;
    string status = 5;
}

message ReplyToReviewRequest {
    int64 review_id = 1;
    string content = 2;
}

message ReviewResponse {
    int64 id = 1;
    int64 event_id = 2;
    string user_id = 3;
    int32 rating = 4;
    string content = 5;
    string status = 6;
    google.protobuf.Timestamp created_at = 7;
    google.protobuf.Timestamp updated_at = 8;
    int32 helpful_count = 9;
    repeated ReviewReplyResponse replies = 10;
    UserProfileResponse user = 11;
}

message ReviewReplyResponse {
    int64 id = 1;
    int64 review_id = 2;
    string author_id = 3;
    string content = 4;
    google.protobuf.Timestamp created_at = 5;
    google.protobuf.Timestamp updated_at = 6;
    UserProfileResponse author = 7;
}

message ListReviewsResponse {
    repeated ReviewResponse reviews = 1;
    int32 total_pages = 2;
    int64 total_elements = 3;
    int32 page = 4;
    double avg_rating = 5;
}

// Аналитика
message GetEventStatsRequest {
    int64 event_id = 1;
    google.protobuf.Timestamp start_date = 2;
    google.protobuf.Timestamp end_date = 3;
}

message EventStatsResponse {
    int64 event_id = 1;
    int32 total_bookings = 2;
    int32 confirmed_bookings = 3;
    int32 canceled_bookings = 4;
    double total_revenue = 5;
    double avg_rating = 6;
    int32 review_count = 7;
    map<string, int32> bookings_by_day = 8;
}

// Вспомогательные сущности
message LocationPoint {
    double latitude = 1;
    double longitude = 2;
}

message PriceOption {
    int64 id = 1;
    string name = 2;
    double price = 3;
    string description = 4;
    int32 quantity_available = 5;
    bool is_active = 6;
}

message UserProfileResponse {
    string id = 1;
    string username = 2;
    string display_name = 3;
    string avatar_url = 4;
}
```

### REST API через Gateway

#### События

| Метод | Путь | Описание | Роли |
|-------|------|-----------|------|
| GET | /api/events | Получение списка событий с фильтрами | PUBLIC |
| GET | /api/events/{id} | Получение детальной информации о событии | PUBLIC |
| POST | /api/events | Создание нового события | ORGANIZER, ADMIN |
| PUT | /api/events/{id} | Обновление информации о событии | ORGANIZER, ADMIN |
| POST | /api/events/{id}/publish | Публикация события | ORGANIZER, ADMIN |
| POST | /api/events/{id}/cancel | Отмена события | ORGANIZER, ADMIN |
| POST | /api/events/{id}/crew | Назначение экипажа | ORGANIZER, ADMIN |
| GET | /api/events/{id}/stats | Получение статистики по событию | ORGANIZER, ADMIN |

#### Бронирования

| Метод | Путь | Описание | Роли |
|-------|------|-----------|------|
| POST | /api/bookings | Создание бронирования | USER, ORGANIZER, ADMIN |
| GET | /api/bookings/{id} | Получение информации о бронировании | USER, ORGANIZER, ADMIN |
| GET | /api/bookings | Получение списка бронирований | USER, ORGANIZER, ADMIN |
| POST | /api/bookings/{id}/cancel | Отмена бронирования | USER, ORGANIZER, ADMIN |
| GET | /api/bookings/{id}/ticket | Скачивание электронного билета | USER, ORGANIZER, ADMIN |

#### Платежи

| Метод | Путь | Описание | Роли |
|-------|------|-----------|------|
| POST | /api/payments | Инициация платежа | USER, ORGANIZER, ADMIN |
| GET | /api/payments/{id} | Получение статуса платежа | USER, ORGANIZER, ADMIN |
| POST | /api/payments/{id}/refund | Возврат средств | USER, ORGANIZER, ADMIN |

#### Избранное

| Метод | Путь | Описание | Роли |
|-------|------|-----------|------|
| POST | /api/favorites | Добавление события в избранное | USER, ORGANIZER, ADMIN |
| DELETE | /api/favorites/{eventId} | Удаление события из избранного | USER, ORGANIZER, ADMIN |
| GET | /api/favorites | Получение списка избранных событий | USER, ORGANIZER, ADMIN |

#### Отзывы

| Метод | Путь | Описание | Роли |
|-------|------|-----------|------|
| POST | /api/reviews | Создание отзыва | USER, ORGANIZER, ADMIN |
| PUT | /api/reviews/{id} | Обновление отзыва | USER, ORGANIZER, ADMIN |
| GET | /api/reviews | Получение списка отзывов | PUBLIC |
| POST | /api/reviews/{id}/replies | Ответ на отзыв | ORGANIZER, ADMIN |
| POST | /api/reviews/{id}/helpful | Отметить отзыв как полезный | USER, ORGANIZER, ADMIN |
| POST | /api/reviews/{id}/moderate | Модерация отзыва | ADMIN |

#### Категории

| Метод | Путь | Описание | Роли |
|-------|------|-----------|------|
| GET | /api/categories | Получение списка категорий | PUBLIC |
| POST | /api/categories | Создание категории | ADMIN |
| PUT | /api/categories/{id} | Обновление категории | ADMIN |

#### Промокоды

| Метод | Путь | Описание | Роли |
|-------|------|-----------|------|
| POST | /api/promo-codes | Создание промокода | ORGANIZER, ADMIN |
| GET | /api/promo-codes | Получение списка промокодов | ORGANIZER, ADMIN |
| PUT | /api/promo-codes/{id} | Обновление промокода | ORGANIZER, ADMIN |
| POST | /api/promo-codes/{code}/validate | Проверка валидности промокода | USER, ORGANIZER, ADMIN |

---

# Стратегии обработки отказов

## Сценарии отказоустойчивости

1. **Недоступность БД**
   - Использование connection pooling с настроенными timeout и retry
   - Применение паттерна Circuit Breaker для предотвращения каскадных отказов
   - Резервное копирование критичных данных в Redis для чтения в аварийном режиме
   - Логирование failed операций для последующего восстановления

2. **Недоступность Kafka**
   - Буферизация сообщений локально с последующей отправкой
   - Периодические попытки переподключения с экспоненциальной задержкой
   - Возможность ручного восстановления из логов при восстановлении сервиса

3. **Недоступность backend-crew**
   - Асинхронные запросы с очередью ожидания
   - Возможность временного функционирования без crew (с флагом "экипаж будет назначен позднее")
   - Периодические retry с уведомлением администратора после N неудачных попыток

4. **Недоступность backend-notification**
   - Локальная очередь уведомлений с персистентным хранением
   - Отправка batch-уведомлений при восстановлении сервиса
   - Возможность ручной отправки через админку

5. **Недоступность Keycloak**
   - Кэширование токенов и user info в Redis с разумным TTL
   - Временная деградация функциональности до read-only для неаутентифицированных пользователей
   - Блокировка критичных операций до восстановления сервиса аутентификации

## Стратегии восстановления данных

1. **Регулярные бэкапы**
   - Полный бэкап БД каждые 24 часа
   - Инкрементальный бэкап каждые 6 часов
   - Логи транзакций для point-in-time recovery

2. **Репликация**
   - Асинхронная репликация в standby БД
   - Автоматическое переключение в случае отказа primary

3. **Журналирование**
   - Ведение журнала всех изменений с возможностью replay операций
   - Хранение critical data с audit log для возможности ручного восстановления

## План восстановления после сбоя

1. **Автоматическое восстановление**
   - Health check и self-healing в Kubernetes
   - Автоматический restart подов при обнаружении проблем
   - Проверка консистентности данных при старте сервиса

2. **Полуавтоматическое восстановление**
   - Оповещение DevOps-команды при критических ошибках
   - Предустановленные скрипты восстановления для типичных сценариев
   - Документированные чек-листы восстановления

3. **Ручное восстановление**
   - Подробные инструкции для сложных сценариев
   - Процедуры восстановления из резервных копий
   - Скрипты валидации данных после восстановления