#!/usr/bin/env node
/**
 * Spotify Refresh Token Generator
 *
 * Run: node scripts/get-spotify-token.js
 *
 * This will open a browser to authorize your Spotify app
 * and give you a new refresh token with the correct scopes.
 */

require('dotenv').config({ path: '.env.local' });
const http = require('http');
const { URL } = require('url');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:8888/callback';

// Required scopes for playlist management
const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email',
].join(' ');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ SPOTIFY_CLIENT_ID en SPOTIFY_CLIENT_SECRET moeten in .env.local staan');
  process.exit(1);
}

console.log('\n🎵 Spotify Token Generator\n');
console.log('Dit script genereert een nieuwe refresh token met de juiste permissions.\n');

// Create a simple HTTP server to receive the callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:8888`);

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>❌ Error: ${error}</h1><p>Probeer opnieuw.</p>`);
      server.close();
      process.exit(1);
    }

    if (code) {
      try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
          }),
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
          throw new Error(tokens.error_description || tokens.error);
        }

        console.log('\n✅ Tokens ontvangen!\n');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('SPOTIFY_REFRESH_TOKEN=' + tokens.refresh_token);
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('\n📋 Kopieer deze regel naar je .env.local bestand!\n');

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
          <head><title>Spotify Token</title></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h1>✅ Success!</h1>
            <p>Je nieuwe refresh token staat in de terminal.</p>
            <p>Kopieer de <code>SPOTIFY_REFRESH_TOKEN=...</code> regel naar je <code>.env.local</code> bestand.</p>
            <p>Je kunt dit venster sluiten.</p>
          </body>
          </html>
        `);

        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 1000);

      } catch (err) {
        console.error('❌ Error:', err.message);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>❌ Error</h1><p>${err.message}</p>`);
        server.close();
        process.exit(1);
      }
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(8888, '127.0.0.1', () => {
  const authUrl = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
  }).toString();

  console.log('1. Open deze URL in je browser:\n');
  console.log('   ' + authUrl);
  console.log('\n2. Log in met je Spotify account (djbazuri)');
  console.log('3. Klik op "Agree" om de app te autoriseren');
  console.log('\nWachten op callback...\n');

  // Try to open the browser automatically
  const { exec } = require('child_process');
  const command = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${command} "${authUrl}"`);
});
