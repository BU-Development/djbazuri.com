// Script om Supabase tabellen setup instructies te tonen
// Voer uit met: node scripts/create-tables.js

require('dotenv').config({ path: '.env.local' });

console.log('\n' + '='.repeat(60));
console.log('DJ BAZURI - DATABASE SETUP');
console.log('='.repeat(60));
console.log('\nGa naar je Supabase Dashboard en voer deze stappen uit:\n');

console.log('STAP 1: Ga naar SQL Editor');
console.log('   https://supabase.com/dashboard/project/vcvakoekcieyrphijqab/sql/new\n');

console.log('STAP 2: Kopieer en plak dit SQL script:\n');
console.log('-'.repeat(60));

const sql = `
-- CHATS TABEL
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRICING TABEL
CREATE TABLE IF NOT EXISTS pricing (
  id TEXT PRIMARY KEY,
  name_nl TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration TEXT NOT NULL,
  features_nl TEXT[] DEFAULT '{}',
  features_en TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GALLERY TABEL
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default pricing data
INSERT INTO pricing (id, name_nl, name_en, price, duration, features_nl, features_en, sort_order) VALUES
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
`;

console.log(sql);
console.log('-'.repeat(60));

console.log('\nSTAP 3: Klik op "Run" om het script uit te voeren');

console.log('\nSTAP 4: Maak een Storage bucket voor foto\'s:');
console.log('   → Ga naar Storage (linker menu)');
console.log('   → Klik "New bucket"');
console.log('   → Naam: gallery');
console.log('   → Zet "Public bucket" AAN');
console.log('   → Klik "Create bucket"');

console.log('\n' + '='.repeat(60));
console.log('Na het uitvoeren, herstart je dev server: npm run dev');
console.log('='.repeat(60) + '\n');
