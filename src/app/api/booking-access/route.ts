import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// GET - Valideer access token en geef booking terug (geen auth vereist)
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(`booking-access:${ip}`, 30, 60_000)) {
      return NextResponse.json({ error: 'Te veel verzoeken, probeer het later opnieuw' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is vereist' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, event_name, event_date, package_type, status, client_name, client_email, access_token')
      .eq('access_token', token)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: 'Ongeldige of verlopen link' }, { status: 404 });
    }

    // Geef alleen de benodigde velden terug (geen gevoelige data)
    return NextResponse.json({
      data: {
        id: booking.id,
        event_name: booking.event_name,
        event_date: booking.event_date,
        package_type: booking.package_type,
        status: booking.status,
        client_name: booking.client_name,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/booking-access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
