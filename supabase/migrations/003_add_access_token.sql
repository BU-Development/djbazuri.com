-- =============================================
-- Migratie: Access token voor magic links
-- Voer dit uit in de Supabase SQL Editor
-- =============================================

-- Voeg access_token toe aan bookings (voor magic links zonder inloggen)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS access_token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Genereer tokens voor bestaande boekingen die nog geen token hebben
UPDATE public.bookings
  SET access_token = gen_random_uuid()
  WHERE access_token IS NULL;

-- Maak user_id nullable in chats (voor berichten via magic link)
ALTER TABLE public.chats
  ALTER COLUMN user_id DROP NOT NULL;

-- Index voor snelle token lookup
CREATE INDEX IF NOT EXISTS idx_bookings_access_token ON public.bookings(access_token);
