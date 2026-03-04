'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '🏠', external: false },
    { href: '/admin/bookings', label: 'Bookings', icon: '📅', external: false },
    { href: '/admin/chats-new', label: 'Chats', icon: '💬', external: false },
    { href: 'https://links.djbazuri.com/admin', label: 'Links', icon: '🔗', external: true },
    { href: '/admin/gallery', label: 'Gallery', icon: '🖼️', external: false },
    { href: '/admin/pricing', label: 'Pricing', icon: '💰', external: false },
  ];

  return (
    <nav className="bg-zinc-900 border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = !item.external && pathname === item.href;
              const className = `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-zinc-800'
              }`;
              return item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={className}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/nl"
              target="_blank"
              className="text-sm text-gray-400 hover:text-white"
            >
              View Site →
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
