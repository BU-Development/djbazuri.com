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
      .from('pricing')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching pricing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/admin/pricing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { packages } = body;

    if (!packages || !Array.isArray(packages)) {
      return NextResponse.json({ error: 'Packages array is required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    for (const pkg of packages) {
      const { error } = await supabase
        .from('pricing')
        .upsert({
          id: pkg.id,
          name_nl: pkg.name_nl,
          name_en: pkg.name_en,
          price: pkg.price,
          duration: pkg.duration,
          features_nl: pkg.features_nl,
          features_en: pkg.features_en,
          sort_order: pkg.sort_order || pkg.order || 0,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating pricing:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/admin/pricing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
