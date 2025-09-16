-- Schema creation for notification service
-- PostgreSQL schema-per-service approach

CREATE SCHEMA IF NOT EXISTS notification;

-- Set search_path for this schema
SET search_path TO notification, public;

COMMENT ON SCHEMA notification IS 'Notification service: user preferences, Telegram subscriptions, and outbox for message delivery';