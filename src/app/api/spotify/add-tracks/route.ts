import { NextRequest, NextResponse } from 'next/server';
import { replacePlaylistTracks } from '@/lib/spotify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playlistId, tracks } = body;

    if (!playlistId || !tracks || !Array.isArray(tracks)) {
      return NextResponse.json(
        { error: 'Playlist ID and tracks array are required' },
        { status: 400 }
      );
    }

    const trackUris = tracks.map((track: any) => `spotify:track:${track.id}`);

    await replacePlaylistTracks(playlistId, trackUris);

    return NextResponse.json({
      success: true,
      message: 'Playlist updated successfully',
    });
  } catch (error) {
    console.error('Add tracks error:', error);
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 }
    );
  }
}
