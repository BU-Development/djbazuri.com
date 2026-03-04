'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
    { href: '/admin/chats-new', label: 'Chats', icon: '💬' },
    { href: '/admin/links', label: 'Links', icon: '🔗' },
    { href: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
    { href: '/admin/pricing', label: 'Pricing', icon: '💰' },
  ];

  return (
    <nav className="bg-zinc-900 border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-zinc-800'
                  }`}
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
