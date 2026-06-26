/**
 * Matchmaker Agent Loop
 * Orchestrates the matching of intent leads with providers
 */

import { db } from '../db';
import { IntentLeadService } from './intent-lead';
import { ProviderMatchingService } from './provider-matching';
import { DealMatchService } from './deal-match';

export type LoopType = 'source_scan' | 'intent_detection' | 'provider_matching' | 'notification_dispatch' | 'script_generation';
export type LoopStatus = 'queued' | 'running' | 'success' | 'failed';

export interface AgentLoopRun {
  id: string;
  loop_type: LoopType;
  status: LoopStatus;
  started_at?: string;
  completed_at?: string;
  items_processed: number;
  items_created: number;
  error_message?: string;
  summary: Record<string, any>;
  created_at: string;
}

export const MatchmakerAgent = {
  /**
   * Run the provider matching loop
   * Finds unprocessed intent leads and creates deal matches
   */
  async runMatchingLoop(): Promise<AgentLoopRun> {
    const loopRun = await this.createLoopRun('provider_matching');

    try {
      await this.updateLoopStatus(loopRun.id, 'running');

      // Get settings
      const settings = await db.query('system_settings', {
        where: { key: 'match_score_threshold' }
      });
      const threshold = settings[0]?.value || 70;

      // Get unprocessed intent leads
      const leads = await IntentLeadService.getUnprocessed(50);
      
      let processedCount = 0;
      let matchesCreated = 0;
      const errors: string[] = [];

      for (const lead of leads) {
        try {
          // Find matching providers
          const matches = await ProviderMatchingService.findMatches(lead, {
            minScore: threshold,
            maxResults: 5
          });

          // Create deal matches
          for (const match of matches) {
            try {
              await ProviderMatchingService.createDealMatch(
                lead.id,
                match.providerId,
                match
              );
              matchesCreated++;
            } catch (error: any) {
              if (!error.message?.includes('already exists')) {
                errors.push(`Failed to create match for lead ${lead.id}: ${error.message}`);
              }
            }
          }

          processedCount++;
        } catch (error: any) {
          errors.push(`Failed to process lead ${lead.id}: ${error.message}`);
        }
      }

      // Generate scripts for new matches if automation enabled
      const autoSettings = await db.query('system_settings', {
        where: { key: 'automation_mode' }
      });
      const automationMode = autoSettings[0]?.value || 'manual';

      if (automationMode === 'auto_generate' && matchesCreated > 0) {
        await this.runScriptGenerationLoop();
      }

      // Complete loop
      const summary = {
        leads_processed: processedCount,
        matches_created: matchesCreated,
        errors: errors.length > 0 ? errors : undefined
      };

      await this.updateLoopStatus(loopRun.id, 'success', {
        items_processed: processedCount,
        items_created: matchesCreated,
        summary
      });

      return {
        ...loopRun,
        status: 'success',
        items_processed: processedCount,
        items_created: matchesCreated,
        summary
      };

    } catch (error: any) {
      await this.updateLoopStatus(loopRun.id, 'failed', {
        error_message: error.message
      });

      return {
        ...loopRun,
        status: 'failed',
        error_message: error.message
      };
    }
  },

  /**
   * Run the script generation loop
   * Generates scripts for deal matches that don't have them
   */
  async runScriptGenerationLoop(): Promise<AgentLoopRun> {
    const loopRun = await this.createLoopRun('script_generation');

    try {
      await this.updateLoopStatus(loopRun.id, 'running');

      // Get deal matches without scripts
      const matches = await db.query('deal_matches', {
        where: { status: 'new_match' },
        orderBy: { column: 'match_score', direction: 'desc' },
        limit: 20
      });

      let processedCount = 0;
      let scriptsGenerated = 0;
      const errors: string[] = [];

      for (const match of matches) {
        try {
          // Check if scripts already exist
          const existingScripts = await db.query('deal_match_scripts', {
            where: { deal_match_id: match.id },
            limit: 1
          });

          if (existingScripts.length === 0) {
            const scripts = await DealMatchService.generateScripts(match.id);
            scriptsGenerated += scripts.length;

            // Update match status to notified_admin
            await db.update('deal_matches', {
              where: { id: match.id },
              data: { status: 'notified_admin' }
            });

            // Log event
            await db.insert('deal_match_events', {
              deal_match_id: match.id,
              event_type: 'scripts_generated_auto',
              payload: { script_count: scripts.length }
            });
          }

          processedCount++;
        } catch (error: any) {
          errors.push(`Failed to generate scripts for match ${match.id}: ${error.message}`);
        }
      }

      const summary = {
        matches_processed: processedCount,
        scripts_generated: scriptsGenerated,
        errors: errors.length > 0 ? errors : undefined
      };

      await this.updateLoopStatus(loopRun.id, 'success', {
        items_processed: processedCount,
        items_created: scriptsGenerated,
        summary
      });

      return {
        ...loopRun,
        status: 'success',
        items_processed: processedCount,
        items_created: scriptsGenerated,
        summary
      };

    } catch (error: any) {
      await this.updateLoopStatus(loopRun.id, 'failed', {
        error_message: error.message
      });

      return {
        ...loopRun,
        status: 'failed',
        error_message: error.message
      };
    }
  },

  /**
   * Run notification dispatch loop
   */
  async runNotificationLoop(): Promise<AgentLoopRun> {
    const loopRun = await this.createLoopRun('notification_dispatch');

    try {
      await this.updateLoopStatus(loopRun.id, 'running');

      // Get settings
      const settings = await db.query('system_settings', {
        where: { key: 'notification_email' }
      });
      const notificationEmail = settings[0]?.value;

      if (!notificationEmail) {
        await this.updateLoopStatus(loopRun.id, 'success', {
          items_processed: 0,
          items_created: 0,
          summary: { message: 'No notification email configured' }
        });
        return { ...loopRun, status: 'success' };
      }

      // Get new high-confidence matches
      const newMatches = await db.query('deal_matches', {
        where: { status: 'notified_admin' },
        orderBy: { column: 'match_score', direction: 'desc' },
        limit: 10
      });

      // In a real implementation, send email/Slack/webhook here
      // For now, just log the notification
      for (const match of newMatches) {
        await db.insert('deal_match_events', {
          deal_match_id: match.id,
          event_type: 'admin_notified',
          payload: {
            channel: 'email',
            recipient: notificationEmail,
            match_score: match.match_score
          }
        });

        // Update status
        await db.update('deal_matches', {
          where: { id: match.id },
          data: { status: 'notified_admin' }
        });
      }

      await this.updateLoopStatus(loopRun.id, 'success', {
        items_processed: newMatches.length,
        items_created: 0,
        summary: { notified: newMatches.length }
      });

      return {
        ...loopRun,
        status: 'success',
        items_processed: newMatches.length
      };

    } catch (error: any) {
      await this.updateLoopStatus(loopRun.id, 'failed', {
        error_message: error.message
      });

      return {
        ...loopRun,
        status: 'failed',
        error_message: error.message
      };
    }
  },

  /**
   * Run all due loops
   */
  async runAllDue(): Promise<AgentLoopRun[]> {
    const results: AgentLoopRun[] = [];

    // Run matching loop
    const matchingResult = await this.runMatchingLoop();
    results.push(matchingResult);

    // Run script generation if automation enabled
    const settings = await db.query('system_settings', {
      where: { key: 'automation_mode' }
    });
    const automationMode = settings[0]?.value || 'manual';

    if (automationMode !== 'manual') {
      const scriptResult = await this.runScriptGenerationLoop();
      results.push(scriptResult);

      const notificationResult = await this.runNotificationLoop();
      results.push(notificationResult);
    }

    return results;
  },

  /**
   * Get loop run history
   */
  async getLoopHistory(type?: LoopType, limit: number = 20): Promise<AgentLoopRun[]> {
    return db.query('agent_loop_runs', {
      where: type ? { loop_type: type } : undefined,
      orderBy: { column: 'created_at', direction: 'desc' },
      limit
    });
  },

  /**
   * Get current status
   */
  async getStatus(): Promise<{
    lastRun: AgentLoopRun | null;
    pendingRuns: number;
    recentErrors: string[];
  }> {
    const history = await this.getLoopHistory(undefined, 10);
    
    const lastRun = history[0] || null;
    const pendingRuns = history.filter(h => h.status === 'queued').length;
    const recentErrors = history
      .filter(h => h.error_message)
      .map(h => h.error_message!)
      .slice(0, 5);

    return {
      lastRun,
      pendingRuns,
      recentErrors
    };
  },

  // ============ PRIVATE METHODS ============

  private async createLoopRun(type: LoopType): Promise<AgentLoopRun> {
    return db.insert('agent_loop_runs', {
      loop_type: type,
      status: 'queued',
      items_processed: 0,
      items_created: 0,
      summary: {}
    });
  },

  private async updateLoopStatus(
    id: string, 
    status: LoopStatus, 
    updates: Partial<AgentLoopRun> = {}
  ): Promise<void> {
    await db.update('agent_loop_runs', {
      where: { id },
      data: {
        status,
        ...updates,
        ...(status === 'success' || status === 'failed' 
          ? { completed_at: new Date().toISOString() } 
          : {}),
        ...(status === 'running' 
          ? { started_at: new Date().toISOString() } 
          : {})
      }
    });
  }
};
