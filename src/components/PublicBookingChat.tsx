'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Chat = {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
};

export default function PublicBookingChat({
  token,
  bookingId,
}: {
  token: string;
  bookingId: string;
}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();

    // Realtime abonnement op nieuwe berichten
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel(`chats-public-${bookingId}`)
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
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  async function loadChats() {
    try {
      const response = await fetch(`/api/chat-public?token=${token}`);
      const result = await response.json();

      if (!response.ok) {
        console.error('Error loading chats:', result.error);
        setIsLoading(false);
        return;
      }

      setChats(result.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading chats:', err);
    }
    setIsLoading(false);
  }

  async function handleSend() {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/chat-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          message: message.trim(),
          honeypot: '', // Lege honeypot (echte gebruikers vullen dit niet in)
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError('Je verstuurt te snel berichten. Wacht even.');
        } else {
          setError('Kon bericht niet versturen. Probeer het opnieuw.');
        }
      } else {
        setMessage('');
        await loadChats();
      }
    } catch (err) {
      setError('Kon bericht niet versturen.');
    }

    setIsSending(false);
  }

  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-2xl font-semibold mb-4 text-purple-500">Chat met DJ Bazuri</h3>
        <div className="text-center text-gray-400 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          Laden...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-purple-500/20 rounded-xl p-6">
      <h3 className="text-2xl font-semibold mb-4 text-purple-500">Chat met DJ Bazuri</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-300">
            ×
          </button>
        </div>
      )}

      {/* Berichten */}
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
                chat.is_admin ? 'bg-purple-900/30 mr-12' : 'bg-zinc-800 ml-12'
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input met verborgen honeypot veld */}
      <div className="flex gap-2">
        {/* Honeypot: verborgen voor echte gebruikers, bots vullen dit in */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
