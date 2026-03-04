'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const params = useParams();
  const locale = (params?.locale as string) || 'nl';

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-purple-500/30 rounded-xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-300 flex-1">
          We gebruiken functionele cookies om de site goed te laten werken. We verkopen geen data
          en gebruiken geen tracking of advertentiecookies.{' '}
          <Link
            href={`/${locale}/privacy`}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Meer info
          </Link>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-gray-400 border border-gray-600 rounded-lg hover:border-gray-400 transition-colors"
          >
            Weigeren
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
