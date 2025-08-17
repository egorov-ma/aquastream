-- liquibase formatted sql

-- changeset aquastream:create_crew_schema
-- comment: Create crew schema and tables for T15 task

-- Create crew schema
CREATE SCHEMA IF NOT EXISTS "crew";

-- changeset aquastream:create_crews_table
-- comment: Main crews table for groups/boats/tents/tables/buses
CREATE TABLE IF NOT EXISTS "crew".crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CREW', 'TENT', 'TABLE', 'BUS')),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    current_size INTEGER NOT NULL DEFAULT 0 CHECK (current_size >= 0),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- changeset aquastream:create_crew_assignments_table
-- comment: Assignment of users to crews with seat/position tracking
CREATE TABLE IF NOT EXISTS "crew".crew_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID NOT NULL REFERENCES "crew".crews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    booking_id UUID NOT NULL,
    seat_number INTEGER,
    position VARCHAR(50),
    assigned_by UUID NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unassigned_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REMOVED', 'TRANSFERRED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- changeset aquastream:create_team_preferences_table  
-- comment: User preferences for being assigned with or avoiding certain people
CREATE TABLE IF NOT EXISTS "crew".team_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_id UUID NOT NULL,
    prefers_with_user_ids UUID[] DEFAULT '{}',
    avoids_user_ids UUID[] DEFAULT '{}',
    preferred_crew_types VARCHAR(20)[] DEFAULT '{}',
    preferred_positions VARCHAR(50)[] DEFAULT '{}',
    special_requirements TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- changeset aquastream:create_boats_table
-- comment: Specific boat information for CREW type groups
CREATE TABLE IF NOT EXISTS "crew".boats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID NOT NULL REFERENCES "crew".crews(id) ON DELETE CASCADE,
    boat_number VARCHAR(20),
    boat_type VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year_manufactured INTEGER,
    length_meters DECIMAL(4,2),
    max_weight_kg INTEGER,
    condition VARCHAR(20) DEFAULT 'GOOD' CHECK (condition IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR')),
    equipment JSONB DEFAULT '{}',
    maintenance_notes TEXT,
    last_inspection TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- changeset aquastream:create_tents_table
-- comment: Specific tent information for TENT type groups
CREATE TABLE IF NOT EXISTS "crew".tents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID NOT NULL REFERENCES "crew".crews(id) ON DELETE CASCADE,
    tent_number VARCHAR(20),
    tent_type VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    capacity_persons INTEGER NOT NULL CHECK (capacity_persons > 0),
    season_rating VARCHAR(20) CHECK (season_rating IN ('1_SEASON', '2_SEASON', '3_SEASON', '4_SEASON')),
    waterproof_rating INTEGER,
    setup_difficulty VARCHAR(20) DEFAULT 'MEDIUM' CHECK (setup_difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    weight_kg DECIMAL(5,2),
    packed_size_cm VARCHAR(50),
    condition VARCHAR(20) DEFAULT 'GOOD' CHECK (condition IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR')),
    equipment JSONB DEFAULT '{}',
    maintenance_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);