const TicketsModel = require('../../models/Tickets');

/**
 * Migration: Create tickets table with indexes
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Creating tickets table...');
    await TicketsModel.createTable();

    // Create indexes for better query performance
    const { query } = require('../../config/database');
    
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_trace_no ON tickets(trace_no)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_reference_no ON tickets(reference_no)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_terminal_id ON tickets(terminal_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_date ON tickets(date)');
    await query('CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at)');

    console.log('✅ Tickets table created with indexes');
  } catch (error) {
    console.error('❌ Error creating tickets table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop tickets table
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Dropping tickets table...');
    const { query } = require('../../config/database');
    
    await query('DROP TABLE IF EXISTS tickets CASCADE');
    console.log('✅ Tickets table dropped');
  } catch (error) {
    console.error('❌ Error dropping tickets table:', error.message);
    throw error;
  }
};

module.exports = { up, down };
