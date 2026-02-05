import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import Link from 'next/link';
import '../globals.css';

export const metadata = {
  title: 'Admin - DJ Bazuri',
};

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
    <html lang="nl">
      <body className="bg-black text-white">
        <div className="flex min-h-screen">
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
                📊 Dashboard
              </Link>
              <Link
                href="/admin/bookings"
                className="block px-4 py-3 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
              >
                📅 Boekingen
              </Link>
              <Link
                href="/admin/playlists"
                className="block px-4 py-3 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
              >
                🎵 Playlists
              </Link>
              <Link
                href="/admin/chats"
                className="block px-4 py-3 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
              >
                💬 Chats
              </Link>
              <Link
                href="/admin/pricing"
                className="block px-4 py-3 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
              >
                💰 Prijzen
              </Link>
              <Link
                href="/admin/gallery"
                className="block px-4 py-3 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
              >
                📸 Foto's
              </Link>
              <Link
                href="/admin/links"
                className="block px-4 py-3 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
              >
                🔗 Linktree
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
      </body>
    </html>
  );
}
