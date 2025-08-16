-- liquibase formatted sql

-- changeset aquastream:add_event_description
-- comment: Add description column to events table for T13 task
ALTER TABLE event.events 
ADD COLUMN description TEXT;