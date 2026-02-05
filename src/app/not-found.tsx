import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="nl">
      <body className="bg-black text-white">
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-purple-500 mb-4">404</h1>
            <h2 className="text-3xl font-semibold mb-4">Pagina niet gevonden</h2>
            <p className="text-gray-400 mb-8 max-w-md">
              Sorry, de pagina die je zoekt bestaat niet of is verplaatst.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/nl"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Terug naar Home
              </Link>
              <Link
                href="/nl/contact"
                className="px-6 py-3 border border-purple-600 text-purple-400 rounded-lg font-semibold hover:bg-purple-600/10 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
