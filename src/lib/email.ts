// Email helper via Resend API (geen SMTP nodig)
// Stel RESEND_API_KEY in als environment variabele

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'DJ Bazuri <noreply@djbazuri.com>';

  if (!apiKey) {
    console.warn('RESEND_API_KEY niet ingesteld, email niet verstuurd');
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Resend email fout:', error);
    throw new Error(`Email versturen mislukt: ${response.status}`);
  }
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://djbazuri.com';
}

export async function sendBookingAccessEmail(
  clientEmail: string,
  clientName: string,
  accessToken: string,
  eventName: string
): Promise<void> {
  const link = `${getBaseUrl()}/toegang/${accessToken}`;
  const name = clientName || 'daar';

  await sendEmail(
    clientEmail,
    `Je toegang voor ${eventName} - DJ Bazuri`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
      <h1 style="color: #a855f7; margin-bottom: 8px;">DJ Bazuri</h1>
      <h2 style="color: #fff; margin-bottom: 24px;">Je boeking is aangemaakt!</h2>
      <p style="color: #ccc;">Hoi ${name},</p>
      <p style="color: #ccc;">Je boeking voor <strong style="color: #fff;">${eventName}</strong> is aangemaakt. Via de knop hieronder kun je direct toegang krijgen tot jouw dashboard — geen account nodig!</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${link}" style="background: #9333ea; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Naar mijn dashboard
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Of kopieer deze link: ${link}</p>
      <p style="color: #666; font-size: 14px; margin-top: 24px;">Bewaar deze link goed — dit is je toegang tot je playlist en chat.</p>
      <hr style="border-color: #333; margin: 24px 0;">
      <p style="color: #666; font-size: 12px;">DJ Bazuri | djbazuri.com</p>
    </div>
    `
  );
}

export async function sendChatNotificationEmail(
  clientEmail: string,
  clientName: string,
  accessToken: string,
  eventName: string
): Promise<void> {
  const link = `${getBaseUrl()}/toegang/${accessToken}`;
  const name = clientName || 'daar';

  await sendEmail(
    clientEmail,
    'DJ Bazuri heeft je een bericht gestuurd',
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
      <h1 style="color: #a855f7; margin-bottom: 8px;">DJ Bazuri</h1>
      <h2 style="color: #fff; margin-bottom: 24px;">Nieuw bericht</h2>
      <p style="color: #ccc;">Hoi ${name},</p>
      <p style="color: #ccc;">DJ Bazuri heeft je een bericht gestuurd over <strong style="color: #fff;">${eventName}</strong>.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${link}" style="background: #9333ea; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Bekijk bericht
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Of kopieer deze link: ${link}</p>
      <hr style="border-color: #333; margin: 24px 0;">
      <p style="color: #666; font-size: 12px;">DJ Bazuri | djbazuri.com</p>
    </div>
    `
  );
}

export async function sendStatusUpdateEmail(
  logEmail: string,
  clientName: string,
  accessToken: string,
  eventName: string,
  newStatus: string
): Promise<void> {
  const link = `${getBaseUrl()}/toegang/${accessToken}`;
  const name = clientName || 'daar';

  const statusLabels: Record<string, string> = {
    pending: 'In afwachting',
    confirmed: 'Bevestigd',
    completed: 'Voltooid',
    cancelled: 'Geannuleerd',
  };

  const statusLabel = statusLabels[newStatus] || newStatus;

  await sendEmail(
    logEmail,
    `[LOG] Boeking status gewijzigd: ${eventName} → ${statusLabel}`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
      <h1 style="color: #a855f7; margin-bottom: 8px;">DJ Bazuri – Status Log</h1>
      <p style="color: #ccc;"><strong style="color: #fff;">Klant:</strong> ${name}</p>
      <p style="color: #ccc;"><strong style="color: #fff;">Event:</strong> ${eventName}</p>
      <p style="color: #ccc;"><strong style="color: #fff;">Nieuwe status:</strong> <span style="color: #a855f7;">${statusLabel}</span></p>
      <p style="color: #666; font-size: 14px;"><a href="${link}" style="color: #a855f7;">Klantlink: ${link}</a></p>
      <hr style="border-color: #333; margin: 24px 0;">
      <p style="color: #666; font-size: 12px;">DJ Bazuri | djbazuri.com</p>
    </div>
    `
  );
}
