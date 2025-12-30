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
    const migration20 = require('./020_create_users_table');
    const migration25 = require('./025_create_auth_tokens_table');
    const migration30 = require('./030_create_roles_table');
    const migration35 = require('./035_create_permissions_table');
    const migration40 = require('./040_update_roles_use_permission_ids');

    // Run migrations in sequence
    console.log('📦 Migration 1: Creating tickets table...');
    await migration15.up();
    console.log('✅ Migration 1 completed\n');

    console.log('📦 Migration 2: Creating users table...');
    await migration20.up();
    console.log('✅ Migration 2 completed\n');

    console.log('📦 Migration 3: Creating auth_tokens table...');
    await migration25.up();
    console.log('✅ Migration 3 completed\n');

    console.log('📦 Migration 4: Creating roles table...');
    await migration30.up();
    console.log('✅ Migration 4 completed\n');

    console.log('📦 Migration 5: Creating permissions table...');
    await migration35.up();
    console.log('✅ Migration 5 completed\n');

    console.log('📦 Migration 6: Updating roles to use permission IDs...');
    await migration40.up();
    console.log('✅ Migration 6 completed\n');

    console.log('✨ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigrations();
