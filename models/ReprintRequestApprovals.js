const { query } = require('../config/database');

class ReprintRequestApprovalsModel {
  static async create(approval) {
    const { reprint_request_id, node_id, user_id, status, comments } = approval;

    const insertQuery = `
      INSERT INTO reprint_request_approvals (reprint_request_id, node_id, user_id, status, comments)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (reprint_request_id, node_id, user_id) DO NOTHING
      RETURNING *;
    `;

    const values = [
      reprint_request_id,
      node_id,
      user_id,
      status || 'PENDING',
      comments || null
    ];

    try {
      const result = await query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating reprint request approval:', error);
      throw error;
    }
  }

  static async createApprovalsForNode(reprintRequestId, nodeId, userIds) {
    const results = [];
    for (const userId of userIds) {
      try {
        const result = await this.create({
          reprint_request_id: reprintRequestId,
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

  static async getByReprintRequestId(reprintRequestId) {
    const selectQuery = `
      SELECT rra.*, 
        u.first_name, u.last_name, u.username, u.email,
        wn.name as node_name, wn.node_order, wn.approval_type
      FROM reprint_request_approvals rra
      JOIN users u ON rra.user_id = u.id
      JOIN workflow_nodes wn ON rra.node_id = wn.id
      WHERE rra.reprint_request_id = $1
      ORDER BY wn.node_order ASC, u.first_name ASC;
    `;

    try {
      const result = await query(selectQuery, [reprintRequestId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting approvals by reprint request ID:', error);
      throw error;
    }
  }

  static async getPendingForUser(userId) {
    const selectQuery = `
      SELECT rra.*, 
        rr.trace_no, rr.reason, rr.requested_copies, rr.notes,
        rr.workflow_id, rr.current_node_order, rr.approval_status,
        wn.name as node_name, wn.node_order, wn.approval_type,
        w.name as workflow_name
      FROM reprint_request_approvals rra
      JOIN reprint_requests rr ON rra.reprint_request_id = rr.id
      JOIN workflow_nodes wn ON rra.node_id = wn.id
      JOIN workflows w ON wn.workflow_id = w.id
      WHERE rra.user_id = $1 
        AND rra.status = 'PENDING'
        AND rr.current_node_order = wn.node_order
        AND rr.approval_status = 'PENDING'
      ORDER BY rra.created_at DESC;
    `;

    try {
      const result = await query(selectQuery, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting pending approvals for user:', error);
      throw error;
    }
  }

  static async updateApproval(reprintRequestId, nodeId, userId, status, comments = null) {
    const updateQuery = `
      UPDATE reprint_request_approvals
      SET status = $1,
          comments = COALESCE($2, comments),
          action_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE reprint_request_id = $3 AND node_id = $4 AND user_id = $5
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [status, comments, reprintRequestId, nodeId, userId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating reprint request approval:', error);
      throw error;
    }
  }

  static async checkNodeApprovalStatus(reprintRequestId, nodeId) {
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
      FROM reprint_request_approvals
      WHERE reprint_request_id = $1 AND node_id = $2;
    `;

    try {
      const result = await query(countQuery, [reprintRequestId, nodeId]);
      const counts = result.rows[0];

      let isComplete = false;
      let nodeStatus = 'PENDING';

      if (parseInt(counts.rejected) > 0) {
        isComplete = true;
        nodeStatus = 'REJECTED';
      } else if (approvalType === 'ALL') {
        if (parseInt(counts.pending) === 0 && parseInt(counts.approved) === parseInt(counts.total)) {
          isComplete = true;
          nodeStatus = 'APPROVED';
        }
      } else if (approvalType === 'ANY') {
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

  static async getApprovalHistory(reprintRequestId) {
    const selectQuery = `
      SELECT rra.*, 
        u.first_name, u.last_name, u.username,
        wn.name as node_name, wn.node_order
      FROM reprint_request_approvals rra
      JOIN users u ON rra.user_id = u.id
      JOIN workflow_nodes wn ON rra.node_id = wn.id
      WHERE rra.reprint_request_id = $1 AND rra.action_at IS NOT NULL
      ORDER BY rra.action_at ASC;
    `;

    try {
      const result = await query(selectQuery, [reprintRequestId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting approval history:', error);
      throw error;
    }
  }
}

module.exports = ReprintRequestApprovalsModel;
