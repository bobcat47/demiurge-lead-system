import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('providers')
      .select('*')
      .eq('is_active', true)
      .limit(limit);

    if (service) {
      query = query.contains('services', [service]);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    const { data: providers, error } = await query.order('rating', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ providers: providers || [] });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}
