import { NextRequest, NextResponse } from 'next/server';
import { createPlaylist, addTracksToPlaylist, getCurrentUserProfile } from '@/lib/spotify';

export async function POST(request: NextRequest) {
  // Check if Spotify is configured
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REFRESH_TOKEN) {
    return NextResponse.json(
      { error: 'Spotify is niet geconfigureerd. Voeg SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET en SPOTIFY_REFRESH_TOKEN toe aan .env.local' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { tracks } = body;

    if (!tracks || !Array.isArray(tracks)) {
      return NextResponse.json({ error: 'Tracks array is required' }, { status: 400 });
    }

    const userProfile = await getCurrentUserProfile();

    const playlist = await createPlaylist(
      userProfile.id,
      'DJ Bazuri - Event Playlist',
      'Playlist created for your event with DJ Bazuri'
    );

    const trackUris = tracks.map((track: any) => `spotify:track:${track.id}`);

    if (trackUris.length > 0) {
      await addTracksToPlaylist(playlist.id, trackUris);
    }

    return NextResponse.json({
      playlistId: playlist.id,
      playlistUrl: playlist.external_urls.spotify,
    });
  } catch (error) {
    console.error('Playlist creation error:', error);
    return NextResponse.json(
      { error: 'Spotify API fout. Controleer je API credentials.' },
      { status: 500 }
    );
  }
}
