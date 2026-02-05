import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Lijst met admin emails
const ADMIN_EMAILS = [
  'djbazuri@gmail.com',
  'djbazuri@proton.me',
  'boazuri@proton.me',
];

export async function getServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

export async function isAdmin(): Promise<boolean> {
  const supabase = await getServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return false;
  }

  // Check of de user email in de admin lijst staat
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export async function requireAdmin() {
  const adminStatus = await isAdmin();

  if (!adminStatus) {
    throw new Error('Unauthorized: Admin access required');
  }
}

export async function getCurrentUser() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
