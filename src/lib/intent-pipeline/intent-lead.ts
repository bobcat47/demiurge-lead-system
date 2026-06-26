/**
 * Intent Lead Service
 * Manages intent leads from signal sources
 */

import { db } from '../db';

export type IntentLeadStatus = 'new' | 'reviewed' | 'matched' | 'proposal_generated' | 'contacted' | 'deal_created' | 'dismissed';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export interface IntentLead {
  id: string;
  source_config_id?: string;
  source_scan_run_id?: string;
  source_type: string;
  source_name?: string;
  source_url?: string;
  original_content?: string;
  detected_need: string;
  service_category: string;
  location_text?: string;
  location_lat?: number;
  location_lng?: number;
  urgency: UrgencyLevel;
  confidence_score: number;
  contact_name?: string;
  contact_profile_url?: string;
  contact_public_info?: Record<string, any>;
  contact_phone?: string;
  contact_email?: string;
  ai_summary?: string;
  matched_provider_id?: string;
  status: IntentLeadStatus;
  client_contact_permission: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntentLeadEvent {
  id: string;
  intent_lead_id: string;
  event_type: string;
  payload: Record<string, any>;
  created_at: string;
}

export const IntentLeadService = {
  /**
   * Get all intent leads
   */
  async getAll(filters?: {
    status?: IntentLeadStatus;
    category?: string;
    urgency?: UrgencyLevel;
    minConfidence?: number;
    limit?: number;
  }): Promise<IntentLead[]> {
    return db.query('intent_leads', {
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.category && { service_category: filters.category }),
        ...(filters?.urgency && { urgency: filters.urgency })
      },
      orderBy: { column: 'created_at', direction: 'desc' },
      limit: filters?.limit || 100
    });
  },

  /**
   * Get a single intent lead by ID
   */
  async getById(id: string): Promise<IntentLead | null> {
    const results = await db.query('intent_leads', {
      where: { id }
    });
    return results[0] || null;
  },

  /**
   * Get intent leads for a source
   */
  async getBySource(sourceConfigId: string, limit: number = 50): Promise<IntentLead[]> {
    return db.query('intent_leads', {
      where: { source_config_id: sourceConfigId },
      orderBy: { column: 'created_at', direction: 'desc' },
      limit
    });
  },

  /**
   * Get unprocessed intent leads (for matching)
   */
  async getUnprocessed(limit: number = 50): Promise<IntentLead[]> {
    return db.query('intent_leads', {
      where: { status: 'new' },
      orderBy: { column: 'confidence_score', direction: 'desc' },
      limit
    });
  },

  /**
   * Create a new intent lead
   */
  async create(data: Omit<IntentLead, 'id' | 'created_at' | 'updated_at'>): Promise<IntentLead> {
    // Check for duplicates based on source_url or content hash
    if (data.source_url) {
      const existing = await db.query('intent_leads', {
        where: { source_url: data.source_url },
        limit: 1
      });
      
      if (existing.length > 0) {
        throw new Error('Duplicate intent lead: source URL already exists');
      }
    }

    const result = await db.insert('intent_leads', {
      ...data,
      status: data.status || 'new',
      urgency: data.urgency || 'medium',
      confidence_score: data.confidence_score || 0,
      client_contact_permission: false
    });

    // Log event
    await this.logEvent(result.id, 'created', {
      source_type: data.source_type,
      confidence_score: data.confidence_score
    });

    return result;
  },

  /**
   * Update an intent lead
   */
  async update(id: string, data: Partial<IntentLead>): Promise<IntentLead | null> {
    const oldLead = await this.getById(id);
    if (!oldLead) return null;

    const result = await db.update('intent_leads', {
      where: { id },
      data
    });

    // Log status change event
    if (data.status && data.status !== oldLead.status) {
      await this.logEvent(id, 'status_changed', {
        from: oldLead.status,
        to: data.status
      });
    }

    return result;
  },

  /**
   * Update status
   */
  async updateStatus(id: string, status: IntentLeadStatus): Promise<IntentLead | null> {
    return this.update(id, { status });
  },

  /**
   * Mark as matched with provider
   */
  async markMatched(id: string, providerId: string): Promise<IntentLead | null> {
    return this.update(id, {
      status: 'matched',
      matched_provider_id: providerId
    });
  },

  /**
   * Delete an intent lead
   */
  async delete(id: string): Promise<boolean> {
    return db.delete('intent_leads', { id });
  },

  /**
   * Log an event
   */
  async logEvent(intentLeadId: string, eventType: string, payload: Record<string, any> = {}): Promise<void> {
    await db.insert('intent_lead_events', {
      intent_lead_id: intentLeadId,
      event_type: eventType,
      payload
    });
  },

  /**
   * Get events for an intent lead
   */
  async getEvents(intentLeadId: string): Promise<IntentLeadEvent[]> {
    return db.query('intent_lead_events', {
      where: { intent_lead_id: intentLeadId },
      orderBy: { column: 'created_at', direction: 'desc' }
    });
  },

  /**
   * Get stats
   */
  async getStats(): Promise<{
    total: number;
    byStatus: Record<IntentLeadStatus, number>;
    byUrgency: Record<UrgencyLevel, number>;
    avgConfidence: number;
  }> {
    const all = await this.getAll({ limit: 10000 });
    
    const byStatus: Record<string, number> = {};
    const byUrgency: Record<string, number> = {};
    let totalConfidence = 0;

    all.forEach(lead => {
      byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
      byUrgency[lead.urgency] = (byUrgency[lead.urgency] || 0) + 1;
      totalConfidence += lead.confidence_score;
    });

    return {
      total: all.length,
      byStatus: byStatus as Record<IntentLeadStatus, number>,
      byUrgency: byUrgency as Record<UrgencyLevel, number>,
      avgConfidence: all.length > 0 ? totalConfidence / all.length : 0
    };
  }
};
