/**
 * Source Configuration Service
 * Manages signal source configurations and their lifecycle
 */

import { db } from '../db';

export type SourceType = 'reddit' | 'facebook' | 'google_maps' | 'yellow_pages' | 'website' | 'custom';

export interface SourceConfig {
  id: string;
  name: string;
  type: SourceType;
  enabled: boolean;
  config: {
    subreddit?: string;
    keywords?: string[];
    groupUrl?: string;
    location?: string;
    radius?: number;
    businessType?: string;
    url?: string;
    selector?: string;
    [key: string]: any;
  };
  scan_interval_minutes: number;
  max_results: number;
  retry_attempts: number;
  health_score: number;
  last_run_at?: string;
  last_success_at?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export interface SourceScanRun {
  id: string;
  source_config_id: string;
  status: 'queued' | 'running' | 'success' | 'failed' | 'partial';
  started_at?: string;
  completed_at?: string;
  items_scanned: number;
  intent_leads_created: number;
  error_message?: string;
  raw_summary: any;
  created_at: string;
}

export const SourceConfigService = {
  /**
   * Get all source configurations
   */
  async getAll(): Promise<SourceConfig[]> {
    return db.query('source_configs', {
      orderBy: { column: 'created_at', direction: 'desc' }
    });
  },

  /**
   * Get enabled sources ready for scanning
   */
  async getEnabled(): Promise<SourceConfig[]> {
    return db.query('source_configs', {
      where: { enabled: true },
      orderBy: { column: 'created_at', direction: 'desc' }
    });
  },

  /**
   * Get sources that are due for scanning
   */
  async getDueForScan(): Promise<SourceConfig[]> {
    const sources = await this.getEnabled();
    const now = new Date();
    
    return sources.filter(source => {
      if (!source.last_run_at) return true;
      const lastRun = new Date(source.last_run_at);
      const minutesSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60);
      return minutesSinceLastRun >= source.scan_interval_minutes;
    });
  },

  /**
   * Get a single source by ID
   */
  async getById(id: string): Promise<SourceConfig | null> {
    const results = await db.query('source_configs', {
      where: { id }
    });
    return results[0] || null;
  },

  /**
   * Create a new source configuration
   */
  async create(data: Omit<SourceConfig, 'id' | 'created_at' | 'updated_at' | 'health_score'>): Promise<SourceConfig> {
    const result = await db.insert('source_configs', {
      ...data,
      health_score: 0
    });
    return result;
  },

  /**
   * Update a source configuration
   */
  async update(id: string, data: Partial<SourceConfig>): Promise<SourceConfig | null> {
    const result = await db.update('source_configs', {
      where: { id },
      data
    });
    return result;
  },

  /**
   * Delete a source configuration
   */
  async delete(id: string): Promise<boolean> {
    return db.delete('source_configs', { id });
  },

  /**
   * Update source health score
   */
  async updateHealth(id: string, health: { score: number; error?: string }): Promise<void> {
    await db.update('source_configs', {
      where: { id },
      data: {
        health_score: health.score,
        last_error: health.error || null,
        ...(health.score >= 50 ? { last_success_at: new Date().toISOString() } : {})
      }
    });
  },

  /**
   * Get scan runs for a source
   */
  async getScanRuns(sourceConfigId: string, limit: number = 20): Promise<SourceScanRun[]> {
    return db.query('source_scan_runs', {
      where: { source_config_id: sourceConfigId },
      orderBy: { column: 'created_at', direction: 'desc' },
      limit
    });
  },

  /**
   * Create a new scan run
   */
  async createScanRun(sourceConfigId: string): Promise<SourceScanRun> {
    const result = await db.insert('source_scan_runs', {
      source_config_id: sourceConfigId,
      status: 'queued',
      items_scanned: 0,
      intent_leads_created: 0,
      raw_summary: {}
    });

    // Update source last_run_at
    await db.update('source_configs', {
      where: { id: sourceConfigId },
      data: { last_run_at: new Date().toISOString() }
    });

    return result;
  },

  /**
   * Update scan run status
   */
  async updateScanRun(
    id: string, 
    status: SourceScanRun['status'], 
    updates: Partial<SourceScanRun> = {}
  ): Promise<void> {
    await db.update('source_scan_runs', {
      where: { id },
      data: {
        status,
        ...updates,
        ...(status === 'success' || status === 'failed' || status === 'partial' 
          ? { completed_at: new Date().toISOString() } 
          : {}),
        ...(status === 'running' 
          ? { started_at: new Date().toISOString() } 
          : {})
      }
    });
  }
};
