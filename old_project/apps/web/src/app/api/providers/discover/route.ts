import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, city, country, limit = 20 } = body;

    if (!query || !city) {
      return NextResponse.json(
        { error: 'Query and city are required' },
        { status: 400 }
      );
    }

    // Provider discovery is not implemented yet
    return NextResponse.json(
      { 
        error: 'Provider discovery not configured',
        message: 'Set DECODO_USERNAME and DECODO_PASSWORD environment variables'
      },
      { status: 503 }
    );

  } catch (error) {
    console.error('Provider discovery error:', error);
    return NextResponse.json(
      { error: 'Discovery failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
