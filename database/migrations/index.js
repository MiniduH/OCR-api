const { connectDB } = require('../../config/database');

require('dotenv').config();

/**
 * Migration Runner
 * Runs all migrations in sequence
 * Usage: npm run migrate
 */

const runMigrations = async () => {
  try {
    // Connect to database
    console.log('🔗 Connecting to PostgreSQL database...');
    await connectDB();

    console.log('🔄 Starting migrations...\n');

    // Import migration files
    const migration15 = require('./015_create_tickets_table');

    // Run migrations in sequence
    console.log('📦 Migration 1: Creating tickets table...');
    await migration15.up();
    console.log('✅ Migration 1 completed\n');

    console.log('✨ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigrations();
