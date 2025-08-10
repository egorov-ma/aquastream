-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS "user";

-- Users table
CREATE TABLE IF NOT EXISTS "user".users (
    id              UUID            PRIMARY KEY,
    username        VARCHAR(100)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            VARCHAR(20)     NOT NULL,
    active          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Profiles table (1:1 with users)
CREATE TABLE IF NOT EXISTS "user".profiles (
    user_id                 UUID            PRIMARY KEY REFERENCES "user".users(id) ON DELETE CASCADE,
    phone                   VARCHAR(32),
    telegram                VARCHAR(64),
    is_telegram_verified    BOOLEAN         NOT NULL DEFAULT FALSE,
    extra                   JSONB
);

-- Refresh sessions (rotation by jti)
CREATE TABLE IF NOT EXISTS "user".refresh_sessions (
    jti         VARCHAR(64)    PRIMARY KEY,
    user_id     UUID           NOT NULL REFERENCES "user".users(id) ON DELETE CASCADE,
    issued_at   TIMESTAMPTZ    NOT NULL,
    expires_at  TIMESTAMPTZ    NOT NULL,
    revoked_at  TIMESTAMPTZ
);

-- Recovery codes
CREATE TABLE IF NOT EXISTS "user".recovery_codes (
    user_id     UUID           NOT NULL REFERENCES "user".users(id) ON DELETE CASCADE,
    code_hash   VARCHAR(128)   NOT NULL,
    used_at     TIMESTAMPTZ,
    expires_at  TIMESTAMPTZ    NOT NULL,
    PRIMARY KEY (user_id, code_hash)
);


