'use client';

import { useState } from 'react';

interface Photo {
  id: string;
  url: string;
  alt: string;
  category: string;
}

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([
    { id: '1', url: '/gallery/event1.jpg', alt: 'Bruiloft DJ Set', category: 'Bruiloften' },
    { id: '2', url: '/gallery/event2.jpg', alt: 'Festival Optreden', category: 'Festivals' },
    { id: '3', url: '/gallery/event3.jpg', alt: 'Bedrijfsfeest', category: 'Zakelijk' },
  ]);

  const [newPhoto, setNewPhoto] = useState({ url: '', alt: '', category: '' });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = ['Bruiloften', 'Festivals', 'Zakelijk', 'Privéfeesten', 'Overig'];

  const handleAddPhoto = () => {
    if (!newPhoto.url || !newPhoto.alt) {
      setMessage({ type: 'error', text: 'Vul alle velden in' });
      return;
    }

    const photo: Photo = {
      id: Date.now().toString(),
      ...newPhoto,
    };

    setPhotos([...photos, photo]);
    setNewPhoto({ url: '', alt: '', category: '' });
    setMessage({ type: 'success', text: 'Foto toegevoegd!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm('Weet je zeker dat je deze foto wilt verwijderen?')) {
      setPhotos(photos.filter(p => p.id !== id));
      setMessage({ type: 'success', text: 'Foto verwijderd!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // TODO: Upload to Supabase Storage
    // For now, we'll use a placeholder
    setTimeout(() => {
      setNewPhoto({ ...newPhoto, url: `/gallery/${file.name}` });
      setUploading(false);
      setMessage({ type: 'success', text: 'Bestand geselecteerd! Voeg beschrijving toe en klik op Toevoegen.' });
      setTimeout(() => setMessage(null), 3000);
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500 mb-8">Foto's Beheer</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-900/50 border border-green-600 text-green-300'
            : 'bg-red-900/50 border border-red-600 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-8">
        <p className="text-yellow-300 text-sm">
          <strong>Let op:</strong> Foto upload naar Supabase Storage moet nog worden geconfigureerd.
          Plaats foto's handmatig in de <code className="bg-black/30 px-1 rounded">public/gallery/</code> map en voeg ze hier toe.
        </p>
      </div>

      {/* Add new photo */}
      <div className="bg-zinc-900 border border-purple-500/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Nieuwe Foto Toevoegen</h2>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Bestand uploaden</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Of voer URL in</label>
            <input
              type="text"
              value={newPhoto.url}
              onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
              placeholder="/gallery/foto.jpg"
              className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Beschrijving (alt tekst)</label>
            <input
              type="text"
              value={newPhoto.alt}
              onChange={(e) => setNewPhoto({ ...newPhoto, alt: e.target.value })}
              placeholder="Beschrijf de foto..."
              className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Categorie</label>
            <select
              value={newPhoto.category}
              onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
              className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="">Selecteer categorie...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAddPhoto}
          disabled={uploading}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploaden...' : 'Foto Toevoegen'}
        </button>
      </div>

      {/* Photo grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="bg-zinc-900 border border-purple-500/20 rounded-xl overflow-hidden group"
          >
            <div className="aspect-square bg-zinc-800 relative">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-white text-sm truncate">{photo.alt}</p>
              <p className="text-purple-400 text-xs">{photo.category || 'Geen categorie'}</p>
              <p className="text-gray-500 text-xs truncate mt-1">{photo.url}</p>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>Nog geen foto's toegevoegd.</p>
        </div>
      )}
    </div>
  );
}
