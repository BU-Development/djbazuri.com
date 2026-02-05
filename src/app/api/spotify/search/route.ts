import { NextRequest, NextResponse } from 'next/server';
import { searchTracks } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  // Check if Spotify is configured
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REFRESH_TOKEN) {
    return NextResponse.json(
      { error: 'Spotify is niet geconfigureerd. Voeg SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET en SPOTIFY_REFRESH_TOKEN toe aan .env.local' },
      { status: 503 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const tracks = await searchTracks(query, 20);

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Spotify search error:', error);
    return NextResponse.json(
      { error: 'Spotify API fout. Controleer je API credentials.' },
      { status: 500 }
    );
  }
}
