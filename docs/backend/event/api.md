# Event API

Статус: as-is

## Публичные
```yaml
GET /api/v1/organizers           # {search?, page?, size?} -> {organizers[], total}
GET /api/v1/organizers/{slug}    # -> {organizer, events[]}
GET /api/v1/events/{eventId}     # -> {event, organizer, available}
```

## Бронирования
```yaml
POST /api/v1/bookings            # {eventId} -> {bookingId, status, amount, expiresAt}
GET  /api/v1/bookings            # {status?, page?, size?} -> {bookings[], total}
PUT  /api/v1/bookings/{id}/confirm
PUT  /api/v1/bookings/{id}/cancel   # {reason?}
```

Документация API (ReDoc): ../../api/redoc/root/backend-event-api.html
