-- liquibase formatted sql

-- changeset aquastream:create_waitlist_audit_table
-- comment: Create waitlist audit table for T14 task
CREATE TABLE IF NOT EXISTS "event".waitlist_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    priority_before INTEGER,
    priority_after INTEGER,
    total_in_queue BIGINT,
    notification_expires_at TIMESTAMPTZ,
    metadata TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for waitlist audit
CREATE INDEX IF NOT EXISTS ix_waitlist_audit_event ON "event".waitlist_audit (event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_waitlist_audit_user ON "event".waitlist_audit (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_waitlist_audit_action ON "event".waitlist_audit (action, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_waitlist_audit_created ON "event".waitlist_audit (created_at DESC);

-- Comments
COMMENT ON TABLE "event".waitlist_audit IS 'Audit log for waitlist operations';
COMMENT ON COLUMN "event".waitlist_audit.action IS 'Action type: JOINED, LEFT, NOTIFIED, CONFIRMED, EXPIRED, POSITION_CHANGED';
COMMENT ON COLUMN "event".waitlist_audit.metadata IS 'Additional context in JSON format';