--liquibase formatted sql

--changeset aquastream:media-002-indexes-constraints
--comment: Create indexes and additional constraints for media files

-- Primary indexes for file access patterns
CREATE INDEX ix_files_key ON media.files (key);
CREATE INDEX ix_files_owner ON media.files (owner_type, owner_id);
CREATE INDEX ix_files_checksum ON media.files (checksum);

-- Indexes for queries by status and visibility
CREATE INDEX ix_files_status ON media.files (status);
CREATE INDEX ix_files_visibility ON media.files (visibility);

-- Indexes for time-based queries
CREATE INDEX ix_files_created_at ON media.files (created_at);
CREATE INDEX ix_files_expires_at ON media.files (expires_at) WHERE expires_at IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX ix_files_owner_status ON media.files (owner_type, owner_id, status);
CREATE INDEX ix_files_owner_visibility ON media.files (owner_type, owner_id, visibility);
CREATE INDEX ix_files_status_expires ON media.files (status, expires_at) WHERE expires_at IS NOT NULL;

-- Index for upload session tracking
CREATE INDEX ix_files_upload_session ON media.files (upload_session_id) WHERE upload_session_id IS NOT NULL;

-- Index for cleanup operations
CREATE INDEX ix_files_cleanup ON media.files (status, expires_at, created_at) 
    WHERE status IN ('UPLOADING', 'PROCESSING') OR expires_at IS NOT NULL;

-- Partial indexes for better performance
CREATE INDEX ix_files_active ON media.files (owner_type, owner_id, created_at DESC) 
    WHERE status IN ('UPLOADED', 'READY') AND visibility != 'DELETED';

-- Index for size analytics
CREATE INDEX ix_files_size_stats ON media.files (owner_type, size_bytes, created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION media.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER tr_files_update_updated_at 
    BEFORE UPDATE ON media.files 
    FOR EACH ROW 
    EXECUTE FUNCTION media.update_updated_at_column();

-- Function for automatic cleanup of expired files
CREATE OR REPLACE FUNCTION media.cleanup_expired_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Mark expired files as deleted
    UPDATE media.files 
    SET status = 'DELETED', 
        updated_at = CURRENT_TIMESTAMP
    WHERE expires_at IS NOT NULL 
      AND expires_at < CURRENT_TIMESTAMP 
      AND status != 'DELETED';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup operation
    INSERT INTO media.cleanup_log (cleaned_at, files_deleted)
    VALUES (CURRENT_TIMESTAMP, deleted_count);
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create cleanup log table
CREATE TABLE media.cleanup_log (
    id SERIAL PRIMARY KEY,
    cleaned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    files_deleted INTEGER NOT NULL DEFAULT 0
);

-- Add comment
COMMENT ON FUNCTION media.cleanup_expired_files() IS 'Cleanup function for expired media files';
COMMENT ON TABLE media.cleanup_log IS 'Log of automatic cleanup operations';