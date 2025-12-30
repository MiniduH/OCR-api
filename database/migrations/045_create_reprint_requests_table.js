const ReprintRequestsModel = require('../../models/ReprintRequests');

/**
 * Migration: Create reprint_requests table with indexes
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Creating reprint_requests table...');
    await ReprintRequestsModel.createTable();

    // Create indexes for better query performance
    const { query } = require('../../config/database');

    await query('CREATE INDEX IF NOT EXISTS idx_reprint_requests_ticket_id ON reprint_requests(ticket_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_reprint_requests_trace_no ON reprint_requests(trace_no)');
    await query('CREATE INDEX IF NOT EXISTS idx_reprint_requests_status ON reprint_requests(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_reprint_requests_created_at ON reprint_requests(created_at)');

    console.log('✅ Reprint requests table created with indexes');
  } catch (error) {
    console.error('❌ Error creating reprint_requests table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop reprint_requests table
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Dropping reprint_requests table...');
    const { query } = require('../../config/database');

    await query('DROP TABLE IF EXISTS reprint_requests CASCADE');
    console.log('✅ Reprint requests table dropped');
  } catch (error) {
    console.error('❌ Error dropping reprint_requests table:', error.message);
    throw error;
  }
};

module.exports = { up, down };
