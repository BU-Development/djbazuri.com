# 🎵 DJ Bazuri Website - Setup Instructies

Welkom! Dit document helpt je om je DJ Bazuri website volledig in te richten.

## 📋 Wat is er gebouwd?

### ✅ 1. Modern Design met Zwart & #856aad
- Homepage volledig gestyled met jouw kleurenschema
- Tailwind CSS configuratie met custom primary color (#856aad)
- Donker thema met zwarte achtergrond en paarse accenten

### ✅ 2. /links Pagina (Linktree Alternatief)
- Toegankelijk via `djbazuri.com/links`
- Niet zichtbaar in de normale navigatie
- Volledig aanpasbaar via admin panel
- Support voor emoji icons
- Drag & drop volgorde aanpassen

### ✅ 3. Admin Dashboard (`/admin`)
- **Beveiligd met email authenticatie** - alleen jouw email krijgt toegang
- **Linktree Beheer:** Links toevoegen, bewerken, verwijderen en sorteren
- **Playlist Beheer:** Overzicht van alle playlists en bookings
- **Chat Beheer:** Alle klant berichten bekijken en beantwoorden

### ✅ 4. Chat Systeem
- Klanten kunnen chatten via het dashboard
- Realtime updates met Supabase
- Email notificaties voor beide partijen
- Chat geschiedenis per booking

### ✅ 5. Foto Documentatie
- Uitgebreide gids waar foto's moeten staan
- Zie `FOTO_PLAATSING.md` voor details

## 🚀 Setup Stappen

### Stap 1: Database Setup

1. **Ga naar je Supabase project** (https://supabase.com)
2. **Open SQL Editor** in je Supabase dashboard
3. **Kopieer en plak** de inhoud van `supabase-schema.sql`
4. **Voer het SQL script uit** om alle tabellen aan te maken
5. **BELANGRIJK:** Update de admin email in de `site_config` tabel:
   ```sql
   UPDATE public.site_config
   SET admin_email = 'jouw-email@voorbeeld.com'
   WHERE id = (SELECT id FROM public.site_config LIMIT 1);
   ```
   Vervang `jouw-email@voorbeeld.com` met jouw echte email adres!

### Stap 2: Environment Variabelen

1. **Open `.env.local`** in de root van je project
2. **Vul je Supabase credentials in:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://jouw-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-key
   SUPABASE_SERVICE_ROLE_KEY=jouw-service-role-key
   ```
   Je vindt deze in: Supabase Dashboard > Project Settings > API

3. **Vul je Spotify credentials in** (als je die al hebt):
   ```env
   SPOTIFY_CLIENT_ID=jouw-spotify-client-id
   SPOTIFY_CLIENT_SECRET=jouw-spotify-client-secret
   ```

4. **Stel je app URL in:**
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   Wijzig dit naar je productie URL wanneer je live gaat!

### Stap 3: Dependencies Installeren

```bash
npm install
```

### Stap 4: Development Server Starten

```bash
npm run dev
```

Je website is nu beschikbaar op: http://localhost:3000

### Stap 5: Admin Account Aanmaken

1. Ga naar http://localhost:3000/en/auth/signup
2. Registreer met het email adres dat je hebt ingesteld in stap 1
3. Bevestig je email via de link die Supabase stuurt
4. Ga naar http://localhost:3000/admin
5. Je hebt nu toegang tot het admin dashboard!

## 📱 Pagina's Overzicht

### Publieke Pagina's
- **/** - Homepage met hero sectie en features
- **/links** - Linktree alternatief (direct toegankelijk, niet in navigatie)
- **/en/contact** - Contact formulier
- **/en/pricing** - Prijsinformatie
- **/en/gallery** - Foto gallery
- **/en/auth/signin** - Inloggen
- **/en/auth/signup** - Registreren

### Beveiligde Pagina's
- **/en/dashboard** - Klant dashboard met booking info en chat
- **/en/dashboard/playlist** - Playlist maker

### Admin Pagina's (alleen voor jouw email)
- **/admin** - Dashboard met statistieken
- **/admin/links** - Linktree beheer
- **/admin/playlists** - Playlist beheer
- **/admin/chats** - Chat overzicht en antwoorden

## 🎨 Kleuren Configuratie

De website gebruikt het volgende kleurenschema:

```javascript
primary: '#856aad'  // Jouw paarse kleur
dark: '#000000'     // Zwarte achtergrond
```

Deze kleuren zijn geconfigureerd in:
- `tailwind.config.js` - Tailwind configuratie
- `src/app/globals.css` - Global CSS variabelen

## 📧 Email Notificaties Setup

De basis voor email notificaties is al gebouwd, maar je moet nog een email service instellen:

### Optie 1: Resend (Aanbevolen)

1. **Ga naar** https://resend.com en maak een account
2. **Installeer Resend:**
   ```bash
   npm install resend
   ```
3. **Voeg API key toe aan `.env.local`:**
   ```env
   RESEND_API_KEY=re_jouw_api_key
   ```
4. **Uncomment de Resend code** in `src/app/api/send-email/route.ts` (regel 57-66)

### Optie 2: SendGrid

1. Ga naar https://sendgrid.com
2. Maak een account en krijg een API key
3. Installeer: `npm install @sendgrid/mail`
4. Update `src/app/api/send-email/route.ts` met SendGrid code

## 🖼️ Foto's Toevoegen

Zie `FOTO_PLAATSING.md` voor uitgebreide instructies, maar in het kort:

1. Plaats je profiel foto in: `public/images/profile.jpg`
2. Plaats gallery foto's in: `public/images/gallery/`
3. De website gebruikt deze automatisch!

## 🔐 Beveiliging

### Database Beveiliging (Row Level Security)
- Links zijn publiek leesbaar maar alleen admin kan bewerken
- Chats zijn alleen zichtbaar voor de klant en admin
- Alle schrijf operaties vereisen authenticatie

### Admin Toegang
- Alleen het email adres in de `site_config` tabel heeft admin toegang
- Alle admin routes checken automatisch je email

## 🌐 Live Gaan

### Stap 1: Build Testen
```bash
npm run build
npm start
```

### Stap 2: Deployen naar Vercel (Aanbevolen)

1. **Push je code naar GitHub**
2. **Ga naar** https://vercel.com
3. **Import je repository**
4. **Voeg environment variabelen toe** in Vercel settings
5. **Deploy!**

### Stap 3: Environment Variabelen Updaten

Update in `.env.local` en Vercel:
```env
NEXT_PUBLIC_APP_URL=https://djbazuri.com
```

### Stap 4: Custom Domain

1. Ga naar Vercel project settings
2. Voeg je domein toe: `djbazuri.com`
3. Update DNS records zoals Vercel aangeeft

## 📝 Linktree Gebruiken

### Links Toevoegen via Admin

1. Ga naar `/admin/links`
2. Vul het formulier in:
   - **Titel:** Bijv. "Spotify Playlist"
   - **URL:** De volledige URL (https://...)
   - **Icon:** Een emoji (bijv. 🎵) of laat leeg
   - **Zichtbaar:** Vink aan om te tonen op /links pagina
3. Klik op "Toevoegen"

### Volgorde Aanpassen

Gebruik de ↑ en ↓ knoppen om de volgorde te wijzigen.

### Link Delen

Deel gewoon: `djbazuri.com/links`

## 💬 Chat Systeem Gebruiken

### Als Klant
1. Log in op je account
2. Ga naar Dashboard
3. Scroll naar beneden naar "Chat met DJ Bazuri"
4. Type een bericht en druk op "Verstuur"
5. Je ontvangt een email wanneer de DJ antwoordt

### Als Admin (DJ)
1. Ga naar `/admin/chats`
2. Zie alle berichten gegroepeerd per booking
3. Klik op "Antwoord" om te reageren
4. De klant krijgt automatisch een email

## 🎵 Playlist Beheer

### Nieuwe Playlist Maken
1. Ga naar `/admin/playlists`
2. Selecteer een booking uit de dropdown
3. Klik op "Playlist Maken"
4. De playlist is nu gekoppeld aan die booking

### Klanten Kunnen
- Tracks zoeken en toevoegen
- Tracks markeren als "Must Have", "Normal" of "Blacklist"
- Hun playlist bekijken en aanpassen

## 🐛 Troubleshooting

### "Unauthorized: Admin access required"
- Controleer of je bent ingelogd met het juiste email adres
- Check de `site_config` tabel in Supabase of je email daar staat

### Links pagina toont "Geen links beschikbaar"
- Ga naar `/admin/links` en voeg links toe
- Zorg dat de "Zichtbaar" checkbox is aangevinkt
- Check of de database tabellen correct zijn aangemaakt

### Chat berichten komen niet aan
- Check je browser console voor errors
- Verifieer dat de Supabase Realtime is ingeschakeld
- Test de email API route: `/api/send-email`

### Foto's worden niet getoond
- Controleer of de foto in `public/images/` staat
- Check de bestandsnaam (hoofdlettergevoelig!)
- Restart de development server

## 📚 Handige Links

- **Supabase Dashboard:** https://app.supabase.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS Docs:** https://tailwindcss.com/docs

## ❓ Vragen?

Als je problemen hebt of vragen, check dan:
1. Deze setup instructies opnieuw
2. De error messages in je browser console
3. De Supabase logs in je dashboard

## 🎉 Klaar!

Je DJ Bazuri website is nu volledig geconfigureerd met:
- ✅ Modern zwart & paars design
- ✅ Linktree alternatief op /links
- ✅ Volledig admin dashboard
- ✅ Chat systeem met email notificaties
- ✅ Playlist beheer
- ✅ Foto documentatie

Succes met je website! 🎵🔥
