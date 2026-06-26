#!/usr/bin/env node
/**
 * Database Migration Runner
 * Runs SQL migrations against the PostgreSQL database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '002_intent_pipeline.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration: 002_intent_pipeline.sql');
    
    // Execute migration
    await client.query(migrationSql);
    
    console.log('✅ Migration completed successfully');
    
    // Verify tables were created
    const tables = [
      'source_configs',
      'source_scan_runs',
      'intent_leads',
      'intent_lead_events',
      'deal_matches',
      'deal_match_scripts',
      'deal_match_events',
      'agent_loop_runs',
      'system_settings'
    ];
    
    console.log('\nVerifying tables:');
    for (const table of tables) {
      const result = await client.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)",
        [table]
      );
      const exists = result.rows[0].exists;
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
