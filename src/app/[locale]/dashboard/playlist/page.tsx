'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import TrackSearch from '@/components/TrackSearch';
import TrackList from '@/components/TrackList';
import Link from 'next/link';

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

export default function PlaylistPage({ params: { locale } }: { params: { locale: string } }) {
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
      showMessage('success', 'Track priority updated');
    } else {
      setTracks([...tracks, { ...track, priority }]);
      showMessage('success', 'Track added to playlist');
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    setTracks(tracks.filter((t) => t.id !== trackId));
    showMessage('success', 'Track removed from playlist');
  };

  const handleCreatePlaylist = async () => {
    if (tracks.filter((t) => t.priority !== 'blacklist').length === 0) {
      showMessage('error', 'Please add at least one song to create a playlist');
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
        showMessage('error', 'Failed to create playlist');
      }
    } catch (error) {
      console.error('Playlist creation error:', error);
      showMessage('error', 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPlaylist = async () => {
    if (!playlistId) {
      showMessage('error', 'Please create a playlist first');
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
        showMessage('error', 'Failed to update playlist');
      }
    } catch (error) {
      console.error('Playlist sync error:', error);
      showMessage('error', 'Failed to update playlist');
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href={`/${locale}/dashboard`}
              className="text-purple-600 hover:text-purple-700 mb-2 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Playlist Actions</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {!playlistId ? (
              <button
                onClick={handleCreatePlaylist}
                disabled={loading || tracks.filter((t) => t.priority !== 'blacklist').length === 0}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : t('createPlaylist')}
              </button>
            ) : (
              <>
                <button
                  onClick={handleSyncPlaylist}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Syncing...' : t('syncChanges')}
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

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Search for songs and add them with priority levels</li>
              <li>• Must-Have songs are your favorites that you really want to hear</li>
              <li>• Normal songs are added to the playlist</li>
              <li>• Blacklisted songs will NOT be added to the Spotify playlist</li>
              <li>• Click "Create Spotify Playlist" to generate your playlist</li>
              <li>• Use "Sync Changes" to update the playlist after making changes</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The Spotify API integration requires configuration. Add your Spotify API credentials to the .env.local file to enable playlist creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
