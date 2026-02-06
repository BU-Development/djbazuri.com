'use client';

import { useEffect, useState } from 'react';

type Playlist = {
  id: string;
  booking_id: string;
  spotify_playlist_id: string | null;
  name: string;
  created_at: string;
  bookings?: Booking;
};

type Booking = {
  id: string;
  event_name: string;
  event_date: string;
  status: string;
};

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await fetch('/api/admin/playlists');
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Kon data niet laden');
        return;
      }

      setPlaylists(result.playlists || []);
      setBookings(result.bookings || []);
      setError(null);
    } catch (err) {
      setError('Kon data niet laden');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreatePlaylist() {
    if (!selectedBooking) {
      alert('Selecteer eerst een booking');
      return;
    }

    const booking = bookings.find(b => b.id === selectedBooking);
    if (!booking) return;

    try {
      const response = await fetch('/api/admin/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: selectedBooking,
          name: `${booking.event_name} Playlist`,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || 'Kon playlist niet aanmaken');
        return;
      }

      setSelectedBooking('');
      loadData();
    } catch (err) {
      setError('Kon playlist niet aanmaken');
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Weet je zeker dat je deze playlist wilt verwijderen?')) {
      try {
        const response = await fetch(`/api/admin/playlists?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const result = await response.json();
          setError(result.error || 'Kon playlist niet verwijderen');
          return;
        }

        loadData();
      } catch (err) {
        setError('Kon playlist niet verwijderen');
      }
    }
  }

  async function handleSyncSpotify(playlistId: string) {
    // Hier zou je de Spotify API kunnen aanroepen om de playlist te synchroniseren
    alert('Spotify synchronisatie functie moet nog worden geïmplementeerd');
  }

  if (isLoading) {
    return <div className="text-center">Laden...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-primary">Playlist Beheer</h1>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-600/50 rounded-xl text-red-300">
          {error}
        </div>
      )}

      {/* Create Playlist */}
      <div className="bg-dark-50 border border-primary/20 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Nieuwe Playlist Maken</h2>
        <div className="flex gap-4">
          <select
            value={selectedBooking}
            onChange={(e) => setSelectedBooking(e.target.value)}
            className="input-field flex-1"
          >
            <option value="">Selecteer een booking</option>
            {bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.event_name} - {new Date(booking.event_date).toLocaleDateString('nl-NL')}
              </option>
            ))}
          </select>
          <button onClick={handleCreatePlaylist} className="btn-primary">
            Playlist Maken
          </button>
        </div>
      </div>

      {/* Playlists List */}
      <div className="space-y-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-dark-50 border border-primary/20 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{playlist.name}</h3>
                {playlist.bookings && (
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Event: {playlist.bookings.event_name}</p>
                    <p>
                      Datum:{' '}
                      {new Date(playlist.bookings.event_date).toLocaleDateString('nl-NL')}
                    </p>
                    <p>Status: {playlist.bookings.status}</p>
                  </div>
                )}
                {playlist.spotify_playlist_id && (
                  <p className="text-sm text-green-400 mt-2">
                    Spotify Playlist ID: {playlist.spotify_playlist_id}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Aangemaakt: {new Date(playlist.created_at).toLocaleString('nl-NL')}
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={`/en/dashboard/playlist?id=${playlist.id}`}
                  target="_blank"
                  className="px-4 py-2 bg-primary hover:bg-primary-600 rounded-lg transition-colors"
                >
                  Bekijken
                </a>
                <button
                  onClick={() => handleSyncSpotify(playlist.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Sync Spotify
                </button>
                <button
                  onClick={() => handleDelete(playlist.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        ))}

        {playlists.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            Geen playlists gevonden. Maak je eerste playlist!
          </div>
        )}
      </div>
    </div>
  );
}
