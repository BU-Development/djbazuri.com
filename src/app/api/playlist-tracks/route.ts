import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

function createSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// GET - Load playlist tracks for a booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');

    if (!bookingId) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();

    // Get or create playlist for this booking
    let { data: playlist } = await adminSupabase
      .from('playlists')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    if (!playlist) {
      // Create playlist if it doesn't exist
      const { data: newPlaylist, error: createError } = await adminSupabase
        .from('playlists')
        .insert({
          booking_id: bookingId,
          name: 'Event Playlist',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating playlist:', createError);
        return NextResponse.json({ error: 'Could not create playlist' }, { status: 500 });
      }

      playlist = newPlaylist;
    }

    // Load tracks
    const { data: tracks, error: tracksError } = await adminSupabase
      .from('playlist_tracks')
      .select('*')
      .eq('playlist_id', playlist.id)
      .order('created_at', { ascending: true });

    if (tracksError) {
      console.error('Error loading tracks:', tracksError);
      return NextResponse.json({ error: 'Could not load tracks' }, { status: 500 });
    }

    return NextResponse.json({
      playlistId: playlist.id,
      spotifyPlaylistId: playlist.spotify_playlist_id,
      tracks: tracks || [],
    });
  } catch (error) {
    console.error('Error in GET /api/playlist-tracks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save playlist tracks for a booking
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 20 playlist-opslaan per 5 minuten per IP
    const ip = getClientIp(request);
    if (!checkRateLimit(`playlist-save:${ip}`, 20, 5 * 60_000)) {
      return NextResponse.json(
        { error: 'Te veel wijzigingen. Wacht even voor je verder gaat.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { bookingId, tracks } = body;

    if (!bookingId || !Array.isArray(tracks)) {
      return NextResponse.json({ error: 'bookingId and tracks are required' }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();

    // Get or create playlist
    let { data: playlist } = await adminSupabase
      .from('playlists')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    if (!playlist) {
      const { data: newPlaylist, error: createError } = await adminSupabase
        .from('playlists')
        .insert({
          booking_id: bookingId,
          name: 'Event Playlist',
        })
        .select()
        .single();

      if (createError || !newPlaylist) {
        console.error('Error creating playlist:', createError);
        return NextResponse.json({ error: 'Could not create playlist' }, { status: 500 });
      }

      playlist = newPlaylist;
    }

    const playlistId = playlist.id;

    // Delete existing tracks
    await adminSupabase
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlistId);

    // Insert new tracks
    if (tracks.length > 0) {
      const tracksToInsert = tracks.map((track: any) => ({
        playlist_id: playlistId,
        spotify_track_id: track.id,
        track_name: track.name,
        artist_name: track.artists,
        album_name: track.album || null,
        album_image: track.albumImage || null,
        priority: track.priority,
      }));

      const { error: insertError } = await adminSupabase
        .from('playlist_tracks')
        .insert(tracksToInsert);

      if (insertError) {
        console.error('Error inserting tracks:', insertError);
        return NextResponse.json({ error: 'Could not save tracks' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, playlistId });
  } catch (error) {
    console.error('Error in POST /api/playlist-tracks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update Spotify playlist ID
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, spotifyPlaylistId } = body;

    if (!bookingId || !spotifyPlaylistId) {
      return NextResponse.json(
        { error: 'bookingId and spotifyPlaylistId are required' },
        { status: 400 }
      );
    }

    const adminSupabase = getAdminSupabase();

    const { error: updateError } = await adminSupabase
      .from('playlists')
      .update({ spotify_playlist_id: spotifyPlaylistId })
      .eq('booking_id', bookingId);

    if (updateError) {
      console.error('Error updating playlist:', updateError);
      return NextResponse.json({ error: 'Could not update playlist' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/playlist-tracks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
