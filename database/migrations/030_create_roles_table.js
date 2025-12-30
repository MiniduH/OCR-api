const { query } = require('../../config/database');

/**
 * Migration: Create roles table in PostgreSQL
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Creating roles table...');

    // Create roles table
    await query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        permissions JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_roles_created_at ON roles(created_at);`);

    // Insert default roles with permission IDs
    await query(`
      INSERT INTO roles (name, description, permissions) VALUES
        ('admin', 'Administrator with full access', '[1, 2, 3, 4, 5, 6]'),
        ('moderator', 'Moderator with limited access', '[1, 2, 3, 4]'),
        ('user', 'Regular user with basic access', '[1, 2]')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('✅ roles table created with indexes and default roles');
  } catch (error) {
    console.error('❌ Error creating roles table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop roles table
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Dropping roles table...');
    await query('DROP TABLE IF EXISTS roles CASCADE;');
    console.log('✅ roles table dropped');
  } catch (error) {
    console.error('❌ Error dropping roles table:', error.message);
    throw error;
  }
};

module.exports = { up, down };
