'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import BookingChat from '@/components/BookingChat';

export default function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('dashboard');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setBooking({
        eventName: 'Birthday Party',
        eventDate: '2026-03-15',
        status: 'confirmed',
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Booking Found</h2>
          <p className="text-gray-600 mb-6">
            You don't have an active booking. Please contact DJ Bazuri to book an event.
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
          <p className="text-xl text-gray-400">{t('welcome')}, User!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-dark-50 border border-primary/20 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-white mb-4">{t('booking.title')}</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">{t('booking.eventName')}</p>
                <p className="text-lg font-semibold text-white">{booking.eventName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">{t('booking.eventDate')}</p>
                <p className="text-lg font-semibold text-white">
                  {new Date(booking.eventDate).toLocaleDateString()}
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
          </div>

          <div className="bg-gradient-to-br from-primary-700 to-primary rounded-lg shadow-md border border-primary/30 p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Event Countdown</h2>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{daysUntilEvent}</div>
              <p className="text-xl">days until your event</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-50 border border-primary/20 rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('playlist.title')}</h2>
              <p className="text-gray-400">
                Create your personalized playlist with your favorite songs
              </p>
            </div>
            <svg
              className="w-16 h-16 text-primary"
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
              <div className="text-3xl font-bold text-green-400 mb-1">0</div>
              <p className="text-sm text-gray-400">Must-Have Songs</p>
            </div>
            <div className="bg-blue-600/20 border border-blue-600/30 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">0</div>
              <p className="text-sm text-gray-400">Normal Songs</p>
            </div>
            <div className="bg-red-600/20 border border-red-600/30 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-400 mb-1">0</div>
              <p className="text-sm text-gray-400">Blacklisted Songs</p>
            </div>
          </div>

          <Link
            href={`/${locale}/dashboard/playlist`}
            className="block w-full text-center py-4 bg-primary hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors"
          >
            {t('playlist.button')}
          </Link>
        </div>

        {/* Chat Component */}
        <div className="mb-8">
          <BookingChat bookingId="demo-booking-id" />
        </div>

        <div className="mt-6 bg-dark-50 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-bold text-primary mb-2">Quick Tips</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Add your favorite songs to the playlist creator</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Mark must-have songs that you really want to hear</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Blacklist songs you don't want to hear at your event</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
