-- Migration: Add check_ins table for digital check-in
-- Run this once against your Neon / PostgreSQL database

CREATE TABLE IF NOT EXISTS check_ins (
    id              SERIAL PRIMARY KEY,
    booking_id      INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    nationality     VARCHAR(100) NOT NULL DEFAULT '',
    id_type         VARCHAR(50)  NOT NULL DEFAULT 'passport'
                        CHECK (id_type IN ('passport', 'national_id', 'driver_license', 'other')),
    id_number       VARCHAR(100) NOT NULL DEFAULT '',
    phone           VARCHAR(50)  NOT NULL DEFAULT '',
    signature_data  TEXT         NOT NULL DEFAULT '',   -- base64 PNG จาก canvas (~30KB)
    photo_data      TEXT         NOT NULL DEFAULT '',   -- base64 JPEG ย่อแล้ว (~80-150KB)
    checked_in_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT check_ins_booking_unique UNIQUE (booking_id)   -- 1 check-in per booking
);

CREATE INDEX IF NOT EXISTS idx_check_ins_booking_id ON check_ins (booking_id);
