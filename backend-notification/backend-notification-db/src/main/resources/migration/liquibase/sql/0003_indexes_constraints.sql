-- Indexes and additional constraints for notification schema
-- Performance indexes for frequent queries on user_id and Telegram data

SET search_path TO notification, public;

-- Indexes for notification_prefs
-- Primary query: get user preferences by category
CREATE INDEX ix_notification_prefs_user_category 
    ON notification_prefs (user_id, category);

-- Index for querying by category across users (admin queries)
CREATE INDEX ix_notification_prefs_category 
    ON notification_prefs (category) WHERE enabled = true;

-- Indexes for telegram_subscriptions
-- Primary query: find subscription by user_id
CREATE INDEX ix_telegram_subscriptions_user_id 
    ON telegram_subscriptions (user_id) WHERE is_active = true;

-- Query by Telegram chat_id for webhook processing
CREATE INDEX ix_telegram_subscriptions_telegram_chat_id 
    ON telegram_subscriptions (telegram_chat_id) WHERE is_active = true;

-- Query by link_code for verification
CREATE INDEX ix_telegram_subscriptions_link_code 
    ON telegram_subscriptions (link_code) 
    WHERE link_code IS NOT NULL AND link_expires_at > CURRENT_TIMESTAMP;

-- Indexes for outbox (critical for performance)
-- Primary query: find pending messages to send
CREATE INDEX ix_outbox_status_scheduled 
    ON outbox (status, scheduled_at NULLS FIRST, created_at) 
    WHERE status IN ('PENDING', 'FAILED') 
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);

-- Query for retry logic: failed messages that can be retried
CREATE INDEX ix_outbox_retry 
    ON outbox (status, attempts, updated_at) 
    WHERE status = 'FAILED' AND attempts < max_attempts;

-- Query by user and category for analytics/debugging
CREATE INDEX ix_outbox_user_category 
    ON outbox (user_id, category, status, created_at DESC);

-- Query for cleanup: old processed messages
CREATE INDEX ix_outbox_cleanup 
    ON outbox (status, sent_at) 
    WHERE status IN ('SENT', 'SKIPPED');

-- Partial index for active telegram subscriptions
CREATE UNIQUE INDEX ix_telegram_subscriptions_active_user 
    ON telegram_subscriptions (user_id) 
    WHERE is_active = true AND verified_at IS NOT NULL;

-- Additional constraints

-- Ensure link_code has expiration time when present
ALTER TABLE telegram_subscriptions 
ADD CONSTRAINT chk_telegram_link_code_expiry 
    CHECK ((link_code IS NULL AND link_expires_at IS NULL) 
           OR (link_code IS NOT NULL AND link_expires_at IS NOT NULL));

-- Ensure verified_at is set when subscription is active
ALTER TABLE telegram_subscriptions 
ADD CONSTRAINT chk_telegram_verified_when_active 
    CHECK ((is_active = false) OR (is_active = true AND verified_at IS NOT NULL));

-- Ensure scheduled_at is in future when set
ALTER TABLE outbox 
ADD CONSTRAINT chk_outbox_scheduled_future 
    CHECK (scheduled_at IS NULL OR scheduled_at >= created_at);

-- Ensure sent_at is set when status is SENT
ALTER TABLE outbox 
ADD CONSTRAINT chk_outbox_sent_at_status 
    CHECK ((status != 'SENT') OR (status = 'SENT' AND sent_at IS NOT NULL));