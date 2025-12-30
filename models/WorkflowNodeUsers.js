const { query } = require('../config/database');

class WorkflowNodeUsersModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS workflow_node_users (
        id SERIAL PRIMARY KEY,
        node_id INTEGER NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(node_id, user_id)
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Workflow node users table created successfully');
    } catch (error) {
      console.error('Error creating workflow_node_users table:', error);
      throw error;
    }
  }

  static async create(nodeUser) {
    const { node_id, user_id } = nodeUser;

    const insertQuery = `
      INSERT INTO workflow_node_users (node_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (node_id, user_id) DO NOTHING
      RETURNING *;
    `;

    try {
      const result = await query(insertQuery, [node_id, user_id]);
      return result.rows[0] || { node_id, user_id, exists: true };
    } catch (error) {
      console.error('Error creating workflow node user:', error);
      throw error;
    }
  }

  static async addUsersToNode(nodeId, userIds) {
    const results = [];
    for (const userId of userIds) {
      try {
        const result = await this.create({ node_id: nodeId, user_id: userId });
        results.push(result);
      } catch (error) {
        console.error(`Error adding user ${userId} to node ${nodeId}:`, error);
      }
    }
    return results;
  }

  static async getByNodeId(nodeId) {
    const selectQuery = `
      SELECT wnu.*, u.first_name, u.last_name, u.username, u.email
      FROM workflow_node_users wnu
      JOIN users u ON wnu.user_id = u.id
      WHERE wnu.node_id = $1
      ORDER BY u.first_name ASC;
    `;

    try {
      const result = await query(selectQuery, [nodeId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting users by node ID:', error);
      throw error;
    }
  }

  static async getUserIdsByNodeId(nodeId) {
    const selectQuery = `
      SELECT user_id FROM workflow_node_users WHERE node_id = $1;
    `;

    try {
      const result = await query(selectQuery, [nodeId]);
      return result.rows.map(row => row.user_id);
    } catch (error) {
      console.error('Error getting user IDs by node ID:', error);
      throw error;
    }
  }

  static async isUserInNode(nodeId, userId) {
    const selectQuery = `
      SELECT COUNT(*) FROM workflow_node_users 
      WHERE node_id = $1 AND user_id = $2;
    `;

    try {
      const result = await query(selectQuery, [nodeId, userId]);
      return parseInt(result.rows[0].count, 10) > 0;
    } catch (error) {
      console.error('Error checking if user is in node:', error);
      throw error;
    }
  }

  static async removeUserFromNode(nodeId, userId) {
    const deleteQuery = `
      DELETE FROM workflow_node_users 
      WHERE node_id = $1 AND user_id = $2 
      RETURNING *;
    `;

    try {
      const result = await query(deleteQuery, [nodeId, userId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error removing user from node:', error);
      throw error;
    }
  }

  static async removeAllUsersFromNode(nodeId) {
    const deleteQuery = 'DELETE FROM workflow_node_users WHERE node_id = $1;';

    try {
      await query(deleteQuery, [nodeId]);
      return true;
    } catch (error) {
      console.error('Error removing all users from node:', error);
      throw error;
    }
  }

  static async setNodeUsers(nodeId, userIds) {
    try {
      // Remove all existing users
      await this.removeAllUsersFromNode(nodeId);
      
      // Add new users
      if (userIds && userIds.length > 0) {
        return await this.addUsersToNode(nodeId, userIds);
      }
      return [];
    } catch (error) {
      console.error('Error setting node users:', error);
      throw error;
    }
  }

  static async getNodesForUser(userId) {
    const selectQuery = `
      SELECT wn.*, w.name as workflow_name
      FROM workflow_node_users wnu
      JOIN workflow_nodes wn ON wnu.node_id = wn.id
      JOIN workflows w ON wn.workflow_id = w.id
      WHERE wnu.user_id = $1 AND w.is_active = TRUE
      ORDER BY w.name, wn.node_order;
    `;

    try {
      const result = await query(selectQuery, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting nodes for user:', error);
      throw error;
    }
  }
}

module.exports = WorkflowNodeUsersModel;
