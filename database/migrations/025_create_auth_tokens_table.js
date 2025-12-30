const { query } = require('../../config/database');

/**
 * Migration: Create auth_tokens table in PostgreSQL
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Creating auth_tokens table...');

    // Create auth_tokens table
    await query(`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_type VARCHAR(50) DEFAULT 'Bearer',
        expires_at TIMESTAMP NOT NULL,
        refresh_expires_at TIMESTAMP,
        is_revoked BOOLEAN DEFAULT FALSE,
        device_info JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better query performance
    await query(`CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_auth_tokens_access_token ON auth_tokens(access_token);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_auth_tokens_refresh_token ON auth_tokens(refresh_token);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_auth_tokens_is_revoked ON auth_tokens(is_revoked);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_auth_tokens_created_at ON auth_tokens(created_at);`);

    console.log('✅ auth_tokens table created with indexes');
  } catch (error) {
    console.error('❌ Error creating auth_tokens table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop auth_tokens table
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Dropping auth_tokens table...');
    
    await query(`DROP TABLE IF NOT EXISTS auth_tokens CASCADE;`);
    
    console.log('✅ auth_tokens table dropped');
  } catch (error) {
    console.error('❌ Error dropping auth_tokens table:', error.message);
    throw error;
  }
};

module.exports = { up, down };
