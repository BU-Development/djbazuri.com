# DJ Bazuri Website

Een professionele DJ booking website met Spotify playlist integratie, gebouwd met Next.js 14, Tailwind CSS, en Supabase.

## Features

- ✅ **Meertalige website** (Nederlands/Engels) - automatische browser detectie
- ✅ **Responsive design** - werkt op alle apparaten
- ✅ **Home page** met hero sectie en features
- ✅ **Galerij pagina** voor event foto's
- ✅ **Prijzen pagina** met drie pakketten
- ✅ **Contact pagina** met formulier
- ✅ **User authenticatie** met Supabase
- ✅ **Dashboard** voor geboekte klanten
- ✅ **Spotify playlist creator** - klanten kunnen hun eigen playlist maken
- ✅ **Priority system** - Must-Have, Normal, en Blacklist tracks
- ✅ **Direct naar DJ's Spotify account** - playlists worden automatisch aangemaakt

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Internationalization**: next-intl
- **Music Integration**: Spotify Web API

## Setup Instructies

### 1. Clone en Installeer Dependencies

```bash
cd Djbazuri.com
npm install
```

### 2. Supabase Setup

#### A. Maak een Supabase Project

1. Ga naar [supabase.com](https://supabase.com)
2. Maak een nieuw project aan
3. Bewaar je project URL en anon key

#### B. Maak Database Tables

Ga naar SQL Editor in Supabase en voer uit:

```sql
-- 1. Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Playlists table
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  spotify_playlist_id VARCHAR(255),
  name VARCHAR(255) DEFAULT 'Event Playlist',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Playlist tracks table
CREATE TABLE playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  spotify_track_id VARCHAR(255) NOT NULL,
  track_name VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255) NOT NULL,
  album_image_url TEXT,
  priority VARCHAR(50) DEFAULT 'normal',
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(playlist_id, spotify_track_id)
);

-- Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own playlists" ON playlists
  FOR SELECT USING (
    booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own playlist tracks" ON playlist_tracks
  FOR ALL USING (
    playlist_id IN (
      SELECT p.id FROM playlists p
      JOIN bookings b ON b.id = p.booking_id
      WHERE b.user_id = auth.uid()
    )
  );
```

#### C. Configureer Email Auth

1. Ga naar Authentication > Providers in Supabase
2. Zet Email provider aan
3. Configureer email templates (optioneel)

### 3. Spotify API Setup

#### A. Maak een Spotify Developer App

1. Ga naar [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Log in met je DJ Spotify account
3. Klik "Create App"
4. Vul in:
   - App name: "DJ Bazuri Website"
   - App description: "Playlist creator for event bookings"
   - Redirect URI: `http://localhost:3000/api/spotify/callback`
5. Bewaar je Client ID en Client Secret

#### B. Krijg een Refresh Token

Dit is een eenmalig proces om de DJ's Spotify account te autoriseren:

1. Maak een bestand `get-refresh-token.js` in de root:

```javascript
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'http://localhost:3000/api/spotify/callback'
});

const scopes = ['playlist-modify-public', 'playlist-modify-private'];
const authorizeURL = spotifyApi.createAuthorizeURL(scopes);

console.log('Go to this URL:', authorizeURL);
console.log('After authorization, you will be redirected. Copy the "code" parameter from the URL.');
```

2. Voer uit: `node get-refresh-token.js`
3. Ga naar de URL en autoriseer
4. Kopieer de `code` uit de redirect URL
5. Gebruik de code om een refresh token te krijgen (zie Spotify docs)

### 4. Environment Variables

Kopieer `.env.local.example` naar `.env.local` en vul in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Spotify API
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REFRESH_TOKEN=your-refresh-token
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## Project Structuur

```
djbazuri.com/
├── src/
│   ├── app/
│   │   ├── [locale]/              # Meertalige routes
│   │   │   ├── page.tsx           # Home page
│   │   │   ├── gallery/           # Galerij pagina
│   │   │   ├── pricing/           # Prijzen pagina
│   │   │   ├── contact/           # Contact pagina
│   │   │   ├── auth/              # Login/Signup pagina's
│   │   │   └── dashboard/         # User dashboard & playlist creator
│   │   └── api/
│   │       └── spotify/           # Spotify API endpoints
│   ├── components/                # React componenten
│   ├── lib/                       # Utility functies
│   └── messages/                  # Vertalingen (nl.json, en.json)
├── public/
│   └── images/                    # DJ foto's en assets
└── README.md
```

## Gebruik

### Voor de DJ (Admin)

1. **Boekingen Aanmaken**: Voeg bookings toe in Supabase dashboard:
   ```sql
   INSERT INTO bookings (user_id, event_name, event_date, status)
   VALUES ('user-uuid', 'Birthday Party', '2026-03-15', 'confirmed');
   ```

2. **Gebruikers Toevoegen**: Nodig klanten uit om te registreren met hun booking referentie

### Voor Klanten

1. **Registreren**: Maak account aan met booking referentie
2. **Inloggen**: Log in om dashboard te zien
3. **Playlist Maken**:
   - Zoek naar liedjes via Spotify
   - Voeg toe als Must-Have (favoriet), Normal, of Blacklist (niet gewenst)
   - Klik "Create Spotify Playlist" om de playlist aan te maken
   - Blacklist tracks worden NIET toegevoegd aan de Spotify playlist

## Deployment

### Custom Server

1. **Build de applicatie**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **Met PM2 (aanbevolen)**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "djbazuri" -- start
   pm2 save
   ```

4. **Nginx configuratie** (voorbeeld):
   ```nginx
   server {
       listen 80;
       server_name djbazuri.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL met Let's Encrypt**:
   ```bash
   sudo certbot --nginx -d djbazuri.com
   ```

## Aanpassingen

### Kleuren Wijzigen

Bewerk de Tailwind kleuren in `tailwind.config.js` om je branding aan te passen.

### Teksten Wijzigen

Bewerk de vertalingen in:
- `messages/nl.json` voor Nederlands
- `messages/en.json` voor Engels

### Foto's Toevoegen

Voeg event foto's toe aan `public/images/` en update de gallery pagina.

### Contact Informatie

Update contact details in `src/app/[locale]/contact/page.tsx`.

## Veelgestelde Vragen

**Q: Hoe voeg ik een nieuwe taal toe?**
A: Voeg een nieuw bestand toe in `messages/`, update `src/middleware.ts`, en voeg de locale toe aan de lijst.

**Q: Kunnen klanten hun eigen Spotify account gebruiken?**
A: Nee, de playlists worden aangemaakt op het DJ's Spotify account zodat de DJ toegang heeft tot alle event playlists.

**Q: Hoe verwijder ik oude playlists?**
A: Log in op het DJ Spotify account en verwijder playlists handmatig via de Spotify app.

**Q: Kunnen meerdere DJ's dit systeem gebruiken?**
A: Ja, maar elke DJ heeft eigen Spotify credentials nodig. Je kunt multi-tenancy toevoegen aan de database.

## Support

Voor vragen of problemen, neem contact op via:
- Email: info@djbazuri.com
- Website: [djbazuri.com/contact](http://djbazuri.com/contact)

## Licentie

Dit project is eigendom van DJ Bazuri.
#   d j b a z u r i . c o m  
 #   d j b a z u r i . c o m  
 