#!/usr/bin/env node
// TODO: Implement database migration script

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://skillwise_user:skillwise_pass@localhost:5432/skillwise_db'
});

const migrationsDir = path.join(__dirname, '../database/migrations');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // TODO: Create migrations table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // TODO: Read migration files and execute in order
    const files = fs.readdirSync(migrationsDir).sort();
    
    for (const file of files) {
      if (file.endsWith('.sql')) {
        // TODO: Check if migration already executed
        const result = await pool.query('SELECT * FROM migrations WHERE filename = $1', [file]);
        
        if (result.rows.length === 0) {
          console.log(`Executing migration: ${file}`);
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          await pool.query(sql);
          await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
          console.log(`✓ Completed: ${file}`);
        } else {
          console.log(`⏭️  Skipping: ${file} (already executed)`);
        }
      }
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };