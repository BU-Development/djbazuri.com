import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          user_id: string;
          event_name: string;
          event_date: string;
          status: 'pending' | 'confirmed' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_name: string;
          event_date: string;
          status?: 'pending' | 'confirmed' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_name?: string;
          event_date?: string;
          status?: 'pending' | 'confirmed' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
      playlists: {
        Row: {
          id: string;
          booking_id: string;
          spotify_playlist_id: string | null;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          spotify_playlist_id?: string | null;
          name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          spotify_playlist_id?: string | null;
          name?: string;
          created_at?: string;
        };
      };
      playlist_tracks: {
        Row: {
          id: string;
          playlist_id: string;
          spotify_track_id: string;
          track_name: string;
          artist_name: string;
          album_image_url: string | null;
          priority: 'must_have' | 'normal' | 'blacklist';
          added_at: string;
        };
        Insert: {
          id?: string;
          playlist_id: string;
          spotify_track_id: string;
          track_name: string;
          artist_name: string;
          album_image_url?: string | null;
          priority?: 'must_have' | 'normal' | 'blacklist';
          added_at?: string;
        };
        Update: {
          id?: string;
          playlist_id?: string;
          spotify_track_id?: string;
          track_name?: string;
          artist_name?: string;
          album_image_url?: string | null;
          priority?: 'must_have' | 'normal' | 'blacklist';
          added_at?: string;
        };
      };
      links: {
        Row: {
          id: string;
          title: string;
          url: string;
          icon: string | null;
          order: number;
          visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          icon?: string | null;
          order?: number;
          visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          icon?: string | null;
          order?: number;
          visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      chats: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          message: string;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          user_id: string;
          message: string;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          user_id?: string;
          message?: string;
          is_admin?: boolean;
          created_at?: string;
        };
      };
    };
  };
};
