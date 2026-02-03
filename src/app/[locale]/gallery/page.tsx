import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function GalleryPage() {
  const t = useTranslations('gallery');

  const placeholderImages = [
    { id: 1, alt: 'DJ Setup' },
    { id: 2, alt: 'Event 1' },
    { id: 3, alt: 'Event 2' },
    { id: 4, alt: 'Event 3' },
    { id: 5, alt: 'Event 4' },
    { id: 6, alt: 'Event 5' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">{t('title')}</h1>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderImages.map((image) => (
            <div
              key={image.id}
              className="relative h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer group"
            >
              <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-semibold bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all">
                {image.alt}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm">Click to view full size</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 bg-purple-50 p-6 rounded-lg inline-block">
            <strong>Note:</strong> Add your actual event photos to the{' '}
            <code className="bg-gray-200 px-2 py-1 rounded">public/images</code> folder and update
            this page to display them.
          </p>
        </div>
      </div>
    </div>
  );
}
