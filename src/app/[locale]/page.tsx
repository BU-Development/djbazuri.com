import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('home');

  return (
    <div className="bg-black">
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-black via-primary-800 to-primary-600 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 animate-fade-in bg-gradient-to-r from-white to-primary-300 bg-clip-text text-transparent">
            {t('hero.title')}
          </h1>
          <p className="text-2xl md:text-3xl mb-2 text-primary-200">{t('hero.subtitle')}</p>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/contact`}
              className="px-8 py-4 bg-primary hover:bg-primary-600 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-primary/50"
            >
              {t('hero.bookButton')}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="px-8 py-4 bg-white text-primary hover:bg-gray-200 rounded-lg text-lg font-semibold transition-all shadow-lg"
            >
              {t('hero.contactButton')}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-dark-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">{t('about.title')}</h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            {t('about.description')}
          </p>
        </div>
      </section>

      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-white">
            {t('features.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-dark-50 border border-primary/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-white">
                {t('features.professional.title')}
              </h3>
              <p className="text-gray-400">{t('features.professional.description')}</p>
            </div>

            <div className="text-center p-6 rounded-lg bg-dark-50 border border-primary/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-white">
                {t('features.playlist.title')}
              </h3>
              <p className="text-gray-400">{t('features.playlist.description')}</p>
            </div>

            <div className="text-center p-6 rounded-lg bg-dark-50 border border-primary/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-white">
                {t('features.flexible.title')}
              </h3>
              <p className="text-gray-400">{t('features.flexible.description')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
