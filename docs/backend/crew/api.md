# Crew API

Статус: as-is

## Группы и назначения
```yaml
GET  /api/v1/events/{eventId}/crews          # -> {crews[], types[]}
POST /api/v1/crews/{crewId}/assignments      # (ORGANIZER) {userId, bookingId, seatNumber?} -> {assignmentId}
PUT  /api/v1/events/{eventId}/preferences    # {prefersWithUserIds?, avoidsUserIds?} -> {success}
```

Документация API (ReDoc): ../../api/redoc/root/backend-crew-api.html
