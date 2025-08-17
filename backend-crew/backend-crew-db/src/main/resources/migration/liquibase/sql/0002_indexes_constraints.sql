-- liquibase formatted sql

-- changeset aquastream:create_crew_indexes
-- comment: Indexes and constraints for crew tables

-- Primary indexes for crews table
CREATE INDEX IF NOT EXISTS ix_crews_event ON "crew".crews (event_id);
CREATE INDEX IF NOT EXISTS ix_crews_type ON "crew".crews (type);
CREATE INDEX IF NOT EXISTS ix_crews_event_type ON "crew".crews (event_id, type);
CREATE INDEX IF NOT EXISTS ix_crews_capacity ON "crew".crews (capacity, current_size);

-- Unique constraints for crews
CREATE UNIQUE INDEX IF NOT EXISTS uq_crews_event_name ON "crew".crews (event_id, name);

-- Primary indexes for crew_assignments table
CREATE INDEX IF NOT EXISTS ix_crew_assignments_crew ON "crew".crew_assignments (crew_id);
CREATE INDEX IF NOT EXISTS ix_crew_assignments_user ON "crew".crew_assignments (user_id);
CREATE INDEX IF NOT EXISTS ix_crew_assignments_booking ON "crew".crew_assignments (booking_id);
CREATE INDEX IF NOT EXISTS ix_crew_assignments_assigned_by ON "crew".crew_assignments (assigned_by);
CREATE INDEX IF NOT EXISTS ix_crew_assignments_status ON "crew".crew_assignments (status);
CREATE INDEX IF NOT EXISTS ix_crew_assignments_active ON "crew".crew_assignments (crew_id, status) WHERE status = 'ACTIVE';

-- Unique constraints for crew_assignments (prevent double assignment)
CREATE UNIQUE INDEX IF NOT EXISTS uq_crew_assignments_user_event_active 
ON "crew".crew_assignments (user_id, crew_id) 
WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX IF NOT EXISTS uq_crew_assignments_booking_active 
ON "crew".crew_assignments (booking_id) 
WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX IF NOT EXISTS uq_crew_assignments_seat_active 
ON "crew".crew_assignments (crew_id, seat_number) 
WHERE seat_number IS NOT NULL AND status = 'ACTIVE';

-- Primary indexes for team_preferences table
CREATE INDEX IF NOT EXISTS ix_team_preferences_user ON "crew".team_preferences (user_id);
CREATE INDEX IF NOT EXISTS ix_team_preferences_event ON "crew".team_preferences (event_id);
CREATE INDEX IF NOT EXISTS ix_team_preferences_user_event ON "crew".team_preferences (user_id, event_id);

-- GIN indexes for array columns
CREATE INDEX IF NOT EXISTS ix_team_preferences_prefers_gin ON "crew".team_preferences USING GIN (prefers_with_user_ids);
CREATE INDEX IF NOT EXISTS ix_team_preferences_avoids_gin ON "crew".team_preferences USING GIN (avoids_user_ids);
CREATE INDEX IF NOT EXISTS ix_team_preferences_crew_types_gin ON "crew".team_preferences USING GIN (preferred_crew_types);

-- Unique constraint for team_preferences (one per user per event)
CREATE UNIQUE INDEX IF NOT EXISTS uq_team_preferences_user_event ON "crew".team_preferences (user_id, event_id);

-- Primary indexes for boats table
CREATE INDEX IF NOT EXISTS ix_boats_crew ON "crew".boats (crew_id);
CREATE INDEX IF NOT EXISTS ix_boats_type ON "crew".boats (boat_type);
CREATE INDEX IF NOT EXISTS ix_boats_condition ON "crew".boats (condition);
CREATE INDEX IF NOT EXISTS ix_boats_number ON "crew".boats (boat_number) WHERE boat_number IS NOT NULL;

-- Unique constraint for boats (one boat per crew)
CREATE UNIQUE INDEX IF NOT EXISTS uq_boats_crew ON "crew".boats (crew_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_boats_number ON "crew".boats (boat_number) WHERE boat_number IS NOT NULL;

-- Primary indexes for tents table
CREATE INDEX IF NOT EXISTS ix_tents_crew ON "crew".tents (crew_id);
CREATE INDEX IF NOT EXISTS ix_tents_type ON "crew".tents (tent_type);
CREATE INDEX IF NOT EXISTS ix_tents_condition ON "crew".tents (condition);
CREATE INDEX IF NOT EXISTS ix_tents_capacity ON "crew".tents (capacity_persons);
CREATE INDEX IF NOT EXISTS ix_tents_number ON "crew".tents (tent_number) WHERE tent_number IS NOT NULL;

-- Unique constraint for tents (one tent per crew)
CREATE UNIQUE INDEX IF NOT EXISTS uq_tents_crew ON "crew".tents (crew_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tents_number ON "crew".tents (tent_number) WHERE tent_number IS NOT NULL;

-- Triggers for updating current_size in crews table
CREATE OR REPLACE FUNCTION update_crew_current_size()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'ACTIVE' THEN
        UPDATE "crew".crews 
        SET current_size = current_size + 1, updated_at = NOW()
        WHERE id = NEW.crew_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'ACTIVE' AND NEW.status != 'ACTIVE' THEN
            UPDATE "crew".crews 
            SET current_size = current_size - 1, updated_at = NOW()
            WHERE id = OLD.crew_id;
        ELSIF OLD.status != 'ACTIVE' AND NEW.status = 'ACTIVE' THEN
            UPDATE "crew".crews 
            SET current_size = current_size + 1, updated_at = NOW()
            WHERE id = NEW.crew_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACTIVE' THEN
        UPDATE "crew".crews 
        SET current_size = current_size - 1, updated_at = NOW()
        WHERE id = OLD.crew_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_crew_assignments_update_size
    AFTER INSERT OR UPDATE OR DELETE ON "crew".crew_assignments
    FOR EACH ROW EXECUTE FUNCTION update_crew_current_size();

-- Function to validate capacity constraints
CREATE OR REPLACE FUNCTION validate_crew_capacity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ACTIVE' THEN
        IF (SELECT current_size FROM "crew".crews WHERE id = NEW.crew_id) >= 
           (SELECT capacity FROM "crew".crews WHERE id = NEW.crew_id) THEN
            RAISE EXCEPTION 'Crew capacity exceeded. Cannot assign more members.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_crew_assignments_validate_capacity
    BEFORE INSERT OR UPDATE ON "crew".crew_assignments
    FOR EACH ROW EXECUTE FUNCTION validate_crew_capacity();

-- Comments for documentation
COMMENT ON SCHEMA "crew" IS 'Crew management: groups, boats, tents, assignments and preferences';

COMMENT ON TABLE "crew".crews IS 'Main crews/groups table (boats, tents, tables, buses)';
COMMENT ON COLUMN "crew".crews.type IS 'Type: CREW (boat), TENT, TABLE (banquet), BUS (transport)';
COMMENT ON COLUMN "crew".crews.current_size IS 'Current number of assigned members (auto-updated by trigger)';
COMMENT ON COLUMN "crew".crews.metadata IS 'Additional flexible data in JSON format';

COMMENT ON TABLE "crew".crew_assignments IS 'Assignment of users to crews with position tracking';
COMMENT ON COLUMN "crew".crew_assignments.seat_number IS 'Seat/position number within crew (nullable)';
COMMENT ON COLUMN "crew".crew_assignments.position IS 'Role/position within crew (e.g., captain, navigator)';
COMMENT ON COLUMN "crew".crew_assignments.status IS 'ACTIVE, REMOVED, TRANSFERRED';

COMMENT ON TABLE "crew".team_preferences IS 'User preferences for crew assignment';
COMMENT ON COLUMN "crew".team_preferences.prefers_with_user_ids IS 'Array of user IDs they want to be with';
COMMENT ON COLUMN "crew".team_preferences.avoids_user_ids IS 'Array of user IDs they want to avoid';

COMMENT ON TABLE "crew".boats IS 'Specific boat information for CREW type groups';
COMMENT ON COLUMN "crew".boats.equipment IS 'Equipment list in JSON format';

COMMENT ON TABLE "crew".tents IS 'Specific tent information for TENT type groups';
COMMENT ON COLUMN "crew".tents.season_rating IS 'Tent season rating: 1_SEASON to 4_SEASON';
COMMENT ON COLUMN "crew".tents.equipment IS 'Equipment list in JSON format';