-- DJ Bazuri Supabase Setup Script
-- Voer dit uit in de Supabase SQL Editor (https://supabase.com/dashboard)

-- 1. CHATS TABEL (voor klant-DJ communicatie)
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) voor chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Gebruikers kunnen hun eigen chats zien
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id OR booking_id = auth.uid()::text);

-- Gebruikers kunnen berichten sturen
CREATE POLICY "Users can insert chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins kunnen alle chats zien en bewerken (via service role)


-- 2. PRICING TABEL (voor prijzen beheer)
CREATE TABLE IF NOT EXISTS pricing (
  id TEXT PRIMARY KEY,
  name_nl TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration TEXT NOT NULL,
  features_nl TEXT[] NOT NULL DEFAULT '{}',
  features_en TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS voor pricing
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Iedereen kan prijzen lezen
CREATE POLICY "Anyone can view pricing" ON pricing
  FOR SELECT USING (visible = true);

-- Insert default pricing packages
INSERT INTO pricing (id, name_nl, name_en, price, duration, features_nl, features_en, sort_order) VALUES
  ('basic', 'Basis', 'Basic', 350, '4 uur',
   ARRAY['Professionele DJ apparatuur', 'Muziek naar keuze', 'Basis verlichting', 'Spotify playlist integratie'],
   ARRAY['Professional DJ equipment', 'Music of your choice', 'Basic lighting', 'Spotify playlist integration'],
   1),
  ('premium', 'Premium', 'Premium', 550, '6 uur',
   ARRAY['Alles van Basis pakket', 'Geavanceerde verlichting', 'Rookmachine', 'Microfoon voor aankondigingen', 'Extra optreden tijd'],
   ARRAY['Everything from Basic package', 'Advanced lighting', 'Smoke machine', 'Microphone for announcements', 'Extra performance time'],
   2),
  ('deluxe', 'Deluxe', 'Deluxe', 750, '8 uur',
   ARRAY['Alles van Premium pakket', 'Complete licht- en geluidsysteem', 'DJ booth decoratie', 'Speciale effecten', 'Onbeperkte playlist aanvragen'],
   ARRAY['Everything from Premium package', 'Complete light and sound system', 'DJ booth decoration', 'Special effects', 'Unlimited playlist requests'],
   3)
ON CONFLICT (id) DO NOTHING;


-- 3. GALLERY TABEL (voor foto beheer)
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS voor gallery
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Iedereen kan zichtbare foto's zien
CREATE POLICY "Anyone can view visible gallery items" ON gallery
  FOR SELECT USING (visible = true);


-- 4. STORAGE BUCKET voor foto uploads
-- Dit moet je handmatig doen in Supabase Dashboard > Storage:
-- 1. Maak een nieuwe bucket genaamd "gallery"
-- 2. Maak deze PUBLIC
-- 3. Voeg deze policy toe voor uploads (authenticated users):
--    ((bucket_id = 'gallery'::text) AND (auth.role() = 'authenticated'::text))


-- 5. Realtime inschakelen voor chats
ALTER PUBLICATION supabase_realtime ADD TABLE chats;


-- Klaar!
-- Nu kun je de tabellen gebruiken in de applicatie.
