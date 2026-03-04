import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { isAdmin, getCurrentUser } from '@/lib/admin';
import { sendChatNotificationEmail } from '@/lib/email';

export async function GET() {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminSupabase();

    // Haal alle chats met booking informatie
    const { data: chatsData, error } = await supabase
      .from('chats')
      .select(`
        *,
        bookings:booking_id (
          id,
          event_name,
          event_date,
          user_id,
          client_name,
          client_email
        )
      `)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chats:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Groepeer chats per booking
    const grouped = new Map<string, any>();

    for (const chat of chatsData || []) {
      const bookingId = chat.booking_id;

      if (!grouped.has(bookingId)) {
        // Haal user email op als er een user_id is
        let userEmail = chat.bookings?.client_email || null;

        if (!userEmail && chat.bookings?.user_id) {
          const { data: userData } = await supabase.auth.admin.getUserById(
            chat.bookings.user_id
          );
          userEmail = userData?.user?.email || null;
        }

        grouped.set(bookingId, {
          booking: chat.bookings,
          chats: [],
          userEmail,
        });
      }

      grouped.get(bookingId)!.chats.push(chat);
    }

    return NextResponse.json({ data: Array.from(grouped.values()) });
  } catch (error) {
    console.error('Error in GET /api/admin/chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await request.json();
    const { booking_id, message } = body;

    if (!booking_id || !message) {
      return NextResponse.json({ error: 'Booking ID and message are required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('chats')
      .insert({
        booking_id,
        user_id: user.id,
        message,
        is_admin: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Stuur email notificatie naar klant
    try {
      const { data: booking } = await supabase
        .from('bookings')
        .select('client_email, client_name, event_name, access_token')
        .eq('id', booking_id)
        .single();

      if (booking?.client_email && booking?.access_token) {
        await sendChatNotificationEmail(
          booking.client_email,
          booking.client_name || '',
          booking.access_token,
          booking.event_name
        );
      }
    } catch (emailError) {
      console.error('Email versturen mislukt (niet kritiek):', emailError);
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in POST /api/admin/chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
