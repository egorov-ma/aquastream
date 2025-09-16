-- Notification service tables
-- Based on spec: notification_prefs, telegram_subscriptions, outbox

SET search_path TO notification, public;

-- User notification preferences
-- Stores user preferences for different notification categories and delivery channels
CREATE TABLE notification_prefs (
    user_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL, -- BOOKING_CONFIRMED, PAYMENT_STATUS, EVENT_REMINDER, WAITLIST_AVAILABLE, EVENT_NEWS
    channel VARCHAR(20) NOT NULL, -- EMAIL, SMS, TELEGRAM, PUSH
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, category, channel),
    
    -- Foreign key to user.users (cross-schema reference)
    CONSTRAINT fk_notification_prefs_user_id 
        FOREIGN KEY (user_id) REFERENCES "user".users(id) ON DELETE CASCADE
);

COMMENT ON TABLE notification_prefs IS 'User notification preferences by category and delivery channel';
COMMENT ON COLUMN notification_prefs.category IS 'Notification category: BOOKING_CONFIRMED, PAYMENT_STATUS, EVENT_REMINDER, WAITLIST_AVAILABLE, EVENT_NEWS';
COMMENT ON COLUMN notification_prefs.channel IS 'Delivery channel: EMAIL, SMS, TELEGRAM, PUSH';
COMMENT ON COLUMN notification_prefs.enabled IS 'Whether notifications for this category/channel combination are enabled';

-- Telegram bot subscriptions
-- Links users to their Telegram accounts for bot messaging
CREATE TABLE telegram_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    telegram_username VARCHAR(32), -- Optional Telegram username (without @)
    telegram_chat_id BIGINT NOT NULL, -- Telegram chat ID for sending messages
    telegram_user_id BIGINT NOT NULL, -- Telegram user ID
    verified_at TIMESTAMP WITH TIME ZONE, -- When the linking was verified
    link_code VARCHAR(32), -- Temporary code for linking verification
    link_expires_at TIMESTAMP WITH TIME ZONE, -- When the link code expires
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to user.users (cross-schema reference)
    CONSTRAINT fk_telegram_subscriptions_user_id 
        FOREIGN KEY (user_id) REFERENCES "user".users(id) ON DELETE CASCADE,
        
    -- Unique constraints for Telegram data
    CONSTRAINT uq_telegram_subscriptions_user_id UNIQUE (user_id),
    CONSTRAINT uq_telegram_subscriptions_chat_id UNIQUE (telegram_chat_id),
    CONSTRAINT uq_telegram_subscriptions_user_id_telegram UNIQUE (telegram_user_id)
);

COMMENT ON TABLE telegram_subscriptions IS 'Telegram bot subscriptions linking users to their Telegram accounts';
COMMENT ON COLUMN telegram_subscriptions.telegram_username IS 'Telegram username without @ symbol (optional)';
COMMENT ON COLUMN telegram_subscriptions.telegram_chat_id IS 'Telegram chat ID for sending messages via bot';
COMMENT ON COLUMN telegram_subscriptions.telegram_user_id IS 'Telegram user ID for identification';
COMMENT ON COLUMN telegram_subscriptions.verified_at IS 'Timestamp when Telegram account was verified and linked';
COMMENT ON COLUMN telegram_subscriptions.link_code IS 'Temporary verification code for account linking';
COMMENT ON COLUMN telegram_subscriptions.is_active IS 'Whether the subscription is active and can receive messages';

-- Outbox pattern for reliable message delivery
-- Stores notifications to be sent with delivery status tracking
CREATE TABLE outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL, -- Same categories as notification_prefs
    channel VARCHAR(20) NOT NULL, -- EMAIL, SMS, TELEGRAM, PUSH
    payload JSONB NOT NULL, -- Message content and metadata
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED, SKIPPED
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    last_error TEXT, -- Error message from last failed attempt
    scheduled_at TIMESTAMP WITH TIME ZONE, -- When to send (for delayed notifications)
    sent_at TIMESTAMP WITH TIME ZONE, -- When successfully sent
    expires_at TIMESTAMP WITH TIME ZONE, -- When to give up sending
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to user.users (cross-schema reference)
    CONSTRAINT fk_outbox_user_id 
        FOREIGN KEY (user_id) REFERENCES "user".users(id) ON DELETE CASCADE,
        
    -- Check constraints for valid values
    CONSTRAINT chk_outbox_status 
        CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'SKIPPED')),
    CONSTRAINT chk_outbox_category 
        CHECK (category IN ('BOOKING_CONFIRMED', 'PAYMENT_STATUS', 'EVENT_REMINDER', 'WAITLIST_AVAILABLE', 'EVENT_NEWS')),
    CONSTRAINT chk_outbox_channel 
        CHECK (channel IN ('EMAIL', 'SMS', 'TELEGRAM', 'PUSH')),
    CONSTRAINT chk_outbox_attempts 
        CHECK (attempts >= 0 AND attempts <= max_attempts)
);

COMMENT ON TABLE outbox IS 'Outbox pattern for reliable notification delivery with retry logic';
COMMENT ON COLUMN outbox.category IS 'Notification category matching notification_prefs';
COMMENT ON COLUMN outbox.channel IS 'Delivery channel matching notification_prefs';
COMMENT ON COLUMN outbox.payload IS 'JSON message content including title, body, metadata, etc.';
COMMENT ON COLUMN outbox.status IS 'Delivery status: PENDING, SENT, FAILED, SKIPPED';
COMMENT ON COLUMN outbox.attempts IS 'Number of delivery attempts made';
COMMENT ON COLUMN outbox.scheduled_at IS 'When to send notification (for delayed delivery)';
COMMENT ON COLUMN outbox.expires_at IS 'When to give up delivery attempts';