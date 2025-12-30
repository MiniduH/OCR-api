/**
 * Migration: Add workflow columns to reprint_requests table
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    const { query } = require('../../config/database');

    console.log('Adding workflow columns to reprint_requests table...');

    // Add workflow_id column
    await query(`
      ALTER TABLE reprint_requests 
      ADD COLUMN IF NOT EXISTS workflow_id INTEGER REFERENCES workflows(id) ON DELETE SET NULL;
    `);

    // Add current_node_order column
    await query(`
      ALTER TABLE reprint_requests 
      ADD COLUMN IF NOT EXISTS current_node_order INTEGER DEFAULT 1;
    `);

    // Add approval_status column
    await query(`
      ALTER TABLE reprint_requests 
      ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'NOT_REQUIRED' 
      CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'NOT_REQUIRED'));
    `);

    // Add created_by column
    await query(`
      ALTER TABLE reprint_requests 
      ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
    `);

    // Create reprint_request_approvals table
    await query(`
      CREATE TABLE IF NOT EXISTS reprint_request_approvals (
        id SERIAL PRIMARY KEY,
        reprint_request_id INTEGER NOT NULL REFERENCES reprint_requests(id) ON DELETE CASCADE,
        node_id INTEGER NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
        comments TEXT,
        action_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(reprint_request_id, node_id, user_id)
      );
    `);

    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_reprint_requests_workflow_id ON reprint_requests(workflow_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_reprint_requests_approval_status ON reprint_requests(approval_status);');
    await query('CREATE INDEX IF NOT EXISTS idx_reprint_request_approvals_request_id ON reprint_request_approvals(reprint_request_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_reprint_request_approvals_node_id ON reprint_request_approvals(node_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_reprint_request_approvals_user_id ON reprint_request_approvals(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_reprint_request_approvals_status ON reprint_request_approvals(status);');

    console.log('✅ Workflow columns added to reprint_requests table');
  } catch (error) {
    console.error('❌ Error adding workflow columns:', error.message);
    throw error;
  }
};

/**
 * Rollback
 */
const down = async () => {
  try {
    const { query } = require('../../config/database');

    console.log('Removing workflow columns from reprint_requests table...');

    await query('DROP TABLE IF EXISTS reprint_request_approvals CASCADE;');
    await query('ALTER TABLE reprint_requests DROP COLUMN IF EXISTS workflow_id;');
    await query('ALTER TABLE reprint_requests DROP COLUMN IF EXISTS current_node_order;');
    await query('ALTER TABLE reprint_requests DROP COLUMN IF EXISTS approval_status;');
    await query('ALTER TABLE reprint_requests DROP COLUMN IF EXISTS created_by;');

    console.log('✅ Workflow columns removed from reprint_requests table');
  } catch (error) {
    console.error('❌ Error removing workflow columns:', error.message);
    throw error;
  }
};

module.exports = { up, down };
