'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TrackSearch from '@/components/TrackSearch';
import TrackList from '@/components/TrackList';

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

type Params = {
  locale: string;
  bookingId: string;
};

function PlaylistContent({ locale, bookingId }: { locale: string; bookingId: string }) {
  const t = useTranslations('dashboard.playlist');
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');

  useEffect(() => {
    loadPlaylistData();
  }, [bookingId]);

  async function loadPlaylistData() {
    try {
      // Load booking details
      const bookingRes = await fetch(`/api/admin/bookings?id=${bookingId}`);
      if (bookingRes.ok) {
        const bookingData = await bookingRes.json();
        const booking = bookingData.data?.[0];
        if (booking) {
          setEventName(booking.event_name);
          setEventDate(booking.event_date);
        }
      }

      // Load playlist tracks from new API
      const tracksRes = await fetch(`/api/playlist-tracks?booking_id=${bookingId}`);
      if (tracksRes.ok) {
        const data = await tracksRes.json();

        if (data.spotifyPlaylistId) {
          setPlaylistId(data.spotifyPlaylistId);
        }

        if (data.tracks && data.tracks.length > 0) {
          const formattedTracks = data.tracks.map((t: any) => ({
            id: t.spotify_track_id,
            name: t.track_name,
            artists: t.artist_name,
            album: t.album_name || '',
            albumImage: t.album_image,
            priority: t.priority,
          }));
          setTracks(formattedTracks);
        }
      }
    } catch (error) {
      console.error('Error loading playlist data:', error);
    }
    setLoadingData(false);
  }

  const handleAddTrack = async (track: SearchTrack, priority: 'must_have' | 'normal' | 'blacklist') => {
    const existingTrack = tracks.find((t) => t.id === track.id);
    let newTracks: Track[];

    if (existingTrack) {
      newTracks = tracks.map((t) => (t.id === track.id ? { ...t, priority } : t));
      setTracks(newTracks);
      showMessage('success', 'Track prioriteit bijgewerkt');
    } else {
      newTracks = [...tracks, { ...track, priority }];
      setTracks(newTracks);
      showMessage('success', 'Track toegevoegd aan playlist');
    }

    // Save to database
    await saveTracksToDatabase(newTracks);
  };

  const handleRemoveTrack = async (trackId: string) => {
    const newTracks = tracks.filter((t) => t.id !== trackId);
    setTracks(newTracks);
    showMessage('success', 'Track verwijderd uit playlist');

    // Save to database
    await saveTracksToDatabase(newTracks);
  };

  async function saveTracksToDatabase(tracksToSave: Track[]) {
    try {
      const response = await fetch('/api/playlist-tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingId,
          tracks: tracksToSave,
        }),
      });

      if (!response.ok) {
        console.error('Error saving tracks to database');
      }
    } catch (error) {
      console.error('Error saving tracks:', error);
    }
  }

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
          eventName,
          eventDate,
          bookingId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const spotifyPlaylistId = data.playlistId;
        setPlaylistId(spotifyPlaylistId);

        // Save Spotify playlist ID to database
        await fetch('/api/playlist-tracks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: bookingId,
            spotifyPlaylistId: spotifyPlaylistId,
          }),
        });

        showMessage('success', 'Spotify playlist succesvol aangemaakt!');
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Er ging iets mis bij het aanmaken van de playlist');
      }
    } catch (error) {
      showMessage('error', 'Er ging iets mis bij het aanmaken van de playlist');
    }

    setLoading(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const mustHaveTracks = tracks.filter((t) => t.priority === 'must_have');
  const normalTracks = tracks.filter((t) => t.priority === 'normal');
  const blacklistTracks = tracks.filter((t) => t.priority === 'blacklist');

  if (loadingData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-purple-400 hover:text-purple-300 mb-4 inline-block"
          >
            ← {t('backToDashboard')}
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-xl text-gray-400">
            {eventName} - {new Date(eventDate).toLocaleDateString('nl-NL')}
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-900/50 border border-green-600 text-green-300'
                : 'bg-red-900/50 border border-red-600 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 border border-purple-500/20 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-white mb-4">{t('search.title')}</h2>
            <TrackSearch onAddTrack={handleAddTrack} />
          </div>

          <div className="bg-zinc-900 border border-purple-500/20 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-white mb-4">{t('stats.title')}</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-600/20 border border-green-600/30 rounded-lg">
                <span className="text-white">{t('stats.mustHave')}</span>
                <span className="text-2xl font-bold text-green-400">{mustHaveTracks.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
                <span className="text-white">{t('stats.normal')}</span>
                <span className="text-2xl font-bold text-blue-400">{normalTracks.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-600/20 border border-red-600/30 rounded-lg">
                <span className="text-white">{t('stats.blacklist')}</span>
                <span className="text-2xl font-bold text-red-400">{blacklistTracks.length}</span>
              </div>
            </div>

            {playlistId && (
              <a
                href={`https://open.spotify.com/playlist/${playlistId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full text-center py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                🎵 Open in Spotify
              </a>
            )}

            <button
              onClick={handleCreatePlaylist}
              disabled={loading || tracks.filter((t) => t.priority !== 'blacklist').length === 0}
              className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Playlist wordt aangemaakt...' : playlistId ? 'Playlist Bijwerken' : 'Maak Spotify Playlist'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <TrackList
            title={t('lists.mustHave')}
            tracks={mustHaveTracks}
            priority="must_have"
            onRemoveTrack={handleRemoveTrack}
          />

          <TrackList
            title={t('lists.normal')}
            tracks={normalTracks}
            priority="normal"
            onRemoveTrack={handleRemoveTrack}
          />

          <TrackList
            title={t('lists.blacklist')}
            tracks={blacklistTracks}
            priority="blacklist"
            onRemoveTrack={handleRemoveTrack}
          />
        </div>
      </div>
    </div>
  );
}

export default function PlaylistPage({ params }: { params: Params }) {
  return <PlaylistContent locale={params.locale} bookingId={params.bookingId} />;
}
