--liquibase formatted sql

--changeset aquastream:payment-0003-indexes-constraints
--comment: Create indexes and constraints for payment tables

-- УНИКАЛЬНЫЕ ИНДЕКСЫ ДЛЯ ИДЕМПОТЕНТНОСТИ (АС: дубликаты вебхуков ловятся на уровне БД)

-- Уникальность идемпотентности ключа платежей
CREATE UNIQUE INDEX CONCURRENTLY ix_payments_idempotency_key 
ON payment.payments (provider_name, idempotency_key);

-- Уникальность ID платежа провайдера (один платеж = один ID в системе провайдера)
CREATE UNIQUE INDEX CONCURRENTLY ix_payments_provider_payment_id 
ON payment.payments (provider_name, provider_payment_id) 
WHERE provider_payment_id IS NOT NULL;

-- Уникальность события провайдера (АС: дубликаты вебхуков ловятся на уровне БД)
CREATE UNIQUE INDEX CONCURRENTLY ix_webhook_events_provider_event 
ON payment.webhook_events (provider_name, provider_event_id);

-- Дополнительная защита от дублей вебхуков по idempotency_key
CREATE UNIQUE INDEX CONCURRENTLY ix_webhook_events_idempotency_key 
ON payment.webhook_events (idempotency_key);

-- ПРОИЗВОДИТЕЛЬНОСТЬ: ИНДЕКСЫ ДЛЯ ЧАСТЫХ ЗАПРОСОВ

-- Платежи по пользователю
CREATE INDEX CONCURRENTLY ix_payments_user_id 
ON payment.payments (user_id, created_at DESC);

-- Платежи по событию
CREATE INDEX CONCURRENTLY ix_payments_event_id 
ON payment.payments (event_id, created_at DESC) 
WHERE event_id IS NOT NULL;

-- Платежи по статусу (для мониторинга и обработки)
CREATE INDEX CONCURRENTLY ix_payments_status 
ON payment.payments (status, created_at);

-- Платежи по провайдеру и статусу
CREATE INDEX CONCURRENTLY ix_payments_provider_status 
ON payment.payments (provider_name, status, created_at);

-- Просроченные платежи для cleanup
CREATE INDEX CONCURRENTLY ix_payments_expires_at 
ON payment.payments (expires_at) 
WHERE expires_at IS NOT NULL AND status IN ('pending', 'submitted');

-- Чеки по платежу
CREATE INDEX CONCURRENTLY ix_payment_receipts_payment_id 
ON payment.payment_receipts (payment_id, created_at DESC);

-- Чеки по статусу (для обработки)
CREATE INDEX CONCURRENTLY ix_payment_receipts_status 
ON payment.payment_receipts (status, created_at) 
WHERE status != 'registered';

-- Вебхуки по платежу
CREATE INDEX CONCURRENTLY ix_webhook_events_payment_id 
ON payment.webhook_events (payment_id, received_at DESC) 
WHERE payment_id IS NOT NULL;

-- Вебхуки по статусу обработки
CREATE INDEX CONCURRENTLY ix_webhook_events_status 
ON payment.webhook_events (status, received_at) 
WHERE status != 'processed';

-- Вебхуки по provider_payment_id (для связывания до создания payment)
CREATE INDEX CONCURRENTLY ix_webhook_events_provider_payment_id 
ON payment.webhook_events (provider_name, provider_payment_id, received_at) 
WHERE provider_payment_id IS NOT NULL;

-- Лог статусов по платежу
CREATE INDEX CONCURRENTLY ix_payment_status_log_payment_id 
ON payment.payment_status_log (payment_id, changed_at DESC);

-- Retry попытки по платежу
CREATE INDEX CONCURRENTLY ix_payment_retries_payment_id 
ON payment.payment_retries (payment_id, attempted_at DESC);

-- Retry попытки для следующего выполнения
CREATE INDEX CONCURRENTLY ix_payment_retries_next_retry 
ON payment.payment_retries (next_retry_at) 
WHERE next_retry_at IS NOT NULL AND success = false;

-- СОСТАВНЫЕ ИНДЕКСЫ ДЛЯ АНАЛИТИКИ

-- Платежи по провайдеру, статусу и дате (для отчетности)
CREATE INDEX CONCURRENTLY ix_payments_analytics 
ON payment.payments (provider_name, status, DATE(created_at), amount_kopecks);

-- Статистика вебхуков по провайдеру и типу
CREATE INDEX CONCURRENTLY ix_webhook_events_analytics 
ON payment.webhook_events (provider_name, event_type, DATE(received_at));

-- ФУНКЦИИ АВТОМАТИЗАЦИИ

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION payment.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER tr_payments_update_updated_at
    BEFORE UPDATE ON payment.payments
    FOR EACH ROW
    EXECUTE FUNCTION payment.update_updated_at();

CREATE TRIGGER tr_payment_receipts_update_updated_at
    BEFORE UPDATE ON payment.payment_receipts
    FOR EACH ROW
    EXECUTE FUNCTION payment.update_updated_at();

-- Функция для автоматического логирования изменений статуса
CREATE OR REPLACE FUNCTION payment.log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Логируем только если статус реально изменился
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO payment.payment_status_log (
            payment_id, old_status, new_status, 
            reason, changed_at
        ) VALUES (
            NEW.id, OLD.status, NEW.status,
            'automatic', CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического логирования изменений статуса
CREATE TRIGGER tr_payments_log_status_change
    AFTER UPDATE ON payment.payments
    FOR EACH ROW
    EXECUTE FUNCTION payment.log_status_change();

-- Ограничения на допустимые статусы
ALTER TABLE payment.payments 
ADD CONSTRAINT ck_payments_status 
CHECK (status IN ('pending', 'submitted', 'succeeded', 'rejected', 'canceled'));

ALTER TABLE payment.payment_receipts 
ADD CONSTRAINT ck_payment_receipts_status 
CHECK (status IN ('pending', 'sent', 'registered', 'failed'));

ALTER TABLE payment.webhook_events 
ADD CONSTRAINT ck_webhook_events_status 
CHECK (status IN ('pending', 'processed', 'failed', 'ignored'));

ALTER TABLE payment.payment_status_log 
ADD CONSTRAINT ck_payment_status_log_new_status 
CHECK (new_status IN ('pending', 'submitted', 'succeeded', 'rejected', 'canceled'));

-- Ограничения на валюту
ALTER TABLE payment.payments 
ADD CONSTRAINT ck_payments_currency 
CHECK (currency IN ('RUB', 'USD', 'EUR'));

-- Комментарии к таблицам
COMMENT ON TABLE payment.payments IS 'Основная таблица платежей с поддержкой идемпотентности';
COMMENT ON TABLE payment.payment_receipts IS 'Фискальные чеки и документы платежей';
COMMENT ON TABLE payment.webhook_events IS 'События вебхуков от платежных провайдеров с защитой от дублей';
COMMENT ON TABLE payment.payment_status_log IS 'Лог всех изменений статусов платежей для аудита';
COMMENT ON TABLE payment.payment_retries IS 'История retry попыток для платежей';

-- Комментарии к ключевым полям
COMMENT ON COLUMN payment.payments.idempotency_key IS 'Уникальный ключ для предотвращения дублирования платежей';
COMMENT ON COLUMN payment.payments.provider_payment_id IS 'ID платежа в системе провайдера (уникален в рамках провайдера)';
COMMENT ON COLUMN payment.webhook_events.provider_event_id IS 'ID события в системе провайдера (уникален в рамках провайдера)';
COMMENT ON COLUMN payment.webhook_events.idempotency_key IS 'Уникальный ключ события: provider_name + provider_event_id + hash(payload)';

--rollback DROP TRIGGER IF EXISTS tr_payments_log_status_change ON payment.payments CASCADE;
--rollback DROP TRIGGER IF EXISTS tr_payment_receipts_update_updated_at ON payment.payment_receipts CASCADE;
--rollback DROP TRIGGER IF EXISTS tr_payments_update_updated_at ON payment.payments CASCADE;
--rollback DROP FUNCTION IF EXISTS payment.log_status_change() CASCADE;
--rollback DROP FUNCTION IF EXISTS payment.update_updated_at() CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_webhook_events_analytics CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payments_analytics CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payment_retries_next_retry CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payment_retries_payment_id CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payment_status_log_payment_id CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_webhook_events_provider_payment_id CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_webhook_events_status CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_webhook_events_payment_id CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payment_receipts_status CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payment_receipts_payment_id CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payments_expires_at CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payments_provider_status CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payments_status CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payments_event_id CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payments_user_id CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_webhook_events_idempotency_key CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_webhook_events_provider_event CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payments_provider_payment_id CASCADE;
--rollback DROP INDEX IF EXISTS payment.ix_payments_idempotency_key CASCADE;