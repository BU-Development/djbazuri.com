-- =============================================
-- DJ Bazuri Database Schema
-- Voer dit script uit in Supabase SQL Editor
-- =============================================

-- 1. LINKS TABLE (voor Linktree)
CREATE TABLE IF NOT EXISTS public.links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  "order" INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  package_type TEXT DEFAULT 'basic',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT DEFAULT '',
  client_name TEXT,
  client_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PLAYLISTS TABLE
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  spotify_playlist_id TEXT,
  name TEXT DEFAULT 'Nieuwe Playlist',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PLAYLIST_TRACKS TABLE
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  spotify_track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_image_url TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('must_have', 'normal', 'blacklist')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CHATS TABLE
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PRICING TABLE (voor prijzen pagina)
CREATE TABLE IF NOT EXISTS public.pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  features JSONB DEFAULT '[]'::jsonb,
  "order" INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. GALLERY TABLE (voor foto's)
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  alt TEXT,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- LINKS: Iedereen kan zichtbare links lezen
CREATE POLICY "Public can view visible links" ON public.links
  FOR SELECT USING (visible = true);

CREATE POLICY "Service role full access to links" ON public.links
  FOR ALL USING (auth.role() = 'service_role');

-- BOOKINGS: Gebruikers kunnen hun eigen bookings zien
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to bookings" ON public.bookings
  FOR ALL USING (auth.role() = 'service_role');

-- PLAYLISTS: Gebruikers kunnen playlists van hun bookings zien
CREATE POLICY "Users can view own playlists" ON public.playlists
  FOR SELECT USING (
    booking_id IN (SELECT id FROM public.bookings WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role full access to playlists" ON public.playlists
  FOR ALL USING (auth.role() = 'service_role');

-- PLAYLIST_TRACKS: Gebruikers kunnen tracks van hun playlists zien
CREATE POLICY "Users can view own playlist tracks" ON public.playlist_tracks
  FOR SELECT USING (
    playlist_id IN (
      SELECT p.id FROM public.playlists p
      JOIN public.bookings b ON p.booking_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access to playlist_tracks" ON public.playlist_tracks
  FOR ALL USING (auth.role() = 'service_role');

-- CHATS: Gebruikers kunnen hun eigen chats zien en versturen
CREATE POLICY "Users can view own chats" ON public.chats
  FOR SELECT USING (
    booking_id IN (SELECT id FROM public.bookings WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own chats" ON public.chats
  FOR INSERT WITH CHECK (
    booking_id IN (SELECT id FROM public.bookings WHERE user_id = auth.uid())
    AND auth.uid() = user_id
  );

CREATE POLICY "Service role full access to chats" ON public.chats
  FOR ALL USING (auth.role() = 'service_role');

-- PRICING: Iedereen kan zichtbare prijzen lezen
CREATE POLICY "Public can view visible pricing" ON public.pricing
  FOR SELECT USING (visible = true);

CREATE POLICY "Service role full access to pricing" ON public.pricing
  FOR ALL USING (auth.role() = 'service_role');

-- GALLERY: Iedereen kan zichtbare foto's lezen
CREATE POLICY "Public can view visible gallery" ON public.gallery
  FOR SELECT USING (visible = true);

CREATE POLICY "Service role full access to gallery" ON public.gallery
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- INDEXES voor betere performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON public.bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_playlists_booking_id ON public.playlists(booking_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_chats_booking_id ON public.chats(booking_id);
CREATE INDEX IF NOT EXISTS idx_links_order ON public.links("order");
CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON public.gallery(sort_order);

-- =============================================
-- STORAGE BUCKET voor gallery uploads
-- =============================================

-- Maak gallery bucket aan (voer dit apart uit als het niet werkt)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies voor gallery bucket
CREATE POLICY "Public can view gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Service role can upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'service_role');

CREATE POLICY "Service role can delete gallery images" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'service_role');

-- =============================================
-- DONE! Database is ready
-- =============================================
