import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { isAdmin } from '@/lib/admin';

export async function GET() {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching gallery:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/admin/gallery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, alt, category, sort_order } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('gallery')
      .insert({
        url,
        alt: alt || null,
        category: category || null,
        sort_order: sort_order ?? 0,
        visible: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating gallery item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in POST /api/admin/gallery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Gallery item ID is required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // First get the item to check if we need to delete from storage
    const { data: item } = await supabase
      .from('gallery')
      .select('url')
      .eq('id', id)
      .single();

    // Delete from database
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting gallery item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Try to delete from storage if it's a Supabase URL
    if (item?.url && item.url.includes('supabase.co')) {
      const path = item.url.split('/gallery/')[1];
      if (path) {
        await supabase.storage.from('gallery').remove([path]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/gallery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
