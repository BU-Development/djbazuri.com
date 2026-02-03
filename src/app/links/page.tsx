import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function LinksPage() {
  const { data: links, error } = await supabase
    .from('links')
    .select('*')
    .eq('visible', true)
    .order('order', { ascending: true });

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Profile Section */}
        <div className="text-center mb-12">
          <div className="mb-6 relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary shadow-lg shadow-primary/50 bg-dark-50">
            {/* Als je een profiel foto hebt, uncomment deze Image tag en verwijder de div hieronder */}
            {/* <Image
              src="/images/profile.jpg"
              alt="DJ Bazuri"
              fill
              className="object-cover"
              priority
            /> */}

            {/* Placeholder - verwijder dit als je een echte foto hebt */}
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🎵
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">DJ Bazuri</h1>
          <p className="text-gray-400 text-lg">Professional DJ Services</p>
        </div>

        {/* Links Section */}
        <div className="space-y-4">
          {links && links.length > 0 ? (
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-4 bg-dark-50 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 rounded-xl text-white font-semibold text-center transition-all duration-300 shadow-lg hover:shadow-primary/30"
              >
                <div className="flex items-center justify-center gap-3">
                  {link.icon && (
                    <span className="text-2xl">{link.icon}</span>
                  )}
                  <span>{link.title}</span>
                </div>
              </a>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>Geen links beschikbaar op dit moment.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} DJ Bazuri. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
