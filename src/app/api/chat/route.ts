import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAdminSupabase } from '@/lib/supabase-admin';

// Create a Supabase client for authentication
function createSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// GET - Load chats for user
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminSupabase = getAdminSupabase();

    // First, find or create a booking for this user
    let { data: booking, error: bookingError } = await adminSupabase
      .from('bookings')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (bookingError || !booking) {
      // No booking exists, create a default one
      const { data: newBooking, error: createError } = await adminSupabase
        .from('bookings')
        .insert({
          user_id: user.id,
          event_name: 'Mijn Event',
          event_date: new Date().toISOString().split('T')[0],
          status: 'pending',
          client_email: user.email,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating booking:', createError);
        return NextResponse.json({ error: 'Could not create booking' }, { status: 500 });
      }

      booking = newBooking;
    }

    // Load chats for this booking
    const { data: chats, error: chatsError } = await adminSupabase
      .from('chats')
      .select('*')
      .eq('booking_id', booking.id)
      .order('created_at', { ascending: true });

    if (chatsError) {
      console.error('Error loading chats:', chatsError);
      return NextResponse.json({ error: 'Could not load chats' }, { status: 500 });
    }

    return NextResponse.json({
      data: chats || [],
      bookingId: booking.id
    });
  } catch (error) {
    console.error('Error in GET /api/chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a new chat message
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { message, bookingId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();

    // Verify the booking exists and belongs to this user
    let finalBookingId = bookingId;

    if (!finalBookingId) {
      // Find or create booking for this user
      let { data: booking, error: bookingError } = await adminSupabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (bookingError || !booking) {
        // Create a default booking
        const { data: newBooking, error: createError } = await adminSupabase
          .from('bookings')
          .insert({
            user_id: user.id,
            event_name: 'Mijn Event',
            event_date: new Date().toISOString().split('T')[0],
            status: 'pending',
            client_email: user.email,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating booking:', createError);
          return NextResponse.json({ error: 'Could not create booking' }, { status: 500 });
        }

        booking = newBooking;
      }

      finalBookingId = booking.id;
    } else {
      // Verify the provided booking belongs to this user
      const { data: booking, error: verifyError } = await adminSupabase
        .from('bookings')
        .select('id')
        .eq('id', finalBookingId)
        .eq('user_id', user.id)
        .single();

      if (verifyError || !booking) {
        return NextResponse.json({ error: 'Invalid booking' }, { status: 403 });
      }
    }

    // Insert the chat message
    const { data: chat, error: chatError } = await adminSupabase
      .from('chats')
      .insert({
        booking_id: finalBookingId,
        user_id: user.id,
        message: message.trim(),
        is_admin: false,
      })
      .select()
      .single();

    if (chatError) {
      console.error('Error inserting chat:', chatError);
      return NextResponse.json({ error: 'Could not send message' }, { status: 500 });
    }

    return NextResponse.json({ data: chat, bookingId: finalBookingId });
  } catch (error) {
    console.error('Error in POST /api/chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
