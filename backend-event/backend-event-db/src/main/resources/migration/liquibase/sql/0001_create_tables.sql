-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS "event";

-- Organizers table
CREATE TABLE IF NOT EXISTS "event".organizers (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(100)    NOT NULL UNIQUE,
    name            VARCHAR(255)    NOT NULL,
    logo_url        VARCHAR(500),
    description     TEXT,
    contacts        JSONB,
    brand_color     VARCHAR(7),     -- HEX color format #RRGGBB
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Events table  
CREATE TABLE IF NOT EXISTS "event".events (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id    UUID            NOT NULL REFERENCES "event".organizers(id) ON DELETE CASCADE,
    type            VARCHAR(50)     NOT NULL,     -- RAFTING, HIKING, BANQUET, etc.
    title           VARCHAR(500)    NOT NULL,
    date_start      TIMESTAMPTZ     NOT NULL,
    date_end        TIMESTAMPTZ     NOT NULL,
    location        JSONB           NOT NULL,     -- {address, coordinates, venue}
    price           DECIMAL(10,2),                -- NULL for free events
    capacity        INTEGER         NOT NULL CHECK (capacity > 0),
    available       INTEGER         NOT NULL CHECK (available >= 0),
    status          VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',  -- DRAFT, PUBLISHED, CANCELLED, COMPLETED
    tags            TEXT[],                       -- Array of tags for filtering
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    
    CONSTRAINT events_dates_check CHECK (date_end >= date_start),
    CONSTRAINT events_available_check CHECK (available <= capacity)
);

-- Team members table (for organizer pages)
CREATE TABLE IF NOT EXISTS "event".team_members (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id    UUID            NOT NULL REFERENCES "event".organizers(id) ON DELETE CASCADE,
    name            VARCHAR(255)    NOT NULL,
    role            VARCHAR(100)    NOT NULL,     -- Guide, Instructor, Manager, etc.
    photo_url       VARCHAR(500),
    bio             TEXT,
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- FAQ items table (for organizer pages)
CREATE TABLE IF NOT EXISTS "event".faq_items (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id    UUID            NOT NULL REFERENCES "event".organizers(id) ON DELETE CASCADE,
    question        TEXT            NOT NULL,
    answer          TEXT            NOT NULL,
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Favorites table (user favorites)
CREATE TABLE IF NOT EXISTS "event".favorites (
    user_id         UUID            NOT NULL,     -- References user.users(id) but no FK constraint (cross-schema)
    event_id        UUID            NOT NULL REFERENCES "event".events(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (user_id, event_id)
);

-- Waitlist table
CREATE TABLE IF NOT EXISTS "event".waitlist (
    id                          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id                    UUID            NOT NULL REFERENCES "event".events(id) ON DELETE CASCADE,
    user_id                     UUID            NOT NULL,     -- References user.users(id) but no FK constraint (cross-schema)
    priority                    INTEGER         NOT NULL,     -- FIFO order (lower = higher priority)
    notified_at                 TIMESTAMPTZ,                  -- When user was notified about available spot
    notification_expires_at     TIMESTAMPTZ,                  -- 30 min window to confirm
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    
    UNIQUE (event_id, user_id),
    UNIQUE (event_id, priority)
);