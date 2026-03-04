import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Helper: haal booking op via access token
async function getBookingByToken(token: string) {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('bookings')
    .select('id, client_email, client_name, event_name, access_token')
    .eq('access_token', token)
    .single();

  if (error || !data) return null;
  return data;
}

// GET - Haal chats op via access token (geen auth vereist)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is vereist' }, { status: 400 });
    }

    const booking = await getBookingByToken(token);
    if (!booking) {
      return NextResponse.json({ error: 'Ongeldige link' }, { status: 404 });
    }

    const supabase = getAdminSupabase();
    const { data: chats, error } = await supabase
      .from('chats')
      .select('id, message, is_admin, created_at')
      .eq('booking_id', booking.id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Kon berichten niet laden' }, { status: 500 });
    }

    return NextResponse.json({ data: chats || [], bookingId: booking.id });
  } catch (error) {
    console.error('Error in GET /api/chat-public:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Verstuur bericht via access token (geen auth vereist)
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const { token, message, honeypot } = body;

    // Honeypot check: als het veld gevuld is, is het een bot
    if (honeypot) {
      // Doe alsof het gelukt is zodat de bot denkt dat het werkt
      return NextResponse.json({ data: { id: 'fake', message, is_admin: false, created_at: new Date().toISOString() } });
    }

    if (!token) {
      return NextResponse.json({ error: 'Token is vereist' }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Bericht is vereist' }, { status: 400 });
    }

    // Rate limiting per token + IP
    const rateLimitKey = `chat-public:${token}:${ip}`;
    if (!checkRateLimit(rateLimitKey, 10, 5 * 60_000)) {
      return NextResponse.json(
        { error: 'Je verstuurt te snel berichten. Wacht even.' },
        { status: 429 }
      );
    }

    const booking = await getBookingByToken(token);
    if (!booking) {
      return NextResponse.json({ error: 'Ongeldige link' }, { status: 404 });
    }

    const supabase = getAdminSupabase();
    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        booking_id: booking.id,
        user_id: null, // Geen account nodig bij magic link
        message: message.trim(),
        is_admin: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting public chat:', error);
      return NextResponse.json({ error: 'Kon bericht niet versturen' }, { status: 500 });
    }

    return NextResponse.json({ data: chat, bookingId: booking.id });
  } catch (error) {
    console.error('Error in POST /api/chat-public:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
