'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Chat = {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
};

export default function BookingChat({ bookingId }: { bookingId: string }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    initChat();
  }, [bookingId]);

  async function initChat() {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Je moet ingelogd zijn om berichten te sturen.');
      setIsLoading(false);
      return;
    }

    setUserId(user.id);

    // Use user.id as the booking_id for now (since we don't have real bookings yet)
    const chatBookingId = bookingId === 'demo-booking-id' ? user.id : bookingId;

    await loadChats(chatBookingId);

    // Realtime updates
    const subscription = supabase
      .channel(`booking-${chatBookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `booking_id=eq.${chatBookingId}`,
        },
        () => {
          loadChats(chatBookingId);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  async function loadChats(chatBookingId: string) {
    try {
      const { data, error: fetchError } = await supabase
        .from('chats')
        .select('*')
        .eq('booking_id', chatBookingId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error loading chats:', fetchError);
        // Table might not exist yet, that's ok
        if (fetchError.code === '42P01') {
          setError('Chat tabel bestaat nog niet. Maak de tabel aan in Supabase.');
        }
      } else if (data) {
        setChats(data);
      }
    } catch (err) {
      console.error('Error loading chats:', err);
    }
    setIsLoading(false);
  }

  async function handleSend() {
    if (!message.trim() || isSending || !userId) return;

    setIsSending(true);

    const chatBookingId = bookingId === 'demo-booking-id' ? userId : bookingId;

    try {
      const { error: insertError } = await supabase.from('chats').insert({
        booking_id: chatBookingId,
        user_id: userId,
        message: message.trim(),
        is_admin: false,
      });

      if (insertError) {
        console.error('Error sending message:', insertError);
        setError('Kon bericht niet versturen. Probeer het opnieuw.');
      } else {
        setMessage('');
        await loadChats(chatBookingId);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Kon bericht niet versturen.');
    }

    setIsSending(false);
  }

  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-purple-500/20 rounded-xl p-6">
        <div className="text-center text-gray-400">Laden...</div>
      </div>
    );
  }

  if (error && !userId) {
    return (
      <div className="bg-zinc-900 border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-2xl font-semibold mb-4 text-purple-500">
          Chat met DJ Bazuri
        </h3>
        <div className="text-center text-gray-400 py-8">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-purple-500/20 rounded-xl p-6">
      <h3 className="text-2xl font-semibold mb-4 text-purple-500">
        Chat met DJ Bazuri
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
        {chats.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>Nog geen berichten. Start een gesprek!</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 rounded-lg ${
                chat.is_admin
                  ? 'bg-purple-900/30 mr-12'
                  : 'bg-zinc-800 ml-12'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-purple-400">
                  {chat.is_admin ? 'DJ Bazuri' : 'Jij'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(chat.created_at).toLocaleString('nl-NL')}
                </span>
              </div>
              <p className="text-white">{chat.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type je bericht..."
          className="flex-1 px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? '...' : 'Verstuur'}
        </button>
      </div>
    </div>
  );
}
