'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Track {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumImage: string | null;
}

interface TrackSearchProps {
  onAddTrack: (track: Track, priority: 'must_have' | 'normal' | 'blacklist') => void;
}

export default function TrackSearch({ onAddTrack }: TrackSearchProps) {
  const t = useTranslations('dashboard.playlist');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.tracks || []);
      } else {
        console.error('Search failed:', data.error);
        setError(data.error || 'Zoeken mislukt');
        setResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Kon niet verbinden met Spotify');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      handleSearch(value);
    }, 500);

    setSearchTimeout(timeout);
  };

  return (
    <div className="bg-zinc-900 border border-purple-500/20 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-white mb-4">{t('search')}</h3>

      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={t('search')}
          className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-white placeholder-gray-500"
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-6 w-6 border-2 border-purple-600 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <div className="flex items-center flex-1 min-w-0">
                {track.albumImage && (
                  <img
                    src={track.albumImage}
                    alt={track.album}
                    className="w-12 h-12 rounded mr-3 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{track.name}</p>
                  <p className="text-sm text-gray-400 truncate">{track.artists}</p>
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onAddTrack(track, 'must_have')}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                  title="Must-Have"
                >
                  ❤️
                </button>
                <button
                  onClick={() => onAddTrack(track, 'normal')}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  title="Normal"
                >
                  ➕
                </button>
                <button
                  onClick={() => onAddTrack(track, 'blacklist')}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                  title="Blacklist"
                >
                  ⛔
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {query.length >= 2 && !loading && !error && results.length === 0 && (
        <div className="text-center py-8 text-gray-500">{t('noResults')}</div>
      )}
    </div>
  );
}
