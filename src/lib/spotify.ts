import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

let accessToken: string | null = null;
let tokenExpirationTime: number = 0;

export async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpirationTime) {
    return accessToken;
  }

  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN!;
  spotifyApi.setRefreshToken(refreshToken);

  try {
    const data = await spotifyApi.refreshAccessToken();
    accessToken = data.body.access_token;
    tokenExpirationTime = Date.now() + data.body.expires_in * 1000;
    spotifyApi.setAccessToken(accessToken);
    return accessToken;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error('Failed to refresh Spotify access token');
  }
}

export async function searchTracks(query: string, limit: number = 20) {
  await getAccessToken();

  try {
    const result = await spotifyApi.searchTracks(query, { limit });
    return result.body.tracks?.items.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      albumImage: track.album.images[0]?.url || null,
      uri: track.uri,
    }));
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw new Error('Failed to search tracks');
  }
}

export async function createPlaylist(userId: string, playlistName: string, description: string, collaborative: boolean = false) {
  await getAccessToken();

  try {
    const result = await spotifyApi.createPlaylist(playlistName, {
      description,
      public: !collaborative, // collaborative playlists must be non-public
      collaborative,
    });
    return result.body;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw new Error('Failed to create playlist');
  }
}

export async function addTracksToPlaylist(playlistId: string, trackUris: string[]) {
  await getAccessToken();

  try {
    await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
  } catch (error) {
    console.error('Error adding tracks to playlist:', error);
    throw new Error('Failed to add tracks to playlist');
  }
}

export async function removeTracksFromPlaylist(playlistId: string, trackUris: string[]) {
  await getAccessToken();

  try {
    await spotifyApi.removeTracksFromPlaylist(playlistId, trackUris.map(uri => ({ uri })));
  } catch (error) {
    console.error('Error removing tracks from playlist:', error);
    throw new Error('Failed to remove tracks from playlist');
  }
}

export async function replacePlaylistTracks(playlistId: string, trackUris: string[]) {
  await getAccessToken();

  try {
    await spotifyApi.replaceTracksInPlaylist(playlistId, trackUris);
  } catch (error) {
    console.error('Error replacing playlist tracks:', error);
    throw new Error('Failed to replace playlist tracks');
  }
}

export async function getCurrentUserProfile() {
  await getAccessToken();

  try {
    const result = await spotifyApi.getMe();
    return result.body;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to get user profile');
  }
}
