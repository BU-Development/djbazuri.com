'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.split('/').slice(2).join('/');

  const switchLanguage = (newLocale: string) => {
    const newPath = `/${newLocale}${pathWithoutLocale ? '/' + pathWithoutLocale : ''}`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-800 rounded-md p-1">
      <button
        onClick={() => switchLanguage('nl')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          currentLocale === 'nl'
            ? 'bg-purple-600 text-white'
            : 'text-gray-300 hover:text-white'
        }`}
      >
        NL
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          currentLocale === 'en'
            ? 'bg-purple-600 text-white'
            : 'text-gray-300 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
}
