-- Add client fields to bookings table
-- Run this in your Supabase SQL Editor

-- Add client_name column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS client_name TEXT;

-- Add client_email column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Make user_id nullable (since we create the user later)
ALTER TABLE bookings
ALTER COLUMN user_id DROP NOT NULL;
