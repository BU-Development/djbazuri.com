// Email helper via Brevo API (geen SMTP nodig)
// Stel BREVO_API_KEY en BREVO_FROM_EMAIL in als environment variabelen

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@djbazuri.com';
  const fromName = process.env.BREVO_FROM_NAME || 'DJ Bazuri';

  if (!apiKey) {
    console.warn('BREVO_API_KEY niet ingesteld, email niet verstuurd');
    return;
  }

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Brevo email fout:', error);
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
  clientEmail: string,
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
    clientEmail,
    `Je boeking status is bijgewerkt - DJ Bazuri`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
      <h1 style="color: #a855f7; margin-bottom: 8px;">DJ Bazuri</h1>
      <h2 style="color: #fff; margin-bottom: 24px;">Status bijgewerkt</h2>
      <p style="color: #ccc;">Hoi ${name},</p>
      <p style="color: #ccc;">De status van je boeking voor <strong style="color: #fff;">${eventName}</strong> is bijgewerkt naar:</p>
      <p style="color: #a855f7; font-size: 20px; font-weight: bold; text-align: center; margin: 24px 0;">${statusLabel}</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${link}" style="background: #9333ea; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Naar mijn dashboard
        </a>
      </div>
      <hr style="border-color: #333; margin: 24px 0;">
      <p style="color: #666; font-size: 12px;">DJ Bazuri | djbazuri.com</p>
    </div>
    `
  );
}
