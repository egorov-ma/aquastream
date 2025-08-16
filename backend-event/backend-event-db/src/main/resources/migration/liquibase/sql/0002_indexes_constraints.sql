-- Indexes for organizers
CREATE INDEX IF NOT EXISTS ix_organizers_slug ON "event".organizers (slug);

-- Indexes for events (optimized for filtering and main page queries)
CREATE INDEX IF NOT EXISTS ix_events_organizer ON "event".events (organizer_id);
CREATE INDEX IF NOT EXISTS ix_events_status ON "event".events (status);
CREATE INDEX IF NOT EXISTS ix_events_type ON "event".events (type);
CREATE INDEX IF NOT EXISTS ix_events_date_start ON "event".events (date_start);
CREATE INDEX IF NOT EXISTS ix_events_date_end ON "event".events (date_end);
CREATE INDEX IF NOT EXISTS ix_events_price ON "event".events (price);
CREATE INDEX IF NOT EXISTS ix_events_available ON "event".events (available);

-- Composite indexes for common filtering scenarios
CREATE INDEX IF NOT EXISTS ix_events_status_date ON "event".events (status, date_start) WHERE status = 'PUBLISHED';
CREATE INDEX IF NOT EXISTS ix_events_type_date ON "event".events (type, date_start) WHERE status = 'PUBLISHED';
CREATE INDEX IF NOT EXISTS ix_events_price_date ON "event".events (price, date_start) WHERE status = 'PUBLISHED' AND price IS NOT NULL;

-- GIN index for tags array searching
CREATE INDEX IF NOT EXISTS ix_events_tags ON "event".events USING GIN (tags);

-- Full-text search index for event titles
CREATE INDEX IF NOT EXISTS ix_events_title_fts ON "event".events USING GIN (to_tsvector('russian', title));

-- Indexes for team members
CREATE INDEX IF NOT EXISTS ix_team_members_organizer ON "event".team_members (organizer_id);
CREATE INDEX IF NOT EXISTS ix_team_members_sort ON "event".team_members (organizer_id, sort_order);

-- Indexes for FAQ items
CREATE INDEX IF NOT EXISTS ix_faq_items_organizer ON "event".faq_items (organizer_id);
CREATE INDEX IF NOT EXISTS ix_faq_items_sort ON "event".faq_items (organizer_id, sort_order);

-- Indexes for favorites
CREATE INDEX IF NOT EXISTS ix_favorites_user ON "event".favorites (user_id);
CREATE INDEX IF NOT EXISTS ix_favorites_event ON "event".favorites (event_id);

-- Indexes for waitlist
CREATE INDEX IF NOT EXISTS ix_waitlist_event ON "event".waitlist (event_id);
CREATE INDEX IF NOT EXISTS ix_waitlist_user ON "event".waitlist (user_id);
CREATE INDEX IF NOT EXISTS ix_waitlist_priority ON "event".waitlist (event_id, priority);
CREATE INDEX IF NOT EXISTS ix_waitlist_notified ON "event".waitlist (notified_at) WHERE notified_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_waitlist_expires ON "event".waitlist (notification_expires_at) WHERE notification_expires_at IS NOT NULL;

-- Partial indexes for performance optimization
CREATE INDEX IF NOT EXISTS ix_events_upcoming ON "event".events (date_start) 
    WHERE status = 'PUBLISHED' AND date_start > NOW();

CREATE INDEX IF NOT EXISTS ix_events_active_with_spots ON "event".events (date_start) 
    WHERE status = 'PUBLISHED' AND available > 0 AND date_start > NOW();

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizers_updated_at
    BEFORE UPDATE ON "event".organizers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON "event".events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_items_updated_at
    BEFORE UPDATE ON "event".faq_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON SCHEMA "event" IS 'Schema for events, organizers, and related data';
COMMENT ON TABLE "event".organizers IS 'Event organizer companies/individuals';
COMMENT ON TABLE "event".events IS 'Events and activities organized by organizers';
COMMENT ON TABLE "event".team_members IS 'Team members displayed on organizer pages';
COMMENT ON TABLE "event".faq_items IS 'FAQ items for organizer pages';
COMMENT ON TABLE "event".favorites IS 'User favorite events';
COMMENT ON TABLE "event".waitlist IS 'Waitlist for fully booked events (FIFO)';

COMMENT ON COLUMN "event".events.tags IS 'Array of tags for filtering (outdoor, adventure, family, etc.)';
COMMENT ON COLUMN "event".events.location IS 'JSON with address, coordinates, venue details';
COMMENT ON COLUMN "event".events.contacts IS 'JSON with phone, email, telegram, website';
COMMENT ON COLUMN "event".waitlist.priority IS 'FIFO priority (lower number = higher priority)';
COMMENT ON COLUMN "event".waitlist.notification_expires_at IS '30-minute window to confirm spot after notification';