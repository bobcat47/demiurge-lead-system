import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    googlePlaces: {
      configured: !!process.env.GOOGLE_PLACES_API_KEY,
      keyPreview: process.env.GOOGLE_PLACES_API_KEY 
        ? `${process.env.GOOGLE_PLACES_API_KEY.substring(0, 8)}...${process.env.GOOGLE_PLACES_API_KEY.slice(-4)}`
        : null,
    },
    serpapi: {
      configured: !!process.env.SERPAPI_KEY,
      keyPreview: process.env.SERPAPI_KEY
        ? `${process.env.SERPAPI_KEY.substring(0, 8)}...${process.env.SERPAPI_KEY.slice(-4)}`
        : null,
    },
    apify: {
      configured: !!process.env.APIFY_TOKEN,
      keyPreview: process.env.APIFY_TOKEN
        ? `${process.env.APIFY_TOKEN.substring(0, 8)}...${process.env.APIFY_TOKEN.slice(-4)}`
        : null,
    },
    activeProvider: getActiveProvider(),
  };

  return NextResponse.json({ success: true, config });
}

function getActiveProvider(): string {
  if (process.env.GOOGLE_PLACES_API_KEY) return 'google-places';
  if (process.env.SERPAPI_KEY) return 'serpapi';
  if (process.env.APIFY_TOKEN) return 'apify';
  return 'mock';
}
