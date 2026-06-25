import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'dummy-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database client with methods
export const db = {
  // Get leads with relations
  async getLeads(filters?: { status?: string; limit?: number }) {
    let query = supabase
      .from('leads')
      .select(`
        *,
        raw_post:raw_posts(*),
        parsed_intent:parsed_intents(*)
      `)
      .order('detected_at', { ascending: false })
      .limit(filters?.limit || 50);

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Fetch matches for each lead
    const leadsWithMatches = await Promise.all(
      (data || []).map(async (lead: any) => {
        const { data: matches } = await supabase
          .from('lead_matches')
          .select('*, provider:providers(*)')
          .eq('lead_id', lead.id)
          .order('match_score', { ascending: false });
        
        return { ...lead, matches: matches || [] };
      })
    );

    return leadsWithMatches;
  },

  // Get sources
  async getSources() {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  // Get providers
  async getProviders() {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('business_name');
    if (error) throw error;
    return data;
  },

  // Get stats
  async getStats() {
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    const { count: providers } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: sources } = await supabase
      .from('sources')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return { totalLeads: totalLeads || 0, activeProviders: providers || 0, activeSources: sources || 0 };
  },

  // Approve lead
  async approveLead(leadId: string) {
    await supabase
      .from('leads')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', leadId);
    
    await supabase
      .from('lead_matches')
      .update({ status: 'approved' })
      .eq('lead_id', leadId)
      .eq('status', 'recommended');
  },

  // Reject lead
  async rejectLead(leadId: string) {
    await supabase
      .from('leads')
      .update({ status: 'rejected' })
      .eq('id', leadId);
  }
};
