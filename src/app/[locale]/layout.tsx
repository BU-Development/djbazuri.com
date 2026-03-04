import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import CookieConsent from '@/components/CookieConsent';

export const dynamic = 'force-dynamic';

const locales = ['en', 'nl'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <CookieConsent />
          <footer className="bg-black border-t border-primary/20 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
              <p className="text-gray-400">&copy; {new Date().getFullYear()} DJ Bazuri. All rights reserved.</p>
              <p className="text-sm">
                <Link href={`/${locale}/privacy`} className="text-gray-500 hover:text-purple-400 transition-colors">
                  Privacybeleid
                </Link>
              </p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
