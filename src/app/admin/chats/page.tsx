'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Chat = {
  id: string;
  booking_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
};

type Booking = {
  id: string;
  event_name: string;
  event_date: string;
  user_id: string;
  client_name?: string;
  client_email?: string;
};

type ChatsByBooking = {
  booking: Booking;
  chats: Chat[];
  userEmail?: string;
};

export default function AdminChatsPage() {
  const [chatsByBooking, setChatsByBooking] = useState<ChatsByBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadChats();

    // Luister naar nieuwe chats
    const subscription = supabase
      .channel('chats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, () => {
        loadChats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadChats() {
    try {
      const response = await fetch('/api/admin/chats');
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Kon chats niet laden');
        return;
      }

      setChatsByBooking(result.data || []);
      setError(null);
    } catch (err) {
      setError('Kon chats niet laden');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReply(bookingId: string) {
    if (!replyMessage.trim()) return;

    try {
      const response = await fetch('/api/admin/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          message: replyMessage,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || 'Kon bericht niet versturen');
        return;
      }

      // Stuur email naar klant
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin_reply',
          bookingId,
          message: replyMessage,
        }),
      });

      setReplyMessage('');
      setSelectedBooking(null);
      loadChats();
    } catch (err) {
      setError('Kon bericht niet versturen');
    }
  }

  if (isLoading) {
    return <div className="text-center">Laden...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-primary">Chat Beheer</h1>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-600/50 rounded-xl text-red-300">
          {error}
        </div>
      )}

      {chatsByBooking.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Geen chats gevonden.
        </div>
      ) : (
        <div className="space-y-6">
          {chatsByBooking.map((item) => (
            <div
              key={item.booking.id}
              className="bg-dark-50 border border-primary/20 rounded-xl p-6"
            >
              {/* Booking Info */}
              <div className="mb-4 pb-4 border-b border-primary/20">
                <h3 className="text-xl font-semibold">{item.booking.event_name}</h3>
                <p className="text-sm text-gray-400">
                  Datum: {new Date(item.booking.event_date).toLocaleDateString('nl-NL')}
                </p>
                {item.userEmail && (
                  <p className="text-sm text-gray-400">Klant: {item.userEmail}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {item.chats.length} berichten
                </p>
              </div>

              {/* Chat Messages */}
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {item.chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 rounded-lg ${
                      chat.is_admin
                        ? 'bg-primary/20 ml-12'
                        : 'bg-dark-100 mr-12'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold text-primary">
                        {chat.is_admin ? 'Jij (Admin)' : 'Klant'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(chat.created_at).toLocaleString('nl-NL')}
                      </span>
                    </div>
                    <p className="text-white">{chat.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {selectedBooking === item.booking.id ? (
                <div className="mt-4">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type je antwoord..."
                    className="input-field min-h-24 mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReply(item.booking.id)}
                      className="btn-primary"
                    >
                      Verstuur
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(null);
                        setReplyMessage('');
                      }}
                      className="btn-secondary"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedBooking(item.booking.id)}
                  className="btn-primary w-full"
                >
                  Antwoord
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
