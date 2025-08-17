--liquibase formatted sql

--changeset aquastream:payment-0001-create-schema
--comment: Create payment schema

CREATE SCHEMA IF NOT EXISTS payment;

--rollback DROP SCHEMA IF EXISTS payment CASCADE;