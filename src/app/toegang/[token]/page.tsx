'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PublicBookingChat from '@/components/PublicBookingChat';

type Booking = {
  id: string;
  event_name: string;
  event_date: string;
  package_type: string;
  status: string;
  client_name: string | null;
};

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  eventDate.setHours(0, 0, 0, 0);
  return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const packageLabels: Record<string, string> = {
  basic: 'Basic',
  premium: 'Premium',
  deluxe: 'Deluxe',
  custom: 'Custom',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'In afwachting', color: 'bg-yellow-600' },
  confirmed: { label: 'Bevestigd', color: 'bg-green-600' },
  completed: { label: 'Voltooid', color: 'bg-blue-600' },
  cancelled: { label: 'Geannuleerd', color: 'bg-red-600' },
};

export default function ToegangsPage() {
  const params = useParams();
  const token = params.token as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooking() {
      try {
        const response = await fetch(`/api/booking-access?token=${token}`);
        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Ongeldige of verlopen link');
          return;
        }

        setBooking(result.data);
      } catch {
        setError('Er is iets misgegaan. Probeer het opnieuw.');
      } finally {
        setIsLoading(false);
      }
    }

    if (token) loadBooking();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔗</div>
          <h1 className="text-2xl font-bold text-white mb-4">Link niet geldig</h1>
          <p className="text-gray-400 mb-8">
            {error || 'Deze link bestaat niet of is verlopen. Neem contact op met DJ Bazuri.'}
          </p>
          <a
            href="https://djbazuri.com"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Terug naar djbazuri.com
          </a>
        </div>
      </div>
    );
  }

  const daysUntil = getDaysUntil(booking.event_date);
  const status = statusLabels[booking.status] || { label: booking.status, color: 'bg-gray-600' };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-purple-500">DJ Bazuri</span>
          <span className="text-sm text-gray-400">Jouw event dashboard</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Welkom */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            {booking.client_name ? `Hoi ${booking.client_name}!` : 'Welkom!'}
          </h1>
          <p className="text-gray-400">Hier vind je alles over jouw event</p>
        </div>

        {/* Event Info */}
        <div className="bg-zinc-900 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{booking.event_name}</h2>
              <p className="text-gray-400 mb-3">
                📅{' '}
                {new Date(booking.event_date).toLocaleDateString('nl-NL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
                  {status.label}
                </span>
                <span className="px-3 py-1 bg-zinc-700 rounded-full text-sm">
                  📦 {packageLabels[booking.package_type] || booking.package_type}
                </span>
              </div>
            </div>

            {/* Countdown */}
            {daysUntil > 0 ? (
              <div className="text-center bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 min-w-[120px]">
                <div className="text-4xl font-bold text-purple-400">{daysUntil}</div>
                <div className="text-sm text-gray-400">
                  {daysUntil === 1 ? 'dag te gaan' : 'dagen te gaan'}
                </div>
              </div>
            ) : daysUntil === 0 ? (
              <div className="text-center bg-green-900/30 border border-green-500/30 rounded-xl p-4 min-w-[120px]">
                <div className="text-2xl font-bold text-green-400">Vandaag!</div>
                <div className="text-sm text-gray-400">het grote moment</div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Playlist */}
        <div className="bg-zinc-900 border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-2 text-purple-500">🎵 Jouw Playlist</h3>
          <p className="text-gray-400 mb-4">
            Voeg je favoriete nummers toe, markeer must-haves en geef aan welke nummers je liever
            niet hoort.
          </p>
          <a
            href={`/nl/dashboard/${booking.id}/playlist`}
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Playlist beheren
          </a>
        </div>

        {/* Chat */}
        <PublicBookingChat token={token} bookingId={booking.id} />

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm pb-4">
          <p>Vragen? Chat met DJ Bazuri hierboven of stuur een bericht via Instagram.</p>
        </div>
      </div>
    </div>
  );
}
