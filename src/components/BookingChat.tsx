'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

  useEffect(() => {
    loadChats();

    // Realtime updates
    const subscription = supabase
      .channel(`booking-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `booking_id=eq.${bookingId}`,
        },
        () => {
          loadChats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [bookingId]);

  async function loadChats() {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setChats(data);
    }
    setIsLoading(false);
  }

  async function handleSend() {
    if (!message.trim() || isSending) return;

    setIsSending(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSending(false);
      return;
    }

    const { error } = await supabase.from('chats').insert({
      booking_id: bookingId,
      user_id: user.id,
      message: message.trim(),
      is_admin: false,
    });

    if (!error) {
      // Verstuur email naar admin
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'customer_message',
          bookingId,
          message: message.trim(),
        }),
      });

      setMessage('');
    }

    setIsSending(false);
  }

  if (isLoading) {
    return <div className="text-center text-gray-400">Laden...</div>;
  }

  return (
    <div className="bg-dark-50 border border-primary/20 rounded-xl p-6">
      <h3 className="text-2xl font-semibold mb-4 text-primary">
        Chat met DJ Bazuri
      </h3>

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
                  ? 'bg-primary/20 mr-12'
                  : 'bg-dark-100 ml-12'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-primary">
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
          className="input-field flex-1"
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          className="btn-primary"
        >
          {isSending ? 'Verzenden...' : 'Verstuur'}
        </button>
      </div>
    </div>
  );
}
