const { query } = require('../config/database');

class WorkflowsModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS workflows (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Workflows table created successfully');
    } catch (error) {
      console.error('Error creating workflows table:', error);
      throw error;
    }
  }

  static async create(workflow) {
    const { name, description, is_active, created_by } = workflow;

    const insertQuery = `
      INSERT INTO workflows (name, description, is_active, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [name, description || null, is_active !== false, created_by || null];

    try {
      const result = await query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  static async getById(id) {
    const selectQuery = `
      SELECT w.*, u.first_name, u.last_name, u.username as created_by_username
      FROM workflows w
      LEFT JOIN users u ON w.created_by = u.id
      WHERE w.id = $1;
    `;

    try {
      const result = await query(selectQuery, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting workflow by ID:', error);
      throw error;
    }
  }

  static async getAll(limit = 50, offset = 0) {
    const selectQuery = `
      SELECT w.*, u.first_name, u.last_name, u.username as created_by_username
      FROM workflows w
      LEFT JOIN users u ON w.created_by = u.id
      ORDER BY w.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    try {
      const result = await query(selectQuery, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting all workflows:', error);
      throw error;
    }
  }

  static async getActive() {
    const selectQuery = `
      SELECT w.*, u.first_name, u.last_name, u.username as created_by_username
      FROM workflows w
      LEFT JOIN users u ON w.created_by = u.id
      WHERE w.is_active = TRUE
      ORDER BY w.name ASC;
    `;

    try {
      const result = await query(selectQuery);
      return result.rows;
    } catch (error) {
      console.error('Error getting active workflows:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const { name, description, is_active } = updates;
    const updateQuery = `
      UPDATE workflows
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          is_active = COALESCE($3, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [name, description, is_active, id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }

  static async delete(id) {
    const deleteQuery = 'DELETE FROM workflows WHERE id = $1 RETURNING *;';

    try {
      const result = await query(deleteQuery, [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }

  static async count() {
    const countQuery = 'SELECT COUNT(*) FROM workflows;';

    try {
      const result = await query(countQuery);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting workflows:', error);
      throw error;
    }
  }

  // Get workflow with all nodes and their users
  static async getWorkflowWithNodes(workflowId) {
    const workflowQuery = `
      SELECT w.*, u.first_name, u.last_name, u.username as created_by_username
      FROM workflows w
      LEFT JOIN users u ON w.created_by = u.id
      WHERE w.id = $1;
    `;

    const nodesQuery = `
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
      const workflowResult = await query(workflowQuery, [workflowId]);
      if (workflowResult.rows.length === 0) {
        return null;
      }

      const nodesResult = await query(nodesQuery, [workflowId]);
      
      return {
        ...workflowResult.rows[0],
        nodes: nodesResult.rows
      };
    } catch (error) {
      console.error('Error getting workflow with nodes:', error);
      throw error;
    }
  }
}

module.exports = WorkflowsModel;
