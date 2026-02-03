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
    redirect('/en/auth/signin?redirect=/admin');
  }

  return (
    <html lang="en">
      <body className="bg-black text-white">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-dark-50 border-r border-primary/20 p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-primary">DJ Bazuri Admin</h1>
            </div>

            <nav className="space-y-2">
              <Link
                href="/admin"
                className="block px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/links"
                className="block px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              >
                Linktree Beheer
              </Link>
              <Link
                href="/admin/playlists"
                className="block px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              >
                Playlist Beheer
              </Link>
              <Link
                href="/admin/chats"
                className="block px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              >
                Chats
              </Link>
              <Link
                href="/en"
                className="block px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors mt-8"
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
