import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Provider,
  Source,
  RawPost,
  ParsedIntent,
  Lead,
  LeadMatch,
  OutreachTemplate,
  CrawlJob,
  LeadWithRelations
} from './types.js';

// Define the DatabaseClient interface explicitly
export interface DatabaseClient {
  client: SupabaseClient;
  getProviders(filters?: { isActive?: boolean; service?: string; area?: string; emergency?: boolean }): Promise<Provider[]>;
  getProviderById(id: string): Promise<Provider>;
  getActiveSources(): Promise<Source[]>;
  updateSourceLastCrawled(id: string): Promise<void>;
  createRawPost(post: Omit<RawPost, 'id' | 'created_at'>): Promise<RawPost>;
  findDuplicatePosts(contentHash: string, similarityThreshold?: number): Promise<RawPost[]>;
  updatePostStatus(id: string, status: RawPost['processing_status']): Promise<void>;
  createParsedIntent(intent: Omit<ParsedIntent, 'id' | 'created_at'>): Promise<ParsedIntent>;
  createLead(lead: Omit<Lead, 'id' | 'lead_number' | 'created_at' | 'updated_at'>): Promise<Lead>;
  getLeads(filters?: { status?: Lead['status']; limit?: number; offset?: number }): Promise<LeadWithRelations[]>;
  getLeadById(id: string): Promise<LeadWithRelations>;
  updateLeadStatus(id: string, status: Lead['status']): Promise<void>;
  createLeadMatch(match: Omit<LeadMatch, 'id' | 'created_at' | 'updated_at'>): Promise<LeadMatch>;
  getLeadMatches(leadId: string): Promise<(LeadMatch & { provider: Provider })[]>;
  updateLeadMatchStatus(id: string, status: LeadMatch['status']): Promise<void>;
  getTemplates(filters?: { type?: OutreachTemplate['template_type']; isDefault?: boolean }): Promise<OutreachTemplate[]>;
  getBestTemplate(type: string, context: { service?: string; urgency?: string }): Promise<OutreachTemplate>;
  createCrawlJob(job: Omit<CrawlJob, 'id' | 'created_at'>): Promise<CrawlJob>;
  updateCrawlJob(id: string, updates: Partial<CrawlJob>): Promise<void>;
  getSetting(key: string): Promise<any>;
}

export function createDatabaseClient(): DatabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Return a mock client during build time
    if (process.env.NODE_ENV === 'production' && !process.env.SUPABASE_URL) {
      console.warn('Supabase credentials not available - using mock client');
      return createMockClient();
    }
    throw new Error('Missing Supabase URL or key');
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return {
    client,

    // Providers
    async getProviders(filters) {
      let query = client.from('providers').select('*');

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters?.service) {
        query = query.contains('services', [filters.service]);
      }
      if (filters?.area) {
        query = query.contains('service_areas', [filters.area]);
      }
      if (filters?.emergency !== undefined) {
        query = query.eq('emergency_available', filters.emergency);
      }

      const { data, error } = await query.order('rating', { ascending: false });
      if (error) throw error;
      return data as Provider[];
    },

    async getProviderById(id) {
      const { data, error } = await client
        .from('providers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Provider;
    },

    // Sources
    async getActiveSources() {
      const { data, error } = await client
        .from('sources')
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return data as Source[];
    },

    async updateSourceLastCrawled(id) {
      const { error } = await client
        .from('sources')
        .update({ last_crawled_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },

    // Raw Posts
    async createRawPost(post) {
      const { data, error } = await client
        .from('raw_posts')
        .insert(post)
        .select()
        .single();
      if (error) throw error;
      return data as RawPost;
    },

    async findDuplicatePosts(contentHash, similarityThreshold = 0.9) {
      const { data, error } = await client
        .from('raw_posts')
        .select('*')
        .eq('content_hash', contentHash)
        .or(`similarity_score.gte.${similarityThreshold}`)
        .limit(1);
      if (error) throw error;
      return data as RawPost[];
    },

    async updatePostStatus(id, status) {
      const { error } = await client
        .from('raw_posts')
        .update({ processing_status: status })
        .eq('id', id);
      if (error) throw error;
    },

    // Parsed Intents
    async createParsedIntent(intent) {
      const { data, error } = await client
        .from('parsed_intents')
        .insert(intent)
        .select()
        .single();
      if (error) throw error;
      return data as ParsedIntent;
    },

    // Leads
    async createLead(lead) {
      const { data, error } = await client
        .from('leads')
        .insert(lead)
        .select()
        .single();
      if (error) throw error;
      return data as Lead;
    },

    async getLeads(filters) {
      let query = client
        .from('leads')
        .select(`
          *,
          raw_post:raw_posts(*),
          parsed_intent:parsed_intents(*)
        `)
        .order('detected_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset !== undefined && filters?.limit) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LeadWithRelations[];
    },

    async getLeadById(id) {
      const { data, error } = await client
        .from('leads')
        .select(`
          *,
          raw_post:raw_posts(*),
          parsed_intent:parsed_intents(*),
          matches:lead_matches(*, provider:providers(*))
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as LeadWithRelations;
    },

    async updateLeadStatus(id, status) {
      const updates: Partial<Lead> = { status };
      
      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
      } else if (status === 'contacted') {
        updates.contacted_at = new Date().toISOString();
      }

      const { error } = await client
        .from('leads')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },

    // Lead Matches
    async createLeadMatch(match) {
      const { data, error } = await client
        .from('lead_matches')
        .insert(match)
        .select()
        .single();
      if (error) throw error;
      return data as LeadMatch;
    },

    async getLeadMatches(leadId) {
      const { data, error } = await client
        .from('lead_matches')
        .select('*, provider:providers(*)')
        .eq('lead_id', leadId)
        .order('match_score', { ascending: false });
      if (error) throw error;
      return data as (LeadMatch & { provider: Provider })[];
    },

    async updateLeadMatchStatus(id, status) {
      const { error } = await client
        .from('lead_matches')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },

    // Outreach Templates
    async getTemplates(filters) {
      let query = client.from('outreach_templates').select('*');
      
      if (filters?.type) {
        query = query.eq('template_type', filters.type);
      }
      if (filters?.isDefault !== undefined) {
        query = query.eq('is_default', filters.isDefault);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OutreachTemplate[];
    },

    async getBestTemplate(type, context) {
      let query = client
        .from('outreach_templates')
        .select('*')
        .eq('template_type', type)
        .eq('is_default', true);

      const { data, error } = await query.limit(1).single();
      if (error) throw error;
      return data as OutreachTemplate;
    },

    // Crawl Jobs
    async createCrawlJob(job) {
      const { data, error } = await client
        .from('crawl_jobs')
        .insert(job)
        .select()
        .single();
      if (error) throw error;
      return data as CrawlJob;
    },

    async updateCrawlJob(id, updates) {
      const { error } = await client
        .from('crawl_jobs')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },

    // System Settings
    async getSetting(key) {
      const { data, error } = await client
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();
      if (error) return null;
      return data?.value;
    }
  };
}

// Mock client for build time
function createMockClient(): DatabaseClient {
  const mockClient = {} as SupabaseClient;
  
  return {
    client: mockClient,
    getProviders: async () => [],
    getProviderById: async () => { throw new Error('Mock client'); },
    getActiveSources: async () => [],
    updateSourceLastCrawled: async () => {},
    createRawPost: async () => { throw new Error('Mock client'); },
    findDuplicatePosts: async () => [],
    updatePostStatus: async () => {},
    createParsedIntent: async () => { throw new Error('Mock client'); },
    createLead: async () => { throw new Error('Mock client'); },
    getLeads: async () => [],
    getLeadById: async () => { throw new Error('Mock client'); },
    updateLeadStatus: async () => {},
    createLeadMatch: async () => { throw new Error('Mock client'); },
    getLeadMatches: async () => [],
    updateLeadMatchStatus: async () => {},
    getTemplates: async () => [],
    getBestTemplate: async () => { throw new Error('Mock client'); },
    createCrawlJob: async () => { throw new Error('Mock client'); },
    updateCrawlJob: async () => {},
    getSetting: async () => null,
  };
}

// Singleton instance for server-side
let dbClient: DatabaseClient | null = null;

export function getDbClient(): DatabaseClient {
  if (!dbClient) {
    dbClient = createDatabaseClient();
  }
  return dbClient;
}
