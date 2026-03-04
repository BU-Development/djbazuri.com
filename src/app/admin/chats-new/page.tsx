'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import AdminNav from '@/components/AdminNav';

type Booking = {
  id: string;
  event_name: string;
  event_date: string;
  client_email: string;
  status: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
};

type Chat = {
  id: string;
  booking_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
};

export default function AdminChatsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (selectedBooking) {
      loadChats(selectedBooking.id);

      // Set up real-time subscription for selected booking
      const channel = supabase
        .channel(`admin-chats-${selectedBooking.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chats',
            filter: `booking_id=eq.${selectedBooking.id}`,
          },
          () => {
            loadChats(selectedBooking.id);
            loadBookings(); // Refresh to update last message
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedBooking]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  async function loadBookings() {
    try {
      const response = await fetch('/api/admin/bookings');
      const data = await response.json();

      if (response.ok) {
        // Load last message for each booking
        const bookingsWithMessages = await Promise.all(
          data.map(async (booking: Booking) => {
            const chatsRes = await fetch(`/api/admin/chats?booking_id=${booking.id}`);
            const chatsData = await chatsRes.json();
            const chats = chatsData.chats || [];
            const lastChat = chats[chats.length - 1];

            // Count unread messages (customer messages that came after the last admin message)
            const lastAdminMessageIndex = chats.reverse().findIndex((c: Chat) => c.is_admin);
            const unreadCount = lastAdminMessageIndex === -1
              ? chats.filter((c: Chat) => !c.is_admin).length
              : lastAdminMessageIndex;

            return {
              ...booking,
              lastMessage: lastChat?.message || 'Nog geen berichten',
              lastMessageTime: lastChat?.created_at,
              unreadCount: unreadCount,
            };
          })
        );

        setBookings(bookingsWithMessages);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
    setLoading(false);
  }

  async function loadChats(bookingId: string) {
    try {
      const response = await fetch(`/api/admin/chats?booking_id=${bookingId}`);
      const data = await response.json();

      if (response.ok) {
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }

  async function sendMessage() {
    if (!message.trim() || !selectedBooking || sending) return;

    setSending(true);

    try {
      const response = await fetch('/api/admin/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          message: message.trim(),
          is_admin: true,
        }),
      });

      if (response.ok) {
        setMessage('');
        await loadChats(selectedBooking.id);
        await loadBookings();
      } else {
        alert('Kon bericht niet versturen');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Fout bij versturen bericht');
    }

    setSending(false);
  }

  if (loading) {
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
        <h1 className="text-3xl font-bold text-white mb-6">Chats</h1>

        <div className="flex gap-4 h-[calc(100vh-200px)]">
          {/* Bookings List (WhatsApp-style) */}
          <div className="w-1/3 bg-zinc-900 border border-purple-500/20 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-purple-500/20">
              <h2 className="text-lg font-semibold text-white">Gesprekken</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  Geen bookings gevonden
                </div>
              ) : (
                bookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className={`w-full p-4 border-b border-zinc-800 text-left hover:bg-zinc-800 transition-colors ${
                      selectedBooking?.id === booking.id ? 'bg-zinc-800' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">
                          {booking.event_name}
                        </h3>
                        {(booking.unreadCount ?? 0) > 0 && (
                          <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-purple-600 rounded-full">
                            {booking.unreadCount}
                          </span>
                        )}
                      </div>
                      {booking.lastMessageTime && (
                        <span className="text-xs text-gray-500 ml-2 shrink-0">
                          {new Date(booking.lastMessageTime).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{booking.client_email}</p>
                    <p className={`text-sm truncate ${(booking.unreadCount ?? 0) > 0 ? 'text-white font-medium' : 'text-gray-500'}`}>
                      {booking.lastMessage}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 bg-zinc-900 border border-purple-500/20 rounded-lg flex flex-col">
            {selectedBooking ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-purple-500/20">
                  <h2 className="text-xl font-semibold text-white">
                    {selectedBooking.event_name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedBooking.client_email} •{' '}
                    {new Date(selectedBooking.event_date).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chats.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      Nog geen berichten. Start een gesprek!
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex ${chat.is_admin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            chat.is_admin
                              ? 'bg-purple-600 text-white'
                              : 'bg-zinc-800 text-white'
                          }`}
                        >
                          <p className="wrap-break-word">{chat.message}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(chat.created_at).toLocaleTimeString('nl-NL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-purple-500/20">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type een bericht..."
                      className="flex-1 px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      disabled={sending}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !message.trim()}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? '...' : 'Verstuur'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p>Selecteer een gesprek om te beginnen</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
