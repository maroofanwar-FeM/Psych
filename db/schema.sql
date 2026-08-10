-- CoachConnect database schema
-- Generated from the corrected ERD (User, School, Template, ScheduleEntry, MessageLog).
-- No many-to-many relationships exist in this ERD, so no junction table is needed.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE schools (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    group_id   TEXT UNIQUE, -- WhatsApp group JID, e.g. "1203630...@g.us"; null until connected
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE templates (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title      TEXT NOT NULL,
    occasion   TEXT NOT NULL DEFAULT 'CUSTOM'
        CHECK (occasion IN ('MONDAY_MOTIVATION', 'SESSION_REMINDER', 'THANK_YOU_FOLLOWUP', 'CUSTOM')),
    body       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recurring send rule: "every <day_of_week> at <hour>:<minute>, send <template_id> to <school_id> (or all schools)"
CREATE TABLE schedule_entries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates (id),
    school_id   UUID REFERENCES schools (id) ON DELETE SET NULL, -- null = all schools
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday..6=Saturday
    hour        INTEGER NOT NULL CHECK (hour BETWEEN 0 AND 23),
    minute      INTEGER NOT NULL DEFAULT 0 CHECK (minute BETWEEN 0 AND 59),
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE message_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id    UUID NOT NULL REFERENCES schools (id),
    body         TEXT NOT NULL,
    status       TEXT NOT NULL CHECK (status IN ('SENT', 'FAILED')),
    error        TEXT,
    triggered_by TEXT NOT NULL CHECK (triggered_by IN ('schedule', 'send-now')),
    sent_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_schedule_entries_template_id ON schedule_entries (template_id);
CREATE INDEX idx_schedule_entries_school_id ON schedule_entries (school_id);
CREATE INDEX idx_message_logs_school_id ON message_logs (school_id);
