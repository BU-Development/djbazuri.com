import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { type, bookingId, message } = await request.json();

    // Haal booking informatie op
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, users:user_id(email)')
      .eq('id', bookingId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Haal admin email op
    const { data: config } = await supabase
      .from('site_config')
      .select('admin_email')
      .single();

    if (!config) {
      return NextResponse.json({ error: 'Admin email not configured' }, { status: 500 });
    }

    let emailData;

    if (type === 'customer_message') {
      // Stuur email naar admin
      emailData = {
        to: config.admin_email,
        subject: `Nieuw bericht voor booking: ${booking.event_name}`,
        html: `
          <h2>Nieuw bericht van klant</h2>
          <p><strong>Event:</strong> ${booking.event_name}</p>
          <p><strong>Datum:</strong> ${new Date(booking.event_date).toLocaleDateString('nl-NL')}</p>
          <p><strong>Van:</strong> ${(booking.users as any).email}</p>
          <p><strong>Bericht:</strong></p>
          <p>${message}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/chats">Bekijk in admin panel</a></p>
        `,
      };
    } else if (type === 'admin_reply') {
      // Stuur email naar klant
      emailData = {
        to: (booking.users as any).email,
        subject: `Nieuw bericht van DJ Bazuri voor je booking`,
        html: `
          <h2>Nieuw bericht van DJ Bazuri</h2>
          <p><strong>Event:</strong> ${booking.event_name}</p>
          <p><strong>Datum:</strong> ${new Date(booking.event_date).toLocaleDateString('nl-NL')}</p>
          <p><strong>Bericht:</strong></p>
          <p>${message}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/en/dashboard">Bekijk je dashboard</a></p>
        `,
      };
    }

    // Gebruik Supabase Edge Function of een email service zoals Resend, SendGrid, etc.
    // Voor nu loggen we alleen de email data
    console.log('Email zou worden verzonden:', emailData);

    // TODO: Implementeer de daadwerkelijke email verzending met een service zoals:
    // - Resend (https://resend.com)
    // - SendGrid (https://sendgrid.com)
    // - Supabase Edge Function met SMTP

    // Voorbeeld met Resend (installeer eerst: npm install resend):
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'DJ Bazuri <noreply@djbazuri.com>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
