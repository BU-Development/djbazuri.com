'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Booking = {
  id: string;
  user_id: string;
  event_name: string;
  event_date: string;
  package_type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    event_name: '',
    event_date: '',
    package_type: 'basic',
    status: 'pending' as const,
    notes: '',
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('event_date', { ascending: true });

    if (!error && data) {
      setBookings(data);
    }
    setIsLoading(false);
  }

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from('bookings').insert({
      event_name: newBooking.event_name,
      event_date: newBooking.event_date,
      package_type: newBooking.package_type,
      status: newBooking.status,
      notes: newBooking.notes,
    });

    if (!error) {
      setNewBooking({
        event_name: '',
        event_date: '',
        package_type: 'basic',
        status: 'pending',
        notes: '',
      });
      setShowForm(false);
      loadBookings();
    }
  }

  async function handleStatusChange(id: string, status: string) {
    await supabase.from('bookings').update({ status }).eq('id', id);
    loadBookings();
  }

  async function handleDelete(id: string) {
    if (confirm('Weet je zeker dat je deze boeking wilt verwijderen?')) {
      await supabase.from('bookings').delete().eq('id', id);
      loadBookings();
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-purple-500">Boekingen Beheer</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          {showForm ? 'Annuleren' : '+ Nieuwe Boeking'}
        </button>
      </div>

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
                <div className="flex items-start justify-between">
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
                      {booking.notes && <p>📝 {booking.notes}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
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
  );
}
