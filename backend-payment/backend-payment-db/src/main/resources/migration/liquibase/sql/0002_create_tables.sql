--liquibase formatted sql

--changeset aquastream:payment-0002-create-tables
--comment: Create payment tables with idempotency support

-- Основная таблица платежей
CREATE TABLE payment.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Связь с бизнес-объектами
    event_id UUID,
    user_id UUID NOT NULL,
    
    -- Финансовая информация
    amount_kopecks BIGINT NOT NULL CHECK (amount_kopecks > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
    
    -- Статусы и обработка
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50), -- 'card', 'sbp', 'wallet', etc.
    
    -- Идентификаторы провайдера (для идемпотентности)
    provider_name VARCHAR(50) NOT NULL, -- 'tinkoff', 'sber', 'yookassa', etc.
    provider_payment_id VARCHAR(255), -- ID платежа в системе провайдера
    idempotency_key VARCHAR(255) NOT NULL, -- Уникальный ключ для предотвращения дублей
    
    -- Описание и метаданные
    description TEXT,
    metadata JSONB, -- Дополнительные данные платежа
    
    -- Временные метки
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMPTZ, -- Когда отправлен провайдеру
    completed_at TIMESTAMPTZ, -- Когда завершен (succeeded/rejected/canceled)
    expires_at TIMESTAMPTZ, -- Срок действия платежа
    
    -- Аудит
    created_by UUID,
    client_ip INET,
    user_agent TEXT
);

-- Чеки и документы платежей
CREATE TABLE payment.payment_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL,
    
    -- Тип и содержимое чека
    receipt_type VARCHAR(50) NOT NULL, -- 'payment', 'refund', 'correction'
    receipt_data JSONB NOT NULL, -- Структурированные данные чека
    
    -- Информация о фискализации
    fiscal_receipt_number VARCHAR(255),
    fiscal_document_number VARCHAR(255),
    fiscal_sign VARCHAR(255),
    ofd_receipt_url TEXT, -- Ссылка на чек в ОФД
    
    -- Статус обработки чека
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, sent, registered, failed
    
    -- Временные метки
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMPTZ, -- Когда отправлен в ОФД
    registered_at TIMESTAMPTZ, -- Когда зарегистрирован в ОФД
    
    -- Связь с платежом
    FOREIGN KEY (payment_id) REFERENCES payment.payments(id) ON DELETE CASCADE
);

-- События вебхуков от провайдеров
CREATE TABLE payment.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Идентификация события
    provider_name VARCHAR(50) NOT NULL,
    provider_event_id VARCHAR(255) NOT NULL, -- ID события в системе провайдера
    event_type VARCHAR(100) NOT NULL, -- тип события: 'payment.succeeded', 'payment.failed', etc.
    
    -- Связь с платежом
    payment_id UUID,
    provider_payment_id VARCHAR(255), -- Может быть заполнен до создания записи payment
    
    -- Содержимое вебхука
    raw_payload JSONB NOT NULL, -- Полные данные вебхука
    processed_payload JSONB, -- Обработанные/нормализованные данные
    
    -- Статус обработки
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processed, failed, ignored
    processing_attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    
    -- Идемпотентность (защита от дублей)
    idempotency_key VARCHAR(255) NOT NULL, -- provider_name + provider_event_id + hash(payload)
    
    -- Временные метки
    received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ,
    
    -- HTTP контекст
    http_headers JSONB,
    source_ip INET,
    
    -- Связь с платежом (может быть установлена позже)
    FOREIGN KEY (payment_id) REFERENCES payment.payments(id) ON DELETE SET NULL
);

-- Лог изменений статусов платежей (для аудита)
CREATE TABLE payment.payment_status_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL,
    
    -- Переход статуса
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    
    -- Причина изменения
    reason VARCHAR(100), -- 'webhook', 'manual', 'timeout', 'api_call'
    details JSONB, -- Дополнительная информация
    
    -- Кто изменил
    changed_by UUID, -- ID пользователя или системного процесса
    webhook_event_id UUID, -- Ссылка на вебхук, если статус изменен через него
    
    -- Временная метка
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Связи
    FOREIGN KEY (payment_id) REFERENCES payment.payments(id) ON DELETE CASCADE,
    FOREIGN KEY (webhook_event_id) REFERENCES payment.webhook_events(id) ON DELETE SET NULL
);

-- Таблица для отслеживания retry логики
CREATE TABLE payment.payment_retries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL,
    
    -- Информация о попытке
    retry_attempt INTEGER NOT NULL,
    retry_type VARCHAR(50) NOT NULL, -- 'payment_submit', 'status_check', 'webhook_process'
    
    -- Результат попытки
    success BOOLEAN NOT NULL DEFAULT false,
    error_code VARCHAR(100),
    error_message TEXT,
    response_data JSONB,
    
    -- Временные метки
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_retry_at TIMESTAMPTZ,
    
    -- Связь с платежом
    FOREIGN KEY (payment_id) REFERENCES payment.payments(id) ON DELETE CASCADE
);

--rollback DROP TABLE IF EXISTS payment.payment_retries CASCADE;
--rollback DROP TABLE IF EXISTS payment.payment_status_log CASCADE;
--rollback DROP TABLE IF EXISTS payment.webhook_events CASCADE;
--rollback DROP TABLE IF EXISTS payment.payment_receipts CASCADE;
--rollback DROP TABLE IF EXISTS payment.payments CASCADE;