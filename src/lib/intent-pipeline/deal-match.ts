/**
 * Deal Match Service
 * Manages deal matches, scripts, and lifecycle
 */

import { db } from '../db';
import { DealMatch, DealMatchStatus, ProviderMatchingService } from './provider-matching';
import { generateText } from '../ai/ai-service';

export interface DealMatchScript {
  id: string;
  deal_match_id: string;
  script_type: 'provider_call' | 'provider_sms' | 'provider_email' | 'client_call' | 'client_sms' | 'client_email' | 'vapi_agent_prompt';
  content: string;
  generated_by: string;
  created_at: string;
  updated_at: string;
}

export interface DealMatchEvent {
  id: string;
  deal_match_id: string;
  event_type: string;
  payload: Record<string, any>;
  created_by: string;
  created_at: string;
}

export const DealMatchService = {
  /**
   * Get all deal matches
   */
  async getAll(filters?: {
    status?: DealMatchStatus;
    minScore?: number;
    limit?: number;
  }): Promise<DealMatch[]> {
    const matches = await db.query('deal_matches', {
      where: {
        ...(filters?.status && { status: filters.status })
      },
      orderBy: { column: 'created_at', direction: 'desc' },
      limit: filters?.limit || 100
    });

    return matches.filter(m => !filters?.minScore || m.match_score >= filters.minScore);
  },

  /**
   * Get deal match by ID with related data
   */
  async getById(id: string): Promise<{
    match: DealMatch;
    scripts: DealMatchScript[];
    events: DealMatchEvent[];
  } | null> {
    const matches = await db.query('deal_matches', { where: { id } });
    if (!matches[0]) return null;

    const [scripts, events] = await Promise.all([
      this.getScripts(id),
      this.getEvents(id)
    ]);

    return {
      match: matches[0],
      scripts,
      events
    };
  },

  /**
   * Get scripts for a deal match
   */
  async getScripts(dealMatchId: string): Promise<DealMatchScript[]> {
    return db.query('deal_match_scripts', {
      where: { deal_match_id: dealMatchId },
      orderBy: { column: 'created_at', direction: 'asc' }
    });
  },

  /**
   * Get events for a deal match
   */
  async getEvents(dealMatchId: string): Promise<DealMatchEvent[]> {
    return db.query('deal_match_events', {
      where: { deal_match_id: dealMatchId },
      orderBy: { column: 'created_at', direction: 'desc' }
    });
  },

  /**
   * Generate all outreach scripts for a deal match
   */
  async generateScripts(dealMatchId: string): Promise<DealMatchScript[]> {
    const data = await this.getById(dealMatchId);
    if (!data) throw new Error('Deal match not found');

    const { match } = data;

    // Get related lead and provider
    const leads = await db.query('intent_leads', { where: { id: match.intent_lead_id } });
    const providers = await db.query('providers', { where: { id: match.provider_id } });
    
    if (!leads[0] || !providers[0]) {
      throw new Error('Lead or provider not found');
    }

    const lead = leads[0];
    const provider = providers[0];

    const scripts: DealMatchScript[] = [];

    // Generate each script type
    const scriptTypes: DealMatchScript['script_type'][] = [
      'provider_call',
      'provider_sms',
      'provider_email',
      'client_call',
      'client_sms',
      'client_email',
      'vapi_agent_prompt'
    ];

    for (const scriptType of scriptTypes) {
      try {
        const content = await this.generateScriptContent(scriptType, lead, provider, match);
        
        // Check if script already exists
        const existing = await db.query('deal_match_scripts', {
          where: { deal_match_id: dealMatchId, script_type: scriptType }
        });

        if (existing[0]) {
          // Update existing
          await db.update('deal_match_scripts', {
            where: { id: existing[0].id },
            data: { content, generated_by: 'ai' }
          });
          scripts.push({ ...existing[0], content });
        } else {
          // Create new
          const script = await db.insert('deal_match_scripts', {
            deal_match_id: dealMatchId,
            script_type: scriptType,
            content,
            generated_by: 'ai'
          });
          scripts.push(script);
        }
      } catch (error) {
        console.error(`Failed to generate ${scriptType} script:`, error);
      }
    }

    // Log event
    await db.insert('deal_match_events', {
      deal_match_id: dealMatchId,
      event_type: 'scripts_generated',
      payload: { script_count: scripts.length }
    });

    return scripts;
  },

  /**
   * Generate script content using AI
   */
  private async generateScriptContent(
    type: DealMatchScript['script_type'],
    lead: any,
    provider: any,
    match: DealMatch
  ): Promise<string> {
    const systemPrompt = `You are an expert sales broker and communication specialist. Generate professional, persuasive scripts for introducing service providers to potential clients.

Key points:
- Be concise and professional
- Focus on value for both parties
- Mention the match quality/relevance
- Include clear next steps
- Maintain a helpful, not pushy tone`;

    let userPrompt = '';
    const commission = match.proposed_commission_value || 10;

    switch (type) {
      case 'provider_call':
        userPrompt = `Generate a phone call script for contacting a service provider about a potential job.

Provider: ${provider.business_name}
Service: ${provider.services?.join(', ') || 'general services'}
Client Need: ${lead.detected_need}
Service Category: ${lead.service_category}
Location: ${lead.location_text}
Urgency: ${lead.urgency}

The script should:
1. Introduce our company as a lead generation service
2. Explain we have a qualified client looking for their services
3. Mention the location and type of work
4. Ask about their availability and interest
5. Mention we work on a ${commission}% introduction fee basis
6. Get their agreement to be introduced

Format as a natural conversation with both sides.`;
        break;

      case 'provider_sms':
        userPrompt = `Generate a short SMS/WhatsApp message to a service provider.

Provider: ${provider.business_name}
Client Need: ${lead.detected_need} in ${lead.location_text}

The message should:
- Be under 160 characters if possible
- Be friendly and professional
- Ask if they're interested in a new client lead
- Mention it's in their service area

Keep it brief and conversational.`;
        break;

      case 'provider_email':
        userPrompt = `Generate a professional email to a service provider about a client opportunity.

Provider: ${provider.business_name}
Client Need: ${lead.detected_need}
Location: ${lead.location_text}
Urgency: ${lead.urgency}

The email should:
1. Have a compelling subject line
2. Briefly introduce our service
3. Describe the client need
4. Explain why they're a good match
5. Mention the ${commission}% introduction fee
6. Include clear next steps
7. Have a professional signature`;
        break;

      case 'client_call':
        userPrompt = `Generate a phone call script for contacting a potential client who needs services.

Client Need: ${lead.detected_need}
Service Category: ${lead.service_category}
Location: ${lead.location_text}
Urgency: ${lead.urgency}

Provider we want to introduce: ${provider.business_name}
Provider Rating: ${provider.rating} stars
Provider Services: ${provider.services?.join(', ') || 'various services'}

The script should:
1. Introduce our company as a service that connects people with local providers
2. Reference their need for ${lead.service_category}
3. Mention we have a well-rated local provider
4. Ask about their timeline and requirements
5. Get permission to make an introduction
6. Be helpful and consultative, not salesy`;
        break;

      case 'client_sms':
        userPrompt = `Generate a short SMS message to a potential client.

Their Need: ${lead.detected_need} in ${lead.location_text}

The message should:
- Be friendly and helpful
- Mention we can connect them with a vetted local ${lead.service_category}
- Ask if they'd like an introduction
- Be under 160 characters

Keep it conversational and non-spammy.`;
        break;

      case 'client_email':
        userPrompt = `Generate an email to a potential client about connecting them with a service provider.

Client Need: ${lead.detected_need}
Location: ${lead.location_text}
Urgency: ${lead.urgency}

Provider: ${provider.business_name}
Provider Rating: ${provider.rating} stars (${provider.review_count} reviews)
Provider Services: ${provider.services?.join(', ') || 'various services'}

The email should:
1. Reference their search for ${lead.service_category}
2. Introduce the matched provider with credentials
3. Explain why they're a good match
4. Offer to make the introduction
5. Include next steps
6. Be professional and helpful`;
        break;

      case 'vapi_agent_prompt':
        userPrompt = `Generate a Vapi AI agent prompt for making an outbound call.

Target: ${provider.business_name} (service provider)
Purpose: Introduce a client opportunity

Client Details:
- Need: ${lead.detected_need}
- Location: ${lead.location_text}
- Urgency: ${lead.urgency}

The prompt should:
1. Define the agent's persona (professional, friendly broker)
2. Set the goal (confirm interest in client introduction)
3. Provide talking points
4. Include objection handling
5. Define success criteria (agreement to proceed)
6. Specify how to end the call

Format as a system prompt for an AI voice agent.`;
        break;
    }

    try {
      const response = await generateText({
        systemPrompt,
        userPrompt,
        temperature: 0.7,
        maxTokens: 1500
      });

      return response.content;
    } catch (error) {
      console.error('AI generation failed, using template:', error);
      return this.getFallbackScript(type, lead, provider, match);
    }
  },

  /**
   * Get fallback template if AI fails
   */
  private getFallbackScript(
    type: DealMatchScript['script_type'],
    lead: any,
    provider: any,
    match: DealMatch
  ): string {
    const commission = match.proposed_commission_value || 10;

    switch (type) {
      case 'provider_call':
        return `Hi, this is [Your Name] from Demiurge Connect. We help local businesses find qualified clients.

I have a potential client in ${lead.location_text} looking for ${lead.service_category} services - specifically: ${lead.detected_need}.

Are you currently taking on new work in that area?

[If yes]: Great! We work on a ${commission}% introduction fee basis. If you're interested, I can provide more details and make the introduction.

[If no]: No problem, I'll make a note. Have a great day!`;

      case 'provider_sms':
        return `Hi ${provider.business_name}, we have a qualified ${lead.service_category} lead in ${lead.location_text}. Are you interested in new clients? Reply YES for details.`;

      case 'client_call':
        return `Hi, this is [Your Name] from Demiurge Connect. I saw you were looking for ${lead.service_category} services in ${lead.location_text}.

We work with local providers and I may have a good match for you - ${provider.business_name}, who has a ${provider.rating}-star rating.

Would you like me to connect you with them?`;

      case 'client_sms':
        return `Hi! We can connect you with a vetted ${lead.service_category} in ${lead.location_text}. Interested? Reply YES and we'll make the intro.`;

      case 'vapi_agent_prompt':
        return `You are a professional lead broker calling on behalf of Demiurge Connect.

Goal: Introduce ${provider.business_name} to a potential client needing ${lead.service_category} services in ${lead.location_text}.

Key points:
- Be friendly and professional
- Confirm their availability for new work
- Explain the ${commission}% introduction fee
- Get agreement to proceed
- If they decline, thank them and end politely

Call flow:
1. Introduce yourself and company
2. Describe the client opportunity
3. Ask about availability
4. Discuss terms
5. Confirm interest or document decline`;

      default:
        return `Contact ${provider.business_name} about ${lead.service_category} opportunity in ${lead.location_text}.`;
    }
  },

  /**
   * Update deal match status
   */
  async updateStatus(
    matchId: string, 
    status: DealMatchStatus,
    metadata?: Record<string, any>
  ): Promise<DealMatch | null> {
    const result = await db.update('deal_matches', {
      where: { id: matchId },
      data: { status }
    });

    if (result) {
      await db.insert('deal_match_events', {
        deal_match_id: matchId,
        event_type: 'status_changed',
        payload: { status, ...metadata },
        created_by: 'user'
      });
    }

    return result;
  },

  /**
   * Get pipeline stats
   */
  async getStats(): Promise<{
    total: number;
    byStatus: Record<DealMatchStatus, number>;
    avgScore: number;
    totalEstimatedValue: number;
  }> {
    const matches = await this.getAll({ limit: 10000 });

    const byStatus: Partial<Record<DealMatchStatus, number>> = {};
    let totalScore = 0;
    let totalValue = 0;

    matches.forEach(match => {
      byStatus[match.status] = (byStatus[match.status] || 0) + 1;
      totalScore += match.match_score;
      if (match.estimated_job_value) {
        totalValue += match.estimated_job_value;
      }
    });

    return {
      total: matches.length,
      byStatus: byStatus as Record<DealMatchStatus, number>,
      avgScore: matches.length > 0 ? totalScore / matches.length : 0,
      totalEstimatedValue: totalValue
    };
  }
};
