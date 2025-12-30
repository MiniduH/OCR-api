const { query } = require('../config/database');

class WorkflowNodesModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS workflow_nodes (
        id SERIAL PRIMARY KEY,
        workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        node_order INTEGER NOT NULL,
        approval_type VARCHAR(10) DEFAULT 'ALL' CHECK (approval_type IN ('ALL', 'ANY')),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(workflow_id, node_order)
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Workflow nodes table created successfully');
    } catch (error) {
      console.error('Error creating workflow_nodes table:', error);
      throw error;
    }
  }

  static async create(node) {
    const { workflow_id, name, node_order, approval_type, description } = node;

    const insertQuery = `
      INSERT INTO workflow_nodes (workflow_id, name, node_order, approval_type, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      workflow_id,
      name,
      node_order,
      approval_type || 'ALL',
      description || null
    ];

    try {
      const result = await query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating workflow node:', error);
      throw error;
    }
  }

  static async getById(id) {
    const selectQuery = 'SELECT * FROM workflow_nodes WHERE id = $1;';

    try {
      const result = await query(selectQuery, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting workflow node by ID:', error);
      throw error;
    }
  }

  static async getByWorkflowId(workflowId) {
    const selectQuery = `
      SELECT wn.*, 
        json_agg(
          json_build_object(
            'user_id', wu.user_id,
            'first_name', usr.first_name,
            'last_name', usr.last_name,
            'username', usr.username,
            'email', usr.email
          )
        ) FILTER (WHERE wu.user_id IS NOT NULL) as users
      FROM workflow_nodes wn
      LEFT JOIN workflow_node_users wu ON wn.id = wu.node_id
      LEFT JOIN users usr ON wu.user_id = usr.id
      WHERE wn.workflow_id = $1
      GROUP BY wn.id
      ORDER BY wn.node_order ASC;
    `;

    try {
      const result = await query(selectQuery, [workflowId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting workflow nodes by workflow ID:', error);
      throw error;
    }
  }

  static async getByWorkflowIdAndOrder(workflowId, nodeOrder) {
    const selectQuery = `
      SELECT * FROM workflow_nodes 
      WHERE workflow_id = $1 AND node_order = $2;
    `;

    try {
      const result = await query(selectQuery, [workflowId, nodeOrder]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting node by workflow and order:', error);
      throw error;
    }
  }

  static async getNextNode(workflowId, currentNodeOrder) {
    const selectQuery = `
      SELECT * FROM workflow_nodes 
      WHERE workflow_id = $1 AND node_order > $2
      ORDER BY node_order ASC
      LIMIT 1;
    `;

    try {
      const result = await query(selectQuery, [workflowId, currentNodeOrder]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting next node:', error);
      throw error;
    }
  }

  static async getFirstNode(workflowId) {
    const selectQuery = `
      SELECT * FROM workflow_nodes 
      WHERE workflow_id = $1
      ORDER BY node_order ASC
      LIMIT 1;
    `;

    try {
      const result = await query(selectQuery, [workflowId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting first node:', error);
      throw error;
    }
  }

  static async getMaxNodeOrder(workflowId) {
    const selectQuery = `
      SELECT COALESCE(MAX(node_order), 0) as max_order 
      FROM workflow_nodes 
      WHERE workflow_id = $1;
    `;

    try {
      const result = await query(selectQuery, [workflowId]);
      return parseInt(result.rows[0].max_order, 10);
    } catch (error) {
      console.error('Error getting max node order:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const { name, node_order, approval_type, description } = updates;
    const updateQuery = `
      UPDATE workflow_nodes
      SET name = COALESCE($1, name),
          node_order = COALESCE($2, node_order),
          approval_type = COALESCE($3, approval_type),
          description = COALESCE($4, description),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [name, node_order, approval_type, description, id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating workflow node:', error);
      throw error;
    }
  }

  static async delete(id) {
    const deleteQuery = 'DELETE FROM workflow_nodes WHERE id = $1 RETURNING *;';

    try {
      const result = await query(deleteQuery, [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting workflow node:', error);
      throw error;
    }
  }

  static async reorderNodes(workflowId, nodeOrders) {
    // nodeOrders is an array of { id, node_order }
    try {
      for (const node of nodeOrders) {
        await query(
          'UPDATE workflow_nodes SET node_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND workflow_id = $3',
          [node.node_order, node.id, workflowId]
        );
      }
      return true;
    } catch (error) {
      console.error('Error reordering workflow nodes:', error);
      throw error;
    }
  }
}

module.exports = WorkflowNodesModel;
