--liquibase formatted sql

--changeset aquastream:media-001-create-schema
--comment: Create media schema and files table

-- Create schema
CREATE SCHEMA IF NOT EXISTS media;

-- Create files table for media objects tracking
CREATE TABLE media.files (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Object identification
    key VARCHAR(255) NOT NULL UNIQUE,
    
    -- Owner information
    owner_type VARCHAR(50) NOT NULL,  -- e.g., 'user', 'event', 'organizer', 'profile'
    owner_id UUID NOT NULL,
    
    -- File metadata
    checksum VARCHAR(64) NOT NULL,    -- SHA-256 hash for integrity
    content_type VARCHAR(255) NOT NULL,
    size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
    
    -- Optional metadata
    original_filename VARCHAR(500),
    upload_session_id UUID,          -- For tracking upload sessions
    
    -- Status and lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'UPLOADED',  -- UPLOADING, UPLOADED, PROCESSING, READY, DELETED
    visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE', -- PRIVATE, PUBLIC, UNLISTED
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,          -- For temporary files
    
    -- Audit information
    uploaded_by UUID,                -- User who uploaded the file
    uploaded_from_ip INET            -- IP address of uploader
);

-- Add constraints
ALTER TABLE media.files ADD CONSTRAINT files_key_format 
    CHECK (key ~ '^[a-zA-Z0-9/_.-]+$' AND length(key) >= 3);

ALTER TABLE media.files ADD CONSTRAINT files_checksum_format
    CHECK (checksum ~ '^[a-f0-9]{64}$');

ALTER TABLE media.files ADD CONSTRAINT files_content_type_format
    CHECK (content_type ~ '^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$');

-- Add comments
COMMENT ON SCHEMA media IS 'Media files management schema';
COMMENT ON TABLE media.files IS 'Central registry of all media files in the system';
COMMENT ON COLUMN media.files.key IS 'Unique object key/path in storage system';
COMMENT ON COLUMN media.files.owner_type IS 'Type of entity that owns this file';
COMMENT ON COLUMN media.files.owner_id IS 'ID of the owning entity';
COMMENT ON COLUMN media.files.checksum IS 'SHA-256 hash for file integrity verification';
COMMENT ON COLUMN media.files.size_bytes IS 'File size in bytes';
COMMENT ON COLUMN media.files.upload_session_id IS 'Session ID for tracking multi-part uploads';
COMMENT ON COLUMN media.files.status IS 'Current processing status of the file';
COMMENT ON COLUMN media.files.visibility IS 'Access level for the file';
COMMENT ON COLUMN media.files.expires_at IS 'Expiration time for temporary files';