'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import AuthGuard from '@/components/AuthGuard';
import BookingChat from '@/components/BookingChat';

interface Track {
  id: string;
  priority: 'must_have' | 'normal' | 'blacklist';
}

function DashboardContent({ locale }: { locale: string }) {
  const t = useTranslations('dashboard');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ eventName: '', eventDate: '' });
  const [trackCounts, setTrackCounts] = useState({ mustHave: 0, normal: 0, blacklist: 0 });

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Load event details from localStorage
    const savedEventName = localStorage.getItem('event_name') || '';
    const savedEventDate = localStorage.getItem('event_date') || '';

    // Load playlist tracks from localStorage
    const savedTracks = localStorage.getItem('playlist_tracks');
    if (savedTracks) {
      try {
        const tracks: Track[] = JSON.parse(savedTracks);
        setTrackCounts({
          mustHave: tracks.filter(t => t.priority === 'must_have').length,
          normal: tracks.filter(t => t.priority === 'normal').length,
          blacklist: tracks.filter(t => t.priority === 'blacklist').length,
        });
      } catch (e) {
        // Invalid JSON, ignore
      }
    }

    setBooking({
      eventName: savedEventName || 'Mijn Event',
      eventDate: savedEventDate || new Date().toISOString().split('T')[0],
      status: 'confirmed',
    });
    setEditForm({
      eventName: savedEventName || 'Mijn Event',
      eventDate: savedEventDate || new Date().toISOString().split('T')[0],
    });
    setLoading(false);
  }, []);

  const handleSaveEvent = () => {
    localStorage.setItem('event_name', editForm.eventName);
    localStorage.setItem('event_date', editForm.eventDate);
    setBooking({
      ...booking,
      eventName: editForm.eventName,
      eventDate: editForm.eventDate,
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900 rounded-lg shadow-md p-8 text-center border border-purple-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">Geen Boeking Gevonden</h2>
          <p className="text-gray-400 mb-6">
            Je hebt nog geen actieve boeking. Neem contact op met DJ Bazuri om een evenement te boeken.
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Contact DJ Bazuri
          </Link>
        </div>
      </div>
    );
  }

  const daysUntilEvent = Math.ceil(
    (new Date(booking.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-xl text-gray-400">{t('welcome')}, {user?.email?.split('@')[0] || 'Gebruiker'}!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 border border-purple-500/20 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{t('booking.title')}</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  ✏️ Bewerken
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Event Naam</label>
                  <input
                    type="text"
                    value={editForm.eventName}
                    onChange={(e) => setEditForm({ ...editForm, eventName: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Bijv. Bruiloft Jan & Lisa"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Event Datum</label>
                  <input
                    type="date"
                    value={editForm.eventDate}
                    onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEvent}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Opslaan
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({ eventName: booking.eventName, eventDate: booking.eventDate });
                    }}
                    className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">{t('booking.eventName')}</p>
                  <p className="text-lg font-semibold text-white">{booking.eventName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">{t('booking.eventDate')}</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(booking.eventDate).toLocaleDateString('nl-NL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">{t('booking.status')}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.status === 'confirmed'
                        ? 'bg-green-600 text-white'
                        : booking.status === 'pending'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}
                  >
                    {t(`booking.${booking.status}`)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-600 rounded-lg shadow-md border border-purple-500/30 p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Event Countdown</h2>
            <div className="text-center mb-4">
              <div className="text-6xl font-bold mb-2">{daysUntilEvent}</div>
              <p className="text-xl">dagen tot je evenement</p>
            </div>
            <a
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.eventName + ' - DJ Bazuri')}&dates=${booking.eventDate.replace(/-/g, '')}/${booking.eventDate.replace(/-/g, '')}&details=${encodeURIComponent('Event met DJ Bazuri\n\nBekijk je playlist: ' + (typeof window !== 'undefined' ? window.location.origin : '') + '/' + locale + '/dashboard/playlist')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors text-sm"
            >
              📅 Toevoegen aan Google Agenda
            </a>
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-500/20 rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('playlist.title')}</h2>
              <p className="text-gray-400">
                Maak je eigen playlist met je favoriete nummers
              </p>
            </div>
            <svg
              className="w-16 h-16 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-600/20 border border-green-600/30 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">{trackCounts.mustHave}</div>
              <p className="text-sm text-gray-400">Must-Have Nummers</p>
            </div>
            <div className="bg-blue-600/20 border border-blue-600/30 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{trackCounts.normal}</div>
              <p className="text-sm text-gray-400">Normale Nummers</p>
            </div>
            <div className="bg-red-600/20 border border-red-600/30 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-400 mb-1">{trackCounts.blacklist}</div>
              <p className="text-sm text-gray-400">Blacklist Nummers</p>
            </div>
          </div>

          <Link
            href={`/${locale}/dashboard/playlist`}
            className="block w-full text-center py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            {t('playlist.button')}
          </Link>
        </div>

        {/* Chat Component */}
        <div className="mb-8">
          <BookingChat bookingId="demo-booking-id" />
        </div>

        <div className="mt-6 bg-zinc-900 border border-purple-500/20 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-400 mb-2">Quick Tips</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Voeg je favoriete nummers toe aan de playlist creator</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Markeer must-have nummers die je echt wilt horen</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Blacklist nummers die je niet wilt horen op je evenement</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <AuthGuard>
      <DashboardContent locale={locale} />
    </AuthGuard>
  );
}
