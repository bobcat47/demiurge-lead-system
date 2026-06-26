import { NextResponse } from 'next/server';
import { isAIProposalAvailable, getActiveAIProvider, AI_PROVIDERS } from '@/lib/ai/ai-service';

export async function GET() {
  const provider = getActiveAIProvider();
  const isAvailable = isAIProposalAvailable();

  return NextResponse.json({
    success: true,
    available: isAvailable,
    provider,
    providerName: AI_PROVIDERS[provider].name,
  });
}
