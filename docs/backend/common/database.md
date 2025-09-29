# База данных (as-is)

PostgreSQL 16, схемы разделены по доменам.

## Схемы и ключевые таблицы

### user
```sql
users (id, username, password_hash, role, active)
profiles (user_id, phone, telegram, is_telegram_verified, extra)
refresh_sessions (jti, user_id, issued_at, expires_at, revoked_at)
recovery_codes (user_id, code_hash, used_at, expires_at)
audit_log (id, actor_user_id, action, target_type, target_id, payload)
```

### event
```sql
organizers (id, slug, name, logo_url, description, contacts, brand_color)
events (id, organizer_id, type, title, date_start, date_end, location, price, capacity, available, status)
bookings (id, event_id, user_id, status, amount, payment_status, payment_id, expires_at, created_by)
booking_logs (id, booking_id, action, old_value, new_value, actor_user_id)
waitlist (id, event_id, user_id, priority, notified_at, notification_expires_at)
favorites (user_id, event_id)
team_members (id, organizer_id, name, role, photo_url, bio)
faq_items (id, organizer_id, question, answer)
```

### crew
```sql
crews (id, event_id, name, type, capacity)
crew_assignments (id, crew_id, user_id, booking_id, seat_number, assigned_by)
team_preferences (user_id, event_id, prefers_with_user_ids[], avoids_user_ids[])
```

### payment
```sql
payments (id, booking_id, method, amount, currency, status, provider, provider_payment_id)
payment_receipts (id, payment_id, proof_url, reviewed_by, reviewed_at)
webhook_events (idempotency_key, provider, raw_payload, status, processed_at)
```

### notification
```sql
notification_prefs (user_id, category, channel, enabled)
telegram_subscriptions (user_id, telegram_username, telegram_chat_id, verified_at)
outbox (id, user_id, category, payload, status, attempts, sent_at)
```

### media
```sql
files (id, owner_type, owner_id, file_key, content_type, size_bytes, storage_url, expires_at)
```

## Примечания
- Статусы и enum’ы централизованы в `backend-common`.
- Истечение pending‑броней и обработка waitlist реализованы планировщиком в `backend-event`.
