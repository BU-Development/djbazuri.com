// Script om Supabase database tabellen aan te maken
// Voer uit met: node scripts/setup-database.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Fout: SUPABASE keys ontbreken in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function setupDatabase() {
  console.log('Database setup starten...\n');

  // Test verbinding
  const { data: testData, error: testError } = await supabase.from('chats').select('count').limit(1);

  if (testError && testError.code === '42P01') {
    console.log('⚠️  Tabellen bestaan nog niet.');
    console.log('\n📋 Voer het volgende SQL script uit in Supabase Dashboard:');
    console.log('   1. Ga naar https://supabase.com/dashboard');
    console.log('   2. Selecteer je project');
    console.log('   3. Ga naar SQL Editor');
    console.log('   4. Kopieer en plak de inhoud van: scripts/setup-supabase.sql');
    console.log('   5. Klik op "Run"');
    console.log('\n   Of gebruik de Supabase CLI: supabase db push');
    return;
  }

  // Check welke tabellen bestaan
  console.log('Checking tabellen...\n');

  // Chats
  const { error: chatsError } = await supabase.from('chats').select('count').limit(1);
  if (chatsError) {
    console.log('❌ chats tabel: ONTBREEKT');
  } else {
    console.log('✓ chats tabel: OK');
  }

  // Pricing
  const { data: pricingData, error: pricingError } = await supabase.from('pricing').select('*');
  if (pricingError) {
    console.log('❌ pricing tabel: ONTBREEKT');
  } else {
    console.log(`✓ pricing tabel: OK (${pricingData?.length || 0} pakketten)`);
  }

  // Gallery
  const { data: galleryData, error: galleryError } = await supabase.from('gallery').select('count').limit(1);
  if (galleryError) {
    console.log('❌ gallery tabel: ONTBREEKT');
  } else {
    console.log('✓ gallery tabel: OK');
  }

  // Storage bucket check
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  const galleryBucket = buckets?.find(b => b.name === 'gallery');
  if (galleryBucket) {
    console.log('✓ gallery storage bucket: OK');
  } else {
    console.log('❌ gallery storage bucket: ONTBREEKT');
    console.log('   → Maak een "gallery" bucket aan in Supabase Dashboard > Storage');
  }

  console.log('\n--- Klaar! ---');
}

setupDatabase();
