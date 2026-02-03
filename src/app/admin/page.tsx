import { getServerSupabase } from '@/lib/admin';

export default async function AdminDashboard() {
  const supabase = await getServerSupabase();

  // Haal statistieken op
  const { count: linksCount } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true });

  const { count: bookingsCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  const { count: chatsCount } = await supabase
    .from('chats')
    .select('*', { count: 'exact', head: true });

  const { count: playlistsCount } = await supabase
    .from('playlists')
    .select('*', { count: 'exact', head: true });

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-primary">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-dark-50 border border-primary/20 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Links</h3>
          <p className="text-4xl font-bold text-white">{linksCount || 0}</p>
        </div>

        <div className="bg-dark-50 border border-primary/20 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Bookings</h3>
          <p className="text-4xl font-bold text-white">{bookingsCount || 0}</p>
        </div>

        <div className="bg-dark-50 border border-primary/20 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Chats</h3>
          <p className="text-4xl font-bold text-white">{chatsCount || 0}</p>
        </div>

        <div className="bg-dark-50 border border-primary/20 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Playlists</h3>
          <p className="text-4xl font-bold text-white">{playlistsCount || 0}</p>
        </div>
      </div>

      <div className="mt-12 bg-dark-50 border border-primary/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Welkom bij het Admin Dashboard</h2>
        <p className="text-gray-400">
          Gebruik het menu aan de linkerkant om je links, playlists en chats te beheren.
        </p>
      </div>
    </div>
  );
}
