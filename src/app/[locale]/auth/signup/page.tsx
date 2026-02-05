'use client';

import Link from 'next/link';

export default function SignUpPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Toegang Aanvragen</h1>
          <p className="text-gray-600">Exclusief voor geboekte klanten</p>
        </div>

        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h2 className="font-semibold text-purple-900 mb-3">Hoe krijg ik toegang?</h2>
            <ol className="space-y-3 text-sm text-purple-800">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Boek DJ Bazuri voor je event via de contact pagina of prijzen pagina</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Na bevestiging van je boeking ontvang je een email met je inloggegevens</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Log in met je gegevens om je playlist te maken en te chatten met DJ Bazuri</span>
              </li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Wat krijg je na het inloggen?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Persoonlijk dashboard voor je event
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Gedeelde Spotify playlist met DJ Bazuri
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Direct chatten over je event
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Must-have en blacklist nummers doorgeven
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href={`/${locale}/pricing`}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
            >
              Bekijk Prijzen
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors text-center"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Al inloggegevens ontvangen?{' '}
            <Link href={`/${locale}/auth/signin`} className="text-purple-600 hover:text-purple-700 font-semibold">
              Inloggen
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
