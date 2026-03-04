'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';

type Booking = {
  id: string;
  user_id: string | null;
  event_name: string;
  event_date: string;
  package_type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  client_name: string | null;
  client_email: string | null;
  access_token: string | null;
  created_at: string;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
    bookingId: string;
  } | null>(null);
  const [newBooking, setNewBooking] = useState({
    event_name: '',
    event_date: '',
    package_type: 'basic',
    status: 'pending' as const,
    notes: '',
    client_name: '',
    client_email: '',
  });

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const response = await fetch('/api/admin/bookings');
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Kon boekingen niet laden');
        return;
      }

      setBookings(result.data || []);
      setError(null);
    } catch (err) {
      setError('Kon boekingen niet laden');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Kon boeking niet aanmaken');
        return;
      }

      setNewBooking({
        event_name: '',
        event_date: '',
        package_type: 'basic',
        status: 'pending',
        notes: '',
        client_name: '',
        client_email: '',
      });
      setShowForm(false);
      loadBookings();
    } catch (err) {
      setError('Er is een fout opgetreden');
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || 'Kon status niet bijwerken');
        return;
      }

      loadBookings();
    } catch (err) {
      setError('Kon status niet bijwerken');
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Weet je zeker dat je deze boeking wilt verwijderen?')) {
      try {
        const response = await fetch(`/api/admin/bookings?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const result = await response.json();
          setError(result.error || 'Kon boeking niet verwijderen');
          return;
        }

        loadBookings();
      } catch (err) {
        setError('Kon boeking niet verwijderen');
      }
    }
  }

  function generatePassword(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async function handleGenerateCredentials(booking: Booking) {
    if (!booking.client_email) {
      alert('Vul eerst een email adres in voor de klant');
      return;
    }

    setGeneratingFor(booking.id);

    const password = generatePassword();

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: booking.client_email,
          password,
          bookingId: booking.id,
          eventName: booking.event_name,
          clientName: booking.client_name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedCredentials({
          email: booking.client_email,
          password,
          bookingId: booking.id,
        });
        loadBookings();
      } else {
        alert(`Fout bij aanmaken account: ${data.error}`);
      }
    } catch (error) {
      alert('Er is iets misgegaan bij het aanmaken van het account');
    } finally {
      setGeneratingFor(null);
    }
  }

  async function handleUpdateClientInfo(bookingId: string, field: string, value: string) {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, [field]: value }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || 'Kon klantinfo niet bijwerken');
        return;
      }

      loadBookings();
    } catch (err) {
      setError('Kon klantinfo niet bijwerken');
    }
  }

  function generateCalendarUrl(booking: Booking) {
    const startDate = booking.event_date.replace(/-/g, '');
    const title = encodeURIComponent(`DJ Bazuri - ${booking.event_name}`);
    const details = encodeURIComponent(
      `Event: ${booking.event_name}\nPakket: ${booking.package_type}\nStatus: ${booking.status}\n\nNotities: ${booking.notes || 'Geen'}`
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${startDate}&details=${details}`;
  }

  function generateIcsFile(booking: Booking) {
    const startDate = booking.event_date.replace(/-/g, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DJ Bazuri//Booking//NL
BEGIN:VEVENT
DTSTART:${startDate}
DTEND:${startDate}
SUMMARY:DJ Bazuri - ${booking.event_name}
DESCRIPTION:Event: ${booking.event_name}\\nPakket: ${booking.package_type}\\nStatus: ${booking.status}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dj-bazuri-${booking.event_name.replace(/\s+/g, '-').toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'completed':
        return 'bg-blue-600';
      case 'cancelled':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <AdminNav />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-600/50 rounded-xl text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-purple-500">Boekingen Beheer</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          {showForm ? 'Annuleren' : '+ Nieuwe Boeking'}
        </button>
      </div>

      {/* Generated Credentials Modal */}
      {generatedCredentials && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-purple-500/30 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-green-400 mb-4">Account Aangemaakt!</h2>
            <p className="text-gray-300 mb-4">
              Stuur deze gegevens naar de klant zodat ze kunnen inloggen:
            </p>

            <div className="space-y-3 bg-black rounded-lg p-4 mb-4">
              <div>
                <label className="text-xs text-gray-500">Email</label>
                <div className="flex items-center gap-2">
                  <code className="text-purple-400 flex-1">{generatedCredentials.email}</code>
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.email)}
                    className="px-2 py-1 bg-purple-600 rounded text-xs hover:bg-purple-700"
                  >
                    Kopieer
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Wachtwoord</label>
                <div className="flex items-center gap-2">
                  <code className="text-purple-400 flex-1">{generatedCredentials.password}</code>
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.password)}
                    className="px-2 py-1 bg-purple-600 rounded text-xs hover:bg-purple-700"
                  >
                    Kopieer
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Login URL</label>
                <div className="flex items-center gap-2">
                  <code className="text-purple-400 flex-1 text-sm">https://djbazuri.com/nl/auth/signin</code>
                  <button
                    onClick={() => copyToClipboard('https://djbazuri.com/nl/auth/signin')}
                    className="px-2 py-1 bg-purple-600 rounded text-xs hover:bg-purple-700"
                  >
                    Kopieer
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const text = `Hoi!\n\nHierbij je inloggegevens voor DJ Bazuri:\n\nEmail: ${generatedCredentials.email}\nWachtwoord: ${generatedCredentials.password}\n\nLogin op: https://djbazuri.com/nl/auth/signin\n\nDaar kun je je playlist samenstellen en met mij chatten over je event!\n\nGroetjes,\nDJ Bazuri`;
                copyToClipboard(text);
                alert('Volledige bericht gekopieerd!');
              }}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg mb-3"
            >
              Kopieer Volledig Bericht
            </button>

            <button
              onClick={() => setGeneratedCredentials(null)}
              className="w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-zinc-900 border border-purple-500/20 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Nieuwe Boeking Aanmaken</h2>
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Event Naam</label>
                <input
                  type="text"
                  value={newBooking.event_name}
                  onChange={(e) => setNewBooking({ ...newBooking, event_name: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Event Datum</label>
                <input
                  type="date"
                  value={newBooking.event_date}
                  onChange={(e) => setNewBooking({ ...newBooking, event_date: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Klant Naam</label>
                <input
                  type="text"
                  value={newBooking.client_name}
                  onChange={(e) => setNewBooking({ ...newBooking, client_name: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white"
                  placeholder="Jan Jansen"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Klant Email</label>
                <input
                  type="email"
                  value={newBooking.client_email}
                  onChange={(e) => setNewBooking({ ...newBooking, client_email: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white"
                  placeholder="klant@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pakket</label>
                <select
                  value={newBooking.package_type}
                  onChange={(e) => setNewBooking({ ...newBooking, package_type: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={newBooking.status}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, status: e.target.value as any })
                  }
                  className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white"
                >
                  <option value="pending">In afwachting</option>
                  <option value="confirmed">Bevestigd</option>
                  <option value="completed">Voltooid</option>
                  <option value="cancelled">Geannuleerd</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Notities</label>
              <textarea
                value={newBooking.notes}
                onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Boeking Aanmaken
            </button>
          </form>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Aankomende Events</h2>
        <div className="space-y-4">
          {bookings
            .filter((b) => new Date(b.event_date) >= new Date() && b.status !== 'cancelled')
            .map((booking) => (
              <div
                key={booking.id}
                className="bg-zinc-900 border border-purple-500/20 rounded-xl p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{booking.event_name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}
                      >
                        {booking.status === 'pending' && 'In afwachting'}
                        {booking.status === 'confirmed' && 'Bevestigd'}
                        {booking.status === 'completed' && 'Voltooid'}
                        {booking.status === 'cancelled' && 'Geannuleerd'}
                      </span>
                      {booking.user_id && (
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">
                          Account actief
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 space-y-1">
                      <p>
                        📅{' '}
                        {new Date(booking.event_date).toLocaleDateString('nl-NL', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p>📦 Pakket: {booking.package_type}</p>
                      {booking.client_name && <p>👤 Klant: {booking.client_name}</p>}
                      {booking.client_email && <p>📧 Email: {booking.client_email}</p>}
                      {booking.notes && <p>📝 {booking.notes}</p>}
                    </div>

                    {/* Client info editing */}
                    {!booking.user_id && (
                      <div className="mt-4 p-4 bg-black/50 rounded-lg">
                        <p className="text-sm text-yellow-400 mb-3">
                          Vul klantgegevens in om een account aan te maken:
                        </p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Klant naam"
                            defaultValue={booking.client_name || ''}
                            onBlur={(e) =>
                              handleUpdateClientInfo(booking.id, 'client_name', e.target.value)
                            }
                            className="px-3 py-2 bg-zinc-800 border border-purple-500/30 rounded-lg text-sm"
                          />
                          <input
                            type="email"
                            placeholder="Klant email"
                            defaultValue={booking.client_email || ''}
                            onBlur={(e) =>
                              handleUpdateClientInfo(booking.id, 'client_email', e.target.value)
                            }
                            className="px-3 py-2 bg-zinc-800 border border-purple-500/30 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {!booking.user_id && (
                      <button
                        onClick={() => handleGenerateCredentials(booking)}
                        disabled={generatingFor === booking.id || !booking.client_email}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingFor === booking.id ? 'Bezig...' : '🔑 Maak Account'}
                      </button>
                    )}
                    {booking.access_token && (
                      <button
                        onClick={() => {
                          const link = `${window.location.origin}/toegang/${booking.access_token}`;
                          copyToClipboard(link);
                          alert('Link gekopieerd naar klembord!');
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
                      >
                        🔗 Kopieer Link
                      </button>
                    )}
                    <a
                      href={`/nl/dashboard/${booking.id}/playlist`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors text-center text-sm"
                    >
                      🎵 Bekijk Playlist
                    </a>
                    <a
                      href={generateCalendarUrl(booking)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center text-sm"
                    >
                      📅 Google Agenda
                    </a>
                    <button
                      onClick={() => generateIcsFile(booking)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
                    >
                      📥 Download .ics
                    </button>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className="px-4 py-2 bg-zinc-800 border border-purple-500/30 rounded-lg text-sm"
                    >
                      <option value="pending">In afwachting</option>
                      <option value="confirmed">Bevestigd</option>
                      <option value="completed">Voltooid</option>
                      <option value="cancelled">Geannuleerd</option>
                    </select>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                    >
                      🗑️ Verwijderen
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {bookings.filter((b) => new Date(b.event_date) >= new Date() && b.status !== 'cancelled')
            .length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Geen aankomende events. Maak een nieuwe boeking aan.
            </div>
          )}
        </div>
      </div>

      {/* Past Events */}
      {bookings.filter((b) => new Date(b.event_date) < new Date() || b.status === 'cancelled')
        .length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-500">Afgelopen / Geannuleerde Events</h2>
          <div className="space-y-4 opacity-60">
            {bookings
              .filter((b) => new Date(b.event_date) < new Date() || b.status === 'cancelled')
              .map((booking) => (
                <div
                  key={booking.id}
                  className="bg-zinc-900 border border-purple-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{booking.event_name}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(booking.event_date).toLocaleDateString('nl-NL')} -{' '}
                        {booking.package_type}
                        {booking.client_name && ` - ${booking.client_name}`}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
