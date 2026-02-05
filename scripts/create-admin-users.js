// Script om admin gebruikers aan te maken in Supabase
// Voer uit met: node scripts/create-admin-users.js
// Vereist: SUPABASE_SERVICE_ROLE_KEY in .env.local

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Fout: NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten in .env.local staan');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Admin accounts om aan te maken
const adminUsers = [
  { email: 'djbazuri@gmail.com', password: 'DJBazuri2024!' },
  { email: 'djbazuri@proton.me', password: 'DJBazuri2024!' },
  { email: 'boazuri@proton.me', password: 'DJBazuri2024!' },
];

async function createAdminUsers() {
  console.log('Admin gebruikers aanmaken...\n');

  for (const user of adminUsers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (error) {
        if (error.message.includes('already been registered')) {
          console.log(`[SKIP] ${user.email} - Account bestaat al`);
        } else {
          console.log(`[FOUT] ${user.email} - ${error.message}`);
        }
      } else {
        console.log(`[OK] ${user.email} - Account aangemaakt!`);
      }
    } catch (err) {
      console.log(`[FOUT] ${user.email} - ${err.message}`);
    }
  }

  console.log('\n--- Klaar! ---');
  console.log('Wachtwoord: DJBazuri2024!');
  console.log('Verander je wachtwoord na eerste login!');
}

createAdminUsers();
