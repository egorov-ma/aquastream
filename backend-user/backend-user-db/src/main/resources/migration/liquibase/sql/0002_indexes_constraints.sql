-- Unique and search indexes
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username ON "user".users (LOWER(username));

CREATE INDEX IF NOT EXISTS ix_profiles_phone ON "user".profiles (phone);
CREATE INDEX IF NOT EXISTS ix_profiles_telegram ON "user".profiles (LOWER(telegram));

CREATE INDEX IF NOT EXISTS ix_refresh_user ON "user".refresh_sessions (user_id);
CREATE INDEX IF NOT EXISTS ix_refresh_expires ON "user".refresh_sessions (expires_at);


