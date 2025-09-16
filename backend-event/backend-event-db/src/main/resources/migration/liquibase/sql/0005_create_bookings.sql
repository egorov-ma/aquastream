-- Create bookings and booking_logs tables
-- Migration: 0005_create_bookings.sql
-- Author: Claude Code
-- Date: 2025-08-18

-- Bookings table (main booking records)
CREATE TABLE IF NOT EXISTS "event".bookings (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id            UUID            NOT NULL REFERENCES "event".events(id) ON DELETE CASCADE,
    user_id             UUID            NOT NULL,     -- References user.users(id) but no FK constraint (cross-schema)
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',  -- PENDING, CONFIRMED, COMPLETED, EXPIRED, CANCELLED, NO_SHOW
    amount              DECIMAL(10,2),                               -- Price at time of booking (may differ from current event price)
    payment_status      VARCHAR(20)     DEFAULT 'NOT_REQUIRED',     -- NOT_REQUIRED, PENDING, SUBMITTED, SUCCEEDED, REJECTED, CANCELED
    payment_id          UUID,                                        -- References payment.payments(id) but no FK constraint (cross-schema)
    expires_at          TIMESTAMPTZ,                                 -- When PENDING booking expires (30 min from creation)
    created_by          UUID,                                        -- Who created the booking (for admin bookings)
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    
    -- Business constraints
    CONSTRAINT bookings_status_check CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'NO_SHOW')),
    CONSTRAINT bookings_payment_status_check CHECK (payment_status IN ('NOT_REQUIRED', 'PENDING', 'SUBMITTED', 'SUCCEEDED', 'REJECTED', 'CANCELED')),
    CONSTRAINT bookings_amount_check CHECK (amount IS NULL OR amount >= 0),
    CONSTRAINT bookings_expires_check CHECK (status != 'PENDING' OR expires_at IS NOT NULL),
    
    -- One active booking per user per event
    UNIQUE (event_id, user_id)
);

-- Booking logs table (audit trail for all booking changes)
CREATE TABLE IF NOT EXISTS "event".booking_logs (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID            NOT NULL REFERENCES "event".bookings(id) ON DELETE CASCADE,
    action              VARCHAR(50)     NOT NULL,     -- CREATED, STATUS_CHANGED, PAYMENT_UPDATED, EXPIRED, etc.
    old_value           JSONB,                        -- Previous state (for updates)
    new_value           JSONB,                        -- New state
    actor_user_id       UUID,                         -- Who performed the action
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    
    CONSTRAINT booking_logs_action_check CHECK (action IN (
        'CREATED', 'STATUS_CHANGED', 'PAYMENT_UPDATED', 'EXPIRED', 'CANCELLED', 
        'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'AMOUNT_UPDATED'
    ))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON "event".bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON "event".bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON "event".bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_expires_at ON "event".bookings(expires_at) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_bookings_payment_id ON "event".bookings(payment_id) WHERE payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_booking_logs_booking_id ON "event".booking_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_logs_created_at ON "event".booking_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_booking_logs_actor ON "event".booking_logs(actor_user_id);

-- Add comments for documentation
COMMENT ON TABLE "event".bookings IS 'Main booking records for events with status tracking and payment integration';
COMMENT ON TABLE "event".booking_logs IS 'Audit trail for all booking state changes and actions';

COMMENT ON COLUMN "event".bookings.status IS 'Booking lifecycle: PENDING -> CONFIRMED -> COMPLETED (or EXPIRED/CANCELLED)';
COMMENT ON COLUMN "event".bookings.payment_status IS 'Payment state independent of booking status';
COMMENT ON COLUMN "event".bookings.expires_at IS 'PENDING bookings auto-expire after 30 minutes to free up capacity';
COMMENT ON COLUMN "event".bookings.amount IS 'Price locked at booking time, may differ from current event price';

COMMENT ON COLUMN "event".booking_logs.action IS 'Type of action performed on the booking';
COMMENT ON COLUMN "event".booking_logs.old_value IS 'Previous state for tracking changes (JSON format)';
COMMENT ON COLUMN "event".booking_logs.new_value IS 'New state after action (JSON format)';