import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminStatus = await isAdmin();

  if (!adminStatus) {
    redirect('/nl/auth/signin?redirect=/admin');
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-purple-500/20 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-purple-500">DJ Bazuri Admin</h1>
        </div>

        <nav className="space-y-2">
          <Link
            href="/admin"
            className="block px-4 py-3 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/links"
            className="block px-4 py-3 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
          >
            Linktree Beheer
          </Link>
          <Link
            href="/admin/playlists"
            className="block px-4 py-3 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
          >
            Playlist Beheer
          </Link>
          <Link
            href="/admin/chats"
            className="block px-4 py-3 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
          >
            Chats
          </Link>
          <Link
            href="/nl"
            className="block px-4 py-3 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors mt-8"
          >
            Terug naar website
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
