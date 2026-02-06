import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    // First verify the request is from an admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { email, password, bookingId, eventName, clientName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create user with admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        booking_id: bookingId,
        event_name: eventName,
        client_name: clientName,
      },
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Update booking with user_id if bookingId provided
    if (bookingId && newUser.user) {
      await supabaseAdmin
        .from('bookings')
        .update({
          user_id: newUser.user.id,
          client_email: email,
          client_name: clientName,
        })
        .eq('id', bookingId);
    }

    return NextResponse.json({
      success: true,
      userId: newUser.user?.id,
      email: newUser.user?.email,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
