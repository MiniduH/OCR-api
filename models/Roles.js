const { query } = require('../config/database');

class RolesModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        permissions JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Roles table created successfully');
    } catch (error) {
      console.error('Error creating roles table:', error);
      throw error;
    }
  }

  static async create(role) {
    const {
      name,
      description,
      permissions,
      is_active,
    } = role;

    const insertQuery = `
      INSERT INTO roles (
        name,
        description,
        permissions,
        is_active
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [
      name,
      description || null,
      JSON.stringify(permissions || []),
      is_active !== undefined ? is_active : true,
    ];

    try {
      const result = await query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  static async getById(id) {
    const selectQuery = 'SELECT * FROM roles WHERE id = $1';

    try {
      const result = await query(selectQuery, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting role by ID:', error);
      throw error;
    }
  }

  static async getByName(name) {
    const selectQuery = 'SELECT * FROM roles WHERE name = $1';

    try {
      const result = await query(selectQuery, [name]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting role by name:', error);
      throw error;
    }
  }

  static async getAll(limit = 10, offset = 0) {
    const selectQuery = 'SELECT * FROM roles ORDER BY created_at DESC LIMIT $1 OFFSET $2';

    try {
      const result = await query(selectQuery, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting all roles:', error);
      throw error;
    }
  }

  static async getActive(limit = 10, offset = 0) {
    const selectQuery = 'SELECT * FROM roles WHERE is_active = TRUE ORDER BY created_at DESC LIMIT $1 OFFSET $2';

    try {
      const result = await query(selectQuery, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting active roles:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        updateFields.push(`${key} = $${paramCount}`);
        if (key === 'permissions') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        paramCount++;
      }
    });

    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    paramCount++;

    values.push(id);

    const updateQuery = `
      UPDATE roles
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  static async delete(id) {
    const deleteQuery = 'DELETE FROM roles WHERE id = $1';

    try {
      const result = await query(deleteQuery, [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  static async count() {
    const countQuery = 'SELECT COUNT(*) FROM roles';

    try {
      const result = await query(countQuery);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting roles:', error);
      throw error;
    }
  }

  static async addPermission(roleId, permissionId) {
    const selectQuery = 'SELECT permissions FROM roles WHERE id = $1';

    try {
      const result = await query(selectQuery, [roleId]);
      if (result.rows.length === 0) return null;

      let permissions = result.rows[0].permissions || [];
      permissionId = parseInt(permissionId, 10);
      if (!permissions.includes(permissionId)) {
        permissions.push(permissionId);
      }

      const updateQuery = `
        UPDATE roles 
        SET permissions = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;

      const updateResult = await query(updateQuery, [JSON.stringify(permissions), roleId]);
      return updateResult.rows[0];
    } catch (error) {
      console.error('Error adding permission:', error);
      throw error;
    }
  }

  static async removePermission(roleId, permissionId) {
    const selectQuery = 'SELECT permissions FROM roles WHERE id = $1';

    try {
      const result = await query(selectQuery, [roleId]);
      if (result.rows.length === 0) return null;

      let permissions = result.rows[0].permissions || [];
      permissionId = parseInt(permissionId, 10);
      permissions = permissions.filter((p) => p !== permissionId);

      const updateQuery = `
        UPDATE roles 
        SET permissions = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;

      const updateResult = await query(updateQuery, [JSON.stringify(permissions), roleId]);
      return updateResult.rows[0];
    } catch (error) {
      console.error('Error removing permission:', error);
      throw error;
    }
  }

  static async hasPermission(roleId, permissionId) {
    const selectQuery = 'SELECT permissions FROM roles WHERE id = $1';

    try {
      const result = await query(selectQuery, [roleId]);
      if (result.rows.length === 0) return false;

      const permissions = result.rows[0].permissions || [];
      permissionId = parseInt(permissionId, 10);
      return permissions.includes(permissionId);
    } catch (error) {
      console.error('Error checking permission:', error);
      throw error;
    }
  }
}

module.exports = RolesModel;
