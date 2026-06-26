/**
 * Provider-agnostic AI Service
 * Supports: OpenRouter, Google Gemini, Groq, OpenAI, Ollama
 * Priority: OpenRouter (free) > Gemini (free tier) > Groq (free tier) > OpenAI (paid) > Ollama (local)
 */

export type AIProvider = 'openrouter' | 'gemini' | 'groq' | 'openai' | 'ollama' | 'mock';

interface AIProviderConfig {
  name: string;
  defaultModel: string;
  baseUrl: string;
  requiresApiKey: boolean;
  freeTierAvailable: boolean;
  description: string;
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  openrouter: {
    name: 'OpenRouter',
    defaultModel: 'google/gemini-flash-1.5:free',
    baseUrl: 'https://openrouter.ai/api/v1',
    requiresApiKey: true,
    freeTierAvailable: true,
    description: 'Access free models from Google, Meta, and more. Recommended for free tier.',
  },
  gemini: {
    name: 'Google Gemini',
    defaultModel: 'gemini-1.5-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    requiresApiKey: true,
    freeTierAvailable: true,
    description: 'Google\'s Gemini Flash - generous free tier with 15 RPM.',
  },
  groq: {
    name: 'Groq',
    defaultModel: 'llama-3.1-8b-instant',
    baseUrl: 'https://api.groq.com/openai/v1',
    requiresApiKey: true,
    freeTierAvailable: true,
    description: 'Ultra-fast inference. Free tier includes Llama and Mixtral models.',
  },
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    freeTierAvailable: false,
    description: 'OpenAI GPT models. Requires paid API credits.',
  },
  ollama: {
    name: 'Local (Ollama)',
    defaultModel: 'llama3.1',
    baseUrl: 'http://localhost:11434/v1',
    requiresApiKey: false,
    freeTierAvailable: true,
    description: 'Run models locally. No API key needed, but requires Ollama server.',
  },
  mock: {
    name: 'Mock (No AI)',
    defaultModel: 'mock',
    baseUrl: '',
    requiresApiKey: false,
    freeTierAvailable: true,
    description: 'Template-based generation without AI. No API key required.',
  },
};

// Priority order for auto-selection
const PROVIDER_PRIORITY: AIProvider[] = ['openrouter', 'gemini', 'groq', 'openai', 'ollama'];

interface AIRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: AIProvider;
  model: string;
}

export interface AIProviderStatus {
  provider: AIProvider;
  configured: boolean;
  keyPreview: string | null;
  isFreeTier: boolean;
}

/**
 * Determine which AI provider to use based on available environment variables
 * Priority: openrouter > gemini > groq > openai > ollama > mock
 */
export function getActiveAIProvider(): AIProvider {
  // Check explicit AI_PROVIDER setting first
  const explicitProvider = process.env.AI_PROVIDER as AIProvider;
  if (explicitProvider && AI_PROVIDERS[explicitProvider] && isProviderConfigured(explicitProvider)) {
    return explicitProvider;
  }

  // Auto-detect based on available API keys (priority order)
  for (const provider of PROVIDER_PRIORITY) {
    if (isProviderConfigured(provider)) {
      return provider;
    }
  }

  return 'mock';
}

/**
 * Check if a specific provider is configured
 */
export function isProviderConfigured(provider: AIProvider): boolean {
  switch (provider) {
    case 'openrouter':
      return !!process.env.OPENROUTER_API_KEY || (!!process.env.AI_API_KEY && process.env.AI_PROVIDER === 'openrouter');
    case 'gemini':
      return !!process.env.GEMINI_API_KEY || (!!process.env.AI_API_KEY && process.env.AI_PROVIDER === 'gemini');
    case 'groq':
      return !!process.env.GROQ_API_KEY || (!!process.env.AI_API_KEY && process.env.AI_PROVIDER === 'groq');
    case 'openai':
      return !!process.env.OPENAI_API_KEY || (!!process.env.AI_API_KEY && process.env.AI_PROVIDER === 'openai');
    case 'ollama':
      // Ollama doesn't require an API key, but check if explicitly enabled
      return process.env.AI_PROVIDER === 'ollama' || process.env.OLLAMA_ENABLED === 'true';
    case 'mock':
      return true; // Always available as fallback
    default:
      return false;
  }
}

/**
 * Get all AI provider statuses for display
 */
export function getAllAIProviderStatuses(): AIProviderStatus[] {
  return (Object.keys(AI_PROVIDERS) as AIProvider[])
    .filter(p => p !== 'mock')
    .map(provider => {
      const key = getProviderKey(provider);
      return {
        provider,
        configured: isProviderConfigured(provider),
        keyPreview: key ? `${key.slice(0, 8)}...${key.slice(-4)}` : null,
        isFreeTier: AI_PROVIDERS[provider].freeTierAvailable,
      };
    });
}

function getProviderKey(provider: AIProvider): string | undefined {
  switch (provider) {
    case 'openrouter':
      return process.env.OPENROUTER_API_KEY || (process.env.AI_PROVIDER === 'openrouter' ? process.env.AI_API_KEY : undefined);
    case 'gemini':
      return process.env.GEMINI_API_KEY || (process.env.AI_PROVIDER === 'gemini' ? process.env.AI_API_KEY : undefined);
    case 'groq':
      return process.env.GROQ_API_KEY || (process.env.AI_PROVIDER === 'groq' ? process.env.AI_API_KEY : undefined);
    case 'openai':
      return process.env.OPENAI_API_KEY || (process.env.AI_PROVIDER === 'openai' ? process.env.AI_API_KEY : undefined);
    default:
      return undefined;
  }
}

function getProviderConfig(provider: AIProvider): { apiKey: string; baseUrl: string; model: string } {
  const providerConfig = AI_PROVIDERS[provider];
  
  // Use generic AI_* env vars if provider-specific ones aren't set
  const apiKey = getProviderKey(provider) || process.env.AI_API_KEY || '';
  const baseUrl = process.env.AI_BASE_URL || providerConfig.baseUrl;
  const model = process.env.AI_MODEL || providerConfig.defaultModel;

  return { apiKey, baseUrl, model };
}

/**
 * Generate text using the configured AI provider
 */
export async function generateText(request: AIRequest): Promise<AIResponse> {
  const provider = getActiveAIProvider();

  if (provider === 'mock') {
    throw new Error('No AI provider configured');
  }

  const { apiKey, baseUrl, model } = getProviderConfig(provider);

  if (!apiKey && AI_PROVIDERS[provider].requiresApiKey) {
    throw new Error(`API key required for ${provider}`);
  }

  switch (provider) {
    case 'openrouter':
      return callOpenRouter(baseUrl, apiKey, model, request);
    case 'gemini':
      return callGemini(baseUrl, apiKey, model, request);
    case 'groq':
      return callOpenAICompatible(baseUrl, apiKey, model, request, 'groq');
    case 'openai':
      return callOpenAICompatible(baseUrl, apiKey, model, request, 'openai');
    case 'ollama':
      return callOpenAICompatible(baseUrl, apiKey, model, request, 'ollama');
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * OpenRouter API call
 */
async function callOpenRouter(
  baseUrl: string,
  apiKey: string,
  model: string,
  request: AIRequest
): Promise<AIResponse> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://demiurge-os.example.com',
      'X-Title': 'Demiurge OS',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
    provider: 'openrouter',
    model: data.model || model,
  };
}

/**
 * Google Gemini API call
 */
async function callGemini(
  baseUrl: string,
  apiKey: string,
  model: string,
  request: AIRequest
): Promise<AIResponse> {
  const response = await fetch(
    `${baseUrl}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${request.systemPrompt}\n\n${request.userPrompt}` },
            ],
          },
        ],
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.candidates[0].content.parts[0].text,
    usage: data.usageMetadata ? {
      promptTokens: data.usageMetadata.promptTokenCount,
      completionTokens: data.usageMetadata.candidatesTokenCount,
      totalTokens: data.usageMetadata.totalTokenCount,
    } : undefined,
    provider: 'gemini',
    model,
  };
}

/**
 * OpenAI-compatible API call (works with Groq, OpenAI, Ollama)
 */
async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  request: AIRequest,
  provider: AIProvider
): Promise<AIResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
    provider,
    model: data.model || model,
  };
}

/**
 * Check if AI proposal generation is available
 */
export function isAIProposalAvailable(): boolean {
  return getActiveAIProvider() !== 'mock';
}
