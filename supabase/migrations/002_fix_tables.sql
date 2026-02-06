-- =============================================
-- DJ Bazuri Database Schema - CLEAN INSTALL
-- Dit script verwijdert oude tabellen en maakt ze opnieuw
-- =============================================

-- STAP 1: Verwijder oude tabellen (in juiste volgorde vanwege foreign keys)
DROP TABLE IF EXISTS public.playlist_tracks CASCADE;
DROP TABLE IF EXISTS public.playlists CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.links CASCADE;
DROP TABLE IF EXISTS public.pricing CASCADE;
DROP TABLE IF EXISTS public.gallery CASCADE;

-- =============================================
-- TABELLEN AANMAKEN
-- =============================================

-- 1. LINKS TABLE (voor Linktree)
CREATE TABLE public.links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  "order" INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. BOOKINGS TABLE
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  package_type TEXT DEFAULT 'basic',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT DEFAULT '',
  client_name TEXT,
  client_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. PLAYLISTS TABLE
CREATE TABLE public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  spotify_playlist_id TEXT,
  name TEXT DEFAULT 'Nieuwe Playlist',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. PLAYLIST_TRACKS TABLE
CREATE TABLE public.playlist_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  spotify_track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_image_url TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('must_have', 'normal', 'blacklist')),
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. CHATS TABLE
CREATE TABLE public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. PRICING TABLE (met NL/EN ondersteuning)
CREATE TABLE public.pricing (
  id TEXT PRIMARY KEY,
  name_nl TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration TEXT NOT NULL,
  features_nl TEXT[] DEFAULT '{}',
  features_en TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. GALLERY TABLE
CREATE TABLE public.gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  alt TEXT,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
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

-- LINKS
CREATE POLICY "Public can view visible links" ON public.links
  FOR SELECT USING (visible = true);
CREATE POLICY "Service role full access to links" ON public.links
  FOR ALL USING (auth.role() = 'service_role');

-- BOOKINGS
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access to bookings" ON public.bookings
  FOR ALL USING (auth.role() = 'service_role');

-- PLAYLISTS
CREATE POLICY "Users can view own playlists" ON public.playlists
  FOR SELECT USING (
    booking_id IN (SELECT id FROM public.bookings WHERE user_id = auth.uid())
  );
CREATE POLICY "Service role full access to playlists" ON public.playlists
  FOR ALL USING (auth.role() = 'service_role');

-- PLAYLIST_TRACKS
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

-- CHATS
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

-- PRICING
CREATE POLICY "Public can view visible pricing" ON public.pricing
  FOR SELECT USING (visible = true);
CREATE POLICY "Service role full access to pricing" ON public.pricing
  FOR ALL USING (auth.role() = 'service_role');

-- GALLERY
CREATE POLICY "Public can view visible gallery" ON public.gallery
  FOR SELECT USING (visible = true);
CREATE POLICY "Service role full access to gallery" ON public.gallery
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_event_date ON public.bookings(event_date);
CREATE INDEX idx_playlists_booking_id ON public.playlists(booking_id);
CREATE INDEX idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE INDEX idx_chats_booking_id ON public.chats(booking_id);
CREATE INDEX idx_links_order ON public.links("order");
CREATE INDEX idx_pricing_sort_order ON public.pricing(sort_order);
CREATE INDEX idx_gallery_sort_order ON public.gallery(sort_order);

-- =============================================
-- DEFAULT PRICING DATA
-- =============================================

INSERT INTO public.pricing (id, name_nl, name_en, price, duration, features_nl, features_en, sort_order) VALUES
  ('basic', 'Basis', 'Basic', 350, '4 uur',
   ARRAY['Professionele DJ apparatuur', 'Muziek naar keuze', 'Basis verlichting', 'Spotify playlist integratie'],
   ARRAY['Professional DJ equipment', 'Music of your choice', 'Basic lighting', 'Spotify playlist integration'], 1),
  ('premium', 'Premium', 'Premium', 550, '6 uur',
   ARRAY['Alles van Basis pakket', 'Geavanceerde verlichting', 'Rookmachine', 'Microfoon', 'Extra tijd'],
   ARRAY['Everything from Basic', 'Advanced lighting', 'Smoke machine', 'Microphone', 'Extra time'], 2),
  ('deluxe', 'Deluxe', 'Deluxe', 750, '8 uur',
   ARRAY['Alles van Premium pakket', 'Complete licht/geluid', 'DJ booth decoratie', 'Speciale effecten'],
   ARRAY['Everything from Premium', 'Complete light/sound', 'DJ booth decoration', 'Special effects'], 3)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- DONE!
-- =============================================
