import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

  if (!user) {
    return false;
  }

  // Haal de admin email op uit de database
  const { data: config } = await supabase
    .from('site_config')
    .select('admin_email')
    .single();

  if (!config) {
    return false;
  }

  return user.email === config.admin_email;
}

export async function requireAdmin() {
  const adminStatus = await isAdmin();

  if (!adminStatus) {
    throw new Error('Unauthorized: Admin access required');
  }
}
