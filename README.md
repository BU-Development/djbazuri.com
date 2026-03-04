# DJ Bazuri — Website & Boekingssysteem

Een open source DJ booking website met magic link dashboard, Spotify playlist integratie en real-time chat. Gebouwd met Next.js, Tailwind CSS en Supabase.

🌐 **Live:** [djbazuri.com](https://djbazuri.com)

---

## Features

- **Magic link toegang** — klanten krijgen een unieke link per e-mail, geen account nodig
- **Klantdashboard** — event info, countdown, playlist beheer en chat met de DJ
- **Spotify playlist creator** — nummers zoeken, toevoegen als must-have / normaal / blacklist
- **Real-time chat** — klant en DJ kunnen direct communiceren per boeking
- **Admin panel** — boekingen aanmaken/bewerken, chat beheer, status beheren
- **E-mail notificaties** — via Resend (chat berichten → klant, statuswijzigingen → log)
- **Rate limiting + honeypot** — bescherming tegen bots en spam
- **Cookie consent banner** — privacyvriendelijk, localStorage-gebaseerd
- **Privacybeleid pagina** — vermeldt alle gebruikte privacy-vriendelijke tools
- **Meertalig** — Nederlands en Engels (next-intl)

---

## Tech Stack

| Categorie | Technologie |
|-----------|-------------|
| Framework | Next.js 14 (App Router) |
| Taal | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + Realtime) |
| Auth (admin) | Supabase Auth |
| E-mail | Resend |
| Muziek | Spotify Web API |
| i18n | next-intl |
| Deployment | Vercel |

---

## Hoe het werkt

1. **Admin** maakt een boeking aan in het admin panel (`/admin`)
2. **Systeem** genereert automatisch een unieke `access_token` (UUID)
3. **Admin** kopieert de klantlink (`/toegang/[token]`) en stuurt die naar de klant
4. **Klant** opent de link → ziet event dashboard, kan playlist beheren en chatten
5. **DJ** reageert via het admin chat panel

---

## Projectstructuur

```
src/
├── app/
│   ├── [locale]/                  # Publieke pagina's (NL + EN)
│   │   ├── page.tsx               # Home
│   │   ├── pricing/               # Prijzen
│   │   ├── contact/               # Contact
│   │   ├── privacy/               # Privacybeleid
│   │   └── dashboard/[bookingId]/
│   │       └── playlist/          # Playlist beheer (klant)
│   ├── toegang/[token]/           # Magic link dashboard (klant)
│   ├── admin/                     # Admin panel (vereist login)
│   │   ├── bookings/              # Boekingen beheren
│   │   └── chats-new/             # Chat beheer
│   ├── admin-login/               # Admin inlogpagina
│   └── api/
│       ├── admin/bookings/        # CRUD boekingen
│       ├── admin/chats/           # Chat API (admin)
│       ├── booking-access/        # Token validatie (publiek)
│       ├── chat-public/           # Chat API (klant, rate-limited)
│       ├── playlist-tracks/       # Playlist opslaan/laden
│       └── spotify/               # Spotify integratie
├── components/
│   ├── Navigation.tsx
│   ├── PublicBookingChat.tsx      # Chat component voor klant
│   ├── TrackSearch.tsx            # Spotify zoeken
│   ├── TrackList.tsx              # Playlist weergave
│   ├── CookieConsent.tsx          # Cookie banner
│   └── AdminNav.tsx
├── lib/
│   ├── email.ts                   # Resend e-mail helpers
│   ├── rate-limit.ts              # In-memory rate limiting
│   ├── supabase-admin.ts          # Supabase service role client
│   └── admin.ts                   # Admin auth check
└── messages/
    ├── nl.json                    # Nederlandse teksten
    └── en.json                    # Engelse teksten

public/
└── images/                        # Logo's, favicon, Spotify cover
```

---

## Lokaal draaien

### 1. Repository clonen

```bash
git clone https://github.com/BU-Development/djbazuri.com.git
cd djbazuri.com
npm install
```

### 2. Environment variabelen

Maak een `.env.local` bestand aan op basis van onderstaande variabelen:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-key
SUPABASE_SERVICE_ROLE_KEY=jouw-service-role-key

# Spotify
SPOTIFY_CLIENT_ID=jouw-client-id
SPOTIFY_CLIENT_SECRET=jouw-client-secret
SPOTIFY_REFRESH_TOKEN=jouw-refresh-token

# E-mail (Resend)
RESEND_API_KEY=jouw-resend-api-key
RESEND_FROM_EMAIL=DJ Bazuri <noreply@djbazuri.com>

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database setup

Voer deze SQL uit in de Supabase SQL Editor:

```sql
-- Boekingen
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  package_type TEXT DEFAULT 'basic',
  status TEXT DEFAULT 'pending',
  notes TEXT DEFAULT '',
  client_name TEXT,
  client_email TEXT,
  access_token UUID DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlists
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
  name TEXT DEFAULT 'Event Playlist',
  spotify_playlist_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist tracks
CREATE TABLE public.playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  spotify_track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  album_image TEXT,
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chats
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS inschakelen (service role bypast dit)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
```

### 4. Admin account

Maak een admin gebruiker aan in Supabase → Authentication → Users. Dit is de enige account op de site — klanten hebben geen account nodig.

### 5. Starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin panel: [http://localhost:3000/admin-login](http://localhost:3000/admin-login)

---

## Spotify setup

1. Maak een app op [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Voeg `http://localhost:3000/api/spotify/callback` toe als Redirect URI
3. Haal een refresh token op door de OAuth flow te doorlopen met scopes `playlist-modify-public playlist-modify-private`
4. Zet de refresh token in `.env.local`

---

## Deployment (Vercel)

1. Push naar GitHub
2. Koppel repo aan Vercel
3. Voeg alle environment variabelen toe in Vercel → Settings → Environment Variables
4. Deploy

---

## Privacy

Dit project is privacy-first. Gebruikte tools achter de schermen:

- **Proton Mail / Proton VPN / Proton Drive / Proton Pass** — versleutelde communicatie en opslag
- **Signal** — end-to-end versleuteld berichtenplatform
- **Zoho Mail** — privacyvriendelijke e-maildienst

Meer informatie: [djbazuri.com/nl/privacy](https://djbazuri.com/nl/privacy)

---

## Licentie

© 2026 DJ Bazuri (BU Development) — Alle rechten voorbehouden.

De broncode is openbaar beschikbaar voor transparantie en educatieve doeleinden. Kopiëren, gebruiken of distribueren van deze code is **niet** toegestaan zonder expliciete toestemming. Zie [LICENSE](LICENSE) voor de volledige voorwaarden.
