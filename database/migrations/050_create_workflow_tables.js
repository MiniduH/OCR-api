const WorkflowsModel = require('../../models/Workflows');
const WorkflowNodesModel = require('../../models/WorkflowNodes');
const WorkflowNodeUsersModel = require('../../models/WorkflowNodeUsers');
const TicketApprovalsModel = require('../../models/TicketApprovals');

/**
 * Migration: Create workflow tables
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    const { query } = require('../../config/database');

    // 1. Create workflows table
    console.log('Creating workflows table...');
    await WorkflowsModel.createTable();

    // 2. Create workflow_nodes table
    console.log('Creating workflow_nodes table...');
    await WorkflowNodesModel.createTable();

    // 3. Create workflow_node_users table
    console.log('Creating workflow_node_users table...');
    await WorkflowNodeUsersModel.createTable();

    // 4. Add workflow columns to tickets table
    console.log('Adding workflow columns to tickets table...');
    
    // Add workflow_id column
    await query(`
      ALTER TABLE tickets 
      ADD COLUMN IF NOT EXISTS workflow_id INTEGER REFERENCES workflows(id) ON DELETE SET NULL;
    `);

    // Add current_node_order column
    await query(`
      ALTER TABLE tickets 
      ADD COLUMN IF NOT EXISTS current_node_order INTEGER DEFAULT 1;
    `);

    // Add approval_status column
    await query(`
      ALTER TABLE tickets 
      ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'PENDING' 
      CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'NOT_REQUIRED'));
    `);

    // Add created_by column for ticket creator
    await query(`
      ALTER TABLE tickets 
      ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
    `);

    // 5. Create ticket_approvals table
    console.log('Creating ticket_approvals table...');
    await TicketApprovalsModel.createTable();

    // 6. Create indexes for better performance
    console.log('Creating indexes...');
    await query('CREATE INDEX IF NOT EXISTS idx_workflows_is_active ON workflows(is_active);');
    await query('CREATE INDEX IF NOT EXISTS idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_workflow_nodes_order ON workflow_nodes(workflow_id, node_order);');
    await query('CREATE INDEX IF NOT EXISTS idx_workflow_node_users_node_id ON workflow_node_users(node_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_workflow_node_users_user_id ON workflow_node_users(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_ticket_approvals_ticket_id ON ticket_approvals(ticket_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_ticket_approvals_node_id ON ticket_approvals(node_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_ticket_approvals_user_id ON ticket_approvals(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_ticket_approvals_status ON ticket_approvals(status);');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_workflow_id ON tickets(workflow_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_approval_status ON tickets(approval_status);');

    console.log('✅ Workflow tables created with indexes');
  } catch (error) {
    console.error('❌ Error creating workflow tables:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop workflow tables
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    const { query } = require('../../config/database');

    console.log('Dropping workflow tables...');
    
    // Drop in reverse order due to foreign key constraints
    await query('DROP TABLE IF EXISTS ticket_approvals CASCADE;');
    await query('DROP TABLE IF EXISTS workflow_node_users CASCADE;');
    await query('DROP TABLE IF EXISTS workflow_nodes CASCADE;');
    await query('DROP TABLE IF EXISTS workflows CASCADE;');

    // Remove columns from tickets table
    await query('ALTER TABLE tickets DROP COLUMN IF EXISTS workflow_id;');
    await query('ALTER TABLE tickets DROP COLUMN IF EXISTS current_node_order;');
    await query('ALTER TABLE tickets DROP COLUMN IF EXISTS approval_status;');
    await query('ALTER TABLE tickets DROP COLUMN IF EXISTS created_by;');

    console.log('✅ Workflow tables dropped');
  } catch (error) {
    console.error('❌ Error dropping workflow tables:', error.message);
    throw error;
  }
};

module.exports = { up, down };
