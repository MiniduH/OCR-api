const { query } = require('../../config/database');

/**
 * Migration: Create users table in PostgreSQL
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Creating users table...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        department VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);`);

    console.log('✅ users table created with indexes');
  } catch (error) {
    console.error('❌ Error creating users table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop users table
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Dropping users table...');
    await query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('✅ users table dropped');
  } catch (error) {
    console.error('❌ Error dropping users table:', error.message);
    throw error;
  }
};

module.exports = { up, down };

