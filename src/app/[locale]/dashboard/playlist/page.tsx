'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import TrackSearch from '@/components/TrackSearch';
import TrackList from '@/components/TrackList';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

interface SearchTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumImage: string | null;
}

interface Track extends SearchTrack {
  priority: 'must_have' | 'normal' | 'blacklist';
}

function PlaylistContent({ locale }: { locale: string }) {
  const t = useTranslations('dashboard.playlist');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const savedTracks = localStorage.getItem('playlist_tracks');
    if (savedTracks) {
      setTracks(JSON.parse(savedTracks));
    }

    const savedPlaylistId = localStorage.getItem('spotify_playlist_id');
    if (savedPlaylistId) {
      setPlaylistId(savedPlaylistId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('playlist_tracks', JSON.stringify(tracks));
  }, [tracks]);

  const handleAddTrack = (track: SearchTrack, priority: 'must_have' | 'normal' | 'blacklist') => {
    const existingTrack = tracks.find((t) => t.id === track.id);

    if (existingTrack) {
      setTracks(tracks.map((t) => (t.id === track.id ? { ...t, priority } : t)));
      showMessage('success', 'Track prioriteit bijgewerkt');
    } else {
      setTracks([...tracks, { ...track, priority }]);
      showMessage('success', 'Track toegevoegd aan playlist');
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    setTracks(tracks.filter((t) => t.id !== trackId));
    showMessage('success', 'Track verwijderd uit playlist');
  };

  const handleCreatePlaylist = async () => {
    if (tracks.filter((t) => t.priority !== 'blacklist').length === 0) {
      showMessage('error', 'Voeg minstens één nummer toe om een playlist te maken');
      return;
    }

    setLoading(true);

    try {
      const tracksToAdd = tracks.filter((t) => t.priority !== 'blacklist');

      const response = await fetch('/api/spotify/create-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracks: tracksToAdd,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylistId(data.playlistId);
        localStorage.setItem('spotify_playlist_id', data.playlistId);
        showMessage('success', t('playlistCreated'));
      } else {
        showMessage('error', 'Kon playlist niet aanmaken');
      }
    } catch (error) {
      console.error('Playlist creation error:', error);
      showMessage('error', 'Kon playlist niet aanmaken');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPlaylist = async () => {
    if (!playlistId) {
      showMessage('error', 'Maak eerst een playlist aan');
      return;
    }

    setLoading(true);

    try {
      const tracksToAdd = tracks.filter((t) => t.priority !== 'blacklist');

      const response = await fetch('/api/spotify/add-tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistId,
          tracks: tracksToAdd,
        }),
      });

      if (response.ok) {
        showMessage('success', t('playlistUpdated'));
      } else {
        showMessage('error', 'Kon playlist niet bijwerken');
      }
    } catch (error) {
      console.error('Playlist sync error:', error);
      showMessage('error', 'Kon playlist niet bijwerken');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const mustHaveTracks = tracks.filter((t) => t.priority === 'must_have');
  const normalTracks = tracks.filter((t) => t.priority === 'normal');
  const blacklistTracks = tracks.filter((t) => t.priority === 'blacklist');

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href={`/${locale}/dashboard`}
              className="text-purple-400 hover:text-purple-300 mb-2 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Terug naar Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white">{t('title')}</h1>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-900/50 border border-green-600/50 text-green-300'
                : 'bg-red-900/50 border border-red-600/50 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-8">
          <TrackSearch onAddTrack={handleAddTrack} />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <TrackList
            title={t('mustHave')}
            tracks={mustHaveTracks}
            priority="must_have"
            onRemoveTrack={handleRemoveTrack}
          />
          <TrackList
            title={t('normal')}
            tracks={normalTracks}
            priority="normal"
            onRemoveTrack={handleRemoveTrack}
          />
          <TrackList
            title={t('blacklist')}
            tracks={blacklistTracks}
            priority="blacklist"
            onRemoveTrack={handleRemoveTrack}
          />
        </div>

        <div className="bg-zinc-900 border border-purple-500/20 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-white mb-4">Playlist Acties</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {!playlistId ? (
              <button
                onClick={handleCreatePlaylist}
                disabled={loading || tracks.filter((t) => t.priority !== 'blacklist').length === 0}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Bezig...' : t('createPlaylist')}
              </button>
            ) : (
              <>
                <button
                  onClick={handleSyncPlaylist}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Bezig...' : t('syncChanges')}
                </button>
                <a
                  href={`https://open.spotify.com/playlist/${playlistId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
                >
                  {t('viewOnSpotify')}
                </a>
              </>
            )}
          </div>

          <div className="mt-6 p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
            <h4 className="font-semibold text-purple-300 mb-2">Hoe werkt het:</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Zoek naar nummers en voeg ze toe met prioriteit</li>
              <li>• Must-Have nummers zijn je favorieten die je echt wilt horen</li>
              <li>• Normale nummers worden toegevoegd aan de playlist</li>
              <li>• Blacklist nummers worden NIET toegevoegd aan de Spotify playlist</li>
              <li>• Klik op "Maak Spotify Playlist" om je playlist te genereren</li>
              <li>• Gebruik "Synchroniseer" om de playlist bij te werken na wijzigingen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlaylistPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <AuthGuard>
      <PlaylistContent locale={locale} />
    </AuthGuard>
  );
}
