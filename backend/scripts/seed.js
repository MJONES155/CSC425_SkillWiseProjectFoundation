#!/usr/bin/env node
// TODO: Implement database seeding script

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // TODO: Insert sample users
    console.log('Seeding users...');
    
    // TODO: Insert sample goals
    console.log('Seeding goals...');
    
    // TODO: Insert sample challenges
    console.log('Seeding challenges...');
    
    // TODO: Insert sample achievements
    console.log('Seeding achievements...');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };