import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool, PoolClient } from 'pg';

// Use local Supabase if available, otherwise fallback to direct PostgreSQL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';
const databaseUrl = process.env.DATABASE_URL || '';

// Determine which database client to use
const useSupabase = supabaseUrl.startsWith('http');

let supabase: SupabaseClient | null = null;
let pgPool: Pool | null = null;

if (useSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else if (databaseUrl) {
  pgPool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}

// Helper to safely parse JSON
function safeJsonParse<T>(value: any, defaultValue: T): T {
  if (!value) return defaultValue;
  if (typeof value === 'object') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

// Generic query options
interface QueryOptions {
  where?: Record<string, any>;
  orderBy?: { column: string; direction?: 'asc' | 'desc' };
  limit?: number;
}

// Extended database client with generic operations
export const db = {
  // Generic query
  async query(table: string, options: QueryOptions = {}): Promise<any[]> {
    try {
      if (useSupabase && supabase) {
        let query = supabase.from(table).select('*');
        
        if (options.where) {
          Object.entries(options.where).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        
        if (options.orderBy) {
          query = query.order(options.orderBy.column, { 
            ascending: options.orderBy.direction === 'asc' 
          });
        }
        
        if (options.limit) {
          query = query.limit(options.limit);
        }
        
        const { data, error } = await query;
        if (error) {
          console.warn(`Query error on ${table}:`, error);
          return [];
        }
        return data || [];
      } else if (pgPool) {
        const client = await pgPool.connect();
        try {
          let sql = `SELECT * FROM ${table}`;
          const params: any[] = [];
          
          if (options.where) {
            const conditions = Object.entries(options.where).map(([key, value], idx) => {
              params.push(value);
              return `${key} = $${idx + 1}`;
            });
            sql += ` WHERE ${conditions.join(' AND ')}`;
          }
          
          if (options.orderBy) {
            sql += ` ORDER BY ${options.orderBy.column} ${options.orderBy.direction === 'desc' ? 'DESC' : 'ASC'}`;
          }
          
          if (options.limit) {
            sql += ` LIMIT $${params.length + 1}`;
            params.push(options.limit);
          }
          
          const result = await client.query(sql, params);
          return result.rows.map(row => ({
            ...row,
            config: safeJsonParse(row.config, {}),
            raw_summary: safeJsonParse(row.raw_summary, {}),
            contact_public_info: safeJsonParse(row.contact_public_info, {}),
            match_reasons: safeJsonParse(row.match_reasons, []),
            payload: safeJsonParse(row.payload, {}),
            summary: safeJsonParse(row.summary, {})
          }));
        } finally {
          client.release();
        }
      }
      return [];
    } catch (error) {
      console.error(`Error in query ${table}:`, error);
      return [];
    }
  },

  // Generic insert
  async insert(table: string, data: Record<string, any>): Promise<any> {
    try {
      if (useSupabase && supabase) {
        const { data: result, error } = await supabase
          .from(table)
          .insert(data)
          .select()
          .single();
        
        if (error) {
          console.warn(`Insert error on ${table}:`, error);
          throw error;
        }
        return result;
      } else if (pgPool) {
        const client = await pgPool.connect();
        try {
          const columns = Object.keys(data);
          const values = Object.values(data);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
          const result = await client.query(sql, values);
          return result.rows[0];
        } finally {
          client.release();
        }
      }
      throw new Error('No database connection');
    } catch (error) {
      console.error(`Error in insert ${table}:`, error);
      throw error;
    }
  },

  // Generic update
  async update(table: string, { where, data }: { where: Record<string, any>; data: Record<string, any> }): Promise<any> {
    try {
      if (useSupabase && supabase) {
        let query = supabase.from(table).update(data);
        
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        const { data: result, error } = await query.select().single();
        
        if (error) {
          console.warn(`Update error on ${table}:`, error);
          throw error;
        }
        return result;
      } else if (pgPool) {
        const client = await pgPool.connect();
        try {
          const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
          const whereClause = Object.keys(where).map((key, i) => `${key} = $${Object.keys(data).length + i + 1}`).join(' AND ');
          
          const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
          const values = [...Object.values(data), ...Object.values(where)];
          
          const result = await client.query(sql, values);
          return result.rows[0];
        } finally {
          client.release();
        }
      }
      throw new Error('No database connection');
    } catch (error) {
      console.error(`Error in update ${table}:`, error);
      throw error;
    }
  },

  // Generic delete
  async delete(table: string, where: Record<string, any>): Promise<boolean> {
    try {
      if (useSupabase && supabase) {
        let query = supabase.from(table).delete();
        
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        const { error } = await query;
        
        if (error) {
          console.warn(`Delete error on ${table}:`, error);
          return false;
        }
        return true;
      } else if (pgPool) {
        const client = await pgPool.connect();
        try {
          const whereClause = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
          const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
          
          await client.query(sql, Object.values(where));
          return true;
        } finally {
          client.release();
        }
      }
      return false;
    } catch (error) {
      console.error(`Error in delete ${table}:`, error);
      return false;
    }
  },

  // Raw SQL query (use carefully)
  async raw(sql: string, params?: any[]): Promise<any[]> {
    try {
      if (useSupabase && supabase) {
        // For Supabase, we'll use RPC or fallback to limited functionality
        console.warn('Raw SQL not fully supported in Supabase mode');
        return [];
      } else if (pgPool) {
        const client = await pgPool.connect();
        try {
          const result = await client.query(sql, params);
          return result.rows;
        } finally {
          client.release();
        }
      }
      return [];
    } catch (error) {
      console.error('Error in raw query:', error);
      return [];
    }
  },

  // Get leads with relations
  async getLeads(filters?: { status?: string; limit?: number }) {
    try {
      if (useSupabase && supabase) {
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
        if (error) {
          console.warn('Supabase query error:', error);
          return [];
        }

        // Fetch matches for each lead
        const leadsWithMatches = await Promise.all(
          (data || []).map(async (lead: any) => {
            const { data: matches } = await supabase!
              .from('lead_matches')
              .select('*, provider:providers(*)')
              .eq('lead_id', lead.id)
              .order('match_score', { ascending: false });
            
            return { ...lead, matches: matches || [] };
          })
        );

        return leadsWithMatches;
      } else if (pgPool) {
        const client = await pgPool.connect();
        try {
          let query = `
            SELECT 
              l.*,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'id', m.id,
                    'provider_id', m.provider_id,
                    'match_score', m.match_score,
                    'status', m.status,
                    'provider', jsonb_build_object(
                      'id', p.id,
                      'business_name', p.business_name,
                      'phone', p.phone,
                      'email', p.email,
                      'services', p.services
                    )
                  )
                ) FILTER (WHERE m.id IS NOT NULL),
                '[]'::json
              ) as matches
            FROM leads l
            LEFT JOIN lead_matches m ON m.lead_id = l.id
            LEFT JOIN providers p ON p.id = m.provider_id
          `;
          
          const params: any[] = [];
          if (filters?.status && filters.status !== 'all') {
            query += ` WHERE l.status = $1`;
            params.push(filters.status);
          }
          
          query += ` GROUP BY l.id ORDER BY l.detected_at DESC LIMIT $${params.length + 1}`;
          params.push(filters?.limit || 50);
          
          const result = await client.query(query, params);
          return result.rows.map(row => ({
            ...row,
            detected_intent: safeJsonParse(row.detected_intent, {}),
            matches: safeJsonParse(row.matches, [])
          }));
        } finally {
          client.release();
        }
      }
      return [];
    } catch (error) {
      console.error('Error in getLeads:', error);
      return [];
    }
  },

  // Get sources
  async getSources() {
    try {
      if (useSupabase && supabase) {
        const { data, error } = await supabase
          .from('sources')
          .select('*')
          .order('name');
        if (error) {
          console.warn('Sources query error:', error);
          return [];
        }
        return data || [];
      } else if (pgPool) {
        const client = await pgPool.connect();
        try {
          const result = await client.query('SELECT * FROM sources ORDER BY name');
          return result.rows;
        } finally {
          client.release();
        }
      }
      return [];
    } catch (error) {
      console.error('Error in getSources:', error);
      return [];
    }
  },

  // Get providers
  async getProviders() {
    try {
      if (useSupabase && supabase) {
        const { data, error } = await supabase
          .from('providers')
          .select('*')
          .order('business_name');
        if (error) {
          console.warn('Providers query error:', error);
          return [];
        }
        return data || [];
      } else if (pgPool) {
        const client = await pgPool.connect();
        try {
          const result = await client.query('SELECT * FROM providers ORDER BY business_name');
          return result.rows.map(row => ({
            ...row,
            services: safeJsonParse(row.services, []),
            service_areas: safeJsonParse(row.service_areas, []),
            contacts: safeJsonParse(row.contacts, {})
          }));
        } finally {
          client.release();
        }
      }
      return [];
    } catch (error) {
      console.error('Error in getProviders:', error);
      return [];
    }
  },

  // Get stats
  async getStats() {
    try {
      if (useSupabase && supabase) {
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

        return { 
          totalLeads: totalLeads || 0, 
          activeProviders: providers || 0, 
          activeSources: sources || 0 
        };
      } else if (pgPool) {
        const client = await pgPool.connect();
        try {
          const [leadsResult, providersResult, sourcesResult] = await Promise.all([
            client.query('SELECT COUNT(*) FROM leads'),
            client.query("SELECT COUNT(*) FROM providers WHERE is_active = true"),
            client.query("SELECT COUNT(*) FROM sources WHERE status = 'active'")
          ]);
          
          return {
            totalLeads: parseInt(leadsResult.rows[0].count) || 0,
            activeProviders: parseInt(providersResult.rows[0].count) || 0,
            activeSources: parseInt(sourcesResult.rows[0].count) || 0
          };
        } finally {
          client.release();
        }
      }
      return { totalLeads: 0, activeProviders: 0, activeSources: 0 };
    } catch (error) {
      console.error('Error in getStats:', error);
      return { totalLeads: 0, activeProviders: 0, activeSources: 0 };
    }
  }
};
