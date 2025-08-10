-- Audit log
CREATE TABLE IF NOT EXISTS "user".audit_log (
    id              UUID            PRIMARY KEY,
    actor_user_id   UUID,
    action          VARCHAR(64)     NOT NULL,
    target_type     VARCHAR(64)     NOT NULL,
    target_id       UUID,
    payload         JSONB,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_audit_actor ON "user".audit_log (actor_user_id);
CREATE INDEX IF NOT EXISTS ix_audit_target ON "user".audit_log (target_type, target_id);


