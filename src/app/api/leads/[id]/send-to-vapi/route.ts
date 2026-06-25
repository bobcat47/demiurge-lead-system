import { NextResponse } from 'next/server';
import { sendToVapi } from '@/lib/lead-finder';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    const result = await sendToVapi(params.id, { phoneNumber });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Send to Vapi error:', error);
    return NextResponse.json(
      { error: 'Failed to send to Vapi' },
      { status: 500 }
    );
  }
}
