const { query } = require('../../config/database');

/**
 * Migration: Create permissions table in PostgreSQL
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Creating permissions table...');

    // Create permissions table
    await query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_permissions_created_at ON permissions(created_at);`);

    console.log('✅ permissions table created with indexes');
  } catch (error) {
    console.error('❌ Error creating permissions table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop permissions table
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Dropping permissions table...');
    await query('DROP TABLE IF EXISTS permissions CASCADE;');
    console.log('✅ permissions table dropped');
  } catch (error) {
    console.error('❌ Error dropping permissions table:', error.message);
    throw error;
  }
};

module.exports = { up, down };
