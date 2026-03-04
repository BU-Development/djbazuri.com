import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { isAdmin } from '@/lib/admin';
import { sendStatusUpdateEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const supabase = getAdminSupabase();
    let query = supabase.from('bookings').select('*');
    if (id) {
      query = query.eq('id', id);
    } else {
      query = query.order('event_date', { ascending: true });
    }
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/admin/bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event_name, event_date, package_type, status, notes, client_name, client_email } = body;

    if (!event_name || !event_date) {
      return NextResponse.json({ error: 'Event name and date are required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        event_name,
        event_date,
        package_type: package_type || 'basic',
        status: status || 'pending',
        notes: notes || '',
        client_name: client_name || null,
        client_email: client_email || null,
        // access_token wordt automatisch gegenereerd door de database DEFAULT
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in POST /api/admin/bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // Haal huidige booking op voor email notificatie
    const { data: currentBooking } = await supabase
      .from('bookings')
      .select('status, client_email, client_name, event_name, access_token')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Stuur log-email als de status is gewijzigd
    if (
      currentBooking &&
      updateData.status &&
      updateData.status !== currentBooking.status &&
      currentBooking.access_token
    ) {
      try {
        await sendStatusUpdateEmail(
          'logs@djbazuri.com',
          currentBooking.client_name || '',
          currentBooking.access_token,
          currentBooking.event_name,
          updateData.status
        );
      } catch (emailError) {
        console.error('Email versturen mislukt (niet kritiek):', emailError);
      }
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/admin/bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting booking:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
