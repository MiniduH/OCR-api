const { query } = require('../config/database');

class TicketApprovalsModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ticket_approvals (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        node_id INTEGER NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
        comments TEXT,
        action_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ticket_id, node_id, user_id)
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Ticket approvals table created successfully');
    } catch (error) {
      console.error('Error creating ticket_approvals table:', error);
      throw error;
    }
  }

  static async create(approval) {
    const { ticket_id, node_id, user_id, status, comments } = approval;

    const insertQuery = `
      INSERT INTO ticket_approvals (ticket_id, node_id, user_id, status, comments)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (ticket_id, node_id, user_id) DO NOTHING
      RETURNING *;
    `;

    const values = [
      ticket_id,
      node_id,
      user_id,
      status || 'PENDING',
      comments || null
    ];

    try {
      const result = await query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating ticket approval:', error);
      throw error;
    }
  }

  static async createApprovalsForNode(ticketId, nodeId, userIds) {
    const results = [];
    for (const userId of userIds) {
      try {
        const result = await this.create({
          ticket_id: ticketId,
          node_id: nodeId,
          user_id: userId,
          status: 'PENDING'
        });
        if (result) results.push(result);
      } catch (error) {
        console.error(`Error creating approval for user ${userId}:`, error);
      }
    }
    return results;
  }

  static async getById(id) {
    const selectQuery = `
      SELECT ta.*, 
        u.first_name, u.last_name, u.username, u.email,
        wn.name as node_name, wn.node_order
      FROM ticket_approvals ta
      JOIN users u ON ta.user_id = u.id
      JOIN workflow_nodes wn ON ta.node_id = wn.id
      WHERE ta.id = $1;
    `;

    try {
      const result = await query(selectQuery, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting ticket approval by ID:', error);
      throw error;
    }
  }

  static async getByTicketId(ticketId) {
    const selectQuery = `
      SELECT ta.*, 
        u.first_name, u.last_name, u.username, u.email,
        wn.name as node_name, wn.node_order, wn.approval_type
      FROM ticket_approvals ta
      JOIN users u ON ta.user_id = u.id
      JOIN workflow_nodes wn ON ta.node_id = wn.id
      WHERE ta.ticket_id = $1
      ORDER BY wn.node_order ASC, u.first_name ASC;
    `;

    try {
      const result = await query(selectQuery, [ticketId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting approvals by ticket ID:', error);
      throw error;
    }
  }

  static async getByTicketIdAndNodeId(ticketId, nodeId) {
    const selectQuery = `
      SELECT ta.*, 
        u.first_name, u.last_name, u.username, u.email
      FROM ticket_approvals ta
      JOIN users u ON ta.user_id = u.id
      WHERE ta.ticket_id = $1 AND ta.node_id = $2
      ORDER BY u.first_name ASC;
    `;

    try {
      const result = await query(selectQuery, [ticketId, nodeId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting approvals by ticket and node:', error);
      throw error;
    }
  }

  static async getPendingForUser(userId) {
    const selectQuery = `
      SELECT ta.*, 
        t.date as ticket_date, t.time as ticket_time, t.location as ticket_location,
        t.total_amount as ticket_amount, t.reference_no as ticket_reference,
        t.workflow_id, t.current_node_order, t.approval_status,
        wn.name as node_name, wn.node_order, wn.approval_type,
        w.name as workflow_name
      FROM ticket_approvals ta
      JOIN tickets t ON ta.ticket_id = t.id
      JOIN workflow_nodes wn ON ta.node_id = wn.id
      JOIN workflows w ON wn.workflow_id = w.id
      WHERE ta.user_id = $1 
        AND ta.status = 'PENDING'
        AND t.current_node_order = wn.node_order
        AND t.approval_status = 'PENDING'
      ORDER BY ta.created_at DESC;
    `;

    try {
      const result = await query(selectQuery, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting pending approvals for user:', error);
      throw error;
    }
  }

  static async updateApproval(ticketId, nodeId, userId, status, comments = null) {
    const updateQuery = `
      UPDATE ticket_approvals
      SET status = $1,
          comments = COALESCE($2, comments),
          action_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE ticket_id = $3 AND node_id = $4 AND user_id = $5
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [status, comments, ticketId, nodeId, userId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating ticket approval:', error);
      throw error;
    }
  }

  static async checkNodeApprovalStatus(ticketId, nodeId) {
    // Get the node's approval type
    const nodeQuery = `
      SELECT approval_type FROM workflow_nodes WHERE id = $1;
    `;
    const nodeResult = await query(nodeQuery, [nodeId]);
    
    if (nodeResult.rows.length === 0) {
      throw new Error('Node not found');
    }
    
    const approvalType = nodeResult.rows[0].approval_type;

    // Get approval counts
    const countQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'APPROVED') as approved,
        COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending
      FROM ticket_approvals
      WHERE ticket_id = $1 AND node_id = $2;
    `;

    try {
      const result = await query(countQuery, [ticketId, nodeId]);
      const counts = result.rows[0];

      let isComplete = false;
      let nodeStatus = 'PENDING';

      // If any rejection, node is rejected
      if (parseInt(counts.rejected) > 0) {
        isComplete = true;
        nodeStatus = 'REJECTED';
      } else if (approvalType === 'ALL') {
        // ALL users must approve
        if (parseInt(counts.pending) === 0 && parseInt(counts.approved) === parseInt(counts.total)) {
          isComplete = true;
          nodeStatus = 'APPROVED';
        }
      } else if (approvalType === 'ANY') {
        // Any one user approval is enough
        if (parseInt(counts.approved) >= 1) {
          isComplete = true;
          nodeStatus = 'APPROVED';
        }
      }

      return {
        approvalType,
        total: parseInt(counts.total),
        approved: parseInt(counts.approved),
        rejected: parseInt(counts.rejected),
        pending: parseInt(counts.pending),
        isComplete,
        nodeStatus
      };
    } catch (error) {
      console.error('Error checking node approval status:', error);
      throw error;
    }
  }

  static async getApprovalHistory(ticketId) {
    const selectQuery = `
      SELECT ta.*, 
        u.first_name, u.last_name, u.username,
        wn.name as node_name, wn.node_order
      FROM ticket_approvals ta
      JOIN users u ON ta.user_id = u.id
      JOIN workflow_nodes wn ON ta.node_id = wn.id
      WHERE ta.ticket_id = $1 AND ta.action_at IS NOT NULL
      ORDER BY ta.action_at ASC;
    `;

    try {
      const result = await query(selectQuery, [ticketId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting approval history:', error);
      throw error;
    }
  }

  static async deleteByTicketId(ticketId) {
    const deleteQuery = 'DELETE FROM ticket_approvals WHERE ticket_id = $1;';

    try {
      await query(deleteQuery, [ticketId]);
      return true;
    } catch (error) {
      console.error('Error deleting approvals by ticket ID:', error);
      throw error;
    }
  }
}

module.exports = TicketApprovalsModel;
