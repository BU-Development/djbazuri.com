// Test script om Spotify API te testen
// Voer uit met: node scripts/test-spotify.js

require('dotenv').config({ path: '.env.local' });
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

async function testSpotify() {
  console.log('Spotify API Test\n');
  console.log('Client ID:', process.env.SPOTIFY_CLIENT_ID ? '✓ Aanwezig' : '✗ Ontbreekt');
  console.log('Client Secret:', process.env.SPOTIFY_CLIENT_SECRET ? '✓ Aanwezig' : '✗ Ontbreekt');
  console.log('Refresh Token:', process.env.SPOTIFY_REFRESH_TOKEN ? '✓ Aanwezig' : '✗ Ontbreekt');
  console.log('');

  if (!process.env.SPOTIFY_REFRESH_TOKEN) {
    console.log('❌ Geen refresh token gevonden. Je moet eerst een nieuwe genereren.');
    return;
  }

  spotifyApi.setRefreshToken(process.env.SPOTIFY_REFRESH_TOKEN);

  try {
    console.log('Probeer access token te refreshen...');
    const data = await spotifyApi.refreshAccessToken();
    console.log('✓ Access token verkregen!');
    console.log('  Token geldig voor:', data.body.expires_in, 'seconden');

    spotifyApi.setAccessToken(data.body.access_token);

    console.log('\nProbeer gebruikersprofiel op te halen...');
    const me = await spotifyApi.getMe();
    console.log('✓ Ingelogd als:', me.body.display_name || me.body.id);
    console.log('  Email:', me.body.email);

    console.log('\nProbeer te zoeken naar "test"...');
    const search = await spotifyApi.searchTracks('test', { limit: 1 });
    console.log('✓ Zoeken werkt! Gevonden:', search.body.tracks.items[0]?.name || 'geen resultaten');

    console.log('\n✅ Spotify API werkt correct!');

  } catch (error) {
    console.log('\n❌ Fout:', error.message);

    if (error.body) {
      console.log('   Details:', JSON.stringify(error.body, null, 2));
    }

    if (error.message.includes('invalid_grant') || error.message.includes('refresh_token')) {
      console.log('\n⚠️  Je refresh token is verlopen of ongeldig.');
      console.log('   Je moet een nieuwe refresh token genereren:');
      console.log('   1. Ga naar https://developer.spotify.com/console/get-current-user/');
      console.log('   2. Klik op "Get Token" en log in');
      console.log('   3. Selecteer de scopes: user-read-private, playlist-modify-private, playlist-modify-public');
      console.log('   4. Gebruik de authorization code om een nieuwe refresh token te krijgen');
    }
  }
}

testSpotify();
