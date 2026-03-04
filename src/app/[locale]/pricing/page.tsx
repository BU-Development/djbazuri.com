import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PricingPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('pricing');

  const packages = [
    {
      key: 'basic',
      features: t.raw('basic.features') as string[],
    },
    {
      key: 'premium',
      features: t.raw('premium.features') as string[],
      featured: true,
    },
    {
      key: 'deluxe',
      features: t.raw('deluxe.features') as string[],
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">{t('title')}</h1>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.key}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:scale-105 ${
                pkg.featured ? 'ring-4 ring-purple-600 scale-105' : ''
              }`}
            >
              {pkg.featured && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-3xl font-bold mb-2 text-gray-900">
                  {t(`${pkg.key}.name`)}
                </h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-purple-600">
                    {t(`${pkg.key}.price`)}
                  </span>
                </div>
                <p className="text-gray-600 mb-6">{t(`${pkg.key}.duration`)}</p>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-6 h-6 text-green-500 mr-2 flex-shrink-0"
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
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/${locale}/contact`}
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                    pkg.featured
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {t(`${pkg.key}.button`)}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Need a custom package?</h2>
          <p className="text-gray-600 mb-6">
            Contact me to discuss your specific requirements and get a tailored quote.
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Get Custom Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
